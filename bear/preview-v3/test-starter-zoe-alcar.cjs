/* Bear V3 role-specific skill scope regression. Run after Pages reference JSON exists.
 * No hero gets a forced ranking; comparison depends on Bear assumptions.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const p=process.argv[2]||'./bear/hero-reference.json';
const catalog=JSON.parse(fs.readFileSync(p,'utf8'));
const context={window:{},console,Math};context.window.window=context.window;
for(const relative of ['hero-advisor.js','../own-baseline.js','combat.js']){
 const file=path.resolve(__dirname,relative);
 vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const w=context.window;
const byName=new Map(catalog.records.map(h=>[h.name,h]));
const get=(n,stars,tier)=>{
 const x=byName.get(n);return x?{bonus:x.starProgression.expeditionAttackPercent[stars*6+tier],skills:x.expeditionSkills}:null;
};
const a=w.NRW_BEAR_HERO_ADVISOR,b=w.NRW_BEAR_OWN_BASELINE;
const ctx=a.modelContext(null,w.NRW_BEAR_COMBAT);
const alcar=a.evaluate({name:'Alcar',stars:4,tier:0,widget:2,level:80},'infantry',null,get,b.widgetValue,ctx);
const zoe=a.evaluate({name:'Zoe',stars:4,tier:2,widget:3,level:80},'infantry',null,get,b.widgetValue,ctx);
const effect=(r,name,kind,type,amount)=>r.offensiveSkills.some(x=>x.name===name&&x.kind===kind&&(type===null||x.type===type)&&x.amount===amount);
assert(effect(alcar,'Carpe Diem','class-damage',0,60),'Carpe Diem primary is only infantry +60%');
assert(!effect(alcar,'Carpe Diem','damage',null,60),'Do not give entire squad +60%');
assert(effect(alcar,'Praetorian Will (secondary)','class-damage',1,10));
assert(effect(alcar,'Praetorian Will (secondary)','class-damage',2,10));
assert(effect(alcar,'Carpe Diem (target debuff)','damage',null,25),'Target debuff is explicitly separate');
assert(alcar.includesUnverifiedBearUptime,'One-turn debuff applicability unverified');
assert(alcar.conservativeScore<zoe.score&&alcar.score>zoe.score,
 'This comparison must expose sensitivity, never hardcode one hero as always better');
assert(zoe.offensiveSkills.some(x=>x.name==='Infinite Arsenal'&&x.expected===true));
assert.equal(zoe.widgetEffect,null);assert.equal(alcar.widgetEffect,null);
console.log('PASS Alcar/Zoe 4-star Bear scope: Alcar model='+alcar.score+
 ' conservative='+alcar.conservativeScore+' Zoe='+zoe.score);
