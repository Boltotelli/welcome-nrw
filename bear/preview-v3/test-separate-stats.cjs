'use strict';
// Regression: V3 always models individual Bonus Overview layers. The
// combined-vs-separate dropdown is removed; saved profiles cannot restore it.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const flow=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
const baseline=fs.readFileSync(path.join(__dirname,'../own-baseline.js'),'utf8');
assert(flow.includes("m.v2.combatStatOrigin='separate-overview';"));
assert(flow.includes("v.combatStatOrigin='separate-overview';"));
assert(flow.includes("combatStatOrigin:'separate-overview'"));
assert(!flow.includes("choose('Herkunft dieser Werte'"));
assert(!flow.includes("['combined-report','Bereits kombinierte Kampfwerte']"));
assert(flow.includes("'Schwadron Angriff %'"));
assert(flow.includes("'Schwadron Tödlichkeit %'"));
assert(flow.includes("legacyCombinedStats=d.combatStatOrigin==='combined-report';"),
 'Historical combined-report profiles must be flagged for a review');
const root={window:{}};vm.runInNewContext(baseline,root,{filename:'own-baseline.js'});
const m=root.window.NRW_BEAR_OWN_BASELINE;
const sample={values:{iAtk:100,iLet:75,cAtk:80,cLet:70,aAtk:90,aLet:65,
 squadAtk:25,squadLet:10},v2:{combatStatOrigin:'separate-overview',
 ownHeroes:['Zoe','Petra','Yang'],manualHeroes:{
 Zoe:{expeditionStats:{iAtk:40,iLet:5}},
 Petra:{expeditionStats:{cAtk:20,cLet:10}},
 Yang:{expeditionStats:{aAtk:30,aLet:15}}}}};
const totals=m.composeCombatStats(sample);
assert.equal(totals.origin.mode,'separate-overview');
assert.equal(totals.stats.iAtk,165); // 100 class + 25 squad + 40 Zoe
assert.equal(totals.stats.cAtk,125);
assert.equal(totals.stats.aAtk,145);
assert.equal(totals.stats.aLet,90);
assert.equal(totals.stats.iLet,90);
// The legacy combined option previously omitted independent layers.
const old={...sample,v2:{...sample.v2,combatStatOrigin:'combined-report'}};
assert.equal(m.composeCombatStats(old).stats.iAtk,100);
console.log('PASS V3 fixed separate source, hidden selector, retained squad fields, legacy review, independent stats sum');
