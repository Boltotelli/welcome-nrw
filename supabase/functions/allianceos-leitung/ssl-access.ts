export function createSslAccess({db,auth,checked,HttpError,json,audit,temporaryPassword}:any){
 const fields='user_id,name,login_name,enabled,created_at';
 const event='swordland_summit';
 async function viewer(req:Request,alliance:string){
  if(alliance!=='NRW')throw new HttpError('permission_denied',403);
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!token)throw new HttpError('authentication_required',401);
  const {data,error}=await auth.auth.getUser(token);
  if(error||!data?.user||data.user.is_anonymous)throw new HttpError('invalid_session',401);
  const row=await checked(db.from('aos_ssl_viewers').select(fields).eq('alliance_code',alliance).eq('user_id',data.user.id).maybeSingle());
  if(!row?.enabled)throw new HttpError('permission_denied',403);
  return row;
 }
 async function read(req:Request,alliance:string){
  const user=await viewer(req,alliance),u=new URL(req.url);
  const dates=await checked(db.from('aos_fightclub_assignments').select('battle_date').eq('alliance_code',alliance).eq('event_type',event).order('battle_date',{ascending:false}).limit(2000));
  const available=[...new Set(dates.map((x:any)=>x.battle_date))];
  const date=u.searchParams.get('date')||available[0]||'';
  if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))throw new HttpError('invalid_date',400);
  if(!date)return json(req,{ok:true,name:user.name,date:'',dates:[],players:[],assignments:[],map_assignments:[],leaders:[]});
  // Explicit allowlists: never select notes, dossiers, attendance flags or other events.
  const [assignments,mapAssignments,leaders]=await Promise.all([
   checked(db.from('aos_fightclub_assignments').select('game_id,legion,availability,combat_role').eq('alliance_code',alliance).eq('event_type',event).eq('battle_date',date).limit(500)),
   checked(db.from('aos_fightclub_map_assignments').select('game_id,location_key').eq('alliance_code',alliance).eq('event_type',event).eq('battle_date',date).limit(500)),
   checked(db.from('aos_fightclub_team_leaders').select('game_id,legion').eq('alliance_code',alliance).eq('event_type',event).eq('battle_date',date).limit(2))
  ]);
  const ids=assignments.map((x:any)=>x.game_id);
  let players:any[]=[];
  if(ids.length){
   const [members,guests,scores]=await Promise.all([
    checked(db.from('players').select('game_id,name').eq('alliance_code',alliance).in('game_id',ids)),
    checked(db.from('aos_fightclub_ssl_guests').select('game_id,name,home_alliance,mystic_trial').eq('alliance_code',alliance).in('game_id',ids)),
    checked(db.from('aos_member_power_snapshot').select('game_id,mystic_trial').eq('alliance_code',alliance).in('game_id',ids))
   ]);
   players=ids.map((id:string)=>{const g=guests.find((p:any)=>p.game_id===id),m=members.find((p:any)=>p.game_id===id);return {game_id:id,name:g?.name||m?.name||id,home_alliance:g?.home_alliance||'NRW',mystic_trial:g?.mystic_trial??scores.find((p:any)=>p.game_id===id)?.mystic_trial??null};});
  }
  return json(req,{ok:true,name:user.name,date,dates:available,players,assignments,map_assignments:mapAssignments.filter((x:any)=>ids.includes(x.game_id)),leaders:leaders.filter((x:any)=>ids.includes(x.game_id))});
 }
 async function manage(req:Request,alliance:string,actor:string,staff:any,body:any){
  if(alliance!=='NRW'||staff?.is_owner!==true)throw new HttpError('permission_denied',403);
  const action=body?.action;
  if(action==='ssl_viewers_list')return json(req,{ok:true,viewers:await checked(db.from('aos_ssl_viewers').select(fields).eq('alliance_code',alliance).order('created_at',{ascending:false}).limit(100))});
  if(action==='ssl_viewer_create'){
   const name=String(body.name??'').trim();if(!name||name.length>60)throw new HttpError('invalid_guest_name',400);
   const login='ssl-'+crypto.randomUUID().replaceAll('-','').slice(0,16),password=temporaryPassword();
   const {data,error}=await db.auth.admin.createUser({email:login+'@guests.allianceos.invalid',password,email_confirm:true,app_metadata:{source:'allianceos_ssl_readonly'}});
   if(error||!data?.user)throw new HttpError('guest_creation_failed',500);
   try{await checked(db.from('aos_ssl_viewers').insert({alliance_code:alliance,user_id:data.user.id,name,login_name:login,enabled:true,created_by:actor}).select(fields).single());}
   catch(e){await db.auth.admin.deleteUser(data.user.id).catch(()=>{});throw e;}
   await audit(alliance,actor,'ssl_viewer',data.user.id,'create');
   return json(req,{ok:true,login_name:login,password});
  }
  const row=await checked(db.from('aos_ssl_viewers').select(fields).eq('alliance_code',alliance).eq('user_id',String(body.user_id??'')).maybeSingle());
  if(!row)throw new HttpError('guest_not_found',404);
  if(action==='ssl_viewer_toggle'){
   if(typeof body.enabled!=='boolean')throw new HttpError('invalid_enabled',400);
   await checked(db.from('aos_ssl_viewers').update({enabled:body.enabled}).eq('alliance_code',alliance).eq('user_id',row.user_id).select('user_id'));
   await audit(alliance,actor,'ssl_viewer',row.user_id,body.enabled?'enable':'disable');return json(req,{ok:true});
  }
  if(action==='ssl_viewer_reset'){
   const password=temporaryPassword(),{error}=await db.auth.admin.updateUserById(row.user_id,{password});
   if(error)throw new HttpError('guest_reset_failed',500);
   await audit(alliance,actor,'ssl_viewer',row.user_id,'reset_password');return json(req,{ok:true,login_name:row.login_name,password});
  }
  throw new HttpError('invalid_action',400);
 }
 return {read,manage};
}
