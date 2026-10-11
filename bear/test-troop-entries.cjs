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
const base=fixture(1080,1920);
const doubled=[...base,...base.map(w=>({text:w.text,bbox:{
 x0:w.bbox.x0+2,x1:w.bbox.x1+2,y0:w.bbox.y0+2,y1:w.bbox.y1+2}}))];
assert.deepEqual(Array.from(E.detect(doubled,1080,1920),e=>e.count),
 [626621,557731,1116468], 'overlapping OCR passes must not double any quantity');
// Regression: bad production OCR must be treated as uncertain, not 3 soldiers.
const corrupted=[{type:0,count:605476},{type:1,count:3},{type:2,count:605476}];
E.flagAmbiguousCounts(corrupted,{troopsI:626634,troopsC:557731,troopsA:1116474});
E.recoverSingleEntries(corrupted,{troopsI:626634,troopsC:557731,troopsA:1116474});
assert.ok(corrupted.every(x=>x.count===null&&x.uncertainCount),
 'conflicting troop amounts or badge digits cannot be applied');
const duplicates=[{type:0,count:605476},{type:1,count:605476},{type:2,count:1116474}];
E.flagAmbiguousCounts(duplicates,{});
assert.equal(duplicates[0].count,null);
assert.equal(duplicates[1].count,null);
// Generalized geometry, NOT one hardcoded screenshot. Different screenshot
// resolutions, amounts, class positions and extra rows must all keep IDs.
function flexible(w,h,amounts,layout){
 const rows=[
  ['Infanterie',amounts[0],layout.x1,layout.y1],
  ['Kavallerie',amounts[1],layout.x2,layout.y1],
  ['Bogenschützen',amounts[2],layout.x1,layout.y2]
 ];
 const output=[];
 for(const [name,count,x,y] of rows){
  output.push(word('Spitzen',x,y,.060,.012,w,h),
    word(name,x+.067,y,.155,.013,w,h),
    word(count,x+.002,y+.023,.155,.014,w,h));
 }
 output.push(word('5/5',.45,.15,.05,.018,w,h),
  word('1,2M/1,2M',.15,.13,.19,.017,w,h));
 return output;
}
for(const [w,h,counts,expected,layout] of [
 [716,1536,['325.027','325.339','605.476'],[325027,325339,605476],{x1:.21,x2:.66,y1:.24,y2:.32}],
 [1080,1920,['626.634','557.731','1.116.474'],[626634,557731,1116474],{x1:.185,x2:.58,y1:.28,y2:.42}],
 [1440,2960,['76.304','19.873','2.012.004'],[76304,19873,2012004],{x1:.215,x2:.63,y1:.34,y2:.49}],
 [720,1280,['8.203','325.339','112.500'],[8203,325339,112500],{x1:.18,x2:.575,y1:.22,y2:.36}],
 [1080,2340,['560','102.000','998.001'],[560,102000,998001],{x1:.20,x2:.61,y1:.26,y2:.37}]
]){
 const output=E.detect(flexible(w,h,counts,layout),w,h);
 assert.deepEqual(Array.from(output,x=>x.count),expected,'fully variable '+w+'x'+h);
 assert.deepEqual(Array.from(output,x=>x.type),[0,1,2],'class association '+w+'x'+h);
 assert.ok(output.every(x=>x.elite===true),'Spitzen implies X/T10 '+w+'x'+h);
 assert.ok(output.every(x=>x.icon&&x.anchor),'independent dynamic badge anchor '+w+'x'+h);
}
// The second line must not be accidentally swallowed by a crop from the first.
const extra=[...flexible(1080,1920,['21.000','18.000','63.000'],
 {x1:.18,x2:.58,y1:.26,y2:.38}),
 word('Spitzen',.59,.46,.060,.012,1080,1920),
 word('Infanterie',.657,.46,.155,.013,1080,1920),
 word('560',.592,.483,.14,.014,1080,1920)];
const rows=E.detect(extra,1080,1920);
assert.equal(rows.length,4);
assert.deepEqual({...E.totals(rows)},{troopsI:21560,troopsC:18000,troopsA:63000});
console.log('TROOP ENTRY OCR: 3+6 separate entries, repeat classes, 3 scaled screens, missing values and separators passed.');
