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
function currentStats(model){
 const v=model?.values||{},own={...v};
 if(model?.v2?.squadSeparate){
  for(const name of ['iAtk','cAtk','aAtk'])own[name]=Number(own[name])+Number(v.squadAtk||0);
  for(const name of ['iLet','cLet','aLet'])own[name]=Number(own[name])+Number(v.squadLet||0);
 }
 return own;
}
function calculate(model,counts,combat,heroReference){
 const v=model?.v2||{},heroNames=v.ownHeroes||[];
 const levels=combat?.configure?.(v),stats=currentStats(model);
 if(heroNames.filter(Boolean).length!==3||!Array.isArray(counts)||
   counts.length!==3||counts.some(x=>!Number.isInteger(x)||x<0)||
   !combat?.ready?.(stats,levels)||typeof combat?.damage!=='function')
  return {ready:false,reason:'missing-combat-input'};
 const original=combat.damage(counts,stats,levels,Number(model.values?.pitfall)||0);
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
  abilityFactor,extraStrikePct:bonusExtra,enemyDamageTakenPct:enemyTakenPct,widgetAttackFactor:widgetAttack,
  widgetLethalityFactor:widgetLethality,
  included:fixed,widgets,excluded,unmodeled:skipped,missing,
  heroSourceReady:sourceLoaded,source:'partial-community-bear-model',
  noJoinerSkills:true,includesChanceEffects:false,
  isGuaranteedDamage:false};
}
root.NRW_BEAR_OWN_BASELINE={calculate,skillCap,widgetValue,readWidgetLevel,currentStats,EXPEDITION_WIDGETS};
})(window);
