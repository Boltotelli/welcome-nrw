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
console.log('HERO STARS: 30 real-screen ratio fixtures, cropped 0/20/empty, partial petals passed.');
