/* Ten-turn own-starter Bernoulli expectation; source-pinned skill levels.
 * No observed 33m target appears in the engine or as a fitted constant.
 */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const read=x=>fs.readFileSync(path.join(__dirname,x),'utf8');
const ctx={window:{}};
for(const f of ['combat.js','own-baseline.js','proc-expectation.js'])
 vm.runInNewContext(read(f),ctx,{filename:f});
const C=ctx.window.NRW_BEAR_COMBAT,B=ctx.window.NRW_BEAR_OWN_BASELINE,
 P=ctx.window.NRW_BEAR_PROC_EXPECTATION;
assert.equal(P.ROUND_COUNT,10);
assert.equal(P.CONFIG.length,5);
const sk=(name,effect,metric,valuesBySkillLevel,conditions={})=>
 ({name,effect,metric,valuesBySkillLevel,conditions});
const records={
 Zoe:[
  sk('Sundering Wound','damage_over_time','damage_percent',[8,16,24,32,40],
   {procChancePercent:20,durationTurns:3}),
  sk('Charisma','squad_attack_buff','attack_percent',[5,10,15,20,25]),
  sk('Infinite Arsenal','enemy_damage_taken_debuff','amplification_percent',
   [10,20,30,40,50],{procChancePercent:50})],
 Petra:[
  sk('Evil Eye','enemy_damage_taken_debuff','amplification_percent',
   [10,20,30,40,50],{procChancePercent:50}),
  sk('The Favor','squad_attack_buff','damage_percent',
   [10,20,30,40,50],{procChancePercent:50}),
  sk('The Shield','damage_taken_reduction','reduction_percent',
   [10,20,30,40,50],{procChancePercent:40})],
 Yang:[
  sk('Avalanche','extra_squad_strike','damage_percent',
   [20,40,60,80,100],{everyTurns:4}),
  sk('Ice Zone','archer_extra_hit','damage_percent',
   [20,40,60,80,100],{procChancePercent:40}),
  sk('Ambush','squad_damage_dealt_buff','proc_chance_percent',
   [8,16,24,32,40],{effectDamageDealtPercent:50})]
};
const ref={status:()=> 'ready',get:(name)=>({
 skillVerified:true,skills:records[name]||[]})};
const model={values:{
 iAtk:181.5,iLet:276.5,cAtk:169.2,cLet:250.7,
 aAtk:244.3,aLet:314,squadAtk:274.8,squadLet:60.1
},v2:{
 ownHeroes:['Zoe','Petra','Yang'],combatStatOrigin:'separate-overview',
 manualHeroes:{
  Zoe:{stars:4,tier:2,expeditionStats:{iAtk:188.2,iLet:155.4}},
  Petra:{stars:4,tier:4,expeditionStats:{cAtk:253.6,cLet:178}},
  Yang:{stars:4,tier:4,expeditionStats:{aAtk:492.2,aLet:300.7}}
 },
 starterWidgetLevels:{Zoe:3,Petra:4,Yang:2},
 troopTiers:[{tier:10,tg:6},{tier:10,tg:5},{tier:10,tg:6}]
}};
const row=[1818,21818,158184],snapshot=JSON.stringify(model);
const original=B.calculate(model,row,C,ref);
assert.equal(original.ready,true);
assert.ok(Math.abs(original.modelIndex-12705683)<2);
const x=P.evaluate(model,row,C,ref);
assert.equal(x.ready,true);
assert.equal(x.turns,10);
assert.equal(x.skills.length,5);
assert.equal(x.includesJoiningSkills,false);
assert.equal(x.includesSunder,false);
assert.equal(x.partial,true);
assert.equal(x.stackAssumption,'same-family-enemy-taken-additive');
assert.deepEqual(Array.from(x.skills.map(s=>s.skill)),
 ['Infinite Arsenal','Evil Eye','The Favor','Ice Zone','Ambush']);
