/* Conservative Bear rally LEADER shortlist from owned heroes only.
 * Source: KS Atlas Bear Rally Heroes (qualitative guide), cross-checked with
 * kingshotguides.com/guide/bear-hunt-expert-guide/ (Gen6 rally examples).
 * This is NOT an Atlas damage formula or a battle simulation.
 */
(function(root){
'use strict';
const classes=['infantry','cavalry','archer'];
// Early Gen-1 substitutes (Howard/Quinn) are technically usable when
// no offensive option exists, but not equivalent to current Bear leaders.
// A 5-star filler should not automatically beat a developed Rosa/Zoe.
const defenseFirst=new Set(['Triton','Alcar','Long Fei','Sophia','Eric','Vivian','Charles']);
const legacyFillers=new Set(['Howard','Quinn','Gordon','Forrest','Seth','Edwin','Olive','Fahd']);
const offensiveWidget=new Set(['Yang','Rosa','Amadeus','Helga','Marlin','Margot']);
function value(v,min=0,max=100){
 if(v===null||v===undefined||v==='')return null;
 const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
function skillState(hero){
 const stars=value(hero.stars,1,5);
 const cap=stars===null?null:Math.min(5,Math.floor(stars)+1);
 const actual=Array.isArray(hero.skills)&&hero.skillsAssumedMax===false?
  hero.skills.map(x=>value(x,1,5)):null;
 const confirmed=Boolean(actual?.length===3&&actual.every(x=>x!==null));
 const avg=confirmed?actual.reduce((a,b)=>a+b,0)/3:cap;
 return {level:avg,cap,assumed:!confirmed,confirmed};
}
function evaluate(hero,type,priorities){
 const list=priorities?.[type]||[];
 const rank=list.indexOf(hero.name);
 const stars=value(hero.stars,1,5);
 const tier=value(hero.tier,0,5);
 const level=value(hero.level,1,80);
 const widget=value(hero.widget,1,10);
 const skills=skillState(hero);
 const caution=defenseFirst.has(hero.name)||legacyFillers.has(hero.name);
 // Star investment governs available skills and base hero progression.
 // The smaller role preference can only decide comparably upgraded heroes.
 // A 1-star meta hero must not beat a developed 4-star alternative.
 const fractionalStars=stars===null?null:Math.min(5,stars+(stars<5?(tier||0)/6:0));
 const progress=fractionalStars===null?0:Math.pow(fractionalStars/5,1.3);
 const levelFactor=level===null?.79:(.79+.21*level/80);
 const skillFactor=skills.level===null?.82:(.76+.24*skills.level/5);
 // Rank is a *bounded qualitative preference*, not percentage damage.
 const guideFactor=rank<0?.92:Math.max(.91,1.14-rank*.027);
 // Only explicitly known offensive widgets influence the shortlist.
 const widgetFactor=widget!==null&&offensiveWidget.has(hero.name)?
  (1+Math.min(8,widget)*.012):1;
 // Gen-6 archer leader Yang has stronger native rally/bear offensive
 // abilities than Gen-4 Rosa at similar development, even without widgets.
 // Give the well-built 4★ T3+ Yang a *bounded guide preference*; this is
 // NOT an asserted damage multiplier or a substitute for actual skills.
 const yangReady=type==='archer'&&hero.name==='Yang'&&
  (stars>=5||(stars>=4&&(tier||0)>=3));
 const roleFactor=legacyFillers.has(hero.name)?.46:defenseFirst.has(hero.name)?.62:
  yangReady?1.10:1;
 const score=Math.round(100*progress*levelFactor*skillFactor*guideFactor*widgetFactor*roleFactor*10)/10;
 const confidence=stars===null?'limited':skills.confirmed&&level!==null?'higher':'estimated';
 return {
  name:hero.name,type,score,guideRank:rank<0?null:rank+1,
  bearCaution:caution,level,stars,tier:tier||0,widget,
  skill:skills.level,skillCap:skills.cap,assumedSkill:skills.assumed,
  hasConfirmedSkill:skills.confirmed,confidence,
  progression:fractionalStars,
  note:stars===null?'stars-unknown':legacyFillers.has(hero.name)?'legacy-fallback':caution?'defensive':'progression'
 };
}
function recommend(owned,types,priorities){
 const roster=new Map();
 for(const hero of owned||[]){
  if(!hero?.name||!types||!classes.includes(types[hero.name]))continue;
  roster.set(hero.name,{...(roster.get(hero.name)||{}),...hero});
 }
 return classes.map(type=>{
  const choices=[...roster.values()].filter(h=>types[h.name]===type)
   .map(h=>evaluate(h,type,priorities))
   .sort((a,b)=>b.score-a.score||
    (a.guideRank??99)-(b.guideRank??99)||a.name.localeCompare(b.name));
  return {type,choices,best:choices[0]||null};
 });
}
root.NRW_BEAR_HERO_ADVISOR={
 recommend,evaluate,skillState,classes,
 source:'https://ks-atlas.com/tools/atlas-database/bear-rally-heroes',
 supportingGuide:'https://kingshotguides.com/guide/bear-hunt-expert-guide/',
 method:'provisional owned-only role and progression heuristic, not Atlas damage model'
};
})(window);
