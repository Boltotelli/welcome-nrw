// All source records are read-only. Only the separate KvK workspace is writable.
export function createLeadershipTools({db,checked,json,HttpError,permission,audit}:any){
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
  if(body.action==='tools_kvk_load'){
   const item=await checked(db.from('aos_tools_kvk_state').select('data,version,updated_at').eq('alliance_code',alliance).maybeSingle());
   return json(req,{ok:true,item});
  }
  if(body.action==='tools_player_lookup'){
   const id=String(body.game_id??'').trim();
   if(!/^[0-9]{1,20}$/.test(id))throw new HttpError('invalid_player_id',400);
   const player=await checked(db.rpc('aos_tools_player_lookup',{p_game_id:id}));
   return json(req,{ok:true,player});
  }
  if(body.action==='tools_kvk_save'){
   const data=cleanData(body.data),version=body.version;
   if(!Number.isSafeInteger(version)||version<0)throw new HttpError('invalid_tools_version',400);
   const values={data,version:version+1,updated_at:new Date().toISOString(),updated_by:userId};
   const result=version===0?
    await db.from('aos_tools_kvk_state').insert({...values,alliance_code:alliance}).select('data,version,updated_at').single():
    await db.from('aos_tools_kvk_state').update(values).eq('alliance_code',alliance).eq('version',version).select('data,version,updated_at').maybeSingle();
   if(result.error?.code==='23505'||!result.error&&!result.data)throw new HttpError('tools_version_conflict',409);
   if(result.error)throw new HttpError('database_error',500);
   await audit(alliance,userId,'tools_kvk',alliance,'save');
   return json(req,{ok:true,item:result.data});
  }
  throw new HttpError('unknown_action',400);
 }
 return {handle,cleanData};
}
