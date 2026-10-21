'use strict';
/* Safety regression for PIN-first onboarding, readonly shared profiles, and
 * on-demand screenshot help. Real original screenshots are supplied later. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
const ui=read('name-flow.js'),help=read('help-ui.js'),css=read('name-flow.css'),
 html=read('../preview-v3.html');
assert(html.includes('help-ui.js?v=20261017-all-guides-1'));
assert(html.includes('help-locales.js?v=20261017-all-guides-1'));
assert(html.indexOf('help-locales.js?v=')<html.indexOf('help-ui.js?v='),'Translations must load before help dialog');
assert(html.indexOf('help-ui.js?v=20261017-all-guides-1')>=0);
assert(html.indexOf('help-ui.js?v=20261017-all-guides-1')<
 html.indexOf('name-flow.js?v='), 'Help functions must exist before the deferred form script');
assert(ui.includes("if(!localOnly&&version===null&&activePlayer?.id)void unlockProfile();"),
 'PIN dialog must open for a new shared profile');
assert(ui.includes('if(version===null)return; // no editable forms before successful PIN claim'),
 'No unsecured profile editing must be possible');
const saveFirst=ui.indexOf('const result=await PROFILES.save(profileId,pin,null,pack());');
const enabled=ui.indexOf('canEdit=true;',saveFirst);
assert(saveFirst>=0&&enabled>saveFirst,
 'Editor can unlock only AFTER shared PIN confirmation');
assert(ui.includes('if(isNew&&activePlayer?.id===profileId)await leaveProfile()'),
 'Cancelled first PIN setup must return to search');
assert(ui.includes('if(err?.status===409&&isNew)'),
 'Simultaneous registration must not overwrite an existing profile');
assert(ui.includes('markReadOnly(main)'),'Other profiles must be view-only');
assert(ui.includes('markReadOnly(updatedGear)'), 'Async gear refresh must not re-enable editing in other profiles');
assert(ui.includes('button:not(.bear-name-help-trigger):not(.bear-name-action-btn)'),
 'Help and read-only calculations must remain available');
assert(ui.includes('🔴 PIN fehlt – Profil noch nicht gesichert'));
assert(ui.includes('🟡 Änderungen noch nicht gespeichert'));
assert(ui.includes('🟢 Profil gesichert · alle Änderungen gespeichert'));
assert(ui.includes("helpHeading('Deine Helden','heroes','h2')"));
assert(ui.includes("helpHeading('Heldenausrüstung nach dem Umziehen prüfen','expedition','h2')"));
assert(ui.includes("key==='troops'?'troops':null"));
assert(ui.includes("helpHeading('Infanterie, Kavallerie, Bogenschützen & Schwadron','combatStats')"));
assert(ui.includes("helpHeading('Pets','pets')"));
assert(ui.includes("HELP?.icon?.('valora')"));
assert(ui.includes("return options.helpKey?HELP?.decorateField?.(wrap,label,options.helpKey)||wrap:wrap;"));
assert(ui.includes("return helpKey?HELP?.decorateField?.(w,label,helpKey)||w:w;"));
assert(!ui.includes("icon('stars')"),'No per-hero star help');
assert(!ui.includes("helpKey:'widget'"),'No per-hero widget help');
assert(css.includes('@keyframes bear-pin-shake'));
assert(css.includes('@keyframes bear-pin-glow'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('.bear-name-help-backdrop'));
assert(css.includes('display:flex;flex-direction:column;overflow:hidden;max-height:min(94dvh,840px)'),
 'Guide navigation must stay visible without full page scroll');
assert(help.includes('imgSource=')&&help.includes('root.NRW_BEAR_HELP_IMAGES'),
 'Original screenshots must load only when requested');
assert(html.includes('help-image-pack.js')===false,
 'The 13-image pack must be lazy, not loaded on every visit');
const context={window:{}};
vm.runInNewContext(help,context,{filename:'help-ui.js'});
const api=context.window.NRW_BEAR_HELP;
const mockWrapper={querySelector(){throw new Error('Implicit field decoration');}};
assert.equal(api.decorateField(mockWrapper,'Rallyleader, denen du beitrittst'),mockWrapper);
assert.equal(api.decorateField(mockWrapper,'Infanterie · Angriff %'),mockWrapper);
assert.equal(api.decorateField(mockWrapper,'Widget'),mockWrapper);
assert.equal(api.icon('ministers'),null);
const guide=api.GUIDES;
assert(guide.march.steps[1].text.includes('1 eigene Starter-Rally + 6 Joiner = 7 Märsche'));
assert(guide.pets.steps[1].text.includes('NICHT deine persönliche Marschkapazität'));
assert(guide.valora.steps[2].text.includes('UNABHÄNGIGE Fähigkeitslevel'));
assert(guide.expedition.steps[1].text.includes('Expedition'));
console.log('PASS: hard PIN gate, user-selected consolidated [i] help, no per-field automatic clutter, accessible screenshot placeholders');
