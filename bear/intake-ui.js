/* NRW Bear screenshot wizard — all OCR runs on the player's own device.
 * The only remote traffic is on-demand Tesseract.js code and language data.
 * Screenshot pixels are NEVER sent to a remote API. User confirmation
 * precedes ALL modifications to persistent player data.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE,Core=window.NRW_BEAR_INTAKE_CORE,cat=window.NRW_BEAR_CATALOG,TROOP=window.NRW_BEAR_TROOP_BADGES,ENTRY=window.NRW_BEAR_TROOP_ENTRIES,MATCHER=window.NRW_BEAR_PORTRAIT_MATCHER,HERO_LEVEL=window.NRW_BEAR_HERO_LEVEL;
const restricted=document.getElementById('restricted'),quick=document.getElementById('uxQuickStart');
if(!B||!Core||!cat||!restricted||!quick)return;
const locale=()=>document.documentElement.lang||'de';
const isDe=()=>locale()==='de';
const intakeTranslations={fr:{"Screenshots instead of typing":"Captures d’écran au lieu de saisir","Choose multiple troop, combat and hero screenshots at once. Review all values before saving.":"Sélectionne plusieurs captures des troupes, statistiques et héros. Vérifie les données avant de les enregistrer.","Select screenshots":"Choisir les captures","GovGear screenshot":"Capture de l’équipement","Screenshots stay on-device. OCR libraries download once and run locally.":"Les captures restent sur ton appareil. La reconnaissance est téléchargée puis fonctionne localement.","Apply reviewed values":"Valider les données vérifiées","Discard":"Ignorer","Missing values / settings":"Données manquantes / paramètres","GovGear & charms – review":"Vérifier équipement et talismans","Choose saved player":"Choisir un joueur enregistré","Open saved profile":"Ouvrir le profil enregistré","Player name for this ID":"Nom du joueur pour cet ID","Save name":"Enregistrer le nom","Select saved player":"Sélectionner un joueur enregistré","Saved profiles on this device. This does not recheck alliance membership.":"Profils enregistrés sur cet appareil ; l’appartenance à l’alliance n’est pas revérifiée.","Preparing OCR …":"Préparation de la reconnaissance …","Reading images locally":"Lecture locale des images","Skip":"Ignorer","Stars unknown":"Étoiles inconnues","All detected troop entries, including repeated troop classes. Check every quantity separately; tier/TG recognition follows.":"Toutes les troupes détectées, y compris les classes répétées. Vérifie chaque quantité. Les niveaux T/TG suivent.","Not recognized":"Non reconnu"," · amount recognized, verify entry":" · quantité détectée, à vérifier","Troop badge tiers – please verify":"Niveaux des insignes de troupes · à vérifier","T?":"T ?","TG?":"TG ?","image guess · review":"estimation visuelle · à vérifier","Gold badge unrecognized":"Insigne doré non reconnu","Hero name":"Nom du héros","Select a hero to review its four expedition percentage fields.":"Choisis un héros pour vérifier ses quatre pourcentages d’expédition.","Attack":"Attaque","Defense":"Défense","Health":"Santé","Lethality":"Létalité","Conflicting OCR – check screenshot":"OCR contradictoire · vérifie la capture","overlapping cards cross-checked":"cartes en doublon vérifiées","Portrait references not loaded":"Références des portraits indisponibles","portrait references loaded":"références de portraits chargées","Unknown hero":"Héros inconnu","Correct recognition":"Corriger la reconnaissance","Review level / missing details":"Vérifier niveau / données manquantes","Image matched to reference – check the name":"Image comparée à la référence · vérifie le nom","Portrait unconfirmed":"Portrait non confirmé","Suggested level – please verify":"Niveau suggéré · vérifie","Suggested stars ":"Étoiles suggérées ","Uncertain stars – please select":"Étoiles incertaines · sélectionne","Confirm suggested stars":"Confirmer les étoiles","GovGear uses the dedicated visual gear importer.":"L’équipement est lu par son importateur dédié.","Screenshot type unknown. Select a type or skip.":"Type de capture inconnu. Choisis un type ou ignore l’image.","Potentially better Bear starters":"Possibles meilleurs chefs contre l’ours","required values":"valeurs requises","Missing: ":"Manquant : ","Troop tiers still needed in details.":"Il manque les niveaux de troupes dans les détails.","Base values present; model ready.":"Valeurs de base complètes ; modèle prêt.","values saved locally. Unknown values untouched.":"valeurs enregistrées localement. Les inconnues restent inchangées.","Import discarded.":"Importation abandonnée.","screenshots read. Review and apply suggestions.":"captures lues. Vérifie et applique les suggestions."},es:{"Screenshots instead of typing":"Capturas en lugar de escribir","Choose multiple troop, combat and hero screenshots at once. Review all values before saving.":"Selecciona varias capturas de tropas, estadísticas y héroes. Comprueba los datos antes de guardarlos.","Select screenshots":"Elegir capturas","GovGear screenshot":"Captura del equipo del gobernador","Screenshots stay on-device. OCR libraries download once and run locally.":"Las capturas permanecen en tu dispositivo. El OCR se descarga una vez y funciona localmente.","Apply reviewed values":"Aplicar valores comprobados","Discard":"Descartar","Missing values / settings":"Datos pendientes / ajustes","GovGear & charms – review":"Revisar equipo y talismanes","Choose saved player":"Elegir jugador guardado","Open saved profile":"Abrir perfil guardado","Player name for this ID":"Nombre del jugador para este ID","Save name":"Guardar nombre","Select saved player":"Seleccionar jugador guardado","Saved profiles on this device. This does not recheck alliance membership.":"Perfiles guardados en este dispositivo; no se vuelve a verificar la alianza.","Preparing OCR …":"Preparando reconocimiento …","Reading images locally":"Leyendo imágenes localmente","Skip":"Omitir","Stars unknown":"Estrellas desconocidas","All detected troop entries, including repeated troop classes. Check every quantity separately; tier/TG recognition follows.":"Todas las tropas detectadas, incluso los tipos repetidos. Comprueba cada cantidad. Los niveles T/TG se revisan después.","Not recognized":"No reconocido"," · amount recognized, verify entry":" · cantidad reconocida; revisar","Troop badge tiers – please verify":"Niveles de insignias de tropa · comprobar","T?":"¿T?","TG?":"¿TG?","image guess · review":"estimación visual · comprobar","Gold badge unrecognized":"Insignia dorada no reconocida","Hero name":"Nombre del héroe","Select a hero to review its four expedition percentage fields.":"Selecciona un héroe para revisar sus cuatro porcentajes de expedición.","Attack":"Ataque","Defense":"Defensa","Health":"Salud","Lethality":"Letalidad","Conflicting OCR – check screenshot":"OCR contradictorio · revisa la captura","overlapping cards cross-checked":"cartas duplicadas comprobadas","Portrait references not loaded":"Referencias de retratos no cargadas","portrait references loaded":"referencias de retratos cargadas","Unknown hero":"Héroe desconocido","Correct recognition":"Corregir reconocimiento","Review level / missing details":"Revisar nivel / datos pendientes","Image matched to reference – check the name":"Imagen comparada con la referencia · comprueba el nombre","Portrait unconfirmed":"Retrato sin confirmar","Suggested level – please verify":"Nivel sugerido · comprueba","Suggested stars ":"Estrellas sugeridas ","Uncertain stars – please select":"Estrellas inciertas · selecciona","Confirm suggested stars":"Confirmar estrellas sugeridas","GovGear uses the dedicated visual gear importer.":"El equipo se reconoce mediante su importador visual específico.","Screenshot type unknown. Select a type or skip.":"Tipo de captura desconocido. Selecciona uno u omite la imagen.","Potentially better Bear starters":"Posibles mejores líderes para el oso","required values":"valores obligatorios","Missing: ":"Falta: ","Troop tiers still needed in details.":"Faltan niveles de tropas en los detalles.","Base values present; model ready.":"Datos básicos completos; modelo listo.","values saved locally. Unknown values untouched.":"valores guardados localmente. Los desconocidos no se modifican.","Import discarded.":"Importación descartada.","screenshots read. Review and apply suggestions.":"capturas leídas. Comprueba y aplica las sugerencias."}};
const say=(de,en)=>{
 const l=locale();
 return l==='de'?de:l==='fr'?(intakeTranslations.fr[en]||en):
  l==='es'?(intakeTranslations.es[en]||en):en;
};
const $=id=>document.getElementById(id);
const typeTranslations={
 de:{troops:'🪖 Truppen',stats:'📊 Kampfstats',starter:'⚔️ Starter-Details',roster:'🃏 Heldenübersicht',gear:'🛡️ GovGear',unknown:'❓ Unbekannt'},
 en:{troops:'🪖 Troops',stats:'📊 Combat stats',starter:'⚔️ Hero details',roster:'🃏 Heroes',gear:'🛡️ Governor gear',unknown:'❓ Unknown'},
 fr:{troops:'🪖 Troupes',stats:'📊 Stats de combat',starter:'⚔️ Détails du héros',roster:'🃏 Héros',gear:'🛡️ Équipement',unknown:'❓ Inconnu'},
 es:{troops:'🪖 Tropas',stats:'📊 Estadísticas',starter:'⚔️ Detalles del héroe',roster:'🃏 Héroes',gear:'🛡️ Equipo',unknown:'❓ Desconocido'}
};
const captions={troopsI:'Infanterie',troopsC:'Kavallerie',troopsA:'Bogenschützen',
 iAtk:'Infanterie Angriff',iLet:'Infanterie Tödlichkeit',cAtk:'Kavallerie Angriff',cLet:'Kavallerie Tödlichkeit',
 aAtk:'Bogenschützen Angriff',aLet:'Bogenschützen Tödlichkeit',
 squadAtk:'Schwadron Angriff',squadLet:'Schwadron Tödlichkeit',
 squadDef:'Schwadron Verteidigung',squadHp:'Schwadron Gesundheit',
 iDef:'Infanterie Verteidigung',iHp:'Infanterie Gesundheit',
 cDef:'Kavallerie Verteidigung',cHp:'Kavallerie Gesundheit',
 aDef:'Bogenschützen Verteidigung',aHp:'Bogenschützen Gesundheit'};
const required=['troopsI','troopsC','troopsA','iAtk','iLet','cAtk','cLet','aAtk','aLet'];
const shell=document.createElement('section');shell.className='panel bear-intake-wizard';shell.id='bearIntakeWizard';
shell.innerHTML='<div class="bear-intake-header"><span class="micro">NRW · BEAR TRAP</span><h2>📸 '+say('Screenshots statt Eingabe','Screenshots instead of typing')+'</h2>'+
 '<p class="hint">'+say('Alle Bilder gleichzeitig auswählen – auch mehrere Stats- und Helden-Screenshots. Werte werden zusammengeführt und vor dem Speichern geprüft.','Choose multiple troop, combat and hero screenshots at once. Review all values before saving.')+'</p>'+
 '<div class="bear-intake-pickers"><label class="primary" id="intakePicker"><span>📂 '+say('Screenshots auswählen','Select screenshots')+'</span><input id="intakeFiles" type="file" accept="image/*" multiple hidden></label>'+
 '<button type="button" class="secondary-btn" id="intakeGear">🛡️ '+say('GovGear-Screenshot','GovGear screenshot')+'</button></div>'+
 '<p class="hint">🔒 '+say('Bilder bleiben lokal. OCR läuft auf deinem Gerät; dafür wird die Erkennungssoftware beim ersten Mal geladen.','Screenshots stay on-device. OCR libraries download once and run locally.')+'</p>'+
 '<div id="intakeStatus" role="status" aria-live="polite"></div></div>'+
 '<div id="intakeQueue" class="bear-intake-queue" hidden></div>'+
 '<div class="bear-intake-actions" id="intakeApplyRow" hidden><button class="primary" type="button" id="intakeApply">✓ '+say('Geprüfte Angaben übernehmen','Apply reviewed values')+'</button><button class="secondary-btn" type="button" id="intakeClear">'+say('Verwerfen','Discard')+'</button></div>'+
 '<div class="bear-intake-progress"><strong id="intakeProgress"></strong><span id="intakeMissing" class="hint"></span></div>'+
 '<div id="intakeAdvice" class="bear-intake-advice"></div>'+
 '<div id="intakeResultSlot"></div>';
restricted.insertBefore(shell,quick);
const missingDetails=document.createElement('details');missingDetails.id='intakeMissingDetails';missingDetails.className='bear-intake-missing';
const missingSummary=document.createElement('summary');missingSummary.textContent='✏️ '+say('Fehlende Werte / Einstellungen','Missing values / settings');
missingDetails.appendChild(missingSummary);quick.before(missingDetails);missingDetails.appendChild(quick);
const optimizeBox=document.querySelector('.bear-optimize-box');if(optimizeBox) $('intakeResultSlot').appendChild(optimizeBox);
const gear=document.querySelector('.bear-import-card');
if(gear){const gearDetails=document.createElement('details');gearDetails.className='bear-intake-gear-details';gearDetails.innerHTML='<summary>🛡️ '+say('GovGear & Talismane – Import prüfen','GovGear & charms – review')+'</summary>';gear.before(gearDetails);gearDetails.appendChild(gear);}
$('intakeGear').addEventListener('click',()=>{
 const d=gear?.closest('details');if(d)d.open=true;
 document.getElementById('bearGearPhoto')?.click();
});
// Re-entry dropdown: labels are local-only and IDs remain the unique key.
const governorInput=$('governorId'),lookup=$('lookupForm');
if(governorInput&&lookup){
 const localRow=document.createElement('div');localRow.className='bear-local-id-row';
 const savedPick=document.createElement('select');
 savedPick.setAttribute('aria-label',say('Gespeicherten Spieler auswählen','Choose saved player'));
 const open=document.createElement('button');open.type='button';open.className='secondary-btn';
 open.textContent=say('Gespeicherten Stand öffnen','Open saved profile');
 const rename=document.createElement('div');rename.className='bear-local-name-row';
 const nameInput=document.createElement('input');nameInput.type='text';nameInput.maxLength=80;nameInput.setAttribute('aria-label',say('Spielername für diese ID','Player name for this ID'));
 nameInput.placeholder=say('Spielername für diese ID','Player name for this ID');
 const saveName=document.createElement('button');saveName.type='button';saveName.className='secondary-btn';
 saveName.textContent=say('Namen speichern','Save name');
 rename.append(nameInput,saveName);rename.hidden=true;
 function knownIds(){
  try{return Object.keys(localStorage).filter(k=>k.startsWith('nrw_bear_profile_v1_'))
   .map(k=>k.slice('nrw_bear_profile_v1_'.length)).filter(id=>/^[0-9]{5,20}$/.test(id));}
  catch(_){return [];}
 }
 function refreshSavedPlayers(){
  const chosen=savedPick.value;
  const known=knownIds().map(id=>({id,name:B.storedGovernorName?.(id)||''}));
  known.sort((a,b)=>(a.name||a.id).localeCompare(b.name||b.id,undefined,{sensitivity:'base'})||
   a.id.localeCompare(b.id));
  savedPick.replaceChildren();
  const placeholder=document.createElement('option');placeholder.value='';
  placeholder.textContent=say('Gespeicherten Spieler auswählen','Select saved player');
  savedPick.append(placeholder);
  for(const {id,name} of known){
   const opt=document.createElement('option');opt.value=id;
   opt.textContent=name?name+' · ID '+id:id;
   savedPick.append(opt);
  }
  savedPick.value=known.some(x=>x.id===chosen)?chosen:'';
  localRow.hidden=known.length===0;
 }
 function updateNameEditor(){
  const id=savedPick.value;
  rename.hidden=!id;
  nameInput.value=id?(B.storedGovernorName?.(id)||''):'';
 }
 savedPick.addEventListener('change',()=>{
  if(savedPick.value)governorInput.value=savedPick.value;
  updateNameEditor();
 });
 saveName.addEventListener('click',()=>{
  const id=savedPick.value,name=nameInput.value.trim();
  if(!id||!name||/^[0-9]{5,20}$/.test(name))return;
  B.rememberGovernorName?.(id,name);
  refreshSavedPlayers();
  updateNameEditor();
 });
 nameInput.addEventListener('keydown',evt=>{
  if(evt.key==='Enter'){evt.preventDefault();saveName.click();}
 });
 open.addEventListener('click',()=>{
  if(!savedPick.value)return;
  governorInput.value=savedPick.value;
  $('offlineMode')?.click();
 });
 localRow.append(savedPick,open,rename);lookup.after(localRow);
 const note=document.createElement('p');note.className='hint';
 note.textContent=say('Gespeicherte Profile auf diesem Gerät. Keine erneute Prüfung der Allianzzugehörigkeit.',
  'Saved profiles on this device. This does not recheck alliance membership.');
 localRow.after(note);
 const refresh=()=>{
  refreshSavedPlayers();updateNameEditor();note.hidden=localRow.hidden;
  nameInput.placeholder=say('Spielername für diese ID','Player name for this ID');
  saveName.textContent=say('Namen speichern','Save name');
  open.textContent=say('Gespeicherten Stand öffnen','Open saved profile');
 };
 document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,0)));
 window.addEventListener('nrw-bear-loaded',refresh);
 refresh();
}
// The language of a screenshot is independent from the website language.
// No unreliable automatic detection: choose the language of the GAME.
const screenshotLangRow=document.createElement('label');
screenshotLangRow.className='bear-ocr-language';
const screenshotLangTitle=document.createElement('span');
const screenshotLang=document.createElement('select');screenshotLang.id='bearScreenshotLanguage';
for(const [value,label] of [
 ['ui','—'],['de','Deutsch'],['en','English'],['fr','Français'],['es','Español']
]){
 const option=document.createElement('option');option.value=value;option.textContent=label;screenshotLang.append(option);
}
try{
 const saved=localStorage.getItem('nrw_bear_ocr_language_v1')||'ui';
 if(['ui','de','en','fr','es'].includes(saved))screenshotLang.value=saved;
}catch(_){}
const languageHint=document.createElement('p');languageHint.className='hint';
function refreshGameLanguage(){
 const lc=locale();
 // Existing fields are reused; update visible labels on each language change.
 shell.querySelector('.bear-intake-header h2').textContent='📸 '+say('Screenshots statt Eingabe','Screenshots instead of typing');
 shell.querySelector('.bear-intake-header > p.hint').textContent=say('Alle Bilder gleichzeitig auswählen – auch mehrere Stats- und Helden-Screenshots. Werte werden zusammengeführt und vor dem Speichern geprüft.','Choose multiple troop, combat and hero screenshots at once. Review all values before saving.');
 shell.querySelector('#intakePicker span').textContent='📂 '+say('Screenshots auswählen','Select screenshots');
 shell.querySelector('#intakeGear').textContent='🛡️ '+say('GovGear-Screenshot','GovGear screenshot');
 document.querySelector('#intakeApply').textContent='✓ '+say('Geprüfte Angaben übernehmen','Apply reviewed values');
 document.querySelector('#intakeClear').textContent=say('Verwerfen','Discard');
 missingSummary.textContent='✏️ '+say('Fehlende Werte / Einstellungen','Missing values / settings');
 screenshotLangTitle.textContent=lc==='de'?'Sprache des Kingshot-Screenshots':
  lc==='fr'?'Langue de la capture Kingshot':lc==='es'?'Idioma de la captura de Kingshot':
  'Kingshot screenshot language';
 screenshotLang.options[0].textContent=lc==='de'?'Wie die Website':
  lc==='fr'?'Comme le site':lc==='es'?'Como el sitio web':'Same as website';
 languageHint.textContent=lc==='de'?'Wenn dein Spiel eine andere Sprache nutzt, wähle sie hier vor dem Upload. Alle erkannten Werte bitte prüfen.':
  lc==='fr'?'Si le jeu est dans une autre langue, choisis-la ici avant de charger les images. Vérifie les valeurs reconnues.':
  lc==='es'?'Si el juego usa otro idioma, elígelo antes de subir imágenes. Comprueba los valores reconocidos.':
  'If the game uses a different language, select it before upload. Review all detected values.';
}
screenshotLangRow.append(screenshotLangTitle,screenshotLang);
shell.querySelector('.bear-intake-header')?.append(screenshotLangRow,languageHint);
refreshGameLanguage();
screenshotLang.addEventListener('change',()=>{
 try{localStorage.setItem('nrw_bear_ocr_language_v1',screenshotLang.value);}catch(_){}
});
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(refreshGameLanguage,0)));
const ocrLanguages={de:'deu+eng',en:'eng',fr:'fra+eng',es:'spa+eng'};
const requestedOCR=()=>ocrLanguages[screenshotLang.value==='ui'?locale():screenshotLang.value]||'eng';
let ocrWorker=null,ocrCode='',ocrPending=null,queue=[],busy=false,heroScanSequence=0;
const confirmedPortraits=[]; // confirmed across one-by-one screenshots, not persisted
function state(){const m=B.model();if(!m.v2)m.v2={};if(!m.v2.manualHeroes)m.v2.manualHeroes={};if(!Array.isArray(m.v2.ownHeroes))m.v2.ownHeroes=['','',''];return m.v2;}
function esc(str){return String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function status(t){$('intakeStatus').textContent=t;}
async function loadOCR(){
 const target=requestedOCR();
 if(ocrWorker&&ocrCode===target)return ocrWorker;
 // Serialize language changes. Never silently interpret French/Spanish
 // text with the English model after a language-pack download failure.
 if(ocrPending)return ocrPending.then(()=>loadOCR());
 ocrPending=(async()=>{
  if(!window.Tesseract){
   await new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    script.onload=resolve;script.onerror=()=>reject(new Error('OCR library blocked'));
    document.head.append(script);
   });
  }
  if(ocrWorker){await ocrWorker.terminate();ocrWorker=null;ocrCode='';}
  status(say('OCR wird vorbereitet …','Preparing OCR …'));
  try{
   ocrWorker=await window.Tesseract.createWorker(target,1,{logger:m=>{
    if(m.status==='recognizing text')status(say('Bilder werden lokal gelesen','Reading images locally')+
     ' '+Math.round((m.progress||0)*100)+'%');
   }});
   ocrCode=target;
  }catch(error){
   ocrCode='';ocrWorker=null;
   throw new Error('OCR data for '+target+' unavailable: '+String(error?.message||error));
  }
  return ocrWorker;
 })();
 try{return await ocrPending;}finally{ocrPending=null;}
}
async function imageCanvas(file){
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((resolve,reject)=>{
   const el=new Image();el.onload=()=>resolve(el);el.onerror=reject;el.src=url;
  });
  const canvas=document.createElement('canvas'),scale=Math.min(1.7,1400/img.naturalWidth,1800/img.naturalHeight);
  canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
  const cx=canvas.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,canvas.width,canvas.height);
  return canvas;
 }finally{URL.revokeObjectURL(url);}
}
function cropToThumb(src,x,y,w,h){
 // Preserve the ENTIRE hero card including star flowers. The old 130x170
 // stretched screenshot plus object-fit:cover hid the bottom of the card.
 const pixelW=w*src.width,pixelH=h*src.height;
 const c=document.createElement('canvas');c.width=170;
 c.height=Math.max(180,Math.round(170*pixelH/pixelW));
 c.getContext('2d').drawImage(src,x*src.width,y*src.height,pixelW,pixelH,0,0,c.width,c.height);
 return c.toDataURL('image/jpeg',.74);
}
// Detect actual four-column hero rows instead of assuming the first card
// always starts at the top. Scroll screenshots can start/end mid-card.
function heroRows(canvas){return window.NRW_BEAR_HERO_GRID?.rows(canvas)||[];}
function inferStars(canvas,rect){
 // The star row's *horizontal* offsets depend on CARD WIDTH, not screen
 // height. Use bright petal occupancy rather than assuming five white
 // flowers equal five completely filled stars.
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const cy=Math.round(rect.y+rect.h*.915),radius=Math.max(5,Math.round(rect.w*.07));
 const ratios=[];
 for(let i=0;i<5;i++){
  const cx=Math.round(rect.x+rect.w*(.195+i*.178));
  const left=Math.max(0,cx-radius),top=Math.max(0,cy-radius),
   width=Math.min(canvas.width-left,radius*2+1),
   height=Math.min(canvas.height-top,radius*2+1);
  if(width<=0||height<=0)return {starSteps:null,confidence:0};
  const data=ctx.getImageData(left,top,width,height).data;
  let bright=0;
  for(let p=0;p<data.length;p+=4){
   const r=data[p],g=data[p+1],b=data[p+2];
   if(r>185&&g>173&&b>115&&(r-g)<85&&r>b)bright++;
  }
  ratios.push(bright/(width*height));
 }
 const reading=window.NRW_BEAR_HERO_STARS?.analyze(ratios);
 const steps=reading?.steps??null;
 return {starSteps:steps,confidence:reading?.confidence??0,
  review:reading?.review??true,
  partiallyFilled:steps!==null&&steps%6!==0};
}
// Local pixel fingerprints deduplicate full hero cards between scroll shots.
function portraitSignature(canvas,rect){
 const small=document.createElement('canvas');small.width=24;small.height=32;
 const cx=small.getContext('2d',{willReadFrequently:true});
 cx.drawImage(canvas,rect.x+rect.w*.07,rect.y+rect.h*.04,
   rect.w*.86,rect.h*.67,0,0,24,32);
 return cx.getImageData(0,0,24,32).data;
}
function samePortrait(a,b){
 if(!a||!b||a.length!==b.length)return false;
 let difference=0,count=0;
 for(let p=0;p<a.length;p+=4){
  difference+=Math.abs(a[p]-b[p])+Math.abs(a[p+1]-b[p+1])+Math.abs(a[p+2]-b[p+2]);
  count+=3;
 }
 return difference/count<12;
}
function isUnrecruitedCard(ctx,rect,stars){
 // In Kingshot the locked card has a dark, wide "0/20" banner covering
 // the entire bottom edge instead of five coloured advancement flowers.
 // Do not rely solely on Tesseract to read a tiny 0/20 glyph.
 if(stars.starSteps!==null)return false;
 const x=Math.round(rect.x+rect.w*.10),y=Math.round(rect.y+rect.h*.85),
  w=Math.round(rect.w*.80),h=Math.round(rect.h*.13);
 if(w<20||h<10)return false;
 const data=ctx.getImageData(x,y,w,h).data;
 let dark=0;
 for(let p=0;p<data.length;p+=4)
  if((data[p]+data[p+1]+data[p+2])/3<90)dark++;
 return dark/(data.length/4)>.74;
}
function overviewTiles(canvas,text,words,scanTag){
 const rows=heroRows(canvas),collected=[];
 // If the player scrolls, take only whole visible cards. Partial top/bottom
 // rows will be captured by an overlapping screenshot, not assigned falsely.
 for(const row of rows){
  for(let col=0;col<4;col++){
   const rect=window.NRW_BEAR_HERO_GRID.tileRect(canvas.width,row,col);
   const cx=canvas.getContext('2d',{willReadFrequently:true});
   // The last Kingshot roster row can have fewer than four cards.
   // Reject a blank beige cell or a dark 0/20 unrecruited portrait.
   const middle=cx.getImageData(Math.round(rect.x+rect.w*.1),
     Math.round(rect.y+rect.h*.15),Math.max(1,Math.round(rect.w*.8)),
     Math.max(1,Math.round(rect.h*.50))).data;
   let difference=0;
   for(let p=0;p<middle.length;p+=4){
    difference+=Math.abs(middle[p]-224)+Math.abs(middle[p+1]-209)+Math.abs(middle[p+2]-185);
    }
   const area=middle.length/4;
   if(difference/area<28)continue;
   const hasUnlockProgress=(words||[]).some(w=>w.bbox&&/0\s*\/\s*20/.test(w.text||'')&&
     (w.bbox.x0+w.bbox.x1)/2>rect.x&&(w.bbox.x0+w.bbox.x1)/2<rect.x+rect.w&&
     (w.bbox.y0+w.bbox.y1)/2>rect.y+rect.h*.72&&
     (w.bbox.y0+w.bbox.y1)/2<rect.y+rect.h);
   if(hasUnlockProgress)continue;
   const stars=inferStars(canvas,rect);
   if(isUnrecruitedCard(cx,rect,stars))continue;
   const tile={image:cropToThumb(canvas,rect.x/canvas.width,rect.y/canvas.height,
     rect.w/canvas.width,rect.h/canvas.height),name:'',level:null,levelEvidence:[],
     // Borderline fills must be reviewed before they influence Bear ranking.
     starSteps:stars.review?null:stars.starSteps,
     starSuggestion:stars.review?stars.starSteps:null,
     starReview:stars.review,starConfidence:stars.confidence,
     partialStar:stars.partiallyFilled,selected:false,rect,
     signature:portraitSignature(canvas,rect),
     portraitCandidates:MATCHER?.candidates(canvas,rect)||[]};
   HERO_LEVEL?.record(tile,HERO_LEVEL.lineInRect(words,rect),scanTag+':screen');
   // Pixel geometry verifies the shape of Lv.1 or Lv.80 independently of
   // the OCR text, which previously hallucinated 19 and 20.
   const visual=HERO_LEVEL?.visual(canvas,rect);
   if(visual!==null&&visual!==undefined)
    HERO_LEVEL.record(tile,visual,scanTag+':glyph','visual');
   collected.push(tile);
  }
 }
 return collected;
}
async function readHeroLevelsRaw(tiles,canvas,worker,scanTag){
 // Independently read the small Lv. strip for EVERY card, to corroborate
 // rather than blindly accepting a number from full-screen Tesseract.
 const cards=tiles.filter(t=>t.rect);
 if(!cards.length)return;
 const rowHeight=70,board=document.createElement('canvas');
 board.width=300;board.height=cards.length*rowHeight;
 const cx=board.getContext('2d',{willReadFrequently:true});
 cx.fillStyle='#fff';cx.fillRect(0,0,board.width,board.height);
 cards.forEach((tile,i)=>{
  const r=tile.rect;
  cx.drawImage(canvas,r.x+r.w*.06,r.y+r.h*.67,r.w*.70,r.h*.21,
   10,i*rowHeight+8,270,52);
 });
 try{
  const result=await worker.recognize(board);
  const words=result.data?.words||[];
  cards.forEach((tile,i)=>{
   const line=words.filter(v=>v.bbox&&(v.bbox.y0+v.bbox.y1)/2>=i*rowHeight&&
    (v.bbox.y0+v.bbox.y1)/2<(i+1)*rowHeight)
    .sort((a,b)=>a.bbox.x0-b.bbox.x0).map(v=>v.text).join(' ');
   // No standalone digits: only explicit Lv. <number>.
   HERO_LEVEL?.record(tile,line,scanTag+':raw');
  });
 }catch(_){/* Unknown is safer than an unverified number. */}
}
async function readHeroLevelsMasked(tiles,canvas,worker,scanTag){
 // Second independent contrast-masked pass over the same level strip.
 const cards=tiles.filter(t=>t.rect);
 if(!cards.length)return;
 const stride=78,board=document.createElement('canvas');
 board.width=340;board.height=stride*cards.length;
 const bc=board.getContext('2d',{willReadFrequently:true});
 bc.fillStyle='#fff';bc.fillRect(0,0,board.width,board.height);
 cards.forEach((tile,i)=>{
  const r=tile.rect,tmp=document.createElement('canvas');
  tmp.width=320;tmp.height=68;
  const tc=tmp.getContext('2d',{willReadFrequently:true});
  tc.drawImage(canvas,r.x+r.w*.055,r.y+r.h*.695,r.w*.70,r.h*.16,
   0,0,tmp.width,tmp.height);
  const img=tc.getImageData(0,0,tmp.width,tmp.height);
  for(let k=0;k<img.data.length;k+=4){
   const R=img.data[k],G=img.data[k+1],B=img.data[k+2];
   const bright=(R>155&&G>150&&B>70&&R-B>18)||
                (R>179&&G>174&&B>164);
   img.data[k]=img.data[k+1]=img.data[k+2]=bright?0:255;
   img.data[k+3]=255;
  }
  tc.putImageData(img,0,0);bc.drawImage(tmp,10,i*stride+4);
 });
 try{
  const ocr=await worker.recognize(board);
  const words=ocr.data?.words||[];
  cards.forEach((tile,i)=>{
   const line=words.filter(x=>x.bbox&&
    (x.bbox.y0+x.bbox.y1)/2>=i*stride&&
    (x.bbox.y0+x.bbox.y1)/2<(i+1)*stride)
    .sort((a,b)=>a.bbox.x0-b.bbox.x0).map(x=>x.text).join(' ');
   HERO_LEVEL?.record(tile,line,scanTag+':masked');
  });
 }catch(_){/* Do not invent an unreadable hero level. */}
}
function spatialTroops(words,canvas){
 const zones=[
  {key:'troopsI',x:[.20,.42],y:[.305,.353]},
  {key:'troopsC',x:[.60,.85],y:[.305,.353]},
  {key:'troopsA',x:[.20,.51],y:[.402,.451]}
 ],found={};
 for(const zone of zones){
  const hits=[];
  for(const word of words||[]){
   if(!word.bbox||!word.text)continue;
   const bb=word.bbox,cx=((bb.x0+bb.x1)/2)/canvas.width,
     cy=((bb.y0+bb.y1)/2)/canvas.height;
   if(cx<zone.x[0]||cx>zone.x[1]||cy<zone.y[0]||cy>zone.y[1])continue;
   hits.push({x:bb.x0,y:cy,word:String(word.text)});
  }
  hits.sort((a,b)=>a.x-b.x);
  // Tesseract sometimes reports "557", ".", "731" as three words.
  const joined=hits.map(x=>x.word).join('');
  const candidates=[...joined.matchAll(/\d{1,3}(?:[.,]\d{3})+|\d{4,9}/g)]
    .map(x=>Core.normalizeNumber(x[0]))
    .filter(n=>Number.isInteger(n)&&n>1000&&n<200000000);
  if(candidates.length)found[zone.key]=candidates[0];
  else{
   const singles=hits.map(x=>Core.normalizeNumber(x.word))
     .filter(n=>Number.isInteger(n)&&n>1000&&n<200000000);
   if(singles.length)found[zone.key]=singles[0];
  }
 }
 return found;
}
async function readTroopNumbers(canvas,worker){
 // Isolate each number strip so icons/golden badges cannot hide a leading
 // digit in the full-screen OCR. Resizing keeps original aspect ratio.
 const crops=[
  {key:'troopsI',x:.202,y:.307,w:.215,h:.044},
  {key:'troopsC',x:.605,y:.307,w:.218,h:.044},
  {key:'troopsA',x:.202,y:.405,w:.270,h:.046}
 ];
 const board=document.createElement('canvas');board.width=460;board.height=420;
 const b=board.getContext('2d',{willReadFrequently:true});
 b.fillStyle='#fff';b.fillRect(0,0,board.width,board.height);
 for(let i=0;i<3;i++){
  const v=crops[i],x=v.x*canvas.width,y=v.y*canvas.height,
   w=v.w*canvas.width,h=v.h*canvas.height;
  const ratio=Math.min(2.2,120/h,430/w);
  b.drawImage(canvas,x,y,w,h,15,14+i*140,w*ratio,h*ratio);
 }
 const result=await worker.recognize(board);
 const found={},words=result.data.words||[];
 for(let i=0;i<3;i++){
  const row=words.filter(v=>v.bbox&&
   (v.bbox.y0+v.bbox.y1)/2>=i*140&&
   (v.bbox.y0+v.bbox.y1)/2<(i+1)*140)
   .sort((a,b)=>a.bbox.x0-b.bbox.x0).map(x=>x.text).join('');
  const number=row.match(/\d{1,3}(?:[.,]\d{3})+|\d{4,9}/)?.[0];
  const value=number?Core.normalizeNumber(number):null;
  if(Number.isInteger(value)&&value>1000&&value<200000000)found[crops[i].key]=value;
 }
 return found;
}
async function recheckTroopFields(canvas,worker,values,uncertainKeys=new Set()){
 // Relative to original Kingshot image, not to the viewing phone/browser.
 // One focused OCR pass per missing quantity or T10 class title.
 const blocks=[
  {key:'troopsI',name:'Infanterie',n:[.202,.307,.215,.044],label:[.205,.286,.300,.034]},
  {key:'troopsC',name:'Kavallerie',n:[.605,.307,.218,.044],label:[.609,.286,.300,.034]},
  {key:'troopsA',name:'Bogenschützen',n:[.202,.405,.270,.046],label:[.205,.384,.305,.034]}
 ];
 let tiersText='';
 for(const block of blocks){
  function crop(zone){
   const c=document.createElement('canvas'),w=620,h=104;
   c.width=w;c.height=h;
   const cx=c.getContext('2d',{willReadFrequently:true});cx.fillStyle='white';cx.fillRect(0,0,w,h);
   cx.drawImage(canvas,zone[0]*canvas.width,zone[1]*canvas.height,zone[2]*canvas.width,zone[3]*canvas.height,
    8,9,w-16,h-18);
   return c;
  }
  if(!uncertainKeys.has(block.key)&&!(Number(values[block.key])>0)){
   try{
    const res=await worker.recognize(crop(block.n));
    const t=(res.data?.text||'').replace(/\s/g,'');
    const possibles=[...t.matchAll(/\d{1,3}[.,]\d{3}|\d{4,9}/g)]
     .map(m=>Core.normalizeNumber(m[0]))
     .filter(n=>Number.isInteger(n)&&n>=1000&&n<200000000);
    if(possibles.length)values[block.key]=Math.max(...possibles);
   }catch(_){}
  }
  try{
   const res=await worker.recognize(crop(block.label));
   const label=String(res.data?.text||'').toLowerCase();
   if(/spitz\w{0,5}n|spitzen/.test(label))tiersText+='\nSpitzen '+block.name;
  }catch(_){}
 }
 return tiersText;
}
async function readTroopColumnWords(canvas,worker){
 // Tesseract's full-screen pass often loses the infantry/cavalry labels
 // beside the illustrated icons. Re-read the two text columns independently.
 // The source regions are FRACTIONS of original width/height; output word
 // boxes are mapped back to the full-screen coordinate system.
 const columns=[
  {x:.162,y:.215,w:.337,h:.595},
  {x:.579,y:.215,w:.355,h:.595}
 ],words=[];
 for(const zone of columns){
  const sourceX=zone.x*canvas.width,sourceY=zone.y*canvas.height,
   sourceW=zone.w*canvas.width,sourceH=zone.h*canvas.height;
  const scale=Math.min(2.1,1650/sourceH),box=document.createElement('canvas');
  box.width=Math.max(100,Math.round(sourceW*scale));
  box.height=Math.max(100,Math.round(sourceH*scale));
  box.getContext('2d',{willReadFrequently:true}).drawImage(canvas,
   sourceX,sourceY,sourceW,sourceH,0,0,box.width,box.height);
  try{
   const r=await worker.recognize(box);
   for(const word of r.data?.words||[]){
    if(!word.bbox||!word.text)continue;
    const b=word.bbox;
    words.push({...word,bbox:{
     x0:sourceX+b.x0/box.width*sourceW,
     x1:sourceX+b.x1/box.width*sourceW,
     y0:sourceY+b.y0/box.height*sourceH,
     y1:sourceY+b.y1/box.height*sourceH
    }});
   }
  }catch(_){/* Never lose the initial full-image recognition. */}
 }
 return words;
}
async function recheckUnreadTroopEntries(entries,canvas,worker){
 // Each entry supplies its OWN normalized crop; no first/second/third-row
 // assumptions. Tesseract OCR result is never accepted if not a whole
 // thousands-formatted troop count.
 if(!Array.isArray(entries))return;
 for(const entry of entries){
  if(entry.count!==null||!entry.crop)continue;
  const r=entry.crop,c=document.createElement('canvas');
  c.width=520;c.height=104;
  const ctx=c.getContext('2d',{willReadFrequently:true});
  ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);
  try{
   ctx.drawImage(canvas,r.x*canvas.width,r.y*canvas.height,
    r.w*canvas.width,r.h*canvas.height,8,8,c.width-16,c.height-16);
   const ocr=await worker.recognize(c);
   const cleaned=String(ocr.data?.text||'').trim();
   const candidate=ENTRY.readTextCount(cleaned);
   if(candidate!==null)entry.count=candidate;
  }catch(_){/* Leave unreadable rows reviewable, never fabricate counts. */}
 }
}
function positionalLines(words,canvas){
 // Screenshots with two columns may OCR all labels first, then numbers.
 // Group words by visible text row and sort horizontally.
 const sorted=(words||[]).filter(w=>w.bbox&&w.text).map(w=>({
  x:w.bbox.x0,y:(w.bbox.y0+w.bbox.y1)/2,text:w.text
 })).sort((a,b)=>a.y-b.y||a.x-b.x);
 const rows=[];
 const threshold=canvas.height*.014;
 for(const word of sorted){
  let row=rows.find(r=>Math.abs(r.y-word.y)<threshold);
  if(!row){row={y:word.y,words:[]};rows.push(row);}
  row.words.push(word);
 }
 return rows.sort((a,b)=>a.y-b.y).map(r=>r.words.sort((a,b)=>a.x-b.x).map(w=>w.text).join(' ')).join('\n');
}
function allKnown(){
 const owned=Object.keys(state().manualHeroes||{});
 return [...new Set([...(cat.heroes||[]).map(h=>h.name),...owned])].sort((a,b)=>a.localeCompare(b));
}
async function readHeroStatPanel(canvas,worker,heroName,originalText){
 const kind=cat.heroTypes?.[heroName];
 if(!kind)return {values:{},conflicts:[]};
 const prefix={infantry:'i',cavalry:'c',archer:'a'}[kind];
 const keys=['Atk','Def','Let','Hp'].map(k=>prefix+k);
 const output={...Core.parseHeroStats(originalText,kind)},conflicts=new Set();
 function reconcile(extra){
  for(const [key,value] of Object.entries(extra||{})){
   if(output[key]!==undefined&&Math.abs(output[key]-value)>.05){
    delete output[key];conflicts.add(key);
   }else if(!conflicts.has(key))output[key]=value;
  }
 }
 // The three ORIGINAL 716x1536 hero photos from this user prove that the
 // four right-aligned Expedition values stay in the SAME ORDER:
 // Attack / Defense / Lethality / Health. Label OCR may miss a wrapped
 // word such as Yang's "Gesundheit". Read only the numeric column:
 // x=556..685, y=1030..1290 normalized to the source screen.
 // Other screen geometries safely fall back to labelled text OCR.
 try{
  const sx=canvas.width/716,sy=canvas.height/1536;
  const roi=document.createElement('canvas');
  roi.width=516;roi.height=1040;
  const cx=roi.getContext('2d',{willReadFrequently:true});
  cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
  cx.drawImage(canvas,556*sx,1030*sy,129*sx,260*sy,0,0,roi.width,roi.height);
  const result=await worker.recognize(roi);
  reconcile(Core.parseHeroOrderedExpeditionRows(result.data?.text||'',kind));
 }catch(_){/* Never infer a positional stat from an unreadable crop. */}
 // If one of the four values remains missing, also try the original
 // enlarged labelled panel. It can recover names/numbers when screenshots
 // have different safe-area placements. Contradictions remain unfilled.
 if(keys.some(key=>output[key]===undefined)){
  const roi=document.createElement('canvas');
  roi.width=1200;roi.height=Math.round(canvas.height*.67*1200/(canvas.width*.92));
  const cx=roi.getContext('2d',{willReadFrequently:true});
  cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
  cx.drawImage(canvas,canvas.width*.04,canvas.height*.29,
   canvas.width*.92,canvas.height*.67,0,0,roi.width,roi.height);
  try{
   const result=await worker.recognize(roi);
   reconcile(Core.parseHeroStats(result.data?.text||'',kind));
  }catch(_){/* Unknown remains an editable blank. */}
 }
 return {values:output,conflicts:[...conflicts]};
}
async function inspect(file){
 const canvas=await imageCanvas(file);
 const worker=await loadOCR();
 const result=await worker.recognize(canvas);
 const text=result.data.text||'';
 const grouped=positionalLines(result.data.words,canvas);
 let type=Core.category(text+'\n'+grouped);
 // On a guided step, use its context when text recognition cannot identify
 // the image. Do not overwrite a confidently recognized different screen.
 if(type==='unknown'&&window.NRW_BEAR_SCREENSHOT_STAGE===1)type='troops';
 if(type==='unknown'&&window.NRW_BEAR_SCREENSHOT_STAGE===2)type='stats';
 if(type==='unknown'&&window.NRW_BEAR_SCREENSHOT_STAGE===4&&heroRows(canvas).length>=2)type='roster';
 // A portrait-only roster can be recognized from its dense 4-column grid;
 // unknown layouts remain unrecognized and manually selectable.
 const values=type==='troops'?
  {...Core.parseTroops(text),...spatialTroops(result.data.words,canvas)}:
  type==='stats'?{...Core.parseStats(text),...Core.parseStats(grouped)}:{};
 const uncertainKeys=new Set(),absoluteReadings={};
 let explicitTierLabels='';
 if(type==='troops'){
  try{
   Object.assign(absoluteReadings,await readTroopNumbers(canvas,worker));
   for(const [key,n] of Object.entries(absoluteReadings)){
    if(Number.isSafeInteger(values[key])&&values[key]!==n){
     // Absolute crops move across phone aspect ratios. Conflicting reads
     // may NOT replace a class-labeled troop count.
     uncertainKeys.add(key);delete values[key];
    }else if(!Object.prototype.hasOwnProperty.call(values,key))values[key]=n;
   }
  }catch(_){/* Leave uncertain values reviewable, not fabricated. */}
  explicitTierLabels=await recheckTroopFields(canvas,worker,values,uncertainKeys);
 }
 let troopEntries=[],troopWords=result.data.words||[];
 if(type==='troops'&&ENTRY){
  try{troopWords=[...troopWords,...await readTroopColumnWords(canvas,worker)];}
  catch(_){/* Fall back to existing OCR words. */}
  troopEntries=ENTRY.detect(troopWords,canvas.width,canvas.height);
  if(troopEntries.length){
   await recheckUnreadTroopEntries(troopEntries,canvas,worker);
   ENTRY.flagAmbiguousCounts?.(troopEntries,absoluteReadings);
   for(const entry of troopEntries){
    if(uncertainKeys.has(['troopsI','troopsC','troopsA'][entry.type])){
     entry.uncertainCount=true;entry.countWarning='conflicting-ocr';entry.count=null;
    }
   }
   ENTRY.recoverSingleEntries(troopEntries,values);
   const computed=ENTRY.totals(troopEntries);
   for(const type of new Set(troopEntries.map(e=>e.type))){
    const key=['troopsI','troopsC','troopsA'][type];
    if(!Object.prototype.hasOwnProperty.call(computed,key))delete values[key];
   }
   Object.assign(values,computed);
  }
  for(const key of uncertainKeys)delete values[key];
 }
 const troopTiers=type==='troops'&&TROOP?TROOP.recognize(canvas,text+'\n'+grouped+explicitTierLabels,result.data.words||[]):null;
 const marchSlots=type==='troops'?Core.parseMarchSlots(text+'\n'+grouped):null;

 const guidedDetails=window.NRW_BEAR_SCREENSHOT_STAGE===6?
  (B.model().v2?.ownHeroes||[]).filter(Boolean):[];
 const detailCandidates=guidedDetails.length?guidedDetails:allKnown();
 let detail=(type==='starter'||type==='unknown')?Core.parseHeroDetail(text,detailCandidates):null;
 if((type==='starter'||type==='unknown')&&!detail?.name){
  // Detail screenshots display the hero name at the TOP, above a huge 3D
  // character. A full-page OCR scan can miss the tiny outlined heading.
  const header=document.createElement('canvas');
  header.width=900;header.height=180;
  const hc=header.getContext('2d');
  hc.drawImage(canvas,canvas.width*.20,0,canvas.width*.60,canvas.height*.11,
    0,0,header.width,header.height);
  const headerOCR=await worker.recognize(header);
  let heading=headerOCR.data.text||'';
  detail=Core.parseHeroDetail(heading+'\n'+text,detailCandidates)||detail;
  if(!detail?.name){
   // Short names such as "Zoe" can vanish in the white-on-dark outlined
   // title. Make a second pass across a wider upper heading band with
   // thresholded high-contrast text. Do NOT infer name from ownership or
   // from the other two detail screenshots.
   const upper=document.createElement('canvas');upper.width=1120;upper.height=220;
   const uc=upper.getContext('2d',{willReadFrequently:true});
   uc.drawImage(canvas,canvas.width*.06,canvas.height*.012,
    canvas.width*.88,canvas.height*.165,0,0,upper.width,upper.height);
   const im=uc.getImageData(0,0,upper.width,upper.height);
   for(let k=0;k<im.data.length;k+=4){
    const r=im.data[k],g=im.data[k+1],b=im.data[k+2];
    const bright=r>150&&g>146&&b>135;
    im.data[k]=im.data[k+1]=im.data[k+2]=bright?0:255;
    im.data[k+3]=255;
   }
   uc.putImageData(im,0,0);
   try{
    const focused=await worker.recognize(upper);
    heading+='\n'+(focused.data?.text||'');
    detail=Core.parseHeroDetail(heading+'\n'+text,detailCandidates)||detail;
   }catch(_){/* Unknown name still requires user confirmation. */}
  }
 }
 if(guidedDetails.length&&!detail?.name&&(type==='starter'||type==='unknown')){
  const detectedOutside=Core.parseHeroDetail(text,allKnown())?.name;
  if(!detectedOutside||guidedDetails.includes(detectedOutside)){
   const occupied=new Set(queue.filter(q=>q.type==='starter').map(q=>q.detail?.name).filter(Boolean));
   const pending=guidedDetails.filter(n=>!occupied.has(n));
   if(pending.length){
    // Roster owns level and stars. If the header is unreadable, map to
    // the next unassigned approved hero; the review visibly flags this.
    detail={name:pending[0],level:null,expeditionStats:{},assignedByOrder:true};
   }
  }else detail={name:null,unmatchedName:detectedOutside,expeditionStats:{}};
 }
 if(detail?.name&&(type==='starter'||type==='unknown')){
  const focused=await readHeroStatPanel(canvas,worker,detail.name,text+'\n'+grouped);
  detail.expeditionStats={
   ...Object.fromEntries(Object.entries(detail.expeditionStats||{})
    .filter(([key])=>!focused.conflicts.includes(key))),
   ...focused.values
  };
  detail.expeditionConflicts=focused.conflicts;
 }
 if(type==='unknown'&&detail?.name)type='starter';
 // A roster is only valid as a complete four-column overview. Detail pages
 // must not silently be treated as roster images (and vice versa).
 if(window.NRW_BEAR_SCREENSHOT_STAGE===4&&type==='unknown'&&heroRows(canvas).length)
  type='roster';
 if(window.NRW_BEAR_SCREENSHOT_STAGE===6&&type==='unknown')
  type='starter';
 const scanTag='overview-'+(++heroScanSequence);
 const allCards=type==='roster'?overviewTiles(canvas,text,result.data.words,scanTag):[];
 if(type==='roster'&&allCards.length){
  await readHeroLevelsRaw(allCards,canvas,worker,scanTag);
  await readHeroLevelsMasked(allCards,canvas,worker,scanTag);
 }
 const existing=[...queue.filter(q=>q.type==='roster').flatMap(q=>q.cards||[])];
 const fresh=[];let duplicates=0;
 for(const tile of allCards){
  const earlier=[...existing,...fresh].find(x=>samePortrait(x.signature,tile.signature));
  if(earlier){
   // Overlapping screenshots describe the SAME hero. Retain the card and
   // combine independent OCR evidence; manual edits are never overwritten.
   HERO_LEVEL?.combine(earlier,tile);
   window.NRW_BEAR_HERO_STARS?.merge(earlier,tile);
   duplicates++;
  }else if(confirmedPortraits.some(x=>samePortrait(x.signature,tile.signature))){
   // A previously applied batch remains saved; do not silently change it.
   duplicates++;
  }else fresh.push(tile);
 }
 const matcherInfo=type==='roster'&&MATCHER?await MATCHER.enrich(fresh):null;
 return {fileName:file.name,file,type,text,grouped,words:troopWords,values,detail,troopEntries,troopTiers,marchSlots,canvas:(type==='roster'||type==='unknown'||type==='troops')?canvas:null,
  cards:fresh,duplicates,matcherInfo,applied:false};
}
function inputChoice(items,current=''){
 const sel=document.createElement('select');
 for(const [value,title] of items){const o=document.createElement('option');o.value=String(value);o.textContent=title;if(String(value)===String(current))o.selected=true;sel.appendChild(o);}
 return sel;
}
const heroChoices=()=>[['',say('Nicht zuordnen','Skip')],...allKnown().map(n=>[n,n])];
function starOptions(){
 const options=[['',say('Sterne unbekannt','Stars unknown')]];
 for(let stars=1;stars<5;stars++){
  options.push([stars*6,stars+'★']);
  for(let tier=1;tier<=5;tier++)options.push([stars*6+tier,stars+'★ T'+tier]);
 }
 options.push([30,'5★ (MAX)']);
 return options;
}
function renderQueue(){
 const holder=$('intakeQueue');holder.innerHTML='';holder.hidden=queue.length===0;
 $('intakeApplyRow').hidden=queue.length===0;
 queue.forEach((item,i)=>{
  const card=document.createElement('div');card.className='bear-intake-item';
  const header=document.createElement('div');header.className='bear-intake-item-head';
  const title=document.createElement('b');title.textContent=item.fileName;
  const type=inputChoice(Object.entries(typeTranslations[locale()]||typeTranslations.en).map(([key,name])=>[key,name]),item.type);
  type.addEventListener('change',async ()=>{item.type=type.value;item.values=item.type==='troops'?{...Core.parseTroops(item.text),...(item.canvas?spatialTroops(item.words,item.canvas):{})}:item.type==='stats'?{...Core.parseStats(item.text),...Core.parseStats(item.grouped||'')}:{};item.troopEntries=item.type==='troops'&&item.canvas&&ENTRY?ENTRY.detect(item.words||[],item.canvas.width,item.canvas.height):[];if(item.troopEntries.length){ENTRY.recoverSingleEntries(item.troopEntries,item.values);Object.assign(item.values,ENTRY.totals(item.troopEntries));}item.detail=item.type==='starter'?Core.parseHeroDetail(item.text,allKnown()):null;const scanTag='manual-'+(++heroScanSequence);
    item.cards=item.type==='roster'&&item.canvas?overviewTiles(item.canvas,item.text,item.words,scanTag):[];
    if(item.type==='roster'&&item.cards.length){
     const worker=await loadOCR();
     await readHeroLevelsRaw(item.cards,item.canvas,worker,scanTag);
     await readHeroLevelsMasked(item.cards,item.canvas,worker,scanTag);
    }
    if(item.type==='roster'&&MATCHER){
     // Changing the screenshot category manually must follow the same
     // portrait recognition path as automatic overview detection.
     item.matcherInfo=await MATCHER.enrich(item.cards);
    }else item.matcherInfo=null;
    item.troopTiers=item.type==='troops'&&item.canvas&&TROOP?TROOP.recognize(item.canvas,item.text+'\n'+(item.grouped||''),item.words):null;renderQueue();});
  header.append(title,type);card.appendChild(header);
  const content=document.createElement('div');content.className='bear-intake-values';
  if(item.type==='troops'||item.type==='stats'){
   const relevant=item.type==='troops'?['troopsI','troopsC','troopsA']:['squadAtk','squadLet','iAtk','iLet','cAtk','cLet','aAtk','aLet'];
   const itemized=item.type==='troops'&&Array.isArray(item.troopEntries)&&item.troopEntries.length>0;
   if(itemized){
    const intro=document.createElement('p');intro.className='hint';
    intro.textContent=say('Alle erkannten Truppeneinträge, auch mehrfach vorkommende Gattungen. Jede Anzahl separat prüfen. T-/TG-Stufen folgen später.',
     'All detected troop entries, including repeated troop classes. Check every quantity separately; tier/TG recognition follows.');
    content.append(intro);
    if(item.canvas){
     const preview=document.createElement('details');preview.className='bear-troop-source-preview';
     const summary=document.createElement('summary');
     summary.textContent=say('📷 Originalbild zur Kontrolle anzeigen','📷 View original screenshot for verification');
     const image=document.createElement('img');image.alt=item.fileName;image.loading='lazy';
     image.style.cssText='display:block;max-width:100%;height:auto;margin-top:10px;border-radius:12px';
     image.src=item.canvas.toDataURL('image/jpeg',0.75);
     preview.append(summary,image);content.append(preview);
    }
    const list=document.createElement('div');list.className='bear-dynamic-troop-list';
    const refreshTotals=()=>{
     const groups=new Set(item.troopEntries.map(e=>e.type));
     for(const type of groups)delete item.values[['troopsI','troopsC','troopsA'][type]];
     Object.assign(item.values,ENTRY.totals(item.troopEntries));
    };
    item.troopEntries.forEach((entry,index)=>{
     const line=document.createElement('label');line.className='bear-dynamic-troop-line';
     const heading=document.createElement('span');
     heading.textContent=(index+1)+'. '+entry.label+(entry.uncertainCount?' · ⚠ OCR unklar':'');
     const value=document.createElement('input');value.type='number';value.min='0';value.step='1';
     value.value=entry.count??'';value.placeholder=say('Nicht erkannt','Not recognized');
     value.addEventListener('input',()=>{
      const n=value.value.trim()===''?null:Number(value.value);
      entry.count=value.value.trim()!==''&&Number.isSafeInteger(n)&&n>=0?n:null;
      if(entry.count!==null){entry.uncertainCount=false;entry.countWarning=null;}
      refreshTotals();
     });
     line.append(heading,value);list.append(line);
    });
    content.append(list);
    refreshTotals();
    // Older focused OCR can recognize a class quantity even when the
    // full-screen text pass missed its class heading. Show that result
    // explicitly instead of hiding it just because any one row was found.
    const seen=new Set(item.troopEntries.map(e=>e.type));
    for(const [type,key] of ['troopsI','troopsC','troopsA'].entries()){
     if(seen.has(type)||!Number.isInteger(item.values[key])||item.values[key]<=0)continue;
     const fallback=document.createElement('label');
     fallback.className='bear-dynamic-troop-line';
     const label=document.createElement('span');
     label.textContent=['Infanterie','Kavallerie','Bogenschützen'][type]+
      say(' · Zahl erkannt, Eintrag prüfen',' · amount recognized, verify entry');
     const field=document.createElement('input');field.type='number';field.min='1';field.step='1';
     field.value=item.values[key];
     field.addEventListener('input',()=>{
      if(field.value!==''&&Number.isSafeInteger(Number(field.value))&&Number(field.value)>0)
       item.values[key]=Number(field.value);
      else delete item.values[key];
     });
     fallback.append(label,field);content.append(fallback);
    }
   }else relevant.forEach(id=>{
    // A guided review should show only found values. Anything not recognized
    // is collected in the final missing-values step, not a wall of blank inputs.
    if(window.NRW_BEAR_WIZARD&&!Object.prototype.hasOwnProperty.call(item.values,id))return;
    const label=document.createElement('label');label.className='bear-intake-value';
    const cap=document.createElement('span');cap.textContent=captions[id]||id;
    const field=document.createElement('input');field.type='number';field.step=id.startsWith('troops')?'1':'0.01';field.min='0';
    field.value=item.values[id]??'';field.dataset.field=id;
    field.addEventListener('input',()=>{if(field.value!=='')item.values[id]=Number(field.value);else delete item.values[id];});
    label.append(cap,field);content.appendChild(label);
   });
   if(item.type==='troops'&&(!itemized||(item.troopEntries.length===3&&new Set(item.troopEntries.map(e=>e.type)).size===3))){
    const extra=document.createElement('div');extra.className='bear-intake-tier-review';
    const heading=document.createElement('b');heading.textContent='🛡️ '+say('Stufen aus den Truppensymbolen – bitte prüfen','Troop badge tiers – please verify');
    extra.append(heading);
    if(!Array.isArray(item.troopTiers))item.troopTiers=Array.from({length:3},()=>({tier:null,tg:null}));
    item.troopTiers.forEach((entry,index)=>{
     const box=document.createElement('div');box.className='bear-intake-tier-row';
     const name=document.createElement('strong');name.textContent=['Infanterie','Kavallerie','Bogenschützen'][index];
     const tiers=inputChoice([['',say('T?','T?')],...Array.from({length:11},(_,n)=>[n+1,'T'+(n+1)])],entry.tier??'');
     const tgs=inputChoice([['',say('TG?','TG?')],...Array.from({length:9},(_,n)=>[n,'TG'+n])],entry.tg??'');
     tiers.setAttribute('aria-label','Tier '+index);tgs.setAttribute('aria-label','Truegold '+index);
     tiers.addEventListener('change',()=>entry.tier=tiers.value===''?null:Number(tiers.value));
     tgs.addEventListener('change',()=>entry.tg=tgs.value===''?null:Number(tgs.value));
     const note=document.createElement('small');note.textContent=entry.tg!==null?
      '✓ '+say('Bildvorschlag · prüfen','image guess · review'):
      say('Goldenes Abzeichen nicht eindeutig','Gold badge unrecognized');
     box.append(name,tiers,tgs,note);extra.append(box);
    });
    content.append(extra);
   }
  }else if(item.type==='starter'){
   const guided=window.NRW_BEAR_SCREENSHOT_STAGE===6;
   if(guided){
    const label=document.createElement('p');label.className='bear-detail-hero-identity';
    label.textContent=item.detail?.name?
     '✓ '+item.detail.name+' · '+say('Level und Sterne aus der Heldenübersicht übernommen','Level and stars retained from hero overview'):
     '⚠ '+say('Screenshot passt nicht zu den ausgewählten Helden. Bitte richtiges Bild hochladen.','Screenshot does not match your selected heroes. Upload the correct one.');
    content.append(label);
    if(item.detail?.assignedByOrder){
     const warning=document.createElement('p');warning.className='bear-guide-needed';
     warning.textContent=say('Name im Bild nicht erkannt: nach Upload-Reihenfolge zugeordnet. Bitte prüfen.','Name not recognized: paired by upload order. Please verify.');
     content.append(warning);
    }
   }else{
    const picker=document.createElement('label');picker.className='bear-intake-value';
    picker.append(say('Heldenname','Hero name'));
    const name=inputChoice(heroChoices(),item.detail?.name||'');picker.append(name);content.appendChild(picker);
    name.addEventListener('change',()=>{
     item.detail=item.detail||{};
     const prev=cat.heroTypes?.[item.detail.name],next=cat.heroTypes?.[name.value];
     item.detail.name=name.value;
     if(prev!==next){item.detail.expeditionStats={};item.detail.expeditionConflicts=[];}
     renderQueue();
    });
    const lvl=document.createElement('label');lvl.className='bear-intake-value';lvl.textContent='Level';
    const val=document.createElement('input');val.type='number';val.min='0';val.max='80';val.value=item.detail?.level??'';
    val.addEventListener('input',()=>{item.detail=item.detail||{};item.detail.level=val.value===''?null:Number(val.value);});
    lvl.append(val);content.append(lvl);
   }
   const note=document.createElement('p');note.className='hint';
   const hType=cat.heroTypes?.[item.detail?.name];
   const group={infantry:'i',cavalry:'c',archer:'a'}[hType];
   const values=item.detail?.expeditionStats||{};
   const keys=group?['Atk','Def','Let','Hp'].map(k=>group+k):[]; // match Kingshot's row order
   const observed=keys.filter(k=>Number.isFinite(Number(values[k]))&&values[k]!==undefined).length;
   const conflicts=item.detail?.expeditionConflicts||[];
   note.textContent=keys.length?
    say(observed+'/4 Expeditionswerte erkannt. Fehlende oder widersprüchliche Werte bleiben leer. Nur Werte aus dem Bild prüfen/eintragen. GovGear wird NICHT noch einmal addiert.',
        observed+'/4 expedition percentages detected. Missing or contradictory readings remain blank. Confirm only visible screenshot values. Governor gear is NOT added again.'):
    say('Bitte Helden zuordnen, um seine vier Expeditionswerte zu prüfen.',
        'Select a hero to review its four expedition percentage fields.');
   content.append(note);
   if(keys.length){
    const statsBox=document.createElement('div');statsBox.className='bear-detail-observed-stats';
    const names={Atk:say('Angriff','Attack'),Def:say('Verteidigung','Defense'),
     Hp:say('Gesundheit','Health'),Let:say('Tödlichkeit','Lethality')};
    for(const key of keys){
     const field=document.createElement('label');field.className='bear-intake-value';
     field.textContent=names[key.slice(1)]+' (%)';
     const input=document.createElement('input');input.type='number';
     input.step='.01';input.min='0';input.max='5000';
     input.value=values[key]??'';
     if(values[key]===undefined){
      input.placeholder=say('Nicht erkannt','Not recognized');
      field.classList.add('bear-detail-stat-missing');
     }
     if(conflicts.includes(key)){
      const marker=document.createElement('small');marker.className='hint';
      marker.textContent=say('OCR widersprüchlich – bitte ablesen','Conflicting OCR – check screenshot');
      field.append(marker);
     }
     input.addEventListener('input',()=>{
      item.detail.expeditionStats=item.detail.expeditionStats||{};
      const parsed=Number(input.value);
      if(input.value!==''&&Number.isFinite(parsed)&&parsed>=0&&parsed<=5000)
       item.detail.expeditionStats[key]=parsed;
      else delete item.detail.expeditionStats[key];
     });
     field.append(input);statsBox.append(field);
    }
    content.append(statsBox);
   }
  }else if(item.type==='roster'){
   const note=document.createElement('p');note.className='hint';
   const known=(item.cards||[]).filter(c=>c.name).length,total=(item.cards||[]).length;
   note.textContent=say(
    total?known+' von '+total+' vollständigen Heldenkarten erkannt. Namen, Level und Sternfortschritt werden automatisch übernommen. Nur Unsicheres bei Bedarf korrigieren.':
      'Keine vollständige Heldenkarte erkannt. Bitte die Original-Heldenübersicht verwenden und Bilder einzeln prüfen.',
    total?known+' of '+total+' complete hero cards identified. Names, levels and star progress are imported; review only uncertain values.':
      'No complete hero cards detected. Check this is an original in-game hero overview.'
   )+(item.duplicates?' · '+item.duplicates+' '+say('überlappende Karten abgeglichen','overlapping cards cross-checked'):'');
   if(item.matcherInfo){
    const diagnostics=MATCHER?.diagnostics?.();
    if(!item.matcherInfo.available){
     note.textContent+=' · '+say('Porträtreferenzen nicht geladen','Portrait references not loaded')+
      (diagnostics?.error?' ('+diagnostics.error+')':'');
    }else{
     note.textContent+=' · '+item.matcherInfo.available+' '+say('Porträtreferenzen geladen','portrait references loaded');
    }
   }
   content.append(note);
   const grid=document.createElement('div');grid.className='bear-intake-roster';
   (item.cards||[]).forEach((tile,index)=>{
    const cell=document.createElement('div');cell.className='bear-intake-roster-tile';
    const image=new Image();image.src=tile.image;image.alt='Hero '+(index+1);cell.append(image);
    const seen=new Set(tile.suggestions||[]);
    const choices=[['',say('Nicht zuordnen','Skip')],
      ...(tile.suggestions||[]).map(n=>[n,'✦ '+n]),
      ...allKnown().filter(n=>!seen.has(n)).map(n=>[n,n])];
    const name=inputChoice(choices,tile.name);name.setAttribute('aria-label','Hero '+(index+1));
    name.addEventListener('change',()=>{tile.name=name.value;tile.selected=Boolean(tile.name);});
    const level=document.createElement('input');level.type='number';level.min='1';level.max='80';level.value=tile.level??'';level.placeholder='Lv';
    level.addEventListener('change',()=>{tile.level=level.value?Number(level.value):null;tile.levelManual=true;});
    const stars=inputChoice(starOptions(),tile.starSteps??tile.starSuggestion??'');
    stars.addEventListener('change',()=>{
     tile.starSteps=stars.value?Number(stars.value):null;
     tile.starManual=Boolean(tile.starSteps);
     tile.starReview=false;
    });
    const starLabel=(v)=>v===null||v===undefined?'★ ?':
     Math.floor(Number(v)/6)+'★'+(Number(v)%6?' T'+Number(v)%6:'');
    const summaryLine=document.createElement('strong');
    summaryLine.className='bear-hero-found-name';
    const refreshLabel=()=>{
     const proposed=tile.starSteps===null&&tile.starSuggestion!==null&&tile.starSuggestion!==undefined?
      '~'+starLabel(tile.starSuggestion):starLabel(tile.starSteps);
     summaryLine.textContent=(tile.name||say('Held unbekannt','Unknown hero'))+
      ' · '+(tile.level?'Lv '+tile.level:'Lv ?')+' · '+proposed;
    };
    refreshLabel();
    name.addEventListener('change',refreshLabel);
    level.addEventListener('change',refreshLabel);
    stars.addEventListener('change',refreshLabel);
    const edit=document.createElement('details');edit.className='bear-hero-edit';
    const editSummary=document.createElement('summary');
    editSummary.textContent=tile.name&&tile.level&&tile.starSteps!==null&&!tile.starReview&&
     (tile.levelConfidence==='verified'||tile.levelManual)?
     say('Erkennung korrigieren','Correct recognition'):say('Level / fehlende Daten prüfen','Review level / missing details');
    edit.append(editSummary,name,level,stars);
    // A single OCR result is a proposal, not an independently proven level.
    edit.open=!(tile.name&&tile.level&&tile.starSteps!==null&&!tile.starReview&&
     (tile.levelConfidence==='verified'||tile.levelManual));
    const certainty=document.createElement('small');certainty.className='hint';
    certainty.textContent=tile.nameConfidence==='high'?
     say('Bild mit Referenz abgeglichen – Namen bitte prüfen','Image matched to reference – check the name'):
     say('Bildname nicht bestätigt','Portrait unconfirmed');
    if(tile.levelConfidence==='suggested'){
     const lvNote=document.createElement('small');lvNote.className='hint';
     lvNote.textContent=say('Levelvorschlag – bitte prüfen','Suggested level – please verify');
     cell.append(lvNote);
    }
    if(tile.starReview){
     const starNote=document.createElement('small');starNote.className='hint';
     const proposed=tile.starSuggestion!==null&&tile.starSuggestion!==undefined?
      starLabel(tile.starSuggestion):null;
     starNote.textContent=proposed?
      say('Stern-Vorschlag '+proposed+' – bitte auswählen und bestätigen',
       'Suggested stars '+proposed+' – please select to confirm'):
      say('Sternfortschritt unklar – bitte auswählen',
       'Uncertain stars – please select');
     cell.append(starNote);
    }
    if(tile.starReview&&tile.starSuggestion!==null&&tile.starSuggestion!==undefined){
     const accept=document.createElement('button');accept.type='button';
     accept.className='secondary-btn bear-star-accept';
     accept.textContent=say('Sternvorschlag bestätigen','Confirm suggested stars');
     accept.addEventListener('click',()=>{
      tile.starSteps=tile.starSuggestion;tile.starReview=false;tile.starManual=true;
      stars.value=String(tile.starSteps);refreshLabel();
      accept.remove();
      edit.open=tile.levelConfidence!=='verified'&&!tile.levelManual;
     });
     cell.append(accept);
    }
    cell.append(summaryLine,certainty,edit);grid.append(cell);
   });
   content.append(grid);
  }else{
   const note=document.createElement('p');note.className='hint';
   note.textContent=item.type==='gear'?say('GovGear wird über den bereits vorhandenen, spezialisierten Importer erkannt.','GovGear uses the dedicated visual gear importer.'):say('Bildtyp nicht erkannt. Typ oben auswählen oder weglassen.','Screenshot type unknown. Select a type or skip.');
   content.append(note);
  }
  card.append(content);holder.append(card);
 });
}
function availableOwned(){
 const m=B.model(),api=window.NRW_BEAR_IMPORTED_HEROES||[];
 return [...new Map([...api,...Object.values(state().manualHeroes)].filter(h=>h&&h.name).map(h=>[h.name,h])).values()];
}
function updateAdvisor(){
 const m=B.model(),v=state();
 const advice=Core.advise(availableOwned(),v.ownHeroes,cat.heroTypes);
 const box=$('intakeAdvice');box.innerHTML='';
 if(!advice.length)return;
 const heading=document.createElement('strong');heading.textContent='🐻 '+say('Mögliche bessere Bear-Starter','Potentially better Bear starters');box.append(heading);
 for(const a of advice){
  const line=document.createElement('p');line.textContent=a.suggestion+' statt '+a.current+' ('+a.type+') – '+a.reason;box.append(line);
 }
 const source=document.createElement('a');source.href='https://ks-atlas.com/tools/atlas-database/bear-rally-heroes';source.target='_blank';source.rel='noopener noreferrer';source.textContent='KS Atlas · Bear Rally Heroes';box.append(source);
}
function updateProgress(){
 const v=B.model()?.values||{};
 const present=required.filter(id=>Number.isFinite(Number(v[id]))&&v[id]!==undefined).length;
 const own=state().ownHeroes.filter(Boolean).length;
 $('intakeProgress').textContent=present+'/'+required.length+' '+say('Pflichtwerte','required values')+' · '+own+'/3 Starter';
 const missing=required.filter(k=>v[k]===undefined).map(k=>captions[k]);
 const tier=(state().troopTiers||[]).filter(t=>Number(t.tier)>=1).length;
 $('intakeMissing').textContent=missing.length? say('Fehlt: ','Missing: ')+missing.join(', '):tier<3?say('Truppen-T-Stufen fehlen noch im Detailbereich.','Troop tiers still needed in details.'):say('Grundwerte vollständig; Modellvergleich möglich.','Base values present; model ready.');
 updateAdvisor();
}
function apply(){
 const m=B.model(),v=state();
 let accepted=0;
 const appliedTypes=[],appliedNames=[];
 for(const item of queue){
  if(item.type==='troops'||item.type==='stats'){
   if(Object.keys(item.values).length)appliedTypes.push(item.type);
   if(item.type==='stats'&&Object.keys(item.values).length){
    // Screenshot classification: bonus overview shows independent CLASS and
    // SQUAD values. A battle report may already contain their combined total.
    // Keep a manual override authoritative, but record the import's origin
    // when there is positive evidence for separate components.
    const stats=item.values,combined=String(item.text||'')+' '+String(item.grouped||'');
    const hasClass=['iAtk','iLet','cAtk','cLet','aAtk','aLet']
      .some(key=>Object.prototype.hasOwnProperty.call(stats,key));
    const hasSquad=['squadAtk','squadLet'].some(key=>
      Object.prototype.hasOwnProperty.call(stats,key));
    const bonusOverview=/bonus[\s\-]*(?:\u00fc|u|ue)bersicht|bonus\s+overview|bonus\s+details|apercu\s+des?\s+bonus|resumen\s+de\s+bonificaciones/i.test(Core.fold(combined));
    if((hasClass&&hasSquad)||(hasClass&&bonusOverview))
      v.combatStatDetectedOrigin='separate-overview';
   }
   for(const [key,num] of Object.entries(item.values)){
    if(!Number.isFinite(Number(num))||Number(num)<0)continue;
    m.values[key]=Number(num);const input=$(key);if(input){input.value=num;input.dispatchEvent(new Event('input',{bubbles:true}));}
    accepted++;
   }
   if(item.type==='troops'&&Array.isArray(item.troopEntries)&&item.troopEntries.length){
    v.troopEntries=item.troopEntries.map(e=>({type:e.type,label:e.label,count:e.count,
     icon:e.icon,crop:e.crop}));
    const totals=ENTRY.totals(item.troopEntries);
    for(const type of new Set(item.troopEntries.map(e=>e.type))){
     const key=['troopsI','troopsC','troopsA'][type];
     if(!Object.prototype.hasOwnProperty.call(totals,key)){
      delete m.values[key];
      const input=$(key);if(input)input.value='';
     }
    }
   }
   if(item.type==='troops'&&Number(item.marchSlots)>=1&&Number(item.marchSlots)<=7&&
      (!v.marchCountConfirmed || v.marchCountSource==='screenshot')){
    v.joinCount=Number(item.marchSlots)-1;
    v.marchCountConfirmed=true;v.marchCountSource='screenshot';
   }
   if(item.type==='troops'&&Array.isArray(item.troopTiers)&&
    (!item.troopEntries?.length||(item.troopEntries.length===3&&new Set(item.troopEntries.map(e=>e.type)).size===3))){
    if(!Array.isArray(v.troopTiers)||v.troopTiers.length!==3)v.troopTiers=[{tier:0,tg:null},{tier:0,tg:null},{tier:0,tg:null}];
    item.troopTiers.forEach((suggestion,index)=>{
     const dest=v.troopTiers[index];if(!suggestion)return;
     if(suggestion.tier!==null&&Number.isInteger(suggestion.tier)){
      dest.tier=suggestion.tier;
      const input=document.querySelector('.bear-troop-tier[data-idx="'+index+'"]');if(input)input.value=dest.tier;accepted++;
     }
     if(suggestion.tg!==null&&Number.isInteger(suggestion.tg)){
      dest.tg=suggestion.tg;
      const input=document.querySelector('.bear-troop-tg[data-idx="'+index+'"]');if(input)input.value=dest.tg;accepted++;
     }
    });
   }
  }else if(item.type==='starter'&&item.detail?.name){
   appliedTypes.push('starter');
   const h=item.detail;appliedNames.push(h.name);const previous=v.manualHeroes[h.name]||{};
   v.manualHeroes[h.name]={...previous,name:h.name,level:
     window.NRW_BEAR_SCREENSHOT_STAGE===6?(previous.level||0):(h.level||previous.level||0),
    // Detail photos are taken AFTER fitting best simultaneous gear; do
    // not back-fill missing new numbers from an older pre-gear screenshot.
    expeditionStats:{...(h.expeditionStats||{})},source:'screenshot'};
   const slot=['infantry','cavalry','archer'].indexOf(cat.heroTypes[h.name]);
   if(slot>=0&&!v.ownHeroes[slot])v.ownHeroes[slot]=h.name;
   accepted++;
  }else if(item.type==='roster'){
   if(item.cards?.length||item.duplicates)appliedTypes.push('roster');
   // Start one authoritative owned-hero inventory per new screenshot set.
   // Partial overlapping batches add to it without re-introducing old heroes.
   if(confirmedPortraits.length===0)v.scannedOwnedHeroes=[];
   if(!Array.isArray(v.scannedOwnedHeroes))v.scannedOwnedHeroes=[];
   for(const tile of item.cards||[])if(tile.signature)confirmedPortraits.push({signature:tile.signature});
   for(const tile of item.cards){
    if(!tile.name)continue;
    if(!v.scannedOwnedHeroes.includes(tile.name))v.scannedOwnedHeroes.push(tile.name);
    const old=v.manualHeroes[tile.name]||{};
    // A freshly scanned but ambiguous star bar must not inherit an
    // older, possibly false screenshot estimate and distort the Bear picks.
    // Explicitly unknown progress remains 0 until manually confirmed.
    const stars=tile.starSteps===null?0:Math.floor(tile.starSteps/6);
    const tier=tile.starSteps===null?0:tile.starSteps%6;
    const cap=Core.maxSkill(stars);
    const actualSkills=Array.isArray(old.skills)&&old.skills.some(Number)&&old.skillsAssumedMax===false;
    v.manualHeroes[tile.name]={...old,name:tile.name,level:tile.level||old.level||0,stars,tier,
     starPendingReview:tile.starSteps===null,
     skills:actualSkills?old.skills:(cap?[cap,cap,cap]:[0,0,0]),
     skillsAssumedMax:!actualSkills,source:'screenshot'};
    accepted++;
   }
  }else if(item.type==='gear'){
   // Hand this screenshot to the existing specialized 6-gear/18-charm
   // browser-local importer. It retains its own separate review/confirm.
   try{
    const input=$('bearGearPhoto'),transfer=new DataTransfer();
    if(!input||!item.file)throw Error('missing file');
    transfer.items.add(item.file);input.files=transfer.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
    const details=input.closest('details');if(details)details.open=true;
   }catch(_){const details=$('bearGearPhoto')?.closest('details');if(details)details.open=true;
    status(say('GovGear-Screenshot bitte im ausklappbaren Import überprüfen.','Review GovGear in the dedicated screenshot importer.'));
   }
  }
 }
 // Governor Gear remains included in the screenshot class bonuses. The
 // scorer composes independently captured squad and hero details exactly
 // once when provenance confirms a separated Bonus Overview.
 // Clear only legacy checkbox state. The independent source-origin marker
 // is preserved for the new audited combat-stat composer.
 v.squadSeparate=false;const toggle=$('squadSeparate');if(toggle)toggle.checked=false;
 B.save();B.render();window.NRW_BEAR_ENHANCE?.refreshHeroes?.();
 updateProgress();status(accepted+' '+say('Angaben lokal gespeichert; unbekannte Werte bleiben unverändert.','values saved locally. Unknown values untouched.'));
 queue=[];renderQueue();
 window.dispatchEvent(new CustomEvent('nrw-bear-intake-applied',{
  detail:{accepted,types:[...new Set(appliedTypes)],names:[...new Set(appliedNames)]}
 }));
}
$('intakeApply').addEventListener('click',apply);
$('intakeClear').addEventListener('click',()=>{queue=[];renderQueue();status(say('Import verworfen.','Import discarded.'));});
$('intakeFiles').addEventListener('change',async e=>{
 const files=[...e.target.files||[]].filter(f=>f.type.startsWith('image/')).slice(0,12);
 e.target.value='';if(!files.length||busy)return;busy=true;$('intakeFiles').disabled=true;screenshotLang.disabled=true;
 let success=0;
 for(let i=0;i<files.length;i++){
  status((i+1)+'/'+files.length+' · '+files[i].name);
  try{queue.push(await inspect(files[i]));success++;}
  catch(err){queue.push({fileName:files[i].name,type:'unknown',text:'',values:{},detail:null,cards:[],error:String(err)});}
 }
 busy=false;$('intakeFiles').disabled=false;screenshotLang.disabled=false;
 status(success+'/'+files.length+' '+say('Bilder gelesen. Bitte alle Vorschläge prüfen und übernehmen.','screenshots read. Review and apply suggestions.'));
 renderQueue();
});
// Other guided screenshot steps reuse the same local OCR worker.
window.NRW_BEAR_GET_OCR=loadOCR;
window.addEventListener('nrw-bear-loaded',()=>{
 confirmedPortraits.length=0; // a different governor must start a fresh image inventory
 updateProgress();
});
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(updateProgress,0)));
document.querySelectorAll('input').forEach(input=>{if(input.id&&required.includes(input.id))input.addEventListener('input',updateProgress);});
updateProgress();
})();