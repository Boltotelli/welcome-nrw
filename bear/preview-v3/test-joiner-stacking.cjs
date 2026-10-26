/* Regression: Kingshot documented effect_op grouping and four first-skill limit.
 * https://www.kingshot.wiki/guides/joiner-hero-mechanics-no-one-told-you-about
 * https://kingshotguides.com/guide/how-your-bear-damage-is-calculated-as-a-joiner/
 * Verify that four Chenko do NOT collapse to two, yet the 2+2 mix wins.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'joiner-skills.js'),'utf8'),root);
const stack=root.window.NRW_BEAR_JOINER_SKILLS;
const heroes=JSON.parse(fs.readFileSync(path.join(__dirname,'../hero-reference.json'),'utf8'));
const get=name=>heroes.records.find(h=>h.name===name);
const calc=(...names)=>stack.process(names,get);
const two=calc('Chenko','Chenko');
const four=calc('Chenko','Chenko','Chenko','Chenko');
const mix=calc('Chenko','Chenko','Amane','Amane');
const alternate=calc('Chenko','Yeonwoo','Amane','Margot');
const noJoin=calc();
for(const result of [two,four,mix,alternate,noJoin])assert(result.ready,'Source-backed comparison must be ready');
assert.equal(noJoin.multiplier,1);
assert.equal(two.group101,50);assert.equal(two.group102,0);
assert.equal(two.multiplier,1.5);
assert.equal(four.group101,100);assert.equal(four.group102,0);
assert.equal(four.multiplier,2,'four Chenko are NOT capped at two');
assert.equal(mix.group101,50);assert.equal(mix.group102,50);
assert.equal(mix.groupFactor101,1.5);assert.equal(mix.groupFactor102,1.5);
assert.equal(mix.multiplier,2.25);
assert.equal(alternate.multiplier,2.25,'equivalent effect_op group mix');
assert.equal(mix.multiplier/four.multiplier,1.125);
assert(mix.multiplier>four.multiplier&&four.multiplier>two.multiplier);
assert.equal(stack.SCENARIOS[0].id,'mixed','best tested recipe presented first');
const five=calc('Chenko','Chenko','Chenko','Chenko','Amane');
assert.equal(five.active.length,4);assert.equal(five.multiplier,2,'fifth joiner does not contribute');
const displaced=stack.process([
 {name:'Chenko',level:4},{name:'Chenko',level:5},
 {name:'Amane',level:5},{name:'Amane',level:5},
 {name:'Chenko',level:5}
],get);
assert.equal(displaced.multiplier,2.25,'highest four skill levels win even with a late joiner');
assert.deepEqual(Array.from(displaced.active.map(h=>h.name)),['Chenko','Amane','Amane','Chenko']);
const unknown=calc('Chenko','Unknown Hero');
assert.equal(unknown.ready,false,'unsupported effect must not silently contribute');
const ui=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
assert(ui.includes("T('Gruppe 101 (Tödlichkeit): ')"));
assert(ui.includes("T('Gruppe 102 (Angriff): ')"));
assert(ui.includes("compared=(stack?.SCENARIOS||[])"));
assert(ui.includes("combo.groupFactor101.toFixed(2)+' × '+combo.groupFactor102.toFixed(2)"));
console.log('PASS joiner 2 Chenko 1.50x, 4 Chenko 2.00x, 2+2 mix 2.25x, four highest skills, source effects, UI breakdown');
