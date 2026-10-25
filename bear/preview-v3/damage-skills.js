/* Extended Bear V3: own rally (any three of the 37 sourced heroes).
 * Uses the EXACT same skill interpreter as the starter recommendation.
 * The 10-round troop engine remains a relative, uncalibrated community index.
 * Does not add expedition passive gear / native hero stats twice.
 */
(function(root){
'use strict';
const keys=['i','c','a'];
function prepare(model,reference,catalog,scores,own){
 const v=model?.v2||{},names=v.ownHeroes||[],heroes=v.manualHeroes||{};
 const engine=root.NRW_BEAR_SKILL_EFFECTS;
 if(!engine||!reference?.get)return {ready:false,reason:'missing-skill-reference'};
 if(names.length!==3||names.some(n=>!n||!heroes[n]))return {ready:false,reason:'incomplete-starter'};
 const modifiers={attack:0,lethality:0,classAttack:[0,0,0],
  classDamage:[1,1,1],lowClassDamage:[1,1,1],
  damage:1,lowDamage:1};
 const uncertain=[],unmodeled=[];
 function apply(effect){
  const value=Number(effect.amount)||0;
  const lowValue=effect.uncertain?Number(effect.lower||0):value;
  const mult=1+value/100,lowMult=1+lowValue/100;
  if(effect.kind==='attack')modifiers.attack+=value;
  if(effect.kind==='lethality')modifiers.lethality+=value;
  if(effect.kind==='class-attack')modifiers.classAttack[effect.type]+=value;
  if(effect.kind==='damage'){modifiers.damage*=mult;modifiers.lowDamage*=lowMult;}
  if(effect.kind==='class-damage'){
   modifiers.classDamage[effect.type]*=mult;
   modifiers.lowClassDamage[effect.type]*=lowMult;
  }
  if(effect.uncertain)uncertain.push(effect);
 }
 const reports=[];
 for(const name of names){
  const h=heroes[name],stars=Number(h.stars),tier=Number(h.tier||0);
  if(!Number.isInteger(stars)||stars<0||stars>5)return {ready:false,reason:'invalid-hero-stars'};
  const source=reference.get(name,stars,tier);
  if(!source)return {ready:false,reason:'missing-source-for-'+name};
  const cap=Math.min(5,stars+1);
  const ranks=h.skillsAssumedMax===false&&Array.isArray(h.skills)?h.skills:null;
  const review=engine.assess({name,skillLevel:cap,confirmedSkillRanks:ranks},source);
  review.modeled.forEach(apply);
  review.uncertain.forEach(x=>unmodeled.push({hero:name,...x}));
  const widgetLevel=Number(h.widget)||0;
  const widget=own?.widgetValue?.(name,widgetLevel);
  if(widget?.type==='rally-attack')modifiers.attack+=widget.bonusPct;
  if(widget?.type==='rally-lethality')modifiers.lethality+=widget.bonusPct;
  reports.push({hero:name,skills:review.skillCount,sourceEffects:review.sourceEffects,
   modeled:review.modeled.length,unmodeled:review.uncertain.length});
 }
 const pets=scores?.petAudit?.(model,catalog)?.filter(p=>p.active)||[];
 if(pets.some(p=>!Number.isFinite(p.percentage)))return {ready:false,reason:'missing-pet-rank'};
 if(!v.petBuffCapturedInStats)for(const p of pets){
  if(p.id==='attack')modifiers.attack+=p.percentage;
  if(p.id==='lethality')modifiers.lethality+=p.percentage;
 }
 // Unlike ATK/LET, War Bear enemy-defense reduction and Moose enemy-health
 // reduction are not confirmed against the Bear's own combat stats.
 // Never silently force their full effect into the recommendation.
 const speculativePets=pets.filter(p=>p.id==='enemy_defense'||p.id==='enemy_health');
 const hunter=scores?.talent?.(model);
 const points=hunter?.personalPointPercent||0;
 return {ready:true,modifiers,reports,unmodeled,
  speculativePets:speculativePets.map(x=>x.name),valoraPoints:points,
  assumptions:['independent-skill-proc','sourced-skill-levels',
   'unverified-damage-stacking','level5-bear-trap']};
}
function evaluate(prepared,counts,levels,stats,combat,joinerMultiplier=1){
 if(!prepared?.ready||!combat?.breakdown||!Array.isArray(counts))
  return {ready:false,reason:'missing-input'};
 const m=prepared.modifiers,values={...stats};
 for(let i=0;i<3;i++){
  const key=keys[i];
  values[key+'Atk']=Number(stats[key+'Atk'])+m.attack+m.classAttack[i];
  values[key+'Let']=Number(stats[key+'Let'])+m.lethality;
 }
 const data=combat.breakdown(counts,values,levels,5);
 if(!data?.types||data.types.length!==3)return {ready:false,reason:'invalid-combat-breakdown'};
 let low=0,high=0;
 for(let i=0;i<3;i++){
  const base=Number(data.types[i].damageTenRounds);
  if(!Number.isFinite(base)||base<0)return {ready:false,reason:'bad-class-damage'};
  low+=base*m.lowClassDamage[i];
  high+=base*m.classDamage[i];
 }
 const pointFactor=1+prepared.valoraPoints/100;
 // Expedition joiner skills affect DamageUp effect_op, NOT a direct addition
 // to the rally leader's Attack/Lethality percentages. Their stacking
 // multiplier is applied after the base combat estimate.
 if(!Number.isFinite(joinerMultiplier)||joinerMultiplier<1||joinerMultiplier>16)
  return {ready:false,reason:'invalid-joiner-stacking'};
 const lower=low*m.lowDamage*pointFactor*joinerMultiplier;
 const upper=high*m.damage*pointFactor*joinerMultiplier;
 // This simulation covers verified troop proc unlock levels only. The
 // applied hero expedition effects remain expected values or sensitivity
 // estimates; they are not misrepresented as independently timed RNG rolls.
 const distribution=typeof combat.troopDistribution==='function'?
  combat.troopDistribution(counts,values,levels,5,1000,{
   classFactors:m.lowClassDamage,
   globalFactor:m.lowDamage*pointFactor*joinerMultiplier
  }):null;
 return {ready:true,estimatedIndex:lower,lower,upper,
  isUpperConditional:upper>lower+1e-6,unmodeled:prepared.unmodeled,
  classBreakdown:data.types.map((t,i)=>({type:keys[i],damage:t.damageTenRounds})),
  distribution,source:'all-owned-starters-expedition-skills',pitfallLevel:5,
  warning:'Estimated community Bear score: troop procs modeled over 10 turns, hero timing not fully verified.'};
}
root.NRW_BEAR_SKILL_DAMAGE={prepare,evaluate,
 version:'all-starters-generic-expected-damage-20261012'};
})(window);
