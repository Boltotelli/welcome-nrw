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
const simulation=fs.readFileSync(__dirname+'/simulation-ui.js','utf8');
const intake=fs.readFileSync(__dirname+'/intake-ui.js','utf8');
const gear=fs.readFileSync(__dirname+'/screenshot-importer.js','utf8');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
for(const [name,js] of [['wizard',wizard],['intake',intake],['gear',gear]]){
 new vm.Script(js,{filename:name+'.js'});
}
for(const filename of ['wizard.js','wizard.css','intake-ui.js','intake-ui.css'])assert.ok(html.includes('./'+filename),'missing html asset '+filename);
assert.ok(html.indexOf('intake-ui.js')<html.indexOf('wizard.js'),'wizard runs after importer initialization');
assert.ok(html.indexOf('hero-reference.js')<html.indexOf('wizard.js'),
 'hero source loader must run before recommendation display');
assert.ok(wizard.includes('NRW_BEAR_HERO_REFERENCE'),
 'leader review is connected to independent GitHub hero reference');
assert.ok(wizard.includes('Quellenwert Expedition ATK/DEF'),
 'visible numeric expedition progression from checked source');
assert.ok(wizard.includes('Skillwerte von Stufe 1 bis 5'),
 'normal skill source progression explained without guessing current skill levels');
assert.ok(wizard.includes('reference?.get?.(h.name,h.stars,h.tier)'),
 'alternative choices also show source-backed values');
assert.ok(!wizard.includes('sourceValue*')&&!wizard.includes('verified.bonus*'),
 'reference bonuses are never invented damage multipliers');

assert.ok(html.indexOf('wizard.css')>html.indexOf('intake-ui.css'),'wizard styles override legacy forms');
assert.ok(wizard.includes('const guidedOrder=[0,1,2,4,5,6,7,8,9]'),'nine displayed stages without governor gear');
for(const id of ['lookupForm','intakeFiles','bearGearPhoto','intakeMissingDetails','intakeResultSlot']){
 assert.ok(wizard.includes(id),'wizard reuses real control '+id);
}
for(const event of ['nrw-bear-loaded','nrw-bear-intake-applied','nrw-bear-gear-applied']){
 assert.ok(wizard.includes(event),'wizard reacts to '+event);
}
assert.ok(intake.includes("CustomEvent('nrw-bear-intake-applied'"),'intake signals successful review');
assert.ok(gear.includes("CustomEvent('nrw-bear-gear-applied'"),'gear signals user confirmation');
assert.ok(wizard.includes('const guidedOrder=[0,1,2,4,5,6,7,8,9]'),'GovGear stays disconnected from nine-stage wizard');
assert.ok(html.includes('github-profiles.js?v='),'numeric ID static GitHub loader included');
assert.ok(wizard.includes("!hasProfile()"),'cannot proceed without a loaded profile');
assert.ok(wizard.includes("processQueue()"),'do not advance with unconfirmed OCR queue');
assert.ok(css.includes('body.bear-wizard-mode .dashboard'),'legacy full dashboard hidden in guided mode');
assert.ok(!wizard.includes('localStorage.setItem('),'wizard does not create a competing persistence model');
assert.ok(wizard.includes('capacityHost.insertBefore(capField,capacityHost.firstChild)'),'existing capacity input retained on Pet/Valora step');
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

assert.ok(wizard.includes('if(idx===4){sections[4].append(widgetHost);renderWidgetLevels();}'),
 'Widget review is on the hero-overview step');
assert.ok(wizard.includes('renderWidgetLevels();displayStored(4);'),
 'confirmed OCR refreshes widget inputs');
assert.ok(!wizard.includes('if(recommendationsReady()){moveTo(5);return;}'),
 'OCR must not skip the Widget review');
assert.ok(wizard.includes('roster.set(name,{...hero,widget:Number(widgetLevels[name])})'),
 'explicit widget levels are passed into hero rankings');
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

