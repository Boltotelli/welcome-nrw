/* Kingshot hero overview grid segmentation.
 * All geometry uses relative image dimensions; card heights scale with
 * SCREEN WIDTH rather than SCREEN HEIGHT so aspect ratios do not omit cards.
 * This module is deterministic, network-free and screenshot-local.
 */
(function(root){
'use strict';
const X_SAMPLES=[.054,.286,.518,.750];
function rowsFromPixels(data,w,h){
 if(!data||data.length<w*h*4||w<250||h<400)return [];
 const rgb=(x,y)=>{
  const px=Math.min(w-1,Math.max(0,Math.floor(x*w))),
   py=Math.min(h-1,Math.max(0,Math.floor(y*h))),p=(py*w+px)*4;
  return [data[p],data[p+1],data[p+2]];
 };
 const bg=rgb(.023,.30),present=new Uint8Array(h);
 const y0=Math.round(h*.064),y1=Math.round(h*.91);
 const isCard=y=>X_SAMPLES.reduce((n,x)=>{
  const c=rgb(x,y/h);
  const delta=Math.abs(c[0]-bg[0])+Math.abs(c[1]-bg[1])+Math.abs(c[2]-bg[2]);
  return n+(delta>75?1:0);
 },0)>=3;
 for(let y=y0;y<y1;y+=2)if(isCard(y)){present[y]=1;if(y+1<h)present[y+1]=1;}
 const radius=Math.max(3,Math.round(w*.0055)),smooth=new Uint8Array(h);
 const sums=new Int32Array(h+1);
 for(let y=0;y<h;y++)sums[y+1]=sums[y]+present[y];
 for(let y=y0+radius;y<y1-radius;y++){
  const count=sums[y+radius+1]-sums[y-radius];
  if(count>=radius+1)smooth[y]=1;
 }
 const segments=[];let first=-1;
 for(let y=y0;y<=y1;y++){
  if(y<y1&&smooth[y]&&first<0)first=y;
  else if((y===y1||!smooth[y])&&first>=0){segments.push({top:first,bottom:y});first=-1;}
 }
 const merged=[],maxGap=w*.022;
 for(const item of segments){
  const last=merged[merged.length-1];
  if(last&&item.top-last.bottom<=maxGap&&last.bottom-last.top<w*.30&&
    item.bottom-item.top<w*.30&&item.bottom-last.top<=w*.40)
   last.bottom=item.bottom;
  else merged.push({...item});
 }
 return merged.filter(x=>x.bottom-x.top>=w*.30&&x.bottom-x.top<=w*.42);
}
function rows(canvas){
 const {width:w,height:h}=canvas,ctx=canvas.getContext('2d',{willReadFrequently:true});
 return rowsFromPixels(ctx.getImageData(0,0,w,h).data,w,h);
}
function tileRect(width,row,col){
 return {x:Math.round(width*(.038+col*.232)),
  y:row.top+2,w:Math.round(width*.211),h:row.bottom-row.top-3};
}
root.NRW_BEAR_HERO_GRID={rows,rowsFromPixels,tileRect,version:'width-relative-20261009'};
})(window);
