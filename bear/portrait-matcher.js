/* Screenshot → screenshot matching. Low-resolution Kingshot HUD reference
 * signatures are derived from user-provided in-game screenshots and checked
 * against overlapping pages. No screenshots or raw portraits are sent out.
 */
(function(root){
'use strict';
const SIZE=6;
let cache=null;
function decode(p){
 try{
  const bytes=atob(p.rgb),size=SIZE*SIZE*3;
  return bytes.length===size?{name:p.name,rgb:Uint8Array.from(bytes,c=>c.charCodeAt(0))}:null;
 }catch(_){return null;}
}
async function data(){
 if(!cache)cache=fetch('./hero-hud-fingerprints.json?v=roster-20261010-1',{cache:'no-cache'})
  .then(r=>r.ok?r.json():null).then(j=>{
   if(j?.size!==SIZE||!j.pixels)return [];
   return Object.entries(j.pixels).map(([name,rgb])=>decode({name,rgb})).filter(Boolean);
  }).catch(()=>[]);
 return cache;
}
function sample(canvas,rect){
 // Identical normalized picture crop as used to build reference descriptors.
 // Cropping is based on actual card geometry and scales with resolution.
 const c=document.createElement('canvas');c.width=SIZE;c.height=SIZE;
 const ctx=c.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(canvas,rect.x+rect.w*.07,rect.y+rect.h*.04,
  rect.w*.86,rect.h*.67,0,0,SIZE,SIZE);
 const rgba=ctx.getImageData(0,0,SIZE,SIZE).data,arr=new Uint8Array(SIZE*SIZE*3);
 for(let p=0,j=0;p<rgba.length;p+=4){arr[j++]=rgba[p];arr[j++]=rgba[p+1];arr[j++]=rgba[p+2];}
 return arr;
}
function candidates(canvas,rect){return [sample(canvas,rect)];}
function difference(a,b){
 if(!a||!b||a.length!==b.length)return 255;
 let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);
 return sum/a.length;
}
function match(samples,refs){
 if(!samples?.length||!refs?.length)return {name:null,alternatives:[],confidence:'unavailable',score:null};
 const ranked=refs.map(r=>({
  name:r.name,score:Math.min(...samples.map(s=>difference(s,r.rgb)))
 })).sort((a,b)=>a.score-b.score);
 const best=ranked[0],second=ranked[1];
 // Cross-page source tests show same hero average RGB delta < 5 and different
 // hero portraits > 24. Fallback to review when art/layout differs.
 const certain=best.score<=19&&(!second||second.score-best.score>=11);
 return {name:certain?best.name:null,score:best.score,
  alternatives:ranked.slice(0,4).map(x=>x.name),
  confidence:certain?'high':(best.score<=32?'low':'unverified')};
}
async function enrich(tiles){
 const refs=await data();
 for(const tile of tiles){
  const info=match(tile.portraitCandidates||[],refs);
  tile.name=info.name||tile.name||'';
  tile.nameConfidence=info.confidence;
  tile.suggestions=info.alternatives;
  tile.matchScore=info.score;
 }
 return {available:refs.length,matched:tiles.filter(t=>t.name).length};
}
root.NRW_BEAR_PORTRAIT_MATCHER={data,candidates,sample,match,enrich,version:'game-hud-normalized-6px-v2-roster-20261010'};
})(window);
