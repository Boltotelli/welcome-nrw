const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root={window:{},Math,console};root.window.window=root.window;
const base=__dirname;
for(const f of ['formation-core.js','combat.js']){
 vm.runInNewContext(fs.readFileSync(path.join(base,f),'utf8'),root,{filename:f});
}
const p=root.window.NRW_BEAR_FORMATION,c=root.window.NRW_BEAR_COMBAT;
const output=(targets,stock,own)=>p.optimizeCombined(targets,stock,[472,1416,1888*1.1],own||[472,1416,1888*1.1]);
const check=(targets,stock,own)=>{
 const rows=output(targets,stock,own);
 assert.equal(rows.length,targets.length);
 for(const [i,row] of rows.entries()){
  assert(row.every(n=>Number.isSafeInteger(n)&&n>=0));
  assert(row.reduce((a,b)=>a+b,0)<=targets[i]);
 }
 for(let k=0;k<3;k++)assert(rows.reduce((n,r)=>n+r[k],0)<=stock[k]);
 return rows;
};
const ample=check(Array(7).fill(180000),[450000,450000,800000],[472*3,1416*1.5,1888*2.2]);
assert.notDeepEqual(Array.from(ample[0],x=>Math.round(x/1800)),[10,10,80],
 'Starter must not always be forced to 10/10/80');
assert(ample[1][2]>0,'Join should include archers');
const scarce=check(Array(5).fill(160000),[450000,300000,300000],[472,1416,1888*1.1]);
assert(scarce.some((x,i)=>i>0&&p.integerPercentages(x)[2]!==80),
 'Scarce Archers cannot be 80% on every join');
check([200000,200000,200000],[0,600000,0]);
check([250000],[100000,150000,250000]);
check([1,1,1,1,1,1,1],[1,1,3]);
const model={v2:{troopGroups:[{type:'infantry',tier:10,tg:5,count:10000},
 {type:'infantry',tier:9,tg:2,count:8000},
 {type:'cavalry',tier:10,tg:5,count:11000},
 {type:'archer',tier:10,tg:8,count:90000}]},
 values:{troopsI:999999,troopsC:999999,troopsA:999999}};
assert.deepEqual(Array.from(p.availableStock(model)),[18000,11000,90000],
 'Actual mixed T/TG troop inventory must take priority over stale totals');
const weights=p.typeWeights(model,c);
assert(weights[2]>weights[1]&&weights[1]>weights[0]);
const page=fs.readFileSync(path.join(base,'../preview-v3.html'),'utf8');
assert(page.includes('name-flow.js'));
const flow=fs.readFileSync(path.join(base,'name-flow.js'),'utf8');
assert(!flow.includes('const baseRatios=[10,10,80]'),'No fabricated 10/10/80 displayed');
assert(!flow.includes('for(let inf=0;inf<=100;inf++)'),'No second independent starter optimizer');
assert(flow.includes('const plan=alloc.plan(model,C,combat,window.NRW_BEAR_CAPACITY)'),
 'Damage and formation results must use same stock allocation');
console.log('PASS stock conservation, scarcity, starter-vs-joins, mixed tiers and one unified optimizer');
