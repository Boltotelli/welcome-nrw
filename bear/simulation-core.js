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
/* One observed OWN-STARTER rally calibrates only the own starter forecast.
 * The historic attack/lethality/4 join skills are NOT available. Current
 * class stats are used as a proxy in both sides of the model ratio.
 * Never project a join or sum projected own damage with join indices.
 */
function validateCalibration(ref){
 if(!ref||!Number.isSafeInteger(Number(ref.damage))||Number(ref.damage)<=0||
    Number(ref.damage)>1e13||!Number.isInteger(Number(ref.troops))||
    Number(ref.troops)<100||Number(ref.troops)>5e6||!ratioValid(ref.ratio))return false;
 return Array.isArray(ref.tiers)&&ref.tiers.length===3&&ref.tiers.every(t=>
  t&&Number.isInteger(t.tier)&&t.tier>=1&&t.tier<=11&&
  Number.isInteger(t.tg)&&t.tg>=0&&t.tg<=8);
}
function calibrationCounts(ref){
 if(!validateCalibration(ref))return null;
 const i=Math.floor(ref.troops*ref.ratio[0]/100);
 const c=Math.floor(ref.troops*ref.ratio[1]/100);
 return [i,c,ref.troops-i-c];
}
function calibrateOwn(starterTroops,model,combat,ref){
 if(!validateCalibration(ref)||!Array.isArray(starterTroops)||starterTroops.length!==3||
  starterTroops.some(x=>!Number.isSafeInteger(x)||x<0))return null;
 const oldModel={values:model?.values,v2:{...(model?.v2||{}),troopTiers:ref.tiers}};
 const reference=scoreRows([calibrationCounts(ref)],oldModel,combat)?.starter;
 const candidate=scoreRows([starterTroops],model,combat)?.starter;
 if(!reference||!Number.isFinite(reference)||candidate===null||!Number.isFinite(candidate))return null;
 return {estimated:Math.round(Number(ref.damage)*candidate/reference),
  measuredDamage:Number(ref.damage),referenceTroops:Number(ref.troops),
  referenceRatio:ratio3(ref.ratio),
  relativeChangePercent:100*(candidate/reference-1),indexReference:reference,
  indexCandidate:candidate,provisional:true,
  caveat:'Historical join skill effects and battle buffs are unknown. Current class stats are used as a proxy; this is not a verified damage prediction.'};
}

root.NRW_BEAR_SIMULATION={PRESETS,ratioValid,ratio3,presetFromPlan,scoreRows,evaluate,validateCalibration,calibrationCounts,calibrateOwn};
})(window);
