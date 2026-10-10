/* NRW Bear own-starter EXPEDITION skill expectation, v1.
 * Uses the exact version-pinned 37-hero public source already loaded by
 * hero-reference.js. Pure, deterministic Bernoulli ENUMERATION over 10 turns:
 * no RNG, no user-supplied observed damage scalar, no JOINER contributions.
 *
 * MODEL ASSUMPTIONS (not verified in-game):
 * - One eligible proc roll per model turn for each supported active skill.
 *   Some game text says "each squad attack"; actual frequency/duration unknown.
 * - A skill that procs affects that turn only, absent recorded duration.
 * - Zoe Infinite Arsenal and Petra Evil Eye (enemy damage taken) add within
 *   one effect family; alternative result multiplies these two categories.
 * - Petra The Favor +X% squad attack means X ADDITIONAL PERCENTAGE POINTS
 *   to effective troop ATK (not X% final damage).
 * - Yang Ice Zone bonus hit is applied only to the Archer class share.
 * - Yang Ambush uses its CHANCE per skill rank and its separate +50% damage
 *   effect from reference.conditions.effectDamageDealtPercent.
 * - Zoe Sundering Wound persists three turns, but how it stacks, its base
 *   hit ownership and precisely when it ticks are not recorded. Excluded.
 * - Fixed skills (e.g. Yang Avalanche turns 4 and 8), verified Widget
 *   rally abilities and previously captured class/squad/hero base stats
 *   come unchanged from own-baseline.js and are not applied again.
 *
 * A result here is a partial model INDEX, NOT guaranteed points or a
 * prediction of another calculator's 33 million.
 */
