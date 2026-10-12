/* Every Expedition skill is considered, with explicit unsupported mechanics.
 * Scope and chance regression across all 37 Kingshot hero records.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=JSON.parse(fs.readFileSync(process.argv[2]||'./bear/hero-reference.json','utf8'));
const ctx={window:{},console,Math};ctx.window.window=ctx.window;
for(const file of ['skill-effects.js','hero-advisor.js','../own-baseline.js','combat.js']){
 const p=path.resolve(__dirname,file);
 vm.runInNewContext(fs.readFileSync(p,'utf8'),ctx,{filename:p});
}
const W=ctx.window,e=W.NRW_BEAR_SKILL_EFFECTS,a=W.NRW_BEAR_HERO_ADVISOR,b=W.NRW_BEAR_OWN_BASELINE;
const R=new Map(source.records.map(h=>[h.name,h]));
const get=(n,stars,tier)=>{const h=R.get(n);return h?{name:n,bonus:h.starProgression.expeditionAttackPercent[stars*6+tier],skills:h.expeditionSkills}:null;};
assert.equal(R.size,37,'Reference must contain the current 37 heroes');
let verified=0;
for(const [name,rec] of R){
 const review=e.assess({name,skillLevel:5},{skills:rec.expeditionSkills});
 assert.equal(review.skillCount,rec.expeditionSkills.length,'Every skill: '+name);
 assert.equal(review.sourceEffects,rec.expeditionSkills.reduce((n,s)=>n+1+(s.additionalEffects||[]).length,0),'Secondary effects: '+name);
 // Each source effect must explicitly produce an applied, irrelevant, or
 // uncertain category. Multi-class effects legitimately produce two entries.
 for(const row of review.perSkill)assert.equal(row.sourceEffects===0,false,'Missing skill source '+name);
 for(const skill of rec.expeditionSkills){
  const row=review.perSkill.find(x=>x.skill===skill.name);
  assert(row,'Unclassified skill: '+name+' / '+skill.name);
  assert(row.modeled.length+row.irrelevant.length+row.uncertain.length>0,
   'No treatment of '+name+' / '+skill.name);
 }
 const h={name,level:80,stars:4,tier:0,widget:2},rank=a.evaluate(h,rec.troopType,null,get,b.widgetValue,a.modelContext(null,W.NRW_BEAR_COMBAT));
 assert(rank.skillCoverage?.total===rec.expeditionSkills.length,'Ranking omitted source for '+name);
 assert(Number.isFinite(rank.score)&&rank.score>=0,'Invalid score '+name);
 assert(rank.optimisticScore>=rank.conservativeScore,'Conservative bound error '+name);
 verified++;
}
const alcar=a.evaluate({name:'Alcar',level:80,stars:4,tier:0,widget:2},'infantry',null,get,b.widgetValue,a.modelContext(null,W.NRW_BEAR_COMBAT));
const zoe=a.evaluate({name:'Zoe',level:80,stars:4,tier:2,widget:3},'infantry',null,get,b.widgetValue,a.modelContext(null,W.NRW_BEAR_COMBAT));
const by=(hero,partial)=>hero.offensiveSkills.filter(x=>x.name.includes(partial));
assert(by(alcar,'Carpe Diem').some(x=>x.kind==='class-damage'&&x.type===0&&x.amount===60),'Carpe Diem infantry only');
assert(!by(alcar,'Carpe Diem').some(x=>x.kind==='damage'&&x.amount===60),'No +60% whole squad');
assert(by(alcar,'Praetorian Will').some(x=>x.kind==='class-damage'&&x.type===1&&x.amount===10),'Secondary cavalry');
assert(by(alcar,'Praetorian Will').some(x=>x.kind==='class-damage'&&x.type===2&&x.amount===10),'Secondary archer');
assert(by(alcar,'Carpe Diem / enemy_damage_taken_up').some(x=>x.amount===25&&x.uncertain),'One-turn debuff marked uncertain');
assert(alcar.score<zoe.score&&alcar.optimisticScore>zoe.score,
 'Must not assert unconditional Alcar / Zoe ranking with unverified target uptime');
const wee=a.evaluate({name:'Wee & Woo',level:80,stars:4,tier:0,widget:2},'archer',null,get,b.widgetValue,a.modelContext(null,W.NRW_BEAR_COMBAT));
assert(wee.offensiveSkills.some(x=>x.kind==='lethality'&&x.amount===10),'Wee/Woo secondary lethality included');
assert(wee.irrelevantSkills.some(x=>x.reason==='enemy-troop-type-not-bear'),'Enemy troop-specific bonus excluded');
const thrud=a.evaluate({name:'Thrud',level:80,stars:4,tier:0,widget:2},'cavalry',null,get,b.widgetValue,a.modelContext(null,W.NRW_BEAR_COMBAT));
assert(by(thrud,'Battle Hunger').some(x=>x.kind==='class-damage'&&x.type===0),'Thrud infantry');
assert(by(thrud,'Battle Hunger').some(x=>x.kind==='class-damage'&&x.type===2),'Thrud archer');
assert(!by(thrud,'Battle Hunger').some(x=>x.kind==='damage'),'Thrud must not apply entire squad');
const sophia=a.evaluate({name:'Sophia',level:80,stars:4,tier:0,widget:2},'cavalry',null,get,b.widgetValue,a.modelContext(null,W.NRW_BEAR_COMBAT));
assert(sophia.uncertainSkills.some(x=>x.effect==='squad_bonus_damage_vs_terrified'),'Terror mechanics remain unverified');
console.log('PASS '+verified+' heroes / '+source.records.reduce((n,r)=>n+r.expeditionSkills.length,0)+' skills: class scopes, procs, secondaries, missing-effects audit and unknown Bear conditions.');
console.log('Alcar conservative='+alcar.score+', possible upper='+alcar.optimisticScore+', Zoe='+zoe.score+' (relative indices; not real Bear points).');
