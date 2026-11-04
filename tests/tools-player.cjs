const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
const source=stripTypeScriptTypes(fs.readFileSync(path.join(__dirname,'../supabase/functions/allianceos-leitung/tools-player.ts'),'utf8'),{mode:'transform'}).replace(/^export /gm,'');
const {normalizeToolsProfile,createToolsPlayers}=new Function(source+';return {normalizeToolsProfile,createToolsPlayers};')();
const wire={governor_id:'123',cached_at:'2026-11-04T01:00:00Z',player:{governor_id:'123',uid:999,nick_name:'Test',kid:1337,power:311100000,town_center_level:60,kills:15400000,x:742,y:564,shield_endtime:0,burn_endtime:0,alliance:{abbr:'OTHER',rank:3,rank_label:'R3'},online:true,SECRET:'drop'},ranks:{power_rank:152,kills_rank:127,migrant_score:794635,migrant_rank:121,mystic_trial:1522,mystic_rank:132}};
const p=normalizeToolsProfile(wire,'123');assert.equal(p.kingdom_id,1337);assert.equal(p.kills,15400000);assert.equal(p.migrant_score,794635);assert.equal(p.mystic_rank,132);assert.equal(p.shield_state,'none');assert.equal(p.burn_state,'none');assert(!('online' in p));assert(!JSON.stringify(p).includes('SECRET'));assert.equal(p.game_id,'123');assert(!('uid' in p));
assert.throws(()=>normalizeToolsProfile(wire,'999'),/invalid_provider_response/);
const absent=normalizeToolsProfile({player:{governor_id:'123',kid:1044}},'123');assert.equal(absent.kills,null);assert.equal(absent.power,null);assert.equal(absent.shield_state,null);
const timed=normalizeToolsProfile({player:{governor_id:'123',shield_endtime:1793754000,burn_endtime:1793754000000}},'123');assert.equal(timed.shield_end_at,timed.burn_end_at);
let cached=null,calls=0,status=200,responseWire=wire;const writes=[];
class HttpError extends Error{constructor(c,s){super(c);this.httpStatus=s;}}
const db={rpc:async(name,args)=>({data:name==='aos_tools_player_lookup'?{found:false,game_id:args.p_game_id}:{profile:null,alliance_history:[]}}),from(table){assert.equal(table,'aos_tools_player_profiles');let mutation=null;const q={select(){return q},eq(){return q},upsert(v){mutation=v;return q},async maybeSingle(){return {data:cached}},async single(){writes.push({table,...mutation});cached=mutation;return {data:{game_id:mutation.game_id}}}};return q}};
const api=createToolsPlayers({db,checked:async x=>{const r=await x;return r.data},HttpError,getApiKey:()=> 'TEST-ONLY',fetchImpl:async(url,options)=>{calls++;assert(url.endsWith('/123?include=base,ranks'));assert.equal(options.headers.Authorization,'Bearer TEST-ONLY');return {ok:status===200,status,json:async()=>responseWire}}});
(async()=>{
 const missing=await api.lookup('123');assert(!missing.found);assert.equal(calls,0,'A database lookup never fetches the provider');
 const first=await api.refresh('123');assert.equal(first.player.profile.kingdom_id,1337);assert(first.player.found);assert.equal(first.player.total_count,null,'Unknown tracker counts remain unknown');assert.equal(first.player.tracked,false);assert.equal(writes.length,1);
 await api.refresh('123');assert.equal(calls,1,'Short cache prevents duplicate provider calls');
 cached.fetched_at='2000-01-01T00:00:00Z';status=429;await assert.rejects(()=>api.refresh('123'),e=>e.httpStatus===429);assert.equal(writes.length,1);assert.equal(cached.profile.kills,15400000);
 status=200;responseWire={player:{governor_id:'999'}};await assert.rejects(()=>api.refresh('123'),/invalid_provider_response/);assert.equal(writes.length,1);
 status=404;await assert.rejects(()=>api.refresh('123'),e=>e.httpStatus===404);assert.equal(writes.length,1);
 console.log('PASS: documented base/ranks fields, separate governor ID versus UID, foreign kingdom profile, null versus 0, safe timestamps, no stale activity fields, click-only API, short cache, unknown violation counts, mismatch/429/404 preserve cache; no tracker writes');
})().catch(e=>{console.error(e);process.exitCode=1});
