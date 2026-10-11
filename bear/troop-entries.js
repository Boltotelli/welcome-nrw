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
 if(/kaval|caval|caballer|reiter/.test(z))return 1;
 if(/bogensch|bogen|archer|arquero|tireur|marksman/.test(z))return 2;
 return -1;
}
function norm(words,w,h){
 if(!(w>0&&h>0))return [];
 const mapped=(words||[]).filter(t=>t&&t.bbox&&t.text).map(t=>({
  text:String(t.text).trim(),
  x0:t.bbox.x0/w,x1:t.bbox.x1/w,y0:t.bbox.y0/h,y1:t.bbox.y1/h
 })).filter(t=>t.text&&[t.x0,t.x1,t.y0,t.y1].every(Number.isFinite)&&
  t.x0>=0&&t.y0>=0&&t.x1<=1.02&&t.y1<=1.02&&t.x1>t.x0&&t.y1>t.y0);
 // The same word is produced once by whole-screen OCR and again by a
 // focused column pass. Deduplicate in relative coordinates BEFORE joining
 // fragments; otherwise 626.621 + 626.621 becomes one invalid token.
 const result=[];
 for(const t of mapped){
  const duplicate=result.some(p=>p.text===t.text&&
   Math.abs(p.x0-t.x0)<.018&&Math.abs(p.y0-t.y0)<.009&&
   Math.abs(p.x1-t.x1)<.018);
  if(!duplicate)result.push(t);
 }
 return result;
}
function count(s){
 const raw=String(s||'').replace(/\s/g,'').replace(/[^0-9.,]/g,'');
 if(!/^(?:\d{1,9}|\d{1,3}(?:[.,]\d{3}){1,3})$/.test(raw))return null;
 const n=Number(raw.replace(/[.,]/g,''));
 return n>=1&&n<200000000&&Number.isSafeInteger(n)?n:null;
}
function readTextCount(text){
 // Individual cropped OCR may contain a title and a separate amount.
 // Prefer full thousands-grouped numbers and longer complete amounts over
 // small stray numeral characters from the troop icon.
 const lines=String(text||'').split(/\n+/).map(t=>t.trim()).filter(Boolean);
 const candidates=[];
 for(const line of lines){
  for(const m of line.matchAll(/\d{1,3}(?:[.,\s]\d{3}){1,3}|\d{1,9}/g)){
   const n=count(m[0]);
   if(n!==null)candidates.push({n,digits:String(n).length,grouped:/[.,\s]/.test(m[0])});
  }
 }
 candidates.sort((a,b)=>Number(b.grouped)-Number(a.grouped)||b.digits-a.digits);
 return candidates[0]?.digits>=3?candidates[0].n:null;
}
function numeric(line){
 const sorted=[...line].sort((a,b)=>a.x0-b.x0);
 const chunks=[];let current=[],end=-1;
 for(const w of sorted){
  const part=String(w.text).replace(/[^0-9.,]/g,'');
  if(!part)continue;
  if(current.length&&w.x0-end>.027){chunks.push(current);current=[];}
  current.push(part);end=w.x1;
 }
 if(current.length)chunks.push(current);
 // OCR splits 325 . 027 across word boundaries. Prefer the joined
 // grouped count, not the nearby digit of a troop badge.
 const parsed=chunks.map(parts=>({
  raw:parts.join(''),value:count(parts.join(''))
 })).filter(x=>x.value!==null);
 parsed.sort((a,b)=>Number(/[.,]/.test(b.raw))-Number(/[.,]/.test(a.raw))||
  String(b.value).length-String(a.value).length);
 return parsed[0]?.value??null;
}
function labelsFound(words){
 // OCR occasionally splits "Infanterie" into "Infan" + "terie".
 // Combine adjacent title fragments on the SAME horizontal line, but
 // never merge the two troop columns or the quantity below the title.
 const rows=[];
 for(const w of words.filter(w=>w.y0>=.18&&w.y0<=.88)
  .sort((a,b)=>(a.y0+a.y1)-(b.y0+b.y1)||a.x0-b.x0)){
  const mid=(w.y0+w.y1)/2;
  let row=rows.find(r=>Math.abs(r.y-mid)<.008);
  if(!row){row={y:mid,words:[]};rows.push(row);}
  row.words.push(w);
 }
 const items=[];
 for(const row of rows){
  const sorted=row.words.sort((a,b)=>a.x0-b.x0),segments=[];
  for(const w of sorted){
   const current=segments[segments.length-1];
   if(!current||w.x0-current[current.length-1].x1>.042)segments.push([w]);
   else current.push(w);
  }
  for(const segment of segments){
   const phrase=segment.map(w=>w.text).join('');
   const type=kind(phrase);
   if(type<0)continue;
   const x0=Math.min(...segment.map(w=>w.x0)),x1=Math.max(...segment.map(w=>w.x1)),
    y0=Math.min(...segment.map(w=>w.y0)),y1=Math.max(...segment.map(w=>w.y1));
   if(items.some(a=>a.type===type&&Math.abs(a.y0-y0)<.012&&Math.abs(a.x0-x0)<.045))continue;
   items.push({type,label:labels[type],title:segment.map(w=>w.text).join(' '),x0,y0,x1,y1});
  }
 }
 return items.sort((a,b)=>a.y0-b.y0||a.x0-b.x0);
}
function readBelow(label,words,w,h){
 // The count sits just BELOW its own label, never at a hardcoded screen
 // row. Distances scale with the detected OCR text height.
 const height=Math.max(label.y1-label.y0,.008);
 const xMin=Math.max(0,label.x0-.016);
 const xMax=Math.min(1,Math.max(label.x1+.055,label.x0+.17));
 const yMin=label.y1+.001;
 const yMax=Math.min(1,label.y1+Math.max(.022,height*3.5));
 const nearby=words.filter(a=>{
  const x=(a.x0+a.x1)/2,y=(a.y0+a.y1)/2;
  return x>=xMin&&x<=xMax&&y>=yMin&&y<=yMax&&/[0-9]/.test(a.text);
 });
 const lines=[];
 for(const word of nearby.sort((a,b)=>a.y0-b.y0||a.x0-b.x0)){
  const y=(word.y0+word.y1)/2;
  let row=lines.find(r=>Math.abs(r.y-y)<Math.max(.006,height*.55));
  if(!row){row={y,words:[]};lines.push(row);}
  row.words.push(word);
 }
 for(const row of lines.sort((a,b)=>a.y-b.y)){
  const n=numeric(row.words);
  if(n!==null)return n;
 }
 return null;
}
function cropAroundLabel(label){
 const h=Math.max(.01,label.y1-label.y0);
 return {x:Math.max(0,label.x0-.014),y:Math.max(0,label.y1+.002),
  w:Math.max(.17,Math.min(.37,Math.max(label.x1+.075,label.x0+.18)-label.x0)),
  h:Math.max(.023,Math.min(.061,h*3.5))};
}
function detect(words,width,height){
 const normalized=norm(words,width,height);
 return labelsFound(normalized).map((label,index)=>{
  const quantity=readBelow(label,normalized,width,height);
  const crop=cropAroundLabel(label);
  const fontHeight=Math.max(.008,label.y1-label.y0);
  const iconWidth=Math.min(.16,Math.max(.095,fontHeight*13));
  return {id:index,type:label.type,label:label.label,count:quantity,
   // Each badge region is derived from its OWN troop heading, not
   // an absolute screen position or the number of entries.
   title:label.title||'',labelBox:{x:label.x0,y:label.y0,w:label.x1-label.x0,h:label.y1-label.y0},
   icon:{x:Math.max(0,label.x0-iconWidth),y:Math.max(0,label.y0-fontHeight*1.7),
    w:iconWidth,h:Math.max(.055,fontHeight*8.5)},
   crop};
 });
}
// Disagreeing independent readings are NOT grounds to copy a quantity
// from one troop type to another. Leave suspect fields blank for review.
function flagAmbiguousCounts(entries,focused){
 const byType=new Map();
 for(const entry of entries||[]){
  if(Number.isInteger(entry.type)&&entry.type>=0&&entry.type<3){
   const list=byType.get(entry.type)||[];list.push(entry);byType.set(entry.type,list);
  }
 }
 for(const [type,list] of byType){
  if(list.length!==1)continue;
  const entry=list[0],independent=focused?.[keys[type]];
  if(entry.count!==null&&entry.count!==undefined&&
     (!Number.isSafeInteger(entry.count)||entry.count<1000)){
   entry.count=null;entry.uncertainCount=true;entry.countWarning='badge-digit';
   continue;
  }
  if(Number.isSafeInteger(independent)&&independent>=1000&&
     Number.isSafeInteger(entry.count)&&entry.count!==independent){
   // Text beneath a detected class heading is more useful than an absolute
   // pixel crop, but disagreement means we cannot choose safely.
   entry.count=null;entry.uncertainCount=true;entry.countWarning='conflicting-ocr';
  }
 }
 const byNumber=new Map();
 for(const entry of entries||[]){
  if(!Number.isSafeInteger(entry.count)||entry.count<1000)continue;
  const prev=byNumber.get(entry.count);
  if(prev&&prev.type!==entry.type){
   for(const e of [prev,entry]){
    e.uncertainCount=true;e.countWarning='duplicate-count-different-class';
    e.count=null;
   }
  }else byNumber.set(entry.count,entry);
 }
 // Two genuinely equal troop totals are possible: flag the duplication
 // visibly for confirmation rather than silently replacing actual values.
 return entries;
}
function recoverSingleEntries(entries,fallback){
 // The focused numeric strip and the roster-label OCR are independent.
 // Never let a failed label-specific OCR erase a known focused count when
 // exactly one entry per class was found. For mixed tiers this fallback is
 // forbidden: a class may contain multiple independent amounts.
 if(entries.length!==3||new Set(entries.map(e=>e.type)).size!==3)return entries;
 for(const e of entries){
  const key=keys[e.type],n=fallback?.[key];
  if(!e.uncertainCount&&(e.count===null||e.count===undefined)&&Number.isSafeInteger(n)&&n>=1000){
   e.count=n;e.amountSource='focused-strip';
  }
 }
 return entries;
}
function totals(entries){
 const values={},invalid=new Set();
 for(const e of entries||[]){
  if(!Number.isInteger(e?.type)||e.type<0||e.type>2)continue;
  const key=keys[e.type];
  if(!Number.isInteger(e.count)||e.count<1){invalid.add(key);continue;}
  values[key]=(values[key]||0)+e.count;
 }
 // A group with one unreadable row must not silently become a partial sum.
 for(const key of invalid)delete values[key];
 return values;
}
root.NRW_BEAR_TROOP_ENTRIES={detect,totals,count,readTextCount,flagAmbiguousCounts,recoverSingleEntries,kind,norm,version:'anchored-entry-20261011-1'};
})(window);
