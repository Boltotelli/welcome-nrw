'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const w={},ctx={window:w,console,Math};w.window=w;
for(const f of ['skill-effects.js','hero-advisor.js','hero-explanations.js','combat.js','../own-baseline.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,f),'utf8'),ctx);
const records=JSON.parse(fs.readFileSync(path.join(__dirname,'../hero-reference.json'),'utf8')).records;
const refs=new Map(records.map(r=>[r.name,r]));
const get=(n,s,t)=>{const r=refs.get(n);return r?{name:n,bonus:r.starProgression.expeditionAttackPercent[s*6+t],skills:r.expeditionSkills}:null;};
const types=Object.fromEntries(records.map(r=>[r.name,r.troopType]));
const A=w.NRW_BEAR_HERO_ADVISOR,E=w.NRW_BEAR_HERO_EXPLANATIONS;
let checked=0;
for(const [left,right] of [['Zoe','Long Fei'],['Alcar','Zoe'],['Rosa','Yang']]){
 assert.equal(types[left],types[right],'Only same-class comparisons');
 for(const stars of [0,2,4,5])for(const widget of [0,5,10])for(const known of [false,true]){
  const owned=[left,right].map((name,i)=>({name,level:80,stars,tier:stars===5?0:i,widget,skillsAssumedMax:true}));
  const model=known?{values:{iAtk:600,iLet:500,cAtk:650,cLet:520,aAtk:720,aLet:610},v2:{troopTiers:[0,1,2].map(()=>({tier:10,tg:4}))}}:null;
  const context=A.modelContext(model,w.NRW_BEAR_COMBAT,[5,15,80]);
  const groups=A.recommend(owned,types,null,get,w.NRW_BEAR_OWN_BASELINE.widgetValue,context);
  const group=groups.find(g=>g.type===types[left]);
  const frozen=JSON.stringify(group),out=E.comparison(group);
  assert.equal(JSON.stringify(group),frozen,'Diagnostics must not mutate scores or order');
  assert.equal(out.winner,group.best);assert.equal(out.other,group.choices[1]);
  assert(out.uncertain,'Unconfirmed skill ranks must always be marked');
  assert(Math.abs(out.gap-(group.best.score/group.choices[1].score-1)*100)<1e-8);
  if(group.choices[1].optimisticScore>=group.best.conservativeScore&&group.best.score!==group.choices[1].score&&known)assert(['overlap','partial'].includes(out.state));
  checked++;
 }
}
const missing=A.recommend([{name:'Zoe',stars:null}],types,null,get,null)[0];
assert.equal(E.comparison(missing).state,'missing');
assert.equal(E.comparison({type:'infantry',best:{score:100,type:'infantry',usesAttackReference:true,confidence:'higher'},choices:[]}).other,null);
for(const [key,row] of Object.entries(E.words))assert(row.length===4&&row.every(s=>typeof s==='string'&&s.length>0),'Four locales: '+key);
// Loading the diagnostics module cannot change ANY ranking or numeric field.
const full=records.map(r=>({name:r.name,level:80,stars:4,tier:2,widget:5,skillsAssumedMax:true}));
const before=JSON.stringify(A.recommend(full,types,null,get,w.NRW_BEAR_OWN_BASELINE.widgetValue));
for(const g of A.recommend(full,types,null,get,w.NRW_BEAR_OWN_BASELINE.widgetValue))E.comparison(g);
assert.equal(JSON.stringify(A.recommend(full,types,null,get,w.NRW_BEAR_OWN_BASELINE.widgetValue)),before);
console.log(`PASS: ${checked} same-class scenarios, exact gaps, honest assumptions, immutable rankings, all four locales`);
