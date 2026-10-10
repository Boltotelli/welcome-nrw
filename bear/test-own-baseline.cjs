/* Own Bear starter baseline contract. Never confuse model index with verified
   millions. Widget skills are distinct from already-captured stats. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const read=s=>fs.readFileSync(path.join(__dirname,s),'utf8');
const ctx={window:{}};
for(const file of ['combat.js','own-baseline.js'])vm.runInNewContext(read(file),ctx,{filename:file});
const B=ctx.window.NRW_BEAR_OWN_BASELINE,C=ctx.window.NRW_BEAR_COMBAT;
assert.equal(B.skillCap(4,0),5);
assert.equal(B.skillCap(3,5),4);
assert.equal(B.skillCap(2,1),3);
assert.equal(B.skillCap(0,0),null);
assert.equal(B.widgetValue('Yang',1).bonusPct,0,'widget Expedition ability unlocked only at Lv2');
assert.equal(B.widgetValue('Petra',2).bonusPct,5);
assert.equal(B.widgetValue('Petra',3).bonusPct,5);
assert.equal(B.widgetValue('Petra',4).bonusPct,7.5);
assert.equal(B.widgetValue('Yang',10).bonusPct,15);
assert.equal(B.widgetValue('Zoe',10).type,'defense-only');
const skill=(name,effect,metric,valuesBySkillLevel,conditions={})=>({name,effect,metric,valuesBySkillLevel,conditions});
const heroes={
 Yang:{skills:[
  skill('Avalanche','extra_squad_strike','damage_percent',[20,40,60,80,100],{everyTurns:4}),
  skill('Ice Zone','archer_extra_hit','damage_percent',[20,40,60,80,100],{procChancePercent:40}),
  skill('Ambush','squad_damage_dealt_buff','proc_chance_percent',[8,16,24,32,40],{effectDamageDealtPercent:50})]},
 Zoe:{skills:[
  skill('Sundering Wound','damage_over_time','damage_percent',[8,16,24,32,40],{procChancePercent:20,durationTurns:3}),
  skill('Charisma','squad_attack_buff','attack_percent',[5,10,15,20,25]),
  skill('Infinite Arsenal','enemy_damage_taken_debuff','amplification_percent',[10,20,30,40,50],{procChancePercent:50})]},
 Petra:{skills:[
  skill('Evil Eye','enemy_damage_taken_debuff','amplification_percent',[10,20,30,40,50],{procChancePercent:50}),
  skill('The Favor','squad_attack_buff','damage_percent',[10,20,30,40,50],{procChancePercent:50}),
  skill('The Shield','damage_taken_reduction','reduction_percent',[10,20,30,40,50],{procChancePercent:40})]}
};
const ref={status:()=> 'ready',get:(name)=>({skillVerified:true,skills:heroes[name]?.skills||[]})};
const model={values:{iAtk:1300,iLet:500,cAtk:1260,cLet:590,aAtk:1550,aLet:780,pitfall:5,
 squadAtk:275.2,squadLet:60.1},v2:{ownHeroes:['Zoe','Petra','Yang'],
 manualHeroes:{Zoe:{stars:4,tier:2},Petra:{stars:4,tier:4},Yang:{stars:4,tier:3}},
 starterWidgetLevels:{Zoe:8,Petra:2,Yang:2},
 squadSeparate:false,troopTiers:[{tier:10,tg:6},{tier:10,tg:5},{tier:10,tg:6}]}};
const counts=[1818,21818,158184],snapshot=JSON.stringify(model);
let result=B.calculate(model,counts,C,ref);
assert.equal(result.ready,true);
assert.equal(result.pitfallLevel,5);
assert.equal(result.troopBreakdown.trapAttackPct,25);
assert.equal(result.troopBreakdown.totalTroops,181820);
assert.ok(Math.abs(result.troopBreakdown.totalTenRounds-result.withoutAbilitiesIndex)<1e-7);
assert.equal(result.troopBreakdown.types[0].baseAttack,627);
assert.equal(result.troopBreakdown.types[1].baseAttack,1790);
assert.equal(result.troopBreakdown.types[2].baseAttack,2506);
assert.equal(result.noJoinerSkills,true);
assert.equal(result.includesChanceEffects,false);
assert.equal(result.isGuaranteedDamage,false);
assert.equal(result.included.length,1,'only Yang periodic fixed extra strike counts');
assert.equal(result.included[0].skill,'Avalanche');
assert.equal(result.included[0].effectiveBonusPct,20,'two 100% strikes in 10 Bear turns');
assert.equal(result.excluded.some(s=>s.skill==='Charisma'&&s.kind==='already-in-stats'),true,
 'passive squad attack already in captured stats, never added again');
assert.equal(result.excluded.some(s=>s.skill==='Ice Zone'&&s.kind==='random'),true);
assert.equal(result.excluded.some(s=>s.skill==='Evil Eye'&&s.kind==='random'),true);
assert.equal(result.widgets.find(w=>w.name==='Zoe').bonusPct,12.5);
assert.equal(result.widgets.find(w=>w.name==='Zoe').type,'defense-only');
const expected=1.2*1.05*1.05;
assert.ok(Math.abs(result.modelIndex/result.withoutAbilitiesIndex-expected)<1e-10,
 'only fixed strike and rally widget abilities, not raw widget gear stats');
assert.equal(JSON.stringify(model),snapshot,'pure simulation, no player changes');
const noWidget={...model,v2:{...model.v2,starterWidgetLevels:{Zoe:0,Petra:0,Yang:0}}};
const none=B.calculate(noWidget,counts,C,ref);
assert.ok(Math.abs(none.abilityFactor-1.2)<1e-10);
// Verified Vivian always-on enemy-damage-taken ability is an own-starter
// effect; it is NOT a joining-hero effect in this test.
const vivianModel={...model,v2:{...model.v2,
 ownHeroes:['Zoe','Petra','Vivian'],
 manualHeroes:{...model.v2.manualHeroes,Vivian:{stars:4,tier:3}},
 starterWidgetLevels:{Zoe:0,Petra:0,Vivian:0}}};
const vivianRef={status:()=> 'ready',get:(name)=>name==='Vivian'?
 {skillVerified:true,skills:[skill('Crouching Tiger','enemy_damage_taken_up',
 'percent',[5,10,15,20,25])]}:ref.get(name)};
const vivi=B.calculate(vivianModel,counts,C,vivianRef);
assert.equal(vivi.enemyDamageTakenPct,25);
assert.ok(Math.abs(vivi.abilityFactor-1.25)<1e-10);
assert.equal(vivi.includesChanceEffects,false);
const unknown=B.calculate({...model,v2:{...model.v2,starterWidgetLevels:{}}},counts,C,ref);
assert.equal(unknown.missing.filter(x=>x.endsWith(':widget')).length,3);
assert.equal(unknown.withoutAbilitiesIndex,result.withoutAbilitiesIndex);
assert.ok(unknown.modelIndex<result.modelIndex);
const unavailable=B.calculate(model,counts,C,{status:()=> 'error',get:()=>{throw Error('not ready')}});
assert.equal(unavailable.heroSourceReady,false);
assert.equal(unavailable.included.length,0,'no invented hero skill if source unavailable');
assert.equal(unavailable.missing.length,3);
assert.equal(B.calculate(model,[0,0,0],C,ref).ready,false,'zero counts fail closed');
const auditModel={...model,v2:{...model.v2,
 manualHeroes:{...model.v2.manualHeroes,
  Zoe:{...model.v2.manualHeroes.Zoe,expeditionStats:{iAtk:120,iLet:80}},
  Petra:{...model.v2.manualHeroes.Petra,expeditionStats:{cAtk:130,cLet:100}},
  Yang:{...model.v2.manualHeroes.Yang,expeditionStats:{aAtk:180,aLet:120}}}}};
const auditSnapshot=JSON.stringify(auditModel);
const audit=B.inspectUnusedBonuses(auditModel,counts,C);
assert.equal(audit.squadAlreadyApplied,false);
assert.equal(audit.squadAttackPct,275.2);
assert.equal(audit.squadLethalityPct,60.1);
assert.equal(audit.heroes[2].attackPct,180);
assert.ok(audit.hypotheticals.withSquad>audit.hypotheticals.current,
 'stored positive squad bonuses currently not applied in legacy profile');
assert.ok(audit.hypotheticals.withHeroes>audit.hypotheticals.current,
 'separate positive expedition stats could increase individual class scores');
assert.ok(audit.hypotheticals.withBoth>audit.hypotheticals.withSquad);
assert.ok(audit.hypotheticals.withBoth>audit.hypotheticals.withHeroes);
assert.equal(JSON.stringify(auditModel),auditSnapshot,
 'forensic audit must NEVER rewrite saved combat stats');
const explicit={...auditModel,v2:{...auditModel.v2,squadSeparate:true}};
const explicitAudit=B.inspectUnusedBonuses(explicit,counts,C);
assert.equal(explicitAudit.squadAlreadyApplied,true);
assert.equal(explicitAudit.hypotheticals.withSquad,explicitAudit.hypotheticals.current,
 'never add squad bonuses twice if explicitly marked as already separate');
const missingHeroes={...model,v2:{...model.v2,manualHeroes:{}}};
const sparseAudit=B.inspectUnusedBonuses(missingHeroes,counts,C);
assert.equal(sparseAudit.heroes[0].attackPct,null,
 'unknown hero detail stat must remain absent, never guessed');
assert.equal(sparseAudit.notAutomaticallyApplied,true);

const wizard=read('wizard.js'),simulation=read('simulation-ui.js'),html=read('index.html');
new vm.Script(wizard);new vm.Script(simulation);
assert.ok(wizard.includes("model.v2.starterWidgetLevels[n]=Number(wSelect.value)"),'only a manual UI dropdown saves independent widget level');
assert.ok(wizard.includes("B.save()"),'one existing profile store');
assert.ok(simulation.includes('renderOwnBaseline(data)'), 'own baseline results integrated');
assert.ok(simulation.includes('bear-sim-math-audit'),'exact captured stats trace must be inspectable');
assert.ok(simulation.includes('inspectUnusedBonuses'),'unused squad/hero stat sources must be inspectable');
assert.ok(!simulation.includes('renderSkillScenarios(data)'),'joiner hypotheticals replaced in main baseline');
assert.ok(html.includes('own-baseline.js?v='),'new engine included');
assert.ok(html.indexOf('own-baseline.js')<html.indexOf('simulation-ui.js'),'baseline loads before simulation UI');
console.log('OWN BASELINE: verified skills, 10-turn fixed strikes, rally Widget mapping, no doubled stats, random-only exclusion, reference fallback and wizard checked.');
