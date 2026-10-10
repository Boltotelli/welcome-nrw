/* Kingshot hero roster level OCR evidence, independent of hero-name matching.
 * Localized Lv. evidence is a usable suggestion even if the other passes miss.
 * Confirmed values require agreement; numeric-only OCR is restricted to the
 * tightly cropped digit location, never arbitrary numbers on a hero card.
 */
(function(root){
'use strict';
function parse(text){
 const normalized=String(text||'').replace(/\b([IL])v\b/gi,'Lv')
  .replace(/(?<=\d)[oO](?=\b)/g,'0');
 const hits=[...normalized.matchAll(/\b(?:Lv|Level)\s*\.?\s*(\d{1,3})(?!\d)/gi)]
  .map(m=>Number(m[1])).filter(n=>Number.isInteger(n)&&n>=1&&n<=80);
 return hits.length===1?hits[0]:null;
}
function lineInRect(words,rect){
 // Only the strip that actually contains "Lv." within an entire hero card.
 // Do not allow unrelated numbers from the portrait, stars or next column.
 return (words||[]).filter(w=>w.bbox&&
  (w.bbox.x0+w.bbox.x1)/2>=rect.x+rect.w*.04&&
  (w.bbox.x0+w.bbox.x1)/2<=rect.x+rect.w*.79&&
  (w.bbox.y0+w.bbox.y1)/2>=rect.y+rect.h*.69&&
  (w.bbox.y0+w.bbox.y1)/2<=rect.y+rect.h*.87)
  .sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' ');
}
function parseDigits(text){
 // Used ONLY for the cropped digit-only box, never for a screenshot or HUD.
 const clean=String(text||'').trim();
 if(!/^\\s*[.,:|\\s-]*(?:[1-9]|[1-7]\\d|80)[.,:|\\s-]*$/.test(clean))return null;
 const match=clean.match(/\\d{1,2}/);
 return match?Number(match[0]):null;
}
function best(evidence){
 const votes=new Map();
 for(const entry of evidence||[]){
  if(!Number.isInteger(entry.value)||entry.value<1||entry.value>80)continue;
  const source=String(entry.source||'');
  const set=votes.get(entry.value)||new Set();set.add(source);votes.set(entry.value,set);
 }
 const ranked=[...votes].map(([value,sources])=>({value,n:sources.size}))
  .sort((a,b)=>b.n-a.n);
 if(!ranked.length)return {level:null,confidence:'unknown'};
 // The former minimum-two rule hid even clearly read "Lv. 80" labels.
 if(ranked.length===1)return {level:ranked[0].value,
  confidence:ranked[0].n>=2?'verified':'suggested'};
 // Conflicting independent readings require consensus or human review.
 if(ranked[0].n>=3&&ranked[1].n===1)
  return {level:ranked[0].value,confidence:'verified'};
 return {level:null,confidence:'conflict'};
}
function record(tile,text,source,mode='label'){
 const value=mode==='digits'?parseDigits(text):parse(text);
 if(!Array.isArray(tile.levelEvidence))tile.levelEvidence=[];
 if(value!==null&&!tile.levelEvidence.some(e=>e.source===source))
  tile.levelEvidence.push({source,value,mode});
 const resolved=best(tile.levelEvidence);
 if(!tile.levelManual){
  tile.level=resolved.level;
  tile.levelConfidence=resolved.confidence;
 }
 return value;
}
function combine(a,b){
 if(!a||!b)return false;
 const previous=a.level;
 const next=Array.isArray(b.levelEvidence)?b.levelEvidence:[];
 if(!Array.isArray(a.levelEvidence))a.levelEvidence=[];
 for(const e of next){
  if(!a.levelEvidence.some(x=>x.source===e.source))
   a.levelEvidence.push({...e});
 }
 const choice=best(a.levelEvidence);
 if(!a.levelManual){
  a.level=choice.level;
  a.levelConfidence=choice.confidence;
 }
 return previous!==a.level;
}
root.NRW_BEAR_HERO_LEVEL={parse,parseDigits,lineInRect,record,best,combine,version:'strict-crop-suggest-20261010-2'};
})(window);
