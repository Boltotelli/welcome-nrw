'use strict';
/* OCR regressions for the Kingshot hero overview; no screenshots saved. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const env={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/hero-level.js','utf8'),env,{filename:'hero-level.js'});
const L=env.window.NRW_BEAR_HERO_LEVEL;
for(const [s,n] of [['Lv. 80',80],['Lv80',80],['Level 27',27],['Lv . 80',80],['Lv. 1',1],['Lv. 7',7]]){
 assert.equal(L.parse(s),n,'level label '+s);
}
for(const bad of ['7','80','20','0/20','5★ T2','S6','something 7','Lv. 0','Lv. 81',
 'Lv. 800','Lv. 80 Lv. 7','Hero Power 277']){
 assert.equal(L.parse(bad),null,'not a safe level: '+bad);
}
const rect={x:100,y:200,w:200,h:300};
function word(t,x,y){return {text:t,bbox:{x0:x-8,x1:x+8,y0:y-8,y1:y+8}};}
assert.equal(L.lineInRect([
 word('Lv.',120,430),word('80',180,430),
 word('7',130,485),word('Lv.',285,430),word('2',292,430),
 word('80',130,350)
],rect),'Lv. 80');
const first={name:'Yang',level:null,levelEvidence:[]};
L.record(first,'Lv. 80','first:screen');
assert.equal(first.level,80,'a clearly labelled Lv. 80 remains a suggestion');
assert.equal(first.levelConfidence,'suggested','single pass must remain reviewable');
L.record(first,'7','first:raw');
assert.equal(first.level,80,'bare digit from full-card OCR must not erase good Lv. evidence');
const overlap={name:'Yang',level:null,levelEvidence:[]};
L.record(overlap,'Lv. 80','second:screen');
L.record(overlap,'Lv. 80','second:raw');
assert.equal(overlap.level,80);
L.combine(first,overlap);
assert.equal(first.level,80,'first card receives second screenshot level');
assert.equal(first.name,'Yang','hero identity remains unchanged');
const before=first.levelEvidence.length;
L.combine(first,overlap);
assert.equal(first.levelEvidence.length,before,'same observations cannot vote twice');
const mistaken={level:null,levelEvidence:[]};
L.record(mistaken,'Lv. 7','bad:screen');
L.record(mistaken,'Lv. 80','bad:raw');
assert.equal(mistaken.level,null,'conflicting readings remain unknown');
L.record(mistaken,'Lv. 80','bad:masked');
assert.equal(mistaken.level,null,'two versus one still needs review');
L.record(mistaken,'Lv. 80','next:screen');
assert.equal(mistaken.level,80,'three independent indications confirm a level');
L.record(mistaken,'Lv. 7','next:raw');
assert.equal(mistaken.level,null,'two competing confirmed readings conflict');
assert.equal(L.parseDigits('80'),80,'single small digit crop may read 80');
assert.equal(L.parseDigits('1'),1,'small digit crop may read Lv1');
for(const bad of ['80 7','7/20','0','100','S6','Lv. 80','80x','805']){
 assert.equal(L.parseDigits(bad),null,'digit-only ROI must reject OCR garbage: '+bad);
}
const digitsOnly={level:null,levelEvidence:[]};
L.record(digitsOnly,'80','crop:digits','digits');
assert.equal(digitsOnly.level,80,'focused 80 is retained as a suggestion');
assert.equal(digitsOnly.levelConfidence,'suggested');
L.record(digitsOnly,'Lv. 80','crop:raw');
assert.equal(digitsOnly.levelConfidence,'verified','agreeing digits and prefix confirm the level');
const conflictingDigits={level:null,levelEvidence:[]};
L.record(conflictingDigits,'Lv. 80','orig:screen');
L.record(conflictingDigits,'7','orig:digits','digits');
assert.equal(conflictingDigits.level,null,'contradictory isolated digit crop must not overwrite a level');
const manual={level:64,levelManual:true,levelEvidence:[]};
L.combine(manual,overlap);
assert.equal(manual.level,64,'manual level is never overwritten');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
assert.match(html,/<script src="\.\/hero-level\.js/);
assert.ok(html.indexOf('./hero-level.js')<html.indexOf('./intake-ui.js'));
const ui=fs.readFileSync(__dirname+'/intake-ui.js','utf8');
assert.match(ui,/HERO_LEVEL\?\.combine\(earlier,tile\)/);
assert.match(ui,/readHeroLevelsRaw\(allCards/);
assert.match(ui,/readHeroLevelsMasked\(allCards/);
assert.match(ui,/readHeroLevelDigits\(allCards/,'fallback must run for uncertain cards');
assert.match(ui,/tessedit_char_whitelist:'0123456789'/);
assert.match(ui,/r\.x\+r\.w\*\.29,r\.y\+r\.h\*\.765/,'digits cropped at verified level coordinates');
assert.match(ui,/levelConfidence==='verified'\|\|tile.levelManual/,'tentative suggestions stay open for correction');
assert.doesNotMatch(ui,/line\.match\(\/\\b\(80\|/);
console.log('BEAR HERO LEVEL: strict labels, multi-pass consensus, overlaps, conflicts and manual protection passed.');
