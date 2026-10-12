/* Bear rally skill-effects interpreter, source-schema v1.
 * GENERAL algorithm for ALL 37 source heroes, NOT hero-to-hero priorities.
 * Every expedition skill (including additionalEffects) is classified as
 * modeled, irrelevant for attacking the Bear, or uncertain / unmodeled.
 *
 * Expected values are probability averages under an explicitly simplified
 * independent-attack/turn model. Never silently count enemy troop-specific
 * damage, defender skills, healing or Conquest mechanics against the Bear.
 */
(function(root){
'use strict';
const OFFENSE=new Set([
 'attack_up','squad_attack_buff','squad_attack_up','archer_attack_buff',
 'lethality_up','squad_lethality_up','squad_lethality_proc_chance',
 'damage_up','damage_dealt_chance_up','enemy_damage_taken_debuff',
 'squad_damage_dealt_buff','extra_squad_strike','infantry_damage_up',
 'archer_extra_hit','archer_extra_damage_percent','cavalry_bonus_damage_percent',
 'bonus_damage_proc_chance','bonus_damage_percent','extra_damage_up',
 'enemy_damage_taken_up','cavalry_archer_damage_up',
]);
const IRRELEVANT=new Set([
 'mill_income','bread_gathering_speed','quarry_income','stone_gathering_speed',
 'logging_income','wood_gathering_speed','iron_mine_income','iron_mining_speed',
 'research_speed_up','construction_speed_up','construction_cost_down',
 'stamina_cost_down','hunting_march_speed','wilderness_march_speed',
 'healing_speed_up','defense_up','squad_defense_up','health_up','squad_health_up',
 'infantry_health_up','cavalry_archer_health_up','damage_taken_down',
 'damage_taken_reduction','damage_taken_chance_down','damage_taken_reduction_proc_chance',
 'dodge_probability_up','squad_damage_taken_down','enemy_damage_down',
 'enemy_attack_down','enemy_damage_dealt_debuff','enemy_lethality_down',
 'enemy_troop_attack_down','enemy_squad_attack_down','enemy_squad_lethality_down',
 'enemy_damage_taken_chance_down'
]);
const CONDITIONAL=new Set([
 'enemy_squad_defense_down','squad_skill_damage_up','damage_over_time',
 'cavalry_bonus_damage_vs_terrified','squad_bonus_damage_vs_terrified'
]);
const ENEMY_TROOP_ONLY=new Set(['damage_dealt_to_archer_up',
 'damage_dealt_to_infantry_up']);
const valid=(n)=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const pct=n=>Math.max(0,Math.min(5000,n));
const cl=n=>[0,1,2].includes(n);
function interpret(skill,level,heroName){
 const result={hero:heroName,skill:skill?.name||'',level,
  modeled:[],irrelevant:[],uncertain:[],sourceEffects:0};
 if(!skill||!Number.isInteger(level)||level<1||level>5){
  result.uncertain.push({effect:'skill-level',reason:'unconfirmed-skill-level'});
  return result;
 }
 const pieces=[skill,...(skill.additionalEffects||[])];
 for(const piece of pieces){
  result.sourceEffects++;
  const kind=piece.effect,amount=piece.valuesBySkillLevel?.[level-1];
  const c=skill.conditions||{};
  const title=skill.name+(piece===skill?'':' / '+kind);
  if(!valid(amount)){
   result.uncertain.push({effect:kind,name:title,reason:'missing-skill-value'});
   continue;
  }
  if(IRRELEVANT.has(kind)){
   result.irrelevant.push({effect:kind,name:title,reason:'non-offensive-or-sustain'});
   continue;
  }
  if(ENEMY_TROOP_ONLY.has(kind)){
   result.irrelevant.push({effect:kind,name:title,reason:'enemy-troop-type-not-bear'});
   continue;
  }
  if(CONDITIONAL.has(kind)){
   result.uncertain.push({effect:kind,name:title,reason:kind==='damage_over_time'?
    'bear-DoT-tick-and-duration-unknown':'target-or-skill-damage-mechanics-unknown'});
   continue;
  }
  if(!OFFENSE.has(kind)){
   result.uncertain.push({effect:kind,name:title,reason:'unclassified-source-effect'});
   continue;
  }
  const add=(type,value,opts={})=>{
   if(!valid(value)||!valid(pct(value)))return;
   result.modeled.push({name:title,effect:kind,kind:type,amount:pct(value),
    ...opts});
  };
  const chance=valid(c.procChancePercent)?c.procChancePercent/100:1;
  // Triggers every N attacks or turns use the fraction of active events,
  // not a bonus on EACH round. Duration stacking is separately uncertain.
  const attackInterval=Number(c.everyAttacks||c.everyTurns||0);
  const periodic=attackInterval>0?Math.floor(10/attackInterval)/10:1;
  if(kind==='attack_up'||kind==='squad_attack_up'||
     kind==='squad_attack_buff'&&piece.metric!=='damage_percent'){
   add('attack',amount*chance);continue;
  }
  if(kind==='squad_attack_buff'&&piece.metric==='damage_percent'){
   // Petra's "The Favor" text is a chance for +Squad Attack even if the
   // source labels the displayed numeric field "Damage Up".
   add('attack',amount*chance,{assumption:'probability-average-attack'});continue;
  }
  if(kind==='archer_attack_buff'){add('class-attack',amount*chance,{type:2});continue;}
  if(kind==='lethality_up'||kind==='squad_lethality_up'){
   add('lethality',amount*chance);continue;
  }
  if(kind==='squad_lethality_proc_chance'){
   const boosted=Number(c.lethalityBuffPercent);
   if(!valid(boosted)){result.uncertain.push({name:title,effect:kind,reason:'missing-buff-value'});continue;}
   add('lethality',boosted*amount/100,{assumption:'independent-probability-expected'});continue;
  }
  if(kind==='infantry_damage_up'){add('class-damage',amount*chance,{type:0});continue;}
  if(kind==='cavalry_archer_damage_up'){
   for(const type of [1,2])add('class-damage',amount*chance,{type});
   continue;
  }
  if(kind==='archer_extra_damage_percent'||kind==='archer_extra_hit'){
   add('class-damage',amount*chance,{type:2,
    assumption:kind==='archer_extra_hit'?'independent-proc':'every-archer-attack'});continue;
  }
  if(kind==='cavalry_bonus_damage_percent'){
   add('class-damage',amount*chance,{type:1,assumption:'independent-proc'});continue;
  }
  if(kind==='bonus_damage_proc_chance'||kind==='squad_damage_dealt_buff'&&piece.metric==='proc_chance_percent'){
   const boost=Number(c.bonusDamagePercent??c.effectDamageDealtPercent);
   if(!valid(boost)){result.uncertain.push({name:title,effect:kind,reason:'missing-conditional-damage-bonus'});continue;}
   add('damage',amount*boost/100,{assumption:'independent-proc'});continue;
  }
  if(kind==='bonus_damage_percent'||kind==='squad_damage_dealt_buff'){
   add('damage',amount*chance,{assumption:chance<1?'independent-proc':'passive'});continue;
  }
  if(kind==='damage_dealt_chance_up'){
   const boost=Number(c.damageDealtIncreasePercent);
   if(!valid(boost)){result.uncertain.push({name:title,effect:kind,reason:'missing-damage-boost'});continue;}
   add('damage',amount*boost/100,{assumption:'independent-proc'});continue;
  }
  if(kind==='extra_squad_strike'){
   const every=Number(c.everyTurns);
   if(!Number.isInteger(every)||every<=0){result.uncertain.push({name:title,effect:kind,reason:'unknown-turn-frequency'});continue;}
   add('damage',amount*Math.floor(10/every)/10,{assumption:'ten-round-timing'});continue;
  }
  if(kind==='enemy_damage_taken_debuff'){
   add('damage',amount*chance,{assumption:chance<1?'independent-target-debuff-proc':'passive-target-debuff'});
   continue;
  }
  if(kind==='enemy_damage_taken_up'){
   if(c.everyTurns||c.everyAttacks){
    const upper=amount*periodic;
    add('damage',upper,{uncertain:true,lower:0,assumption:'target-debuff-duration-and-stacking'});
   }else if(piece!==skill&&c.durationTurns===1){
    // Alcar and Vivian have secondary next-attack debuffs. Without verified
    // uptime, their possible boost is 0..listed value.
    add('damage',amount,{uncertain:true,lower:0,assumption:'next-hit-debuff-uptime'});
   }else add('damage',amount,{assumption:'passive-target-damage-up'});
   continue;
  }
  if(kind==='damage_up'){
   if(heroName==='Thrud'&&skill.name==='Battle Hunger'){
    // Scope of the secondary "damage up" is Infantry + Archers only.
    for(const type of [0,2])add('class-damage',amount,{type,assumption:'infantry-and-archer-only'});
    continue;
   }
   if(c.everyCavalryAttacks){
    const upper=amount*Math.min(1,(Number(c.durationTurns)||1)/Number(c.everyCavalryAttacks));
    add('damage',upper,{uncertain:true,lower:0,assumption:'cavalry-triggered-duration'});
   }else if(c.durationTurns&&chance<1){
    const lower=amount*chance;
    const upper=amount*(1-Math.pow(1-chance,Number(c.durationTurns)));
    add('damage',upper,{uncertain:true,lower,assumption:'proc-duration-and-refresh'});
   }else if(amount>100&&chance<1){
    // "25% chance of DEALING 200% damage" adds +100% on success,
    // not +200%. Source abilities in this category use this wording.
    add('damage',(amount-100)*chance,{assumption:'200-percent-hit-means-double'});
   }else add('damage',amount*chance,{assumption:chance<1?'independent-proc':'passive'});
   continue;
  }
  if(kind==='extra_damage_up'){
   if(heroName==='Alcar'&&skill.name==='Carpe Diem'){
    add('class-damage',amount,{type:0,assumption:'infantry-per-attack'});continue;
   }
   if(heroName==='Thrud'&&skill.name==='Reckless Charge'){
    add('class-damage',amount*chance,{type:1,assumption:'cavalry-proc'});continue;
   }
   if(heroName==='Vivian'&&skill.name==='Trap of Greed'){
    add('class-damage',amount*periodic,{type:2,assumption:'archer-every-four-attacks'});continue;
   }
   if(heroName==='Vivian'&&skill.name==='Focus Fire'){
    add('damage',amount*periodic,{assumption:'squad-every-four-attacks'});continue;
   }
   result.uncertain.push({name:title,effect:kind,reason:'damage-scope-not-verified'});
   continue;
  }
 }
 return result;
}
function assess(hero,reference){
 const rank=Math.min(5,Math.max(1,Number(hero?.skillLevel)||1));
 if(!reference||!Array.isArray(reference.skills))
  return {modeled:[],irrelevant:[],uncertain:[{reason:'missing-hero-reference'}],
   perSkill:[],skillCount:0,sourceEffects:0};
 const perSkill=reference.skills.map((skill,i)=>interpret(skill,
  Array.isArray(hero?.confirmedSkillRanks)&&Number.isInteger(hero.confirmedSkillRanks[i])?
   hero.confirmedSkillRanks[i]:rank,hero?.name||reference.name));
 const modeled=perSkill.flatMap(s=>s.modeled),irrelevant=perSkill.flatMap(s=>s.irrelevant),
  uncertain=perSkill.flatMap(s=>s.uncertain);
 return {modeled,irrelevant,uncertain,perSkill,skillCount:perSkill.length,
  sourceEffects:perSkill.reduce((n,x)=>n+x.sourceEffects,0),
  interpretedEffects:modeled.length+irrelevant.length+uncertain.length};
}
root.NRW_BEAR_SKILL_EFFECTS={interpret,assess,OFFENSE,IRRELEVANT,CONDITIONAL,
 ENEMY_TROOP_ONLY,version:'all-37-bear-expedition-20261012'};
})(window);
