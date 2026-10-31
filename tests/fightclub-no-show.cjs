const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://test.local/**',r=>{const name=new URL(r.request().url()).pathname;const file=path.join(root,name);if(fs.existsSync(file)&&fs.statSync(file).isFile())return r.fulfill({body:fs.readFileSync(file),contentType:name.endsWith('.css')?'text/css':'application/javascript'});return r.fulfill({contentType:'text/html',body:'<html lang="de"><head><link rel="stylesheet" href="/leitung/styles.css"></head><body><div id="fightclubRoot"></div><div id="bearManagementRoot"></div></body></html>'});});
await page.goto('https://test.local/');await page.evaluate(async()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const players=[{game_id:'10001',name:'Alexandra · NRW',active:true},{game_id:'10002',name:'Score fehlt',active:true}];window.calls=[];window.fail=false;window.copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async s=>window.copied=s}});
const data={ok:true,cycles:[],assignments:[],powers:[{game_id:'10001',power:999999999,mystic_trial:54321},{game_id:'10002',power:999}],map_assignments:[],leaders:[]};
window.data=data;window.bearData={ok:true,slots:[{slot_key:'bear-1',slot_label:'BT1',start_time:'17:00:00'},{slot_key:'bear-2',slot_label:'BT2',start_time:'18:30:00'}],assignments:[],powers:[],profiles:[],settings:{}};
const request=async(_,body)=>{calls.push(body);if(body.action==='fightclub_data')return structuredClone(data);if(body.action==='bear_management')return structuredClone(bearData);await new Promise(r=>setTimeout(r,30));if(window.fail||window.failId===body.game_id)throw Error('test failure');const store=body.action==='bear_assignment'?bearData:data;store.assignments=store.assignments.filter(a=>!(a.game_id===body.game_id&&(body.action==='bear_assignment'||a.event_type===body.event_type&&a.battle_date===body.battle_date)));const removed=body.remove||body.action==='bear_assignment'&&!body.slot_key;if(!removed)store.assignments.push(body);return {ok:true,removed,assignment:body};};
const args={getState:()=>({players,staff:{is_owner:true}}),getLanguage:()=>'de',request,flash:()=>{},esc,openPlayer:()=>{}};
window.fight=(await import('/leitung/fightclub.js')).createFightClub(args);window.bear=(await import('/leitung/bear-management.js')).createBearManagement(args);await fight.open();await bear.open();
});
await page.locator('[data-fight-date]').fill('2026-10-30');await page.locator('[data-fight-date]').press('Tab');await page.locator('.fight-roster-collapsible').evaluate(e=>e.open=true);await page.locator('[data-bear-roster]').evaluate(e=>e.open=true);


const fight=page.locator('#fightclubRoot'),row=page.locator('[data-fight-row="10001"]');
const saveAll=async()=>{await fight.locator('[data-roster-save-all]').click();await page.waitForFunction(()=>document.querySelector('#fightclubRoot .roster-batch-actions').getAttribute('aria-busy')==='false');};
const writes=()=>page.evaluate(()=>calls.filter(c=>c.action==='fightclub_save'));
await row.locator('[data-fight-check="1"]').check();await row.locator('.fight-row-more').evaluate(e=>e.open=true);await row.locator('[data-fight-note]').fill('Bereits vorhandene Notiz 🛡️');await saveAll();
const baseline=(await writes()).at(-1);const count=(await writes()).length;
await row.locator('[data-fight-no-show]').check();assert.equal((await writes()).length,count,'Attendance is staged');assert(await row.locator('[data-fight-no-show-badge]').isVisible());assert.equal(await row.locator('[data-fight-note]').inputValue(),'Bereits vorhandene Notiz 🛡️');
await page.evaluate(()=>window.fail=true);await saveAll();assert(await row.locator('[data-fight-no-show]').isChecked(),'Failed write retains no-show draft');
await page.evaluate(()=>window.fail=false);await saveAll();const stored=(await writes()).at(-1);assert.equal(stored.notes,'[NO-SHOW] Bereits vorhandene Notiz 🛡️');assert.equal(stored.legion,baseline.legion);assert.equal(stored.availability,baseline.availability);assert.equal(stored.combat_role,baseline.combat_role);
await page.evaluate(()=>fight.open(true));assert(await row.locator('[data-fight-no-show]').isChecked(),'Saved attendance reloads from event notes');assert.equal(await row.locator('[data-fight-note]').inputValue(),'Bereits vorhandene Notiz 🛡️');
await fight.locator('[data-fight-filter]').selectOption('no-show');assert.equal(await fight.locator('[data-fight-row]').count(),1);await fight.locator('[data-fight-filter]').selectOption('all');
await fight.locator('[data-fight-type]').selectOption('triforce');await fight.locator('[data-fight-date]').fill('2026-10-30');await fight.locator('[data-fight-date]').press('Tab');assert(!(await row.locator('[data-fight-no-show]').isChecked()),'No cross-event attendance');
await row.locator('[data-fight-no-show]').check();await row.locator('[data-fight-note]').fill('Tri: keine Rückmeldung');await saveAll();assert.equal((await writes()).at(-1).event_type,'triforce');
await fight.locator('[data-fight-date]').fill('2026-11-01');await fight.locator('[data-fight-date]').press('Tab');assert(!(await row.locator('[data-fight-no-show]').isChecked()),'No cross-date attendance');
await fight.locator('[data-fight-type]').selectOption('swordland');await fight.locator('[data-fight-date]').fill('2026-10-30');await fight.locator('[data-fight-date]').press('Tab');assert(await row.locator('[data-fight-no-show]').isChecked());
await row.locator('[data-fight-no-show]').uncheck();await saveAll();assert.equal((await writes()).at(-1).notes,'Bereits vorhandene Notiz 🛡️','Removing attendance preserves original note');
await row.locator('.fight-row-more').evaluate(e=>e.open=true);await row.locator('[data-fight-note]').fill('x'.repeat(500));await row.locator('[data-fight-no-show]').click();assert(!(await row.locator('[data-fight-no-show]').isChecked()),'Overlong note blocks marker without truncating');assert.equal((await row.locator('[data-fight-note]').inputValue()).length,500);await fight.locator('[data-roster-discard]').click();
await page.setViewportSize({width:390,height:844});await row.locator('[data-fight-no-show]').check();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await row.locator('[data-fight-note]').fill('Optionaler Vermerk');
fs.mkdirSync(path.join(root,'test-results/no-show'),{recursive:true});await fight.locator('.fight-roster').screenshot({path:path.join(root,'test-results/no-show/mobile.png')});assert.deepEqual(errors,[]);
const {readAttendanceNote,writeAttendanceNote}=await import(require('url').pathToFileURL(path.join(root,'leitung/fightclub-attendance.js')));assert.deepEqual(readAttendanceNote('hello [NO-SHOW]'),{noShow:false,note:'hello [NO-SHOW]'});assert.equal(writeAttendanceNote('',true),'[NO-SHOW]');assert.deepEqual(readAttendanceNote('[NO-SHOW]'),{noShow:true,note:''});
console.log('PASS: staged no-show, persisted/read back, optional note preserved, failure retry, event/date scope, filter, removal, 500-character safety, mobile, no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
