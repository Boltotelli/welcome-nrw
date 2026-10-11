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
function ready(stats,levels){
 return Boolean(stats&&Array.isArray(levels)&&levels.length===3&&
 levels.every(x=>x&&validTier(x.tier)&&validTG(x.tg))&&
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
  const quantity=Number(count),baseAttack=troopAttack(troopKeys[i],levels[i].tier,levels[i].tg);
  const capturedAttackPct=Number(stats[statKeys[i][0]]);
  const lethalityPct=Number(stats[statKeys[i][1]]);
  const appliedAttackPct=capturedAttackPct+trapBonus;
  // Base lethality 10 for every class; source T/TG tables are *raw* attack.
  const attPerUnit=baseAttack*(1+appliedAttackPct/100)*10*(1+lethalityPct/100)/100;
  const armyFactor=Math.sqrt(quantity*armyMin);
  const typeBonus=i===2?1.10:1;
  const damagePerRound=armyFactor*attPerUnit/bearDefensePerUnit/100*typeBonus;
  return {type:troopKeys[i],count:quantity,tier:levels[i].tier,tg:levels[i].tg,
   baseAttack,capturedAttackPct,trapAttackPct:trapBonus,appliedAttackPct,lethalityPct,
   attackPerUnit:attPerUnit,armyFactor,typeBonus,
   damagePerRound,damageTenRounds:damagePerRound*rounds};
 });
 return {types,rounds,bearTotal,bearDefensePerUnit,armyMin,trapLevel,trapAttackPct:trapBonus,
  totalTroops:ownTotal,totalTenRounds:types.reduce((n,t)=>n+t.damageTenRounds,0)};
}
function damage(troops,stats,levels,pitfall=0){
 return breakdown(troops,stats,levels,pitfall)?.totalTenRounds??null;
}
function configure(v2){
 if(!v2||typeof v2!=='object')return [{tier:0,tg:0},{tier:0,tg:0},{tier:0,tg:0}];
 const levels=Array.isArray(v2.troopTiers)?v2.troopTiers:[];
 return troopKeys.map((_,i)=>({tier:Number(levels[i]?.tier)||0,tg:levels[i]?.tg===undefined?0:Number(levels[i].tg)}));
}
root.NRW_BEAR_COMBAT={troopKeys,attack,troopAttack,ready,damage,breakdown,configure,statKeys};
})(window);
