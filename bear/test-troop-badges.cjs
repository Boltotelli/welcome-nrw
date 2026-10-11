'use strict';
/* Tiny colour-segmented binary fixtures of three actual rank badge crops.
 * No source screenshot is checked into GitHub.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const moduleCode=fs.readFileSync(__dirname+'/troop-badges.js','utf8');
const fixtures=["wAAA8AAADgAAAYAAABAD8AIA/8AAGAAAAwAAAP4AAB/gAAOOAAAwwAAHGAAA/gAAB4AAAAAAAAAAAAAABAAAAIAAADAAAA4AAAHAAAA4AAAHAAAd4AAH/A==","AAAD4AAAfAAAB4AAAHAf4A4D+QHAYAAYDgABAfgAIB+AAAA4AAAHAAAA4AAD+ABAfgAYAAADAAAA4AAAHAAAB4AAAPAAAD4AAAfAAAD4AAA/AAB/4AAf/A==","/AAH+AAAHgAAA+AAADgAAAdAAADAB8AIAfkBAHEAAAwAAAOAAAB/gAAPOAAAwwAAGGAAA/gAAD8AAAAAAAAAAAAAABAAAAIAAADAAAAYAAAHAAAA4AAAHA=="];
function mock(mask){
 const data=new Uint8ClampedArray(27*26*4);
 const bits=Buffer.from(mask,'base64');
 for(let i=0;i<702;i++){
  const on=(bits[i>>3]>>(7-(i&7)))&1,p=i*4;
  data[p]=on?232:155;data[p+1]=on?226:109;data[p+2]=on?210:18;data[p+3]=255;
 }
 const document={createElement:()=>({width:27,height:26,getContext:()=>({
  drawImage(){},clearRect(){},getImageData:()=>({data})
 })})};
 const scope={window:{},atob,document};
 vm.runInNewContext(moduleCode,scope);
 return scope.window.NRW_BEAR_TROOP_BADGES;
}
// Real third-class TG6 badge was rejected at confidence .806 with margin .078;
// this fourth compact 12x16 glyph is from that *actual* screenshot.
for(let i=0;i<fixtures.length;i++){
 const m=mock(fixtures[i]),result=m.digitAt({canvas:{width:716,height:1536}},[133,395]);
 assert.equal(result.tg,[6,5,6][i],i+' expected Truegold badge');
 assert.ok(result.confidence>.8);
}
// Real Archer TG6 selected white glyph pixels in a 27x26 crop. Unlike
// the normalized 12x16 template this reproduces the full digitAt pipeline.
const archerSource='AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AfAAAP/AABhIAAcAAADMAAAf4AADjgAAcMAABjgAAP4AAA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='.replace(/ /g,'');
function mockActual(mask){
 const bits=Buffer.from(mask,'base64');
 const data=new Uint8ClampedArray(27*26*4);
 for(let i=0;i<702;i++){
  const on=Boolean((bits[i>>3]>>(7-(i%8)))&1),p=i*4;
  data[p]=on?232:155;data[p+1]=on?226:109;data[p+2]=on?210:18;data[p+3]=255;
 }
 const scope={window:{},atob,document:{createElement:()=>({width:27,height:26,getContext:()=>({
  drawImage(){},getImageData:()=>({data})
 })})}};
 vm.runInNewContext(moduleCode,scope);
 return scope.window.NRW_BEAR_TROOP_BADGES;
}
const archer=mockActual(archerSource);
const detectedArcher=archer.digitAt({canvas:{width:716,height:1536}},[133,518]);
assert.equal(detectedArcher.tg,6,'real archer TG6 pixel silhouette recognized end-to-end');
assert.ok(detectedArcher.confidence>=.8);

// Real October 11 TG4 glyph (27x26 crop, white-pixel mask from original
// Kingshot screenshot; source image itself is not part of the repository).
const trueGoldFourMask='/4B//+AH/8AAB8AACDgAAAcAAADgAAAYAAABAAcAIAHkAAB8AAAfgAADMAAA5gAAGMAAB7wAAP/AAB/4AAAMAAAAAAAAAAAAAABAAAAIAAADAAAAYAAADA==';
const four=mockActual(trueGoldFourMask);
const match4=four.digitAt({canvas:{width:716,height:1536}},[133,361]);
assert.equal(match4.tg,4,'TG4 must be recognized from actual screenshot pixels');
assert.ok(match4.confidence>=.8);
const newScope={window:{},atob,document:{createElement:()=>({width:27,height:26})}};
vm.runInNewContext(moduleCode,newScope);
const anchored=newScope.window.NRW_BEAR_TROOP_BADGES.locateBadge(
 {labelBox:{x:153/716,y:373/1536,h:19/1536}}, {width:716,height:1536});
assert.ok(Math.abs(anchored.x-133)<5&&Math.abs(anchored.y-361)<5,
 'gold badge found relative to dynamic OCR text anchor');
const scaled=newScope.window.NRW_BEAR_TROOP_BADGES.locateBadge(
 {labelBox:{x:153/716,y:373/1536+.035,h:19/1536}},
 {width:1432,height:3072});
assert.ok(Math.abs(scaled.x-anchored.x*2)<1);
assert.ok(Math.abs(scaled.y-(anchored.y+.035*1536)*2)<1,
 'location tracks resized and vertically shifted screenshots');

const test=mock(fixtures[0]);
const canvas={width:716,height:1536,getContext:()=>({canvas:{width:716,height:1536}})};
const levels=test.recognize(canvas,'Spitzen Infanterie / Spitzen Kavallerie / Spitzen Bogenschützen',[]);
assert.deepEqual(Array.from(levels.map(x=>x.tier)),[10,10,10]);
assert.equal(test.recognize(canvas,'Anfänger Infanterie',[])[0].tier,null);
console.log('TROOP BADGES: truegold 6/5/6 including real archer badge glyph and tier-X text guard passed.');

// Genuine OCR label boxes from that screenshot: numeral centers verified
// in the original pixels are (137,363), (460,363) and (128,488).
const realBadgeLabels=[
 [{title:'Spitzen Infanterie',labelBox:{x:149/716,y:366/1536,h:31/1536}},{x:137,y:363}],
 [{title:'Kavallerie',labelBox:{x:548/716,y:371/1536,h:17/1536}},{x:460,y:363}],
 [{title:'Spitzen Bogenschütze',labelBox:{x:148/716,y:492/1536,h:28/1536}},{x:128,y:488}]
];
for(const [entry,actual] of realBadgeLabels){
 const guess=newScope.window.NRW_BEAR_TROOP_BADGES.locateBadge(entry,{width:716,height:1536});
 assert.ok(Math.abs(guess.x-actual.x)<=24&&Math.abs(guess.y-actual.y)<=24,
  entry.title+' medal must be inside the dynamic local search range');
}

/* The REAL badge crop silhouettes are verified above. This additional test
 * proves standard-layout icon lookup no longer depends on labelBox.
 * No source screenshot or hardcoded troop quantities are required. */
