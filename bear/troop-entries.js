/* Kingshot squad preview – variable-length troop count extraction.
 * OCR word coordinates are normalised against the ORIGINAL screenshot size.
 * No fixed pixel positions, preselected rows or assumed number of entries.
 * Tier and Truegold icon OCR will be attached to each item separately later.
 */
(function(root){
'use strict';
const labels=['Infanterie','Kavallerie','Bogenschützen'];
const keys=['troopsI','troopsC','troopsA'];
function fold(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLowerCase();}
function kind(s){
 const z=fold(s).replace(/[^a-z]/g,'');
 if(/infant|fussvolk/.test(z))return 0;
 if(/kaval|caval|reiter/.test(z))return 1;
 if(/bogensch|bogen|archer|marksman/.test(z))return 2;
 return -1;
}
function norm(words,w,h){
 if(!(w>0&&h>0))return [];
 return (words||[]).filter(t=>t&&t.bbox&&t.text).map(t=>({
  text:String(t.text).trim(),
  x0:t.bbox.x0/w,x1:t.bbox.x1/w,y0:t.bbox.y0/h,y1:t.bbox.y1/h
 })).filter(t=>t.text&&[t.x0,t.x1,t.y0,t.y1].every(Number.isFinite)&&
  t.x0>=0&&t.y0>=0&&t.x1<=1.02&&t.y1<=1.02&&t.x1>t.x0&&t.y1>t.y0);
}
function count(s){
 const raw=String(s||'').replace(/\s/g,'').replace(/[^0-9.,]/g,'');
 if(!/^(?:\d{4,9}|\d{1,3}(?:[.,]\d{3}){1,3})$/.test(raw))return null;
 const n=Number(raw.replace(/[.,]/g,''));
 return n>=1000&&n<200000000&&Number.isSafeInteger(n)?n:null;
}
function numeric(line){
 const sorted=[...line].sort((a,b)=>a.x0-b.x0);
 let chunks=[],current=[],right=-1;
 for(const w of sorted){
  const t=w.text.replace(/[^0-9.,]/g,'');
  if(!t)continue;
  if(current.length&&w.x0-right>.028){chunks.push(current);current=[];}
  current.push(t);right=w.x1;
 }
 if(current.length)chunks.push(current);
 for(const parts of chunks){
  const value=count(parts.join(''));
  if(value!==null)return value;
 }
 return null;
}
function labelsFound(words){
 const items=[];
 for(const w of words){
  const type=kind(w.text);
  if(type<0||w.y0<.18||w.y0>.88)continue;
  if(items.some(a=>a.type===type&&Math.abs(a.y0-w.y0)<.008&&Math.abs(a.x0-w.x0)<.018))continue;
  items.push({type,label:labels[type],x0:w.x0,y0:w.y0,x1:w.x1,y1:w.y1});
 }
 return items.sort((a,b)=>a.y0-b.y0||a.x0-b.x0);
}
function readBelow(label,words,w,h){
 // The number is on a distinct text baseline below this troop label.
 // All tolerances are fractions of the screenshot; x/y NEVER pixels.
 const xMin=Math.max(0,label.x0-.018),xMax=Math.min(1,label.x0+.265);
 const yMin=label.y1+.002,yMax=Math.min(1,label.y1+Math.max(.027,Math.min(.052,.063*w/h)));
 const nearby=words.filter(a=>{
  const x=(a.x0+a.x1)/2,y=(a.y0+a.y1)/2;
  return x>=xMin&&x<=xMax&&y>=yMin&&y<=yMax&&/[0-9]/.test(a.text);
 });
 const lines=[];
 for(const word of nearby.sort((a,b)=>a.y0-b.y0||a.x0-b.x0)){
  const y=(word.y0+word.y1)/2;
  let line=lines.find(row=>Math.abs(row.y-y)<.009);
  if(!line){line={y,words:[]};lines.push(line);}
  line.words.push(word);
 }
 for(const row of lines.sort((a,b)=>a.y-b.y)){
  const value=numeric(row.words);
  if(value!==null)return value;
 }
 return null;
}
function detect(words,width,height){
 const normalized=norm(words,width,height);
 return labelsFound(normalized).map((label,index)=>{
  const quantity=readBelow(label,normalized,width,height);
  const crop={x:Math.max(0,label.x0-.016),y:Math.min(1,label.y1+.001),
   w:Math.min(.285,1-label.x0+.016),h:Math.min(.051,.064*width/height)};
  return {id:index,type:label.type,label:label.label,count:quantity,
   // One icon per entry (no assumption of a single tier per class).
   icon:{x:Math.max(0,label.x0-.13),y:Math.max(0,label.y0-.018),w:.132,h:.082},
   crop};
 });
}
function totals(entries){
 const values={};for(const e of entries||[]){
  if(e?.count===null||!Number.isInteger(e?.count))continue;
  values[keys[e.type]]=(values[keys[e.type]]||0)+e.count;
 }
 return values;
}
root.NRW_BEAR_TROOP_ENTRIES={detect,totals,count,kind,norm,version:'ratios-dynamic-20261009'};
})(window);
