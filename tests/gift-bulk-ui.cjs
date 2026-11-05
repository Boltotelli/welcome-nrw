const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

const root=path.resolve(__dirname,'..'),tags=['NRW','NWO','THM','CWR','PxR','NwO'];

(async()=>{

 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});

 try{

  const page=await browser.newPage(),calls=[],errors=[],receipts=[];
  const candidates=['111','222','333','444'].map(game_id=>({game_id,name:'Player '+game_id,kingdom_id:1044,external:false}));
  let run,waited=false,firstFinished;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',r=>r.fulfill({contentType:'application/javascript',body:"export const createClient=()=>({auth:{getSession:async()=>({data:{session:{access_token:'TEST-ONLY'}}}),signOut:async()=>({})}});"}));
  await page.route('https://bdzlgirowutasrsycjfj.supabase.co/**',async r=>{
   const mode=new URL(r.request().url()).searchParams.get('mode'),body=r.request().postDataJSON();
   const alliance={code:'NRW',name:'NRW',kingdom_id:1044,languages:['de','en','fr','es'],default_language:'de',capacity:100};
   const boot={alliance,staff:{rank:'R4',is_owner:false,permissions:{tools:true}},players:[],externalAlts:[]};
   for(const k of ['laws','transfers','events','internalMoves','eventMessages','eventGuidance','eventCycles','eventDayTemplates','transferWindows','lawVersions','lawPublications','auditTrail','staffMembers','transferContacts'])boot[k]=[];
   let result=mode==='public-leaders'?{leaders:[]}:mode==='public-config'?{alliance}:!body?boot:{ok:true};
   if(body)calls.push({...body,at:performance.now()});
   if(body?.action==='tools_documents_load')result={ok:true,documents:[],laws:[]};
   if(body?.action==='tools_kvk_load')result={ok:true,item:null,runs:[]};
   if(body?.action==='tools_gifts_load')result={ok:true,runs:[],candidates};
   if(body?.action==='tools_gifts_create'){
    run={id:'11111111-1111-4111-8111-111111111111',code:body.code,recipients:body.recipients,created_at:'2026-11-05T08:00:00Z'};
    result={ok:true,item:run};
   }
   if(body?.action==='tools_gifts_status')result={ok:true,item:run,receipts};
   if(body?.action==='tools_gifts_step'){
    const {game_id:id,retry}=body;
    if(id==='333')return r.fulfill({status:503,contentType:'application/json',body:'{"error":"test_unavailable"}'});
    if(id==='444'&&!waited){
     waited=true;
     return r.fulfill({json:{ok:true,status:'wait',retry_after:2,retry_after_ms:180}});
    }
    if(id==='111'){await new Promise(resolve=>setTimeout(resolve,2200));firstFinished=performance.now();}
    const status=retry?'already':{111:'failed',222:'unknown',444:'success'}[id];
    const receipt={game_id:id,status,retryable:false,provider_code:id==='111'?40007:null};
    const i=receipts.findIndex(x=>x.game_id===id);
    if(i===-1)receipts.push(receipt);else receipts[i]=receipt;
    result={ok:true,...receipt,pause:status!=='success'};
   }
   return r.fulfill({json:result});
  });
  if(!process.env.TOOLS_LIVE_ASSETS)await page.route('https://welcome-nrw.vercel.app/**',r=>{

   let file=path.join(root,new URL(r.request().url()).pathname);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');

   if(!fs.existsSync(file))return r.fulfill({status:404,body:''});

   return r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'image/svg+xml'});

  });

  page.on('dialog',dialog=>dialog.accept());

  await page.goto('https://welcome-nrw.vercel.app/leitung/?tab=tools');await page.locator('[data-kvk-copy]').waitFor();

  await page.locator('[data-tool="gifts"]').click();
  await page.locator('[data-wb-gift-recipient="444"]').waitFor({state:'attached'});
  await page.locator('[data-wb-gift-code]').fill('TEST-ONLY');
  await page.locator('[data-wb-action="gift-start"]').click();
  await page.locator('[data-wb-status]').filter({hasText:'Sammellauf bearbeitet'}).waitFor({timeout:15000});
  const steps=calls.filter(c=>c.action==='tools_gifts_step');
  assert.deepEqual(steps.map(x=>x.game_id),['111','222','333','444','444']);
  assert(steps.every(x=>x.retry===false));
  assert(steps[1].at-firstFinished<1500,'No fixed delay after slow provider response');
  assert(steps[4].at-steps[3].at<1500,'Uses precise claim wait instead of a fixed extra delay');
  assert.equal(calls.filter(c=>c.action==='tools_gifts_status').length,1,'Reconcile once at end');
  const progress=page.locator('[data-wb-gift-progress]'),rows=page.locator('[data-wb-gift-results] tbody tr');
  assert.match(await progress.innerText(),/1 \/ 4 best.tigt/);
  assert.match(await progress.innerText(),/4 \/ 4 bearbeitet/);
  assert.equal(await progress.locator('progress').getAttribute('value'),'4');
  assert.match(await rows.nth(0).innerText(),/Fehlgeschlagen/);
  assert.match(await rows.nth(1).innerText(),/Ergebnis unbekannt/);
  assert.match(await rows.nth(2).innerText(),/Ergebnis unbekannt/);
  assert.match(await rows.nth(3).innerText(),/Eingel.st/);
  await rows.nth(1).locator('[data-wb-action="gift-unknown-retry"]').click();
  await progress.filter({hasText:/2 \/ 4 best.tigt/}).waitFor();
  assert.deepEqual(calls.filter(c=>c.action==='tools_gifts_step'&&c.retry).map(x=>x.game_id),['222']);
  assert.deepEqual(errors,[]);
  console.log('PASS: bulk continues after failed, unknown and HTTP error; exact wait; no duplicate attempt; one status refresh; deliberate retry.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
