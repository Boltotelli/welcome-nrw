// Owner-created identities use server-written app metadata for their display name.
// Authority always comes from aos_staff, never metadata or a client-supplied role.
export const isManualEmail=(email:string)=>/^manual-[a-f0-9]{24}@accounts\.allianceos\.invalid$/.test(email||'');
export function createManualAccounts({db,checked,HttpError,json,audit,temporaryPassword,permissionKeys}:any){
 async function publicList(alliance:string){
  const rows=await checked(db.from('aos_staff').select('user_id').eq('alliance_code',alliance).eq('enabled',true).eq('rank','R4'));
  const people=await Promise.all(rows.map(async(r:any)=>{const {data,error}=await db.auth.admin.getUserById(r.user_id);const u=data?.user;return !error&&isManualEmail(u?.email)?{name:String(u.app_metadata?.display_name||'').slice(0,60),login_name:u.email.split('@')[0]}:null;}));
  return people.filter((p:any)=>p&&p.name);
 }
 async function removedLeaderIds(alliance:string){
  const rows=await checked(db.from('aos_staff').select('user_id').eq('alliance_code',alliance).eq('disabled_reason','removed'));
  const ids=await Promise.all(rows.map(async(r:any)=>{const {data,error}=await db.auth.admin.getUserById(r.user_id);return !error?/^leader-([0-9]{5,20})@accounts\.allianceos\.invalid$/.exec(data?.user?.email||'')?.[1]:null;}));return ids.filter(Boolean);
 }
 async function handle(req:Request,alliance:string,actor:string,staff:any,body:any){
  if(alliance!=='NRW'||!staff.is_owner)throw new HttpError('permission_denied',403);
  if(body.action==='manual_account_reset'){
   const email=String(body.email||'');if(!isManualEmail(email))throw new HttpError('invalid_account',400);
   const {data,error}=await db.auth.admin.listUsers({page:1,perPage:1000});if(error)throw new HttpError('auth_lookup_failed',500);
   const user=data.users.find((u:any)=>u.email===email);if(!user||user.id===actor)throw new HttpError('invalid_account',400);
   const row=await checked(db.from('aos_staff').select('is_admin,rank').eq('alliance_code',alliance).eq('user_id',user.id).maybeSingle());
   if(!row||row.is_admin||row.rank!=='R4')throw new HttpError('permission_denied',403);
   const password=temporaryPassword();const result=await db.auth.admin.updateUserById(user.id,{password});if(result.error)throw new HttpError('password_reset_failed',500);
   await audit(alliance,actor,'manual_account',user.id,'reset_password');return json(req,{ok:true,password,login_name:email.split('@')[0]});
  }
  const name=String(body.name||'').trim(),module=String(body.module||'');
  if(!name||name.length>60||/[\u0000-\u001f\u007f]/.test(name)||!permissionKeys.includes(module))throw new HttpError('invalid_account',400);
  const permissions=Object.fromEntries(permissionKeys.map((k:string)=>[k,k===module]));
  const login='manual-'+crypto.randomUUID().replaceAll('-','').slice(0,24),email=login+'@accounts.allianceos.invalid',password=temporaryPassword();
  const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{source:'allianceos_manual',display_name:name}});
  if(error||!data?.user)throw new HttpError('account_creation_failed',500);
  const assigned=await db.from('aos_staff').insert({alliance_code:alliance,user_id:data.user.id,rank:'R4',enabled:true,permissions}).select('user_id').single();
  if(assigned.error){await db.auth.admin.deleteUser(data.user.id).catch(()=>{});throw new HttpError('staff_assignment_failed',500);}
  await audit(alliance,actor,'manual_account',data.user.id,'create');return json(req,{ok:true,login_name:login,password});
 }
 return {publicList,removedLeaderIds,handle};
}
