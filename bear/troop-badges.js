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
function digitAt(ctx,center){
 const sc=ctx.canvas.width/716;
 const x=Math.round(center[0]*sc),y=Math.round(center[1]*sc);
 const left=Math.round(x-12*sc),top=Math.round(y-13*sc);
 const tmp=document.createElement('canvas');tmp.width=27;tmp.height=26;
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
function recognize(canvas,text,words){
 const result=[{tier:null,tg:null},{tier:null,tg:null},{tier:null,tg:null}];
 const all=String(text||'');
 // Only the 'Spitzen' name tied to the Roman X base troop icon.
 const lower=all.toLowerCase();
 const classes=[/spitzen\s*infant/,/spitzen\s*kaval/,/spitzen\s*bogen/];
 for(let i=0;i<3;i++)if(classes[i].test(lower))result[i].tier=10;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const fixed=[[133,395],[453,395],[133,518]];
 // An exact icon-crop match is needed before auto-selecting TG5 or TG6.
 for(let i=0;i<3;i++){
  const digit=digitAt(ctx,fixed[i]);
  if(digit.tg!==null){result[i].tg=digit.tg;result[i].confidence=digit.confidence;}
 }
 return result;
}
root.NRW_BEAR_TROOP_BADGES={recognize,digitAt,version:'tier-x-tg5tg6'};
})(window);
