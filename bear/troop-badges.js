/* King's shot Troop Overview badge recognition.
 * 'Spitzen' with Roman X identifies base troop tier T10; the gold shield
 * badge represents a separate Truegold rank. White digit silhouettes for
 * TG5 and TG6 are based on the user's actual game screenshot. Values outside
 * the two validated digit templates remain unknown, never assumed TG0.
 */
(function(root){
'use strict';
const tpl={4:['A8B8B8D8P8P8Ocececcc++++//////Ac','B+B+B+D+H+H+GOcOcO8O/+/+//////AO','A8B8B8D8D8D8O8OcOccc8888///+/+Ac'],5:['/////+4A4A+A/4/4P+APAPAPAPAP/+/4'],6:['H4H4P/MAMAMA/w/w/48c8cMMOMOMP4Dw','D+D+H+PCPCMA8A8A/+/P/PMDMDMDP+H+','H4f/f/YJ4A4Azg/4/44c4M4MYcf4f4Pw']}; // additional REAL archer TG6 glyph: 955x2048 screenshot
function decode(s){const b=atob(s),bits=new Uint8Array(12*16);for(let i=0;i<bits.length;i++)bits[i]=(b.charCodeAt(i>>3)>>(7-(i%8)))&1;return bits;}
const patterns={4:tpl[4].map(decode),5:tpl[5].map(decode),6:tpl[6].map(decode)};
function ratio(mask,b){return Math.max(...patterns[b].map(p=>{let both=0,aa=0,bb=0;for(let i=0;i<mask.length;i++){both+=mask[i]&&p[i]?1:0;aa+=mask[i];bb+=p[i];}return 2*both/(aa+bb||1);}));}
function digitAt(ctx,center,scratch){
 const sc=ctx.canvas.width/716;
 const x=Math.round(center[0]*sc),y=Math.round(center[1]*sc);
 const left=Math.round(x-12*sc),top=Math.round(y-13*sc);
 const tmp=scratch||document.createElement('canvas');
 if(!scratch){tmp.width=27;tmp.height=26;}
 if(left<0||top<0||left+27*sc>ctx.canvas.width||top+26*sc>ctx.canvas.height)return {tg:null,confidence:0};
 const tmpCtx=tmp.getContext('2d',{willReadFrequently:true});
 tmpCtx.drawImage(ctx.canvas,left,top,27*sc,26*sc,0,0,27,26);
 const pix=tmpCtx.getImageData(0,0,27,26).data,mask=new Uint8Array(27*26);
 for(let i=0;i<mask.length;i++){
  const p=i*4,r=pix[p],g=pix[p+1],b=pix[p+2];
  if(r>190&&g>185&&b>172&&Math.abs(r-g)<45&&Math.abs(g-b)<52)mask[i]=1;
 }
 const seen=new Uint8Array(mask.length);let best={count:0};
 for(let i=0;i<mask.length;i++){
  if(!mask[i]||seen[i])continue;
  let count=0,x0=27,x1=0,y0=26,y1=0,sumx=0,sumy=0;const stack=[i];seen[i]=1;
  while(stack.length){const q=stack.pop(),xx=q%27,yy=(q/27)|0;count++;sumx+=xx;sumy+=yy;
   x0=Math.min(x0,xx);x1=Math.max(x1,xx);y0=Math.min(y0,yy);y1=Math.max(y1,yy);
   for(const next of [xx?q-1:-1,xx<26?q+1:-1,yy?q-27:-1,yy<25?q+27:-1])if(next>=0&&mask[next]&&!seen[next]){seen[next]=1;stack.push(next);}
  }
  if(count>best.count&&count>35&&count<140&&sumx/count>=3&&sumx/count<=18&&sumy/count>=2&&sumy/count<=16)
   best={count,x0,x1,y0,y1,maskIndices:null,label:i};
 }
 if(best.count<36)return {tg:null,confidence:0};
 const selected=new Uint8Array(mask.length),stack=[best.label];selected[best.label]=1;
 while(stack.length){const q=stack.pop(),xx=q%27,yy=(q/27)|0;
  for(const next of [xx?q-1:-1,xx<26?q+1:-1,yy?q-27:-1,yy<25?q+27:-1])
   if(next>=0&&mask[next]&&!selected[next]){selected[next]=1;stack.push(next);}
 }
 const w=best.x1-best.x0+1,h=best.y1-best.y0+1,normal=new Uint8Array(192);
 for(let yy=0;yy<16;yy++)for(let xx=0;xx<12;xx++){
  const ox=best.x0+Math.min(w-1,Math.floor((xx+.5)*w/12));
  const oy=best.y0+Math.min(h-1,Math.floor((yy+.5)*h/16));
  normal[yy*12+xx]=selected[oy*27+ox];
 }
 const scores=[4,5,6].map(n=>({n,s:ratio(normal,n)})).sort((a,b)=>b.s-a.s);
 const gap=scores[0].s-scores[1].s;
 return {tg:scores[0].s>=.80&&gap>=.09?scores[0].n:null,confidence:scores[0].s,second:scores[1].s};
}
// Small verified Roman X badge mask from the user's real T10 screenshot.
// OCR frequently misses this because it is drawn over a grey troop crest.
const ROMAN_X='AAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAABgEAAHAwAAOHAAA44AABzgAAD8AAAPgAAAeAAAB4AAAPgAAA/AAAHuAAA44AADhwAAcHAABwOAAAAAAAAAAAAAAAAAAAAAAAAA=';
const romanBytes=atob(ROMAN_X);
const romanTemplate=Array.from({length:784},(_,i)=>(romanBytes.charCodeAt(i>>3)>>(7-(i&7)))&1);
function romanXAt(ctx,center){
 const base=ctx.canvas.width/716,size=ctx.canvas.width/1080;
 const screen=document.createElement('canvas');screen.width=28;screen.height=28;
 const xctx=screen.getContext('2d',{willReadFrequently:true});
 let best=0;
 for(const dx of [-6,-4,-2,0,2,4,6])for(const dy of [-24,-22,-20,-18,-16,-14,-12,-10,-8,-6,-4,-2,0,2,4,6,8,10,12,14,16,18,20,22,24]){
  const x=(center[0])*base+(dx-14)*size;
  const y=(center[1])*base+(dy-14)*size;
  if(x<0||y<0||x+28*size>ctx.canvas.width||y+28*size>ctx.canvas.height)continue;
  xctx.clearRect(0,0,28,28);
  xctx.drawImage(ctx.canvas,x,y,28*size,28*size,0,0,28,28);
  const d=xctx.getImageData(0,0,28,28).data;
  let hit=0,total=0;
  for(let i=0;i<784;i++){
   const xx=i%28,yy=(i/28)|0;
   if(xx<4||xx>=24||yy<4||yy>=24)continue;
   const p=i*4,r=d[p],g=d[p+1],b=d[p+2];
   const on=r>192&&g>182&&b>166&&Math.abs(r-g)<35&&Math.abs(g-b)<53;
   if(on)total++;
   if(on&&romanTemplate[i])hit++;
  }
  if(total<50||total>140)continue;
  best=Math.max(best,2*hit/(89+total));
 }
 return best>=.72?best:0;
}
// Badge positions are tied to detected TEXT labels for each card; an
// absolute 716x1536 anchor would shift on other phones / longer troop lists.
function recognize(canvas,text,words,entries){
 const output=Array.from({length:3},()=>({tier:null,tg:null}));
 if(!canvas||!Array.isArray(entries)||!entries.length)return output;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const sc=canvas.width/716;
 const scratch=document.createElement('canvas');scratch.width=27;scratch.height=26;
 for(const entry of entries){
  if(!Number.isInteger(entry.type)||entry.type<0||entry.type>2||!entry.icon)continue;
  const ico=entry.icon;
  // Base-T10 Roman X is a valid level, but the title alone is just a hint.
  // The visual X can be recognized even if OCR missed "Spitzen".
  const roman=[(ico.x+ico.w*.53)*716,(ico.y+ico.h*.53)*canvas.height/sc];
  const confirmedX=romanXAt(ctx,roman);
  const tier=(entry.elite||confirmedX)?10:null;
  // Gold TG numeral lives in the UPPER RIGHT of the corresponding troop
  // illustration. All search offsets scale WITH the icon, not with pixels.
  const approx=[(ico.x+ico.w*.80)*canvas.width/sc,
                (ico.y+ico.h*.145)*canvas.height/sc];
  let best={tg:null,confidence:0};
  for(const dx of [-.040,-.025,-.010,.005,.020,.035]){
   for(const dy of [-.035,-.020,-.005,.010,.025,.040]){
    const point=[approx[0]+dx*ico.w*716,
                 approx[1]+dy*ico.h*canvas.height/sc];
    const found=digitAt(ctx,point,scratch);
    if(found.tg!==null&&found.confidence>best.confidence)best=found;
   }
  }
  // Never assign a second tier of the same class the first row's TG.
  entry.tier=tier;entry.tg=best.tg;
  entry.tgConfidence=best.tg===null?null:best.confidence;
 }
 for(let type=0;type<3;type++){
  const matches=entries.filter(e=>e.type===type);
  if(matches.length!==1)continue;
  output[type]={tier:matches[0].tier??null,tg:matches[0].tg??null,
   confidence:matches[0].tgConfidence??null};
 }
 return output;
}

root.NRW_BEAR_TROOP_BADGES={recognize,digitAt,version:'anchored-t10-tg4-5-6-20261011'};
})(window);
