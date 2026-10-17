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
  return staff?.rank === "R5" || (staff?.rank === "R4" && staff.permissions?.[feature] === true);
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
  return {userId: who.user.id, staff};
}
async function audit(alliance: string, user: string, entity: string, id: string, action: string) {
  const {error} = await db.from("aos_audit").insert({
    alliance_code:alliance, actor_id:user, entity,entity_id:id,action
  });
  if (error) console.error("AllianceOS audit:",error.code);
}
async function publicInfo(req: Request, alliance: string, mode: string) {
  if (mode === "public-events") {
    const items = await checked<any[]>(db.from("aos_events")
      .select("id,title,description,start_at,end_at,requirements,template_code,updated_at")
      .eq("alliance_code",alliance).eq("status","published")
      .gte("start_at",new Date(Date.now()-86400000).toISOString())
      .order("start_at",{ascending:true}).limit(100));
    return json(req,{events:items});
  }
  const laws = await checked<any[]>(db.from("aos_laws")
    .select("id,scope,number,title,body,version,published_at,updated_at")
    .eq("alliance_code",alliance).eq("status","published").eq("scope","alliance")
    .order("number",{ascending:true}).limit(100));
  return json(req,{laws});
}
async function rosterFor(alliance: string, kingdom: number) {
  // Read-only reuse of NAP's cached records. No NAP table or law is modified.
  const players = await checked<any[]>(db.from("players")
    .select("id,game_id,name,alliance_code,alliance_rank,active,languages,provider_seen_at")
    .eq("alliance_code",alliance).order("name",{ascending:true}).limit(500));
  const notes = await checked<any[]>(db.from("aos_member_notes")
    .select("id,game_id,member_status,discord_user_id,notes,updated_at")
    .eq("alliance_code",alliance).limit(500));
  const cacheIds=players.map(p=>p.game_id).filter(isId);
  let images:any[]=[];
  if(cacheIds.length) images=await checked<any[]>(db.from("kingshot_player_cache")
    .select("player_id,avatar_url,tc_level,profile_updated_at,alliance")
    .eq("kingdom_id",kingdom).in("player_id",cacheIds).limit(500));
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
    const overlay=byNote.get(p.game_id)||{}, cache=byImg.get(p.game_id)||{}, match=byDiscord.get(p.id)||{};
    return {
      game_id:p.game_id, name:p.name, rank:p.alliance_rank || null,
      alliance:p.alliance_code, active:p.active,
      member_status:overlay.member_status||(p.active?"active":"left"),
      note_id:overlay.id||null, notes:overlay.notes||null,
      languages:p.languages||[], avatar_url:cache.avatar_url||null,
      tc_level:cache.tc_level??null,
      power:null, // No reliable player-power column exists in the reused tables.
      discord_user_id:overlay.discord_user_id||match.discord_user_id||null,
      source_seen_at:p.provider_seen_at||cache.profile_updated_at||null
    };
  });
}
async function bootstrap(req: Request, alliance: string, staff: any) {
  const config=await checked<any>(db.from("aos_alliances").select("*").eq("code",alliance).single());
  const [players, transfers, laws, events]=await Promise.all([
    rosterFor(alliance,config.kingdom_id),
    checked<any[]>(db.from("aos_transfers").select("*").eq("alliance_code",alliance).order("updated_at",{ascending:false}).limit(500)),
    checked<any[]>(db.from("aos_laws").select("*").eq("alliance_code",alliance).order("updated_at",{ascending:false}).limit(300)),
    checked<any[]>(db.from("aos_events").select("*").eq("alliance_code",alliance).order("start_at",{ascending:true}).limit(300))
  ]);
  return json(req,{alliance:config,staff:{rank:staff.rank,permissions:staff.permissions},players,transfers,laws,events});
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
      advertising_enabled:Boolean(data.advertising_enabled),
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
      const status=str(data.status,20), direction=str(data.direction,20);
      if(!["incoming","outgoing"].includes(direction) || !["interested","shortlisted","confirmed","waitlist","completed","cancelled"].includes(status)) throw new HttpError("invalid_transfer_state",400);
      patch={...patch,game_id:str(data.game_id,20),direction,status,
        player_name:str(data.player_name,100),origin_kingdom:data.origin_kingdom?Number(data.origin_kingdom):null,
        previous_alliance:str(data.previous_alliance,50),target_alliance:str(data.target_alliance,50)||alliance,
        power:data.power && Number.isFinite(Number(data.power)) ? Math.max(0,Math.floor(Number(data.power))):null,
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
      if(status==="published" && scope==="kingdom")throw new HttpError("kingdom_approval_required",403);
      if(status==="published"&&(!Object.values(title).some(Boolean)||!Object.values(body).some(Boolean)))throw new HttpError("incomplete_law",400);
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
      patch={...patch,game_id:str(data.game_id,20),member_status:data.member_status,
        discord_user_id:str(data.discord_user_id,32)||null,notes:str(data.notes,3000)};
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
    if(req.method==="GET"&&["public-events","public-laws"].includes(u.searchParams.get("mode")||""))
      return await publicInfo(req,alliance,u.searchParams.get("mode")||"");
    const {userId,staff}=await staffFor(req,alliance);
    if(req.method==="GET")return await bootstrap(req,alliance,staff);
    if(Number(req.headers.get("content-length")||"0")>200000)throw new HttpError("payload_too_large",413);
    const body=await req.json().catch(()=>{throw new HttpError("invalid_json",400)});
    if(body?.action!=="save")throw new HttpError("unknown_action",400);
    return await save(req,alliance,userId,staff,body);
  }catch(e){
    const status=e instanceof HttpError?e.httpStatus:500;
    const code=e instanceof HttpError?e.code:"internal_error";
    if(status===500)console.error("AllianceOS",e);
    return json(req,{error:code},status);
  }
});