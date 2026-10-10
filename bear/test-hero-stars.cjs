'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const env={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/hero-stars.js','utf8'),env);
const S=env.window.NRW_BEAR_HERO_STARS;
// All samples are *measured yellow-star pixel occupancies* from the three
// 2026-10-10 user screenshots, not hand-written fictional star rows.
// The original screenshots are never copied to GitHub.
const fixtures=[["Yang",[0.273,0.277,0.275,0.279,0.182],28],["Petra",[0.278,0.276,0.277,0.278,0.179],28],["Zoe",[0.277,0.276,0.278,0.275,0.107],26],["Rosa",[0.275,0.276,0.278,0.27,0.26],30],["Triton",[0.286,0.283,0.281,0.28,0.284],30],["Sophia",[0.283,0.279,0.28,0.286,0.061],25],["Alcar",[0.283,0.281,0.282,0.284,0],24],["Marlin",[0.279,0.281,0.286,0.275,0],24],["Chenko",[0.295,0.298,0.298,0.298,0.298],30],["Howard",[0.294,0.298,0.291,0.298,0.292],30],["Jabel",[0.288,0.289,0.289,0.292,0.28],30],["Yeonwoo",[0.298,0.292,0.298,0.292,0.275],30],["Jaegar",[0.289,0.288,0.289,0.155,0],21],["Amane",[0.298,0.298,0.294,0.301,0.293],30],["Gordon",[0.3,0.3,0.301,0.301,0.293],30],["Hilde",[0.289,0.291,0.29,0.218,0],23],["Margot",[0.28,0.286,0.24,0,0],17],["Vivian",[0.281,0.277,0.188,0,0],16],["Fahd",[0.298,0.293,0.298,0.29,0.287],30],["Diana",[0.291,0.291,0.287,0.288,0.277],30],["Quinn",[0.297,0.301,0.297,0.296,0.299],30],["Eric",[0.282,0.28,0.283,0,0],18],["Saul",[0.284,0.282,0.283,0.059,0],19],["Forrest",[0.292,0.295,0.294,0.29,0.278],30],["Seth",[0.293,0.297,0.296,0.294,0.297],30],["Thrud",[0.285,0.279,0,0,0],12],["Olive",[0.296,0.296,0.294,0.297,0.294],30],["Edwin",[0.298,0.294,0.297,0.292,0.277],30],["Helga",[0.283,0,0,0,0],6],["Charles",[0.28,0.111,0,0,0],8]];
assert.equal(fixtures.length,30,'30 separate recruited heroes');
for(const [name,ratios,expected] of fixtures){
 const actual=S.stepsFromRatios(ratios);
 assert.equal(actual,expected,name+' correct full and partial flowers');
 const detail=S.parts(actual);
 assert.equal(detail.stars*6+detail.tier,expected);
}
assert.equal(S.stepsFromRatios([0,0,0,0,0]),null,'unrecruited 0/20 has no star bar');
assert.equal(S.stepsFromRatios([1,1,1,1,1]),null,'beige empty cell must not be a 5★ hero');
assert.equal(S.stepsFromRatios([.28,.10,.0,0,0]),8,'partial flower must not become a whole star');
assert.equal(S.stepsFromRatios([.28,.28,.24,0,0]),17,'a 0.86-filled third flower is not full');
assert.equal(S.stepsFromRatios([.28,.28,.28,.28,.265]),30,'full five flowers are still recognized');
// Additional fixtures captured from the two new *real Android* 716x1536
// scroll screenshots (2026-10-10). These are five bright-petal ratios per
// complete hero card from the EXACT canvas scaling used by intake-ui,
// NOT cloned/generated star graphics. Screenshots themselves are not shipped.
const mobileA=[
 [[.277,.278,.286,.291,0],24],
 [[.285,.275,.291,.277,.269],30],
 [[.278,.280,.290,.222,0],23],
 [[.285,.282,.283,.259,.090],26], // 4★T2, formerly false 3★T5
 [[.270,.264,.272,.171,0],22],
 [[.275,.264,.288,.270,.093],26],
 [[.286,.288,.291,.288,.280],30],
 [[.296,.299,.296,.267,.275],30], // Quinn 5★, formerly false 3★T5
 [[.317,.320,.320,.320,.320],30],
 [[.318,.314,.320,.314,.304],30],
 [[.278,.294,.288,.294,.053],25],
 [[.301,.291,.291,.224,0],22],
 [[.323,.306,.323,.320,.182],27],
 [[.322,.314,.333,.320,.157],27],
 [[.288,.288,.302,0,0],18],
 [[.302,.280,.294,.128,0],21]
];
const mobileB=[
 [[.307,.296,.318,.318,.160],27],
 [[.290,.282,0,0,0],12],
 [[.272,.275,.280,.058,0],19],
 [[.293,.299,.294,.282,.280],30],
 [[.299,.309,.307,.306,.309],30],
 [[.306,.301,.315,.304,.296],30],
 [[.299,.307,.315,.294,.299],30],
 [[.318,.315,.318,.301,.059],25],
 [[.264,.261,.269,.056,0],19],
 [[.272,0,0,0,0],6],
 [[.261,.219,0,0,0],11], // partial second flower, not 2 full
 [[0,0,0,0,0],null] // 0/20 (unrecruited)
];
for(const [image,fixtures] of [['photo1',mobileA],['photo2',mobileB]]){
 for(const [index,[ratios,expected]] of fixtures.entries()){
  assert.equal(S.stepsFromRatios(ratios),expected,
   image+' hero '+(index+1)+' matches visually inspected mobile flowers');
 }
}
assert.equal(mobileA.length+mobileB.length,28,'28 cards/slots exercised');
assert.equal(S.analyze([.296,.299,.296,.267,.275]).review,false,
 'full fourth flower 90% bright is still confidently full');
