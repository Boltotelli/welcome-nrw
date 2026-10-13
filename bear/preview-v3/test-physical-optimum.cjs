/* V3 Bear: source-based marginal optimization and explainability regression.
 * No official Kingshot damage or foreign rally-leader data are assumed. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root={window:{},Math,console};root.window.window=root.window;
for(const name of ['combat.js','formation-core.js','hero-advisor.js']){
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,name),'utf8'),root,{filename:name});
}
const f=root.window.NRW_BEAR_FORMATION,c=root.window.NRW_BEAR_COMBAT,
 advisor=root.window.NRW_BEAR_HERO_ADVISOR;
const values={iAtk:210,iLet:230,cAtk:190,cLet:260,aAtk:300,aLet:360};
const troops=[275000,395000,695000];
const groups=[
 {type:'infantry',tier:10,tg:6,count:troops[0]},
 {type:'cavalry',tier:10,tg:5,count:troops[1]},
 {type:'archer',tier:10,tg:6,count:troops[2]}
];
const roster=[
 ['Zoe','infantry'],['Petra','cavalry'],['Yang','archer'],
 ['Chenko','infantry'],['Amadeus','cavalry'],['Yeonwoo','archer'],
 ['Margot','infantry'],['Amane','archer'],['Vivian','archer'],
 ['Hilde','cavalry'],['Wee & Woo','archer'],
 ['FillerA','infantry'],['FillerB','cavalry'],['FillerC','archer'],
 ['FillerD','infantry'],['FillerE','cavalry'],['FillerF','archer'],
 ['FillerG','infantry'],['FillerH','cavalry'],['FillerI','archer']
];
const catalog={heroTypes:Object.fromEntries(roster),heroes:roster.map(([name])=>({name}))};
const model={
 values:{...values,troopsI:troops[0],troopsC:troops[1],troopsA:troops[2]},
 v2:{joinLeaderComparison:'similar',joinCount:6,
  ownHeroes:['Zoe','Petra','Yang'],
  troopGroups:groups,scannedOwnedHeroes:roster.map(([name])=>name),
  manualHeroes:Object.fromEntries(roster.map(([name])=>
   [name,{name,level:80,stars:4,tier:3,skills:[5,5,5]}]))}
};
const approx=(a,b,tol=1e-7)=>assert(Math.abs(a-b)<=tol,`${a} != ${b}`);
const w=f.expectedWeights(Array(7).fill(190000),model,catalog,c,troops);
assert(w.hasKnownStats);
assert(w.quality.every(q=>q.confirmed));
assert(!w.hasKnownHeroEffects);
assert(w.assumptions.includes('foreign-leader-class-stats-unknown'));
const types=['infantry','cavalry','archer'];
const tg=[6,5,6],a=['iAtk','cAtk','aAtk'],l=['iLet','cLet','aLet'];
const raw=types.map((type,i)=>c.troopAttack(type,10,tg[i])*
 (i===2?1.1:1)*(1+(values[a[i]]+25)/100)*(1+values[l[i]]/100));
const squares=raw.map(x=>x*x),sum=squares.reduce((n,x)=>n+x,0);
for(let i=0;i<3;i++)approx(w.ownOptimal[i],100*squares[i]/sum);
assert(w.ownOptimal[1]>5,'Cavalry must not be discarded by a 1/10/89 prior');
const boost={...model,values:{...model.values,cAtk:690}};
const higher=f.expectedWeights([190000,190000],boost,catalog,c,troops);
assert(higher.ownOptimal[1]>w.ownOptimal[1],
 'Cavalry attack must affect hosted rally class composition');
for(let i=0;i<3;i++)approx(higher.joinOptimal[i],w.joinOptimal[i]);
const ratioHero=advisor.modelContext(model,c);
assert(ratioHero.ratio[1]>5);
assert(!String(ratioHero.mode).includes('5-18-77'));
const shifted=advisor.modelContext(model,c,[8,42,50]);
approx(shifted.ratio[1],42);
const capacity={breakdown:()=>({hasBase:true,complete:true,base:140000,master:0,pet:0,minister:0}),
 levelCapacity:()=>13470};
const plan=f.plan(model,catalog,c,capacity);
assert(plan.ready);assert.equal(plan.marches.length,7);
assert(plan.ownUnconstrainedRatio&&plan.joinUnconstrainedRatio);
assert(plan.modelHasStats);
assert.equal(plan.ratioMethod,'marginal-physical-damage-model');
for(let k=0;k<3;k++)
 assert.equal(plan.used[k]+plan.leftover[k],troops[k]);
for(const row of plan.marches){
 assert(row.filled<=row.capacity);
 assert.equal(row.ratio.reduce((n,p)=>n+p,0),100);
 assert(row.ratio.every(p=>Number.isInteger(p)&&p>=0));
 const inf=Math.floor(row.filled*row.ratio[0]/100),
  cav=Math.floor(row.filled*row.ratio[1]/100);
 assert.deepEqual(Array.from(row.troops),[inf,cav,row.filled-inf-cav]);
}
const repeat=f.plan(model,catalog,c,capacity);
assert.deepEqual(plan.marches.map(r=>Array.from(r.troops)),
 repeat.marches.map(r=>Array.from(r.troops)));
const ideal=[Math.round(100000*w.ownOptimal[0]/100),Math.round(100000*w.ownOptimal[1]/100),0];
ideal[2]=100000-ideal[0]-ideal[1];
const lone=f.scoreFor(ideal,w.weights[0]);
const old=f.scoreFor([1000,10000,89000],w.weights[0]);
assert(lone>old,'Illustrative physical-class optimum beats preset at fixed size');
const source=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
assert(source.includes("'Warum diese Formation?'"));
assert(source.includes('w?.ownOptimal')||source.includes('expected?.ownOptimal'));
console.log('PASS: no preset, physically derived ratios, expected Cavalry response, unknown foreign leaders, hero-context coupling, integer-% safety and stable 7-march stock');