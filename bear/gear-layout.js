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
// Orange/gold Governor Gear has a complete frame, not a purple outline.
// Detect it directly instead of extrapolating the archer row from row 1/2.
function gold(r,g,b){return r>185&&g>75&&g<r*.85&&b<r*.65;}
function find(data,w,h){
 if(!data||w<300||h<500)return {ok:false,reason:'too-small',slots:[]};
 const endY=Math.min(h,Math.round(h*.66)),N=w*endY;
 const minWidth=w*.10,maxWidth=w*.23,minArea=w*w*.003;
 const list=[];
 for(const [quality,predicate] of [['purple',purple],['gold',gold]]){
  const mask=new Uint8Array(N),stack=[];
  for(let y=0;y<endY;y++)for(let x=Math.round(w*.02);x<w*.98;x++){
   const p=(y*w+x)*4;
   if(predicate(data[p],data[p+1],data[p+2]))mask[y*w+x]=1;
  }
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
    list.push({x:x0,y:y0,w:cw,h:ch,area,cx:(x0+x1)/2,cy:(y0+y1)/2,quality});
   }
  }
 }
 // Keep real gear cards rather than smaller gold decorations on other cards.
 list.sort((a,b)=>b.area-a.area);
 const cards=[];
 for(const item of list){
  if(cards.some(existing=>Math.abs(existing.cx-item.cx)<w*.045&&Math.abs(existing.cy-item.cy)<w*.045))continue;
  cards.push(item);if(cards.length===7)break;
 }
 cards.sort((a,b)=>a.cy-b.cy||a.cx-b.cx);
 const rows=[];
 for(const card of cards){
  let row=rows.find(r=>Math.abs(r.cy-card.cy)<w*.095);
  if(!row){row={cy:card.cy,items:[]};rows.push(row);}
  row.items.push(card);row.cy=row.items.reduce((s,a)=>s+a.cy,0)/row.items.length;
 }
 rows.sort((a,b)=>a.cy-b.cy);
 // New Kingshot screenshots can have FOUR purple items and TWO orange ones.
 // Reconstruct the third row only when the first two are complete, aligned
 // two-column gear rows. Their alternating horizontal offset is preserved.
 if(rows.length===2 && rows.every(r=>r.items.length===2)){
  const top=rows[0],mid=rows[1],thirdY=mid.cy+(mid.cy-top.cy);
  if(thirdY<h*.66 && thirdY>mid.cy+w*.12){
   const copies=top.items.map(c=>({cx:c.cx,cy:thirdY,w:c.w,h:c.h,
     x:c.cx-c.w/2,y:thirdY-c.h/2,inferred:true}));
   rows.push({cy:thirdY,items:copies});
  }
 }
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
  // Keep any horizontal screenshot offset; mirroring about the image centre
  // would be wrong when the game UI itself is shifted left/right.
  const base=byRow[0];const inferredX=base.left.cx+(other.cx-base.right.cx);
  bottom.left={cx:inferredX,cy:other.cy,w:other.w,h:other.h,
    x:inferredX-other.w/2,y:other.cy-other.h/2,inferred:true};
 }else if(!bottom.right&&bottom.left){
  return {ok:false,reason:'unknown-bottom-gear',slots:[],count:list.length};
 }
 if(byRow.some(r=>!r.left||!r.right))return {ok:false,reason:'incomplete-gear-grid',slots:[],count:list.length};
 const positions=[byRow[0].left,byRow[0].right,byRow[1].left,byRow[1].right,byRow[2].left,byRow[2].right];
 const output=positions.map((c,i)=>{
  const step=c.w/3,cy=c.y+c.h+(c.h*.17);
  return {id:ids[i],gear:[c.cx,c.cy],charms:[-1,0,1].map(v=>[c.cx+v*step,cy]),bounds:[c.x,c.y,c.w,c.h],quality:c.quality||null,inferred:!!c.inferred};
 });
 return {ok:true,slots:output,detected:cards.length,reason:'frames-detected'};
}
root.NRW_BEAR_GEAR_LAYOUT={purple,gold,find};
})(window);
