'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/charm-guide-silhouettes.js','utf8'),env);
vm.runInNewContext(fs.readFileSync(__dirname+'/charm-guide-matcher.js','utf8'),env);
const M=env.window.NRW_BEAR_CHARM_MATCHER;
assert.equal(M.templates.length,11,'all labelled levels from real screenshots');
for(const t of M.templates){
 assert.equal(t.bits.length,576);
 const result=M.recognize({bits:t.bits});
 assert.equal(result.level,t.level,'labelled reference Lv'+t.level);
}
// Seven independent 24x24 contour snapshots sampled from actual Governor
// Gear charm crops, not from the guide used to build the templates.
// Raw artwork and player screenshots are not included in the repository.
const fixtures=[["helmet",4,"D//wH//4P//8fAE+//j+///+///+///+///+///+///+///+///+///+f//+f//+///+///+///+///+f//+P//4H//wD/hA"],["neck",4,"D//AH//4H//8fAE+//g+///+///+///+///+///+///+///+///+///+///+///+///+///+///+f//+f//+H//4H//4D/gg"],["coat left",4,"D4PAH//4P//4cAA+4/8+5//+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+f//4P//4D//g"],["coat middle",5,"AAAAABgAAA4AAE4AAI8AAx/AAj/gBH/gCP/wD//8D//8P//8P//8P//+P//+P//+f//+f//+f///////f//wB//AAD4AAAAA"],["pants",4,"DwHAH//4P//4cAA+4/++5//+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+f//4P//4D//g"],["ring",5,"AAAAAAwAAE4AAM8AAQ+ABj/ABj/gAP/wGf/4H//8P//8P//8P/78P//+f//+f//+f//+f//////////+f//wB/+AADwAAAAA"],["staff",5,"AAAAAAwAAA4AAM8AAY+AAx/ABj/gBP/wGf/4D//8P//8P/v8P//8P//+f//+P+f+f//+f///f///////f//wB/+AADwAAAAA"]];
for(const [name,expected,code] of fixtures){
 const result=M.recognize({bits:M.unpack(code)});
 assert.equal(result.level,expected,name+' actual screenshot shape');
 assert.ok(result.margin>=.05,name+' sufficiently distinct from next level');
}
assert.equal(M.recognize({bits:new Uint8Array(576)}).level,null,
 'blank or absent charm never receives a level');
assert.equal(M.recognize({bits:new Uint8Array(100)}).level,null,
 'invalid crops fail closed');
console.log('CHARM GUIDE: 11 labelled level shapes and '+fixtures.length+' real GovGear crops passed.');
