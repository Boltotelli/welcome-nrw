/* Explicit PERSONAL BEAR SCORE bonus and optional pet audit.
 * Bear points != raw troop damage. Public Valora Hunter Instinct expert
 * ranks confirmed by Kingshot Wiki, kingshotdata.com, kingshot.net.
 * Kingshot Mastery lists a DIFFERENT level-8 value (19% rather than 21%):
 * retain alternative as reference, don't silently switch ranks.
 *
 * Pet toggles represent USER-RECORDED active status, NOT a verified
 * game snapshot. Stats from a Bonus Overview might already include pets.
 * We NEVER automatically stack pets atop their captured squad stats.
 */
(function(root){
'use strict';
const HUNTER_POINTS=[0,2,4,6,9,12,15,18,21,24,27,30];
const MASTERY_HUNTER_POINTS=[0,2,4,6,8,10,13,16,19,22,26,30];
const PET_CANDIDATES=Object.freeze([
 {name:'Giant Rhino',id:'attack',description:'all-squad-attack'},
 {name:'Black Panther',id:'lethality',description:'troop-lethality'},
 {name:'War Bear',id:'enemy_defense',description:'enemy-defense-down'},
 {name:'Moose',id:'enemy_health',description:'enemy-health-down'}
]);
function talent(model){
 const raw=model?.v2?.valoraTalent;
 if(raw===null||raw===undefined||raw==='')return null;
 const lvl=Number(raw);
 if(!Number.isInteger(lvl)||lvl<0||lvl>=HUNTER_POINTS.length)return null;
 return {level:lvl,personalPointPercent:HUNTER_POINTS[lvl],
  masteryPointPercent:MASTERY_HUNTER_POINTS[lvl],
  effect:'personal-bear-damage-points',notTroopAttack:true};
}
function pointScore(index,model){
 if(!Number.isFinite(index)||index<0)return null;
 const passive=talent(model);
 if(!passive||passive.level===0)return {ready:false,why:'talent-level-not-confirmed'};
 return {ready:true,index,
  withPersonalBonus:index*(1+passive.personalPointPercent/100),
  withMasteryAlternative:index*(1+passive.masteryPointPercent/100),
  ...passive};
}
function petAudit(model,catalog){
 const v=model?.v2||{},list=Array.isArray(catalog?.pets)?catalog.pets:[];
 return PET_CANDIDATES.map((entry)=>{
  const pet=list.find(p=>p.name===entry.name);
  if(!pet||pet.bearSkill?.id!==entry.id)return null;
  const active=v.petActive?.[entry.name]===true;
  const manual=v.petSkillRanks?.[entry.name];
  const valid=n=>Number.isInteger(Number(n))&&Number(n)>0&&Number(n)<=pet.bearSkill.values.length;
  const rank=valid(manual)?Number(manual):
   (Number.isFinite(Number(v.petLevels?.[entry.name]))?
    Math.min(pet.bearSkill.values.length,
     Math.floor(Math.max(0,Number(v.petLevels?.[entry.name]))/10)):0);
  const percentage=rank>0?Number(pet.bearSkill.values[rank-1]):null;
  return {name:entry.name,id:entry.id,description:entry.description,
   active,rank,percentage,source:'saved-profile',
   mayAlreadyBeIncludedInStats:true,automaticallyApplied:false,
   offensivePotential:entry.id!=='enemy_health'};
 }).filter(Boolean);
}
root.NRW_BEAR_SCORE_BONUSES={talent,pointScore,petAudit,HUNTER_POINTS,MASTERY_HUNTER_POINTS,PET_CANDIDATES};
})(window);
