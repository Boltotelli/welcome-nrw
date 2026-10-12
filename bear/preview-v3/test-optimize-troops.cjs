/* Joiner ratio is an average KINGSHOT generation baseline, not an
 * optimization of unobservable foreign rally-leader combat stats. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root={window:{},Math,console};root.window.window=root.window;
for(const file of ['formation-core.js','joiner-skills.js','combat.js']){
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),root,{filename:file});
}
const f=root.window.NRW_BEAR_FORMATION,c=root.window.NRW_BEAR_COMBAT,
 j=root.window.NRW_BEAR_JOINER_SKILLS;
const catalog={heroes:[...Array.from({length:16},(_,i)=>({name:'old'+i})),
 ...Array.from({length:18},(_,i)=>({name:'new'+i}))]};
const age=names=>f.joinerBaseline({v2:{scannedOwnedHeroes:names}},catalog).proportions;
assert.equal(age(['old1']).join('/'),'10/30/60');
assert.equal(age(['new0']).join('/'),'10/20/70');
assert.equal(age(['new3']).join('/'),'10/10/80');
assert.equal(age(['new6']).join('/'),'1/10/89');
assert.equal(age(['new15']).join('/'),'1/10/89');
const targets=Array(7).fill(180000),base=age(['new6']);
const allocate=(stock,t=targets)=>{
 const ratios=t.map(x=>f.ratioForTarget(x,base));
 const rows=f.allocateStock(t,stock,ratios[0],ratios.slice(1));
 for(const [i,r] of rows.entries()){
  assert(r.every(v=>Number.isSafeInteger(v)&&v>=0),'invalid troop count');
  assert(r.reduce((a,b)=>a+b,0)<=t[i],'over-cap');
 }
 for(let k=0;k<3;k++)assert(rows.reduce((n,r)=>n+r[k],0)<=stock[k],'stock reused');
 return rows;
};
const full=allocate([400000,400000,1400000]);
assert.equal(f.integerPercentages(full[1]).join('/'),'3/10/87',
 'Gen4+ baseline must include the 5000-infantry floor');
const scarce=allocate([650000,650000,450000]);
const joinsArchers=scarce.slice(1).reduce((n,row)=>n+row[2],0);
assert(joinsArchers>=scarce[0][2],'Archer scarcity must favor joins');
assert(scarce.slice(1).some(r=>f.integerPercentages(r)[2]!==87),
 'Not enough archers to keep baseline on all joins');
allocate([700000,700000,0],Array(3).fill(180000));
allocate([100000,150000,800000],[180000]);
const model={v2:{troopGroups:[{type:'infantry',tier:10,tg:5,count:10000},
 {type:'infantry',tier:9,tg:2,count:8000},
 {type:'cavalry',tier:10,tg:5,count:11000},
 {type:'archer',tier:10,tg:8,count:90000}]},
 values:{troopsI:999999,troopsC:999999,troopsA:999999}};
assert.equal(Array.from(f.availableStock(model)).join('/'),'18000/11000/90000');
const reference=JSON.parse(fs.readFileSync(process.argv[2]||'./bear/hero-reference.json','utf8'));
const dict=new Map(reference.records.map(x=>[x.name,x]));
const checkJoin=(heroes,expected)=>{
 const effect=j.process(heroes,n=>dict.get(n));
 assert(effect.ready,'Reference must support first skill of all scenario heroes');
 assert.equal(effect.multiplier,expected,'wrong 101/102 stacking '+heroes.join(', '));
 return effect;
};
checkJoin([],1);checkJoin(['Chenko','Chenko'],1.5);
checkJoin(['Chenko','Chenko','Chenko','Chenko'],2);
checkJoin(['Chenko','Chenko','Amane','Amane'],2.25);
checkJoin(['Chenko','Yeonwoo','Amane','Margot'],2.25);
checkJoin(['Amadeus','Yeonwoo','Margot','Amane'],2.25);
assert(2.25>2&&2>1.5,'4 Chenko > 2 Chenko but < 2+2');
const five=checkJoin(['Chenko','Chenko','Amane','Amane','Margot'],2.25);
assert.equal(five.active.length,4,'Never count five joiner skills');
assert.equal(j.process(['Jabel'],n=>dict.get(n)).ready,false,
 'Unknown/random skills must NOT be silently modeled as known DamageUp effect_op');
const damage=fs.readFileSync(path.join(__dirname,'damage-skills.js'),'utf8');
assert(damage.includes('pointFactor*joinerMultiplier'),
 'Apply joiner multiplier to final index, not leader raw ATK/LET');
vm.runInNewContext(damage,root,{filename:'damage-skills.js'});
const dmg=root.window.NRW_BEAR_SKILL_DAMAGE,prepared={
 ready:true,modifiers:{attack:0,lethality:0,classAttack:[0,0,0],classDamage:[1,1,1],
 lowClassDamage:[1,1,1],lowDamage:1,damage:1},valoraPoints:0,unmodeled:[]
};
const dummyCombat={breakdown:()=>({types:[
 {damageTenRounds:1000},{damageTenRounds:1000},{damageTenRounds:1000}
]})};
const stats={iAtk:600,iLet:600,cAtk:600,cLet:600,aAtk:600,aLet:600};
const result=m=>dmg.evaluate(prepared,[5000,10000,50000],[],stats,dummyCombat,m);
const plain=result(1).estimatedIndex;
assert.equal(result(1.5).estimatedIndex/ plain,1.5);
assert.equal(result(2).estimatedIndex/ plain,2);
assert.equal(result(2.25).estimatedIndex/ plain,2.25);
assert.equal(result(0.5).ready,false,'Below 1 modifier is not an eligible Lv5 scenario');

const flow=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
assert(flow.includes('stack.process(sc.heroes,refSkill)'),'Scenarios must reference actual hero skills');
assert(flow.includes('const plan=alloc.plan(model,C,combat,window.NRW_BEAR_CAPACITY)'),
 'Same troop plan for formation and damage output');
console.log('PASS generation baseline, 5000 infantry, shared inventory, Joiner-first Archer scarcity, 4-slot effect_op stacking (1.5, 2, 2.25).');
