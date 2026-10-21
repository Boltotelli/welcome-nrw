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
// Phase 1–5 module access is independent of player-dossier rights.
const STAFF_PERMISSION_KEYS=["members","performance","bear","fightclub","participation","transfers","laws","events","event_bot","settings"] as const;
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
// An event loan can preserve an ALREADY EXISTING leader login only when it is
// approved by the NRW owner, unexpired, rank-matched and corroborated by a
// recent observation in the registered destination alliance.
async function protectedLoanFor(alliance:string,id:string,rank:string){
 const now=new Date().toISOString();
 const loans=await checked<any[]>(db.from("aos_event_loans")
   .select("target_alliance,ends_at,original_rank").eq("home_alliance",alliance)
   .eq("game_id",id).eq("status","approved").eq("protect_leadership",true)
   .lte("starts_at",now).gte("ends_at",now).limit(2));
 for(const loan of loans){
   if(loan.original_rank!==Number(rank.slice(1)))continue;
   const rows=await checked<any[]>(db.from("players")
     .select("provider_seen_at,alliance_rank_observed_at").eq("game_id",id)
     .eq("alliance_code",loan.target_alliance).eq("active",true).limit(5));
   if(rows.some(p=>{
     const observed=Date.parse(p.provider_seen_at||p.alliance_rank_observed_at||"");
     return Number.isFinite(observed)&&observed<=Date.now()+300000&&Date.now()-observed<48*3600000;
   }))return loan;
 }
 return null;
}
async function staffFor(req: Request, alliance: string) {
  const token = (req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
  if (!token || token.length < 20) throw new HttpError("authentication_required",401);
  const {data: who,error} = await auth.auth.getUser(token);
  if (error || !who.user || who.user.is_anonymous) throw new HttpError("invalid_session",401);
  const staff = await checked<any>(db.from("aos_staff")
    .select("rank,permissions,enabled,is_admin").eq("user_id",who.user.id)
    .eq("alliance_code",alliance).maybeSingle());
  if (!staff?.enabled || !["R4","R5"].includes(staff.rank)) throw new HttpError("not_authorized",403);
  // Ownership is tied to a verified, pre-existing Auth identity, NEVER user metadata.
  staff.is_owner=(staff.rank==="R5"&&who.user.email?.toLowerCase()==="admin@nap-tracker.invalid") || staff.is_admin===true;
  const match=/^leader-([0-9]{5,20})@accounts\.allianceos\.invalid$/i.exec(who.user.email||"");
  if(match){
    const member=await checked<any>(db.from("players").select("alliance_rank,active,provider_seen_at")
      .eq("alliance_code",alliance).eq("game_id",match[1]).maybeSingle());
    const other=await checked<any[]>(db.from("players").select("active,provider_seen_at")
      .eq("game_id",match[1]).neq("alliance_code",alliance).eq("active",true).limit(12));
    const nrwSeen=Date.parse(member?.provider_seen_at||"")||0;
    const elsewhere=other.some(p=>{
      const last=Date.parse(p.provider_seen_at||"");
      return Number.isFinite(last)&&last>nrwSeen&&last<=Date.now()+300000&&Date.now()-last<48*3600000;
    });
    if(member?.active&&[4,5].includes(Number(member.alliance_rank))&&!elsewhere){
      staff.rank="R"+member.alliance_rank;
    }else{
      const exception=await protectedLoanFor(alliance,match[1],staff.rank);
      if(!exception)throw new HttpError("leader_no_longer_active",403);
      staff.event_loan_until=exception.ends_at;
    }
  }
  return {userId: who.user.id, staff};
}
async function audit(alliance: string, user: string, entity: string, id: string, action: string) {
  const {error} = await db.from("aos_audit").insert({
    alliance_code:alliance, actor_id:user, entity,entity_id:id,action
  });
  if (error) console.error("AllianceOS audit:",error.code);
}

function validDiscordInvite(raw: unknown){
  const value=str(raw,230);
  if(!value)return null;
  try{
    const u=new URL(value);
    if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)throw new Error("bad_url");
    if(!["discord.gg","discord.com","www.discord.com","discordapp.com","www.discordapp.com"].includes(u.hostname.toLowerCase()))throw new Error("bad_domain");
    if(u.hostname==="discord.gg" && !/^\/[a-zA-Z0-9-]{2,64}\/?$/.test(u.pathname))throw new Error("bad_invite");
    if(u.hostname!=="discord.gg" && !/^\/invite\/[a-zA-Z0-9-]{2,64}\/?$/.test(u.pathname))throw new Error("bad_invite");
    return u.origin+u.pathname.replace(/\/$/,"");
  }catch{throw new HttpError("invalid_discord_invite",400);}
}
function publicAllianceSettings(row:any){
  const enabled=(Array.isArray(row.languages)?row.languages:["de","en","fr"]).filter((l:string)=>langs.includes(l));
  return {code:row.code,name:row.name,kingdom_id:row.kingdom_id,
    logo_url:row.logo_url||null,discord_invite_url:row.discord_invite_url||null,
    default_language:enabled.includes(row.default_language)?row.default_language:enabled[0]||"de",
    languages:enabled};
}
async function updateAllianceLogo(req:Request,alliance:string,userId:string,staff:any,payload:any){
  if(!permission(staff,"settings"))throw new HttpError("permission_denied",403);
  const cfg=await checked<any>(db.from("aos_alliances").select("logo_url").eq("code",alliance).single());
  let nextUrl:string|null=null;
  if(payload.action==="alliance_logo_upload"){
    const mime=str(payload.mime_type,30);
    if(!["image/png","image/jpeg","image/webp"].includes(mime))throw new HttpError("invalid_image_type",400);
    const encoded=String(payload.base64||"");
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)||encoded.length>1400000||encoded.length<32)throw new HttpError("invalid_image",400);
    let binary:string;
    try{binary=atob(encoded);}catch{throw new HttpError("invalid_image",400);}
    if(binary.length>1048576)throw new HttpError("image_too_large",413);
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    const png=bytes.length>=8&&[137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x);
    const jpeg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    const webp=bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&
      String.fromCharCode(...bytes.slice(8,12))==="WEBP";
    if(!(mime==="image/png"&&png||mime==="image/jpeg"&&jpeg||mime==="image/webp"&&webp))throw new HttpError("image_signature_mismatch",400);
    const ext=mime==="image/png"?"png":mime==="image/jpeg"?"jpg":"webp";
    const path=alliance+"/"+crypto.randomUUID()+"."+ext;
    const uploaded=await db.storage.from("allianceos-logos").upload(path,bytes,{contentType:mime,upsert:false,cacheControl:"3600"});
    if(uploaded.error)throw new HttpError("logo_upload_failed",500);
    nextUrl=db.storage.from("allianceos-logos").getPublicUrl(path).data.publicUrl;
    try{
      await checked<any>(db.from("aos_alliances").update({logo_url:nextUrl,updated_at:new Date().toISOString()}).eq("code",alliance).select("code").single());
    }catch(e){
      await db.storage.from("allianceos-logos").remove([path]);
      throw e;
    }
  }else{
    await checked<any>(db.from("aos_alliances").update({logo_url:null,updated_at:new Date().toISOString()}).eq("code",alliance).select("code").single());
  }
  // Remove only previous objects in our own dedicated bucket/alliance prefix.
  const old=String(cfg.logo_url||"").split("/storage/v1/object/public/allianceos-logos/")[1];
  if(old&&old.startsWith(alliance+"/")&&!old.includes(".."))await db.storage.from("allianceos-logos").remove([old]).catch(()=>{});
  await audit(alliance,userId,"alliance_logo",alliance,payload.action==="alliance_logo_upload"?"upload":"remove");
  return json(req,{ok:true,logo_url:nextUrl});
}

async function announcementData(req:Request,alliance:string,staff:any){
 if(!permission(staff,"events"))throw new HttpError("permission_denied",403);
 const row=await checked<any>(db.from("aos_alliance_announcements").select("text,status,expires_at,revision,updated_at").eq("alliance_code",alliance).maybeSingle());
 return json(req,{announcement:row});
}
async function saveAnnouncement(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"events"))throw new HttpError("permission_denied",403);
 const command=body.command;if(!["draft","publish","disable","remove"].includes(command))throw new HttpError("invalid_announcement_command",400);
 const revision=Number(body.revision);if(!Number.isSafeInteger(revision)||revision<0)throw new HttpError("invalid_revision",400);
 const text:any={};for(const l of ["de","en","fr"]){if(body.text?.[l]!=null&&typeof body.text[l]!=="string")throw new HttpError("invalid_announcement_text",400);const v=String(body.text?.[l]||"").trim();if(v.length>4000)throw new HttpError("announcement_too_long",400);if(v)text[l]=v;}
 if(["draft","publish"].includes(command)&&!Object.keys(text).length)throw new HttpError("announcement_empty",400);
 let expires_at=null;
 if(body.expires_at){const value=String(body.expires_at);if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/.test(value)||!Number.isFinite(Date.parse(value)))throw new HttpError("invalid_expiry",400);expires_at=new Date(value).toISOString();if(command==="publish"&&Date.parse(expires_at)<=Date.now())throw new HttpError("announcement_expired",400);}
 const status=command==="publish"?"published":command==="draft"?"draft":"disabled";
 const {data,error}=await db.rpc("aos_write_announcement",{p_alliance:alliance,p_actor:userId,p_text:text,p_status:status,p_expires:expires_at,p_revision:revision,p_remove:command==="remove"});
 if(error){if(error.code==="40001")throw new HttpError("announcement_conflict",409);throw new Error("announcement_write_failed");}
 return json(req,{ok:true,announcement:data});
}

