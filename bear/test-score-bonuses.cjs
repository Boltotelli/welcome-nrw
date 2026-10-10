/* Personal Bear points vs combat damage. Pet buffs never auto-apply twice. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const read=x=>fs.readFileSync(path.join(__dirname,x),'utf8');
const ctx={window:{}};vm.runInNewContext(read('score-bonuses.js'),ctx,{filename:'score-bonuses.js'});
const s=ctx.window.NRW_BEAR_SCORE_BONUSES;
const value={v2:{valoraTalent:8}};
const before=JSON.stringify(value);
assert.equal(s.talent(value).level,8);
assert.equal(s.talent(value).personalPointPercent,21);
assert.equal(s.talent(value).masteryPointPercent,19);
assert.equal(s.talent({v2:{valoraTalent:11}}).personalPointPercent,30);
assert.equal(s.talent({v2:{valoraTalent:0}}).personalPointPercent,0);
assert.equal(s.talent({v2:{valoraTalent:12}}),null);
assert.equal(s.talent({v2:{valoraTalent:-1}}),null);
assert.equal(s.talent({v2:{valoraTalent:1.5}}),null);
assert.equal(s.talent({v2:{}}),null);
const old=31608263;
const point=s.pointScore(old,value);
assert.equal(point.ready,true);
assert.ok(Math.abs(point.withPersonalBonus-38246098.23)<1e-6);
assert.ok(Math.abs(point.withMasteryAlternative-37613832.97)<1e-6);
assert.equal(point.index,old,'the raw modeled combat value is unchanged');
assert.equal(point.notTroopAttack,true);
assert.equal(s.pointScore(old,{v2:{valoraTalent:0}}).ready,false);
assert.equal(s.pointScore(old,{v2:{}}).ready,false);
assert.equal(s.pointScore(-5,value),null);
assert.equal(JSON.stringify(value),before,'pure profile read only');
// The original game catalog supplies exactly these values, no invented ranks.
const catalog={pets:[
 {name:'Giant Rhino',bearSkill:{id:'attack',values:[2.5,3,3.5,4,5,6,7,8,9,10]}},
 {name:'Black Panther',bearSkill:{id:'lethality',values:[2.5,3,3.5,4,5,6,7,8,9,10]}},
 {name:'War Bear',bearSkill:{id:'enemy_defense',values:[2.5,3,3.5,4,5,6,7,8,9,10]}},
 {name:'Moose',bearSkill:{id:'enemy_health',values:[1.5,2,2.5,3,3.5,4,5]}}
]};
const profile={v2:{
 petActive:{'Giant Rhino':true,'Black Panther':true,'War Bear':true},
 petSkillRanks:{'Giant Rhino':8,'Black Panther':10,'War Bear':6,'Moose':6},
 petLevels:{'Moose':60},
 valoraTalent:8
}};
const copy=JSON.stringify(profile);
const pets=s.petAudit(profile,catalog);
const rhino=pets.find(p=>p.name==='Giant Rhino');
assert.equal(rhino.active,true);assert.equal(rhino.percentage,8);
assert.equal(rhino.automaticallyApplied,false);
assert.equal(rhino.mayAlreadyBeIncludedInStats,true);
assert.equal(pets.find(p=>p.name==='Black Panther').percentage,10);
assert.equal(pets.find(p=>p.name==='War Bear').percentage,6);
assert.equal(pets.find(p=>p.name==='Moose').offensivePotential,false);
assert.equal(pets.find(p=>p.name==='Moose').active,false);
assert.equal(JSON.stringify(profile),copy);
const fallback={v2:{petLevels:{'Giant Rhino':80}}};
assert.equal(s.petAudit(fallback,catalog).find(p=>p.name==='Giant Rhino').percentage,8);
assert.equal(s.petAudit(fallback,catalog).find(p=>p.name==='Giant Rhino').active,false);
assert.equal(s.petAudit(profile,{pets:[]}).length,0,'without verified catalog no guess');
const ui=read('simulation-ui.js'),html=read('index.html'),workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/bear-pages.yml'),'utf8');
new vm.Script(ui);
assert.ok(ui.includes('scoreTool?.pointScore?.(estimate.expectedIndex,B.model())'));
assert.ok(ui.includes('scoreTool?.petAudit?.(B.model(),root.NRW_BEAR_CATALOG)'));
assert.ok(!ui.includes('scoreTool?.pointScore?.(estimate.baselineIndex,B.model())'),
 'score bonus belongs only to displayed personal expectation');
assert.ok(html.includes('score-bonuses.js?v='));
assert.ok(html.indexOf('score-bonuses.js')<html.indexOf('simulation-ui.js'));
assert.ok(workflow.includes('bear/test-score-bonuses.cjs'));
assert.ok(workflow.includes('bear/score-bonuses.js'));
console.log('SCORE BONUSES: Valora Lv8 +21% personal score (Mastery +19% alternative), no ATK stacking, pets read-only and classified, UI/CI wiring passed.');
