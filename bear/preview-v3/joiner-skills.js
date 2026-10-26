/* Kingshot Bear Rally: four highest-priority FIRST joiner skills only.
 * Flat DamageUp (effect_op 101) and (102) add within their own group,
 * then multiply between groups. No hero-specific preference switches.
 * Skill values are taken from the canonical reference, not hard-coded.
 * Other effect_op families are deliberately NOT guessed.
 */
(function(root){
'use strict';
const GROUP_BY_EFFECT={lethality_up:101,attack_up:102};
const BEST_SKILLS=4;
function process(joiners,getReference){
 if(!Array.isArray(joiners))return {ready:false,reason:'invalid-joiners'};
 const sorted=joiners.map((j,position)=>{
  const name=typeof j==='string'?j:j?.name;
  const level=typeof j==='string'?5:Number(j?.level);
  const ref=getReference?.(name);
  const skill=ref?.expeditionSkills?.[0]||ref?.skills?.[0];
  const amount=skill?.valuesBySkillLevel?.[level-1];
  const category=GROUP_BY_EFFECT[skill?.effect]||null;
  return {name,position,level,category,amount:Number(amount),
   eligible:Number.isInteger(level)&&level>=1&&level<=5&&
    Number.isFinite(amount)&&amount>=0,source:skill?.name};
 });
 // Each joiner contributes at most their FIRST hero's FIRST skill.
 // The game takes the first four qualifying max-level buffs; nonmax
 // can be displaced by later, higher-level joiners. For scenario tests,
 // only the provided four slots are used (all Lv5).
 const selected=sorted.slice().sort((a,b)=>b.level-a.level||a.position-b.position)
  .slice(0,BEST_SKILLS);
 const unsupported=selected.filter(j=>!j.eligible||!j.category);
 const supported=selected.filter(j=>j.eligible&&j.category);
 const sums={101:0,102:0};
 for(const x of supported)sums[x.category]+=x.amount;
 const groupFactor101=1+sums[101]/100,groupFactor102=1+sums[102]/100;
 // Community effect_op rule: *all four* valid skills in a group add.
 // There is no two-Chenko cap. Two of each group is optimal for four
 // equal +25% skills because the two group totals then multiply.
 const multiplier=groupFactor101*groupFactor102;
 return {ready:unsupported.length===0,multiplier,
  group101:sums[101],group102:sums[102],groupFactor101,groupFactor102,
  active:supported.map(x=>({name:x.name,group:x.category,value:x.amount,skill:x.source})),
  unsupported:unsupported.map(x=>({name:x.name,effect:x.source,reason:!x.eligible?'unknown-skill':'stacking-unverified'})),
  method:'DamageUp effect_op 101/102 (community documented), highest-4 first skills'};
}
function apply(ownDamage,joiners,getReference){
 const j=process(joiners,getReference);
 if(!j.ready||!Number.isFinite(ownDamage)||ownDamage<0)return {ready:false,reason:'unsupported-effects',joiners:j};
 return {...j,estimatedIndex:ownDamage*j.multiplier};
}
// Order is educational; the UI independently sorts scenarios by actual
// source-based multiplier and displays all four skill contributions.
const SCENARIOS=[
 {id:'mixed',label:'2× Chenko + 2× Amane (Lv5)',heroes:['Chenko','Chenko','Amane','Amane']},
 {id:'mixed-other',label:'Chenko + Yeonwoo + Amane + Margot (Lv5)',
  heroes:['Chenko','Yeonwoo','Amane','Margot']},
 {id:'four-chenko',label:'4× Chenko (Lv5)',heroes:['Chenko','Chenko','Chenko','Chenko']},
 {id:'two-chenko',label:'2× Chenko (Lv5)',heroes:['Chenko','Chenko']},
 {id:'none',label:'Ohne Joinerfähigkeiten',heroes:[]}
];
root.NRW_BEAR_JOINER_SKILLS={process,apply,SCENARIOS,GROUP_BY_EFFECT,version:'effect-op-101-102-verified-20261026'};
})(window);
