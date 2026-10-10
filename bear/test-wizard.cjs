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
assert.ok(wizard.includes("labels=['id','troops','stats','gear','heroes','hero-picks','hero-details','missing','result'];"),'nine stages in intended sequence');
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
assert.ok(wizard.includes('capacityHost.append(capField)'),'squad capacity moved outside conditional group');
assert.ok(wizard.includes('confirmRecommendedHeroes()'),'recommendation confirmation precedes details');
assert.ok(wizard.includes("input.multiple=[2,4,6].includes(i)"),'full hero overview and detail batches are supported');
assert.ok(wizard.includes('recommendationsReady()'),'cannot confirm three roles unless all present');
assert.ok(wizard.includes('const restrict=true'),'no unscanned API/manual hero slips into shortlist');
assert.ok(wizard.includes('simultaneously')||wizard.includes('SIMULTANEOUSLY'),
 'three gear sets must be equipped simultaneously');
assert.ok(wizard.includes('BESTES HELDEN-GEAR'),'remind users to distribute best hero gear before detail screenshots');
assert.match(wizard,/gleichzeitig/i,'best equipment must be fitted to all three heroes simultaneously');
assert.ok(wizard.includes('jeweils EINEN Screenshot'),'exactly one screenshot per selected hero is requested');
assert.ok(wizard.includes('scannedOwnedHeroes'),'only heroes identified in the screenshots are eligible');

assert.match(wizard,/if\(active===4\)\{[\s\S]*?if\(recommendationsReady\(\)\)\{moveTo\(5\);return;\}/,
 'confirmed multi-image hero upload must automatically open Top 3, not ask for the same upload again');
assert.ok(intake.includes('starSuggestion??'), 'uncertain stars are prefilled as reviewable suggestions');
assert.ok(intake.includes('Sternvorschlag bestätigen'), 'single tap verifies an uncertain star estimate');
assert.ok(intake.includes('c.height=Math.max(180,Math.round(170*pixelH/pixelW))'),
 'hero review crop keeps the complete original card aspect ratio');
const intakeCss=fs.readFileSync(__dirname+'/intake-ui.css','utf8');
assert.ok(!intakeCss.includes('object-fit:cover'), 'no cropped hero stars in review UI');
assert.ok(intake.includes('high-contrast')||intake.includes('thresholded high-contrast'),
 'unknown hero detail names receive extra bounded OCR');
assert.ok(intake.includes('const observed=keys.filter('), 'observed and absent percentages are reviewable separately');
assert.ok(intake.includes('GovGear wird NICHT noch einmal addiert'),
 'screenshots must not double count equipment or invent hero base stats');
assert.ok(wizard.includes('renderHeroDetails()'),'detail upload after best hero gear prompt');
// Three confirmed hero screenshots now open Step 8 immediately. This
// must not be gated by a still-disabled Continue button on Step 7.
assert.match(wizard,/accepted\.forEach\(n=>detailConfirmed\.add\(n\)\);\s*if\(heroDetailsReady\(\)\)\{moveTo\(7\);return;\}/,
 'all three confirmed hero details trigger automatic Step 8');
assert.match(intake,/readHeroStatPanel\(canvas,worker,detail\.name/,
 'focus scan needed when small hero percentages are missed');
assert.match(intake,/observed\+'\/4 expedition percentages detected/,
 'all four hero-detail stat inputs remain available to review');
assert.match(intake,/expeditionStats:\{\.\.\.\(h\.expeditionStats\|\|\{\}\)\}/,
 'newly equipped hero screenshot must not silently reuse pre-gear stats');

console.log('BEAR WIZARD: nine stages, hero shortlist, separate gear-first detail uploads and independent capacity input verified.');
