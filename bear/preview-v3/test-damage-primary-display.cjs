/* Regression: the user-facing Bear damage headline must show both
 * simulated mean and the troop-proc theoretical maximum, never "Modellindex".
 * The actual combat model and hero/joiner computation must not be modified.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const dir=__dirname;
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const ui=read('name-flow.js'),css=read('name-flow.css'),
 html=read('../preview-v3.html'),dictionary=read('i18n.js');
const runtime={window:{},Math};runtime.window.window=runtime.window;
vm.runInNewContext(read('combat.js'),runtime);
vm.runInNewContext(read('damage-skills.js'),runtime);
const combat=runtime.window.NRW_BEAR_COMBAT;
const damage=runtime.window.NRW_BEAR_SKILL_DAMAGE;
const prepared={ready:true,modifiers:{attack:0,lethality:0,
 classAttack:[0,0,0],classDamage:[1,1,1],lowClassDamage:[1,1,1],
 lowDamage:1,damage:1},valoraPoints:0,unmodeled:[]};
const counts=[1000,30000,100000],levels=[
 {tier:10,tg:5},{tier:10,tg:5},{tier:10,tg:8}
],stats={iAtk:0,iLet:0,cAtk:0,cLet:0,aAtk:0,aLet:0};
const result=damage.evaluate(prepared,counts,levels,stats,combat,2.25);
assert(result.ready&&result.distribution.ready);
assert.equal(result.distribution.samples,1000);
assert(Number.isFinite(result.distribution.average));
assert(Number.isFinite(result.distribution.theoreticalMaximum));
assert(result.distribution.theoreticalMaximum>result.distribution.percentile95);
assert(result.distribution.percentile95>result.distribution.average);
assert(ui.includes("['Ø Schaden (1.000 Simulationen)',dist.average]"));
assert(ui.includes("['Theoretisches Maximum (Truppen-Procs)',dist.theoreticalMaximum]"));
assert(ui.includes("el('div','bear-name-score-primary')"));
assert(ui.includes("el('strong','bear-name-score-metric-value',whole(value))"));
assert(!ui.includes("whole(answer.estimatedIndex)"),'Relative index must not be primary');
assert(ui.includes("T('95. Perzentil: ')+whole(dist.percentile95)"),
 'P95 is kept as secondary detail');
assert(!ui.includes("T('Ø 1.000 Simulationen (Truppen-Procs): ')+whole(dist.average)"),
 'Do not duplicate the main damage average in the footnote');
assert(css.includes('.bear-name-score .bear-name-score-primary{'));
assert(css.includes('@media(max-width:540px)'));
assert(css.includes('grid-template-columns:1fr;gap:7px'));
for(const name of ['name-flow.css','name-flow.js','i18n.js'])
 assert(html.includes(name+'?v=20261026-primary-damage-v1'),
  'Cache-busted main output asset: '+name);
const win={},storage={lang:'en',getItem(){return this.lang},setItem(_,lang){this.lang=lang}},
 doc={documentElement:{lang:'en'},body:{dataset:{}}};
vm.runInNewContext(dictionary,{window:win,localStorage:storage,document:doc});
for(const locale of ['de','en','fr','es']){
 storage.lang=locale;
 for(const s of ['Ø Schaden (1.000 Simulationen)',
  'Theoretisches Maximum (Truppen-Procs)',
  '⚠ Geschätzter Schaden – kein bestätigter Kingshot-Schadenswert.',
  'Das theoretische Maximum setzt alle berücksichtigten Truppen-Procs in jeder Runde voraus und ist kein realistischer Erwartungswert.']){
  const out=win.NRW_BEAR_I18N.tr(s);
  assert(out,locale+' has a text');
  if(locale!=='de')assert.notEqual(out,s,locale+' translation missing: '+s);
 }
}
console.log('PASS: primary mean and theoretical troop maximum, unchanged 1000-run model, secondary P95, responsive layout, DE/EN/FR/ES and cache versions');
