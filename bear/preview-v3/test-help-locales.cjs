'use strict';
// Bear V3 help must localize EVERY guide step and every annotation, without
// changing the screenshot assets or touching game-identity values.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=__dirname,source=fs.readFileSync(path.join(dir,'help-ui.js'),'utf8'),
 locales=fs.readFileSync(path.join(dir,'help-locales.js'),'utf8'),
 i18n=fs.readFileSync(path.join(dir,'i18n.js'),'utf8'),
 page=fs.readFileSync(path.join(dir,'../preview-v3.html'),'utf8');
const lang={value:'de'};
const root={NRW_BEAR_I18N:{language:()=>lang.value}};
vm.runInNewContext(locales,{window:root},{filename:'help-locales.js'});
vm.runInNewContext(source,{window:root},{filename:'help-ui.js'});
const help=root.NRW_BEAR_HELP,mapping=root.NRW_BEAR_HELP_LOCALES,ids=Object.keys(help.GUIDES);
assert.equal(ids.length,8);
assert(page.includes('help-locales.js?v=20261017-all-guides-1'));
assert(page.indexOf('help-locales.js?v=')<page.indexOf('help-ui.js?v='),
 'Translations must load before the help dialog');
const frozenGameStrings=new Set([
 'Military','Stats','Skills','Widget: +5','Antler Impact Lv. 5',
 'Deployment Capacity: 112.100','Squads’ Attack: 276,3 %','Squads’ Lethality: 60,1 %'
]);
let steps=0,annotations=0;
for(const language of ['en','fr','es']){
 lang.value=language;
 const tables=mapping.guides[language],ui=mapping.ui[language];
 assert.deepEqual(Object.keys(tables).sort(),ids.slice().sort());
 for(const id of ids){
  const original=help.GUIDES[id],translated=help.localizedGuide(id),entry=tables[id];
  assert(translated.title&&translated.title!==original.title,id+' title '+language);
  assert.equal(translated.steps.length,original.steps.length,id+' steps '+language);
  assert.equal(entry.steps.length,original.steps.length,id+' source steps '+language);
  for(let j=0;j<original.steps.length;j++){
   const a=original.steps[j],b=translated.steps[j],row=entry.steps[j];
   assert(typeof b.text==='string'&&b.text!==a.text,id+' step '+j+' '+language);
   assert.equal((a.marks||[]).length,(b.marks||[]).length,id+' marks '+j+' '+language);
   assert.equal((a.marks||[]).length,row[1].length,id+' translated marks '+j+' '+language);
   for(let k=0;k<(a.marks||[]).length;k++){
    assert(b.marks[k].text&&b.marks[k].text===row[1][k]);
    if(b.marks[k].text===a.marks[k].text)
     assert(frozenGameStrings.has(a.marks[k].text),
      id+' untranslated label '+j+'/'+k+' '+language);
    if(language==='en')annotations++;
   }
   if(language==='en')steps++;
  }
 }
 for(const original of ['📷 Bild lädt …','Bildbereich vorübergehend nicht verfügbar.',
  '🔍 Bild vergrößern','Bild verkleinern','Hilfe schließen',
  '← Zurück','Weiter →','Verstanden ✓','📷 Screenshot wird geladen …',
  'Screenshot konnte nicht geladen werden. Die Anleitung bleibt lesbar.',
  'Wo finde ich diesen Wert?','Hilfe: ','Original Kingshot-Screenshot: ']){
  assert.equal(help.uiText(original),ui[original],language+' UI string '+original);
  assert(ui[original]!==original,language+' untranslated UI '+original);
 }
 assert.notEqual(help.localizedGuide('march').title,help.GUIDES.march.title);
}
lang.value='de';assert.equal(help.localizedGuide('march').title,help.GUIDES.march.title);
assert.equal(help.uiText('← Zurück'),'← Zurück');
// Help title in main form is also fully translated (not half English/German).
const env={window:{},localStorage:{getItem:()=> 'en'},document:{documentElement:{lang:'en'}}};
vm.runInNewContext(i18n,env,{filename:'i18n.js'});
assert.equal(env.window.NRW_BEAR_I18N.tr('Infanterie, Kavallerie, Bogenschützen & Schwadron'),'Infantry, Cavalry, Archers & Squad');
console.log('PASS: '+ids.length+' Bear guides, '+steps+' steps, '+annotations+' annotated labels and all 13 help controls fully localized into DE/EN/FR/ES.');
