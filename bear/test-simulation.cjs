'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=__dirname;
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const sim=read('simulation-core.js'),ui=read('simulation-ui.js'),
 form=read('formation-core.js'),wizard=read('wizard.js'),html=read('index.html');
for(const [name,source] of [['simulation-core',sim],['simulation-ui',ui],['formation-core',form],['wizard',wizard]])new vm.Script(source,{filename:name+'.js'});
const context={window:{}};vm.runInNewContext(sim,context);vm.runInNewContext(form,context);
vm.runInNewContext(read('combat.js'),context);
const S=context.window.NRW_BEAR_SIMULATION,F=context.window.NRW_BEAR_FORMATION,
 realCombat=context.window.NRW_BEAR_COMBAT;
const model={values:{iAtk:1200,iLet:500,cAtk:1160,cLet:600,aAtk:1400,aLet:740,
 troopsI:12500,troopsC:17500,troopsA:70000,pitfall:3},v2:{troopTiers:[
 {tier:10,tg:5},{tier:10,tg:5},{tier:10,tg:6}],squadSeparate:false}};
const combat={configure:()=>[{tier:10,tg:5},{tier:10,tg:5},{tier:10,tg:6}],
 ready:(v)=>Boolean(v&&v.aAtk),
 damage:(row,stats)=>Math.sqrt(row[0])*2+Math.sqrt(row[1])*6+Math.sqrt(row[2])*8};
const plan={
 ready:true,stock:[12500,17500,70000],total:90000,
 marches:[{slot:0,eligible:true,capacity:50000,filled:30000,troops:[600,4500,24900],ratio:[2,15,83]},
 {slot:1,eligible:true,capacity:45000,filled:30000,troops:[750,4500,24750],ratio:[3,15,82]},
 {slot:2,eligible:true,capacity:44000,filled:30000,troops:[750,4500,24750],ratio:[3,15,82]}]};
const snapshot=JSON.stringify(model);
const original=S.presetFromPlan(plan);
assert.equal(original.length,3);
assert.equal(S.ratioValid([2,15]),true);
assert.equal(S.ratioValid([2.5,15]),false,'game cannot choose decimal ratios');
assert.equal(S.ratioValid([60,41]),false,'ratio cannot exceed 100');
assert.equal(S.ratioValid([-1,10]),false);
let a=S.evaluate(plan,model,combat,F,original);
assert.equal(a.ready,true);
assert.ok(a.score.overall>0);
assert.equal(a.measures.length,3);
assert.equal(a.changes.totalPct!==null,true);
assert.deepEqual(Array.from(a.measures[0].desired),[2,15,83]);
assert.ok(a.measures.every(x=>x.actual.reduce((m,n)=>m+n,0)===100));
assert.equal(a.total,90000);
assert.ok(a.used.every((n,i)=>n<=plan.stock[i]));
assert.ok(a.measures.every((x,i)=>x.filled<=plan.marches[i].capacity));
const ratios=[[1,12],[10,10],[5,5]];
const b=S.evaluate(plan,model,combat,F,ratios);
assert.equal(b.ready,true);
assert.notEqual(b.score.overall,a.score.overall,'different ratios rerun actual damage math');
assert.ok(b.measures[1].desired.join('/')!==b.measures[2].desired.join('/'),'different joins independent');
for(const i of [0,1,2])assert.ok(b.used[i]<=plan.stock[i],'single shared troop stock');
const repeat=S.evaluate(plan,model,combat,F,ratios);
assert.equal(JSON.stringify(repeat.rows),JSON.stringify(b.rows),'deterministic');
assert.equal(JSON.stringify(model),snapshot,'simulation must not overwrite owned profile or saved formation');
assert.equal(S.evaluate(plan,model,combat,F,[[1,12],[20.5,5],[5,5]]).ready,false);
const incomplete=S.evaluate(plan,{values:{},v2:{}},combat,F,ratios);
assert.equal(incomplete.ready,true,'troop constraints still available without damage stats');
assert.equal(incomplete.score,null,'never invent game damage on missing stats');
const missing={...plan,marches:plan.marches.map((m,i)=>i===2?{...m,eligible:false,capacity:0,filled:0,troops:[0,0,0],ratio:[0,0,0]}:m)};
const z=S.evaluate(missing,model,combat,F,original);
assert.equal(z.ready,true);
assert.deepEqual(Array.from(z.rows[2]),[0,0,0],'empty join never gets fictional troops');
assert.equal(z.missingLeads,1);
// Five observed personal scores (109, 133, 144, 118, 131 million)
 // have mean 127m, but cannot identify the unknown four join skills or
 // unmodified baseline. Absolutely NO user-supplied scalar is used in math.
assert.ok(!ui.includes('bearCalibration'), 'no manual 144m scaling in UI');
assert.ok(!sim.includes('calibrateOwn('), 'drop one-battle extrapolation');
assert.ok(!ui.includes('prefCalFromUrl'), 'no deep-link injection of a historical damage scale');
assert.ok(ui.includes('renderSkillScenarios(data)'), 'show join skills as separate scenarios');
assert.equal(S.JOIN_SCENARIOS.length,4);
const ownRow=plan.marches[0].troops;
const pure=S.scenarioOwn(ownRow,model,realCombat,'no-skill');
const balanced=S.scenarioOwn(ownRow,model,realCombat,'balanced-2-2');
const atk=S.scenarioOwn(ownRow,model,realCombat,'attack-4');
const letOnly=S.scenarioOwn(ownRow,model,realCombat,'lethality-4');
assert.equal(pure.relativePercent,100,'no skill scenario starts at 100 percent');
for(const scenario of [balanced,atk,letOnly]){
 assert.ok(scenario.relativePercent>100,'beneficial confirmed buffs increase model damage');
 assert.equal(scenario.provisional,true);
}
assert.equal(S.scenarioOwn(ownRow,model,combat,'missing-skill'),null);
assert.equal(S.scenarioOwn(ownRow,{values:{},v2:{}},combat,'balanced-2-2'),null);
assert.equal(JSON.stringify(model),snapshot,'scenario must never change player stats/profile');
assert.ok(!ui.includes('scoreText(data.score?.overall)'), 'cannot add unknown-leader join indices to calibrated actual own score');
assert.match(html,/simulation-core\.js\?v=/);
assert.match(html,/simulation-ui\.js\?v=/);
assert.ok(html.indexOf('simulation-core.js')<html.indexOf('simulation-ui.js'));
assert.ok(html.indexOf('simulation-ui.js')<html.indexOf('wizard.js'));
assert.ok(wizard.includes("'result','simulation'"),'guided wizard has 10th stage');
assert.ok(wizard.includes("if(idx===9){simulationUI?.enter();}"),'enter damage simulator only when next page opens');
assert.ok(wizard.includes('if(active===8){moveTo(9);return;}'),'results navigate to damage page');
assert.ok(ui.includes("target.value==='all'")||ui.includes("pick==='all'"),'one action tests all joins');
assert.ok(ui.includes("comparisons.push"),'remember a/b scenarios');
assert.ok(ui.includes("kingshot_beartrap_v3_action_transparent.webm"),'approved v3 video expected');
assert.ok(ui.includes("role','status"),'loader accessible');
assert.ok(!ui.includes('localStorage.setItem'),'no parallel data store');
console.log('SIMULATION: scenario ratios, recomputation, per-join overrides, inventory constraints, relative scores, unassigned joins, missing stats, 10-step UI integration passed.');
