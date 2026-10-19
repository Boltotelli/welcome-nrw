import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const supabaseUrl=Deno.env.get("SUPABASE_URL")!;
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false}});
const ALLIANCE="NRW";
const USER_EMAIL=/^leader-([0-9]{5,20})@accounts\.allianceos\.invalid$/i;
const PERMISSIONS={members:false,transfers:false,laws:false,events:false,event_bot:false,settings:false};
const resp=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const load=async<T>(query:PromiseLike<{data:T|null,error:any}>):Promise<T>=>{
 const {data,error}=await query;if(error)throw new Error("db_"+String(error.code||error.message).slice(0,75));return data as T;
};
const secretPassword=()=>{
 const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
 return Array.from(crypto.getRandomValues(new Uint32Array(32)),i=>chars[i%chars.length]).join("");
};
type Player={game_id:string|null,name:string,active:boolean,alliance_rank:number|null,alliance_rank_observed_at:string|null};
type Staff={user_id:string,rank:string,permissions:Record<string,boolean>,enabled:boolean,disabled_reason:string|null};
async function reconcile(){
 const now=new Date().toISOString();
 const control=await load<any>(db.from("aos_leader_sync_control").select("last_check").eq("id",1).single());
 if(control.last_check && Date.now()-Date.parse(control.last_check)<8*60*1000)return {ok:true,skipped:"recently_checked"};
 await load(db.from("aos_leader_sync_control").update({last_check:now,last_error:null,updated_at:now}).eq("id",1).select("id").single());
 const [roster,staff]=await Promise.all([
  load<Player[]>(db.from("players").select("game_id,name,active,alliance_rank,alliance_rank_observed_at").eq("alliance_code",ALLIANCE).limit(1000)),
  load<Staff[]>(db.from("aos_staff").select("user_id,rank,permissions,enabled,disabled_reason").eq("alliance_code",ALLIANCE).limit(1000))
 ]);
 const freshest=Math.max(...roster.map(p=>p.alliance_rank_observed_at?Date.parse(p.alliance_rank_observed_at):0));
 if(!Number.isFinite(freshest)||Date.now()-freshest>48*3600*1000)
  throw new Error("alliance_rank_snapshot_stale");
 const byId=new Map(roster.filter(p=>p.game_id).map(p=>[p.game_id!,p]));
 const rights=new Map(staff.map(s=>[s.user_id,s]));
 const existingUsers=new Map<string,{id:string,email?:string}>();
 let pages=0;
 for(let page=1;page<=10;page++){
  const {data,error}=await db.auth.admin.listUsers({page,perPage:500});
  if(error)throw new Error("auth_list_failed_"+String(error.code||"error"));
  const list=data?.users||[];for(const user of list)if(user.email)existingUsers.set(user.email.toLowerCase(),{id:user.id,email:user.email});
  pages++;
  if(list.length<500)break;
  if(page===10)throw new Error("auth_page_limit_reached");
 }
 const result={alliance:ALLIANCE,observed_at:new Date(freshest).toISOString(),pages,active_leaders:0,created:0,updated:0,disabled:0,restored:0,manual_disabled_preserved:0,errors:[] as string[]};
 const qualified=new Map<string,Player>();
 for(const p of roster){
  if(p.active && (p.alliance_rank===4||p.alliance_rank===5) && p.game_id && /^[0-9]{5,20}$/.test(p.game_id)){
   qualified.set(p.game_id,p);
  }
 }
 result.active_leaders=qualified.size;
 // Revoke demoted/transferred accounts, but NEVER touch the owner's legacy login.
 for(const [email,user] of existingUsers){
  const found=USER_EMAIL.exec(email);if(!found)continue;
  const entry=rights.get(user.id);if(!entry)continue;
  const player=byId.get(found[1]);
  const allowed=player?.active && (player.alliance_rank===4||player.alliance_rank===5);
  if(!allowed && (entry.enabled||entry.disabled_reason!=="rank_lost")){
   await load(db.from("aos_staff").update({enabled:false,disabled_reason:"rank_lost"}).eq("alliance_code",ALLIANCE).eq("user_id",user.id).select("user_id").single());
   result.disabled++;
  }
 }
 // Preserve permissions for currently valid people; never create a privileged account without an actual roster match.
 for(const [gameId,player] of qualified){
  const email="leader-"+gameId+"@accounts.allianceos.invalid";
  let user=existingUsers.get(email);
  const rank="R"+player.alliance_rank;
  if(!user){
   const {data,error}=await db.auth.admin.createUser({
    email,password:secretPassword(),email_confirm:true,
    app_metadata:{source:"allianceos_leader_auto_sync",alliance:ALLIANCE,game_id:gameId}
   });
   if(error||!data?.user){result.errors.push("create_user_"+gameId);continue;}
   user={id:data.user.id,email};existingUsers.set(email,user);result.created++;
  }
  const old=rights.get(user.id);
  if(!old){
   const created=await db.from("aos_staff").insert({user_id:user.id,alliance_code:ALLIANCE,rank,enabled:true,permissions:PERMISSIONS,disabled_reason:null}).select("user_id").maybeSingle();
   if(created.error){result.errors.push("staff_create_"+gameId);continue;}
   result.updated++;
   continue;
  }
  const restore=old.disabled_reason==="rank_lost";
  const needsRank=old.rank!==rank;
  if(needsRank||restore){
   const changed=await db.from("aos_staff").update({rank,
    ...(restore?{enabled:true,disabled_reason:null}:{})
   }).eq("user_id",user.id).eq("alliance_code",ALLIANCE).select("user_id").maybeSingle();
   if(changed.error){result.errors.push("staff_update_"+gameId);continue;}
   result.updated++;if(restore)result.restored++;
  }else if(!old.enabled)result.manual_disabled_preserved++;
 }
 if(result.errors.length)throw new Error("leader_sync_partial_failure:"+result.errors.join(",").slice(0,380));
 await load(db.from("aos_leader_sync_control").update({last_success:new Date().toISOString(),last_error:null,last_result:result,updated_at:new Date().toISOString()}).eq("id",1).select("id").single());
 return {ok:true,...result};
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return resp({error:"method_not_allowed"},405);
 try{
  const incoming=req.headers.get("x-aos-leader-sync-key")||"";
  const gate=await load<any>(db.from("aos_leader_sync_control").select("scheduler_key").eq("id",1).single());
  if(!incoming||incoming!==gate.scheduler_key)return resp({error:"unauthorized"},401);
  return resp(await reconcile());
 }catch(e){
  const error=String(e).slice(0,450);
  await db.from("aos_leader_sync_control").update({last_error:error,updated_at:new Date().toISOString()}).eq("id",1);
  console.error("allianceos-leader-sync",error);
  return resp({ok:false,error:"leader_sync_failed"},500);
 }
});