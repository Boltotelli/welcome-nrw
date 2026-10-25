/* Kingshot Bear V3: cited community troop unlocks and sampled 10-turn damage.
 * Regression fixtures: ks-toolkit.com/data/troops/archer/ and /cavalry/
 * and kingshotguides.com/guide/bear-trap-damage-mechanics-and-example-simulation/
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root={window:{},Math,console};root.window.window=root.window;
for(const file of ['combat.js','damage-skills.js','formation-core.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),root,{filename:file});
const B=root.window.NRW_BEAR_COMBAT,D=root.window.NRW_BEAR_SKILL_DAMAGE,
 F=root.window.NRW_BEAR_FORMATION;
const approx=(actual,expected,tol=1e-9)=>assert(Math.abs(actual-expected)<tol,
 `expected ${expected}, got ${actual}`);
approx(B.troopSkills('archer',6,0).mean,1);
approx(B.troopSkills('archer',7,0).mean,1.10); // Volley starts T7
approx(B.troopSkills('archer',10,2).mean,1.10);
approx(B.troopSkills('archer',10,3).mean,1.10*1.10); // 20% × 50% Howling
approx(B.troopSkills('archer',10,5).mean,1.10*1.15); // 30% × 50%
approx(B.troopSkills('archer',10,8).mean,1.04*1.10*1.225); // Truegold Wind
approx(B.troopSkills('cavalry',10,2).mean,1);
approx(B.troopSkills('cavalry',10,3).mean,1.10);
approx(B.troopSkills('cavalry',10,5).mean,1.15);
approx(B.troopSkills('cavalry',10,8).mean,1.15); // TG8 defensive guard only
approx(B.troopSkills('infantry',10,8).mean,1); // no offensive proc
const stats={iAtk:0,iLet:0,cAtk:0,cLet:0,aAtk:0,aLet:0};
const t6=Array.from({length:3},()=>({tier:6,tg:0}));
assert.equal(Math.ceil(B.damage([6000,6000,6000],stats,t6,5)),16797);
assert(B.damage([0,2500,2500],stats,t6,5)>0,'No forced own Infantry floor');
assert(B.damage([0,2500,0],stats,t6,5)>0,'March smaller than 5000 is valid');
assert(F.ratioForTarget(180000,[1,10,89])[0]<2,'1% own infantry is permitted');
const mixed={groups:[{tier:10,tg:5,count:500},{tier:10,tg:8,count:500}]};
const attack=B.effectiveAttackForGroup(mixed,'archer',1000);
const expected=(B.effectiveTroopAttack('archer',10,5)+
 B.effectiveTroopAttack('archer',10,8))/2;
approx(attack,expected,1e-7);
const mixedResult=B.breakdown([0,0,1000],stats,[t6[0],t6[1],mixed],5);
approx(mixedResult.types[2].troopSkillFactor,
 expected/((B.troopAttack('archer',10,5)+B.troopAttack('archer',10,8))/2),1e-9);
const tiers=[{tier:10,tg:5},{tier:10,tg:5},{tier:10,tg:8}];
const numbers=[1000,30000,100000];
const d=B.troopDistribution(numbers,stats,tiers,5,1000);
assert(d&&d.ready&&d.samples===1000);
approx(d.baseline,B.damage(numbers,stats,tiers,5),1e-7);
assert(d.average>0.94*d.baseline&&d.average<1.06*d.baseline,
 '1000-turn samples should converge near the analytic expectation');
assert(d.percentile95>d.average,'Chance procs should create a positive tail');
assert(d.theoreticalMaximum>d.percentile95,'P95 is not the all-procs maximum');
assert(d.firstFive.length===5&&d.firstFive.every(Number.isFinite));
const repeat=B.troopDistribution(numbers,stats,tiers,5,1000);
assert.equal(repeat.average,d.average,'same inputs should generate stable results');
const prepared={ready:true,modifiers:{attack:0,lethality:0,classAttack:[0,0,0],
 classDamage:[1,1,1],lowClassDamage:[1,1,1],lowDamage:1,damage:1},
 valoraPoints:0,unmodeled:[]};
const base=D.evaluate(prepared,numbers,tiers,stats,B,1),join=D.evaluate(prepared,numbers,tiers,stats,B,2.25);
assert(base.ready&&base.distribution?.ready&&join.ready);
approx(join.estimatedIndex/base.estimatedIndex,2.25);
approx(join.distribution.average/base.distribution.average,2.25);
approx(join.distribution.percentile95/base.distribution.percentile95,2.25);
console.log('PASS: TG3/TG5/TG8, T7 Volley, mixed tiers, 16797 benchmark, no 5000 own infantry floor, reproducible 10-turn Monte Carlo and joiner stacking.');
