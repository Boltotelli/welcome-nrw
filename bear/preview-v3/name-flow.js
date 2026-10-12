/* NRW Bear V3 — name-first, OCR-free workflow. Test branch.
 * The old wizard is left untouched for reversible migration.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE,C=window.NRW_BEAR_CATALOG;
const I18N=window.NRW_BEAR_I18N;
const T=text=>I18N?.tr?.(text)??text;
if(!B||!C)return;
const CL=['infantry','cavalry','archer'],LABEL=['Infanterie','Kavallerie','Bogenschützen'];
const heroList=C.heroes||[],heroNames=new Set(heroList.map(h=>h.name));
const el=(tag,cls='',txt)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=T(txt);return node;};
const num=x=>Number(x||0).toLocaleString(document.documentElement.lang==='de'?'de-DE':document.documentElement.lang==='fr'?'fr-FR':document.documentElement.lang==='es'?'es-ES':'en-GB',{maximumFractionDigits:1});
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
let cachedFormationPlan=null;
function currentFormationPlan(){
 // Both buttons must consume one immutable calculation between changes.
 if(!cachedFormationPlan)cachedFormationPlan=window.NRW_BEAR_FORMATION?.plan?.(
  state(),C,window.NRW_BEAR_COMBAT,window.NRW_BEAR_CAPACITY);
 return cachedFormationPlan;
}
function saveLocal(){
 B.save();dirty=true;
 cachedFormationPlan=null;
 // Never keep already calculated formations or damage after inputs change.
 document.getElementById('bearFormationResult')?.remove();
 document.getElementById('bearAdvancedResult')?.remove();
 lastResult=null;
 clearTimeout(syncTimer);syncTimer=setTimeout(push,1400);
}
function showStatus(s,error=false){status.textContent=T(s);status.classList.toggle('error',error);}
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
// Kingshot uses five flowers with SIX progress petals each (0..30).
// Touch a flower to set complete stars, use +/- for one petal / T step.
let bearFlowerSequence=0;
function starProgressField(heroName){
 const ns='http://www.w3.org/2000/svg',wrap=el('div','bear-name-star-field');
 const row=el('div','bear-name-star-controls');
 const minus=button('−',()=>changeStep(currentStep-1),'bear-name-star-step');
 const plus=button('+',()=>changeStep(currentStep+1),'bear-name-star-step');
 const flowers=el('div','bear-name-star-flowers');
 flowers.setAttribute('role','group');
 flowers.setAttribute('aria-label','Sternstufe von '+heroName);
 const live=el('span','bear-name-sr-only');live.setAttribute('aria-live','polite');
 const nodes=[];
 const svgNode=(tag,attrs)=>{
  const node=document.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attrs||{}))node.setAttribute(key,String(value));
  return node;
 };
 const point=(radius,deg)=>{
  const rad=deg*Math.PI/180;
  return [(12+Math.cos(rad)*radius).toFixed(2),(12+Math.sin(rad)*radius).toFixed(2)].join(',');
 };
 const initial=state().v2.manualHeroes[heroName]||{};
 let currentStep=Math.max(0,Math.min(30,Math.floor(Number(initial.stars||0))*6+Math.floor(Number(initial.tier||0))));
 for(let i=0;i<5;i++){
  const flower=button('',()=>changeStep((i+1)*6),'bear-name-flower');
  flower.setAttribute('aria-label',(i+1)+' Sterne einstellen');
  const svg=svgNode('svg',{viewBox:'0 0 24 24','aria-hidden':'true',focusable:'false'});
  const id='nrw-bear-flower-'+(++bearFlowerSequence),defs=svgNode('defs');
  const gradient=svgNode('linearGradient',{id,x1:'0%',y1:'0%',x2:'80%',y2:'100%'});
  for(const [offset,color] of [['0%','#fff9d8'],['32%','#ffeaa0'],['70%','#f6c466'],['100%','#ba7c29']]){
   const stop=svgNode('stop',{offset,'stop-color':color});gradient.append(stop);
  }
  defs.append(gradient);svg.append(defs);
  const petals=[];
  for(let petal=0;petal<6;petal++){
   const angle=-90-petal*60; // Fill partial T-segments counterclockwise from top.
   const coords=[point(2.4,angle),point(7.0,angle-17),point(11.2,angle),point(7.0,angle+17)].join(' ');
   const polygon=svgNode('polygon',{points:coords,'stroke-width':'.45','stroke-linejoin':'round'});
   svg.append(polygon);petals.push(polygon);
  }
  const center=svgNode('circle',{cx:12,cy:12,r:2.5,'stroke-width':'.3'});
  svg.append(center);flower.append(svg);flowers.append(flower);
  nodes.push({flower,petals,center,gold:'url(#'+id+')'});
 }
 function repaint(){
  minus.disabled=currentStep<=0;plus.disabled=currentStep>=30;
  const stars=Math.floor(currentStep/6),tier=currentStep%6;
  const description=stars+' Sterne'+(tier?' · T'+tier:'')+' von 5';
  wrap.title=description;live.textContent=description;
  for(let i=0;i<nodes.length;i++){
   const item=nodes[i],lit=Math.max(0,Math.min(6,currentStep-i*6));
   for(let p=0;p<6;p++){
    const active=p<lit,shape=item.petals[p];
    shape.setAttribute('fill',active?item.gold:'#2e394c');
    shape.setAttribute('stroke',active?'#a97230':'#202a3b');
   }
   item.center.setAttribute('fill',lit? '#ffdf92':'#263245');
   item.center.setAttribute('stroke',lit? '#a97230':'#202a3b');
   item.flower.classList.toggle('is-lit',lit>0);
   item.flower.setAttribute('aria-pressed',lit===6?'true':'false');
   item.flower.title=(i+1)+' Sterne wählen';
  }
 }
 function changeStep(next){
  const step=Math.max(0,Math.min(30,Math.trunc(Number(next))));
  if(!Number.isFinite(step)||step===currentStep)return;
  currentStep=step;
  const hero=state().v2.manualHeroes[heroName];
  if(!hero)return;
  hero.stars=Math.floor(step/6);hero.tier=step%6;
  hero.skills=Array(3).fill(Math.min(5,hero.stars+1));
  hero.skillsAssumedMax=true;hero.starPendingReview=false;
  repaint();saveLocal();refreshHeroRecommendations();
 }
 row.append(minus,flowers,plus);wrap.append(row,live);
 repaint();return wrap;
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
  joinLeaderComparison:v.joinLeaderComparison||'similar',
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
 v.joinLeaderComparison=['weaker','similar','stronger'].includes(d.joinLeaderComparison)?
  d.joinLeaderComparison:'similar';
 v.troopGroups=d.troopGroups||[];v.troopTiers=[{tier:10,tg:0},{tier:10,tg:0},{tier:10,tg:0}];
 v.valora=[0,0,0,Number(d.savageAdvantage)||0];v.valoraTalent=Number(d.valoraTalent)||0;
 v.petActive=d.petActive||{};v.petSkillRanks=d.petSkillRanks||{};v.petBuffCapturedInStats=!!d.petBuffCapturedInStats;
 v.combatStatOrigin=d.combatStatOrigin||'combined-report';
 Object.assign(m.values,d.values||{});
 for(const [i,type] of CL.entries())m.values[['troopsI','troopsC','troopsA'][i]]=v.troopGroups.filter(g=>g.type===type).reduce((n,g)=>n+Number(g.count),0);
 B.save();
}
async function openProfile(value){
 cachedFormationPlan=null;
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
    meta.append(starProgressField(n));
    const notGold=new Set(['Olive','Edwin','Forrest','Seth','Quinn','Diana','Amane','Yeonwoo','Gordon','Chenko','Fahd','Howard']);
    if(!notGold.has(n)){
     meta.append(choose('Widget',Array.from({length:11},(_,i)=>[i,'+'+i]),h.widget??0,x=>{
      state().v2.manualHeroes[n].widget=Number(x);saveLocal();refreshHeroRecommendations();
     }));
    }
    // Hero skills and widgets are resolved by the calculator's reference
    // data internally. Never expose provider-specific controls in the deck.
    card.append(meta);
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
 redraw();
 if(!required)section.append(
  numberField('Marschkapazität ohne Helden (optional)',m.values.cap,x=>{
   if(x===null)delete m.values.cap;else m.values.cap=x;saveLocal();
  },{min:1,max:1000000}),
  el('p','bear-name-muted','Mit Marschkapazität und Truppenbestand werden genaue Stückzahlen pro Marsch berechnet.')
 );
 return section;
}
function rallyStrengthField(){
 const v=state().v2;
 return choose('Rallyleader, denen du beitrittst',
  [['weaker','Meist schwächer als ich'],
   ['similar','Ungefähr gleich stark'],
   ['stronger','Meist stärker als ich']],
  v.joinLeaderComparison||'similar',value=>{
   v.joinLeaderComparison=value;
   saveLocal();
  });
}
function scalarSection(){
 const m=state(),v=m.v2,section=el('section','bear-name-panel');
 section.append(title('Basiswerte & aktive Buffs'),el('p','bear-name-muted','Angriff und Tödlichkeit aller Truppentypen aus der Bonusübersicht. Fehlende Werte bleiben offen – keine stillen Schätzungen.'));
 section.append(choose('Anzahl aller Märsche (inkl. eigener Rally)',Array.from({length:7},(_,i)=>[i+1,String(i+1)]),
  Number(v.joinCount||0)+1,x=>{v.joinCount=Number(x)-1;saveLocal();}));
 section.append(rallyStrengthField());
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
 const petGrid=el('div','bear-name-pet-grid');
 v.petActive=v.petActive||{};v.petSkillRanks=v.petSkillRanks||{};
 const assetImg=(url,label)=>{
  const img=el('img','bear-name-buff-icon');
  img.src=url||'';img.alt=label;img.loading='lazy';
  img.onerror=()=>{img.onerror=null;img.style.visibility='hidden';};
  return img;
 };
 // These six images are genuine in-game art cropped from the supplied
 // screenshots: Rhino, Panther, Bear, Moose, Bison, Valora.
 const gameIcon=(n)=>{
  // Game icons audited by pet identity + active skill, NOT sprite position.
  // Mighty Bison (Fearless Roar) is distinct from early Bison;
  // Ironclad War Bear (Ursa's Rage) is distinct from Grizzly Bear.
  if(n==='Valora'){
   const span=el('span','bear-name-buff-icon bear-name-game-icon');
   span.setAttribute('role','img');span.setAttribute('aria-label',n);
   span.style.backgroundImage="url('./assets/pet-valora-sprite.webp')";
   span.style.backgroundPosition='100% center';
   return span;
  }
  const pet=(C.pets||[]).find(p=>p.name===n||
   (n==='Moose'&&p.name==='Moose'));
  const imageBySkill={
   'Giant Rhino':'https://kingshotdata.com/uploads/2025/09/giant-rhino-avatar.webp',
   'Mighty Bison':'https://kingshotdata.com/uploads/2025/09/fearless-roar.webp',
   'War Bear':'https://kingshotdata.com/uploads/2026/05/ursas-rage.webp'
  };
  const src=imageBySkill[n]||pet?.img||'';
  const img=el('img','bear-name-buff-icon bear-name-pet-portrait');
  img.src=src;img.alt=n;img.loading='lazy';img.referrerPolicy='no-referrer';
  img.onerror=()=>{
   img.onerror=null;
   if(pet?.img&&img.src!==pet.img)img.src=pet.img;
   else img.style.visibility='hidden';
  };
  return img;
 };
 const petNames={'Giant Rhino':'Riesennashorn','Black Panther':'Schwarzer Panther',
  'War Bear':'Eisenpanzer-Kriegsbär','Moose':'Elch','Mighty Bison':'Mächtiger Bison'};
 for(const n of ['Giant Rhino','Black Panther','War Bear','Moose','Mighty Bison']){
  const pet=(C.pets||[]).find(p=>p.name===n||(n==='Moose'&&p.name==='Great Moose'));
  const line=el('div','bear-name-buff-card'),lab=el('label','bear-name-buff-title'),check=el('input');
  check.type='checkbox';check.checked=!!v.petActive[n];
  check.onchange=()=>{v.petActive[n]=check.checked;saveLocal();};
  lab.append(check,gameIcon(n),el('span','',petNames[n]));
  line.append(lab,numberField('Fähigkeitslevel',v.petSkillRanks[n],x=>{
   if(x===null)delete v.petSkillRanks[n];else v.petSkillRanks[n]=x;saveLocal();
  },{min:1,max:10}));
  petGrid.append(line);
 }
 const skills=el('div','bear-name-buff-card bear-name-valora'),valoraSkill=(C.valora||[]).find(x=>x.name==='Savage Advantage');
 const valoraPicture=gameIcon('Valora');
 const valoraTitle=el('div','bear-name-buff-title');valoraTitle.append(valoraPicture,el('strong','','Valora'));
 skills.append(valoraTitle);
 const skillRows=el('div','bear-name-valora-skills');
 const savage=el('div','bear-name-buff-skill');
 savage.append(assetImg(valoraSkill?.img||'','Savage Advantage'),
  numberField('Savage Advantage',v.valora?.[3],x=>{
   v.valora=v.valora||[0,0,0,0];v.valora[3]=x||0;saveLocal();
  },{min:0,max:10}));
 const hunter=el('div','bear-name-buff-skill');
 const hunterImg=assetImg('https://kingshotdata.com/icons/master-valora-talent.png','Hunter Instinct');
 hunterImg.onerror=()=>{hunterImg.onerror=null;hunterImg.src=valoraSkill?.img||'';};
 hunter.append(hunterImg,numberField('Hunter Instinct',v.valoraTalent,x=>{
  v.valoraTalent=x||0;saveLocal();
 },{min:0,max:11}));
 skillRows.append(savage,hunter);skills.append(skillRows);petGrid.append(skills);
 section.append(petGrid);
 section.append(el('p','bear-name-muted','Aktive Buffs markieren. Die bereits eingetragenen Kampfwerte nicht doppelt erhöhen.'));

 const present=el('label','bear-name-pet-line'),ch=el('input');ch.type='checkbox';ch.checked=!!v.petBuffCapturedInStats;ch.onchange=()=>{v.petBuffCapturedInStats=ch.checked;saveLocal();};
 present.append(ch,document.createTextNode(' '+T('Aktive Pet-ATK/LET-Buffs sind bereits in diesen Werten enthalten')));section.append(present);
 return section;
}
function starterGearSection(picked){
 const v=state().v2,section=el('section','bear-name-panel');
 section.id='bearStarterGear';
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
// Show complete owned hero portraits and physically feasible troop mixes.
// The beginner mode can suggest safe ratios without asking for combat stats.
function formationCards(){
 const section=el('section','bear-name-panel bear-name-formation-result');
 section.id='bearFormationResult';
 section.append(title('Deine Starter- & Joiner-Formationen'));
 const model=state(),v=model.v2,formationCore=window.NRW_BEAR_FORMATION,
  chosen=formationCore?.chooseHeroes?.(model,C);
 if(!chosen){section.append(el('p','bear-name-muted','Bitte zuerst deine Helden auswählen.'));return section;}
 const plan=currentFormationPlan();
 const groups=[{kind:'starter',heroes:chosen.starter},
  ...chosen.joins.map(join=>({kind:'join',heroes:join.heroes}))];
 const validCap=plan?.ready===true,hasStock=['troopsI','troopsC','troopsA']
  .some(k=>Number(model.values[k])>0);
 const capMissing=!validCap&&!window.NRW_BEAR_CAPACITY?.breakdown?.(model,C)?.complete;
 const cards=el('div','bear-name-formations-grid');
 const label=(item,i)=>item.kind==='starter'?T('Eigene Starter-Rally'):T('Joiner')+' '+i;
 const numberRow=(ratio,counts,hasCounts)=>{
  const info=el('div','bear-name-mix-caption');
  for(let k=0;k<3;k++){
   const part=el('span','bear-name-mix-part');
   const pct=el('strong','',ratio[k]+' %');
   const txt=el('small','',T(['Inf','Kav','Bog'][k])+
    (hasCounts?' · '+num(counts[k]):''));
   part.append(pct,txt);info.append(part);
  }return info;
 };
 for(let index=0;index<groups.length;index++){
  const row=groups[index],detail=validCap?plan.marches[index]:null;
  const article=el('article','bear-name-formation-card');
  article.append(title(label(row,index),'h3'));
  const avatars=el('div','bear-name-formation-heroes');
  for(let i=0;i<3;i++){
   const h=row.heroes[i],hero=heroList.find(x=>x.name===h?.name);
   const div=el('div','bear-name-formation-hero'+(!h?' unavailable':''));
   if(hero){
    const img=el('img');img.src=hero.img;img.alt=hero.name;img.loading='lazy';
    div.append(img,el('span','',hero.name));
   }else div.append(el('div','bear-name-formation-empty','+'),el('span','','Nicht belegt'));
   avatars.append(div);
  }
  article.append(avatars);
  const troopRow=detail?.troops||null;
  const mix=el('div','bear-name-mix');
  if(detail?.filled&&row.heroes[0]){
   const ratio=detail.ratio;
   const bar=el('div','bear-name-mix-bar');
   for(let k=0;k<3;k++){
    const segment=el('div','bear-name-mix-segment bear-name-mix-'+k);
    segment.style.width=ratio[k]+'%';bar.append(segment);
   }
   mix.append(bar,numberRow(ratio,troopRow,true));
   mix.append(el('p','bear-name-form-count',num(detail.filled)+' '+T('Truppen')));
  }else{
   mix.append(el('p','bear-name-muted',!row.heroes[0]?
    'Bitte einen passenden Joiner-Helden ergänzen.':
    'Truppen und Marschkapazität eingeben, um diese Formation zu berechnen.'));
  }
  article.append(mix);cards.append(article);
 }
 section.append(cards);
 if(!validCap){
  section.append(el('p','bear-name-muted',
   capMissing?'Marschkapazität und Truppenbestand ergänzen, damit wir die Formation berechnen können.':
   hasStock?'Für genaue Truppenzahlen bitte die Bestände vervollständigen.':
   'Truppenbestand und Marschkapazität fehlen noch.'));
 }else{
  section.append(el('p','bear-name-muted',
   'Formationen nach erwartetem Zusatzschaden verteilt. Die Stärke fremder Rallyleader ist eine Schätzung.'));
  if(plan.infantryShortage)section.append(el('p','bear-name-warning',
   'Nicht genug Infanterie für den Mindestanteil aller Märsche. Es wurde nur der tatsächliche Bestand verteilt.'));
 }
 return section;
}
// One loading surface for each separate result. The formation video is the
// complete existing Kingshot hero-selection WebM; damage has a cloud-themed
// dedicated animation until an approved original cloud WebM is available.
async function loadingSequence(kind){
 const old=document.getElementById('bearNameLoading');old?.remove();
 const loading=el('div','bear-name-loading '+(kind==='formation'?'bear-name-loading-hero':'bear-name-loading-cloud'));
 loading.id='bearNameLoading';
 loading.setAttribute('role','status');
 const text=el('p','',kind==='formation'?'Helden und Truppen werden zusammengestellt …':'Schadenswerte werden berechnet …');
 if(kind==='formation'){
  const video=el('video');video.src='./assets/kingshot_formations_loading.webm';
  video.autoplay=true;video.muted=true;video.playsInline=true;video.preload='auto';
  loading.append(video);
  const sample=state().v2.scannedOwnedHeroes.slice(0,7);
  const strip=el('div','bear-name-loader-heroes');
  for(const n of sample){
   const item=heroList.find(h=>h.name===n);if(!item)continue;
   const img=el('img');img.src=item.img;img.alt=n;strip.append(img);
  }
  if(strip.children.length)loading.append(strip);
  loading.append(text);box.append(loading);loading.scrollIntoView({behavior:'smooth'});
  await new Promise(resolve=>{
   let finished=false;
   const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);resolve();};
   const timer=setTimeout(finish,30000);
   video.addEventListener('ended',finish,{once:true});
   video.addEventListener('error',finish,{once:true});
   video.play?.().catch(finish);
  });
 }else{
  // Real 5-second cloud WebM is generated from source by the GitHub Pages
  // build; CSS provides the fallback if a browser cannot play VP8 WebM.
  const video=el('video','bear-name-cloud-video');
  // Use the exact 512×512 source video when it is present on GitHub Pages.
  // The 160×160 preview remains a fallback, never passed off as original.
  video.src='./assets/kingshot_beartrap_v3_action_transparent.webm';
  video.autoplay=true;video.muted=true;video.playsInline=true;video.preload='auto';
  const clouds=el('div','bear-name-cloud-scene');
  for(let i=0;i<4;i++){const cloud=el('span','bear-name-cloud cloud-'+i,'☁');clouds.append(cloud);}
  clouds.append(el('span','bear-name-cloud-center','⚡'));
  clouds.hidden=true;
  loading.append(video,clouds,text);box.append(loading);loading.scrollIntoView({behavior:'smooth'});
  await new Promise(resolve=>{
   let finished=false;
   const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);resolve();};
   // Do not serve a pixelated downscaled copy of the provided animation.
   // If this browser cannot decode VP9, show the non-video CSS fallback.
   const fallback=()=>{video.hidden=true;clouds.hidden=false;setTimeout(finish,4200);};
   const timer=setTimeout(finish,15000);
   video.addEventListener('ended',finish,{once:true});
   video.addEventListener('error',fallback,{once:true});
   video.play?.().catch(fallback);
  });
 }
 loading.remove();
}
async function performCalculation(kind){
 const id=kind==='formation'?'bearFormationResult':'bearAdvancedResult';
 document.getElementById(id)?.remove();
 const controls=box.querySelectorAll('.bear-name-action-btn');
 controls.forEach(b=>b.disabled=true);
 try{
  await loadingSequence(kind);
  const result=kind==='formation'?formationCards():predicted();
  result.id=id;box.append(result);result.scrollIntoView({behavior:'smooth'});
 }finally{controls.forEach(b=>b.disabled=false);}
}
function actionButtons(advanced){
 const holder=el('div','bear-name-actions');
 holder.append(button('⚔️ Formationen berechnen',()=>performCalculation('formation'),
  'bear-name-btn primary bear-name-action-btn'));
 if(advanced)holder.append(button('☁️ Schadenswert berechnen',()=>performCalculation('damage'),
  'bear-name-btn bear-name-action-btn'));
 return holder;
}
function summaryHeroes(){
 const {picked,groups}=rankAndSelect(),v=state().v2,section=el('section','bear-name-panel');
 section.id='bearHeroRecommendation';
 section.append(title('Empfohlene Starter'),el('p','bear-name-muted',
  'Aus deinen ausgewählten Helden.'));
 const starter=el('div','bear-name-picks');
 picked.forEach((n,i)=>{const h=el('div','bear-name-pick'),hero=heroList.find(x=>x.name===n);
  if(hero){const img=el('img');img.src=heroInfoCache[n]?.imageUrl||hero.img;img.alt='';h.append(img);}
  h.append(el('strong','',LABEL[i]),el('span','',n||'Noch kein passender Held'));
  starter.append(h);
 });section.append(starter);

 return {section,picked};
}
function refreshHeroRecommendations(){
 if(!name||!mode)return;
 const current=document.getElementById('bearHeroRecommendation');
 if(!current)return;
 // Only the recommendation panel is rebuilt. Keep the clicked star/widget
 // selector, all expanded seasons, and the scroll position untouched.
 const previous=Array.isArray(state().v2.ownHeroes)?state().v2.ownHeroes.slice():[];
 const result=summaryHeroes();
 if(previous.join('\u0000')!==result.picked.join('\u0000')){
  cachedFormationPlan=null;
  document.getElementById('bearFormationResult')?.remove();
  document.getElementById('bearAdvancedResult')?.remove();
 }
 current.replaceWith(result.section);
 if(mode==='advanced'){
  const gear=document.getElementById('bearStarterGear');
  // Rebuild the equipment inputs ONLY when actual recommended starter
  // identities change. Other input values/focus remain undisturbed.
  if(gear&&previous.join('\u0000')!==result.picked.join('\u0000')){
   gear.replaceWith(starterGearSection(result.picked));
  }
  // Any previously calculated damage result no longer reflects the edited hero.
  document.getElementById('bearAdvancedResult')?.remove();
 }
}
function predicted(){
 const out=el('section','bear-name-panel');out.append(title('Erweiterte Schadensoptimierung'));
 const model=state(),v=model.v2,
  combat=window.NRW_BEAR_COMBAT,alloc=window.NRW_BEAR_FORMATION,
  scores=window.NRW_BEAR_SCORE_BONUSES,
  ref=window.NRW_BEAR_HERO_REFERENCE,
  skillDamage=window.NRW_BEAR_SKILL_DAMAGE;
 if(!combat||!alloc||!scores||!skillDamage||!window.NRW_BEAR_JOINER_SKILLS||!ref||ref.status?.()!=='ready'){
  out.append(el('p','bear-name-muted','Helden-Referenzdaten werden noch geladen. Bitte danach erneut berechnen.'));
  return out;
 }
 const stock=CL.map((_,i)=>Number(model.values[['troopsI','troopsC','troopsA'][i]])||0);
 const tiers=combat.configure(v),current=window.NRW_BEAR_OWN_BASELINE?.currentStats?.(model);
 const cap=window.NRW_BEAR_CAPACITY?.breakdown(model,C);
 if(!combat.ready(current,tiers)||stock.some(x=>!x)||!cap?.complete){
  out.append(el('p','bear-name-muted','Für die Berechnung fehlen Truppen, Basiswerte oder die Marschkapazität.'));
  return out;
 }
 // All three owned starters, their Expedition skills AND applicable Widget
 // rally abilities enter the same calculation. No Zoe/Yang/Petra-only code.
 const prepared=skillDamage.prepare(model,ref,C,scores,window.NRW_BEAR_OWN_BASELINE);
 if(!prepared.ready){
  out.append(el('p','bear-name-muted','Noch fehlende Helden-/Pet-Angaben: '+prepared.reason));
  return out;
 }
 // Both result buttons MUST use the exact same simultaneous formation.
 const plan=currentFormationPlan();
 if(!plan.ready||!plan.marches?.[0]?.filled){
  out.append(el('p','bear-name-muted','Truppen und Marschkapazität eingeben, um diese Formation zu berechnen.'));
  return out;
 }
 const rows=plan.marches.map(m=>m.troops);
 const equipped=combat.allocateLevels?.(rows,tiers,plan.tierPriority);
 const ownLevels=equipped?.[0]||tiers;
 const best={rows,leader:ownLevels,ratio:plan.marches[0].ratio,
  score:plan.starterScore,method:plan.ratioMethod};
 const counts=best.rows[0],lines=el('div','bear-name-score-list');
 const stack=window.NRW_BEAR_JOINER_SKILLS;
 const referenceMap=Object.fromEntries((C.heroes||[]).map(x=>[x.name,x]));
 const refSkill=name=>{
  // Skills and Lv5 values come from the same complete 37-hero reference
  // used for starter ranking, never from our simplified scenario labels.
  const skill=ref.get?.(name,5,0);
  return skill?{skills:skill.skills}:null;
 };
 for(const sc of stack?.SCENARIOS||[]){
  const combo=stack.process(sc.heroes,refSkill);
  const answer=combo.ready?
    skillDamage.evaluate(prepared,counts,best.leader,current,combat,combo.multiplier):
    {ready:false};
  const line=el('div','bear-name-score');
  const label=sc.label.replace('(Lv5)',T('(Lv5)'));
  line.append(el('strong','',label),
   el('span','',answer.ready?num(answer.estimatedIndex)+
    (answer.isUpperConditional?' – '+num(answer.upper):'')+' '+T('Modellindex')+
    ' · ×'+combo.multiplier.toFixed(2):
    T('Berechnung nicht verfügbar')));
  lines.append(line);
 }
 out.append(el('p','bear-name-muted',
  'Die Starter-Truppenzahlen stehen ausschließlich in der Formationskarte. Beide Berechnungen verwenden dieselbe Aufstellung.'),
  lines,el('p','bear-name-warning',
   '⚠ Geschätzter Modellwert – kein bestätigter Kingshot-Schadenswert.'));
 lastResult=best;return out;
}
function languageSwitcher(){
 const div=el('nav','bear-name-languages');
 div.setAttribute('aria-label','Language / Sprache');
 for(const lang of ['de','en','fr','es']){
  const b=button(lang.toUpperCase(),()=>{
   I18N?.setLanguage?.(lang);
   render();
  },'bear-name-lang-button');
  b.setAttribute('lang',lang);
  if((I18N?.language?.()||document.documentElement.lang)===lang)b.classList.add('active');
  div.append(b);
 }
 return div;
}
function landing(){
 const head=el('div','bear-name-landing');head.append(el('p','bear-name-eyebrow','🐻 NRW · BÄREN-OPTIMIERER'),
  title('Deine Bear-Formation. Ohne Screenshot-Marathon.','h1'),
  el('p','bear-name-muted','Nur deinen Spielernamen eingeben. Danach wählst du zwischen Heldenempfehlung und erweiterter Schadensoptimierung.'));
 const inp=el('input','bear-name-input');inp.placeholder=T('Dein Kingshot-Name');inp.maxLength=50;inp.autocomplete='off';
 inp.value=name;inp.onkeydown=e=>{if(e.key==='Enter'&&valid(inp.value))openProfile(inp.value);};
 head.append(inp,button('Profil öffnen / neu anlegen →',()=>{if(valid(inp.value))openProfile(inp.value);else showStatus('Bitte einen Namen mit mindestens zwei Zeichen eingeben.',true);},'bear-name-btn primary'));head.append(el('p','bear-name-muted','Hinweis: Wenn GitHub-Speicherung aktiviert ist, kann jeder, der diesen Namen kennt, die hinterlegten Spielwerte lesen. Es werden keine Screenshots oder Kingshot-IDs gespeichert.'));
 head.prepend(languageSwitcher());
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
  title('🐻 '+name,'h2'),languageSwitcher(),button('Jetzt speichern',push));
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
   Number(v.joinCount||0)+1,x=>{v.joinCount=Number(x)-1;saveLocal();render();}),rallyStrengthField(),rosterSection());
  const t=el('details','bear-name-optional');t.append(el('summary','','Truppen ergänzen (optional)'),troopsSection(false));left.append(t);
  right.append(summaryHeroes().section,actionButtons(false));main.append(left,right);box.append(main);
 }else{
  const main=el('div','bear-name-two-columns'),left=el('div'),right=el('div');
  left.append(rosterSection(),troopsSection(true),scalarSection());
  const r=summaryHeroes();right.append(r.section,starterGearSection(r.picked),actionButtons(true));
  main.append(left,right);box.append(main);
 }
 if(!localStorage.getItem('nrw_bear_name_list_v1'))localStorage.setItem('nrw_bear_name_list_v1','[]');
 const arr=JSON.parse(localStorage.getItem('nrw_bear_name_list_v1')||'[]');
 if(!arr.includes(name))localStorage.setItem('nrw_bear_name_list_v1',JSON.stringify([name,...arr].slice(0,30)));
}
render();
// The public reference loads asynchronously. Update a visible recommendation
// as soon as its complete hero data is available (without a further click).
window.NRW_BEAR_HERO_REFERENCE?.load?.().then(()=>refreshHeroRecommendations());
window.NRW_BEAR_NAME_FLOW={openProfile,render,pack,unpack,refreshHeroRecommendations};
})();
