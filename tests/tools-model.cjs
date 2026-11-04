const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
const root=path.resolve(__dirname,'..');
const math=new Function(fs.readFileSync(path.join(root,'leitung/tools-kvk.js'),'utf8').replace(/^export /gm,'')+';return {ALLIANCES,PERIODS,parseInteger,blankKvk,rankKvk};')();
for(const [s,value] of [['1.234.567',1234567],['1234',1234],['0',0],['',null]])assert.equal(math.parseInteger(s),value);
for(const s of ['1,234','1.2','1e9','-1','Infinity','9007199254740992','1B'])assert(Number.isNaN(math.parseInteger(s)),s);
const data=math.blankKvk();assert(!math.rankKvk(data,'overall').complete);
for(const tag of math.ALLIANCES){data.alliances[tag]={power:1000000000,members:100,scores:Object.fromEntries(math.PERIODS.map(p=>[p,1000000]))};}
const one=1000000/(1000000000**0.7*100**0.3);assert.equal(math.rankKvk(data,'overall').rows[0].score,one);
data.alliances.NWO.scores.overall=3000000;data.alliances.NwO.scores.overall=2000000;
let ranking=math.rankKvk(data,'overall');assert(ranking.complete);assert.equal(ranking.rows[0].tag,'NWO');assert.equal(ranking.rows[1].tag,'NwO');assert.match(ranking.text,/1\. NWO - \d+,\d{3}/);assert.equal(math.rankKvk(data,'day1').rows[0].tag,'NRW','Overall is independent of daily points');
data.alliances.NRW.scores.day2=0;assert(math.rankKvk(data,'day2').complete);data.alliances.NRW.scores.day2=null;assert(!math.rankKvk(data,'day2').complete);

const source=stripTypeScriptTypes(fs.readFileSync(path.join(root,'supabase/functions/allianceos-leitung/tools.ts'),'utf8'),{mode:'transform'}).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'');
const {createLeadershipTools}=new Function('createToolsPlayers',source+';return {createLeadershipTools};')(()=>({lookup:async id=>{rpcs++;return {found:true,game_id:id};},refresh:async id=>{rpcs++;return {player:{found:true,game_id:id},source:'mightpulse'};}}));
class HttpError extends Error{constructor(code,status){super(code);this.httpStatus=status;}}
let reads=0,rpcs=0;const records=[],audits=[];
const db={from(name){reads++;assert.equal(name,'aos_tools_kvk_runs');let mutation=null,filters={};const q={select(){return q;},eq(k,v){filters[k]=v;return q;},order(){return q;},limit(){return q;},insert(v){mutation={kind:'insert',v};return q;},update(v){mutation={kind:'update',v};return q;},maybeSingle(){return Promise.resolve(run(true));},single(){return Promise.resolve(run(true));},then(resolve,reject){return Promise.resolve(run(false)).then(resolve,reject);}};
function run(one){if(mutation?.kind==='insert'){if(records.some(r=>r.id===mutation.v.id))return {error:{code:'23505'}};records.push({...mutation.v});return {data:{...mutation.v}};}let rows=records.filter(r=>Object.entries(filters).every(([k,v])=>r[k]===v));if(mutation?.kind==='update')rows.forEach(r=>Object.assign(r,mutation.v));return {data:one?rows[0]||null:rows};}return q;}};
const api=createLeadershipTools({db,checked:async p=>{const r=await p;if(r.error)throw Error('db');return r.data;},json:(_,x)=>x,HttpError,permission:(s,k)=>s.is_owner||s.permissions?.[k]===true,audit:async(...args)=>audits.push(args)});
const allowed={permissions:{tools:true}},a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
(async()=>{
 for(const action of ['tools_kvk_load','tools_kvk_save','tools_player_lookup','tools_player_refresh'])for(const staff of [{permissions:{}},{permissions:{settings:true}},{permissions:{tools:true},ssl_readonly:true}])await assert.rejects(()=>api.handle({},'NRW','actor',staff,{action}),e=>e.httpStatus===403);
 assert.equal(reads+rpcs,0,'Permission check precedes all data reads');
 await assert.rejects(()=>api.handle({},'NWO','actor',allowed,{action:'tools_kvk_load'}),e=>e.httpStatus===403);
 await assert.rejects(()=>api.handle({},'NRW','actor',allowed,{action:'tools_player_lookup',game_id:'1) OR true'}),e=>e.httpStatus===400);assert.equal(rpcs,0);
 const player=await api.handle({},'NRW','actor',allowed,{action:'tools_player_lookup',game_id:'123'});assert.equal(player.player.game_id,'123');
 const first=await api.handle({},'NRW','actor',allowed,{action:'tools_kvk_save',run_id:a,version:0,data});assert.equal(first.item.version,1);
 await assert.rejects(()=>api.handle({},'NRW','actor',allowed,{action:'tools_kvk_save',run_id:a,version:0,data}),e=>e.httpStatus===409);
 const second=structuredClone(data);second.title='Second KvK';await api.handle({},'NRW','actor',allowed,{action:'tools_kvk_save',run_id:b,version:0,data:second});
 await api.handle({},'NRW','actor',allowed,{action:'tools_kvk_save',run_id:a,version:1,data});assert.equal(records.find(r=>r.id===a).version,2);assert.equal(records.find(r=>r.id===b).data.title,'Second KvK');
 const historical=await api.handle({},'NRW','actor',allowed,{action:'tools_kvk_load',run_id:b});assert.equal(historical.item.id,b);assert.equal(historical.runs.length,2);
 await assert.rejects(()=>api.handle({},'NRW','actor',allowed,{action:'tools_kvk_save',run_id:a,version:1,data}),e=>e.httpStatus===409);
 await assert.rejects(()=>api.handle({},'NRW','actor',allowed,{action:'tools_kvk_save',version:2,data}),e=>e.httpStatus===409,'Old clients cannot overwrite an arbitrary run');
 const invalid=structuredClone(data);invalid.alliances.NRW.power='1.000';assert.throws(()=>api.cleanData(invalid),e=>e.httpStatus===400);
 invalid.alliances.NRW.power=100;invalid.snapshot_date='2026-02-30';assert.throws(()=>api.cleanData(invalid),e=>e.httpStatus===400);
 assert(!JSON.stringify(api.cleanData({...data,secret:'drop'})).includes('secret'));
 console.log('PASS: Law 9 arithmetic, raw units, thousands parsing, 0 versus missing, case-sensitive alliances, independent days/overall, exact-ID lookup, permission gate before I/O, separate KvK runs, explicit run updates, stale/legacy writer rejection and audit');
})().catch(e=>{console.error(e);process.exitCode=1;});
