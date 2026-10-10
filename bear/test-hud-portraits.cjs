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

// Real Chromium 6x6 samples, captured from the *uploaded screenshot* crop,
// not the stored reference. Chrome's default low smoothing rejected both.
const browser=JSON.parse(fs.readFileSync(__dirname+'/hero-real-browser-samples.json','utf8'));
for(const fixture of browser.heroes){
 const raw=key=>new Uint8Array(Buffer.from(fixture[key],'base64'));
 assert.equal(raw('medium').length,6*6*3);
 assert.equal(match([raw('low')],data).name,null,'old browser aliasing rejected '+fixture.name);
 const accepted=match([raw('medium')],data);
 assert.equal(accepted.name,fixture.name,'real antialiased Chromium crop identifies '+fixture.name);
 assert.equal(accepted.confidence,'high','verified margin for '+fixture.name);
}
// Browser canvas quality must not regress to the implicit "low" default.
let smoothing='';
globals.document={createElement:()=>({
 width:0,height:0,
 getContext:()=>({
  imageSmoothingQuality:'low',
  drawImage(){smoothing=this.imageSmoothingQuality;},
  getImageData:()=>({data:new Uint8Array(6*6*4)})
 })
})};
globals.window.NRW_BEAR_PORTRAIT_MATCHER.sample({}, {x:0,y:0,w:140,h:240});
assert.equal(smoothing,'medium','browser sample must use antialiasing');
(async()=>{
 // Exercise the *actual* JSON decode/fetch code, not just self-matches.
 let calls=0;
 globals.atob=b64=>Buffer.from(b64,'base64').toString('binary');
 globals.fetch=async url=>{
  calls++;
  assert.match(url,/hero-hud-fingerprints\.json/);
  return {ok:true,json:async()=>refs};
 };
 const loaded=await globals.window.NRW_BEAR_PORTRAIT_MATCHER.data();
 assert.equal(loaded.length,Object.keys(refs.pixels).length,'all 30 references load in browser-style runtime');
 assert.equal(globals.window.NRW_BEAR_PORTRAIT_MATCHER.diagnostics().status,'ready');
 assert.equal(calls,1);
 console.log('BEAR HUD: real Yang/Petra Chrome regressions, sampling quality and 30-reference fetch passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
