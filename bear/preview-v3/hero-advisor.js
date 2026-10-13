/* NRW Bear host ranking. Estimates TOTAL rally damage, not the raw
 * infantry/cavalry/archer hero power. Uses actual troop-class contribution,
 * percentage-point attack/lethality additions, proc expectation and offensive
 * widget abilities. No hardcoded hero priority. Source-verified but COMMUNITY
 * model, not the official Kingshot engine.
 */
(function(root){
'use strict';
const classes=['infantry','cavalry','archer'];
const offensiveWidget=['Yang','Rosa','Amadeus','Helga','Marlin','Petra','Thrud','Ava'];
const nonOffense=new Set([
 'damage_taken_down','damage_taken_reduction','damage_taken_chance_down',
 'damage_taken_reduction_proc_chance','defense_up','squad_defense_up','health_up',
 'squad_health_up','infantry_health_up','enemy_attack_down','enemy_damage_down',
 'enemy_damage_dealt_debuff','enemy_troop_attack_down','enemy_squad_defense_down',
 'enemy_squad_attack_down','enemy_squad_lethality_down','enemy_lethality_down',
 'stamina_cost_down','wilderness_march_speed','hunting_march_speed',
 'healing_speed_up','research_speed_up','construction_speed_up','construction_cost_down',
 'mill_income','bread_gathering_speed','quarry_income','stone_gathering_speed',
 'logging_income','wood_gathering_speed','iron_mine_income','iron_mining_speed',
 'dodge_probability_up','squad_damage_taken_down'
]);
const groupAttack=new Set(['attack_up','squad_attack_buff','squad_attack_up']);
const groupLethality=new Set(['lethality_up','squad_lethality_up']);
const directDamage=new Set(['enemy_damage_taken_debuff','enemy_damage_taken_up','extra_damage_up','squad_damage_dealt_buff','damage_dealt_chance_up','bonus_damage_percent']);
const classDamage=new Map([
 ['infantry_damage_up',0],['archer_extra_hit',2],
 ['archer_extra_damage_percent',2],['cavalry_bonus_damage_percent',1]
]);
function valid(v,min=0,max=10000){
 if(v===null||v===undefined||v==='')return null;
 const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
function skillState(h){
 const stars=valid(h.stars,0,5),cap=stars===null?null:Math.min(5,Math.floor(stars)+1);
 const actual=Array.isArray(h.skills)&&h.skillsAssumedMax===false?
  h.skills.map(x=>valid(x,1,5)):null;
 const confirmed=Boolean(actual?.length>=2&&actual.every(x=>x!==null));
 return {level:confirmed?actual.reduce((a,b)=>a+b,0)/actual.length:cap,
  cap,actual,confirmed,assumed:!confirmed};
}
const classesIndex=type=>classes.indexOf(type);
function skillToEffect(skill,skillLevel){
 if(!skill||!Number.isInteger(skillLevel)||skillLevel<1||skillLevel>5)return null;
 const amount=valid(skill.valuesBySkillLevel?.[skillLevel-1],0,2000);
 if(amount===null)return null;
 const kind=skill.effect,cond=skill.conditions||{};
 if(nonOffense.has(kind))return {ignored:true};
 // Bleeds/turn status are NOT known to carry between ten independent Bear
 // rounds. Exclude rather than incorrectly multiply 3-turn duration.
 if(kind==='damage_over_time'||kind.includes('terrified')||
    kind==='squad_skill_damage_up'||kind==='damage_dealt_to_archer_up'||
    kind==='bonus_damage_proc_chance'||kind==='squad_lethality_proc_chance')
  return {unknown:true,name:skill.name,reason:'unverified-bear-timing-or-target'};
 const p=valid(cond.procChancePercent,0,100);
 const chance=p===null?1:p/100;
 let effect=null;
 if(groupAttack.has(kind)){
  // Petra's 'The Favor' is stored as squad_attack_buff although the
  // verified metric is DAMAGE percent and triggers by chance.
  effect=kind==='squad_attack_buff'&&skill.metric==='damage_percent'?
   {kind:'damage',amount:amount*chance}:{kind:'attack',amount:amount*chance};
 }
 else if(groupLethality.has(kind))effect={kind:'lethality',amount:amount*chance};
 else if(kind==='archer_attack_buff')effect={kind:'class-attack',type:2,amount:amount*chance};
 else if(kind==='damage_up'){
  // "Chance to DEAL 200% damage" means 2x on proc; incremental gain is
  // (200%-100%), NOT +200%. 25% proc at Lv5 => +25% expected.
  effect={kind:'damage',amount:(amount>100?amount-100:amount)*chance};
 }else if(kind==='extra_damage_up'&&skill.name==='Carpe Diem'){
  // Kingshot's description is INFANTRY damage per attack, not a +60%
  // squad-wide buff. The enemy-taken secondary effect is handled separately.
  effect={kind:'class-damage',type:0,amount:amount*chance};
 }else if(kind==='extra_squad_strike'){
  const every=valid(cond.everyTurns,1,10);
  if(every===null)return {unknown:true,name:skill.name};
  effect={kind:'damage',amount:amount*Math.floor(10/every)/10};
 }else if(kind==='damage_dealt_chance_up'){
  const boost=valid(cond.damageDealtIncreasePercent,0,500);
  if(boost===null)return {unknown:true,name:skill.name};
  effect={kind:'damage',amount:amount*boost/100};
 }else if(kind==='squad_damage_dealt_buff'&&skill.metric==='proc_chance_percent'){
  const boost=valid(cond.effectDamageDealtPercent,0,500);
  if(boost===null)return {unknown:true,name:skill.name};
  effect={kind:'damage',amount:amount*boost/100};
 }else if(directDamage.has(kind)){
  if(kind==='squad_damage_dealt_buff'&&skill.metric==='attack_percent')
   effect={kind:'attack',amount:amount*chance};
  else effect={kind:'damage',amount:amount*chance};
 }else if(classDamage.has(kind)){
  effect={kind:'class-damage',type:classDamage.get(kind),amount:amount*chance};
 }else return {unknown:true,name:skill.name,reason:kind};
 return {...effect,name:skill.name,skillLevel,expected:chance!==1};
}
// Starter hero ranking uses the same per-class attack/lethality context as
// the formation optimizer, never an embedded 5/18/77 ratio prior.
function modelContext(model,combat,ratioOverride){
 const v=root.NRW_BEAR_OWN_BASELINE?.currentStats?.(model)||model?.values||{},
  ext=model?.v2||{},levels=combat?.configure?.(ext),stat={};
 for(const k of ['iAtk','iLet','cAtk','cLet','aAtk','aLet'])
  stat[k]=valid(v[k],0,10000);
 const knownStats=Object.values(stat).every(n=>n!==null);
 const tierAttack=classes.map((type,i)=>{
  const lvl=levels?.[i],groups=lvl?.groups;
  if(Array.isArray(groups)&&groups.length){
   const total=groups.reduce((n,g)=>n+Number(g.count||0),0);
   if(total>0){
    const mean=groups.reduce((n,g)=>n+Number(g.count||0)*
     (combat?.troopAttack?.(type,g.tier,g.tg)||0),0)/total;
    if(mean>0)return mean;
   }
  }
  return combat?.troopAttack?.(type,lvl?.tier,lvl?.tg)||
   combat?.troopAttack?.(type,10,0)||[472,1416,1888][i];
 });
 const attackKeys=['iAtk','cAtk','aAtk'],lethalityKeys=['iLet','cLet','aLet'];
 const coeff=tierAttack.map((base,i)=>base*(i===2?1.10:1)*
  (1+((knownStats?stat[attackKeys[i]]:0)+25)/100)*
  (1+(knownStats?stat[lethalityKeys[i]]:0)/100));
 const pow=coeff.map(x=>x*x),totalPow=pow.reduce((n,x)=>n+x,0);
 const validOverride=Array.isArray(ratioOverride)&&ratioOverride.length===3&&
  ratioOverride.every(x=>Number.isFinite(Number(x))&&Number(x)>=0)&&
  ratioOverride.reduce((n,x)=>n+Number(x),0)>0;
 const proportions=validOverride?ratioOverride.map(Number):pow.map(x=>100*x/totalPow);
 const ratioTotal=proportions.reduce((n,x)=>n+x,0);
 const portions=proportions.map(x=>x/ratioTotal);
 let weights=null,attack=null,lethality=null,mode='illustrative';
 if(knownStats&&combat?.ready?.(stat,levels)){
  const total=100000;
  let counts=portions.map(r=>Math.round(total*r));
  const stocks=['troopsI','troopsC','troopsA'].map(k=>valid(v[k],0,999999999));
  if(stocks.every(x=>x!==null)){
   counts=counts.map((n,i)=>Math.min(n,stocks[i]));
   if(counts.every(x=>x===0))counts=portions.map(r=>Math.round(total*r));
  }
  const breakdown=combat.breakdown?.(counts,stat,levels,5);
  if(breakdown?.totalTenRounds>0){
   weights=breakdown.types.map(t=>t.damageTenRounds/breakdown.totalTenRounds);
   attack=breakdown.types.map(t=>t.appliedAttackPct);
   lethality=breakdown.types.map(t=>t.lethalityPct);
   mode='measured-class-stats-dynamic-ratio';
  }
 }
 if(!weights){
  const proxy=portions.map((portion,i)=>Math.sqrt(Math.max(0,portion))*
   tierAttack[i]*(i===2?1.10:1));
  const sum=proxy.reduce((a,b)=>a+b,0)||1;
  weights=proxy.map(n=>n/sum);
  attack=attackKeys.map(k=>stat[k]??0);
  lethality=lethalityKeys.map(k=>stat[k]??0);
 }
 return {weights,attack,lethality,mode,
  ratio:proportions,fromStats:mode!=='illustrative'};
}
function evaluate(hero,type,priorities,referenceGet,widgetGet,context){
 const stars=valid(hero.stars,0,5),tier=valid(hero.tier,0,5);
 const level=valid(hero.level,1,80),widget=valid(hero.widget,0,10);
 const state=skillState(hero),index=classesIndex(type);
 const source=typeof referenceGet==='function'&&stars!==null?
  referenceGet(hero.name,stars,tier??0):null;
 const nativeAtk=valid(source?.bonus,0,2000);
 const widgetData=widget!==null&&typeof widgetGet==='function'?
  widgetGet(hero.name,widget):null;
 const widgetOffense=widgetData&&['rally-attack','rally-lethality'].includes(widgetData.type)?
  valid(widgetData.bonusPct,0,50):null;
 const engine=root.NRW_BEAR_SKILL_EFFECTS;
 // All known Expedition skills from the source are evaluated by one central
 // rules engine. Unknown mechanics are explicitly recorded, not treated as
 // an unconditional squad boost; no arbitrary hero-priority override.
 const assessed=engine?.assess?.({
   ...hero,skillLevel:state.cap,
   confirmedSkillRanks:state.confirmed?state.actual:null
 },source)||{modeled:[],uncertain:[{reason:'skill-interpreter-missing'}],
  irrelevant:[],skillCount:0,sourceEffects:0};
 const effects=assessed.modeled,missing=assessed.uncertain.map(x=>x.name||x.reason);
 let squadAttack=0,squadLethality=0,squadDamage=1,lowSquadDamage=1;
 const typeAttack=[0,0,0],typeDamage=[1,1,1],lowTypeDamage=[1,1,1];
 for(const item of effects){
  const factor=1+item.amount/100;
  const safeFactor=1+(item.uncertain?Number(item.lower||0):item.amount)/100;
  if(item.kind==='attack')squadAttack+=item.amount;
  if(item.kind==='lethality')squadLethality+=item.amount;
  if(item.kind==='damage'){squadDamage*=factor;lowSquadDamage*=safeFactor;}
  if(item.kind==='class-attack'&&classes.includes(classes[item.type]))
   typeAttack[item.type]+=item.amount;
  if(item.kind==='class-damage'&&classes.includes(classes[item.type])){
   typeDamage[item.type]*=factor;
   lowTypeDamage[item.type]*=safeFactor;
  }
 }

 const ctx=context||modelContext(null,null);
 const w=ctx.weights,baseAtk=ctx.attack,baseLet=ctx.lethality;
 let total=0,lowTotal=0,baseTotal=0;
 for(let i=0;i<3;i++){
  const atk0=100+baseAtk[i],leth0=100+baseLet[i];
  const atk1=atk0+squadAttack+typeAttack[i]+(i===index&&nativeAtk!==null?nativeAtk:0);
  const leth1=leth0+squadLethality;
  const factor=(atk1/atk0)*(leth1/leth0);
  total+=w[i]*factor*typeDamage[i];
  lowTotal+=w[i]*factor*lowTypeDamage[i];
  baseTotal+=w[i]*(1+(i===index&&nativeAtk!==null?nativeAtk/atk0:0));
 }
 // Exclusive rally widget EFFECTS are multiplicative and distinct from
 // the gear stats already in account bonus screenshots.
 const widgetFactor=widgetOffense===null?1:1+widgetOffense/100;
 // The primary order is the defensible lower estimate. All modeled
 // proc probabilities are still averaged normally; only unverified enemy
 // debuff uptime / multipliers create a separate upper sensitivity bound.
 const optimisticScore=nativeAtk===null?null:
  Math.round(100*total*squadDamage*widgetFactor*100)/100;
 const conservativeScore=nativeAtk===null?null:
  Math.round(100*lowTotal*lowSquadDamage*widgetFactor*100)/100;
 const score=conservativeScore;
 const hasProvisional=effects.some(x=>x.uncertain);
 const confidence=nativeAtk===null?'limited':
  hero.starPendingReview||missing.length||!state.confirmed||!ctx.fromStats||hasProvisional?'estimated':'higher';
 return {name:hero.name,type,level,stars,tier:tier??0,widget,
  score,conservativeScore,optimisticScore,includesUnverifiedBearUptime:hasProvisional,
  skillCoverage:{total:assessed.skillCount,sourceEffects:assessed.sourceEffects,
   modeled:assessed.modeled.length,irrelevant:assessed.irrelevant.length,
   uncertain:assessed.uncertain.length},
  baseIndex:Math.round(baseTotal*10000)/100,nativeExpeditionAtk:nativeAtk,
  skill:state.level,skillCap:state.cap,assumedSkill:state.assumed,
  hasConfirmedSkill:state.confirmed,
  widgetEffect:widgetOffense,widgetType:widgetData?.type||null,
  attackBonus:squadAttack,lethalityBonus:squadLethality,
  damageBonus:Math.round((squadDamage-1)*10000)/100,
  offensiveSkills:effects,unmodeledSkills:missing,
  irrelevantSkills:assessed.irrelevant,uncertainSkills:assessed.uncertain,
  usesAttackReference:nativeAtk!==null,attackWeight:w[index],guideRank:null,
  bearCaution:missing.length>0,confidence,starPendingReview:Boolean(hero.starPendingReview),rankingBasis:ctx.mode,
  modeledPercentAboveBaseline:score===null?null:score-100,
  note:nativeAtk===null?'missing-expedition-base':
   missing.length||hasProvisional?'partial-offensive-model':'expected-offense'
 };
}
function recommend(owned,types,priorities,referenceGet,widgetGet,context){
 const roster=new Map();
 for(const h of owned||[]){
  if(!h?.name||!classes.includes(types?.[h.name]))continue;
  const prior=roster.get(h.name)||{};
  roster.set(h.name,{...prior,...h});
 }
 const ctx=context||modelContext(null,null);
 return classes.map(type=>{
  const choices=[...roster.values()].filter(h=>types[h.name]===type)
   .map(h=>evaluate(h,type,priorities,referenceGet,widgetGet,ctx));
  choices.sort((a,b)=>{
   if(a.score===null)return b.score===null?a.name.localeCompare(b.name):1;
   if(b.score===null)return -1;
   return b.score-a.score||a.name.localeCompare(b.name);
  });
  return {type,choices,best:choices.find(x=>x.score!==null)||null,modelContext:ctx};
 });
}
root.NRW_BEAR_HERO_ADVISOR={recommend,evaluate,skillState,offensiveEffect:skillToEffect,
 modelContext,classes,offensiveWidgetHeroes:offensiveWidget,
 source:'https://github.com/Boltotelli/kingshot-data',
 supportingGuide:'https://kingshotguides.com/guide/bear-hunt-expert-guide/',
 method:'expected class-weighted expedition bonus + offensive squad skill marginal damage and rally widget abilities; provisional bear model, not Atlas damage or actual Kingshot Bear damage'};
})(window);
