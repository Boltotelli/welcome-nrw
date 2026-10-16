'use strict';
/* Safety regression for PIN-first onboarding, readonly shared profiles, and
 * on-demand screenshot help. Real original screenshots are supplied later. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
const ui=read('name-flow.js'),help=read('help-ui.js'),css=read('name-flow.css'),
 html=read('../preview-v3.html');
assert(html.includes('help-ui.js?v=20261016-security-help-3'));
assert(html.indexOf('help-ui.js?v=20261016-security-help-2')<
 html.indexOf('name-flow.js?v=20261016-security-help-1'),
 'Help functions must exist before the deferred form script');
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
assert(ui.includes('button:not(.bear-name-help-trigger):not(.bear-name-action-btn)'),
 'Help and read-only calculations must remain available');
assert(ui.includes('🔴 PIN fehlt – Profil noch nicht gesichert'));
assert(ui.includes('🟡 Änderungen noch nicht gespeichert'));
assert(ui.includes('🟢 Profil gesichert · alle Änderungen gespeichert'));
assert(ui.includes("const heroHelp=HELP?.icon('heroes')"));
assert(ui.includes('HELP?.decorateField?.(wrap,label)'));
assert(ui.includes('HELP?.decorateField?.(w,label)'));
assert(css.includes('@keyframes bear-pin-shake'));
assert(css.includes('@keyframes bear-pin-glow'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('.bear-name-help-backdrop'));
assert(help.includes('const HELP_ASSETS=Object.create(null)'),
 'Never fabricate screenshot sources');
const context={window:{}};
vm.runInNewContext(help,context,{filename:'help-ui.js'});
const api=context.window.NRW_BEAR_HELP;
for(const [title,expected] of [
 ['Infanterie · Angriff %','stats'],['Schwadron Tödlichkeit %','squad'],
 ['Basis-Marschkapazität ohne Helden','capacity'],['Widget','widget'],
 ['Fähigkeitslevel','pets'],['Savage Advantage','valora'],
 ['TG','tier'],['Anzahl','troops'],['Rallyleader, denen du beitrittst','leaders']
])assert.equal(api.resolveField(title),expected);
assert.equal(api.resolveField('Unknown input'),null);
console.log('PASS: hard PIN gate, await Supabase, cancel/race, readonly browse, status, pulsating CSS, accessible [i] help and screenshot placeholders');
