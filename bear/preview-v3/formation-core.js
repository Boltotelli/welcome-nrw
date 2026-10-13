/* Inventory-constrained Bear Trap starter + join formation suggestions.
 * Uses ONLY scanned/owned heroes; no invented hero skill levels, no external
 * leader damage stats. One starter plus at most six parallel joins.
 * Generation-based general joiner baseline with inventory constraints; not guaranteed optimal for every leader.
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
 // Kingshot's formation selector accepts integer percentages only.
 const exact=row.map(n=>100*n/total);
 const rounded=exact.map(Math.floor);
 let remaining=100-rounded.reduce((a,b)=>a+b,0);
 for(const k of [0,1,2].sort((a,b)=>
   (exact[b]-rounded[b])-(exact[a]-rounded[a])||a-b)){
  if(!remaining)break;
  rounded[k]++;remaining--;
 }
 return rounded;
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
// A joiner attacks with UNKNOWN rally-leader combat stats and hero skills.
// T/TG base attack alone and an arbitrary +4% Archer factor cannot identify
// the best mixture for an "average" leader. Use literature-backed
// generation-specific Bear presets instead, adapting to actual march size.
const GENERATION_BASELINES={1:[5,15,80],2:[5,15,80],3:[5,15,80]};
function ratioForTarget(target,baseline){
 const t=int(target);if(!t)return [0,0];
 const [baseInf,baseCav]=baseline;
 const counts=composition(t,baseInf,baseCav);
 return [100*counts[0]/t,100*counts[1]/t];
}
function joinerBaseline(model,catalog){
 const generation=Number(model?.v2?.kingdomGeneration)||4;
 return {generation,generationLabel:String(generation)+'+',
  proportions:[5,15,80],
  source:'NRW #1044 user-selected default 5/15/80 for all Joiner marches'};
}
/* Physical damage weights are used for the Starter's preferred individual
 * composition; Joiner allocations use the explicit 5/15/80 target.
 * Unknown foreign Rallyleaders do not imply a measured damage optimum.
 */
