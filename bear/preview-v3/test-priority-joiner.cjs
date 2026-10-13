'use strict';
// User policy regression: preset Joiner 5/15/80; Archer shortage decisions
// follow weaker->Starter, stronger->Joiners, similar->Joiners-first split.
const assert=require('node:assert/strict'),fs=require('node:fs'),
 vm=require('node:vm'),path=require('node:path');
const w={window:{}};vm.runInNewContext(fs.readFileSync(
 path.join(__dirname,'formation-core.js'),'utf8'),w);
const f=w.window.NRW_BEAR_FORMATION;
const ratio=[3,17,80],caps=Array(7).fill(194560),weights=caps.map(()=>[.2,.5,1]);
assert.equal(f.joinerBaseline({v2:{kingdomGeneration:4}},{}).proportions.join('/'),'5/15/80');
assert.equal(Array.from(f.JOIN_STANDARD).join('/'),'5/15/80');
const validate=(output,stock)=>{
 assert.equal(output.rows.length,caps.length);
 for(const [i,row] of output.rows.entries()){
  const r=Array.from(row),p=Array.from(output.ratios[i]),n=r.reduce((a,b)=>a+b,0);
  assert(n<=caps[i]);
  assert(p.every(Number.isInteger));
  assert.equal(p.reduce((a,b)=>a+b,0),n?100:0);
  assert.equal(r[0],Math.floor(n*p[0]/100));
  assert.equal(r[1],p[2]===0?n-r[0]:Math.floor(n*p[1]/100));
  assert.equal(r[2],n-r[0]-r[1]);
 }
 for(let k=0;k<3;k++){
  assert(output.used[k]<=stock[k], 'overspent type '+k);
  assert.equal(output.used[k]+output.unallocated[k],stock[k]);
 }
};
const enough=[250000,400000,1200000];
for(const scenario of ['weaker','similar','stronger']){
 const p=f.priorityAllocation(caps,enough,ratio,scenario,weights);
 validate(p,enough);
 for(let i=1;i<7;i++)assert.equal(Array.from(p.ratios[i]).join('/'),'5/15/80');
 assert.equal(p.archerShortage,0);
 assert.equal(p.rows[0][2],Math.min(enough[2],caps[0]-Math.floor(caps[0]*.03)-Math.floor(caps[0]*.17)));
}
const scarce=[250000,600000,750000];
const starter=f.priorityAllocation(caps,scarce,ratio,'weaker',weights);
const joined=f.priorityAllocation(caps,scarce,ratio,'stronger',weights);
const shared=f.priorityAllocation(caps,scarce,ratio,'similar',weights);
for(const out of [starter,joined,shared])validate(out,scarce);
assert.equal(starter.priority,'starter');
assert.equal(joined.priority,'joins');assert.equal(shared.priority,'joins');
assert(starter.rows[0][2]>joined.rows[0][2],'Starter must receive Archers before Joiners when my account is stronger');
assert(joined.rows[1][2]>starter.rows[1][2],'Joiners must receive Archers first when others are stronger');
assert.equal(joined.rows[0][2],shared.rows[0][2],'Equal-strength rule also gives Joiners first access');
const joins=joined.rows.slice(1).map(x=>x[2]);
assert(Math.max(...joins)-Math.min(...joins)<=1946,'Similar-capacity Joiners should split Archer stock evenly to at most one integer percentage');
const solo=f.priorityAllocation([194560],[11000,30000,90000],ratio,'similar',[[.3,.6,1]]);
assert(solo.rows.length===1);assert(solo.used[2]<=90000);
const noInf=f.priorityAllocation(caps,[0,10000,1500],ratio,'stronger',weights);
validate(noInf,[0,10000,1500]);
console.log('PASS: 5/15/80 full-stock, all 3 scenarios, join sharing, solo rally, whole-percent stock safety');