assert.match(intake,/readHeroStatPanel\(canvas,worker,detail\.name/,
 'all three selected hero pages must run the focused expedition OCR');
assert.match(intake,/556\*sx,1030\*sy,129\*sx,260\*sy/,
 'numeric right-column crop pinned to independently checked 716x1536 hero geometry');
assert.match(intake,/parseHeroOrderedExpeditionRows\(result\.data\?\.text\|\|'',kind\)/,
 'positioned numeric readings use conservative four-row parser');
assert.match(intake,/\['Atk','Def','Let','Hp'\]\.map\(k=>group\+k\)/,
 'hero input rows must mirror actual Kingshot Attack Defense Lethality Health order');
assert.ok(wizard.includes('displayStored(idx)'),'saved values remain visible on screenshot pages');
assert.ok(!wizard.includes('baseLevelInput'),'duplicate Valora input removed without deleting its saved value');
assert.ok(wizard.includes('v2.valoraBaseLevel'),'saved Valora values preserved');
assert.ok(wizard.includes('Formationen generieren'),'simple formation generation action');
assert.ok(wizard.includes('Grundschaden ohne Joiner berechnen'),'simple no-join damage action');
assert.ok(css.includes('.bear-guide-stored'),'mobile saved-values cards styled');
assert.ok(!wizard.includes('kingshot_beartrap_v3_action_transparent.webm'),'formation-stage loading must not reuse the damage video');
assert.ok(wizard.includes('stageLoader.append(loaderBear,loaderText)'),'formation stage keeps its own animated bear loading indicator');
assert.ok(simulation.includes("webm.src='./assets/kingshot_beartrap_v3_action_transparent.webm'"),'damage simulation retains the approved video');
assert.ok(html.includes('./wizard.js?v=examples-closed-20261011-1'),'wizard cache version changed');
assert.ok(html.includes('./wizard.css?v=roster-widgets-20261011-1'),'CSS cache version changed');
assert.ok(html.includes('./hero-advisor.js?v=roster-widgets-20261011-1'),'advisor cache version changed');
assert.ok(wizard.includes('new Set(advisor?.offensiveWidgetHeroes||[])'),'offensive heroes shown first');
assert.ok(wizard.includes('window.NRW_BEAR_HERO_REFERENCE?.get?.(name,stars,tier)'),'verified attack is passed to the ranking engine');
assert.ok(wizard.includes("'.jpg?v=corrected-examples-20261011-1'"),'corrected original images bypass stale browser caches');
const workflow=fs.readFileSync(__dirname+'/../.github/workflows/bear-pages.yml','utf8');
assert.ok(workflow.includes('57bd5246b3e9c21904ef2f11ae4db246c5cd9780d55a333efd0bbadfa41e9418'),'exact archived ZIP is identified');
for(const [target,source] of [['troops.jpg','roster.jpg'],['stats.jpg','troops.jpg'],['stats-extra.jpg','stats.jpg'],['roster.jpg','stats-extra.jpg']]){
 assert.ok(workflow.includes(target+') source="'+source+'"'),'wrongly named ZIP image remapped: '+target);
}
assert.ok(wizard.includes("2:['stats','stats-extra']"),'two complementary bonus-overview screenshots appear in combat stats example');
assert.ok(wizard.includes('const gallery=document.createElement'),'screenshot examples display as compact gallery');
assert.ok(css.includes('.bear-guide-example-link img'),'mobile-sized authentic example thumbnails are styled');
assert.ok(!wizard.includes('help.open=true'),'all screenshot help panels must start closed');
assert.ok(wizard.includes("const help=document.createElement('details')"),'screenshot example panels remain expandable');
assert.ok(wizard.includes("img.loading='eager'"),'gallery loads images even when slides start hidden');
assert.ok(!wizard.includes("link.hidden=true"),'gallery links do not block their own image loads');
assert.ok(simulation.includes("video.hidden=mode!=='video'"),'video and WebP are mutually exclusive');
assert.ok(simulation.includes("image.hidden=mode!=='image'"),'image cannot remain visible under video');
assert.ok(simulation.includes("video.addEventListener('playing'"),'WebM is displayed only while playable');
assert.ok(css.includes('.bear-sim-video[hidden]'),'hidden attribute takes priority over media CSS');
assert.ok(html.includes('./simulation-ui.js?v=bear-media-exclusive-20261011-1'),'simulation media fix invalidates browser cache');
console.log('BEAR WIZARD: nine stages, hero shortlist, separate gear-first detail uploads and independent capacity input verified.');
