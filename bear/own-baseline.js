/* Source-audited OWN rally baseline (no joining-hero effects).
 * This is a model-index calculation, NOT verified live Bear damage or a
 * guaranteed minimum. All already accumulated UI combat stats are treated as
 * final; NEVER add governor gear, hero gear, stars, hero passive ATK/LET,
 * widget gear stats, Pets, Valora or global buffs a second time.
 *
 * Deterministic effects which are independently attributable:
 *  Yang's Avalanche: full-squad extra hit every 4 turns of 10 (turns 4,8).
 *  Verified offensive expedition widget *abilities* of own 3 starters,
 *  which stack as distinct rally multipliers, not passive widget stats.
 * Random/proc skills intentionally excluded and reported as such.
 * Reference source: independent pin-verified kingshot-data hero skills,
 * kingshotcommand.com/hero-widgets/{yang,petra,rosa,...}, checked 2026-10-10.
 */
(function(root){
'use strict';
const TRAP_ROUNDS=10;
const EXPEDITION_WIDGETS=Object.freeze({
 'Yang':{type:'rally-lethality',name:'Offenseive Defense',source:'https://www.kingshotcommand.com/hero-widgets/yang'},
 'Petra':{type:'rally-attack',name:'Cosmic Eye',source:'https://www.kingshotcommand.com/hero-widgets/petra'},
 'Rosa':{type:'rally-lethality',name:'Perihelion',source:'https://www.kingshotcommand.com/hero-widgets/rosa'},
 'Marlin':{type:'rally-lethality',name:'Admiral of the Line',source:'https://www.kingshotcommand.com/hero-widgets/marlin'},
 'Amadeus':{type:'rally-attack',name:'Discernment',source:'https://www.kingshotcommand.com/hero-widgets/amadeus'},
 'Thrud':{type:'rally-lethality',name:'Wolf-Kissed',source:'https://www.kingshotcommand.com/hero-widgets/thrud'},
 'Ava':{type:'rally-lethality',name:'Color Storm',source:'https://www.kingshotcommand.com/hero-widgets/ava'},
 'Zoe':{type:'defense-only',name:'Dark Lady',source:'https://www.kingshotcommand.com/hero-widgets/zoe'},
 'Vivian':{type:'defense-only',name:'Money Driven',source:'https://www.kingshotcommand.com/heroes/vivian'},
 'Hilde':{type:'defense-only',name:'Fortitude',source:'https://www.kingshotcommand.com/heroes/hilde'},
 'Margot':{type:'defense-only',name:'Pugilist',source:'https://www.kingshotcommand.com/heroes/margot'}
});
function skillCap(stars,tier){
 const s=Number(stars),t=Number(tier??0);
 if(!Number.isInteger(s)||s<1||s>5||
    !Number.isInteger(t)||t<0||t>5)return null;
 // The real maximum is based on the full unlocked star, with progress
 // within star used only when the scanned development rank is known.
 // Preserve currently established roster cap 1★→2 ... 4★→5.
 return Math.min(5,s+1);
}
function widgetValue(name,level){
 if(!Number.isInteger(level)||level<0||level>10)return null;
 const source=EXPEDITION_WIDGETS[name];
 if(!source)return null;
 const rank=Math.floor(level/2);
 const value=rank>0?2.5*(rank+1):0; // Lv2=5; Lv4=7.5; ... Lv10=15.
 return {name,widgetLevel:level,skillRank:rank,type:source.type,
  skillName:source.name,bonusPct:Math.min(15,value),source:source.source};
}
function readWidgetLevel(model,name){
 const map=model?.v2?.starterWidgetLevels;
 const value=map&&Object.prototype.hasOwnProperty.call(map,name)?map[name]:undefined;
 // Explicit user entry is authoritative, including deliberate Lv0.
 if(value!==undefined&&value!==null&&value!==''&&Number.isInteger(Number(value))&&Number(value)>=0&&Number(value)<=10)
  return Number(value);
 // Existing manually confirmed hero cards may already contain a widget.
 // A positive value may prefill/use that fact without a redundant second
 // click. Lv0 from the older editor is ambiguous and remains unconfirmed
 // unless explicitly selected in this guided Widget review.
 const old=model?.v2?.manualHeroes?.[name]?.widget;
 if(old!==undefined&&old!==null&&old!==''&&Number.isInteger(Number(old))&&Number(old)>0&&Number(old)<=10)
  return Number(old);
 return null;
}
const CLASS_CODES=['i','c','a'];
const METRICS=['Atk','Let'];
function validBonus(value){
 if(value===null||value===undefined||value==='')return null;
 const n=Number(value);
 return Number.isFinite(n)&&n>=0&&n<=5000?n:null;
}
function heroBonuses(model){
 const v=model?.v2||{},names=Array.isArray(v.ownHeroes)?v.ownHeroes:[];
 return CLASS_CODES.map((cl,index)=>{
  const name=names[index]||'',saved=v.manualHeroes?.[name]?.expeditionStats||{};
  return {classKey:cl,name,
   attackPct:validBonus(saved[cl+'Atk']),
   lethalityPct:validBonus(saved[cl+'Let'])};
 });
}
function statOrigin(model){
 const meta=model?.v2||{},v=model?.values||{};
 const explicit=meta.combatStatOrigin;
 if(explicit==='separate-overview'||explicit==='combined-report')
  return {mode:explicit,reason:'manual'};
 if(meta.combatStatDetectedOrigin==='separate-overview')
  return {mode:'separate-overview',reason:'verified-bonus-overview'};
 if(meta.combatStatDetectedOrigin==='combined-report')
  return {mode:'combined-report',reason:'verified-combat-report'};
 if(meta.squadSeparate===true)
  return {mode:'separate-overview',reason:'legacy-squad-separate'};
 // Backward-compatible evidence from previously approved screenshot batches:
 // a TOTAL attack/lethality value cannot be smaller than one of its nonnegative
 // components. The 1044 example class ATK (181.5 / 169.2 / 244.3) is smaller
 // than the separately saved squad +274.8. That disproves combined-report
 // interpretation, and can be safely inferred without a new screenshot.
 const heroes=heroBonuses(model);
 const components=[...CLASS_CODES.flatMap((cl,i)=>
  [['Atk','squadAtk'],['Let','squadLet']].map(([metric,squadKey])=>({
   combined:validBonus(v[cl+metric]),component:validBonus(v[squadKey])}))),
  ...heroes.flatMap(h=>[
   {combined:validBonus(v[h.classKey+'Atk']),component:h.attackPct},
   {combined:validBonus(v[h.classKey+'Let']),component:h.lethalityPct}
  ])];
 if(components.some(({combined,component})=>combined!==null&&
   component!==null&&component>combined+0.01))
  return {mode:'separate-overview',reason:'component-exceeds-class-total'};
 return {mode:'combined-report',reason:'unknown-legacy-conservative'};
}
function composeCombatStats(model){
 const v=model?.values||{},stats={...v},origin=statOrigin(model),heroes=heroBonuses(model);
 const totals=[],missing=[];
 for(const [index,cl] of CLASS_CODES.entries()){
  const hero=heroes[index],data={classKey:cl,name:hero.name};
  for(const metric of METRICS){
   const raw=validBonus(v[cl+metric]);
   const squad=origin.mode==='separate-overview'?validBonus(v['squad'+metric]):null;
   const heroValue=origin.mode==='separate-overview'?
    metric==='Atk'?hero.attackPct:hero.lethalityPct:null;
   if(raw===null)missing.push(cl+metric+':class');
   if(origin.mode==='separate-overview'){
    if(squad===null)missing.push(cl+metric+':squad');
    if(heroValue===null)missing.push((hero.name||cl)+':hero-'+metric);
   }
   const effective=(raw??0)+(squad??0)+(heroValue??0);
   // Do not repair missing raw values by fabricating them. The combat
   // engine will refuse incomplete data as before.
   if(raw!==null)stats[cl+metric]=effective;
   data[metric]={classPct:raw,squadPct:squad,heroPct:heroValue,
    appliedPct:raw===null?null:effective};
  }
  totals.push(data);
 }
 return {stats,origin,heroes,totals,missing};
}
function currentStats(model){return composeCombatStats(model).stats;}
/* Forensic audit ONLY. This does not apply or save hidden bonuses.
 * The Bonus Overview displays separate all-squad bonuses and separate class
 * stats, and starter Hero Details may provide extra Expedition percentages.
 * A battle-report combined number can already include both; hence this
 * audit exposes alternative hypotheses, NOT automatic stat stacking.
 */
/* Interpretative comparison: class-only vs separate layers. This audit is
 * read-only, and its 'applied' value always agrees with the main engine.
 */
function inspectUnusedBonuses(model,counts,combat){
 const v=model?.values||{},meta=model?.v2||{},levels=combat?.configure?.(meta);
 const assembled=composeCombatStats(model);
 const raw={...v};
 if(!combat?.ready?.(raw,levels)||typeof combat?.damage!=='function')return null;
 const classes=CLASS_CODES,heroes=assembled.heroes;
 const squadAtk=validBonus(v.squadAtk),squadLet=validBonus(v.squadLet);
 const base=combat.damage(counts,raw,levels,5);
 if(!Number.isFinite(base)||base<=0)return null;
 const addSquad=stats=>{
  const result={...stats};
  for(const cl of classes){
   if(squadAtk!==null)result[cl+'Atk']=Number(result[cl+'Atk'])+squadAtk;
   if(squadLet!==null)result[cl+'Let']=Number(result[cl+'Let'])+squadLet;
  }
  return result;
 };
 const addHeroes=stats=>{
  const result={...stats};
  for(const h of heroes){
   if(h.attackPct!==null)result[h.classKey+'Atk']=Number(result[h.classKey+'Atk'])+h.attackPct;
   if(h.lethalityPct!==null)result[h.classKey+'Let']=Number(result[h.classKey+'Let'])+h.lethalityPct;
  }
  return result;
 };
 const scoring=stats=>combat.damage(counts,stats,levels,5);
 return {squadAttackPct:squadAtk,squadLethalityPct:squadLet,
  squadAlreadyApplied:assembled.origin.mode==='combined-report',
  heroes,origin:assembled.origin,
  totals:assembled.totals,missing:assembled.missing,
  hypotheticals:{
   current:base,withSquad:scoring(addSquad(raw)),
   withHeroes:scoring(addHeroes(raw)),
   withBoth:scoring(addHeroes(addSquad(raw))),
   applied:scoring(assembled.stats)
  },
  notAutomaticallyApplied:assembled.origin.mode==='combined-report',
  note:'Only the source-safe selected composition is applied. The three others are mathematical alternatives, not game score forecasts.'};
}
function calculate(model,counts,combat,heroReference){
 const v=model?.v2||{},heroNames=v.ownHeroes||[];
 const levels=combat?.configure?.(v),assembled=composeCombatStats(model),stats=assembled.stats;
 if(heroNames.filter(Boolean).length!==3||!Array.isArray(counts)||
   counts.length!==3||counts.some(x=>!Number.isInteger(x)||x<0)||
   !combat?.ready?.(stats,levels)||typeof combat?.damage!=='function')
  return {ready:false,reason:'missing-combat-input'};
 // NRW Pitfall has permanently reached Lv5. This is +25 percentage points
 // of troop ATTACK, not a universal 1.25x final-damage multiplier.
 const trace=combat.breakdown?.(counts,stats,levels,5);
 const original=trace?.totalTenRounds;
 if(!Number.isFinite(original)||original<=0)return {ready:false,reason:'missing-combat-input'};
 const fixed=[],excluded=[],skipped=[],widgets=[],missing=[];
 let bonusExtra=0,enemyTakenPct=0,widgetAttack=1,widgetLethality=1;
 const sourceLoaded=heroReference?.status?.()==='ready';
 for(const name of heroNames){
  const h=v.manualHeroes?.[name]||{},cap=skillCap(h.stars,h.tier);
  const record=sourceLoaded&&cap?heroReference.get(name,Number(h.stars),Number(h.tier)||0):null;
  if(!record?.skillVerified||!Array.isArray(record.skills)){missing.push(name);continue;}
  for(const skill of record.skills){
   const cond=skill.conditions||{},effect=skill.effect;
   const skillValue=skill.valuesBySkillLevel?.[cap-1];
   if(!Number.isFinite(skillValue)){skipped.push(name+': '+skill.name);continue;}
   const meta={hero:name,skill:skill.name,level:cap,amount:skillValue};
   // Fixed extra hit over 10 turns (twice) only for VERIFIED all-squad skill.
   if(effect==='extra_squad_strike'&&cond.everyTurns===4&&skill.metric==='damage_percent'){
    const hitCount=Math.floor(TRAP_ROUNDS/4);
    const pct=skillValue*hitCount/TRAP_ROUNDS;
    bonusExtra+=pct;fixed.push({...meta,kind:'fixed-extra-strike',effectiveBonusPct:pct});
   }else if(effect==='enemy_damage_taken_up'&&!cond.procChancePercent&&
    !cond.everyTurns&&skill.metric==='percent'){
    enemyTakenPct+=skillValue;fixed.push({...meta,kind:'fixed-enemy-damage-taken',effectiveBonusPct:skillValue});
   }else if(cond.procChancePercent||effect.includes('chance')||effect==='squad_damage_dealt_buff'||
    effect==='damage_over_time'||effect==='archer_extra_hit'){
    excluded.push({...meta,kind:'random',reason:'chance-based'});
   }else if(['attack_up','lethality_up','squad_attack_buff','squad_attack_up',
     'archer_attack_buff','squad_lethality_up','infantry_damage_up','squad_skill_damage_up'].includes(effect)){
    excluded.push({...meta,kind:'already-in-stats',reason:'passive/captured stats or unconfirmed additive interaction'});
   }else if(['damage_taken_down','damage_taken_reduction','damage_taken_chance_down',
    'health_up','defense_up','squad_health_up','squad_defense_up',
    'enemy_damage_dealt_debuff','enemy_damage_down','enemy_lethality_down',
    'damage_taken_reduction_proc_chance','squad_damage_taken_down'].includes(effect)){
    excluded.push({...meta,kind:'defensive',reason:'does not raise baseline Bear damage'});
   }else{
    // Fail closed, never guess a multiplier for unfamiliar skill semantics.
    skipped.push(name+': '+skill.name+' ('+effect+')');
   }
  }
  const widgetLevel=readWidgetLevel(model,name);
  if(widgetLevel===null){missing.push(name+':widget');continue;}
  const widget=widgetValue(name,widgetLevel);
  if(!widget){if(widgetLevel>0)skipped.push(name+':widget-unknown-effect');continue;}
  widgets.push(widget);
  // Verified rally *ability*, not the widget's gear stats. Independent rally
  // multipliers; because stacking order isn't officially disclosed, report
  // as model assumptions rather than guaranteed physical damage.
  if(widget.type==='rally-attack')widgetAttack*=1+widget.bonusPct/100;
  if(widget.type==='rally-lethality')widgetLethality*=1+widget.bonusPct/100;
 }
 const strikeFactor=1+bonusExtra/100;
 const abilityFactor=strikeFactor*(1+enemyTakenPct/100)*widgetAttack*widgetLethality;
 return {ready:true,modelIndex:original*abilityFactor,withoutAbilitiesIndex:original,
  troopBreakdown:trace,pitfallLevel:5,
  assembledStats:assembled,
  abilityFactor,extraStrikePct:bonusExtra,enemyDamageTakenPct:enemyTakenPct,widgetAttackFactor:widgetAttack,
  widgetLethalityFactor:widgetLethality,
  included:fixed,widgets,excluded,unmodeled:skipped,missing,
  heroSourceReady:sourceLoaded,source:'partial-community-bear-model',
  noJoinerSkills:true,includesChanceEffects:false,
  isGuaranteedDamage:false};
}
root.NRW_BEAR_OWN_BASELINE={calculate,inspectUnusedBonuses,skillCap,widgetValue,readWidgetLevel,currentStats,composeCombatStats,statOrigin,heroBonuses,EXPEDITION_WIDGETS};
})(window);
