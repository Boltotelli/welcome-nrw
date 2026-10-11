/* Browser-safe GitHub Pages static ID profile adapter: no API endpoints,
 * no secret keys, no raw data upload and no remote player mutation.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'github-profiles.js'),'utf8');
const ctx={window:{}};vm.runInNewContext(source,ctx);
const p=ctx.window.NRW_BEAR_GITHUB_PROFILES;
assert.ok(p);assert.equal(p.valid('295189783'),true);
for(const id of ['','abc','1','../295189783','295189783.json','1'.repeat(22)]){
 assert.equal(p.valid(id),false);
}
const obj={governor_id:'295189783',name:'Test User',values:{troopsI:1000,iAtk:100.5},
 v2:{troopTiers:[{tier:10,tg:6}],ownHeroes:['Zoe','Petra','Yang']}};
assert.equal(p.validate('295189783',obj),true);
assert.equal(p.validate('200000002',obj),false);
assert.equal(p.validate('295189783',{...obj,values:{x:Infinity}}),false);
assert.equal(p.validate('295189783',{...obj,values:{'<script>':'alert()'}}),false);
(async()=>{
 const ok=await p.load('295189783',async (url,opts)=>{
  assert.equal(url,'./profiles/295189783.json');
  assert.equal(opts.cache,'no-cache');
  return {ok:true,status:200,json:async()=>obj};
 });
 assert.equal(ok.source,'github');
 assert.equal(ok.profile.name,'Test User');
 const missing=await p.load('295189783',async()=>({status:404,ok:false}));
 assert.equal(missing.source,'local');
 const invalid=await p.load('295189783',async()=>({status:200,ok:true,json:async()=>({...obj,governor_id:'9'})}));
 assert.equal(invalid.source,'invalid-github-profile');
 const bad=await p.load('../id',async()=>{throw Error('should not fetch invalid IDs');});
 assert.equal(bad.source,'invalid');
 const failed=await p.load('295189783',async()=>{throw Error('offline');});
 assert.equal(failed.source,'local');
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 assert.ok(html.includes('github-profiles.js?v='));
 assert.ok(html.indexOf('github-profiles.js')<html.indexOf('wizard.js'));
 assert.ok(html.includes('activateSavedId:function(id,name)'));
assert.ok(source.includes('bridge.storedGovernorName?.(id)'),'local label used when no public name available');
assert.ok(html.includes('nrw_bear_profile_name_v1_'),'display name saved per numeric ID');
assert.ok(html.includes('./intake-ui.js?v=player-label-edit-20261011-1'),'picker cache version updated');
assert.ok(html.includes('rememberGovernorName:rememberGovernorName'),'bridge accepts local nickname assignment');
assert.ok(intake.includes('B.rememberGovernorName?.(id,name)'),'older saved IDs can be labelled without another API');
const intake=fs.readFileSync(path.join(__dirname,'intake-ui.js'),'utf8');
assert.ok(intake.includes("opt.textContent=name?name+' · ID '+id:id"),'saved profile picker uses name with ID');
assert.ok(intake.includes("window.addEventListener('nrw-bear-loaded',refresh)"),'picker refreshes after loading a profile');
assert.ok(intake.includes('opt.value=id'),'player ID remains stable option value');
assert.ok(html.includes("name:storedGovernorName(id)||'Local demo'"),'offline opening retains cached real name');
 assert.ok(source.includes('event.stopImmediatePropagation()'));
 assert.ok(!source.includes("fetch('/api/bear-profile"));
 console.log('STATIC GITHUB PROFILES: numeric ID source, matching profile ID, local fallback and no API, XSS key validation, script wiring passed.');
})().catch(e=>{console.error(e);process.exit(1);});
