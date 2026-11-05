import {OUTPOST_CATALOG} from './tools-outpost-catalog.js?v=20261105-territory-season-1';
export const rewardScope=data=>(data.season||'unknown')+':'+(data.phase||'unknown');
export function prepareTerritory(input){
 const migrate=input.rewardOverrides===undefined,data=structuredClone(input);data.season??='';data.rewardOverrides??={};
 const scope=rewardScope(data);data.rewardOverrides[scope]??={};
 for(const [key,site] of Object.entries(data.sites||{}))if(migrate&&site.reward&&data.rewardOverrides[scope][key]===undefined)data.rewardOverrides[scope][key]=site.reward;
 const pending=[...(data.outposts||[])],result=[];
 for(const ref of OUTPOST_CATALOG){const index=pending.findIndex(o=>o.id===ref.id||!o.id&&o.type===ref.type&&o.level===ref.level&&o.x===ref.x&&o.y===ref.y),saved=index<0?null:pending.splice(index,1)[0];
  result.push({...ref,owned:false,connected:false,...saved,id:ref.id});
 }
 data.outposts=[...result,...pending];return data;
}
export function manualReward(data,siteKey){return data.rewardOverrides?.[rewardScope(data)]?.[siteKey]||'';}
