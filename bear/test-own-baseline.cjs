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
assert.equal(explicitAudit.origin.mode,'separate-overview');
assert.equal(explicitAudit.squadAlreadyApplied,false);
assert.equal(explicitAudit.hypotheticals.applied,explicitAudit.hypotheticals.withBoth,
 'legacy squadSeparate true means the class and hero components are separate and must be assembled once');
const missingHeroes={...model,v2:{...model.v2,manualHeroes:{}}};
const sparseAudit=B.inspectUnusedBonuses(missingHeroes,counts,C);
assert.equal(sparseAudit.heroes[0].attackPct,null,
 'unknown hero detail stat must remain absent, never guessed');
assert.equal(sparseAudit.notAutomaticallyApplied,true);

// Real image values supplied by the player; only verified original source
// fields are used. A class attack below its own independently measured squad
// component CANNOT be a pre-combined report total.
const screenshot={...model,values:{
 iAtk:181.5,iLet:276.5,cAtk:169.2,cLet:250.7,aAtk:244.3,aLet:314,
 squadAtk:274.8,squadLet:60.1,pitfall:5},v2:{...model.v2,
 squadSeparate:false,
 manualHeroes:{
  Zoe:{...model.v2.manualHeroes.Zoe,expeditionStats:{iAtk:188.2,iLet:155.4}},
  Petra:{...model.v2.manualHeroes.Petra,expeditionStats:{cAtk:253.6,cLet:178}},
  Yang:{...model.v2.manualHeroes.Yang,expeditionStats:{aAtk:492.2,aLet:300.7}}
 }}};
const oldProfile=JSON.stringify(screenshot);
const detected=B.statOrigin(screenshot);
assert.equal(detected.mode,'separate-overview','legacy local profile detected without reupload');
assert.equal(detected.reason,'component-exceeds-class-total');
const effective=B.composeCombatStats(screenshot);
assert.equal(effective.origin.mode,'separate-overview');
assert.equal(effective.stats.iAtk,644.5);
assert.equal(effective.stats.iLet,492);
assert.equal(effective.stats.cAtk,697.6);
assert.ok(Math.abs(effective.stats.cLet-488.8)<1e-8);
assert.equal(effective.stats.aAtk,1011.3);
assert.equal(effective.stats.aLet,674.8);
const historicScreenshotCounts=[3636,29091,149093];
const corrected=B.calculate(screenshot,historicScreenshotCounts,C,ref);
assert.equal(corrected.ready,true);
assert.ok(corrected.withoutAbilitiesIndex>9e6&&corrected.withoutAbilitiesIndex<10e6,
 'corrected non-join soldier damage at the image ratio is about 9.35 million model units');
assert.equal(corrected.assembledStats.origin.mode,'separate-overview');
assert.equal(corrected.troopBreakdown.types[0].capturedAttackPct,644.5);
const forensic=B.inspectUnusedBonuses(screenshot,historicScreenshotCounts,C);
assert.ok(Math.abs(corrected.withoutAbilitiesIndex-forensic.hypotheticals.applied)<1e-7,
 'forensic applied result and actual damage core must be exactly identical');
assert.ok(Math.abs(forensic.hypotheticals.withBoth-forensic.hypotheticals.applied)<1e-7,
 'separate bonus overview must add squad and own hero once');
assert.equal(JSON.stringify(screenshot),oldProfile,'no mutation to original saved values');

const combined={...screenshot,v2:{...screenshot.v2,combatStatOrigin:'combined-report'}};
const combinedCalc=B.calculate(combined,historicScreenshotCounts,C,ref);
assert.ok(combinedCalc.withoutAbilitiesIndex<2e6,'pre-combined reports must never be inflated');
assert.equal(combinedCalc.assembledStats.origin.reason,'manual');
assert.equal(B.inspectUnusedBonuses(combined,historicScreenshotCounts,C).hypotheticals.applied,
 B.inspectUnusedBonuses(combined,historicScreenshotCounts,C).hypotheticals.current);
const forceSeparate={...model,v2:{...model.v2,combatStatOrigin:'separate-overview'}};
assert.ok(B.currentStats(forceSeparate).aAtk>model.values.aAtk,
 'explicit separate mode applies positive squad component even when auto detection is uncertain');
const reportNoComponents={...model,v2:{...model.v2,combatStatOrigin:'combined-report'}};
assert.equal(B.currentStats(reportNoComponents).iAtk,model.values.iAtk,
 'explicit combat report classes always remain unchanged');

const wizard=read('wizard.js'),simulation=read('simulation-ui.js'),html=read('index.html');
new vm.Script(wizard);new vm.Script(simulation);
assert.ok(wizard.includes("model.v2.starterWidgetLevels[n]=Number(wSelect.value)"),'only a manual UI dropdown saves independent widget level');
assert.ok(wizard.includes("B.save()"),'one existing profile store');
assert.ok(simulation.includes('renderOwnBaseline(data)'), 'own baseline results integrated');
assert.ok(simulation.includes('bear-sim-math-audit'),'exact captured stats trace must be inspectable');
assert.ok(simulation.includes('inspectUnusedBonuses'),'unused squad/hero stat sources must be inspectable');
assert.ok(simulation.includes("model.v2.combatStatOrigin=source.value"),
 'one audited UI source-mode selection must be saved explicitly');
assert.ok(simulation.includes('own.assembledStats.missing.join'),
 'incomplete independent sources must warn, not silently pretend full data');
const intake=read('intake-ui.js'),formationCore=read('formation-core.js'),simulationCore=read('simulation-core.js');
new vm.Script(intake);new vm.Script(formationCore);new vm.Script(simulationCore);
assert.ok(intake.includes("v.combatStatDetectedOrigin='separate-overview'"),
 'the approved Bonus Overview screenshot marks independent stats provenance');
assert.ok(formationCore.includes("root.NRW_BEAR_OWN_BASELINE?.currentStats?.(model)"),
 'the starter optimizer must consume identical composed stats');
assert.ok(simulationCore.includes("root.NRW_BEAR_OWN_BASELINE?.currentStats?.(model)"),
 'scenario scores must consume identical composed starter stats');
assert.ok(!simulation.includes('renderSkillScenarios(data)'),'joiner hypotheticals replaced in main baseline');
assert.ok(html.includes('own-baseline.js?v='),'new engine included');
assert.ok(html.indexOf('own-baseline.js')<html.indexOf('simulation-ui.js'),'baseline loads before simulation UI');
console.log('OWN BASELINE: verified skills, 10-turn fixed strikes, rally Widget mapping, no doubled stats, random-only exclusion, reference fallback and wizard checked.');
