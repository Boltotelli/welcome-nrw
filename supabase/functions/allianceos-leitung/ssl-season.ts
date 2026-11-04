export const SSL_SEASON='2026-season-2';
export function createSslSeason({db,checked,json,HttpError,permission,audit,locationValid}:any){
 const event='swordland_summit';
 const guard=(alliance:string,staff:any,write=false)=>{if(alliance!=='NRW'||(!permission(staff,'fightclub')&&(write||!permission(staff,'ssl_read')))||write&&staff.ssl_readonly)throw new HttpError('permission_denied',403);};
 async function data(alliance:string,readOnly=false){
  const [season,matches,pool,plans,maps,leaders]=await Promise.all([
   checked(db.from('aos_ssl_seasons').select('season_key,registration_closes_at,revision').eq('alliance_code',alliance).eq('season_key',SSL_SEASON).single()),
   checked(db.from('aos_ssl_matches').select('match_key,battle_date,stage,round,is_final').eq('alliance_code',alliance).eq('season_key',SSL_SEASON).order('battle_date').order('match_key')),
   checked(db.from('aos_ssl_pool').select('game_id,name,home_alliance,mystic_trial,source,registered_at').eq('alliance_code',alliance).eq('season_key',SSL_SEASON).order('name')),
   checked(db.from('aos_ssl_plans').select('match_key,game_id,legion,is_reserve,availability,combat_role'+(readOnly?'':',notes,updated_at')).eq('alliance_code',alliance).eq('season_key',SSL_SEASON)),
   checked(db.from('aos_ssl_map_plans').select('match_key,game_id,location_key').eq('alliance_code',alliance).eq('season_key',SSL_SEASON)),
   checked(db.from('aos_ssl_leaders').select('match_key,game_id,legion').eq('alliance_code',alliance).eq('season_key',SSL_SEASON))]);
  const byMatch=new Map(matches.map((m:any)=>[m.match_key,m]));
  const normalize=(rows:any[])=>rows.map(r=>({...r,event_type:event,ssl_match_key:r.match_key,battle_date:(byMatch.get(r.match_key) as any)?.battle_date}));
  return {ssl_season:{...season,server_now:new Date().toISOString(),registration_closed:Date.now()>=Date.parse(season.registration_closes_at),matches,pool},
   assignments:normalize(plans),map_assignments:normalize(maps),leaders:normalize(leaders)};
 }
 async function poolSave(req:Request,alliance:string,userId:string,staff:any,body:any){
  guard(alliance,staff,true);
  if(body.season_key!==SSL_SEASON||!Number.isInteger(body.revision)||!Array.isArray(body.game_ids))throw new HttpError('invalid_ssl_pool',400);
  const result=await db.rpc('aos_ssl_save_pool',{p_alliance:alliance,p_season:SSL_SEASON,p_revision:body.revision,p_ids:body.game_ids,p_actor:userId});
  if(result.error){const code=['ssl_registration_closed','ssl_pool_conflict','ssl_pool_player_has_plans','invalid_ssl_pool_player','invalid_ssl_pool'].find(c=>String(result.error.message).includes(c));throw new HttpError(code||'database_error',code?409:500);}
  await audit(alliance,userId,'ssl_pool',SSL_SEASON,'save');return json(req,{ok:true,...await data(alliance)});
 }
 async function matchFor(alliance:string,body:any){
  const key=String(body.ssl_match_key||'');if(!/^(qualifier-[1-4]|points-[1-5]|championship-[12]|championship-final)$/.test(key))throw new HttpError('ssl_match_required',400);
  const match=await checked(db.from('aos_ssl_matches').select('match_key,battle_date').eq('alliance_code',alliance).eq('season_key',SSL_SEASON).eq('match_key',key).maybeSingle());
  if(!match||body.battle_date!==match.battle_date)throw new HttpError('invalid_ssl_match',400);return match;
 }
 async function handle(req:Request,alliance:string,userId:string,staff:any,body:any){
  guard(alliance,staff,true);const match=await matchFor(alliance,body),gameId=String(body.game_id||''),base={alliance_code:alliance,season_key:SSL_SEASON,match_key:match.match_key};
  const scope=(q:any)=>q.eq('alliance_code',alliance).eq('season_key',SSL_SEASON).eq('match_key',match.match_key);
  const stamp={updated_by:userId,updated_at:new Date().toISOString()},normalize=(r:any)=>({...r,event_type:event,battle_date:match.battle_date,ssl_match_key:match.match_key});
  if(body.action==='fightclub_leader_save'&&!gameId){await checked(scope(db.from('aos_ssl_leaders').delete()).eq('legion',Number(body.legion)).select('game_id'));await audit(alliance,userId,'ssl_leader',match.match_key,'remove');return json(req,{ok:true,removed:true});}
  if(!/^[0-9]{1,20}$/.test(gameId))throw new HttpError('invalid_player_id',400);
  const pool=await checked(db.from('aos_ssl_pool').select('game_id').eq('alliance_code',alliance).eq('season_key',SSL_SEASON).eq('game_id',gameId).maybeSingle());
  if(!pool)throw new HttpError('ssl_player_not_registered',403);
  if(body.action==='fightclub_save'){
   if(body.remove===true){await checked(scope(db.from('aos_ssl_plans').delete()).eq('game_id',gameId).select('game_id'));await audit(alliance,userId,'ssl_plan',match.match_key+'_'+gameId,'remove');return json(req,{ok:true,removed:true,game_id:gameId});}
   const legion=Number(body.legion),availability=String(body.availability||'unknown'),role=String(body.combat_role||'flex'),notes=String(body.notes||'');
   if(![-1,0,1,2].includes(legion)||!['unknown','full','partial','unavailable'].includes(availability)||!['flex','attack','defense','support'].includes(role)||notes.length>500||typeof body.is_reserve!=='boolean'||body.is_reserve&&![1,2].includes(legion))throw new HttpError('invalid_fight_assignment',400);
   if([1,2].includes(legion)&&availability==='unavailable')throw new HttpError('unavailable_cannot_join_legion',409);
   const previous=await checked(scope(db.from('aos_ssl_plans').select('legion,is_reserve')).eq('game_id',gameId).maybeSingle());
   const record=await checked(db.from('aos_ssl_plans').upsert({...base,game_id:gameId,legion,is_reserve:body.is_reserve,availability,combat_role:role,notes,...stamp},{onConflict:'alliance_code,season_key,match_key,game_id'}).select('game_id,legion,is_reserve,availability,combat_role,notes,updated_at').single());
   if(body.is_reserve||previous&&(previous.legion!==legion||previous.is_reserve!==body.is_reserve)){
    await checked(scope(db.from('aos_ssl_map_plans').delete()).eq('game_id',gameId).select('game_id'));await checked(scope(db.from('aos_ssl_leaders').delete()).eq('game_id',gameId).select('game_id'));
   }
   await audit(alliance,userId,'ssl_plan',match.match_key+'_'+gameId,'save');return json(req,{ok:true,assignment:normalize(record)});
  }
  if(body.action==='fightclub_map_save'&&body.remove===true){await checked(scope(db.from('aos_ssl_map_plans').delete()).eq('game_id',gameId).select('game_id'));await audit(alliance,userId,'ssl_map',match.match_key+'_'+gameId,'remove');return json(req,{ok:true,removed:true});}
  const plan=await checked(scope(db.from('aos_ssl_plans').select('legion,is_reserve,availability')).eq('game_id',gameId).maybeSingle());
  if(!plan||![1,2].includes(plan.legion)||plan.is_reserve||plan.availability==='unavailable')throw new HttpError('player_must_join_legion',409);
  if(body.action==='fightclub_leader_save'){
   if(Number(body.legion)!==plan.legion)throw new HttpError('leader_must_join_legion',409);
   const record=await checked(db.from('aos_ssl_leaders').upsert({...base,game_id:gameId,legion:plan.legion,...stamp},{onConflict:'alliance_code,season_key,match_key,legion'}).select('game_id,legion').single());
   await audit(alliance,userId,'ssl_leader',match.match_key,'save');return json(req,{ok:true,leader:normalize(record)});
  }
  if(body.action==='fightclub_map_save'){
   const key=String(body.location_key||'');
   if(!locationValid(key))throw new HttpError('invalid_map_location',400);
   const record=await checked(db.from('aos_ssl_map_plans').upsert({...base,game_id:gameId,location_key:key,...stamp},{onConflict:'alliance_code,season_key,match_key,game_id'}).select('game_id,location_key').single());
   await audit(alliance,userId,'ssl_map',match.match_key+'_'+gameId,'save');return json(req,{ok:true,assignment:normalize(record)});
  }
  throw new HttpError('unknown_action',400);
 }
 const applies=(date:string)=>date>='2026-11-08'&&date<='2026-12-13';
 function merge(base:any,season:any,readOnly=false){
  const keep=(r:any)=>r.event_type!==event||!applies(r.battle_date),pool=season.ssl_season.pool;
  const players=pool.map((p:any)=>({...p,active:true,member_status:'active',is_ssl_guest:p.home_alliance!=='NRW'}));
  const powers=new Map(pool.map((p:any)=>[p.game_id,{game_id:p.game_id,power:null,mystic_trial:p.mystic_trial}]));
  for(const p of base.powers||[])powers.set(p.game_id,p);
  return {...base,...season,cycles:[...(base.cycles||[]).filter(keep),...season.ssl_season.matches.map((m:any)=>({event_type:event,battle_date:m.battle_date,ssl_match_key:m.match_key,times:[]}))],
   assignments:[...(base.assignments||[]).filter(keep),...season.assignments],map_assignments:[...(base.map_assignments||[]).filter(keep),...season.map_assignments],leaders:[...(base.leaders||[]).filter(keep),...season.leaders],powers:[...powers.values()],
   ...(readOnly?{players:[...new Map([...(base.players||[]),...players].map(p=>[p.game_id,p])).values()]}:{})};
 }
 return {data,poolSave,handle,applies,merge};
}
