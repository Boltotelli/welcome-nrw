import { createClient } from "npm:@supabase/supabase-js@2.58.0";

// AllianceOS pilot API. This function is intentionally isolated from NAP CRUD.
// All access is checked against aos_staff BEFORE using the service-role client.
const url = Deno.env.get("SUPABASE_URL") || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const auth = createClient(url, anonKey, { auth: { persistSession: false } });
const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const allowedOrigins = new Set([
  "https://welcome-nrw.vercel.app",
  "https://boltotelli.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);
function headers(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "vary": "Origin",
    ...(allowedOrigins.has(origin) ? { "access-control-allow-origin": origin } : {}),
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "GET, POST, OPTIONS"
  };
}
function json(req: Request, value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: headers(req) });
}
class HttpError extends Error {
  constructor(public code: string, public httpStatus: number, message?: string) {
    super(message || code);
  }
}
const str = (value: unknown, max = 200) =>
  String(value == null ? "" : value).trim().slice(0, max);
const isId = (value: unknown) => /^[0-9]{1,20}$/.test(String(value || ""));
const langs = ["de", "en", "fr", "es"];
function localized(raw: unknown, max = 10000) {
  const obj = (raw && typeof raw === "object" && !Array.isArray(raw)) ? raw as Record<string,unknown> : {};
  return Object.fromEntries(langs.map(l => [l, str(obj[l], max)]).filter(([,v]) => v));
}
function permission(staff: any, feature: string) {
  return staff?.is_owner===true || staff?.permissions?.[feature]===true;
}
const loginEmail=(id:string)=>"leader-"+id+"@accounts.allianceos.invalid";
function temporaryPassword(){
 const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
 const bits=crypto.getRandomValues(new Uint32Array(22));
 return Array.from(bits,n=>alphabet[n%alphabet.length]).join("");
}

