/* Exact Kingshot hero deployment-capacity table (levels 1–80).
 * Sources: https://ks.h5joy-games.com/guides/hero-level/ and
 * https://kingshot.fandom.com/wiki/Hero_XP_Requirements
 * Both list level 39 above level 40, an inconsistent regression: 39 is
 * deliberately unknown until independently verified. Never interpolate.
 *
 * "cap" is squad capacity WITHOUT heroes / temporary pet/master bonuses.
 * Rally capacity buffs (Moose, Valora Dance of the Hunt) are NOT march cap.
 */
(function(root){
'use strict';
const HERO_CAP=[null,
 65,140,220,305,400,500,605,720,840,970,
 1100,1240,1390,1540,1700,1870,2040,2225,2410,2605,
 2805,3010,3225,3445,3670,3905,4145,4390,4645,4905,
 5175,5445,5715,6015,6310,6600,6895,7190,null,7775,
 8070,8365,8655,8950,9245,9540,9830,10125,10420,10685,
 10925,11140,11340,11525,11700,11860,12010,12140,12260,12370,
 12470,12560,12650,12730,12800,12870,12930,12980,13030,13070,
 13110,13150,13190,13230,13270,13310,13350,13390,13430,13470
];
function validInt(n){return Number.isInteger(n)&&n>=0;}
function positive(n){const v=Number(n);return Number.isFinite(v)&&v>=0?Math.floor(v):0;}
function levelCapacity(level){
 const n=Number(level);
 return Number.isInteger(n)&&n>=1&&n<=80&&Number.isInteger(HERO_CAP[n])?HERO_CAP[n]:null;
}
function breakdown(model,catalog){
 const values=model?.values||{},ext=model?.v2||{};
 const hasBase=values.cap!==undefined&&values.cap!==''&&Number.isFinite(Number(values.cap))&&Number(values.cap)>0;
 const base=hasBase?positive(values.cap):0;
 const selected=Array.isArray(ext.ownHeroes)?ext.ownHeroes.slice(0,3):[];
 const heroRows=selected.map(name=>{
  const hero=ext.manualHeroes?.[name]||ext.heroesLevelCache?.[name];
  const level=hero?.level;
  return {name:name||'',level:level===null||level===undefined?null:Number(level),value:name?levelCapacity(level):null};
 });
 const hasManualHero=values.heroCapManual!==undefined&&values.heroCapManual!==''&&validInt(Number(values.heroCapManual));
 const heroesKnown=selected.length===3&&selected.every(Boolean)&&new Set(selected).size===3&&heroRows.every(r=>r.value!==null);
 const heroes=hasManualHero?positive(values.heroCapManual):heroesKnown?heroRows.reduce((n,r)=>n+r.value,0):0;
 const heroesPending=!hasManualHero&&!heroesKnown;
 // Savage Advantage is personal BEAR deployment (+3000 per level), never
 // the separate Dance of the Hunt RALLY capacity.
 const savage=Number(ext.valora?.[3]);
 const hasSavage=Number.isInteger(savage)&&savage>=1&&savage<=10;
 const master=hasSavage?savage*3000:positive(values.master);
 const masterSource=hasSavage?'skill':positive(values.master)>0?'manual':'none';
 // Only the active Mighty Bison affects personal squad capacity. Other pet
 // buffs affect attack, lethality, rally capacity, etc., not this number.
 const bison=(catalog?.pets||[]).find(p=>p.name==='Mighty Bison'&&p.bearSkill?.id==='squad_capacity');
 const recorded=Number(ext.petSkillRanks?.['Mighty Bison']);
 const legacyPetLevel=Number(ext.petLevels?.['Mighty Bison']);
 const rank=Number.isInteger(recorded)&&recorded>0?recorded:
  Number.isInteger(legacyPetLevel)&&legacyPetLevel>=10?Math.floor(legacyPetLevel/10):0;
 const validRank=Boolean(bison&&rank>=1&&rank<=bison.bearSkill.values.length);
 const bisonSelected=Boolean(ext.petActive?.['Mighty Bison']);
 const bisonRecorded=ext.petSkillRanks?.['Mighty Bison']!==undefined;
 // Existing legacy manual fields are only fallbacks if NO scanned Bison rank
 // was supplied. Never add the derived and manual pet bonus together.
 const pet=bisonRecorded||validRank||bisonSelected?
  bisonSelected&&validRank?positive(bison.bearSkill.values[rank-1]):0:
  positive(values.pet);
 const petSource=bisonRecorded||validRank||bisonSelected?'skill':positive(values.pet)>0?'manual':'none';
 const total=hasBase?base+heroes+master+pet:null;
 return {base,hasBase,heroRows,heroes,heroSource:hasManualHero?'manual':heroesKnown?'levels':'pending',
  heroesPending,pet,petSource,petRank:validRank?rank:null,petActive:bisonSelected,
  master,masterSource,savageLevel:hasSavage?savage:null,total,complete:hasBase&&!heroesPending};
}
root.NRW_BEAR_CAPACITY={levelCapacity,breakdown,heroCapacityByLevel:HERO_CAP.slice()};
})(window);
