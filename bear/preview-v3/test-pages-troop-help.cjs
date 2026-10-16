'use strict';
// Exclusively GitHub Pages preview regression. Vercel/main must remain untouched.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const file=process.argv[2]||path.join(__dirname,'help-ui.js');
const source=fs.readFileSync(file,'utf8');
const w={};
vm.runInNewContext(source,{window:w});
const app=w.NRW_BEAR_HELP;
assert(app&&app.GUIDES&&app.GUIDE_CROPS,'Pages preview should expose help metadata');
assert(!source.includes("frame.append(node('span','bear-name-help-marker-number'"),
 'No numbered overlay may hide miniature Troops T and TG badges');
assert(source.includes("frame.style.background='transparent'"),'Photo overlay must be see-through');
const stages=app.GUIDES.troops.steps;
assert.equal(stages.length,3,'Keep approved 3-step Troops guide');
assert.deepEqual(Array.from(app.GUIDE_CROPS.troops[0]),[0,0,680,350],
 'First city step must be tightly cropped: no full portrait screenshot scrolling');
assert.deepEqual(Array.from(app.GUIDE_CROPS.troops[2]),[0,0,885,765],
 'Troop preview must show infantry, cavalry AND archers');
const correct={
 '„All“ – alle Truppen':[26,106,283,205],
 'Typ: Apex Infantry':[207,490,411,525],
 'Anzahl: 637.997':[207,526,347,568],
 'T-Level: X = T10':[125,540,178,581],
 'TG-Level: goldene 6 = TG6':[149,461,205,510]
};
assert.equal(stages[2].marks.length,5);
for(const mark of stages[2].marks){
 assert(correct[mark.text],'Unexpected Troops marker '+mark.text);
 assert.deepEqual(Array.from(mark.rect),correct[mark.text],'Unverified original-pixel coordinates: '+mark.text);
 const [x1,y1,x2,y2]=mark.rect,[cx1,cy1,cx2,cy2]=app.GUIDE_CROPS.troops[2];
 assert(x1>=cx1&&y1>=cy1&&x2<=cx2&&y2<=cy2,'Highlight must be visible in compact crop');
}
assert(stages[2].text.includes('römische Zahl'));
assert(stages[2].text.includes('goldene Zahl'));
assert(app.GUIDES.march.steps.some(step=>step.text.includes('7 Märsche')));
console.log('PASS GitHub Pages only: 3 guided steps, compact first image, unobscured exactly targeted Infantry/T/TG/quantity outlines and all 3 troop types visible');
