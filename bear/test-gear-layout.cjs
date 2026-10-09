'use strict';
/* Simulated purple gear frames and user-derived badge binarized crops.
 * This does not store or ship the user's source screenshots.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={window:{},atob};vm.runInNewContext(fs.readFileSync(__dirname+'/gear-layout.js','utf8'),env);
const find=env.window.NRW_BEAR_GEAR_LAYOUT.find;
function image(shiftX=0,shiftY=0,twoOrange=false){
 const w=716,h=1536,pixels=new Uint8ClampedArray(w*h*4);
 for(let k=0;k<pixels.length;k+=4){pixels[k]=90;pixels[k+1]=145;pixels[k+2]=165;pixels[k+3]=255;}
 function rect(x,y,ww,hh,c){
  for(let j=y;j<y+hh;j++)for(let i=x;i<x+ww;i++){const k=(j*w+i)*4;pixels[k]=c[0];pixels[k+1]=c[1];pixels[k+2]=c[2];}
 }
 for(const [x,y] of (twoOrange?[[94,282],[519,283],[54,448],[558,448]]:[[94,282],[519,283],[54,448],[558,448],[518,613]])){
  rect(x+shiftX,y+shiftY,108,108,[121,99,208]);
  rect(x+shiftX+26,y+shiftY+26,56,56,[190,140,80]);
 }
 rect(94+shiftX,613+shiftY,108,108,[215,110,12]);
 if(twoOrange)rect(518+shiftX,613+shiftY,108,108,[215,110,12]);
 return {pixels,w,h};
}
for(const [dx,dy] of [[0,0],[-14,70],[12,-35]]){
 const {pixels,w,h}=image(dx,dy),result=find(pixels,w,h);
 assert.equal(result.ok,true,'detected gear grid after offset '+dx+'/'+dy);
 assert.equal(result.slots.length,6);
 assert.equal(result.detected,6,'purple + orange equipment frames are all detected');
 const expected=[[148,336],[573,337],[108,502],[612,502],[145,667],[572,667]];
 result.slots.forEach((slot,i)=>{
  assert.equal(slot.id,['helmet','neck','coat','pants','ring','staff'][i]);
  assert.ok(Math.abs(slot.gear[0]-(expected[i][0]+dx))<=5,'x '+slot.id);
  assert.ok(Math.abs(slot.gear[1]-(expected[i][1]+dy))<=5,'y '+slot.id);
  assert.equal(slot.charms.length,3);
  assert.ok(slot.charms.every(c=>c[1]>slot.gear[1]+35),'charms below '+slot.id);
 });
}
// The real Android screenshot has FOUR purple and TWO orange equipment.
const modern=image(0,0,true);
const modernResult=find(modern.pixels,modern.w,modern.h);
assert.equal(modernResult.ok,true,'four-purple / two-orange gear grid accepted');
assert.equal(modernResult.slots.length,6);
assert.equal(modernResult.detected,6,'four purple and two orange frames localized directly');
assert.equal(modernResult.slots[4].inferred,false,'orange ring must be directly detected');
assert.equal(modernResult.slots[5].inferred,false,'orange staff must be directly detected');
assert.ok(modernResult.slots[4].charms.length===3&&modernResult.slots[5].charms.length===3);
const blank=image().pixels;blank.fill(0);
assert.equal(find(blank,716,1536).ok,false);
console.log('GEAR LAYOUT: six purple/orange frames detected at original and shifted positions, no inferred golden archer equipment.');
