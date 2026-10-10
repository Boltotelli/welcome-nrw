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
fixtures.push('H4f/f/YJ4A4Azg/4/44c4M4MYcf4f4Pw');
for(let i=0;i<fixtures.length;i++){
 const m=mock(fixtures[i]),result=m.digitAt({canvas:{width:716,height:1536}},[133,395]);
 assert.equal(result.tg,[6,5,6,6][i],i+' expected Truegold badge');
 assert.ok(result.confidence>.8);
}
const test=mock(fixtures[0]);
const canvas={width:716,height:1536,getContext:()=>({canvas:{width:716,height:1536}})};
const levels=test.recognize(canvas,'Spitzen Infanterie / Spitzen Kavallerie / Spitzen Bogenschützen',[]);
assert.deepEqual(Array.from(levels.map(x=>x.tier)),[10,10,10]);
assert.equal(test.recognize(canvas,'Anfänger Infanterie',[])[0].tier,null);
console.log('TROOP BADGES: truegold 6/5/6 including real archer badge glyph and tier-X text guard passed.');
