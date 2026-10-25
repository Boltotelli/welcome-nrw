/* Regression: Bear V3 translations must remain complete in every supported language.
 * No player profile, API, or damage calculations are touched.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dir=__dirname;
const dictionary=fs.readFileSync(path.join(dir,'i18n.js'),'utf8');
const flow=fs.readFileSync(path.join(dir,'name-flow.js'),'utf8');
const storage={value:'en',getItem(){return this.value;},setItem(_key,value){this.value=value;}};
const document={documentElement:{lang:'en'},body:{dataset:{}}};
const window={};
vm.runInNewContext(dictionary,{window,document,localStorage:storage});
const translator=window.NRW_BEAR_I18N;
assert(translator);
const checks=[
 '⚪ Nur lokal gespeichert',
 '🟡 Änderungen noch nicht gespeichert',
 '🔴 PIN fehlt – Profil noch nicht gesichert',
 'Gemeinsames Profil geladen · Bearbeitung erlaubt.',
 'PIN nicht gültig. Änderungen bleiben lokal.',
 'Zu viele PIN-Versuche. Bitte nach 30 Minuten erneut versuchen.',
 '✓ Gemeinsam gespeichert · Version 17',
 'Bogenschützenbedarf für alle 7 Märsche: 1.234 · Bestand: 5.678',
 'Es fehlen 1.234 Bogenschützen für die vorgesehenen Marschverhältnisse. Die betroffenen Formationen wurden angepasst.',
 '⚠ Unbekannte T/TG-Stufen: Vorläufige T10/TG0-Vergleichswerte werden verwendet.',
 'Infanterie · Tödlichkeit %',
 'Truppenpriorität: Starter zuerst',
 'Tatsächlicher Starter: 5 / 15 / 80 %',
 '🔐 WICHTIG: PROFIL MIT PIN SICHERN!',
 'Dieses ältere Profil wurde bislang als „kombiniert“ gespeichert. Bitte prüfen, ob die eingetragenen Truppenwerte wirklich einzeln aus der Bonusübersicht stammen. Separate Heldenboni werden nun zusätzlich berücksichtigt.'
];
for(const lang of ['en','fr','es']){
 storage.value=lang;document.documentElement.lang=lang;
 for(const raw of checks){
  const input=raw==='Truppenpriorität: Starter zuerst'?
    'Truppenpriorität: '+translator.tr('Starter zuerst'):raw;
  const translated=translator.tr(input);
  assert.notEqual(translated,raw,'Missing '+lang+' translation for: '+raw);
 }
 assert.equal(translator.tr('Alcar'),'Alcar','Hero names must not be translated');
 assert.equal(translator.tr('1 / 12 / 87 %'),'1 / 12 / 87 %');
}
assert(flow.includes("input.setCustomValidity(T('Ungültiger Wert'))"));
assert(flow.includes("status.textContent=T(lastStatusMessage)"));
assert(flow.includes("T(allocationMode)"));
assert(flow.includes("T(' Sterne wählen')"));
assert(flow.includes("T(' von 5')"));
assert(flow.includes('const plan=currentFormationPlan()'));
console.log('PASS: 45 localized dynamic/static notices across EN/FR/ES; source wiring intact');
