const path=require('path'),fs=require('fs'),vm=require('vm'),core=require('./player-core.js');
const src=fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),rules={};
const brawl=vm.runInNewContext(src.slice(src.indexOf('  const brawlCopy='),src.indexOf('  function brawlPlan'))+';({brawlCopy,gatheringPrep,trainingPrep})');
const guides=vm.runInNewContext(src.slice(src.indexOf('  const guides='),src.indexOf('  function planFromFeed'))+';guides');
function add(text,action=true,timing=null){if(!text)return;const k=core.hash(text);if(rules[k]&&rules[k].action!==action)throw Error('Conflicting task classification '+text);rules[k]={action,...(timing?{timing}:{})};}
// Explicit action positions in the incumbent strategies. Prohibitions and descriptions stay notes.
const manual={fishing:[0,1,2],viking:[0,1,2],eternity:[0,1,2,3],cesare:[0,2],golden:[0,1,2,3],kill:[2]};
for(const [kind,g] of Object.entries(guides))g.en.steps.forEach((t,i)=>add(t,(manual[kind]||[]).includes(i),kind==='golden'?[{fromMinute:0},{fromMinute:480},{fromMinute:960},{afterReset:true}][i]:null));
for(const stage of brawl.brawlCopy.en)stage[1].forEach(t=>add(t));
brawl.gatheringPrep.en.steps.forEach((t,i)=>add(t,i!==2,{prepare:true}));brawl.trainingPrep.en.steps.forEach(t=>add(t,true,{prepare:true}));
const feed=JSON.parse(fs.readFileSync(path.join(__dirname,'events.json')));
const actionable={
 'golden-glaives-prep-2026-09-20':[[0,1,2,3]],'golden-glaives-2026-09-21':[[0,1,2]],
 'alliance-brawl-2026-09':[[0,1,2,3],[0,2],[0,1,2,3],[0,1,2],[0,1],[0,1,2],[0,2]],
 'golden-glaives-2026-10-19':[[0,1,2],[0,1,2],[1,2]],
 'strongest-governor-2026-10-19':[[1,2],[1],[1,2],[0,1,2],[1],[0,1,2],[0,1,2]],
 'kingdom-of-power-prep-2026-10-05':[[0,1,2],[0,1,2],[0,1,2],[0,1,2],[0,1,2]]
};
const actionLead=/^(?:After reset, (?:first )?(?:complete|claim|perform|use|finish)|Then (?:complete|send|use|check)|Complete |Exchange |Check |Hunt |Use (?:your|the trucks|natural stamina)|Let (?:the )?gather|Train troops normally|Reserve |Combine |Prepare troop|Send |Activate |Recall |Set the correct|Be online)/i;
for(const e of feed.events){let d=0;for(const [date,p] of Object.entries(e.dailyPlans||{})){const steps=p.steps?.en||[],selected=actionable[e.id]?.[d++];steps.forEach((t,i)=>{let action=selected?selected.includes(i):actionLead.test(t);let timing=null;if(e.id==='golden-glaives-prep-2026-09-20')timing=[{fromMinute:0},{fromMinute:480},{fromMinute:960},{afterReset:true}][i];add(t,action,timing);});for(const t of p.prepare?.steps?.en||[]){let timing={prepare:true};const intel=t.includes('mission');if(intel&&t.includes('16:00'))timing={fromMinute:960,prepare:true};else if(intel&&t.includes('08:00'))timing={fromMinute:480,prepare:true};else if(intel&&t.includes('00:00'))timing={fromMinute:0,prepare:true};if(/After (?:the next|tomorrow.s) reset|After tomorrow.s reset|Tomorrow,/i.test(t))timing={afterReset:true};const actionable=!/^(?:Do not recall|Do not spend|Save |Keep all |The )/i.test(t);add(t,actionable,timing);}}}
const db=JSON.parse(fs.readFileSync(path.join(__dirname,'event-guides.json')));
const positions={merchant:[1,2,3],bear:[0,1,2],champagne:[0,1],transfer:[0]};
for(const g of db.events){if(!g.nrwGuide?.en||g.id==='alliance-championship')continue;const kind={'merchant-empire':'merchant','bear-trap':'bear','champagne-fair':'champagne','kingdom-transfer':'transfer'}[g.id];g.nrwGuide.en.forEach((t,i)=>{if(!rules[core.hash(t)])add(t,kind?(positions[kind]||[]).includes(i):actionLead.test(t),kind==='merchant'&&i===1?{fromMinute:600}:null);});}
// Native virtual events have verified actionable configuration/registration instructions.
for(const t of ['Activate your Pet Buffs before registering.','At 250M power or above: 60/40/0 with defensive heroes; move your best gear if needed.','Below 250M power: 50/20/30 with your three best heroes.','Register only in the middle lane.'])add(t);
fs.writeFileSync(path.join(__dirname,'player-task-rules.json'),JSON.stringify({version:1,note:'Metadata only. Text remains in existing event/guide sources. Unknown leadership prose stays informational. Timing references incumbent 00/08/16 UTC Intel and 10h merchant guidance.',rules},null,2)+'\n');
console.log('Built',Object.keys(rules).length,'reviewed instruction metadata records');