assert.equal(S.analyze([.261,.219,0,0,0]).steps,11,
 'five-petal partial remains below full flower cutoff');
const edge=S.analyze([.28,.28,.28,.28,.118]);
assert.equal(edge.review,true,'borderline tier is exposed for confirmation');
const existing={starSteps:null,starReview:true,starConfidence:0};
S.merge(existing,{starSteps:30,starReview:false,starConfidence:1});
assert.equal(existing.starSteps,30,'overlap fills unknown stars with clearer scan');
S.merge(existing,{starSteps:24,starReview:false,starConfidence:1});
assert.equal(existing.starSteps,null,'conflicting overlapping star scans require review');
assert.equal(existing.starReview,true);
const manuallyFixed={starSteps:30,starManual:true};
S.merge(manuallyFixed,{starSteps:24,starReview:false});
assert.equal(manuallyFixed.starSteps,30,'manual star correction cannot be overwritten');
const ui=fs.readFileSync(__dirname+'/intake-ui.js','utf8');
assert.match(ui,/NRW_BEAR_HERO_STARS\?\.merge\(earlier,tile\)/);
assert.match(ui,/starSteps:stars\.review\?null:stars\.starSteps/,
 'uncertain stars do not silently influence the leader ranking');
// Full-resolution 955x2048 Android screenshots from the October 10 browser
// feedback reproduced exact false values under current fixed star centres.
// No threshold alone can tell a 4★T4 from a visually dim fifth flower.
const newest=[
 {name:'Yang',ratios:[.275,.270,.278,.277,0],raw:24,claimed:28},
 {name:'Sophia',ratios:[.272,.270,.277,.213,0],raw:23,claimed:24},
 {name:'Rosa',ratios:[.274,.272,.274,.266,.093],raw:26,claimed:30}
];
for(const fx of newest){
 const guessed=S.analyze(fx.ratios);
 assert.equal(guessed.steps,fx.raw,fx.name+' reproduces the old brightness estimate');
 assert.equal(guessed.review,true,fx.name+' must NOT have an unverified guess auto-accepted');
}
const clearFive=S.analyze([.294,.299,.309,.301,.283]);
assert.equal(clearFive.steps,30);
assert.equal(clearFive.review,false,'five clearly lit flowers can still auto import');
const currentUI=fs.readFileSync(__dirname+'/intake-ui.js','utf8');
assert.match(currentUI,/starSteps:stars\.review\?null:stars\.starSteps/);
assert.match(currentUI,/const stars=tile\.starSteps===null\?0:/,
 'uncertain new stars must NOT be overwritten by cached screenshot progression');

console.log('HERO STARS: 30 previous plus 28 new Android samples, overlaps, 5★ and ambiguous tiers passed.');
