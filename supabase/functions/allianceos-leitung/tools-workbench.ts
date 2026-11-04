// Separate documents, no writes to players, laws, bot schedules or existing KvKs.
export function createToolsWorkbench({db,checked,json,HttpError,audit}:any){
 const uuid=(s:any)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
 const fields='id,kind,title,data,version,updated_at,updated_by';
 function clean(body:any){
  if(!['notice','rally','territory'].includes(body.kind)||!uuid(body.id)||!Number.isSafeInteger(body.version)||body.version<0)throw new HttpError('invalid_tools_document',400);
  if(typeof body.title!=='string'||!body.title.trim()||body.title.length>100||!body.data||typeof body.data!=='object'||Array.isArray(body.data)||JSON.stringify(body.data).length>100000)throw new HttpError('invalid_tools_document',400);
  if(body.kind==='notice'&&(typeof body.data.text!=='string'||body.data.text.length>2000||!['alliance','chat'].includes(body.data.mode)))throw new HttpError('invalid_tools_document',400);
  const d=body.data,text=(v:any,max:number)=>{if(typeof v!=='string'||v.length>max)throw new HttpError('invalid_tools_document',400);return v;};
  const date=(v:any)=>{text(v,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw new HttpError('invalid_tools_document',400);return v;};
  let data:any;
  if(body.kind==='notice')data={mode:d.mode,text:d.text};
  if(body.kind==='rally'){
   if(!Array.isArray(d.leaders)||d.leaders.length<1||d.leaders.length>100||!Number.isInteger(Number(d.gap))||Number(d.gap)<0||Number(d.gap)>3600||!/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(d.time))throw new HttpError('invalid_tools_document',400);
   data={date:date(d.date),time:d.time,gap:Number(d.gap),leaders:d.leaders.map((r:any)=>{const name=text(r.name,80).trim(),gather=text(r.gather,6),march=text(r.march,6);if(!name||![gather,march].every(v=>/^\d{1,3}:[0-5]\d$/.test(v)))throw new HttpError('invalid_tools_document',400);return {name,gather,march};})};
  }
  if(body.kind==='territory'){
   if(d.phase!==''&&(!Number.isInteger(Number(d.phase))||Number(d.phase)<1||Number(d.phase)>8)||!d.sites||Array.isArray(d.sites)||typeof d.sites!=='object'||!Array.isArray(d.outposts)||d.outposts.length>200)throw new HttpError('invalid_tools_document',400);
   const sites=Object.fromEntries(Object.entries(d.sites).map(([key,s]:any)=>{if(!/^(sanc-([1-9]|1[0-2])|fort-[1-4])$/.test(key)||!s||typeof s!=='object')throw new HttpError('invalid_tools_document',400);return [key,{assigned:text(s.assigned??'',40),holder:text(s.holder??'',40),reward:text(s.reward??'',300)}];}));
   data={date:date(d.date),phase:d.phase===''?'':Number(d.phase),lawNote:text(d.lawNote,1000),selectionOrder:text(d.selectionOrder,500),sites,outposts:d.outposts.map((o:any)=>{if(!['Angriff','Verteidigung','Ausbildung','Sammeln','Forschung','Marsch','Produktion'].includes(o.type)||![1,2,3,4].includes(o.level)||typeof o.owned!=='boolean'||typeof o.connected!=='boolean')throw new HttpError('invalid_tools_document',400);return {name:text(o.name,100),type:o.type,level:o.level,owned:o.owned,connected:o.connected};})};
  }
  return {title:body.title.trim(),data};
 }
 async function handle(req:Request,alliance:string,userId:string,body:any){
  if(body.action==='tools_documents_load'){
   const documents=await checked(db.from('aos_tools_documents').select(fields).eq('alliance_code',alliance).order('updated_at',{ascending:false}).limit(500));
   const laws=await checked(db.from('aos_law_publications').select('number,title,body,version').eq('alliance_code',alliance).eq('scope','kingdom').in('number',['8','9']));
   return json(req,{ok:true,documents,laws});
  }
  const values=clean(body);
  if(body.action==='tools_document_delete'){
   const removed=await checked(db.from('aos_tools_documents').delete().eq('alliance_code',alliance).eq('kind',body.kind).eq('id',body.id).eq('version',body.version).select('id').maybeSingle());
   if(!removed)throw new HttpError('tools_document_conflict',409);
   await audit(alliance,userId,'tools_document',body.id,'delete');return json(req,{ok:true});
  }
  if(body.action!=='tools_document_save')throw new HttpError('unknown_action',400);
  const item={...values,version:body.version+1,updated_by:userId,updated_at:new Date().toISOString()};
  const result=body.version===0?await db.from('aos_tools_documents').insert({...item,alliance_code:alliance,id:body.id,kind:body.kind}).select(fields).single():await db.from('aos_tools_documents').update(item).eq('alliance_code',alliance).eq('kind',body.kind).eq('id',body.id).eq('version',body.version).select(fields).maybeSingle();
  if(result.error?.code==='23505'||!result.error&&!result.data)throw new HttpError('tools_document_conflict',409);
  if(result.error)throw new HttpError('database_error',500);
  await audit(alliance,userId,'tools_document',body.id,'save');return json(req,{ok:true,item:result.data});
 }
 return {handle,clean};
}
