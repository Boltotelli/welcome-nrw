'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'profile-service.js'),'utf8');
const ui=fs.readFileSync(path.join(__dirname,'name-flow.js'),'utf8');
const shell=fs.readFileSync(path.join(__dirname,'../preview-v3.html'),'utf8');
const store=new Map();
const localStorage={getItem:key=>store.get(key)||null,
 setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)};
let id=0;
const crypto={getRandomValues:bytes=>{for(let i=0;i<bytes.length;i++)bytes[i]=(i*23+id++)%256;return bytes;}};
const hits=[];
const fetch=async(url,opts={})=>{
 hits.push({url,method:opts.method||'GET'});
 if(url.includes('search='))return {ok:true,json:async()=>({players:[
  {id:'152394512',name:'Boltotelli',avatarUrl:'https://kingshotstats.com/a.png',alliance:'NRW'},
  {id:'170454746',name:'BabyBolto',avatarUrl:'https://kingshotstats.com/b.png',alliance:'NRW'}]})};
 if(opts.method==='POST'){
  const body=JSON.parse(opts.body);
  if(body.action==='check')return {ok:true,json:async()=>({canEdit:true})};
  assert.equal(body.action,'save');
  return {ok:true,json:async()=>({ok:true,revision:4})};
 }
 return {ok:true,json:async()=>({player:{id:'152394512',name:'Boltotelli',avatarUrl:'https://kingshotstats.com/a.png'},profile:null})};
};
const clock={setTimeout:()=>22,clearTimeout:()=>{}};
const window={};
vm.runInNewContext(source,{window,localStorage,crypto,fetch,URL,AbortController,encodeURIComponent,
 setTimeout:clock.setTimeout,clearTimeout:clock.clearTimeout});
const svc=window.NRW_BEAR_PROFILES;assert(svc);
const one={id:'152394512',name:'Boltotelli',avatarUrl:'https://kingshotstats.com/a.png'};
const two={id:'170454746',name:'BabyBolto',avatarUrl:'https://kingshotstats.com/b.png'};
assert.deepEqual(Array.from(svc.ordered()),[]);
assert.equal(svc.toggleFavorite(one),true);
assert.equal(svc.isFavorite(one),true);
assert.equal(svc.toggleFavorite(two),true);
svc.remember(one);
svc.remember(two);
assert.deepEqual(Array.from(svc.ordered()).map(x=>x.id),[two.id,one.id],
 'Favorites above recents, in favorite order');
assert.equal(svc.toggleFavorite(two),false);
assert.deepEqual(Array.from(svc.ordered()).map(x=>x.id),[one.id,two.id]);
svc.remember({id:one.id,name:one.name,avatarUrl:'https://kingshotstats.com/new-avatar.png'});
assert.equal(svc.favorites()[0].avatarUrl,'https://kingshotstats.com/new-avatar.png');
const key=svc.newEditKey();
assert.match(key,/^[0-9a-f]{64}$/);
assert.equal(svc.storeEditKey(one.id,key),true);
assert.equal(svc.getEditKey(one.id),key);
assert.equal(svc.getEditKey(two.id),'');
assert.equal(JSON.stringify(svc.ordered()).includes(key),false);
(async()=>{
 const names=await svc.search('Bolto');assert.equal(names.players.length,2);
 const data=await svc.get(one.id);assert.equal(data.player.id,one.id);
 const check=await svc.verify(one.id,key);assert.equal(check.canEdit,true);
 const save=await svc.save(one.id,key,3,{heroes:{}});
 assert.equal(save.revision,4);
 assert(hits.every(x=>x.url.startsWith('https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/nrw-bear-profiles')));
 assert(ui.includes('PROFILES.save')&&ui.includes('PROFILES.verify'));
 assert(ui.includes('playerPicture(activePlayer)')&&ui.includes('toggleFavorite'));
 assert(ui.includes('if(dirty&&canEdit&&!localOnly)'));
 assert(!ui.includes('/api/bear-players'));
 assert(shell.includes('profile-service.js'));
 console.log('PASS: profiles lookup by game ID, local favorites, avatar refresh, edit code, protected shared storage and no old GitHub API');
})().catch(e=>{console.error(e);process.exitCode=1;});
