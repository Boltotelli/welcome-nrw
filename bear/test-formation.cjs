'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const dir=__dirname;
const core=fs.readFileSync(dir+'/formation-core.js','utf8');
const ui=fs.readFileSync(dir+'/formation-ui.js','utf8');
const wizard=fs.readFileSync(dir+'/wizard.js','utf8');
const html=fs.readFileSync(dir+'/index.html','utf8');
const capSource=fs.readFileSync(dir+'/capacity-core.js','utf8');
for(const [name,code] of [['formation-core',core],['formation-ui',ui],['wizard',wizard],['cap',capSource]])
 new vm.Script(code,{filename:name+'.js'});
const ctx={window:{}};vm.runInNewContext(core,ctx);vm.runInNewContext(capSource,ctx);
const F=ctx.window.NRW_BEAR_FORMATION,C=ctx.window.NRW_BEAR_CAPACITY;
const heroTypes={
 Zoe:'infantry',Petra:'cavalry',Yang:'archer',
 Chenko:'cavalry',Yeonwoo:'archer',Amane:'archer',Margot:'cavalry',
 Hilde:'cavalry','Wee & Woo':'archer',Vivian:'archer',Thrud:'cavalry',
 Marlin:'archer',Rosa:'archer',
 ...Object.fromEntries(Array.from({length:6},(_,i)=>['Inf'+i,'infantry'])),
 ...Object.fromEntries(Array.from({length:3},(_,i)=>['Cav'+i,'cavalry'])),
 ...Object.fromEntries(Array.from({length:3},(_,i)=>['Arch'+i,'archer']))
};
const catalog={heroTypes,pets:[{name:'Mighty Bison',bearSkill:{id:'squad_capacity',values:
 [1500,3000,4500,6000,7500,9000,10500,12000,13500,15000]}}]};
const starter=['Zoe','Petra','Yang'];
const leaders=['Chenko','Yeonwoo','Amane','Margot','Hilde','Vivian'];
const filler=[...Array.from({length:6},(_,i)=>'Inf'+i),
 ...Array.from({length:3},(_,i)=>'Cav'+i),
 ...Array.from({length:3},(_,i)=>'Arch'+i)];
const all=[...starter,...leaders,...filler,'Thrud','Marlin','Rosa'];
const heroes=Object.fromEntries(all.map((name,i)=>[name,{name,level:80,
 skills:[5,5,5],skillsAssumedMax:i%2===0?false:true}]));
const m={values:{cap:100000,troopsI:100000,troopsC:100000,troopsA:900000,
 iAtk:1000,iLet:600,cAtk:1000,cLet:600,aAtk:1000,aLet:600},
 v2:{ownHeroes:starter,manualHeroes:heroes,scannedOwnedHeroes:all,
 joinCount:6,petActive:{'Mighty Bison':true},petSkillRanks:{'Mighty Bison':6},
 valora:[10,4,5,9],troopTiers:[{tier:10,tg:5},{tier:10,tg:5},{tier:10,tg:6}]}};
const combat={configure:()=>[1,1,1],ready:()=>true,damage:(row)=>row[0]+row[1]*1.7+row[2]*2.2};
const plan=()=>F.plan(m,catalog,combat,C);
let p=plan();
assert.equal(p.ready,true);
assert.equal(p.marches.length,7,'one starter and six joins');
assert.equal(p.joinCount,6);
assert.deepEqual(Array.from(p.marches[0].heroes,h=>h.name),starter,'confirmed starter stays unchanged');
assert.deepEqual(Array.from(p.marches.slice(1),x=>x.heroes[0]?.name).sort(),leaders.slice().sort(),
 'reserve all six offensive join heroes before filler slots, order by confirmed skill');
const selected=p.marches.flatMap(x=>x.heroes.filter(Boolean).map(y=>y.name));
assert.equal(new Set(selected).size,21,'each hero in only one concurrent march');
assert.ok(!p.marches.some(x=>x.slot>0&&x.heroes[0]?.name==='Thrud'),
 'Thrud is NOT an auto-selected offensive first-slot joiner');
assert.ok(p.marches.slice(1).some(x=>x.heroes[0]?.name==='Hilde'),
 'Hilde remains an allowed lower-priority join lead');
assert.ok(p.marches.slice(1).some(x=>x.heroes[0]?.name==='Vivian'),
 'Vivian must be reserved as an offensive left-slot leader, never ignored');
assert.ok(p.marches.slice(1).every(x=>x.heroes[0]!==null),
 'six available suitable offensive leaders must fill all six joins');
assert.ok(p.marches.slice(1).some(x=>x.heroes[0]?.name==='Vivian'&&x.firstRole==='damage-taken'),
 'Vivian Crouching Tiger must be classified as enemy-damage-taken, not defense');
