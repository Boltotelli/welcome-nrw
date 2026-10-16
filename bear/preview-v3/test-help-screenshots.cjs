'use strict';
/* Validate original supplied screenshot pack and approved in-game field annotations. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const dir=__dirname;
const read=n=>fs.readFileSync(path.join(dir,n),'utf8');
const context={window:{}};
vm.runInNewContext(read('help-ui.js'),context,{filename:'help-ui.js'});
vm.runInNewContext(read('help-image-pack.js'),context,{filename:'help-image-pack.js'});
const api=context.window.NRW_BEAR_HELP;
const images=context.window.NRW_BEAR_HELP_IMAGES;
const expected=['city','governor','troops','bonus','combat','heroes','widget',
 'expedition','pets','petDetail','valoraBuilding','valoraHunter','valoraSavage'];
assert.deepEqual(Object.keys(images).sort(),expected.sort());
assert.equal(Object.keys(api.GUIDES).length,8);
assert.deepEqual(Object.keys(api.GUIDES).sort(),
 ['troops','march','capacity','combatStats','heroes','expedition','pets','valora'].sort());
let references=0,markers=0,total=0;
for(const [name,data] of Object.entries(images)){
 assert(data.startsWith('data:image/webp;base64,'),name);
 const raw=Buffer.from(data.slice('data:image/webp;base64,'.length),'base64');
 assert.equal(raw.toString('ascii',0,4),'RIFF');
 assert.equal(raw.toString('ascii',8,12),'WEBP');
 assert(raw.length>2000&&raw.length<150000,name+' unexpected image length '+raw.length);
 total+=raw.length;
}
assert(total<750000,'Screenshots must remain compact enough for mobile help');
for(const [key,guide] of Object.entries(api.GUIDES)){
 assert(guide.title.length>=8);
 assert(guide.steps.length>=1&&guide.steps.length<=4);
 for(const [index,step] of guide.steps.entries()){
  assert(step.text.length>60,key+':'+index+' must explain its screenshot');
  if(!step.image)continue;
  assert(images[step.image],key+':'+index+' references image without an uploaded original');
  const c=api.CROPS[step.image];assert(c);
  const focus=api.GUIDE_CROPS[key]?.[index]||c;
  assert(focus[0]>=c[0]&&focus[1]>=c[1]&&focus[2]<=c[2]&&focus[3]<=c[3],
   key+':'+index+' focused crop must stay within original source image');
  assert(focus[2]>focus[0]&&focus[3]>focus[1]);
  assert((focus[2]-focus[0])/(focus[3]-focus[1])>0.4,
   key+':'+index+' absurdly narrow screenshot');

  references++;
  for(const mark of step.marks||[]){
   const [x1,y1,x2,y2]=mark.rect;
   assert(x1>=c[0]&&x2<=c[2]&&y1>=c[1]&&y2<=c[3]&&x1<x2&&y1<y2,
     'Invalid field marker '+key+':'+index+' '+step.image+' '+mark.text);
   assert(['gold','green','blue','orange'].includes(mark.color));
   assert(mark.rect[0]>=focus[0]&&mark.rect[1]>=focus[1]&&
    mark.rect[2]<=focus[2]&&mark.rect[3]<=focus[3],
    'Highlight clipped by focused image: '+key+':'+index+' '+mark.text);
   markers++;
  }
 }
}
assert(references>=17,'Most guide steps must use actual screenshot evidence');
assert(api.GUIDE_CROPS.troops[0][3]===350,
 'First troop screenshot must show only the top of city; no 2048px scrolling');
const troop=api.GUIDES.troops.steps[2];
assert.deepEqual(Array.from(troop.marks.find(m=>m.text.startsWith('T-Level')).rect),
 [125,540,178,581],'T-Level marker must frame the Roman X below troop icon');
assert.deepEqual(Array.from(troop.marks.find(m=>m.text.startsWith('TG-Level')).rect),
 [149,461,205,510],'TG marker must frame golden troop generation number');
assert(api.GUIDE_CROPS.troops[2][3]===765,
 'Troop preview should include all three troop types in one compact image');
assert(markers>=25,'Field-specific marks expected on supplied images');
assert(!api.GUIDES.march.steps.some(x=>x.image),'March explanation intentionally needs no screenshot');
assert(api.GUIDES.capacity.steps.some(x=>x.text.includes('March Queue')));
assert(api.GUIDES.combatStats.steps.some(x=>x.text.includes('Defense und Health')));
assert(api.GUIDES.heroes.steps.some(x=>x.text.includes('S5')));
assert(api.GUIDES.expedition.steps.some(x=>x.text.includes('NACH dem Umziehen')));
assert(api.GUIDES.pets.steps.some(x=>x.text.includes('NICHT deine persönliche Marschkapazität')));
assert(api.GUIDES.valora.steps.some(x=>x.text.includes('UNABHÄNGIGE Fähigkeitslevel')));
console.log('PASS '+Object.keys(api.GUIDES).length+' help topics, '+expected.length+' supplied Kingshot WEBP originals ('+total+' bytes), '+references+' screenshot steps and '+markers+' in-bounds highlight markers');
