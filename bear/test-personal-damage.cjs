/* One simple visible Bear damage result: own starters + all offensive
 * sourced Expedition skills + level-5 trap + active user-confirmed Pets
 * + Valora personal points, never foreign join heroes.
 */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const read=x=>fs.readFileSync(path.join(__dirname,x),'utf8');
const ctx={window:{}};
for(const f of ['catalog.js','combat.js','own-baseline.js','proc-expectation.js','score-bonuses.js'])
 vm.runInNewContext(read(f),ctx,{filename:f});
const w=ctx.window,C=w.NRW_BEAR_COMBAT,E=w.NRW_BEAR_PROC_EXPECTATION,
 B=w.NRW_BEAR_OWN_BASELINE,S=w.NRW_BEAR_SCORE_BONUSES;
const sk=(name,effect,metric,valuesBySkillLevel,conditions={})=>({name,effect,metric,valuesBySkillLevel,conditions});
const heroes={
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
const source={status:()=> 'ready',get:(name)=>({skillVerified:true,skills:heroes[name]||[]})};
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
 troopTiers:[{tier:10,tg:6},{tier:10,tg:5},{tier:10,tg:6}],
 valoraTalent:8,petActive:{},petSkillRanks:{}
}};
const counts=[1818,21818,158184];
const original=JSON.stringify(model);
function go(m=model){return S.personalDamage(m,counts,C,source,w.NRW_BEAR_CATALOG,E);}
const noPets=go();
assert.equal(noPets.ready,true);
assert.equal(noPets.usesSingleEstimate,true);
assert.equal(noPets.includesAllSourcedOffensiveStarterSkills,true);
assert.equal(noPets.modeledStarterSkills,6);
assert.equal(noPets.pitfallLevel,5);
assert.equal(noPets.noJoiningHeroSkills,true);
assert.equal(noPets.valoraLevel,8);
assert.equal(noPets.valoraPct,21);
assert.equal(noPets.activePets.length,0);
assert.ok(Math.abs(noPets.expectedScore-45114562.23792585)<1);
assert.equal(JSON.stringify(model),original,'no stored player data may be modified');
const active={...model,v2:{...model.v2,petActive:{
 'Giant Rhino':true,'Black Panther':true,'War Bear':true},
 petSkillRanks:{'Giant Rhino':8,'Black Panther':10,'War Bear':6}}};
const before=JSON.stringify(active);
const buffed=go(active);
assert.equal(buffed.ready,true);
assert.equal(buffed.activePets.length,3);
assert.equal(buffed.petAttackPct,8);
assert.equal(buffed.petLethalityPct,10);
assert.equal(buffed.enemyDefenseReductionPct,6);
assert.equal(buffed.warBearModelAssumption,true);
assert.ok(Math.abs(buffed.expectedScore-48979217.93196656)<1);
assert.ok(buffed.expectedScore>noPets.expectedScore);
assert.equal(JSON.stringify(active),before);
const includedInImage={...active,v2:{...active.v2,petBuffCapturedInStats:true}};
const prevented=go(includedInImage);
assert.equal(prevented.ready,true);
assert.equal(prevented.petAttackPct,0);
assert.equal(prevented.petLethalityPct,0);
assert.equal(prevented.enemyDefenseReductionPct,6);
assert.ok(prevented.expectedScore<buffed.expectedScore);
const absent={...active,v2:{...active.v2,petActive:{},petSkillRanks:{}}};
assert.equal(go(absent).expectedScore,noPets.expectedScore,'saved pet ranks alone never mean active buffs');
const inactiveWithRecords={...active,v2:{...active.v2,petActive:{
 'Giant Rhino':false,'Black Panther':false,'War Bear':false}}};
assert.equal(go(inactiveWithRecords).expectedScore,noPets.expectedScore);
const invalid={...model,v2:{...model.v2,petActive:{'Giant Rhino':true}}};
assert.equal(go(invalid).reason,'missing-active-pet-skill','do not invent active pet skill ranks');
const noHunter={...model,v2:{...model.v2,valoraTalent:null}};
assert.equal(go(noHunter).reason,'missing-valora-level');
const noRef=S.personalDamage(model,counts,C,{status:()=> 'error'},
 w.NRW_BEAR_CATALOG,E);
assert.equal(noRef.ready,false);
const withForeignJoins={...model,v2:{...model.v2,
 joinCount:6,joiningHeroes:['Chenko','Amane','Amadeus','Margot']}};
assert.equal(go(withForeignJoins).expectedScore,noPets.expectedScore);
const noTrap={...model,values:{...model.values,pitfall:0}};
assert.equal(go(noTrap).pitfallLevel,5,'trap level 5 must remain fixed and not come from legacy user control');
const ui=read('simulation-ui.js'),html=read('index.html');
new vm.Script(ui);
assert.ok(ui.includes('scoreTool?.personalDamage?.('),
 'only a single combined score reaches the rendered card');
assert.ok(ui.includes('headline.textContent=scoreText(estimate.expectedScore)'));
const start=ui.indexOf(' function renderResult(data){');
const end=ui.indexOf(' function renderComparisons(){',start);
assert.ok(start>=0&&end>start);
const rendered=ui.slice(start,end);
assert.ok(!rendered.includes('renderOwnBaseline(data)'),'legacy damage breakdown not visible');
assert.ok(!rendered.includes('renderOwnSkillExpectation('),'no second expected-damage card');
assert.ok(!rendered.includes('renderComparisons('),'no distracting ratio score comparison');
assert.ok(!rendered.includes('metric('),'no starter/join relative scores');
assert.ok(!rendered.includes('alternativeIndex'),'no multiple scenarios visible');
assert.ok(ui.includes('targetLabel.hidden=true;presetLabel.hidden=true;save.hidden=true;'));
assert.ok(ui.includes('compared.hidden=true'));
assert.ok(rendered.includes('formation?.allocateStock?.([desired],base.stock,ratios[0],[])'),
 'own rally is assessed alone using own march capacity and stock');
assert.ok(html.indexOf('proc-expectation.js')<html.indexOf('score-bonuses.js'));
assert.ok(html.indexOf('score-bonuses.js')<html.indexOf('simulation-ui.js'));
console.log('ONE SCORE: own starter, six sourced offensive Expedition abilities, Pitfall Lv5, active saved Pets only, Valora points, no foreign joining heroes, pure read-only calculations, one visible result and solo own-march capacity confirmed.');
