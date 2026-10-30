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

const fight=page.locator('#fightclubRoot'),bear=page.locator('#bearManagementRoot');
const fc=page.locator('[data-fight-row="10001"]'),fc2=page.locator('[data-fight-row="10002"]'),bc=page.locator('[data-bear-row="10001"]'),bc2=page.locator('[data-bear-row="10002"]');
const writes=()=>page.evaluate(()=>calls.filter(c=>['fightclub_save','bear_assignment'].includes(c.action)));
async function saveAll(root){await root.locator('[data-roster-save-all]').click();await page.waitForFunction(sel=>document.querySelector(sel+' .roster-batch-actions')?.getAttribute('aria-busy')==='false',await root.getAttribute('id').then(id=>'#'+id));}
assert((await fc.innerText()).includes('54.321'));assert(!(await fc.innerText()).includes('999.999.999'));
assert.equal(await fight.locator('[data-fight-save]').count(),0,'No individual row save buttons');
await fc.locator('[data-fight-check="1"]').check();await fc2.locator('[data-fight-check="2"]').check();
assert.equal((await writes()).length,0,'Checkbox edits do not write');assert.equal(await fight.locator('[data-roster-dirty]').count(),2);
await fc.locator('.fight-row-more').evaluate(e=>e.open=true);await fc.locator('[data-fight-note]').fill('Gemeinsamer Entwurf 🛡️');
await fight.locator('[data-fight-search]').fill('Score fehlt');assert.equal(await fight.locator('[data-fight-row]').count(),1);
await page.evaluate(()=>window.failId='10002');await saveAll(fight);let saved=await writes();assert.equal(saved.length,2);assert.equal(saved[0].notes,'Gemeinsamer Entwurf 🛡️');
assert.equal(await fight.locator('[data-roster-dirty]').count(),1,'Only failed rows stay dirty');assert(await fight.locator('[data-roster-save-all]').isEnabled());
await page.evaluate(()=>window.failId=null);await saveAll(fight);saved=await writes();assert.equal(saved.length,3);assert.equal(saved[2].game_id,'10002','Retry does not repeat successful row');
await fight.locator('[data-fight-search]').fill('');assert(await fc.locator('[data-fight-check="1"]').isChecked());assert(await fc2.locator('[data-fight-check="2"]').isChecked());
await fc.locator('[data-fight-check="2"]').check();assert(!(await fc.locator('[data-fight-check="1"]').isChecked()));
await fight.locator('[data-fight-type]').selectOption('triforce');await fight.locator('[data-fight-date]').fill('2026-10-30');await fight.locator('[data-fight-date]').press('Tab');assert(await fight.locator('[data-roster-save-all]').isDisabled(),'Drafts cannot leak across events');
await fc.locator('[data-fight-check="1"]').check();await saveAll(fight);assert.equal((await writes()).at(-1).event_type,'triforce');
await fight.locator('[data-fight-type]').selectOption('swordland');await fight.locator('[data-fight-date]').fill('2026-10-30');await fight.locator('[data-fight-date]').press('Tab');assert(await fc.locator('[data-fight-check="2"]').isChecked(),'Old event draft retained');
await page.evaluate(()=>fight.open(true));assert(await fc.locator('[data-fight-check="2"]').isChecked(),'Refresh retains drafts');
await fight.locator('[data-roster-discard]').click();assert(await fc.locator('[data-fight-check="1"]').isChecked(),'Discard restores saved state');
await fc.locator('[data-fight-check="1"]').uncheck();await saveAll(fight);assert.equal((await writes()).at(-1).legion,-1,'Uncheck is saved centrally');
await bc.locator('[data-bear-check="bear-1"]').check();await bc.locator('[data-bear-check="bear-2"]').check();assert(!(await bc.locator('[data-bear-check="bear-1"]').isChecked()));
await bc2.locator('[data-bear-check="bear-1"]').check();const before=(await writes()).length;
await bc.locator('[data-bear-role]').check();await bc.locator('.bear-row-more').evaluate(e=>e.open=true);await bc.locator('[data-bear-note]').fill('BT2 Entwurf');
await bear.locator('[data-bear-search]').fill('Score fehlt');assert.equal((await writes()).length,before,'Bear edits do not write');
await page.evaluate(()=>window.failId='10002');await saveAll(bear);assert.equal((await writes()).length,before+2);assert.equal(await bear.locator('[data-roster-dirty]').count(),1);
await page.evaluate(()=>window.failId=null);await saveAll(bear);assert.equal((await writes()).length,before+3);
const bearWrites=(await writes()).filter(x=>x.action==='bear_assignment');assert.equal(bearWrites[0].slot_key,'bear-2');assert.equal(bearWrites[0].role,'joiner');assert.equal(bearWrites[0].notes,'BT2 Entwurf');
await bear.locator('[data-bear-search]').fill('');await bc.locator('[data-bear-check="bear-2"]').uncheck();await saveAll(bear);assert.equal((await writes()).at(-1).slot_key,'');
for(const [team,text] of [[3,'Early Occupation & fast support for North/South.\nStay mobile and help wherever needed.'],[2,'Capture NORTH as quickly as possible.\nJoin rallies and reinforce occupied strongholds.'],[1,'Capture SOUTH as quickly as possible.\nJoin rallies and reinforce occupied strongholds.']]){await page.locator('[data-map-copy-team="'+team+'"]').click();assert((await page.evaluate(()=>copied)).endsWith(text.replaceAll('\n','\n')));}
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390,'No page overflow');
const keyboardBefore=(await writes()).length;await fc.locator('[data-fight-check="1"]').focus();await page.keyboard.press('Space');assert.equal((await writes()).length,keyboardBefore,'Keyboard also stages changes');await saveAll(fight);assert.equal((await writes()).length,keyboardBefore+1);
await fc.locator('[data-fight-check="2"]').check();await fc.locator('[data-fight-check="1"]').check();assert(await fight.locator('[data-roster-save-all]').isDisabled(),'Returning to saved selection clears draft');
fs.mkdirSync(path.join(root,'test-results/oct30-bulk'),{recursive:true});await fight.locator('.fight-roster').screenshot({path:path.join(root,'test-results/oct30-bulk/mobile.png')});
assert.deepEqual(errors,[]);console.log('PASS: no writes while editing; save all including filtered rows; partial failure and retry; notes/roles; event-scoped drafts; refresh/discard; Bear matrix; keyboard/mobile; no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
