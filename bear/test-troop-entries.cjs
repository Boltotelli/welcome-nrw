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
// The screenshot supplied on 2026-10-11 is a fixture, not a lookup
// table: arbitrary quantities, resolutions and HUD translations are tested.
function dynamic(w,h,shift,values){
 const src=[
  ['Spitzen','Infanterie',values[0],.22,.244],
  ['Spitzen','Kavallerie',values[1],.63,.244],
  ['Spitzen','Bogenschützen',values[2],.22,.332]
 ];
 return src.flatMap(([grade,klass,count,x,y])=>[
  word(grade,x,y+shift,.08,.012,w,h),
  word(klass,x+.088,y+shift,.145,.012,w,h),
  word(count,x,y+shift+.023,.15,.014,w,h)
 ]);
}
for(const [w,h,dy,counts] of [
 [716,1536,0,['325.027','325.339','605.476']],
 [1080,1920,.028,['626.634','557.731','1.116.474']],
 [1440,2560,-.025,['1.000','2.250','4.567.890']],
 [720,1280,.058,['123.456','7.654','891.234']]
]){
 const e=E.detect(dynamic(w,h,dy,counts),w,h);
 assert.deepEqual(Array.from(e,x=>x.count),
  counts.map(x=>Number(x.replace(/[.]/g,''))),
  'independent anchored amounts '+w+'x'+h);
 assert.ok(e.every(x=>x.labelBox&&x.crop&&x.icon),'no fixed badge/quantity rectangles');
}
const equal=[{type:0,count:560,confirmedIndependent:true},
 {type:1,count:560,confirmedIndependent:true}];
E.flagAmbiguousCounts(equal,{});
assert.deepEqual(equal.map(x=>x.count),[560,560],
 'independently confirmed identical small troop groups must survive');

console.log('TROOP ENTRY OCR: 3+6 separate entries, repeat classes, 3 scaled screens, missing values and separators passed.');

// OCR-word bounding boxes from the supplied ORIGINAL 716x1536 screenshot.
// Unlike invented layout tests, these include real missing/sliced tokens.
const originalOCR=[
 ['Spitzen',149,366,70,32],['Infanterie',229,366,102,32],
 ['Kavallerie',548,371,99,17],['er',135,370,89,49],
 ['027',203,401,41,18],['325.339',471,401,92,18],
 ['Spitzen',148,492,63,28],['Bogenschütze',220,492,110,28],
 ['605.476',153,526,95,18]
].map(([text,x,y,w,h])=>({text,bbox:{x0:x,y0:y,x1:x+w,y1:y+h}}));
const detectedReal=E.detect(originalOCR,716,1536);
assert.deepEqual(Array.from(detectedReal,e=>e.type),[0,1,2]);
assert.equal(E.count('027'),null,'a sliced OCR count 027 is NOT 27 soldiers');
assert.deepEqual(Array.from(detectedReal,e=>e.count),[null,325339,605476],
 'cavalry works without the missing Spitzen prefix; broken infantry must stay blank');
assert.ok(detectedReal.every(e=>e.crop.x*716<=(e.type===0?153:e.type===1?471:153)),
 'class-labelled crop covers the left-indented inventory quantity');
assert.ok(detectedReal[0].crop.y*1536<403,'infantry focused crop includes its real 325.027 baseline');
assert.ok(detectedReal[0].crop.y*1536+detectedReal[0].crop.h*1536<492,
 'focused crop cannot borrow the next class row');

// Real 716×1536 screenshot OCR (including the missing "325" prefix in
// the whole-screen pass). Verify the SPATIAL crop, not fixed pixel patches.
// An independently read crop is then expected to recover the true amount.
const dynamicCropBoxes=E.detect(originalOCR,716,1536).map(e=>({
 type:e.type,
 x:e.crop.x*716,y:e.crop.y*1536,
 width:e.crop.w*716,height:e.crop.h*1536
}));
assert.deepEqual(Array.from(dynamicCropBoxes,b=>b.type),[0,1,2]);
for(const [i,[left,top,right,bottom]] of [
 [140,393,380,450],  // infantry 325.027, without the gold badge
 [462,380,675,448],  // cavalry 325.339, even with 'Spitzen' missing
 [138,514,380,577]   // archer 605.476, not copied to infantry
].entries()){
 const b=dynamicCropBoxes[i];
 assert.ok(b.x>=left&&b.x<=right,'localized left crop '+i);
 assert.ok(b.y>=top&&b.y<=bottom,'localized vertical crop '+i);
 assert.ok(b.x+b.width<=710,'crop stays inside image '+i);
 assert.ok(b.y+b.height<=bottom,'does not touch next troop card '+i);
}
assert.equal(E.readTextCount('325.027'),325027);
assert.equal(E.readTextCount('325.339'),325339);
assert.equal(E.readTextCount('605.476'),605476);
assert.equal(E.readTextCount('27'),27,'legitimate short inventory');
assert.equal(E.readTextCount('3 27'),null,'ambiguous small OCR fragments rejected');
const fromFocused=[
 {type:0,count:325027,trustedLabelCrop:true},
 {type:1,count:325339,trustedLabelCrop:true},
 {type:2,count:605476,trustedLabelCrop:true}
];
E.flagAmbiguousCounts(fromFocused,{});
assert.deepEqual({...E.totals(fromFocused)},
 {troopsI:325027,troopsC:325339,troopsA:605476});
