/* NRW Bear V3 — name-first, OCR-free workflow. Test branch.
 * The old wizard is left untouched for reversible migration.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE,C=window.NRW_BEAR_CATALOG;
if(!B||!C)return;
const CL=['infantry','cavalry','archer'],LABEL=['Infanterie','Kavallerie','Bogenschützen'];
const heroList=C.heroes||[],heroNames=new Set(heroList.map(h=>h.name));
const el=(tag,cls='',txt)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node;};
const num=x=>Number(x||0).toLocaleString('de-DE',{maximumFractionDigits:1});
const valid=x=>typeof x==='string'&&x.trim().length>=2&&x.trim().length<=50;
let name='',mode='',version=null,editKey=null,syncTimer=null,syncInFlight=false,dirty=false,heroInfoCache={},lastResult=null;
// Preserve expanded generations when hero tiles refresh.
const expandedSeasons=new Set([5,6,7,8]);
const app=el('main','bear-name-app');app.id='bearNewApp';document.body.prepend(app);document.body.classList.add('bear-name-mode');
const box=el('div','bear-name-container'),status=el('p','bear-name-status');
app.append(box,status);
const title=(txt,tag='h2')=>el(tag,'',txt);
const button=(txt,fn,cls='bear-name-btn')=>{const b=el('button',cls,txt);b.type='button';b.addEventListener('click',fn);return b;};
function state(){const m=B.model();m.v2=m.v2||{};m.values=m.values||{};m.v2.manualHeroes=m.v2.manualHeroes||{};m.v2.scannedOwnedHeroes=m.v2.scannedOwnedHeroes||[];return m;}
function keyForName(value){return 'nrw_bear_name_edit_v1:'+value.normalize('NFKC').toLowerCase().trim();}
function saveLocal(){B.save();dirty=true;clearTimeout(syncTimer);syncTimer=setTimeout(push,1400);}
function showStatus(s,error=false){status.textContent=s;status.classList.toggle('error',error);}
function numberField(label,value,onChange,options={}){
 const wrap=el('label','bear-name-field'),span=el('span','',label),input=el('input');
 input.type='number';input.min=options.min??0;input.max=options.max??100000000;input.step=options.step??1;
 input.value=value===undefined||value===null?'':value;input.placeholder=options.placeholder||'';
 input.addEventListener('change',()=>{const n=input.value===''?null:Number(input.value);
  if(n!==null&&(!Number.isFinite(n)||n<Number(input.min)||n>Number(input.max)))return input.setCustomValidity('Ungültiger Wert');
  input.setCustomValidity('');onChange(n);});
 wrap.append(span,input);return wrap;
}
function choose(label,values,value,onChange){
 const w=el('label','bear-name-field'),caption=el('span','',label),s=el('select');
 for(const [id,title] of values){const o=el('option','',title);o.value=String(id);s.append(o)}s.value=String(value??'');
 s.addEventListener('change',()=>onChange(s.value));w.append(caption,s);return w;
}
function heroStock(){const v=state().v2;return v.scannedOwnedHeroes.filter(n=>heroNames.has(n)&&v.manualHeroes[n]);}
function rankAndSelect(){
 const m=state(),v=m.v2,owned=heroStock().map(n=>v.manualHeroes[n]);
 const advisor=window.NRW_BEAR_HERO_ADVISOR,ref=window.NRW_BEAR_HERO_REFERENCE;
 let groups=advisor?.recommend(owned,C.heroTypes,window.NRW_BEAR_INTAKE_CORE?.rankByType,
  (n,s,t)=>ref?.get?.(n,s,t),(n,w)=>window.NRW_BEAR_OWN_BASELINE?.widgetValue?.(n,w),
  advisor?.modelContext?.(m,window.NRW_BEAR_COMBAT))||[];
 const picked=CL.map((cl,i)=>groups[i]?.best?.name||owned.find(h=>C.heroTypes[h.name]===cl)?.name||'');
 v.ownHeroes=picked;
 B.save();
 return {picked,groups};
}
function pack(){
 const m=state(),v=m.v2,heroes={};
 for(const n of heroStock()){
  const h=v.manualHeroes[n];heroes[n]={stars:Number(h.stars??0),tier:Number(h.tier??0),widget:Number(h.widget??0),
   level:80,expeditionStats:h.expeditionStats||{}};
 }
 return {heroes,ownHeroes:v.ownHeroes||[],joinCount:v.joinCount||0,
  troopGroups:v.troopGroups||[],values:m.values||{},combatStatOrigin:v.combatStatOrigin||'combined-report',
  valoraTalent:v.valoraTalent||0,savageAdvantage:v.valora?.[3]||0,
  petActive:v.petActive||{},petSkillRanks:v.petSkillRanks||{},petBuffCapturedInStats:!!v.petBuffCapturedInStats};
}
function unpack(d){
 const m=state(),v=m.v2;v.manualHeroes={};v.scannedOwnedHeroes=[];
 for(const [n,h] of Object.entries(d.heroes||{})){
  if(!heroNames.has(n))continue;
  v.scannedOwnedHeroes.push(n);v.manualHeroes[n]={name:n,level:80,stars:Number(h.stars)||0,tier:Number(h.tier)||0,
   widget:Number(h.widget)||0,skillsAssumedMax:true,
   skills:Array(3).fill(Math.min(5,Number(h.stars)+1)),expeditionStats:h.expeditionStats||{}};
 }
 v.ownHeroes=(d.ownHeroes||[]).slice(0,3);
 v.joinCount=Math.max(0,Math.min(6,Number(d.joinCount)||0));
 v.troopGroups=d.troopGroups||[];v.troopTiers=[{tier:10,tg:0},{tier:10,tg:0},{tier:10,tg:0}];
 v.valora=[0,0,0,Number(d.savageAdvantage)||0];v.valoraTalent=Number(d.valoraTalent)||0;
 v.petActive=d.petActive||{};v.petSkillRanks=d.petSkillRanks||{};v.petBuffCapturedInStats=!!d.petBuffCapturedInStats;
 v.combatStatOrigin=d.combatStatOrigin||'combined-report';
 Object.assign(m.values,d.values||{});
 for(const [i,type] of CL.entries())m.values[['troopsI','troopsC','troopsA'][i]]=v.troopGroups.filter(g=>g.type===type).reduce((n,g)=>n+Number(g.count),0);
 B.save();
}
async function openProfile(value){
 name=value.trim().replace(/\s+/g,' ');version=null;dirty=false;
 editKey=localStorage.getItem(keyForName(name));
 if(!editKey){editKey=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem(keyForName(name),editKey);}
 // Deterministic opaque local key; NO player ID is needed or requested.
 let hash=2166136261;for(const ch of name.toLocaleLowerCase()){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 B.activateSavedId('name-'+(hash>>>0),name);
 if(location.hostname.endsWith('github.io')){
  // GitHub Pages hosts a static preview: never pretend server-side GitHub
  // profile storage or private API routes are available.
  showStatus('GitHub Pages: Eingaben werden nur lokal auf diesem Gerät gespeichert.');
  mode='';render();return;
 }
 try{
  const response=await fetch('/api/bear-players?name='+encodeURIComponent(name),{cache:'no-store'});
  if(response.ok){const remote=await response.json();unpack(remote.data);version=remote.version;showStatus('Gemeinsames Profil geladen: '+remote.name);}
  else if(response.status===404)showStatus('Neuer Name – Eingaben werden automatisch gespeichert, sobald der Server bereit ist.');
  else showStatus('Lokales Profil geöffnet. GitHub-Synchronisierung derzeit nicht verfügbar.');
 }catch(_){showStatus('Lokales Profil geöffnet. GitHub-Synchronisierung derzeit nicht verfügbar.');}
 mode='';render();
}
async function push(){
 if(!name||syncInFlight||!dirty)return;
 if(location.hostname.endsWith('github.io')){
  showStatus('GitHub Pages-Test: ausschließlich lokal gespeichert.');dirty=false;return;
 }
 syncInFlight=true;
 try{
  const response=await fetch('/api/bear-players',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,data:pack(),editKey,version})});
  const answer=await response.json();
  if(response.ok){version=answer.version;dirty=false;showStatus('✓ Gespeichert (privates GitHub-Profil): '+name);}
  else if(response.status===403){showStatus('Dieses Profil wird auf einem anderen Gerät verwaltet. Hier nur lokal gespeichert.',true);dirty=false;}
  else if(response.status===409){showStatus('Profil wurde zwischenzeitlich geändert. Neu öffnen, um Änderungen abzugleichen.',true);dirty=false;}
  else{showStatus('Nur lokal gespeichert – GitHub-Schreibzugang noch nicht bereit.',true);}
 }catch(_){showStatus('Nur lokal gespeichert – GitHub nicht erreichbar.',true);}
 syncInFlight=false;
}
function rosterSection(){
 const section=el('section','bear-name-panel'),head=title('Deine Helden');
 section.append(head,el('p','bear-name-muted','Anklicken = im Besitz. Alle Helden gelten als Level 80. Sterne/Tier und bei goldenen Helden Widget einstellen.'));
 const selected=state().v2.scannedOwnedHeroes;
 const groups=new Map();
 heroList.forEach((h,i)=>{const season=i<16?1:Math.min(8,Math.floor((i-16)/3)+2);if(!groups.has(season))groups.set(season,[]);groups.get(season).push(h);});
 for(const [season,heroes] of groups){
  const details=el('details','bear-name-season');details.open=expandedSeasons.has(season);
  // Record user intent, instead of recreating every <details> as closed
  // whenever the selection rerenders the hero gallery.
  details.addEventListener('toggle',()=>{
   if(!details.isConnected)return;
   if(details.open)expandedSeasons.add(season);else expandedSeasons.delete(season);
  });
  const caption=el('summary','',season===1?'Generation 1 · Basishelden':'Generation '+season);details.append(caption);
  const grid=el('div','bear-name-hero-grid');
  for(const hero of heroes){
   const n=hero.name,owned=selected.includes(n),h=state().v2.manualHeroes[n]||{name:n,level:80,stars:0,tier:0,widget:0,starPendingReview:true};
   const card=el('div','bear-name-hero-card'+(owned?' active':'')),tap=button('',()=>{
    const v=state().v2;
    if(v.scannedOwnedHeroes.includes(n))v.scannedOwnedHeroes=v.scannedOwnedHeroes.filter(x=>x!==n);
    else{v.scannedOwnedHeroes.push(n);v.manualHeroes[n]={...h,name:n,level:80,skillsAssumedMax:true};}
    const previousY=window.scrollY||0;
    saveLocal();render();
    // Preserve the reader's position when the selected card gains fields.
    window.requestAnimationFrame?.(()=>window.scrollTo({top:previousY,behavior:'instant'}));
   },'bear-name-hero-pick');
   const img=el('img');img.src=heroInfoCache[n]?.imageUrl||hero.img||'';img.alt=n;img.loading='lazy';
   const text=el('span','',n);tap.append(img,text);card.append(tap);
   if(owned){
    const meta=el('div','bear-name-hero-fields');
    const steps=[];for(let i=0;i<=30;i++)steps.push([i,Math.floor(i/6)+'★'+(i%6?' T'+i%6:'')]);
    const step=Number(h.stars||0)*6+Number(h.tier||0);
    meta.append(choose('Sterne / Tier',steps,step,x=>{
     const val=Number(x),v=state().v2.manualHeroes[n];v.stars=Math.floor(val/6);v.tier=val%6;
     v.skills=Array(3).fill(Math.min(5,v.stars+1));v.skillsAssumedMax=true;v.starPendingReview=false;saveLocal();
    }));
    const notGold=new Set(['Olive','Edwin','Forrest','Seth','Quinn','Diana','Amane','Yeonwoo','Gordon','Chenko','Fahd','Howard']);
    if(!notGold.has(n)){
     meta.append(choose('Widget',Array.from({length:11},(_,i)=>[i,'+'+i]),h.widget??0,x=>{
      state().v2.manualHeroes[n].widget=Number(x);saveLocal();
     }));
    }
    const info=button('ℹ KAC-Daten',async()=>{
     if(!heroInfoCache[n]?.reference){
      info.disabled=true;info.textContent='Lade…';
      try{
       const response=await fetch('/api/bear-reference?hero='+encodeURIComponent(n));if(!response.ok)throw Error();
       heroInfoCache[n]=await response.json();
       const url=heroInfoCache[n].imageUrl;
       if(url){img.onerror=()=>{img.onerror=null;img.src=hero.img||'';};img.src=url;}
      }catch(_){info.textContent='Quelle nicht verfügbar';info.disabled=false;return;}
     }
     info.textContent='Quelle ansehen ↗';
     const a=el('a','bear-name-ref-link','Kingshot Alliance Command · '+n);
     a.href=heroInfoCache[n].sourceUrl;a.target='_blank';a.rel='noopener noreferrer';
     const old=card.querySelector('.bear-name-ref-link');if(old)old.remove();card.append(a);info.disabled=false;
    },'bear-name-info');if(location.hostname.endsWith('github.io')){
      info.disabled=true;info.title='KAC-Schnittstelle erfordert den späteren Serverbetrieb';
      info.textContent='KAC-Details folgen';
    }
    meta.append(info);card.append(meta);
   }
   grid.append(card);
  }
  details.append(grid);section.append(details);
 }
 return section;
}
function troopsSection(required){
 const m=state(),v=m.v2,section=el('section','bear-name-panel');
 section.append(title('Truppen'),el('p','bear-name-muted','Pro Truppentyp beliebig viele T- und TG-Stufen hinzufügen. Die Summen werden automatisch ermittelt.'));
 const rows=el('div','bear-name-troops');
 function redraw(){
  rows.replaceChildren();
  for(const [i,g] of (v.troopGroups||[]).entries()){
   const line=el('div','bear-name-troop-row');
   line.append(choose('Typ',CL.map((x,i)=>[x,LABEL[i]]),g.type,x=>{g.type=x;update();}),
    numberField('T',g.tier,x=>{g.tier=x;update();},{min:1,max:11}),
    numberField('TG',g.tg,x=>{g.tg=x;update();},{min:0,max:8}),
    numberField('Anzahl',g.count,x=>{g.count=x;update();},{min:1,max:100000000}));
   line.append(button('×',()=>{v.troopGroups.splice(i,1);update();redraw();},'bear-name-remove'));rows.append(line);
  }
 }
 function update(){for(const [i,type] of CL.entries())m.values[['troopsI','troopsC','troopsA'][i]]=(v.troopGroups||[])
  .filter(g=>g.type===type).reduce((n,g)=>n+Math.max(0,Number(g.count)||0),0);saveLocal();}
 section.append(rows,button('+ Truppen hinzufügen',()=>{v.troopGroups=v.troopGroups||[];v.troopGroups.push({type:'archer',tier:10,tg:0,count:1});update();redraw();}));
 redraw();if(!required)section.append(el('p','bear-name-muted','Optional für die schnelle Heldenempfehlung.'));
 return section;
}
function scalarSection(){
 const m=state(),v=m.v2,section=el('section','bear-name-panel');
 section.append(title('Basiswerte & aktive Buffs'),el('p','bear-name-muted','Angriff und Tödlichkeit aller Truppentypen aus der Bonusübersicht. Fehlende Werte bleiben offen – keine stillen Schätzungen.'));
 section.append(choose('Anzahl aller Märsche (inkl. eigener Rally)',Array.from({length:7},(_,i)=>[i+1,String(i+1)]),
  Number(v.joinCount||0)+1,x=>{v.joinCount=Number(x)-1;saveLocal();}));
 const grid=el('div','bear-name-stat-grid');
 grid.append(numberField('Basis-Marschkapazität ohne Helden',m.values.cap,x=>{m.values.cap=x;saveLocal();},{max:1000000}));
 for(const [i,cl] of CL.entries())for(const [field,label] of [['Atk','Angriff %'],['Let','Tödlichkeit %']]){
  const k=['i','c','a'][i]+field;
  grid.append(numberField(LABEL[i]+' · '+label,m.values[k],x=>{
   if(x===null)delete m.values[k];else m.values[k]=x;
   saveLocal();
  },{step:0.1,max:10000}));
 }
 section.append(grid,choose('Herkunft dieser Werte',[['combined-report','Bereits kombinierte Kampfwerte'],['separate-overview','Separate Werte aus Bonusübersicht']],
  v.combatStatOrigin||'combined-report',x=>{v.combatStatOrigin=x;saveLocal();}));
 if(v.combatStatOrigin==='separate-overview'){
  const gr=el('div','bear-name-stat-grid');for(const k of ['squadAtk','squadLet'])
   gr.append(numberField(k==='squadAtk'?'Schwadron Angriff %':'Schwadron Tödlichkeit %',m.values[k],x=>{
    if(x===null)delete m.values[k];else m.values[k]=x;saveLocal();
   },{step:0.1,max:10000}));
  section.append(gr);
 }
 section.append(title('Pets & Valora','h3'));
 const petGrid=el('div','bear-name-stat-grid');v.petActive=v.petActive||{};v.petSkillRanks=v.petSkillRanks||{};
 for(const n of ['Giant Rhino','Black Panther','War Bear','Moose','Mighty Bison']){
  const line=el('div','bear-name-pet-line'),lab=el('label'),check=el('input');check.type='checkbox';check.checked=!!v.petActive[n];
  check.onchange=()=>{v.petActive[n]=check.checked;saveLocal();};lab.append(check,document.createTextNode(' '+n));line.append(lab,
   numberField('Skill-Level',v.petSkillRanks[n],x=>{if(x===null)delete v.petSkillRanks[n];else v.petSkillRanks[n]=x;saveLocal();},{min:1,max:10}));
  petGrid.append(line);
 }
 petGrid.append(numberField('Valora · Savage Advantage',v.valora?.[3],x=>{
  v.valora=v.valora||[0,0,0,0];v.valora[3]=x||0;saveLocal();},{min:0,max:10}),
  numberField('Valora · Hunter Instinct',v.valoraTalent,x=>{v.valoraTalent=x||0;saveLocal();},{min:0,max:11}));
 section.append(petGrid,el('p','bear-name-muted','Level-5-Falle: +25 Prozentpunkte Angriff. Bison und Valora erhöhen Kapazität; aktivierte Rhino-/Panther-Buffs werden nur hinzugerechnet, wenn sie nicht bereits in den eingegebenen Kampfwerten enthalten sind.'));
 const present=el('label','bear-name-pet-line'),ch=el('input');ch.type='checkbox';ch.checked=!!v.petBuffCapturedInStats;ch.onchange=()=>{v.petBuffCapturedInStats=ch.checked;saveLocal();};
 present.append(ch,document.createTextNode(' Aktive Pet-ATK/LET-Buffs sind bereits in diesen Werten enthalten'));section.append(present);
 return section;
}
function starterGearSection(picked){
 const v=state().v2,section=el('section','bear-name-panel');
 section.append(title('Heldenausrüstung nach dem Umziehen prüfen'),el('p','bear-name-muted','Ziehe zuerst deine beste Heldenausrüstung auf die drei empfohlenen Starter um. Trage DANACH ihre tatsächlichen Expeditionsboni für Angriff und Tödlichkeit ein. Nichts wird doppelt addiert.'));
 const list=el('div','bear-name-stat-grid');
 picked.forEach((n,i)=>{
  if(!n)return;const h=v.manualHeroes[n]||(v.manualHeroes[n]={name:n,level:80}),stats=h.expeditionStats||(h.expeditionStats={});
  const div=el('div','bear-name-gear-card');div.append(title(LABEL[i]+' · '+n,'h3'));
  for(const kind of ['Atk','Let']){
   const key=['i','c','a'][i]+kind;
   div.append(numberField(kind==='Atk'?'Expeditions-Angriff %':'Expeditions-Tödlichkeit %',stats[key],x=>{
    if(x===null)delete stats[key];else stats[key]=x;saveLocal();
   },{step:0.1,max:5000}));
  }
  list.append(div);
 });section.append(list);return section;
}
function summaryHeroes(){
 const {picked,groups}=rankAndSelect(),v=state().v2,section=el('section','bear-name-panel');
 section.append(title('Empfohlene Starter & Joiner'),el('p','bear-name-muted',
  'Die Heldenwahl ist modellbasiert. Alle Helden sind Level 80, die Skills werden aus Sternen als maximal ausgebaut angenommen.'));
 const starter=el('div','bear-name-picks');
 picked.forEach((n,i)=>{const h=el('div','bear-name-pick'),hero=heroList.find(x=>x.name===n);
  if(hero){const img=el('img');img.src=heroInfoCache[n]?.imageUrl||hero.img;img.alt='';h.append(img);}
  h.append(el('strong','',LABEL[i]),el('span','',n||'Noch kein passender Held'));
  if(groups[i]?.best?.confidence)h.append(el('small','',groups[i].best.confidence==='higher'?'Werte geprüft':'Schätzung – Werte ergänzen'));
  starter.append(h);
 });section.append(starter);
 const formation=window.NRW_BEAR_FORMATION?.chooseHeroes?.(state(),C);
 if(formation){
  const joined=el('div','bear-name-joins');formation.joins.forEach((row,i)=>{
   const article=el('div','bear-name-join');article.append(el('strong','',String(i+1)+'. Join'));
   const heroes=row.heroes.map(x=>x?.name||'—');article.append(el('span','',heroes.join(' · ')));
   if(row.skillLevel===null)article.append(el('small','','Erste Fähigkeit: Sterne-basierte Annahme, nicht bestätigt'));
   joined.append(article);
  });section.append(title('Joiner: erster Held = relevante Fähigkeit','h3'),joined);
 }
 return {section,picked};
}
function predicted(){
 const out=el('section','bear-name-panel');out.append(title('Erweiterte Schadensoptimierung'));
 const model=state(),v=model.v2,combat=window.NRW_BEAR_COMBAT,alloc=window.NRW_BEAR_FORMATION,
  scores=window.NRW_BEAR_SCORE_BONUSES,proc=window.NRW_BEAR_PROC_EXPECTATION,
  ref=window.NRW_BEAR_HERO_REFERENCE;
 if(!combat||!alloc||!scores||!ref||ref.status?.()!=='ready'){
  out.append(el('p','bear-name-muted','Helden-Referenzdaten noch nicht geladen. Bitte erneut berechnen.'));return out;
 }
 const tiers=combat.configure(v),current=window.NRW_BEAR_OWN_BASELINE.currentStats(model);
 const stock=CL.map((x,i)=>Number(model.values[['troopsI','troopsC','troopsA'][i]])||0);
 const cap=window.NRW_BEAR_CAPACITY?.breakdown(model,C);
 if(!combat.ready(current,tiers)||stock.some(x=>!x)||!cap?.complete){
  out.append(el('p','bear-name-muted','Es fehlen Truppen (T/TG), sechs Kampfwerte oder Basis-Marschkapazität. Keine erfundenen Zahlen.'));return out;
 }
 const totalSlots=Math.min(7,1+Number(v.joinCount||0));const capacity=cap.total;
 if(!capacity){out.append(el('p','bear-name-muted','Keine gültige Marschkapazität.'));return out;}
 const shareTotal=Math.min(stock.reduce((a,b)=>a+b,0),totalSlots*capacity);
 const targetBase=Math.floor(shareTotal/totalSlots),extra=shareTotal-targetBase*totalSlots;
 const targets=Array.from({length:totalSlots},(_,i)=>targetBase+(i<extra?1:0));
 // All joins use 10/10/80, Archers are reserved for them before the starter.
 let best=null;
 for(let inf=0;inf<=100;inf++)for(let cav=0;cav<=100-inf;cav++){
  const rows=alloc.allocateStock(targets,stock,[inf,cav],[10,10]);
  const perMarch=combat.allocateLevels?.(rows,tiers,true);
  const leader=perMarch?.[0]||tiers;
  const score=combat.damage(rows[0],current,leader,5);
  if(Number.isFinite(score)&&(best===null||score>best.score+0.000001||
    (Math.abs(score-best.score)<0.000001&&Math.abs(inf-10)+Math.abs(cav-10)<best.distance)))
   best={score,distance:Math.abs(inf-10)+Math.abs(cav-10),ratio:[inf,cav,100-inf-cav],rows,leader};
 }
 if(!best){out.append(el('p','bear-name-muted','Keine gültige Formation gefunden.'));return out;}
 const counts=best.rows[0];
 const cloned={...model,v2:{...v,troopGroups:best.leader.flatMap((lvl,i)=>Array.isArray(lvl.groups)?
   lvl.groups.map(g=>({type:CL[i],tier:g.tier,tg:g.tg,count:g.count})):
   [{type:CL[i],tier:lvl.tier,tg:lvl.tg,count:counts[i]}]).filter(g=>g.count>0)}};
 // Apply first to self, then independent Join skill configurations; NEVER
 // use the current player's own combat stats as a proxy for external leads.
 const baselineStats=window.NRW_BEAR_OWN_BASELINE.currentStats(model);
 const scenarios=[
  {name:'Ohne Joinerfähigkeiten',atk:0,let:0},
  {name:'2× Chenko + 2× Amane (Lv5)',atk:50,let:50},
  {name:'4× Chenko (Lv5)',atk:0,let:100},
  {name:'Chenko + Yeonwoo + Amane + Margot (Lv5)',atk:50,let:50}
 ];
 const lines=el('div','bear-name-score-list');
 for(const sc of scenarios){
  const vals={...cloned.values};
  for(const k of ['i','c','a']){vals[k+'Atk']=Number(baselineStats[k+'Atk'])+sc.atk;
   vals[k+'Let']=Number(baselineStats[k+'Let'])+sc.let;}
  const scenario={...cloned,values:vals,v2:{...cloned.v2,combatStatOrigin:'combined-report'}};
  const answer=scores.personalDamage(scenario,counts,combat,ref,C,proc);
  const line=el('div','bear-name-score');line.append(el('strong','',sc.name),
   el('span','',answer.ready?num(answer.expectedScore)+' Modellindex':'Berechnung nicht verfügbar'));
  lines.append(line);
 }
 out.append(el('p','bear-name-result',
  'Starter '+best.ratio.join(' / ')+' · '+counts.map(num).join(' / ')+' Truppen'),
  el('p','bear-name-muted','Joiner bleiben bei 10/10/80 soweit der Bestand reicht; gemeinsame Bestände werden nicht mehrfach vergeben.'),
  lines,el('p','bear-name-warning','⚠ Diese Werte sind relative Schadensmodell-Indizes, keine verifizierten Kingshot-Schadenspunkte. Skill-Proc-Frequenz, Dauer und Stacking sind nur teilweise belegt. Join-Effekte als +25 Prozentpunkte ATK/LET pro Lv5-Held modelliert; keine unbekannten fremden Rallyleader-Werte.'));
 lastResult=best;return out;
}
function landing(){
 const head=el('div','bear-name-landing');head.append(el('p','bear-name-eyebrow','🐻 NRW · BÄREN-OPTIMIERER'),
  title('Deine Bear-Formation. Ohne Screenshot-Marathon.','h1'),
  el('p','bear-name-muted','Nur deinen Spielernamen eingeben. Danach wählst du zwischen Heldenempfehlung und erweiterter Schadensoptimierung.'));
 const inp=el('input','bear-name-input');inp.placeholder='Dein Kingshot-Name';inp.maxLength=50;inp.autocomplete='off';
 inp.value=name;inp.onkeydown=e=>{if(e.key==='Enter'&&valid(inp.value))openProfile(inp.value);};
 head.append(inp,button('Profil öffnen / neu anlegen →',()=>{if(valid(inp.value))openProfile(inp.value);else showStatus('Bitte einen Namen mit mindestens zwei Zeichen eingeben.',true);},'bear-name-btn primary'));head.append(el('p','bear-name-muted','Hinweis: Wenn GitHub-Speicherung aktiviert ist, kann jeder, der diesen Namen kennt, die hinterlegten Spielwerte lesen. Es werden keine Screenshots oder Kingshot-IDs gespeichert.'));
 box.append(head);
 const saved=JSON.parse(localStorage.getItem('nrw_bear_name_list_v1')||'[]');
 if(saved.length){const row=el('div','bear-name-saved');row.append(title('Bereits auf diesem Gerät geöffnet','h3'));
  for(const n of saved.slice(0,12))row.append(button(n,()=>openProfile(n)));box.append(row);}
}
function render(){
 box.replaceChildren();
 if(!name){landing();return;}
 const bar=el('header','bear-name-top');
 bar.append(button('← Namen wechseln',()=>{clearTimeout(syncTimer);name='';mode='';render();}),
  title('🐻 '+name,'h2'),button('Jetzt speichern',push));
 box.append(bar);
 if(!mode){
  const options=el('section','bear-name-choice');
  options.append(title('Was möchtest du optimieren?'),
   button('⚔️ Nur Starter-/Joiner-Helden',()=>{mode='quick';render();},'bear-name-btn primary'),
   button('📈 Erweiterte Schadensoptimierung',()=>{mode='advanced';render();},'bear-name-btn'),
   el('p','bear-name-muted','Alle Eingaben werden unter diesem Namen gespeichert. OCR bleibt ausgeschaltet. Auf anderen Geräten ist derselbe Name abrufbar, sobald die GitHub-Synchronisierung eingerichtet ist.'));
  box.append(options);return;
 }
 box.append(button('← Modus wählen',()=>{mode='';render();}));
 if(mode==='quick'){
  const main=el('div','bear-name-two-columns'),left=el('div'),right=el('div');
  const v=state().v2;
  left.append(choose('Märsche insgesamt',Array.from({length:7},(_,i)=>[i+1,String(i+1)]),
   Number(v.joinCount||0)+1,x=>{v.joinCount=Number(x)-1;saveLocal();render();}),rosterSection());
  const t=el('details','bear-name-optional');t.append(el('summary','','Truppen ergänzen (optional)'),troopsSection(false));left.append(t);
  right.append(summaryHeroes().section);main.append(left,right);box.append(main);
 }else{
  const main=el('div','bear-name-two-columns'),left=el('div'),right=el('div');
  left.append(rosterSection(),troopsSection(true),scalarSection());
  const r=summaryHeroes();right.append(r.section,starterGearSection(r.picked),
   button('🔎 Formationen & Szenarien berechnen',async()=>{
    const old=document.getElementById('bearAdvancedResult');if(old)old.remove();
    const loading=el('div','bear-name-loading');loading.id='bearNameLoading';
    const video=el('video');video.src='./assets/kingshot_formations_loading.webm';video.autoplay=true;
    video.muted=true;video.playsInline=true;video.controls=false;
    loading.append(video,el('p','','Deine Formationen werden berechnet …'));
    box.append(loading);loading.scrollIntoView({behavior:'smooth'});
    // Play the complete existing animation; a failed/unplayable video must
    // not trap the user on a permanent spinner.
    await new Promise(done=>{
     let finished=false;const finish=()=>{if(!finished){finished=true;clearTimeout(timer);done();}};
     const timer=setTimeout(finish,30000);
     video.addEventListener('ended',finish,{once:true});
     video.addEventListener('error',finish,{once:true});
     video.play().catch(finish);
    });
    loading.remove();
    const result=predicted();result.id='bearAdvancedResult';
    box.append(result);result.scrollIntoView({behavior:'smooth'});
   },'bear-name-btn primary'));
  main.append(left,right);box.append(main);
 }
 if(!localStorage.getItem('nrw_bear_name_list_v1'))localStorage.setItem('nrw_bear_name_list_v1','[]');
 const arr=JSON.parse(localStorage.getItem('nrw_bear_name_list_v1')||'[]');
 if(!arr.includes(name))localStorage.setItem('nrw_bear_name_list_v1',JSON.stringify([name,...arr].slice(0,30)));
}
render();
window.NRW_BEAR_NAME_FLOW={openProfile,render,pack,unpack};
})();