assert.deepEqual(Array.from(x.skills.map(s=>s.chancePercent)),[50,50,50,40,40]);
assert.deepEqual(Array.from(x.skills.map(s=>s.effectPercent)),[50,50,50,100,50]);
assert.equal(x.unmodeled.length,1,'Zoe Sunder duration/basis is unknown, Petra Shield is defensive');
assert.equal(x.unmodeled[0].skill,'Sundering Wound');
assert.ok(Math.abs(x.noProcCheckIndex-original.modelIndex)<1e-7,
 'the zero-proc 10-round result must exactly equal existing fixed base and widgets');
assert.ok(Math.abs(x.expectedIndex-31561593)<3,
 'source-pinned 10-round same-turn independent proc model, NOT a fit to 33m');
assert.ok(Math.abs(x.alternativeIndex-32876660)<3);
assert.ok(x.expectedIndex>x.baselineIndex);
assert.ok(x.alternativeIndex>x.expectedIndex);
assert.ok(x.allProcIllustrationIndex>x.alternativeIndex);
assert.equal(JSON.stringify(model),snapshot,'pure calculation must not change the saved player profile');
const repeat=P.evaluate(model,row,C,ref);
assert.equal(repeat.expectedIndex,x.expectedIndex,'exact enumeration, no stochastic sampling');
assert.equal(repeat.alternativeIndex,x.alternativeIndex);
assert.equal(P.evaluate(model,row,C,{status:()=> 'error'}).ready,false,
 'missing remote source cannot invent a five-skill expectation');
// No-proc source must calculate exactly the original fixed baseline.
const noChance={status:()=> 'ready',get:(name)=>{
 const xs=records[name].map(s=>({
 ...s,valuesBySkillLevel:s.name==='Ambush'?[0,0,0,0,0]:s.valuesBySkillLevel.slice(),
 conditions:s.conditions.procChancePercent===undefined?s.conditions:
  {...s.conditions,procChancePercent:0}}));
 return {skillVerified:true,skills:xs};}};
const no=P.evaluate(model,row,C,noChance);
assert.equal(no.ready,true);
assert.ok(Math.abs(no.expectedIndex-no.baselineIndex)<1e-6,
 'all chance skills disabled reproduces fixed-only score');
assert.ok(Math.abs(no.alternativeIndex-no.baselineIndex)<1e-6);
// Damage taken different effect family assumptions must be visible, and
// should vanish if one of the two effects is disabled.
const noEvil={status:()=> 'ready',get:(name)=>({
 skillVerified:true,skills:records[name].map(s=>s.name==='Evil Eye'?
  {...s,conditions:{procChancePercent:0}}:s)})};
const oneDebuff=P.evaluate(model,row,C,noEvil);
assert.ok(Math.abs(oneDebuff.expectedIndex-oneDebuff.alternativeIndex)<1e-6);
// Changing star level must reduce source-ranked effects, not silently Lv5.
const weaker={...model,v2:{...model.v2,manualHeroes:{
 ...model.v2.manualHeroes,
 Yang:{...model.v2.manualHeroes.Yang,stars:2,tier:5}
}}};
const weak=P.evaluate(weaker,row,C,ref);
assert.equal(weak.skills.find(s=>s.skill==='Ice Zone').skillLevel,3);
assert.ok(weak.expectedIndex<x.expectedIndex);
assert.equal(weak.includesJoiningSkills,false);
// Guard against treating foreign join heroes as own expedition skills.
const withForeignJoins={...model,v2:{...model.v2,joinCount:6,
 joiningHeroes:['Chenko','Amane','Amadeus','Margot']}};
const foreign=P.evaluate(withForeignJoins,row,C,ref);
assert.equal(foreign.expectedIndex,x.expectedIndex);
assert.equal(foreign.includesJoiningSkills,false);
const ui=read('simulation-ui.js'),html=read('index.html');
new vm.Script(ui);
assert.ok(ui.includes('renderOwnSkillExpectation(data,own)'));
assert.ok(ui.includes('effectPercent'));
assert.ok(html.includes('proc-expectation.js?v='));
assert.ok(html.indexOf('proc-expectation.js')<html.indexOf('simulation-ui.js'));
console.log('OWN PROC EXPECTATION: exact 10-turn Bernoulli enumeration, five pinned effects, additive/multiplicative debuffs, correct source skills, no joins, unknown Sunder excluded, 31.56m vs 32.88m assumed scenario passed.');
