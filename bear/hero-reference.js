/* Read-only public Kingshot hero reference. All hero facts live in the
 * separate Boltotelli/kingshot-data repository, never in Supabase or here.
 * The Pages CI downloads one validated, commit-pinned JSON snapshot.
 * This module does NOT turn expedition percentages into guessed Bear damage.
 */
(function(root){
'use strict';
let rows=null,state='idle',pending=null,why='';
const sourceRepo='https://github.com/Boltotelli/kingshot-data';
const sourcePath='https://raw.githubusercontent.com/Boltotelli/kingshot-data/';
const allowedClass=new Set(['infantry','cavalry','archer']);
function validate(x){
 if(!x||x.schemaVersion!==1||x.publicDataOnly!==true||x.releaseStatus!=='research-preview'||
    !Array.isArray(x.records)||x.records.length!==37)return false;
 const names=new Set();
 for(const r of x.records){
  if(!r||typeof r.name!=='string'||names.has(r.name)||!allowedClass.has(r.troopType)||
    r.status!=='partial-sourced'||r.source?.skillVerification!=='primary-checked')return false;
  names.add(r.name);
  const p=r.starProgression;
  if(p?.rowToDisplayStarTier!=='validated-six-steps-per-star'||
     !Array.isArray(p.expeditionAttackPercent)||p.expeditionAttackPercent.length!==31||
     !p.expeditionAttackPercent.every(n=>Number.isFinite(n)&&n>=0)||
     !Array.isArray(r.expeditionSkills)||r.expeditionSkills.length<2||
     r.expeditionSkills.length>3)return false;
  if(r.expeditionSkills.some(s=>!s.name||!Array.isArray(s.valuesBySkillLevel)||
      s.valuesBySkillLevel.length!==5||
      !s.valuesBySkillLevel.every(n=>Number.isFinite(n)&&n>=0)))return false;
 }
 return true;
}
function accept(x){
 if(!validate(x))throw Error('Invalid versioned public hero source');
 rows=new Map(x.records.map(h=>[h.name,h]));
 state='ready';why='';
 return x.records.length;
}
function status(){return state;}
function reason(){return why;}
function get(name,stars,tier){
 const record=rows?.get(name);
 if(!record)return null;
 const n=Number(stars),t=tier===null||tier===undefined?0:Number(tier);
 const ok=Number.isInteger(n)&&n>=1&&n<=5&&Number.isInteger(t)&&t>=0&&t<=5&&
  (n!==5||t===0);
 const step=ok?6*n+t:null,bonus=step!==null?record.starProgression.expeditionAttackPercent[step]:null;
 return {name:record.name,troopType:record.troopType,generation:record.generation,
  bonus:Number.isFinite(bonus)?bonus:null,sourceRow:step===null?null:step+1,
  skills:record.expeditionSkills.map(s=>({name:s.name,effect:s.effect,metric:s.metric,
   min:s.valuesBySkillLevel[0],max:s.valuesBySkillLevel[4],
   valuesBySkillLevel:s.valuesBySkillLevel.slice(),
   additionalEffects:s.additionalEffects||[],conditions:s.conditions||{}})),
  source:record.source.stats,skillVerified:record.source.skillVerification==='primary-checked'};
}
function load(){
 if(state==='ready')return Promise.resolve(rows.size);
 if(pending)return pending;
 if(typeof root.fetch!=='function'){state='error';why='fetch-unavailable';return Promise.resolve(0);}
 state='loading';
 pending=root.fetch('./hero-reference.json',{cache:'force-cache'})
  .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
  .then(accept).catch(e=>{rows=null;state='error';why=String(e?.message||e);return 0;});
 return pending;
}
root.NRW_BEAR_HERO_REFERENCE={load,get,status,reason,validate,accept,sourceRepo,sourcePath,
 version:'hero-reference-v1',description:'Sourced expedition bonuses and normal skills; NOT a Bear damage model'};
})(window);
