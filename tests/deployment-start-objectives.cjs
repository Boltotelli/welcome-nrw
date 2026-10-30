const assert=require('assert'),{pathToFileURL}=require('url');
(async()=>{
 const {buildDeployment,decodeDeployment,deploymentTargets}=await import(pathToFileURL(__dirname+'/../leitung/deployment-engine.js'));
 const sites=[{key:'bell',y:15},{key:'abbey-north',y:20},{key:'under-nw',y:10},{key:'mercenary',y:30},{key:'shrine',y:49},{key:'stables',y:85},{key:'reformation',y:75},{key:'abbey-south',y:90},{key:'safe-zone',y:50},{key:'guerrilla',virtual:true}];
 const settings={guerrilla:2,secure:2,northPercent:50,priorityCount:2,northTarget:'bell',southTarget:'stables',keepExisting:false,onePerFamily:true,includeUnknown:false};
 const players=Array.from({length:24},(_,i)=>({game_id:String(i+1),name:'Player '+(i+1),active:i!==23}));players[2].main_game_id='2';
 const assignments=players.map((p,i)=>({game_id:p.game_id,event_type:'swordland',battle_date:'2026-10-21',legion:i===22?2:1,availability:i===21?'unavailable':i===20?'unknown':'full'}));
 const powers=players.filter((_,i)=>i!==19).map((p,i)=>({game_id:p.game_id,power:100000-i*1000}));
 const input={sites,settings,players,assignments,powers,mapAssignments:[],eventType:'swordland',date:'2026-10-21',legion:1};
 const p=buildDeployment(input);assert.deepEqual(p.rows.filter(p=>p.group==='guerrilla').map(p=>p.game_id),['1','2']);assert(p.excluded.some(p=>p.game_id==='3'&&p.reason==='family'));
 assert.equal(p.groups.secure.count,2);assert(p.excluded.some(p=>p.reason==='power'));assert(p.excluded.some(p=>p.reason==='availability'));assert(p.excluded.some(p=>p.reason==='unavailable'));assert(!p.rows.some(p=>p.game_id==='23'||p.game_id==='24'));
 assert(Math.abs(p.groups.north.count-p.groups.south.count)<=1);assert.equal(new Set(p.rows.map(p=>p.game_id)).size,p.rows.length);
 for(const group of ['north','south']){const list=p.rows.filter(p=>p.group===group).sort((a,b)=>b.power-a.power);assert(list.slice(0,2).every(p=>p.location===(group==='north'?'bell':'stables')));assert(list.slice(2).every(p=>p.location!==(group==='north'?'bell':'stables')));}
 assert.deepEqual(buildDeployment({...input,players:[...players].reverse(),assignments:[...assignments].reverse(),powers:[...powers].reverse()}).rows,p.rows,'Input order does not change plan');
 for(const pct of [0,100]){const x=buildDeployment({...input,settings:{...settings,northPercent:pct}});assert.equal(x.groups[pct===0?'north':'south'].count,0);}
 const held=buildDeployment({...input,settings:{...settings,keepExisting:true},mapAssignments:[{event_type:'swordland',battle_date:'2026-10-21',game_id:'1',location_key:'south:stables'}]});assert(held.rows.find(p=>p.game_id==='1').locked);assert(!held.changes.some(p=>p.game_id==='1'));
 const tiny=buildDeployment({...input,players:players.slice(0,1),assignments:assignments.slice(0,1),settings:{...settings,guerrilla:50,secure:100}});assert.equal(tiny.rows.length,1);assert.equal(tiny.groups.guerrilla.count,1);
 assert.throws(()=>buildDeployment({...input,settings:{...settings,guerrilla:-1}}),/invalid_settings/);
 assert.throws(()=>buildDeployment({...input,eventType:'triforce'}),/choose_side/);
 const triSites=Array.from({length:10},(_,i)=>({key:'A'+(i+1),name:'A'+(i+1),y:i*9})).concat([{key:'safe-zone',virtual:true},{key:'guerrilla',virtual:true}]);
 const targets=deploymentTargets('triforce',triSites,'A');assert(!targets.north.some(x=>x.key==='A1'));assert(targets.north.length&&targets.south.length);
 const tri=buildDeployment({...input,eventType:'triforce',sites:triSites,assignments:assignments.map(a=>({...a,event_type:'triforce'})),settings:{...settings,side:'A',northTarget:targets.north[0].key,southTarget:targets.south[0].key}});assert(tri.rows.every(p=>['safe-zone','guerrilla'].includes(p.location)||p.location.startsWith('A')));
 assert.equal(decodeDeployment('north:A24',triSites).group,'north');assert.equal(decodeDeployment('south:bell',sites).group,'south');
 const legacySites=[{key:'A2',y:91},{key:'A29',y:58},{key:'A31',y:55},{key:'B2',y:26},{key:'B17',y:44},{key:'B18',y:56}];assert.equal(decodeDeployment('A29',legacySites).group,'north');assert.equal(decodeDeployment('B17',legacySites).group,'south');
 assert(p.rows.every(x=>!['mercenary','shrine','reformation','under-nw'].includes(x.location)));const locked=buildDeployment({...input,settings:{...settings,keepExisting:true},mapAssignments:[{event_type:'swordland',battle_date:'2026-10-21',game_id:'1',location_key:'north:mercenary'}]});assert(!locked.rows.find(x=>x.game_id==='1').locked);assert.notEqual(locked.rows.find(x=>x.game_id==='1').location,'mercenary');console.log('PASS: deterministic groups, strongest Guerilla, weakest Secure, count/power split, priority strength, main/alt, availability, missing power, preserved positions, small rosters, ratio extremes and explicit Tri side');
})();
