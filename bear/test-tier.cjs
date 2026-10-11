/* Match against binary badge crops from the user's supplied 716x1536
 * Governor Equipment image. No original picture is stored in the repo.
 */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={window:{},atob:b64=>Buffer.from(b64,'base64').toString('binary')};
vm.runInNewContext(fs.readFileSync(__dirname+'/tier-recognizer.js','utf8'),ctx);
const R=ctx.window.NRW_BEAR_TIER_RECOGNIZER;
const crops={"helmet":"BwAAAAABgAAAAADAAAAAAGAAAAAAMAAAAAAMAAAAAAcB/wAAAYD/++AA4D///AA4D///AA4B/5/AA4AfAfAA4AfAPAA4AfAPAA4AfAPAA4AfAPAA4AfAPAA4AfAPAA4AfAPAA4AfAPAA4AfAPAA4AOAOAA4AAAGAA4AAAAAA4AAAAAA4AAAAAA4AAAAAA4AAAAAA4AAAAAAA","neck":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAH/98AAAH//+AAAH//+AAAD/x+AAAAeA+AAAAeAeAAAAeAeAAAAeAeAAAAeAeAAAAeAeAAAAeAeAAAAeAeAAAAeAeAAAAeAeAAAAIAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","coat":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/wIAAAH//8AAAH//+AAAH//+AAAD/B+AAAA+A+AAAA+AeAAAA+AeAAAA+AeAAAA+AeAAAA+AfAAAA+A/AAAA+AfAAAA+AfAAAAeAfAAAAeAeAAAAAAeAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","pants":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAf//4AAAf//8AAAf//8AAAH8H8AAAB4B8AAAB4B8AAAB4B8AAAB4B4AAAB4B4AAAB4B8AAAB4B8AAAB4B8AAAB4B8AAAB4B8AAABwB8AAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","ring":"AA/////AB/////AH/D//gAH+AAAAAPEAAAAAeDAAAAA+DAAAAA+DAAAAB4HAAAAB4HAAAIDwPAAAfDwPAAAfDwPAAAcDgeAAAAHweAAAAHwAAAAAHwAAAAAHwAYAAAHhAYAAAHggeAABH8APwHgH+APwPgH4AAAAAH4AAAAAH4AAAAAH4ABAAAH4ADgAAH4ADgAAA","staff":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8eAAAD///AAAD///AAAD/9/AAAAPA/AAAAPAPAAAAPAPAAAAPAPAcAAPAPAAAAPAPAAAAPAPAAAAPAPAAAAPAPAEAAPAPAAAAOAPAAAAAAHAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAA"};
const decode=(s,w,h)=>{const b=Buffer.from(s,'base64'),v=new Uint8Array(w*h);for(let i=0;i<v.length;i++)v[i]=(b[i>>3]>>(7-(i&7)))&1;return v;};
for(const [slot,encoded] of Object.entries(crops)){
 const score=R.match(decode(encoded,42,29),42,29);
 if(slot==='ring'){assert.equal(score.tier,null,'ring has NO T1');assert.ok(score.score<.83);}
 else{assert.equal(score.tier,1,slot+' T1 must be detected');assert.ok(score.score>.83,slot+' score '+score.score);}
}
assert.equal(R.match(new Uint8Array(42*29),42,29).tier,null);
assert.equal(R.match(new Uint8Array(4),2,2).tier,null);
assert.equal(R.yellow(251,205,30),true);
assert.equal(R.yellow(15,185,230),false);
assert.equal(R.yellow(92,72,201),false);
console.log('TIER BADGES: 5/5 actual T1 crop matches, 1/1 no-badge correctly unknown; basic false-positive guards passed.');
