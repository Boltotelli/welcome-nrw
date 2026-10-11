/* Regression fixtures transcribed from actual user-provided Kingshot screenshots.
 * The screenshots themselves are not copied to the repository.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const w={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/intake-core.js','utf8'),w);
const C=w.window.NRW_BEAR_INTAKE_CORE;
const troops='Schwadronvorschau\nAlle Trupps 2,2M/2,2M\nSpitzen Infanterie 553.225 Spitzen Kavallerie 555.230\nSpitzen Bogenschütze 1.113.108';
const army=C.parseTroops(troops);
assert.equal(army.troopsI,553225);assert.equal(army.troopsC,555230);assert.equal(army.troopsA,1113108);
assert.equal(C.category(troops),'troops');
const android='Schwadronvorschau\nMarschschlange 6/6\nSpitzen Infanterie 626.621 Spitzen Kavallerie 557.731\nSpitzen Bogenschütze 1.116.468';
const screenshotArmy=C.parseTroops(android);
assert.equal(screenshotArmy.troopsI,626621);
assert.equal(screenshotArmy.troopsC,557731);
assert.equal(screenshotArmy.troopsA,1116468);
assert.equal(C.parseMarchSlots(android),6);
assert.equal(C.parseMarchSlots('Marschschlange 6/6'),6);
assert.equal(C.parseMarchSlots('Marschschlange 9/9'),null);
const stats1='Bonusübersicht\nSchwadron Angriff 274,8%\nSchwadron Verteidigung 264,3%\nSchwadron Tödlichkeit 60,1%\nSchwadron Gesundheit 53,6%\nInfanterie-Angriff 181,5%\nInfanterie-Verteidigung 196,5%\nInfanterie-Gesundheit 287,8%\nInfanterie-Tödlichkeit 276,5%\nKavallerie-Angriff 169,2%\nKavallerie-Verteidigung 167,2%\nKavallerie-Gesundheit 246,0%\nKavallerie-Tödlichkeit 250,7%';
const stats2='Bonusübersicht\nInfanterie-Angriff 181,5%\nInfanterie-Verteidigung 196,5%\nInfanterie-Gesundheit 287,8%\nInfanterie-Tödlichkeit 276,5%\nKavallerie-Angriff 169,2%\nKavallerie-Verteidigung 167,2%\nKavallerie-Gesundheit 246,0%\nKavallerie-Tödlichkeit 250,7%\nBogenschützen-Angriff 244,3%\nBogenschützen-Verteidigung 187,3%\nBogenschützen-Gesundheit 294,5%\nBogenschützen-Tödlichkeit 314,0%';
const both={...C.parseStats(stats1),...C.parseStats(stats2)};
assert.equal(C.category(stats1),'stats');assert.equal(C.category(stats2),'stats');
for(const [key,value] of Object.entries({squadAtk:274.8,squadLet:60.1,iAtk:181.5,iLet:276.5,cAtk:169.2,cLet:250.7,aAtk:244.3,aLet:314}))assert.equal(both[key],value,key);
assert.equal(C.normalizeNumber('1.113.108'),1113108);
assert.equal(C.normalizeNumber('+492,17%'),492.17);
assert.equal(C.normalizeNumber('60,1%'),60.1);
const yang=C.parseHeroDetail('Yang S6\nGesamteigenschaften des Helden\nMaximales Level erreicht!\nExpedition\nBogenschützen-Angriff +492,17%\nBogenschützen-Tödlichkeit +300,70%', ['Yang','Petra','Zoe']);
assert.equal(yang.name,'Yang');assert.equal(yang.level,80);
assert.equal(yang.expeditionStats.aAtk,492.17);assert.equal(yang.expeditionStats.aLet,300.70);
assert.equal('stars' in yang,false,'S6 marks generation, not stars');
assert.equal(C.parseHeroDetail('Z0e S2\nLevel 80\nExpedition',
 ['Yang','Petra','Zoe'])?.name,'Zoe',
 'Z0e OCR glyph variant resolves narrowly to Zoe');
assert.equal(C.parseHeroDetail('Zoe\nLv. 80', ['Zoe'])?.name,'Zoe',
 'short title at the top can identify Zoe');
assert.equal(C.parseHeroDetail('Zone status 80', ['Zoe']),null,
 'do not hallucinate Zoe from other screen text');
assert.deepEqual(Object.keys(C.parseHeroDetail('Zoe Lv. 80', ['Zoe']).expeditionStats),[],
 'absence of visible percentages cannot invent base or gear stats');

// Four labelled hero-detail values can omit troop class inside the
// Expedition panel. Never invent missing/obscured fields.
const details=C.parseHeroStats('Expedition\nAttack +492,17%\nDefense 253,57%\nHealth 219%\nLethality 300,70%','archer');
for(const [key,num] of Object.entries({aAtk:492.17,aDef:253.57,aHp:219,aLet:300.70}))
 assert.equal(details[key],num,key+' correctly read as visible hero %');
const partial=C.parseHeroStats('Expedition\nAttack 492,17%\nHealth unreadable','archer');
assert.equal(partial.aAtk,492.17);
assert.equal(partial.aHp,undefined,'not visible means unknown, not a fabricated base stat');
assert.deepEqual(Object.keys(C.parseHeroStats('Hero Power 12,345\nWidget 5\nSkills +200','archer')),[],
 'power, widgets and skills cannot be mistaken for expedition percentages');
const wrongClass=C.parseHeroStats('Infanterie-Gesundheit 285,70%\nArcher Attack 244,30%','archer');
assert.equal(wrongClass.aHp,undefined,'hero type must not be confused with other class labels');
assert.equal(wrongClass.aAtk,244.30);

// Real 716x1536 screenshot right-column OCR fixtures (from the three
// ACTUAL October 8 hero detail JPEGs, 556..685 x 1030..1290):
// Label wrapping must not change the four EXPEDITION row identities.
// Order in Kingshot is Attack, Defense, Lethality, Health (not UI old
// Attack, Defense, Health, Lethality).
const orderedCases=[
 {name:'Yang',type:'archer',ocr:'‘492,17%\n+492,17%\n-300,70%\n154,42%',want:[492.17,492.17,300.70,154.42]},
 {name:'Petra',type:'cavalry',ocr:'15.095\n253,57%\n253,57%\n-178,00%\n+166,17%',want:[253.57,253.57,178,166.17]},
 {name:'Zoe',type:'infantry',ocr:'19.361\n+188,18%\n+188,18%\n155,40%\n219,00%',want:[188.18,188.18,155.40,219]}
];
for(const {name,type,ocr,want} of orderedCases){
 const got=C.parseHeroOrderedExpeditionRows(ocr,type);
 const prefix={archer:'a',cavalry:'c',infantry:'i'}[type];
 for(const [idx,suffix] of ['Atk','Def','Let','Hp'].entries())
  assert.equal(got[prefix+suffix],want[idx],
   name+' expedition '+suffix+' read from original right-column geometry');
 assert.equal(Object.keys(got).length,4,'exactly four values for '+name);
}
assert.deepEqual(Object.keys(C.parseHeroOrderedExpeditionRows(
 'Attack 492,17%\nDefense 492,17%\nLethality 300,70%','archer')),[],
 'three observations must NOT be shifted into four presumed positions');
assert.deepEqual(Object.keys(C.parseHeroOrderedExpeditionRows(
 '+492,17%\n+492,17%\n+300,70%\n+154,42%\n+999,99%','archer')),[],
 'more than four readings can be the wrong section; reject entire group');
assert.deepEqual(Object.keys(C.parseHeroOrderedExpeditionRows(
 '4.580\n4.476\n45.286\n1.526','cavalry')),[],
 'conquest/base flat numbers are NOT expedition percentage stats');

assert.equal(C.maxSkill(4),5);assert.equal(C.maxSkill(3),4);assert.equal(C.maxSkill(5),5);
const types={Yang:'archer',Rosa:'archer',Petra:'cavalry',Zoe:'infantry'};
const owned=[{name:'Yang',level:80,stars:4,widget:5},{name:'Rosa',level:80,stars:5,widget:3},{name:'Petra',level:80,stars:5},{name:'Zoe',level:80,stars:5}];
const suggestion=C.advise(owned,['Zoe','Petra','Rosa'],types);
assert.equal(suggestion.length,1);assert.equal(suggestion[0].suggestion,'Yang');
assert.equal(suggestion[0].current,'Rosa');assert.equal(suggestion[0].slot,2);
assert.equal(C.advise(owned,['Zoe','Petra','Yang'],types).length,0);
const html=fs.readFileSync(__dirname+'/index.html','utf8');
for(const filename of ['intake-core.js','intake-ui.js','intake-ui.css'])assert.ok(html.includes('./'+filename));

const frSample=C.parseStats('Infanterie-Attaque 181,5%\nCavalerie-Défense 167,2%\nArchers-Létalité 314,0%');
const esSample=C.parseStats('Infantería-Ataque 181,5%\nCaballería-Defensa 167,2%\nArqueros-Letalidad 314,0%');
for(const sample of [frSample,esSample]){
 assert.equal(sample.iAtk,181.5);assert.equal(sample.cDef,167.2);assert.equal(sample.aLet,314);
}
assert.equal(C.category('Aperçu des bonus'),'stats');
assert.equal(C.category('Resumen de bonificaciones'),'stats');
assert.equal(C.category('Héros'),'roster');
assert.equal(C.category('Héroes'),'roster');

console.log('BEAR INTAKE: troop amounts, 2 scrolling stats screenshots, hero detail/max-skill and class-safe advisor passed.');
