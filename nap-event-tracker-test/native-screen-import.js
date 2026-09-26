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
 de:{event:'Event',day:'Eventtag / Phase',occ:'Event-Durchlauf',date:'Aufnahmetag (UTC)',file:'ScreenRecording auswählen',analyze:'Video analysieren',review:'Ergebnisse prüfen',save:'Geprüfte Treffer speichern',choose:'Bitte zuerst Event, Tag und Video auswählen.',prep:'Video wird vorbereitet',recognize:'Spieler und Punkte erkennen',check:'Ergebnisse zusammenstellen',ready:'Fertig. Prüfe die erkannten Werte.',video:'Das Video bleibt auf deinem Gerät. Nur geprüfte Ergebnisse und Evidence-Bilder werden gespeichert.',found:'Erkannte Spieler',score:'Punkte',rank:'Rang',name:'Spieler',alliance:'Allianz',unmatched:'Nicht sicher zugeordnet – bitte manuell prüfen',nohits:'Keine eindeutigen Treffer. Bitte Aufnahme und Eventauswahl prüfen.',error:'Analyse fehlgeschlagen',saving:'Geprüfte Treffer werden gespeichert …',done:'Import abgeschlossen',upload:'Evidence-Bilder speichern …',retryEvidence:'Evidence erneut speichern',evidenceRetrying:'Evidence wird erneut gespeichert …',evidenceSaved:'Evidence gespeichert',evidenceFailed:'Evidence konnte nicht vollständig gespeichert werden',evidenceRequired:'Screenshot-Evidence erforderlich',duplicate:'Dieses Video wurde bereits erfasst.',type:'Performance-Art',needRank:'KvK Top 200: nur Einträge mit Rang 1–200 werden gespeichert.',prohibit:'TriAlliance und Swordland werden ausschließlich manuell erfasst.',wrongDay:'Der ausgewählte Tag liegt außerhalb des Event-Durchlaufs.',retry:'Erneut analysieren',missingEvent:'Kein passender Event-Durchlauf gefunden.',frame:'Erkanntes Bild',result:'Serverprüfung',invalid:'Bitte zuerst den tatsächlichen Eventtag wählen.',assign:'Spieler zuordnen',selectPlayer:'Spieler auswählen',manual:'Manuell zugeordnet'},
 en:{event:'Event',day:'Event day / phase',occ:'Event occurrence',date:'Recording day (UTC)',file:'Choose recording',analyze:'Analyze video',review:'Review results',save:'Save reviewed hits',choose:'Choose the event, day and video first.',prep:'Preparing video',recognize:'Recognizing players and scores',check:'Preparing results',ready:'Done. Review the detected values.',video:'Your video stays on your device. Only reviewed results and evidence stills are saved.',found:'Detected players',score:'Score',rank:'Rank',name:'Player',alliance:'Alliance',unmatched:'Not confidently matched – review manually',nohits:'No clear matches. Check your recording and event.',error:'Analysis failed',saving:'Saving reviewed hits …',done:'Import complete',upload:'Saving evidence stills …',retryEvidence:'Retry evidence upload',evidenceRetrying:'Retrying evidence upload …',evidenceSaved:'Evidence saved',evidenceFailed:'Evidence could not be fully saved',evidenceRequired:'Screenshot evidence required',duplicate:'This video has already been imported.',type:'Performance type',needRank:'KvK Top 200: only ranks 1–200 are saved.',prohibit:'TriAlliance and Swordland are manual only.',wrongDay:'The selected day is outside this occurrence.',retry:'Analyze again',missingEvent:'No matching occurrence found.',frame:'Detected frame',result:'Server check',invalid:'Select the actual event day first.',assign:'Assign player',selectPlayer:'Select player',manual:'Manually matched'},
 fr:{event:'Événement',day:'Jour / phase',occ:'Session',date:'Jour de vidéo (UTC)',file:'Choisir une vidéo',analyze:'Analyser',review:'Vérifier les résultats',save:'Enregistrer les résultats vérifiés',choose:'Choisissez événement, jour et vidéo.',prep:'Préparation vidéo',recognize:'Reconnaissance des joueurs et scores',check:'Préparation des résultats',ready:'Terminé. Vérifiez les valeurs.',video:'La vidéo reste sur votre appareil. Seuls les résultats vérifiés et les preuves sont enregistrés.',found:'Joueurs détectés',score:'Points',rank:'Rang',name:'Joueur',alliance:'Alliance',unmatched:'Association incertaine : vérification manuelle',nohits:'Aucun résultat fiable.',error:'Échec de l’analyse',saving:'Enregistrement …',done:'Import terminé',upload:'Enregistrement des preuves …',retryEvidence:'Réessayer les preuves',evidenceRetrying:'Nouvel enregistrement des preuves …',evidenceSaved:'Preuves enregistrées',evidenceFailed:'Les preuves n’ont pas toutes été enregistrées',evidenceRequired:'Capture de preuve requise',duplicate:'Vidéo déjà importée.',type:'Type de performance',needRank:'KvK Top 200 : rangs 1–200 uniquement.',prohibit:'TriAlliance et Swordland : saisie manuelle uniquement.',wrongDay:'Jour hors de cet événement.',retry:'Analyser à nouveau',missingEvent:'Aucune session trouvée.',frame:'Image',result:'Vérification serveur',invalid:'Choisissez le jour réel de l’événement.',assign:'Associer un joueur',selectPlayer:'Choisir un joueur',manual:'Associé manuellement'},
 es:{event:'Evento',day:'Día / fase',occ:'Edición del evento',date:'Día del vídeo (UTC)',file:'Elegir vídeo',analyze:'Analizar vídeo',review:'Revisar resultados',save:'Guardar resultados revisados',choose:'Selecciona evento, día y vídeo.',prep:'Preparando vídeo',recognize:'Reconociendo jugadores y puntos',check:'Preparando resultados',ready:'Listo. Revisa los valores.',video:'El vídeo permanece en tu dispositivo. Solo se guardan resultados revisados y capturas de prueba.',found:'Jugadores detectados',score:'Puntos',rank:'Puesto',name:'Jugador',alliance:'Alianza',unmatched:'Sin coincidencia segura: revisar manualmente',nohits:'No hay resultados claros.',error:'Error de análisis',saving:'Guardando resultados …',done:'Importación completada',upload:'Guardando pruebas …',retryEvidence:'Reintentar pruebas',evidenceRetrying:'Reintentando guardar pruebas …',evidenceSaved:'Pruebas guardadas',evidenceFailed:'No se pudieron guardar todas las pruebas',evidenceRequired:'Se requiere captura de evidencia',duplicate:'Vídeo ya importado.',type:'Tipo de rendimiento',needRank:'KvK Top 200: solo puestos del 1 al 200.',prohibit:'TriAlliance y Swordland solo se registran manualmente.',wrongDay:'Día fuera del evento.',retry:'Analizar de nuevo',missingEvent:'No hay ninguna edición disponible.',frame:'Imagen',result:'Comprobación servidor',invalid:'Selecciona el día real del evento.',assign:'Asignar jugador',selectPlayer:'Seleccionar jugador',manual:'Asignado manualmente'}
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
const OCR2_WORDS={
 de:{coverage:'Rangabdeckung',complete:'Rangfolge vollständig',missing:'Nicht sicher erkannt',rescue:'Einige Stellen werden noch einmal geprüft',manual:'Bitte fehlende Ränge vor dem Speichern manuell prüfen',version:'Erkennung V2',scan:'Video wird geprüft',collect:'Spieler werden erfasst',finish:'Ergebnis wird geprüft',rankSlots:'Rankingplätze gelesen',matched:'Spieler zugeordnet',unassigned:'nicht zugeordnet',reviewable:'prüfbare Ergebnisse',exemptCount:'ausgenommen'},
 en:{coverage:'Rank coverage',complete:'Rank sequence complete',missing:'Not confidently detected',rescue:'A few areas are being checked again',manual:'Please review missing ranks manually before saving',version:'Recognition V2',scan:'Checking video',collect:'Reading players',finish:'Checking results',rankSlots:'ranking positions read',matched:'players matched',unassigned:'unmatched',reviewable:'reviewable results',exemptCount:'exempt'},
 fr:{coverage:'Couverture des rangs',complete:'Séquence des rangs complète',missing:'Non détecté avec certitude',rescue:'Certaines zones sont vérifiées à nouveau',manual:'Vérifiez manuellement les rangs manquants avant d’enregistrer',version:'Reconnaissance V2',scan:'Vérification de la vidéo',collect:'Lecture des joueurs',finish:'Vérification du résultat',rankSlots:'places du classement lues',matched:'joueurs associés',unassigned:'non associés',reviewable:'résultats à vérifier',exemptCount:'exemptés'},
 es:{coverage:'Cobertura de rangos',complete:'Secuencia de rangos completa',missing:'No detectado con seguridad',rescue:'Se están revisando de nuevo algunas zonas',manual:'Revisa manualmente los rangos que faltan antes de guardar',version:'Reconocimiento V2',scan:'Revisando vídeo',collect:'Leyendo jugadores',finish:'Revisando resultado',rankSlots:'puestos leídos',matched:'jugadores asociados',unassigned:'sin asociar',reviewable:'resultados revisables',exemptCount:'exentos'}
};
const ocr2=k=>(OCR2_WORDS[lng()]||OCR2_WORDS.de)[k]||k;
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
 return !!hasImage&&['violation','update','already_recorded'].includes(status);
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
  // Mobile fast path: English handles ranks, alliance tags, Latin names and scores.
  // Unknown/Korean names remain visible through rank coverage and can be rescued manually.
  const worker=await window.Tesseract.createWorker('eng',1);
  try{await worker.setParameters({preserve_interword_spaces:'1',tessedit_pageseg_mode:'6'})}catch(err){console.warn('OCR parameters',err)}
  return worker;
 })().catch(e=>{workerPromise=null;throw e});
 return workerPromise;
}
function dayUTC(stamp,delta=0){
 const d=new Date(stamp);if(Number.isNaN(d.getTime()))return '';
 return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+delta)).toISOString().slice(0,10);
}
function dayNum(d){return Date.parse(String(d)+'T00:00:00Z')}
function validDay(runDay,occ){return !!runDay&&!!occ&&dayNum(runDay)<Date.parse(occ.end_at)&&dayNum(runDay)+86400000>Date.parse(occ.begin_at)&&dayNum(runDay)<=dayNum(new Date().toISOString().slice(0,10))}
function validRecordingDay(runDay,occ){
 if(!runDay||!occ)return false;
 const d=dayNum(runDay),start=dayNum(dayUTC(occ.begin_at)),endPlusOne=dayNum(dayUTC(new Date(Date.parse(occ.end_at)+86400000)));
 const today=dayNum(dayUTC(new Date()));
 return d>=start&&d<=endPlusOne&&d<=today;
}
async function sha256(file){
 const n=Math.min(file.size,1048576),a=new Uint8Array(await file.slice(0,n).arrayBuffer());
 const b=new Uint8Array(await file.slice(Math.max(n,file.size-n)).arrayBuffer());
 const bytes=new Uint8Array(a.length+b.length+16);bytes.set(a);bytes.set(b,a.length);
 new DataView(bytes.buffer).setBigUint64(a.length+b.length,BigInt(file.size));
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
}
function ocrDigits(raw){
 return String(raw||'').replace(/[Oo]/g,'0').replace(/[Il|]/g,'1');
}
function sourceRank(line){
 const lead=ocrDigits(String(line||'').trimStart());
 const m=lead.match(/^#?\s*(\d{1,3})\s*[.)\-:]?\s+(?=\S)/);
 if(!m)return null;
 const n=Number(m[1]);return Number.isInteger(n)&&n>=1&&n<=999?n:null;
}
function scoreTail(line){
 const s=String(line||'');
 // Only normalize OCR lookalikes inside the final numeric token. Never convert
 // letters in the player name (e.g. the "ll" in "Hell") into score digits.
 const m=s.match(/(?:^|\s)([0-9OoIl|]{1,3}(?:[.,\s][0-9OoIl|]{3}){1,4}|[0-9OoIl|]{4,12})\s*$/);
 if(!m)return null;
 const raw=m[1],normalized=ocrDigits(raw),score=Number(normalized.replace(/[.,\s]/g,''));
 if(!Number.isSafeInteger(score)||score<1000)return null;
 const tokenStart=s.lastIndexOf(raw);
 return {raw,score,start:tokenStart};
}
function extractRows(text){
 const out=[],lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 for(let i=0;i<lines.length;i++){
  let line=lines[i],tail=scoreTail(line);
  if(!tail&&i+1<lines.length){
   const next=scoreTail(lines[i+1]);
   if(next&&next.start===0){
    line+=' '+lines[++i];tail=scoreTail(line);
   }
  }
  if(!tail)continue;
  const score=tail.score,scoreStart=tail.start;
  const left=line.slice(0,scoreStart).replace(/^\s*#?\s*[0-9OoIl|]{1,3}\s*[.)\-:]?\s*/,'').trim();
  if(!left||left.length<2||/^(total|score|points|punkte|rang|rank|ranking|mission|server)\b/i.test(left))continue;
  const tag=left.match(/[\[(]\s*([a-z0-9]{2,6})\s*[\])]/i);
  let name=left.replace(/[\[(]\s*[a-z0-9]{2,6}\s*[\])]/gi,' ').trim();
  if(tag&&Number.isInteger(tag.index)){
   const after=left.slice(tag.index+tag[0].length).trim();
   if(norm(after).length>=2)name=after;
  }
  name=name.replace(/^[^\p{L}\p{N}~_-]+/gu,'').trim();
  out.push({name,alliance:tag?.[1]||'',score,rank:sourceRank(line),raw:line});
 }
 return out;
}
function ocrLinesFromBlocks(blocks){
 const out=[];
 for(const block of blocks||[])for(const paragraph of block?.paragraphs||[])for(const line of paragraph?.lines||[]){
  if(line?.text&&line?.bbox)out.push({text:String(line.text).trim(),bbox:line.bbox});
 }
 return out;
}
function attachLayout(rows,blocks){
 const lines=ocrLinesFromBlocks(blocks);
 if(!lines.length)return rows;
 return (rows||[]).map(row=>{
  const candidates=lines.map(line=>{
   const tail=scoreTail(line.text),nameText=line.text.replace(/\s*[0-9OoIl|]{1,3}(?:[.,\s][0-9OoIl|]{3}){1,4}\s*$/,'');
   const score=(tail&&tail.score===row.score?1:0)+(similarity(nameText,row.name)*.45);
   return {line,score};
  }).sort((a,b)=>b.score-a.score);
  return candidates[0]?.score>=.32?{...row,bbox:candidates[0].line.bbox}:{...row};
 });
}
function parseOcrData(data){
 return attachLayout(repairSequentialRanks(extractRows(data?.text||'')),data?.blocks||[]);
}
function qualityNameCanvas(roi,bbox){
 if(!bbox||![bbox.x0,bbox.y0,bbox.x1,bbox.y1].every(Number.isFinite))return null;
 const x0=Math.max(0,Math.round(roi.width*.10)),x1=Math.min(roi.width,Math.round(roi.width*.73));
 const y0=Math.max(0,Math.floor(bbox.y0-22)),y1=Math.min(roi.height,Math.ceil(bbox.y1+22));
 if(x1<=x0||y1<=y0)return null;
 const w=x1-x0,h=y1-y0,scale=Math.min(2.25,1800/Math.max(1,w)),out=document.createElement('canvas');
 out.width=Math.max(1,Math.round(w*scale));out.height=Math.max(1,Math.round(h*scale));
 const cx=out.getContext('2d',{willReadFrequently:true});cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
 cx.drawImage(roi,x0,y0,w,h,0,0,out.width,out.height);return out;
}
function qualityNameRow(text,group){
 const lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!lines.length)return null;
 let best=lines.sort((a,b)=>(b.match(/[\p{L}\p{N}]/gu)||[]).length-(a.match(/[\p{L}\p{N}]/gu)||[]).length)[0]||'';
 best=best.replace(/^\s*#?\s*[0-9OoIl|]{1,3}\s*[.)\-:]?\s*/,'').replace(/\s*[0-9OoIl|]{1,3}(?:[.,\s][0-9OoIl|]{3}){1,4}\s*$/,'').trim();
 const tag=best.match(/[\[(]\s*([a-z0-9]{2,6})\s*[\])]/i);
 let name=best.replace(/[\[(]\s*[a-z0-9]{2,6}\s*[\])]/gi,' ').trim();
 if(tag&&Number.isInteger(tag.index)){
  const after=best.slice(tag.index+tag[0].length).trim();
  if(norm(after).length>=2)name=after;
 }
 name=name.replace(/^[^\p{L}\p{N}~_-]+|[^\p{L}\p{N}~_-]+$/gu,'').trim();
 if(norm(name).length<2)return null;
 return {...group,name,alliance:tag?.[1]||group.alliance||'',score:group.score,rank:group.rank,raw:best,quality:true};
}
function ranksFromText(text){
 const out=[];
 for(const line of String(text||'').split(/\r?\n/)){
  const rank=sourceRank(line);
  if(Number.isInteger(rank)&&rank>=1&&rank<=999)out.push(rank);
 }
 return [...new Set(out)];
}
function extractPodiumRows(text){
 const rows=extractRows(text).slice(0,3);
 if(rows.length===3){
  return rows.map((row,i)=>({...row,rank:i+1,podium:true,rankInferred:true,rawRank:row.rank}));
 }
 // Partial fallback: keep only ranks that OCR itself clearly identified as 1–3.
 return rows.filter(row=>Number.isInteger(row.rank)&&row.rank>=1&&row.rank<=3).map(row=>({...row,podium:true}));
}
function repairSequentialRanks(rows){
 if(!Array.isArray(rows)||rows.length<2)return rows||[];
 const out=rows.map(r=>({...r}));
 const valid=r=>Number.isInteger(Number(r))&&Number(r)>=1&&Number(r)<=999;
 for(let i=0;i<out.length;i++){
  const current=valid(out[i].rank)?Number(out[i].rank):null;
  let pi=i-1;while(pi>=0&&!valid(out[pi].rank))pi--;
  let ni=i+1;while(ni<out.length&&!valid(out[ni].rank))ni++;
  let inferred=null;
  if(pi>=0&&ni<out.length){
   const pr=Number(out[pi].rank),nr=Number(out[ni].rank);
   if(nr-pr===ni-pi)inferred=pr+(i-pi);
  }else if(pi>=1&&valid(out[pi-1].rank)){
   const a=Number(out[pi-1].rank),b=Number(out[pi].rank);
   if(b===a+1)inferred=b+(i-pi);
  }else if(ni+1<out.length&&valid(out[ni+1].rank)){
   const a=Number(out[ni].rank),b=Number(out[ni+1].rank);
   if(b===a+1)inferred=a-(ni-i);
  }
  if(inferred!=null&&inferred>=1&&inferred<=999&&current!==inferred){
   out[i]={...out[i],rank:inferred,rankInferred:true,rawRank:out[i].rank};
  }
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
 const tagged=members.filter(p=>!row.alliance||String(p.alliance_code).toLowerCase()===String(row.alliance).toLowerCase());
 const list=tagged.map(p=>{
  const names=[p.player_name,...(p.aliases||[])];return {p,s:Math.max(...names.map(n=>similarity(row.name,n)))};
 }).filter(x=>x.s>=.72).sort((a,b)=>b.s-a.s);
 const best=list[0],second=list[1],quality=!!row.quality;
 const threshold=quality?(row.alliance?.84:.90):(row.alliance?.92:.96);
 const margin=quality?.06:.07;
 if(!best||best.s<threshold||second&&best.s-second.s<margin&&best.s<(quality?.97:.995))return null;
 if(norm(row.name).length<=4&&best.s<(quality?.94:.995))return null;
 return {...best.p,confidence:best.s};
}
function memberKey(p){return String(p?.player_game_id||p?.player_id||'')}
function bestMemberForVariant(row,members){
 const pool=members.filter(p=>!row.alliance||String(p.alliance_code||'').toLowerCase()===String(row.alliance).toLowerCase());
 let best=null,second=null;
 for(const p of pool){
  const names=[p.player_name,...(p.aliases||[])];
  const s=Math.max(0,...names.map(n=>similarity(row.name,n)));
  const item={p,s};
  if(!best||s>best.s){second=best;best=item}else if(!second||s>second.s)second=item;
 }
 return {best,second};
}
function groupUnmatchedRows(rows,matchedRanks=new Set()){
 const byRank=new Map(),loose=[];
 for(const row of rows||[]){
  if(Number.isInteger(row.rank)&&row.rank>=1&&row.rank<=999){
   if(matchedRanks.has(row.rank))continue;
   if(!byRank.has(row.rank))byRank.set(row.rank,[]);
   byRank.get(row.rank).push(row);
  }else loose.push(row);
 }
 const grouped=[...byRank.entries()].map(([rank,variants])=>{
  const scoreGroups=new Map();
  for(const v of variants){
   const k=String(v.score);
   if(!scoreGroups.has(k))scoreGroups.set(k,[]);
   for(let n=0;n<Math.max(1,Number(v._seen)||1);n++)scoreGroups.get(k).push(v);
  }
  const scoreSets=[...scoreGroups.values()].sort((a,b)=>b.length-a.length);
  let chosen=scoreSets[0]||variants;
  if(scoreSets.length>1&&scoreSets[0].length===scoreSets[1].length){
   const nums=variants.map(v=>Number(v.score)).filter(Number.isFinite).sort((a,b)=>a-b);
   const med=nums[Math.floor(nums.length/2)];
   chosen=[...variants].sort((a,b)=>Math.abs(Number(a.score)-med)-Math.abs(Number(b.score)-med)).slice(0,1);
  }
  const allianceCounts=new Map();
  for(const v of variants)if(v.alliance){
   const k=String(v.alliance);allianceCounts.set(k,(allianceCounts.get(k)||0)+1);
  }
  const alliance=[...allianceCounts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||chosen[0]?.alliance||'';
  const rep=[...chosen].sort((a,b)=>String(b.name||'').length-String(a.name||'').length)[0]||variants[0];
  const names=[...new Set(variants.map(v=>String(v.name||'').trim()).filter(Boolean))].slice(0,4);
  const variantCount=variants.reduce((n,v)=>n+Math.max(1,Number(v._seen)||1),0);
  return {...rep,rank,alliance,variants,variantCount,
   raw:'Rang '+rank+' · '+(names.join(' / ')||rep.raw||'')+' · '+fmt(rep.score)+(variants.length>1?' · '+variants.length+' OCR':'' )};
 });
 grouped.loose=loose;
 return grouped.sort((a,b)=>a.rank-b.rank);
}
function consensusMatchGroup(group,members,usedPlayers=new Set()){
 const variants=group?.variants||[group];
 if(variants.length<2)return null;
 const votes=new Map(),scores=new Map();
 for(const row of variants){
  const {best,second}=bestMemberForVariant(row,members);
  if(!best||best.s<.78)return null;
  // Each individual sighting must have at least a small lead.
  if(second&&best.s-second.s<.025&&best.s<.94)continue;
  const key=memberKey(best.p);if(!key||usedPlayers.has(key))continue;
  const weight=Math.max(1,Number(row._seen)||1);
  votes.set(key,(votes.get(key)||0)+weight);
  if(!scores.has(key))scores.set(key,[]);
  for(let n=0;n<weight;n++)scores.get(key).push(best.s);
 }
 const ranked=[...votes.entries()].sort((a,b)=>b[1]-a[1]||
   (Math.max(...(scores.get(b[0])||[0]))-Math.max(...(scores.get(a[0])||[0]))));
 if(!ranked.length)return null;
 const [key,voteCount]=ranked[0],runner=ranked[1]?.[1]||0;
 const sims=(scores.get(key)||[]).sort((a,b)=>b-a);
 const avg=sims.reduce((a,b)=>a+b,0)/Math.max(1,sims.length);
 // Require repeat agreement. Short/noisy names need stronger confidence.
 if(voteCount<2||voteCount<=runner||avg<.84||sims[0]<.88)return null;
 const player=members.find(p=>memberKey(p)===key);if(!player)return null;
 const same=variants.filter(v=>{
  const {best}=bestMemberForVariant(v,members);return best&&memberKey(best.p)===key;
 });
 const scoreGroups=new Map();
 for(const v of same){
  const k=String(v.score);if(!scoreGroups.has(k))scoreGroups.set(k,[]);
  for(let n=0;n<Math.max(1,Number(v._seen)||1);n++)scoreGroups.get(k).push(v);
 }
 const winning=[...scoreGroups.values()].sort((a,b)=>b.length-a.length)[0]||same;
 const exemplar=[...winning].sort((a,b)=>similarity(b.name,player.player_name)-similarity(a.name,player.player_name))[0]||same[0];
 return {...exemplar,player:{...player,confidence:avg},alliance:player.alliance_code||group.alliance,
   rank:group.rank,observations:variants.length,consensus:winning.length,autoConsensus:true};
}
function frameCanvas(video){
 const canvas=document.createElement('canvas'),scale=Math.min(1.35,1400/Math.max(1,video.videoWidth));
 canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
 const cx=canvas.getContext('2d',{willReadFrequently:true});cx.drawImage(video,0,0,canvas.width,canvas.height);
 return canvas;
}
function podiumCanvas(frame){
 // Gold / Silver / Bronze use a different card design than rank 4+.
 // Crop them as one compact block; their vertical order defines ranks 1, 2, 3.
 const x=Math.round(frame.width*.03),y=Math.round(frame.height*.315),w=Math.round(frame.width*.94),h=Math.round(frame.height*.285);
 const scale=Math.min(1.15,1180/Math.max(1,w)),out=document.createElement('canvas');
 out.width=Math.max(1,Math.round(w*scale));out.height=Math.max(1,Math.round(h*scale));
 const cx=out.getContext('2d',{willReadFrequently:true});cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
 cx.drawImage(frame,x,y,w,h,0,0,out.width,out.height);return out;
}
function rankingCanvas(frame){
 // Keep the complete top of the visible ranking (ranks 1–3 live high in the view),
 // but still stop above Kingshot's sticky own-player row at the bottom.
 const x=Math.round(frame.width*.035),y=Math.round(frame.height*.205),w=Math.round(frame.width*.93),h=Math.round(frame.height*.670);
 const scale=Math.min(1.35,1350/Math.max(1,w)),out=document.createElement('canvas');
 out.width=Math.max(1,Math.round(w*scale));out.height=Math.max(1,Math.round(h*scale));
 const cx=out.getContext('2d',{willReadFrequently:true});cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
 cx.drawImage(frame,x,y,w,h,0,0,out.width,out.height);return out;
}
function enhancedCanvas(src){
 const out=document.createElement('canvas');out.width=src.width;out.height=src.height;
 const cx=out.getContext('2d',{willReadFrequently:true});cx.drawImage(src,0,0);
 const img=cx.getImageData(0,0,out.width,out.height),d=img.data;
 for(let i=0;i<d.length;i+=4){
  const g=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2],v=Math.max(0,Math.min(255,(g-128)*1.42+128));
  d[i]=d[i+1]=d[i+2]=v;
 }
 cx.putImageData(img,0,0);return out;
}
function sharpnessScore(src){
 const tiny=document.createElement('canvas'),w=160,h=Math.max(60,Math.round(src.height*(w/src.width)));
 tiny.width=w;tiny.height=h;const cx=tiny.getContext('2d',{willReadFrequently:true});cx.drawImage(src,0,0,w,h);
 const d=cx.getImageData(0,0,w,h).data;let sum=0,n=0;
 const lum=i=>.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
 for(let y=1;y<h-1;y+=2)for(let x=1;x<w-1;x+=2){
  const i=(y*w+x)*4,gx=Math.abs(lum(i+4)-lum(i-4)),gy=Math.abs(lum(i+w*4)-lum(i-w*4));sum+=gx+gy;n++;
 }
 return n?sum/n:0;
}
function recordRank(rank,time,map){
 if(!Number.isInteger(rank)||rank<1||rank>999)return;
 if(!map.has(rank))map.set(rank,[]);map.get(rank).push(time);
}
function rankCoverage(map){
 const ranks=[...map.keys()].filter(r=>Number.isInteger(r)&&r>=1&&r<=999).sort((a,b)=>a-b);
 if(!ranks.length)return {min:null,max:null,seen:[],missing:[]};
 if(ranks.length===1)return {min:ranks[0],max:ranks[0],seen:ranks,missing:[]};
 // Build dense rank clusters. A lone bad OCR rank (for example 160/240)
 // must not turn a 1–31 recording into hundreds of "missing" ranks.
 const clusters=[];let cur=[ranks[0]];
 for(let i=1;i<ranks.length;i++){
  if(ranks[i]-ranks[i-1]<=10)cur.push(ranks[i]);
  else{clusters.push(cur);cur=[ranks[i]]}
 }
 clusters.push(cur);
 const support=cluster=>cluster.reduce((n,r)=>n+(map.get(r)?.length||0),0);
 clusters.sort((a,b)=>b.length-a.length||support(b)-support(a));
 const use=clusters[0],min=use[0],max=use[use.length-1],set=new Set(use),missing=[];
 for(let r=min;r<=max;r++)if(!set.has(r))missing.push(r);
 return {min,max,seen:use,missing};
}
function medianTime(arr){if(!arr?.length)return null;const a=[...arr].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]}
function rescueTimes(coverage,rankMap,dur,used){
 const missing=[...(coverage?.missing||[])].sort((a,b)=>a-b);
 if(!missing.length)return [];
 const groups=[];let g=[missing[0]];
 for(let i=1;i<missing.length;i++){
  if(missing[i]===missing[i-1]+1)g.push(missing[i]);else{groups.push(g);g=[missing[i]]}
 }
 groups.push(g);
 const seen=[...rankMap.keys()].sort((a,b)=>a-b),out=[];
 const add=t=>{
  const v=Math.max(.03,Math.min(Math.max(.03,dur-.03),Math.round(t*100)/100));
  if(!used.some(x=>Math.abs(x-v)<.10)&&!out.some(x=>Math.abs(x-v)<.10))out.push(v);
 };
 for(const group of groups.slice(0,4)){
  const first=group[0],last=group[group.length-1];
  const lo=[...seen].reverse().find(r=>r<first),hi=seen.find(r=>r>last);
  const lt=lo!=null?medianTime(rankMap.get(lo)):null,ht=hi!=null?medianTime(rankMap.get(hi)):null;
  if(lt!=null&&ht!=null){
   const a=Math.min(lt,ht),b=Math.max(lt,ht),n=Math.min(3,Math.max(1,group.length));
   for(let i=1;i<=n;i++)add(a+(b-a)*(i/(n+1)));
  }else{
   const t=lt??ht;if(t==null)continue;
   add(t-.30);add(t+.30);
  }
 }
 return out.sort((a,b)=>a-b).slice(0,12);
}
function consensusHit(list){
 if(!list?.length)return null;
 const scores=new Map();
 for(const o of list){const k=String(o.row.score);if(!scores.has(k))scores.set(k,[]);scores.get(k).push(o)}
 const groups=[...scores.values()].sort((a,b)=>b.length-a.length||Math.max(...b.map(x=>x.player.confidence||0))-Math.max(...a.map(x=>x.player.confidence||0)));
 let chosen=groups[0];
 if(groups.length>1&&groups[0].length===groups[1].length){
  const nums=list.map(x=>x.row.score).sort((a,b)=>a-b),med=nums[Math.floor(nums.length/2)];
  chosen=[...list].sort((a,b)=>Math.abs(a.row.score-med)-Math.abs(b.row.score-med)||(b.player.confidence||0)-(a.player.confidence||0)).slice(0,1);
 }
 const exemplar=[...chosen].sort((a,b)=>(b.player.confidence||0)-(a.player.confidence||0))[0];
 const ranks=new Map();for(const o of list)if(o.row.rank){ranks.set(o.row.rank,(ranks.get(o.row.rank)||0)+1)}
 const rank=[...ranks.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||exemplar.row.rank||null;
 return {...exemplar.row,player:exemplar.player,time:exemplar.time,image:exemplar.image,rank,observations:list.length,consensus:chosen.length};
}
function baseFrameTimes(dur){
 const end=Math.max(.06,dur-.10),times=[];
 const add=t=>{const v=Math.max(.04,Math.min(end,t));if(!times.some(x=>Math.abs(x-v)<.10))times.push(v)};
 // Keep a few early samples for normal rows 4–7; podium ranks 1–3 have
 // their own dedicated OCR pass on the first frame.
 [0.08,0.52,1.10].forEach(add);
 const remaining=Math.max(4,Math.min(7,Math.ceil(dur/3)));
 for(let i=1;i<=remaining;i++)add(1.10+(end-1.10)*(i/(remaining+1)));
 add(end);
 return times.sort((a,b)=>a-b).slice(0,11);
}
async function seek(video,time){
 if(Math.abs(video.currentTime-time)<.03&&video.readyState>=2)return;
 await new Promise((resolve,reject)=>{
  let settled=false;
  const finish=(err)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   video.removeEventListener('seeked',ok);video.removeEventListener('error',bad);
   err?reject(err):resolve();
  };
  const ok=()=>finish();const bad=()=>finish(Error('Video frame could not be opened'));
  const timer=setTimeout(()=>{
   // Some mobile browsers occasionally omit seeked even though the frame is ready.
   if(video.readyState>=2&&Math.abs(video.currentTime-time)<.12)finish();
   else finish(Error('Video frame timed out'));
  },4500);
  video.addEventListener('seeked',ok,{once:true});video.addEventListener('error',bad,{once:true});
  try{video.currentTime=time}catch(err){finish(err)}
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
 '<div class="nocr-layout"><section class="nocr-panel"><div class="nocr-engine-badge">'+esc(ocr2('version'))+'</div><div class="nocr-fields">'+
 (perf?'<label>'+esc(tr('type'))+'<select id="nocrType"><option value="alliance_mobilization">Alliance Mobilization</option><option value="kvk_prep">KvK Prep · Top 200</option></select></label>':'')+
 (perf?'':'<label>'+esc(tr('event'))+'<select id="nocrEvent" disabled></select></label>')+
 '<label>'+esc(tr('occ'))+'<select id="nocrOcc"></select></label>'+
 (perf?'':'<label>'+esc(tr('day'))+'<select id="nocrPhase"></select></label><label>'+esc(tr('date'))+'<input id="nocrDay" type="date"></label>')+
 '</div><label class="nocr-file"><span class="nocr-file-icon">▣</span><strong>'+esc(tr('file'))+'</strong><small id="nocrFilename">MP4 / MOV</small><input id="nocrFile" type="file" accept="video/mp4,video/quicktime,video/*"></label>'+
 '<p class="nocr-note">'+esc(tr('video'))+'</p><button type="button" class="btn primary nocr-analyze" id="nocrAnalyze">'+esc(tr('analyze'))+'</button><div class="nocr-status" id="nocrStatus" role="status" aria-live="polite"></div></section>'+
 '<section class="nocr-panel nocr-progress" id="nocrProgress" hidden><h3>'+esc(tr('prep'))+'</h3><p id="nocrProgressText"></p><div class="nocr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="nocrBar"></span></div><div class="nocr-progress-foot"><b id="nocrPercent">0%</b><span id="nocrFound">0 '+esc(tr('found'))+'</span></div><div class="nocr-stages"><div data-step="0">✓ '+esc(ocr2('scan'))+'</div><div data-step="1">◎ '+esc(ocr2('collect'))+'</div><div data-step="2">○ '+esc(ocr2('finish'))+'</div></div></section></div>'+
 '<section class="nocr-panel nocr-review" id="nocrReview" hidden><div class="nocr-review-title"><h3>'+esc(tr('review'))+'</h3><strong id="nocrCount"></strong></div><div id="nocrResults"></div><div class="nocr-save-row"><button type="button" class="btn primary" id="nocrSave">'+esc(tr('save'))+'</button><button type="button" class="btn secondary" id="nocrEvidenceRetry" hidden>'+esc(tr('retryEvidence'))+'</button><div class="nocr-status" id="nocrSaveStatus" role="status"></div></div></section>';
 root.querySelector('#nocrFile').addEventListener('change',e=>{$('#nocrFilename',root).textContent=e.target.files?.[0]?.name||'MP4 / MOV'});
}
function progress(step,value,count,mode=''){
 const el=run?.root;if(!el)return;
 const panel=$('#nocrProgress',el);panel.hidden=false;
 const pct=Math.max(0,Math.min(100,Math.round(value)));$('#nocrBar',el).style.width=pct+'%';
 $('#nocrPercent',el).textContent=pct+'%';$('.nocr-bar',el).setAttribute('aria-valuenow',String(pct));
 const title=step===0?ocr2('scan'):step===1?(mode==='rescue'?ocr2('rescue'):ocr2('collect')):ocr2('finish');
 $('h3',panel).textContent=title;$('#nocrProgressText',el).textContent=title+' …';
 $('#nocrFound',el).textContent=count+' '+ocr2('matched');
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
 const root=r.root,event=$('#nocrEvent',root).value,occ=selectedOcc(),phase=$('#nocrPhase',root),input=$('#nocrDay',root);
 const previousPhase=phase.value,previousDate=input?.value||'';
 const list=(PHASES[event]||[]).filter(p=>{
  if(occ?.phase_hint&&p[0]!==occ.phase_hint)return false;
  if((event==='Strongest Governor'||event==='Alliance Brawl')&&occ){
   return validDay(dayUTC(occ.begin_at,Number(p[0].slice(2))-1),occ);
  }
  return true;
 });
 phase.innerHTML=list.map(p=>{
  const n=Number(p[0].slice(2)),day=(event==='Strongest Governor'||event==='Alliance Brawl')&&occ?dayUTC(occ.begin_at,n-1):'';
  return selectOption(p[1]+(day?' · '+day:''),p[0]);
 }).join('');
 if(list.some(p=>p[0]===previousPhase))phase.value=previousPhase;
 else if(list.length)phase.value=list[list.length-1][0];

 const today=dayUTC(new Date());
 input.min=occ?dayUTC(occ.begin_at):'';
 // Recording/upload day is independent from the selected event phase.
 // Allow the event window plus the following day, never a future day.
 const occEndPlusOne=occ?dayUTC(new Date(Date.parse(occ.end_at)+86400000)):today;
 input.max=dayNum(occEndPlusOne)<dayNum(today)?occEndPlusOne:today;
 const candidate=previousDate&&validRecordingDay(previousDate,occ)?previousDate:
   validRecordingDay(today,occ)?today:
   (occ?dayUTC(new Date(Math.min(Date.now(),Date.parse(occ.end_at)+86399000))):today);
 input.value=candidate;
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
  if(!occ||!$('#nocrPhase',root).value||!validRecordingDay(day,occ)){status(tr('invalid'),true);return}
 }else if(!perfOcc()){status(tr('missingEvent'),true);return}
 r.busy=true;btn.disabled=true;$('#nocrSave',root).disabled=true;$('#nocrReview',root).hidden=true;status('');
 let url,video,worker;
 try{
  progress(0,2,0);
  let members=[...(await roster())];
  if(r.kind==='perf'&&$('#nocrType',root).value==='alliance_mobilization'&&perfOcc()?.event_schedule_id){
   try{
    const extras=await rpc('get_performance_candidate_roster',{p_event_schedule_id:perfOcc().event_schedule_id});
    const ids=new Set(members.map(x=>String(x.player_game_id||x.player_id)));
    for(const p of extras||[]){const id=String(p.player_game_id||p.player_id);if(!ids.has(id)){members.push(p);ids.add(id)}}
   }catch(e){console.warn('Performance transfer roster unavailable',e)}
  }
  r.members=members;r.fileHash=await sha256(file);worker=await ensureWorker();
  video=document.createElement('video');url=await metadata(video,file);if(r!==run)return;
  const dur=video.duration;progress(1,5,0);
  const times=baseFrameTimes(dur),observations=new Map(),unmatched=new Map(),rankMap=new Map();r.frames=[];
  const processRows=(rows,sec,full)=>{
   let still=null;
   for(const row of rows){
    recordRank(row.rank,sec,rankMap);
    const p=matchPlayer(row,members);
    if(!p){
     const k=(row.rank||'')+'|'+norm(row.name)+'|'+row.score;
     if(!unmatched.has(k)){
      if(!still)still=full.toDataURL('image/jpeg',.76);
      unmatched.set(k,{...row,time:sec,image:still,_seen:1});
     }else unmatched.get(k)._seen=(unmatched.get(k)._seen||1)+1;
     continue;
    }
    if(r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'&&!(row.rank>=1&&row.rank<=200))row.rank=null;
    const key=String(p.player_game_id||p.player_id);if(!observations.has(key))observations.set(key,[]);
    if(!still)still=full.toDataURL('image/jpeg',.76);
    observations.get(key).push({row:{...row},player:p,time:sec,image:still});
   }
  };
  for(let i=0;i<times.length;i++){
   if(run!==r)break;const sec=times[i];await seek(video,sec);const full=frameCanvas(video),roi=rankingCanvas(full);
   if(r.frames.length<12&&i%Math.max(1,Math.floor(times.length/12))===0)r.frames.push({time:sec,image:full.toDataURL('image/jpeg',.72)});
   const ocr=(await worker.recognize(roi,{}, {text:true,blocks:true})).data||{};
   for(const rank of ranksFromText(ocr.text||''))recordRank(rank,sec,rankMap);
   const parsed=parseOcrData(ocr);
   processRows(parsed,sec,full);
   if(i===0){
    const podium=podiumCanvas(full),podiumText=(await worker.recognize(podium)).data?.text||'';
    const podiumRows=extractPodiumRows(podiumText);
    processRows(podiumRows,sec,full);
   }
   progress(1,5+65*((i+1)/times.length),observations.size);
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(run!==r)return;
  let coverage=rankCoverage(rankMap),rescue=rescueTimes(coverage,rankMap,dur,times);
  if(coverage.missing.length&&rescue.length){
   progress(1,72,observations.size,'rescue');
   const missingSet=new Set(coverage.missing);
   for(let i=0;i<rescue.length;i++){
    if(run!==r)break;const sec=rescue[i];await seek(video,sec);const full=frameCanvas(video),roi=rankingCanvas(full);
    const rescueData=(await worker.recognize(roi)).data||{};
    for(const rank of ranksFromText(rescueData.text||''))recordRank(rank,sec,rankMap);
    const rows=repairSequentialRanks(extractRows(rescueData.text||''));
    processRows(rows,sec,full);
    progress(1,72+22*((i+1)/rescue.length),observations.size,'rescue');
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   coverage=rankCoverage(rankMap);
  }
  if(run!==r)return;
  coverage=rankCoverage(rankMap);
  r.coverage=coverage;
  r.hits=[...observations.values()].map(consensusHit).filter(Boolean).sort((a,b)=>(a.rank&&b.rank?a.rank-b.rank:b.score-a.score));
  let matchedRanks=new Set(r.hits.map(h=>h.rank).filter(Boolean));
  const rawUnmatched=[...unmatched.values()].filter(u=>!matchedRanks.has(u.rank)&&!r.hits.some(h=>u.score===h.score&&similarity(u.name,h.player?.player_name||'')>=.62));
  let groupedUnmatched=groupUnmatchedRows(rawUnmatched,matchedRanks);
  r.looseUnmatched=groupedUnmatched.loose||[];

  // Quality pass: only re-read the name area of still-open rows at higher resolution.
  // This spends extra time where it matters instead of re-OCRing the whole video.
  const qualityTargets=groupedUnmatched.filter(g=>Number.isInteger(g.rank)&&g.variants?.some(v=>v.bbox&&Number.isFinite(v.time))).slice(0,10);
  if(qualityTargets.length){
   progress(2,94,observations.size);
   try{await worker.setParameters({preserve_interword_spaces:'1',tessedit_pageseg_mode:'7'})}catch{}
   for(let qi=0;qi<qualityTargets.length;qi++){
    if(run!==r)break;
    const group=qualityTargets[qi];
    const source=[...group.variants].filter(v=>v.bbox&&Number.isFinite(v.time)).sort((a,b)=>(b._seen||1)-(a._seen||1))[0];
    if(!source)continue;
    await seek(video,source.time);
    const full=frameCanvas(video),roi=rankingCanvas(full),crop=qualityNameCanvas(roi,source.bbox);
    if(crop){
     const txt=(await worker.recognize(crop)).data?.text||'',row=qualityNameRow(txt,group);
     if(row)processRows([row],source.time,full);
    }
    progress(2,94+2*((qi+1)/qualityTargets.length),observations.size);
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   try{await worker.setParameters({preserve_interword_spaces:'1',tessedit_pageseg_mode:'6'})}catch{}
   // Rebuild candidate groups after the dedicated row OCR.
   r.hits=[...observations.values()].map(consensusHit).filter(Boolean).sort((a,b)=>(a.rank&&b.rank?a.rank-b.rank:b.score-a.score));
   matchedRanks=new Set(r.hits.map(h=>h.rank).filter(Boolean));
   const refreshedRaw=[...unmatched.values()].filter(u=>!matchedRanks.has(u.rank)&&!r.hits.some(h=>u.score===h.score&&similarity(u.name,h.player?.player_name||'')>=.62));
   groupedUnmatched=groupUnmatchedRows(refreshedRaw,matchedRanks);
   r.looseUnmatched=groupedUnmatched.loose||[];
  }
  const usedPlayers=new Set(r.hits.map(h=>memberKey(h.player)).filter(Boolean)),rescued=[];
  for(const group of groupedUnmatched){
   const hit=consensusMatchGroup(group,members,usedPlayers);
   if(!hit)continue;
   rescued.push(hit);usedPlayers.add(memberKey(hit.player));
   if(hit.rank)matchedRanks.add(hit.rank);
  }
  if(rescued.length)r.hits=r.hits.concat(rescued).sort((a,b)=>(a.rank&&b.rank?a.rank-b.rank:b.score-a.score));
  r.unmatched=groupedUnmatched.filter(g=>Number.isInteger(g.rank)&&!matchedRanks.has(g.rank)).slice(0,40);
  progress(2,96,r.hits.length);
  if(r.kind==='law'){
   const occ=selectedOcc();
   r.preview=await rpc('preview_screen_recording_nap_occurrence_v2',{
    p_event_schedule_id:occ.event_schedule_id,p_event_name:$('#nocrEvent',root).value,
    p_phase_name:$('#nocrPhase',root).value,p_recording_day:$('#nocrDay',root).value,
    p_recording_captured_at:null,p_hits:r.hits.map(hitPayload)
   });
  }
  progress(2,100,r.hits.length);showReview(r);
  const cov=r.coverage,coveredRanks=cov?.seen?.length||0;
  const unassignedRanks=r.unmatched?.length||0;
  const assignment=' · '+r.hits.length+' '+ocr2('matched')+(unassignedRanks?' · '+unassignedRanks+' '+ocr2('unassigned'):'');
  if(cov?.min&&cov?.max&&cov.missing.length)status(coveredRanks+' '+ocr2('rankSlots')+' · '+ocr2('coverage')+' '+cov.min+'–'+cov.max+' · '+ocr2('missing')+': '+cov.missing.join(', ')+assignment+' · '+ocr2('manual'),true);
  else if(cov?.min&&cov?.max)status(coveredRanks+' '+ocr2('rankSlots')+' · '+ocr2('coverage')+' '+cov.min+'–'+cov.max+' · '+ocr2('complete')+assignment,false);
  else status(r.hits.length?tr('ready'):reviewText('nothing'),false);
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
 const exemptCount=r.kind==='law'?preview.filter(x=>x.status==='exempt').length:0;
 const visibleCount=r.hits.filter(h=>r.kind!=='law'||statuses.get(String(h.player?.player_game_id||h.player?.player_id||''))?.status!=='exempt').length;
 const cov=r.coverage,coveredRanks=cov?.seen?.length||0;
 const unassignedRanks=r.unmatched?.length||0;
 const parts=[
  visibleCount+' '+ocr2('reviewable'),
  r.hits.length+' '+ocr2('matched'),
  coveredRanks+' '+ocr2('rankSlots'),
  ...(unassignedRanks?[unassignedRanks+' '+ocr2('unassigned')]:[]),
  ...(exemptCount?[exemptCount+' '+ocr2('exemptCount')]:[]),
  ...counts
 ];
 const covText=cov?.min&&cov?.max?' · '+ocr2('coverage')+' '+cov.min+'–'+cov.max+(cov.missing.length?' · ⚠ '+ocr2('missing')+': '+cov.missing.join(', '):' · ✓'):'';
 $('#nocrCount',root).textContent=parts.join(' · ')+covText;
 $('#nocrResults',root).innerHTML=r.hits.map((h,i)=>{
  const lookup=statuses.get(String(h.player?.player_game_id||h.player?.player_id||''));
  if(r.kind==='law'&&lookup?.status==='exempt')return '';
  const st=statuses.get(String(h.player?.player_game_id||h.player?.player_id||'')),label=st?.status||'';
  const needsEvidence=r.kind==='law'&&['violation','update'].includes(label)&&!h.image;
  const allowed=r.kind==='perf'||(['violation','update'].includes(label)&&!!h.image);
  const key=String(h.player?.player_game_id||h.player?.player_id||'');
  const checked=r.selection?.has(key)?r.selection.get(key):allowed;
  const tone=r.kind==='perf'?'performance':label==='violation'?'new':label==='update'?'update':label==='already_recorded'?'already':'other';
  return '<article class="nocr-hit nocr-hit--'+tone+'"><label class="nocr-hit-check"><input type="checkbox" data-hit="'+i+'" '+(checked?'checked':'')+' '+(needsEvidence?'disabled':'')+'>'+
   '<span><strong>'+esc(h.player.player_name)+'</strong><small>'+esc(h.player.alliance_code||'')+' · '+esc(h.player.player_game_id||'')+(h.rank?' · '+esc(tr('rank'))+' '+esc(h.rank):'')+(h.observations>1?' · '+esc(h.consensus)+'/'+esc(h.observations):'')+(h.manual?' · '+esc(reviewText('manual')):'')+'</small></span></label>'+
   '<input type="text" inputmode="numeric" autocomplete="off" data-score="'+i+'" value="'+esc(points(h.score))+'" aria-label="'+esc(tr('score'))+'">'+
   (r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'?'<input type="number" min="1" max="200" step="1" data-rank="'+i+'" value="'+esc(h.rank||'')+'" aria-label="'+esc(tr('rank'))+'">':'')+
   reviewStatus(h,r,st)+(needsEvidence?'<div class="nocr-status error">'+esc(tr('evidenceRequired'))+'</div>':'')+
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
   const h={...row,player:p,alliance:p.alliance_code,manual:true,observations:row.variantCount||row.observations||1,consensus:1};
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
  if(r.kind==='law'&&!proof?.image){out.textContent=tr('evidenceRequired');return}
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
 if(r.kind==='law'&&selected.some(h=>!h.image)){$('#nocrSaveStatus',root).textContent=tr('evidenceRequired');return}
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