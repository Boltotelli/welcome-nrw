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
  steps:['Dein Profil','Truppen','Kampfwerte','GovGear','Alle Helden','Top 3 Helden','Heldendetails','Pets & Valora · fehlende Angaben','Deine Empfehlung','Schadenssimulation'],
  prompts:['Wähle deine Governor-ID oder lade deine bereits vorhandenen Profildaten.',
   'Lade die Schwadronvorschau hoch. Ein Screenshot reicht. Wir lesen Truppenanzahl und Stufen.',
   'Lade die Bonusübersicht hoch. Bei einer langen Liste einfach mehrere Screenshots nacheinander auswählen.',
   'Ein vollständiges Bild der Gouverneur-Ausrüstung zeigt alle 6 Teile und 18 Talismane.',
   'Lade alle Screenshots deiner gesamten Heldenübersicht hoch. Mehrere Bilder gleichzeitig sind möglich; überlappende Helden werden zusammengeführt.',
   'Auf Basis deiner erfassten Helden schlagen wir dir pro Truppengattung einen Bären-Starter vor. Bitte bestätige die drei Helden.',
   'Verteile dein bestes verfügbares Helden-Gear auf die drei empfohlenen Helden und lasse diese Ausstattung für die Bärenfalle angelegt. Lade DANACH die Heldendetails und Fertigkeiten hoch.',
   'Lade jetzt die Pet- und Valora-Skills hoch und trage Hunter Instinct manuell ein. Danach ergänzen wir nur noch wirklich fehlende Angaben.',
   'Prüfe die vorgeschlagenen Starter- und Join-Formationen mit der gemeinsamen Truppenauslastung.',
   'Teste unterschiedliche Starter- und Join-Verteilungen und vergleiche ihre relative Schadensprognose.'],
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
  steps:['Your profile','Troops','Combat stats','Governor gear','All heroes','Top 3 heroes','Hero details','Pets & Valora · missing values','Your recommendation','Damage simulation'],
  prompts:['Choose your Governor ID or import an existing profile.',
   'Upload your troop overview. One screenshot covers troops and tiers.',
   'Upload the bonuses screen. You can select several screenshots of a long list.',
   'One complete Governor Gear overview contains all 6 items and 18 charms.',
   'Upload ALL screenshots of your hero overview. Select several images together; duplicates across scrolling screenshots are merged.',
   'Based on your roster, review the three proposed Bear Trap rally starters – one per troop class.',
   'Distribute your best available HERO GEAR across all three suggested heroes as you would use it for Bear Trap. THEN upload their detail and skill screenshots.',
   'Upload pet skills and Valora skills; enter Hunter Instinct manually. Then fill only genuinely missing values.',
   'Review the proposed starter and joins with their shared troop inventory.',
   'Experiment with starter and join formations and compare the relative damage forecast.'],
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
  steps:['Profil','Troupes','Stats','Équipement','Tous les héros','Top 3 héros','Détails héros','Pets & Valora · valeurs manquantes','Résultat','Simulation des dégâts'],
  prompts:['Choisis ton ID ou importe un profil existant.','Ajoute une capture des troupes.','Ajoute une ou plusieurs captures des bonus.','Une capture complète des 6 équipements et 18 talismans.','Ajoute toutes les captures de la liste des héros, en une seule sélection.','Vérifie les trois héros recommandés pour l’Ours.',
   'Équipe ces héros avec ton meilleur équipement avant de capturer leurs détails et compétences.','Ajoute les captures de compétences des animaux et de Valora ; saisis le talent puis complète les valeurs manquantes.','Vérifie les formations de départ et les renforts avec les stocks communs.',
   'Teste plusieurs formations et compare leurs dégâts relatifs.'],
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
const sections=[],labels=['id','troops','stats','gear','heroes','hero-picks','hero-details','missing','result','simulation'];
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
sections[7].append(manual);
sections[8].append(result);
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
 if(buttonText)buttonText.textContent='📸 '+(i===1?t().upload:t().uploads);
 const input=$('intakeFiles');if(input)input.multiple=[2,4,6].includes(i);
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
 if(kind===4){const v=B.model().v2||{};return Array.isArray(v.scannedOwnedHeroes)&&
  v.scannedOwnedHeroes.filter(n=>v.manualHeroes?.[n]).length>=3;}
 if(kind===6)return heroDetailsReady();
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
 const quick=$('uxQuickStart');const folds=sections[7].querySelector('#intakeMissingDetails');
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
 // Keep the original bound #cap input but place it in an independent
 // required-value section. The older .ux-step can be hidden by other checks.
 const capField=$('cap')?.closest('.ux-field');
 if(capField&&!capacityHost.contains(capField))capacityHost.insertBefore(capField,capacityHost.firstChild);
 if(capField)capField.hidden=false;
 // Keep a single always-visible squad base input on this same Pet/Valora step.
 capacityHost.hidden=false;
 capacityHost.dataset.caption=lang()==='de'?'Schwadronskapazität berechnen':
  lang()==='fr'?"Calculer la capacité d’escadron":'Calculate squad capacity';
 const capInput=$('cap');
 if(capInput&&!(Number(v.cap)>0)&&capInput.value==='0')capInput.value='';
 capacityUI?.refresh();

 const ownReady=(ext.ownHeroes||[]).filter(Boolean).length===3;
 const heroLine=quick?.querySelector('#uxHeroLine');
 if(heroLine)heroLine.hidden=ownReady;
 const wrapper=$('bearGuideMissingStatus');
 if(wrapper)wrapper.textContent=missing.length?t().missing+': '+missing.join(' · '):t().allGood;
}
const missingStatus=document.createElement('p');missingStatus.id='bearGuideMissingStatus';missingStatus.className='bear-guide-needed';sections[7].prepend(missingStatus);
const buffHost=document.createElement('div');buffHost.id='bearBuffScreenshotHost';
sections[7].prepend(buffHost);
window.NRW_BEAR_BUFF_IMPORT?.mount(buffHost,B);
const formationSetupHost=document.createElement('div');
formationSetupHost.id='bearFormationSetupHost';
sections[7].insertBefore(formationSetupHost,manual);
const formationUI=window.NRW_BEAR_FORMATION_UI?.mount(formationSetupHost,sections[8],B,lang);
// Keep the old provisional estimator accessible but visually secondary.
const legacyResult=document.createElement('details');
legacyResult.className='bear-legacy-result';
const legacyTitle=document.createElement('summary');
legacyTitle.textContent='Advanced / existing model (optional)';
legacyResult.append(legacyTitle);legacyResult.append(result);
sections[8].append(legacyResult);
const simulationUI=window.NRW_BEAR_SIMULATION_UI?.mount(sections[9],B,lang);

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
const advisor=window.NRW_BEAR_HERO_ADVISOR;
const atlas='https://ks-atlas.com/tools/atlas-database/bear-rally-heroes';
const types=['infantry','cavalry','archer'],names={
 de:['Infanterie','Kavallerie','Bogenschützen'],
 en:['Infantry','Cavalry','Archers'],
 fr:['Infanterie','Cavalerie','Archers']
};
const chosenRecommendations=['','',''],detailConfirmed=new Set();
const recommendationPanel=document.createElement('section');
recommendationPanel.className='bear-recommendation-panel';
sections[5].append(recommendationPanel);
const detailPanel=document.createElement('section');
detailPanel.className='bear-recommendation-panel';
sections[6].append(detailPanel);
const capacityHost=document.createElement('section');
capacityHost.id='bearRequiredCapacity';capacityHost.className='bear-required-capacity';
sections[7].insertBefore(capacityHost,manual);
const capacityUI=window.NRW_BEAR_CAPACITY_UI?.mount(capacityHost,B,lang);
function heroResults(){
 const ext=B.model().v2||{},known=window.NRW_BEAR_IMPORTED_HEROES||[];
 // Never treat old API or manual hero cards as verified by this roster scan.
 const owned=new Set(Array.isArray(ext.scannedOwnedHeroes)?ext.scannedOwnedHeroes:[]);
 const restrict=true;
 const roster=new Map();
 for(const h of known)if(h?.name&&(!restrict||owned.has(h.name)))roster.set(h.name,{...h});
 for(const h of Object.values(ext.manualHeroes||{}))if(h?.name&&(!restrict||owned.has(h.name))){
  // A partial screenshot can update a profile without erasing API stars.
  const previous=roster.get(h.name)||{};
  roster.set(h.name,{...previous,...h});
 }
 return advisor?.recommend([...roster.values()],window.NRW_BEAR_CATALOG?.heroTypes,
  window.NRW_BEAR_INTAKE_CORE?.rankByType)||[];
}
function selections(){
 const groups=heroResults();
 return groups.map((group,i)=>
  group.choices.some(x=>x.name===chosenRecommendations[i])
   ?chosenRecommendations[i]
   :group.best?.name||'');
}
function recommendationsReady(){return selections().length===3&&selections().every(Boolean);}
function heroDetailsReady(){
 const m=B.model().v2||{},selected=(m.ownHeroes||[]).filter(Boolean);
 // Detail screenshots are required AFTER the suggested three have been
 // equipped with their best simultaneous Hero Gear. Do not accept earlier
 // cached statistics as evidence that this gear-first step was completed.
 return selected.length===3&&selected.every(n=>detailConfirmed.has(n));
}
function renderRecommendations(){
 recommendationPanel.innerHTML='';
 const l=lang(),groups=heroResults(),groupNames=names[l]||names.en;
 const intro=document.createElement('p');intro.className='hint';
 intro.textContent=l==='de'?
  'Nur deine erkannten, besessenen Helden: je ein Rally-Starter pro Truppengattung. Sterne, Level und freigeschaltete Skills wiegen stärker als die Bear-Meta-Reihenfolge. Atlas-orientierter Vergleich, KEINE offizielle Schadenssimulation.':
  l==='fr'?'Un héros possédé par classe. Étoiles, niveaux et compétences priment sur la popularité du guide. Estimation indicative, PAS une simulation KS Atlas.':
  'Your scanned owned heroes only: one provisional leader per class. Heuristic ranking; verified GitHub data below is shown independently, NOT as calculated Bear damage.';
 recommendationPanel.append(intro);
 const reference=window.NRW_BEAR_HERO_REFERENCE;
 const refState=reference?.status?.()||'unavailable';
 if(refState==='idle')reference.load().then(()=>{
  if(active===5)renderRecommendations();
 });
 const sourceNotice=document.createElement('p');sourceNotice.className='hint bear-reference-status';
 sourceNotice.textContent=refState==='ready'?
  (l==='de'?'✓ 37 quellengeprüfte Helden aus dem separaten GitHub-Repository. Die Rangfolge ist weiterhin eine vorläufige Heuristik.':
   l==='fr'?'✓ 37 références de héros vérifiées depuis GitHub. Classement indicatif.':
   '✓ 37 source-checked heroes from separate GitHub. Shortlist remains heuristic.'):
  refState==='loading'||refState==='idle'?
  (l==='de'?'Heldenreferenzen werden geladen …':l==='fr'?'Chargement des données héros …':'Loading hero references …'):
  (l==='de'?'Referenzdaten nicht verfügbar. Vorläufige Rangfolge bleibt bestehen.':
   l==='fr'?'Données indisponibles : classement provisoire conservé.':
   'Source unavailable; provisional shortlist remains.');
 recommendationPanel.append(sourceNotice);
 const ext=B.model().v2||{},scanned=new Set(ext.scannedOwnedHeroes||[]);
 const unresolved=Object.values(ext.manualHeroes||{})
  .filter(h=>h?.name&&scanned.has(h.name)&&h.starPendingReview).length;
 if(unresolved){
  const warning=document.createElement('p');warning.className='bear-guide-needed';
  warning.textContent=l==='de'?
   'Noch '+unresolved+' Held(en) mit ungeprüften Sternen. Diese Helden werden im Ranking vorsichtig behandelt. Gehe zurück, wenn du die Sternstufen bestätigen möchtest.':
   l==='fr'?
   'Étoiles non vérifiées pour '+unresolved+' héros. Ils sont évalués prudemment ; reviens les confirmer.':
   unresolved+' heroes have unverified stars. They are conservatively ranked. Go back to confirm their stars before relying on this shortlist.';
  recommendationPanel.append(warning);
 }
 const refs=document.createElement('p');refs.className='bear-guide-sources';
 const atlasLink=document.createElement('a');atlasLink.href=atlas;atlasLink.target='_blank';atlasLink.rel='noopener noreferrer';atlasLink.textContent='KS Atlas · Bear Rally Heroes';
 const guideLink=document.createElement('a');guideLink.href=advisor?.supportingGuide||'https://kingshotguides.com/guide/bear-hunt-expert-guide/';
 guideLink.target='_blank';guideLink.rel='noopener noreferrer';guideLink.textContent=l==='de'?'Ergänzender Guide':l==='fr'?'Guide complémentaire':'Supporting guide';
 refs.append(atlasLink,guideLink);recommendationPanel.append(refs);
 groups.forEach((group,i)=>{
  const card=document.createElement('div');card.className='bear-recommendation-card';
  const heading=document.createElement('strong');heading.textContent=['🛡️ ','🐴 ','🏹 '][i]+groupNames[i];
  card.append(heading);
  if(!group.choices.length){
   const empty=document.createElement('p');empty.className='bear-guide-needed';
   empty.textContent=l==='de'?'Kein eingescannter und zugeordneter Held dieser Gattung. Gehe zurück zur Heldenübersicht.':
    l==='fr'?'Aucun héros identifié de cette classe. Reviens à la liste des héros.':
    'No recognized scanned hero for this class. Return to the hero overview.';
   card.append(empty);
  }else{
   const chosen=group.choices.find(x=>x.name===chosenRecommendations[i])||group.best;
   const portrait=window.NRW_BEAR_CATALOG?.heroes?.find(h=>h.name===chosen.name)?.img;
   const summary=document.createElement('div');summary.className='bear-leader-summary';
   if(portrait){
    const img=document.createElement('img');img.src=portrait;img.alt='';img.loading='lazy';
    img.className='bear-recommendation-portrait';summary.append(img);
   }
   const info=document.createElement('div');
   const name=document.createElement('b');name.textContent=chosen.name;
   const data=document.createElement('p');data.className='hint';
   data.textContent=(chosen.level?'Lv '+chosen.level:'Lv ?')+' · '+
    (chosen.stars?chosen.stars+'★'+(chosen.tier?' T'+chosen.tier:''):'★ ?')+
    ' · '+(chosen.skillCap?'Skill-Max '+chosen.skillCap:'Skill ?')+
    (chosen.assumedSkill?' ('+(l==='de'?'nur maximal möglich':l==='fr'?'non confirmé':'not verified')+')':'');
   info.append(name,data);summary.append(info);card.append(summary);
   // Independent DATA, not another fabricated damage score.
   const verified=reference?.get?.(chosen.name,chosen.stars,chosen.tier);
   if(verified){
    const fact=document.createElement('p');fact.className='bear-reference-fact';
    const pct=verified.bonus===null?'—':verified.bonus.toLocaleString(
     l==='de'?'de-DE':l==='fr'?'fr-FR':'en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' %';
    fact.textContent=l==='de'?
     'Quellenwert Expedition ATK/DEF: '+pct+
      (verified.sourceRow?' · Tabellenzeile '+verified.sourceRow:' · Sternwert unbestätigt'):
     l==='fr'?'Bonus ATQ/DEF expédition (source) : '+pct:
     'Source expedition ATK/DEF: '+pct+
      (verified.sourceRow?' · row '+verified.sourceRow:' · stars not verified');
    card.append(fact);
    const detail=document.createElement('details');detail.className='bear-reference-skill-panel';
    const summary=document.createElement('summary');
    summary.textContent=l==='de'?'Geprüfte Expedition-Skills ansehen':
     l==='fr'?'Voir les compétences vérifiées':'Inspect verified expedition skills';
    detail.append(summary);
    const explanation=document.createElement('p');explanation.className='hint';
    explanation.textContent=l==='de'?
     'Skillwerte von Stufe 1 bis 5 aus der Quelle – NICHT dein tatsächliches Skilllevel. Keine berechnete Bärenschadenswirkung.':
     l==='fr'?'Valeurs source des niveaux 1–5, non vos niveaux investis ; dégâts non calculés.':
     'Source skill values levels 1–5, NOT actual invested levels. No Bear damage formula.';
    detail.append(explanation);
    const list=document.createElement('ul');
    for(const skill of verified.skills){
     const line=document.createElement('li');
     line.textContent=skill.name+' · '+skill.min+' → '+skill.max+
      (skill.metric==='percent'?' %':'')+' ('+skill.effect.replaceAll('_',' ')+')';
     list.append(line);
    }
    detail.append(list);
    const href=document.createElement('a');href.href=verified.source;
    href.target='_blank';href.rel='noopener noreferrer';
    href.textContent=l==='de'?'Originalquelle aufrufen':l==='fr'?'Source primaire':'Open original source';
    detail.append(href);card.append(detail);
   }
   const second=group.choices.find(x=>x.name!==chosen.name);
   if(second){
    const reason=document.createElement('p');reason.className='hint bear-recommendation-reason';
    if(chosen.stars!==null&&second.stars!==null&&chosen.stars>=second.stars+2){
     reason.textContent=l==='de'?
      chosen.stars+'★ statt '+second.stars+'★ bei '+second.name+
      ': Ein schwach entwickelter Meta-Held verdrängt keinen gut ausgebauten Starter.':
      l==='fr'?'Meilleure progression : '+chosen.stars+'★ contre '+second.stars+'★ ('+second.name+').':
      'More developed: '+chosen.stars+'★ vs '+second.stars+'★ ('+second.name+'). A low-star meta hero does not automatically win.';
    }else{
     reason.textContent=l==='de'?
      'Im Vergleich zu '+second.name+' werden Sterne, Level, Skill-Potenzial und Rollenempfehlung berücksichtigt.':
      l==='fr'?'Comparé à '+second.name+' : étoiles, niveau, compétences et rôle.':
      'Compared to '+second.name+': stars, level, skills and Bear role preference.';
    }
    card.append(reason);
   }
   if(chosen.bearCaution){
    const note=document.createElement('p');note.className='bear-guide-needed';
    note.textContent=l==='de'?'Für Bären-Rallys eher ein Ersatzheld als eine offensive Empfehlung.':
     l==='fr'?'Pour l’Ours, c’est plutôt un héros de remplacement qu’un choix offensif.':
     'Usually a fallback for Bear rallies rather than an offensive specialist.';
    card.append(note);
   }
   if(group.choices.length>1){
    const more=document.createElement('details');
    const caption=document.createElement('summary');caption.textContent=l==='de'?'Alternative auswählen':l==='fr'?'Choisir une alternative':'Choose another hero';
    const select=document.createElement('select');select.setAttribute('aria-label',groupNames[i]);
    group.choices.forEach(h=>{
     const opt=document.createElement('option');opt.value=h.name;
     const sourceValue=reference?.get?.(h.name,h.stars,h.tier)?.bonus;
     opt.textContent=h.name+' · '+(h.stars?h.stars+'★':'★ ?')+
      (h.tier?' T'+h.tier:'')+' · '+(h.level?'Lv '+h.level:'Lv ?')+
      (Number.isFinite(sourceValue)?' · Exp ATK '+sourceValue.toFixed(2)+' %':'');
     opt.selected=h.name===chosen.name;select.append(opt);
    });
    select.addEventListener('change',()=>{chosenRecommendations[i]=select.value;renderRecommendations();});
    more.append(caption,select);card.append(more);
   }
  }
  recommendationPanel.append(card);
 });
 const hint=document.createElement('p');hint.className='hint';
 hint.textContent=l==='de'?
  'Die Sterne zeigen nur das Skill-Maximum, nicht den tatsächlichen Ausbau. Bestätige die drei Helden mit „Weiter“. Im nächsten Schritt verteilst du das beste Hero-Gear auf alle drei und fotografierst danach ihre Detailseiten.':
 l==='fr'?'Les étoiles donnent le niveau maximum de compétence, pas les améliorations réellement effectuées. Confirme tes trois héros, puis équipe-les avant de faire les captures.':
 'Stars indicate possible skill caps, not verified upgrades. Confirm the three heroes; equip all three before taking their detail screenshots in the next step.';
 recommendationPanel.append(hint);
 const btn=$('bearGuideNext');
 if(active===5&&btn)btn.disabled=!recommendationsReady();
}
function confirmRecommendedHeroes(){
 const selectionsNow=selections();
 if(selectionsNow.length!==3||selectionsNow.some(n=>!n))return;
 const model=B.model();model.v2=model.v2||{};
 model.v2.ownHeroes=selectionsNow;
 detailConfirmed.clear();
 if(model.marches?.[0])model.marches[0].hero=selectionsNow.join(' / ');
 B.save();B.render();window.NRW_BEAR_ENHANCE?.refreshHeroes?.();
 imported.add(5);moveTo(6);
}
function renderHeroDetails(){
 const l=lang(),chosen=B.model().v2?.ownHeroes||[];
 detailPanel.innerHTML='';
 const reminder=document.createElement('p');reminder.className='bear-gear-reminder';
 reminder.textContent=l==='de'?
  'WICHTIG: Verteile zuerst dein BESTES HELDEN-GEAR gleichzeitig auf ALLE DREI ausgewählten Helden, wie du sie zusammen bei der Bärenfalle einsetzt. Ausrüstung zwischen den drei Screenshots NICHT umziehen!':
 l==='fr'?
  'IMPORTANT : répartis ton MEILLEUR équipement simultanément sur les TROIS héros. Ne change pas l’équipement entre les captures.':
  'IMPORTANT: Distribute your BEST HERO GEAR across ALL THREE heroes SIMULTANEOUSLY, as they will fight together in Bear Trap. Do NOT move gear between screenshots.';
 detailPanel.append(reminder);
 const list=document.createElement('div');list.className='bear-gear-hero-list';
 const catalog=window.NRW_BEAR_CATALOG?.heroes||[];
 chosen.forEach((n,i)=>{
  if(!n)return;
  const item=document.createElement('div');item.className='bear-gear-hero-item';
  const art=catalog.find(h=>h.name===n)?.img;
  if(art){const img=document.createElement('img');img.src=art;img.alt='';img.loading='lazy';item.append(img);}
  const line=document.createElement('span');line.textContent=(detailConfirmed.has(n)?'✓ ':'📸 ')+(names[l]||names.en)[i]+' · '+n;
  item.append(line);
  // Dedicated expedition WIDGET level, not an extra hero-stat input.
  // Manual values are stored independently of the screenshot OCR hero object.
  const wLabel=document.createElement('label');wLabel.className='bear-widget-manual';
  const wText=document.createElement('span');
  wText.textContent=l==='de'?'Widget-Level (Fähigkeit)':l==='fr'?'Widget niveau (compétence)':'Widget level (skill only)';
  const wSelect=document.createElement('select');wSelect.setAttribute('aria-label',n+' Widget');
  const empty=document.createElement('option');empty.value='';empty.textContent='—';wSelect.append(empty);
  for(let lv=0;lv<=10;lv++){const opt=document.createElement('option');opt.value=String(lv);opt.textContent=lv===0?'0 · kein Widget':'Lv '+lv;wSelect.append(opt);}
  const v2=B.model().v2||{},saved=v2.starterWidgetLevels?.[n];
  const scanned=v2.manualHeroes?.[n]?.widget;
  wSelect.value=saved!==undefined&&saved!==null?String(saved):
    Number(scanned)>0?String(scanned):'';
  wSelect.addEventListener('change',()=>{
   const model=B.model();model.v2=model.v2||{};
   model.v2.starterWidgetLevels=model.v2.starterWidgetLevels||{};
   if(wSelect.value==='')delete model.v2.starterWidgetLevels[n];
   else model.v2.starterWidgetLevels[n]=Number(wSelect.value);
   B.save();
  });
  wLabel.append(wText,wSelect);item.append(wLabel);list.append(item);
 });
 detailPanel.append(list);
 const foot=document.createElement('p');foot.className='hint bear-gear-shot-note';
 foot.textContent=l==='de'?
  'ERST DANACH: Öffne die drei Heldendetailseiten und mache jeweils EINEN Screenshot. Lade diese drei Bilder zusammen hoch, überprüfe die Zuordnung und tippe auf „Übernehmen“.':
 l==='fr'?
  'ENSUITE : ouvre les trois pages de détails et prends UNE capture par héros. Charge les trois images ensemble et confirme.':
  'ONLY THEN: open each hero’s detail page and take ONE screenshot per hero. Upload all THREE screenshots together, review and tap Apply.';
 detailPanel.append(foot);
 const widgetFoot=document.createElement('p');widgetFoot.className='hint';
 widgetFoot.textContent=l==='de'?
  'Widget-Level bei jedem Starter bitte manuell wählen (0 = keines). Wir berücksichtigen ausschließlich belegte offensiv wirksame Expedition-Widget-Fähigkeiten, keine zusätzlichen Gear-Stats. Unbekannte Effekte werden nicht geschätzt.':
 l==='fr'?
  'Saisis le niveau du Widget (0 = aucun). Seules les compétences d’expédition offensives vérifiées comptent, sans ajouter les statistiques déjà présentes.':
  'Enter each starter Widget level (0 = none). Only verified offensive expedition widget abilities are counted, not widget gear stats already in your combat stats.';
 detailPanel.append(widgetFoot);
}
function render(){
 const s=t(),idx=active;
 sections.forEach((n,i)=>n.hidden=i!==idx);
 // Both troop & stat & hero steps use the same importer, never three forms.
 if([1,2,4,6].includes(idx))showIntake(idx);
 window.NRW_BEAR_SCREENSHOT_STAGE=[1,2,4,6].includes(idx)?idx:null;
 if(idx===5)renderRecommendations();
 if(idx===6)renderHeroDetails();
 if(idx===7){showRelevantManual();formationUI?.refreshSetup();}
 if(idx===8){formationUI?.show();}
 if(idx===9){simulationUI?.enter();}
 $('bearGuideEyebrow').textContent=s.eyebrow;
 $('bearGuideTitle').textContent=s.start;
 $('bearGuideDesc').textContent=s.desc;
 $('bearGuideStep').textContent=s.progress+' '+(idx+1)+' / '+labels.length;
 $('bearGuideStepTitle').textContent=s.steps[idx];
 $('bearGuidePrompt').textContent=s.prompts[idx];
 $('bearGuideBack').textContent='← '+s.back;
 $('bearGuideSkip').textContent=s.skip;
 $('bearGuideNext').textContent=idx===7?s.finish:idx===9?s.done:s.next+' →';
 $('bearGuideBack').hidden=idx===0;
 $('bearGuideSkip').hidden=idx===0||idx===5||idx>=7;
 $('bearGuideNext').hidden=idx===9;
 const progress=$('bearGuideTrack');progress.innerHTML='';
 for(let i=0;i<labels.length;i++){const dot=document.createElement('span');dot.className=i<idx?'is-done':i===idx?'is-current':'';dot.style.flex='1';progress.appendChild(dot);}
 if(idx===0){
  $('bearGuideApiHelp').textContent=location.hostname.endsWith('.github.io')?s.pages:'';
  message(hasProfile()?s.profileGood:s.profileMissing);
 }else if([1,2,4,6].includes(idx)){
  const matching=processQueue();
  message(matching?s.review:(imported.has(idx)||modelReady(idx)?s.ready:s.waiting));
 }else if(idx===3)message(imported.has(3)||modelReady(3)?s.ready:s.waiting);
 else if(idx===5||idx===7)message('');
 else message(s.estimated);
 const next=$('bearGuideNext');
 next.disabled=(idx===0&&!hasProfile())||
  ([1,2,3,4].includes(idx)&&(processQueue()||(!imported.has(idx)&&!modelReady(idx))))||
  (idx===6&&(processQueue()||!heroDetailsReady()))||
  (idx===5&&!recommendationsReady());
 if(idx>=7)next.disabled=false;
 const bodyClass='bear-wizard-mode';document.body.classList.add(bodyClass);
 wizard.scrollIntoView({block:'start',behavior:'instant'});
}
function moveTo(i){
 if(i<0||i>9)return;
 // Discard an unconfirmed review when navigating to a DIFFERENT screenshot
 // category. Never save unreviewed OCR results implicitly.
 if(i!==active&&[1,2,4,6].includes(active)&&processQueue()){
  $('intakeClear')?.click();
 }
 if(i===0&&active!==0)message('');
 if(i<8)finished=false;
 active=i;render();
}
$('bearGuideBack').addEventListener('click',()=>moveTo(active-1));
$('bearGuideSkip').addEventListener('click',()=>{if([1,2,3,4,6].includes(active)){skipped.add(active);moveTo(active+1);}});
$('bearGuideNext').addEventListener('click',()=>{
 if(active===0&&!hasProfile())return;
 if(processQueue())return;
 if(active===5){confirmRecommendedHeroes();return;}
 if(active===7){showRelevantManual();moveTo(8);return;}
 if(active===8){moveTo(9);return;}
 if(active<=7)moveTo(active+1);
});
wizard.addEventListener('input',()=>{
 if(active===0){$('bearGuideNext').disabled=!hasProfile();}
 if(active===7)capacityUI?.refresh();
 // Do not move or detach the bound capacity input while typing.
});
window.addEventListener('nrw-bear-buffs-applied',()=>{
 if(active===7)capacityUI?.refresh();
});
wizard.addEventListener('change',()=>{
 if(active===7)showRelevantManual();
});
window.addEventListener('nrw-bear-loaded',()=>{
 imported.clear();skipped.clear();finished=false;detailConfirmed.clear();chosenRecommendations.fill('');
 if(active===0){message(t().profileGood);$('bearGuideNext').disabled=false;moveTo(1);}
});
window.addEventListener('nrw-bear-intake-applied',evt=>{
 // Only the currently visible category is considered completed.
 const types=evt.detail?.types||[];
 if(active===1&&types.includes('troops')||active===2&&types.includes('stats')||
   active===4&&types.includes('roster')||active===6&&types.includes('starter')){
  imported.add(active);
  message(t().ready);
  $('bearGuideNext').disabled=false;
  // The hero overview can contain several files in one confirmed batch.
  // Once all three classes are represented, switch to Top 3 immediately.
  // Hero DETAIL imports remain on the same step until all three are ready.
  if(active===4||active===6){
   if(active===4){
    // The user just confirmed ALL screenshots in the current batch.
    // Once each class has a scanned hero, show their TOP 3 now rather
    // than presenting the same "upload all heroes" screen again.
    if(recommendationsReady()){moveTo(5);return;}
    message(document.documentElement.lang==='de'
     ?'Noch nicht alle drei Truppengattungen erkannt. Ergänze die fehlenden Helden oder korrigiere die Namen.'
     :'Not all three troop classes were recognized. Add missing heroes or correct their names.');
    return;
   }
   if(active===6){
    const accepted=evt.detail?.names||[];
    // An import batch is confirmed AFTER intake clears its queue. Once
    // every selected hero has a confirmed detail shot, automatically move
    // to Missing Values (Step 8), just like roster -> Top 3.
    // Previously three green checks were visible while Continue remained
    // disabled, stranding the user on Step 7.
    accepted.forEach(n=>detailConfirmed.add(n));
    if(heroDetailsReady()){moveTo(7);return;}
    renderHeroDetails();
    $('bearGuideNext').disabled=true;
   }
   $('bearGuideNext').textContent=t().next+' →';
   message(document.documentElement.lang==='de'
    ?'Bild gespeichert. Lade weitere Bilder dieses Schritts hoch oder fahre fort.'
    :'Screenshot saved. Add more images for this step, or continue.');
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
