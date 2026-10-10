/* Offline invariants for owned-only conservative Bear Rally leader ranking.
 * Model is Atlas-informed, not a numeric KS Atlas damage simulation.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/hero-advisor.js','utf8'),env,{filename:'hero-advisor.js'});
const A=env.window.NRW_BEAR_HERO_ADVISOR;
const roles={Zoe:'infantry',Alcar:'infantry',Amadeus:'infantry',Helga:'infantry',
 Petra:'cavalry',Margot:'cavalry',Sophia:'cavalry',Jabel:'cavalry',
 Yang:'archer',Rosa:'archer',Marlin:'archer',Quinn:'archer',Triton:'infantry'};
const priorities={infantry:['Amadeus','Helga','Zoe','Alcar','Triton'],
 cavalry:['Margot','Petra','Jabel','Sophia'],
 archer:['Yang','Rosa','Marlin','Quinn']};
const h=(name,stars,level=80,extra={})=>({name,stars,level,widget:0,
 skills:[Math.min(5,stars+1),Math.min(5,stars+1),Math.min(5,stars+1)],
 skillsAssumedMax:true,...extra});
const picks=A.recommend([h('Zoe',5),h('Alcar',1,1),h('Petra',4),
 h('Sophia',1,1),h('Yang',5)],roles,priorities);
assert.deepEqual(Array.from(picks.map(g=>g.best.name)),['Zoe','Petra','Yang']);
assert.equal(picks[0].best.assumedSkill,true,'star-derived skill caps never confirmed');
assert.equal(picks[2].best.skillCap,5,'5-star hero cap');
assert.equal(A.recommend([],roles,priorities).every(g=>g.best===null),true,
 'empty roster cannot create owned heroes');

// Core user regression: a weak 1★ meta Yang cannot displace invested 4★ Rosa.
const archers=A.recommend([h('Yang',1),h('Rosa',4)],roles,priorities)[2];
assert.equal(archers.best.name,'Rosa','1-star Yang must not beat 4-star Rosa');
assert.ok(archers.choices[0].score>archers.choices[1].score);
assert.equal(A.recommend([h('Yang',4),h('Rosa',4)],roles,priorities)[2].best.name,'Yang',
 'with equal progression the newer bear-meta hero can win');
assert.equal(A.recommend([h('Yang',1,80,{widget:8}),h('Rosa',4,65)],roles,priorities)[2].best.name,'Rosa',
 'unusual strong widget still cannot blindly promote a 1-star hero');
assert.equal(A.recommend([h('Margot',1),h('Petra',4)],roles,priorities)[1].best.name,'Petra',
 '1-star guide-priority cavalry cannot displace invested 4-star Petra');
assert.equal(A.recommend([h('Amadeus',1),h('Zoe',4)],roles,priorities)[0].best.name,'Zoe',
 'infantry progression also outweighs name priority');

// The reported 4★ T4 Yang vs 5★ Rosa case: source percentages displayed
// in the dropdown must also be a real input to the recommendation.
const verifiedAtk=(name,stars,tier)=>({bonus:
 name==='Yang'&&stars===4&&tier===4?472.18:
 name==='Rosa'&&stars===5?370.30:null});
const sourcePicks=A.recommend([
 h('Yang',4,80,{tier:4,widget:2}),h('Rosa',5,80,{widget:7})
],roles,priorities,verifiedAtk)[2];
assert.equal(sourcePicks.best.name,'Yang',
 'sourced 472.18% Yang should beat 370.30% Rosa with comparable skills');
assert.ok(sourcePicks.best.usesAttackReference,'source attack is actually included');
assert.equal(sourcePicks.choices.find(h=>h.name==='Yang').nativeExpeditionAtk,472.18);
const lowSkills=A.recommend([
 h('Yang',4,80,{tier:4,widget:2,skills:[1,1,1],skillsAssumedMax:false}),
 h('Rosa',5,80,{widget:7})
],roles,priorities,verifiedAtk)[2];
assert.equal(lowSkills.best.name,'Rosa',
 'confirmed low actual skill levels still outweigh a native attack advantage');

// User's actual captain comparison, both without widgets:
assert.equal(A.recommend([h('Yang',4,80,{tier:4}),h('Rosa',5)],roles,priorities)[2].best.name,'Yang',
 '4-star T4 Gen6 Yang should outrank 5-star Rosa with no widget');
assert.equal(A.recommend([h('Yang',1),h('Rosa',4)],roles,priorities)[2].best.name,'Rosa',
 'Gen6 preference does not override severe under-investment');
const unknown=A.recommend([{name:'Yang',level:80},h('Rosa',4)],roles,priorities)[2];
assert.equal(unknown.best.name,'Rosa','unknown stars cannot outrank verified built hero');
assert.equal(unknown.choices.find(c=>c.name==='Yang').confidence,'limited');

const actually=A.evaluate(h('Petra',4,80,{skills:[3,3,3],skillsAssumedMax:false}), 'cavalry',priorities);
const assumed=A.evaluate(h('Petra',4), 'cavalry',priorities);
assert.equal(actually.hasConfirmedSkill,true);
assert.equal(actually.assumedSkill,false);
assert.equal(assumed.assumedSkill,true);
assert.ok(actually.score<assumed.score,'actual lower skills reduce ranking score');
assert.equal(A.recommend([h('Rosa',4),h('Yang',1),h('Petra',4)],roles,priorities)[0].best,null,
 'never invent a hero for an absent role');
assert.equal(A.recommend([h('Yang',1),{name:'Invented',stars:5}],roles,priorities)[2].choices.length,1,
 'unknown non-catalog identity never added');

// Real Android roster / currently displayed bad result:
 // Howard 5★ and Quinn 5★ were proposed over developed offensive heroes.
const realRoles={...roles,Howard:'infantry',Quinn:'archer',Chenko:'cavalry'};
const realPicks=A.recommend([
 h('Howard',5),h('Zoe',4,80,{tier:2}),h('Long Fei',5),
 h('Petra',4,80,{tier:2}),h('Chenko',5),
 h('Quinn',5),h('Rosa',5),h('Yang',4,80,{tier:4})
],realRoles,priorities);
assert.deepEqual(Array.from(realPicks.map(r=>r.best.name)),['Zoe','Petra','Yang'],
 'the real Gen-6 roster prefers built Yang over Rosa while rejecting early filler heroes');
assert.ok(A.evaluate(h('Quinn',5), 'archer',priorities).score<
 A.evaluate(h('Rosa',4), 'archer',priorities).score,'Quinn 5★ must not trivially displace Rosa 4★');
assert.ok(A.evaluate(h('Howard',5),'infantry',priorities).score<
 A.evaluate(h('Zoe',4),'infantry',priorities).score,'Howard 5★ must not trivially displace Zoe 4★');

const guide=String(A.method);
assert.match(guide,/not Atlas damage/i);
console.log('BEAR HERO ADVISOR: owned-only, 3 role types, Yang 1★ versus Rosa 4★, development, confidence and fallback passed.');
