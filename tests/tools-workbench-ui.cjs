const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

const root=path.resolve(__dirname,'..'),tags=['NRW','NWO','THM','CWR','PxR','NwO'];

(async()=>{

 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});

 try{

  const context=await browser.newContext({viewport:{width:1440,height:1100},permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),errors=[],calls=[];

  page.setDefaultTimeout(12000);page.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER ERROR',e.message)});const documents=[],giftRuns=[],giftReceipts=[];let giftUnknown=true,giftCreateError=true;const archive=[];let saved=null,conflict=false,allowed=true,searchError=false,apiError=false;

  await page.addInitScript(()=>localStorage.setItem('nrw_theme','dark'));

  await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',r=>r.fulfill({contentType:'application/javascript',body:"export const createClient=()=>({auth:{getSession:async()=>({data:{session:{access_token:'TEST-ONLY'}}}),signOut:async()=>({})}});"}));

  await page.route('https://bdzlgirowutasrsycjfj.supabase.co/**',async r=>{

   const mode=new URL(r.request().url()).searchParams.get('mode'),body=r.request().postDataJSON();if(body)calls.push(body);

   const alliance={code:'NRW',name:'NRW',kingdom_id:1044,languages:['de','en','fr','es'],default_language:'de',capacity:100};

   const boot={alliance,staff:{rank:'R4',is_owner:false,permissions:{tools:allowed}},players:[],externalAlts:[]};for(const k of ['laws','transfers','events','internalMoves','eventMessages','eventGuidance','eventCycles','eventDayTemplates','transferWindows','lawVersions','lawPublications','auditTrail','staffMembers','transferContacts'])boot[k]=[];

   let result=mode==='public-leaders'?{leaders:[]}:mode==='public-config'?{alliance}:!body?boot:{ok:true};

   if(body?.action==='tools_kvk_load')result={ok:true,item:body.run_id?archive.find(x=>x.id===body.run_id)||null:saved,runs:archive.map(x=>({id:x.id,title:x.data.title,snapshot_date:x.data.snapshot_date,version:x.version,updated_at:x.updated_at}))};

   if(body?.action==='tools_kvk_save'){

    if(conflict)return r.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'tools_version_conflict'})});

    saved={id:body.run_id,data:body.data,version:body.version+1,updated_at:'2026-11-04T10:00:00Z'};const old=archive.findIndex(x=>x.id===body.run_id);if(old>=0)archive.splice(old,1);archive.push(saved);result={ok:true,item:saved};

   }

   if(body?.action==='tools_player_lookup'){

    if(searchError)return r.fulfill({status:500,contentType:'application/json',body:'{"error":"database_error"}'});

    result={ok:true,player:body.game_id==='404'?{found:false,game_id:'404'}:{found:true,game_id:body.game_id,name:'Player <img src=x onerror=alert(1)>',alliance:'NWO',previous_names:[{name:'Old Name'},{name:'<script>alert(1)</script>'}],active_count:2,total_count:5,deleted_count:1,deleted_ambiguous_count:2,tracked:true,alliance_history:[{from_alliance:'NRW',to_alliance:'NWO',moved_at:'2026-10-01T00:00:00Z'},{from_alliance:'THM',to_alliance:'NRW',moved_at:'2026-09-01T00:00:00Z'}],profile:{game_id:body.game_id,name:'Cached player',kingdom_id:1044,power:311100000,tc_level:60,mystic_trial:1522,source:'supabase',fetched_at:'2026-11-04T00:00:00Z'},deleted_match:'historical_name',as_of:'2026-11-04T10:00:00Z'}};

   }

   if(body?.action==='tools_player_refresh'&&apiError)return r.fulfill({status:429,contentType:'application/json',body:'{"error":"provider_rate_limited"}'});

   if(body?.action==='tools_player_refresh')result={ok:true,source:'mightpulse',player:{found:true,tracked:false,game_id:body.game_id,name:'Foreign player',alliance:'OUT',previous_names:[],alliance_history:[],active_count:null,total_count:null,deleted_count:null,profile:{game_id:body.game_id,name:'Foreign player',kingdom_id:1337,kills:15400000,migrant_score:794635,power_rank:152,source:'mightpulse',fetched_at:'2026-11-04T01:00:00Z'},as_of:'2026-11-04T01:00:00Z'}};



   if(body?.action==='tools_documents_load')result={ok:true,documents,laws:[{number:'9',title:{de:'Sanctuary-Auswahl'},body:{de:'Auswahl nach normalisiertem KvK-Prep-Score'}}]};

   if(body?.action==='tools_document_save'){

    const old=documents.find(x=>x.id===body.id);if(old&&old.version!==body.version)return r.fulfill({status:409,contentType:'application/json',body:'{"error":"tools_document_conflict"}'});

    const item={id:body.id,kind:body.kind,title:body.title,data:body.data,version:body.version+1,updated_at:'2026-11-04T20:00:00Z'};if(old)documents.splice(documents.indexOf(old),1);documents.push(item);result={ok:true,item};

   }

   if(body?.action==='tools_document_delete'){const i=documents.findIndex(x=>x.id===body.id);documents.splice(i,1);result={ok:true};}

   if(body?.action==='tools_gifts_load')result={ok:true,runs:giftRuns,candidates:[{game_id:'111',name:'Alpha <script>',kingdom_id:1044,external:false},{game_id:'222',name:'Beta',kingdom_id:1044,external:false},{game_id:'333',name:'External Alt',kingdom_id:null,external:true}]};

   if(body?.action==='tools_gifts_create'){if(giftCreateError){giftCreateError=false;return r.fulfill({status:503,contentType:'application/json',body:'{"error":"gift_test_unavailable"}'});}const item={id:'11111111-1111-4111-8111-111111111111',code:body.code,recipients:body.recipients,created_at:'2026-11-04T20:00:00Z'};giftRuns.push(item);result={ok:true,item};}

   if(body?.action==='tools_gifts_status')result={ok:true,item:giftRuns.find(x=>x.id===body.run_id),receipts:giftReceipts};

   if(body?.action==='tools_gifts_step'){

    const status=body.game_id==='222'&&giftUnknown?'unknown':body.retry?'already':'success';if(body.game_id==='222')giftUnknown=false;const receipt={game_id:body.game_id,status,retryable:false};const old=giftReceipts.findIndex(x=>x.game_id===body.game_id);if(old>=0)giftReceipts.splice(old,1);giftReceipts.push(receipt);result={ok:true,status,pause:status==='unknown'};

   }

   return r.fulfill({contentType:'application/json',body:JSON.stringify(result)});

  });

  if(!process.env.TOOLS_LIVE_ASSETS)await page.route('https://welcome-nrw.vercel.app/**',r=>{

   let file=path.join(root,new URL(r.request().url()).pathname);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');

   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});

   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'image/svg+xml'});

  });

  page.on('dialog',dialog=>dialog.accept());

  await page.goto('https://welcome-nrw.vercel.app/leitung/?tab=tools');await page.locator('[data-kvk-copy]').waitFor();

  console.log('Testing next tool');await page.locator('[data-tool="notice"]').click();await page.locator('#wb-notice-text').fill('Hallo NRW');assert(await page.locator('#wb-notice-text').evaluate(el=>el.getBoundingClientRect().height>=300),'Editor has sufficient writing space');

  await page.locator('#wb-notice-text').evaluate(el=>{el.focus();el.setSelectionRange(6,9);el.dispatchEvent(new Event('select',{bubbles:true}));});

  await page.locator('[data-wb-action="wrap"]').first().click();assert.equal(await page.locator('#wb-notice-text').inputValue(),'Hallo <b>NRW</b>');

  await page.locator('[data-wb-field="title"]').fill('Willkommen');await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:'Gemeinsam gespeichert'}).waitFor();assert.equal(documents.length,1);

  assert.equal(await page.locator('[data-wb-icon-type="tag"]').count(),27);assert.equal(await page.locator('[data-wb-icon-type="special"]').count(),32);
  const reference=require('./fixtures/notice-palette-reference.json'),notice=page.locator('#wb-notice-text');
  await notice.fill('BEGINEND');await notice.evaluate(el=>{el.focus();el.setSelectionRange(5,5);el.dispatchEvent(new Event('select',{bubbles:true}));});
  for(const id of reference.itemTagIds)await page.locator('[data-wb-icon="tag-'+id+'"]').click();
  await page.locator('[data-wb-icon-group]').nth(1).locator('summary').click();
  for(const code of reference.specialCodepoints)await page.locator('[data-wb-icon="char-'+code+'"]').click();
  const expectedPalette='BEGIN'+reference.itemTagIds.map(id=>'<item_icon_'+id+'>').join('')+reference.specialCodepoints.map(h=>String.fromCodePoint(parseInt(h,16))).join('')+'END';
  assert.equal(await notice.inputValue(),expectedPalette);await page.locator('[data-wb-action="copy"]').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expectedPalette);
  await page.locator('[data-wb-icon-search]').fill('speedup');assert.equal(await page.locator('[data-wb-icon]:visible').count(),8);
  await page.locator('[data-wb-icon-search]').fill('zzzz-no-result');assert(await page.locator('[data-wb-icon-empty]').isVisible());assert.equal(await notice.inputValue(),expectedPalette);
  await page.locator('[data-wb-icon-search]').fill('');
  // Lazy previews are checked as they come into view, including the final palette row.
  for(const image of await page.locator('.wb-icon-grid img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());assert(await image.evaluate(el=>el.naturalWidth>0));}
  await page.locator('[data-wb-icon-group]').nth(1).locator('summary').click();
  await notice.fill('Hallo NRW!\n\n<b>Gemeinsam bereit für KvK.</b>\n<item_icon_102> Ressourcen sparen\n<item_icon_200301> Beschleuniger bereithalten');await page.evaluate(()=>window.scrollTo(0,0));fs.mkdirSync(path.join(root,'tests/artifacts'),{recursive:true});await page.screenshot({path:path.join(root,'tests/artifacts/notice-palette-desktop.png')});
  await notice.fill('Hallo <b>NRW</b>');await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:'Gemeinsam gespeichert'}).waitFor();
  console.log('PASS: all 59 icon buttons insert exact reference output and survive clipboard; search and 22 local previews');
  console.log('Testing next tool');await page.locator('[data-tool="rally"]').click();await page.locator('[data-wb-field="title"]').fill('Burg');await page.locator('[data-wb-field="date"]').fill('2026-11-05');await page.locator('[data-wb-field="time"]').fill('00:01:00');await page.locator('[data-wb-leader-field="name"]').fill('Alpha');await page.locator('[data-wb-leader-field="march"]').fill('01:30');assert((await page.locator('[data-wb-rally-result]').innerText()).includes('2026-11-04 23:54:30 UTC'));

  await page.locator('[data-wb-action="add-leader"]').click();await page.locator('[data-wb-leader-field="name"]').nth(1).fill('Beta');await page.locator('[data-wb-field="gap"]').fill('30');assert((await page.locator('[data-wb-rally-result]').innerText()).includes('00:01:30 UTC'));

  await page.locator('[data-wb-action="copy"]').click();assert((await page.evaluate(()=>navigator.clipboard.readText())).includes('Alpha'));

  await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:'Gemeinsam gespeichert'}).waitFor();

  console.log('Testing next tool');await page.locator('[data-tool="notice"]').click();assert.equal(await page.locator('#wb-notice-text').inputValue(),'Hallo <b>NRW</b>');

  console.log('Testing next tool');await page.locator('[data-tool="territory"]').click();await page.locator('[data-wb-field="title"]').fill('Woche 45');await page.locator('[data-wb-field="phase"]').selectOption('2');assert.equal(await page.locator('[data-wb-site]').count(),16);assert((await page.locator('[data-wb-site="sanc-1"]').innerText()).includes('Gesundheitsbonus'));

  await page.locator('[data-wb-site="sanc-1"] [data-wb-site-field="assigned"]').fill('NRW');await page.locator('[data-wb-action="add-outpost"]').click();await page.locator('[data-wb-outpost-field="name"]').fill('Posten 1');await page.locator('[data-wb-outpost-field="owned"]').check();await page.locator('[data-wb-outpost-field="connected"]').check();assert((await page.locator('[data-wb-outpost-summary]').innerText()).startsWith('1 aktive'));

  await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:'Gemeinsam gespeichert'}).waitFor();assert.equal(documents.length,3);

  const out=path.join(root,'tests/artifacts');fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'tools-territory-desktop.png'),fullPage:true});

  console.log('Testing next tool');await page.locator('[data-tool="gifts"]').click();await page.locator('[data-wb-gift-recipient="111"]').waitFor();assert(await page.locator('[data-wb-gift-recipient="111"]').isChecked());assert(!await page.locator('[data-wb-gift-recipient="333"]').isChecked());assert.equal(await page.locator('.wb-gift-recipients script').count(),0);

  await page.locator('[data-wb-gift-code]').fill('TEST-ONLY');await page.locator('[data-wb-action="gift-start"]').click();await page.locator('[data-wb-status]').filter({hasText:'Aktion fehlgeschlagen'}).waitFor();assert(await page.locator('[data-wb-action="gift-start"]').isEnabled());await page.locator('[data-wb-action="gift-start"]').click();await page.locator('[data-wb-status]').filter({hasText:'pausiert'}).waitFor();await page.locator('[data-wb-action="gift-unknown-retry"]').waitFor();assert.equal(calls.filter(c=>c.action==='tools_gifts_step').length,2);

  await page.locator('[data-wb-action="gift-unknown-retry"]:not([disabled])').click();await page.locator('[data-wb-gift-progress]').filter({hasText:'2 / 2 bestätigt'}).waitFor();assert.equal(calls.filter(c=>c.action==='tools_gifts_step').length,3);assert.equal(calls.filter(c=>c.action==='tools_gifts_step'&&c.game_id==='111').length,1);

  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'tools-gifts-mobile.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));

  for(const tool of ['notice','rally','territory']){await page.locator(`[data-tool="${tool}"]`).click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),tool+' mobile overflow');await page.screenshot({path:path.join(out,'tools-'+tool+'-mobile.png'),fullPage:true});}

  console.log('Testing next tool');await page.locator('[data-tool="notice"]').click();await page.locator('[data-wb-action="clone"]').click();await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:'Gemeinsam gespeichert'}).waitFor();assert.equal(documents.length,4);

  allowed=false;await page.goto('https://welcome-nrw.vercel.app/leitung/?tab=tools');await page.locator('#liveArea').waitFor();assert(await page.locator('.nav-item[data-tab="tools"]').isHidden());assert.deepEqual(errors,[]);

  console.log('PASS: integrated Editor cursor formatting and shared templates; UTC midnight Rally-Sync and clipboard; 16 phase-dependent buildings, outpost ownership/connection, saved weeks; gift bulk only, defaults, persistent receipts, pause on unknown, deliberate retry without duplicate successes; mobile four tools; escaped names; access hidden; no browser errors. All provider calls mocked.');

 }finally{await browser.close();}

})().catch(e=>{console.error(e);process.exitCode=1;});

