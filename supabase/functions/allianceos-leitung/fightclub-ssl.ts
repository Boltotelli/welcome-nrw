export function createSslGuests({db,checked,permission,HttpError,json,audit}:any){
 const fields='game_id,name,kingdom_id,home_alliance,power,mystic_trial,fetched_at,active';
 const guard=(alliance:string,staff:any)=>{if(alliance!=='NRW'||!permission(staff,'fightclub'))throw new HttpError('permission_denied',403);};
 const idValid=(id:string)=>/^\d{1,20}$/.test(id);
 async function fetchPlayer(id:string){
  if(!idValid(id))throw new HttpError('invalid_player_id',400);
  const key=Deno.env.get('KINGSHOTSTATS_API_KEY');if(!key)throw new HttpError('player_provider_unconfigured',503);
  const response=await fetch('https://api.mightpulse.com/v1/players/'+encodeURIComponent(id)+'?include=base,ranks',{headers:{Accept:'application/json',Authorization:'Bearer '+key},signal:AbortSignal.timeout(90000)});
  if(!response.ok)throw new HttpError(response.status===429?'provider_rate_limited':response.status===404?'player_not_found':'player_provider_unavailable',response.status===429?429:response.status===404?404:502);
  const wire=await response.json(),p=wire?.player??wire?.data?.player;
  if(!p||String(p.governor_id??p.fid??p.game_id??'')!==id)throw new HttpError('invalid_provider_response',502);
  if(Number(p.kid??p.kingdom_id)!==1044)throw new HttpError('ssl_guest_requires_kingdom_1044',400);
  const number=(v:any)=>v!==null&&v!==undefined&&v!==''&&Number.isSafeInteger(Number(v))&&Number(v)>=0&&Number(v)<=9999999999999?Number(v):null;
  return {game_id:id,name:String(p.nick_name??p.name??id).slice(0,100),kingdom_id:1044,home_alliance:String(p.alliance?.abbr??p.alliance_abbr??'').slice(0,40),power:number(p.power),mystic_trial:number((wire.ranks??wire.data?.ranks??p.ranks)?.mystic_trial),fetched_at:new Date().toISOString(),active:true};
 }
 async function list(alliance:string){return await checked(db.from('aos_fightclub_ssl_guests').select(fields).eq('alliance_code',alliance).order('name').limit(500));}
 async function eligible(alliance:string,eventType:string,id:string,date:string){
  const member=await checked(db.from('players').select('id').eq('alliance_code',alliance).eq('game_id',id).eq('active',true).maybeSingle());
  if(member)return true;if(eventType!=='swordland_summit')return false;
  const guest=await checked(db.from('aos_fightclub_ssl_guests').select('active').eq('alliance_code',alliance).eq('game_id',id).eq('kingdom_id',1044).maybeSingle());
  if(guest?.active)return true;if(!guest)return false;
  const existing=await checked(db.from('aos_fightclub_assignments').select('game_id').eq('alliance_code',alliance).eq('event_type',eventType).eq('battle_date',date).eq('game_id',id).maybeSingle());return Boolean(existing);
 }
 async function handle(req:Request,alliance:string,userId:string,staff:any,body:any){
  guard(alliance,staff);const action=body?.action,id=String(body?.game_id??'');
  if(action==='ssl_guest_search'){
   const query=String(body?.query??'').trim();if(query.length<2||query.length>80)throw new HttpError('search_requires_2_to_80_characters',400);
   let q=db.from('kingshot_player_cache').select('player_id,name,alliance,kingdom_id,fetched_at').eq('kingdom_id',1044);
   q=idValid(query)?q.eq('player_id',query):q.ilike('name','%'+query.replace(/[\\%_]/g,'\\$&')+'%');
   const rows=await checked(q.order('name').limit(25));return json(req,{ok:true,players:rows.map((p:any)=>({game_id:p.player_id,name:p.name,home_alliance:p.alliance,kingdom_id:p.kingdom_id,fetched_at:p.fetched_at})),source:'kingdom_cache'});
  }
  if(action==='ssl_guest_lookup')return json(req,{ok:true,player:await fetchPlayer(id)});
  if(!idValid(id))throw new HttpError('invalid_player_id',400);
  if(action==='ssl_guest_remove'){
   await checked(db.from('aos_fightclub_ssl_guests').update({active:false,updated_at:new Date().toISOString(),updated_by:userId}).eq('alliance_code',alliance).eq('game_id',id).select('game_id'));
   await audit(alliance,userId,'fightclub_guest',id,'deactivate_ssl');return json(req,{ok:true,removed:true});
  }
  if(action!=='ssl_guest_add')throw new HttpError('invalid_action',400);
  // Revalidate with the provider; never trust client-supplied kingdom/name/stats.
  const player=await fetchPlayer(id),member=await checked(db.from('players').select('id').eq('alliance_code',alliance).eq('game_id',id).eq('active',true).maybeSingle());
  if(member)return json(req,{ok:true,already_member:true});
  const saved=await checked(db.from('aos_fightclub_ssl_guests').upsert({...player,alliance_code:alliance,updated_at:new Date().toISOString(),updated_by:userId},{onConflict:'alliance_code,game_id'}).select(fields).single());
  await audit(alliance,userId,'fightclub_guest',id,'add_ssl');return json(req,{ok:true,player:saved});
 }
 return {handle,list,eligible};
}
