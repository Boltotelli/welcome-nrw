/* Preliminary Bear Trap rally-leader hero shortlist.
 * Role priorities are a qualitative local interpretation of the existing
 * Kingshot Atlas reference, NOT an official Atlas score or damage calculator.
 * Unknown stars/skills remain flagged; never silently imply verified Lv5.
 */
(function(root){
'use strict';
const classes=['infantry','cavalry','archer'];
function asNumber(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function skillState(hero){
 const stars=asNumber(hero.stars);
 const inferred=stars>0?Math.max(1,Math.min(5,Math.floor(stars)+1)):null;
 const actual=Array.isArray(hero.skills)&&hero.skills.some(x=>asNumber(x)>0)&&!hero.skillsAssumedMax;
 const levels=actual?hero.skills.map(asNumber).filter(v=>v>0):[];
 return {level:levels.length?levels.reduce((a,b)=>a+b,0)/levels.length:inferred,
  assumed:!levels.length,confirmed:levels.length>0};
}
function evaluate(hero,type,priorities){
 const list=priorities?.[type]||[],rank=list.indexOf(hero.name);
 const stars=asNumber(hero.stars),level=asNumber(hero.level),skill=skillState(hero);
 // Bear-specific priority is the principal input. Hero progression matters:
 // an invested accessible candidate may outrank an unbuilt meta hero.
 const priority=rank<0?0:Math.max(0,58-rank*7);
 const progress=Math.min(80,level)*.24+Math.min(5,stars)*7.5+
  Math.min(5,asNumber(skill.level))*3+Math.max(0,Math.min(5,asNumber(hero.tier)))*.5+
  Math.min(10,asNumber(hero.widget))*1.2;
 return {name:hero.name,type,score:Math.round((priority+progress)*10)/10,
  level:level||null,stars:stars||null,skill:skill.level,assumedSkill:skill.assumed,
  hasConfirmedSkill:skill.confirmed,widget:asNumber(hero.widget),
  confidence:level>0&&stars>0?(skill.confirmed?'higher':'estimated'):'limited'};
}
function recommend(owned,types,priorities){
 const roster=new Map();
 for(const hero of owned||[]){
  if(!hero?.name||!types?.[hero.name])continue;
  // Details uploaded later may update an existing API/overview record.
  roster.set(hero.name,{...(roster.get(hero.name)||{}),...hero});
 }
 return classes.map(type=>{
  const choices=[...roster.values()].filter(h=>types[h.name]===type)
   .map(h=>evaluate(h,type,priorities))
   .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  return {type,choices,best:choices[0]||null};
 });
}
root.NRW_BEAR_HERO_ADVISOR={recommend,evaluate,skillState,classes,source:'https://ks-atlas.com/tools/atlas-database/bear-rally-heroes'};
})(window);
