/* Browser-local T1 badge recognition from a real in-game Governor Gear screenshot.
 * Reference is a 20x17 binary mask of the actual T1 yellow text, not a
 * generated font. The user provided the screenshot. No source image ships.
 *
 * This intentionally detects ONLY a well-supported T1 badge. T2+ and absent
 * badges remain unknown until distinct in-game templates have been validated.
 * A gear item's background color is NOT used to infer its tier.
 */
(function(root){
'use strict';
const B64='fwAP/77//////3/j8PAfDwDw8A8PAPDwDw8A8PAPDwDw8A8PAPDwDwQAIA==';
const TW=20, TH=17, RW=42, RH=29;
function decodeMask(code,w,h){
 const bytes=atob(code),bits=new Uint8Array(w*h);
 if(bytes.length!==Math.ceil(w*h/8))throw Error('invalid mask');
 for(let i=0;i<bits.length;i++)bits[i]=(bytes.charCodeAt(i>>3)>>(7-(i&7)))&1;
 return bits;
}
const template=decodeMask(B64,TW,TH);
function yellow(r,g,b){
 const rr=r/255,gg=g/255,bb=b/255;
 const high=Math.max(rr,gg,bb),low=Math.min(rr,gg,bb),delta=high-low;
 if(high<=120/255||!delta||delta/high<=115/255)return false;
 let hue=0;
 if(high===rr)hue=((gg-bb)/delta)%6;
 else if(high===gg)hue=(bb-rr)/delta+2;
 else hue=(rr-gg)/delta+4;
 if(hue<0)hue+=6;
 return hue*60>=34&&hue*60<=80;
}
function binary(data,w,h){
 const out=new Uint8Array(w*h);
 for(let i=0;i<out.length;i++){
  const p=i*4;
  if(data[p+3]>100&&yellow(data[p],data[p+1],data[p+2]))out[i]=1;
 }
 return out;
}
function match(mask,w,h){
 if(w<TW||h<TH||!mask||mask.length!==w*h)return {tier:null,score:0};
 let total=0;for(const n of template)total+=n;
 let best=0,bx=-1,by=-1;
 for(let y=0;y<=h-TH;y++)for(let x=0;x<=w-TW;x++){
  let common=0,count=0;
  for(let j=0;j<TH;j++)for(let i=0;i<TW;i++){
   const a=template[j*TW+i],b=mask[(y+j)*w+x+i];
   common+=a&b;count+=b;
  }
  const score=2*common/(total+count||1);
  if(score>best){best=score;bx=x;by=y;}
 }
 // Conservative acceptance: a purple/orange frame or a differently shaped
 // digit must not be converted into T1.
 return {tier:best>=0.83?1:null,score:best,position:best>=0.83?[bx,by]:null};
}
function recognize(ctx,center){
 const canvas=ctx.canvas,sx=canvas.width/716,sy=sx; // dynamically detected gear centres share the width-normalized coordinate space
 // Badge location relative to each item centre in the in-game overview.
 const x=Math.round((center[0]-54)*sx),y=Math.round((center[1]-49)*sy);
 const w=Math.round(RW*sx),h=Math.round(RH*sy);
 if(x<0||y<0||w<=0||h<=0||x+w>canvas.width||y+h>canvas.height)return {tier:null,score:0};
 const tiny=document.createElement('canvas');tiny.width=RW;tiny.height=RH;
 const dest=tiny.getContext('2d',{willReadFrequently:true});
 dest.drawImage(canvas,x,y,w,h,0,0,RW,RH);
 const pixels=dest.getImageData(0,0,RW,RH);
 return match(binary(pixels.data,RW,RH),RW,RH);
}
root.NRW_BEAR_TIER_RECOGNIZER={recognize,match,binary,yellow,version:'t1-template-2026-10-09'};
})(window);
