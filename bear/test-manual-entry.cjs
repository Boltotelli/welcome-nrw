'use strict';
/* Regression for screen-size independent manual Bear Trap data entry.
 * Real browser tap/keyboard UX still requires mobile smoke testing.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path'),src=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
const catalog=vm.runInNewContext(src('catalog.js')+'\nwindow.NRW_BEAR_CATALOG;', {window:{}});
const env={window:{NRW_BEAR_CATALOG:catalog},document:{getElementById:()=>null}};
vm.runInNewContext(src('manual-entry.js'),env);
const M=env.window.NRW_BEAR_MANUAL;
assert.ok(M,'manual-entry.js exports manual module');
assert.equal(M.rarity('Chenko'),'epic');
assert.equal(M.rarity('Amane'),'epic');
assert.equal(M.rarity('Olive'),'rare');
assert.equal(M.rarity('Long Fei'),'legendary');
assert.equal(M.rarity('Alcar'),'legendary');
assert.equal(catalog.heroes.length,37,'all 37 hero portraits in the manual gallery');
assert.ok(!src('manual-entry.js').includes('Tesseract'),'manual entry must not depend on OCR');
const groups=[
 {type:'infantry',tier:10,tg:6,count:100},
 {type:'infantry',tier:8,tg:1,count:50},
 {type:'cavalry',tier:10,tg:5,count:250},
 {type:'archer',tier:10,tg:6,count:700}
];
const mix=M.aggregateGroups(groups);
assert.deepEqual(Array.from(mix.stock),[150,250,700]);
assert.equal(mix.valid,4);
assert.equal(mix.levels[0].tier,0,'mixed levels must not collapse to one tier');
const repeated=M.aggregateGroups([{type:'infantry',tier:10,tg:6,count:100},
 {type:'infantry',tier:10,tg:6,count:50}]);
assert.equal(repeated.levels[0].tier,10);
assert.equal(repeated.levels[0].tg,6);
assert.equal(M.validGroup({type:'infantry',tier:10,tg:null,count:100}),false,
 'missing TG rank must never be guessed');
const model={values:{troopsI:0,troopsC:0,troopsA:0},v2:{troopGroups:groups}};
M.syncGroups(model);
assert.deepEqual([model.values.troopsI,model.values.troopsC,model.values.troopsA],[150,250,700]);
assert.equal(model.v2.troopTiers[0].tier,0);
const combatEnv={window:{}};
vm.runInNewContext(src('combat.js'),combatEnv);
const C=combatEnv.window.NRW_BEAR_COMBAT;
const levels=C.configure(model.v2);
assert.equal(levels[0].groups.length,2);
const stats={iAtk:200,iLet:200,cAtk:200,cLet:200,aAtk:200,aLet:200};
assert.equal(C.ready(stats,levels),true,'known mixed tiers are valid');
const expected=(100*C.troopAttack('infantry',10,6)+50*C.troopAttack('infantry',8,1))/150;
assert.equal(C.attackForGroup(levels[0],'infantry',150),expected);
const score=C.breakdown([150,250,700],stats,levels,5);
assert.ok(score?.totalTenRounds>0);
assert.equal(score.types[0].baseAttack,expected);
const allocated=C.allocateLevels([[100,100,400],[50,150,300]],levels);
assert.equal(allocated[0][0].groups[0].tier,10);
assert.equal(allocated[0][0].groups[0].count,100);
assert.equal(allocated[1][0].groups[0].tier,8);
assert.equal(allocated[1][0].groups[0].count,50);
assert.equal(allocated[1][0].groups.reduce((s,g)=>s+g.count,0),50);
assert.ok(C.damage([100,100,400],stats,allocated[0],5)>0);
assert.ok(C.damage([50,150,300],stats,allocated[1],5)>0);
assert.equal(C.damage([151,250,700],stats,levels,5),null,'no phantom units beyond inventory');
const html=src('index.html'),wizard=src('wizard.js'),intake=src('intake-ui.js');
assert.match(html,/manual-entry\.js\?v=/);
assert.match(html,/bear-manual-hero-card\.is-owned img\{filter:none/);
assert.match(html,/grayscale\(1\)/);
assert.match(wizard,/NRW_BEAR_MANUAL\?\.mount/);
assert.match(wizard,/manualEntry\?\.render\(idx\)/);
assert.match(intake,/if\(item\.type==='troops'\)delete v\.troopGroups/);
assert.match(src('simulation-core.js'),/combat\.allocateLevels\?\./);
assert.match(html,/allocatedTiers=engine\.allocateLevels/);
console.log('MANUAL BEAR: 37 hero roster, rarity, mixed T\\/TG stocks, per-march consumption and OCR switch regression passed.');
