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

const digitUnverified={level:null,levelEvidence:[]};
L.record(digitUnverified,'19','bad:digits','digits');
assert.equal(digitUnverified.level,null,'isolated numeric-only OCR cannot assign an unverified Level');
L.record(digitUnverified,'Lv. 1','bad:screen');
assert.equal(digitUnverified.level,1,'explicit labeled Lv 1 outranks unrelated digit OCR');

const masks={
 Jabel:{level:1,b64:'AAAAAAD+AAAAAAP8AAAAAB/wAAAACf+AAAAAH/4AAAAAH/gAAAAAP+AAAAAAPwAAAMAAPAAAD4AAOAAAPwAAAAAAPgAAAAAAHAAAAAAAOAAAAAAAcAAAAAAA4AAAAAABwAAAAAADgAAAAAAHAAAAAAAOAAAAAgAcAAAADgA4AAAADABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'},
 Gordon:{level:80,b64:'AB/////+AB/////8AD/////4AD/////wAB/////gAA/////AAAB+Af+AAAAQAP8AAAAAAP4AA/gH4PwAD/gf4PgAH/h/4PAAOHDhwAAAcOGBwAAA48cDgAAB/w4HAAAD/hwOAAAHPjgcAAAcHHA4AAA4PGBwAABweOHAAAD/4f+ADAD/wf4AAAD+AfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'},
 Yang:{level:80,b64:'AAAAAAEAAAAAAAAEAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAEAAAAAAAAAAHAAwAAAA/wP4AAAD/g/4AAAPvh/4AAAeHHh4AAA8OODwAAA44cDgAAB/w4HAAAD/hwOAAAPHjgcAAAcHHA4AAA4PODwAAB4eeHgBAD/4f+AHAH/wf4AEAD/AfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'},
 Purple80:{level:80,b64:'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwB8AAAA/4P+AAAD/wf8AAAHjh48AAAOHDg4AAAeOHBwAAA/8ODwAAB/4cHgAAD/w4PAAAPDxweAAAeDjg4AAA8HHBwAAB8ePvgBgB/4P+ADAB/wP4AAAA8AHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'},
 Golden80:{level:80,b64:'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgB4AAAB/wP8AAAD/w/8AAAPnh54AAAePHh4AAA8OODwAAA94cDgAAB/w4HAAAD/hwOAAAOHjgcAAAcHHA4AAA4PPDwAAB4cPPADgD/4f+AHAD/gf4AAAD+AfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'},
 Archer80:{level:80,b64:'AAAAAAAAAAAAAAAAAAAAADAAAAAAADgAAAAAADgQAAAAAHggAAAAAPggAAAAAAAAAAAAAAAAAIAAAAAAD+AfgAAAP+B/gAAA+8HvgAABw4eHAAADgw4OAAADjhwMAAAH/DgcAAAP+HA4AAA4cOBgAABwccDAAADg44OAAAHBx4cAEAP/h/4AYAf+B/gAQAP4B+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'}
};
function decodeMask(b64){
 const bin=Buffer.from(b64,'base64'),mask=new Uint8Array(47*29);
 for(let i=0;i<mask.length;i++)mask[i]=((bin[i>>3]>>(7-(i&7)))&1);
 return mask;
}
for(const [name,{level,b64}] of Object.entries(masks)){
 assert.equal(L.classifyMask(decodeMask(b64)),level,
  'real Kingshot digit-shape sample '+name+' must be recognized correctly');
}
assert.equal(L.classifyMask(new Uint8Array(47*29)),null,'blank is not a level');
assert.equal(L.classifyMask(new Uint8Array(47*29).fill(1)),null,'filled overlay is not a level');
for(const [badOcr,actual] of [['Lv. 19',1],['Lv. 20',80],['',1]]){
 const tile={level:null,levelEvidence:[]};
 L.record(tile,badOcr,'screenshot:raw');
 L.record(tile,actual,'screenshot:glyph','visual');
 assert.equal(tile.level,actual,'Kingshot glyph shape protects against bad OCR: '+badOcr);
 assert.equal(tile.levelConfidence,'suggested','conflicting OCR is never marked verified');
}
const agrees={level:null,levelEvidence:[]};
L.record(agrees,80,'confirmed:glyph','visual');
L.record(agrees,'Lv. 80','confirmed:screen');
assert.equal(agrees.level,80);
assert.equal(agrees.levelConfidence,'verified','independent visual + OCR match confirms a level');
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
assert.match(ui,/HERO_LEVEL\?\.visual\(canvas,rect\)/,
 'visual glyph reading must operate on original tile geometry');
assert.doesNotMatch(ui,/readHeroLevelDigits\(/,'unreliable numeric-only OCR removed');
assert.match(ui,/levelConfidence==='verified'\|\|tile.levelManual/,'tentative suggestions stay open for correction');
assert.doesNotMatch(ui,/line\.match\(\/\\b\(80\|/);
console.log('BEAR HERO LEVEL: actual Lv1/Lv80 glyphs, the 19/20 false reads, overlaps, OCR fallback and manual protection passed.');
