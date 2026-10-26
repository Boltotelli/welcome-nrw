/* Local player preferences and verified timing metadata. No leadership writes. */
(function(root){
 'use strict';
 const day=86400000,utcDate=now=>new Date(now).toISOString().slice(0,10);
 function hash(text){let h=2166136261;for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
 const taskKey=(eventId,date,taskId)=>['nrw-task-v2',eventId,date,taskId].map(encodeURIComponent).join(':');
 function timing(rule,date,now=Date.now(),override=false){
   if(override||!rule)return 'general';
   const start=Date.parse(date+'T00:00:00Z'),time=Number(now);
   if(time<start)return 'tomorrow';
   if(time>=start+day)return 'past';
   if(rule.eventStartMinute!=null)return time<start+rule.eventStartMinute*60000?'eventPrep':'eventStarted';
   if(rule.afterReset)return 'reset';
   if(rule.fromMinute!=null&&time<start+rule.fromMinute*60000)return 'later';
   if(rule.untilMinute!=null&&time>=start+rule.untilMinute*60000)return 'past';
   return rule.prepare?'prepare':'now';
 }
 function store(storage){
   let memory=new Map(),failed=false;
   return {get failed(){return failed;},get(key){if(memory.has(key))return memory.get(key)===true;try{return storage.getItem(key)==='1';}catch{failed=true;return memory.get(key)===true;}},set(key,value){memory.set(key,value);try{if(value)storage.setItem(key,'1');else storage.removeItem(key);}catch{failed=true;}},prune(now=Date.now()){try{const cutoff=utcDate(Number(now)-35*day);for(let i=storage.length-1;i>=0;i--){const key=storage.key(i);if(key?.startsWith('nrw-task-v2:')){const date=decodeURIComponent(key.split(':')[2]||'');if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&date<cutoff)storage.removeItem(key);}}}catch{failed=true;}}};
 }
 function announcementText(text,lang){if(!text||typeof text!=='object')return {text:'',language:null};const language=[lang,'de','en','fr'].find(l=>typeof text[l]==='string'&&text[l].trim());return {text:language?text[language]:'',language:language||null};}
 function visibleAnnouncement(row,now=Date.now()){return !!row&&row.status==='published'&&(!row.expires_at||Date.parse(row.expires_at)>Number(now));}
 const api={hash,utcDate,taskKey,timing,store,announcementText,visibleAnnouncement};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NRW_PLAYER_CORE=api;
})(typeof window!=='undefined'?window:globalThis);