(function(root){
'use strict';
const ROUND_COUNT=10;
const CONFIG=[
 {hero:'Zoe',skill:'Infinite Arsenal',effect:'enemy_damage_taken_debuff',kind:'damage-taken',
  metric:'amplification_percent',chanceField:'procChancePercent'},
 {hero:'Petra',skill:'Evil Eye',effect:'enemy_damage_taken_debuff',kind:'damage-taken',
  metric:'amplification_percent',chanceField:'procChancePercent'},
 {hero:'Petra',skill:'The Favor',effect:'squad_attack_buff',kind:'attack-points',
  metric:'damage_percent',chanceField:'procChancePercent'},
 {hero:'Yang',skill:'Ice Zone',effect:'archer_extra_hit',kind:'archer-hit',
  metric:'damage_percent',chanceField:'procChancePercent'},
 {hero:'Yang',skill:'Ambush',effect:'squad_damage_dealt_buff',kind:'squad-damage',
  metric:'proc_chance_percent',chanceField:'skillValue',amountField:'effectDamageDealtPercent'}
];
function readEligibleSkills(model,reference,baseline){
 const names=model?.v2?.ownHeroes||[],manual=model?.v2?.manualHeroes||{};
 if(reference?.status?.()!=='ready'||!baseline?.heroSourceReady)
  return {ready:false,why:'hero-reference-unavailable',skills:[],unmodeled:[]};
 const skills=[],unmodeled=[],available=[];
 for(const name of names){
  const hero=manual[name]||{};
  const cap=root.NRW_BEAR_OWN_BASELINE?.skillCap?.(hero.stars,hero.tier);
  const record=cap?reference.get?.(name,Number(hero.stars),Number(hero.tier)||0):null;
  if(!record?.skillVerified||!Array.isArray(record.skills))
   return {ready:false,why:'unverified-'+name,skills:[],unmodeled:[]};
  available.push(name);
  for(const s of record.skills){
   const cfg=CONFIG.find(x=>x.hero===name&&x.skill===s.name);
   if(!cfg){
    // Defensive procs do not contribute offense against Bear.
    if(s.effect==='damage_taken_reduction'||
       s.effect==='damage_taken_down'||s.effect==='damage_taken_chance_down')
      continue;
    if(s.conditions?.procChancePercent||
       s.effect==='damage_over_time'||
       s.effect==='squad_damage_dealt_buff'){
      unmodeled.push({hero:name,skill:s.name,reason:
       s.effect==='damage_over_time'?'unverified-duration-and-base':'unknown-proc-semantics'});
    }
    continue;
   }
   if(s.effect!==cfg.effect||s.metric!==cfg.metric||
      !Array.isArray(s.valuesBySkillLevel)||s.valuesBySkillLevel.length!==5){
    unmodeled.push({hero:name,skill:s.name,reason:'skill-definition-mismatch'});continue;
   }
   const value=Number(s.valuesBySkillLevel[cap-1]),cond=s.conditions||{};
   const chance=cfg.chanceField==='skillValue'?value:Number(cond[cfg.chanceField]);
   const amount=cfg.amountField?Number(cond[cfg.amountField]):value;
   if(!Number.isFinite(chance)||chance<0||chance>100||
      !Number.isFinite(amount)||amount<0||amount>1000){
    unmodeled.push({hero:name,skill:s.name,reason:'invalid-skill-parameters'});continue;
   }
   skills.push({hero:name,skill:s.name,kind:cfg.kind,
    chancePercent:chance,effectPercent:amount,skillLevel:cap,
    chancePerTurnAssumed:true});
  }
 }
 return {ready:true,skills,unmodeled,available};
}
function evaluate(model,counts,combat,reference){
 const own=root.NRW_BEAR_OWN_BASELINE;
 const baseline=own?.calculate?.(model,counts,combat,reference);
 if(!baseline?.ready)return {ready:false,reason:baseline?.reason||'base-unavailable'};
 const observed=readEligibleSkills(model,reference,baseline);
 if(!observed.ready)
  return {ready:false,reason:observed.why,baselineIndex:baseline.modelIndex};
 const schema=CONFIG.map(c=>observed.skills.find(s=>s.hero===c.hero&&s.skill===c.skill)||null);
 const basePerClass=baseline.troopBreakdown.types.map(t=>t.damagePerRound);
 const effectiveAttacks=baseline.troopBreakdown.types.map(t=>t.appliedAttackPct);
 const fixedStatic=baseline.widgetAttackFactor*baseline.widgetLethalityFactor*
  (1+(baseline.enemyDamageTakenPct||0)/100);
 const fixedStrikes=baseline.included.filter(s=>s.kind==='fixed-extra-strike')
  .map(s=>({every:4,amount:s.amount/100}));
 // Exact finite Bernoulli enumeration, never Monte Carlo random sampling.
 function simulate(mode){
  let expected=0,noProc=0,allProc=0;
  const states=1<<schema.length;
  for(let turn=1;turn<=ROUND_COUNT;turn++){
   const turnFixed=fixedStrikes.reduce((f,s)=>
    turn%s.every===0?f*(1+s.amount):f,1);
   const fixedFactor=turnFixed*fixedStatic;
   for(let mask=0;mask<states;mask++){
    let p=1;
    const chosen=[];
    for(let j=0;j<schema.length;j++){
     const s=schema[j],on=Boolean(mask&(1<<j));
     const chance=s?s.chancePercent/100:0;
     p*=on?chance:1-chance;
     chosen.push(on);
    }
    if(p===0&&mask!==0)continue;
    const [zoe,evil,favor,ice,ambush]=chosen;
    const dmg=basePerClass.reduce((sum,base,i)=>{
     const extraAtk=favor?(schema[2]?.effectPercent||0):0;
     const attackFactor=(100+effectiveAttacks[i]+extraAtk)/(100+effectiveAttacks[i]);
     const iceFactor=i===2&&ice?1+(schema[3]?.effectPercent||0)/100:1;
     return sum+base*attackFactor*iceFactor;
    },0);
    const z=zoe?(schema[0]?.effectPercent||0)/100:0;
    const e=evil?(schema[1]?.effectPercent||0)/100:0;
    const takenFactor=mode==='independent-groups'?(1+z)*(1+e):1+z+e;
    const ambushFactor=ambush?1+(schema[4]?.effectPercent||0)/100:1;
    const result=dmg*fixedFactor*takenFactor*ambushFactor;
    expected+=p*result;
    if(mask===0)noProc+=result;
    if(mask===states-1)allProc+=result;
   }
  }
  return {expectedIndex:expected,noProcIndex:noProc,allProcIndex:allProc};
 }
 const additive=simulate('additive-shared-group');
 const alternative=simulate('independent-groups');
 const initial=baseline.modelIndex;
 return {ready:true,baselineIndex:initial,
  expectedIndex:additive.expectedIndex,
  alternativeIndex:alternative.expectedIndex,
  upliftPercent:100*(additive.expectedIndex/initial-1),
  alternateUpliftPercent:100*(alternative.expectedIndex/initial-1),
  noProcCheckIndex:additive.noProcIndex,
  allProcIllustrationIndex:additive.allProcIndex,
  skills:observed.skills,unmodeled:observed.unmodeled,
  includesJoiningSkills:false,includesSunder:false,
  turns:ROUND_COUNT,procTimingAssumption:'one-independent-roll-per-turn-immediate',
  stackAssumption:'same-family-enemy-taken-additive',
  attackSkillAssumption:'add-percentage-points-to-effective-attack',
  partial:true,unit:'relative-model-index'};
}
root.NRW_BEAR_PROC_EXPECTATION={evaluate,readEligibleSkills,CONFIG,ROUND_COUNT};
})(window);
