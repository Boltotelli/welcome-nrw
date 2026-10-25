/* NRW Bear Trap: community-sourced tier/TG attack table, not official battle engine.
 * Source: https://strategicnoodle.com/kingshot/database/troops (checked 2026-10-08)
 * Each class has T1..T11 rows, TG0..TG8 columns.
 * Base lethality and defense are 10 for all published rows.
 * This calculates an experimental, calibrated-only-if-tested relative damage index.
 */
(function(root){
'use strict';
const attack = Object.freeze({
 infantry: [
 [63,66,69,72,76,80,84,88,92],
 [94,98,103,108,113,119,125,131,138],
 [132,137,144,151,159,167,175,184,193],
 [172,179,188,197,207,217,228,240,252],
 [206,214,225,236,248,260,273,287,301],
 [243,253,265,279,293,307,323,339,356],
 [287,298,313,329,346,363,381,400,420],
 [339,353,370,389,408,429,450,472,496],
 [400,416,437,459,482,506,531,557,585],
 [472,491,515,541,568,597,627,658,691],
 [566,589,618,649,681,715,751,789,828]
 ],
 cavalry: [
 [189,197,206,217,228,239,251,263,277],
 [283,294,309,324,341,358,376,394,414],
 [397,413,434,455,478,502,527,553,581],
 [516,537,563,592,621,652,685,719,755],
 [619,644,676,710,745,782,822,863,906],
 [730,759,797,837,879,923,969,1017,1068],
 [862,896,941,988,1038,1090,1144,1201,1261],
 [1017,1058,1111,1166,1224,1286,1350,1417,1488],
 [1200,1248,1310,1376,1445,1517,1593,1672,1756],
 [1416,1473,1546,1624,1705,1790,1880,1973,2072],
 [1699,1767,1855,1948,2045,2148,2255,2368,2486]
 ],
 archer: [
 [252,262,275,289,303,319,334,351,369],
 [378,393,413,433,455,478,502,527,553],
 [529,550,578,607,637,669,702,737,774],
 [688,716,751,789,828,870,913,959,1007],
 [825,858,901,946,993,1043,1095,1150,1207],
 [974,1013,1064,1117,1173,1231,1293,1357,1425],
 [1149,1195,1255,1317,1383,1452,1525,1601,1681],
 [1356,1410,1481,1555,1633,1714,1800,1890,1984],
 [1600,1664,1747,1835,1926,2023,2124,2230,2341],
 [1888,1964,2062,2165,2273,2387,2506,2631,2763],
 [2266,2357,2474,2598,2728,2865,3008,3158,3316]
 ]
});
const troopKeys=['infantry','cavalry','archer'];
const statKeys=[['iAtk','iLet'],['cAtk','cLet'],['aAtk','aLet']];
const validTier=t=>Number.isInteger(Number(t))&&Number(t)>=1&&Number(t)<=11;
const validTG=t=>t!==null&&t!==undefined&&t!==''&&Number.isInteger(Number(t))&&Number(t)>=0&&Number(t)<=8;
function troopAttack(className,tier,tg){
 if(!attack[className]||!validTier(tier)||!validTG(tg))return null;
 return attack[className][Number(tier)-1][Number(tg)];
}
/* Published community troop skill levels (KingShot Toolkit / Kingshot Bear calculators).
 * TG3 unlocks level 1; TG5 upgrades to level 2. These skills are
 * troop-specific; the defending Bear army has 5,000 infantry, but there is
 * NO minimum requirement for the player's own Infantry count.
 * References: ks-toolkit.com/data/troops/archer/ , /cavalry/ ;
 * hededal.com (bear calculator). This is not an official game formula.
 */
function troopSkills(type,tier,tg){
 if(!validTier(tier)||!validTG(tg)||!attack[type])return null;
 const t=Number(tier),gold=Number(tg);
 if(type==='archer'){
  const volley=t>=7?0.10:0;
  const howling=gold>=5?0.30:gold>=3?0.20:0;
  const extra=gold>=8?0.75:0.50;
  const basic=gold>=8?1.04:1;
  return {basic,volley,howling,extra,assault:0,
   mean:basic*(1+volley)*(1+howling*extra),
   maximum:basic*(1+(volley>0?1:0))*(1+(howling>0?extra:0))};
 }
 if(type==='cavalry'){
  const assault=gold>=5?0.15:gold>=3?0.10:0;
  return {basic:1,volley:0,howling:0,extra:0,assault,
   mean:1+assault,maximum:assault>0?2:1};
 }
 return {basic:1,volley:0,howling:0,extra:0,assault:0,mean:1,maximum:1};
}
function effectiveTroopAttack(type,tier,tg){
 const basic=troopAttack(type,tier,tg),skill=troopSkills(type,tier,tg);
 return basic===null||!skill?null:basic*skill.mean;
}
/* A mixed tier's effective attack is the arithmetic average of the selected
 * units' attack × expected skill factor. Select stronger available groups
 * first, matching the existing shared-inventory allocator.
 */
function effectiveAttackForGroup(level,type,requested){
 if(requested===0)return 0;
 if(!Array.isArray(level?.groups))return effectiveTroopAttack(type,level?.tier,level?.tg);
 let left=requested,total=0;
 const sorted=level.groups.slice().sort((a,b)=>
  troopAttack(type,b.tier,b.tg)-troopAttack(type,a.tier,a.tg));
 for(const g of sorted){
  if(left<=0)break;
  const n=Math.min(left,Number(g.count));
  const attackValue=effectiveTroopAttack(type,g.tier,g.tg);
  if(attackValue===null)return null;
  total+=n*attackValue;left-=n;
 }
 return left>0?null:total/requested;
}
function selectedGroups(level,type,requested){
 if(!requested)return [];
 if(!Array.isArray(level?.groups))
  return [{tier:level?.tier,tg:level?.tg,count:requested}];
 let left=requested;const groups=[];
 for(const g of level.groups.slice().sort((a,b)=>
  troopAttack(type,b.tier,b.tg)-troopAttack(type,a.tier,a.tg))){
  if(left<=0)break;
  const n=Math.min(left,Number(g.count));if(n>0)groups.push({...g,count:n});
  left-=n;
 }
 return left===0?groups:null;
}
/* Repeatable pseudo-random sequence for comparative damage simulations.
 * It is a distribution over modeled TROOP procs, not a guarantee about
 * unknown Expedition skill timing or real in-game damage variance.
 */
function troopDistribution(troops,stats,levels,pitfall=0,samples=1000,options={}){
 const base=breakdown(troops,stats,levels,pitfall);
 if(!base)return null;
 const globalFactor=Number(options.globalFactor??1);
 const classFactors=Array.isArray(options.classFactors)?options.classFactors:[1,1,1];
 if(!Number.isFinite(globalFactor)||globalFactor<0||classFactors.length!==3||
   classFactors.some(x=>!Number.isFinite(Number(x))||Number(x)<0))return null;
 const total=base.totalTroops;
 const armyScale=Math.sqrt(Math.min(total,base.bearTotal));
 const entries=[];
 for(let i=0;i<3;i++){
  const groups=selectedGroups(levels[i],troopKeys[i],Number(troops[i]));
  if(groups===null)return null;
  for(const g of groups){
   const skill=troopSkills(troopKeys[i],g.tier,g.tg),atk=troopAttack(troopKeys[i],g.tier,g.tg);
   if(!skill||atk===null)return null;
   const quantity=Number(troops[i]);
   // Split a class's sqrt(count) contribution by its share of troop count.
   const weight=quantity?g.count/quantity:0;
   const factor=(quantity?Math.sqrt(quantity)*armyScale:0)*atk*
    (1+base.types[i].appliedAttackPct/100)*10*
    (1+base.types[i].lethalityPct/100)/100/
    base.bearDefensePerUnit/100*(i===2?1.10:1)*weight;
   entries.push({type:i,factor,skill});
  }
 }
 let seed=0x1044cafe;
 for(const n of [...troops,...base.types.map(t=>t.appliedAttackPct),...base.types.map(t=>t.lethalityPct)])
  seed=(Math.imul(seed^Math.round(Number(n)*100),1664525)+1013904223)>>>0;
 function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
 function oneRally(){
  let totalDamage=0;
  for(let turn=0;turn<10;turn++)for(const {factor,skill,type} of entries){
   const volley=skill.volley>0&&random()<skill.volley?2:1;
   const howl=skill.howling>0&&random()<skill.howling?1+skill.extra:1;
   const lance=skill.assault>0&&random()<skill.assault?2:1;
   totalDamage+=factor*Number(classFactors[type])*skill.basic*volley*howl*lance;
  }
  return totalDamage*globalFactor;
 }
 const n=Math.max(1,Math.min(5000,Math.floor(samples)||1000));
 const firstRolls=Array.from({length:n},()=>oneRally());
 const rolls=firstRolls.slice().sort((a,b)=>a-b);
 const mean=rolls.reduce((a,b)=>a+b,0)/n;
 const perClass=base.types.map((t,i)=>({
  type:t.type,
  expected:t.damageTenRounds*Number(classFactors[i])*globalFactor,
  maximum:10*entries.filter(e=>e.type===i).reduce((sum,e)=>sum+
   e.factor*e.skill.maximum*Number(classFactors[i])*globalFactor,0)
 }));
 const theoreticalMaximum=perClass.reduce((sum,p)=>sum+p.maximum,0);
 return {ready:true,samples:n,
  baseline:perClass.reduce((s,x)=>s+x.expected,0),average:mean,
  percentile95:rolls[Math.max(0,Math.ceil(0.95*n)-1)],
  theoreticalMaximum,
  firstFive:firstRolls.slice(0,Math.min(5,n)),
  modeledTroopProcOnly:true,unit:'community-model-estimated-damage',
  perClass};
}

function validLevel(x){
 if(Array.isArray(x?.groups))return x.groups.every(g=>validTier(g.tier)&&validTG(g.tg)&&
  Number.isSafeInteger(Number(g.count))&&Number(g.count)>0);
 return Boolean(x&&validTier(x.tier)&&validTG(x.tg));
}
function attackForGroup(level,type,requested){
 if(requested===0)return 0;
 if(!Array.isArray(level?.groups))return troopAttack(type,level?.tier,level?.tg);
 let remaining=requested,total=0;
 const available=level.groups.slice().sort((a,b)=>
  troopAttack(type,b.tier,b.tg)-troopAttack(type,a.tier,a.tg));
 for(const group of available){
  if(remaining<=0)break;
  const count=Math.min(remaining,Number(group.count));
  total+=count*troopAttack(type,group.tier,group.tg);
  remaining-=count;
 }
 return remaining>0?null:total/requested;
}
function ready(stats,levels){
 return Boolean(stats&&Array.isArray(levels)&&levels.length===3&&
 levels.every(validLevel)&&
 statKeys.flat().every(k=>Object.prototype.hasOwnProperty.call(stats,k)&&
 Number.isFinite(Number(stats[k]))&&Number(stats[k])>=0));
}
function breakdown(troops,stats,levels,pitfall=0){
 if(!ready(stats,levels)||!Array.isArray(troops)||troops.length!==3||
    troops.some(n=>!Number.isSafeInteger(Number(n))||Number(n)<0))return null;
 const trapLevel=Math.min(5,Math.max(0,Number(pitfall)||0));
 const trapBonus=trapLevel*5;
 const bearTotal=5000,bearDefensePerUnit=83.3333333333*10/100,rounds=10;
 // Bear total 5000: armyMin = min(all own attackers, 5000).
 // This keeps the model consistent for sparse (under-5k) test marches.
 const ownTotal=troops.reduce((s,n)=>s+Number(n),0);
 const armyMin=Math.min(ownTotal,bearTotal);
 const types=troops.map((count,i)=>{
  const quantity=Number(count),baseAttack=attackForGroup(levels[i],troopKeys[i],quantity);
  if(baseAttack===null)return null;
  const capturedAttackPct=Number(stats[statKeys[i][0]]);
  const lethalityPct=Number(stats[statKeys[i][1]]);
  const appliedAttackPct=capturedAttackPct+trapBonus;
  // Base lethality 10 for every class; source T/TG tables are *raw* attack.
  const effectiveAttack=effectiveAttackForGroup(levels[i],troopKeys[i],quantity);
  if(effectiveAttack===null)return null;
  const troopSkillFactor=quantity&&baseAttack>0?effectiveAttack/baseAttack:1;
  const attPerUnit=baseAttack*(1+appliedAttackPct/100)*10*(1+lethalityPct/100)/100;
  const armyFactor=Math.sqrt(quantity*armyMin);
  const typeBonus=i===2?1.10:1;
  const damagePerRound=armyFactor*attPerUnit/bearDefensePerUnit/100*typeBonus*troopSkillFactor;
  return {type:troopKeys[i],count:quantity,tier:levels[i].tier,tg:levels[i].tg,
   baseAttack,effectiveAttack,troopSkillFactor,capturedAttackPct,trapAttackPct:trapBonus,appliedAttackPct,lethalityPct,
   attackPerUnit:attPerUnit,armyFactor,typeBonus,
   damagePerRound,damageTenRounds:damagePerRound*rounds};
 });
 if(types.some(t=>t===null))return null;
 return {types,rounds,bearTotal,bearDefensePerUnit,armyMin,trapLevel,trapAttackPct:trapBonus,
  totalTroops:ownTotal,totalTenRounds:types.reduce((n,t)=>n+t.damageTenRounds,0)};
}
function damage(troops,stats,levels,pitfall=0){
 return breakdown(troops,stats,levels,pitfall)?.totalTenRounds??null;
}
function configure(v2){
 if(!v2||typeof v2!=='object')return [{tier:0,tg:0},{tier:0,tg:0},{tier:0,tg:0}];
 const levels=Array.isArray(v2.troopTiers)?v2.troopTiers:[];
 const groups=Array.isArray(v2.troopGroups)?v2.troopGroups:null;
 if(groups&&groups.length){
  return troopKeys.map((type,i)=>{
   const rows=groups.filter(g=>g.type===type).map(g=>({tier:Number(g.tier),tg:Number(g.tg),count:Number(g.count)}));
   // An incomplete troop row must never become a silently guessed level.
   if(rows.some(g=>!validTier(g.tier)||!validTG(g.tg)||!Number.isSafeInteger(g.count)||g.count<=0))
    return {tier:0,tg:null};
   if(rows.length===0)return {tier:0,tg:null};
   return {tier:rows.length===1?rows[0].tier:null,tg:rows.length===1?rows[0].tg:null,groups:rows};
  });
 }
 return troopKeys.map((_,i)=>({tier:Number(levels[i]?.tier)||0,
  tg:levels[i]?.tg===null?null:levels[i]?.tg===undefined?0:Number(levels[i].tg)}));
}
// Optional per-march allocation consumes the best available tiers ONCE,
// instead of reusing the same strong troops in every simultaneous march.
function allocateLevels(marches,levels,prioritizeJoinArchers=false){
 if(!Array.isArray(marches)||!Array.isArray(levels))return null;
 const results=marches.map(()=>Array(3).fill(null));
 for(let type=0;type<3;type++){
  const lvl=levels[type];
  if(!Array.isArray(lvl?.groups)){
   for(let march=0;march<marches.length;march++)results[march][type]=lvl;
   continue;
  }
  const remaining=lvl.groups.map(g=>({...g,attack:troopAttack(troopKeys[type],g.tier,g.tg)}))
   .sort((a,b)=>b.attack-a.attack);
  // The same relative-leader decision used by the formation planner
  // determines which march receives the strongest mixed-T/TG groups.
  const explicit=Array.isArray(prioritizeJoinArchers)?prioritizeJoinArchers:null;
  const validOrder=explicit&&explicit.length===marches.length&&
   new Set(explicit).size===marches.length&&
   explicit.every(i=>Number.isInteger(i)&&i>=0&&i<marches.length);
  const order=validOrder?explicit:
   prioritizeJoinArchers===true&&type===2&&marches.length>1?
    [...marches.keys()].slice(1).concat(0):[...marches.keys()];
  for(const march of order){
   let required=Number(marches[march][type])||0;
   const allocated=[];
   for(const g of remaining){
    if(required<=0)break;
    const count=Math.min(required,g.count);
    if(count>0){allocated.push({tier:g.tier,tg:g.tg,count});g.count-=count;required-=count;}
   }
   results[march][type]=required>0?{tier:0,tg:null}:{tier:null,tg:null,groups:allocated};
  }
 }
 return results;
}

root.NRW_BEAR_COMBAT={troopKeys,attack,troopAttack,troopSkills,effectiveTroopAttack,effectiveAttackForGroup,troopDistribution,ready,damage,breakdown,configure,allocateLevels,attackForGroup,statKeys};
})(window);
