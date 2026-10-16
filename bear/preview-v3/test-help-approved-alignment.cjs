'use strict';
/* Final user-approved screenshot field coordinates, first verified on GitHub Pages.
 * Keep existing Troops help untouched: it was already confirmed correct.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const js=fs.readFileSync(process.argv[2]||path.join(__dirname,'help-ui.js'),'utf8');
const win={};
vm.runInNewContext(js,{window:win});
const {GUIDES,CROPS,GUIDE_CROPS}=win.NRW_BEAR_HELP;
assert.equal(Object.keys(GUIDES).length,8);
function marks(key,index){
 const step=GUIDES[key].steps[index];
 const c=GUIDE_CROPS[key]?.[index]||CROPS[step.image];
 const sc=CROPS[step.image];
 assert(c[0]>=sc[0]&&c[1]>=sc[1]&&c[2]<=sc[2]&&c[3]<=sc[3]);
 for(const m of step.marks||[]){
  const [l,t,r,b]=m.rect;
  assert(l>=c[0]&&t>=c[1]&&r<=c[2]&&b<=c[3],
   key+':'+index+' marker "'+m.text+'" was outside focused screenshot');
 }
 return step.marks;
}
function nearMark(key,index,label,expected){
 const m=marks(key,index).find(v=>v.text.includes(label));
 assert(m,'missing target '+key+' '+index+' '+label);
 assert.deepEqual(Array.from(m.rect),expected,label+' must be pinned to verified coordinates');
}
nearMark('heroes',1,'Besessener Held',[270,193,463,438]);
nearMark('heroes',1,'Blumen',[264,443,465,491]);
nearMark('heroes',1,'S5',[410,134,467,184]);
nearMark('capacity',1,'Military',[92,396,988,483]);
nearMark('capacity',1,'Deployment Capacity',[92,577,988,686]);
nearMark('pets',0,'Kampf-Symbol',[88,696,147,752]);
nearMark('pets',0,'Level unter',[163,823,251,872]);
nearMark('pets',0,'Fähigkeit öffnen',[148,755,255,820]);
nearMark('pets',1,'Antler Impact',[96,1184,574,1257]);
nearMark('pets',1,'100.000',[96,1255,895,1390]);
nearMark('valora',1,'Hunter Instinct Level 9',[65,1064,469,1155]);
nearMark('valora',1,'Current Bonus: +24 %',[505,1272,615,1350]);
nearMark('valora',1,'Hunter-Instinct-Symbol',[54,1756,170,1898]);
nearMark('valora',2,'Savage Advantage Level 10',[73,1327,639,1452]);
nearMark('valora',2,'30.000',[74,1453,918,1575]);
nearMark('valora',2,'Fähigkeit unten rechts',[735,1658,931,1886]);
nearMark('valora',2,'Skills',[474,1920,935,2048]);
const capacity=marks('capacity',1);
assert(capacity[1].rect[1]>capacity[0].rect[3],
 'Deployment Capacity highlight must be BELOW Military, not on March Queue');
const star=marks('heroes',1);
assert(star[1].rect[1]>star[0].rect[3],
 'Stars must be below portrait, not in the face or middle of the character');
assert(star[2].rect[3]<star[0].rect[1],
 'S5 generation indicator must be ABOVE the portrait, never mistaken for stars');
const pet=marks('pets',0);
assert(pet.every(m=>m.rect[1]>690),
 'Pet skill annotations should target the same second-row Elk skill, not gray wolf in first row');
assert(GUIDE_CROPS.heroes[1][3]===890,
 'Heroes should be cropped to two complete rows instead of truncated 3rd row');
assert(GUIDE_CROPS.pets[1][1]===1155,
 'Pet detail should begin at the Antler skill explanation, not icon grid');
assert(!js.includes("frame.append(node('span','bear-name-help-marker-number'"),
 'Do not put numbered bubbles over tiny level values');
console.log('PASS production approved screenshot markers: Heroes/Stars/S5, Deployment Capacity, Pet skill + Antler details, Hunter Instinct and Savage Advantage; Troops untouched');
