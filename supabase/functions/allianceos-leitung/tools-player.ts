// Documented MightPulse base/ranks fields only. Unknown values remain null.
export function normalizeToolsProfile(wire:any,id:string,now=new Date().toISOString()){
 const p=wire?.player??wire?.data?.player,r=wire?.ranks??wire?.data?.ranks??p?.ranks??{};
 const responseId=p?.governor_id??p?.fid??p?.game_id??wire?.governor_id;
 if(!p||String(responseId??'')!==id||wire?.governor_id!=null&&String(wire.governor_id)!==id)throw Error('invalid_provider_response');
 const number=(v:any)=>v!==null&&v!==undefined&&v!==''&&typeof v!=='boolean'&&Number.isSafeInteger(Number(v))&&Number(v)>=0?Number(v):null;
 const text=(v:any,max=100)=>v==null?null:String(v).trim().slice(0,max)||null;
 const date=(v:any)=>{if(v===null||v===undefined||v==='')return null;if(Number(v)===0)return 'none';const n=Number(v),d=Number.isFinite(n)?new Date(n<1e12?n*1000:n):new Date(v);return Number.isFinite(d.getTime())?d.toISOString():null;};
 const shield=date(p.shield_endtime),burn=date(p.burn_endtime);
 return {game_id:id,name:text(p.nick_name??p.name),kingdom_id:number(p.kid??p.kingdom_id),alliance:text(p.alliance?.abbr??p.alliance_abbr,40),
  power:number(p.power??r.power),tc_level:number(p.town_center_level??r.town_center_level),kills:number(p.kills??r.kills),
  power_rank:number(r.power_rank),kills_rank:number(r.kills_rank),migrant_score:number(r.migrant_score),migrant_rank:number(r.migrant_rank),
  mystic_trial:number(r.mystic_trial),mystic_rank:number(r.mystic_rank),x:number(p.x),y:number(p.y),
  shield_state:shield==='none'?'none':shield?'reported':null,shield_end_at:shield==='none'?null:shield,
  burn_state:burn==='none'?'none':burn?'reported':null,burn_end_at:burn==='none'?null:burn,
  alliance_rank:number(p.alliance?.rank),alliance_rank_label:text(p.alliance?.rank_label,32),
  provider_cached_at:date(wire?.cached_at)==='none'?null:date(wire?.cached_at),fetched_at:now,source:'mightpulse'};
}
export function createToolsPlayers({db,checked,HttpError,getApiKey=()=>Deno.env.get('KINGSHOTSTATS_API_KEY'),fetchImpl=fetch}:any){
 async function lookup(id:string){
  const [base,context,cached]=await Promise.all([
   checked(db.rpc('aos_tools_player_lookup',{p_game_id:id})),
   checked(db.rpc('aos_tools_player_context',{p_game_id:id})),
   checked(db.from('aos_tools_player_profiles').select('profile,fetched_at').eq('game_id',id).maybeSingle())
  ]);
  const profile=cached?.profile||context?.profile||null;
  const name=profile?.name||base?.name||null;
  const names=[...(base?.name&&base.name!==name?[{name:base.name}]:[]),...(base?.previous_names||[])].filter((row:any,index:number,list:any[])=>row.name!==name&&list.findIndex(other=>other.name===row.name)===index);
  return {...base,found:base?.found===true||Boolean(profile),tracked:base?.found===true,
   game_id:id,name,alliance:profile?.alliance??base?.alliance??null,
   profile,previous_names:names,alliance_history:context?.alliance_history||[],as_of:base?.as_of||new Date().toISOString(),
   active_count:base?.found?base.active_count:null,total_count:base?.found?base.total_count:null,deleted_count:base?.found?base.deleted_count:null};
 }
 async function refresh(id:string){
  const cached=await checked(db.from('aos_tools_player_profiles').select('profile,fetched_at').eq('game_id',id).maybeSingle());
  const age=Date.now()-Date.parse(cached?.fetched_at||'');
  if(age>=0&&age<120000)return {player:await lookup(id),source:'cache'};
  const key=getApiKey();if(!key)throw new HttpError('player_provider_unconfigured',503);
  let response;try{response=await fetchImpl('https://api.mightpulse.com/v1/players/'+encodeURIComponent(id)+'?include=base,ranks',{headers:{Accept:'application/json',Authorization:'Bearer '+key},signal:AbortSignal.timeout(90000)});}catch{throw new HttpError('player_provider_unreachable',502);}
  if(!response.ok)throw new HttpError(response.status===404?'player_not_found':response.status===429?'provider_rate_limited':'player_provider_unavailable',response.status===404?404:response.status===429?429:502);
  let profile;try{profile=normalizeToolsProfile(await response.json(),id);}catch{throw new HttpError('invalid_provider_response',502);}
  await checked(db.from('aos_tools_player_profiles').upsert({game_id:id,profile,fetched_at:profile.fetched_at},{onConflict:'game_id'}).select('game_id').single());
  return {player:await lookup(id),source:'mightpulse'};
 }
 return {lookup,refresh};
}