async function publicInfo(req: Request, alliance: string, mode: string) {
  if(mode==="public-announcement"){
    const row=await checked<any>(db.from("aos_alliance_announcements").select("text,status,expires_at,updated_at")
     .eq("alliance_code",alliance).eq("status","published").or("expires_at.is.null,expires_at.gt."+new Date().toISOString()).maybeSingle());
    return json(req,{announcement:row});
  }
  if(mode==="public-config"){
    const row=await checked<any>(db.from("aos_alliances").select("code,name,kingdom_id,logo_url,discord_invite_url,default_language,languages").eq("code",alliance).single());
    return json(req,{alliance:publicAllianceSettings(row)});
  }
  if(mode==="public-schedule"){
    const [cycles,phases]=await Promise.all([
      checked<any[]>(db.from("aos_event_cycles").select("group_key,anchor_date,interval_days,duration_days,phase_count,enabled,title,override_schedule,start_time_utc,legion1_time_utc,legion2_time_utc")
       .eq("alliance_code",alliance).limit(200)),
      checked<any[]>(db.from("aos_event_day_templates").select("group_key,day_number,instructions")
       .eq("alliance_code",alliance).eq("status","published").limit(300))
    ]);
    // Publish only active schedules, plus minimal inactive Bear Trap slot markers.
    // This lets the dashboard distinguish an explicitly disabled NRW slot from
    // a slot that has never been configured, without exposing private settings.
    const publicCycles=cycles.filter((c:any)=>c.enabled===true||/^bear-[123]$/.test(c.group_key||""))
      .map((c:any)=>c.enabled===false?{group_key:c.group_key,enabled:false}:c);
    return json(req,{cycles:publicCycles,phases});
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
    .select("law_id,scope,number,category,title,body,version,published_at")
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
    enabled:true,permissions:Object.fromEntries(STAFF_PERMISSION_KEYS.map(key=>[key,false]))
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
  let players = await checked<any[]>(db.from("players")
    .select("id,game_id,name,alliance_code,alliance_rank,active,languages,provider_seen_at")
    // Only verified game identities belong in player management. Historical
    // placeholder/import rows without a game_id (including the distinct
    // inactive "ONE", not the real player "OИE") must not enter dossiers.
    // Preserve those source records in NAP/players for audit; do not delete.
    .eq("alliance_code",alliance).not("game_id","is",null)
    .order("name",{ascending:true}).limit(500));
  // Add the current temporary event loan as a home-roster *overlay* only.
  // The actual source alliance remains NWO/RDS; never rewrite the NAP record.
  const now=new Date().toISOString();
  const activeLoans=await checked<any[]>(db.from("aos_event_loans").select("*")
    .eq("home_alliance",alliance).eq("status","approved")
    .lte("starts_at",now).gte("ends_at",now).limit(100));
  if(activeLoans.length){
    const borrowed=await checked<any[]>(db.from("players")
      .select("id,game_id,name,alliance_code,alliance_rank,active,languages,provider_seen_at")
      .in("game_id",activeLoans.map(l=>l.game_id)).eq("active",true).limit(200));
    const overseas=activeLoans.map(l=>{
      const source=borrowed.find(p=>p.game_id===l.game_id&&p.alliance_code===l.target_alliance);
      return source?{...source,is_event_loan:true,event_loan_type:l.event_type,
        event_loan_until:l.ends_at,current_alliance:source.alliance_code,
        original_rank:l.original_rank||null}:null;
    }).filter(Boolean);
    players=[...players,...overseas.filter(p=>!players.some(home=>home.game_id===p.game_id))];
  }
  const notes = await checked<any[]>(db.from("aos_member_notes")
    .select("id,game_id,member_status,discord_user_id,notes,spoken_languages,joined_on,responsibilities,power_override,power_override_at,updated_at")
    .eq("alliance_code",alliance).limit(500));
  const links=await checked<any[]>(db.from("aos_member_account_links")
    .select("alt_game_id,main_game_id").eq("alliance_code",alliance).limit(500));
  const byAlt=new Map(links.map(link=>[link.alt_game_id,link.main_game_id]));
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
      game_id:p.game_id, name:p.name, rank:p.is_event_loan?(p.original_rank||null):(p.alliance_rank || null),
      main_game_id:byAlt.get(p.game_id)||null,
      alliance:alliance,current_alliance:p.current_alliance||p.alliance_code,
      is_event_loan:p.is_event_loan===true,
      event_loan_type:p.event_loan_type||null,event_loan_until:p.event_loan_until||null,
      active:p.active,
      member_status:overlay.member_status||(p.active?"active":"left"),
      note_id:overlay.id||null, notes:overlay.notes||null,
      languages:overlay.spoken_languages??p.languages??[], source_languages:p.languages||[], joined_on:overlay.joined_on||null,
      responsibilities:overlay.responsibilities||"", avatar_url:cache.avatar_url||null,
      tc_level:cache.tc_level??null,
      power:overlay.power_override!=null?Number(overlay.power_override):api.power!=null?Number(api.power):power.power!=null?Number(power.power):null,
      power_source:overlay.power_override!=null?"manual":api.power!=null?(api.source||"mightpulse_roster"):power.power!=null?"bear_buff":null,
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

/* Discord event planner: configuration only. No bot token, webhook, scheduler,
 * DM, Discord API calls or publishing is implemented here. All reads and writes
 * require an active alliance R4/R5 session and module permissions. */
const discordId=(raw:unknown)=>{
 const id=str(raw,22).trim();
 if(id&&!/^\d{17,20}$/.test(id))throw new HttpError("invalid_discord_snowflake",400);
 return id;
};
const discordTime=(raw:unknown)=>{
 const v=str(raw,8).trim();
 if(!v)return null;
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(v))throw new HttpError("invalid_utc_time",400);
 return v;
};
async function discordPlanner(req:Request,alliance:string,staff:any,page:number){
 if(!permission(staff,"event_bot")&&!permission(staff,"event_bot"))throw new HttpError("permission_denied",403);
 if(!Number.isSafeInteger(page)||page<0||page>100000)throw new HttpError("invalid_page",400);
 const start=page*150;
 const [config,anchors,dayTimes,rules]=await Promise.all([
  checked<any>(db.from("aos_discord_bot_config").select("guild_id,channels,updated_at").eq("alliance_code",alliance).maybeSingle()),
  checked<any[]>(db.from("aos_discord_event_anchors").select("event_key,start_time_utc,end_time_utc").eq("alliance_code",alliance).limit(500)),
  checked<any[]>(db.from("aos_discord_event_day_times").select("event_key,day_number,start_time_utc,end_time_utc").eq("alliance_code",alliance).limit(2500)),
  checked<any[]>(db.from("aos_discord_message_rules").select("id,event_key,title,trigger_type,relative_to,offset_minutes,clock_utc,day_number,enabled,messages,updated_at").eq("alliance_code",alliance).order("event_key").order("day_number").order("id").range(start,start+149))
 ]);
 return json(req,{config:config||{guild_id:"",channels:{}},anchors,dayTimes,rules,has_more:rules.length===150});
}
async function saveDiscordConfig(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"event_bot"))throw new HttpError("permission_denied",403);
 const guild_id=discordId(body.guild_id);
 if(!body.channels||typeof body.channels!=="object"||Array.isArray(body.channels))throw new HttpError("invalid_discord_channels",400);
 const channels:Record<string,string>={};
 for(const l of ["de","en","fr","es"])channels[l]=discordId(body.channels[l]);
 const supplied=Object.values(channels).filter(Boolean);
 if(new Set(supplied).size!==supplied.length)throw new HttpError("duplicate_discord_channel",400);
 const item=await checked<any>(db.from("aos_discord_bot_config").upsert({
  alliance_code:alliance,guild_id,channels,updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code"}).select("guild_id,channels,updated_at").single());
 await audit(alliance,userId,"discord_bot_channels",alliance,"save");
 return json(req,{ok:true,config:item});
}
async function saveDiscordAnchor(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"event_bot"))throw new HttpError("permission_denied",403);
 const event_key=groupKey(body.event_key),start_time_utc=discordTime(body.start_time_utc),end_time_utc=discordTime(body.end_time_utc);
 if(!start_time_utc&&!end_time_utc){
  await checked<any>(db.from("aos_discord_event_anchors").delete().eq("alliance_code",alliance).eq("event_key",event_key).select("event_key"));
 }else{
  await checked<any>(db.from("aos_discord_event_anchors").upsert({
   alliance_code:alliance,event_key,start_time_utc,end_time_utc,updated_at:new Date().toISOString(),updated_by:userId
  },{onConflict:"alliance_code,event_key"}).select("event_key"));
 }
 await audit(alliance,userId,"discord_event_anchor",event_key,"save");
 return json(req,{ok:true});
}
async function saveDiscordEventDayTime(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"event_bot"))throw new HttpError("permission_denied",403);
 const event_key=groupKey(body.event_key),day_number=Number(body.day_number);
 if(!Number.isInteger(day_number)||day_number<1||day_number>14)throw new HttpError("invalid_event_day",400);
 const start_time_utc=discordTime(body.start_time_utc),end_time_utc=discordTime(body.end_time_utc);
 if(!start_time_utc&&!end_time_utc){
  await checked<any>(db.from("aos_discord_event_day_times").delete()
    .eq("alliance_code",alliance).eq("event_key",event_key).eq("day_number",day_number).select("day_number"));
 }else{
  await checked<any>(db.from("aos_discord_event_day_times").upsert({
   alliance_code:alliance,event_key,day_number,start_time_utc,end_time_utc,updated_at:new Date().toISOString(),updated_by:userId
  },{onConflict:"alliance_code,event_key,day_number"}).select("day_number"));
 }
 await audit(alliance,userId,"discord_event_day_time",event_key+":"+day_number,"save");
 return json(req,{ok:true,item:{event_key,day_number,start_time_utc,end_time_utc}});
}
async function saveDiscordRule(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"event_bot"))throw new HttpError("permission_denied",403);
 const event_key=groupKey(body.event_key),title=str(body.title,100).trim();
 if(!title)throw new HttpError("rule_title_required",400);
 const trigger_type=str(body.trigger_type,12),relative_to=str(body.relative_to,10);
 if(!["relative","clock"].includes(trigger_type)||!["start","end"].includes(relative_to))throw new HttpError("invalid_message_trigger",400);
 const offset_minutes=Number(body.offset_minutes);
 if(!Number.isInteger(offset_minutes)||Math.abs(offset_minutes)>43200)throw new HttpError("invalid_message_offset",400);
 const clock_utc=discordTime(body.clock_utc);
 if(trigger_type==="clock"&&!clock_utc)throw new HttpError("utc_clock_required",400);
 const day_number=Number(body.day_number);
 if(!Number.isInteger(day_number)||day_number<1||day_number>14)throw new HttpError("invalid_event_day",400);
 const messages:Record<string,string>={};
 if(!body.messages||typeof body.messages!=="object"||Array.isArray(body.messages))throw new HttpError("invalid_messages",400);
 for(const l of ["de","en","fr","es"]){
  const value=String(body.messages[l]??"").trim();
  // Discord's message limit is 2000 characters, leaving headroom for future tokens.
  if(value.length>1800)throw new HttpError("discord_message_too_long",400);
  messages[l]=value;
 }
 const enabled=body.enabled===true;
 if(enabled&&!["de","en","fr"].every(l=>Boolean(messages[l])))throw new HttpError("three_languages_required",400);
 const patch={event_key,title,trigger_type,relative_to,offset_minutes,clock_utc:trigger_type==="clock"?clock_utc:null,day_number,enabled,messages,updated_at:new Date().toISOString(),updated_by:userId};
 const id=str(body.id,36),isExisting=Boolean(id);
 if(isExisting&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw new HttpError("invalid_rule_id",400);
 const item=await checked<any>(isExisting
  ?db.from("aos_discord_message_rules").update(patch).eq("alliance_code",alliance).eq("id",id).select("*").maybeSingle()
  :db.from("aos_discord_message_rules").insert({...patch,alliance_code:alliance,mention_role:alliance==="NRW"}).select("*").single());
 if(!item)throw new HttpError("rule_not_found",404);
 await audit(alliance,userId,"discord_message_rule",item.id,isExisting?"update":"create");
 return json(req,{ok:true,item});
}
async function deleteDiscordRule(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"event_bot"))throw new HttpError("permission_denied",403);
 const id=str(body.id,36);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw new HttpError("invalid_rule_id",400);
 const deleted=await checked<any>(db.from("aos_discord_message_rules").delete().eq("alliance_code",alliance).eq("id",id).select("id").maybeSingle());
 if(!deleted)throw new HttpError("rule_not_found",404);
 await audit(alliance,userId,"discord_message_rule",id,"delete");
 return json(req,{ok:true});
}