const digitBegin=moduleCode.indexOf('function digitAt(ctx,center,scratch){');
const digitEnd=moduleCode.indexOf('// Small verified Roman X',digitBegin);
const romanBegin=moduleCode.indexOf('function romanXAt(ctx,center){');
const romanEnd=moduleCode.indexOf('function recognize(canvas,text,words){',romanBegin);
assert.ok(digitBegin>=0&&digitEnd>digitBegin&&romanBegin>=0&&romanEnd>romanBegin);
let simulated=moduleCode.slice(0,digitBegin)+`
function digitAt(ctx,center){
 const current=ctx.canvas.width===716?
 [[136,374,4],[450,374,4],[136,493,4]]:
 [[136,395,6],[454,395,5],[136,520,6]];
 for(const [x,y,tg] of current){
  if(Math.abs(center[0]-x)<=4&&Math.abs(center[1]-y)<=4)
   return {tg,confidence:.95,second:.65};
 }
 return {tg:null,confidence:0};
}
`+moduleCode.slice(digitEnd,romanBegin)+`
function romanXAt(ctx,center){
 const current=ctx.canvas.width===716?
 [[105,433],[419,433],[105,552]]:
 [[105,454],[423,454],[105,579]];
 return current.some(([x,y])=>Math.abs(center[0]-x)<8&&Math.abs(center[1]-y)<10)?.82:0;
}
`+moduleCode.slice(romanEnd);
const simulationScope={window:{},atob,document:{
 createElement:()=>({width:27,height:26})
}};
vm.runInNewContext(simulated,simulationScope);
for(const width of [716,955]){
 const c={width,height:Math.round(width*1536/716),
  getContext:()=>({canvas:{width}})};
 const expected=width===716?[4,4,4]:[6,5,6];
 simulationScope.window.NRW_BEAR_TROOP_BADGES.recognizeStandard(c,'')
  .then(got=>{
   assert.deepEqual(Array.from(got.map(v=>v.tg)),expected);
   assert.deepEqual(Array.from(got.map(v=>v.tier)),[10,10,10]);
  }).catch(e=>{throw e;});
}
