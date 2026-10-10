'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const dir=__dirname;
const core=fs.readFileSync(dir+'/buff-intake-core.js','utf8');
const ui=fs.readFileSync(dir+'/buff-import.js','utf8');
const v2=fs.readFileSync(dir+'/v2.js','utf8');
const wizard=fs.readFileSync(dir+'/wizard.js','utf8');
const html=fs.readFileSync(dir+'/index.html','utf8');
for(const [n,s] of [['buff-core',core],['buff-ui',ui],['v2',v2],['wizard',wizard]]){
 new vm.Script(s,{filename:n+'.js'});
}
const context={window:{}};
vm.runInNewContext(core,context,{filename:'buff-intake-core.js'});
const C=context.window.NRW_BEAR_BUFF_CORE;
assert.equal(C.petSlots.length,5,'only five fully visible Bear-relevant skill cards; no guesses from hidden fourth row');
assert.deepEqual(Array.from(C.petSlots.map(s=>s.name)),[
 'Moose','Giant Rhino','Mighty Bison','Great Moose','Black Panther'
],'normalized in-game fixed-order pet skill slots');
assert.deepEqual(Array.from(C.valoraSkillMax),[10,5,5,10],'four separate Valora skill maxima');
for(const sample of [['Lv. 4',7,4],['Lv.5',10,5],['Lv. 6',10,6],
 ['Lv.7',10,7],['Lv. 10',10,10],['Level 9',10,9],['11:19:53',10,null],
 ['MAX',10,null],['Lv. 80',10,null],['',10,null]]){
 assert.equal(C.readSkillLevel(sample[0],sample[1]),sample[2],sample[0]);
}
assert.ok(C.petRect(C.petSlots[0]).y>C.petRect({row:0,column:0}).y);
assert.equal(C.valoraRect(0).y,C.valoraRect(3).y);
const valBadge=C.valoraBadgeRect(C.valoraRect(0));
assert.ok(valBadge.x>C.valoraRect(0).x&&valBadge.y>C.valoraRect(0).y,
 'Valora OCR must read centered lower skill-rank badge');
const square=C.valoraPreviewRect(C.valoraRect(0),955/2048);
assert.ok(Math.abs(square.w*955-square.h*2048)<.0001,
 'Valora skill preview must have square pixel proportions');
assert.ok(square.x>0&&square.x+square.w<1&&square.y>0&&square.y+square.h<1,
 'Valora square preview must stay inside the screenshot');
assert.ok(ui.includes("C.valoraBadgeRect(slot.rect)")&&ui.includes("C.valoraPreviewRect(rect,canvas.width/canvas.height)"),
 'Valora uses independent OCR and square preview geometry');
assert.ok(ui.includes("paddedBadge(first)")&&ui.includes("tessedit_pageseg_mode:'8'"),
 'small on-icon rank captions have padded OCR and numeric fallback');
assert.ok(ui.includes("tessedit_pageseg_mode:'3'"),
 'shared OCR must restore ordinary page segmentation after buff import');
const petBadge=C.petBadgeRect(C.petRect(C.petSlots[0]));
assert.ok(petBadge.x>C.petRect(C.petSlots[0]).x&&petBadge.y>C.petRect(C.petSlots[0]).y,
 'pet OCR targets the level badge at the bottom right');
assert.ok(petBadge.x+petBadge.w<=C.petRect(C.petSlots[0]).x+C.petRect(C.petSlots[0]).w+1e-9,
 'pet badge must stay within the original tile');
for(const text of ['Lv.4','Lv 4','L v 4','Ly.4','LV:4','Lvl 4']){
 assert.equal(C.readSkillLevel(text,7),4,'OCR variant '+text);
}
assert.equal(C.readSkillLevel('Lv.5 / Lv.6',10),null,'contradictory OCR must not be accepted');
assert.equal(C.readSkillLevel('11:19:53',10),null,'cooldown is never a skill');
assert.equal(C.readSkillLevel('Skill 4, cooldown 00:07:12',10),null,'artwork/clock digits are not a skill');
assert.match(ui,/roi\.width=Math\.round\(w\*scale\);roi\.height=Math\.round\(h\*scale\)/,
 'cropped preview must preserve the original pixel aspect ratio');
assert.ok(ui.includes("C.petBadgeRect(slot.rect)")&&ui.includes("contrastBadge(first)"),
 'pet rank OCR must read the badge with a focused contrast retry');
assert.ok(ui.includes("recognizeSlots(canvas,slots,'pet',"),
 'pet import must use pet-specific level recognition');

const catContext={window:{}};
vm.runInNewContext(fs.readFileSync(dir+'/catalog.js','utf8'),catContext);
const cats=Array.from(catContext.window.NRW_BEAR_CATALOG.pets,
 p=>JSON.parse(JSON.stringify(p)));
assert.ok(C.checkPet('Moose',4,cats));
assert.ok(C.checkPet('Black Panther',7,cats));
assert.equal(C.checkPet('Moose',9,cats),false,'pet capability cap enforced');
assert.equal(C.checkPet('Unknown',3,cats),false,'never invent pet identity');
assert.ok(v2.includes('petSkillRanks'),'separate level field not repurposed');
assert.ok(v2.includes('saved.petSkillRanks?.[p.name]'),'new direct skill rank is rendered in pet buff effects');
assert.ok(v2.includes('refreshBuffs:'),'legacy pet and master controls refresh after confirmation');
assert.ok(ui.includes('NRW_BEAR_GET_OCR'),'OCR worker reuse is required');
assert.match(ui,/if\(draftPet\)\{[\s\S]*?ext\.petSkillRanks\[pet\.name\]=Number\(pet\.level\)/,
 'save reviewed skill rank not pet training level');
assert.match(ui,/ext\.valora\[i\]=Number\(draftValora\[i\]\.level\)/,
 'four confirmed Valora skill ranks use existing model');
assert.match(ui,/ext\.valoraTalent=Number\(tv\)/,
 'Hunter Instinct is a separately manual talent level');
assert.ok(ui.includes("petPhoto=null")&&ui.includes('No buffs auto-added.')||
 ui.includes('Keine Buffs automatisch addiert.'),'do not silently add buffs to combat stats');
assert.ok(ui.includes('if(draftPet&&new Set('),
 'prevent repeated guessed pet names in screenshot review');
assert.ok(!ui.includes("ext.petLevels[pet.name]=Number(pet.level)"),
 'do not falsely infer pet total level from Lv. on skill cards');
assert.ok(!ui.includes("B.model().values.master=")&&!ui.includes("B.model().values.pet="),
 'do not add mastered buffs into capacity unasked');
assert.ok(wizard.includes("NRW_BEAR_BUFF_IMPORT?.mount(buffHost,B)"),'integrated in step 8');
assert.ok(wizard.includes("labels=['id','troops','stats','gear','heroes','hero-picks','hero-details','missing','result'];"),
 'existing nine-step results behavior stays intact');
assert.ok(html.indexOf('buff-intake-core.js')<html.indexOf('buff-import.js'));
assert.ok(html.indexOf('buff-import.js')<html.indexOf('wizard.js'));
for(const asset of ['buff-import.css','buff-intake-core.js','buff-import.js'])
 assert.ok(html.includes('./'+asset),'missing '+asset);
console.log('PET/VALORA: exact skill UI geometry, caps, cooldown rejection, manual talent, persistence and no double counting verified.');
