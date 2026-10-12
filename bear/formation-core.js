/* Inventory-constrained Bear Trap starter + join formation suggestions.
 * Uses ONLY scanned/owned heroes; no invented hero skill levels, no external
 * leader damage stats. One starter plus at most six parallel joins.
 * Join-priority 10/10/80 allocation, not a real-game damage optimizer.
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
  const stars=Number(h.stars),assumedCap=Number.isInteger(stars)&&stars>=0&&stars<=5?
   Math.min(5,stars+1):0;
  const level=confirmed?first:assumedCap;
  // Prioritize better first-expedition SKILL ranks, including visibly
  // marked star-derived upper bounds. Do not claim unconfirmed ranks are owned.
  return join.score+level*12+(confirmed?35:0);
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
 // All simultaneous marches spend ONE shared troop inventory.
 // Archers are reserved for JOIN marches before the player's own rally.
 // This is an allocation rule, NOT a damage prediction.
 const rows=targets.map((t,i)=>composition(t,...(i===0?starterRatio:(Array.isArray(joinRatio[0])?(joinRatio[i-1]||joinRatio[0]):joinRatio))));
 for(const k of [2,0,1]){
  const requests=rows.map(row=>row[k]);
  const want=requests.reduce((a,b)=>a+b,0);
  if(want<=stock[k])continue;
  if(k===2&&rows.length>1){
   const joins=requests.slice(1),need=joins.reduce((a,b)=>a+b,0);
   const share=splitShares(Math.min(stock[k],need),joins);
   const remainder=Math.max(0,stock[k]-share.reduce((a,b)=>a+b,0));
   rows[0][k]=Math.min(requests[0],remainder);
   for(let i=1;i<rows.length;i++)rows[i][k]=share[i-1];
  }else{
   const fair=splitShares(stock[k],requests);
   for(let i=0;i<rows.length;i++)rows[i][k]=fair[i];
  }
 }
 const remaining=stock.map((n,k)=>n-rows.reduce((s,row)=>s+row[k],0));
 // Backfill shortages with physically available troops; never reuse stock.
 for(const k of [2,1,0]){
  if(!remaining[k])continue;
  const room=rows.map((row,i)=>targets[i]-row.reduce((a,b)=>a+b,0));
  const totalRoom=room.reduce((a,b)=>a+b,0);
  if(!totalRoom)break;
  if(k===2&&rows.length>1){
   const joinRoom=room.slice(1),take=splitShares(Math.min(remaining[k],joinRoom.reduce((a,b)=>a+b,0)),joinRoom);
   for(let i=1;i<rows.length;i++)rows[i][k]+=take[i-1];
   const spare=remaining[k]-take.reduce((a,b)=>a+b,0);
   rows[0][k]+=Math.min(spare,room[0]);
  }else{
   const allot=splitShares(Math.min(remaining[k],totalRoom),room);
   for(let i=0;i<rows.length;i++)rows[i][k]+=allot[i];
  }
 }
 return rows;
}

function availableStock(model){
 const v=model?.values||{},ext=model?.v2||{};
 // Source of truth: multiple troop groups by T and TG, never use one
 // best-T for every march.
 const groups=Array.isArray(ext.troopGroups)?ext.troopGroups:[];
 const stock=['troopsI','troopsC','troopsA'].map(k=>int(v[k]));
 const keys=['infantry','cavalry','archer'];
 if(groups.length)for(let k=0;k<3;k++){
  const relevant=groups.filter(g=>g.type===keys[k]);
  if(relevant.length)stock[k]=relevant.reduce((n,g)=>n+int(g.count),0);
 }
 return stock;
}
// Basic normalized class efficiencies for UNKNOWN external rally leaders.
// Base attacks are derived from owned T/TG, not from our hero or research
// stats, which cannot be assumed to apply to somebody else's rally.
function typeWeights(model,combat){
 const groups=model?.v2?.troopGroups||[],types=['infantry','cavalry','archer'];
 return types.map((type,k)=>{
  const own=groups.filter(g=>g.type===type&&int(g.count)>0);
  const avg=own.length?own.reduce((sum,g)=>sum+int(g.count)*
   (Number(combat?.troopAttack?.(type,Number(g.tier),Number(g.tg)))||0),0)/
   own.reduce((sum,g)=>sum+int(g.count),0):0;
  const legacy=model?.v2?.troopTiers?.[k];
  const fallback=Number(combat?.troopAttack?.(type,Number(legacy?.tier||10),Number(legacy?.tg||0)))||[472,1416,1888][k];
  // Ranged strike vs bear infantry: +10% to archer damage.
  return Math.max(1,avg||fallback)*(k===2?1.1:1);
 });
}
function starterWeights(model,combat,neutral,catalog){
 const own=root.NRW_BEAR_OWN_BASELINE?.currentStats?.(model)||model?.values||{};
 const keys=['i','c','a'];
 if(keys.some(k=>!Number.isFinite(Number(own[k+'Atk']))||
   !Number.isFinite(Number(own[k+'Let']))))return {weights:neutral.slice(),personal:false};
 let modifiers=null;
 const ref=root.NRW_BEAR_HERO_REFERENCE,eng=root.NRW_BEAR_SKILL_DAMAGE;
 if(ref?.status?.()==='ready'&&eng?.prepare){
  const scores=root.NRW_BEAR_SCORE_BONUSES;
  const prepared=eng.prepare(model,ref,catalog,scores,root.NRW_BEAR_OWN_BASELINE);
  if(prepared.ready)modifiers=prepared.modifiers;
 }
 const weights=neutral.map((w,k)=>{
  const t=keys[k],attack=Number(own[t+'Atk'])+25+(modifiers?.attack||0)+
   (modifiers?.classAttack?.[k]||0);
  const lethality=Number(own[t+'Let'])+(modifiers?.lethality||0);
  const damage=(modifiers?.lowDamage||1)*(modifiers?.lowClassDamage?.[k]||1);
  return w*(1+attack/100)*(1+lethality/100)*damage;
 });
 return {weights,personal:true};
}
// Maximize the source community model sum(w_k*sqrt(troops_k)) for a
// fixed target and limited per-class stock. KKT water filling:
// unconstrained optimum n_k ∝ w_k². Pin classes at their stock cap
// and redistribute the remainder among unconstrained classes.
// This has no 10/10/80 constant and produces ratios from actual stats.
function optimumMix(target,stock,weights){
 const total=Math.min(int(target),stock.reduce((a,b)=>a+int(b),0));
 const chosen=[0,0,0],free=new Set([0,1,2]);
 let left=total;
 while(free.size&&left>0){
  const denominator=[...free].reduce((n,k)=>n+Math.pow(Math.max(0,weights[k]||0),2),0);
  const candidates=[...free].map(k=>({k,target:denominator?
    left*Math.pow(Math.max(0,weights[k]||0),2)/denominator:left/free.size}));
  const capped=candidates.filter(x=>x.target>stock[x.k]+1e-8);
  if(!capped.length)break;
  for(const x of capped){chosen[x.k]=stock[x.k];left-=chosen[x.k];free.delete(x.k);}
 }
 if(left>0&&free.size){
  const sums=[...free].reduce((n,k)=>n+Math.pow(Math.max(0,weights[k]||0),2),0);
  const shares=[...free].map(k=>({k,amount:left*(sums?
   Math.pow(Math.max(0,weights[k]||0),2)/sums:1/free.size)}));
  for(const x of shares)chosen[x.k]=Math.floor(x.amount);
  let still=total-chosen.reduce((a,b)=>a+b,0);
  shares.sort((a,b)=>(b.amount-Math.floor(b.amount))-
   (a.amount-Math.floor(a.amount))||a.k-b.k);
  for(const x of shares){if(!still)break;if(chosen[x.k]<stock[x.k]){chosen[x.k]++;still--;}}
 }
 // Strict stock bounds and exact sum (within 1 integer).
 if(chosen.some((x,k)=>x<0||x>stock[k])||chosen.reduce((a,b)=>a+b,0)!==total)
  throw Error('Waterfill stock conservation');
 return chosen;
}
// Split a class mixture over joins without leaving capacity overhang.
// Every march receives a fair share, with class mix changing only for
// the unavoidable one-troop rounding.
function distributeMix(targets,mix){
 const rows=targets.map(()=>[0,0,0]);
 for(const k of [2,1,0]){
  const room=rows.map((row,i)=>targets[i]-row.reduce((a,b)=>a+b,0));
  const allot=splitShares(mix[k],room);
  for(let i=0;i<rows.length;i++)rows[i][k]+=allot[i];
 }
 return rows;
}
function optimizeCombined(targets,stock,joinWeights,ownWeights){
 if(!targets.length)return [];
 const joined=targets.slice(1),joinNeed=joined.reduce((n,x)=>n+x,0);
 const joinMix=optimumMix(joinNeed,stock,joinWeights);
 const joins=distributeMix(joined,joinMix);
 const left=stock.map((n,k)=>n-joinMix[k]);
 const starter=optimumMix(targets[0],left,ownWeights);
 const rows=[starter,...joins];
 const used=stock.map((_,k)=>rows.reduce((n,r)=>n+r[k],0));
 if(used.some((n,k)=>n>stock[k])||rows.some((r,i)=>
  r.reduce((n,x)=>n+x,0)>targets[i]))throw Error('Unsafe optimized stock/capacity');
 return rows;
}
function plan(model,catalog,combat,capacityCore){
 const v=model?.values||{},cap=capacityCore?.breakdown(model,catalog);
 const stock=availableStock(model);
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
 // Optimize the source √troops model: simultaneous stock and capacity,
 // join priority, unknown-rally-leader-neutral troop class efficiencies.
 // Own starter uses personal class stats and sourced hero effects when entered.
 const targets=splitShares(total,caps);
 const neutral=typeWeights(model,combat);
 const starter=starterWeights(model,combat,neutral,catalog);
 const actual=optimizeCombined(targets,stock,neutral,starter.weights);
 const engineReady=Boolean(combat?.ready&&combat?.configure&&combat?.damage);
 const tiers=engineReady?combat.configure(model.v2):null;
 const useDamage=engineReady&&combat.ready(v,tiers);
 const ownStats=root.NRW_BEAR_OWN_BASELINE?.currentStats?.(model)||{...v};
 const used=[0,1,2].map(k=>actual.reduce((sum,row)=>sum+row[k],0));
 const leftover=stock.map((s,k)=>s-used[k]);
 if(leftover.some(x=>x<0)||actual.some((row,i)=>row.reduce((a,b)=>a+b,0)>caps[i]))
  throw Error('Unsafe formation: inventory or capacity exceeded');
 const ratios=actual.map(integerPercentages);
 const ownedLevels=useDamage?combat.allocateLevels?.(actual,tiers,true)?.[0]||tiers:null;
 const full=useDamage?combat.damage(actual[0],ownStats,ownedLevels,5):null;
 return {ready:true,stock,used,leftover,targets,total,availableTotal,demand,
  marches:marches.map((m,i)=>({...m,troops:actual[i],ratio:ratios[i],filled:actual[i].reduce((a,b)=>a+b,0),
   shortage:Math.max(0,m.capacity-actual[i].reduce((a,b)=>a+b,0))})),
  starterScore:full,scoreType:'inventory-constrained-expected-damage',
  ratioMethod:starter.personal?'starter-personal-and-join-neutral':'neutral-hero-independent',
  allHeroLevelsKnown:marches.every(m=>m.capacityKnown),
  allHeroesAssigned:marches.every(m=>m.missingHeroSlots===0),
  joinCount:selected.joins.length,selected};
}
root.NRW_BEAR_FORMATION={plan,chooseHeroes,JOIN_PRIORITIES,allocateStock:allocate,integerPercentages,availableStock,typeWeights,starterWeights,optimumMix,optimizeCombined};
})(window);
