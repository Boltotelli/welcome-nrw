/* Kingshot Bear comparative damage laboratory. All math runs locally.
 * T10/TG and attack/lethality use the existing provisional sqrt combat
 * index. External rally leader stats and random hero proc effects are
 * UNKNOWN; join values are explicitly labeled player-class proxies.
 * No claim to predict real Bear points. No edits to stored formations.
 */
(function(root){
'use strict';
const PRESETS=Object.freeze([
 {id:'optimized',label:'Optimized',ratios:null},
 {id:'1-12-87',label:'1 / 12 / 87',ratios:[1,12]},
 {id:'1-10-89',label:'1 / 10 / 89',ratios:[1,10]},
 {id:'2-15-83',label:'2 / 15 / 83',ratios:[2,15]},
 {id:'2-12-86',label:'2 / 12 / 86',ratios:[2,12]},
 {id:'5-5-90',label:'5 / 5 / 90',ratios:[5,5]},
 {id:'10-10-80',label:'10 / 10 / 80',ratios:[10,10]},
 {id:'5-20-75',label:'5 / 20 / 75',ratios:[5,20]}
]);
function ratioValid(pair){
 return Array.isArray(pair)&&pair.length===2&&pair.every(v=>
  typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=100)&&pair[0]+pair[1]<=100;
}
function ratio3(pair){return [pair[0],pair[1],100-pair[0]-pair[1]];}
function presetFromPlan(plan){
 return plan.marches.map(m=>{
  const r=m.ratio||[0,0,0];return [Math.round(r[0]),Math.round(r[1])];
 });
}
function scoreRows(rows,model,combat){
 const levels=combat?.configure?.(model?.v2);
 const v=model?.values;
 if(!combat?.ready?.(v,levels)||typeof combat?.damage!=='function')return null;
 const own={...v};
 if(model.v2?.squadSeparate){
  const a=Number(v.squadAtk)||0,l=Number(v.squadLet)||0;
  for(const x of ['iAtk','cAtk','aAtk'])own[x]=(Number(own[x])||0)+a;
  for(const x of ['iLet','cLet','aLet'])own[x]=(Number(own[x])||0)+l;
 }
 const pitfall=Number(v.pitfall)||0;
 const scores=rows.map((row,i)=>{
  // The join score intentionally does not use the own starter's extra
  // expedition bonuses or fictional external captain stats.
  const result=combat.damage(row,i===0?own:v,levels,pitfall);
  return Number.isFinite(result)?result:null;
 });
 if(scores.some(x=>x===null))return null;
 return {starter:scores[0],joins:scores.slice(1),joinProxy:scores.slice(1).reduce((a,b)=>a+b,0),
  overall:scores.reduce((a,b)=>a+b,0),unit:'relative-model-index'};
}
function evaluate(plan,model,combat,formation,ratios){
 if(!plan?.ready)return {ready:false,reason:'formation-not-ready',plan};
 if(!Array.isArray(ratios)||ratios.length!==plan.marches.length||ratios.some(r=>!ratioValid(r)))
  return {ready:false,reason:'invalid-percentages',plan};
 const targets=plan.marches.map(m=>m.eligible===false?0:Math.max(0,Math.floor(m.filled)));
 const stock=plan.stock.map(Number);
 if(!formation?.allocateStock||!formation?.integerPercentages)
  return {ready:false,reason:'allocator-missing',plan};
 const rows=formation.allocateStock(targets,stock,ratios[0],ratios.slice(1));
 const used=[0,1,2].map(k=>rows.reduce((n,r)=>n+r[k],0));
 const left=stock.map((v,i)=>v-used[i]);
 const total=rows.reduce((n,r)=>n+r.reduce((a,b)=>a+b,0),0);
 if(rows.some((row,i)=>row.some(n=>!Number.isInteger(n)||n<0)||
  row.reduce((a,b)=>a+b,0)>Math.floor(plan.marches[i].capacity))||
  left.some(x=>x<0))return {ready:false,reason:'inventory-constraint',plan};
 const measures=rows.map((row,i)=>({slot:i,counts:row.slice(),
  actual:formation.integerPercentages(row),desired:ratio3(ratios[i]),
  filled:row.reduce((a,b)=>a+b,0),cap:plan.marches[i].capacity,
  adjusted:formation.integerPercentages(row).some((n,k)=>n!==ratio3(ratios[i])[k])}));
 const actualScore=scoreRows(rows,model,combat);
 const baselineScore=scoreRows(plan.marches.map(m=>m.troops),model,combat);
 const changes=actualScore&&baselineScore?{
  totalPct:baselineScore.overall?100*(actualScore.overall/baselineScore.overall-1):null,
  starterPct:baselineScore.starter?100*(actualScore.starter/baselineScore.starter-1):null,
  joinPct:baselineScore.joinProxy?100*(actualScore.joinProxy/baselineScore.joinProxy-1):null
 }:null;
 return {ready:true,measures,rows,stock,used,left,total,originalTotal:plan.total,
  requested:ratios.map(r=>r.slice()),score:actualScore,reference:baselineScore,changes,
  limited:measures.some(x=>x.adjusted),
  missingLeads:plan.marches.filter(m=>m.slot>0&&m.eligible===false).length};
}
/* Explicit hypothetical 4-joiner skill scenarios, NOT historical predictions.
 * Values for Lv5: Amane +25% ATK all, Chenko +25% Lethality all.
 * Other heroes / damage-taken effects are NOT represented without verified
 * effect op codes and exact skill levels. Input stats must exclude these
 * temporary bonuses or a scenario could double count them.
 */
const JOIN_SCENARIOS=Object.freeze([
 {id:'no-skill',attack:0,lethality:0,description:'No modeled joiner skill'},
 {id:'balanced-2-2',attack:50,lethality:50,description:'2× Amane + 2× Chenko (Lv5)'},
 {id:'attack-4',attack:100,lethality:0,description:'4× Amane (Lv5)'},
 {id:'lethality-4',attack:0,lethality:100,description:'4× Chenko (Lv5)'}
]);
function scenarioOwn(troops,model,combat,scenarioId){
 const found=JOIN_SCENARIOS.find(s=>s.id===scenarioId);
 if(!found||!Array.isArray(troops)||troops.length!==3)return null;
 const values=model?.values;
 if(!values||!combat?.configure||!combat?.ready||!combat?.damage)return null;
 const troopTiers=combat.configure(model?.v2);
 if(!combat.ready(values,troopTiers))return null;
 const merged={...values};
 if(model.v2?.squadSeparate){
  for(const x of ['iAtk','cAtk','aAtk'])merged[x]=Number(merged[x])+Number(values.squadAtk||0);
  for(const x of ['iLet','cLet','aLet'])merged[x]=Number(merged[x])+Number(values.squadLet||0);
 }
 const basic=combat.damage(troops,merged,troopTiers,Number(values.pitfall)||0);
 for(const k of ['iAtk','cAtk','aAtk'])merged[k]=Number(merged[k])+found.attack;
 for(const k of ['iLet','cLet','aLet'])merged[k]=Number(merged[k])+found.lethality;
 const withSkills=combat.damage(troops,merged,troopTiers,Number(values.pitfall)||0);
 if(!Number.isFinite(basic)||basic<=0||!Number.isFinite(withSkills))return null;
 return {id:found.id,baselineIndex:basic,scenarioIndex:withSkills,
  relativePercent:100*withSkills/basic,
  changePercent:100*(withSkills/basic-1),
  attackBonus:found.attack,lethalityBonus:found.lethality,
  provisional:true};
}
root.NRW_BEAR_SIMULATION={PRESETS,ratioValid,ratio3,presetFromPlan,scoreRows,evaluate,JOIN_SCENARIOS,scenarioOwn};
})(window);
