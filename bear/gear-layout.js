/* Detect the six GovGear frames from image pixels, not assumed coordinates.
 * Purple frame areas are connected components. Gold ring position is inferred
 * only if the other five frames form a plausible 3-row, two-column grid.
 * Returns {slots:[{gear:[x,y],charms:[[x,y]x3],...}], quality, reason}.
 * Browser-local, no network and no saved images.
 */
(function(root){
'use strict';
const ids=['helmet','neck','coat','pants','ring','staff'];
function purple(r,g,b){return b>r*1.2&&b>g*1.18&&r>g*.85&&r>60&&b>100;}
function find(data,w,h){
 if(!data||w<300||h<500)return {ok:false,reason:'too-small',slots:[]};
 const endY=Math.min(h,Math.round(h*.66)),N=w*endY;
 const mask=new Uint8Array(N),list=[];
 for(let y=0;y<endY;y++)for(let x=Math.round(w*.02);x<w*.98;x++){
  const p=(y*w+x)*4;
  if(purple(data[p],data[p+1],data[p+2]))mask[y*w+x]=1;
 }
 const minWidth=w*.10,maxWidth=w*.23,minArea=w*w*.003;
 const stack=[];
 for(let k=0;k<N;k++){
  if(mask[k]!==1)continue;
  let x0=w,y0=h,x1=0,y1=0,area=0;
  stack.push(k);mask[k]=0;
  while(stack.length){
   const idx=stack.pop(),x=idx%w,y=Math.floor(idx/w);
   area++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   const neighbours=[x?idx-1:-1,x<w-1?idx+1:-1,y?idx-w:-1,y<endY-1?idx+w:-1];
   for(const next of neighbours)if(next>=0&&mask[next]===1){mask[next]=0;stack.push(next);}
  }
  const cw=x1-x0+1,ch=y1-y0+1;
  if(cw>=minWidth&&cw<=maxWidth&&ch>=minWidth&&ch<=maxWidth&&
    ch/cw>.68&&ch/cw<1.35&&area>=minArea){
   list.push({x:x0,y:y0,w:cw,h:ch,area,cx:(x0+x1)/2,cy:(y0+y1)/2});
  }
 }
 // Keep real gear cards rather than bright-purple overlay/menu elements.
 list.sort((a,b)=>b.area-a.area);
 const cards=list.slice(0,7).sort((a,b)=>a.cy-b.cy||a.cx-b.cx);
 const rows=[];
 for(const card of cards){
  let row=rows.find(r=>Math.abs(r.cy-card.cy)<w*.095);
  if(!row){row={cy:card.cy,items:[]};rows.push(row);}
  row.items.push(card);row.cy=row.items.reduce((s,a)=>s+a.cy,0)/row.items.length;
 }
 rows.sort((a,b)=>a.cy-b.cy);
 const valid=rows.length===3&&rows.every(row=>row.items.length>=1&&row.items.length<=2)
  &&rows.reduce((n,r)=>n+r.items.length,0)>=5
  &&rows[0].cy<w*.9&&rows[2].cy>rows[0].cy+w*.32;
 if(!valid)return {ok:false,reason:'frames-not-found',slots:[],count:list.length};
 const byRow=rows.map(r=>{
  const row={left:null,right:null};
  for(const card of r.items){
   const side=card.cx<w/2?'left':'right';
   if(row[side])return null;
   row[side]=card;
  }
  return row;
 });
 if(byRow.some(r=>!r))return {ok:false,reason:'ambiguous-column',slots:[],count:list.length};
 const leftRightPairs=byRow.filter(r=>r.left&&r.right);
 if(leftRightPairs.length<2)return {ok:false,reason:'missing-columns',slots:[],count:list.length};
 // Infer only one missing golden/orange ring (lower left on Kingshot).
 const bottom=byRow[2];
 if(!bottom.left&&bottom.right){
  const other=bottom.right;
  bottom.left={cx:w-other.cx,cy:other.cy,w:other.w,h:other.h,
    x:w-other.cx-other.w/2,y:other.cy-other.h/2,inferred:true};
 }else if(!bottom.right&&bottom.left){
  return {ok:false,reason:'unknown-bottom-gear',slots:[],count:list.length};
 }
 if(byRow.some(r=>!r.left||!r.right))return {ok:false,reason:'incomplete-gear-grid',slots:[],count:list.length};
 const positions=[byRow[0].left,byRow[0].right,byRow[1].left,byRow[1].right,byRow[2].left,byRow[2].right];
 const output=positions.map((c,i)=>{
  const step=c.w/3,cy=c.y+c.h+(c.h*.17);
  return {id:ids[i],gear:[c.cx,c.cy],charms:[-1,0,1].map(v=>[c.cx+v*step,cy]),bounds:[c.x,c.y,c.w,c.h],inferred:!!c.inferred};
 });
 return {ok:true,slots:output,detected:cards.length,reason:'frames-detected'};
}
root.NRW_BEAR_GEAR_LAYOUT={purple,find};
})(window);
