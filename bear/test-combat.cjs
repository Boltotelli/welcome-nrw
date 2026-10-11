/* Standalone assertions for the unvalidated Bear model.
 * Run: node bear/test-combat.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/combat.js','utf8'),sandbox,{filename:'combat.js'});
const B=sandbox.window.NRW_BEAR_COMBAT;
assert.ok(B,'combat module available');
for(const kind of B.troopKeys){
 assert.equal(B.attack[kind].length,11);
 for(const row of B.attack[kind]){
  assert.equal(row.length,9);
  assert.ok(row.every((n,i)=>Number.isFinite(n)&&n>0&&(i===0||n>=row[i-1])));
 }
}
assert.equal(B.troopAttack('infantry',6,0),243);
assert.equal(B.troopAttack('cavalry',6,0),730);
assert.equal(B.troopAttack('archer',6,0),974);
assert.equal(B.troopAttack('archer',11,8),3316);
assert.equal(B.troopAttack('archer',12,0),null);
const tiers=[{tier:6,tg:0},{tier:6,tg:0},{tier:6,tg:0}];
const stats={iAtk:0,iLet:0,cAtk:0,cLet:0,aAtk:0,aLet:0};
assert.equal(B.ready(stats,tiers),true);
assert.equal(B.ready({iAtk:0},tiers),false);
assert.equal(B.ready(stats,[{tier:0,tg:0},tiers[1],tiers[2]]),false);
assert.equal(B.damage([6000,6000,6000],{},tiers),null);
const simulated=B.damage([6000,6000,6000],stats,tiers,5);
assert.ok(Math.abs(simulated-16796.47)<1,'T6 published illustrative benchmark');
assert.ok(B.damage([0,0,12000],stats,tiers,5)>B.damage([0,0,12000],stats,tiers,0));
assert.ok(B.damage([0,0,12000],{...stats,aAtk:100},tiers,5)>B.damage([0,0,12000],stats,tiers,5));
// Every displayed diagnostic MUST be derived from the same computation
// that drives the damage engine; avoid an unrelated UI approximation.
const trace=B.breakdown([6000,6000,6000],stats,tiers,5);
assert.ok(trace&&trace.totalTroops===18000);
assert.equal(trace.trapLevel,5);
assert.equal(trace.trapAttackPct,25);
assert.ok(Math.abs(trace.totalTenRounds-simulated)<1e-8);
assert.equal(trace.types[0].baseAttack,243);
assert.equal(trace.types[0].appliedAttackPct,25);
assert.equal(trace.types[0].lethalityPct,0);
assert.ok(Math.abs(trace.types[2].typeBonus-1.1)<1e-9);
// When fewer than 5000 own troops are present, the army factor must
// use the smaller army, not blindly multiply by all 5000 Bear troops.
const sparse=B.breakdown([300,300,400],stats,tiers,5);
assert.equal(sparse.armyMin,1000);
assert.ok(sparse.types.every(t=>Math.abs(t.armyFactor-Math.sqrt(t.count*1000))<1e-8));
// Demonstrate a 21-fold model spread is possible from attack/lethality
// inputs alone, without inventing a hidden conversion constant.
const historical=[1818,21818,158184],t10=[
 {tier:10,tg:6},{tier:10,tg:5},{tier:10,tg:6}];
const all=(atkLet)=>({iAtk:atkLet,iLet:atkLet,cAtk:atkLet,cLet:atkLet,aAtk:atkLet,aLet:atkLet});
const low=B.breakdown(historical,all(250),t10,5);
const high=B.breakdown(historical,all(1550),t10,5);
assert.ok(low.totalTenRounds>1.50e6&&low.totalTenRounds<1.60e6);
assert.ok(high.totalTenRounds>32e6&&high.totalTenRounds<33e6);
assert.ok(high.totalTenRounds/low.totalTenRounds>20);
assert.ok(high.types[2].count===158184);

console.log('BEAR COMBAT: shared input trace, fixed pitfall, low-troop armyMin and T10 1.55m/32.5m diagnostic examples passed.');
