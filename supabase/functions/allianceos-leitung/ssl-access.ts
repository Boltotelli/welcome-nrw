export function createSslAccess({db,auth,checked,HttpError,json,audit,temporaryPassword}:any){
 const fields='user_id,name,login_name,enabled,ssl_read,created_at';
 const event='swordland_summit';
 async function manage(req:Request,alliance:string,actor:string,staff:any,body:any){
  if(alliance!=='NRW'||staff?.is_owner!==true)throw new HttpError('permission_denied',403);
  const action=body?.action;
  if(action==='ssl_viewers_list')return json(req,{ok:true,viewers:await checked(db.from('aos_ssl_viewers').select(fields).eq('alliance_code',alliance).order('created_at',{ascending:false}).limit(100))});
  if(action==='ssl_viewer_create'){
   const name=String(body.name??'').trim();if(!name||name.length>60)throw new HttpError('invalid_guest_name',400);
   const login='ssl-'+crypto.randomUUID().replaceAll('-','').slice(0,16),password=temporaryPassword();
   const {data,error}=await db.auth.admin.createUser({email:login+'@guests.allianceos.invalid',password,email_confirm:true,app_metadata:{source:'allianceos_ssl_readonly'}});
   if(error||!data?.user)throw new HttpError('guest_creation_failed',500);
   try{await checked(db.from('aos_ssl_viewers').insert({alliance_code:alliance,user_id:data.user.id,name,login_name:login,enabled:true,ssl_read:true,created_by:actor}).select(fields).single());}
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
 async function grantFor(alliance:string,userId:string){
  if(alliance!=='NRW')return null;
  const row=await checked(db.from('aos_ssl_viewers').select(fields).eq('alliance_code',alliance).eq('user_id',userId).maybeSingle());
  if(!row)return null;
  if(!row.enabled||!row.ssl_read)throw new HttpError('not_authorized',403);
  return {rank:'Gast',display_name:row.name,permissions:{ssl_read:true},is_owner:false,ssl_readonly:true};
 }
 async function fightData(req:Request,alliance:string,staff:any){
  if(alliance!=='NRW'||staff?.permissions?.ssl_read!==true)throw new HttpError('permission_denied',403);
  const [assignments,mapAssignments,leaders]=await Promise.all([
   checked(db.from('aos_fightclub_assignments').select('event_type,battle_date,game_id,legion,availability,combat_role').eq('alliance_code',alliance).eq('event_type',event).order('battle_date',{ascending:false}).limit(2000)),
   checked(db.from('aos_fightclub_map_assignments').select('event_type,battle_date,game_id,location_key').eq('alliance_code',alliance).eq('event_type',event).limit(2000)),
   checked(db.from('aos_fightclub_team_leaders').select('event_type,battle_date,game_id,legion').eq('alliance_code',alliance).eq('event_type',event).limit(350))
  ]);
  const ids=[...new Set(assignments.map((a:any)=>a.game_id))];let players:any[]=[];
  if(ids.length){
   const [members,guests,scores]=await Promise.all([
    checked(db.from('players').select('game_id,name').eq('alliance_code',alliance).in('game_id',ids)),
    checked(db.from('aos_fightclub_ssl_guests').select('game_id,name,home_alliance,mystic_trial').eq('alliance_code',alliance).in('game_id',ids)),
    checked(db.from('aos_member_power_snapshot').select('game_id,mystic_trial').eq('alliance_code',alliance).in('game_id',ids))
   ]);
   players=ids.map(id=>{const g=guests.find((p:any)=>p.game_id===id),m=members.find((p:any)=>p.game_id===id);return {game_id:id,name:g?.name||m?.name||id,home_alliance:g?.home_alliance||'NRW',mystic_trial:g?.mystic_trial??scores.find((p:any)=>p.game_id===id)?.mystic_trial??null,active:true,member_status:'active'};});
  }
  const has=(x:any)=>assignments.some((a:any)=>a.game_id===x.game_id&&a.battle_date===x.battle_date);
  return {ok:true,cycles:[],assignments,players,powers:players.map(p=>({game_id:p.game_id,power:null,mystic_trial:p.mystic_trial})),guests:[],map_assignments:mapAssignments.filter(has),leaders:leaders.filter(has)};
 }
 async function bootstrap(req:Request,alliance:string,staff:any){
  const data=await fightData(req,alliance,staff),config=await checked(db.from('aos_alliances').select('code,name,kingdom_id,logo_url,default_language,languages').eq('code',alliance).single());
  return json(req,{alliance:config,staff:{rank:staff.rank,display_name:staff.display_name,permissions:{ssl_read:true},is_owner:false,ssl_readonly:true},players:data.players});
 }
 async function grants(alliance:string){
  const rows=await checked(db.from('aos_ssl_viewers').select(fields).eq('alliance_code',alliance).order('name').limit(100));
  return rows.map((r:any)=>({user_id:r.user_id,email:r.login_name+'@guests.allianceos.invalid',name:r.name,rank:'Gast',enabled:r.enabled,permissions:{ssl_read:r.ssl_read},ssl_readonly:true}));
 }
 async function saveGrant(req:Request,alliance:string,actor:string,staff:any,body:any){
  if(alliance!=='NRW'||!staff.is_owner)throw new HttpError('permission_denied',403);
  if(Object.entries(body.permissions||{}).some(([k,v])=>k!=='ssl_read'&&v===true))throw new HttpError('ssl_guest_readonly',400);
  const login=String(body.email||'').split('@')[0];
  if(!/^ssl-[a-f0-9]{16}@guests\.allianceos\.invalid$/.test(String(body.email||'')))throw new HttpError('invalid_guest_login',400);
  const row=await checked(db.from('aos_ssl_viewers').select('user_id').eq('alliance_code',alliance).eq('login_name',login).maybeSingle());
  if(!row)throw new HttpError('guest_not_found',404);
  await checked(db.from('aos_ssl_viewers').update({enabled:body.enabled===true,ssl_read:body.permissions?.ssl_read===true}).eq('alliance_code',alliance).eq('user_id',row.user_id).select('user_id'));
  await audit(alliance,actor,'ssl_viewer',row.user_id,'permissions');return json(req,{ok:true});
 }
 return {manage,grantFor,fightData,bootstrap,grants,saveGrant};
}
