/* King's shot Troop Overview badge recognition.
 * 'Spitzen' with Roman X identifies base troop tier T10; the gold shield
 * badge represents a separate Truegold rank. White digit silhouettes for
 * TG5 and TG6 are based on the user's actual game screenshot. Values outside
 * the two validated digit templates remain unknown, never assumed TG0.
 */
(function(root){
'use strict';
const tpl={5:['/////+4A4A+A/4/4P+APAPAPAPAP/+/4'],6:['H4H4P/MAMAMA/w/w/48c8cMMOMOMP4Dw','D+D+H+PCPCMA8A8A/+/P/PMDMDMDP+H+']};
function decode(s){const b=atob(s),bits=new Uint8Array(12*16);for(let i=0;i<bits.length;i++)bits[i]=(b.charCodeAt(i>>3)>>(7-(i%8)))&1;return bits;}
const patterns={5:tpl[5].map(decode),6:tpl[6].map(decode)};
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
 const scores=[{n:5,s:ratio(normal,5)},{n:6,s:ratio(normal,6)}].sort((a,b)=>b.s-a.s);
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
function recognize(canvas,text,words){
 const result=[{tier:null,tg:null},{tier:null,tg:null},{tier:null,tg:null}];
 const all=String(text||'');
 // Only the 'Spitzen' name tied to the Roman X base troop icon.
 const lower=all.toLowerCase();
 const classes=[/spitzen[^a-zäöü]{0,18}infant/,/spitzen[^a-zäöü]{0,18}kaval/,/spitzen[^a-zäöü]{0,18}bogen/];
 for(let i=0;i<3;i++)if(classes[i].test(lower))result[i].tier=10;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 // The game interface moves vertically with phone aspect ratio: old
 // 716x1536 crops were too low on 1080x1920 Android screenshots. Scan only
 // a narrow badge-sized neighborhood after applying the aspect correction.
 const normalizedHeight=canvas.height*716/canvas.width;
 // Standard 716x1536 HUD and current 1080x1920 Android HUD place
 // badges differently, in both X and Y. Interpolate the known anchors.
 const phoneLayout=Math.max(0,Math.min(1,(1536-normalizedHeight)/264)); // still allow HUD overlay position shift
 const oldAnchors=[[133,395],[453,395],[133,518]];
 const phoneAnchors=[[133,358],[455,358],[133,489]];
 const anchors=oldAnchors.map((p,i)=>p.map((v,j)=>v+(phoneAnchors[i][j]-v)*phoneLayout));
 // Two HUD variants: actual 955x2048 overview has Roman X at
 // [106,451], [424,451], [106,575] in normalized 716px coordinates.
 // The bounded matcher also covers earlier layouts shifted downward.
 const romanOld=[[106,451],[424,451],[106,575]];
 const romanPhone=[[106,421],[424,421],[106,546]];
 const roman=romanOld.map((p,i)=>p.map((v,j)=>v+(romanPhone[i][j]-v)*phoneLayout));
 for(let i=0;i<3;i++)if(result[i].tier===null&&romanXAt(ctx,roman[i]))result[i].tier=10;
 const sc=canvas.width/716;
 const scratch=document.createElement('canvas');scratch.width=27;scratch.height=26;
 for(let i=0;i<3;i++){
  let best={tg:null,confidence:0};
  const cx=anchors[i][0]*sc,cy=anchors[i][1]*sc;
  // Scan in physical pixels: stepping by 2 base units skipped the thin
  // numeral strokes on high-resolution Android screenshots.
  for(const dx of [-18,-15,-12,-9,-6,-3,0,3,6,9,12,15,18]){
   for(const dy of [-20,-17,-14,-11,-8,-5,-2,1,4,7,10,13,16]){
    const digit=digitAt(ctx,[(cx+dx)/sc,(cy+dy)/sc],scratch);
    if(digit.tg!==null&&digit.confidence>best.confidence)best=digit;
   }
  }
  if(best.tg!==null){result[i].tg=best.tg;result[i].confidence=best.confidence;}
 }
 // A cropped title may lose troop-type words. Only use the group inference
 // if OCR saw all three explicit Spitzen headings, not merely one troop.
 if((lower.match(/spitzen/g)||[]).length>=3)
  for(const item of result)item.tier=10;
 return result;
}
root.NRW_BEAR_TROOP_BADGES={recognize,digitAt,version:'tier-x-tg5tg6'};
})(window);
