/* Pure hero shortlist checks, not an in-game damage benchmark. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/hero-advisor.js','utf8'),env);
const A=env.window.NRW_BEAR_HERO_ADVISOR;
const roles={Zoe:'infantry',Alcar:'infantry',Petra:'cavalry',Sophia:'cavalry',Yang:'archer'};
const priorities={infantry:['Zoe','Alcar'],cavalry:['Petra','Sophia'],archer:['Yang']};
const heroes=[
 {name:'Zoe',level:80,stars:5,tier:0,skills:[5,5,5],skillsAssumedMax:true},
 {name:'Alcar',level:1,stars:1},
 {name:'Petra',level:80,stars:4,skills:[5,5,5],skillsAssumedMax:false},
 {name:'Sophia',level:1,stars:1},
 {name:'Yang',level:80,stars:5}
];
const picks=A.recommend(heroes,roles,priorities);
assert.deepEqual(Array.from(picks.map(g=>g.best.name)),['Zoe','Petra','Yang']);
assert.equal(picks[0].best.assumedSkill,true,'star-derived 5 is an assumption');
assert.equal(picks[1].best.hasConfirmedSkill,true,'actual skill levels are distinguished');
assert.equal(picks[2].best.level,80);
assert.equal(A.recommend([],roles,priorities).every(g=>g.best===null),true,
 'do not invent missing owned heroes');
console.log('BEAR HERO ADVISOR: three roles, progression, unverified skills, no invented heroes OK.');
