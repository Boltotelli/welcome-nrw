/* BabyBolto + Main: verified star progress, class-weighted total Bear score.
 * This script intentionally exercises the PUBLIC 37-hero source, not guesses.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={window:{}};
for(const p of ['hero-reference.js','hero-advisor.js','own-baseline.js','combat.js'])
 vm.runInNewContext(fs.readFileSync(__dirname+'/'+p,'utf8'),env,{filename:p});
const w=env.window,R=w.NRW_BEAR_HERO_REFERENCE,A=w.NRW_BEAR_HERO_ADVISOR,
 B=w.NRW_BEAR_OWN_BASELINE,C=w.NRW_BEAR_COMBAT;
const d=JSON.parse(fs.readFileSync(__dirname+'/hero-reference.json','utf8'));
assert.equal(R.validate(d),true);R.accept(d);
const types={LongFei:'infantry','Long Fei':'infantry',Zoe:'infantry',
 Alcar:'infantry',Howard:'infantry',Chenko:'cavalry',Petra:'cavalry',
 Margot:'cavalry',Quinn:'archer',Yang:'archer',Rosa:'archer'};
const hero=(name,stars,tier=0,widget=0,extra={})=>({name,stars,tier,widget,level:80,...extra});
const source=(name,stars,tier)=>R.get(name,stars,tier);
const widget=(name,level)=>B.widgetValue(name,level);
const rank=(heroes,context=A.modelContext(null,C),priorities={})=>
 A.recommend(heroes,types,priorities,source,widget,context);
const mini=[hero('Zoe',0,2),hero('Howard',0,4),
 hero('Chenko',0,1),hero('Quinn',0,3)];
const baby=rank(mini);
assert.ok(baby.every(group=>group.best?.score>0),
 '0-star owned heroes must have real source rows, not missing base stats');
assert.equal(baby[0].choices.length,2);
assert.equal(R.get('Zoe',0,0).sourceRow,1);
assert.equal(R.get('Zoe',0,2).sourceRow,3);
assert.equal(R.get('Quinn',0,3).sourceRow,4);
assert.equal(R.get('Zoe',null,0).bonus,null,'null stars are not 0 stars');
assert.equal(R.get('Zoe',5,1).bonus,null,'invalid full-five-star T1');
const unknown=rank([hero('Zoe',null,null,0)]);
assert.equal(unknown[0].best,null,'unknown stars must not be ranked');
assert.equal(unknown[0].choices[0].score,null);
const noData=rank([hero('Zoe',0,0,0)],undefined);
assert.ok(noData[0].best.score>0);
// Class-specific Expedition ATK must influence only infantry, not all archers.
const battle={values:{
 iAtk:181.5,iLet:276.5,cAtk:169.2,cLet:250.7,aAtk:244.3,aLet:314,
 troopsI:325027,troopsC:325339,troopsA:605476},
 v2:{troopTiers:[{tier:10,tg:4},{tier:10,tg:4},{tier:10,tg:4}]}};
const ctx=A.modelContext(battle,C);
assert.ok(ctx.weights[0]<.06,'infantry fraction is minor on 5/18/77');
const main=rank([hero('Long Fei',5,0,5),hero('Zoe',4,2,3)],ctx);
assert.equal(main[0].best.name,'Zoe','Zoe can win mathematically with squadwide effects');
const l=main[0].choices.find(x=>x.name==='Long Fei');
const z=main[0].choices.find(x=>x.name==='Zoe');
assert.ok(z.score>l.score&&z.score<145&&l.score>120);
assert.equal(l.widgetEffect,null);
assert.equal(z.widgetEffect,null);
assert.equal(z.starPendingReview,false);
assert.equal(A.offensiveEffect({name:'Art of War',effect:'damage_up',
 valuesBySkillLevel:[120,140,160,180,200],conditions:{procChancePercent:25}},5).amount,25,
 '25% proc of 200% normal attack means +25% above baseline');
assert.ok(z.offensiveSkills.some(x=>x.name==='Charisma'));
assert.ok(z.unmodeledSkills.includes('Sundering Wound'));
const uncertain=rank([hero('Zoe',4,2,3,{starPendingReview:true})],ctx);
assert.equal(uncertain[0].best.starPendingReview,true);
assert.equal(uncertain[0].best.confidence,'estimated');
const normal=rank([hero('Yang',4,4),hero('Rosa',4,2)],ctx);
const reversed=rank([hero('Yang',4,4),hero('Rosa',4,2)],ctx,{archer:['Rosa','Yang']});
assert.equal(normal[2].best.name,reversed[2].best.name,'guide order irrelevant');
const yang0=rank([hero('Yang',4,0,0)],ctx)[2].best;
const yang10=rank([hero('Yang',4,0,10)],ctx)[2].best;
assert.ok(yang10.score>yang0.score,'verified offensive widget increases score');
const zoe0=rank([hero('Zoe',4,2,0)],ctx)[0].best;
assert.equal(zoe0.score,z.score,'Zoe defense-only widget does not increase offense');
assert.match(A.method,/expected class-weighted/);
console.log('BEAR HERO: 0-star mini roster, unknown stars, Zoe/Long Fei expected damage and widgets passed.');
