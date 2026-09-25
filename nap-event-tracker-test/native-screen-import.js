/* Native, single-session ScreenRecording for the V2 test app.
 * The recording never leaves the browser. Only reviewed OCR hits and small
 * evidence still frames are sent to the existing protected Supabase RPCs.
 */
(()=>{'use strict';
if(window.NAP_NATIVE_IMPORTER)return;
const API='https://bdzlgirowutasrsycjfj.supabase.co';
const KEY='sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL';
const SESSION_KEY='nap_v4_supabase_session';
const EVENTS=['Strongest Governor','Alliance Brawl','Officer Project','Armament Competition'];
const PHASES={
 'Strongest Governor':[['sg1','Day 1'],['sg2','Day 2'],['sg3','Day 3'],['sg4','Day 4'],['sg5','Day 5'],['sg6','Day 6'],['sg7','Day 7']],
 'Alliance Brawl':[['b1','Day 1'],['b2','Day 2'],['b3','Day 3'],['b4','Day 4'],['b5','Day 5'],['b6','Day 6']],
 'Officer Project':[['op1','Charms'],['op2','Forgehammers']],
 'Armament Competition':[['ac1','Phase 1'],['ac2','Truegold']]
};
const WORDS={
 de:{event:'Event',day:'Eventtag / Phase',occ:'Event-Durchlauf',date:'Aufnahmetag (UTC)',file:'ScreenRecording auswählen',analyze:'Video analysieren',review:'Ergebnisse prüfen',save:'Geprüfte Treffer speichern',choose:'Bitte zuerst Event, Tag und Video auswählen.',prep:'Video wird vorbereitet',recognize:'Spieler und Punkte erkennen',check:'Ergebnisse zusammenstellen',ready:'Fertig. Prüfe die erkannten Werte.',video:'Das Video bleibt auf deinem Gerät. Nur geprüfte Ergebnisse und Evidence-Bilder werden gespeichert.',found:'Erkannte Spieler',score:'Punkte',rank:'Rang',name:'Spieler',alliance:'Allianz',unmatched:'Nicht sicher zugeordnet – bitte manuell prüfen',nohits:'Keine eindeutigen Treffer. Bitte Aufnahme und Eventauswahl prüfen.',error:'Analyse fehlgeschlagen',saving:'Geprüfte Treffer werden gespeichert …',done:'Import abgeschlossen',upload:'Evidence-Bilder speichern …',retryEvidence:'Evidence erneut speichern',evidenceRetrying:'Evidence wird erneut gespeichert …',evidenceSaved:'Evidence gespeichert',evidenceFailed:'Evidence konnte nicht vollständig gespeichert werden',duplicate:'Dieses Video wurde bereits erfasst.',type:'Performance-Art',needRank:'KvK Top 200: nur Einträge mit Rang 1–200 werden gespeichert.',prohibit:'TriAlliance und Swordland werden ausschließlich manuell erfasst.',wrongDay:'Der ausgewählte Tag liegt außerhalb des Event-Durchlaufs.',retry:'Erneut analysieren',missingEvent:'Kein passender Event-Durchlauf gefunden.',frame:'Erkanntes Bild',result:'Serverprüfung',invalid:'Bitte zuerst den tatsächlichen Eventtag wählen.',assign:'Spieler zuordnen',selectPlayer:'Spieler auswählen',manual:'Manuell zugeordnet'},
 en:{event:'Event',day:'Event day / phase',occ:'Event occurrence',date:'Recording day (UTC)',file:'Choose recording',analyze:'Analyze video',review:'Review results',save:'Save reviewed hits',choose:'Choose the event, day and video first.',prep:'Preparing video',recognize:'Recognizing players and scores',check:'Preparing results',ready:'Done. Review the detected values.',video:'Your video stays on your device. Only reviewed results and evidence stills are saved.',found:'Detected players',score:'Score',rank:'Rank',name:'Player',alliance:'Alliance',unmatched:'Not confidently matched – review manually',nohits:'No clear matches. Check your recording and event.',error:'Analysis failed',saving:'Saving reviewed hits …',done:'Import complete',upload:'Saving evidence stills …',retryEvidence:'Retry evidence upload',evidenceRetrying:'Retrying evidence upload …',evidenceSaved:'Evidence saved',evidenceFailed:'Evidence could not be fully saved',duplicate:'This video has already been imported.',type:'Performance type',needRank:'KvK Top 200: only ranks 1–200 are saved.',prohibit:'TriAlliance and Swordland are manual only.',wrongDay:'The selected day is outside this occurrence.',retry:'Analyze again',missingEvent:'No matching occurrence found.',frame:'Detected frame',result:'Server check',invalid:'Select the actual event day first.',assign:'Assign player',selectPlayer:'Select player',manual:'Manually matched'},
 fr:{event:'Événement',day:'Jour / phase',occ:'Session',date:'Jour de vidéo (UTC)',file:'Choisir une vidéo',analyze:'Analyser',review:'Vérifier les résultats',save:'Enregistrer les résultats vérifiés',choose:'Choisissez événement, jour et vidéo.',prep:'Préparation vidéo',recognize:'Reconnaissance des joueurs et scores',check:'Préparation des résultats',ready:'Terminé. Vérifiez les valeurs.',video:'La vidéo reste sur votre appareil. Seuls les résultats vérifiés et les preuves sont enregistrés.',found:'Joueurs détectés',score:'Points',rank:'Rang',name:'Joueur',alliance:'Alliance',unmatched:'Association incertaine : vérification manuelle',nohits:'Aucun résultat fiable.',error:'Échec de l’analyse',saving:'Enregistrement …',done:'Import terminé',upload:'Enregistrement des preuves …',retryEvidence:'Réessayer les preuves',evidenceRetrying:'Nouvel enregistrement des preuves …',evidenceSaved:'Preuves enregistrées',evidenceFailed:'Les preuves n’ont pas toutes été enregistrées',duplicate:'Vidéo déjà importée.',type:'Type de performance',needRank:'KvK Top 200 : rangs 1–200 uniquement.',prohibit:'TriAlliance et Swordland : saisie manuelle uniquement.',wrongDay:'Jour hors de cet événement.',retry:'Analyser à nouveau',missingEvent:'Aucune session trouvée.',frame:'Image',result:'Vérification serveur',invalid:'Choisissez le jour réel de l’événement.',assign:'Associer un joueur',selectPlayer:'Choisir un joueur',manual:'Associé manuellement'},
 es:{event:'Evento',day:'Día / fase',occ:'Edición del evento',date:'Día del vídeo (UTC)',file:'Elegir vídeo',analyze:'Analizar vídeo',review:'Revisar resultados',save:'Guardar resultados revisados',choose:'Selecciona evento, día y vídeo.',prep:'Preparando vídeo',recognize:'Reconociendo jugadores y puntos',check:'Preparando resultados',ready:'Listo. Revisa los valores.',video:'El vídeo permanece en tu dispositivo. Solo se guardan resultados revisados y capturas de prueba.',found:'Jugadores detectados',score:'Puntos',rank:'Puesto',name:'Jugador',alliance:'Alianza',unmatched:'Sin coincidencia segura: revisar manualmente',nohits:'No hay resultados claros.',error:'Error de análisis',saving:'Guardando resultados …',done:'Importación completada',upload:'Guardando pruebas …',retryEvidence:'Reintentar pruebas',evidenceRetrying:'Reintentando guardar pruebas …',evidenceSaved:'Pruebas guardadas',evidenceFailed:'No se pudieron guardar todas las pruebas',duplicate:'Vídeo ya importado.',type:'Tipo de rendimiento',needRank:'KvK Top 200: solo puestos del 1 al 200.',prohibit:'TriAlliance y Swordland solo se registran manualmente.',wrongDay:'Día fuera del evento.',retry:'Analizar de nuevo',missingEvent:'No hay ninguna edición disponible.',frame:'Imagen',result:'Comprobación servidor',invalid:'Selecciona el día real del evento.',assign:'Asignar jugador',selectPlayer:'Seleccionar jugador',manual:'Asignado manualmente'}
};
const REVIEW_WORDS={"de":{"violation":["Verstoß erkannt","Über der geltenden Grenze. Kann als Verstoß gespeichert werden."],"update":["Bereits erfasst · Punkte aktualisieren","Der Verstoß ist bereits erfasst. Nur die höhere Punktzahl wird übernommen – keine neue Sanktionsstufe."],"exempt":["Ausgenommen","Für diesen Spieler gilt eine Spending Exclusion. Kein Law-14-Verstoß."],"already_recorded":["Bereits erfasst · kein Update","Ein gleicher oder höherer Wert ist bereits gespeichert. Kein weiterer Verstoß."],"below_limit":["Innerhalb der Grenze","Der Punktestand überschreitet die geltende Grenze nicht."],"target_missing":["Zielwert fehlt","Bitte den Zielwert in den Einstellungen prüfen; kein automatischer Verstoß."],"unresolved":["Nicht zugeordnet","Bitte den Spieler vor dem Speichern prüfen."],"performance":["Performance erkannt","Punkte prüfen und bei Bedarf korrigieren."],"addPlayer":"Fehlenden Spieler hinzufügen","addHint":"Fehlt jemand vollständig im OCR? Wähle den Spieler aus dem Server-Roster und trage die Punkte selbst ein.","search":"Spielername, ID oder Allianz suchen","scorePlaceholder":"z. B. 1.234.567","evidence":"Beweisbild aus dem Video","add":"Spieler übernehmen","invalidScore":"Bitte eine gültige ganze Punktzahl eingeben.","higher":"Für diesen Spieler ist bereits ein gleicher oder höherer Wert vorhanden.","missingPlayer":"Bitte einen Spieler aus der Liste auswählen.","missingRank":"Bitte einen KvK-Rang von 1 bis 200 eingeben.","manual":"Manuell ergänzt","preview":"Prüfung wird aktualisiert …","nothing":"Noch kein Spieler erkannt. Du kannst unten Spieler manuell ergänzen.","was":"Bisherige Tage","now":"Neuer Wert","newCount":"Neue Verstöße","updateCount":"Punkte-Updates","alreadyCount":"Bereits erfasst","noChanges":"Keine neuen Verstöße oder höheren Punktzahlen zu speichern.","chooseAlliance":"Allianz auswählen","alliancePower":"Allianzkraft","notAvailable":"Ohne Kraftwert","exemptShort":"Ausgenommen – nicht zu speichern","exemptCollapsed":"Ausgenommene Spieler","exemptNote":"Für diese Spieler wird kein Law-14-Verstoß angelegt. Die Details sind bewusst ausgeblendet.","newViolationOne":"neuer Verstoß","newViolationMany":"neue Verstöße","scoreUpdateOne":"Punktestand aktualisiert","scoreUpdateMany":"Punktestände aktualisiert","alreadyOne":"bereits unverändert erfasst","alreadyMany":"bereits unverändert erfasst","importedPerformanceOne":"Performance-Eintrag gespeichert","importedPerformanceMany":"Performance-Einträge gespeichert","notMatchedOne":"nicht übernommen","notMatchedMany":"nicht übernommen","noDataChanged":"Keine neuen Verstöße oder höheren Punktzahlen gespeichert.","existingVideo":"Video wurde bereits eingelesen; nur höhere Werte werden übernommen.","dayUpdated":"Datum und Eventtag aktualisiert.","dayReadOnly":"Aufnahmedatum ändern (UTC)","saveSummary":"Import abgeschlossen"},"en":{"violation":["Violation detected","Above the applicable limit. Can be saved as a violation."],"update":["Already tracked · update points","The violation is already recorded. Only the higher score will be saved; no new sanction step."],"exempt":["Exempt","An active spending exclusion applies. No Law 14 violation."],"already_recorded":["Already tracked · no update","An equal or higher score is already stored. No additional violation."],"below_limit":["Within the limit","This score does not exceed the applicable limit."],"target_missing":["Target missing","Check the target in settings; no automatic violation."],"unresolved":["Unmatched","Review the player before saving."],"performance":["Performance detected","Review and correct the score if needed."],"addPlayer":"Add a missing player","addHint":"Missing from OCR entirely? Pick the player from the kingdom roster and enter the score.","search":"Search name, ID or alliance","scorePlaceholder":"e.g. 1.234.567","evidence":"Evidence frame from the video","add":"Add player","invalidScore":"Enter a valid whole-number score.","higher":"An equal or higher score is already present for this player.","missingPlayer":"Choose a player from the list.","missingRank":"Enter a KvK rank from 1 to 200.","manual":"Added manually","preview":"Refreshing rule check …","nothing":"No player recognized yet. You can add a player manually below.","was":"Earlier days","now":"New score","newCount":"New violations","updateCount":"Score updates","alreadyCount":"Already tracked","noChanges":"No new violations or higher scores to save.","chooseAlliance":"Choose alliance","alliancePower":"Alliance power","notAvailable":"No power data","exemptShort":"Exempt – not to be saved","exemptCollapsed":"Exempt players","exemptNote":"No Law 14 violation will be created for these players. Details are hidden by default.","newViolationOne":"new violation","newViolationMany":"new violations","scoreUpdateOne":"score updated","scoreUpdateMany":"scores updated","alreadyOne":"already recorded without change","alreadyMany":"already recorded without change","importedPerformanceOne":"performance entry saved","importedPerformanceMany":"performance entries saved","notMatchedOne":"not imported","notMatchedMany":"not imported","noDataChanged":"No new violations or higher scores saved.","existingVideo":"Recording was imported before; only higher values are applied.","dayUpdated":"Date and event day updated.","dayReadOnly":"Edit recording date (UTC)","saveSummary":"Import complete"},"fr":{"violation":["Infraction détectée","Au-dessus de la limite. Peut être enregistrée."],"update":["Déjà enregistré · points actualisés","L’infraction est déjà enregistrée. Seul le score supérieur sera enregistré, sans nouvelle sanction."],"exempt":["Exempté","Exclusion des dépenses active. Pas d’infraction Law 14."],"already_recorded":["Déjà enregistré · aucun changement","Un score égal ou supérieur existe déjà. Pas de nouvelle infraction."],"below_limit":["Dans la limite","Le score ne dépasse pas le plafond applicable."],"target_missing":["Objectif manquant","Vérifier l’objectif dans les paramètres ; pas d’infraction automatique."],"unresolved":["Non attribué","Vérifier le joueur avant enregistrement."],"performance":["Performance détectée","Vérifier et corriger le score si nécessaire."],"addPlayer":"Ajouter un joueur manquant","addHint":"Joueur absent de l’OCR ? Choisissez-le dans la liste du royaume et saisissez ses points.","search":"Rechercher nom, ID ou alliance","scorePlaceholder":"ex. 1.234.567","evidence":"Image de preuve de la vidéo","add":"Ajouter le joueur","invalidScore":"Saisir un score entier valide.","higher":"Un score égal ou supérieur existe déjà pour ce joueur.","missingPlayer":"Choisissez un joueur.","missingRank":"Saisissez un rang KvK entre 1 et 200.","manual":"Ajouté manuellement","preview":"Actualisation du contrôle …","nothing":"Aucun joueur reconnu. Vous pouvez en ajouter manuellement.","was":"Jours précédents","now":"Nouveau score","newCount":"Nouvelles infractions","updateCount":"Scores actualisés","alreadyCount":"Déjà enregistrés","noChanges":"Aucune nouvelle infraction ni hausse à enregistrer.","chooseAlliance":"Choisir une alliance","alliancePower":"Puissance d’alliance","notAvailable":"Puissance inconnue","exemptShort":"Exemptés – ne pas enregistrer","exemptCollapsed":"Joueurs exemptés","exemptNote":"Aucune infraction Law 14 ne sera créée pour ces joueurs. Détails masqués par défaut.","newViolationOne":"nouvelle infraction","newViolationMany":"nouvelles infractions","scoreUpdateOne":"score actualisé","scoreUpdateMany":"scores actualisés","alreadyOne":"déjà enregistré sans changement","alreadyMany":"déjà enregistrés sans changement","importedPerformanceOne":"performance enregistrée","importedPerformanceMany":"performances enregistrées","notMatchedOne":"non importé","notMatchedMany":"non importés","noDataChanged":"Aucune nouvelle infraction ou hausse enregistrée.","existingVideo":"Vidéo déjà importée ; seules les valeurs supérieures sont reprises.","dayUpdated":"Date et jour d’événement actualisés.","dayReadOnly":"Modifier la date de la vidéo (UTC)","saveSummary":"Import terminé"},"es":{"violation":["Infracción detectada","Supera el límite aplicable. Se puede guardar."],"update":["Ya registrado · actualizar puntos","La infracción ya consta. Solo se guardará la puntuación mayor, sin otra sanción."],"exempt":["Exento","Tiene una exclusión de gasto activa. No hay infracción de Law 14."],"already_recorded":["Ya registrado · sin cambios","Ya hay una puntuación igual o superior. No hay una infracción adicional."],"below_limit":["Dentro del límite","No supera el límite aplicable."],"target_missing":["Falta objetivo","Revisa el objetivo en ajustes; no hay infracción automática."],"unresolved":["Sin asignar","Revisa el jugador antes de guardar."],"performance":["Rendimiento detectado","Revisa y corrige la puntuación si es necesario."],"addPlayer":"Añadir jugador omitido","addHint":"¿No aparece en el OCR? Selecciona al jugador de la lista del reino e introduce sus puntos.","search":"Buscar nombre, ID o alianza","scorePlaceholder":"p. ej. 1.234.567","evidence":"Captura de prueba del vídeo","add":"Añadir jugador","invalidScore":"Introduce una puntuación entera válida.","higher":"Ya existe una puntuación igual o mayor para este jugador.","missingPlayer":"Selecciona un jugador.","missingRank":"Introduce un puesto KvK entre 1 y 200.","manual":"Añadido manualmente","preview":"Actualizando comprobación …","nothing":"Ningún jugador reconocido aún. Puedes añadir uno manualmente.","was":"Días anteriores","now":"Nueva puntuación","newCount":"Nuevas infracciones","updateCount":"Puntos actualizados","alreadyCount":"Ya registrados","noChanges":"No hay nuevas infracciones ni puntuaciones superiores.","chooseAlliance":"Seleccionar alianza","alliancePower":"Poder de alianza","notAvailable":"Poder desconocido","exemptShort":"Exentos – no guardar","exemptCollapsed":"Jugadores exentos","exemptNote":"No se registrará ninguna infracción Law 14 para estos jugadores. Detalles ocultos por defecto.","newViolationOne":"infracción nueva","newViolationMany":"infracciones nuevas","scoreUpdateOne":"puntuación actualizada","scoreUpdateMany":"puntuaciones actualizadas","alreadyOne":"ya registrado sin cambios","alreadyMany":"ya registrados sin cambios","importedPerformanceOne":"rendimiento guardado","importedPerformanceMany":"rendimientos guardados","notMatchedOne":"no importado","notMatchedMany":"no importados","noDataChanged":"No se guardaron infracciones nuevas ni puntuaciones superiores.","existingVideo":"Vídeo ya importado; solo se aplican valores mayores.","dayUpdated":"Fecha y día de evento actualizados.","dayReadOnly":"Cambiar fecha del vídeo (UTC)","saveSummary":"Importación completada"}};
const POST_CONTACT_WORDS={
 de:{
  title:'Weiteres Ausgeben nach Kontakt bestätigen',
  hint:'Nur bestätigen, wenn sicher ist, dass der Spieler nach der Kontaktaufnahme erneut ausgegeben hat. Ein höherer OCR-Wert allein ist kein Beweis.'
 },
 en:{
  title:'Confirm additional spending after contact',
  hint:'Only confirm if you know the player spent again after being contacted. A higher OCR score alone is not proof.'
 },
 fr:{
  title:'Confirmer des dépenses supplémentaires après contact',
  hint:'Confirmez uniquement si vous savez que le joueur a de nouveau dépensé après avoir été contacté. Un score OCR plus élevé ne constitue pas une preuve.'
 },
 es:{
  title:'Confirmar gasto adicional después del contacto',
  hint:'Confirma solo si sabes que el jugador volvió a gastar después del contacto. Una puntuación OCR más alta por sí sola no es una prueba.'
 }
};
function postContactText(key){const d=POST_CONTACT_WORDS[lang()]||POST_CONTACT_WORDS.en;return d[key]||key}
const reviewText=(key)=>((REVIEW_WORDS[lng()]||REVIEW_WORDS.de)[key]||key);
const points=n=>Number(n).toLocaleString('de-DE');
const NAP_ORDER=['NWO','THM','CWR','NRW','PxR','NwO'];
let alliancePower=new Map();
const alphabeticalRoster=members=>members.map((p,i)=>({p,i})).sort((a,b)=>String(a.p.player_name||'').localeCompare(String(b.p.player_name||''),'de',{sensitivity:'base',numeric:true})||String(a.p.player_game_id||'').localeCompare(String(b.p.player_game_id||''),'de',{numeric:true}));
function orderedAlliances(members){
 const names=[...new Set(members.map(p=>p.alliance_code).filter(Boolean))];
 return names.sort((a,b)=>{
  const pa=Number(alliancePower.get(a)||0),pb=Number(alliancePower.get(b)||0);
  if(pa>0&&pb>0&&pa!==pb)return pb-pa;
  if(pa>0)return -1;if(pb>0)return 1;
  const ai=NAP_ORDER.indexOf(a),bi=NAP_ORDER.indexOf(b);
  if(ai>=0&&bi>=0)return ai-bi;
  if(ai>=0)return -1;if(bi>=0)return 1;
  return a.localeCompare(b,'de',{sensitivity:'base',numeric:true});
 });
}
function allianceOptions(members){
 return orderedAlliances(members).map(a=>selectOption(a+(alliancePower.get(a)?' · '+reviewText('alliancePower')+' '+points(alliancePower.get(a)):'') ,a)).join('');
}
const parsePoints=raw=>{const x=String(raw??'').trim();if(!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(x))return null;const n=Number(x.replace(/\./g,''));return Number.isSafeInteger(n)&&n>=0?n:null};
const $=(s,root=document)=>root.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const lng=()=>$('#languagePicker')?.value||'de';
const tr=k=>(WORDS[lng()]||WORDS.de)[k]||k;
const fmt=x=>Number(x||0).toLocaleString(lng()==='de'?'de-DE':lng()==='fr'?'fr-FR':lng()==='es'?'es-ES':'en-US');
let run=null,workerPromise=null,rosterPromise=null;
function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
async function headers(json=true){
 let s=getSession();if(!s?.access_token)throw Error('Your V2 session expired. Please sign in again.');
 if(s.expires_at&&s.expires_at<Date.now()/1000+40&&s.refresh_token){
  const r=await fetch(API+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
  if(!r.ok)throw Error('Your V2 session expired. Please sign in again.');
  const d=await r.json();s={...d,expires_at:Math.floor(Date.now()/1000)+(d.expires_in||3600)};localStorage.setItem(SESSION_KEY,JSON.stringify(s));
 }
 return {apikey:KEY,Authorization:'Bearer '+s.access_token,...(json?{'Content-Type':'application/json'}:{})};
}
async function rpc(name,body={}){
 const r=await fetch(API+'/rest/v1/rpc/'+name,{method:'POST',headers:await headers(),body:JSON.stringify(body)});
 const raw=await r.text();let result;try{result=raw?JSON.parse(raw):null}catch{result=raw}
 if(!r.ok)throw Error(result?.message||result?.error||String(result)||'HTTP '+r.status);
 return result;
}
function canPassThroughForEvidence(status,hasImage){
 return status==='violation'||status==='update'||(status==='already_recorded'&&!!hasImage);
}
async function uploadEvidencePayload(item){
 const res=await fetch(API+'/functions/v1/screen-evidence-upload',{
  method:'POST',headers:await headers(),body:JSON.stringify(item)
 });
 if(!res.ok){const err=await res.text();throw Error('Evidence '+res.status+': '+err.slice(0,180))}
 return true;
}
async function uploadEvidenceBatch(items,attempts=3){
 const failed=[];
 for(const item of items){
  let last=null,ok=false;
  for(let attempt=0;attempt<attempts;attempt++){
   try{await uploadEvidencePayload(item);ok=true;break}
   catch(err){last=err;if(attempt+1<attempts)await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)))}
  }
  if(!ok)failed.push({...item,_error:String(last?.message||last||'Evidence upload failed')});
 }
 return failed;
}
async function retryPendingEvidence(){
 const r=run,root=r?.root;if(!r||r.busy||!root?.isConnected||!r.pendingEvidence?.length)return;
 const out=$('#nocrSaveStatus',root),button=$('#nocrEvidenceRetry',root);
 r.busy=true;button.disabled=true;out.textContent=tr('evidenceRetrying');
 try{
  const failed=await uploadEvidenceBatch(r.pendingEvidence,3);
  r.pendingEvidence=failed;
  if(failed.length){
   out.textContent=tr('evidenceFailed')+' · '+failed.length+' · '+failed[0]._error;
   button.hidden=false;
  }else{
   out.textContent='✓ '+tr('evidenceSaved');
   button.hidden=true;
   window.postMessage({type:'nap-screen-import-saved'},location.origin);
  }
 }finally{r.busy=false;button.disabled=false}
}
async function roster(){
 if(rosterPromise)return rosterPromise;
 rosterPromise=(async()=>{
  const [rows,own,alliances]=await Promise.all([
   rpc('get_nap_screen_import_directory_test'),
   rpc('get_own_player_identity_directory'),
   (async()=>{try{
    const res=await fetch(API+'/rest/v1/alliance_registry?select=alliance_code,power&enabled=eq.true&limit=1000',{headers:await headers(false)});
    if(!res.ok)throw Error('Alliance power not available');
    return await res.json();
   }catch(e){console.warn('Alliance power sort fallback',e);return []}})()
  ]);
  alliancePower=new Map((alliances||[]).filter(x=>x.alliance_code&&Number(x.power)>0).map(x=>[x.alliance_code,Number(x.power)]));
  const aliases=new Map((own||[]).map(x=>[String(x.player_game_id),x.aliases||[]]));
  return (rows||[]).map(x=>({...x,aliases:aliases.get(String(x.player_game_id))||[],player_id:x.player_id||null}));
 })().catch(e=>{rosterPromise=null;throw e});
 return rosterPromise;
}
async function ensureWorker(){
 if(workerPromise)return workerPromise;
 workerPromise=(async()=>{
  if(!window.Tesseract){
   await new Promise((resolve,reject)=>{
    const el=document.createElement('script');el.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    el.onload=resolve;el.onerror=()=>reject(Error('OCR library could not be loaded'));document.head.appendChild(el);
   });
  }
  return window.Tesseract.createWorker('eng',1);
 })().catch(e=>{workerPromise=null;throw e});
 return workerPromise;
}
function dayUTC(stamp,delta=0){
 const d=new Date(stamp);if(Number.isNaN(d.getTime()))return '';
 return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+delta)).toISOString().slice(0,10);
}
function dayNum(d){return Date.parse(String(d)+'T00:00:00Z')}
function validDay(runDay,occ){return !!runDay&&!!occ&&dayNum(runDay)<Date.parse(occ.end_at)&&dayNum(runDay)+86400000>Date.parse(occ.begin_at)&&dayNum(runDay)<=dayNum(new Date().toISOString().slice(0,10))}
async function sha256(file){
 const n=Math.min(file.size,1048576),a=new Uint8Array(await file.slice(0,n).arrayBuffer());
 const b=new Uint8Array(await file.slice(Math.max(n,file.size-n)).arrayBuffer());
 const bytes=new Uint8Array(a.length+b.length+16);bytes.set(a);bytes.set(b,a.length);
 new DataView(bytes.buffer).setBigUint64(a.length+b.length,BigInt(file.size));
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
}
function sourceRank(line){
 const m=String(line||'').match(/^\s*#?\s*(\d{1,3})\s*[.)\-:]?\s+(?=\S)/);
 return m?Number(m[1]):null;
}
function extractRows(text){
 const out=[],lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 for(let i=0;i<lines.length;i++){
  let line=lines[i];
  let m=line.match(/(\d{1,3}(?:[.,\s]\d{3}){1,4}|\d{4,12})\s*$/);
  if(!m&&i+1<lines.length&&/^(?:\d{1,3}(?:[.,\s]\d{3})+|\d{4,12})$/.test(lines[i+1])){
   line+=' '+lines[++i];m=line.match(/(\d{1,3}(?:[.,\s]\d{3}){1,4}|\d{4,12})\s*$/);
  }
  if(!m)continue;
  const score=Number(m[1].replace(/[.,\s]/g,''));if(!Number.isSafeInteger(score)||score<1000)continue;
  const left=line.slice(0,m.index).replace(/^\s*#?\s*\d{1,3}\s*[.)\-:]?\s*/,'').trim();
  if(!left||left.length<2||/^(total|score|points|punkte|rang|rank|ranking|mission|server)\b/i.test(left))continue;
  const tag=left.match(/[\[(]\s*([a-z0-9]{2,6})\s*[\])]/i);
  out.push({name:left.replace(/[\[(]\s*[a-z0-9]{2,6}\s*[\])]/gi,' ').trim(),alliance:tag?.[1]||'',score,rank:sourceRank(line),raw:line});
 }
 return out;
}
function similarity(a,b){
 const x=norm(a),y=norm(b);if(!x||!y)return 0;if(x===y)return 1;
 if(x.length<3||y.length<3)return 0;
 if(x.length>=5&&y.length>=5&&(x.includes(y)||y.includes(x)))return .94;
 let prev=Array.from({length:y.length+1},(_,i)=>i);
 for(let i=1;i<=x.length;i++){const next=[i];for(let j=1;j<=y.length;j++)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(x[i-1]===y[j-1]?0:1));prev=next}
 return Math.max(0,1-prev[y.length]/Math.max(x.length,y.length));
}
function matchPlayer(row,members){
 if(!norm(row.name))return null;
 const tagged=members.filter(p=>!row.alliance||String(p.alliance_code).toLowerCase()===row.alliance.toLowerCase());
 const list=tagged.map(p=>{
  const names=[p.player_name,...(p.aliases||[])];return {p,s:Math.max(...names.map(n=>similarity(row.name,n)))};
 }).filter(x=>x.s>=.78).sort((a,b)=>b.s-a.s);
 const best=list[0],second=list[1];
 if(!best||best.s<(row.alliance?.92:.96)||second&&best.s-second.s<.07&&best.s<.995)return null;
 if(norm(row.name).length<=4&&best.s<.995)return null;
 return {...best.p,confidence:best.s};
}
function frameCanvas(video){
 const canvas=document.createElement('canvas'),scale=Math.min(2.1,1900/Math.max(1,video.videoWidth));
 canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
 const cx=canvas.getContext('2d',{willReadFrequently:true});cx.drawImage(video,0,0,canvas.width,canvas.height);
 return canvas;
}
async function seek(video,time){
 if(Math.abs(video.currentTime-time)<.03&&video.readyState>=2)return;
 await new Promise((resolve,reject)=>{
  const clean=()=>{video.removeEventListener('seeked',ok);video.removeEventListener('error',bad)};
  const ok=()=>{clean();resolve()};const bad=()=>{clean();reject(Error('Video frame could not be opened'))};
  video.addEventListener('seeked',ok,{once:true});video.addEventListener('error',bad,{once:true});video.currentTime=time;
 });
}
async function metadata(video,file){
 const url=URL.createObjectURL(file);video.src=url;video.preload='auto';video.muted=true;video.playsInline=true;
 try{
  await new Promise((resolve,reject)=>{
   if(video.readyState>=1)return resolve();
   video.onloadedmetadata=resolve;video.onerror=()=>reject(Error('Unsupported video format'));video.load();
  });
  if(!Number.isFinite(video.duration)||video.duration<=0||!video.videoWidth)throw Error('Video metadata unavailable');
  return url;
 }catch(e){URL.revokeObjectURL(url);throw e}
}
function shell(root,kind){
 const perf=kind==='perf';root.innerHTML=
 '<div class="nocr-layout"><section class="nocr-panel"><div class="nocr-fields">'+
 (perf?'<label>'+esc(tr('type'))+'<select id="nocrType"><option value="alliance_mobilization">Alliance Mobilization</option><option value="kvk_prep">KvK Prep · Top 200</option></select></label>':'')+
 (perf?'':'<label>'+esc(tr('event'))+'<select id="nocrEvent" disabled></select></label>')+
 '<label>'+esc(tr('occ'))+'<select id="nocrOcc"></select></label>'+
 (perf?'':'<label>'+esc(tr('day'))+'<select id="nocrPhase"></select></label><label>'+esc(tr('date'))+'<input id="nocrDay" type="date"></label>')+
 '</div><label class="nocr-file"><span class="nocr-file-icon">▣</span><strong>'+esc(tr('file'))+'</strong><small id="nocrFilename">MP4 / MOV</small><input id="nocrFile" type="file" accept="video/mp4,video/quicktime,video/*"></label>'+
 '<p class="nocr-note">'+esc(tr('video'))+'</p><button type="button" class="btn primary nocr-analyze" id="nocrAnalyze">'+esc(tr('analyze'))+'</button><div class="nocr-status" id="nocrStatus" role="status" aria-live="polite"></div></section>'+
 '<section class="nocr-panel nocr-progress" id="nocrProgress" hidden><h3>'+esc(tr('prep'))+'</h3><p id="nocrProgressText"></p><div class="nocr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="nocrBar"></span></div><div class="nocr-progress-foot"><b id="nocrPercent">0%</b><span id="nocrFound">0 '+esc(tr('found'))+'</span></div><div class="nocr-stages"><div data-step="0">✓ '+esc(tr('prep'))+'</div><div data-step="1">◎ '+esc(tr('recognize'))+'</div><div data-step="2">○ '+esc(tr('check'))+'</div></div></section></div>'+
 '<section class="nocr-panel nocr-review" id="nocrReview" hidden><div class="nocr-review-title"><h3>'+esc(tr('review'))+'</h3><strong id="nocrCount"></strong></div><div id="nocrResults"></div><div class="nocr-save-row"><button type="button" class="btn primary" id="nocrSave">'+esc(tr('save'))+'</button><button type="button" class="btn secondary" id="nocrEvidenceRetry" hidden>'+esc(tr('retryEvidence'))+'</button><div class="nocr-status" id="nocrSaveStatus" role="status"></div></div></section>';
 root.querySelector('#nocrFile').addEventListener('change',e=>{$('#nocrFilename',root).textContent=e.target.files?.[0]?.name||'MP4 / MOV'});
}
function progress(step,value,count){
 const el=run?.root;if(!el)return;
 const panel=$('#nocrProgress',el);panel.hidden=false;
 const pct=Math.max(0,Math.min(100,Math.round(value)));$('#nocrBar',el).style.width=pct+'%';
 $('#nocrPercent',el).textContent=pct+'%';$('.nocr-bar',el).setAttribute('aria-valuenow',String(pct));
 const title=tr(step===0?'prep':step===1?'recognize':'check');
 $('h3',panel).textContent=title;$('#nocrProgressText',el).textContent=title+' …';
 $('#nocrFound',el).textContent=count+' '+tr('found');
 for(const item of panel.querySelectorAll('[data-step]'))item.classList.toggle('active',Number(item.dataset.step)===step);
}
function status(txt,isError=false){
 const el=run?.root?.querySelector('#nocrStatus');if(!el)return;el.textContent=txt;el.classList.toggle('error',isError);
}
function selectOption(text,value){return '<option value="'+esc(value)+'">'+esc(text)+'</option>'}
async function lawOccurrence(){
 const r=run,root=r.root;if(!root.isConnected)return;
 r.hits=[];$('#nocrReview',root).hidden=true;
 const event=$('#nocrEvent',root).value;if(!EVENTS.includes(event)){status(tr('prohibit'),true);return}
 const occ=$('#nocrOcc',root);occ.innerHTML=selectOption('…','');
 try{
  const options=await rpc('get_screen_import_occurrences',{p_event_name:event});
  if(run!==r)return;
  const permitted=r.allowed.filter(x=>x.event_name===event);
  const open=(options||[]).filter(o=>permitted.some(p=>p.begin_at&&o.begin_at&&Date.parse(p.begin_at)===Date.parse(o.begin_at)));
  r.occurrences=open;
  occ.innerHTML=open.length?open.map(o=>selectOption(dayUTC(o.begin_at)+' · '+(dayUTC(o.end_at))+(o.phase_hint?' · '+o.phase_hint:''),o.event_schedule_id)).join(''):selectOption(tr('missingEvent'),'');
  setLawPhase();
  if(!open.length)status(tr('missingEvent'),true);else status('');
 }catch(e){occ.innerHTML=selectOption(tr('missingEvent'),'');status(e.message||String(e),true)}
}
function selectedOcc(){return run?.occurrences?.find(o=>String(o.event_schedule_id)===$('#nocrOcc',run.root)?.value)}
function setLawPhase(){
 const r=run;if(!r||r.kind!=='law')return;
 const root=r.root,event=$('#nocrEvent',root).value,occ=selectedOcc(),phase=$('#nocrPhase',root);
 const list=(PHASES[event]||[]).filter(p=>{
  if(occ?.phase_hint&&p[0]!==occ.phase_hint)return false;
  if((event==='Strongest Governor'||event==='Alliance Brawl')&&occ){
   return validDay(dayUTC(occ.begin_at,Number(p[0].slice(2))-1),occ);
  }
  return true;
 });
 const previous=phase.value;
 phase.innerHTML=list.map(p=>{
  const n=Number(p[0].slice(2)),day=(event==='Strongest Governor'||event==='Alliance Brawl')&&occ?dayUTC(occ.begin_at,n-1):'';
  return selectOption(p[1]+(day?' · '+day:''),p[0]);
 }).join('');
 if(list.some(p=>p[0]===previous))phase.value=previous;
 else if(list.length)phase.value=list[list.length-1][0];
 if(event==='Strongest Governor'||event==='Alliance Brawl'){
  const first=phase.value,offset=Number(first.slice(2))-1;
  const suggested=occ?dayUTC(occ.begin_at,offset):dayUTC(new Date());
  $('#nocrDay',root).value=suggested;
 }else{
  const now=dayUTC(new Date()),start=occ?dayUTC(occ.begin_at):now,end=occ?dayUTC(new Date(Math.min(Date.now(),Date.parse(occ.end_at)-1000))):now;
  $('#nocrDay',root).value=dayNum(now)>=dayNum(start)&&dayNum(now)<=dayNum(end)?now:end;
 }
 const input=$('#nocrDay',root);input.min=occ?dayUTC(occ.begin_at):'';input.max=occ?dayUTC(new Date(Math.min(Date.now(),Date.parse(occ.end_at)-1000))):dayUTC(new Date());
 input.readOnly=false;
 input.disabled=!occ;
 input.title=reviewText('dayReadOnly');
}
async function performanceOptions(){
 const r=run,root=r.root;if(!root.isConnected)return;
 const occ=$('#nocrOcc',root),type=$('#nocrType',root).value;occ.innerHTML=selectOption('…','');
 try{
  const d=await rpc('get_performance_import_options');if(run!==r)return;
  const options=type==='kvk_prep'?d.kvk:d.mobilization;
  r.occurrences=(options||[]).map(o=>({...o,event_schedule_id:o.event_schedule_id||null}));
  occ.innerHTML=r.occurrences.length?r.occurrences.map(o=>selectOption(dayUTC(o.begin_at||o.prep_start)+' · '+(type==='kvk_prep'?'KvK Prep':'Alliance Mobilization'),o.event_schedule_id||o.cycle_id)).join(''):selectOption(tr('missingEvent'),'');
  status(!r.occurrences.length?tr('missingEvent'):type==='kvk_prep'?tr('needRank'):'',!r.occurrences.length);
 }catch(e){occ.innerHTML=selectOption(tr('missingEvent'),'');status(e.message||String(e),true)}
}
function perfOcc(){return run?.occurrences?.find(o=>String(o.event_schedule_id||o.cycle_id)===$('#nocrOcc',run.root)?.value)}
async function analyze(){
 const r=run,root=r.root,btn=$('#nocrAnalyze',root);if(!r||r.busy)return;
 const file=$('#nocrFile',root).files?.[0];
 if(!file){status(tr('choose'),true);return}
 if(r.kind==='law'){
  const occ=selectedOcc(),day=$('#nocrDay',root).value;
  if(!occ||!$('#nocrPhase',root).value||!validDay(day,occ)){status(tr('invalid'),true);return}
 }else if(!perfOcc()){status(tr('missingEvent'),true);return}
 r.busy=true;btn.disabled=true;$('#nocrSave',root).disabled=true;$('#nocrReview',root).hidden=true;status('');
 let url,video,worker;
 try{
  progress(0,1,0);
  let members=[...(await roster())];
  if(r.kind==='perf'&&$('#nocrType',root).value==='alliance_mobilization'&&perfOcc()?.event_schedule_id){
   try{
    const extras=await rpc('get_performance_candidate_roster',{p_event_schedule_id:perfOcc().event_schedule_id});
    const ids=new Set(members.map(x=>String(x.player_game_id||x.player_id)));
    for(const p of extras||[]){const id=String(p.player_game_id||p.player_id);if(!ids.has(id)){members.push(p);ids.add(id)}}
   }catch(e){console.warn('Performance transfer roster unavailable',e)}
  }
  r.members=members;
  r.fileHash=await sha256(file);
  worker=await ensureWorker();
  video=document.createElement('video');url=await metadata(video,file);
  if(r!==run)return;
  progress(1,6,0);
  const dur=video.duration;
  const count=Math.min(46,Math.max(1,Math.floor(dur/.85)));
  const times=Array.from({length:count},(_,i)=>Math.min(Math.max(0,dur-.08),.25+i*Math.max(.85,(dur-.5)/Math.max(1,count))));
  const best=new Map(),unmatched=new Map();r.frames=[];
  for(let i=0;i<times.length;i++){
   if(run!==r)break;
   const sec=times[i];await seek(video,sec);
   const canvas=frameCanvas(video);
   if(r.frames.length<12&&i%Math.max(1,Math.floor(times.length/12))===0)r.frames.push({time:sec,image:canvas.toDataURL('image/jpeg',.72)});
   const text=(await worker.recognize(canvas)).data?.text||'';
   const rows=extractRows(text);
   let still=null;
   for(const row of rows){
    const p=matchPlayer(row,members);
    if(!p){const k=norm(row.name)+'|'+row.score;if(!unmatched.has(k)){if(!still)still=canvas.toDataURL('image/jpeg',.74);unmatched.set(k,{...row,time:sec,image:still})}continue}
    if(r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'&&!(row.rank>=1&&row.rank<=200))row.rank=null;
    const key=p.player_game_id||p.player_id;
    const existing=best.get(key);
    if(!existing||row.score>existing.score){
     if(!still)still=canvas.toDataURL('image/jpeg',.74);
     best.set(key,{...row,player:p,time:sec,image:still});
    }
   }
   progress(1,6+86*((i+1)/times.length),best.size);
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(run!==r)return;
  r.hits=[...best.values()].sort((a,b)=>b.score-a.score);
  r.unmatched=[...unmatched.values()].slice(0,30);
  progress(2,96,r.hits.length);
  if(r.kind==='law'){
   const occ=selectedOcc();
   r.preview=await rpc('preview_screen_recording_nap_occurrence_v2',{
    p_event_schedule_id:occ.event_schedule_id,p_event_name:$('#nocrEvent',root).value,
    p_phase_name:$('#nocrPhase',root).value,p_recording_day:$('#nocrDay',root).value,
    p_recording_captured_at:null,p_hits:r.hits.map(hitPayload)
   });
  }
  progress(2,100,r.hits.length);
  showReview(r);status(r.hits.length?tr('ready'):reviewText('nothing'),false);
 }catch(e){console.error('native screen OCR',e);status(tr('error')+': '+(e.message||e),true)}
 finally{if(url)URL.revokeObjectURL(url);if(video){video.removeAttribute('src');video.load()}r.busy=false;if(root.isConnected){btn.disabled=false;$('#nocrSave',root).disabled=!r.hits?.length}}
}
function hitPayload(h){return {player_id:h.player?.player_id||null,player_game_id:h.player?.player_game_id||null,player_name:h.player?.player_name||h.name,detected_alliance:h.alliance||h.player?.alliance_code||null,score:h.score,server_rank:h.rank||null,confirmed_post_contact_spending:!!h.postContactConfirmed}}
function reviewStatus(h,r,entry){
 const state=r.kind==='perf'?'performance':entry?.status||'unresolved';
 const dict=reviewText(state);
 const label=Array.isArray(dict)?dict:[String(state),''];
 // The preview supplies a prior-event highest score where available.
 const previous=entry?.existing_score==null?null:Number(entry.existing_score);
 const current=Number(h.score);
 const showDiff=['update','already_recorded'].includes(state)&&Number.isFinite(previous)&&Number.isFinite(current)&&previous>=0;
 const details=showDiff?'<div class="nocr-score-change"><span>'+esc(reviewText('was'))+': <b>'+points(previous)+'</b></span><span>'+esc(reviewText('now'))+': <b>'+points(current)+'</b></span></div>':'';
 const tone=state==='violation'?'danger':state==='update'?'update':state==='already_recorded'?'already':state==='exempt'?'exempt':state==='target_missing'||state==='unresolved'?'warning':'neutral';
 return '<div class="nocr-check-result '+tone+'"><strong>'+esc(label[0])+'</strong><small>'+esc(label[1])+'</small>'+details+'</div>';
}
async function refreshReview(r){
 if(r.kind==='law'){
  const o=selectedOcc();
  if(!o)return;
  const payload=r.hits.map(hitPayload);
  try{
   r.preview=await rpc('preview_screen_recording_nap_occurrence_v2',{
    p_event_schedule_id:o.event_schedule_id,p_event_name:$('#nocrEvent',r.root).value,
    p_phase_name:$('#nocrPhase',r.root).value,p_recording_day:$('#nocrDay',r.root).value,
    p_recording_captured_at:null,p_hits:payload
   });
  }catch(e){r.preview=null;status((e.message||String(e)),true)}
 }
 if(r===run&&r.root.isConnected)showReview(r);
}
function showReview(r){
 const root=r.root,preview=r.preview?.results||[],statuses=new Map(preview.map(x=>[String(x.player_game_id||x.player_id||''),x]));
 $('#nocrReview',root).hidden=false;
 const counts=r.kind==='law'&&r.preview?[
 [r.preview.violations,reviewText('newCount')],
 [r.preview.updates,reviewText('updateCount')],
 [r.preview.already_recorded,reviewText('alreadyCount')]
 ].filter(x=>Number(x[0])>0).map(x=>points(x[0])+' '+x[1]):[];
 const visibleCount=r.hits.filter(h=>r.kind!=='law'||statuses.get(String(h.player?.player_game_id||h.player?.player_id||''))?.status!=='exempt').length;
 $('#nocrCount',root).textContent=visibleCount+' '+tr('found')+(counts.length?' · '+counts.join(' · '):'');
 $('#nocrResults',root).innerHTML=r.hits.map((h,i)=>{
  const lookup=statuses.get(String(h.player?.player_game_id||h.player?.player_id||''));
  if(r.kind==='law'&&lookup?.status==='exempt')return '';
  const st=statuses.get(String(h.player?.player_game_id||h.player?.player_id||'')),label=st?.status||'';
  const allowed=r.kind==='perf'||['violation','update'].includes(label);
  const key=String(h.player?.player_game_id||h.player?.player_id||'');
  const checked=r.selection?.has(key)?r.selection.get(key):allowed;
  const tone=r.kind==='perf'?'performance':label==='violation'?'new':label==='update'?'update':label==='already_recorded'?'already':'other';
  return '<article class="nocr-hit nocr-hit--'+tone+'"><label class="nocr-hit-check"><input type="checkbox" data-hit="'+i+'" '+(checked?'checked':'')+'>'+
   '<span><strong>'+esc(h.player.player_name)+'</strong><small>'+esc(h.player.alliance_code||'')+' · '+esc(h.player.player_game_id||'')+(h.manual?' · '+esc(reviewText('manual')):'')+'</small></span></label>'+
   '<input type="text" inputmode="numeric" autocomplete="off" data-score="'+i+'" value="'+esc(points(h.score))+'" aria-label="'+esc(tr('score'))+'">'+
   (r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'?'<input type="number" min="1" max="200" step="1" data-rank="'+i+'" value="'+esc(h.rank||'')+'" aria-label="'+esc(tr('rank'))+'">':'')+
   reviewStatus(h,r,st)+
   (r.kind==='law'&&st?.post_contact_confirmation_required?'<label class="nocr-post-contact-confirm"><input type="checkbox" data-post-contact-confirm="'+i+'" '+(h.postContactConfirmed?'checked':'')+'><span><strong>'+esc(postContactText('title'))+'</strong><small>'+esc(postContactText('hint'))+'</small></span></label>':'')+
   (h.image?'<details><summary>'+esc(tr('frame'))+'</summary><img src="'+h.image+'" alt="'+esc(tr('frame'))+'"></details>':'')+'</article>'
 }).join('')+
 (r.kind==='law'&&preview.some(x=>x.status==='exempt')?'<details class="nocr-exempt-compact"><summary><span class="nocr-exempt-icon" aria-hidden="true">✓</span><strong>'+preview.filter(x=>x.status==='exempt').length+' '+esc(reviewText('exemptCollapsed'))+'</strong><span>'+esc(reviewText('exemptShort'))+'</span></summary><p>'+esc(reviewText('exemptNote'))+'</p><div class="nocr-exempt-names">'+preview.filter(x=>x.status==='exempt').map(x=>'<span>'+esc(x.player_name||'')+'</span>').join('')+'</div></details>':'')+
 (r.unmatched.length?'<details class="nocr-unmatched"><summary>'+esc(tr('unmatched'))+' ('+r.unmatched.length+')</summary>'+
 '<label>'+esc(tr('unmatched'))+'<select id="nocrUnknown">'+r.unmatched.map((x,i)=>selectOption(x.raw,i)).join('')+'</select></label>'+
 '<label>'+esc(reviewText('chooseAlliance'))+'<select id="nocrMapAlliance"><option value="">– '+esc(reviewText('chooseAlliance'))+' –</option>'+allianceOptions(r.members)+'</select></label>'+ 
 '<label>'+esc(tr('selectPlayer'))+'<select id="nocrMapPlayer"><option value="">–</option></select></label>'+
 '<button class="btn secondary" type="button" id="nocrMapConfirm">'+esc(tr('assign'))+'</button></details>':'')+
 '<details class="nocr-add-missing" id="nocrAddMissing" '+(r.addOpen||!r.hits.length?'open':'')+'><summary>'+esc(reviewText('addPlayer'))+'</summary>'+
 '<p>'+esc(reviewText('addHint'))+'</p>'+
 '<label>'+esc(reviewText('chooseAlliance'))+'<select id="nocrNewAlliance"><option value="">– '+esc(reviewText('chooseAlliance'))+' –</option>'+allianceOptions(r.members)+'</select></label>'+ 
 '<label>'+esc(reviewText('search'))+'<input type="search" id="nocrSearchRoster" placeholder="'+esc(reviewText('search'))+'"></label>'+
 '<label>'+esc(tr('selectPlayer'))+'<select id="nocrNewPlayer"><option value="">–</option></select></label>'+
 '<label>'+esc(tr('score'))+'<input type="text" inputmode="numeric" autocomplete="off" id="nocrNewScore" placeholder="'+esc(reviewText('scorePlaceholder'))+'"></label>'+
 (r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'?'<label>'+esc(tr('rank'))+'<input type="number" min="1" max="200" id="nocrNewRank" placeholder="1–200"></label>':'')+
 (r.frames.length?'<label>'+esc(reviewText('evidence'))+'<select id="nocrNewFrame">'+r.frames.map((f,i)=>selectOption(f.time.toFixed(1)+' s',i)).join('')+'</select></label><img id="nocrFramePreview" src="'+r.frames[0].image+'" alt="'+esc(tr('frame'))+'">':'')+
 '<button type="button" class="btn secondary" id="nocrNewAdd">'+esc(reviewText('add'))+'</button>'+
 '<div class="nocr-status" id="nocrNewStatus" role="status"></div></details>';
 root.querySelectorAll('[data-hit]').forEach(checkbox=>checkbox.addEventListener('change',()=>{
  const h=r.hits[Number(checkbox.dataset.hit)];
  if(!h)return;
  r.selection??=new Map();
  r.selection.set(String(h.player?.player_game_id||h.player?.player_id||''),checkbox.checked);
 }));
 root.querySelectorAll('[data-post-contact-confirm]').forEach(input=>input.addEventListener('change',()=>{
  const h=r.hits[Number(input.dataset.postContactConfirm)];
  if(!h)return;
  h.postContactConfirmed=input.checked;
 }));
 root.querySelectorAll('[data-score]').forEach(input=>input.addEventListener('blur',async()=>{
  const value=parsePoints(input.value);
  if(value===null)return;
  input.value=points(value);
  const h=r.hits[Number(input.dataset.score)];
  if(!h||h.score===value)return;
  h.score=value;
  if(r.kind==='law'){status(reviewText('preview'));await refreshReview(r)}
 }));
 const mapAlliance=$('#nocrMapAlliance',root),mapPlayer=$('#nocrMapPlayer',root);
 if(mapAlliance&&mapPlayer){
  const populate=()=>{
   const code=mapAlliance.value;
   mapPlayer.innerHTML='<option value="">–</option>'+alphabeticalRoster(r.members)
    .filter(({p})=>code&&p.alliance_code===code)
    .map(({p,i})=>selectOption(p.player_name+' · '+(p.player_game_id||''),i)).join('');
  };
  mapAlliance.onchange=populate;
  const detected=r.unmatched[0]?.alliance;
  if(detected&&orderedAlliances(r.members).some(a=>a.toLowerCase()===String(detected).toLowerCase()))
   mapAlliance.value=orderedAlliances(r.members).find(a=>a.toLowerCase()===String(detected).toLowerCase());
  populate();
  $('#nocrUnknown',root)?.addEventListener('change',()=>{
   const candidate=r.unmatched[Number($('#nocrUnknown',root).value)]?.alliance;
   const code=orderedAlliances(r.members).find(a=>a.toLowerCase()===String(candidate||'').toLowerCase());
   if(code){mapAlliance.value=code;populate()}
  });
 }
 const mapButton=$('#nocrMapConfirm',root);
 if(mapButton)mapButton.onclick=()=>{
  const index=Number($('#nocrUnknown',root).value),playerIndex=$('#nocrMapPlayer',root).value;
  if(playerIndex==='')return;
  const row=r.unmatched[index],p=r.members[Number(playerIndex)];if(!row||!p)return;
  const existing=r.hits.find(x=>String(x.player.player_game_id||x.player.player_id)===String(p.player_game_id||p.player_id));
  if(!existing||row.score>existing.score){
   const h={...row,player:p,alliance:p.alliance_code,manual:true};
   if(existing)r.hits=r.hits.filter(x=>x!==existing);
   r.hits.push(h);
  }
  r.unmatched.splice(index,1);
  r.hits.sort((x,y)=>y.score-x.score);refreshReview(r);
 };
 const sel=$('#nocrNewPlayer',root),alliance=$('#nocrNewAlliance',root);
 const filter=$('#nocrSearchRoster',root);
 const list=()=>{
  const q=norm(filter.value),code=alliance.value;
  const options=alphabeticalRoster(r.members).filter(({p})=>code&&p.alliance_code===code&&(!q||norm(p.player_name+' '+p.player_game_id).includes(q)));
  sel.innerHTML='<option value="">–</option>'+options.map(({p,i})=>selectOption(p.player_name+' · '+(p.player_game_id||''),i)).join('');
 };
 list();filter.addEventListener('input',list);alliance.addEventListener('change',list);
 const missingDetails=$('#nocrAddMissing',root);
 missingDetails.addEventListener('toggle',()=>{r.addOpen=missingDetails.open});
 const frame=$('#nocrNewFrame',root);
 if(frame)frame.onchange=()=>{$('#nocrFramePreview',root).src=r.frames[Number(frame.value)]?.image||''};
 $('#nocrNewScore',root).addEventListener('blur',e=>{const value=parsePoints(e.target.value);if(value!==null)e.target.value=points(value)});
 $('#nocrNewAdd',root).onclick=()=>{
  const idx=sel.value,out=$('#nocrNewStatus',root),score=parsePoints($('#nocrNewScore',root).value);
  if(idx===''){out.textContent=reviewText('missingPlayer');return}
  if(score===null){out.textContent=reviewText('invalidScore');return}
  let rank=null;
  if(r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'){
   rank=Number($('#nocrNewRank',root).value);
   if(!Number.isInteger(rank)||rank<1||rank>200){out.textContent=reviewText('missingRank');return}
  }
  const p=r.members[Number(idx)];
  if(!p){out.textContent=reviewText('missingPlayer');return}
  const old=r.hits.find(x=>String(x.player.player_game_id||x.player.player_id)===String(p.player_game_id||p.player_id));
  if(old&&old.score>=score){out.textContent=reviewText('higher');return}
  if(old)r.hits=r.hits.filter(x=>x!==old);
  const proof=r.frames[Number(frame?.value||0)]||null;
  r.hits.push({player:p,name:p.player_name,alliance:p.alliance_code,score,rank,time:proof?.time??0,image:proof?.image||null,manual:true});
  r.hits.sort((a,b)=>b.score-a.score);r.addOpen=true;refreshReview(r);
 };
 $('#nocrSave',root).disabled=!r.hits.length;
}
async function save(){
 const r=run,root=r.root;if(r.busy)return;
 let scoreError=false,rankError=false;
 const selected=r.hits.filter((h,i)=>{
  const c=$('[data-hit="'+i+'"]',root);
  if(!c?.checked)return false;
  const score=parsePoints($('[data-score="'+i+'"]',root)?.value);
  if(score===null){scoreError=true;return false}h.score=score;
  if(r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'){
   const field=$('[data-rank="'+i+'"]',root);
   const rank=field?.value?.trim()?Number(field.value):NaN;
   if(!Number.isInteger(rank)||rank<1||rank>200){rankError=true;return false}h.rank=rank;
  }
  return true;
 });
 if(scoreError||rankError){$('#nocrSaveStatus',root).textContent=reviewText(scoreError?'invalidScore':'missingRank');return}
 if(!selected.length){$('#nocrSaveStatus',root).textContent=tr('nohits');return}
 r.busy=true;$('#nocrSave',root).disabled=true;
 const out=$('#nocrSaveStatus',root);out.textContent=tr('saving');
 try{
  let response,evidenceWarning='';
  if(r.kind==='law'){
   const occ=selectedOcc();
   const args={p_event_schedule_id:occ.event_schedule_id,p_event_name:$('#nocrEvent',root).value,
    p_phase_name:$('#nocrPhase',root).value,p_recording_day:$('#nocrDay',root).value,
    p_recording_captured_at:null,p_video_hash:r.fileHash,p_hits:selected.map(hitPayload)};
   // Mandatory fresh preview after editable scores, before any database write.
   const checked=await rpc('preview_screen_recording_nap_occurrence_v2',{
    p_event_schedule_id:args.p_event_schedule_id,p_event_name:args.p_event_name,p_phase_name:args.p_phase_name,
    p_recording_day:args.p_recording_day,p_recording_captured_at:null,p_hits:args.p_hits
   });
   const previewByPlayer=new Map((checked.results||[]).map(x=>[String(x.player_game_id||x.player_id),x]));
   const importable=selected.filter(h=>{
    const row=previewByPlayer.get(String(h.player.player_game_id||h.player.player_id));
    return !!row&&canPassThroughForEvidence(row.status,!!h.image);
   });
   if(!importable.length){out.textContent=reviewText('noChanges');return}
   // "already_recorded" is intentionally allowed through when we have a still:
   // the RPC keeps the violation unchanged but refreshes the import-case link,
   // so evidence registration can safely target the existing violation.
   args.p_hits=importable.map(hitPayload);
   response=await rpc('import_screen_recording_nap_occurrence_v2',args);
   const evidenceRows=(response.results||[]).filter(x=>['created','updated','unchanged'].includes(x.status)&&x.violation_id);
   if(evidenceRows.length){
    out.textContent=tr('upload');
    const items=evidenceRows.map(row=>{
     const h=importable.find(x=>x.player.player_name===row.player_name&&x.player.alliance_code===row.assigned_alliance);
     return h?.image?{p_violation_id:row.violation_id,p_source_video_hash:r.fileHash,
       p_frame_time_seconds:h.time,p_data_url:h.image}:null;
    }).filter(Boolean);
    if(items.length){
     const failed=await uploadEvidenceBatch(items,3);
     r.pendingEvidence=failed;
     const retry=$('#nocrEvidenceRetry',root);
     if(failed.length){
      evidenceWarning=' · '+tr('evidenceFailed')+' ('+failed.length+')';
      retry.hidden=false;
     }else{
      retry.hidden=true;
     }
    }
   }
  }else{
   const type=$('#nocrType',root).value,occ=perfOcc();
   const method=type==='kvk_prep'?'import_player_kvk_performance_batch':'import_player_performance_batch';
   const args=type==='kvk_prep'?{p_cycle_id:occ.cycle_id,p_video_hash:r.fileHash,p_hits:selected.map(hitPayload)}:
    {p_performance_type:'alliance_mobilization',p_event_schedule_id:occ.event_schedule_id,p_video_hash:r.fileHash,p_hits:selected.map(hitPayload)};
   response=await rpc(method,args);
  }
  const created=Number(response?.created||0),updated=Number(response?.updated||0),
   unchanged=Number(response?.unchanged||0),unresolved=Number(response?.unresolved||0);
  const piece=(count,one,many)=>points(count)+' '+reviewText(count===1?one:many);
  const parts=r.kind==='law'?[
   piece(created,'newViolationOne','newViolationMany'),
   piece(updated,'scoreUpdateOne','scoreUpdateMany'),
   ...(unchanged?[piece(unchanged,'alreadyOne','alreadyMany')]:[])
  ]:[
   piece(created,'importedPerformanceOne','importedPerformanceMany'),
   ...(unresolved?[piece(unresolved,'notMatchedOne','notMatchedMany')]:[])
  ];
  out.textContent='✓ '+reviewText('saveSummary')+': '+parts.join(' · ')+
   (response?.duplicate_video?' · '+reviewText('existingVideo'):'')+evidenceWarning;
  window.postMessage({type:'nap-screen-import-saved'},location.origin);
 }catch(e){out.textContent=(e.message||String(e));console.error('native OCR save',e)}
 finally{r.busy=false;if(root.isConnected)$('#nocrSave',root).disabled=false}
}
function mount(root,kind,allowed=[]){
 if(run?.busy)return;
 run={root,kind,allowed,hits:[],unmatched:[],frames:[],occurrences:[],members:[],selection:new Map(),addOpen:false,busy:false,preview:null,fileHash:null,pendingEvidence:[]};
 shell(root,kind);
 const r=run;$('#nocrAnalyze',root).onclick=analyze;$('#nocrSave',root).onclick=save;$('#nocrEvidenceRetry',root).onclick=retryPendingEvidence;
 if(kind==='law'){
  const event=$('#liveScreenEvent')?.value||allowed[0]?.event_name;
  $('#nocrEvent',root).innerHTML=EVENTS.filter(n=>allowed.some(o=>o.event_name===n)).map(x=>selectOption(x,x)).join('');
  if(event&&EVENTS.includes(event))$('#nocrEvent',root).value=event;
  $('#nocrEvent',root).onchange=lawOccurrence;$('#nocrOcc',root).onchange=setLawPhase;
  $('#nocrPhase',root).onchange=async()=>{
  const occ=selectedOcc(),phase=$('#nocrPhase',root).value,event=$('#nocrEvent',root).value;
  if(occ&&(event==='Strongest Governor'||event==='Alliance Brawl'))
   $('#nocrDay',root).value=dayUTC(occ.begin_at,Number(phase.slice(2))-1);
  if(r.hits.length)await refreshReview(r);
 };
 $('#nocrDay',root).addEventListener('change',async()=>{
  const occ=selectedOcc(),day=$('#nocrDay',root).value,event=$('#nocrEvent',root).value,phase=$('#nocrPhase',root);
  if(!occ||!validDay(day,occ)){status(tr('wrongDay'),true);return}
  if(event==='Strongest Governor'||event==='Alliance Brawl'){
   const offset=Math.round((dayNum(day)-dayNum(dayUTC(occ.begin_at)))/86400000)+1;
   const next=(event==='Strongest Governor'?'sg':'b')+offset;
   if(!Array.from(phase.options).some(option=>option.value===next)){status(tr('wrongDay'),true);return}
   phase.value=next;
  }
  status(reviewText('dayUpdated'));
  if(r.hits.length)await refreshReview(r);
 });
  lawOccurrence();
 }else{$('#nocrType',root).onchange=performanceOptions;performanceOptions()}
}
function initLaw(){
 const picker=$('#liveScreenEvent');if(!picker)return;
 // The mode is never allowed to receive attendance-only events.
 [...picker.options].forEach(o=>{if(o.value&&!EVENTS.includes(o.value))o.remove()});
 picker.onchange=()=>{if(run?.kind==='law'&&run.root.isConnected){$('#nocrEvent',run.root).value=picker.value;lawOccurrence()}};
}
function openLaw(silent=false){
 const root=$('#liveImporterHost'),allowed=window.NAP_V2_SCREEN_OPTIONS||[];
 if(!root)return;
 mount(root,'law',allowed.filter(x=>EVENTS.includes(x.event_name)));
 if(!silent)root.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function openPerformance(){
 const root=$('#livePerformanceExtra');if(!root)return;
 root.innerHTML='<section class="card"><div class="card-head"><div><div class="card-title">Performance ScreenRecording</div></div></div><div class="card-body"><div id="nocrPerformanceHost"></div></div></section>';
 mount($('#nocrPerformanceHost',root),'perf');
 root.scrollIntoView({behavior:'smooth',block:'nearest'});
}
window.NAP_NATIVE_IMPORTER={initLaw,openLaw,openPerformance};
})();