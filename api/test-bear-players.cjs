/* Offline-only unit tests: NO real GitHub token, no live writes. */
'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const db=new Map();let nextSha=1,calls=[];
const getPath=url=>new URL(url).pathname.split('/contents/')[1];
global.fetch=async(url,options={})=>{
 const p=getPath(url);calls.push({method:options.method||'GET',path:p});
 if(options.method==='PUT'){
  const body=JSON.parse(options.body||'{}');
  const older=db.get(p);
  if(older&&body.sha!==older.sha)return {ok:false,status:409};
  if(!older&&body.sha)return {ok:false,status:409};
  const sha='new-sha-'+nextSha++;
  db.set(p,{sha,content:body.content});
  return {ok:true,json:async()=>({content:{sha}})};
 }
 const value=db.get(p);return value?
  {ok:true,status:200,json:async()=>value}:
  {ok:false,status:404};
};
const handler=require('./bear-players');
function res(){
 return {code:200,headers:{},setHeader(n,v){this.headers[n]=v;return this;},
  status(code){this.code=code;return this;},
  json(x){this.payload=x;return this;}};
}
async function invoke(method,name,body,headers={}){
 const r=res();
 await handler({method,headers:{host:'example.com',...headers},
  query:{name},body:method==='POST'?{name,...body}:undefined},r);
 return r;
}
(async()=>{
 const token='d'.repeat(64),editKey='a'.repeat(64),otherKey='b'.repeat(64);
 const valid={editKey,version:null,data:{
  heroes:{Zoe:{stars:4,tier:2,widget:3,level:80}},
  ownHeroes:['Zoe'],troopGroups:[{type:'archer',tier:10,tg:6,count:150000}],
  joinCount:3,values:{cap:120000,troopsA:150000},petActive:{},petSkillRanks:{}
 }};
 delete process.env.BEAR_PROFILE_FEATURE_ENABLED;
 process.env.BEAR_GITHUB_TOKEN=token;
 process.env.BEAR_WRITE_ENABLED='true';
 let r=await invoke('GET','Test Governor');assert.equal(r.code,503,'disabled by default');
 assert.equal(calls.length,0,'disabled must never hit GitHub');
 process.env.BEAR_PROFILE_FEATURE_ENABLED='true';
 r=await invoke('GET','Test Governor');assert.equal(r.code,404);
 process.env.BEAR_WRITE_ENABLED='false';
 r=await invoke('POST','Test Governor',valid,{'content-type':'application/json'});
 assert.equal(r.code,503);assert.equal(db.size,0);
 process.env.BEAR_WRITE_ENABLED='true';
 r=await invoke('POST','Test Governor',valid,{'content-type':'application/json',
   origin:'https://example.com'});
 assert.equal(r.code,200,JSON.stringify(r.payload));
 const nameHash=crypto.createHash('sha256').update('test governor').digest('hex');
 const key='bear/v1/'+nameHash+'.json';
 assert(db.has(key));
 const json=JSON.parse(Buffer.from(db.get(key).content,'base64').toString('utf8'));
 assert.equal(json.name,'Test Governor');
 assert.equal(json.keyHash,crypto.createHash('sha256').update(editKey).digest('hex'));
 assert.equal(json.data.heroes.Zoe.widget,3);
 assert(!JSON.stringify(json).includes('governorId'));
 assert(!JSON.stringify(json).includes('screenshots'));
 const got=await invoke('GET','test governor');
 assert.equal(got.code,200);assert.equal(got.payload.name,'Test Governor');
 assert.equal(got.payload.version,r.payload.version);
 let fail=await invoke('POST','Test Governor',{...valid,editKey:otherKey,version:r.payload.version},
  {'content-type':'application/json'});assert.equal(fail.code,403);
 fail=await invoke('POST','Test Governor',{...valid,version:'stale'},
  {'content-type':'application/json'});assert.equal(fail.code,409);
 fail=await invoke('POST','Test Governor',{...valid,version:r.payload.version},
  {'content-type':'text/plain'});assert.equal(fail.code,415);
 fail=await invoke('POST','Test Governor',{...valid,random:'x'.repeat(70000)},
  {'content-type':'application/json'});assert.equal(fail.code,413);
 fail=await invoke('POST','Test Governor',{...valid,version:r.payload.version},
  {'content-type':'application/json',origin:'https://evil.example'});assert.equal(fail.code,403);
 const upd=await invoke('POST','Test Governor',{...valid,version:r.payload.version},
  {'content-type':'application/json'});assert.equal(upd.code,200);
 assert.equal(db.size,1);
 delete process.env.BEAR_GITHUB_TOKEN;
 const failClosed=await invoke('GET','Test Governor');assert.equal(failClosed.code,503);
 console.log('PASS private name-keyed GitHub profile read/write; disabled flags, ownership, version CAS, origin, payload size, no IDs.');
})().catch(err=>{console.error(err);process.exitCode=1;});
