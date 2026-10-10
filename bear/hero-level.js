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
 if(!/^\s*[.,:|\s-]*(?:[1-9]|[1-7]\d|80)[.,:|\s-]*$/.test(clean))return null;
 const match=clean.match(/\d{1,2}/);
 return match?Number(match[0]):null;
}
// Match only verified glyph topologies from actual Kingshot HUD samples:
// "1" is one narrow solid component; "80" has two wide components whose
// enclosed-hole counts are 2 (eight) and 1 (zero). Other levels still use OCR.
// No artwork or screenshots are shipped: only simple glyph geometry.
function classifyMask(mask,w=47,h=29){
 if(!mask||mask.length!==w*h)return null;
 const visited=new Uint8Array(w*h),found=[],neighbors8=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
 function countHoles(points,minx,miny,maxx,maxy){
  const ww=maxx-minx+3,hh=maxy-miny+3;
  const area=new Uint8Array(ww*hh),seen=new Uint8Array(ww*hh);
  for(const p of points){const x=p%w-minx+1,y=Math.floor(p/w)-miny+1;area[y*ww+x]=1;}
  const offsets=[[-1,0],[1,0],[0,-1],[0,1]];
  const flood=(start)=>{
   const q=[start];seen[start]=1;
   for(let k=0;k<q.length;k++){
    const v=q[k],x=v%ww,y=Math.floor(v/ww);
    for(const [dx,dy] of offsets){
     const xx=x+dx,yy=y+dy,j=yy*ww+xx;
     if(xx>=0&&xx<ww&&yy>=0&&yy<hh&&!area[j]&&!seen[j]){
      seen[j]=1;q.push(j);
     }
    }
   }
  };
  flood(0);
  let holes=0;
  for(let j=0;j<area.length;j++)if(!area[j]&&!seen[j]){
   holes++;flood(j);
  }
  return holes;
 }
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const id=y*w+x;
  if(!mask[id]||visited[id])continue;
  visited[id]=1;
  const points=[id];let minx=x,maxx=x,miny=y,maxy=y;
  for(let j=0;j<points.length;j++){
   const p=points[j],px=p%w,py=Math.floor(p/w);
   for(const [dx,dy] of neighbors8){
    const xx=px+dx,yy=py+dy,q=yy*w+xx;
    if(xx>=0&&yy>=0&&xx<w&&yy<h&&mask[q]&&!visited[q]){
     visited[q]=1;points.push(q);
     if(xx<minx)minx=xx;if(xx>maxx)maxx=xx;
     if(yy<miny)miny=yy;if(yy>maxy)maxy=yy;
    }
   }
  }
  const bw=maxx-minx+1,bh=maxy-miny+1;
  // Ignore the level separator dot, armor, hands and advancement arrows.
  if(minx<7||miny<5||maxy<19||bh<12||bh>21||
    bw<5||bw>16||points.length<28)continue;
  found.push({x:minx,y:miny,w:bw,h:bh,holes:countHoles(points,minx,miny,maxx,maxy)});
 }
 found.sort((a,b)=>a.x-b.x);
 if(found.length===1){
  const c=found[0];
  return c.w<=9&&c.h>=12&&c.holes===0?1:null;
 }
 if(found.length===2){
  const [a,b]=found;
  return a.w>=10&&b.w>=10&&a.holes===2&&b.holes===1&&
   b.x-a.x>=11&&b.x-a.x<=17&&Math.abs(a.y-b.y)<=3?80:null;
 }
 return null;
}
function visual(canvas,rect){
 if(typeof document==='undefined'||!canvas||!rect)return null;
 try{
  const c=document.createElement('canvas');c.width=47;c.height=29;
  const cx=c.getContext('2d',{willReadFrequently:true});
  cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
  cx.drawImage(canvas,rect.x+rect.w*.295,rect.y+rect.h*.745,
   rect.w*.315,rect.h*.11,0,0,47,29);
  const rgb=cx.getImageData(0,0,47,29).data,mask=new Uint8Array(47*29);
  for(let p=0,i=0;p<rgb.length;p+=4,i++){
   const r=rgb[p],g=rgb[p+1],b=rgb[p+2];
   mask[i]=(r>183&&g>171&&b>154)||
    (r>181&&g>177&&r-b>65&&g-b>65)?1:0;
  }
  return classifyMask(mask);
 }catch(_){return null;}
}
function best(evidence){
 const values=(evidence||[]).filter(e=>Number.isInteger(e.value)&&e.value>=1&&e.value<=80);
 const visualValues=[...new Set(values.filter(e=>e.mode==='visual').map(e=>e.value))];
 const labels=values.filter(e=>e.mode==='label');
 const labelCounts=new Map();
 for(const e of labels){
  const list=labelCounts.get(e.value)||new Set();
  list.add(e.source);labelCounts.set(e.value,list);
 }
 if(visualValues.length===1){
  // Independently checked glyph shape wins over fragile text OCR:
  // prevents "Lv. 1" -> 19 and "Lv. 80" -> 20.
  const n=visualValues[0],agree=labelCounts.get(n)?.size||0;
  return {level:n,confidence:agree>=1?'verified':'suggested'};
 }
 if(visualValues.length>1)return {level:null,confidence:'conflict'};
 const ranked=[...labelCounts].map(([value,src])=>({value,n:src.size}))
  .sort((a,b)=>b.n-a.n);
 if(!ranked.length)return {level:null,confidence:'unknown'};
 if(ranked.length===1)return {level:ranked[0].value,
  confidence:ranked[0].n>=2?'verified':'suggested'};
 if(ranked[0].n>=3&&ranked[1].n===1)
  return {level:ranked[0].value,confidence:'verified'};
 return {level:null,confidence:'conflict'};
}
function record(tile,text,source,mode='label'){
 const value=mode==='visual'?(Number.isInteger(text)?text:null):mode==='digits'?parseDigits(text):parse(text);
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
root.NRW_BEAR_HERO_LEVEL={parse,parseDigits,lineInRect,classifyMask,visual,record,best,combine,version:'glyph-crosscheck-20261010-3'};
})(window);
