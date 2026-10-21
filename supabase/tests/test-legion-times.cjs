const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{stripTypeScriptTypes}=require('module');
const source=fs.readFileSync(path.join(__dirname,'../functions/allianceos-leitung/index.ts'),'utf8');
const code=stripTypeScriptTypes(source.slice(source.indexOf('async function saveEventCycle'),source.indexOf('async function saveEventDayTemplate')),{mode:'transform'});
class HttpError extends Error{constructor(code,status){super(code);this.code=code;this.status=status;}}
let previous={anchor_date:'2026-10-18',interval_days:28,duration_days:1,phase_count:1,enabled:true,legion1_time_utc:'14:00:00',legion2_time_utc:'19:00:00'},writes=[],audits=[];
const db={from:()=>({
 select(){return this;},eq(){return this;},maybeSingle:async()=>({data:previous}),
 upsert(row){writes.push(row);return {select:()=>({single:async()=>({data:row})})};}
})};
const ctx=vm.createContext({db,HttpError,checked:async p=>(await p).data,permission:s=>s.events===true,groupKey:v=>v,validateDate:v=>v,str:v=>String(v),localized:v=>v,json:(r,d)=>d,audit:async(...a)=>audits.push(a),Date,Object,Number,String});vm.runInContext(code+';this.save=saveEventCycle',ctx);
const base={group_key:'catalog-swordland-showdown',anchor_date:'2026-10-18',interval_days:28,duration_days:1,phase_count:1,enabled:true,title:{de:'Schwertland'}};
(async()=>{await assert.rejects(ctx.save({},'NRW','u',{},base),e=>e.status===403);assert.equal(writes.length,0);
for(const change of [{legion1_time_utc:'25:00',legion2_time_utc:'19:00'},{legion1_time_utc:'14:00',legion2_time_utc:null},{legion1_time_utc:'14:00'},{legion1_time_utc:'14:00:59',legion2_time_utc:'19:00'},{group_key:'bear-1',start_time_utc:'17:00',legion1_time_utc:'14:00',legion2_time_utc:'19:00'}])await assert.rejects(ctx.save({},'NRW','u',{events:true},{...base,...change}),e=>e.status===400);
assert.equal(writes.length,0);for(const group_key of ['catalog-swordland-showdown','catalog-tri-alliance-clash']){const r=await ctx.save({},'NRW','u',{events:true},{...base,group_key,legion1_time_utc:'14:00',legion2_time_utc:'19:00'});assert.equal(r.item.legion1_time_utc,'14:00');assert.equal(r.item.legion2_time_utc,'19:00');}
await ctx.save({},'NRW','u',{events:true},{...base,title_only:true,title:{de:'Name'}});assert.equal(writes.at(-1).legion1_time_utc,'14:00:00');await ctx.save({},'NRW','u',{events:true},base);assert.equal(writes.at(-1).legion2_time_utc,'19:00:00','old clients preserve times');
await ctx.save({},'NRW','u',{events:true},{...base,legion1_time_utc:null,legion2_time_utc:null});assert.equal(writes.at(-1).legion1_time_utc,null);assert.equal(audits.length,writes.length);assert(source.includes('start_time_utc,legion1_time_utc,legion2_time_utc'));console.log('PASS legion times: ACL, both event types, strict HH:mm, paired clearing, old client/title preservation, audit and public projection');})();
