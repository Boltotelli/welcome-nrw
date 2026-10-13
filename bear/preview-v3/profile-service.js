/* Bear V3 shared game profile client.
 * Game player/avatar lookup from existing 1044 Supabase cache.
 * Shared settings: readable by other players; writes require a random edit key.
 * Favorites and edit keys remain local to this browser only. */
(function(root){
 'use strict';
 const ENDPOINT='https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/nrw-bear-profiles';
 const FAVORITES='nrw_bear_favorites_v1',HISTORY='nrw_bear_recent_v2';
 const EDIT_PREFIX='nrw_bear_edit_key_v2:';
 const identity=x=>String(x?.id||'').trim();
 const read=(k,fallback)=>{try{const val=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(val)?val:fallback;}catch{return fallback;}};
 const clean=x=>({id:identity(x),name:String(x?.name||'').slice(0,80),
  avatarUrl:String(x?.avatarUrl||'').slice(0,700),alliance:String(x?.alliance||'').slice(0,25)});
 const same=(a,b)=>identity(a)&&identity(b)?identity(a)===identity(b):
  String(a?.name||'').toLocaleLowerCase()===String(b?.name||'').toLocaleLowerCase();
 const write=(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));return true;}catch{return false;}};
 function favorites(){return read(FAVORITES,[]).map(clean).filter(x=>x.id||x.name);}
 function recent(){return read(HISTORY,[]).map(clean).filter(x=>x.id||x.name);}
 function isFavorite(player){return favorites().some(x=>same(x,player));}
 function toggleFavorite(player){
  const item=clean(player),old=favorites(),has=old.some(x=>same(x,item));
  const next=has?old.filter(x=>!same(x,item)):[item,...old];
  write(FAVORITES,next.slice(0,35));
  return !has;
 }
 function remember(player){
  const item=clean(player),prior=recent().filter(x=>!same(item,x));
  write(HISTORY,[item,...prior].slice(0,30));
 }
 function ordered(){
  const f=favorites(),r=recent();
  return [...f,...r.filter(x=>!f.some(y=>same(x,y)))];
 }
 function keyFor(id){return EDIT_PREFIX+String(id);}
 function getEditKey(id){return localStorage.getItem(keyFor(id))||'';}
 function storeEditKey(id,secret){
  if(!/^[a-f0-9]{64}$/i.test(String(secret)))return false;
  try{localStorage.setItem(keyFor(id),String(secret).toLowerCase());return true;}catch{return false;}
 }
 function newEditKey(){
  const a=new Uint8Array(32);crypto.getRandomValues(a);
  return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');
 }
 async function request(query,body){
  const opt=body?{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify(body)}:{method:'GET'};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const r=await fetch(ENDPOINT+(query||''),{...opt,signal:controller.signal,cache:'no-store'});
   let data={};try{data=await r.json();}catch{}
   if(!r.ok){const err=new Error(data.error||'api-'+r.status);err.status=r.status;throw err;}
   return data;
  }finally{clearTimeout(timeout);}
 }
 function search(text){return request('?search='+encodeURIComponent(String(text||'').trim()));}
 function get(id){return request('?id='+encodeURIComponent(id));}
 function verify(id,editKey){return request('',{action:'check',id,editKey});}
 function save(id,editKey,revision,data){return request('',{action:'save',id,editKey,revision,data});}
 root.NRW_BEAR_PROFILES={search,get,verify,save,newEditKey,getEditKey,storeEditKey,
  remember,ordered,favorites,isFavorite,toggleFavorite,endpoint:ENDPOINT};
})(window);
