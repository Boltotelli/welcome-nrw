/* Bear screenshot importer smoke checks. No fixture photos or API credentials. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/charm-shapes.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync(__dirname+'/charm-references.js','utf8'),ctx);
const shapes=ctx.window.NRW_BEAR_CHARM_SHAPES;
const refs=ctx.window.NRW_BEAR_CHARM_REFERENCES;
assert.equal(refs.maxLevel,22);
assert.equal(refs.sourceImages.length,22);
assert.equal(Object.keys(shapes).length,3);
function bits(value){const bytes=Buffer.from(value,'base64');assert.equal(bytes.length,72);const result=[];
 for(let i=0;i<576;i++)result.push((bytes[i>>3]>>(7-(i&7)))&1);return result;}
const dif=(a,b)=>a.reduce((n,v,i)=>n+Number(v!==b[i]),0)/576;
let count=0;
for(const kind of ['infantry','cavalry','archer']){
 const samples=shapes[kind];assert.deepEqual(Object.keys(samples),['3','4','5','6','7','8']);
 const masks=Object.fromEntries(Object.entries(samples).map(([lv,shape])=>[lv,bits(shape)]));
 for(let lv=3;lv<=8;lv++){const values=masks[lv];assert.ok(values.reduce((a,b)=>a+b,0)>120);count++;}
 assert.ok(dif(masks[3],masks[4])>.07);
 assert.ok(dif(masks[4],masks[5])>.07);
 assert.ok(dif(masks[5],masks[6])>.05);
}
const source=fs.readFileSync(__dirname+'/screenshot-importer.js','utf8');
for(const term of ["id:'helmet'","id:'neck'","id:'coat'","id:'pants'","id:'ring'","id:'staff'","[data-charm]","B.save()","confidence","File","URL.createObjectURL","getRemoteTemplates"]){
 assert.ok(source.includes(term),'importer contract '+term);
}
const html=fs.readFileSync(__dirname+'/index.html','utf8');
for(const file of ['charm-shapes.js','charm-references.js','screenshot-importer.js','screenshot-importer.css']){
 assert.ok(html.includes('./'+file),'index references '+file);
}
console.log('BEAR SCREENSHOT: 18 local guide masks, 22 reference levels, six gear positions and importer UI contracts valid');
