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
assert.equal(first.level,null,'one full-screen guess is not enough');
L.record(first,'7','first:raw');
assert.equal(first.level,null,'bare digit from focus crop is not a level');
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
assert.doesNotMatch(ui,/line\.match\(\/\\b\(80\|/);
console.log('BEAR HERO LEVEL: strict labels, multi-pass consensus, overlaps, conflicts and manual protection passed.');
