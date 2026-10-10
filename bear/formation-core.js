/* Inventory-constrained Bear Trap starter + join formation suggestions.
 * Uses ONLY scanned/owned heroes; no invented hero skill levels, no external
 * leader damage stats. One starter plus at most six parallel joins.
 * This is a provisional allocation/search model, not true game damage.
 */
(function(root){
'use strict';
// Conservative Bear joiners sourced from Kingshot Atlas' Bear Rally Heroes
// guide (https://ks-atlas.com/tools/atlas-database/bear-rally-heroes),
// its maintainer's May 2026 /r/KingShot guidance and cross-checked with
// https://strategicnoodle.com/kingshot/database/heroes.
// Thrud is deliberately NOT a recommended automatic first-slot joiner;
// Hilde is allowed by NRW, lower-priority as partly defensive.
const JOIN_PRIORITIES=[
 ['Chenko','lethality',120],['Yeonwoo','lethality',120],
 ['Amadeus','lethality',120],['Amane','attack',116],
 ['Margot','attack',115],
 // Vivian's FIRST Expedition skill Crouching Tiger increases enemy damage
 // taken by 5/10/15/20/25%; offensive Bear joiner, not a defensive filler.
 // https://kingshotdata.com/heroes/vivian/
 // https://www.kingshotcommand.com/heroes/vivian (S-ranked Bear Joiner)
 ['Vivian','damage-taken',118],['Wee & Woo','dual-offense',112],
 ['Hilde','attack/defense',85]
];
const joinMap=new Map(JOIN_PRIORITIES.map(([name,kind,score])=>[name,{kind,score}]));
const CLASSES=['infantry','cavalry','archer'];
function int(v){const n=Number(v);return Number.isFinite(n)&&n>0?Math.floor(n):0;}
function classOf(name,catalog){const type=catalog?.heroTypes?.[name];return CLASSES.includes(type)?type:null;}
function roster(model){
 const v=model?.v2||{},scanned=Array.isArray(v.scannedOwnedHeroes)?v.scannedOwnedHeroes:[];
 const seen=new Set();
 return scanned.filter(name=>{
  if(!name||seen.has(name)||!v.manualHeroes?.[name])return false;
  seen.add(name);return true;
 }).map(name=>({...v.manualHeroes[name],name}));
}
function chooseHeroes(model,catalog){
 const v=model?.v2||{},owned=roster(model),byName=new Map(owned.map(h=>[h.name,h]));
 const taken=new Set();
 const starter=(v.ownHeroes||[]).slice(0,3).map(n=>{
  if(!byName.has(n)||taken.has(n))return null;
  taken.add(n);return byName.get(n);
 });
 const rank=h=>{
  const join=joinMap.get(h.name);if(!join)return -1;
  const first=Array.isArray(h.skills)?Number(h.skills[0]):0;
  const confirmed=h.skillsAssumedMax===false&&Number.isInteger(first)&&first>=1&&first<=5;
  return join.score+(confirmed?first*12:0)+(confirmed?35:0);
 };
 const joinCount=Math.max(0,Math.min(6,Math.floor(Number(v.joinCount)||0)));
 const reserved=owned.filter(h=>!taken.has(h.name)&&joinMap.has(h.name)&&classOf(h.name,catalog))
  .sort((a,b)=>rank(b)-rank(a)||a.name.localeCompare(b.name)).slice(0,joinCount);
 reserved.forEach(h=>taken.add(h.name));
 const joins=Array.from({length:joinCount},(_,i)=>{
  const first=reserved[i]||null;
  const firstSkill=first&&Array.isArray(first.skills)?Number(first.skills[0]):null;
  return {heroes:[first,null,null],
   firstRole:first?joinMap.get(first.name).kind:null,
   skillLevel:first?.skillsAssumedMax===false&&Number.isInteger(firstSkill)&&firstSkill>=1&&firstSkill<=5?firstSkill:null,
   guideOnly:first?first.skillsAssumedMax!==false:true};
 });
 // Fill one of EACH troop type per march. Reserve join leaders beforehand,
 // then use highest real hero level in each remaining class, one hero once.
 // An unsafe/unknown left joiner is not replaced with a defensive filler:
 // join WITHOUT heroes rather than displacing an ally's attack/lethality skill.
 for(const type of CLASSES){
  const fillers=owned.filter(h=>!taken.has(h.name)&&classOf(h.name,catalog)===type)
   .sort((a,b)=>int(b.level)-int(a.level)||a.name.localeCompare(b.name));
  let index=0;
  for(const join of joins){
   if(!join.heroes[0]||classOf(join.heroes[0].name,catalog)===type)continue;
   const free=join.heroes.findIndex((h,j)=>j>0&&h===null);
   if(free>=0&&index<fillers.length){
    const fill=fillers[index++];join.heroes[free]=fill;taken.add(fill.name);
   }
  }
 }
 for(const j of joins)j.validTypes=j.heroes.filter(Boolean).every((h,i,arr)=>
  arr.findIndex(x=>classOf(x.name,catalog)===classOf(h.name,catalog))===i);
 return {starter,joins,ownedCount:owned.length,unused:owned.filter(h=>!taken.has(h.name)).length};
}
function splitShares(total,caps){
 if(!total||!caps.length)return caps.map(()=>0);
 const sum=caps.reduce((a,b)=>a+b,0);
 if(sum<=0)return caps.map(()=>0);
 const result=caps.map(c=>Math.floor(total*c/sum));
 let missing=total-result.reduce((a,b)=>a+b,0);
 const order=caps.map((c,i)=>({i,frac:(total*c/sum)%1})).sort((a,b)=>b.frac-a.frac||a.i-b.i);
 for(const e of order){if(!missing)break;if(result[e.i]<caps[e.i]){result[e.i]++;missing--;}}
 return result;
}
// Use actual integer troop quantities, but also display editable game ratios:
// no half percentages and each row sums EXACTLY to 100%.
function integerPercentages(row){
 const total=row.reduce((a,b)=>a+b,0);
 if(!total)return [0,0,0];
 const values=row.map(n=>100*n/total);
 const result=values.map(Math.floor);
 let diff=100-result.reduce((a,b)=>a+b,0);
 for(const i of [0,1,2].sort((a,b)=>(values[b]-result[b])-(values[a]-result[a])||a-b)){
  if(diff<=0)break;result[i]++;diff--;
 }
 return result;
}
function composition(target,inf,cav){
 if(!target)return [0,0,0];
 const a=Math.floor(target*inf/100),b=Math.floor(target*cav/100);
 return [a,b,target-a-b];
}
// First aim for the selected starter/join ratios; if one troop class runs
// out, redistribute its exact integer stock fairly across ALL marches,
// then backfill the unfilled slots with other classes that actually exist.
function allocate(targets,stock,starterRatio,joinRatio){
 const rows=targets.map((t,i)=>composition(t,...(i===0?starterRatio:(Array.isArray(joinRatio[0])?(joinRatio[i-1]||joinRatio[0]):joinRatio))));
 for(let k=0;k<3;k++){
  const requests=rows.map(row=>row[k]);
  const want=requests.reduce((a,b)=>a+b,0);
  if(want<=stock[k])continue;
  const fair=splitShares(stock[k],requests);
  for(let i=0;i<rows.length;i++)rows[i][k]=fair[i];
 }
 const remaining=stock.map((n,k)=>n-rows.reduce((s,row)=>s+row[k],0));
 for(const k of [2,1,0]){
  if(!remaining[k])continue;
  const room=rows.map((row,i)=>targets[i]-row.reduce((a,b)=>a+b,0));
  const totalRoom=room.reduce((a,b)=>a+b,0);
  if(!totalRoom)break;
  const allot=splitShares(Math.min(remaining[k],totalRoom),room);
  for(let i=0;i<rows.length;i++)rows[i][k]+=allot[i];
 }
 return rows;
}
function plan(model,catalog,combat,capacityCore){
 const v=model?.values||{},cap=capacityCore?.breakdown(model,catalog);
 const stock=[int(v.troopsI),int(v.troopsC),int(v.troopsA)];
 const selected=chooseHeroes(model,catalog);
 const missing=[];
 if(!cap?.hasBase||!cap.complete)missing.push('capacity');
 if(stock.reduce((a,b)=>a+b,0)<=0)missing.push('troops');
 if(selected.starter.some(h=>!h))missing.push('starter');
 if(new Set(selected.starter.map(h=>h&&classOf(h.name,catalog))).size!==3||
    selected.starter.some(h=>!h||!classOf(h.name,catalog)))missing.push('starter-classes');
 const base=cap?.base||0,master=cap?.master||0,pet=cap?.pet||0;
 const teams=[{kind:'starter',heroes:selected.starter},...selected.joins.map(j=>({kind:'join',...j}))];
 // Add capacity of the actual three heroes on EACH march. Unknown hero levels
 // never become 80 by assumption. Display provisional lower-bound capacity.
 const marches=teams.map((team,i)=>{
  const lv=team.heroes.map(h=>h?capacityCore.levelCapacity(h.level):null);
  const known=lv.every(n=>n!==null);
  // If the left-most join hero is missing, do not pretend this is a
  // recommended complete formation and allocate troops to an empty squad.
  // The player can still manually join without a hero in game, but that
  // is NOT a valid offensive-leader recommendation.
  const eligible=i===0||Boolean(team.heroes[0]);
  const size=eligible?base+master+pet+lv.reduce((a,b)=>a+(b||0),0):0;
  return {...team,slot:i,capacity:size,capacityKnown:known,
   eligible,missingHeroSlots:team.heroes.filter(h=>!h).length};
 });
 if(missing.length)return {ready:false,missing,stock,marches,selected};
 const caps=marches.map(m=>Math.max(0,int(m.capacity)));
 const availableTotal=stock.reduce((a,b)=>a+b,0),demand=caps.reduce((a,b)=>a+b,0);
 const total=Math.min(availableTotal,demand);
 if(total===0)return {ready:false,missing:['capacity'],stock,marches,selected};
 // Spread limited capacity fairly across the seven marches; then maximize
 // the *relative* local battle index while obeying three inventory totals.
 const targets=splitShares(total,caps);
 const engineReady=Boolean(combat?.ready&&combat?.configure&&combat?.damage);
 const tiers=engineReady?combat.configure(model.v2):null;
 const useDamage=engineReady&&combat.ready(v,tiers);
 const ownStats={...v};
 if(model.v2?.squadSeparate){
  const atk=Number(v.squadAtk)||0,letv=Number(v.squadLet)||0;
  for(const key of ['iAtk','cAtk','aAtk'])ownStats[key]=(Number(ownStats[key])||0)+atk;
  for(const key of ['iLet','cLet','aLet'])ownStats[key]=(Number(ownStats[key])||0)+letv;
 }
 // Join-leader stats are unavailable. Use the user's class stats as a
 // relative PROXY (as in the previous analysis), not an actual join score.
 // Hero expedition proc/widget effects are not independently simulated.
 const relative=(row,isOwn)=>{
  if(useDamage){
   const score=combat.damage(row,isOwn?ownStats:v,tiers,Number(v.pitfall)||0);
   return Number.isFinite(score)?score:0;
  }
  return row[0]*.76+row[1]*1.02+row[2]*1.18;
 };
 const candidatesI=[1,2,3,4,5,6,8,10],candidatesC=[9,10,11,12,13,14,15,16,17,18,20,22,24,26];
 let best=null,score=-Infinity;
 for(const si of candidatesI)for(const sc of candidatesC){
  const start=[si,sc];
  for(const ji of candidatesI)for(const jc of candidatesC){
   const join=[ji,jc],rows=allocate(targets,stock,start,join);
   const value=rows.reduce((sum,row,i)=>sum+relative(row,i===0)*(i===0?1:.72),0);
   // Deterministic preference for lower infantry and fewer needless archers
   // only when the battle index is mathematically indistinguishable.
   if(value>score+1e-7){score=value;best=rows;}
  }
 }
 const actual=best||allocate(targets,stock,[2,15],[2,15]);
 const used=[0,1,2].map(k=>actual.reduce((sum,row)=>sum+row[k],0));
 const leftover=stock.map((s,k)=>s-used[k]);
 if(leftover.some(x=>x<0)||actual.some((row,i)=>row.reduce((a,b)=>a+b,0)>caps[i]))
  throw Error('Unsafe formation: inventory or capacity exceeded');
 const ratios=actual.map(integerPercentages);
 const full=useDamage?relative(actual[0],true):null;
 return {ready:true,stock,used,leftover,targets,total,availableTotal,demand,
  marches:marches.map((m,i)=>({...m,troops:actual[i],ratio:ratios[i],filled:actual[i].reduce((a,b)=>a+b,0),
   shortage:Math.max(0,m.capacity-actual[i].reduce((a,b)=>a+b,0))})),
  starterScore:full,scoreType:useDamage?'starter-plus-join-proxy':'troop-only',
  allHeroLevelsKnown:marches.every(m=>m.capacityKnown),
  allHeroesAssigned:marches.every(m=>m.missingHeroSlots===0),
  joinCount:selected.joins.length,selected};
}
root.NRW_BEAR_FORMATION={plan,chooseHeroes,JOIN_PRIORITIES,allocateStock:allocate,integerPercentages};
})(window);
