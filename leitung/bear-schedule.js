// Event planning overrides display times, never the immutable assignment keys.
export function bearScheduleSlots(slots,remoteCycles=[],localCycles=[]){
 const cycles=new Map();
 for(const row of [...remoteCycles,...localCycles]){
  if(!/^bear-[123]$/.test(row.group_key||''))continue;
  const old=cycles.get(row.group_key),a=Date.parse(old?.updated_at||''),b=Date.parse(row.updated_at||'');
  if(!old||!Number.isFinite(a)||Number.isFinite(b)&&b>=a)cycles.set(row.group_key,row);
 }
 const legacy={NRW_1700:1,NRW_1830:2};
 return slots.map((slot,index)=>{
  const number=legacy[slot.slot_key]||Number(/^bear-([123])$/.exec(slot.slot_key||'')?.[1])||Number(/\bBT\s*([123])\b/i.exec(slot.slot_label||'')?.[1])||index+1;
  const cycle=cycles.get('bear-'+number),time=String(cycle?.start_time_utc||'');
  if(cycle?.enabled===false)return null;
  const valid=cycle?.enabled===true&&cycle?.override_schedule===true&&/^([01]\d|2[0-3]):[0-5]\d(:00)?$/.test(time);
  return {...slot,slot_number:number,slot_label:slot.slot_label||'BT'+number,
   ...(valid?{start_time:time.slice(0,5)+':00',timezone:'UTC',anchor_date:cycle.anchor_date}:{} )};
 }).filter(Boolean).sort((a,b)=>a.slot_number-b.slot_number);
}
