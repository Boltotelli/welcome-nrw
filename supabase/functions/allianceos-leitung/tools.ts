import {createToolsPlayers} from './tools-player.ts';
import {createToolsWorkbench} from './tools-workbench.ts';
import {createToolsGifts} from './tools-gifts.ts';
// Existing tracker records stay read-only; separate Tools runs/profile cache only.
export function createLeadershipTools({db,checked,json,HttpError,permission,audit}:any){
 const players=createToolsPlayers({db,checked,HttpError});
 const workbench=createToolsWorkbench({db,checked,json,HttpError,audit}),gifts=createToolsGifts({db,checked,json,HttpError,audit});
 const validRun=(id:any)=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
 const tags=['NRW','NWO','THM','CWR','PxR','NwO'],periods=['day1','day2','day3','day4','day5','overall'];
 function cleanData(raw:any){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new HttpError('invalid_tools_data',400);
  function integer(value:any,max=Number.MAX_SAFE_INTEGER,min=0){
   if(value===null)return null;
   if(!Number.isSafeInteger(value)||value<min||value>max)throw new HttpError('invalid_tools_number',400);
   return value;
  }
  const title=String(raw.title??'').trim(),date=String(raw.snapshot_date??'');
  if(title.length>100||date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))throw new HttpError('invalid_tools_data',400);
  return {title,snapshot_date:date,alliances:Object.fromEntries(tags.map(tag=>{
   const row=raw.alliances?.[tag];if(!row||!row.scores)throw new HttpError('invalid_tools_data',400);
   return [tag,{power:integer(row.power,Number.MAX_SAFE_INTEGER,1),members:integer(row.members,1000,1),scores:Object.fromEntries(periods.map(p=>[p,integer(row.scores[p])]))}];
  }))};
 }
 async function handle(req:Request,alliance:string,userId:string,staff:any,body:any){
  // This check precedes every database/RPC operation, including lookups by ID.
  if(alliance!=='NRW'||!permission(staff,'tools')||staff.ssl_readonly)throw new HttpError('permission_denied',403);
  if(['tools_documents_load','tools_document_save','tools_document_delete'].includes(body.action))return workbench.handle(req,alliance,userId,body);
  if(['tools_gifts_load','tools_gifts_create','tools_gifts_status','tools_gifts_step'].includes(body.action))return gifts.handle(req,alliance,userId,body);
  if(body.action==='tools_kvk_load'){
   if(body.run_id!=null&&!validRun(body.run_id))throw new HttpError('invalid_tools_run',400);
   let query=db.from('aos_tools_kvk_runs').select('id,data,version,updated_at').eq('alliance_code',alliance);
   query=body.run_id?query.eq('id',body.run_id):query.order('updated_at',{ascending:false}).limit(1);
   const [item,runs]=await Promise.all([checked(query.maybeSingle()),checked(db.from('aos_tools_kvk_runs').select('id,title:data->>title,snapshot_date:data->>snapshot_date,version,updated_at').eq('alliance_code',alliance).order('updated_at',{ascending:false}).limit(1000))]);
   if(body.run_id&&!item)throw new HttpError('tools_run_not_found',404);
   return json(req,{ok:true,item,runs});
  }
  if(body.action==='tools_player_lookup'||body.action==='tools_player_refresh'){
   const id=String(body.game_id??'').trim();
   if(!/^[0-9]{1,20}$/.test(id))throw new HttpError('invalid_player_id',400);
   if(body.action==='tools_player_refresh')return json(req,{ok:true,...await players.refresh(id)});
   return json(req,{ok:true,player:await players.lookup(id)});
  }
  if(body.action==='tools_kvk_save'){
   const data=cleanData(body.data),version=body.version;
   if(!Number.isSafeInteger(version)||version<0)throw new HttpError('invalid_tools_version',400);
   // Cached older clients must never accidentally overwrite a different KvK.
   if(!validRun(body.run_id))throw new HttpError('tools_version_conflict',409);
   const values={data,version:version+1,updated_at:new Date().toISOString(),updated_by:userId};
   const result=version===0?
    await db.from('aos_tools_kvk_runs').insert({...values,id:body.run_id,alliance_code:alliance}).select('id,data,version,updated_at').single():
    await db.from('aos_tools_kvk_runs').update(values).eq('alliance_code',alliance).eq('id',body.run_id).eq('version',version).select('id,data,version,updated_at').maybeSingle();
   if(result.error?.code==='23505'||!result.error&&!result.data)throw new HttpError('tools_version_conflict',409);
   if(result.error)throw new HttpError('database_error',500);
   await audit(alliance,userId,'tools_kvk',body.run_id,'save');
   return json(req,{ok:true,item:result.data});
  }
  throw new HttpError('unknown_action',400);
 }
 return {handle,cleanData};
}