for(const march of p.marches){
 const actualClasses=march.heroes.filter(Boolean).map(h=>catalog.heroTypes[h.name]);
 assert.equal(new Set(actualClasses).size,actualClasses.length,
  'no two heroes from the same class in one march: '+actualClasses);
 assert.ok(actualClasses.every(x=>['infantry','cavalry','archer'].includes(x)));
 assert.ok(!march.heroes.some(h=>h?.name==='Marlin')||!march.heroes.some(h=>h?.name==='Rosa'),
  'Marlin and Rosa are BOTH archers and cannot appear together');
 assert.equal(march.ratio.reduce((a,b)=>a+b,0),100,
  'game-selectable ratios must sum to 100');
 assert.ok(march.ratio.every(Number.isInteger),'no decimal percentages');
}
for(let j=1;j<p.marches.length;j++){
 assert.ok(p.marches[j].heroes[1].level===80&&p.marches[j].heroes[2].level===80,
  'slot 2 and 3 prefer high-level support heroes');
}
assert.deepEqual(Array.from(p.used),[100000,100000,900000]);
assert.deepEqual(Array.from(p.leftover),[0,0,0],'all available troops can be used if capacity permits');
for(const march of p.marches){
 assert.ok(march.filled<=march.capacity,'cannot exceed personal march capacity');
 assert.equal(march.troops.reduce((a,b)=>a+b,0),march.filled);
}
for(let k=0;k<3;k++)assert.ok(p.used[k]<=p.stock[k],'no stock over-allocation');
assert.equal(p.allHeroesAssigned,true);
assert.equal(p.allHeroLevelsKnown,true);
assert.equal(p.starterScore!==null,true,'starter model still available, no invented join damage');
assert.equal(p.scoreType,'starter-plus-join-proxy',
 'results distinguish provisional join proxies from real rally-leader damage');
assert.ok(!ui.includes('.ratio[k].toFixed(1)'),'game formation ratios cannot use decimals');
const pAgain=plan();
assert.equal(JSON.stringify(pAgain.marches.map(x=>x.troops)),JSON.stringify(p.marches.map(x=>x.troops)),
 'same inputs yield reproducible allocations');
m.v2.joinCount=0;p=plan();assert.equal(p.marches.length,1);
m.v2.joinCount=20;p=plan();assert.equal(p.marches.length,7,'hard limit of 6 joins');
m.v2.joinCount=6;
m.values.troopsA=10000;p=plan();
assert.equal(p.ready,true);
for(let k=0;k<3;k++)assert.ok(p.used[k]<=p.stock[k],'scarce archers must never go negative');
const supply=[...p.stock],totals=p.marches.reduce((a,x)=>a+x.filled,0);
assert.ok(totals<=supply.reduce((a,b)=>a+b,0));
m.values.troopsA=900000;
for(const name of ['Inf4','Inf5','Arch2'])delete m.v2.manualHeroes[name]; // not enough to fill all joins
p=plan();assert.equal(p.allHeroesAssigned,false,'missing heroes are not synthesized');
assert.equal(p.allHeroLevelsKnown,false,'missing join capacity remains provisional');
for(const name of ['Inf4','Inf5','Arch2'])m.v2.manualHeroes[name]=heroes[name];
m.v2.scannedOwnedHeroes=starter.concat(filler,'Thrud');p=plan();
assert.ok(p.marches.some(x=>x.slot>0&&!x.heroes[0]),'unsafe first skills are not auto recommended');
assert.ok(p.marches.filter(x=>x.slot>0&&!x.heroes[0]).every(x=>x.capacity===0&&x.filled===0),
 'an entirely empty Join 6 must not misleadingly show a full troop deployment');
m.v2.scannedOwnedHeroes=all;
m.values.cap=0;p=plan();assert.equal(p.ready,false);
assert.match(html,/formation-core\.js\?v=/);
assert.match(html,/formation-ui\.js\?v=/);
assert.ok(html.indexOf('formation-core.js')<html.indexOf('formation-ui.js'));
assert.ok(html.indexOf('formation-ui.js')<html.indexOf('wizard.js'));
assert.ok(wizard.includes('formationUI?.show()'),'next page must show proposal');
assert.ok(wizard.includes('formationUI?.refreshSetup()'),'current step includes march queues');
assert.ok(ui.includes("document.getElementById('joinCount')"),'reuse existing slots field');
assert.ok(!ui.includes('localStorage.setItem'),'reuse existing single browser persistence');
console.log('FORMATION: starter + 6 joins, 21 distinct heroes, left-slot safety, Lv80 fillers, troop limits, scarcity, missing data and integration passed.');
