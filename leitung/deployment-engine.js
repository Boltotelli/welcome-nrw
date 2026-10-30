/* Deterministic local planning. No network calls and no legion reassignment. */
export function decodeDeployment(key,sites=[]){
 const value=String(key||''),match=/^(north|south):(.+)$/.exec(value),location=match?match[2]:value;
 const site=sites.find(s=>s.key===location);
 const legacyGroup=/^[ABC]\d+$/.test(location)?(deploymentTargets('triforce',sites,location[0]).north.some(s=>s.key===location)?'north':'south'):(site&&site.y<50?'north':'south');
 return {location,group:location==='guerrilla'?'guerrilla':location==='safe-zone'?'secure':match?.[1]||legacyGroup};
}
export const isClosedStartingObjective=(eventType,key)=>eventType==='swordland'&&(['mercenary','shrine','reformation'].includes(key)||String(key).startsWith('under-'));
export function deploymentTargets(eventType,sites,side=''){
 let list=sites.filter(s=>!s.virtual&&!['safe-zone','guerrilla'].includes(s.key));
 list=list.filter(s=>!isClosedStartingObjective(eventType,s.key));
 if(eventType==='triforce')list=list.filter(s=>s.key.startsWith(side)&&side&&s.key!==side+'1');
 const midpoint=eventType==='triforce'&&list.length?(Math.min(...list.map(s=>s.y))+Math.max(...list.map(s=>s.y)))/2:50;
 return {north:list.filter(s=>s.y<midpoint),south:list.filter(s=>s.y>=midpoint)};
}
export function buildDeployment({players,assignments,mapAssignments,powers,sites,eventType,date,legion,settings}){
 const integer=(v,min,max)=>Number.isInteger(Number(v))&&Number(v)>=min&&Number(v)<=max;
 if(![1,2].includes(Number(legion))||!integer(settings.guerrilla,0,50)||!integer(settings.secure,0,100)||!integer(settings.northPercent,0,100)||!integer(settings.priorityCount,1,50))throw Error('invalid_settings');
 if(eventType==='triforce'&&!['A','B','C'].includes(settings.side))throw Error('choose_side');
 const targets=deploymentTargets(eventType,sites,settings.side);
 if(!targets.north.some(s=>s.key===settings.northTarget)||!targets.south.some(s=>s.key===settings.southTarget))throw Error('choose_targets');
 const people=new Map(players.filter(p=>p.active&&p.member_status!=='left').map(p=>[String(p.game_id),p]));
 const power=new Map(powers.filter(p=>p.power!=null&&Number.isSafeInteger(Number(p.power))&&Number(p.power)>0).map(p=>[String(p.game_id),Number(p.power)]));
 const roster=[...new Map(assignments.filter(a=>a.event_type===eventType&&a.battle_date===date&&Number(a.legion)===Number(legion)).map(a=>[String(a.game_id),a])).values()];
 const maps=new Map(mapAssignments.filter(a=>a.event_type===eventType&&a.battle_date===date).map(a=>[String(a.game_id),a]));
 const excluded=[],rows=[],pool=[],families=new Set();
 const item=a=>{const id=String(a.game_id),p=people.get(id);return{game_id:id,name:p?.name||id,family:String(p?.main_game_id||id),power:power.get(id)??null};};
 // Keep open objectives, but replan closed starting objectives in the preview.
 for(const a of roster){const p=item(a),m=maps.get(p.game_id);if(settings.keepExisting&&m&&!isClosedStartingObjective(eventType,decodeDeployment(m.location_key,sites).location)&&people.has(p.game_id)&&a.availability!=='unavailable'){
   rows.push({...p,...decodeDeployment(m.location_key,sites),location_key:m.location_key,locked:true});families.add(p.family);
 }}
 const retained=new Set(rows.map(p=>p.game_id));
 for(const a of roster){const p=item(a);if(retained.has(p.game_id))continue;
  const reason=!people.has(p.game_id)?'inactive':a.availability==='unavailable'?'unavailable':!settings.includeUnknown&&a.availability!=='full'&&a.availability!=='partial'?'availability':p.power===null?'power':null;
  if(reason){excluded.push({...p,reason});continue;}pool.push(p);
 }
 pool.sort((a,b)=>b.power-a.power||a.game_id.localeCompare(b.game_id,'en',{numeric:true}));
 const candidates=pool.filter(p=>{if(settings.onePerFamily&&families.has(p.family)){excluded.push({...p,reason:'family'});return false;}families.add(p.family);return true;});
 const add=(p,group,location)=>rows.push({...p,group,location,location_key:['north','south'].includes(group)?group+':'+location:location,locked:false});
 const lockedCount=g=>rows.filter(p=>p.group===g).length;
 const takeG=Math.min(candidates.length,Math.max(0,Number(settings.guerrilla)-lockedCount('guerrilla')));
 for(const p of candidates.splice(0,takeG))add(p,'guerrilla','guerrilla');
 const takeS=Math.min(candidates.length,Math.max(0,Number(settings.secure)-lockedCount('secure')));
 for(const p of candidates.splice(candidates.length-takeS,takeS))add(p,'secure','safe-zone');
 const counts={north:lockedCount('north'),south:lockedCount('south')},totals={north:0,south:0};
 for(const p of rows)if(p.group in totals)totals[p.group]+=p.power||0;
 const total=candidates.length+counts.north+counts.south;
 const desired={north:Math.round(total*Number(settings.northPercent)/100)};desired.south=total-desired.north;
 const grouped={north:[],south:[]};
 for(const p of candidates){
  const canN=counts.north<desired.north,canS=counts.south<desired.south;
  const group=!canN?'south':!canS?'north':totals.north/Math.max(1,desired.north)<=totals.south/Math.max(1,desired.south)?'north':'south';
  grouped[group].push(p);counts[group]++;totals[group]+=p.power;
 }
 for(const group of ['north','south']){
  const focus=settings[group+'Target'],loads=new Map(targets[group].map(s=>[s.key,0]));
  for(const p of rows)if(p.group===group&&loads.has(p.location))loads.set(p.location,loads.get(p.location)+(p.power||0));
  const remaining=grouped[group],priority=Math.max(0,Number(settings.priorityCount)-rows.filter(p=>p.group===group&&p.location===focus).length);
  for(const p of remaining.splice(0,priority)){add(p,group,focus);loads.set(focus,loads.get(focus)+p.power);}
  const secondary=targets[group].filter(s=>s.key!==focus);if(!secondary.length)secondary.push(targets[group].find(s=>s.key===focus));
  for(const p of remaining){const target=secondary.slice().sort((a,b)=>loads.get(a.key)-loads.get(b.key)||a.key.localeCompare(b.key))[0];add(p,group,target.key);loads.set(target.key,loads.get(target.key)+p.power);}
 }
 return {eventType,date,legion:Number(legion),rows,excluded,changes:rows.filter(p=>!p.locked&&maps.get(p.game_id)?.location_key!==p.location_key),groups:Object.fromEntries(['north','south','secure','guerrilla'].map(g=>[g,{count:rows.filter(p=>p.group===g).length,known:rows.filter(p=>p.group===g&&p.power!==null).length,power:rows.filter(p=>p.group===g).reduce((n,p)=>n+(p.power||0),0)}]))};
}