const LEADER_SCENARIOS=Object.freeze({
 weaker:{foreign:0.70,meaning:'Other rally leaders usually weaker'},
 similar:{foreign:1.00,meaning:'Other rally leaders approximately equal'},
 stronger:{foreign:1.40,meaning:'Other rally leaders usually stronger'}
});
function scenario(model){
 const selected=model?.v2?.joinLeaderComparison;
 const key=Object.hasOwn(LEADER_SCENARIOS,selected)?selected:'similar';
 return {key,...LEADER_SCENARIOS[key],assumed:true};
}
function scoreFor(row,weights){
 const total=row[0]+row[1]+row[2];
 if(!total)return 0;
 const army=Math.sqrt(Math.min(total,5000));
 return army*row.reduce((sum,n,k)=>sum+weights[k]*Math.sqrt(n),0);
}
// Community-verified attack coefficients by T/TG, never a ratio prior.
function classAttack(model,combat){
 const levels=combat?.configure?.(model?.v2);
 return ['infantry','cavalry','archer'].map((type,k)=>{
  const level=levels?.[k],groups=level?.groups;
  if(Array.isArray(groups)&&groups.length){
   const count=groups.reduce((n,g)=>n+Number(g.count||0),0);
   const avg=count>0?groups.reduce((n,g)=>n+Number(g.count||0)*
    (combat?.troopAttack?.(type,g.tier,g.tg)||0),0)/count:0;
   if(Number.isFinite(avg)&&avg>0)return {attack:avg,confirmed:true};
  }
  const known=combat?.troopAttack?.(type,level?.tier,level?.tg);
  if(Number.isFinite(known)&&known>0)return {attack:known,confirmed:true};
  return {attack:combat?.troopAttack?.(type,10,0)||
   [472,1416,1888][k],confirmed:false};
 });
}
function knownStats(model){
 const src=root.NRW_BEAR_OWN_BASELINE?.currentStats?.(model)||model?.values||{};
 const keys=['iAtk','iLet','cAtk','cLet','aAtk','aLet'];
 const complete=keys.every(k=>src[k]!==null&&src[k]!==undefined&&
  src[k]!==''&&Number.isFinite(Number(src[k]))&&Number(src[k])>=0);
 return {complete,stats:complete?src:null};
}
function preparedOffense(model,catalog){
 const ref=root.NRW_BEAR_HERO_REFERENCE,dmg=root.NRW_BEAR_SKILL_DAMAGE;
 if(ref?.status?.()!=='ready'||!dmg?.prepare)return null;
 const result=dmg.prepare(model,ref,catalog,root.NRW_BEAR_SCORE_BONUSES,
  root.NRW_BEAR_OWN_BASELINE);
 return result?.ready?result:null;
}
function squareOptimal(c){
 const total=c.reduce((n,x)=>n+x*x,0);
 return total>0?c.map(x=>100*x*x/total):[0,0,0];
}
// Same community equation as combat.js: T/TG base attack × attack ×
// lethality × Archer-vs-Infantry × supported offensive hero effects.
// At fixed march size, unconstrained optimum is proportional to w[k]².
function expectedWeights(targets,model,catalog,combat,stock){
 const relative=scenario(model),quality=classAttack(model,combat),
  known=knownStats(model),prepared=preparedOffense(model,catalog),m=prepared?.modifiers||{};
 const own=quality.map((q,k)=>{
  const t=['i','c','a'][k],counter=k===2?1.10:1;
  const atk=25+(known.complete?Number(known.stats[t+'Atk']):0)+
   Number(m.attack||0)+Number(m.classAttack?.[k]||0);
  const leth=(known.complete?Number(known.stats[t+'Let']):0)+Number(m.lethality||0);
  return q.attack*counter*(1+atk/100)*(1+leth/100)*
   (Number(m.lowClassDamage?.[k])||1)*(Number(m.lowDamage)||1)*
   (1+Number(prepared?.valoraPoints||0)/100);
 });
 // A foreign rally leader's class stats and heroes are NOT known. Model
 // neutral, class-independent buffs, calibrated to the mean own strength.
 // The weaker/similar/stronger input scales overall leader strength only.
 const neutral=quality.map((q,k)=>q.attack*(k===2?1.10:1));
 const nSum=neutral.reduce((s,x)=>s+x,0),oSum=own.reduce((s,x)=>s+x,0);
 const foreign=neutral.map(n=>n*(nSum>0?oSum/nSum:1)*relative.foreign);
 const norm=Math.max(...own,...foreign,1);
 const hosted=own.map(x=>x/norm),joining=foreign.map(x=>x/norm);
 return {weights:targets.map((_,i)=>(i===0?hosted:joining).slice()),
  ownOptimal:squareOptimal(hosted),joinOptimal:squareOptimal(joining),
  relative,quality,baseline:joinerBaseline(model,catalog),hasKnownStats:known.complete,
  hasKnownHeroEffects:Boolean(prepared),
  model:'physical-troop-coefficients-no-fixed-prior',
  assumptions:[
   ...(quality.some(q=>!q.confirmed)?['missing-tier-tg-provisional-T10']:[]),
   ...(!known.complete?['missing-attack-lethality-neutral']:[]),
   ...(!prepared?['missing-hero-effects']:[]),
   'foreign-leader-class-stats-unknown',
   'mixed-TG-uses-average-before-tier-assignment',
   'sqrt-quantity-community-bear-formula',
   'not-official-in-game-damage']};
}
function allocateByMarginal(targets,stock,weights){
 const rows=targets.map(()=>[0,0,0]),remaining=stock.map(int);
 // No arbitrary class minimum: compare the actual marginal estimated
 // benefit of each troop type using the same continuous damage model.
 // Special hero-activation rules must be supported by evidence before
 // being enforced as a hard requirement.
 let left=Math.min(targets.reduce((n,x)=>n+int(x),0),
  remaining.reduce((n,x)=>n+x,0));
 // Coarse-to-fine marginal allocation is O(21 * allocated/512), and
 // always respects one global inventory and per-march capacity.
 // Test all candidate increments with the exact same concave scoring
 // formula. A stronger own rally naturally wins more marginal stock.
 let passes=0;
 while(left>0){
  let best=-Infinity,winner=null;
  for(let i=0;i<targets.length;i++){
   const room=targets[i]-rows[i][0]-rows[i][1]-rows[i][2];
   if(room<=0)continue;
   const start=scoreFor(rows[i],weights[i]);
   for(let k=0;k<3;k++){
    if(remaining[k]===0)continue;
    const add=Math.min(128,room,remaining[k],left);
    if(add<=0)continue;
    rows[i][k]+=add;
    const gain=(scoreFor(rows[i],weights[i])-start)/add;
    rows[i][k]-=add;
    if(gain>best+1e-12){
     best=gain;winner={i,k,add};
    }
   }
  }
  if(!winner)break;
  rows[winner.i][winner.k]+=winner.add;
  remaining[winner.k]-=winner.add;
  left-=winner.add;
  if(++passes>250000)throw Error('Bear optimizer exceeded iteration budget');
 }
 if(left>0||remaining.some(n=>n<0)||rows.some((r,i)=>
  r.reduce((a,b)=>a+b,0)>targets[i]))throw Error('Unsafe expected-damage allocation');
 return {rows,remaining,modeledTotal:rows.reduce((sum,row,i)=>
  sum+scoreFor(row,weights[i]),0)};
}
// Project unconstrained theoretical troop splits onto REAL game inputs:
// whole percentages (1% increments), integer unit counts, one shared stock.
// Count prediction uses exactly the same composition() as the displayed
// percentage. Rounding may leave a few troops unused instead of claiming
// impossible ratios or overlapping inventory.
function playableProjection(desired,stock,capacities,weights,options={}){
 const size=desired.map((row,i)=>Math.min(int(capacities[i]),row.reduce((n,v)=>n+v,0)));
 const percents=desired.map((row,i)=>{
  const p=integerPercentages(row);
  if(!size[i])return p;
  // Whole game percentages can round a tiny troop class to 0%.
  // Never invent a mandatory 1% troop requirement.
  return p;
 });
 const make=(i,n=size[i],p=percents[i])=>composition(n,p[0],p[1]);
 let rows=size.map((_,i)=>make(i));
 const expenditure=()=>stock.map((_,k)=>rows.reduce((n,r)=>n+r[k],0));
 let used=expenditure();
 const shortage=arr=>arr.reduce((n,v,k)=>n+Math.max(0,v-stock[k]),0);
 let currentShort=shortage(used);
 let turns=0;
 while(currentShort){
  if(++turns>2500)throw Error('Unresolvable integer Bear proportions');
  let choice=null;
  function consider(i,newSize,p){
   const next=make(i,newSize,p);
   const nextUsed=used.map((v,k)=>v-rows[i][k]+next[k]);
   const smaller=shortage(nextUsed);
   const benefit=currentShort-smaller;
   if(benefit<=0)return;
   const lost=scoreFor(rows[i],weights[i])-scoreFor(next,weights[i]);
   const relativeLoss=lost/benefit;
   if(!choice||relativeLoss<choice.relativeLoss-1e-10||
      (Math.abs(relativeLoss-choice.relativeLoss)<1e-10&&benefit>choice.benefit))
    choice={i,newSize,p,next,nextUsed,smaller,relativeLoss,benefit};
  }
  for(let i=0;i<size.length;i++)if(size[i]>0)
   for(let k=0;k<3;k++)if(used[k]>stock[k]&&percents[i][k]>0){
    for(let j=0;j<3;j++)if(j!==k&&percents[i][j]<100){
     const p=percents[i].slice();p[k]--;p[j]++;
     consider(i,size[i],p);
    }
    // If no whole-percent exchange fits available stock, decrease march
    // troop count instead; do NOT invent a fractional game setting.
    const dec=Math.min(size[i],
      Math.max(1,Math.ceil((used[k]-stock[k])*100/percents[i][k])));
    consider(i,size[i]-dec,percents[i]);
   }
  if(!choice)throw Error('Cannot fit integer percentages to shared inventory');
  size[choice.i]=choice.newSize;percents[choice.i]=choice.p;
  rows[choice.i]=choice.next;used=choice.nextUsed;currentShort=choice.smaller;
 }
 // Where capacity and troop class stock permit, refill the same integer
 // ratios without going over any other simultaneous march's allocation.
 if(!options.preserveAllocation)for(let pass=0;pass<size.length;pass++){
  let best=null;
  for(let i=0;i<size.length;i++){
   if(size[i]===0||size[i]>=int(capacities[i]))continue;
   const other=used.map((v,k)=>v-rows[i][k]);
   const fits=n=>make(i,n).every((v,k)=>v+other[k]<=stock[k]);
   let low=size[i],high=int(capacities[i]);
   while(low<high){
    const mid=Math.floor((low+high+1)/2);
    if(fits(mid))low=mid;else high=mid-1;
   }
   if(low<=size[i])continue;
   const next=make(i,low);
   const gain=scoreFor(next,weights[i])-scoreFor(rows[i],weights[i]);
   if(!best||gain>best.gain)best={i,low,next,gain};
  }
  if(!best)break;
  size[best.i]=best.low;rows[best.i]=best.next;used=expenditure();
 }
 // Post-projection one-point improvements and pairwise stock-safe
 // exchanges remove avoidable losses from the integer-percentage grid.
 if(!options.preserveAllocation)for(let pass=0;pass<60;pass++){
  let best=null;
  const moves=rows.map((row,i)=>{
   if(size[i]===0)return [];
   const candidates=[];
   for(let from=0;from<3;from++)if(percents[i][from]>0)
    for(let to=0;to<3;to++)if(to!==from&&percents[i][to]<100){
     const p=percents[i].slice();p[from]--;p[to]++;
     candidates.push({p,row:make(i,size[i],p)});
    }
   return candidates;
  });
  function consider(indices,moved){
   const totals=used.slice();
   let gain=0;
   for(let a=0;a<indices.length;a++){
    const i=indices[a],r=moved[a].row;
    gain+=scoreFor(r,weights[i])-scoreFor(rows[i],weights[i]);
    for(let k=0;k<3;k++)totals[k]+=r[k]-rows[i][k];
   }
   if(gain<=1e-8||totals.some((n,k)=>n>stock[k]))return;
   if(!best||gain>best.gain+1e-8)best={indices,moved,totals,gain};
  }
  for(let i=0;i<moves.length;i++)for(const candidate of moves[i])
   consider([i],[candidate]);
  for(let i=0;i<moves.length;i++)for(let j=i+1;j<moves.length;j++)
   for(const c1 of moves[i])for(const c2 of moves[j])
    consider([i,j],[c1,c2]);
  if(!best)break;
  for(let a=0;a<best.indices.length;a++){
   const i=best.indices[a],next=best.moved[a];
   rows[i]=next.row;percents[i]=next.p;
  }
  used=best.totals;
 }
 for(let i=0;i<rows.length;i++){
  const p=percents[i],r=rows[i];
  if(p.some(v=>!Number.isInteger(v)||v<0||v>100)||
     (p.reduce((a,b)=>a+b,0)!==(size[i]===0&&p.every(x=>x===0)?0:100))||
     r.some(n=>!Number.isSafeInteger(n)||n<0)||
     r.reduce((a,b)=>a+b,0)!==size[i]||
     size[i]>capacities[i]||
     r.some((n,k)=>n!==make(i)[k]))
   throw Error('Invalid in-game integer ratio');
 }
 used=expenditure();
 if(shortage(used))throw Error('Playable projection exceeds troop inventory');
 return {rows,ratios:percents,used,unallocated:stock.map((v,k)=>v-used[k]),
  modeledTotal:rows.reduce((sum,r,i)=>sum+scoreFor(r,weights[i]),0)};
}
// User-directed allocation policy: joiners aim at 5/15/80. Full actual
// capacities (base, heroes, Pets, Valora and Marshal) are computed in plan().
// The three policies are explicit rather than inferred from unknown leaders.
const JOIN_STANDARD=Object.freeze([5,15,80]);
function priorityAllocation(targets,stock,starterOptimal,strength,weights){
 const caps=targets.map(int),inventory=stock.map(int),N=caps.length;
 const priority=strength==='weaker'?'starter':'joins';
 const requests=caps.map((cap,i)=>{
  if(!cap)return [0,0,0];
  return i===0?composition(cap,starterOptimal[0],starterOptimal[1]):
   composition(cap,JOIN_STANDARD[0],JOIN_STANDARD[1]);
 });
 const archNeed=requests.map(row=>row[2]),arch=new Array(N).fill(0);
 const joinNeed=archNeed.slice(1),joinSum=joinNeed.reduce((n,x)=>n+x,0);
 const requiredArchers=archNeed.reduce((n,x)=>n+x,0);
 let remaining=inventory[2];
 if(priority==='starter'){
  arch[0]=Math.min(remaining,archNeed[0]);remaining-=arch[0];
  const fair=splitShares(Math.min(remaining,joinSum),joinNeed);
  for(let i=1;i<N;i++)arch[i]=fair[i-1];
 }else{
  const fair=splitShares(Math.min(remaining,joinSum),joinNeed);
  for(let i=1;i<N;i++)arch[i]=fair[i-1];
  remaining-=fair.reduce((n,x)=>n+x,0);
  arch[0]=Math.min(remaining,archNeed[0]);
 }
 // After reserving Archers, distribute Infantry and Cavalry among the
 // remaining real slots. Joiners retain their 5:15 non-Archer ratio,
 // including when there are too few Archers to reach 80%.
 const rows=caps.map((_,i)=>[0,0,arch[i]]);
 const nonArchRoom=caps.map((cap,i)=>Math.max(0,cap-arch[i]));
 const ownIC=Math.max(0,starterOptimal[0])+Math.max(0,starterOptimal[1]);
 const infNeed=nonArchRoom.map((room,i)=>i===0?
  Math.floor(room*(ownIC>0?Math.max(0,starterOptimal[0])/ownIC:.25)):
  Math.floor(room*.25));
 const cavNeed=nonArchRoom.map((room,i)=>Math.max(0,room-infNeed[i]));
 const allotInf=splitShares(Math.min(inventory[0],infNeed.reduce((n,x)=>n+x,0)),infNeed);
 const allotCav=splitShares(Math.min(inventory[1],cavNeed.reduce((n,x)=>n+x,0)),cavNeed);
 for(let i=0;i<N;i++){rows[i][0]=allotInf[i];rows[i][1]=allotCav[i];}
 const utilized=k=>rows.reduce((sum,row)=>sum+row[k],0);
 // Other classes may replace a missing Infantry or Cavalry unit, but
 // never steal an Archer reserved for a priority march.
 for(const k of [1,0]){
  const remainingClass=Math.max(0,inventory[k]-utilized(k));
  const empty=caps.map((cap,i)=>Math.max(0,cap-rows[i].reduce((n,x)=>n+x,0)));
  const extra=splitShares(Math.min(remainingClass,empty.reduce((n,x)=>n+x,0)),empty);
  for(let i=0;i<N;i++)rows[i][k]+=extra[i];
 }
 // Convert to real 1%-step game inputs without polishing back toward the
 // unrelated unconstrained foreign-leader damage model.
 const playable=playableProjection(rows,inventory,caps,weights,{preserveAllocation:true});
 return {...playable,priority,requiredArchers,archerSupply:inventory[2],
  archerShortage:Math.max(0,requiredArchers-inventory[2]),
  joinArcherDemand:joinSum,joinRatio:JOIN_STANDARD.slice(),
  reservedArchers:arch};
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
 const base=cap?.base||0,master=cap?.master||0,pet=cap?.pet||0,
  minister=cap?.minister||0;
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
  const size=eligible?base+master+pet+minister+lv.reduce((a,b)=>a+(b||0),0):0;
  return {...team,slot:i,capacity:size,capacityKnown:known,
   eligible,missingHeroSlots:team.heroes.filter(h=>!h).length};
 });
 if(missing.length)return {ready:false,missing,stock,marches,selected};
 const caps=marches.map(m=>Math.max(0,int(m.capacity)));
 const availableTotal=stock.reduce((a,b)=>a+b,0),demand=caps.reduce((a,b)=>a+b,0);
 const total=Math.min(availableTotal,demand);
 if(total===0)return {ready:false,missing:['capacity'],stock,marches,selected};
 // For JOINERS the leader's effective stats are unknown. Select an
 // average Gen-based Bear ratio instead of maximizing arbitrary T/TG
 // √troop weights. Scarce archers go to JOIN marches first. Each
 // unit is assigned exactly once and not beyond a march's capacity.
 // Never pre-split scarce troop stock equally: doing so would prevent
 // the stronger own rally from receiving extra troops.
 const targets=caps;
 const expected=expectedWeights(targets,model,catalog,combat,stock);
 // Starter strength means my account versus foreign Rallyleaders:
 // foreign stronger => JOIN priority; foreign weaker => STARTER priority;
 // similar => SHARED (join reservation first as explicitly requested).
 const playable=priorityAllocation(targets,stock,expected.ownOptimal,
  expected.relative.key,expected.weights);
 const actual=playable.rows;
 const baseline=expected.baseline;
 const leaderStrength=expected.relative;
 const engineReady=Boolean(combat?.ready&&combat?.configure&&combat?.damage);
 const tiers=engineReady?combat.configure(model.v2):null;
 const useDamage=engineReady&&combat.ready(v,tiers);
 const ownStats=root.NRW_BEAR_OWN_BASELINE?.currentStats?.(model)||{...v};
 const used=[0,1,2].map(k=>actual.reduce((sum,row)=>sum+row[k],0));
 const leftover=stock.map((s,k)=>s-used[k]);
 if(leftover.some(x=>x<0)||actual.some((row,i)=>row.reduce((a,b)=>a+b,0)>caps[i]))
  throw Error('Unsafe formation: inventory or capacity exceeded');
 const ratios=playable.ratios;
 const tierPriority=leaderStrength.key==='weaker'?
  [0,...Array.from({length:actual.length-1},(_,i)=>i+1)]:
  [...Array.from({length:actual.length-1},(_,i)=>i+1),0];
 const ownedLevels=useDamage?combat.allocateLevels?.(actual,tiers,tierPriority)?.[0]||tiers:null;
 const full=useDamage?combat.damage(actual[0],ownStats,ownedLevels,5):null;
 return {ready:true,stock,used,leftover,targets,total,availableTotal,demand,
  marches:marches.map((m,i)=>({...m,troops:actual[i],ratio:ratios[i],filled:actual[i].reduce((a,b)=>a+b,0),
   shortage:Math.max(0,m.capacity-actual[i].reduce((a,b)=>a+b,0))})),
  starterScore:full,scoreType:'community-joiner-bear-baseline',
  ratioMethod:'join-5-15-80-with-archer-priority',joinerBaseline:baseline,
  allocationPriority:leaderStrength.key==='weaker'?'starter':
   leaderStrength.key==='stronger'?'joins':'shared',
  requiredArchers:playable.requiredArchers,
  archerSupply:playable.archerSupply,archerShortage:playable.archerShortage,
  joinArcherDemand:playable.joinArcherDemand,
  joinBaseRatio:playable.joinRatio,
  ownUnconstrainedRatio:expected.ownOptimal,joinUnconstrainedRatio:expected.joinOptimal,
  modelAssumptions:expected.assumptions,referenceQuality:expected.quality,
  modelHasStats:expected.hasKnownStats,modelHasHeroEffects:expected.hasKnownHeroEffects,
  leaderStrength,tierPriority,modeledTotal:playable.modeledTotal,
  quantizedToWholePercent:true,
  allHeroLevelsKnown:marches.every(m=>m.capacityKnown),
  allHeroesAssigned:marches.every(m=>m.missingHeroSlots===0),
  joinCount:selected.joins.length,selected};
}
root.NRW_BEAR_FORMATION={plan,chooseHeroes,JOIN_PRIORITIES,allocateStock:allocate,integerPercentages,availableStock,joinerBaseline,ratioForTarget,scenario,scoreFor,expectedWeights,allocateByMarginal,playableProjection,squareOptimal,priorityAllocation,JOIN_STANDARD};
})(window);
