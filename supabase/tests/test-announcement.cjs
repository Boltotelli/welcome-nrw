const path=require('path'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{stripTypeScriptTypes}=require('module');
const source=fs.readFileSync(path.join(__dirname,'../functions/allianceos-leitung/index.ts'),'utf8');
const fragment=stripTypeScriptTypes(source.slice(source.indexOf('async function announcementData'),source.indexOf('async function publicInfo')),{mode:'transform'});
class HttpError extends Error{constructor(code,httpStatus){super(code);this.code=code;this.httpStatus=httpStatus;}}
let calls=[],conflict=false;
const db={rpc:async(name,args)=>{calls.push({name,args});return conflict?{error:{code:'40001'}}:{data:{text:args.p_text,status:args.p_status,revision:args.p_revision+1},error:null};}};
const ctx=vm.createContext({db,HttpError,permission:(s,k)=>s.is_owner||s.permissions?.[k]===true,json:(req,data)=>data,Date,Number,Object,String});vm.runInContext(fragment+';this.saveAnnouncement=saveAnnouncement;',ctx);
(async()=>{const staff={permissions:{events:true}},body={command:'publish',text:{de:'Text',en:'Hello'},revision:0,expires_at:'2099-10-21T18:30:00Z'};
await assert.rejects(ctx.saveAnnouncement({},'NRW','user',{},body),e=>e.httpStatus===403);assert.equal(calls.length,0);
for(const bad of [{...body,command:'x'},{...body,revision:-1},{...body,text:{}},{...body,text:{de:'x'.repeat(4001)}},{...body,expires_at:'2020-01-01T00:00:00Z'},{...body,expires_at:'2099-01-01T18:30:00+02:00'}])await assert.rejects(ctx.saveAnnouncement({},'NRW','user',staff,bad),e=>e.httpStatus===400);
const result=await ctx.saveAnnouncement({},'NRW','user',staff,body);assert.equal(result.announcement.status,'published');assert.equal(calls[0].args.p_actor,'user');assert.equal(calls[0].args.p_alliance,'NRW');assert.equal(calls[0].args.p_text.es,undefined);
conflict=true;await assert.rejects(ctx.saveAnnouncement({},'NRW','user',staff,body),e=>e.httpStatus===409);conflict=false;
await ctx.saveAnnouncement({},'NRW','user',staff,{...body,command:'remove'});assert.equal(calls.at(-1).args.p_remove,true);
assert(source.includes('.eq("status","published").or("expires_at.is.null,expires_at.gt."'));
const sql=fs.readFileSync(path.join(__dirname,'../migrations/20261021145815_alliance_general_announcements.sql'),'utf8');assert(sql.includes('enable row level security'));assert(sql.includes('security invoker'));assert(sql.includes('from public,anon,authenticated'));assert(sql.indexOf('insert into public.aos_audit')>sql.indexOf('returning * into result_row'));assert(sql.includes('pg_advisory_xact_lock'));
console.log('PASS announcement: events ACL, validation, explicit publish/remove, optimistic conflict, public projection and atomic audit schema');})();
