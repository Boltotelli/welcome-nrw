const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

const root=path.resolve(__dirname,'..'),tags=['NRW','NWO','THM','CWR','PxR','NwO'];

(async()=>{

 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});

 try{

  const context=await browser.newContext({viewport:{width:1440,height:1100},permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),errors=[],calls=[];

  page.setDefaultTimeout(12000);page.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER ERROR',e.message)});const documents=[],giftRuns=[],giftReceipts=[];let giftUnknown=true,giftCreateError=true,docLoadFail=false;const archive=[];let saved=null,conflict=false,allowed=true,searchError=false,apiError=false;

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



   if(body?.action==='tools_documents_load'&&docLoadFail)return r.fulfill({status:503,contentType:'application/json',body:'{"error":"test_unavailable"}'});
   if(body?.action==='tools_documents_load')result={ok:true,documents,laws:[{number:'9',title:{de:'Gesetz DE',en:'Law EN',fr:'Loi FR',es:'Ley ES'},body:{de:'DE Original',en:'EN Original',fr:'FR Original',es:'ES Original'}}]};

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

  const dialogs=[];page.on('dialog',dialog=>{dialogs.push(dialog.message());return dialog.dismiss();});

  const copySource=fs.readFileSync(path.join(root,'leitung/tools-workbench-locales.js'),'utf8').replace(/^export /gm,'');
  const dictionary=new Function(copySource+';return WORKBENCH_TRANSLATIONS;')();
  const expected={
   de:{notice:'Ankündigungs-Editor',rally:'Rally-Sync',territory:'Gebietskontrolle',gifts:'Geschenkcodes',search:'Brot',departure:'Abmarsch',arrive:'Ankunft',type:'Forschung',site:'Sanctuary 1',reward:'Gesundheitsbonus',titleError:'Bitte eine Bezeichnung eingeben.',delete:'Diesen gespeicherten Stand löschen?',giftConfirm:'Geschenkcode',law:'Gesetz DE'},
   en:{notice:'Announcement editor',rally:'Rally sync',territory:'Territory control',gifts:'Gift codes',search:'Bread',departure:'Departure',arrive:'Arrival',type:'Research',site:'Sanctuary 1',reward:'Health boost',titleError:'Please enter a title.',delete:'Delete this saved snapshot?',giftConfirm:'Redeem gift code',law:'Law EN'},
   fr:{notice:'Éditeur d’annonces',rally:'Synchronisation des ralliements',territory:'Contrôle du territoire',gifts:'Codes cadeaux',search:'Pain',departure:'Départ',arrive:'Arrivée',type:'Recherche',site:'Sanctuaire 1',reward:'Bonus de santé',titleError:'Veuillez saisir un titre.',delete:'Supprimer cet état enregistré ?',giftConfirm:'Échanger maintenant le code cadeau',law:'Loi FR'},
   es:{notice:'Editor de anuncios',rally:'Sincronización de rallies',territory:'Control del territorio',gifts:'Códigos de regalo',search:'Pan',departure:'Salida',arrive:'Llegada',type:'Investigación',site:'Santuario 1',reward:'Bonificación de salud',titleError:'Introduce un título.',delete:'¿Eliminar este estado guardado?',giftConfirm:'¿Canjear ahora el código',law:'Ley ES'}
  };
  const userText='Mein deutscher Text: Speichern, Brot und Forschung. <item_icon_101> '+String.fromCodePoint(0xe001);
  const userTitle='Mein deutscher Entwurf';
  async function language(lang){await page.locator('#language').selectOption(lang);await page.locator('.nav-item[data-tab="tools"]').filter({hasText:{de:'Tools',en:'Tools',fr:'Outils',es:'Herramientas'}[lang]}).waitFor();await page.locator('[data-tool="notice"]').filter({hasText:expected[lang].notice}).waitFor();}
  async function noGermanLeaks(lang){
   if(lang==='de')return;
   const strings=await page.locator('.wb').evaluate(el=>{
    const out=[],walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
    while(n=walk.nextNode()){if(!n.parentElement.closest('textarea,script,[data-wb-preview],[data-wb-laws],[data-wb-archive],datalist'))out.push(n.textContent.trim());}
    for(const item of el.querySelectorAll('[aria-label],[placeholder],[title]'))for(const attr of ['aria-label','placeholder','title'])if(item.hasAttribute(attr))out.push(item.getAttribute(attr));
    return out.filter(Boolean);
   });
   for(const key of Object.keys(dictionary.de)){
    if(key.length<6||dictionary[lang][key]===key||key.includes('{'))continue;
    for(const text of strings)assert(!text.includes(key),lang+' untranslated UI: '+JSON.stringify(text)+' / '+key);
   }
  }
  await page.goto('https://welcome-nrw.vercel.app/leitung/?tab=tools');await page.locator('[data-kvk-copy]').waitFor();
  await page.locator('[data-tool="notice"]').click();await page.locator('#wb-notice-text').fill(userText);await page.locator('[data-wb-field="title"]').fill(userTitle);
  await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:'Gemeinsam gespeichert'}).waitFor();
  await page.locator('[data-wb-color]').fill('#123456');await page.locator('details').filter({has:page.locator('[data-wb-kingdom]')}).locator('summary').click();await page.locator('[data-wb-kingdom]').fill('1044');await page.locator('[data-wb-x]').fill('742');await page.locator('[data-wb-y]').fill('564');
  for(const lang of ['de','en','fr','es']){
   await language(lang);await page.locator('[data-tool="notice"]').click();
   assert.equal(await page.locator('#wb-notice-text').inputValue(),userText);assert.equal(await page.locator('[data-wb-field="title"]').inputValue(),userTitle);
   assert.equal(await page.locator('[data-wb-color]').inputValue(),'#123456');assert.equal(await page.locator('[data-wb-x]').inputValue(),'742');
   assert.equal(await page.locator('[data-wb-icon-type="tag"]').count(),27);assert.equal(await page.locator('[data-wb-icon-type="special"]').count(),32);
   await page.locator('[data-wb-icon-search]').fill(expected[lang].search);assert.equal(await page.locator('[data-wb-icon]:visible').count(),2);await page.locator('[data-wb-icon-search]').fill('');
   await page.locator('[data-wb-action="copy"]').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),userText);
   await page.locator('[data-wb-field="title"]').fill('');await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:expected[lang].titleError}).waitFor();await page.locator('[data-wb-field="title"]').fill(userTitle);
   await page.locator('[data-wb-action="delete"]').click();assert.equal(dialogs.at(-1),expected[lang].delete);
   docLoadFail=true;await page.locator('[data-wb-action="reload"]').click();await page.locator('[data-wb-status]').filter({hasText:dictionary[lang]['Gespeicherte Stände konnten nicht geladen werden. Bitte erneut versuchen.']}).waitFor();docLoadFail=false;
   await noGermanLeaks(lang);
   await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'notice '+lang);await page.setViewportSize({width:1440,height:1100});
  }
  await language('de');await page.locator('[data-tool="rally"]').click();await page.locator('[data-wb-field="title"]').fill('Mein Rally-Plan');await page.locator('[data-wb-field="date"]').fill('2026-01-01');await page.locator('[data-wb-leader-field="name"]').fill('Alpha NRW');
  for(const lang of ['de','en','fr','es']){
   await language(lang);await page.locator('[data-tool="rally"]').click();assert.equal(await page.locator('[data-wb-field="title"]').inputValue(),'Mein Rally-Plan');assert.equal(await page.locator('[data-wb-leader-field="name"]').inputValue(),'Alpha NRW');
   await page.locator('[data-wb-leader-field="march"]').fill('01:90');await page.locator('[data-wb-rally-error]').filter({hasText:dictionary[lang]['Zeiten bitte als Minuten:Sekunden eingeben, z. B. 05:30.']}).waitFor();await page.locator('[data-wb-leader-field="march"]').fill('01:30');
   assert((await page.locator('[data-wb-rally-result]').innerText()).includes(expected[lang].departure));await page.locator('[data-wb-action="copy"]').click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert(copied.includes(expected[lang].departure));assert(copied.includes(expected[lang].arrive));assert(copied.includes('Alpha NRW'));assert(!copied.includes('${'));
   await noGermanLeaks(lang);await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'rally '+lang);await page.setViewportSize({width:1440,height:1100});
  }
  await language('de');await page.locator('[data-tool="territory"]').click();assert.equal(await page.locator('[data-wb-field="phase"]').inputValue(),'4');await page.locator('.wb-reward img').first().waitFor();assert(await page.locator('.wb-reward img').evaluateAll(imgs=>Promise.all(imgs.map(async img=>{img.loading="eager";await img.decode();return img.naturalWidth>0&&Boolean(img.alt);}))).then(a=>a.every(Boolean)));await page.locator('[data-wb-field="title"]').fill('Meine Woche');await page.locator('[data-wb-field="phase"]').selectOption('2');await page.locator('[data-wb-site="sanc-1"] [data-wb-site-field="reward"]').fill('Eigene deutsche Notiz');await page.locator('[data-wb-action="add-outpost"]').click();await page.locator('[data-wb-outpost-field="type"]').selectOption('Forschung');await page.locator('[data-wb-outpost-field="owned"]').check();await page.locator('[data-wb-outpost-field="connected"]').check();
  for(const lang of ['de','en','fr','es']){
   await language(lang);await page.locator('[data-tool="territory"]').click();await page.locator('[data-wb-action="reload"]').click();await page.locator('[data-wb-status]').filter({hasText:dictionary[lang]['Gespeicherte Stände geladen. Aktuelle Eingaben bleiben erhalten.']}).waitFor();
   assert((await page.locator('[data-wb-site="sanc-1"]').innerText()).includes(expected[lang].site));assert((await page.locator('[data-wb-site="sanc-1"]').innerText()).includes(expected[lang].reward));
   assert.equal(await page.locator('[data-wb-outpost-field="type"]').inputValue(),'Forschung');assert.equal(await page.locator('[data-wb-outpost-field="type"] option:checked').innerText(),expected[lang].type);
   assert((await page.locator('[data-wb-laws]').textContent()).includes(expected[lang].law));
   await page.locator('[data-wb-action="copy"]').click();const text=await page.evaluate(()=>navigator.clipboard.readText());assert(text.includes(expected[lang].site));assert(text.includes('Eigene deutsche Notiz'));
   assert.equal(await page.locator('[data-wb-field="phase"]').inputValue(),'2');assert(await page.locator('.wb-reward img').evaluateAll(imgs=>Promise.all(imgs.map(async img=>{img.loading="eager";await img.decode();return Boolean(img.alt)&&img.naturalWidth>0;}))).then(a=>a.every(Boolean)));await noGermanLeaks(lang);await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'territory '+lang);await page.setViewportSize({width:1440,height:1100});
  }
  await page.locator('[data-wb-action="save"]').click();await page.locator('[data-wb-status]').filter({hasText:dictionary.es['Gemeinsam gespeichert.']}).waitFor();assert.equal(documents.find(d=>d.kind==='territory').data.outposts[0].type,'Forschung');
  await page.locator('[data-tool="gifts"]').click();await page.locator('[data-wb-gift-recipient="111"]').waitFor();await page.locator('[data-wb-gift-code]').fill('UNCHANGED-CODE');await page.locator('[data-wb-gift-filter]').fill('Alpha');
  const seeded={id:'99999999-9999-4999-8999-999999999999',code:'OLD-CODE',created_at:'2026-11-04T10:00:00Z',recipients:[{game_id:'111',name:'Alpha',kingdom_id:1044},{game_id:'222',name:'Beta',kingdom_id:1044},{game_id:'333',name:'External Alt',kingdom_id:1044}]};giftRuns.push(seeded);giftReceipts.push({game_id:'111',status:'already'},{game_id:'222',status:'failed',provider_code:40020},{game_id:'333',status:'unknown'});await page.locator('[data-wb-action="gift-load"]').click();await page.locator('[data-wb-gift-run]').selectOption(seeded.id);await page.locator('[data-wb-gift-results] tbody tr').first().waitFor();
  for(const lang of ['de','en','fr','es']){
   await language(lang);await page.locator('[data-tool="gifts"]').click();assert.equal(await page.locator('[data-wb-gift-code]').inputValue(),'UNCHANGED-CODE');assert.equal(await page.locator('[data-wb-gift-filter]').inputValue(),'Alpha');assert(await page.locator('[data-wb-gift-recipient="111"]').isChecked());
   const results=await page.locator('[data-wb-gift-results]').innerText();assert(results.includes(dictionary[lang]['Bereits eingelöst']));assert(results.includes(dictionary[lang]['Spieler-ID oder Königreich prüfen']));assert(results.includes(dictionary[lang]['Ergebnis unbekannt']));
   await page.locator('[data-wb-action="gift-start"]').click();assert(dialogs.at(-1).startsWith(expected[lang].giftConfirm));assert(dialogs.at(-1).includes('UNCHANGED-CODE'));assert(!dialogs.at(-1).includes('{count}'));
   await page.locator('[data-wb-action="gift-unknown-retry"]').click();assert.equal(dialogs.at(-1),dictionary[lang]['Das Ergebnis ist unbekannt. Der Code könnte bereits eingelöst sein. Für diesen Spieler bewusst erneut versuchen?']);
   await noGermanLeaks(lang);await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'gifts '+lang);await page.setViewportSize({width:1440,height:1100});
  }
  fs.mkdirSync(path.join(root,'tests/artifacts'),{recursive:true});await page.locator('[data-tool="notice"]').click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(root,'tests/artifacts/tools-i18n-es-desktop.png')});await language('fr');await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(root,'tests/artifacts/tools-i18n-fr-mobile.png'),fullPage:true});
  assert.equal(calls.filter(c=>c.action==='tools_gifts_step').length,0);assert.deepEqual(errors,[]);
  console.log('PASS: DE/EN/FR/ES navigation and all four tools; no German UI leaks; translated icon labels/search, placeholders, errors, dialogs, provider statuses, laws, reward/type labels and clipboard outputs; draft/color/coordinate/filter preservation; unchanged stored IDs/types and game tags; mobile overflow; no real redemption.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
