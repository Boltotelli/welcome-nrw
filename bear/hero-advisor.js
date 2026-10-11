/* NRW Bear starter selection: verified Expedition BASE stats + offensive
 * Expedition hero SKILLS + offensive Expedition WIDGET abilities.
 * No arbitrary hero-name, guide-order, rarity or star-meta multipliers.
 * This is a comparable OFFENSIVE MODEL INDEX, not actual Kingshot damage.
 */
(function(root){
'use strict';
const classes=['infantry','cavalry','archer'];
// The widget review can prioritize heroes with relevant OFFENSIVE effects.
const offensiveWidget=new Set(['Yang','Rosa','Amadeus','Helga','Marlin','Margot','Petra','Thrud','Ava']);
const ignoredDefense=new Set([
 'damage_taken_down','defense_up','damage_taken_reduction',
 'damage_taken_chance_down','damage_taken_reduction_proc_chance',
 'enemy_attack_down','enemy_damage_dealt_debuff','squad_defense_up',
 'infantry_health_up','dodge_probability_up','stamina_cost_down',
 'wilderness_march_speed','health_up','squad_health_up'
]);
const attackEffects=new Set(['attack_up','squad_attack_buff','squad_attack_up','archer_attack_buff']);
const lethalityEffects=new Set(['lethality_up','squad_lethality_up']);
const damageEffects=new Set(['damage_up','squad_damage_dealt_buff',
 'enemy_damage_taken_debuff','enemy_damage_taken_up',
 'extra_squad_strike','archer_extra_hit','damage_over_time',
 'infantry_damage_up']);
function value(v,min=0,max=100){
 if(v===null||v===undefined||v==='')return null;
 const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
function skillState(hero){
 const stars=value(hero.stars,1,5);
 const cap=stars===null?null:Math.min(5,Math.floor(stars)+1);
 const actual=Array.isArray(hero.skills)&&hero.skillsAssumedMax===false?
  hero.skills.map(x=>value(x,1,5)):null;
 const confirmed=Boolean(actual?.length>=2&&actual.every(x=>x!==null));
 const avg=confirmed?actual.reduce((a,b)=>a+b,0)/actual.length:cap;
 return {level:avg,cap,assumed:!confirmed,confirmed,actual};
}
function offensiveEffect(skill,skillLevel,heroType){
 if(!skill||!Number.isInteger(skillLevel)||skillLevel<1||skillLevel>5)return null;
 const amount=value(skill.valuesBySkillLevel?.[skillLevel-1],0,2000);
 if(amount===null)return null;
 const effect=skill.effect,conditions=skill.conditions||{};
 if(ignoredDefense.has(effect))return {ignored:true};
 let chance=1;
 if(Number.isFinite(Number(conditions.procChancePercent)))
  chance=Math.max(0,Math.min(1,Number(conditions.procChancePercent)/100));
 if(Number.isFinite(Number(conditions.everyTurns))&&Number(conditions.everyTurns)>0)
  chance=Math.floor(10/Number(conditions.everyTurns))/10;
 if(effect==='damage_dealt_chance_up'){
  const boost=value(conditions.damageDealtIncreasePercent,0,2000);
  if(boost===null)return {unknown:true};
  return {kind:'damage',amount:boost*amount/100,
   name:skill.name,expected:true,skillLevel};
 }
 if(effect==='squad_damage_dealt_buff'&&skill.metric==='proc_chance_percent'){
  const boost=value(conditions.effectDamageDealtPercent,0,2000);
  if(boost===null)return {unknown:true};
  return {kind:'damage',amount:boost*amount/100,
   name:skill.name,expected:true,skillLevel};
 }
 if(attackEffects.has(effect)){
  // Attack skill percentages are added as attack percentage points,
  // not treated as a second all-damage multiplier.
  return {kind:'attack',amount:amount*chance,name:skill.name,
   expected:chance!==1,skillLevel};
 }
 if(lethalityEffects.has(effect)){
  return {kind:'lethality',amount:amount*chance,name:skill.name,
   expected:chance!==1,skillLevel};
 }
 if(damageEffects.has(effect)){
  if(effect==='infantry_damage_up'&&heroType!=='infantry')return {unknown:true};
  let effective=amount*chance;
  if(effect==='damage_over_time'){
   // Duration is documented; overlapping applications/tick basis are NOT.
   const duration=value(conditions.durationTurns,1,10);
   if(duration===null)return {unknown:true};
   effective*=duration;
  }
  return {kind:'damage',amount:effective,name:skill.name,
   expected:chance!==1||effect==='damage_over_time',skillLevel};
 }
 // Skill-damage-only, target-conditional or effects with unknown Bear
 // behavior must not be assigned a numerical coefficient.
 return {unknown:true};
}
function evaluate(hero,type,priorities,referenceGet,widgetGet){
 const stars=value(hero.stars,1,5),tier=value(hero.tier,0,5);
 const level=value(hero.level,1,80);
 const widget=value(hero.widget,0,10);
 const skills=skillState(hero);
 const source=typeof referenceGet==='function'&&stars!==null?
  referenceGet(hero.name,stars,tier??0):null;
 const nativeAtk=value(source?.bonus,0,2000);
 const offense=[],unmodeled=[];
 let attackBonus=0,lethalityBonus=0,damageBonus=0;
 (source?.skills||[]).forEach((s,i)=>{
  const active=skills.confirmed?
   (skills.actual?.[i]??null):skills.cap;
  const result=offensiveEffect(s,active,type);
  if(result?.unknown||!result){unmodeled.push(s.name);return;}
  if(result.ignored)return;
  offense.push(result);
  if(result.kind==='attack')attackBonus+=result.amount;
  if(result.kind==='lethality')lethalityBonus+=result.amount;
  if(result.kind==='damage')damageBonus+=result.amount;
 });
 const widgetData=widget!==null&&typeof widgetGet==='function'?
  widgetGet(hero.name,widget):null;
 const activeWidget=widgetData&&['rally-attack','rally-lethality'].includes(widgetData.type)?
  value(widgetData.bonusPct,0,50):null;
 // Shared comparison model: native Expedition attack is the baseline.
 // Only known skills and offensive widget ABILITIES enter the score.
 // Lethality/skill effect interactions are not fully documented in Kingshot:
 // this is an explainable relative index, not a validated damage equation.
 const baseIndex=nativeAtk===null?null:100+nativeAtk;
 const widgetFactor=activeWidget===null?1:1+activeWidget/100;
 const index=baseIndex===null?null:
  (baseIndex+attackBonus)*(1+lethalityBonus/100)*
  (1+damageBonus/100)*widgetFactor;
 const score=index===null?null:Math.round(index*10)/10;
 const confidence=baseIndex===null?'limited':
  !skills.confirmed||widget===null||unmodeled.length?'estimated':'higher';
 return {name:hero.name,type,level,stars,tier:tier||0,widget,
  score,baseIndex,nativeExpeditionAtk:nativeAtk,
  skill:skills.level,skillCap:skills.cap,assumedSkill:skills.assumed,
  hasConfirmedSkill:skills.confirmed,
  widgetEffect:activeWidget,widgetType:widgetData?.type||null,
  attackBonus:Math.round(attackBonus*100)/100,
  lethalityBonus:Math.round(lethalityBonus*100)/100,
  damageBonus:Math.round(damageBonus*100)/100,
  offensiveSkills:offense,unmodeledSkills:unmodeled,
  usesAttackReference:baseIndex!==null,attackWeight:1,
  confidence,guideRank:null,bearCaution:false,
  // Rarity & progression unlock REAL values and skills; no extra bonus.
  note:baseIndex===null?'missing-expedition-base':
   unmodeled.length?'partial-offensive-model':'expedition-offense'
 };
}
function recommend(owned,types,priorities,referenceGet,widgetGet){
 const roster=new Map();
 for(const hero of owned||[]){
  if(!hero?.name||!types||!classes.includes(types[hero.name]))continue;
  roster.set(hero.name,{...(roster.get(hero.name)||{}),...hero});
 }
 return classes.map(type=>{
  const choices=[...roster.values()].filter(h=>types[h.name]===type)
   .map(h=>evaluate(h,type,priorities,referenceGet,widgetGet));
  choices.sort((a,b)=>{
   if(a.score===null)return b.score===null?a.name.localeCompare(b.name):1;
   if(b.score===null)return -1;
   return b.score-a.score||a.name.localeCompare(b.name);
  });
  return {type,choices,best:choices[0]||null};
 });
}
root.NRW_BEAR_HERO_ADVISOR={
 recommend,evaluate,skillState,offensiveEffect,classes,
 offensiveWidgetHeroes:[...offensiveWidget],
 source:'https://github.com/Boltotelli/kingshot-data',
 supportingGuide:'https://kingshotguides.com/guide/bear-hunt-expert-guide/',
 method:'sourced Expedition base ATK + actual/offered Expedition hero skills + offensive widget expedition abilities; indicative offense index, not Atlas damage or actual Kingshot Bear damage'
};
})(window);
