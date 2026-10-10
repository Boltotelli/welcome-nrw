'use strict';
// Pure JS fixture: no network and no player data; deployed JSON separately
// validated against kingshot-data's JSON Schema in Pages build.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{fetch:null}};
vm.runInNewContext(fs.readFileSync(__dirname+'/hero-reference.js','utf8'),context,{filename:'hero-reference.js'});
const R=context.window.NRW_BEAR_HERO_REFERENCE;
const raw=Array.from({length:37},(_,i)=>{
 const name=i===0?'Yang':i===1?'Rosa':'Hero '+i;
 const value=i===0?68.17:i===1?46.71:20;
 const series=Array.from({length:31},(_,n)=>n===28&&i===0?472.18:
  n===30&&i===1?370.30:value+n*3);
 return {name,troopType:'archer',status:'partial-sourced',generation:i===0?6:4,
   source:{stats:'https://kingshotdata.com/heroes/'+name.toLowerCase().replace(/ /g,'-')+'/',
    skillVerification:'primary-checked'},
   starProgression:{rowToDisplayStarTier:'validated-six-steps-per-star',
    expeditionAttackPercent:series},
   expeditionSkills:[
    {name:'Example Offensive 1',effect:'damage_up',metric:'percent',valuesBySkillLevel:[10,20,30,40,50]},
    {name:'Example Offensive 2',effect:'attack_up',metric:'percent',valuesBySkillLevel:[5,10,15,20,25]}]
 };
});
const fixture={schemaVersion:1,releaseStatus:'research-preview',publicDataOnly:true,records:raw};
assert.equal(R.status(),'idle');
assert.equal(R.get('Yang',4,4),null,'not initialized = no guessed values');
assert.equal(R.validate(fixture),true);
assert.equal(R.accept(fixture),37);
const yang=R.get('Yang',4,4);
assert.equal(yang.sourceRow,29);
assert.equal(yang.bonus,472.18,'4★ T4 references 0-based row 28');
assert.equal(R.get('Rosa',5,0).bonus,370.30,'5-star Rosa references final row 30');
assert.equal(R.get('Yang',0,0).bonus,null,'unknown stars never become 0-star source facts');
assert.equal(R.get('Yang',5,1).bonus,null,'invalid full-five-star partial tier');
assert.equal(R.get('Yang',4,6).bonus,null,'sixth partial tier forbidden');
assert.equal(R.get('Invented',5,0),null,'no ghost heroes');
assert.equal(yang.skills.length,2,'skills shown independent of assumed actual level');
assert.equal(yang.skills[0].min,10);
assert.equal(yang.skills[0].max,50);
const bad=structuredClone(fixture);bad.records[0].source.skillVerification='secondary-only';
assert.equal(R.validate(bad),false,'reject unreviewed secondary data');
const bad2=structuredClone(fixture);bad2.records.pop();
assert.equal(R.validate(bad2),false,'37 required for complete source');
const bad3=structuredClone(fixture);bad3.records[0].starProgression.expeditionAttackPercent=[3];
assert.equal(R.validate(bad3),false,'31 source rows required');
const source=fs.readFileSync(__dirname+'/hero-reference.js','utf8');
assert.ok(!source.includes('localStorage'),'public reference does not touch private player profile');
assert.ok(!source.includes('supabase.createClient'),'public source never uses Supabase client');
console.log('BEAR REFERENCE: fail-closed 37-row source validation and Yang/Rosa step lookup passed.');
