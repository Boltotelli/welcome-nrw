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

const guide=String(A.method);
assert.match(guide,/not Atlas damage/i);
console.log('BEAR HERO ADVISOR: owned-only, 3 role types, Yang 1★ versus Rosa 4★, development, confidence and fallback passed.');
