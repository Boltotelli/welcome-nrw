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
 const stars=valid(h.stars,1,5),cap=stars===null?null:Math.min(5,Math.floor(stars)+1);
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
 if(groupAttack.has(kind))effect={kind:'attack',amount:amount*chance};
 else if(groupLethality.has(kind))effect={kind:'lethality',amount:amount*chance};
 else if(kind==='archer_attack_buff')effect={kind:'class-attack',type:2,amount:amount*chance};
 else if(kind==='damage_up'){
  // "Chance to DEAL 200% damage" means 2x on proc; incremental gain is
  // (200%-100%), NOT +200%. 25% proc at Lv5 => +25% expected.
  effect={kind:'damage',amount:(amount-100)*chance};
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
function modelContext(model,combat){
 const v=model?.values||{},ext=model?.v2||{};
 const levels=combat?.configure?.(ext);
 const stat={};
 for(const k of ['iAtk','iLet','cAtk','cLet','aAtk','aLet'])stat[k]=valid(v[k],0,10000);
 let weights=null,attack=null,lethality=null,mode='illustrative';
 const knownStats=Object.values(stat).every(x=>x!==null);
 if(knownStats&&combat?.ready?.(stat,levels)){
  // The choice precedes the final formation step. Rank using the published
  // default 5/18/77 starter candidate, not the inventory stock ratio.
  const total=100000;
  let counts=[.05,.18,.77].map(r=>Math.round(total*r));
  const stocks=['troopsI','troopsC','troopsA'].map(k=>valid(v[k],0,999999999));
  if(stocks.every(x=>x!==null)){
   counts=counts.map((n,i)=>Math.min(n,stocks[i]));
   if(counts.every(x=>x===0))counts=[5000,18000,77000];
  }
  const breakdown=combat.breakdown?.(counts,stat,levels,5);
  if(breakdown?.totalTenRounds>0){
   weights=breakdown.types.map(t=>t.damageTenRounds/breakdown.totalTenRounds);
   attack=breakdown.types.map(t=>t.appliedAttackPct);
   lethality=breakdown.types.map(t=>t.lethalityPct);
   mode='measured-class-stats-provisional-5-18-77';
  }
 }
 // Honest fallback if the import lacks T/TG or combat bonuses:
 // no undocumented hero skill priorities, but say the ratio is provisional.
 if(!weights){
  const troopAttack=combat?.troopAttack;
  const proxy=[.05,.18,.77].map((ratio,i)=>{
   const power=typeof troopAttack==='function'?
    troopAttack(classes[i],10,0):[472,1416,1888][i];
   return Math.sqrt(ratio)*(power??[472,1416,1888][i])*(i===2?1.1:1);
  });
  const sum=proxy.reduce((a,b)=>a+b,0);
  weights=proxy.map(n=>n/sum);
  attack=['iAtk','cAtk','aAtk'].map(k=>stat[k]??0);
  lethality=['iLet','cLet','aLet'].map(k=>stat[k]??0);
 }
 return {weights,attack,lethality,mode,
  ratio:[5,18,77],fromStats:mode!=='illustrative'};
}
function evaluate(hero,type,priorities,referenceGet,widgetGet,context){
 const stars=valid(hero.stars,1,5),tier=valid(hero.tier,0,5);
 const level=valid(hero.level,1,80),widget=valid(hero.widget,0,10);
 const state=skillState(hero),index=classesIndex(type);
 const source=typeof referenceGet==='function'&&stars!==null?
  referenceGet(hero.name,stars,tier??0):null;
 const nativeAtk=valid(source?.bonus,0,2000);
 const widgetData=widget!==null&&typeof widgetGet==='function'?
  widgetGet(hero.name,widget):null;
 const widgetOffense=widgetData&&['rally-attack','rally-lethality'].includes(widgetData.type)?
  valid(widgetData.bonusPct,0,50):null;
 const effects=[],missing=[];
 let squadAttack=0,squadLethality=0,squadDamage=1;
 const typeAttack=[0,0,0],typeDamage=[1,1,1];
 (source?.skills||[]).forEach((skill,i)=>{
  const result=skillToEffect(skill,state.confirmed?state.actual[i]:state.cap);
  if(!result||result.unknown){missing.push(skill.name);return;}
  if(result.ignored)return;
  effects.push(result);
  if(result.kind==='attack')squadAttack+=result.amount;
  if(result.kind==='lethality')squadLethality+=result.amount;
  if(result.kind==='damage')squadDamage*=1+result.amount/100;
  if(result.kind==='class-attack')typeAttack[result.type]+=result.amount;
  if(result.kind==='class-damage')typeDamage[result.type]*=1+result.amount/100;
 });
 const ctx=context||modelContext(null,null);
 const w=ctx.weights,baseAtk=ctx.attack,baseLet=ctx.lethality;
 let total=0,baseTotal=0;
 for(let i=0;i<3;i++){
  const atk0=100+baseAtk[i],leth0=100+baseLet[i];
  const atk1=atk0+squadAttack+typeAttack[i]+(i===index&&nativeAtk!==null?nativeAtk:0);
  const leth1=leth0+squadLethality;
  const factor=(atk1/atk0)*(leth1/leth0)*typeDamage[i];
  total+=w[i]*factor;baseTotal+=w[i]*(1+(i===index&&nativeAtk!==null?nativeAtk/atk0:0));
 }
 // Exclusive rally widget EFFECTS are multiplicative and distinct from
 // the gear stats already in account bonus screenshots.
 const widgetFactor=widgetOffense===null?1:1+widgetOffense/100;
 const score=nativeAtk===null?null:
  Math.round(100*total*squadDamage*widgetFactor*100)/100;
 const confidence=nativeAtk===null?'limited':
  missing.length||!state.confirmed||!ctx.fromStats?'estimated':'higher';
 return {name:hero.name,type,level,stars,tier:tier??0,widget,
  score,baseIndex:Math.round(baseTotal*10000)/100,nativeExpeditionAtk:nativeAtk,
  skill:state.level,skillCap:state.cap,assumedSkill:state.assumed,
  hasConfirmedSkill:state.confirmed,
  widgetEffect:widgetOffense,widgetType:widgetData?.type||null,
  attackBonus:squadAttack,lethalityBonus:squadLethality,
  damageBonus:Math.round((squadDamage-1)*10000)/100,
  offensiveSkills:effects,unmodeledSkills:missing,
  usesAttackReference:nativeAtk!==null,attackWeight:w[index],guideRank:null,
  bearCaution:missing.length>0,confidence,rankingBasis:ctx.mode,
  modeledPercentAboveBaseline:score===null?null:score-100,
  note:nativeAtk===null?'missing-expedition-base':
   missing.length?'partial-offensive-model':'expected-offense'
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
  return {type,choices,best:choices[0]||null,modelContext:ctx};
 });
}
root.NRW_BEAR_HERO_ADVISOR={recommend,evaluate,skillState,offensiveEffect:skillToEffect,
 modelContext,classes,offensiveWidgetHeroes:offensiveWidget,
 source:'https://github.com/Boltotelli/kingshot-data',
 supportingGuide:'https://kingshotguides.com/guide/bear-hunt-expert-guide/',
 method:'expected class-weighted expedition bonus + offensive squad skill marginal damage and rally widget abilities; provisional bear model, not Atlas damage or actual Kingshot Bear damage'};
})(window);
