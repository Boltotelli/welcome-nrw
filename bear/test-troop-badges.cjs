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
const trueGoldFourMask='///////////////////4B//+AH/8AAB8AACDgAAAcAAADgAAAYAAABAAcAIAHkAAB8AAAfgAADMAAA5gAAGMAAB7wAAP/AAB/4AAAMAAAAAAAAAAAAAABA==';
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
