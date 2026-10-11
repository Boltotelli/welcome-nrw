/* Regression tests for actual offensive-stat ranking.
 * Rarity / guide rank / character names do not directly alter scores.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const refEnv={window:{}},env={window:{}},widgetEnv={window:{}};
const run=(file,context)=>vm.runInNewContext(fs.readFileSync(__dirname+'/'+file,'utf8'),context,{filename:file});
run('hero-reference.js',refEnv);run('hero-advisor.js',env);run('own-baseline.js',widgetEnv);
const source=JSON.parse(fs.readFileSync(__dirname+'/hero-reference.json','utf8'));
const R=refEnv.window.NRW_BEAR_HERO_REFERENCE;
assert.equal(R.validate(source),true,'strict 37-hero source must be bundled on Vercel');
R.accept(source);
const A=env.window.NRW_BEAR_HERO_ADVISOR;
const widgets=widgetEnv.window.NRW_BEAR_OWN_BASELINE;
const sourceGet=(name,stars,tier)=>R.get(name,stars,tier);
const widgetGet=(name,level)=>widgets.widgetValue(name,level);
const types={'Long Fei':'infantry',Zoe:'infantry',Alcar:'infantry',
 Petra:'cavalry',Margot:'cavalry',Yang:'archer',Rosa:'archer',
 Howard:'infantry',Quinn:'archer'};
const h=(name,stars,tier=0,widget=0,other={})=>({name,stars,tier,level:80,widget,...other});
const rank=(heroes,priorities={})=>A.recommend(heroes,types,priorities,sourceGet,widgetGet);
let picks=rank([h('Long Fei',5),h('Zoe',3,5),h('Yang',4),h('Rosa',4,2)]);
assert.equal(picks[0].best.name,'Long Fei','5★ Long Fei > 3★ Zoe with native Expedition ATK/skills');
assert.equal(picks[2].best.name,'Yang','4★ Yang > 4★ T2 Rosa with native Expedition ATK/skills');
assert.equal(picks[0].best.nativeExpeditionAtk,444.36);
assert.equal(picks[2].best.nativeExpeditionAtk,374.68);
assert.equal(picks[0].best.offensiveSkills.some(x=>x.name==='Art of War'),true);
assert.equal(picks[0].best.offensiveSkills.some(x=>x.name==='Mighty Paragon'),false,
 'a damage-reduction ability cannot count as offensive damage');
assert.equal(picks[2].best.offensiveSkills.some(x=>x.name==='Avalanche'),true);
// No meta bonus: arbitrarily switching guide order cannot change scores.
const reverse=rank([h('Long Fei',5),h('Zoe',3,5),h('Yang',4),h('Rosa',4,2)],
 {infantry:['Zoe','Long Fei'],archer:['Rosa','Yang']});
assert.equal(reverse[0].best.name,picks[0].best.name);
assert.equal(reverse[2].best.name,picks[2].best.name);
assert.equal(reverse[0].best.score,picks[0].best.score);
assert.equal(reverse[2].best.score,picks[2].best.score);
// The widget EXPEDITION ABILITY must contribute, unlike widget presence or hero rarity.
const yang0=rank([h('Yang',4,0,0)])[2].best;
const yang10=rank([h('Yang',4,0,10)])[2].best;
assert.ok(yang10.score>yang0.score);
assert.equal(yang10.widgetEffect,15);
const zoe0=rank([h('Zoe',4,0,0)])[0].best;
const zoe10=rank([h('Zoe',4,0,10)])[0].best;
assert.equal(zoe0.score,zoe10.score,'defense-only widget does not add Bear offense');
// Skill rank changes the offensive value, without another star/guide coefficient.
const yangMax=rank([h('Yang',4,0,0)])[2].best;
const yangLow=rank([h('Yang',4,0,0,{skills:[1,1,1],skillsAssumedMax:false})])[2].best;
assert.ok(yangLow.score<yangMax.score,'actual levels supersede max suggested by stars');
assert.equal(yangLow.assumedSkill,false);
assert.equal(yangMax.assumedSkill,true);
// Higher rarity alone cannot boost score when identical sourced stats/skills.
const fakeSource=()=>({bonus:200,skills:[
 {name:'Defense',effect:'defense_up',valuesBySkillLevel:[10,10,10,10,10],conditions:{}}
]});
const low=A.evaluate(h('Zoe',2), 'infantry',{},fakeSource,widgetGet);
const high=A.evaluate(h('Zoe',5), 'infantry',{},fakeSource,widgetGet);
assert.equal(low.score,high.score,'no arbitrary star boost when actual effects unchanged');
const unknown=A.recommend([h('Zoe',4)],types,{},()=>null,widgetGet)[0].best;
assert.equal(unknown.score,null,'missing source must never produce fabricated numeric ranking');
assert.equal(unknown.confidence,'limited');
assert.equal(rank([],{})[0].best,null,'no invented owned heroes');
assert.match(A.method,/Expedition base ATK/);
assert.match(A.method,/not Atlas damage/i);
console.log('BEAR HERO RANKING: base stats, offensive Expedition skills and widget skills with no arbitrary guide/rarity modifiers verified.');
