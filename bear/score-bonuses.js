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

/* The only USER-FACING Bear number: personal expected score when starting a
 * rally with own three heroes. NO joining-hero contributions. Exact per-turn
 * game mechanics are not public, so this is an estimated model index.
 *
 * Pets apply when explicitly marked ACTIVE. Offensive ATK/LET bonuses are
 * added to the combined stats once; the cloned model then opts into
 * combined-report to prevent hero/squad bonus duplication. The current
 * guided intake collects Bonus Overview before pet activation and users can
 * take those screenshots without temporary buffs. If that was not so, the
 * caller must set v2.petBuffCapturedInStats = true; then these bonuses are
 * skipped. Defensive War Bear assumes standard damage/defense relation,
 * which needs validation against live Bear.
 */
function personalDamage(model,counts,combat,reference,catalog,proc){
 if(!model||!Array.isArray(counts)||!proc?.evaluate||!root.NRW_BEAR_OWN_BASELINE)
  return {ready:false,reason:'missing-input'};
 const own=root.NRW_BEAR_OWN_BASELINE;
 const composed=own.composeCombatStats?.(model);
 const stats=composed?.stats;
 if(!stats||!combat?.ready?.(stats,combat.configure?.(model.v2)))
  return {ready:false,reason:'missing-combat-stats'};
 const selected=petAudit(model,catalog).filter(p=>p.active);
 const incomplete=selected.filter(p=>p.percentage===null);
 if(incomplete.length)return {ready:false,reason:'missing-active-pet-skill',
  missingPets:incomplete.map(x=>x.name)};
 const hasPetStats=model.v2?.petBuffCapturedInStats===true;
 const attackBonus=hasPetStats?0:selected.filter(p=>p.id==='attack')
  .reduce((n,p)=>n+p.percentage,0);
 const lethalityBonus=hasPetStats?0:selected.filter(p=>p.id==='lethality')
  .reduce((n,p)=>n+p.percentage,0);
 // Enemy-targeting effect is separate from captured OWN troops and bonuses.
 // The Bear target may be immune; this is explicitly a modeling assumption.
 const defenderReduction=selected.filter(p=>p.id==='enemy_defense')
  .reduce((n,p)=>n+p.percentage,0);
 const defenseFactor=1/(1-Math.min(defenderReduction,90)/100);
 const adjustedValues={...model.values,...stats};
 for(const k of ['i','c','a']){
  adjustedValues[k+'Atk']=Number(stats[k+'Atk'])+attackBonus;
  adjustedValues[k+'Let']=Number(stats[k+'Let'])+lethalityBonus;
 }
 // All mandatory source-combined attack/lethality input is now stored as
 // combined class values. The original model and screenshot data stay intact.
 const adjusted={...model,values:adjustedValues,
  v2:{...model.v2,combatStatOrigin:'combined-report'}};
 const expectation=proc.evaluate(adjusted,counts,combat,reference);
 if(!expectation.ready)return {ready:false,reason:expectation.reason,
  missingPets:[]};
 // A partial, labeled model index is preferable to no result.
 // Unsupported skills are EXCLUDED, never assigned fabricated numbers.
 const partialEstimate=expectation.unmodeled.length>0||!expectation.includesSunder;
 const hunter=talent(model);
 if(!hunter)return {ready:false,reason:'missing-valora-level'};
 const personalFactor=1+hunter.personalPointPercent/100;
 const expectedScore=expectation.expectedIndex*defenseFactor*personalFactor;
 return {ready:true,expectedScore,modelIndex:true,
  partialEstimate,unmodeledSkills:expectation.unmodeled,
  noJoiningHeroSkills:true,pitfallLevel:5,
  modeledStarterSkills:expectation.skills.length,
  activePets:selected.map(x=>x.name),petAttackPct:attackBonus,
  petLethalityPct:lethalityBonus,enemyDefenseReductionPct:defenderReduction,
  warBearModelAssumption:defenderReduction>0,
  petBonusIncludedInScreenshot:hasPetStats,
  valoraLevel:hunter.level,valoraPct:hunter.personalPointPercent,
  includesChanceSkills:true,
  includesAllSourcedOffensiveStarterSkills:!partialEstimate,
  usesSingleEstimate:true,estimateNotGuaranteed:true,
  warning:'One estimated score based on not fully validated Bear round, Sunder and pet defense mechanics.'};
}

root.NRW_BEAR_SCORE_BONUSES={talent,pointScore,petAudit,personalDamage,HUNTER_POINTS,MASTERY_HUNTER_POINTS,PET_CANDIDATES};
})(window);
