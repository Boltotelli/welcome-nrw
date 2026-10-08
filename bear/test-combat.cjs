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
console.log('BEAR COMBAT: 16 checks passed, T6 baseline '+simulated.toFixed(2));
