export const WORKBENCH_TOOLS={notice:'Ankündigungs-Editor',rally:'Rally-Sync',territory:'Gebietskontrolle',gifts:'Geschenkcodes'};
export function duration(value){
 const m=/^(\d{1,3}):([0-5]\d)$/.exec(String(value));
 if(!m)throw Error('Zeiten bitte als Minuten:Sekunden eingeben, z. B. 05:30.');
 return Number(m[1])*60+Number(m[2]);
}
export function rallyPlan(data){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||!/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(data.time))throw Error('Datum und Ankunftszeit vollständig in UTC eingeben.');
 const target=Date.parse(data.date+'T'+data.time+'Z');
 if(!Number.isFinite(target)||new Date(target).toISOString().slice(0,10)!==data.date)throw Error('Ungültiges Datum.');
 const gap=Number(data.gap);if(!Number.isInteger(gap)||gap<0||gap>3600)throw Error('Abstand: 0 bis 3.600 Sekunden.');
 if(!data.leaders?.length||data.leaders.length>100)throw Error('Mindestens einen Rally-Leader eintragen.');
 return data.leaders.map((r,i)=>{
  if(!String(r.name).trim())throw Error('Jeder Rally-Leader braucht einen Namen.');
  const march=duration(r.march),gather=duration(r.gather),arrival=target+i*gap*1000;
  return {...r,start:arrival-(march+gather)*1000,depart:arrival-march*1000,arrival};
 });
}
export const utc=value=>new Date(value).toISOString().replace('T',' ').slice(0,19)+' UTC';
export function rallyText(data){return [data.title||'Rally-Sync',...rallyPlan(data).map(r=>`${r.name} · Start ${utc(r.start)} · Abmarsch ${utc(r.depart)} · Ankunft ${utc(r.arrival)}`)].join('\n');}
export function insertText(text,start,end,before,after=''){
 const insert=before+text.slice(start,end)+after,next=text.slice(0,start)+insert+text.slice(end);
 if(next.length>2000)throw Error('Die Nachricht darf höchstens 2.000 Zeichen enthalten.');
 return {text:next,start:start+before.length,end:start+before.length+end-start};
}
export function coordinateTag(k,x,y){
 if(!/^\d{1,6}$/.test(String(k))||Number(k)<1||![x,y].every(v=>/^\d{1,4}$/.test(String(v))&&Number(v)<=1199))throw Error('Königreich und Koordinaten (0–1199) prüfen.');
 return `<hyl=1>[#${Number(k)} X: ${Number(x)}, Y: ${Number(y)}]</hyl>`;
}
export const OUTPOST_TYPES=['Angriff','Verteidigung','Ausbildung','Sammeln','Forschung','Marsch','Produktion'];
export function outpostSummary(rows){
 const known=rows.filter(r=>r.owned&&r.connected),owned=new Set(known.map(r=>r.type+'|'+r.level));
 return {active:owned.size,disconnected:rows.filter(r=>r.owned&&!r.connected).length,
  missing:OUTPOST_TYPES.flatMap(type=>[1,2,3,4].filter(level=>!owned.has(type+'|'+level)).map(level=>({type,level})))};
}