function validateDate(value: unknown, nullable = true) {
  if (!value && nullable) return null;
  const input = str(value,40);
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z)?$/.test(input) || Number.isNaN(Date.parse(input))) {
    throw new HttpError("invalid_date",400);
  }
  return input;
}
async function checked<T>(promise: PromiseLike<{data:T|null,error:any}>, fallback = "database_error"): Promise<T> {
  const { data, error } = await promise;
  if (error) { console.error("AllianceOS DB error:",error.code,error.message); throw new HttpError(fallback,500); }
  return data as T;
}
async function staffFor(req: Request, alliance: string) {
  const token = (req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
  if (!token || token.length < 20) throw new HttpError("authentication_required",401);
  const {data: who,error} = await auth.auth.getUser(token);
  if (error || !who.user || who.user.is_anonymous) throw new HttpError("invalid_session",401);
  const staff = await checked<any>(db.from("aos_staff")
    .select("rank,permissions,enabled").eq("user_id",who.user.id)
    .eq("alliance_code",alliance).maybeSingle());
  if (!staff?.enabled || !["R4","R5"].includes(staff.rank)) throw new HttpError("not_authorized",403);
  // Ownership is tied to a verified, pre-existing Auth identity, NEVER user metadata.
  staff.is_owner=staff.rank==="R5"&&who.user.email?.toLowerCase()==="admin@nap-tracker.invalid";
  const match=/^leader-([0-9]{5,20})@accounts\.allianceos\.invalid$/i.exec(who.user.email||"");
  if(match){
    const member=await checked<any>(db.from("players").select("alliance_rank,active")
      .eq("alliance_code",alliance).eq("game_id",match[1]).maybeSingle());
    if(!member?.active||![4,5].includes(Number(member.alliance_rank)))throw new HttpError("leader_no_longer_active",403);
    staff.rank="R"+member.alliance_rank;
  }
  return {userId: who.user.id, staff};
}
async function audit(alliance: string, user: string, entity: string, id: string, action: string) {
  const {error} = await db.from("aos_audit").insert({
    alliance_code:alliance, actor_id:user, entity,entity_id:id,action
  });
  if (error) console.error("AllianceOS audit:",error.code);
}
async function publicInfo(req: Request, alliance: string, mode: string) {
  if(mode==="public-schedule"){
    const [cycles,phases]=await Promise.all([
      checked<any[]>(db.from("aos_event_cycles").select("group_key,anchor_date,interval_days,duration_days,phase_count,enabled,title,override_schedule")
       .eq("alliance_code",alliance).eq("enabled",true).limit(200)),
      checked<any[]>(db.from("aos_event_day_templates").select("group_key,day_number,instructions")
       .eq("alliance_code",alliance).eq("status","published").limit(300))
    ]);
    return json(req,{cycles,phases});
  }
  if (mode === "public-guidance") {
    const rows=await checked<any[]>(db.from("aos_event_guidance")
      .select("source_key,day,notes,updated_at").eq("alliance_code",alliance)
      .eq("status","published").gte("day",new Date(Date.now()-2*86400000).toISOString().slice(0,10))
      .order("day",{ascending:true}).limit(500));
    return json(req,{guidance:rows});
  }
  if (mode === "public-events") {
    const items = await checked<any[]>(db.from("aos_events")
      .select("id,title,description,start_at,end_at,requirements,template_code,updated_at")
      .eq("alliance_code",alliance).eq("status","published")
      .gte("start_at",new Date(Date.now()-86400000).toISOString())
      .order("start_at",{ascending:true}).limit(100));
    return json(req,{events:items});
  }
  const laws = await checked<any[]>(db.from("aos_law_publications")
    .select("law_id,scope,number,title,body,version,published_at")
    .eq("alliance_code",alliance).eq("scope","kingdom").order("number",{ascending:true}).limit(100));
  return json(req,{laws});
}
async function publicLeaders(req:Request,alliance:string){
 if(alliance!=="NRW")throw new HttpError("not_found",404);
 const leaders=await checked<any[]>(db.from("players")
   .select("game_id,name,alliance_rank").eq("alliance_code",alliance)
   .eq("active",true).in("alliance_rank",[4,5]).order("name",{ascending:true}).limit(50));
 return json(req,{leaders:leaders.filter(x=>/^[0-9]{5,20}$/.test(x.game_id||""))
   .map(x=>({game_id:x.game_id,name:x.name,rank:"R"+x.alliance_rank}))});
}
async function provisionLeaders(req:Request,alliance:string,userId:string,staff:any){
 if(alliance!=="NRW")throw new HttpError("not_found",404);
 if(!staff.is_owner)throw new HttpError("permission_denied",403);
 const leaders=await checked<any[]>(db.from("players")
   .select("game_id,name,alliance_rank").eq("alliance_code",alliance)
   .eq("active",true).in("alliance_rank",[4,5]).order("name",{ascending:true}).limit(50));
 const previous=await checked<any[]>(db.from("aos_staff")
   .select("user_id,rank").eq("alliance_code",alliance).limit(120));
 const ids=new Set(previous.map(x=>x.user_id));
 const created:any[]=[],skipped:any[]=[],errors:any[]=[];
 for(const member of leaders){
  const id=str(member.game_id,20);if(!/^[0-9]{5,20}$/.test(id))continue;
  const email=loginEmail(id),rank="R"+member.alliance_rank;
  // Do not reset an existing account or reveal its old password on repeated calls.
  const {data:listed,error:lookupError}=await db.auth.admin.listUsers({page:1,perPage:1000});
  if(lookupError){errors.push({name:member.name,reason:"auth_lookup_failed"});continue;}
  const existing=listed?.users?.find((x:any)=>x.email?.toLowerCase()===email);
  if(existing){
    if(ids.has(existing.id))skipped.push({name:member.name,rank});
    else errors.push({name:member.name,reason:"existing_unassigned_identity"});
    continue;
  }
  const password=temporaryPassword();
  const {data:made,error:authError}=await db.auth.admin.createUser({
    email,password,email_confirm:true,app_metadata:{source:"allianceos_leadership_pilot"}
  });
  if(authError||!made?.user){errors.push({name:member.name,reason:"account_creation_failed"});continue;}
  const assigned=await db.from("aos_staff").insert({
    user_id:made.user.id,alliance_code:alliance,rank,
    enabled:true,permissions:{members:false,transfers:false,laws:false,events:false,settings:false}
  }).select("user_id").single();
  if(assigned.error){
    await db.auth.admin.deleteUser(made.user.id).catch(()=>{});
    errors.push({name:member.name,reason:"staff_assignment_failed"});
    continue;
  }
  ids.add(made.user.id);
  created.push({game_id:id,name:member.name,rank,password});
  await audit(alliance,userId,"leader_account",made.user.id,"provision");
 }
 // Initial credentials appear in this single authenticated POST response only.
 // No temporary passwords are stored in SQL, logs, audit or frontend storage.
 return json(req,{ok:true,created,skipped,errors});
}
async function rotateLeaderPassword(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(alliance!=="NRW")throw new HttpError("not_found",404);
 if(!staff.is_owner)throw new HttpError("permission_denied",403);
 const id=str(body.game_id,20);if(!/^[0-9]{5,20}$/.test(id))throw new HttpError("invalid_player_id",400);
 const leaders=await checked<any>(db.from("players").select("alliance_rank,active")
   .eq("alliance_code",alliance).eq("game_id",id).maybeSingle());
 if(!leaders?.active||![4,5].includes(Number(leaders.alliance_rank)))throw new HttpError("leader_not_active",403);
 const {data:list,error:err}=await db.auth.admin.listUsers({page:1,perPage:1000});
 if(err)throw new HttpError("auth_lookup_failed",500);
 const existing=list?.users?.find((x:any)=>x.email?.toLowerCase()===loginEmail(id));
 if(!existing)throw new HttpError("leader_account_missing",404);
 const password=temporaryPassword();
 const {error:changed}=await db.auth.admin.updateUserById(existing.id,{password});
 if(changed)throw new HttpError("password_reset_failed",500);
 await audit(alliance,userId,"leader_account",existing.id,"reset_password");
 return json(req,{ok:true,password});
}
async function rosterFor(alliance: string, kingdom: number) {
  // Read-only reuse of NAP's cached records. No NAP table or law is modified.
  const players = await checked<any[]>(db.from("players")
    .select("id,game_id,name,alliance_code,alliance_rank,active,languages,provider_seen_at")
    .eq("alliance_code",alliance).order("name",{ascending:true}).limit(500));
  const notes = await checked<any[]>(db.from("aos_member_notes")
    .select("id,game_id,member_status,discord_user_id,notes,spoken_languages,joined_on,responsibilities,power_override,power_override_at,updated_at")
    .eq("alliance_code",alliance).limit(500));
  const cacheIds=players.map(p=>p.game_id).filter(isId);
  let images:any[]=[];
  if(cacheIds.length) images=await checked<any[]>(db.from("kingshot_player_cache")
    .select("player_id,avatar_url,tc_level,profile_updated_at,alliance")
    .eq("kingdom_id",kingdom).in("player_id",cacheIds).limit(500));
  // Optional power values from the Bear Buff cache, restricted by BOTH alliance and roster IDs.
  // Empty/unavailable records remain null; no made-up strength estimates.
  let powers:any[]=[];
  if(cacheIds.length) powers=await checked<any[]>(db.from("discord_bear_buff_power")
    .select("game_id,power,fetched_at").eq("alliance_code",alliance)
    .in("game_id",cacheIds).limit(500));
  const apiPowers=cacheIds.length?await checked<any[]>(db.from("aos_member_power_snapshot")
    .select("game_id,power,fetched_at,source").eq("alliance_code",alliance).in("game_id",cacheIds).limit(500)):[];
  const byApiPower=new Map(apiPowers.map(x=>[x.game_id,x]));
  const byPower=new Map(powers.map(x=>[x.game_id,x]));
  const dbIds=players.map(p=>p.id).filter(Boolean);
  let discord:any[]=[];
  if(dbIds.length) discord=await checked<any[]>(db.from("discord_onboarding_members")
    .select("matched_player_id,discord_user_id,is_present,updated_at")
    .eq("matched_alliance",alliance).in("matched_player_id",dbIds)
    .eq("is_present",true).limit(500));
  const byNote=new Map(notes.map(p=>[p.game_id,p]));
  const byImg=new Map(images.map(p=>[p.player_id,p]));
  const byDiscord=new Map(discord.map(p=>[p.matched_player_id,p]));
  return players.map(p=>{
    const overlay=byNote.get(p.game_id)||{}, cache=byImg.get(p.game_id)||{}, match=byDiscord.get(p.id)||{}, power=byPower.get(p.game_id)||{}, api=byApiPower.get(p.game_id)||{};
    return {
      game_id:p.game_id, name:p.name, rank:p.alliance_rank || null,
      alliance:p.alliance_code, active:p.active,
      member_status:overlay.member_status||(p.active?"active":"left"),
      note_id:overlay.id||null, notes:overlay.notes||null,
      languages:overlay.spoken_languages??p.languages??[], source_languages:p.languages||[], joined_on:overlay.joined_on||null,
      responsibilities:overlay.responsibilities||"", avatar_url:cache.avatar_url||null,
      tc_level:cache.tc_level??null,
      power:overlay.power_override!=null?Number(overlay.power_override):api.power!=null?Number(api.power):power.power!=null?Number(power.power):null,
      power_source:overlay.power_override!=null?"manual":api.power!=null?"mightpulse_roster":power.power!=null?"bear_buff":null,
      power_override:overlay.power_override??null,
      power_observed_at:overlay.power_override!=null?overlay.power_override_at||null:api.power!=null?api.fetched_at||null:power.fetched_at||null,
      // Existing NRW onboarding and manually linked IDs are compared by immutable roster player ID.
      discord_connected:Boolean(overlay.discord_user_id||match.discord_user_id),
      discord_source:overlay.discord_user_id?"manual":match.discord_user_id?"onboarding":null,
      discord_user_id:overlay.discord_user_id||match.discord_user_id||null,
      source_seen_at:p.provider_seen_at||cache.profile_updated_at||null
    };
  });
}
// Historical intra-kingdom movements are strictly read-only from the existing tracker.
async function internalMovesFor(alliance:string) {
  const moves=await checked<any[]>(db.from("player_alliance_transfers")
    .select("id,player_id,from_alliance,to_alliance,moved_at")
    .or("from_alliance.eq."+alliance+",to_alliance.eq."+alliance)
    .order("moved_at",{ascending:false}).limit(250));
  const ids=[...new Set(moves.map(x=>x.player_id).filter(Boolean))];
  const names=ids.length?await checked<any[]>(db.from("players")
    .select("id,game_id,name").in("id",ids).limit(250)):[];
  const known=new Map(names.map(p=>[p.id,p]));
  return moves.map(m=>({
    id:m.id, moved_at:m.moved_at,from_alliance:m.from_alliance,to_alliance:m.to_alliance,
    game_id:known.get(m.player_id)?.game_id||null,player_name:known.get(m.player_id)?.name||null
  }));
}
async function bootstrap(req: Request, alliance: string, staff: any) {
  const config=await checked<any>(db.from("aos_alliances").select("*").eq("code",alliance).single());
  const [players, transfers, laws, events, internalMoves, eventMessages, eventGuidance, eventCycles, eventDayTemplates, transferWindows, lawVersions, auditTrail]=await Promise.all([
    rosterFor(alliance,config.kingdom_id),
    checked<any[]>(db.from("aos_transfers").select("*").eq("alliance_code",alliance).order("updated_at",{ascending:false}).limit(500)),
    checked<any[]>(db.from("aos_laws").select("*").eq("alliance_code",alliance).order("updated_at",{ascending:false}).limit(300)),
    checked<any[]>(db.from("aos_events").select("*").eq("alliance_code",alliance).order("start_at",{ascending:true}).limit(300)),
    internalMovesFor(alliance),
    checked<any[]>(db.from("aos_event_messages").select("source_key,day,chat_text,note_text,updated_at").eq("alliance_code",alliance).order("day",{ascending:false}).limit(500)),
    checked<any[]>(db.from("aos_event_guidance").select("source_key,day,notes,status,updated_at").eq("alliance_code",alliance).order("day",{ascending:false}).limit(500)),
    checked<any[]>(db.from("aos_event_cycles").select("*").eq("alliance_code",alliance).limit(200)),
    checked<any[]>(db.from("aos_event_day_templates").select("*").eq("alliance_code",alliance).limit(300)),
    checked<any[]>(db.from("aos_transfer_windows").select("*").eq("alliance_code",alliance).order("start_date",{ascending:false}).limit(150)),
    permission(staff,"laws")?checked<any[]>(db.from("aos_law_versions").select("law_id,version,snapshot,changed_at,changed_by").eq("alliance_code",alliance).order("changed_at",{ascending:false}).limit(250)):Promise.resolve([]),
    staff.is_owner?checked<any[]>(db.from("aos_audit").select("entity,entity_id,action,actor_id,created_at").eq("alliance_code",alliance).order("created_at",{ascending:false}).limit(60)):Promise.resolve([])
  ]);
  let staffMembers:any[]=[];
  if(staff.is_owner){
    const assigned=await checked<any[]>(db.from("aos_staff")
      .select("user_id,rank,permissions,enabled").eq("alliance_code",alliance).limit(100));
    staffMembers=await Promise.all(assigned.map(async (entry:any)=>{
      const {data,error}=await db.auth.admin.getUserById(entry.user_id);
      return {user_id:entry.user_id,email:error?"":data?.user?.email||"",rank:entry.rank,
        permissions:entry.permissions,enabled:entry.enabled};
    }));
  }
  let transferContacts:any[]=[];
  if(permission(staff,"transfers")){
    const staffRows=await checked<any[]>(db.from("aos_staff").select("user_id,rank,enabled")
      .eq("alliance_code",alliance).eq("enabled",true).in("rank",["R4","R5"]).limit(50));
    transferContacts=await Promise.all(staffRows.map(async (entry:any)=>{
      const {data,error}=await db.auth.admin.getUserById(entry.user_id);
      return {user_id:entry.user_id,rank:entry.rank,
        label:error?"":(data?.user?.email||"")};
    }));
  }
  return json(req,{alliance:config,staff:{rank:staff.rank,permissions:staff.permissions,is_owner:staff.is_owner},staffMembers,transferContacts,
    players:permission(staff,"members")?players:[],transfers:permission(staff,"transfers")?transfers:[],
    internalMoves:permission(staff,"transfers")?internalMoves:[],
    laws:permission(staff,"laws")?laws:[],events:permission(staff,"events")?events:[],
    eventMessages:permission(staff,"events")?eventMessages:[],
    eventGuidance:permission(staff,"events")?eventGuidance:[],
    eventCycles:permission(staff,"events")?eventCycles:[],
    eventDayTemplates:permission(staff,"events")?eventDayTemplates:[],
    transferWindows:permission(staff,"transfers")?transferWindows:[],
    lawVersions,auditTrail});
}

function profileAvatar(raw:any,upload:any):string|null{
 const direct=String(raw??"").trim(),file=String(upload??"").trim().replace(/^\/+/,"");
 if(file&&/^[a-zA-Z0-9_./-]{1,220}$/.test(file))return "https://got-global-avatar.akamaized.net/avatar/"+file;
 if(direct.startsWith("/")&&!direct.startsWith("//"))return "https://kingshotstats.com"+direct;
 if(/^https:\/\//i.test(direct)){
   try{const host=new URL(direct).hostname.toLowerCase();
     if(["kingshotstats.com","www.kingshotstats.com","got-global-avatar.akamaized.net"].includes(host))return direct;
   }catch{}
 }
 return null;
}
// Full NRW strength can be read in ONE MightPulse alliance-roster request (rather than
// calling the player endpoint 70+ times). Cache solely within AllianceOS.
async function syncRosterPower(req:Request,alliance:string,staff:any){
 if(!permission(staff,"members"))throw new HttpError("permission_denied",403);
 if(alliance!=="NRW")throw new HttpError("unsupported_alliance",400);
 const key=Deno.env.get("KINGSHOTSTATS_API_KEY")||"";
 if(!key)throw new HttpError("player_provider_unconfigured",503);
 const existing=await checked<any[]>(db.from("aos_member_power_snapshot")
   .select("game_id,fetched_at").eq("alliance_code",alliance).order("fetched_at",{ascending:false}).limit(500));
 // Protect the API key's request quota. A manual repeat within 25 minutes uses cached data.
 const newest=existing[0]?.fetched_at,age=Date.now()-Date.parse(newest||"");
 if(existing.length>=40&&Number.isFinite(age)&&age>=0&&age<25*60*1000)
   return json(req,{ok:true,source:"cache",matched:existing.length,updated:0,fetched_at:newest});
 const members=await checked<any[]>(db.from("players")
   .select("game_id").eq("alliance_code",alliance).eq("active",true).limit(250));
 const known=new Set(members.map(m=>String(m.game_id||"")).filter(isId));
 if(!known.size)throw new HttpError("roster_missing",409);
 const cfg=await checked<any>(db.from("aos_alliances").select("kingdom_id").eq("code",alliance).single());
 let response:Response;
 try{
   response=await fetch("https://api.mightpulse.com/v1/alliances/"+encodeURIComponent(String(cfg.kingdom_id))+
     "/"+encodeURIComponent(alliance)+"?include=info,roster",{
     headers:{Accept:"application/json",Authorization:"Bearer "+key},
     signal:AbortSignal.timeout(75000)
   });
 }catch{throw new HttpError("power_provider_unreachable",503);}
 if(!response.ok){
   if(response.status===429)throw new HttpError("provider_rate_limited",429);
   if(response.status===404)throw new HttpError("alliance_roster_unavailable",404);
   throw new HttpError("power_provider_unavailable",503);
 }
 const raw=await response.json().catch(()=>null);
 const roster=raw?.members??raw?.roster?.members??raw?.data?.members??raw?.data?.roster?.members;
 if(!Array.isArray(roster))throw new HttpError("power_roster_invalid",502);
 const now=new Date().toISOString(),values:any[]=[];
 const seen=new Set<string>();
 for(const member of roster){
   const id=String(member?.governor_id??member?.fid??member?.player_id??"");
   const n=Number(member?.power);
   if(!known.has(id)||seen.has(id)||member?.power===null||member?.power===undefined||
      !Number.isSafeInteger(n)||n<0||n>9999999999999)continue;
   seen.add(id);
   values.push({alliance_code:alliance,game_id:id,power:n,fetched_at:now,source:"mightpulse_roster"});
 }
 // Do not turn an API error or incomplete roster into zero-strength records.
 if(!values.length)throw new HttpError("power_roster_no_matches",502);
 for(let i=0;i<values.length;i+=100){
   await checked<any>(db.from("aos_member_power_snapshot").upsert(values.slice(i,i+100),
     {onConflict:"alliance_code,game_id"}).select("game_id"));
 }
 return json(req,{ok:true,source:"mightpulse_roster",matched:values.length,updated:values.length,
   requested:known.size,fetched_at:now});
}
async function lookupTransferPlayer(req:Request,alliance:string,staff:any,body:any){
 if(!permission(staff,"transfers"))throw new HttpError("permission_denied",403);
 const id=str(body?.game_id,20);
 if(!/^[0-9]{5,20}$/.test(id))throw new HttpError("invalid_player_id",400);
 const key=Deno.env.get("KINGSHOTSTATS_API_KEY")||"";
 if(!key)throw new HttpError("player_provider_unconfigured",503);
 let response:Response;
 try{
   response=await fetch("https://api.mightpulse.com/v1/players/"+encodeURIComponent(id)+"?include=base",{
     headers:{Accept:"application/json",Authorization:"Bearer "+key},
     signal:AbortSignal.timeout(16000)
   });
 }catch{throw new HttpError("player_provider_unreachable",502);}
 if(response.status===404)return json(req,{ok:false,error:"player_not_found"},404);
 if(!response.ok)throw new HttpError(response.status===429?"provider_rate_limited":"player_provider_unavailable",503);
 const wire=await response.json().catch(()=>null),p=wire?.player??wire?.data?.player??null;
 if(!p||typeof p!=="object")throw new HttpError("invalid_provider_response",502);
 const scalar=(v:any)=>{const n=Number(v);return Number.isSafeInteger(n)&&n>=0?n:null;};
 const currentKingdom=scalar(p.kingdom_id??p.kingdom?.id??p.kid??p.server_id);
 const nick=str(p.nick_name??p.name,100),allianceTag=str(p.alliance?.abbr??p.alliance_abbr??p.alliance?.tag??"",40);
 return json(req,{ok:true,player:{
   game_id:id,name:nick||null,kingdom_id:currentKingdom,alliance:allianceTag||null,
   tc_level:scalar(p.town_center_level??p.tc_level??p.furnace_level??p.stove_lv),
   power:scalar(p.power??p.total_power),
   avatar_url:profileAvatar(p.avatar_url??p.avatar?.url,p.upload_image??p.avatar?.upload_image),
   fetched_at:new Date().toISOString(),source:"mightpulse"
 }});
}

async function saveTransferWindow(req:Request,alliance:string,userId:string,staff:any,payload:any){
 if(!permission(staff,"transfers"))throw new HttpError("permission_denied",403);
 const id=str(payload.id,36),data=payload.data;
 if(!data||typeof data!=="object"||Array.isArray(data))throw new HttpError("invalid_data",400);
 const start_date=str(data.start_date,10),end_date=str(data.end_date,10),status=str(data.status||"planning",20);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start_date)||!/^\d{4}-\d{2}-\d{2}$/.test(end_date)||
 !Number.isFinite(Date.parse(start_date))||!Number.isFinite(Date.parse(end_date))||end_date<start_date)throw new HttpError("invalid_window_dates",400);
 if(!["planning","open","closed"].includes(status))throw new HttpError("invalid_status",400);
 const cap=(v:any)=>{if(v===""||v===null||v===undefined)return null;const n=Number(v);if(!Number.isInteger(n)||n<0||n>500)throw new HttpError("invalid_capacity",400);return n;};
 const patch={alliance_code:alliance,label:str(data.label,100),start_date,end_date,
 ordinary_capacity:cap(data.ordinary_capacity),special_capacity:cap(data.special_capacity),
 status,notes:str(data.notes,1500),updated_at:new Date().toISOString()};
 if(!patch.label)throw new HttpError("missing_window_label",400);
 if(id){
  const existing=await checked<any>(db.from("aos_transfer_windows").select("id").eq("id",id).eq("alliance_code",alliance).maybeSingle());
  if(!existing)throw new HttpError("not_found",404);
 }
 const item=await checked<any>(id?db.from("aos_transfer_windows").update(patch).eq("id",id).eq("alliance_code",alliance).select("*").single():
   db.from("aos_transfer_windows").insert(patch).select("*").single());
 await audit(alliance,userId,"transfer_window",item.id,id?"update":"create");
 return json(req,{ok:true,item});
}
async function getLawHistory(req:Request,alliance:string,staff:any,id:string){
 if(!permission(staff,"laws"))throw new HttpError("permission_denied",403);
 const law=await checked<any>(db.from("aos_laws").select("id,scope,number").eq("alliance_code",alliance).eq("id",id).maybeSingle());
 if(!law)throw new HttpError("not_found",404);
 const revisions=await checked<any[]>(db.from("aos_law_versions").select("version,snapshot,changed_at").eq("alliance_code",alliance).eq("law_id",id).order("version",{ascending:false}).limit(60));
 return json(req,{ok:true,law,revisions});
}
async function restoreLawDraft(req:Request,alliance:string,userId:string,staff:any,payload:any){
 if(!permission(staff,"laws"))throw new HttpError("permission_denied",403);
 const id=str(payload.id,36),version=Number(payload.restore_version),expected=Number(payload.expected_version);
 if(!Number.isInteger(version)||version<1)throw new HttpError("invalid_version",400);
 const law=await checked<any>(db.from("aos_laws").select("*").eq("alliance_code",alliance).eq("id",id).maybeSingle());
 if(!law)throw new HttpError("not_found",404);
 if(expected!==Number(law.version))throw new HttpError("version_conflict",409);
 // This intentionally creates a DRAFT, never republishes an old law automatically.
 // Revisions restore as draft regardless of law scope; nothing is published by this action.
 const history=await checked<any>(db.from("aos_law_versions").select("snapshot").eq("alliance_code",alliance).eq("law_id",id).eq("version",version).maybeSingle());
 if(!history)throw new HttpError("version_not_found",404);
 const restored=await checked<any>(db.from("aos_laws").update({
   title:history.snapshot?.title||{},body:history.snapshot?.body||{},status:"draft",published_at:null,
   version:law.version+1,updated_at:new Date().toISOString()
 }).eq("id",id).eq("alliance_code",alliance).eq("version",expected).select("*").maybeSingle());
 if(!restored)throw new HttpError("version_conflict",409);
 await checked<any>(db.from("aos_law_versions").insert({
   law_id:id,alliance_code:alliance,version:restored.version,
   snapshot:{scope:restored.scope,number:restored.number,title:restored.title,body:restored.body,status:"draft"},changed_by:userId
 }).select("id").single());
 await audit(alliance,userId,"law",id,"restore_draft_v"+version);
 return json(req,{ok:true,item:restored});
}
async function inviteR4(req:Request,alliance:string,userId:string,staff:any,payload:any){
  if(!staff.is_owner)throw new HttpError("permission_denied",403);
  const email=str(payload.email,255).toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))throw new HttpError("invalid_email",400);
  const {data:list,error:listError}=await db.auth.admin.listUsers({page:1,perPage:1000});
  if(listError)throw new HttpError("user_lookup_failed",500);
  if(list?.users?.some((u:any)=>u.email?.toLowerCase()===email))throw new HttpError("account_exists_assign_access",409);
  const perms=payload.permissions||{};
  const permissions=Object.fromEntries(["members","transfers","laws","events","settings"].map(x=>[x,perms[x]===true]));
  if(!Object.values(permissions).some(Boolean))throw new HttpError("no_permissions_selected",400);
  const {data,error}=await db.auth.admin.inviteUserByEmail(email,{redirectTo:"https://boltotelli.github.io/welcome-nrw/leitung/"});
  if(error||!data?.user){console.error("R4 invitation",error?.code);throw new HttpError("invitation_failed",502);}
  const item=await checked<any>(db.from("aos_staff").upsert({
    user_id:data.user.id,alliance_code:alliance,rank:"R4",enabled:true,permissions
  },{onConflict:"user_id,alliance_code"}).select("user_id,rank,enabled,permissions").single());
  await audit(alliance,userId,"staff",data.user.id,"invite_r4");
  return json(req,{ok:true,item:{...item,email},invitation_sent:true});
}
async function saveStaff(req:Request,alliance:string,userId:string,staff:any,payload:any){
  if(!staff.is_owner)throw new HttpError("permission_denied",403);
  const email=str(payload.email,255).toLowerCase(),enabled=payload.enabled!==false;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))throw new HttpError("invalid_email",400);
  const {data,error}=await db.auth.admin.listUsers({page:1,perPage:1000});
  if(error)throw new HttpError("user_lookup_failed",500);
  const user=data?.users?.find((u:any)=>u.email?.toLowerCase()===email);
  if(!user)throw new HttpError("account_not_found",404);
  if(user.id===userId)throw new HttpError("cannot_edit_self",403);
  const existing=await checked<any>(db.from("aos_staff").select("rank")
    .eq("user_id",user.id).eq("alliance_code",alliance).maybeSingle());
  if(user.email?.toLowerCase()==="admin@nap-tracker.invalid")throw new HttpError("cannot_edit_owner",403);
  if(existing?.rank==="R5"&&!/^leader-[0-9]{5,20}@accounts\.allianceos\.invalid$/i.test(email))throw new HttpError("cannot_edit_legacy_r5",403);
  let rank="R4";
  const match=/^leader-([0-9]{5,20})@accounts\.allianceos\.invalid$/i.exec(email);
  if(match){
    const member=await checked<any>(db.from("players").select("alliance_rank,active")
      .eq("alliance_code",alliance).eq("game_id",match[1]).maybeSingle());
    if(!member?.active||![4,5].includes(Number(member.alliance_rank)))throw new HttpError("leader_not_active",403);
    rank="R"+member.alliance_rank;
  }
  const incoming=payload.permissions||{};
  const granted=Object.fromEntries(["members","transfers","laws","events","settings"]
    .map(feature=>[feature,incoming[feature]===true]));
  const item=await checked<any>(db.from("aos_staff").upsert({
    user_id:user.id,alliance_code:alliance,rank,
    enabled,permissions:granted
  },{onConflict:"user_id,alliance_code"}).select("user_id,rank,enabled,permissions").single());
  await audit(alliance,userId,"staff",user.id,existing?"update_r4":"grant_r4");
  return json(req,{ok:true,item:{...item,email}});
}
const groupKey=(v:unknown)=>{const key=str(v,70);if(!/^[a-z0-9-]{2,70}$/.test(key))throw new HttpError("invalid_event_group",400);return key;};
async function saveEventCycle(req:Request,alliance:string,userId:string,staff:any,payload:any){
  if(!permission(staff,"events"))throw new HttpError("permission_denied",403);
  const group_key=groupKey(payload.group_key),anchor_date=validateDate(payload.anchor_date,false);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(anchor_date||""))throw new HttpError("invalid_anchor",400);
  const interval_days=Number(payload.interval_days),duration_days=Number(payload.duration_days),phase_count=Number(payload.phase_count);
  if(!Number.isInteger(interval_days)||interval_days<1||interval_days>365||
     !Number.isInteger(duration_days)||duration_days<1||duration_days>14||duration_days>interval_days||
     !Number.isInteger(phase_count)||phase_count<1||phase_count>duration_days)throw new HttpError("invalid_cycle",400);
  const cycle=await checked<any>(db.from("aos_event_cycles").upsert({
    alliance_code:alliance,group_key,anchor_date,interval_days,duration_days,phase_count,
    enabled:payload.enabled!==false,override_schedule:true,title:localized(payload.title,120),updated_at:new Date().toISOString(),updated_by:userId
  },{onConflict:"alliance_code,group_key"}).select("*").single());
  await audit(alliance,userId,"event_cycle",group_key,"save");
  return json(req,{ok:true,item:cycle});
}
async function saveEventDayTemplate(req:Request,alliance:string,userId:string,staff:any,payload:any){
  if(!permission(staff,"events"))throw new HttpError("permission_denied",403);
  const group_key=groupKey(payload.group_key),day_number=Number(payload.day_number),status=str(payload.status,20);
  if(!Number.isInteger(day_number)||day_number<1||day_number>14||!["draft","published"].includes(status))throw new HttpError("invalid_day_template",400);
  const row=await checked<any>(db.from("aos_event_cycles").select("phase_count,duration_days").eq("alliance_code",alliance).eq("group_key",group_key).maybeSingle());
  if(!row||day_number>Number(row.phase_count||row.duration_days))throw new HttpError("cycle_required",400);
  const localizedRecord=(value:any,max:number)=>{
    if(value===null||typeof value!=="object"||Array.isArray(value))throw new HttpError("invalid_localized_content",400);
    const output:Record<string,string>={};
    for(const lang of langs){if(value[lang]!==undefined){const v=String(value[lang]).trim();if(v.length>max)throw new HttpError("text_too_long",400);if(v)output[lang]=v;}}
    return output;
  };
  const instructions=localizedRecord(payload.instructions,1200),
    chat_text=localizedRecord(payload.chat_text,512),
    note_text=localizedRecord(payload.note_text,300);
  const item=await checked<any>(db.from("aos_event_day_templates").upsert({
    alliance_code:alliance,group_key,day_number,instructions,chat_text,note_text,status,
    updated_at:new Date().toISOString(),updated_by:userId
  },{onConflict:"alliance_code,group_key,day_number"}).select("*").single());
  await audit(alliance,userId,"event_day_template",group_key+":"+day_number,status);
  return json(req,{ok:true,item});
}
async function saveEventGuidance(req:Request,alliance:string,userId:string,staff:any,payload:any) {
  if(!permission(staff,"events"))throw new HttpError("permission_denied",403);
  const source_key=str(payload.source_key,160),day=str(payload.day,10),status=str(payload.status,20);
  if(!/^[A-Za-z0-9_-]{2,160}$/.test(source_key)||!/^\d{4}-\d{2}-\d{2}$/.test(day)||Number.isNaN(Date.parse(day+"T00:00:00Z")))
    throw new HttpError("invalid_event_key",400);
  if(!["draft","published"].includes(status))throw new HttpError("invalid_status",400);
  const raw=payload.notes;
  if(!raw || typeof raw!=="object" || Array.isArray(raw))throw new HttpError("invalid_guidance",400);
  const notes:Record<string,string>={};
  for(const lang of langs){
    if(raw[lang]!=null){
      const note=String(raw[lang]).trim();
      if(note.length>1200)throw new HttpError("guidance_too_long",400);
      if(note)notes[lang]=note;
    }
  }
  if(status==="published"&&!Object.values(notes).some(Boolean))throw new HttpError("empty_guidance",400);
  const result=await checked<any>(db.from("aos_event_guidance").upsert({
    alliance_code:alliance,source_key,day,status,notes,updated_by:userId,updated_at:new Date().toISOString()
  },{onConflict:"alliance_code,source_key,day"}).select("source_key,day,status,notes,updated_at").single());
  await audit(alliance,userId,"event_guidance",source_key+":"+day,status);
  return json(req,{ok:true,item:result});
}
async function saveEventMessage(req:Request,alliance:string,userId:string,staff:any,payload:any) {
  if(!permission(staff,"events"))throw new HttpError("permission_denied",403);
  const source_key=str(payload.source_key,160),day=str(payload.day,10);
  if(!/^[A-Za-z0-9_-]{2,160}$/.test(source_key))throw new HttpError("invalid_source_key",400);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||Number.isNaN(Date.parse(day+"T00:00:00Z")))
    throw new HttpError("invalid_date",400);
  const messages:any={};
  for(const field of ["chat_text","note_text"]){
    const raw=payload[field];
    if(!raw||typeof raw!=="object"||Array.isArray(raw))throw new HttpError("invalid_messages",400);
    const max=field==="chat_text"?512:300,localizedTexts:any={};
    for(const locale of langs){
      if(raw[locale]!=null){
        const value=String(raw[locale]).trim();
        if(value.length>max)throw new HttpError(field==="chat_text"?"chat_too_long":"note_too_long",400);
        if(value)localizedTexts[locale]=value;
      }
    }
    messages[field]=localizedTexts;
  }
  const result=await checked<any>(db.from("aos_event_messages").upsert({
    alliance_code:alliance,source_key,day,...messages,updated_by:userId,updated_at:new Date().toISOString()
  },{onConflict:"alliance_code,source_key,day"})
    .select("source_key,day,chat_text,note_text,updated_at").single());
  await audit(alliance,userId,"event_message",source_key+":"+day,"upsert");
  return json(req,{ok:true,item:result});
}
async function save(req: Request, alliance: string, userId: string, staff: any, payload:any) {
  const entity = str(payload.entity,25), data = payload.data || {};
  const fields:Record<string,{table:string,permission:string}> = {
    transfer:{table:"aos_transfers",permission:"transfers"},
    law:{table:"aos_laws",permission:"laws"},
    event:{table:"aos_events",permission:"events"},
    member:{table:"aos_member_notes",permission:"members"},
    settings:{table:"aos_alliances",permission:"settings"}
  };
  const entry=fields[entity];
  if (!entry) throw new HttpError("unknown_entity",400);
  if (!permission(staff,entry.permission)) throw new HttpError("permission_denied",403);
  if (!data || typeof data!=="object" || Array.isArray(data)) throw new HttpError("invalid_data",400);
  let result:any = {};
  if (entity==="settings") {
    const languages=Array.isArray(data.languages)?[...new Set(data.languages.filter((l:any)=>langs.includes(l)))]:["de","en"];
    if(!languages.length || !languages.includes(data.default_language)) throw new HttpError("invalid_languages",400);
    const patch={
      name:str(data.name,100)||alliance,
      capacity:Math.max(1,Math.min(500,Number(data.capacity)||100)),
      default_language:data.default_language,
      languages,
      logo_url:str(data.logo_url,400)||null,
      discord_guild_id:str(data.discord_guild_id,40)||null,
      advertising_enabled:alliance==="NRW"?false:Boolean(data.advertising_enabled),
      updated_at:new Date().toISOString()
    };
    result=await checked<any>(db.from(entry.table).update(patch).eq("code",alliance).select("*").single());
  } else {
    const id=str(payload.id,36);
    let existing:any=null;
    if (id) {
      existing=await checked<any>(db.from(entry.table).select("*")
        .eq("id",id).eq("alliance_code",alliance).maybeSingle());
      if(!existing) throw new HttpError("not_found",404);
    }
    const now=new Date().toISOString();
    let patch:any={alliance_code:alliance,updated_at:now};
    if (entity==="transfer") {
      if(!isId(data.game_id)) throw new HttpError("invalid_player_id",400);
      const status=str(data.status,20),direction=str(data.direction,20);
      if(!["incoming","outgoing"].includes(direction) || !["interested","shortlisted","invited","confirmed","waitlist","completed","cancelled"].includes(status))
        throw new HttpError("invalid_transfer_state",400);
      const config=await checked<any>(db.from("aos_alliances").select("kingdom_id").eq("code",alliance).single());
      const origin=direction==="outgoing"?Number(config.kingdom_id):Number(data.origin_kingdom);
      const target=direction==="incoming"?Number(config.kingdom_id):Number(data.target_kingdom);
      if(!Number.isInteger(origin)||!Number.isInteger(target)||origin<1||target<1||origin>99999||target>99999||origin===target)
        throw new HttpError("invalid_kingdom_route",400);
      const priority=Number(data.priority??2),invitation_type=str(data.invitation_type||"not_assigned",20);
      if(![1,2,3].includes(priority)||!["not_assigned","ordinary","special"].includes(invitation_type))
        throw new HttpError("invalid_transfer_priority",400);
      const contact_staff_user_id=str(data.contact_staff_user_id||"",36);
      if(contact_staff_user_id){
        const contact=await checked<any>(db.from("aos_staff").select("user_id")
          .eq("alliance_code",alliance).eq("user_id",contact_staff_user_id).eq("enabled",true)
          .in("rank",["R4","R5"]).maybeSingle());
        if(!contact)throw new HttpError("invalid_transfer_contact",400);
      }
      const windowId=str(data.transfer_window_id||"",36),invitation_status=str(data.invitation_status||"not_sent",20);
      if(!["not_sent","sent","accepted","declined"].includes(invitation_status))throw new HttpError("invalid_invitation_status",400);
      let transferWindow:any=null;
      if(windowId){
        transferWindow=await checked<any>(db.from("aos_transfer_windows").select("*").eq("alliance_code",alliance).eq("id",windowId).maybeSingle());
        if(!transferWindow)throw new HttpError("invalid_transfer_window",400);
        if(transferWindow.status==="closed"&&["invited","confirmed"].includes(status))
          throw new HttpError("transfer_window_closed",409);
      }
      if(invitation_status==="accepted"&&!["invited","confirmed","completed"].includes(status))
        throw new HttpError("invalid_invitation_flow",400);
      // Capacity counts only inbound reserved slots. Missing capacity is unknown, NOT unlimited.
      if(transferWindow && direction==="incoming"&&["invited","confirmed","completed"].includes(status)
        && ["ordinary","special"].includes(invitation_type)){
        const col=invitation_type==="ordinary"?"ordinary_capacity":"special_capacity";
        const limit=transferWindow[col];
        if(limit!==null){
          const others=await checked<any[]>(db.from("aos_transfers").select("id,direction,status,invitation_type")
            .eq("alliance_code",alliance).eq("transfer_window_id",windowId).eq("direction","incoming")
            .eq("invitation_type",invitation_type).in("status",["invited","confirmed","completed"]).limit(500));
          const occupied=others.filter(x=>x.id!==existing?.id).length;
          if(occupied>=Number(limit))throw new HttpError("transfer_capacity_full",409);
        }
      }
      let arrival_confirmed_at=existing?.arrival_confirmed_at||null;
      if(data.confirm_arrival===true){
        if(direction!=="incoming"||status!=="completed")throw new HttpError("invalid_arrival_confirmation",400);
        const observed=await checked<any>(db.from("players").select("id").eq("alliance_code",alliance).eq("game_id",str(data.game_id,20)).eq("active",true).maybeSingle());
        if(!observed)throw new HttpError("arrival_not_observed",409);
        arrival_confirmed_at=new Date().toISOString();
      }
      if(direction==="outgoing"||status!=="completed")arrival_confirmed_at=null;
      if(!str(data.player_name,100))throw new HttpError("missing_player_name",400);
      patch={...patch,game_id:str(data.game_id,20),direction,status,
        player_name:str(data.player_name,100),origin_kingdom:origin,target_kingdom:target,
        priority,invitation_type,invitation_status,contact_staff_user_id:contact_staff_user_id||null,transfer_window_id:windowId||null,
        invitation_sent_at:invitation_status!=="not_sent"?(existing?.invitation_sent_at||now):null,
        arrival_confirmed_at,previous_alliance:str(data.previous_alliance,50),
        target_alliance:str(data.target_alliance,50)||alliance,
        power:data.power && Number.isSafeInteger(Number(data.power)) && Number(data.power)>=0?Number(data.power):null,
        window_start:validateDate(data.window_start),window_end:validateDate(data.window_end),
        notes:str(data.notes,3000),share_approved:Boolean(data.share_approved)};
      if (patch.window_start&&patch.window_end&&patch.window_end<patch.window_start)throw new HttpError("invalid_window",400);
    } else if(entity==="event"){
      const title=localized(data.title,150),description=localized(data.description,3000);
      if(!Object.values(title).some(Boolean))throw new HttpError("missing_title",400);
      const start=validateDate(data.start_at,false),end=validateDate(data.end_at);
      if(end && end<start)throw new HttpError("invalid_end",400);
      const status=str(data.status,20);
      if(!["draft","published","cancelled"].includes(status))throw new HttpError("invalid_status",400);
      patch={...patch,title,description,start_at:start,end_at:end,
        requirements:str(data.requirements,1500),template_code:str(data.template_code,60),
        reminder_minutes:Array.isArray(data.reminder_minutes)?[...new Set(data.reminder_minutes.filter((x:any)=>Number.isInteger(x)&&x>=0&&x<=10080))].slice(0,10):[60],
        status};
    } else if(entity==="law") {
      const scope=str(data.scope,20),number=str(data.number,30),status=str(data.status,20);
      if(!["kingdom","alliance"].includes(scope)||!number||!["draft","published"].includes(status))throw new HttpError("invalid_law",400);
      const title=localized(data.title,150),body=localized(data.body,12000);
      // Explicit editor publication is the only source of public server Laws.
      if(status==="published"&&(!Object.values(title).some(Boolean)||!Object.values(body).some(Boolean)))throw new HttpError("incomplete_law",400);
      if(existing && existing.scope!==scope)throw new HttpError("law_scope_change_forbidden",403);
      if(existing && Number(data.expected_version)!==Number(existing.version))throw new HttpError("version_conflict",409);
      patch={...patch,scope,number,title,body,status,version:existing?existing.version+1:1,
        published_at:status==="published"?now:null};
    } else if(entity==="member"){
      if(!isId(data.game_id))throw new HttpError("invalid_player_id",400);
      // Notes can be attached ONLY to a player already on this alliance's roster.
      const own=await checked<any>(db.from("players").select("id")
        .eq("alliance_code",alliance).eq("game_id",str(data.game_id,20)).maybeSingle());
      if(!own)throw new HttpError("player_not_in_alliance",403);
      if(!["active","planned","left"].includes(data.member_status))throw new HttpError("invalid_member_state",400);
      const spoken=Array.isArray(data.spoken_languages)?[...new Set(data.spoken_languages)]:null;
      if(spoken!==null && (spoken.length>12 || spoken.some((x:any)=>typeof x!=="string" || !/^[\p{L}0-9 _-]{2,30}$/u.test(x))))throw new HttpError("invalid_spoken_languages",400);
      const rawPower=data.power_override;
      const powerOverride=(rawPower===""||rawPower===null||rawPower===undefined)?null:Number(rawPower);
      if(powerOverride!==null && (!Number.isSafeInteger(powerOverride)||powerOverride<0||powerOverride>9999999999999))
        throw new HttpError("invalid_player_power",400);
      const previousPower=existing?.power_override==null?null:Number(existing.power_override);
      patch={...patch,power_override:powerOverride,
        power_override_at:powerOverride===null?null:previousPower===powerOverride?existing?.power_override_at||now:now,
        game_id:str(data.game_id,20),member_status:data.member_status,
        discord_user_id:existing?.discord_user_id??null,notes:str(data.notes,3000),
        spoken_languages:spoken,joined_on:validateDate(data.joined_on),
        responsibilities:str(data.responsibilities,500)};
    }
    result=await checked<any>(existing
      ? db.from(entry.table).update(patch).eq("id",id).eq("alliance_code",alliance).select("*").single()
      : db.from(entry.table).insert(patch).select("*").single());
    if(entity==="law"){
      await checked<any>(db.from("aos_law_versions").insert({
        law_id:result.id, alliance_code:alliance,version:result.version,
        snapshot:{scope:result.scope,number:result.number,title:result.title,body:result.body,status:result.status},
        changed_by:userId
      }).select("id").single());
      // A draft edit or restoration never takes the last published version offline.
      if(result.status==="published"){
        await checked<any>(db.from("aos_law_publications").upsert({
          law_id:result.id,alliance_code:alliance,scope:result.scope,number:result.number,
          title:result.title,body:result.body,version:result.version,published_at:now
        },{onConflict:"law_id"}).select("law_id").single());
      }
    }
  }
  await audit(alliance,userId,entity,String(result.id||alliance),payload.id?"update":"create");
  return json(req,{ok:true,item:result});
}
Deno.serve(async(req: Request)=>{
  try{
    if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
    if(!["GET","POST"].includes(req.method))throw new HttpError("method_not_allowed",405);
    const u=new URL(req.url),alliance=str(u.searchParams.get("alliance")||"NRW",16);
    if(!/^[A-Za-z0-9_-]{2,16}$/.test(alliance))throw new HttpError("invalid_alliance",400);
    if(req.method==="GET"&&["public-events","public-laws","public-guidance","public-schedule"].includes(u.searchParams.get("mode")||""))
      return await publicInfo(req,alliance,u.searchParams.get("mode")||"");
    if(req.method==="GET"&&u.searchParams.get("mode")==="public-leaders")return await publicLeaders(req,alliance);
    const {userId,staff}=await staffFor(req,alliance);
    if(req.method==="GET")return await bootstrap(req,alliance,staff);
    if(Number(req.headers.get("content-length")||"0")>200000)throw new HttpError("payload_too_large",413);
    const body=await req.json().catch(()=>{throw new HttpError("invalid_json",400)});
    if(body?.action==="staff")return await saveStaff(req,alliance,userId,staff,body);
    if(body?.action==="provision_leaders")return await provisionLeaders(req,alliance,userId,staff);
    if(body?.action==="reset_leader_password")return await rotateLeaderPassword(req,alliance,userId,staff,body);
    if(body?.action==="player_lookup")return await lookupTransferPlayer(req,alliance,staff,body);
    if(body?.action==="power_sync")return await syncRosterPower(req,alliance,staff);
    if(body?.action==="staff_invite")return await inviteR4(req,alliance,userId,staff,body);
    if(body?.action==="transfer_window")return await saveTransferWindow(req,alliance,userId,staff,body);
    if(body?.action==="law_history")return await getLawHistory(req,alliance,staff,str(body.id,36));
    if(body?.action==="law_restore")return await restoreLawDraft(req,alliance,userId,staff,body);
    if(body?.action==="event_message")return await saveEventMessage(req,alliance,userId,staff,body);
    if(body?.action==="event_guidance")return await saveEventGuidance(req,alliance,userId,staff,body);
    if(body?.action==="event_cycle")return await saveEventCycle(req,alliance,userId,staff,body);
    if(body?.action==="event_day_template")return await saveEventDayTemplate(req,alliance,userId,staff,body);
    if(body?.action!=="save")throw new HttpError("unknown_action",400);
    return await save(req,alliance,userId,staff,body);
  }catch(e){
    const status=e instanceof HttpError?e.httpStatus:500;
    const code=e instanceof HttpError?e.code:"internal_error";
    if(status===500)console.error("AllianceOS",e);
    return json(req,{error:code},status);
  }
});