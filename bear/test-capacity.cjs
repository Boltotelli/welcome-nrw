'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=__dirname,html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const core=fs.readFileSync(path.join(dir,'capacity-core.js'),'utf8');
const ui=fs.readFileSync(path.join(dir,'capacity-ui.js'),'utf8');
const wizard=fs.readFileSync(path.join(dir,'wizard.js'),'utf8');
new vm.Script(core);new vm.Script(ui);
const mock={window:{}};vm.runInNewContext(core,mock);
const C=mock.window.NRW_BEAR_CAPACITY;
const catalog={pets:[{name:'Mighty Bison',bearSkill:{id:'squad_capacity',values:
 [1500,3000,4500,6000,7500,9000,10500,12000,13500,15000]}}]};
const sample={
 values:{cap:100000,master:27000,pet:9000},
 v2:{ownHeroes:['Rosa','Alcar','Yang'],
  manualHeroes:{Rosa:{level:80},Alcar:{level:80},Yang:{level:80}},
  valora:[10,4,5,9],
  petSkillRanks:{'Mighty Bison':6},
  petActive:{'Mighty Bison':true}}
};
const calc=()=>C.breakdown(sample,catalog);
assert.equal(C.heroCapacityByLevel.length,81,'exact documented level 1–80 table');
assert.equal(C.levelCapacity(1),65);
assert.equal(C.levelCapacity(40),7775);
assert.equal(C.levelCapacity(60),12370);
assert.equal(C.levelCapacity(80),13470);
assert.equal(C.levelCapacity(39),null,'published Lv39 is inconsistent with Lv40; do not guess');
assert.equal(C.levelCapacity(0),null);
assert.equal(C.levelCapacity(81),null);
let b=calc();
assert.equal(b.heroes,40410,'3 x lvl 80');
assert.equal(b.master,27000,'Valora level 9 x 3000 once');
assert.equal(b.pet,9000,'active Bison rank 6 x 1500 once');
assert.equal(b.total,176410,'base + three heroes + Valora + active Bison');
assert.equal(b.complete,true);
assert.equal(b.masterSource,'skill');
assert.equal(b.petSource,'skill');
sample.v2.petActive['Mighty Bison']=false;
b=calc();assert.equal(b.pet,0,'Bison disabled overrides stale advanced manual value');
assert.equal(b.total,167410);
sample.v2.petActive['Mighty Bison']=true;
sample.v2.manualHeroes.Rosa.level=60;sample.v2.manualHeroes.Alcar.level=70;
b=calc();assert.equal(b.heroes,12370+13070+13470);
assert.equal(b.total,100000+(12370+13070+13470)+27000+9000);
sample.values.heroCapManual=50000;
b=calc();assert.equal(b.heroes,50000,'manual overrides hero bonus, never adds');
assert.equal(b.total,186000);
delete sample.values.heroCapManual;
sample.v2.manualHeroes.Alcar.level=39;
b=calc();assert.equal(b.heroesPending,true);assert.equal(b.complete,false);
sample.v2.manualHeroes.Alcar.level=80;
sample.v2.manualHeroes.Yang.level=null;
b=calc();assert.equal(b.heroesPending,true);
sample.v2.manualHeroes.Yang.level=80;
sample.v2.manualHeroes.Alcar.level=80;
sample.v2.manualHeroes.Rosa.level=80;
delete sample.v2.petSkillRanks['Mighty Bison'];
sample.v2.petActive['Mighty Bison']=false;
b=calc();assert.equal(b.pet,9000,'legacy manual pet still available when no scan exists');
sample.v2.petSkillRanks['Mighty Bison']=6;
delete sample.values.cap;
b=calc();assert.equal(b.total,null,'base not given => no falsely certain total');
assert.match(html,/capacity-core\.js\?v=/);
assert.match(html,/capacity-ui\.js\?v=/);
assert.ok(html.indexOf('capacity-core.js')<html.indexOf('capacity-ui.js'));
assert.ok(html.indexOf('capacity-ui.js')<html.indexOf('wizard.js'));
assert.ok(html.includes("NRW_BEAR_CAPACITY?.breakdown(model"),'optimizer shares exact calculation');
assert.ok(wizard.includes("capacityHost.hidden=false"),'same-page manual capacity is always visible');
assert.ok(wizard.includes("capacityUI?.refresh()"),'live updates on step 8');
assert.ok(wizard.includes("capacityKnown&&Number(B.capacity?.()||0)>0"),
 'result optimization must not silently omit unknown hero capacity');
assert.ok(ui.includes("document.getElementById('heroCapManual')"),'reuse existing override, not a new form');
assert.ok(!ui.includes('localStorage.'),'no second persistence model');
console.log('CAPACITY: 1–80 hero lookup, 39 unknown, full arithmetic, no double counting, live review, existing wizard verified.');
