import {createSslSeasonPanel,sslMatchName,sslSeasonText,sslPoolPlayers} from './ssl-season.js?v=20261105-cleanup-1';
/* AllianceOS Phase 4 – GitHub Pages only: FightClub draft rosters.
 * Distinguishes confirmed source schedules from a manually chosen planning date.
 * No Discord role/slot/bot changes, no automatic player assignments. */
import {createFightClubMap} from "./fightclub-map.js?v=20261105-ssl-season-1";
import {createRosterDrafts} from "./roster-drafts.js?v=20261103-ssl-1";
import {readAttendanceNote,writeAttendanceNote,attendanceNoteLimit} from "./fightclub-attendance.js?v=20261103-ssl-1";
import {SSL_EVENT,fightEventName,mergeFightPlayers} from "./fightclub-events.js?v=20261103-ssl-1";
import {createFightclubGuests} from "./fightclub-guests.js?v=20261105-cleanup-1";
export function createFightClub({getState,getLanguage,request,flash,esc,openPlayer}){
 const readOnly=()=>getState()?.staff?.permissions?.ssl_read===true&&getState()?.staff?.is_owner!==true&&getState()?.staff?.permissions?.fightclub!==true;
 const canDossier=()=>getState()?.staff?.is_owner===true||getState()?.staff?.permissions?.members===true;
 const root=document.getElementById("fightclubRoot");
 const enabled=true; // Released for both GitHub Pages and Vercel; access is enforced by server-side module permissions.
 const copy={
 de:{intro:"Swordland und TriAlliance: Legionen planen, Verfügbarkeit berücksichtigen und Spieler nach ihrem Mystic-Trial-Score vergleichen.",
   swordland:"Swordland",triforce:"TriAlliance",swordland_summit:"SSL · Schwertland Gipfel Liga",type:"Event",date:"Planungsdatum",dateMissing:"Wähle ein Planungsdatum oder einen vorhandenen bestätigten Termin.",
   knownDates:"Vorhandene Event-Termine",manual:"Manuell geplantes Datum – nicht automatisch als Event bestätigt",
   verified:"Im Discord-Kalender erfasster Termin",source:"Datenquelle: bestehender Discord-Eventkalender (nur lesend)",
   noTime:"Legion-Zeit nicht bestätigt",utc:"UTC",head:"Legionenübersicht",l1:"Legion 1",l2:"Legion 2",reserve:"Reserve",
   full:"Vollständig verfügbar",partial:"Eingeschränkt verfügbar",unknown:"Noch unklar",unavailable:"Nicht verfügbar",
   availability:"Verfügbarkeit",legion:"Legion",role:"Kampfrolle",flex:"Flexibel",attack:"Angriff",defense:"Verteidigung",support:"Unterstützung",
   empty:"Nicht eingeteilt",confirmed:"Eingeplant",members:"Spieler",observed:"Mystic Trial erfasst",
   sum:"Mystic-Trial-Score (Summe)",sourcePower:"Mystic Trial aus letztem MightPulse-API-Abruf (kein Nachweis der Kampfstärke).",
   missingPower:"Kein Mystic-Trial-Score",note:"Leitungsnotiz",noteHint:"Intern, optional",
   plans:"Spielerplanung",filter:"Filter",all:"Alle aktiven Spieler",unassigned:"Nicht eingeteilt",assigned:"Eingeteilt",
   search:"Spielername oder ID suchen …",save:"Speichern",saving:"Speichert …",remove:"Zurücksetzen",
   copyList:"Listen kopieren",copied:"Legionlisten kopiert",copyError:"Kopieren fehlgeschlagen",
   suggestions:"Kandidaten nach Mystic Trial",suggestionHint:"Unverbindliche Sortierung nach Mystic Trial: vollständig verfügbare Kandidaten für Legion 1, eingeschränkt verfügbare für Legion 2. Keine automatische Zuteilung.",
   l1Candidates:"Für Legion 1 vormerken",l2Candidates:"Für Legion 2 vormerken",none:"Noch keine geeigneten Kandidaten mit Mystic-Trial-Score und Verfügbarkeit.",
   family:"Main-/Alt-Warnung",familyHint:"Main und Alt derselben Person sind für dieses Event gleichzeitig eingetragen. Prüfe, ob beide Accounts tatsächlich bespielt werden können.",
   stale:"Letzter Mystic Trialabruf",missing:"Unbekannt",registration:"Die Verfügbarkeit wird von R4/R5 eingetragen – keine automatische Spieleranmeldung.",
   planningNote:"Ein Spieler kann pro Eventtermin nur einer Legion oder der Reserve zugeordnet werden. Es gibt keine festen, erfundenen Legion-Kapazitäten.",
   noPlayers:"Keine passenden Spieler.",loading:"FightClub wird geladen …",error:"FightClub-Daten konnten nicht geladen werden.",
   saved:"FightClub-Zuordnung gespeichert",removed:"Planungseintrag gelöscht",selectDate:"Bitte zuerst ein Datum wählen.",
   refresh:"Aktualisieren",alts:"Alt von",noPrevious:"Für dieses Event liegen bisher keine bestätigten Termine vor.",
   snapshotHint:"Der Mystic-Trial-Score ist kein Ersatz für Kampfboni, Marschkapazität oder reale Eventleistung.",
   assignmentNone:"Nicht zugeordnet",manualDate:"Planungsdatum auswählen",noAutomatic:"Es erfolgt keine automatische Anmeldung bei Swordland oder TriAlliance."
 },
 en:{intro:"Plan Swordland and TriAlliance legions using availability and recorded Mystic Trial.",
   swordland:"Swordland",triforce:"TriAlliance",swordland_summit:"SSL · Schwertland Gipfel Liga",type:"Event",date:"Planning date",dateMissing:"Choose a planning date or an existing confirmed event date.",
   knownDates:"Existing event dates",manual:"Manually chosen planning date – not a confirmed event",
   verified:"Event date recorded in the Discord calendar",source:"Source: existing Discord event calendar (read-only)",
   noTime:"Legion time unconfirmed",utc:"UTC",head:"Legion overview",l1:"Legion 1",l2:"Legion 2",reserve:"Reserve",
   full:"Fully available",partial:"Partially available",unknown:"Unknown",unavailable:"Unavailable",
   availability:"Availability",legion:"Legion",role:"Battle role",flex:"Flexible",attack:"Attack",defense:"Defense",support:"Support",
   empty:"Unassigned",confirmed:"Planned",members:"Players",observed:"Power observed",
   sum:"Observed Mystic Trial",sourcePower:"Mystic Trial latest MightPulse API reading (not proof of combat strength).",
   missingPower:"No Mystic Trial",note:"Leadership note",noteHint:"Internal, optional",
   plans:"Player planning",filter:"Filter",all:"All active players",unassigned:"Unassigned",assigned:"Assigned",
   search:"Search player or game ID …",save:"Save",saving:"Saving …",remove:"Reset",
   copyList:"Copy lists",copied:"Legion lists copied",copyError:"Copy failed",
   suggestions:"Candidates by Mystic Trial",suggestionHint:"Advisory sorting by Mystic Trial: fully available candidates for Legion 1, partially available for Legion 2. No automatic assignments.",
   l1Candidates:"Legion 1 candidates",l2Candidates:"Legion 2 candidates",none:"No candidates with Mystic Trial and availability.",
   family:"Main/alt warning",familyHint:"A main and alt of the same person are assigned to this event. Check whether both accounts can participate.",
   stale:"Mystic Trial update",missing:"Unknown",registration:"Availability is entered by leadership; this is not player-confirmed registration.",
   planningNote:"One player can only join one legion or reserve for this event date. Legion capacities have not been assumed.",
   noPlayers:"No matching players.",loading:"Loading FightClub …",error:"Could not load FightClub data.",
   saved:"FightClub assignment saved",removed:"Planning entry removed",selectDate:"Choose a date first.",
   refresh:"Refresh",alts:"Alt of",noPrevious:"No previously confirmed dates found for this event.",
   snapshotHint:"The Mystic Trial score is not a substitute for battle buffs, march capacity or real event performance.",
   assignmentNone:"Unassigned",manualDate:"Choose planning date",noAutomatic:"No automatic Swordland or TriAlliance registration."
 },
 fr:{intro:"Planifier les légions Swordland et TriAlliance selon la disponibilité et la Mystic Trial mesurée.",
   swordland:"Swordland",triforce:"TriAlliance",swordland_summit:"SSL · Schwertland Gipfel Liga",type:"Événement",date:"Date de planification",dateMissing:"Choisir une date de planification ou une date confirmée.",
   knownDates:"Dates d'événements existantes",manual:"Date manuelle – événement non confirmé",
   verified:"Date enregistrée dans le calendrier Discord",source:"Source : calendrier Discord existant (lecture seule)",
   noTime:"Heure de légion non confirmée",utc:"UTC",head:"Vue des légions",l1:"Légion 1",l2:"Légion 2",reserve:"Réserve",
   full:"Disponible entièrement",partial:"Disponible partiellement",unknown:"Inconnu",unavailable:"Indisponible",
   availability:"Disponibilité",legion:"Légion",role:"Rôle",flex:"Flexible",attack:"Attaque",defense:"Défense",support:"Soutien",
   empty:"Non attribué",confirmed:"Planifié",members:"Joueurs",observed:"Mystic Trial relevée",
   sum:"Mystic Trial relevée cumulée",sourcePower:"Mystic Trial du dernier relevé API MightPulse (pas une mesure du combat).",
   missingPower:"Mystic Trial non vérifiée",note:"Note de direction",noteHint:"Interne, facultatif",
   plans:"Planification des joueurs",filter:"Filtre",all:"Tous les membres actifs",unassigned:"Non attribué",assigned:"Attribué",
   search:"Nom ou ID du joueur …",save:"Enregistrer",saving:"Enregistrement …",remove:"Réinitialiser",
   copyList:"Copier les listes",copied:"Listes copiées",copyError:"Échec de la copie",
   suggestions:"Candidats selon la Mystic Trial",suggestionHint:"Tri indicatif selon la Mystic Trial API : disponibles totalement pour L1, partiellement pour L2. Aucune attribution automatique.",
   l1Candidates:"Candidats légion 1",l2Candidates:"Candidats légion 2",none:"Aucun candidat disponible avec Mystic Trial vérifiée.",
   family:"Alerte principal/secondaire",familyHint:"Un principal et un secondaire de la même personne sont inscrits. Vérifier la possibilité de jouer les deux.",
   stale:"Dernier relevé de Mystic Trial",missing:"Inconnu",registration:"La disponibilité est saisie par la direction, pas confirmée par le joueur.",
   planningNote:"Un joueur ne peut rejoindre qu'une légion ou la réserve pour cette date. Aucune capacité fictive n'est imposée.",
   noPlayers:"Aucun joueur correspondant.",loading:"Chargement de FightClub …",error:"Impossible de charger FightClub.",
   saved:"Affectation enregistrée",removed:"Entrée supprimée",selectDate:"Choisir une date.",
   refresh:"Actualiser",alts:"Secondaire de",noPrevious:"Aucune date confirmée pour cet événement.",
   snapshotHint:"La Mystic Trial générale n'est pas équivalente aux bonus de combat ou aux performances réelles.",
   assignmentNone:"Non attribué",manualDate:"Choisir une date",noAutomatic:"Aucune inscription automatique aux événements."
 },
 es:{intro:"Planifica las legiones de Swordland y TriAlliance según disponibilidad y Mystic Trial registrado.",
   swordland:"Swordland",triforce:"TriAlliance",swordland_summit:"SSL · Schwertland Gipfel Liga",type:"Evento",date:"Fecha de planificación",dateMissing:"Elige una fecha o un evento confirmado.",
   knownDates:"Fechas de eventos existentes",manual:"Fecha elegida manualmente – evento no confirmado",
   verified:"Fecha registrada en el calendario de Discord",source:"Fuente: calendario de Discord existente (solo lectura)",
   noTime:"Hora de legión sin confirmar",utc:"UTC",head:"Resumen de legiones",l1:"Legión 1",l2:"Legión 2",reserve:"Reserva",
   full:"Disponible totalmente",partial:"Disponible parcialmente",unknown:"Sin confirmar",unavailable:"No disponible",
   availability:"Disponibilidad",legion:"Legión",role:"Rol de combate",flex:"Flexible",attack:"Ataque",defense:"Defensa",support:"Apoyo",
   empty:"Sin asignar",confirmed:"Planificado",members:"Jugadores",observed:"Mystic Trial registrado",
   sum:"Suma del Mystic Trial registrado",sourcePower:"Mystic Trial del último registro de API MightPulse (no mide la fuerza de combate).",
   missingPower:"Sin Mystic Trial verificado",note:"Nota de dirección",noteHint:"Interna, opcional",
   plans:"Planificación de jugadores",filter:"Filtro",all:"Todos los activos",unassigned:"Sin asignar",assigned:"Asignados",
   search:"Buscar nombre o ID …",save:"Guardar",saving:"Guardando …",remove:"Restablecer",
   copyList:"Copiar listas",copied:"Listas copiadas",copyError:"Error al copiar",
   suggestions:"Candidatos por Mystic Trial registrado",suggestionHint:"Orden orientativo por Mystic Trial API: disponibilidad total para L1, parcial para L2. Sin asignación automática.",
   l1Candidates:"Candidatos para legión 1",l2Candidates:"Candidatos para legión 2",none:"No hay candidatos con Mystic Trial verificado y disponibilidad.",
   family:"Aviso de cuenta principal/alternativa",familyHint:"Se han asignado una cuenta principal y otra alternativa de la misma persona. Comprueba que ambas puedan participar.",
   stale:"Último registro de Mystic Trial",missing:"Desconocido",registration:"La disponibilidad la introduce la dirección, no el jugador.",
   planningNote:"Cada jugador solo puede tener una legión o reserva por fecha. No se inventan cupos por legión.",
   noPlayers:"Sin jugadores que coincidan.",loading:"Cargando FightClub …",error:"No se pudieron cargar datos.",
   saved:"Asignación guardada",removed:"Entrada eliminada",selectDate:"Elige una fecha.",
   refresh:"Actualizar",alts:"Alternativa de",noPrevious:"No hay fechas confirmadas para este evento.",
   snapshotHint:"El Mystic Trial general no equivale a bonificaciones ni rendimiento real en combate.",
   assignmentNone:"Sin asignar",manualDate:"Elegir fecha",noAutomatic:"No hay inscripciones automáticas a eventos."
 }
 };
 const t=k=>(copy[getLanguage()]||copy.de)[k]||copy.de[k]||k;
 const locale=()=>({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[getLanguage()]||"de-DE");
 const number=n=>Number(n).toLocaleString(locale());
 const powerFormat=n=>n==null?"–":new Intl.NumberFormat(locale(),{maximumFractionDigits:0}).format(Number(n));
 const iso=d=>d?String(d).slice(0,10):"";
 const goodDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T00:00:00Z"))&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;
 const nextDateValid=v=>{
   if(!goodDate(v))return false;
   const diff=Date.parse(v+"T00:00:00Z")-Date.now();
   return diff>=-120*86400000 && diff<=540*86400000;
 };
 let state=null,loading=null,generation=0,eventType="swordland",sslMatchKey="",date="",search="",filter="all",pending=new Set(),warning="",rosterExpanded=true;
 const sslText=(key,values)=>sslSeasonText(getLanguage(),key,values);
 const sslPayload=()=>eventType===SSL_EVENT&&state?.ssl_season?{ssl_match_key:sslMatchKey}:{};
 const sameScope=(a,b)=>a.event_type===b.event_type&&a.battle_date===b.battle_date&&(b.ssl_match_key?a.ssl_match_key===b.ssl_match_key:!a.ssl_match_key);
 function ensureSslMatch(){if(eventType!==SSL_EVENT||!state?.ssl_season)return;const matches=state.ssl_season.matches;const match=matches.find(m=>m.match_key===sslMatchKey)||matches.find(m=>m.stage==='qualifier')||matches[0];if(match){sslMatchKey=match.match_key;date=match.battle_date;}}
 function players(){const list=mergeFightPlayers((readOnly()?state?.players:getState()?.players)||[],state?.guests||[],state?.assignments||[],eventType,date);return (eventType===SSL_EVENT&&state?.ssl_season?sslPoolPlayers(list,state.ssl_season.pool):list).filter(p=>p.active&&p.member_status!=="left"&&/^[0-9]{1,20}$/.test(String(p.game_id||""))).slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),locale()));}
 const playerMap=()=>new Map(players().map(p=>[String(p.game_id),p]));
 const scorePowers=()=>{
  const ids=new Set((getState()?.players||[]).filter(p=>p.active&&p.member_status!=='left').map(p=>String(p.game_id))),guestPowers=eventType===SSL_EVENT?(state?.guests||[]).filter(p=>!ids.has(String(p.game_id))):[];
  return [...(state?.powers||[]),...guestPowers].map(p=>({...p,power:p.mystic_trial??null}));
 };
 const powers=()=>new Map(scorePowers().map(p=>[String(p.game_id),p]));
 const assignments=()=>state?.assignments?.filter(a=>a.event_type===eventType&&a.battle_date===date&&(!sslPayload().ssl_match_key||a.ssl_match_key===sslMatchKey))||[];
 const mapUI=createFightClubMap({
  getContext:()=>({readOnly:readOnly(),eventType,date,...sslPayload(),assignments:assignments(),mapAssignments:state?.map_assignments||[],powers:scorePowers(),players:players(),state,allianceState:getState()}),
  getLanguage,request,flash,esc,onUpdated:()=>draw()
 });
 const storedAssignment=id=>assignments().find(a=>String(a.game_id)===String(id));
 const assignment=id=>drafts.get(id)?.remove?null:drafts.get(id)||storedAssignment(id);
 const drafts=createRosterDrafts({root,scope:()=>eventType+'|'+(sslPayload().ssl_match_key||date),getLanguage,esc,request,flash,redraw:()=>draw(),onSaved:(body,result)=>{
  const id=body.game_id,old=state.assignments.find(a=>sameScope(a,body)&&String(a.game_id)===id);
  const same=a=>sameScope(a,body)&&String(a.game_id)===id;
  state.assignments=state.assignments.filter(a=>!same(a));if(!result.removed)state.assignments.push(result.assignment);
  if(result.removed||body.is_reserve||(old&&(Number(old.legion)!==body.legion||Boolean(old.is_reserve)!==Boolean(body.is_reserve)))){
   state.map_assignments=(state.map_assignments||[]).filter(a=>!same(a));state.leaders=(state.leaders||[]).filter(a=>!same(a));
  }
 }});
 const seasonUI=createSslSeasonPanel({getContext:()=>({state,eventType,readOnly:readOnly(),players:(readOnly()?state?.players:getState()?.players)||[]}),getLanguage,request,esc,onUpdated:()=>draw(),canMutate:()=>!readOnly()&&!drafts.count()&&!drafts.isBusy(),onSaved:value=>{
  state.ssl_season=value.ssl_season;
  const keep=a=>a.event_type!==SSL_EVENT||a.battle_date<'2026-11-08'||a.battle_date>'2026-12-13';
  for(const key of ['assignments','map_assignments','leaders'])state[key]=[...(state[key]||[]).filter(keep),...value[key]];
 }});
 const cycles=()=>state?.cycles?.filter(c=>c.event_type===eventType)||[];
 const cycle=()=>cycles().find(c=>c.battle_date===date&&(!sslPayload().ssl_match_key||c.ssl_match_key===sslMatchKey));
 const legionName=(v,reserve=false)=>(v===1?t("l1"):v===2?t("l2"):v===0?t("reserve")+" · "+({de:"ohne Legion",en:"no legion",fr:"sans légion",es:"sin legión"}[getLanguage()]||"no legion"):t("empty"))+(reserve?' '+t('reserve'):'');
 const slotValue=a=>a&&[1,2].includes(Number(a.legion))?String(a.legion)+(a.is_reserve?'r':''):String(a?.legion??-1);
 const slotFields=value=>({legion:['1','1r','2','2r','0'].includes(String(value))?Number(String(value)[0]):-1,is_reserve:['1r','2r'].includes(String(value))});
 const rosterSlots=()=>[{legion:1,is_reserve:false},{legion:1,is_reserve:true},{legion:2,is_reserve:false},{legion:2,is_reserve:true},...(assignments().some(a=>Number(a.legion)===0)?[{legion:0,is_reserve:false}]:[])];
 function selectOptions(items,value,attr){return '<select class="control" '+attr+'>'+items.map(([v,name])=>
  '<option value="'+esc(String(v))+'" '+(String(value)===String(v)?"selected":"")+'>'+esc(name)+'</option>').join("")+'</select>';}
 function optLegion(){return [["-1",t("empty")],["1",t("l1")],["1r",legionName(1,true)],["2",t("l2")],["2r",legionName(2,true)]];}
 function optAvailability(){return [["unknown",t("unknown")],["full",t("full")],["partial",t("partial")],["unavailable",t("unavailable")]];}
 function optRole(){return [["flex",t("flex")],["attack",t("attack")],["defense",t("defense")],["support",t("support")]];}
 function minutes(utc){return utc?new Intl.DateTimeFormat(locale(),{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"}).format(new Date(utc))+" UTC":t("noTime");}
 function legionTime(legion){return cycle()?.times?.find(x=>x.legion===legion)?.starts_at||null;}
 function groupRoot(p){return String(p.main_game_id||p.game_id);}
 function overlap(){
   const seen=new Map(),conflicts=new Map(),byGame=playerMap();
   for(const a of assignments().filter(a=>[0,1,2].includes(Number(a.legion)))){
    const p=byGame.get(String(a.game_id));if(!p)continue;
    const rootId=groupRoot(p);
    if(!seen.has(rootId))seen.set(rootId,[]);
    seen.get(rootId).push(p);
   }
   for(const list of seen.values())if(list.length>1)
     for(const p of list)conflicts.set(String(p.game_id),list.filter(q=>q.game_id!==p.game_id).map(q=>q.name).join(", "));
   return conflicts;
 }
 function summary(){
   const byGame=playerMap(),powersById=powers(),assign=assignments().filter(a=>byGame.has(String(a.game_id)));
   return rosterSlots().map(({legion,is_reserve})=>{
     const rows=assign.filter(a=>Number(a.legion)===legion&&Boolean(a.is_reserve)===is_reserve),
       known=rows.map(a=>powersById.get(String(a.game_id))?.power).filter(n=>Number.isSafeInteger(Number(n))&&n!=null);
     const total=known.reduce((s,n)=>s+Number(n),0),full=rows.filter(a=>a.availability==="full").length,
       partial=rows.filter(a=>a.availability==="partial").length;
     return '<article class="fight-summary-card"><strong>'+esc(legionName(legion,is_reserve))+'</strong>'+
      (legion!==0?'<small>'+esc(minutes(legionTime(legion)))+'</small>':'')+
      '<div class="fight-summary-big">'+number(rows.length)+' <span>'+esc(t("members"))+'</span></div>'+
      '<div class="fight-summary-stats"><span>'+esc(t("full"))+': '+number(full)+'</span><span>'+esc(t("partial"))+': '+number(partial)+'</span></div>'+
      '<p>'+esc(t("sum"))+': <b>'+esc(known.length?powerFormat(total):"–")+'</b> <small>('+known.length+'/'+rows.length+' '+esc(t("observed"))+')</small></p>'+
      '</article>';
   }).join("");
 }
 const attendanceWords={de:{label:'Angemeldet, nicht erschienen',badge:'Nicht erschienen',filter:'Nicht erschienen',note:'Optional: Grund oder Rückmeldung',tooLong:'Bitte die Notiz auf höchstens 490 Zeichen kürzen, damit der Teilnahmevermerk mitgespeichert werden kann.'},en:{label:'Registered, did not attend',badge:'No-show',filter:'No-shows',note:'Optional: reason or response',tooLong:'Shorten the note to 490 characters so the attendance annotation fits.'},fr:{label:'Inscrit, absent',badge:'Absent',filter:'Inscrits absents',note:'Facultatif : motif ou retour',tooLong:'Réduisez la note à 490 caractères pour ajouter la mention.'},es:{label:'Inscrito, no asistió',badge:'No asistió',filter:'Inscritos ausentes',note:'Opcional: motivo o respuesta',tooLong:'Reduce la nota a 490 caracteres para añadir la anotación.'}};
 const at=k=>(attendanceWords[getLanguage()]||attendanceWords.en)[k];
 const guestUI=createFightclubGuests({getContext:()=>({eventType,state}),getLanguage,request,esc,onUpdated:()=>draw(),flash,canMutate:()=>!drafts.count()&&!drafts.isBusy()});
 function row(p,conflicts){
  const a=assignment(p.game_id),val=slotValue(a),attendance=readAttendanceNote(a?.notes);
  const family=conflicts.get(String(p.game_id));
  const pw=powers().get(String(p.game_id));
  const main=p.main_game_id?playerMap().get(String(p.main_game_id))?.name||p.main_game_id:null;
  return '<tr data-fight-row="'+esc(p.game_id)+'" '+(drafts.has(p.game_id)?'data-roster-dirty':'')+'><td>'+
   '<div class="fight-player-top"><button type="button" data-fight-profile="'+esc(p.game_id)+'" class="fight-player-name" '+(!canDossier()||p.is_ssl_guest?'disabled':'')+'>'+esc(p.name)+'</button>'+
    '<small>'+esc(p.game_id)+(p.is_ssl_guest?' · '+esc(sslText('guest'))+' · '+esc(p.home_alliance||'—'):'')+(main?' · '+esc(t("alts"))+' '+esc(main):'')+'</small><span class="fight-no-show-badge" data-fight-no-show-badge '+(attendance.noShow?'':'hidden')+'>'+esc(at('badge'))+'</span>'+
    '</div></td><td>'+esc(pw?.power==null?'—':powerFormat(pw.power))+'</td>'+
   [['1','L1'],['1r','L1 '+t('reserve')],['2','L2'],['2r','L2 '+t('reserve')]].map(([v,label])=>'<td class="assignment-check-cell"><label class="assignment-check"><input type="checkbox" data-fight-check="'+v+'" aria-label="'+esc(p.name+' · '+label)+'" '+(val===v?'checked ':'')+(pending.has(String(p.game_id))?'disabled':'')+'><span class="sr-only">'+esc(label)+'</span></label></td>').join('')+'<td>'+
   '<div class="fight-player-fields">'+
    '<label hidden><span>'+esc(t("legion"))+'</span>'+
    selectOptions([...optLegion(),...(val==="0"?[["0",legionName(0)]]:[])],String(val),'data-fight-legion')+'</label>'+
    '<label><span>'+esc(t("availability"))+'</span>'+
    selectOptions(optAvailability(),a?.availability||"unknown",'data-fight-availability')+'</label>'+
    '<label class="fight-no-show-control"><input type="checkbox" data-fight-no-show '+(attendance.noShow?'checked':'')+' aria-label="'+esc(p.name+' · '+at('label'))+'"><span>'+esc(at('label'))+'</span></label>'+
    '<details class="fight-row-more"><summary>⋯</summary>'+
    '<label><span>'+esc(t("role"))+'</span>'+selectOptions(optRole(),a?.combat_role||"flex",'data-fight-role')+'</label>'+
    '<label><span>'+esc(t("note"))+'</span><input class="control" type="text" maxlength="'+attendanceNoteLimit(attendance.noShow)+'" data-fight-note placeholder="'+esc(at('note'))+'" value="'+esc(attendance.note)+'"></label>'+
    (a?'<button type="button" class="ghost" data-fight-remove="'+esc(p.game_id)+'">'+esc(t("remove"))+'</button>':"")+
    '</details></div>'+
   (family?'<p class="fight-conflict">⚠ '+esc(t("family"))+': '+esc(family)+'</p>':"")+
   '</td></tr>';
 }
 function list(){
   const conflicts=overlap(),powerById=powers();
   const visible=players().filter(p=>(!search||String(p.name||"").toLocaleLowerCase().includes(search.toLocaleLowerCase())||
      String(p.game_id).includes(search))&&
      (filter==="all"||filter==="no-show"&&readAttendanceNote(assignment(p.game_id)?.notes).noShow||filter==="assigned"&&[0,1,2].includes(Number(assignment(p.game_id)?.legion))||
       filter==="unassigned"&&(!assignment(p.game_id)||Number(assignment(p.game_id)?.legion)===-1)||["1","1r","2","2r"].includes(filter)&&slotValue(assignment(p.game_id))===filter||
       filter==="0"&&assignment(p.game_id)&&Number(assignment(p.game_id).legion)===0));
   visible.sort((a,b)=>Number(powerById.get(String(b.game_id))?.power??-1)-Number(powerById.get(String(a.game_id))?.power??-1)||
    String(a.name||"").localeCompare(String(b.name||""),locale()));
   return '<section class="card fight-roster"><div class="fight-heading">'+
       '<button class="ghost" type="button" data-fight-export>'+esc(t("copyList"))+' ↗</button></div>'+
     '<p class="small-note">'+esc(t("registration"))+' '+esc(t("planningNote"))+'</p>'+
     drafts.toolbar()+'<div class="fight-filterbar"><input class="control" data-fight-search type="search" value="'+esc(search)+'" placeholder="'+esc(t("search"))+'">'+
       selectOptions([["all",t("all")],["assigned",t("assigned")],["unassigned",t("unassigned")],["no-show",at("filter")],
        ["1",t("l1")],["1r",legionName(1,true)],["2",t("l2")],["2r",legionName(2,true)],...(assignments().some(a=>Number(a.legion)===0)?[["0",legionName(0)]]:[])],filter,'data-fight-filter')+
        '<span>'+visible.length+' / '+players().length+'</span></div>'+
     '<div class="assignment-table-scroll" role="region" aria-label="'+esc(t('plans'))+'" tabindex="0"><table class="assignment-table"><thead><tr><th scope="col">'+esc(t('members'))+'</th><th scope="col">Mystic Trial</th><th scope="col">L1</th><th scope="col">L1 '+esc(t('reserve'))+'</th><th scope="col">L2</th><th scope="col">L2 '+esc(t('reserve'))+'</th><th scope="col">'+esc(t('availability'))+' / '+esc(t('note'))+'</th></tr></thead><tbody>'+
       (visible.length?visible.map(p=>row(p,conflicts)).join(''):'<tr><td colspan="7">'+esc(t('noPlayers'))+'</td></tr>')+'</tbody></table></div></section>';
 }
 function dateBar(){
   if(eventType===SSL_EVENT&&state?.ssl_season){const matches=state.ssl_season.matches;
    return seasonUI.render().replace('<!--ssl-guests-->',readOnly()?'':guestUI.render())+'<section class="card fight-dates"><div class="fight-heading"><h3>'+esc(sslText('match'))+'</h3><button class="ghost" type="button" data-fight-refresh>'+esc(t('refresh'))+'</button></div><div class="fight-switches"><label>'+esc(t('type'))+selectOptions(readOnly()?[[SSL_EVENT,fightEventName(SSL_EVENT,getLanguage())]]:[["swordland",t("swordland")],["triforce",t("triforce")],[SSL_EVENT,fightEventName(SSL_EVENT,getLanguage())]],eventType,'data-fight-type')+'</label><label>'+esc(sslText('match'))+'<select class="control" data-fight-ssl-match>'+['qualifier','points','championship'].map(stage=>'<optgroup label="'+esc(sslText(stage))+'">'+matches.filter(m=>m.stage===stage).map(m=>'<option value="'+esc(m.match_key)+'" '+(m.match_key===sslMatchKey?'selected':'')+'>'+esc(sslMatchName(m,getLanguage()))+'</option>').join('')+'</optgroup>').join('')+'</select></label></div><p class="small-note">'+esc(sslText('schedule'))+'</p></section>';
   }
   const known=cycles();
   const saved=[...new Set((state?.assignments||[]).filter(x=>x.event_type===eventType).map(x=>x.battle_date))];
   const options=[...new Set([...known.map(c=>c.battle_date),...saved])].sort().reverse();
   return '<section class="card fight-dates"><div class="fight-heading"><h3>'+esc(t("date"))+'</h3>'+
     '<button class="ghost" type="button" data-fight-refresh>'+esc(t("refresh"))+' ↻</button></div>'+
     '<div class="fight-switches"><label><span>'+esc(t("type"))+'</span>'+
     selectOptions(readOnly()?[[SSL_EVENT,fightEventName(SSL_EVENT,getLanguage())]]:[["swordland",t("swordland")],["triforce",t("triforce")],[SSL_EVENT,fightEventName(SSL_EVENT,getLanguage())]],eventType,'data-fight-type')+'</label>'+
     '<label><span>'+esc(t("date"))+'</span><input class="control" type="date" data-fight-date value="'+esc(date)+'"></label></div>'+
     '<p class="small-note">'+esc(t("knownDates"))+'</p>'+
     '<div class="fight-past-dates">'+(options.length?options.map(d=>{
       const isOfficial=known.some(c=>c.battle_date===d);
       return '<button type="button" class="ghost '+(date===d?'selected':'')+'" data-fight-known="'+esc(d)+'">'+
         esc(d)+(isOfficial?' ✓':'')+'</button>';
     }).join(""):'<span class="muted">'+esc(t("noPrevious"))+'</span>')+'</div>'+
     (date?'<p class="small-note">'+esc(cycle()?t("verified"):t("manual"))+'</p>':
       '<p class="small-note">'+esc(t("dateMissing"))+'</p>')+
     '</section>';
 }
 function readOnlyList(){
  const people=playerMap(),ps=powers(),rows=assignments().filter(a=>people.has(String(a.game_id))&&(filter==='all'||slotValue(a)===filter)&&(!search||String(people.get(String(a.game_id))?.name+' '+a.game_id).toLowerCase().includes(search.toLowerCase())));
  return '<section class="card"><div class="fight-heading"><h3>'+esc(t('plans'))+' · '+rows.length+'</h3><button class="ghost" data-fight-export>'+esc(t('copyList'))+'</button></div><div class="fight-switches"><input class="control" type="search" data-fight-search aria-label="'+esc(t('search'))+'" placeholder="'+esc(t('search'))+'" value="'+esc(search)+'">'+selectOptions([['all',t('all')],...optLegion().filter(([v])=>v!=='-1'),...(assignments().some(a=>Number(a.legion)===0)?[['0',legionName(0)]]:[])],filter,'data-fight-filter aria-label="'+esc(t('legion'))+'"')+'</div><div class="assignment-table-scroll" role="region" aria-label="SSL-Roster" tabindex="0"><table class="assignment-table"><thead><tr><th>'+esc(t('members'))+'</th><th>Mystic Trial</th><th>'+esc(t('legion'))+'</th><th>'+esc(t('availability'))+'</th></tr></thead><tbody>'+rows.map(a=>'<tr><td><strong>'+esc(people.get(String(a.game_id)).name)+'</strong><small>'+esc(a.game_id)+'</small></td><td>'+esc(powerFormat(ps.get(String(a.game_id))?.power))+'</td><td>'+esc(legionName(Number(a.legion),a.is_reserve))+'</td><td>'+esc(t(a.availability))+'</td></tr>').join('')+'</tbody></table></div>'+(rows.length?'':'<p class="small-note">'+esc(t('noPlayers'))+'</p>')+'</section>';
 }
 function draw(){
   if(!root||!enabled)return;
   if(readOnly())eventType=SSL_EVENT;
   const subtitle=document.getElementById("fightclubSubtitle");
   if(subtitle)subtitle.textContent=readOnly()?fightEventName(SSL_EVENT,getLanguage())+" · "+({de:"Nur lesen",en:"Read only",fr:"Lecture seule",es:"Solo lectura"}[getLanguage()]||"Read only"):"Swordland · TriAlliance · SSL — "+t("intro");
   if(!state){root.textContent=loading?t("loading"):t("error");return;}
   ensureSslMatch();
   let html=dateBar();
   if(eventType===SSL_EVENT&&!state.ssl_season)html+='<p class="small-note">'+esc(sslText('schedule'))+'</p>';
   if(date&&!nextDateValid(date)&&!readOnly()){
     html+='<p class="fight-conflict">'+esc(t("selectDate"))+'</p>';
   }else if(date){
     const conflicts=overlap();
     html+='<div class="fight-facts"><p>'+esc(t("source"))+' · '+esc(t("sourcePower"))+'</p>'+
       '<p>'+esc(t("snapshotHint"))+' '+esc(t("noAutomatic"))+'</p></div>'+
       '<section class="fight-overview"><h3>'+esc(t("head"))+'</h3><div class="fight-summary-grid">'+summary()+'</div></section>'+
       (conflicts.size?'<div class="fight-conflict">⚠ '+esc(t("familyHint"))+'</div>':'')+
       (readOnly()?readOnlyList():list())+mapUI.render();
   }
   root.innerHTML=html;
   if(drafts.isBusy())root.querySelectorAll('input,select,button').forEach(el=>{el.disabled=true;});
   if(drafts.count()){const quick=root.querySelector('[data-fight-fast-save]');if(quick)quick.disabled=true;}
   const auto=root.querySelector('[data-map-auto-plan]');if(auto&&drafts.count())auto.disabled=true;
   root.querySelector('[data-ssl-season-pool]')?.addEventListener('toggle',e=>seasonUI.setExpanded(e.target.open));
   const expanded=root.querySelector(".fight-roster-collapsible");
   expanded?.addEventListener("toggle",()=>{rosterExpanded=expanded.open;});
   pending.forEach(id=>{const b=root.querySelector('[data-fight-save="'+id+'"]');if(b){b.disabled=true;b.textContent=t("saving");}});
 }
 async function load(force=false){
   if(!enabled||!root)return;
   if(state&&!force){draw();return;}
   if(loading)return loading;
   const ticket=generation;
   if(!state)root.textContent=t("loading");
   loading=request("bootstrap",{action:"fightclub_data"}).then(value=>{
     if(ticket!==generation)return;
     if(!value?.ok||!Array.isArray(value.cycles)||!Array.isArray(value.assignments)||!Array.isArray(value.powers))
       throw Error("invalid_fightclub_response");
     state=value;if(readOnly()){eventType=SSL_EVENT;if(!date)date=value.assignments[0]?.battle_date||"";}warning="";draw();
   }).catch(e=>{if(ticket!==generation)return;if(readOnly())state=null;root.textContent=t("error")+" ("+String(e.message||e)+")";})
     .finally(()=>{if(ticket===generation)loading=null;});
   return loading;
 }
 function stage(id,remove=false){
  if(readOnly())return;
  if(!date||!nextDateValid(date)||drafts.isBusy())return;
  const row=root.querySelector('[data-fight-row="'+id+'"]');if(!row)return;
  let notes;
  const noteInput=row.querySelector('[data-fight-note]'),noShow=row.querySelector('[data-fight-no-show]');
  try{notes=writeAttendanceNote(noteInput.value,noShow.checked);}catch{noShow.checked=false;flash(at('tooLong'),true);notes=noteInput.value;}
  noteInput.maxLength=attendanceNoteLimit(noShow.checked);row.querySelector('[data-fight-no-show-badge]').hidden=!noShow.checked;
  const old=storedAssignment(id),base={action:'fightclub_save',event_type:eventType,battle_date:date,...sslPayload(),game_id:id,legion:old?.legion??-1,is_reserve:Boolean(old?.is_reserve),availability:old?.availability||'unknown',combat_role:old?.combat_role||'flex',notes:old?.notes||'',remove:false};
  const payload={...base,...(remove?{legion:-1,is_reserve:false}:slotFields(row.querySelector('[data-fight-legion]').value)),availability:row.querySelector('[data-fight-availability]').value,combat_role:row.querySelector('[data-fight-role]').value,notes,remove};
  drafts.set(id,payload,base);row.toggleAttribute('data-roster-dirty',drafts.has(id));
  const auto=root.querySelector('[data-map-auto-plan]');if(auto)auto.disabled=drafts.count()>0;
  const quick=root.querySelector('[data-fight-fast-save]');if(quick)quick.disabled=drafts.count()>0;
 }
 function exportText(){
   if(!date)return "";
   const people=playerMap(),ps=powers();
   const groups=rosterSlots().map(({legion:l,is_reserve})=>{
     const rows=assignments().filter(a=>Number(a.legion)===l&&Boolean(a.is_reserve)===is_reserve&&people.has(String(a.game_id)))
       .sort((a,b)=>Number(ps.get(b.game_id)?.power??-1)-Number(ps.get(a.game_id)?.power??-1));
     return legionName(l,is_reserve)+(l!==0?" · "+minutes(legionTime(l)):"")+"\n"+
       (rows.length?rows.map(a=>{
         const p=people.get(String(a.game_id));
         return String(p.name)+" | "+a.game_id+" | "+t(a.availability)+" | "+t(a.combat_role);
       }).join("\n"):"—");
   });
   return fightEventName(eventType,getLanguage())+" · "+date+"\n"+groups.join("\n\n");
 }
 if(root){
   root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-ssl-query]')){e.preventDefault();e.target.closest('.ssl-guests').querySelector('[data-ssl-search]')?.click();}});
   root.addEventListener("change",e=>{
     if(seasonUI.change(e))return;
     if(e.target.matches('[data-fight-ssl-match]')){sslMatchKey=e.target.value;ensureSslMatch();filter='all';search='';draw();return;}
     if(mapUI.change(e))return;
     const el=e.target;
     if(el.matches('[data-fight-check]')){
       const row=el.closest('[data-fight-row]'),id=row.dataset.fightRow;
       row.querySelector('[data-fight-legion]').value=el.checked?el.dataset.fightCheck:'-1';
       row.querySelectorAll('[data-fight-check]').forEach(box=>{box.checked=box===el&&el.checked;});
       stage(id);return;
     }
     if(el.matches('[data-fight-no-show]')){const row=el.closest('[data-fight-row]');stage(row.dataset.fightRow);if(el.checked)row.querySelector('.fight-row-more').open=true;return;}
     if(el.matches('[data-fight-availability],[data-fight-role]')){stage(el.closest('[data-fight-row]').dataset.fightRow);return;}
     if(el.matches("[data-fight-type]")){if(readOnly())return;eventType=el.value;sslMatchKey="";date="";filter="all";search="";draw();}
     else if(el.matches("[data-fight-date]")){if(eventType===SSL_EVENT&&state?.ssl_season)return;date=el.value;filter="all";search="";draw();}
     else if(el.matches("[data-fight-filter]")){filter=el.value;draw();}
   });
   root.addEventListener("input",e=>{
     if(seasonUI.input(e))return;
     if(guestUI.input(e))return;
     if(e.target.matches('[data-fight-note]')){stage(e.target.closest('[data-fight-row]').dataset.fightRow);return;}
     if(!e.target.matches("[data-fight-search]"))return;
     search=e.target.value;const pos=e.target.selectionStart;draw();
     const input=root.querySelector("[data-fight-search]");input?.focus();
     if(Number.isInteger(pos))input?.setSelectionRange(pos,pos);
   });
   root.addEventListener("click",async e=>{
     if(await seasonUI.click(e))return;
     if(e.target.closest('[data-fight-ssl-match]'))return;
     if(readOnly()){
      if(await mapUI.click(e))return;
      if(e.target.closest('[data-fight-refresh]')){load(true);return;}
      const known=e.target.closest('[data-fight-known]');if(known){date=known.dataset.fightKnown;filter='all';search='';draw();return;}
      if(e.target.closest('[data-fight-export]')){try{await navigator.clipboard.writeText(exportText());flash(t('copied'));}catch{flash(t('copyError'),true);}}return;
     }
     if(drafts.click(e))return;
     if(await guestUI.click(e))return;
     if(await mapUI.click(e))return;
     const target=e.target;
     if(target.closest("[data-fight-refresh]")){load(true);return;}
     const known=target.closest("[data-fight-known]");
     if(known){date=known.dataset.fightKnown;filter="all";search="";draw();return;}
     const player=target.closest("[data-fight-profile]");
     if(player){openPlayer(player.dataset.fightProfile);return;}
     const saveBtn=target.closest("[data-fight-save]");
     if(saveBtn){stage(saveBtn.dataset.fightSave);return;}
     const remove=target.closest("[data-fight-remove]");
     if(remove){stage(remove.dataset.fightRemove,true);draw();return;}
     if(target.closest("[data-fight-export]")){
       try{await navigator.clipboard.writeText(exportText());flash(t("copied"));}
       catch{flash(t("copyError"),true);}
     }
   });
 }
 function reset(){seasonUI.reset();sslMatchKey="";guestUI.reset();drafts.reset();rosterExpanded=true;mapUI.reset();generation++;state=null;loading=null;pending.clear();date="";search="";filter="all";eventType="swordland";if(root){root.innerHTML="";root.textContent="";}}
 return {enabled,open:load,render:draw,reset};
}
