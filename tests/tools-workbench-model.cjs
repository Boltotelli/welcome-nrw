const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function moduleFile(file,names,args={},ts=false){let s=fs.readFileSync(path.join(root,file),'utf8');if(ts)s=stripTypeScriptTypes(s,{mode:'transform'});s=s.replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'');return new Function(...Object.keys(args),s+';return {'+names.join(',')+'};')(...Object.values(args));}
const model=moduleFile('leitung/tools-workbench-model.js',['rallyPlan','rallyText','insertText','coordinateTag','outpostSummary']);
const data={date:'2026-11-05',time:'00:01:00',gap:30,leaders:[{name:'A',gather:'05:00',march:'01:30'},{name:'B',gather:'01:00',march:'02:00'}]};
const plan=model.rallyPlan(data);assert.equal(new Date(plan[0].start).toISOString(),'2026-11-04T23:54:30.000Z');assert.equal(plan[1].arrival-plan[0].arrival,30000);assert(model.rallyText(data).includes('2026-11-04'));
assert.throws(()=>model.rallyPlan({...data,date:'2026-02-30'}));assert.throws(()=>model.rallyPlan({...data,leaders:[{name:'A',gather:'5:90',march:'00:00'}]}));
assert.equal(model.insertText('Hello NRW',6,9,'<b>','</b>').text,'Hello <b>NRW</b>');assert.throws(()=>model.insertText('a'.repeat(2000),0,0,'<b>'));
assert.equal(model.coordinateTag('1044','0','1199'),'<hyl=1>[#1044 X: 0, Y: 1199]</hyl>');assert.throws(()=>model.coordinateTag(1044,1200,0));
const summary=model.outpostSummary([{type:'Angriff',level:1,owned:true,connected:true},{type:'Angriff',level:1,owned:true,connected:true},{type:'Angriff',level:2,owned:true,connected:false}]);assert.equal(summary.active,1);assert.equal(summary.disconnected,1);assert(summary.missing.some(r=>r.type==='Angriff'&&r.level===2));
class HttpError extends Error{constructor(code,status){super(code);this.httpStatus=status;}}
const backend=moduleFile('supabase/functions/allianceos-leitung/tools-workbench.ts',['createToolsWorkbench'],{},true).createToolsWorkbench({HttpError});
const doc={kind:'rally',id:crypto.randomUUID(),version:0,title:'Test',data};assert.equal(backend.clean(doc).data.gap,30);assert.throws(()=>backend.clean({...doc,data:{...data,leaders:[]}}));assert.throws(()=>backend.clean({...doc,version:-1}));
const {giftOutcome,createToolsGifts}=moduleFile('supabase/functions/allianceos-leitung/tools-gifts.ts',['giftOutcome','createToolsGifts'],{md5:v=>crypto.createHash('md5').update(v).digest('hex')},true);
assert.equal(giftOutcome(20000).status,'success');assert.equal(giftOutcome(40008).status,'already');assert.equal(giftOutcome(40019).retryable,true);assert.equal(giftOutcome(40020).retryable,false);assert.equal(giftOutcome(99999).status,'unknown');
let writes=[],sent=[],claimed=true;const run={id:crypto.randomUUID(),code:'TEST-ONLY',recipients:[{game_id:'123',kingdom_id:1044,name:'Test'}]};
const db={from(name){let op=null;const q={select(){return q},eq(){return q},update(v){op=v;return q},maybeSingle:async()=>({data:run}),single:async()=>{writes.push(op);return {data:{game_id:'123'}}}};return q},rpc:async()=>({data:{claimed,status:claimed?undefined:'success'}})};
let reply=20000;
const api=createToolsGifts({db,checked:async p=>(await p).data,json:(_,v)=>v,HttpError,audit:async()=>{},fetchImpl:async(url,opts)=>{sent.push({url,opts});if(reply==='timeout')throw Error('timeout');return {ok:true,json:async()=>({err_code:reply})}}});
(async()=>{
 let r=await api.handle({},'NRW','actor',{action:'tools_gifts_step',run_id:run.id,game_id:'123'});assert.equal(r.status,'success');assert.equal(sent.length,1);const body=sent[0].opts.body;assert.equal(body.get('kid'),'1044');assert.equal(body.get('fid'),'123');assert.equal(body.get('cdk'),'TEST-ONLY');assert.equal(body.get('sign').length,32);
 claimed=false;r=await api.handle({},'NRW','actor',{action:'tools_gifts_step',run_id:run.id,game_id:'123'});assert.equal(r.status,'success');assert.equal(sent.length,1,'Reserved/successful claims must never call provider again');
 claimed=true;reply='timeout';r=await api.handle({},'NRW','actor',{action:'tools_gifts_step',run_id:run.id,game_id:'123'});assert.equal(r.status,'unknown');assert.equal(r.pause,true);assert.equal(writes.at(-1).retryable,false);
 await assert.rejects(()=>api.handle({},'NRW','actor',{action:'tools_gifts_step',run_id:run.id,game_id:'999'}),e=>e.httpStatus===400);
 console.log('PASS: UTC midnight and stagger math; invalid input; safe cursor formatting/limits; coordinates; outpost duplicate bonuses; backend document validation; signed gift payload; deduplication; uncertain outcome pauses; recipient scope. No real redemption.');
})().catch(e=>{console.error(e);process.exitCode=1});
