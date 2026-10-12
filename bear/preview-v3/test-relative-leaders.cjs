/* Regression: prioritizing joiners can lose damage when own leader is stronger.
 * 7 simultaneous marches, shared inventory, mixed tiers, user-relative
 * strength scenario, same plan consumed by damage + formation output.
 * These are community-model indices, not official KS damage forecasts.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const w={};const context={window:w,Math,console};w.window=w;
for(const file of ['formation-core.js','combat.js']){
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
}
const f=w.NRW_BEAR_FORMATION,c=w.NRW_BEAR_COMBAT;
const catalog={heroTypes:{},heroes:[]};
const heroes=[
 ['Zoe','infantry'],['Petra','cavalry'],['Yang','archer'],
 ['Chenko','infantry'],['Amane','archer'],['Yeonwoo','archer'],
 ['Amadeus','cavalry'],['Margot','infantry'],['Vivian','archer'],
 ['fillInf1','infantry'],['fillCav1','cavalry'],['fillArc1','archer'],
 ['fillInf2','infantry'],['fillCav2','cavalry'],['fillArc2','archer'],
 ['fillInf3','infantry'],['fillCav3','cavalry'],['fillArc3','archer']
];
for(const [name,type] of heroes){catalog.heroes.push({name});catalog.heroTypes[name]=type;}
const cap={breakdown:()=>({hasBase:true,complete:true,base:140000,master:0,pet:0}),
 levelCapacity:()=>15000};
const stock=[190000,240000,360000],tiers=[
 {type:'infantry',tier:10,tg:6,count:190000},
 {type:'cavalry',tier:10,tg:5,count:240000},
 {type:'archer',tier:10,tg:7,count:360000}
];
function makeModel(comparison){
 const manualHeroes={};
 for(const [name] of heroes)manualHeroes[name]={name,level:80,stars:4,tier:1,widget:0,skills:[5,5,5],skillsAssumedMax:true};
 return {values:{troopsI:stock[0],troopsC:stock[1],troopsA:stock[2]},
 v2:{joinLeaderComparison:comparison,joinCount:6,ownHeroes:['Zoe','Petra','Yang'],
  manualHeroes,scannedOwnedHeroes:heroes.map(x=>x[0]),troopGroups:tiers}};
}
const byMode={};
for(const comparison of ['weaker','similar','stronger']){
 const model=makeModel(comparison);
 const output=f.plan(model,catalog,c,cap);
 assert(output.ready,'Must have valid simultaneous-march plan');
 assert.equal(output.marches.length,7,'Starter + 6 joins');
 const rows=output.marches.map(x=>Array.from(x.troops));
 const total=rows.reduce((n,r)=>n+r.reduce((a,b)=>a+b,0),0);
 assert.equal(total,stock.reduce((a,b)=>a+b,0),'All available troops are allocated');
 for(const [i,row] of rows.entries()){
  assert(row.every(n=>Number.isSafeInteger(n)&&n>=0),'Negative or fractional troop quantities');
  assert(row.reduce((a,b)=>a+b,0)<=output.marches[i].capacity,'Overfilled march');
  assert.equal(row.reduce((a,b)=>a+b,0),output.marches[i].filled,'Shown counts must match');
  assert.equal(output.marches[i].ratio.reduce((a,b)=>a+b,0),100,'Displayed percent sum');
 }
 for(let k=0;k<3;k++)
  assert.equal(rows.reduce((n,r)=>n+r[k],0),stock[k],'Do not reuse or lose troop stock');
 byMode[comparison]={own:output.marches[0].filled,
   joins:output.marches.slice(1).reduce((n,r)=>n+r.filled,0),
   ownArchers:rows[0][2],joinArchers:rows.slice(1).reduce((n,r)=>n+r[2],0),
   order:Array.from(output.tierPriority),score:output.modeledTotal};
}
assert(byMode.weaker.own>byMode.similar.own,'Stronger own rally receives MORE troops than equal case');
assert(byMode.similar.own>byMode.stronger.own,'Weaker own rally receives FEWER troops than equal case');
assert(byMode.weaker.ownArchers>byMode.stronger.ownArchers,
 'Scarce archers shift toward stronger own rally');
assert.equal(byMode.weaker.order[0],0,'High-TG troop allocation starts at own rally when own is stronger');
assert.equal(byMode.stronger.order.at(-1),0,'High-TG troops prioritize stronger joining leaders');
const allLevels=c.configure(makeModel('weaker').v2);
const rows=f.plan(makeModel('weaker'),catalog,c,cap).marches.map(x=>x.troops);
const tiersOrdered=c.allocateLevels(rows,allLevels,byMode.weaker.order);
for(let type=0;type<3;type++){
 const used=tiersOrdered.reduce((n,perMarch)=>n+perMarch[type].groups.reduce((x,g)=>x+g.count,0),0);
 assert.equal(used,stock[type],'Mixed-TG assignment must consume only available stock once');
}
const noJoin=makeModel('similar');noJoin.v2.joinCount=0;
const one=f.plan(noJoin,catalog,c,cap);
assert(one.ready&&one.marches.length===1&&one.marches[0].filled<=one.marches[0].capacity);
const little=makeModel('weaker');little.v2.troopGroups=[
 {type:'infantry',tier:10,tg:0,count:100},
 {type:'cavalry',tier:9,tg:0,count:100},
 {type:'archer',tier:10,tg:0,count:500}
];little.values={troopsI:100,troopsC:100,troopsA:500};
const small=f.plan(little,catalog,c,cap);
assert(small.ready&&small.marches.every(x=>x.troops.every(n=>n>=0)));
const source=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
assert(source.includes('rallyStrengthField()'),'UI must expose strength selector');
assert(source.includes('joinLeaderComparison:v.joinLeaderComparison'),'Persist strength scenario');
assert(source.includes('plan.tierPriority'),'Both result views must agree on high-tier assignment');
assert(source.includes('alloc.plan(model,C,combat,window.NRW_BEAR_CAPACITY)'));
// Reproduce the reported 0% Infantry / duplicated starter UI bug.
// ~190,810 march capacity with 7 marches and plenty of actual Infantry:
const screenshotCapacity=190810,screenshotTargets=Array(7).fill(screenshotCapacity);
const screenshotStock=[120000,195000,945000];
const example=makeModel('weaker');
example.v2.troopGroups=[
 {type:'infantry',tier:10,tg:6,count:screenshotStock[0]},
 {type:'cavalry',tier:10,tg:5,count:screenshotStock[1]},
 {type:'archer',tier:10,tg:7,count:screenshotStock[2]}
];
const estimate=f.expectedWeights(screenshotTargets,example,catalog,c,screenshotStock);
const screenshot=f.allocateByMarginal(screenshotTargets,screenshotStock,estimate.weights);
for(const [i,row] of screenshot.rows.entries()){
 assert(row[0]>=5000,'March '+i+' should receive >=5000 Infantry when stock allows');
 assert(f.integerPercentages(row)[0]>=1,
  'Do not show 0% Infantry for a nonzero, sufficiently supplied march');
}
assert.equal(screenshot.infantryShortage,false);
assert.deepEqual(Array.from(f.integerPercentages([858,3072,186880])),[0.5,1.6,97.9],
 'Even historic low-Infantry data must not be rounded to an illusory zero');
const tooFew=f.allocateByMarginal(screenshotTargets,[70,195000,945000],estimate.weights);
assert(tooFew.infantryShortage,'Insufficient Infantry must be signalled');
assert(tooFew.rows.every(row=>row[0]>=0));
assert.equal(tooFew.rows.reduce((n,row)=>n+row[0],0),70,
 'Never invent 5,000 infantry that the user does not own');
const flowSource=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
assert(flowSource.includes('let cachedFormationPlan=null'),'One cached plan for both buttons');
assert((flowSource.match(/const plan=currentFormationPlan\(\);/g)||[]).length===2,
 'Formation cards and damage scenarios must use exactly the same cached plan');
assert(!flowSource.includes("T('Starter ') +best.ratio.join"),
 'Do not print redundant/independently perceived Starter troop values in damage output');
console.log('PASS relative leader strength moves shared scarce troops and high-TG groups between own and joins:',JSON.stringify(byMode));
