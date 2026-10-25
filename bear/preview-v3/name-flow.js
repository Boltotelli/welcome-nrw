/* NRW Bear V3 — name-first, OCR-free workflow. Test branch.
 * The old wizard is left untouched for reversible migration.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE,C=window.NRW_BEAR_CATALOG;
const I18N=window.NRW_BEAR_I18N;
const PROFILES=window.NRW_BEAR_PROFILES,HELP=window.NRW_BEAR_HELP;
const T=text=>I18N?.tr?.(text)??text;
const copy=(de,en,fr,es)=>({de,en,fr,es}[I18N?.language?.()||'en']||en);
if(!B||!C)return;
const CL=['infantry','cavalry','archer'],LABEL=['Infanterie','Kavallerie','Bogenschützen'];
const heroList=C.heroes||[],heroNames=new Set(heroList.map(h=>h.name));
const el=(tag,cls='',txt)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=T(txt);return node;};
const num=x=>Number(x||0).toLocaleString(document.documentElement.lang==='de'?'de-DE':document.documentElement.lang==='fr'?'fr-FR':document.documentElement.lang==='es'?'es-ES':'en-GB',{maximumFractionDigits:1});
const valid=x=>typeof x==='string'&&x.trim().length>=2&&x.trim().length<=50;
let name='',mode='',version=null,editKey=null,syncTimer=null,syncInFlight=false,dirty=false,heroInfoCache={},lastResult=null;
let activePlayer=null,canEdit=false,localOnly=false,editCount=0,opening=0,needsPinMigration=false,legacyCombinedStats=false,pinPending=false;
let lastStatusMessage=null;
// Preserve expanded generations when hero tiles refresh.
const expandedSeasons=new Set();
const app=el('main','bear-name-app');app.id='bearNewApp';document.body.prepend(app);document.body.classList.add('bear-name-mode');
const box=el('div','bear-name-container'),status=el('p','bear-name-status');
app.append(box,status);
const title=(txt,tag='h2')=>el(tag,'',txt);
const button=(txt,fn,cls='bear-name-btn')=>{const b=el('button',cls,txt);b.type='button';b.addEventListener('click',fn);return b;};
function state(){
 const m=B.model();m.v2=m.v2||{};m.values=m.values||{};
 m.v2.manualHeroes=m.v2.manualHeroes||{};
 m.v2.scannedOwnedHeroes=m.v2.scannedOwnedHeroes||[];
 // Migrate old two-court settings once. Read-only stats are always unbuffed;
 // no separate "captured already" toggles can survive migration.
 m.v2.ministers=window.NRW_BEAR_MINISTERS?.normalized?.(m.v2.ministers)||{court:'king',fc:false,m:false};
 delete m.v2.ministerBuffCapturedInStats;
 delete m.v2.ministerCapacityInBase;
 m.v2.petBuffCapturedInStats=false;
 // NRW V3 always accepts independent Bonus Overview class, squad and hero
 // values. No user-facing combined/separate toggle: it was too easy to
 // apply additional skills to already aggregated values.
 m.v2.combatStatOrigin='separate-overview';
 return m;
}
function keyForName(value){return 'nrw_bear_name_edit_v1:'+value.normalize('NFKC').toLowerCase().trim();}
let cachedFormationPlan=null;
function currentFormationPlan(){
 // Both buttons must consume one immutable calculation between changes.
 if(!cachedFormationPlan)cachedFormationPlan=window.NRW_BEAR_FORMATION?.plan?.(
  state(),C,window.NRW_BEAR_COMBAT,window.NRW_BEAR_CAPACITY);
 return cachedFormationPlan;
}
function saveLocal(){
 B.save();dirty=true;editCount++;
 cachedFormationPlan=null;
 // Never keep already calculated formations or damage after inputs change.
 document.getElementById('bearFormationResult')?.remove();
 document.getElementById('bearAdvancedResult')?.remove();
 lastResult=null;
 clearTimeout(syncTimer);if(canEdit&&!localOnly)syncTimer=setTimeout(push,1600);
 else if(activePlayer)showStatus('Lokale Änderung – für gemeinsames Speichern wird deine PIN benötigt.');
}
function showStatus(s,error=false){
 lastStatusMessage=s;
 status.textContent=T(s);status.classList.toggle('error',error);refreshSecurityStatus();
}
function securityState(){
 if(!activePlayer?.id||localOnly)return {kind:'local',text:'⚪ Nur lokal gespeichert'};
 if(version===null)return {kind:'missing',text:pinPending?'🟡 PIN wird eingerichtet …':'🔴 PIN fehlt – Profil noch nicht gesichert'};
 if(needsPinMigration)return {kind:'missing',text:'🔴 Noch keine persönliche Zahlen-PIN'};
 if(!canEdit)return {kind:'locked',text:'🔒 Profil gesichert · nur ansehen'};
 if(dirty||syncInFlight)return {kind:'pending',text:'🟡 Änderungen noch nicht gespeichert'};
 return {kind:'saved',text:'🟢 Profil gesichert · alle Änderungen gespeichert'};
}
function refreshSecurityStatus(){
 const x=box.querySelector('[data-bear-security]');
 if(!x)return;const v=securityState();
 x.className='bear-name-security bear-name-security-'+v.kind;x.textContent=T(v.text);
}
function markReadOnly(root){
 if(canEdit||localOnly)return;
 root.querySelectorAll('input,select,textarea').forEach(el=>{
  // Comparison is read-only evidence, not a profile edit.
  if(!el.matches('.bear-advice-select'))el.disabled=true;
 });
 root.querySelectorAll('button:not(.bear-name-help-trigger):not(.bear-name-action-btn)').forEach(el=>el.disabled=true);
}
function numberField(label,value,onChange,options={}){
 const wrap=el('label','bear-name-field'),span=el('span','',label),input=el('input');
 input.type='number';input.min=options.min??0;input.max=options.max??100000000;input.step=options.step??1;
 input.value=value===undefined||value===null?'':value;input.placeholder=options.placeholder||'';
 input.addEventListener('change',()=>{const n=input.value===''?null:Number(input.value);
  if(n!==null&&(!Number.isFinite(n)||n<Number(input.min)||n>Number(input.max)))return input.setCustomValidity(T('Ungültiger Wert'));
  input.setCustomValidity('');onChange(n);});
 wrap.append(span,input);return options.helpKey?HELP?.decorateField?.(wrap,label,options.helpKey)||wrap:wrap;
}
function choose(label,values,value,onChange,helpKey=null){
 const w=el('label','bear-name-field'),caption=el('span','',label),s=el('select');
 for(const [id,title] of values){const o=el('option','',title);o.value=String(id);s.append(o)}s.value=String(value??'');
 s.addEventListener('change',()=>onChange(s.value));w.append(caption,s);
 return helpKey?HELP?.decorateField?.(w,label,helpKey)||w:w;
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
  flower.setAttribute('aria-label',(i+1)+T(' Sterne einstellen'));
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
  const description=stars+T(' Sterne')+(tier?' · T'+tier:'')+T(' von 5');
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
   item.flower.title=(i+1)+T(' Sterne wählen');
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
 const advisor=window.NRW_BEAR_HERO_ADVISOR,ref=window.NRW_BEAR_HERO_REFERENCE,
  combat=window.NRW_BEAR_COMBAT,formation=window.NRW_BEAR_FORMATION;
 const chooseAt=ratio=>{
  const groups=advisor?.recommend(owned,C.heroTypes,window.NRW_BEAR_INTAKE_CORE?.rankByType,
   (n,stars,tier)=>ref?.get?.(n,stars,tier),
   (n,widget)=>window.NRW_BEAR_OWN_BASELINE?.widgetValue?.(n,widget),
   advisor?.modelContext?.(m,combat,ratio))||[];
  return {groups,picked:CL.map((cl,i)=>groups[i]?.best?.name||
    owned.find(h=>C.heroTypes[h.name]===cl)?.name||'')};
 };
 // Reassess hero ranking after the proposed optimal troop composition.
 // Both hero choice and troop ratio may affect one another.
 let result=chooseAt(null);
 const seen=new Set();
 for(let attempt=0;attempt<5;attempt++){
  const key=result.picked.join('|');
  if(seen.has(key))break;
  seen.add(key);
  v.ownHeroes=result.picked;
  const expected=formation?.expectedWeights?.([100000],m,C,combat,
   CL.map((_,i)=>Number(m.values[['troopsI','troopsC','troopsA'][i]])||0));
  const next=chooseAt(expected?.ownOptimal);
  if(next.picked.join('|')===key){result=next;break;}
  result=next;
 }
 v.ownHeroes=result.picked;
 if(canEdit||localOnly)B.save();
 return result;
}
function pack(){
 const m=state(),v=m.v2,heroes={};
 for(const n of heroStock()){
  const h=v.manualHeroes[n];heroes[n]={stars:Number(h.stars??0),tier:Number(h.tier??0),widget:Number(h.widget??0),
   level:80,expeditionStats:h.expeditionStats||{}};
 }
 return {heroes,ownHeroes:v.ownHeroes||[],joinCount:v.joinCount||0,
  joinLeaderComparison:v.joinLeaderComparison||'similar',
  ministers:window.NRW_BEAR_MINISTERS?.normalized?.(v.ministers)||{court:'king',fc:false,m:false},
  troopGroups:v.troopGroups||[],values:m.values||{},combatStatOrigin:'separate-overview',
  valoraTalent:v.valoraTalent||0,savageAdvantage:v.valora?.[3]||0,
  petActive:v.petActive||{},petSkillRanks:v.petSkillRanks||{}};
}
function unpack(d){
 const m=state(),v=m.v2;
 legacyCombinedStats=d.combatStatOrigin==='combined-report';
 v.manualHeroes={};v.scannedOwnedHeroes=[];
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
 v.ministers=window.NRW_BEAR_MINISTERS?.normalized?.(d.ministers)||{court:'king',fc:false,m:false};
 delete v.ministerBuffCapturedInStats;
 delete v.ministerCapacityInBase;
 v.troopGroups=d.troopGroups||[];v.troopTiers=[{tier:10,tg:0},{tier:10,tg:0},{tier:10,tg:0}];
 v.valora=[0,0,0,Number(d.savageAdvantage)||0];v.valoraTalent=Number(d.valoraTalent)||0;
 v.petActive=d.petActive||{};v.petSkillRanks=d.petSkillRanks||{};v.petBuffCapturedInStats=false;
 v.combatStatOrigin='separate-overview';
 // A shared profile is authoritative: do not retain stale local fields
 // when its remote snapshot has intentionally omitted a value.
 m.values={...(d.values||{})};
 for(const [i,type] of CL.entries())m.values[['troopsI','troopsC','troopsA'][i]]=v.troopGroups.filter(g=>g.type===type).reduce((n,g)=>n+Number(g.count),0);
 B.save();
}
function playerPicture(player,cls='bear-name-profile-image'){
 const img=el('img',cls);img.alt='';
 img.loading='lazy';img.referrerPolicy='no-referrer';
 if(player?.avatarUrl&&/^https:\/\//.test(player.avatarUrl))img.src=player.avatarUrl;
 else img.hidden=true;
 img.addEventListener('error',()=>{img.hidden=true;});
 return img;
}
function legacyNameId(value){
 let hash=2166136261;
 for(const ch of value.toLocaleLowerCase()) {hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return 'name-'+(hash>>>0);
}
async function openProfile(value){
 const sequence=++opening;
 clearTimeout(syncTimer);cachedFormationPlan=null;dirty=false;canEdit=false;version=null;needsPinMigration=false;pinPending=false;
 let player=typeof value==='object'&&value?value:null;
 const requested=(player?.name||String(value||'')).trim().replace(/\s+/g,' ');
 if(!valid(requested)){showStatus('Bitte einen Namen mit mindestens zwei Zeichen eingeben.',true);return;}
 if(!player?.id&&PROFILES){
  try{
   const found=(await PROFILES.search(requested)).players||[];
   if(sequence!==opening)return;
   const matched=found.filter(x=>x.name?.normalize('NFKC').toLocaleLowerCase()===
    requested.normalize('NFKC').toLocaleLowerCase());
   if(matched.length===1)player=matched[0];
   else if(matched.length>1){
    showStatus('Mehrere Spieler mit diesem Namen gefunden – bitte die passende ID aus der Liste auswählen.',true);return;
   }
  }catch(_){showStatus('Spielersuche gerade nicht erreichbar – lokales Profil wird geöffnet.',true);}
 }
 if(sequence!==opening)return;
 name=player?.name||requested;activePlayer=player?.id?player:{name};
 localOnly=!Boolean(player?.id&&PROFILES);
 editKey=localOnly?null:PROFILES.getEditKey(player.id);
 const localId=legacyNameId(name),stableId=player?.id?'k1044-'+player.id:localId;
 if(player?.id){
  // Migrate the older name-only browser draft without overwriting a newer
  // stable-ID profile; no credentials or other players' records are copied.
  const oldKey='nrw_bear_profile_v1_'+localId,stableKey='nrw_bear_profile_v1_'+stableId;
  try{if(!localStorage.getItem(stableKey)&&localStorage.getItem(oldKey))
   localStorage.setItem(stableKey,localStorage.getItem(oldKey));}catch(_){}
 }
 B.activateSavedId(stableId,name);
 if(localOnly){
  showStatus('Nur lokal: Spielername noch nicht im Cache von Server 1044 gefunden.');
 }else{
  try{
   const remote=await PROFILES.get(player.id);
   if(sequence!==opening)return;
   activePlayer=remote.player;name=remote.player.name;
   if(remote.profile){
    unpack(remote.profile.data);version=remote.profile.revision;
    needsPinMigration=remote.profile.pinSetupRequired===true;
    if(editKey&&!needsPinMigration){
     try{
      const permission=await PROFILES.verify(player.id,editKey);
      canEdit=Boolean(permission.canEdit);
     }catch(_){canEdit=false;}
    }
    showStatus(needsPinMigration?
     'Bestehendes Profil geladen. Jetzt mit dem bisherigen Code eine eigene Zahlen-PIN einrichten.':
     canEdit?'Gemeinsames Profil geladen · Bearbeitung erlaubt.':
     'Gemeinsames Profil geladen · schreibgeschützt. PIN zum Ändern erforderlich.');
   }else{
    version=null;canEdit=false;editKey=null;needsPinMigration=false;
    showStatus('Neues gemeinsames Profil: Bitte eine eigene vier- bis sechsstellige Zahlen-PIN festlegen.');
   }
   PROFILES.remember(activePlayer);
  }catch(_){
   localOnly=true;canEdit=false;
   showStatus('Supabase nicht erreichbar. Eingaben bleiben lokal; es wird nichts unbemerkt überschrieben.',true);
  }
 }
 mode='';render();
 if(!localOnly&&version===null&&activePlayer?.id)void unlockProfile();
}
async function push(){
 if(!name||syncInFlight||!dirty||!activePlayer?.id||!canEdit||!editKey||localOnly)return;
 const playerId=activePlayer.id,code=editKey,savedVersion=version,
  payload=pack(),serial=editCount;
 syncInFlight=true;clearTimeout(syncTimer);refreshSecurityStatus();
 try{
  const result=await PROFILES.save(playerId,code,savedVersion,payload);
  if(activePlayer?.id===playerId){
   legacyCombinedStats=false;
   version=result.revision;
   if(editCount===serial)dirty=false;
   else syncTimer=setTimeout(push,250);
   showStatus('✓ Gemeinsam gespeichert · Version '+version);
  }
 }catch(err){
  if(err?.status===403){canEdit=false;showStatus('PIN nicht gültig. Änderungen bleiben lokal.',true);}
  else if(err?.status===429){canEdit=false;showStatus('Zu viele Fehlversuche. Bitte nach Ablauf der PIN-Sperre erneut versuchen.',true);}
  else if(err?.status===409)showStatus('Profil wurde inzwischen auf einem anderen Gerät aktualisiert. Bitte neu öffnen und Änderungen vergleichen.',true);
  else showStatus('Online-Speicherung fehlgeschlagen. Änderungen bleiben lokal.',true);
 }finally{syncInFlight=false;refreshSecurityStatus();}
}
// Masked PIN setup/unlock UI: a leading zero is meaningful.
function requestNumericPin(create){
 return new Promise(resolve=>{
  const overlay=el('div','bear-name-pin-backdrop');
  const previousFocus=document.activeElement;
  const panel=el('form','bear-name-pin-dialog');
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-label',create?'PIN festlegen':'PIN eingeben');
  panel.append(title(create?'Bearbeitungs-PIN festlegen':'Bearbeitungs-PIN eingeben','h3'),
   el('p','bear-name-muted','4 bis 6 Ziffern. Die PIN wird für dieses Spielerprofil verwendet und darf nicht weitergegeben werden.'));
  const secret=el('input','bear-name-pin-input');
  secret.type='password';secret.inputMode='numeric';secret.pattern='[0-9]{4,6}';
  secret.minLength=4;secret.maxLength=6;secret.autocomplete='off';
  secret.placeholder='••••';secret.required=true;
  secret.setAttribute('aria-label','4 bis 6 Ziffern');
  panel.append(secret);
  let repeat=null;
  if(create){
   repeat=el('input','bear-name-pin-input');repeat.type='password';
   repeat.inputMode='numeric';repeat.pattern='[0-9]{4,6}';
   repeat.minLength=4;repeat.maxLength=6;repeat.autocomplete='off';
   repeat.placeholder='PIN wiederholen';repeat.required=true;
   repeat.setAttribute('aria-label','PIN wiederholen');
   panel.append(repeat);
  }
  const message=el('p','bear-name-pin-error');
  message.setAttribute('aria-live','polite');panel.append(message);
  const actions=el('div','bear-name-pin-actions');
  const cancel=button('Abbrechen',()=>finish(null));
  cancel.type='button';
  const confirm=button(create?'PIN festlegen':'Freischalten',()=>{},'bear-name-btn primary');
  confirm.type='submit';
  actions.append(cancel,confirm);panel.append(actions);
  const finish=value=>{
   document.removeEventListener('keydown',escape);
   overlay.remove();if(previousFocus?.isConnected)previousFocus.focus();resolve(value);
  };
  const escape=e=>{
    if(e.key==='Escape'){e.preventDefault();finish(null);return;}
    if(e.key==='Tab'){
     const items=[...panel.querySelectorAll('input,button:not([disabled])')];
     const first=items[0],last=items[items.length-1];
     if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
     else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
   };
  panel.addEventListener('submit',e=>{
   e.preventDefault();
   const pin=secret.value;
   if(!/^\d{4,6}$/.test(pin)){message.textContent='Nur 4 bis 6 Ziffern erlaubt.';return;}
   if(create&&repeat.value!==pin){message.textContent='Die beiden PINs stimmen nicht überein.';return;}
   finish(pin);
  });
  overlay.append(panel);app.append(overlay);
  document.addEventListener('keydown',escape);
  secret.focus();
 });
}
async function unlockProfile(){
 if(!activePlayer?.id||!PROFILES||pinPending)return;
 const profileId=activePlayer.id,isNew=version===null,migrating=needsPinMigration;
 const oldEditKey=migrating?PROFILES.getLegacyEditKey(profileId):null;
 if(migrating&&!oldEditKey){
  showStatus('Für die Umstellung wird der alte Bearbeitungscode aus dem ursprünglichen Browser benötigt.',true);
  return;
 }
 const pin=await requestNumericPin(isNew||migrating);
 if(pin===null){
  if(isNew&&activePlayer?.id===profileId)await leaveProfile();
  return;
 }
 if(activePlayer?.id!==profileId)return;
 pinPending=true;render();refreshSecurityStatus();
 try{
  if(isNew){
   // PIN creation is server-confirmed before inputs become editable.
   // A profile created concurrently by another device fails with HTTP 409.
   const result=await PROFILES.save(profileId,pin,null,pack());
   if(activePlayer?.id!==profileId)return;
   version=result.revision;dirty=false;needsPinMigration=false;
  }else if(migrating){
   const result=await PROFILES.migratePin(profileId,oldEditKey,pin,version);
   if(activePlayer?.id!==profileId)return;
   version=result.revision;needsPinMigration=false;
   PROFILES.forgetLegacyEditKey(profileId);
  }else{
   const permission=await PROFILES.verify(profileId,pin);
   if(!permission.canEdit){showStatus('Falsche PIN.',true);return;}
  }
  editKey=pin;PROFILES.storeEditKey(profileId,pin);
  canEdit=true;
  showStatus(isNew?'✓ Profil mit deiner PIN gesichert.':
   migrating?'✓ Profil ohne Datenverlust auf deine PIN umgestellt.':
   '✓ Profil mit deiner PIN freigeschaltet.');
 }catch(err){
  if(activePlayer?.id!==profileId)return;
  canEdit=false;
  if(err?.status===429){
   const mins=Math.max(1,Math.ceil(Number(err.retryAfterSeconds||1800)/60));
   showStatus('Zu viele PIN-Versuche. Bitte nach '+mins+' Minuten erneut versuchen.',true);
  }else if(err?.status===409&&isNew){
   showStatus('Das Profil wurde zwischenzeitlich eingerichtet. Bitte erneut öffnen.',true);
   pinPending=false;
   await openProfile(activePlayer);
   return;
  }else showStatus('PIN konnte nicht sicher gespeichert werden. Erneut versuchen.',true);
 }finally{
  pinPending=false;
  if(activePlayer?.id===profileId)render();
 }
}
async function leaveProfile(){
 clearTimeout(syncTimer);
 if(dirty&&canEdit&&!localOnly){await push();if(dirty){showStatus('Nicht online gespeichert. Lokale Daten bleiben erhalten.',true);return;}}
 name='';mode='';activePlayer=null;editKey=null;canEdit=false;localOnly=false;version=null;needsPinMigration=false;legacyCombinedStats=false;pinPending=false;
 render();
}
function helpHeading(text,key,tag='h3'){
 const row=el('div','bear-name-help-heading');
 row.append(title(text,tag));
 const icon=HELP?.icon?.(key);if(icon)row.append(icon);
 return row;
}
function rosterSection(){
 const section=el('section','bear-name-panel');
 section.append(helpHeading('Deine Helden','heroes','h2'),
  el('p','bear-name-muted','Anklicken = im Besitz. Alle Helden gelten als Level 80. Sterne/Tier und bei goldenen Helden Widget einstellen.'));
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
   tap.setAttribute('aria-pressed',String(owned));
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
// Preserve collapsible panel state after unrelated redraws.
const openPanels=new Map();
function foldingPanel(key,label,content,defaultOpen=false){
 const details=el('details','bear-name-panel bear-name-fold');
 details.open=openPanels.has(key)?openPanels.get(key):defaultOpen;
 const heading=el('summary','bear-name-fold-heading',label);
 const helpKey=key==='troops'?'troops':null;
 const info=helpKey?HELP?.icon(helpKey):null;
 if(info)heading.append(info);
 details.append(heading,content);
 details.addEventListener('toggle',()=>{
  if(details.isConnected)openPanels.set(key,details.open);
 });
 return details;
}
function troopsSection(required){
 const m=state(),v=m.v2,section=el('div','bear-name-fold-body');
 section.append(el('p','bear-name-muted','Pro Truppentyp beliebig viele T- und TG-Stufen hinzufügen. Die Summen werden automatisch ermittelt.'));
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
  },{min:1,max:1000000,helpKey:'capacity'}),
  el('p','bear-name-muted','Mit Marschkapazität und Truppenbestand werden genaue Stückzahlen pro Marsch berechnet.')
 );
 const filled=CL.every(type=>(v.troopGroups||[]).some(g=>g.type===type&&
  Number(g.tier)>=1&&Number(g.tg)>=0&&Number(g.count)>0));
 return foldingPanel('troops','Truppen',section,!filled);
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
function ministerSection(){
 const v=state().v2,section=el('section','bear-name-ministers');
 const selected=v.ministers;
 section.append(el('p','bear-name-muted','Die eingetragenen Werte sind immer ungebufft. Ministerboni werden automatisch hinzugefügt.'));
 // Tap/click and keyboard-friendly, two-position switch. Native range
 // was previously re-rendered during its INPUT event, interrupting
 // pointer dragging on mobile. Clickable buttons do not have that race.
 const control=el('div','bear-name-court-switch');
 control.setAttribute('role','group');
 control.setAttribute('aria-label',T('Ministerhof wählen: König oder Hochkönig'));
 const track=el('span','bear-name-court-thumb');
 track.setAttribute('aria-hidden','true');
 const setCourt=court=>{
  if(selected.court===court)return;
  selected.court=court;
  saveLocal(); // invalidates the prior formations and saves this name
  const replacement=ministerSection();
  if(section.isConnected)section.replaceWith(replacement);
  else render();
 };
 for(const [court,label] of [['king','König'],['highKing','Hochkönig']]){
  const option=button(label,()=>setCourt(court),'bear-name-court-option');
  option.setAttribute('aria-pressed',selected.court===court?'true':'false');
  option.classList.toggle('active',selected.court===court);
  option.dataset.court=court;
  control.append(option);
 }
 control.append(track);
 control.dataset.court=selected.court;
 section.append(control);
 const buff=window.NRW_BEAR_MINISTERS?.metadata?.[selected.court]||
  (selected.court==='king'?{fcLethality:10,marshalAttack:5,marshalCapacity:2500}:
   {fcLethality:15,marshalAttack:8,marshalCapacity:3750});
 const rows=el('div','bear-name-minister-roles');
 for(const [role,titleText,bonus] of [
  ['fc','FC','+'+buff.fcLethality+' % '+T('Tödlichkeit')],
  ['m','M','+'+buff.marshalAttack+' % '+T('Angriff')+' · +'+num(buff.marshalCapacity)+' '+T('Schwadronskapazität')]
 ]){
  const label=el('label','bear-name-minister-role'),input=el('input');
  input.type='checkbox';input.checked=selected[role]===true;
  input.addEventListener('change',()=>{
   selected[role]=input.checked;
   saveLocal();
   label.classList.toggle('selected',input.checked);
  });
  label.classList.toggle('selected',input.checked);
  const art=el('span','bear-name-minister-art'),image=el('img');
  image.src=role==='fc'?'./assets/minister-field-commander.webp':
   './assets/minister-marshal.webp';
  image.alt=role==='fc'?T('FC · Schwerter'):T('M · Faust');
  image.loading='lazy';
  art.append(image);
  const copy=el('span','bear-name-minister-info');
  copy.append(el('strong','',titleText),el('small','',bonus));
  label.append(input,art,copy);rows.append(label);
 }
 section.append(rows);
 return section;
}
function scalarSection(){
 const m=state(),v=m.v2,section=el('div','bear-name-fold-body');
 section.append(el('p','bear-name-muted','Bitte ausschließlich ungebuffte Grundwerte eintragen. Fehlende Werte bleiben offen.'));
 if(legacyCombinedStats)
  section.append(el('p','bear-name-warning','Dieses ältere Profil wurde bislang als „kombiniert“ gespeichert. Bitte prüfen, ob die eingetragenen Truppenwerte wirklich einzeln aus der Bonusübersicht stammen. Separate Heldenboni werden nun zusätzlich berücksichtigt.'));
 section.append(choose('Anzahl aller Märsche (inkl. eigener Rally)',Array.from({length:7},(_,i)=>[i+1,String(i+1)]),
  Number(v.joinCount||0)+1,x=>{v.joinCount=Number(x)-1;saveLocal();},'march'));
 section.append(rallyStrengthField());
 section.append(numberField('Basis-Marschkapazität ohne Helden',m.values.cap,x=>{
  m.values.cap=x;saveLocal();
 },{max:1000000,helpKey:'capacity'}));
 section.append(helpHeading('Infanterie, Kavallerie, Bogenschützen & Schwadron','combatStats'));
 const grid=el('div','bear-name-stat-grid');
 for(const [i,cl] of CL.entries())for(const [field,label] of [['Atk','Angriff %'],['Let','Tödlichkeit %']]){
  const k=['i','c','a'][i]+field;
  grid.append(numberField(LABEL[i]+' · '+label,m.values[k],x=>{
   if(x===null)delete m.values[k];else m.values[k]=x;
   saveLocal();
  },{step:0.1,max:10000}));
 }
 // The source is permanently "separate-overview". Keep actual squad bonus
 // inputs visible, but do not show a selector that can misinterpret stats.
 section.append(grid);
 const gr=el('div','bear-name-stat-grid');
 for(const k of ['squadAtk','squadLet'])
  gr.append(numberField(k==='squadAtk'?'Schwadron Angriff %':'Schwadron Tödlichkeit %',m.values[k],x=>{
   if(x===null)delete m.values[k];else m.values[k]=x;saveLocal();
  },{step:0.1,max:10000}));
 section.append(gr);
 const statsFilled=Number(m.values.cap)>0&&['iAtk','iLet','cAtk','cLet','aAtk','aLet'].every(k=>
  m.values[k]!==null&&m.values[k]!==undefined&&m.values[k]!==''&&Number.isFinite(Number(m.values[k])))&&
  ['squadAtk','squadLet'].every(k=>
   m.values[k]!==null&&m.values[k]!==undefined&&m.values[k]!==''&&Number.isFinite(Number(m.values[k])));
 const settings=el('div','bear-name-settings');
 settings.append(foldingPanel('baseStats','Basisstats',section,!statsFilled));
 const petSection=el('div','bear-name-fold-body');
 petSection.append(helpHeading('Pets','pets'));
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
 const valoraTitle=el('div','bear-name-buff-title');
 valoraTitle.append(valoraPicture,el('strong','','Valora'));
 const valoraHelp=HELP?.icon?.('valora');if(valoraHelp)valoraTitle.append(valoraHelp);
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
 skillRows.append(savage,hunter);skills.append(skillRows);
 petSection.append(petGrid,skills);
 petSection.append(el('p','bear-name-muted','Pet- und Valora-Boni werden zu den ungebufften Basiswerten addiert.'));
 settings.append(foldingPanel('ministers','Ministerbuffs',ministerSection(),false),
  foldingPanel('pets','Pets & Valora',petSection,false));
 return settings;
}
function starterGearSection(picked){
 const v=state().v2,section=el('section','bear-name-panel');
 section.id='bearStarterGear';
 section.append(helpHeading('Heldenausrüstung nach dem Umziehen prüfen','expedition','h2'),
  el('p','bear-name-muted','Ziehe zuerst deine beste Heldenausrüstung auf die drei empfohlenen Starter um. Trage DANACH ihre tatsächlichen Expeditionsboni für Angriff und Tödlichkeit ein. Nichts wird doppelt addiert.'));
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
function troopUtilization(plan){
 const section=el('section','bear-name-utilization');
 section.append(title('Truppenauslastung','h3'));
 const types=['Infanterie','Kavallerie','Bogenschützen'];
 const total=plan.stock.reduce((a,b)=>a+b,0),used=plan.used.reduce((a,b)=>a+b,0);
 section.append(el('p','bear-name-util-total',
  num(used)+' / '+num(total)+' '+T('Truppen eingesetzt')));
  const legend=el('div','bear-name-util-legend');
 legend.append(el('span','',T('Eingesetzt')+' · '+(total?Math.round(used/total*100):0)+' %'),
  el('span','',T('Restbestand')+' · '+num(total-used)));
 section.append(legend);
 for(let k=0;k<3;k++){
  const available=plan.stock[k],spent=plan.used[k],remain=plan.leftover[k],
   percent=available?spent/available*100:0;
  const row=el('div','bear-name-util-row');
  const head=el('div','bear-name-util-legend');
  head.append(el('strong','',T(types[k])),el('span','',
    num(spent)+' / '+num(available)+' · '+T('Rest')+': '+num(remain)));
  const track=el('div','bear-name-util-track bear-name-util-type-'+k);
  const bar=el('span','bear-name-util-fill');bar.style.width=percent.toFixed(2)+'%';
  track.append(bar);row.append(head,track);section.append(row);
 }
 return section;
}
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
  const article=el('article','bear-name-formation-card '+(index===0?'is-starter':'is-joiner'));
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
 if(validCap)section.append(troopUtilization(plan));
 if(!validCap){
  section.append(el('p','bear-name-muted',
   capMissing?'Marschkapazität und Truppenbestand ergänzen, damit wir die Formation berechnen können.':
   hasStock?'Für genaue Truppenzahlen bitte die Bestände vervollständigen.':
   'Truppenbestand und Marschkapazität fehlen noch.'));
 }else{
  section.append(el('p','bear-name-muted',
   'Joiner-Basis 5/15/80. Die Stärke fremder Rallyleader bestimmt, wer bei knappen Bogenschützen bevorzugt wird.'));
  const diag=el('div','bear-name-fold-body'),
   fmt=p=>Array.isArray(p)?p.map(x=>Number(x).toFixed(1)).join(' / ')+' %':'–';
  const allocationMode=plan.allocationPriority==='starter'?
   'Starter zuerst':plan.allocationPriority==='joins'?'Joiner zuerst':'Gleich stark: Joiner zuerst (geteilte Berechnung)';
  diag.append(el('p','',
   'Truppenpriorität: '+T(allocationMode)));
  diag.append(el('p','bear-name-muted',
   'Joiner bekommen zunächst 5 % Infanterie, 15 % Kavallerie und 80 % Bogenschützen. Der Starter wird anhand seiner eigenen Angriffswerte berechnet. Wenn Bogenschützen nicht reichen, werden sie entsprechend der Priorität reserviert und innerhalb der Joiner proportional zu ihrer tatsächlichen Marschkapazität verteilt.'));
  diag.append(el('p','',
   'Bogenschützenbedarf für alle '+plan.marches.length+' Märsche: '+num(plan.requiredArchers||0)+
   ' · Bestand: '+num(plan.archerSupply||0)));
  if(plan.archerShortage>0)
   diag.append(el('p','bear-name-warning',
    'Es fehlen '+num(plan.archerShortage)+' Bogenschützen für die vorgesehenen Marschverhältnisse. Die betroffenen Formationen wurden angepasst.'));
  diag.append(el('p','','Starter ohne Bestandsgrenze: '+fmt(plan.ownUnconstrainedRatio)));
  diag.append(el('p','','Standard der Joiner: 5 / 15 / 80 %'));
  diag.append(el('p','','Tatsächlicher Starter: '+plan.marches[0].ratio.join(' / ')+' %'));
  if(plan.referenceQuality?.some(q=>!q.confirmed))
   diag.append(el('p','bear-name-warning','⚠ Unbekannte T/TG-Stufen: Vorläufige T10/TG0-Vergleichswerte werden verwendet.'));
  if(!plan.modelHasStats)
   diag.append(el('p','bear-name-warning','⚠ Einige Angriffs- oder Tödlichkeitswerte fehlen. Diese werden nur neutral angenähert.'));
  if(!plan.modelHasHeroEffects)
   diag.append(el('p','bear-name-warning','⚠ Noch keine vollständige Berücksichtigung der Heldenfähigkeiten möglich.'));
  diag.append(el('p','bear-name-muted','Bei identischer Kapazität teilen sich Joiner die verfügbaren Bogenschützen gleichmäßig. Abweichungen von 5/15/80 entstehen durch Truppenmangel, Kapazität oder ganzzahlige Ingame-Prozente – nicht durch angenommene individuelle Rallyleaderwerte.'));
  section.append(foldingPanel('formationWhy','Warum diese Formation?',diag,false));
  const unused=(plan.leftover||[]).reduce((n,v)=>n+v,0);
  if(unused>0)section.append(el('p','bear-name-muted',
   num(unused)+' '+T('Truppen bleiben wegen der ganzzahligen Prozentvorgabe unverteilt.')));
 }
 return section;
}
// One loading surface for each separate result. The formation video is the
// complete existing Kingshot hero-selection WebM; damage has a cloud-themed
// dedicated animation until an approved original cloud WebM is available.
async function loadingSequence(kind){
 // Keep both original videos intact. Playback accompanies the ready result
 // and never gates computation. Reduced-motion users skip the media.
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const old=document.getElementById('bearNameLoading');old?.remove();
 const loading=el('div','bear-name-loading '+(kind==='formation'?'bear-name-loading-hero':'bear-name-loading-cloud'));
 loading.id='bearNameLoading';
 loading.setAttribute('role','status');
 const text=el('p','',kind==='formation'?copy('Deine Formationen sind bereit.','Your formations are ready.','Tes formations sont prêtes.','Tus formaciones están listas.'):
  copy('Dein Modellergebnis ist bereit.','Your model result is ready.','Le résultat du modèle est prêt.','El resultado del modelo está listo.'));
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
  loading.append(text);box.append(loading);
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
  loading.append(video,clouds,text);box.append(loading);
  await new Promise(resolve=>{
   let finished=false;
   const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);resolve();};
   // Do not serve a pixelated downscaled copy of the provided animation.
   // If this browser cannot decode VP9, show the non-video CSS fallback.
   const fallback=()=>{video.hidden=true;clouds.hidden=false;finish();};
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
  void loadingSequence(kind);
  const result=kind==='formation'?formationCards():predicted();
  const playback=document.getElementById('bearNameLoading');if(playback)result.prepend(playback);
  result.id=id;box.append(result);result.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
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
 picked.forEach((n,i)=>{const wrapper=el('article','bear-advice-slot'),h=el('div','bear-name-pick'),hero=heroList.find(x=>x.name===n);
  if(hero){const img=el('img');img.src=heroInfoCache[n]?.imageUrl||hero.img;img.alt='';h.append(img);}
  h.append(el('strong','',LABEL[i]),el('span','',n||'Noch kein passender Held'));
  wrapper.append(h);
  const group=groups[i],explain=window.NRW_BEAR_HERO_EXPLANATIONS;
  if(group&&explain)wrapper.append(explain.render(group,n=>heroInfoCache[n]?.imageUrl||heroList.find(x=>x.name===n)?.img));
  starter.append(wrapper);
 });section.append(starter);

 return {section,picked};
}
function refreshHeroRecommendations(){
 if(!name||!mode)return;
 const current=document.getElementById('bearHeroRecommendation');
 if(!current)return;
 // New hero reference data can change damage even when the best three
 // hero names stay identical; discard both old result views and the cache.
 cachedFormationPlan=null;
 document.getElementById('bearFormationResult')?.remove();
 document.getElementById('bearAdvancedResult')?.remove();
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
   const updatedGear=starterGearSection(result.picked);
   markReadOnly(updatedGear);
   gear.replaceWith(updatedGear);
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
  out.append(el('p','bear-name-muted','Noch fehlende Helden-/Pet-Angaben: '+T(prepared.reason)));
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
  const label=T(sc.label).replace('(Lv5)',T('(Lv5)'));
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
   if(lastStatusMessage!==null)status.textContent=T(lastStatusMessage);
   render();
  },'bear-name-lang-button');
  b.setAttribute('lang',lang);
  if((I18N?.language?.()||document.documentElement.lang)===lang)b.classList.add('active');
  div.append(b);
 }
 return div;
}
function landing(){
 const head=el('div','bear-name-landing');
 const mast=el('div','bear-warroom-brand');
 const logo=el('img');logo.src='../assets/nrw-banner.svg';logo.alt='NRW United';
 mast.append(logo,el('span','','NRW United · Kingshot #1044'),languageSwitcher());
 const intro=el('div','bear-warroom-intro');
 intro.append(title(copy('Jeder Marsch zählt.','Every march matters.','Chaque marche compte.','Cada marcha cuenta.'),'h1'),
  el('p','bear-name-muted',copy('Deine Helden. Deine Truppen. Dein Plan für die Bärenfalle.','Your heroes. Your troops. Your plan for the Bear Trap.','Tes héros. Tes troupes. Ton plan pour la chasse à l’ours.','Tus héroes. Tus tropas. Tu plan para la trampa del oso.')));
 const art=el('img','bear-warroom-bear');art.src='https://got-global-wiki.s3.us-west-1.amazonaws.com/wp-content/uploads/2026/01/jump_icon_40088.png';art.alt='';
 intro.append(art);head.append(mast,intro);
 head.append(title(copy('Bear Trap Optimizer','Bear Trap Optimizer','Bear Trap Optimizer','Bear Trap Optimizer'),'h2'),
  el('p','bear-name-muted',copy('Profil öffnen, Starter und Joiner planen – mit nachvollziehbaren Empfehlungen aus deinen gespeicherten Werten.','Open your profile, plan starters and joiners, and understand recommendations based on your saved values.','Ouvre ton profil, prépare tes lanceurs et renforts et comprends les recommandations selon tes données.','Abre tu perfil, organiza líderes y apoyos y entiende las recomendaciones basadas en tus datos.')));
 const input=el('input','bear-name-input');
 input.placeholder=T('Dein Kingshot-Name');input.maxLength=50;input.autocomplete='off';
 input.enterKeyHint='search';input.autocapitalize='none';input.spellcheck=false;
 input.setAttribute('aria-label',T('Dein Kingshot-Name'));
 const results=el('div','bear-name-search-results');
 let timer=null,token=0;
 function showResults(players){
  results.replaceChildren();
  for(const player of players){
   const item=button('',()=>openProfile(player),'bear-name-search-item');
   item.append(playerPicture(player),el('span','',player.name+' · '+(player.alliance||'#1044')),
    el('small','',player.id));
   results.append(item);
  }
 }
 input.addEventListener('input',()=>{
  clearTimeout(timer);const id=++token,query=input.value.trim();
  results.replaceChildren();
  if(!PROFILES||query.length<2)return;
  timer=setTimeout(async()=>{
   try{const r=await PROFILES.search(query);
    if(id===token&&input.isConnected)showResults(r.players||[]);
   }catch(_){if(id===token)results.replaceChildren();}
  },260);
 });
 input.onkeydown=e=>{if(e.key==='Enter'&&valid(input.value)){
  e.preventDefault();openProfile(input.value);
 }};
 head.append(input,results,button('Profil öffnen →',()=>{
  if(valid(input.value))openProfile(input.value);
  else showStatus('Bitte einen Namen mit mindestens zwei Zeichen eingeben.',true);
 },'bear-name-btn primary'));
 head.append(el('p','bear-name-muted','Gemeinsame Profile sind einsehbar. Bearbeiten kannst du sie mit einer selbst gewählten 4- bis 6-stelligen Zahlen-PIN. Favoriten bleiben lokal.'));
 const paths=el('div','bear-warroom-paths');
 paths.append(el('p','',copy('Schnellmodus · Helden & Formationen','Quick mode · Heroes & formations','Mode rapide · Héros et formations','Modo rápido · Héroes y formaciones')),
  el('p','',copy('Erweitert · Kampfwerte & Schadensmodell','Advanced · Combat stats & damage model','Avancé · Statistiques et modèle de dégâts','Avanzado · Estadísticas y modelo de daño')));
 head.append(paths);box.append(head);
 const nav=el('nav','bear-warroom-links');nav.setAttribute('aria-label','NRW');
 for(const [href,label] of [['https://welcome-nrw.vercel.app/dashboard/',copy('Spielerübersicht','Player dashboard','Tableau des joueurs','Panel de jugadores')],['https://welcome-nrw.vercel.app/leitung/',copy('NRW-Leitung','NRW leadership','Direction NRW','Dirección NRW')]]){
  const a=el('a','',label);a.href=href;nav.append(a);
 }box.append(nav);
 const saved=PROFILES?.ordered()||[];
 const legacy=(()=>{
  try{return JSON.parse(localStorage.getItem('nrw_bear_name_list_v1')||'[]');}catch{return [];}
 })();
 const all=saved.concat(legacy.filter(n=>typeof n==='string'&&
  !saved.some(x=>x.name.toLocaleLowerCase()===n.toLocaleLowerCase()))
  .map(n=>({name:n})));
 if(all.length){
  const section=el('div','bear-name-saved');
  section.append(title('⭐ Favoriten zuerst · zuletzt geöffnet','h3'));
  for(const item of all.slice(0,30)){
   const line=el('div','bear-name-history-row'),
    open=button('',()=>openProfile(item),'bear-name-history-open');
   open.append(playerPicture(item),el('span','',item.name));
   const favorite=PROFILES?.isFavorite(item);
   const star=button(favorite?'★':'☆',()=>{
    PROFILES?.toggleFavorite(item);render();
   },'bear-name-favorite-btn'+(favorite?' selected':''));
   star.setAttribute('aria-label',favorite?'Favorit entfernen':'Als Favorit markieren');
   line.append(open,star);section.append(line);
  }
  box.append(section);
 }
}
function render(){
 box.replaceChildren();
 if(!name){landing();return;}
 const bar=el('header','bear-name-top');
 bar.append(button('← Namen wechseln',leaveProfile));
 const identity=el('div','bear-name-identity');
 identity.append(playerPicture(activePlayer));
 identity.append(title(name,'h2'));
 bar.append(identity);
 const starred=PROFILES?.isFavorite(activePlayer);
 const star=button(starred?'★':'☆',()=>{
  if(!activePlayer)return;
  PROFILES?.toggleFavorite(activePlayer);
  render();
 },'bear-name-favorite-btn'+(starred?' selected':''));
 star.setAttribute('aria-label',starred?'Favorit entfernen':'Als Favorit markieren');
 bar.append(star,languageSwitcher());
 if(canEdit&&!localOnly){
  bar.append(button('Jetzt speichern',async()=>{dirty=true;await push();}));
 }else if(activePlayer?.id&&!localOnly)
  bar.append(button(version===null?'🔐 PIN festlegen':needsPinMigration?'🔐 Eigene PIN einrichten':'🔒 PIN eingeben',
   unlockProfile,'bear-name-code-btn'));

 box.append(bar);
 const security=el('div','bear-name-security');
 security.dataset.bearSecurity='true';
 const securityInfo=securityState();security.classList.add('bear-name-security-'+securityInfo.kind);
 security.textContent=T(securityInfo.text);
 box.append(security);
 if(activePlayer?.id&&!localOnly&&(version===null||needsPinMigration)){
  const panel=el('section','bear-name-pin-urgent');
  panel.append(title('🔐 WICHTIG: PROFIL MIT PIN SICHERN!','h3'),
   el('p','',version===null?
    'Bevor du Werte eingeben kannst, muss dein Profil mit einer persönlichen 4- bis 6-stelligen Zahlen-PIN geschützt werden.':
    'Für dieses bestehende Profil ist eine Umstellung auf die persönliche Zahlen-PIN erforderlich.'));
  const btn=button(version===null?'🔐 JETZT PIN FESTLEGEN':'🔐 EIGENE PIN EINRICHTEN',
   unlockProfile,'bear-name-pin-urgent-btn');
  btn.disabled=pinPending;panel.append(btn);box.append(panel);
  if(version===null)return; // no editable forms before successful PIN claim
 }
 if(!mode){
  const options=el('section','bear-name-choice');
  options.append(title('Was möchtest du optimieren?'),
   button('⚔️ Nur Starter-/Joiner-Helden',()=>{mode='quick';render();},'bear-name-btn primary'),
   button('📈 Erweiterte Schadensoptimierung',()=>{mode='advanced';render();},'bear-name-btn'),
   el('p','bear-name-muted','Gemeinsame Werte sind geräteübergreifend lesbar. Favoriten bleiben lokal, Änderungen benötigen deine selbst gewählte 4- bis 6-stellige PIN. OCR bleibt ausgeschaltet.'));
  box.append(options);return;
 }
 box.append(button('← Modus wählen',()=>{mode='';render();}));
 if(mode==='quick'){
  const main=el('div','bear-name-two-columns'),left=el('div'),right=el('div');
  const v=state().v2;
  left.append(choose('Märsche insgesamt',Array.from({length:7},(_,i)=>[i+1,String(i+1)]),
   Number(v.joinCount||0)+1,x=>{v.joinCount=Number(x)-1;saveLocal();render();},'march'),rallyStrengthField(),rosterSection());
  left.append(troopsSection(false));
  right.append(summaryHeroes().section,actionButtons(false));main.append(left,right);box.append(main);markReadOnly(main);
 }else{
  const main=el('div','bear-name-two-columns'),left=el('div'),right=el('div');
  left.append(rosterSection(),troopsSection(true),scalarSection());
  const r=summaryHeroes();right.append(r.section,starterGearSection(r.picked),actionButtons(true));
  main.append(left,right);box.append(main);markReadOnly(main);
 }
 // Recent profile ordering is managed separately from saved model values.
 if(activePlayer)PROFILES?.remember(activePlayer);
 refreshSecurityStatus();
}
render();
// The public reference loads asynchronously. Update a visible recommendation
// as soon as its complete hero data is available (without a further click).
window.NRW_BEAR_HERO_REFERENCE?.load?.().then(()=>refreshHeroRecommendations());
window.NRW_BEAR_NAME_FLOW={openProfile,render,pack,unpack,refreshHeroRecommendations};
})();
