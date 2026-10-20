/* AllianceOS phase 5: event participation and attendance.
 * Leadership records only; no implied player RSVP or live game attendance.
 * Only GitHub Pages pilot. Existing event cycles read-only and all times UTC.
 */
export function createEventParticipation({getState,getLanguage,request,esc,flash,openPlayer,navigate}){
 const root=document.getElementById("participationRoot");
 const enabled=location.hostname==="boltotelli.github.io"||["localhost","127.0.0.1"].includes(location.hostname);
 const words={
 de:{title:"Event-Teilnahme",intro:"Anmeldungen koordinieren, fehlende Rückmeldungen erkennen und Anwesenheit nach dem Event erfassen.",
  event:"Event",day:"Eventdatum",calendar:"Vorschläge aus der Eventplanung",manual:"Datum manuell wählen",
  projected:"Die angegebenen Wiederholungstage sind aus deiner Eventplanung berechnet – keine bestätigten Spieldaten.",
  noCycles:"Noch keine aktiven Events in der Eventplanung.",dataOnly:"Nur Leitungsangaben, keine automatischen Discord-Zusagen.",
  fromCalendar:"Rhythmus aus Eventplanung",selectedDay:"Gewählter Tag",response:"Rückmeldung",attendance:"Anwesenheit",
  open:"Offen",yes:"Zusage",maybe:"Vielleicht",no:"Absage",unknown:"Offen",present:"Anwesend",absent:"Fehlend",excused:"Entschuldigt",
  rsvpUnknown:"Keine Angabe",actualUnknown:"Noch nicht erfasst",after:"Anwesenheit erst ab Eventdatum eintragen",
  total:"Aktive Spieler",withReply:"Mit Rückmeldung",withoutReply:"Offen",yesCount:"Zusagen",maybeCount:"Vielleicht",noCount:"Absagen",excusedCount:"Entschuldigt erfasst",
  actualCount:"Anwesend erfasst",absentCount:"Fehlend erfasst",notes:"Notiz der Leitung",noteHint:"Optional, intern",
  filter:"Filter",all:"Alle",pending:"Ohne Rückmeldung",replies:"Mit Rückmeldung",noted:"Mit Notiz",
  search:"Spieler oder Kingshot-ID suchen …",power:"Kraft",missingPower:"Kraft unbekannt",
  save:"Speichern",saving:"Speichert …",remove:"Zurücksetzen",saved:"Eintrag gespeichert",removed:"Eintrag gelöscht",
  copy:"Liste kopieren",copied:"Liste kopiert",copyFail:"Kopieren nicht möglich",refresh:"Aktualisieren",
  player:"Spieler",openPlayer:"Spielerakte öffnen",mainAlt:"Alt von",unrecorded:"Noch keine Teilnehmerdaten erfasst.",
  family:"Main-/Alt-Accounts gehören ggf. derselben Person. Teilnahme beider Accounts gesondert prüfen.",
  summary:"Teilnahmeübersicht",overview:"Weitere Eventplanungen",bear:"Bärenfalle",fightclub:"FightClub",
  bearCount:"Zuordnungen",fightCount:"Legion-Plätze",fightEvents:"Geplante FightClub-Termine",
  goBear:"Zur Bärenfalle",goFight:"Zum FightClub",loading:"Eventteilnahmen werden geladen …",
  error:"Eventteilnahmen konnten nicht geladen werden.",choose:"Event und Datum wählen",
  dateRange:"Nur Termine innerhalb von 90 Tagen zurück und 365 Tagen im Voraus können bearbeitet werden.",
  incomplete:"Die Datenmenge wurde begrenzt; ggf. fehlen ältere Einträge.",
  notVerified:"Dieser Status ist von der Leitung eingetragen, keine bestätigte Spielerantwort.",
  emptyResult:"Keine Spieler passen zum Filter.",lastUpdate:"Aktualisiert",resetTip:"Eine leere Angabe ist keine Absage.",
  noDate:"Bitte ein gültiges Datum wählen.",unavailable:"Bitte keine tatsächliche Anwesenheit vor dem Event dokumentieren."},
 en:{title:"Event participation",intro:"Coordinate sign-ups, identify missing replies and record actual attendance after events.",
  event:"Event",day:"Event date",calendar:"Suggested dates from event plan",manual:"Choose date manually",
  projected:"Recurring dates are derived from your event plan, not confirmed game dates.",
  noCycles:"No active events configured in event planning.",dataOnly:"Leadership entries only; no automatic Discord RSVP.",
  fromCalendar:"Schedule from event planning",selectedDay:"Selected date",response:"Reply",attendance:"Attendance",
  open:"Pending",yes:"Yes",maybe:"Maybe",no:"No",unknown:"Pending",present:"Attended",absent:"Absent",excused:"Excused",
  rsvpUnknown:"Not provided",actualUnknown:"Not recorded",after:"Only record attendance from the event date onwards",
  total:"Active players",withReply:"Reply recorded",withoutReply:"Pending",yesCount:"Yes",maybeCount:"Maybe",noCount:"No",excusedCount:"Excused recorded",
  actualCount:"Attended recorded",absentCount:"Absent recorded",notes:"Leadership note",noteHint:"Optional, internal",
  filter:"Filter",all:"All",pending:"No reply",replies:"Has reply",noted:"Has note",
  search:"Search player or Kingshot ID …",power:"Power",missingPower:"Power unavailable",
  save:"Save",saving:"Saving …",remove:"Reset",saved:"Entry saved",removed:"Entry removed",
  copy:"Copy list",copied:"List copied",copyFail:"Unable to copy",refresh:"Refresh",
  player:"Player",openPlayer:"Open player record",mainAlt:"Alt of",unrecorded:"No attendance recorded yet.",
  family:"Main and alt accounts might belong to one person. Check availability separately.",
  summary:"Participation summary",overview:"Related event plans",bear:"Bear Trap",fightclub:"FightClub",
  bearCount:"Assignments",fightCount:"Legion places",fightEvents:"FightClub dates",
  goBear:"Go to Bear Trap",goFight:"Go to FightClub",loading:"Loading event participation …",
  error:"Could not load participation data.",choose:"Select event and date",
  dateRange:"Only dates within the past 90 days and next 365 days can be edited.",
  incomplete:"Records were capped; older results may be incomplete.",
  notVerified:"Leadership-recorded status, not a confirmed player reply.",
  emptyResult:"No players match this filter.",lastUpdate:"Updated",resetTip:"No reply is not a rejection.",
  noDate:"Please choose a valid date.",unavailable:"Do not record actual attendance before the event."},
 fr:{title:"Participation aux événements",intro:"Gérer les inscriptions, repérer les réponses manquantes et noter la présence après l'événement.",
  event:"Événement",day:"Date",calendar:"Dates suggérées du calendrier",manual:"Choisir une date",
  projected:"Dates calculées selon votre calendrier – non confirmées dans le jeu.",
  noCycles:"Aucun événement actif dans le calendrier.",dataOnly:"Informations saisies par la direction, aucune réponse Discord automatique.",
  fromCalendar:"Rythme du calendrier",selectedDay:"Date choisie",response:"Réponse",attendance:"Présence",
  open:"En attente",yes:"Oui",maybe:"Peut-être",no:"Non",unknown:"En attente",present:"Présent",absent:"Absent",excused:"Excusé",
  rsvpUnknown:"Non renseigné",actualUnknown:"Non enregistré",after:"Enregistrer la présence à partir de la date de l'événement",
  total:"Joueurs actifs",withReply:"Réponses enregistrées",withoutReply:"En attente",yesCount:"Oui",maybeCount:"Peut-être",noCount:"Non",excusedCount:"Excusés",
  actualCount:"Présences",absentCount:"Absences",notes:"Note de direction",noteHint:"Facultatif, interne",
  filter:"Filtre",all:"Tous",pending:"Sans réponse",replies:"Avec réponse",noted:"Avec note",
  search:"Rechercher joueur ou ID Kingshot …",power:"Puissance",missingPower:"Puissance indisponible",
  save:"Enregistrer",saving:"Enregistrement …",remove:"Réinitialiser",saved:"Enregistré",removed:"Supprimé",
  copy:"Copier la liste",copied:"Liste copiée",copyFail:"Impossible de copier",refresh:"Actualiser",
  player:"Joueur",openPlayer:"Ouvrir la fiche",mainAlt:"Secondaire de",unrecorded:"Pas encore de présence enregistrée.",
  family:"Un principal et son secondaire peuvent appartenir à une même personne. Vérifier les deux comptes.",
  summary:"Résumé des participations",overview:"Autres planifications",bear:"Piège à ours",fightclub:"FightClub",
  bearCount:"Affectations",fightCount:"Places de légion",fightEvents:"Dates FightClub",
  goBear:"Ouvrir piège à ours",goFight:"Ouvrir FightClub",loading:"Chargement des participations …",
  error:"Impossible de charger les participations.",choose:"Choisir événement et date",
  dateRange:"Seules les dates entre les 90 derniers et 365 prochains jours sont modifiables.",
  incomplete:"Les résultats ont été limités; certains éléments peuvent manquer.",
  notVerified:"Statut enregistré par la direction, pas réponse confirmée du joueur.",
  emptyResult:"Aucun joueur correspondant.",lastUpdate:"Actualisé",resetTip:"Absence de réponse ne signifie pas refus.",
  noDate:"Choisir une date valide.",unavailable:"Ne pas enregistrer la présence avant l'événement."},
 es:{title:"Participación en eventos",intro:"Gestiona inscripciones, respuestas pendientes y asistencia tras cada evento.",
  event:"Evento",day:"Fecha",calendar:"Fechas sugeridas del calendario",manual:"Elegir fecha manualmente",
  projected:"Fechas calculadas del calendario, no confirmadas dentro del juego.",
  noCycles:"No hay eventos activos configurados.",dataOnly:"Datos introducidos por la dirección, sin confirmaciones automáticas de Discord.",
  fromCalendar:"Programación del calendario",selectedDay:"Fecha seleccionada",response:"Respuesta",attendance:"Asistencia",
  open:"Pendiente",yes:"Sí",maybe:"Quizá",no:"No",unknown:"Pendiente",present:"Asistió",absent:"Ausente",excused:"Justificado",
  rsvpUnknown:"Sin respuesta",actualUnknown:"No registrada",after:"Registrar asistencia solo a partir del día del evento",
  total:"Jugadores activos",withReply:"Respuestas registradas",withoutReply:"Pendiente",yesCount:"Sí",maybeCount:"Quizá",noCount:"No",excusedCount:"Justificados",
  actualCount:"Asistencias",absentCount:"Ausencias",notes:"Nota de dirección",noteHint:"Opcional, interna",
  filter:"Filtro",all:"Todos",pending:"Sin respuesta",replies:"Con respuesta",noted:"Con nota",
  search:"Buscar jugador o ID Kingshot …",power:"Poder",missingPower:"Poder desconocido",
  save:"Guardar",saving:"Guardando …",remove:"Restablecer",saved:"Entrada guardada",removed:"Entrada eliminada",
  copy:"Copiar lista",copied:"Lista copiada",copyFail:"No se pudo copiar",refresh:"Actualizar",
  player:"Jugador",openPlayer:"Abrir ficha",mainAlt:"Alternativa de",unrecorded:"Sin asistencia registrada todavía.",
  family:"Principal y alternativa pueden pertenecer a la misma persona. Verifica ambas cuentas.",
  summary:"Resumen de participación",overview:"Otras planificaciones",bear:"Trampa de oso",fightclub:"FightClub",
  bearCount:"Asignaciones",fightCount:"Plazas de legión",fightEvents:"Fechas FightClub",
  goBear:"Abrir trampa de oso",goFight:"Abrir FightClub",loading:"Cargando participación …",
  error:"No se pudo cargar la participación.",choose:"Selecciona evento y fecha",
  dateRange:"Solo puedes editar fechas entre 90 días atrás y 365 días en el futuro.",
  incomplete:"La consulta está limitada; pueden faltar datos antiguos.",
  notVerified:"Estado introducido por la dirección, no confirmado por el jugador.",
  emptyResult:"Ningún jugador coincide.",lastUpdate:"Actualizado",resetTip:"Sin respuesta no significa rechazo.",
  noDate:"Selecciona una fecha válida.",unavailable:"No marques asistencia antes del evento."}
 };
 const t=k=>(words[getLanguage()]||words.de)[k]||words.de[k]||k;
 const language=()=>({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[getLanguage()]||"de-DE");
 const number=n=>Number(n).toLocaleString(language());
 const isoDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s))?String(s):"";
 const millis=s=>Date.parse(String(s)+"T00:00:00Z");
 const validDate=s=>Boolean(isoDate(s))&&Number.isFinite(millis(s))&&new Date(millis(s)).toISOString().slice(0,10)===s;
 let cache=null,loading=null,requestId=0,selectedEvent="",selectedDate="",filter="all",search="",pending=new Set();
 function eventList(){return (cache?.cycles||[]).filter(x=>x.group_key&&!["bear-1","bear-2","catalog-swordland-showdown","catalog-tri-alliance-clash"].includes(x.group_key));}
 function event(){return eventList().find(x=>x.group_key===selectedEvent);}
 function eventName(item){
   const obj=item?.title||{};
   const fallback={brawl:{de:"Alliance Brawl",en:"Alliance Brawl",fr:"Alliance Brawl",es:"Alliance Brawl"}};
   return obj[getLanguage()]||obj.de||obj.en||fallback[item.group_key]?.[getLanguage()]||String(item.group_key);
 }
 function activePlayers(){return (getState()?.players||[]).filter(p=>p.active&&p.member_status!=="left"&&/^\d{1,20}$/.test(String(p.game_id||"")))
    .slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),language()));}
 function roster(){return new Map(activePlayers().map(p=>[String(p.game_id),p]));}
 function currentRows(){return (cache?.records||[]).filter(x=>x.event_key===selectedEvent&&x.event_date===selectedDate);}
 function stored(id){return currentRows().find(x=>String(x.game_id)===String(id));}
 function tentativeDates(item){
  if(!item||!validDate(String(item.anchor_date||""))||!Number.isInteger(Number(item.interval_days))||Number(item.interval_days)<1)return [];
  const a=millis(item.anchor_date),today=millis(cache?.today||new Date().toISOString().slice(0,10)),interval=Number(item.interval_days)*86400000;
  const start=Math.floor((today-a)/interval),dates=[];
  for(let i=Math.max(0,start-1);i<=start+7;i++){
    const date=new Date(a+i*interval).toISOString().slice(0,10);
    if(validDate(date))dates.push(date);
  }
  return dates;
 }
 const select=(items,value,attr)=>'<select class="control" '+attr+'>'+items.map(([v,label])=>
   '<option value="'+esc(v)+'" '+(String(v)===String(value)?'selected':'')+'>'+esc(label)+'</option>').join("")+'</select>';
 function header(){
  const item=event(),dates=tentativeDates(item);
  return '<section class="card participation-picker"><div class="participation-heading"><h3>'+esc(t("title"))+'</h3>'+
   '<button type="button" class="ghost" data-part-refresh>'+esc(t("refresh"))+' ↻</button></div>'+
   '<div class="participation-pickers"><label><span>'+esc(t("event"))+'</span>'+
     select(eventList().map(x=>[x.group_key,eventName(x)]),selectedEvent,'data-part-event')+'</label>'+
     '<label><span>'+esc(t("day"))+'</span><input class="control" data-part-date type="date" value="'+esc(selectedDate)+'"></label></div>'+
   '<p class="small-note">'+esc(t("projected"))+'</p>'+
   '<div class="participation-day-chips">'+dates.map(d=>'<button type="button" class="ghost '+
     (d===selectedDate?'selected':'')+'" data-part-proposal="'+esc(d)+'">'+esc(d)+'</button>').join("")+'</div>'+
   '<p class="small-note">'+esc(t("dataOnly"))+' '+esc(t("dateRange"))+'</p>'+
   '</section>';
 }
 function summary(){
  const people=activePlayers(),entries=currentRows();
  const byId=new Map(entries.map(r=>[String(r.game_id),r]));
  const r=people.map(p=>byId.get(String(p.game_id))||{response:"unknown",attendance:"unknown"});
  const count=k=>r.filter(x=>x.response===k).length;
  const attended=k=>r.filter(x=>x.attendance===k).length;
  const summaryItems=[["total",people.length],["yesCount",count("yes")],["maybeCount",count("maybe")],
    ["noCount",count("no")],["withoutReply",count("unknown")],["actualCount",attended("present")],["absentCount",attended("absent")],["excusedCount",attended("excused")]];
  return '<section class="participation-summary"><div class="participation-heading"><h3>'+esc(t("summary"))+'</h3>'+
   '<button class="ghost" type="button" data-part-copy>'+esc(t("copy"))+' ↗</button></div>'+
   '<div class="participation-summary-grid">'+summaryItems.map(([label,value])=>
      '<article class="participation-count"><span>'+esc(t(label))+'</span><strong>'+esc(number(value))+'</strong></article>').join("")+'</div></section>';
 }
 function sidebar(){
  const o=cache?.overview||{};
  const blocks=[];
  if(o.bear_access!==false)blocks.push('<div><strong>'+esc(t("bear"))+'</strong><p>'+
     esc(number(o.bear_accounts||0))+' '+esc(t("bearCount"))+'</p><button type="button" class="ghost" data-part-jump="bear">'+esc(t("goBear"))+' →</button></div>');
  if(o.fightclub_access!==false)blocks.push('<div><strong>'+esc(t("fightclub"))+'</strong><p>'+
     esc(number(o.fightclub_plans||0))+' '+esc(t("fightCount"))+' · '+esc(number(o.fightclub_events||0))+
     ' '+esc(t("fightEvents"))+'</p><button type="button" class="ghost" data-part-jump="fightclub">'+esc(t("goFight"))+' →</button></div>');
  return blocks.length?'<section class="card participation-related"><h3>'+esc(t("overview"))+
    '</h3><div class="participation-related-grid">'+blocks.join("")+'</div></section>':"";
 }
 function memberRow(p){
  const r=stored(p.game_id);
  const canMark=selectedDate<=(cache?.today||new Date().toISOString().slice(0,10));
  const parent=p.main_game_id?roster().get(String(p.main_game_id))?.name||p.main_game_id:null;
  return '<article class="participation-member" data-part-row="'+esc(p.game_id)+'">'+
    '<div class="participation-member-top"><button type="button" class="participation-player-name" data-part-profile="'+esc(p.game_id)+'">'+esc(p.name||p.game_id)+'</button>'+
    '<small>'+esc(p.game_id)+(parent?' · '+esc(t("mainAlt"))+' '+esc(parent):'')+'</small>'+
    (r?.updated_at?'<span>'+esc(t("lastUpdate"))+': '+esc(String(r.updated_at).slice(0,10))+'</span>':'')+'</div>'+
    '<div class="participation-member-options"><label><span>'+esc(t("response"))+'</span>'+
       select([["unknown",t("unknown")],["yes",t("yes")],["maybe",t("maybe")],["no",t("no")]],r?.response||"unknown",'data-part-response')+'</label>'+
    '<label><span>'+esc(t("attendance"))+'</span>'+
       '<select class="control" data-part-attendance '+(!canMark?'disabled':'')+'>'+
       [["unknown",t("actualUnknown")],["present",t("present")],["absent",t("absent")],["excused",t("excused")]].map(([key,name])=>
        '<option value="'+esc(key)+'" '+((r?.attendance||"unknown")===key?'selected':'')+'>'+esc(name)+'</option>').join("")+
       '</select></label></div>'+
    '<div class="participation-member-save"><label><span>'+esc(t("notes"))+'</span>'+
       '<input class="control" type="text" data-part-notes maxlength="500" value="'+esc(r?.notes||"")+'" placeholder="'+esc(t("noteHint"))+'"></label>'+
       '<button type="button" class="primary" data-part-save="'+esc(p.game_id)+'">'+esc(t("save"))+'</button>'+
       (r?'<button type="button" class="ghost" data-part-remove="'+esc(p.game_id)+'">'+esc(t("remove"))+'</button>':'')+
       '</div></article>';
 }
 function filteredPlayers(){
  return activePlayers().filter(p=>{
   const r=stored(p.game_id);
   return (!search||String(p.name||"").toLocaleLowerCase().includes(search.toLocaleLowerCase())||
    String(p.game_id).includes(search))&&
    (filter==="all"||filter==="pending"&&(!r||r.response==="unknown")||
     filter==="replies"&&r&&r.response!=="unknown"||
     ["yes","maybe","no"].includes(filter)&&(r?.response||"unknown")===filter||
     filter==="noted"&&r?.notes);
  });
 }
 function rosterUI(){
  const people=filteredPlayers();
  return '<section class="card participation-players"><div class="participation-heading"><h3>'+esc(t("player"))+'</h3>'+
   '<span class="counter">'+people.length+' / '+activePlayers().length+'</span></div>'+
   '<div class="participation-filters"><input class="control" type="search" data-part-search value="'+esc(search)+'" placeholder="'+esc(t("search"))+'">'+
     select([["all",t("all")],["pending",t("pending")],["yes",t("yes")],["maybe",t("maybe")],
       ["no",t("no")],["replies",t("replies")],["noted",t("noted")]],filter,'data-part-filter')+'</div>'+
    '<p class="small-note">'+esc(t("notVerified"))+' '+esc(t("resetTip"))+' '+esc(t("family"))+'</p>'+
    '<div class="participation-member-list">'+(people.length?people.map(memberRow).join(""):
     '<p class="perf-empty">'+esc(t("emptyResult"))+'</p>')+'</div></section>';
 }
 function draw(){
  if(!root||!enabled)return;
  const sub=document.getElementById("participationSubtitle");if(sub)sub.textContent=t("intro");
  if(!cache){if(!loading)root.textContent=t("error");return;}
  const events=eventList();
  if(!events.some(x=>x.group_key===selectedEvent))selectedEvent=events[0]?.group_key||"";
  if(!selectedEvent){root.innerHTML='<div class="notice">'+esc(t("noCycles"))+'</div>';return;}
  root.innerHTML=header()+sidebar()+(validDate(selectedDate)?summary()+rosterUI():
    '<div class="notice">'+esc(t("choose"))+'</div>')+
    (cache.partial?'<p class="small-note">'+esc(t("incomplete"))+'</p>':'');
  pending.forEach(id=>{
   const button=root.querySelector('[data-part-save="'+id+'"]');
   if(button){button.disabled=true;button.textContent=t("saving");}
  });
 }
 async function open(force=false){
  if(!root||!enabled)return;
  if(cache&&!force){draw();return;}
  if(loading)return loading;
  const ticket=requestId;
  if(!cache)root.textContent=t("loading");
  loading=request("bootstrap",{action:"event_participation_data"}).then(response=>{
   if(ticket!==requestId)return;
   if(!response?.ok||!Array.isArray(response.cycles)||!Array.isArray(response.records))
    throw Error("invalid_participation_response");
   cache=response;
   if(!selectedEvent){
     const upcoming=eventList().map(item=>({item,next:tentativeDates(item).find(d=>d>=cache.today)||"9999-12-31"}))
       .sort((a,b)=>a.next.localeCompare(b.next));
     selectedEvent=upcoming[0]?.item?.group_key||"";
   }
   if(!selectedDate&&event())selectedDate=tentativeDates(event()).find(d=>d>=cache.today)||cache.today;
   draw();
  }).catch(e=>{if(ticket!==requestId)return;root.textContent=t("error")+" ("+String(e.message||e)+")";})
   .finally(()=>{if(ticket===requestId)loading=null;});
  return loading;
 }
 async function save(id,remove=false){
  if(!selectedEvent||!validDate(selectedDate)){flash(t("noDate"),true);return;}
  const today=cache?.today;
  const minDate=new Date(millis(today)-90*86400000).toISOString().slice(0,10);
  const maxDate=new Date(millis(today)+365*86400000).toISOString().slice(0,10);
  if(selectedDate<minDate||selectedDate>maxDate){flash(t("dateRange"),true);return;}
  if(pending.has(id))return;
  const item=root.querySelector('[data-part-row="'+id+'"]');if(!item)return;
  const reply=item.querySelector("[data-part-response]")?.value||"unknown";
  const attendance=item.querySelector("[data-part-attendance]")?.value||"unknown";
  if(!remove&&selectedDate>today&&attendance!=="unknown"){flash(t("unavailable"),true);return;}
  const notes=item.querySelector("[data-part-notes]")?.value||"";
  const ticket=requestId,ev=selectedEvent,date=selectedDate;
  pending.add(id);const btn=item.querySelector("[data-part-save]");
  if(btn){btn.disabled=true;btn.textContent=t("saving");}
  try{
   const result=await request("bootstrap",{action:"event_participation_save",
      event_key:ev,event_date:date,game_id:id,response:reply,attendance,notes,remove});
   if(ticket!==requestId)return;
   if(!result?.ok)throw Error("save_failed");
   cache.records=cache.records.filter(x=>!(x.event_key===ev&&x.event_date===date&&String(x.game_id)===id));
   if(result.record)cache.records.push(result.record);
   flash(t(result.removed?"removed":"saved"));draw();
  }catch(e){if(ticket===requestId)flash(t("error")+" ("+String(e.message||e)+")",true);}
  finally{pending.delete(id);if(ticket===requestId){const b=root.querySelector('[data-part-save="'+id+'"]');if(b){b.disabled=false;b.textContent=t("save");}}}
 }
 function exportText(){
  const ppl=roster();
  const s=[t("yes"),t("maybe"),t("no"),t("unknown")],levels=["yes","maybe","no","unknown"];
  return eventName(event())+" · "+selectedDate+"\n\n"+levels.map((status,i)=>{
   const list=activePlayers().filter(p=>(stored(p.game_id)?.response||"unknown")===status);
   return s[i]+" ("+list.length+")\n"+(list.length?list.map(p=>{
    const result=stored(p.game_id);return (p.name||p.game_id)+" | "+p.game_id+
      (result?.attendance&&result.attendance!=="unknown"?" · "+t(result.attendance):"");
   }).join("\n"):"—");
  }).join("\n\n");
 }
 if(root){
  root.addEventListener("change",e=>{
   const target=e.target;
   if(target.matches("[data-part-event]")){
    selectedEvent=target.value;selectedDate=tentativeDates(event()).find(d=>d>=cache.today)||cache.today;
    search="";filter="all";draw();
   }else if(target.matches("[data-part-date]")){
    selectedDate=target.value;search="";filter="all";draw();
   }else if(target.matches("[data-part-filter]")){filter=target.value;draw();}
  });
  root.addEventListener("input",e=>{
   if(!e.target.matches("[data-part-search]"))return;
   search=e.target.value;const caret=e.target.selectionStart;draw();
   const el=root.querySelector("[data-part-search]");el?.focus();
   if(Number.isInteger(caret))el?.setSelectionRange(caret,caret);
  });
  root.addEventListener("click",async e=>{
   const target=e.target;
   const refresh=target.closest("[data-part-refresh]");if(refresh){open(true);return;}
   const proposed=target.closest("[data-part-proposal]");
   if(proposed){selectedDate=proposed.dataset.partProposal;search="";filter="all";draw();return;}
   const jump=target.closest("[data-part-jump]");if(jump){navigate(jump.dataset.partJump);return;}
   const player=target.closest("[data-part-profile]");if(player){openPlayer(player.dataset.partProfile);return;}
   const saved=target.closest("[data-part-save]");if(saved){save(saved.dataset.partSave);return;}
   const removed=target.closest("[data-part-remove]");if(removed){save(removed.dataset.partRemove,true);return;}
   if(target.closest("[data-part-copy]")){
    try{await navigator.clipboard.writeText(exportText());flash(t("copied"));}
    catch{flash(t("copyFail"),true);}
   }
  });
 }
 function reset(){requestId++;cache=null;loading=null;pending.clear();selectedEvent="";selectedDate="";filter="all";search="";if(root){root.innerHTML="";root.textContent="";}}
 return {enabled,open,render:draw,reset};
}
