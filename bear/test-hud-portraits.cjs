'use strict';
/* Verify the 30 annotated Kingshot HUD signatures are usable offline.
 * The original player's screenshots are intentionally not published.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const refs=JSON.parse(fs.readFileSync(__dirname+'/hero-hud-fingerprints.json','utf8'));
assert.equal(refs.size,6);
const data=Object.entries(refs.pixels).map(([name,b64])=>({name,rgb:new Uint8Array(Buffer.from(b64,'base64'))}));
assert.ok(data.length>=30,'at least 30 verified distinct gallery portraits');
data.forEach(x=>assert.equal(x.rgb.length,6*6*3));
const globals={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/portrait-matcher.js','utf8'),globals,{filename:'portrait-matcher.js'});
const match=globals.window.NRW_BEAR_PORTRAIT_MATCHER.match;
for(const ref of data){
 const exact=match([ref.rgb],data);
 assert.equal(exact.name,ref.name,'in-game screenshot reference identifies '+ref.name);
 const varied=Uint8Array.from(ref.rgb,(v,i)=>Math.max(0,Math.min(255,v+(i%2?3:-3))));
 assert.equal(match([varied],data).name,ref.name,'scaled/compressed variation identifies '+ref.name);
}
const unknown=new Uint8Array(108).fill(0);
assert.equal(match([unknown],data).name,null,'unseen portraits must remain unverified');
console.log('BEAR HUD: '+data.length+' local hero reference matches, compression tolerance and fail-closed behavior passed.');
