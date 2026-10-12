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
 assert(total<=stock.reduce((a,b)=>a+b,0),
  'Whole-percent projection must never invent troops');
 assert.equal(total+output.leftover.reduce((a,b)=>a+b,0),
  stock.reduce((a,b)=>a+b,0),
  'Any troop amount not selectable with integer ratios must be reported as unused');
 for(const [i,row] of rows.entries()){
  assert(row.every(n=>Number.isSafeInteger(n)&&n>=0),'Negative or fractional troop quantities');
  assert(row.reduce((a,b)=>a+b,0)<=output.marches[i].capacity,'Overfilled march');
  assert.equal(row.reduce((a,b)=>a+b,0),output.marches[i].filled,'Shown counts must match');
  assert.equal(output.marches[i].ratio.reduce((a,b)=>a+b,0),100,'Displayed percent sum');
  assert(output.marches[i].ratio.every(p=>Number.isInteger(p)&&p>=0&&p<=100),
   'Only whole percentages can be selected in Kingshot');
  const p=output.marches[i].ratio,full=row.reduce((a,b)=>a+b,0);
  const exact=[Math.floor(full*p[0]/100),Math.floor(full*p[1]/100),0];
  exact[2]=full-exact[0]-exact[1];
  assert.equal(row.join('/'),exact.join('/'),
   'Displayed integer ratio must correspond to every exact troop quantity');
 }
 for(let k=0;k<3;k++)
  assert.equal(rows.reduce((n,r)=>n+r[k],0)+output.leftover[k],stock[k],
   'Do not reuse troops; track any leftovers from whole-percentage rounding');
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
 assert.equal(used,rows.reduce((n,r)=>n+r[type],0),
  'Tier assignment must match projected physically selectable class totals');
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
assert((source.match(/const plan=currentFormationPlan\(\);/g)||[]).length===2,
 'Both views share one cached troop plan');
// 5,000 denotes DEFENDING Bear units in the published model, not a
// mandatory Infantry count for every attacking march. A 1/10/89
// starting ratio at 190,810 troops contains only ~1,908 Infantry.
const screenshotCapacity=190810,screenshotTargets=Array(7).fill(screenshotCapacity);
assert(f.ratioForTarget(screenshotCapacity,[1,10,89])[0]<2,
 'The 5k defending-Bear army must not become an attacker Infantry floor');
assert(!Object.hasOwn(f,'minimumInfantry'),
 'An unsourced 5k Infantry constraint must not remain in the optimizer');
const screenshotStock=[120000,195000,945000];
const example=makeModel('weaker');
example.v2.troopGroups=[
 {type:'infantry',tier:10,tg:6,count:screenshotStock[0]},
 {type:'cavalry',tier:10,tg:5,count:screenshotStock[1]},
 {type:'archer',tier:10,tg:7,count:screenshotStock[2]}
];
const estimate=f.expectedWeights(screenshotTargets,example,catalog,c,screenshotStock);
const screenshot=f.allocateByMarginal(screenshotTargets,screenshotStock,estimate.weights);
const available=screenshot.rows.map(row=>row.reduce((n,x)=>n+x,0));
assert(available.every((n,i)=>n<=screenshotTargets[i]));
const playable=f.playableProjection([[858,3072,186880]],
 [10000,10000,220000],[190810],[[1,3,9]]);
assert.deepEqual(Array.from(playable.ratios[0]),[1,2,97],
 '0.45% Infantry cannot be entered: choose a real whole 1% Infantry setting');
assert.deepEqual(Array.from(playable.rows[0]),[1908,3816,185086],
 'Whole game inputs and troop numbers must agree EXACTLY');
assert(Array.from(f.integerPercentages([858,3072,186880]))
 .every(Number.isInteger),'Percentages shown must always be whole numbers');
const tooFew=f.allocateByMarginal(screenshotTargets,[70,195000,945000],estimate.weights);
assert(tooFew.rows.every(row=>row[0]>=0));
assert.equal(tooFew.rows.reduce((n,row)=>n+row[0],0),70,
 'Do not invent Infantry for an imaginary 5,000 troop rule');
const flowSource=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
assert(flowSource.includes('let cachedFormationPlan=null'),'One cached plan for both buttons');
assert((flowSource.match(/const plan=currentFormationPlan\(\);/g)||[]).length===2,
 'Formation cards and damage scenarios must use exactly the same cached plan');
assert(!flowSource.includes("T('Starter ') +best.ratio.join"),
 'Do not print redundant/independently perceived Starter troop values in damage output');
// If there is NO Infantry stock, the game cannot set 1% Infantry;
// report exactly 0% and 0 troops instead of inventing a stock minimum.
const noInf=f.playableProjection([[1,9999,0]],[0,10000,0],[10000],[[1,2,3]]);
assert.deepEqual(Array.from(noInf.ratios[0]),[0,100,0]);
assert.deepEqual(Array.from(noInf.rows[0]),[0,10000,0]);
// Simulated late-game inventories, 1..7 marches and 100%-only settings:
let seed=2678;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
for(let test=0;test<60;test++){
 const n=1+Math.floor(rand()*7),caps=Array.from({length:n},()=>
  5000+Math.floor(rand()*210000));
 const inv=Array.from({length:3},()=>Math.floor(rand()*550000));
 const w=Array.from({length:n},()=>Array.from({length:3},()=>.01+rand()*4));
 const optimum=f.allocateByMarginal(caps,inv,w);
 const playable=f.playableProjection(optimum.rows,inv,caps,w);
 const used=inv.map((_,k)=>playable.rows.reduce((sum,row)=>sum+row[k],0));
 assert(used.every((x,k)=>x<=inv[k]),'Never reuse shared soldiers #'+test);
 playable.rows.forEach((row,i)=>{
  const percent=playable.ratios[i],total=row.reduce((x,y)=>x+y,0);
  assert(total<=caps[i]&&row.every(Number.isSafeInteger));
  assert(percent.every(Number.isInteger),'Whole percent selection only #'+test);
  const rounded=[Math.floor(total*percent[0]/100),
   Math.floor(total*percent[1]/100)];
  rounded[2]=total-rounded[0]-rounded[1];
  assert.equal(row.join(','),rounded.join(','),
   'Game ratio must recreate exact troop counts #'+test);
 });
}
console.log('PASS relative leader strength moves shared scarce troops and high-TG groups between own and joins:',JSON.stringify(byMode));
