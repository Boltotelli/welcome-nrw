/* Guided mobile-first NRW Bear Trap setup.
 * Reuses the existing profile, screenshot and calculation controls; no
 * second persistence format or OCR implementation.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const B=window.NRW_BEAR_BRIDGE;
const dashboard=document.querySelector('.dashboard');
const profile=$('lookupForm')?.closest('section.panel');
const intake=$('bearIntakeWizard');
const gear=$('bearGearPhoto')?.closest('section.panel');
const manual=$('intakeMissingDetails');
const result=$('intakeResultSlot');
if(!B||!dashboard||!profile||!intake||!gear||!manual||!result)return;
const lang=()=>document.documentElement.lang||'de';
const messages={
 de:{
  eyebrow:'NRW · BEAR TRAP',start:'Deine Bären-Aufstellung',desc:'Einmal durchgehen. Wir übernehmen alles, was wir aus deiner ID und den Spielscreenshots lesen können.',
  steps:['Dein Profil','Truppen','Kampfwerte','GovGear','Helden','Fehlende Angaben','Deine Empfehlung'],
  prompts:['Wähle deine Governor-ID oder lade deine bereits vorhandenen Profildaten.',
   'Lade die Schwadronvorschau hoch. Ein Screenshot reicht. Wir lesen Truppenanzahl und Stufen.',
   'Lade die Bonusübersicht hoch. Bei einer langen Liste einfach mehrere Screenshots nacheinander auswählen.',
   'Ein vollständiges Bild der Gouverneur-Ausrüstung zeigt alle 6 Teile und 18 Talismane.',
   'Lade die Heldenübersicht und die Details deiner 3 Starterhelden hoch. Mehrere Bilder sind möglich.',
   'Wir fragen nur Daten nach, die noch fehlen. Fortgeschrittene Einstellungen bleiben optional.',
   'Vergleiche die drei besten Ratios des derzeitigen Rechenmodells.'],
  next:'Weiter',back:'Zurück',skip:'Diesen Screenshot später ergänzen',finish:'Ergebnis anzeigen',
  upload:'Screenshot auswählen',uploads:'Screenshots auswählen',progress:'Schritt',
  profileGood:'Profil geladen – weiter zu den Truppen.',profileMissing:'Bitte erst eine ID oder ein NRW-Profil laden.',
  pages:'GitHub Pages kann MightPulse nicht sicher direkt abrufen. Hier kannst du ein gespeichertes Profil oder deine bereits vorhandene API-JSON laden. Die Mitgliedschaft eines lokalen Profils ist damit nicht erneut geprüft.',
  review:'Prüfe die erkannten Werte und tippe auf „Übernehmen“. Danach kannst du fortfahren.',
  waiting:'Bitte einen Screenshot auswählen und die Erkennung bestätigen – oder diesen Schritt überspringen.',
  ready:'Angaben übernommen. Du kannst fortfahren.',
  done:'Einrichtung abgeschlossen.',missing:'Noch erforderlich',allGood:'Keine Pflichtangaben fehlen.',
  opt:'Optionale Experteneinstellungen',advanced:'Alle Felder anzeigen',api:'Gespeichertes Profil oder API-JSON',
  skipped:'Diesen Schritt kannst du später ergänzen.',estimated:'Die Berechnung ist eine vorläufige Simulation; Heldenprocs und Widgets sind nicht vollständig modelliert.',
  hero:'Heldenauswahl und Sterne werden nur übernommen, wenn du die Erkennung bestätigst.',
  privacy:'Die Bilder bleiben auf deinem Gerät. Die OCR-Software wird beim ersten Import heruntergeladen.'
 },
 en:{
  eyebrow:'NRW · BEAR TRAP',start:'Your Bear Trap lineup',desc:'Follow a short guided setup. We reuse your player data and screenshots.',
  steps:['Your profile','Troops','Combat stats','Governor gear','Heroes','Missing values','Your recommendation'],
  prompts:['Choose your Governor ID or import an existing profile.',
   'Upload your troop overview. One screenshot covers troops and tiers.',
   'Upload the bonuses screen. You can select several screenshots of a long list.',
   'One complete Governor Gear overview contains all 6 items and 18 charms.',
   'Upload your hero overview and details for your 3 rally starters. Multiple images are supported.',
   'Only values that are truly missing require manual input. Advanced options stay optional.',
   'Compare the top three formations in the current simulation.'],
  next:'Continue',back:'Back',skip:'Add this screenshot later',finish:'Show recommendation',
  upload:'Choose screenshot',uploads:'Choose screenshots',progress:'Step',
  profileGood:'Profile loaded. Continue to troops.',profileMissing:'Load a Governor ID or NRW profile first.',
  pages:'GitHub Pages cannot securely call MightPulse directly. Use a saved local profile or your existing API JSON. A saved profile is not a fresh membership check.',
  review:'Review recognized fields and press Apply, then continue.',waiting:'Upload and confirm a screenshot, or skip this step.',
  ready:'Values saved. You can continue.',done:'Setup finished.',missing:'Still needed',allGood:'All required values are present.',
  opt:'Optional expert settings',advanced:'Show all fields',api:'Saved profile or API JSON',
  skipped:'You can add this step later.',estimated:'Results are provisional estimates. Hero procs and widgets are not fully modeled.',
  hero:'Hero names and stars are saved only after your confirmation.',
  privacy:'Screenshots stay on your device. OCR components download on the first import.'
 },
 fr:{
  eyebrow:'NRW · BEAR TRAP',start:'Ta formation Ours',desc:'Un assistant simple basé sur ton profil et tes captures.',
  steps:['Profil','Troupes','Stats','Équipement','Héros','Valeurs manquantes','Résultat'],
  prompts:['Choisis ton ID ou importe un profil existant.','Ajoute une capture des troupes.','Ajoute une ou plusieurs captures des bonus.','Une capture complète des 6 équipements et 18 talismans.','Ajoute la liste et les détails des trois héros.','Complète seulement les valeurs manquantes.','Compare les trois formations simulées.'],
  next:'Continuer',back:'Retour',skip:'Ajouter plus tard',finish:'Afficher le résultat',
  upload:'Choisir une capture',uploads:'Choisir des captures',progress:'Étape',
  profileGood:'Profil chargé.',profileMissing:'Charge un profil en premier.',
  pages:'GitHub Pages ne peut pas contacter MightPulse avec une clé secrète. Utilise un profil local ou un JSON existant; le profil local ne vérifie pas de nouveau ton alliance.',
  review:'Vérifie les résultats puis confirme.',waiting:'Ajoute une capture et confirme, ou passe cette étape.',
  ready:'Valeurs enregistrées.',done:'Terminé.',missing:'Manquant',allGood:'Toutes les valeurs nécessaires sont présentes.',
  opt:'Réglages experts',advanced:'Tous les champs',api:'Profil local ou JSON',
  skipped:'Tu peux compléter cela plus tard.',estimated:'Résultats provisoires : effets aléatoires des héros non complètement modélisés.',
  hero:'Confirme les héros et étoiles reconnus.',privacy:'Les images restent sur ton appareil.'
 }
};
const t=()=>messages[lang()]||messages.en;
const sections=[],labels=['id','troops','stats','gear','heroes','missing','result'];
const wizard=document.createElement('section');wizard.id='bearGuidedWizard';wizard.className='bear-guided-wizard';wizard.setAttribute('aria-label','Bear Trap Setup');
wizard.innerHTML='<header class="bear-guide-head"><div class="micro" id="bearGuideEyebrow"></div><h1 id="bearGuideTitle"></h1><p class="hint" id="bearGuideDesc"></p><div class="bear-guide-track" id="bearGuideTrack"></div><div class="bear-guide-progress"><span id="bearGuideStep"></span><span id="bearGuideStepTitle"></span></div></header>'+
 '<p class="bear-guide-prompt" id="bearGuidePrompt"></p>'+
 '<div id="bearGuideContent"></div><div class="bear-guide-message" id="bearGuideMessage" role="status" aria-live="polite"></div>'+
 '<nav class="bear-guide-nav"><button type="button" class="secondary-btn" id="bearGuideBack"></button><button type="button" class="secondary-btn" id="bearGuideSkip"></button><button type="button" class="primary" id="bearGuideNext"></button></nav>';
dashboard.before(wizard);
dashboard.hidden=true;
const content=$('bearGuideContent');
for(const id of labels){const s=document.createElement('section');s.className='bear-guide-slide';s.dataset.guide=id;s.hidden=true;content.appendChild(s);sections.push(s);}
sections[0].append(profile);
const profileHelp=document.createElement('p');profileHelp.className='hint bear-guide-api-note';profileHelp.id='bearGuideApiHelp';sections[0].append(profileHelp);
sections[1].append(intake);
sections[3].append(gear);
sections[5].append(manual);
sections[6].append(result);
// Existing intake scanner has exactly one real input and review queue.
// It moves between steps; all event handlers remain attached.
function showIntake(i){
 if(intake.parentNode!==sections[i])sections[i].appendChild(intake);
 const gearButton=$('intakeGear');if(gearButton)gearButton.hidden=true;
 const intro=intake.querySelector('.bear-intake-header>p.hint');
 if(intro)intro.hidden=true;
 const gearExtra=intake.querySelector('.bear-intake-header>p.hint:last-of-type');
 if(gearExtra)gearExtra.hidden=true;
 const buttonText=$('intakePicker')?.querySelector('span');
 if(buttonText)buttonText.textContent='📸 '+((i===1)?t().upload:t().uploads);
 const input=$('intakeFiles');if(input)input.multiple=i===2;
}
let active=0,finished=false;
const imported=new Set(),skipped=new Set();
const hasProfile=()=>Boolean(B.profile()?.governor_id)&&!$('restricted').hidden;
function profileMethod(){
 const id=String(B.profile()?.governor_id||'');
 return /^\d{5,20}$/.test(id);
}
function modelReady(kind){
 const values=B.model().values||{};
 const has=k=>values[k]!==undefined&&values[k]!==''&&Number.isFinite(Number(values[k]));
 if(kind===1)return ['troopsI','troopsC','troopsA'].every(has);
 if(kind===2)return ['iAtk','iLet','cAtk','cLet','aAtk','aLet'].every(has);
 if(kind===3){const g=B.model().v2?.gear||{};return Object.values(g).some(x=>x?.quality&&x.quality!=='none'||x?.charms?.some(n=>Number(n)>0));}
 if(kind===4)return (B.model().v2?.ownHeroes||[]).filter(Boolean).length===3;
 return false;
}
function missingValues(){
 const m=B.model(),v=m.values||{},ext=m.v2||{};
 const out=[];
 for(const [id,name] of [['troopsI','Infanterie'],['troopsC','Kavallerie'],['troopsA','Bogenschützen'],['cap','Schwadronskapazität'],
  ['iAtk','Inf Angriff'],['iLet','Inf Tödlichkeit'],['cAtk','Kav Angriff'],['cLet','Kav Tödlichkeit'],['aAtk','Bogen Angriff'],['aLet','Bogen Tödlichkeit']]){
  if(v[id]===undefined||v[id]===''||!Number.isFinite(Number(v[id]))||(id==='cap'&&Number(v[id])<=0))out.push(name);
 }
 if(!Array.isArray(ext.troopTiers)||ext.troopTiers.some(x=>!x?.tier))out.push('T-Stufen');
 if(!Array.isArray(ext.troopTiers)||ext.troopTiers.some(x=>x?.tg===null||x?.tg===undefined||x?.tg===''))out.push('Truegold');
 if((ext.ownHeroes||[]).filter(Boolean).length<3)out.push('Starterhelden');
 return out;
}
function showRelevantManual(){
 const quick=$('uxQuickStart');const folds=sections[5].querySelector('#intakeMissingDetails');
 if(folds)folds.open=true;
 const m=B.model(),v=m.values||{},ext=m.v2||{};
 const missing=missingValues();
 const troopMissing=['troopsI','troopsC','troopsA'].some(k=>!Number.isFinite(Number(v[k]))||v[k]===undefined)
  || !Array.isArray(ext.troopTiers)||ext.troopTiers.some(x=>!x?.tier||x?.tg===null||x?.tg===undefined||x?.tg==='');
 const statsMissing=['iAtk','iLet','cAtk','cLet','aAtk','aLet'].some(k=>v[k]===undefined);
 const capMissing=!(Number(v.cap)>0)||(ext.ownHeroes||[]).filter(Boolean).length<3;
 const blocks=quick?.querySelectorAll('.ux-step')||[];
 blocks.forEach((node,index)=>{node.hidden=index===0?!troopMissing:index===1?!capMissing:!statsMissing;});
 // The final review must NOT re-ask quantities or other already recognized
 // inputs simply because the tier or a different field in the row is missing.
 const ownKeys=['troopsI','troopsC','troopsA'];
 quick?.querySelectorAll('#uxTroopRows .ux-troop-row').forEach((row,i)=>{
  const tier=ext.troopTiers?.[i];
  const amount=row.querySelector('.ux-count');
  const stage=row.querySelector('.ux-tier');
  const gold=row.querySelector('.ux-tg');
  const hasQuantity=Number.isFinite(Number(v[ownKeys[i]]))&&v[ownKeys[i]]!==undefined&&v[ownKeys[i]]!=='';
  if(amount)amount.hidden=hasQuantity;
  if(stage)stage.hidden=Number(tier?.tier)>=1;
  if(gold)gold.hidden=tier?.tg!==null&&tier?.tg!==undefined&&Number(tier.tg)>=0;
  row.hidden=[amount,stage,gold].every(x=>!x||x.hidden);
 });
 quick?.querySelectorAll('#uxStatsRows .ux-stat-row').forEach((row,i)=>{
  const names=[['iAtk','iLet'],['cAtk','cLet'],['aAtk','aLet']][i];
  const atk=row.querySelector('.ux-atk'),lethal=row.querySelector('.ux-let');
  if(atk)atk.hidden=v[names[0]]!==undefined&&v[names[0]]!=='';
  if(lethal)lethal.hidden=v[names[1]]!==undefined&&v[names[1]]!=='';
  row.hidden=(!atk||atk.hidden)&&(!lethal||lethal.hidden);
 });
 const capField=quick?.querySelector('#uxCapLine .ux-cap-input');
 if(capField)capField.hidden=Number(v.cap)>0;
 const ownReady=(ext.ownHeroes||[]).filter(Boolean).length===3;
 const heroLine=quick?.querySelector('#uxHeroLine');
 if(heroLine)heroLine.hidden=ownReady;
 const wrapper=$('bearGuideMissingStatus');
 if(wrapper)wrapper.textContent=missing.length?t().missing+': '+missing.join(' · '):t().allGood;
}
const missingStatus=document.createElement('p');missingStatus.id='bearGuideMissingStatus';missingStatus.className='bear-guide-needed';sections[5].prepend(missingStatus);
// The existing quick setup also contains a prominent duplicate results panel
// inside a collapsed expert block. The real result button has moved to step 7.
const adv=$('uxAdvanced');if(adv){adv.open=false;const s=adv.querySelector('summary');if(s)s.title=t().opt;}
const profilePanel=sections[0].querySelector('section.panel');
if(profilePanel){
 const extra=profilePanel.querySelector('details');if(extra)extra.open=false;
 if(location.hostname.endsWith('.github.io')){
  const button=$('lookupButton');if(button){button.disabled=true;button.title=t().pages;}
 }
}
const processQueue=()=>{
 const review=$('intakeQueue');return Boolean(review&&!review.hidden&&review.children.length);
};
function message(content){$('bearGuideMessage').textContent=content||'';}
function render(){
 const s=t(),idx=active;
 sections.forEach((n,i)=>n.hidden=i!==idx);
 // Both troop & stat & hero steps use the same importer, never three forms.
 if(idx===1||idx===2||idx===4)showIntake(idx);
 window.NRW_BEAR_SCREENSHOT_STAGE=[1,2,4].includes(idx)?idx:null;
 if(idx===5)showRelevantManual();
 if(idx===6&&!finished){
  const engine=window.NRW_BEAR_COMBAT,model=B.model();
  const tiers=engine?.configure(model.v2);
  if(engine?.ready(model.values,tiers)&&Number(B.capacity?.()||0)>0){
   finished=true;
   try{B.optimizeStarter();}catch(_){finished=false;}
  }
 }
 $('bearGuideEyebrow').textContent=s.eyebrow;
 $('bearGuideTitle').textContent=s.start;
 $('bearGuideDesc').textContent=s.desc;
 $('bearGuideStep').textContent=s.progress+' '+(idx+1)+' / '+labels.length;
 $('bearGuideStepTitle').textContent=s.steps[idx];
 $('bearGuidePrompt').textContent=s.prompts[idx];
 $('bearGuideBack').textContent='← '+s.back;
 $('bearGuideSkip').textContent=s.skip;
 $('bearGuideNext').textContent=idx===5?s.finish:idx===6?s.done:s.next+' →';
 $('bearGuideBack').hidden=idx===0;
 $('bearGuideSkip').hidden=idx===0||idx>=5;
 $('bearGuideNext').hidden=idx===6;
 const progress=$('bearGuideTrack');progress.innerHTML='';
 for(let i=0;i<labels.length;i++){const dot=document.createElement('span');dot.className=i<idx?'is-done':i===idx?'is-current':'';dot.style.flex='1';progress.appendChild(dot);}
 if(idx===0){
  $('bearGuideApiHelp').textContent=location.hostname.endsWith('.github.io')?s.pages:'';
  message(hasProfile()?s.profileGood:s.profileMissing);
 }else if(idx===1||idx===2||idx===4){
  const matching=processQueue();
  message(matching?s.review:(imported.has(idx)||modelReady(idx)?s.ready:s.waiting));
 }else if(idx===3)message(imported.has(3)||modelReady(3)?s.ready:s.waiting);
 else if(idx===5)message('');
 else message(s.estimated);
 const next=$('bearGuideNext');
 next.disabled=(idx===0&&!hasProfile())||(idx>=1&&idx<=4&&(processQueue()||(!imported.has(idx)&&!modelReady(idx))));
 if(idx===5||idx===6)next.disabled=false;
 const bodyClass='bear-wizard-mode';document.body.classList.add(bodyClass);
 wizard.scrollIntoView({block:'start',behavior:'instant'});
}
function moveTo(i){
 if(i<0||i>6)return;
 // Discard an unconfirmed review when navigating to a DIFFERENT screenshot
 // category. Never save unreviewed OCR results implicitly.
 if(i!==active&&[1,2,4].includes(active)&&processQueue()){
  $('intakeClear')?.click();
 }
 if(i===0&&active!==0)message('');
 if(i!==6)finished=false;
 active=i;render();
}
$('bearGuideBack').addEventListener('click',()=>moveTo(active-1));
$('bearGuideSkip').addEventListener('click',()=>{if(active>=1&&active<=4){skipped.add(active);moveTo(active+1);}});
$('bearGuideNext').addEventListener('click',()=>{
 if(active===0&&!hasProfile())return;
 if(processQueue())return;
 if(active===5){showRelevantManual();moveTo(6);return;}
 if(active<=5)moveTo(active+1);
});
wizard.addEventListener('input',()=>{
 if(active===0){$('bearGuideNext').disabled=!hasProfile();}
 // Never remove an active capacity field while someone is typing a
 // six-digit squad capacity; its parent refreshes only on committed change.
});
wizard.addEventListener('change',()=>{
 if(active===5)showRelevantManual();
});
window.addEventListener('nrw-bear-loaded',()=>{
 if(active===0){message(t().profileGood);$('bearGuideNext').disabled=false;moveTo(1);}
});
window.addEventListener('nrw-bear-intake-applied',evt=>{
 // Only the currently visible category is considered completed.
 const types=evt.detail?.types||[];
 if(active===1&&types.includes('troops')||active===2&&types.includes('stats')||
   active===4&&(types.includes('starter')||types.includes('roster'))){
  imported.add(active);
  message(t().ready);
  $('bearGuideNext').disabled=false;
  // The hero step accepts several overlapping roster and detail screenshots.
  // Keep the player on step 5 after each confirmation; they can upload the
  // next individual image, or choose Continue when finished.
  if(active===4){
   $('bearGuideNext').textContent=t().next+' →';
   message(document.documentElement.lang==='de'
    ?'Bild gespeichert. Lade das nächste Heldenbild hoch oder fahre fort.'
    :'Screenshot saved. Add the next hero image, or continue.');
   return;
  }
  moveTo(active+1);
 }
});
window.addEventListener('nrw-bear-gear-applied',()=>{
 imported.add(3);if(active===3){message(t().ready);$('bearGuideNext').disabled=false;moveTo(4);}
});
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>{render();}));
render();
window.NRW_BEAR_WIZARD={step:()=>active,goTo:moveTo,missing:missingValues,completed:()=>[...imported],getState:()=>({active,profile:profileMethod(),skipped:[...skipped]})};
})();