// Event loans are separate from permanent transfer requests and NAP history.
// External second accounts are MANUAL associations only: no login, roster,
// NAP transfer, permissions, or inferred in-game membership.
async function saveExternalAlt(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"members"))throw new HttpError("permission_denied",403);
 const mainId=str(body?.main_game_id,20),altId=str(body?.alt_game_id,20);
 if(!isId(mainId)||!isId(altId)||mainId===altId)throw new HttpError("invalid_account_link",400);
 const main=await checked<any>(db.from("players").select("id").eq("alliance_code",alliance)
   .eq("game_id",mainId).eq("active",true).maybeSingle());
 if(!main)throw new HttpError("main_not_in_alliance",403);
 const alreadyAlt=await checked<any>(db.from("aos_member_account_links").select("main_game_id")
   .eq("alliance_code",alliance).eq("alt_game_id",mainId).maybeSingle());
 if(alreadyAlt)throw new HttpError("main_is_already_alt",409);
 const existing=await checked<any>(db.from("aos_member_account_links").select("main_game_id")
   .eq("alliance_code",alliance).eq("alt_game_id",altId).maybeSingle());
 if(existing&&existing.main_game_id!==mainId)throw new HttpError("alt_linked_to_another_main",409);
 const domestic=await checked<any[]>(db.from("players").select("game_id").eq("alliance_code",alliance)
   .eq("game_id",altId).eq("active",true).limit(1));
 if(domestic.length)throw new HttpError("alt_already_in_nrw_use_roster_link",409);
 if(body?.command==="remove"){
   if(!existing)throw new HttpError("alt_link_not_found",404);
   await checked<any>(db.from("aos_member_account_links").delete().eq("alliance_code",alliance)
     .eq("alt_game_id",altId).eq("main_game_id",mainId).select("alt_game_id").single());
   await audit(alliance,userId,"external_alt",altId,"unlink");
   return json(req,{ok:true,removed:true});
 }
 if(body?.command!=="save")throw new HttpError("invalid_command",400);
 const name=str(body?.display_name||"",80).trim(),location=str(body?.reported_alliance||"",24).trim();
 const dependents=await checked<any[]>(db.from("aos_member_account_links").select("alt_game_id")
   .eq("alliance_code",alliance).eq("main_game_id",altId).limit(1));
 if(dependents.length)throw new HttpError("alt_is_already_a_main",409);
 const item=await checked<any>(db.from("aos_member_account_links").upsert({
   alliance_code:alliance,alt_game_id:altId,main_game_id:mainId,
   display_name:name||null,reported_alliance:location||null,
   updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code,alt_game_id"}).select("alt_game_id,main_game_id,display_name,reported_alliance").single());
 await audit(alliance,userId,"external_alt",altId,existing?"update":"link");
 return json(req,{ok:true,item});
}
async function eventLoanSave(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!staff.is_owner)throw new HttpError("permission_denied",403);
 const command=str(body?.command||"approve",15),now=new Date().toISOString();
 if(command==="return"||command==="cancel"){
   const id=str(body?.id,40);
   if(!/^[a-f0-9-]{36}$/i.test(id))throw new HttpError("invalid_loan_id",400);
   const row=await checked<any>(db.from("aos_event_loans").select("*")
     .eq("home_alliance",alliance).eq("id",id).maybeSingle());
   if(!row||row.status!=="approved")throw new HttpError("loan_not_active",409);
   const data=command==="return"?{status:"returned",returned_at:now,updated_at:now,updated_by:userId}
     :{status:"cancelled",updated_at:now,updated_by:userId};
   const saved=await checked<any>(db.from("aos_event_loans").update(data)
     .eq("home_alliance",alliance).eq("id",id).eq("status","approved").select("*").single());
   await audit(alliance,userId,"event_loan",id,command);
   return json(req,{ok:true,loan:saved});
 }
 if(command!=="approve")throw new HttpError("invalid_command",400);
 const gameId=str(body?.game_id,20),target=str(body?.target_alliance,8),
  eventType=str(body?.event_type,10),note=str(body?.note||"",500);
 // Inclusive UTC calendar days: the last selected date remains valid until the
 // following game's 00:00 UTC reset. No client timezone or minute precision.
 const startDay=str(body?.start_date,10),lastDay=str(body?.end_date,10);
 if(!isId(gameId)||!["NWO","RDS"].includes(target)||!["fdt","castle","kvk"].includes(eventType))
   throw new HttpError("invalid_event_loan",400);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(startDay)||!/^\d{4}-\d{2}-\d{2}$/.test(lastDay))
   throw new HttpError("invalid_event_loan_dates",400);
 const begin=Date.parse(startDay+"T00:00:00.000Z");
 const last=Date.parse(lastDay+"T00:00:00.000Z");
 const end=last+86400000;
 if(!Number.isFinite(begin)||!Number.isFinite(last)||
   new Date(begin).toISOString().slice(0,10)!==startDay||
   new Date(last).toISOString().slice(0,10)!==lastDay||
   last<begin||end-begin>21*86400000||begin<Date.now()-15*86400000||
   begin>Date.now()+45*86400000||end<=Date.now())
   throw new HttpError("invalid_event_loan_dates",400);
 const existing=await checked<any>(db.from("aos_event_loans").select("id")
   .eq("home_alliance",alliance).eq("game_id",gameId).eq("status","approved").maybeSingle());
 if(existing)throw new HttpError("loan_already_active",409);
 const people=await checked<any[]>(db.from("players")
   .select("id,game_id,alliance_code,active,alliance_rank,provider_seen_at")
   .eq("game_id",gameId).limit(20));
 const home=people.find(p=>p.alliance_code===alliance&&p.active);
 const atTarget=people.find(p=>p.alliance_code===target&&p.active);
 if(!people.length)throw new HttpError("player_not_found",409);
 if(!home){
   // A late FDT/RDS approval is allowed with recent NRW movement evidence,
   // even if the destination has not been imported yet. No privileged access
   // is granted until the target is independently observed.
   const moves=await checked<any[]>(db.from("player_alliance_transfers")
     .select("id").in("player_id",people.map(p=>p.id)).eq("from_alliance",alliance)
     .gte("moved_at",new Date(Date.now()-21*86400000).toISOString()).limit(5));
   if(!moves.length)throw new HttpError("no_recent_nrw_membership_evidence",409);
 }
 let originalRank:number|null=null;
 const protect=body?.protect_leadership===true;
 if(protect){
   const email=loginEmail(gameId);
   const {data,error}=await db.auth.admin.listUsers({page:1,perPage:1000});
   if(error)throw new HttpError("user_lookup_failed",500);
   const identity=data?.users?.find(u=>u.email?.toLowerCase()===email);
   if(!identity)throw new HttpError("leader_account_not_found",409);
   const leader=await checked<any>(db.from("aos_staff").select("rank,enabled,disabled_reason")
      .eq("user_id",identity.id).eq("alliance_code",alliance).maybeSingle());
   if(!leader||!["R4","R5"].includes(leader.rank)||leader.disabled_reason==="manual")
     throw new HttpError("leader_loan_protection_denied",403);
   originalRank=Number(leader.rank.slice(1));
   if(home?.alliance_rank&&Number(home.alliance_rank)!==originalRank)
     throw new HttpError("home_rank_changed",409);
 }
 const saved=await checked<any>(db.from("aos_event_loans").insert({
   home_alliance:alliance,game_id:gameId,target_alliance:target,event_type:eventType,
   starts_at:new Date(begin).toISOString(),ends_at:new Date(end).toISOString(),
   protect_leadership:protect,original_rank:originalRank,status:"approved",
   away_seen_at:atTarget?now:null,note,created_by:userId,updated_by:userId
 }).select("*").single());
 await audit(alliance,userId,"event_loan",saved.id,protect?"approve_protected":"approve");
 return json(req,{ok:true,loan:saved});
}
async function eventLoanData(req:Request,alliance:string,staff:any){
 if(!permission(staff,"members")&&!permission(staff,"transfers"))throw new HttpError("permission_denied",403);
 const loans=await checked<any[]>(db.from("aos_event_loans").select("*")
   .eq("home_alliance",alliance).order("created_at",{ascending:false}).limit(250));
 const ids=[...new Set(loans.map(l=>l.game_id))];
 const matches=ids.length?await checked<any[]>(db.from("players")
   .select("game_id,name,alliance_code,active,provider_seen_at,alliance_rank_observed_at")
   .in("game_id",ids).limit(350)):[];
 const observed:any={};
 for(const id of ids){
   const rows=matches.filter(p=>p.game_id===id&&p.active)
     .sort((a,b)=>(Date.parse(b.provider_seen_at||b.alliance_rank_observed_at||"")||0)-
                   (Date.parse(a.provider_seen_at||a.alliance_rank_observed_at||"")||0));
   observed[id]=rows.length?{name:rows[0].name,alliance:rows[0].alliance_code,
     seen_at:rows[0].provider_seen_at||rows[0].alliance_rank_observed_at}:null;
 }
 const now=new Date().toISOString();
 return json(req,{ok:true,loans:loans.map(l=>({...l,
   expired:l.status==="approved"&&l.ends_at<now,
   return_observed:l.status==="approved"&&Boolean(l.away_seen_at)&&
      observed[l.game_id]?.alliance===alliance&&
      Date.parse(observed[l.game_id]?.seen_at||"")>Date.parse(l.away_seen_at),
   overdue:l.status==="approved"&&l.ends_at<now&&observed[l.game_id]?.alliance!==alliance})),
   observed,can_approve:staff.is_owner===true});
}
async function bootstrap(req: Request, alliance: string, staff: any) {
  const config=await checked<any>(db.from("aos_alliances").select("*").eq("code",alliance).single());
  const [players, transfers, laws, events, internalMoves, eventMessages, eventGuidance, eventCycles, eventDayTemplates, transferWindows, lawVersions, lawPublications, auditTrail]=await Promise.all([
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
    permission(staff,"laws")?checked<any[]>(db.from("aos_law_publications").select("law_id,scope,version,published_at").eq("alliance_code",alliance).eq("scope","kingdom").limit(250)):Promise.resolve([]),
    staff.is_owner?checked<any[]>(db.from("aos_audit").select("entity,entity_id,action,actor_id,created_at").eq("alliance_code",alliance).order("created_at",{ascending:false}).limit(60)):Promise.resolve([])
  ]);
  const linkedAccounts=permission(staff,"members")?await checked<any[]>(db.from("aos_member_account_links")
    .select("alt_game_id,main_game_id,display_name,reported_alliance")
    .eq("alliance_code",alliance).limit(500)):[];
  const rosterIds=new Set(players.map(p=>String(p.game_id)));
  const externalAlts=linkedAccounts.filter(x=>!rosterIds.has(String(x.alt_game_id))&&
    rosterIds.has(String(x.main_game_id)));
  let staffMembers:any[]=[];
  if(staff.is_owner){
    const assigned=await checked<any[]>(db.from("aos_staff")
      .select("user_id,rank,permissions,enabled,is_admin").eq("alliance_code",alliance).limit(100));
    staffMembers=await Promise.all(assigned.map(async (entry:any)=>{
      const {data,error}=await db.auth.admin.getUserById(entry.user_id);
      return {user_id:entry.user_id,email:error?"":data?.user?.email||"",rank:entry.rank,
        permissions:entry.permissions,enabled:entry.enabled,is_admin:entry.is_admin===true,
        protected_account:entry.is_admin===true || data?.user?.email?.toLowerCase()==="admin@nap-tracker.invalid"};
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
  return json(req,{alliance:config,staff:{rank:staff.rank,permissions:staff.permissions,is_owner:staff.is_owner},staffMembers,transferContacts,externalAlts,
    players:permission(staff,"members")?players:
      ["performance","bear","fightclub","participation"].some(feature=>permission(staff,feature))?
        players.filter(p=>p.active&&p.member_status!=="left")
          .map(p=>({game_id:p.game_id,name:p.name,active:p.active,
            member_status:p.member_status,main_game_id:p.main_game_id||null})):[],
    transfers:permission(staff,"transfers")?transfers:[],
    internalMoves:permission(staff,"transfers")?internalMoves:[],
    laws:permission(staff,"laws")?laws:[],events:permission(staff,"events")?events:[],
    eventMessages:permission(staff,"events")?eventMessages:[],
    eventGuidance:permission(staff,"events")?eventGuidance:[],
    eventCycles:permission(staff,"events")?eventCycles:[],
    eventDayTemplates:permission(staff,"events")?eventDayTemplates:[],
    transferWindows:permission(staff,"transfers")?transferWindows:[],
    lawVersions,lawPublications,auditTrail});
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
// Manual roster refresh: authorize every ID from the same server-side roster
// shown in player management. Never accept arbitrary client-supplied IDs.
async function syncListedRosterPower(req:Request,alliance:string,staff:any,body:any){
 if(!permission(staff,"members"))throw new HttpError("permission_denied",403);
 if(alliance!=="NRW")throw new HttpError("unsupported_alliance",400);
 const key=Deno.env.get("KINGSHOTSTATS_API_KEY")||"";
 if(!key)throw new HttpError("player_provider_unconfigured",503);
 const config=await checked<any>(db.from("aos_alliances").select("kingdom_id").eq("code",alliance).single());
 const people=await rosterFor(alliance,config.kingdom_id);
 const ids=[...new Set(people.map((p:any)=>String(p.game_id||"")).filter(isId))].sort();
 if(!ids.length)throw new HttpError("roster_missing",409);
 const cursor=Number(body?.cursor??0);
 if(!Number.isInteger(cursor)||cursor<0||cursor>=ids.length)throw new HttpError("invalid_sync_cursor",400);
 const allowed=new Set(ids),batch=ids.slice(cursor,cursor+20),now=new Date().toISOString();
 const snapshots=await checked<any[]>(db.from("aos_member_power_snapshot")
  .select("game_id,power,fetched_at").eq("alliance_code",alliance).in("game_id",ids).limit(1000));
 const validPower=(n:any)=>n!==null&&n!==undefined&&n!==""&&Number.isSafeInteger(Number(n))&&Number(n)>=0&&Number(n)<=9999999999999;
 const fresh=new Set(snapshots.filter(p=>validPower(p.power)&&Date.now()-Date.parse(p.fetched_at)>=0&&Date.now()-Date.parse(p.fetched_at)<25*60*1000).map(p=>String(p.game_id)));
 const values=new Map<string,any>(),failed:any[]=[];let rateLimited=false,providerCalls=0;
 // Retain the existing roster-refresh cache tag (schema enum), regardless of endpoint.
 const add=(id:string,power:any)=>{if(allowed.has(id)&&validPower(power))values.set(id,{alliance_code:alliance,game_id:id,power:Number(power),fetched_at:now,source:"mightpulse_roster"});};
 // One aggregate request covers current NRW members; absent/away/left accounts
 // are subsequently resolved through the player endpoint, irrespective of tag.
 if(cursor===0&&people.some((p:any)=>p.active&&!p.is_event_loan&&!fresh.has(String(p.game_id)))){
  try{
   providerCalls++;
   const response=await fetch("https://api.mightpulse.com/v1/alliances/"+encodeURIComponent(String(config.kingdom_id))+"/"+encodeURIComponent(alliance)+"?include=info,roster",{headers:{Accept:"application/json",Authorization:"Bearer "+key},signal:AbortSignal.timeout(30000)});
   if(response.status===429)throw new HttpError("provider_rate_limited",429);
   if(response.ok){const raw=await response.json().catch(()=>null),rows=raw?.members??raw?.roster?.members??raw?.data?.members??raw?.data?.roster?.members;
    if(Array.isArray(rows))for(const p of rows)add(String(p?.governor_id??p?.fid??p?.player_id??""),p?.power);}
  }catch(e){if(e instanceof HttpError&&e.httpStatus===429)throw e;}
 }
 const pending=batch.filter(id=>!fresh.has(id)&&!values.has(id));let index=0;
 async function worker(){
  while(index<pending.length){const id=pending[index++];
   if(rateLimited){failed.push({game_id:id,error:"provider_rate_limited"});continue;}
   try{
    providerCalls++;
    const response=await fetch("https://api.mightpulse.com/v1/players/"+encodeURIComponent(id)+"?include=base",{headers:{Accept:"application/json",Authorization:"Bearer "+key},signal:AbortSignal.timeout(12000)});
    if(response.status===429)rateLimited=true;
    if(!response.ok)throw Error(response.status===404?"player_not_found":response.status===429?"provider_rate_limited":"player_provider_unavailable");
    const wire=await response.json(),p=wire?.player??wire?.data?.player;
    const responseId=p?.governor_id??p?.game_id??p?.fid??p?.player_id;
    if(!p||(responseId!=null&&String(responseId)!==id)||!validPower(p.power??p.total_power))throw Error("player_power_unavailable");
    add(id,p.power??p.total_power);
   }catch(e){failed.push({game_id:id,error:String((e as Error)?.message||"player_provider_unavailable")});}
  }
 }
 await Promise.all(Array.from({length:Math.min(3,pending.length)},()=>worker()));
 const updates=[...values.values()];
 for(let i=0;i<updates.length;i+=100){const part=updates.slice(i,i+100);
  await checked<any>(db.from("aos_member_power_history").upsert(part.map(p=>({...p,observed_on:now.slice(0,10)})),{onConflict:"alliance_code,game_id,observed_on"}).select("game_id"));
  await checked<any>(db.from("aos_member_power_snapshot").upsert(part,{onConflict:"alliance_code,game_id"}).select("game_id"));
 }
 return json(req,{ok:true,source:providerCalls?"mightpulse_mixed":"cache",matched:new Set([...fresh,...values.keys()]).size,updated:updates.length,requested:ids.length,failed,
  rate_limited:rateLimited,next_cursor:!rateLimited&&cursor+batch.length<ids.length?cursor+batch.length:null,fetched_at:now});
}

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
   const batch=values.slice(i,i+100);
   await checked<any>(db.from("aos_member_power_snapshot").upsert(batch,
     {onConflict:"alliance_code,game_id"}).select("game_id"));
   // The date represents the provider's actual UTC observation day.
   // Repeated calls on the same day update the most recent real reading.
   await checked<any>(db.from("aos_member_power_history").upsert(
     batch.map(x=>({...x,observed_on:now.slice(0,10)})),
     {onConflict:"alliance_code,game_id,observed_on"}).select("game_id"));
 }
 return json(req,{ok:true,source:"mightpulse_roster",matched:values.length,updated:values.length,
   requested:known.size,fetched_at:now});
}
// Read-only Phase 2 dashboard. Alliance staff authorization is enforced before
// any data is collected. No NAP or performance source records are modified.
async function performanceDashboard(req:Request,alliance:string,staff:any){
  if(!permission(staff,"performance"))throw new HttpError("permission_denied",403);
  const since=new Date(Date.now()-89*86400000).toISOString().slice(0,10);
  const history:any[]=[];
  let truncated=false;
  // Pagination avoids silently limiting the dashboard to the default 1000 rows.
  for(let page=0;page<12;page++){
    const chunk=await checked<any[]>(db.from("aos_member_power_history")
      .select("game_id,observed_on,power,fetched_at,source")
      .eq("alliance_code",alliance).gte("observed_on",since)
      .order("observed_on",{ascending:true}).order("game_id",{ascending:true})
      .range(page*1000,page*1000+999));
    history.push(...chunk);
    if(chunk.length<1000)break;
    if(page===11)truncated=true;
  }
  const events=await checked<any[]>(db.from("performance_events")
    .select("id,performance_type,event_name,label,period_start,period_end,finalized,updated_at")
    .in("performance_type",["kvk_prep","alliance_mobilization"])
    .order("period_start",{ascending:false}).limit(100));
  const eventIds=events.map(e=>e.id);
  const raw=eventIds.length?await checked<any[]>(db.from("player_performance_snapshots")
    .select("performance_event_id,player_id,score,server_rank,recorded_at,source_type,metadata")
    .eq("alliance_code",alliance).in("performance_event_id",eventIds)
    .order("recorded_at",{ascending:false}).limit(4000)):[];
  // Preserve the highest verified score per account/event, including the rank
  // and source from that very observation. Multiple imported frames aren't additive.
  const best=new Map<string,any>();
  for(const item of raw){
    if(!item.player_id||!item.performance_event_id)continue;
    const key=item.performance_event_id+":"+item.player_id;
    const old=best.get(key),score=Number(item.score),prior=Number(old?.score);
    if(!Number.isSafeInteger(score)||score<0)continue;
    if(!old||score>prior||(score===prior&&String(item.recorded_at)>String(old.recorded_at)))
      best.set(key,item);
  }
  const chosen=[...best.values()];
  const ids=[...new Set(chosen.map(r=>r.player_id))];
  const names:any[]=[];
  for(let i=0;i<ids.length;i+=200){
    names.push(...await checked<any[]>(db.from("players").select("id,game_id,name")
      .in("id",ids.slice(i,i+200)).limit(200)));
  }
  const people=new Map(names.map(p=>[p.id,p]));
  const rankings=chosen.map(item=>{
    const p=people.get(item.player_id);
    return {event_id:item.performance_event_id,game_id:p?.game_id||null,
      player_name:p?.name||str(item.metadata?.detected_name||"",100)||"—",
      score:Number(item.score),server_rank:item.server_rank,
      recorded_at:item.recorded_at,source:item.source_type};
  });
  const ownEventIds=new Set(rankings.map(r=>r.event_id));
  return json(req,{ok:true,days:90,since,partial:truncated,
    power:history.map(x=>({game_id:x.game_id,date:x.observed_on,
      value:Number(x.power),observed_at:x.fetched_at})),
    events:events.filter(e=>ownEventIds.has(e.id)),rankings,raw_count:raw.length});
}
// Phase 3 – read-only source integration. This never edits Discord slots or
// Bear Optimizer profiles/PINs. Only authorized alliance leaders may read it.
async function bearManagement(req:Request,alliance:string,staff:any){
 if(!permission(staff,"bear"))throw new HttpError("permission_denied",403);
 const roster=await checked<any[]>(db.from("players").select("game_id,name,active")
   .eq("alliance_code",alliance).not("game_id","is",null).limit(250));
 const allIds=[...new Set(roster.map(p=>String(p.game_id||"")).filter(isId))];
 const activeIds=new Set(roster.filter(p=>p.active).map(p=>String(p.game_id)));
 const [slots,assignments,plannerConfig,powers]=await Promise.all([
   checked<any[]>(db.from("discord_bear_slots")
     .select("slot_key,slot_label,start_time,timezone,active,anchor_date")
     .eq("alliance_code",alliance).eq("active",true).order("start_time",{ascending:true}).limit(20)),
   checked<any[]>(db.from("aos_bear_assignments")
     .select("game_id,slot_key,role,attendance,notes,updated_at")
     .eq("alliance_code",alliance).order("updated_at",{ascending:false}).limit(250)),
   checked<any>(db.from("aos_bear_planning_settings")
     .select("strong_power_threshold").eq("alliance_code",alliance).maybeSingle()),
   checked<any[]>(db.from("aos_member_power_snapshot")
     .select("game_id,power,fetched_at,source").eq("alliance_code",alliance).limit(500))
 ]);
 const rawProfiles:any[]=[];
 for(let i=0;i<allIds.length;i+=100){
   if(!allIds.slice(i,i+100).length)break;
   rawProfiles.push(...await checked<any[]>(db.from("bear_player_profiles")
     .select("game_id,updated_at,data").in("game_id",allIds.slice(i,i+100)).limit(100)));
 }
 const safeNumber=(x:any,cap=9999999999999):number|null=>
   x===null||x===undefined||x===""||typeof x==="boolean"||!Number.isFinite(Number(x))||
   Number(x)<0||Number(x)>cap?null:Number(x);
 const profiles=rawProfiles.filter(p=>activeIds.has(String(p.game_id))).map(p=>{
   const d=p.data&&typeof p.data==="object"?p.data:{};
   const v=d.values&&typeof d.values==="object"?d.values:{};
   const names=Array.isArray(d.ownHeroes)?d.ownHeroes.filter((x:any)=>typeof x==="string").slice(0,3):[];
   const heroes=names.map((name:string)=>{
     const raw=(d.heroes&&typeof d.heroes==="object"?d.heroes[name]:null)||{};
     return {name:str(name,45),stars:safeNumber(raw.stars,10),
       tier:safeNumber(raw.tier,20),level:safeNumber(raw.level,200),
       widget:safeNumber(raw.widget,20)};
   });
   return {game_id:String(p.game_id),updated_at:p.updated_at,
     heroes,join_count:safeNumber(d.joinCount,20),
     comparison:["weaker","similar","stronger"].includes(d.joinLeaderComparison)?d.joinLeaderComparison:null,
     capacity:safeNumber(v.cap),
     troops:{inf:safeNumber(v.troopsI),cav:safeNumber(v.troopsC),arc:safeNumber(v.troopsA)},
     stats:{inf_attack:safeNumber(v.iAtk,100000),inf_lethality:safeNumber(v.iLet,100000),
       cav_attack:safeNumber(v.cAtk,100000),cav_lethality:safeNumber(v.cLet,100000),
       arc_attack:safeNumber(v.aAtk,100000),arc_lethality:safeNumber(v.aLet,100000)},
     // Allowlist only optimizer combat/formation inputs; never transmit
     // profile editing credentials, edit PINs or unsupported history.
     formation_input:{
       values:Object.fromEntries(["cap","troopsI","troopsC","troopsA","iAtk","iLet","cAtk","cLet","aAtk","aLet","squadAtk","squadLet","pet","master","heroCapManual"].filter(k=>safeNumber(v[k],10000000000)!==null).map(k=>[k,safeNumber(v[k],10000000000)])),
       v2:{
         ownHeroes:names,
         manualHeroes:Object.fromEntries(Object.entries(d.heroes||{}).filter(([key,value])=>key.length<=45&&value&&typeof value==="object").map(([key,value])=>{const h=value as any;return [key,{name:key,stars:safeNumber(h.stars,10),tier:safeNumber(h.tier,20),level:safeNumber(h.level,200),widget:safeNumber(h.widget,20),skills:Array.isArray(h.skills)?h.skills.slice(0,5):[],
  expeditionStats:Object.fromEntries(["iAtk","iLet","cAtk","cLet","aAtk","aLet"].filter(k=>safeNumber(h.expeditionStats?.[k],5000)!==null).map(k=>[k,safeNumber(h.expeditionStats[k],5000)]))}];})),
         scannedOwnedHeroes:Object.keys(d.heroes||{}).filter(k=>typeof k==="string").slice(0,80),
         joinCount:safeNumber(d.joinCount,6)||0,
         troopGroups:Array.isArray(d.troopGroups)?d.troopGroups.filter((g:any)=>g&&["infantry","cavalry","archer"].includes(g.type)).slice(0,36).map((g:any)=>({type:g.type,tier:safeNumber(g.tier,11),tg:safeNumber(g.tg,8),count:safeNumber(g.count)})):[],
         ministers:{court:["king","highKing"].includes(d.ministers?.court)?d.ministers.court:"king",fc:d.ministers?.fc===true,m:d.ministers?.m===true},
         petActive:{"Mighty Bison":d.petActive?.["Mighty Bison"]===true},
         petSkillRanks:{"Mighty Bison":safeNumber(d.petSkillRanks?.["Mighty Bison"],20)},
         savageAdvantage:safeNumber(d.savageAdvantage,10),
         valoraTalent:safeNumber(d.valoraTalent,10),
         combatStatOrigin:["separate-overview","combined-report"].includes(d.combatStatOrigin)?d.combatStatOrigin:null,
         squadSeparate:d.squadSeparate===true
       }
     }
   };
 });
 return json(req,{ok:true,slots,assignments:assignments.filter(a=>allIds.includes(a.game_id)),
   profiles,settings:{strong_power_threshold:plannerConfig?.strong_power_threshold??null},
   powers:powers.filter(p=>activeIds.has(String(p.game_id))&&Number.isFinite(Number(p.power))&&Number(p.power)>=0)
     .map(p=>({game_id:p.game_id,power:Number(p.power),fetched_at:p.fetched_at})),
   source_note:"Optimizer values are player-entered; calculations are provisional."});
}
async function saveBearAssignment(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"bear"))throw new HttpError("permission_denied",403);
 const gameId=str(body?.game_id,20),slotKey=str(body?.slot_key,70),
       role=str(body?.role||"starter",20),attendance=str(body?.attendance||"tentative",20);
 if(!isId(gameId))throw new HttpError("invalid_player_id",400);
 const member=await checked<any>(db.from("players").select("id")
   .eq("alliance_code",alliance).eq("game_id",gameId).eq("active",true).maybeSingle());
 if(!member)throw new HttpError("player_not_active_in_alliance",403);
 if(!slotKey&&attendance!=="no"){
   await checked<any>(db.from("aos_bear_assignments").delete()
     .eq("alliance_code",alliance).eq("game_id",gameId));
   await audit(alliance,userId,"bear_assignment",gameId,"unassign");
   return json(req,{ok:true,game_id:gameId,removed:true});
 }
 if(!["starter","joiner","flex"].includes(role)||!["confirmed","tentative","no"].includes(attendance))
   throw new HttpError("invalid_bear_assignment",400);
 if(attendance!=="no"){
   const slot=await checked<any>(db.from("discord_bear_slots").select("slot_key")
     .eq("alliance_code",alliance).eq("slot_key",slotKey).eq("active",true).maybeSingle());
   if(!slot)throw new HttpError("bear_slot_unavailable",409);
 }
 const notes=str(body?.notes||"",500);
 const result=await checked<any>(db.from("aos_bear_assignments").upsert({
   alliance_code:alliance,game_id:gameId,slot_key:attendance==="no"?null:slotKey,role:role==="joiner"?"joiner":"starter",attendance,notes,
   updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code,game_id"}).select("game_id,slot_key,role,attendance,notes,updated_at").single());
 await audit(alliance,userId,"bear_assignment",gameId,"assign");
 return json(req,{ok:true,assignment:result});
}
async function saveBearPlanningSettings(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"bear"))throw new HttpError("permission_denied",403);
 const input=body?.strong_power_threshold;
 const threshold=input===null||input===undefined||input===""?null:Number(input);
 if(threshold!==null&&(!Number.isSafeInteger(threshold)||threshold<1||threshold>9999999999999))
   throw new HttpError("invalid_power_threshold",400);
 const result=await checked<any>(db.from("aos_bear_planning_settings").upsert({
   alliance_code:alliance,strong_power_threshold:threshold,
   updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code"}).select("strong_power_threshold").single());
 await audit(alliance,userId,"bear_planning_settings",alliance,"save_strength_threshold");
 return json(req,{ok:true,settings:result});
}
// FightClub Phase 4: isolated draft rosters. Historical Discord event cycles
// and timestamps are read-only. Manual planning dates are NOT official dates.
// Protected FightClub battlefield objectives. Map links are private planning
// records, never registered automatically in Kingshot or the Discord bot.
function fightMapLocationValid(eventType:string,key:string){
 if(!["swordland","triforce"].includes(eventType))return false;
 if(["safe-zone","guerrilla"].includes(key))return true;
 const qualified=/^(north|south):([^:]+)$/.exec(key);
 if(qualified){
   if(["safe-zone","guerrilla"].includes(qualified[2]))return false;
   key=qualified[2];
 }
 if(eventType==="triforce")return key==="temple"||/^[ABC](?:[1-9]|[12][0-9]|3[01])$/.test(key);
 return eventType==="swordland"&&[
  "shrine","bell","mercenary","reformation","stables","safe-zone",
  "sanctum-west","sanctum-east",
  "abbey-north","abbey-east","abbey-west","abbey-south",
  "under-nw","under-ne","under-sw","under-se"
 ].includes(key);
}
async function fightClubMapSave(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"fightclub"))throw new HttpError("permission_denied",403);
 const eventType=str(body?.event_type,30),battleDate=str(body?.battle_date,10),
   gameId=str(body?.game_id,20),locationKey=str(body?.location_key,32);
 if(!["swordland","triforce"].includes(eventType)||!isId(gameId))
   throw new HttpError("invalid_map_assignment",400);
 const parsed=Date.parse(battleDate+"T00:00:00Z");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(battleDate)||!Number.isFinite(parsed)||
    new Date(parsed).toISOString().slice(0,10)!==battleDate||
    parsed-Date.now() < -120*86400000||parsed-Date.now() > 540*86400000)
   throw new HttpError("invalid_battle_date",400);
 if(body?.remove===true){
   await checked<any>(db.from("aos_fightclub_map_assignments").delete()
     .eq("alliance_code",alliance).eq("event_type",eventType)
     .eq("battle_date",battleDate).eq("game_id",gameId));
   await audit(alliance,userId,"fightclub_map",gameId,"remove_"+eventType+"_"+battleDate);
   return json(req,{ok:true,removed:true,game_id:gameId});
 }
 if(!fightMapLocationValid(eventType,locationKey))
   throw new HttpError("invalid_map_location",400);
 const record=await checked<any>(db.from("aos_fightclub_assignments")
   .select("legion,availability").eq("alliance_code",alliance)
   .eq("event_type",eventType).eq("battle_date",battleDate)
   .eq("game_id",gameId).maybeSingle());
 if(!record||![1,2].includes(record.legion)||record.availability==="unavailable")
   throw new HttpError("player_must_be_assigned_to_available_legion",409);
 const account=await checked<any>(db.from("players").select("id")
   .eq("game_id",gameId).eq("alliance_code",alliance).eq("active",true).maybeSingle());
 if(!account)throw new HttpError("player_not_active_in_alliance",403);
 const assignment=await checked<any>(db.from("aos_fightclub_map_assignments").upsert({
   alliance_code:alliance,event_type:eventType,battle_date:battleDate,game_id:gameId,
   location_key:locationKey,updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code,event_type,battle_date,game_id"})
  .select("event_type,battle_date,game_id,location_key,updated_at").single());
 await audit(alliance,userId,"fightclub_map",gameId,"assign_"+eventType+"_"+battleDate+"_"+locationKey);
 return json(req,{ok:true,assignment});
}

async function fightClubData(req:Request,alliance:string,staff:any){
 if(!permission(staff,"fightclub"))throw new HttpError("permission_denied",403);
 const since=new Date(Date.now()-120*86400000).toISOString().slice(0,10);
 const [cycles,assignments,powers,mapAssignments,leaders]=await Promise.all([
  checked<any[]>(db.from("discord_special_event_cycles")
   .select("id,event_type,battle_date,source_begin_at,source_end_at")
   .in("event_type",["swordland","triforce"]).order("battle_date",{ascending:false}).limit(60)),
  checked<any[]>(db.from("aos_fightclub_assignments")
   .select("event_type,battle_date,game_id,legion,availability,combat_role,notes,updated_at")
   .eq("alliance_code",alliance).gte("battle_date",since)
   .order("battle_date",{ascending:false}).limit(2000)),
  checked<any[]>(db.from("aos_member_power_snapshot")
   .select("game_id,power,fetched_at,source").eq("alliance_code",alliance).limit(500)),
  checked<any[]>(db.from("aos_fightclub_map_assignments")
   .select("event_type,battle_date,game_id,location_key,updated_at")
   .eq("alliance_code",alliance).gte("battle_date",since)
   .order("battle_date",{ascending:false}).limit(2000)),
  checked<any[]>(db.from("aos_fightclub_team_leaders")
   .select("event_type,battle_date,legion,game_id")
   .eq("alliance_code",alliance).gte("battle_date",since).limit(350))
 ]);
 const ids=cycles.map(c=>c.id);
 const legionTimes=ids.length?await checked<any[]>(db.from("discord_special_legions")
   .select("cycle_id,legion,starts_at").eq("alliance_code",alliance)
   .in("cycle_id",ids).limit(180)):[];
 const verified=new Map<string,any>();
 for(const p of powers){
  const n=Number(p.power);
  if(isId(p.game_id)&&p.power!==null&&Number.isSafeInteger(n)&&n>=0){
   verified.set(p.game_id,{game_id:p.game_id,power:n,fetched_at:p.fetched_at,source:p.source});
  }
 }
 return json(req,{ok:true,cycles:cycles.map(c=>({
  event_type:c.event_type,battle_date:c.battle_date,
  times:legionTimes.filter(l=>l.cycle_id===c.id).map(l=>({legion:l.legion,starts_at:l.starts_at}))
 })),assignments,powers:[...verified.values()],map_assignments:mapAssignments,leaders,since});
}
async function saveFightClub(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"fightclub"))throw new HttpError("permission_denied",403);
 const eventType=str(body?.event_type,30),battleDate=str(body?.battle_date,10),gameId=str(body?.game_id,20);
 if(!["swordland","triforce"].includes(eventType))throw new HttpError("invalid_fight_event",400);
 // Calendar date only. Do not invent an event or trust client timestamps.
 const parsed=Date.parse(battleDate+"T00:00:00Z");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(battleDate)||
  !Number.isFinite(parsed)||new Date(parsed).toISOString().slice(0,10)!==battleDate)
  throw new HttpError("invalid_battle_date",400);
 const delta=Date.parse(battleDate+"T00:00:00Z")-Date.now();
 if(!Number.isFinite(delta)||delta < -120*86400000||delta>540*86400000)
   throw new HttpError("battle_date_out_of_range",400);
 if(!isId(gameId))throw new HttpError("invalid_player_id",400);
 const p=await checked<any>(db.from("players").select("id").eq("alliance_code",alliance)
   .eq("game_id",gameId).eq("active",true).maybeSingle());
 if(!p)throw new HttpError("player_not_active_in_alliance",403);
 if(body?.remove===true){
  await checked<any>(db.from("aos_fightclub_assignments").delete()
   .eq("alliance_code",alliance).eq("event_type",eventType)
   .eq("battle_date",battleDate).eq("game_id",gameId));
  await audit(alliance,userId,"fightclub",gameId,"unassign_"+eventType+"_"+battleDate);
  return json(req,{ok:true,removed:true,game_id:gameId});
 }
 const legion=Number(body?.legion??0),availability=str(body?.availability??"unknown",20),
 combatRole=str(body?.combat_role??"flex",20),notes=str(body?.notes??"",500);
 if(!Number.isInteger(legion)||![-1,0,1,2].includes(legion)||
  !["unknown","full","partial","unavailable"].includes(availability)||
  !["flex","attack","defense","support"].includes(combatRole))
   throw new HttpError("invalid_fight_assignment",400);
 if([1,2].includes(legion)&&availability==="unavailable")throw new HttpError("unavailable_cannot_join_legion",409);
 const previous=await checked<any>(db.from("aos_fightclub_assignments")
  .select("legion").eq("alliance_code",alliance).eq("event_type",eventType)
  .eq("battle_date",battleDate).eq("game_id",gameId).maybeSingle());
 const a=await checked<any>(db.from("aos_fightclub_assignments").upsert({
   alliance_code:alliance,event_type:eventType,battle_date:battleDate,game_id:gameId,
   legion,availability,combat_role:combatRole,notes,
   updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code,event_type,battle_date,game_id"})
   .select("event_type,battle_date,game_id,legion,availability,combat_role,notes,updated_at").single());
 // Reassigning a participant to another legion invalidates an old map order.
 if(previous && Number(previous.legion)!==legion){
   await checked<any>(db.from("aos_fightclub_map_assignments").delete()
    .eq("alliance_code",alliance).eq("event_type",eventType)
    .eq("battle_date",battleDate).eq("game_id",gameId));
   await checked<any>(db.from("aos_fightclub_team_leaders").delete()
    .eq("alliance_code",alliance).eq("event_type",eventType)
    .eq("battle_date",battleDate).eq("game_id",gameId));
 }
 await audit(alliance,userId,"fightclub",gameId,"plan_"+eventType+"_"+battleDate);
 return json(req,{ok:true,assignment:a});
}
// Optional manually selected Swordland/TriAlliance legion leader.
async function saveFightClubLeader(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"fightclub"))throw new HttpError("permission_denied",403);
 const eventType=str(body?.event_type,30),battleDate=str(body?.battle_date,10),
       legion=Number(body?.legion),gameId=str(body?.game_id||"",20);
 const parsed=Date.parse(battleDate+"T00:00:00Z");
 if(!["swordland","triforce"].includes(eventType)||![1,2].includes(legion)||
    !/^\d{4}-\d{2}-\d{2}$/.test(battleDate)||!Number.isFinite(parsed)||
    new Date(parsed).toISOString().slice(0,10)!==battleDate||
    parsed-Date.now() < -120*86400000||parsed-Date.now() > 540*86400000)
   throw new HttpError("invalid_battle_date",400);
 if(!gameId){
   await checked<any>(db.from("aos_fightclub_team_leaders").delete()
     .eq("alliance_code",alliance).eq("event_type",eventType)
     .eq("battle_date",battleDate).eq("legion",legion));
   await audit(alliance,userId,"fightclub_leader",eventType+"_"+battleDate+"_"+legion,"clear");
   return json(req,{ok:true,removed:true});
 }
 if(!isId(gameId))throw new HttpError("invalid_player_id",400);
 const present=await checked<any>(db.from("aos_fightclub_assignments")
   .select("game_id").eq("alliance_code",alliance).eq("event_type",eventType)
   .eq("battle_date",battleDate).eq("legion",legion)
   .eq("game_id",gameId).maybeSingle());
 if(!present)throw new HttpError("leader_must_join_legion",409);
 const saved=await checked<any>(db.from("aos_fightclub_team_leaders").upsert({
   alliance_code:alliance,event_type:eventType,battle_date:battleDate,legion,game_id:gameId,
   updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code,event_type,battle_date,legion"})
   .select("event_type,battle_date,legion,game_id").single());
 await audit(alliance,userId,"fightclub_leader",gameId,"assign_"+eventType+"_"+battleDate+"_"+legion);
 return json(req,{ok:true,leader:saved});
}
// Phase 5 – private, manually recorded event attendance. Event templates are
// reused read-only. Neither the Discord bot nor player accounts are modified.
async function eventParticipationData(req:Request,alliance:string,staff:any){
 if(!permission(staff,"participation"))throw new HttpError("permission_denied",403);
 const today=new Date().toISOString().slice(0,10);
 const since=new Date(Date.now()-90*86400000).toISOString().slice(0,10);
 const until=new Date(Date.now()+365*86400000).toISOString().slice(0,10);
 const [cycles,records,bearRows,fightRows]=await Promise.all([
  checked<any[]>(db.from("aos_event_cycles")
    .select("group_key,title,anchor_date,interval_days,duration_days,enabled,start_time_utc")
    .eq("alliance_code",alliance).eq("enabled",true)
    .order("group_key",{ascending:true}).limit(120)),
  checked<any[]>(db.from("aos_event_participation")
    .select("event_key,event_date,game_id,response,attendance,notes,updated_at")
    .eq("alliance_code",alliance).gte("event_date",since).lte("event_date",until)
    .order("event_date",{ascending:false}).limit(3500)),
  permission(staff,"bear")?checked<any[]>(db.from("aos_bear_assignments").select("game_id,slot_key")
    .eq("alliance_code",alliance).limit(250)):Promise.resolve([]),
  permission(staff,"fightclub")?checked<any[]>(db.from("aos_fightclub_assignments")
    .select("event_type,battle_date,game_id,legion")
    .eq("alliance_code",alliance).gte("battle_date",today)
    .order("battle_date",{ascending:false}).limit(1000)):Promise.resolve([])
 ]);
 const cycleKeySet=new Set(cycles.map(c=>String(c.group_key)));
 return json(req,{ok:true,today,cycles,partial:records.length===3500,
  records:records.filter(r=>cycleKeySet.has(String(r.event_key))),
  overview:{
   bear_access:permission(staff,"bear"),fightclub_access:permission(staff,"fightclub"),
   bear_accounts:new Set(bearRows.map(r=>r.game_id)).size,
   fightclub_plans:fightRows.filter(r=>Number(r.legion)>=0).length,
   fightclub_events:[...new Set(fightRows.filter(r=>Number(r.legion)>=0)
      .map(r=>r.event_type+":"+r.battle_date))].length
  }});
}
async function saveEventParticipation(req:Request,alliance:string,userId:string,staff:any,body:any){
 if(!permission(staff,"participation"))throw new HttpError("permission_denied",403);
 const eventKey=str(body?.event_key,80),eventDate=str(body?.event_date,10),gameId=str(body?.game_id,20);
 if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(eventKey))throw new HttpError("invalid_event_key",400);
 const parsed=Date.parse(eventDate+"T00:00:00Z");
 if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(eventDate)||!Number.isFinite(parsed)||
    new Date(parsed).toISOString().slice(0,10)!==eventDate)
   throw new HttpError("invalid_event_date",400);
 const minDate=new Date(Date.now()-90*86400000).toISOString().slice(0,10);
 const maxDate=new Date(Date.now()+365*86400000).toISOString().slice(0,10);
 if(eventDate<minDate||eventDate>maxDate)
   throw new HttpError("event_date_out_of_range",400);
 if(!isId(gameId))throw new HttpError("invalid_player_id",400);
 const [eventType,player]=await Promise.all([
  checked<any>(db.from("aos_event_cycles").select("group_key")
    .eq("alliance_code",alliance).eq("group_key",eventKey).eq("enabled",true).maybeSingle()),
  checked<any>(db.from("players").select("id").eq("alliance_code",alliance)
    .eq("game_id",gameId).eq("active",true).maybeSingle())
 ]);
 if(!eventType)throw new HttpError("event_not_configured",409);
 if(!player)throw new HttpError("player_not_active_in_alliance",403);
 if(body?.remove===true){
  await checked<any>(db.from("aos_event_participation").delete()
    .eq("alliance_code",alliance).eq("event_key",eventKey)
    .eq("event_date",eventDate).eq("game_id",gameId));
  await audit(alliance,userId,"event_participation",gameId,"unassign_"+eventKey+"_"+eventDate);
  return json(req,{ok:true,removed:true,game_id:gameId});
 }
 const response=str(body?.response??"unknown",20),attendance=str(body?.attendance??"unknown",20);
 if(!["unknown","yes","maybe","no"].includes(response)||
    !["unknown","present","absent","excused"].includes(attendance))
   throw new HttpError("invalid_attendance",400);
 // A leader cannot mark attendance as observed before that event date.
 if(attendance!=="unknown"&&eventDate>new Date().toISOString().slice(0,10))
   throw new HttpError("future_attendance_forbidden",409);
 const notes=str(body?.notes??"",500);
 const record=await checked<any>(db.from("aos_event_participation").upsert({
   alliance_code:alliance,event_key:eventKey,event_date:eventDate,game_id:gameId,
   response,attendance,notes,updated_at:new Date().toISOString(),updated_by:userId
 },{onConflict:"alliance_code,event_key,event_date,game_id"})
   .select("event_key,event_date,game_id,response,attendance,notes,updated_at").single());
 await audit(alliance,userId,"event_participation",gameId,"save_"+eventKey+"_"+eventDate);
 return json(req,{ok:true,record});
}
async function memberPowerHistory(req:Request,alliance:string,staff:any,body:any){
 if(!permission(staff,"members"))throw new HttpError("permission_denied",403);
 const gameId=str(body?.game_id,20);
 if(!isId(gameId))throw new HttpError("invalid_player_id",400);
 const owns=await checked<any>(db.from("players").select("id").eq("alliance_code",alliance)
   .eq("game_id",gameId).maybeSingle());
 if(!owns)throw new HttpError("player_not_in_alliance",403);
 const records=await checked<any[]>(db.from("aos_member_power_history")
   .select("observed_on,power,fetched_at,source").eq("alliance_code",alliance)
   .eq("game_id",gameId).order("observed_on",{ascending:false}).limit(120));
 return json(req,{ok:true,game_id:gameId,snapshots:records.reverse()});
}
async function lookupTransferPlayer(req:Request,alliance:string,staff:any,body:any){
 if(!permission(staff,body?.action==="external_alt_lookup"?"members":"transfers"))throw new HttpError("permission_denied",403);
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
async function unpublishServerLaw(req:Request,alliance:string,userId:string,staff:any,payload:any){
 if(!permission(staff,"laws"))throw new HttpError("permission_denied",403);
 const id=str(payload.id,36),expected=Number(payload.expected_version);
 if(!id||!Number.isInteger(expected)||expected<1)throw new HttpError("invalid_version",400);
 const law=await checked<any>(db.from("aos_laws").select("*").eq("alliance_code",alliance)
   .eq("id",id).eq("scope","kingdom").maybeSingle());
 if(!law)throw new HttpError("not_found",404);
 if(law.version!==expected)throw new HttpError("version_conflict",409);
 const publication=await checked<any>(db.from("aos_law_publications").select("law_id")
   .eq("alliance_code",alliance).eq("scope","kingdom").eq("law_id",id).maybeSingle());
 if(!publication)throw new HttpError("law_not_published",409);
 // Withdraw the public snapshot first so it cannot linger after an explicit withdrawal.
 const removed=await db.from("aos_law_publications").delete().eq("law_id",id)
   .eq("alliance_code",alliance).eq("scope","kingdom").select("law_id");
 if(removed.error||!removed.data?.length)throw new HttpError("unpublish_failed",500);
 const now=new Date().toISOString();
 const updated=await checked<any>(db.from("aos_laws").update({
    status:"draft",published_at:null,version:law.version+1,updated_at:now
 }).eq("id",id).eq("alliance_code",alliance).eq("version",expected).select("*").maybeSingle());
 if(!updated)throw new HttpError("version_conflict",409);
 await checked<any>(db.from("aos_law_versions").insert({
   law_id:id,alliance_code:alliance,version:updated.version,
   snapshot:{scope:updated.scope,number:updated.number,category:updated.category,title:updated.title,body:updated.body,status:"draft"},
   changed_by:userId
 }).select("id").single());
 await audit(alliance,userId,"law",id,"unpublish");
 return json(req,{ok:true,item:updated});
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
   title:history.snapshot?.title||{},body:history.snapshot?.body||{},category:history.snapshot?.category||law.category||"other",status:"draft",published_at:null,
   version:law.version+1,updated_at:new Date().toISOString()
 }).eq("id",id).eq("alliance_code",alliance).eq("version",expected).select("*").maybeSingle());
 if(!restored)throw new HttpError("version_conflict",409);
 await checked<any>(db.from("aos_law_versions").insert({
   law_id:id,alliance_code:alliance,version:restored.version,
   snapshot:{scope:restored.scope,number:restored.number,category:restored.category,title:restored.title,body:restored.body,status:"draft"},changed_by:userId
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
  const permissions=Object.fromEntries(STAFF_PERMISSION_KEYS.map(x=>[x,perms[x]===true]));
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
  const existing=await checked<any>(db.from("aos_staff").select("rank,disabled_reason,is_admin")
    .eq("user_id",user.id).eq("alliance_code",alliance).maybeSingle());
  if(existing?.is_admin===true)throw new HttpError("cannot_edit_admin",403);
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
  const granted=Object.fromEntries(STAFF_PERMISSION_KEYS
    .map(feature=>[feature,incoming[feature]===true]));
  const item=await checked<any>(db.from("aos_staff").upsert({
    user_id:user.id,alliance_code:alliance,rank,
    enabled,permissions:granted,disabled_reason:enabled?null:"manual"
  },{onConflict:"user_id,alliance_code"}).select("user_id,rank,enabled,permissions").single());
  await audit(alliance,userId,"staff",user.id,existing?"update_r4":"grant_r4");
  return json(req,{ok:true,item:{...item,email}});
}
const groupKey=(v:unknown)=>{const key=str(v,70);if(!/^[a-z0-9-]{2,70}$/.test(key))throw new HttpError("invalid_event_group",400);return key;};
async function saveEventCycle(req:Request,alliance:string,userId:string,staff:any,payload:any){
  if(!permission(staff,"events"))throw new HttpError("permission_denied",403);
  const group_key=groupKey(payload.group_key),isBearSlot=/^bear-[123]$/.test(group_key);
  if(/^bear-[0-9]+$/.test(group_key)&&!isBearSlot)throw new HttpError("bear_slot_limit",400);
  const title_only=payload.title_only===true;
  const previous=await checked<any>(db.from("aos_event_cycles").select("*").eq("alliance_code",alliance).eq("group_key",group_key).maybeSingle());
  const anchor_date=title_only&&previous?previous.anchor_date:validateDate(payload.anchor_date,false);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(anchor_date||""))throw new HttpError("invalid_anchor",400);
  const interval_days=title_only&&previous?Number(previous.interval_days):Number(payload.interval_days);
  const duration_days=title_only&&previous?Number(previous.duration_days):Number(payload.duration_days);
  const phase_count=title_only&&previous?Number(previous.phase_count):Number(payload.phase_count);
  if(!Number.isInteger(interval_days)||interval_days<1||interval_days>365||
     !Number.isInteger(duration_days)||duration_days<1||duration_days>14||duration_days>interval_days||
     !Number.isInteger(phase_count)||phase_count<1||phase_count>duration_days)throw new HttpError("invalid_cycle",400);
  const requestedTime=title_only&&previous?previous.start_time_utc:payload.start_time_utc;
  const start_time_utc=requestedTime==null||requestedTime===""?null:str(requestedTime,8).slice(0,5);
  if(start_time_utc&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(start_time_utc))throw new HttpError("invalid_utc_time",400);
  const enabled=title_only?(previous?.enabled??!isBearSlot):payload.enabled!==false;
  if(isBearSlot&&enabled&&!start_time_utc&&!title_only)throw new HttpError("bear_time_required",400);
  const isLegionEvent=["catalog-swordland-showdown","catalog-tri-alliance-clash"].includes(group_key);
  const hasLegionTimes=!title_only&&(Object.hasOwn(payload,"legion1_time_utc")||Object.hasOwn(payload,"legion2_time_utc"));
  if(hasLegionTimes&&!isLegionEvent)throw new HttpError("legion_times_not_supported",400);
  const legionTime=(value:unknown)=>{
    if(value===null||value==="")return null;
    if(typeof value!=="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))throw new HttpError("invalid_legion_time",400);
    return value;
  };
  const legion1_time_utc=hasLegionTimes?legionTime(payload.legion1_time_utc):(previous?.legion1_time_utc??null);
  const legion2_time_utc=hasLegionTimes?legionTime(payload.legion2_time_utc):(previous?.legion2_time_utc??null);
  if((legion1_time_utc===null)!==(legion2_time_utc===null))throw new HttpError("both_legion_times_required",400);
  const cycle=await checked<any>(db.from("aos_event_cycles").upsert({
    alliance_code:alliance,group_key,anchor_date,interval_days,duration_days,phase_count,
    enabled,override_schedule:title_only?(previous?.override_schedule===true):true,
    start_time_utc:isBearSlot?start_time_utc:null,legion1_time_utc,legion2_time_utc,
    title:localized(payload.title,120),updated_at:new Date().toISOString(),updated_by:userId
  },{onConflict:"alliance_code,group_key"}).select("*").single());
  await audit(alliance,userId,title_only?"event_title":"event_cycle",group_key,"save");
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
      discord_invite_url:validDiscordInvite(data.discord_invite_url),
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
    // No link update from older clients that do not submit this field.
    let selectedMainId:string|undefined=undefined;
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
        notes:str(data.notes,3000),share_approved:existing?.share_approved??false,
        avatar_url:profileAvatar(data.avatar_url,null)||existing?.avatar_url||null};
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
      const validCategories=["protection","conduct","combat","alliance","buildings","governance","spending","other"];
      const category=str(data.category||existing?.category||"other",30);
      if(!validCategories.includes(category))throw new HttpError("invalid_law_category",400);
      // Explicit editor publication is the only source of public server Laws.
      if(status==="published"&&(!title.de||!body.de))throw new HttpError("law_requires_german",400);
      if(scope==="kingdom"&&alliance!=="NRW")throw new HttpError("kingdom_editor_nrw_only",403);
      if(existing && existing.scope!==scope)throw new HttpError("law_scope_change_forbidden",403);
      const collision=await checked<any>(db.from("aos_laws").select("id")
        .eq("alliance_code",alliance).eq("scope",scope).eq("number",number).maybeSingle());
      if(collision?.id&&collision.id!==existing?.id)throw new HttpError("law_number_exists",409);
      if(existing && Number(data.expected_version)!==Number(existing.version))throw new HttpError("version_conflict",409);
      patch={...patch,scope,number,category,title,body,status,version:existing?existing.version+1:1,
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
      if(Object.prototype.hasOwnProperty.call(data,"main_game_id")){
        selectedMainId=str(data.main_game_id||"",20);
        if(selectedMainId){
          if(!isId(selectedMainId)||selectedMainId===str(data.game_id,20))
            throw new HttpError("invalid_main_account",400);
          const main=await checked<any>(db.from("players").select("id")
            .eq("alliance_code",alliance).eq("game_id",selectedMainId).maybeSingle());
          if(!main)throw new HttpError("main_not_in_alliance",400);
          const isAlt=await checked<any>(db.from("aos_member_account_links").select("alt_game_id")
            .eq("alliance_code",alliance).eq("alt_game_id",selectedMainId).maybeSingle());
          if(isAlt)throw new HttpError("main_is_already_alt",409);
          const existingAlts=await checked<any[]>(db.from("aos_member_account_links")
            .select("alt_game_id").eq("alliance_code",alliance)
            .eq("main_game_id",str(data.game_id,20)).limit(1));
          if(existingAlts.length)throw new HttpError("account_has_alts",409);
        }
      }
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
    if(entity==="law" && existing){
      // Atomic optimistic locking on the UPDATE itself (not just a stale pre-read).
      result=await checked<any>(db.from(entry.table).update(patch).eq("id",id)
        .eq("alliance_code",alliance).eq("version",existing.version).select("*").maybeSingle());
      if(!result)throw new HttpError("version_conflict",409);
    }else{
      result=await checked<any>(existing
        ? db.from(entry.table).update(patch).eq("id",id).eq("alliance_code",alliance).select("*").single()
        : db.from(entry.table).insert(patch).select("*").single());
    }
    if(entity==="member" && selectedMainId!==undefined){
      if(selectedMainId){
        await checked<any>(db.from("aos_member_account_links").upsert({
          alliance_code:alliance,alt_game_id:str(data.game_id,20),main_game_id:selectedMainId,
          updated_at:now,updated_by:userId
        },{onConflict:"alliance_code,alt_game_id"}).select("alt_game_id").single());
      }else{
        await checked<any>(db.from("aos_member_account_links").delete()
          .eq("alliance_code",alliance).eq("alt_game_id",str(data.game_id,20)));
      }
    }
    if(entity==="law"){
      await checked<any>(db.from("aos_law_versions").insert({
        law_id:result.id, alliance_code:alliance,version:result.version,
        snapshot:{scope:result.scope,number:result.number,category:result.category,title:result.title,body:result.body,status:result.status},
        changed_by:userId
      }).select("id").single());
      // A draft edit or restoration never takes the last published version offline.
      if(result.status==="published"){
        await checked<any>(db.from("aos_law_publications").upsert({
          law_id:result.id,alliance_code:alliance,scope:result.scope,number:result.number,category:result.category,
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
    if(req.method==="GET"&&["public-events","public-laws","public-guidance","public-schedule","public-config","public-announcement"].includes(u.searchParams.get("mode")||""))
      return await publicInfo(req,alliance,u.searchParams.get("mode")||"");
    if(req.method==="GET"&&u.searchParams.get("mode")==="public-leaders")return await publicLeaders(req,alliance);
    const {userId,staff}=await staffFor(req,alliance);
    if(req.method==="GET"&&u.searchParams.get("mode")==="announcement")return await announcementData(req,alliance,staff);
    if(req.method==="GET"&&u.searchParams.get("mode")==="discord-bot")return await discordPlanner(req,alliance,staff,Number(u.searchParams.get("page")||0));
     if(req.method==="GET")return await bootstrap(req,alliance,staff);
    if(Number(req.headers.get("content-length")||"0")>1600000)throw new HttpError("payload_too_large",413);
    const body=await req.json().catch(()=>{throw new HttpError("invalid_json",400)});
    if(body?.action!=="alliance_logo_upload"&&Number(req.headers.get("content-length")||"0")>200000)throw new HttpError("payload_too_large",413);
    if(body?.action==="alliance_logo_upload"||body?.action==="alliance_logo_remove")return await updateAllianceLogo(req,alliance,userId,staff,body);
    if(body?.action==="announcement")return await saveAnnouncement(req,alliance,userId,staff,body);
    if(body?.action==="staff")return await saveStaff(req,alliance,userId,staff,body);
    if(body?.action==="event_loan_data")return await eventLoanData(req,alliance,staff);
    if(body?.action==="event_loan_save")return await eventLoanSave(req,alliance,userId,staff,body);
    if(body?.action==="external_alt_save")return await saveExternalAlt(req,alliance,userId,staff,body);
    if(body?.action==="provision_leaders")return await provisionLeaders(req,alliance,userId,staff);
    if(body?.action==="reset_leader_password")return await rotateLeaderPassword(req,alliance,userId,staff,body);
    if(body?.action==="player_lookup"||body?.action==="external_alt_lookup")return await lookupTransferPlayer(req,alliance,staff,body);
    if(body?.action==="power_sync")return body?.include_listed===true?await syncListedRosterPower(req,alliance,staff,body):await syncRosterPower(req,alliance,staff);
    if(body?.action==="power_history")return await memberPowerHistory(req,alliance,staff,body);
    if(body?.action==="performance_dashboard")return await performanceDashboard(req,alliance,staff);
    if(body?.action==="bear_management")return await bearManagement(req,alliance,staff);
    if(body?.action==="bear_assignment")return await saveBearAssignment(req,alliance,userId,staff,body);
    if(body?.action==="bear_settings_save")return await saveBearPlanningSettings(req,alliance,userId,staff,body);
    if(body?.action==="fightclub_data")return await fightClubData(req,alliance,staff);
    if(body?.action==="fightclub_save")return await saveFightClub(req,alliance,userId,staff,body);
    if(body?.action==="fightclub_map_save")return await fightClubMapSave(req,alliance,userId,staff,body);
    if(body?.action==="fightclub_leader_save")return await saveFightClubLeader(req,alliance,userId,staff,body);
    if(body?.action==="event_participation_data")return await eventParticipationData(req,alliance,staff);
    if(body?.action==="event_participation_save")return await saveEventParticipation(req,alliance,userId,staff,body);
    if(body?.action==="staff_invite")return await inviteR4(req,alliance,userId,staff,body);
    if(body?.action==="transfer_window")return await saveTransferWindow(req,alliance,userId,staff,body);
    if(body?.action==="transfer_portraits")return await refreshTransferPortraits(req,alliance,staff);
    if(body?.action==="law_history")return await getLawHistory(req,alliance,staff,str(body.id,36));
    if(body?.action==="law_unpublish")return await unpublishServerLaw(req,alliance,userId,staff,body);
    if(body?.action==="law_restore")return await restoreLawDraft(req,alliance,userId,staff,body);
    if(body?.action==="discord_bot_config")return await saveDiscordConfig(req,alliance,userId,staff,body);
     if(body?.action==="discord_event_anchor")return await saveDiscordAnchor(req,alliance,userId,staff,body);
     if(body?.action==="discord_event_day_time")return await saveDiscordEventDayTime(req,alliance,userId,staff,body);
     if(body?.action==="discord_message_rule")return await saveDiscordRule(req,alliance,userId,staff,body);
     if(body?.action==="discord_message_delete")return await deleteDiscordRule(req,alliance,userId,staff,body);
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
