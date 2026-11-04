import md5 from 'npm:blueimp-md5@2.19.0';
export function giftOutcome(code:number){
 if(code===20000)return {status:'success',retryable:false};
 if(code===40008)return {status:'already',retryable:false};
 if(code===40019)return {status:'failed',retryable:true};
 if([40001,40005,40006,40007,40010,40011,40014,40020].includes(code))return {status:'failed',retryable:false};
 return {status:'unknown',retryable:false};
}
// Public client signing value, not a user credential. No secrets reach the browser.
const publicClientKey='mN4!pQs6JrYwV9';
export function createToolsGifts({db,checked,json,HttpError,audit,fetchImpl=fetch,hash=md5}:any){
 const validId=(x:any)=>typeof x==='string'&&/^\d{1,20}$/.test(x);
 const validRun=(x:any)=>typeof x==='string'&&/^[0-9a-f-]{36}$/i.test(x);
 async function candidates(alliance:string){
  const [members,links,cfg]=await Promise.all([
   checked(db.from('players').select('game_id,name').eq('alliance_code',alliance).eq('active',true).limit(500)),
   checked(db.from('aos_member_account_links').select('alt_game_id,main_game_id,display_name').eq('alliance_code',alliance).limit(500)),
   checked(db.from('aos_alliances').select('kingdom_id').eq('code',alliance).single())]);
  const ids=new Set(members.map((m:any)=>m.game_id));
  return [...members.filter((p:any)=>validId(p.game_id)).map((p:any)=>({...p,kingdom_id:cfg.kingdom_id,external:false})),
   ...links.filter((p:any)=>ids.has(p.main_game_id)&&!ids.has(p.alt_game_id)&&validId(p.alt_game_id)).map((p:any)=>({game_id:p.alt_game_id,name:p.display_name||p.alt_game_id,kingdom_id:null,external:true}))];
 }
 async function run(alliance:string,id:string){
  if(!validRun(id))throw new HttpError('invalid_tools_run',400);
  const r=await checked(db.from('aos_tools_gift_runs').select('id,code,recipients,created_at').eq('alliance_code',alliance).eq('id',id).maybeSingle());
  if(!r)throw new HttpError('tools_run_not_found',404);return r;
 }
 async function handle(req:Request,alliance:string,userId:string,body:any){
  if(body.action==='tools_gifts_load'){
   const runs=await checked(db.from('aos_tools_gift_runs').select('id,code,recipients,created_at').eq('alliance_code',alliance).order('created_at',{ascending:false}).limit(30));
   return json(req,{ok:true,runs,candidates:await candidates(alliance)});
  }
  if(body.action==='tools_gifts_create'){
   const code=String(body.code??'').trim();if(!/^[A-Za-z0-9_.-]{1,80}$/.test(code)||!Array.isArray(body.recipients)||body.recipients.length<1||body.recipients.length>500)throw new HttpError('invalid_gift_run',400);
   const available=await candidates(alliance),seen=new Set(),recipients=body.recipients.map((r:any)=>{
    const player=available.find((p:any)=>p.game_id===r.game_id);
    if(!player||seen.has(r.game_id)||!Number.isInteger(r.kingdom_id)||r.kingdom_id<1||r.kingdom_id>999999)throw new HttpError('invalid_gift_recipient',400);
    seen.add(r.game_id);return {game_id:r.game_id,name:player.name,kingdom_id:r.kingdom_id};
   });
   const item=await checked(db.from('aos_tools_gift_runs').insert({id:crypto.randomUUID(),alliance_code:alliance,code,recipients,created_by:userId}).select('id,code,recipients,created_at').single());
   await audit(alliance,userId,'tools_gift_run',item.id,'create');return json(req,{ok:true,item});
  }
  const item=await run(alliance,body.run_id);
  if(body.action==='tools_gifts_status'){
   // Lost requests are deliberately surfaced as unknown, never silently resumed.
   await checked(db.from('aos_tools_gift_receipts').update({status:'unknown',retryable:false}).eq('alliance_code',alliance).eq('code',item.code).eq('status','processing').lt('updated_at',new Date(Date.now()-120000).toISOString()).select('game_id'));
   const receipts=await checked(db.from('aos_tools_gift_receipts').select('game_id,kingdom_id,status,retryable,provider_code,attempts,updated_at').eq('alliance_code',alliance).eq('code',item.code).in('game_id',item.recipients.map((r:any)=>r.game_id)));
   return json(req,{ok:true,item,receipts});
  }
  if(body.action!=='tools_gifts_step')throw new HttpError('unknown_action',400);
  const recipient=item.recipients.find((r:any)=>r.game_id===body.game_id);if(!recipient)throw new HttpError('invalid_gift_recipient',400);
  const claim=crypto.randomUUID(),reserved=await checked(db.rpc('aos_tools_claim_gift',{p_alliance:alliance,p_code:item.code,p_game_id:recipient.game_id,p_kingdom:recipient.kingdom_id,p_claim:claim,p_retry:body.retry===true}));
  if(!reserved.claimed)return json(req,{ok:true,...reserved});
  let outcome:any={status:'unknown',retryable:false},providerCode=null;
  try{
   const time=Math.floor(Date.now()/1000),sign=hash(`cdk=${item.code}&fid=${recipient.game_id}&kid=${recipient.kingdom_id}&time=${time}`+publicClientKey);
   const response=await fetchImpl('https://kingshot-giftcode.centurygame.com/api/gift_code',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({cdk:item.code,fid:recipient.game_id,kid:String(recipient.kingdom_id),time:String(time),sign}),signal:AbortSignal.timeout(20000)});
   // Only a valid provider reply can confirm success. Transport failures remain unknown.
   if(response.ok){const reply=await response.json();if(Number.isInteger(reply.err_code)){providerCode=reply.err_code;outcome=giftOutcome(providerCode);}}
  }catch{/* Never automatically resend a request whose outcome is uncertain. */}
  await checked(db.from('aos_tools_gift_receipts').update({...outcome,provider_code:providerCode,updated_at:new Date().toISOString()}).eq('alliance_code',alliance).eq('code',item.code).eq('game_id',recipient.game_id).eq('claim_id',claim).select('game_id').single());
  await audit(alliance,userId,'tools_gift_run',item.id,'recipient_'+outcome.status);
  return json(req,{ok:true,...outcome,provider_code:providerCode,pause:outcome.status==='unknown'||providerCode===40019||[40005,40007,40014].includes(providerCode)});
 }
 return {handle,candidates};
}
