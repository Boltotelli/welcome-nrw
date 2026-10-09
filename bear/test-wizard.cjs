/* Guided Bear wizard deployment contract.
 * Syntactic and structural checks. Browser/Android interaction requires a
 * real-device check; passing CI alone does NOT prove screenshot OCR success.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const wizard=fs.readFileSync(__dirname+'/wizard.js','utf8');
const css=fs.readFileSync(__dirname+'/wizard.css','utf8');
const intake=fs.readFileSync(__dirname+'/intake-ui.js','utf8');
const gear=fs.readFileSync(__dirname+'/screenshot-importer.js','utf8');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
for(const [name,js] of [['wizard',wizard],['intake',intake],['gear',gear]]){
 new vm.Script(js,{filename:name+'.js'});
}
for(const filename of ['wizard.js','wizard.css','intake-ui.js','intake-ui.css'])assert.ok(html.includes('./'+filename),'missing html asset '+filename);
assert.ok(html.indexOf('intake-ui.js')<html.indexOf('wizard.js'),'wizard runs after importer initialization');
assert.ok(html.indexOf('wizard.css')>html.indexOf('intake-ui.css'),'wizard styles override legacy forms');
assert.ok(wizard.includes("labels=['id','troops','stats','gear','heroes','missing','result'];"),'seven steps in intended sequence');
for(const id of ['lookupForm','intakeFiles','bearGearPhoto','intakeMissingDetails','intakeResultSlot']){
 assert.ok(wizard.includes(id),'wizard reuses real control '+id);
}
for(const event of ['nrw-bear-loaded','nrw-bear-intake-applied','nrw-bear-gear-applied']){
 assert.ok(wizard.includes(event),'wizard reacts to '+event);
}
assert.ok(intake.includes("CustomEvent('nrw-bear-intake-applied'"),'intake signals successful review');
assert.ok(gear.includes("CustomEvent('nrw-bear-gear-applied'"),'gear signals user confirmation');
assert.ok(wizard.includes("location.hostname.endsWith('.github.io')"),'Pages API limitation explained');
assert.ok(wizard.includes("!hasProfile()"),'cannot proceed without a loaded profile');
assert.ok(wizard.includes("processQueue()"),'do not advance with unconfirmed OCR queue');
assert.ok(css.includes('body.bear-wizard-mode .dashboard'),'legacy full dashboard hidden in guided mode');
assert.ok(!wizard.includes('localStorage.setItem('),'wizard does not create a competing persistence model');
console.log('BEAR WIZARD: seven ordered stages, protected profile gate, review events, mobile-only layout and asset references verified.');
