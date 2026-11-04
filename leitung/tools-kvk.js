// Law 9: use the unscaled integer values shown in the game throughout.
export const ALLIANCES=['NRW','NWO','THM','CWR','PxR','NwO'];
export const PERIODS=['day1','day2','day3','day4','day5','overall'];
export function parseInteger(raw){
 const text=String(raw??'').trim();
 if(!text)return null;
 if(!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(text))return NaN;
 const value=Number(text.replaceAll('.',''));
 return Number.isSafeInteger(value)&&value>=0?value:NaN;
}
export const formatInteger=value=>value==null?'':Number(value).toLocaleString('de-DE',{maximumFractionDigits:0});
export const formatScore=value=>value.toLocaleString('de-DE',{minimumFractionDigits:3,maximumFractionDigits:3,useGrouping:false});
export function blankKvk(){return {title:'',snapshot_date:'',alliances:Object.fromEntries(ALLIANCES.map(tag=>[tag,{power:null,members:null,scores:Object.fromEntries(PERIODS.map(p=>[p,null]))}]))};}
export function rankKvk(data,period){
 const rows=ALLIANCES.map(tag=>{
  const row=data.alliances[tag],points=row.scores[period];
  const valid=Number.isSafeInteger(row.power)&&row.power>0&&Number.isSafeInteger(row.members)&&row.members>0&&Number.isSafeInteger(points)&&points>=0;
  return {tag,score:valid?points/(row.power**0.7*row.members**0.3):null};
 }).filter(r=>r.score!==null).sort((a,b)=>b.score-a.score||ALLIANCES.indexOf(a.tag)-ALLIANCES.indexOf(b.tag));
 rows.forEach((row,i)=>row.rank=i&&row.score===rows[i-1].score?rows[i-1].rank:i+1);
 return {rows,complete:rows.length===ALLIANCES.length,text:rows.map(r=>`${r.rank}. ${r.tag} - ${formatScore(r.score)}`).join('\n')};
}
