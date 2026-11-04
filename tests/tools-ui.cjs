const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),tags=['NRW','NWO','THM','CWR','PxR','NwO'];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1100},permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),errors=[],calls=[];
  page.on('pageerror',e=>errors.push(e.message));let saved=null,conflict=false,allowed=true,searchError=false;
  await page.addInitScript(()=>localStorage.setItem('nrw_theme','dark'));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',r=>r.fulfill({contentType:'application/javascript',body:"export const createClient=()=>({auth:{getSession:async()=>({data:{session:{access_token:'TEST-ONLY'}}}),signOut:async()=>({})}});"}));
  await page.route('https://bdzlgirowutasrsycjfj.supabase.co/**',async r=>{
   const mode=new URL(r.request().url()).searchParams.get('mode'),body=r.request().postDataJSON();if(body)calls.push(body);
   const alliance={code:'NRW',name:'NRW',kingdom_id:1044,languages:['de','en','fr','es'],default_language:'de',capacity:100};
   const boot={alliance,staff:{rank:'R4',is_owner:false,permissions:{tools:allowed}},players:[],externalAlts:[]};for(const k of ['laws','transfers','events','internalMoves','eventMessages','eventGuidance','eventCycles','eventDayTemplates','transferWindows','lawVersions','lawPublications','auditTrail','staffMembers','transferContacts'])boot[k]=[];
   let result=mode==='public-leaders'?{leaders:[]}:mode==='public-config'?{alliance}:!body?boot:{ok:true};
   if(body?.action==='tools_kvk_load')result={ok:true,item:saved};
   if(body?.action==='tools_kvk_save'){
    if(conflict)return r.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'tools_version_conflict'})});
    saved={data:body.data,version:(saved?.version||0)+1,updated_at:'2026-11-04T10:00:00Z'};result={ok:true,item:saved};
   }
   if(body?.action==='tools_player_lookup'){
    if(searchError)return r.fulfill({status:500,contentType:'application/json',body:'{"error":"database_error"}'});
    result={ok:true,player:body.game_id==='404'?{found:false,game_id:'404'}:{found:true,game_id:body.game_id,name:'Player <img src=x onerror=alert(1)>',alliance:'NWO',previous_names:[{name:'Old Name'},{name:'<script>alert(1)</script>'}],active_count:2,total_count:5,deleted_count:1,deleted_ambiguous_count:2,deleted_match:'historical_name',as_of:'2026-11-04T10:00:00Z'}};
   }
   return r.fulfill({contentType:'application/json',body:JSON.stringify(result)});
  });
  await page.route('https://welcome-nrw.vercel.app/**',r=>{
   let file=path.join(root,new URL(r.request().url()).pathname);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});
   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'image/svg+xml'});
  });
  await page.goto('https://welcome-nrw.vercel.app/leitung/?tab=tools');await page.locator('[data-kvk-copy]').waitFor();assert(await page.locator('.nav-item[data-tab="tools"]').isVisible());
  assert(await page.locator('[data-kvk-copy]').isDisabled());assert.equal(calls.filter(c=>c.action==='tools_player_lookup').length,0);
  for(const tag of tags){await page.locator(`[data-kvk-tag="${tag}"][data-kvk-key="power"]`).fill('1.000.000.000');await page.locator(`[data-kvk-tag="${tag}"][data-kvk-key="members"]`).fill('100');}
  const points=[32000000,40000000,20000000,10000000,5000000,3000000];
  for(let i=0;i<tags.length;i++)await page.locator(`[data-kvk-tag="${tags[i]}"][data-kvk-key="score"]`).fill(String(points[i]));
  await page.locator('[name="kvk-title"]').fill('KvK 20');await page.locator('[name="kvk-date"]').fill('2026-11-02');
  assert.equal(await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').inputValue(),'32.000.000');
  assert.equal(await page.locator('[data-kvk-ranking] tbody tr').first().locator('th').innerText(),'NWO');
  await page.locator('[data-kvk-copy]').click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert(copied.startsWith('1. NWO - '));assert.equal(copied.split('\n').length,6);assert.match(copied,/6\. NwO - \d+,\d{3}/);
  await page.locator('[data-tools-save]').click();await page.locator('[data-tools-save-state]').filter({hasText:'Gemeinsam gespeichert'}).waitFor();assert.equal(saved.data.alliances.NRW.power,1000000000);
  await page.locator('[data-kvk-period="day1"]').click();assert.equal(await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').inputValue(),'');
  await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').fill('0');assert(await page.locator('[data-kvk-copy]').isDisabled());
  await page.locator('[data-kvk-period="overall"]').click();assert.equal(await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').inputValue(),'32.000.000');
  await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').fill('1,234');assert(await page.locator('[data-tools-save]').isDisabled());assert(await page.locator('[data-kvk-copy]').isDisabled());
  await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').fill('33000000');
  conflict=true;await page.locator('[data-tools-save]').click();await page.locator('[data-tools-message]').filter({hasText:'inzwischen geändert'}).waitFor();assert.equal(await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').inputValue(),'33.000.000');assert(await page.locator('[data-tools-save]').isDisabled());
  page.once('dialog',d=>d.accept());await page.locator('[data-tools-reload]').click();await page.locator('[data-kvk-copy]').waitFor();assert.equal(await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').inputValue(),'32.000.000');
  await page.locator('.tools-snapshot summary').click();
  const out=path.join(root,'tests/artifacts');fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'tools-kvk-desktop.png'),fullPage:true});
  await page.locator('[data-tool="lookup"]').click();await page.locator('#tools-player-id').fill('123456789');await page.locator('[data-tools-search] button').click();await page.locator('.tools-counts').waitFor();
  assert.deepEqual(await page.locator('.tools-counts strong').allTextContents(),['2','5','1']);assert.equal(await page.locator('.tools-name-list li').count(),2);assert.equal(await page.locator('[data-tools-search-result] img,[data-tools-search-result] script').count(),0);assert((await page.locator('[data-tools-search-result]').innerText()).includes('<script>'));
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'tools-lookup-mobile.png'),fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow on mobile');
  await page.locator('#tools-player-id').fill('404');await page.locator('[data-tools-search] button').click();await page.locator('[data-tools-search-result]').filter({hasText:'noch keine Daten'}).waitFor();
  searchError=true;await page.locator('#tools-player-id').fill('123');await page.locator('[data-tools-search] button').click();await page.locator('[data-tools-search-status]').filter({hasText:'fehlgeschlagen'}).waitFor();assert.equal(await page.locator('[data-tools-search-result]').innerText(),'');
  await page.locator('[data-tool="kvk"]').click();await page.screenshot({path:path.join(out,'tools-kvk-mobile.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#language').selectOption('en');await page.locator('[data-tool="lookup"]').filter({hasText:'Find player'}).waitFor();assert.equal(await page.locator('[data-kvk-tag="NRW"][data-kvk-key="score"]').inputValue(),'32.000.000');
  allowed=false;await page.goto('https://welcome-nrw.vercel.app/leitung/?tab=tools');await page.locator('#liveArea').waitFor();assert(await page.locator('.nav-item[data-tab="tools"]').isHidden());assert(await page.locator('[data-page="tools"]').isHidden());
  assert.deepEqual(errors,[]);console.log('PASS: full app Tools route and permissions; snapshot/raw-point inputs and formatting; distinct NWO/NwO; independent daily/overall values; chat clipboard; shared save/conflict protection; safe player lookup with separate deletion count; not-found/error; mobile overflow; language and drafts preserved; no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
