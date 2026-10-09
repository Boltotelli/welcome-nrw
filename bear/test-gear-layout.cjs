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
// Exact geometric proportions measured from the player's current
// 1080x1920 Governor Gear screenshot. These are simple synthetic rectangles,
// NOT copies of in-game artwork or screenshots.
function screenshotGeometry(mult=1){
 const w=Math.round(716*mult),h=Math.round(1273*mult);
 const pixels=new Uint8ClampedArray(w*h*4);
 for(let i=0;i<pixels.length;i+=4){pixels[i]=86;pixels[i+1]=158;pixels[i+2]=188;pixels[i+3]=255;}
 const cards=[
  [67,173,104,105,'purple'],[545,173,104,105,'purple'],
  [20,350,104,104,'purple'],[592,350,104,104,'purple'],
  [67,518,103,103,'gold'],[546,518,103,103,'gold']
 ];
 for(const [xx,yy,ww,hh,type] of cards){
  const [r,g,b]=type==='gold'?[215,110,12]:[121,99,208];
  for(let y=Math.round(yy*mult);y<Math.round((yy+hh)*mult);y++)
   for(let x=Math.round(xx*mult);x<Math.round((xx+ww)*mult);x++){
    const k=(y*w+x)*4;pixels[k]=r;pixels[k+1]=g;pixels[k+2]=b;
   }
 }
 return {pixels,w,h};
}
for(const mult of [1,1.5]){
 const sample=screenshotGeometry(mult),detected=find(sample.pixels,sample.w,sample.h);
 assert.equal(detected.ok,true,'real screenshot grid at resolution scale '+mult);
 assert.equal(detected.detected,6,'all six frames are pixel-detected');
 assert.equal(detected.slots.filter(slot=>slot.inferred).length,0,
  'neither gold frame is extrapolated');
 assert.deepEqual(Array.from(detected.slots,slot=>slot.quality),
  ['purple','purple','purple','purple','gold','gold']);
 const expected=[
  [119,296],[597,296],[72,472],[644,472],[118.5,639],[597.5,639]
 ];
 detected.slots.forEach((slot,i)=>{
  assert.equal(slot.charms.length,3);
  const y=slot.charms[1][1]/mult;
  assert.ok(Math.abs(y-expected[i][1])<=3,'charm row '+slot.id+' expected y='+expected[i][1]+', got '+y);
  assert.ok(Math.abs(slot.charms[1][0]/mult-expected[i][0])<=3,'charm column '+slot.id);
  assert.ok(slot.charms[0][0]<slot.charms[1][0]&&slot.charms[1][0]<slot.charms[2][0]);
 });
}
const blank=image().pixels;blank.fill(0);
assert.equal(find(blank,716,1536).ok,false);
console.log('GEAR LAYOUT: six purple/orange frames detected at original and shifted positions, no inferred golden archer equipment.');
