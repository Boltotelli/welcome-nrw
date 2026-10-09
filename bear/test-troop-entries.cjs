'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scope={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/troop-entries.js','utf8'),scope);
const E=scope.window.NRW_BEAR_TROOP_ENTRIES;
function word(t,x,y,w=.105,h=.013,scaleW=1080,scaleH=1920){
 return {text:t,bbox:{x0:x*scaleW,y0:y*scaleH,x1:(x+w)*scaleW,y1:(y+h)*scaleH}};
}
function fixture(w,h,extra=false){
 const entries=[
  ['Infanterie','626.621',.185,.246],['Kavallerie','557.731',.567,.246],
  ['Bogenschützen','1.116.468',.185,.330]
 ];
 if(extra)entries.push(
  ['Infanterie','250.000',.567,.330],
  ['Infanterie','175.000',.185,.415],
  ['Bogenschützen','70.000',.567,.415]);
 const words=[];
 for(const [label,amount,x,y] of entries){
  words.push(word('Spitzen',x-.001,y,.060,.012,w,h),
   word(label,x+.067,y,.150,.013,w,h),
   word(amount,x+.067,y+.023,.135,.014,w,h));
 }
 words.push(word('Marschschlange',.35,.139,.2,.018,w,h),
  word('6/6',.39,.160,.05,.017,w,h));
 return words;
}
function signature(result){return Array.from(result.map(e=>[e.type,e.count,e.label]));}
const reference=signature(E.detect(fixture(1080,1920),1080,1920));
assert.equal(reference.length,3);
assert.deepEqual(reference.map(x=>x[1]),[626621,557731,1116468]);
for(const [w,h] of [[720,1280],[1080,1920],[1440,2560]]){
 const entries=E.detect(fixture(w,h,true),w,h);
 assert.equal(entries.length,6,'all cards '+w+'x'+h);
 assert.deepEqual(Array.from(entries,x=>x.count),[626621,557731,1116468,250000,175000,70000],w+'x'+h);
 assert.deepEqual({...E.totals(entries)},{troopsI:1051621,troopsC:557731,troopsA:1186468});
 const same=E.detect(fixture(w,h),w,h);
 assert.deepEqual(signature(same),reference,'scaled screen '+w+'x'+h);
}
// A truly missing number stays unknown; don't accidentally use nearby
// global troop totals or another class's quantities.
const missing=fixture(1080,1920).filter(x=>x.text!=='557.731');
const out=E.detect(missing,1080,1920);
assert.equal(out.find(e=>e.type===1).count,null);
assert.equal(E.count('1.116.468'),1116468);
assert.equal(E.count('1116468'),1116468);
assert.equal(E.count('188,7 Tsd.'),null);
// User's second sample includes three *small* veteran unit groups (560).
// They must be included in the totals rather than erased as OCR failures.
assert.equal(E.count('560'),560);
assert.equal(E.readTextCount('Veteran Cavalry\n560'),560);
assert.equal(E.readTextCount('Spitzen Infanterie\n626.621'),626621);
assert.equal(E.readTextCount('1 116 468'),1116468);
const mixed=[
 {type:0,count:23159},{type:1,count:18632},{type:2,count:18567},
 {type:0,count:19380},{type:1,count:26947},{type:2,count:27231},
 {type:0,count:560},{type:1,count:560},{type:2,count:560}
];
assert.deepEqual({...E.totals(mixed)},{troopsI:43099,troopsC:46139,troopsA:46358},
 'all tier groups including 560 must be added');
const partial=mixed.map(x=>({...x}));partial[3].count=null;
const incomplete=E.totals(partial);
assert.equal('troopsI' in incomplete,false,'missing one infantry tier must invalidate total');
assert.equal(incomplete.troopsC,46139);
const withFallback=E.detect(fixture(1080,1920),1080,1920);
withFallback[0].count=null;withFallback[1].count=null;
E.recoverSingleEntries(withFallback,{troopsI:626621,troopsC:557731,troopsA:1116468});
assert.deepEqual(Array.from(withFallback,e=>e.count),[626621,557731,1116468],
 'a failed entry OCR must not delete separately recognized quantities');
const repeated=mixed.map(e=>({...e}));repeated[0].count=null;
E.recoverSingleEntries(repeated,{troopsI:23159});
assert.equal(repeated[0].count,null,'never apply one-class fallback to mixed tiers');
// Real OCR sometimes breaks a class name into multiple neighboring tokens.
for(const [w,h] of [[640,1386],[1080,1920]]){
 const split=fixture(w,h).flatMap(word=>{
  if(word.text==='Infanterie'){
   const box=word.bbox,middle=box.x0+(box.x1-box.x0)*.53;
   return [{text:'Infan',bbox:{...box,x1:middle}},
    {text:'terie',bbox:{...box,x0:middle}}];
  }
  if(word.text==='Kavallerie'){
   const box=word.bbox,middle=box.x0+(box.x1-box.x0)*.48;
   return [{text:'Kaval',bbox:{...box,x1:middle}},
    {text:'lerie',bbox:{...box,x0:middle}}];
  }
  return [word];
 });
 const entries=E.detect(split,w,h);
 assert.equal(entries.length,3,'split OCR names still produce 3 cards');
 assert.deepEqual(Array.from(entries,e=>e.count),[626621,557731,1116468]);
}
console.log('TROOP ENTRY OCR: 3+6 separate entries, repeat classes, 3 scaled screens, missing values and separators passed.');
