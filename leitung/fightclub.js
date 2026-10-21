/* AllianceOS Phase 4 – GitHub Pages only: FightClub draft rosters.
 * Distinguishes confirmed source schedules from a manually chosen planning date.
 * No Discord role/slot/bot changes, no automatic player assignments. */
import {createFightClubMap} from "./fightclub-map.js?v=20261021-zones-1";
export function createFightClub({getState,getLanguage,request,flash,esc,openPlayer}){
 const canDossier=()=>getState()?.staff?.is_owner===true||getState()?.staff?.permissions?.members===true;
 const root=document.getElementById("fightclubRoot");
 const enabled=true; // Released for both GitHub Pages and Vercel; access is enforced by server-side module permissions.
 const copy={
 de:{intro:"Swordland und TriAlliance: Legionen planen, Verfügbarkeit berücksichtigen und Spieler nach dokumentierter Kraft vergleichen.",
   swordland:"Swordland",triforce:"TriAlliance",type:"Event",date:"Planungsdatum",dateMissing:"Wähle ein Planungsdatum oder einen vorhandenen bestätigten Termin.",
   knownDates:"Vorhandene Event-Termine",manual:"Manuell geplantes Datum – nicht automatisch als Event bestätigt",
   verified:"Im Discord-Kalender erfasster Termin",source:"Datenquelle: bestehender Discord-Eventkalender (nur lesend)",
   noTime:"Legion-Zeit nicht bestätigt",utc:"UTC",head:"Legionenübersicht",l1:"Legion 1",l2:"Legion 2",reserve:"Reserve",
   full:"Vollständig verfügbar",partial:"Eingeschränkt verfügbar",unknown:"Noch unklar",unavailable:"Nicht verfügbar",
   availability:"Verfügbarkeit",legion:"Legion",role:"Kampfrolle",flex:"Flexibel",attack:"Angriff",defense:"Verteidigung",support:"Unterstützung",
   empty:"Nicht eingeteilt",confirmed:"Eingeplant",members:"Spieler",observed:"Kraft erfasst",
   sum:"Erfasste Kraft (Summe)",sourcePower:"Kraft aus letztem MightPulse-API-Abruf (kein Nachweis der Kampfstärke).",
   missingPower:"Keine verifizierte Kraft",note:"Leitungsnotiz",noteHint:"Intern, optional",
   plans:"Spielerplanung",filter:"Filter",all:"Alle aktiven Spieler",unassigned:"Nicht eingeteilt",assigned:"Eingeteilt",
   search:"Spielername oder ID suchen …",save:"Speichern",saving:"Speichert …",remove:"Zurücksetzen",
   copyList:"Listen kopieren",copied:"Legionlisten kopiert",copyError:"Kopieren fehlgeschlagen",
   suggestions:"Kandidaten nach Spielerkraft",suggestionHint:"Unverbindliche Sortierung nach API-Kraft: vollständig verfügbare Kandidaten für Legion 1, eingeschränkt verfügbare für Legion 2. Keine automatische Zuteilung.",
   l1Candidates:"Für Legion 1 vormerken",l2Candidates:"Für Legion 2 vormerken",none:"Noch keine geeigneten Kandidaten mit dokumentierter Kraft und Verfügbarkeit.",
   family:"Main-/Alt-Warnung",familyHint:"Main und Alt derselben Person sind für dieses Event gleichzeitig eingetragen. Prüfe, ob beide Accounts tatsächlich bespielt werden können.",
   stale:"Letzter Kraftabruf",missing:"Unbekannt",registration:"Die Verfügbarkeit wird von R4/R5 eingetragen – keine automatische Spieleranmeldung.",
   planningNote:"Ein Spieler kann pro Eventtermin nur einer Legion oder der Reserve zugeordnet werden. Es gibt keine festen, erfundenen Legion-Kapazitäten.",
   noPlayers:"Keine passenden Spieler.",loading:"FightClub wird geladen …",error:"FightClub-Daten konnten nicht geladen werden.",
   saved:"FightClub-Zuordnung gespeichert",removed:"Planungseintrag gelöscht",selectDate:"Bitte zuerst ein Datum wählen.",
   refresh:"Aktualisieren",alts:"Alt von",noPrevious:"Für dieses Event liegen bisher keine bestätigten Termine vor.",
   snapshotHint:"Allgemeine Spielerkraft ist kein Ersatz für Kampfboni, Marschkapazität oder reale Eventleistung.",
   assignmentNone:"Nicht zugeordnet",manualDate:"Planungsdatum auswählen",noAutomatic:"Es erfolgt keine automatische Anmeldung bei Swordland oder TriAlliance."
 },
 en:{intro:"Plan Swordland and TriAlliance legions using availability and recorded player power.",
   swordland:"Swordland",triforce:"TriAlliance",type:"Event",date:"Planning date",dateMissing:"Choose a planning date or an existing confirmed event date.",
   knownDates:"Existing event dates",manual:"Manually chosen planning date – not a confirmed event",
   verified:"Event date recorded in the Discord calendar",source:"Source: existing Discord event calendar (read-only)",
   noTime:"Legion time unconfirmed",utc:"UTC",head:"Legion overview",l1:"Legion 1",l2:"Legion 2",reserve:"Reserve",
   full:"Fully available",partial:"Partially available",unknown:"Unknown",unavailable:"Unavailable",
   availability:"Availability",legion:"Legion",role:"Battle role",flex:"Flexible",attack:"Attack",defense:"Defense",support:"Support",
   empty:"Unassigned",confirmed:"Planned",members:"Players",observed:"Power observed",
   sum:"Observed power total",sourcePower:"Power from latest MightPulse API reading (not proof of combat strength).",
   missingPower:"No verified power",note:"Leadership note",noteHint:"Internal, optional",
   plans:"Player planning",filter:"Filter",all:"All active players",unassigned:"Unassigned",assigned:"Assigned",
   search:"Search player or game ID …",save:"Save",saving:"Saving …",remove:"Reset",
   copyList:"Copy lists",copied:"Legion lists copied",copyError:"Copy failed",
   suggestions:"Candidates by recorded power",suggestionHint:"Advisory sorting by API power: fully available candidates for Legion 1, partially available for Legion 2. No automatic assignments.",
   l1Candidates:"Legion 1 candidates",l2Candidates:"Legion 2 candidates",none:"No candidates with verified power and availability.",
   family:"Main/alt warning",familyHint:"A main and alt of the same person are assigned to this event. Check whether both accounts can participate.",
   stale:"Last power update",missing:"Unknown",registration:"Availability is entered by leadership; this is not player-confirmed registration.",
   planningNote:"One player can only join one legion or reserve for this event date. Legion capacities have not been assumed.",
   noPlayers:"No matching players.",loading:"Loading FightClub …",error:"Could not load FightClub data.",
   saved:"FightClub assignment saved",removed:"Planning entry removed",selectDate:"Choose a date first.",
   refresh:"Refresh",alts:"Alt of",noPrevious:"No previously confirmed dates found for this event.",
   snapshotHint:"General player power is not a substitute for battle buffs, march capacity or real event performance.",
   assignmentNone:"Unassigned",manualDate:"Choose planning date",noAutomatic:"No automatic Swordland or TriAlliance registration."
 },
 fr:{intro:"Planifier les légions Swordland et TriAlliance selon la disponibilité et la puissance mesurée.",
   swordland:"Swordland",triforce:"TriAlliance",type:"Événement",date:"Date de planification",dateMissing:"Choisir une date de planification ou une date confirmée.",
   knownDates:"Dates d'événements existantes",manual:"Date manuelle – événement non confirmé",
   verified:"Date enregistrée dans le calendrier Discord",source:"Source : calendrier Discord existant (lecture seule)",
   noTime:"Heure de légion non confirmée",utc:"UTC",head:"Vue des légions",l1:"Légion 1",l2:"Légion 2",reserve:"Réserve",
   full:"Disponible entièrement",partial:"Disponible partiellement",unknown:"Inconnu",unavailable:"Indisponible",
   availability:"Disponibilité",legion:"Légion",role:"Rôle",flex:"Flexible",attack:"Attaque",defense:"Défense",support:"Soutien",
   empty:"Non attribué",confirmed:"Planifié",members:"Joueurs",observed:"Puissance relevée",
   sum:"Puissance relevée cumulée",sourcePower:"Puissance du dernier relevé API MightPulse (pas une mesure du combat).",
   missingPower:"Puissance non vérifiée",note:"Note de direction",noteHint:"Interne, facultatif",
   plans:"Planification des joueurs",filter:"Filtre",all:"Tous les membres actifs",unassigned:"Non attribué",assigned:"Attribué",
   search:"Nom ou ID du joueur …",save:"Enregistrer",saving:"Enregistrement …",remove:"Réinitialiser",
   copyList:"Copier les listes",copied:"Listes copiées",copyError:"Échec de la copie",
   suggestions:"Candidats selon la puissance",suggestionHint:"Tri indicatif selon la puissance API : disponibles totalement pour L1, partiellement pour L2. Aucune attribution automatique.",
   l1Candidates:"Candidats légion 1",l2Candidates:"Candidats légion 2",none:"Aucun candidat disponible avec puissance vérifiée.",
   family:"Alerte principal/secondaire",familyHint:"Un principal et un secondaire de la même personne sont inscrits. Vérifier la possibilité de jouer les deux.",
   stale:"Dernier relevé de puissance",missing:"Inconnu",registration:"La disponibilité est saisie par la direction, pas confirmée par le joueur.",
   planningNote:"Un joueur ne peut rejoindre qu'une légion ou la réserve pour cette date. Aucune capacité fictive n'est imposée.",
   noPlayers:"Aucun joueur correspondant.",loading:"Chargement de FightClub …",error:"Impossible de charger FightClub.",
   saved:"Affectation enregistrée",removed:"Entrée supprimée",selectDate:"Choisir une date.",
   refresh:"Actualiser",alts:"Secondaire de",noPrevious:"Aucune date confirmée pour cet événement.",
   snapshotHint:"La puissance générale n'est pas équivalente aux bonus de combat ou aux performances réelles.",
   assignmentNone:"Non attribué",manualDate:"Choisir une date",noAutomatic:"Aucune inscription automatique aux événements."
 },
 es:{intro:"Planifica las legiones de Swordland y TriAlliance según disponibilidad y poder registrado.",
   swordland:"Swordland",triforce:"TriAlliance",type:"Evento",date:"Fecha de planificación",dateMissing:"Elige una fecha o un evento confirmado.",
   knownDates:"Fechas de eventos existentes",manual:"Fecha elegida manualmente – evento no confirmado",
   verified:"Fecha registrada en el calendario de Discord",source:"Fuente: calendario de Discord existente (solo lectura)",
   noTime:"Hora de legión sin confirmar",utc:"UTC",head:"Resumen de legiones",l1:"Legión 1",l2:"Legión 2",reserve:"Reserva",
   full:"Disponible totalmente",partial:"Disponible parcialmente",unknown:"Sin confirmar",unavailable:"No disponible",
   availability:"Disponibilidad",legion:"Legión",role:"Rol de combate",flex:"Flexible",attack:"Ataque",defense:"Defensa",support:"Apoyo",
   empty:"Sin asignar",confirmed:"Planificado",members:"Jugadores",observed:"Poder registrado",
   sum:"Suma del poder registrado",sourcePower:"Poder del último registro de API MightPulse (no mide la fuerza de combate).",
   missingPower:"Sin poder verificado",note:"Nota de dirección",noteHint:"Interna, opcional",
   plans:"Planificación de jugadores",filter:"Filtro",all:"Todos los activos",unassigned:"Sin asignar",assigned:"Asignados",
   search:"Buscar nombre o ID …",save:"Guardar",saving:"Guardando …",remove:"Restablecer",
   copyList:"Copiar listas",copied:"Listas copiadas",copyError:"Error al copiar",
   suggestions:"Candidatos por poder registrado",suggestionHint:"Orden orientativo por poder API: disponibilidad total para L1, parcial para L2. Sin asignación automática.",
   l1Candidates:"Candidatos para legión 1",l2Candidates:"Candidatos para legión 2",none:"No hay candidatos con poder verificado y disponibilidad.",
   family:"Aviso de cuenta principal/alternativa",familyHint:"Se han asignado una cuenta principal y otra alternativa de la misma persona. Comprueba que ambas puedan participar.",
   stale:"Último registro de poder",missing:"Desconocido",registration:"La disponibilidad la introduce la dirección, no el jugador.",
   planningNote:"Cada jugador solo puede tener una legión o reserva por fecha. No se inventan cupos por legión.",
   noPlayers:"Sin jugadores que coincidan.",loading:"Cargando FightClub …",error:"No se pudieron cargar datos.",
   saved:"Asignación guardada",removed:"Entrada eliminada",selectDate:"Elige una fecha.",
   refresh:"Actualizar",alts:"Alternativa de",noPrevious:"No hay fechas confirmadas para este evento.",
   snapshotHint:"El poder general no equivale a bonificaciones ni rendimiento real en combate.",
   assignmentNone:"Sin asignar",manualDate:"Elegir fecha",noAutomatic:"No hay inscripciones automáticas a eventos."
 }
 };
 const t=k=>(copy[getLanguage()]||copy.de)[k]||copy.de[k]||k;
 const locale=()=>({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[getLanguage()]||"de-DE");
 const number=n=>Number(n).toLocaleString(locale());
 const powerFormat=n=>n==null?"–":new Intl.NumberFormat(locale(),{notation:"compact",maximumFractionDigits:2}).format(Number(n));
 const iso=d=>d?String(d).slice(0,10):"";
 const goodDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T00:00:00Z"))&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;
 const nextDateValid=v=>{
   if(!goodDate(v))return false;
   const diff=Date.parse(v+"T00:00:00Z")-Date.now();
   return diff>=-120*86400000 && diff<=540*86400000;
 };
 let state=null,loading=null,generation=0,eventType="swordland",date="",search="",filter="all",pending=new Set(),warning="",fastLegion=1,fastAvailability="full",rosterExpanded=false;
 function players(){return (getState()?.players||[]).filter(p=>p.active&&p.member_status!=="left"&&/^[0-9]{1,20}$/.test(String(p.game_id||""))).slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),locale()));}
 const playerMap=()=>new Map(players().map(p=>[String(p.game_id),p]));
 const powers=()=>new Map((state?.powers||[]).map(p=>[String(p.game_id),p]));
 const assignments=()=>state?.assignments?.filter(a=>a.event_type===eventType&&a.battle_date===date)||[];
 const mapUI=createFightClubMap({
  getContext:()=>({eventType,date,assignments:assignments(),mapAssignments:state?.map_assignments||[],players:players(),state}),
  getLanguage,request,flash,esc,onUpdated:()=>draw()
 });
 const assignment=id=>assignments().find(a=>String(a.game_id)===String(id));
 const cycles=()=>state?.cycles?.filter(c=>c.event_type===eventType)||[];
 const cycle=()=>cycles().find(c=>c.battle_date===date);
 const legionName=v=>v===1?t("l1"):v===2?t("l2"):v===0?(eventType==="swordland"?"📛 SAFE ZONE":t("reserve")):t("empty");
 function selectOptions(items,value,attr){return '<select class="control" '+attr+'>'+items.map(([v,name])=>
  '<option value="'+esc(String(v))+'" '+(String(value)===String(v)?"selected":"")+'>'+esc(name)+'</option>').join("")+'</select>';}
 function optLegion(){return [["-1",t("empty")],["1",t("l1")],["2",t("l2")],["0",eventType==="swordland"?"📛 SAFE ZONE":t("reserve")]];}
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
   return [1,2,0].map(legion=>{
     const rows=assign.filter(a=>Number(a.legion)===legion),
       known=rows.map(a=>powersById.get(String(a.game_id))?.power).filter(n=>Number.isSafeInteger(Number(n))&&n!=null);
     const total=known.reduce((s,n)=>s+Number(n),0),full=rows.filter(a=>a.availability==="full").length,
       partial=rows.filter(a=>a.availability==="partial").length;
     return '<article class="fight-summary-card"><strong>'+esc(legionName(legion))+'</strong>'+
      (legion!==0?'<small>'+esc(minutes(legionTime(legion)))+'</small>':'')+
      '<div class="fight-summary-big">'+number(rows.length)+' <span>'+esc(t("members"))+'</span></div>'+
      '<div class="fight-summary-stats"><span>'+esc(t("full"))+': '+number(full)+'</span><span>'+esc(t("partial"))+': '+number(partial)+'</span></div>'+
      '<p>'+esc(t("sum"))+': <b>'+esc(known.length?powerFormat(total):"–")+'</b> <small>('+known.length+'/'+rows.length+' '+esc(t("observed"))+')</small></p>'+
      '</article>';
   }).join("");
 }
 function candidateLists(){
   const powerById=powers(),listed=assignments();
   const free=players().filter(p=>!listed.some(a=>String(a.game_id)===String(p.game_id)&&[1,2].includes(Number(a.legion))));
   const candidates=(availability)=>free.filter(p=>{
     const a=assignment(p.game_id);
     return a?.availability===availability && powerById.has(String(p.game_id));
   }).sort((a,b)=>Number(powerById.get(String(b.game_id))?.power)-Number(powerById.get(String(a.game_id))?.power)).slice(0,8);
   const build=(status,key)=>{
     const sorted=candidates(status);
     return '<div class="fight-candidate-group"><strong>'+esc(t(key))+'</strong>'+
       (sorted.length?sorted.map(p=>'<div><span>'+esc(p.name)+'</span><b>'+
          esc(powerFormat(powerById.get(String(p.game_id)).power))+'</b></div>').join(""):
          '<p class="small-note">'+esc(t("none"))+'</p>')+'</div>';
   };
   return '<details class="fight-suggestions"><summary>'+esc(t("suggestions"))+'</summary>'+
     '<p class="small-note">'+esc(t("suggestionHint"))+'</p>'+
     '<div class="fight-suggestion-grid">'+build("full","l1Candidates")+build("partial","l2Candidates")+'</div></details>';
 }
 function row(p,conflicts){
  const a=assignment(p.game_id),val=a?.legion??-1;
  const family=conflicts.get(String(p.game_id));
  const pw=powers().get(String(p.game_id));
  const main=p.main_game_id?playerMap().get(String(p.main_game_id))?.name||p.main_game_id:null;
  return '<article class="fight-player fight-player-compact" data-fight-row="'+esc(p.game_id)+'">'+
   '<div class="fight-player-top"><button type="button" data-fight-profile="'+esc(p.game_id)+'" class="fight-player-name" '+(!canDossier()?'disabled':'')+'>'+esc(p.name)+'</button>'+
    '<small>'+esc(p.game_id)+(main?' · '+esc(t("alts"))+' '+esc(main):'')+'</small>'+
    '<span class="fight-power">'+esc(pw?powerFormat(pw.power):t("missingPower"))+'</span></div>'+
   '<div class="fight-player-fields">'+
    '<label><span>'+esc(t("legion"))+'</span>'+
    selectOptions(optLegion(),String(val),'data-fight-legion')+'</label>'+
    '<label><span>'+esc(t("availability"))+'</span>'+
    selectOptions(optAvailability(),a?.availability||"unknown",'data-fight-availability')+'</label>'+
    '<button type="button" class="primary" data-fight-save="'+esc(p.game_id)+'">'+esc(t("save"))+'</button>'+
    '<details class="fight-row-more"><summary>⋯</summary>'+
    '<label><span>'+esc(t("role"))+'</span>'+selectOptions(optRole(),a?.combat_role||"flex",'data-fight-role')+'</label>'+
    '<label><span>'+esc(t("note"))+'</span><input class="control" type="text" maxlength="500" data-fight-note value="'+esc(a?.notes||"")+'"></label>'+
    (a?'<button type="button" class="ghost" data-fight-remove="'+esc(p.game_id)+'">'+esc(t("remove"))+'</button>':"")+
    '</details></div>'+
   (family?'<p class="fight-conflict">⚠ '+esc(t("family"))+': '+esc(family)+'</p>':"")+
   '</article>';
 }
 function list(){
   const conflicts=overlap(),powerById=powers();
   const visible=players().filter(p=>(!search||String(p.name||"").toLocaleLowerCase().includes(search.toLocaleLowerCase())||
      String(p.game_id).includes(search))&&
      (filter==="all"||filter==="assigned"&&[0,1,2].includes(Number(assignment(p.game_id)?.legion))||
       filter==="unassigned"&&(!assignment(p.game_id)||Number(assignment(p.game_id)?.legion)===-1)||filter==="1"&&Number(assignment(p.game_id)?.legion)===1||
       filter==="2"&&Number(assignment(p.game_id)?.legion)===2||
       filter==="0"&&assignment(p.game_id)&&Number(assignment(p.game_id).legion)===0));
   visible.sort((a,b)=>Number(powerById.get(String(b.game_id))?.power??-1)-Number(powerById.get(String(a.game_id))?.power??-1)||
    String(a.name||"").localeCompare(String(b.name||""),locale()));
   return '<details class="card fight-roster fight-roster-collapsible" '+(rosterExpanded?'open':'')+'><summary>'+esc(t("plans"))+' · '+visible.length+' / '+players().length+'</summary><div class="fight-heading">'+
       '<button class="ghost" type="button" data-fight-export>'+esc(t("copyList"))+' ↗</button></div>'+
     '<p class="small-note">'+esc(t("registration"))+' '+esc(t("planningNote"))+'</p>'+
     '<div class="fight-filterbar"><input class="control" data-fight-search type="search" value="'+esc(search)+'" placeholder="'+esc(t("search"))+'">'+
       selectOptions([["all",t("all")],["assigned",t("assigned")],["unassigned",t("unassigned")],
        ["1",t("l1")],["2",t("l2")],["0",t("reserve")]],filter,'data-fight-filter')+
        '<span>'+visible.length+' / '+players().length+'</span></div>'+
     '<div class="fight-player-list">'+(visible.length?visible.map(p=>row(p,conflicts)).join(""):
       '<p class="perf-empty">'+esc(t("noPlayers"))+'</p>')+'</div></details>';
 }
 function fastAssign(){
   const availPlayers=players();
   return '<section class="card fight-fast-assign"><h3>⚡ '+esc(getLanguage()==="de"?"Schnell zuweisen":getLanguage()==="fr"?"Affectation rapide":getLanguage()==="es"?"Asignación rápida":"Quick assignment")+'</h3>'+
    '<div class="fight-fast-form"><label>'+esc(t("player"))+'<select class="control" data-fight-fast-player>'+
    '<option value="">—</option>'+availPlayers.map(p=>'<option value="'+esc(p.game_id)+'">'+esc(p.name)+' · '+esc(p.game_id)+'</option>').join("")+'</select></label>'+
    '<label>'+esc(t("legion"))+selectOptions(optLegion(),String(fastLegion),'data-fight-fast-legion')+'</label>'+
    '<label>'+esc(t("availability"))+selectOptions(optAvailability(),fastAvailability,'data-fight-fast-availability')+'</label>'+
    '<button type="button" class="primary" data-fight-fast-save>'+esc(t("save"))+'</button></div></section>';
 }
 async function fastSave(){
   if(!date||!nextDateValid(date)){flash(t("selectDate"),true);return;}
   const id=root.querySelector("[data-fight-fast-player]")?.value||"";
   if(!id){flash(t("player"),true);return;}
   if(pending.has(id))return;
   const leg=Number(root.querySelector("[data-fight-fast-legion]")?.value??-1),
       availability=root.querySelector("[data-fight-fast-availability]")?.value||"full",
       prev=assignment(id),event=eventType,eventDate=date,ticket=generation;
   pending.add(id);
   try{
     const result=await request("bootstrap",{action:"fightclub_save",event_type:event,battle_date:eventDate,
       game_id:id,legion:leg,availability,combat_role:prev?.combat_role||"flex",notes:prev?.notes||""});
     if(!result?.ok)throw Error("save_failed");
     if(ticket!==generation)return;
     state.assignments=state.assignments.filter(x=>!(x.event_type===event&&x.battle_date===eventDate&&String(x.game_id)===id));
     state.assignments.push(result.assignment);
     if(prev&&Number(prev.legion)!==leg){
       state.map_assignments=(state.map_assignments||[]).filter(x=>!(x.event_type===event&&x.battle_date===eventDate&&String(x.game_id)===id));
       state.leaders=(state.leaders||[]).filter(x=>!(x.event_type===event&&x.battle_date===eventDate&&String(x.game_id)===id));
     }
     flash(t("saved"));draw();
   }catch(e){flash(t("error")+" ("+String(e?.message||e)+")",true);}
   finally{pending.delete(id);}
 }

 function dateBar(){
   const known=cycles();
   const saved=[...new Set((state?.assignments||[]).filter(x=>x.event_type===eventType).map(x=>x.battle_date))];
   const options=[...new Set([...known.map(c=>c.battle_date),...saved])].sort().reverse();
   return '<section class="card fight-dates"><div class="fight-heading"><h3>'+esc(t("date"))+'</h3>'+
     '<button class="ghost" type="button" data-fight-refresh>'+esc(t("refresh"))+' ↻</button></div>'+
     '<div class="fight-switches"><label><span>'+esc(t("type"))+'</span>'+
     selectOptions([["swordland",t("swordland")],["triforce",t("triforce")]],eventType,'data-fight-type')+'</label>'+
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
 function draw(){
   if(!root||!enabled)return;
   const subtitle=document.getElementById("fightclubSubtitle");
   if(subtitle)subtitle.textContent=t("intro");
   if(!state){root.textContent=loading?t("loading"):t("error");return;}
   let html=dateBar();
   if(date&&!nextDateValid(date)){
     html+='<p class="fight-conflict">'+esc(t("selectDate"))+'</p>';
   }else if(date){
     const conflicts=overlap();
     html+='<div class="fight-facts"><p>'+esc(t("source"))+' · '+esc(t("sourcePower"))+'</p>'+
       '<p>'+esc(t("snapshotHint"))+' '+esc(t("noAutomatic"))+'</p></div>'+
       '<section class="fight-overview"><h3>'+esc(t("head"))+'</h3><div class="fight-summary-grid">'+summary()+'</div></section>'+
       (conflicts.size?'<div class="fight-conflict">⚠ '+esc(t("familyHint"))+'</div>':'')+
       candidateLists()+fastAssign()+mapUI.render()+list();
   }
   root.innerHTML=html;
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
     state=value;warning="";draw();
   }).catch(e=>{if(ticket!==generation)return;root.textContent=t("error")+" ("+String(e.message||e)+")";})
     .finally(()=>{if(ticket===generation)loading=null;});
   return loading;
 }
 async function save(id,remove=false){
   if(!date||!nextDateValid(date)){flash(t("selectDate"),true);return;}
   if(pending.has(id))return;
   const rowEl=root.querySelector('[data-fight-row="'+id+'"]');
   if(!rowEl)return;
   const legion=Number(rowEl.querySelector("[data-fight-legion]")?.value??-1);
   const avail=rowEl.querySelector("[data-fight-availability]")?.value||"unknown";
   const role=rowEl.querySelector("[data-fight-role]")?.value||"flex";
   const notes=rowEl.querySelector("[data-fight-note]")?.value||"";
   const ticket=generation,whichEvent=eventType,whichDate=date;
   // -1 preserves a participant's availability without assigning a legion.
   pending.add(id);
   const button=rowEl.querySelector('[data-fight-save]');if(button){button.disabled=true;button.textContent=t("saving");}
   try{
     const result=await request("bootstrap",{action:"fightclub_save",event_type:whichEvent,battle_date:whichDate,
       game_id:id,legion,availability:avail,combat_role:role,notes,remove});
     if(ticket!==generation)return;
     if(!result?.ok)throw Error("save_failed");
     const oldAssignment=state.assignments.find(a=>a.event_type===whichEvent&&a.battle_date===whichDate&&String(a.game_id)===id);
     state.assignments=state.assignments.filter(a=>!(a.event_type===whichEvent&&a.battle_date===whichDate&&String(a.game_id)===id));
     if(!result.removed)state.assignments.push(result.assignment);
     // Mirror the backend FK cascade and clearing objectives when moving legions.
     if(result.removed||(oldAssignment&&Number(oldAssignment.legion)!==legion)){
       state.map_assignments=(state.map_assignments||[]).filter(a=>!(a.event_type===whichEvent&&a.battle_date===whichDate&&String(a.game_id)===id));
       state.leaders=(state.leaders||[]).filter(a=>!(a.event_type===whichEvent&&a.battle_date===whichDate&&String(a.game_id)===id));
     }
     flash(t(result.removed?"removed":"saved"));draw();
   }catch(e){if(ticket===generation)flash(t("error")+" ("+String(e.message||e)+")",true);}
   finally{pending.delete(id);if(ticket===generation){const b=root.querySelector('[data-fight-save="'+id+'"]');if(b){b.disabled=false;b.textContent=t("save");}}}
 }
 function exportText(){
   if(!date)return "";
   const people=playerMap(),ps=powers();
   const groups=[1,2,0].map(l=>{
     const rows=assignments().filter(a=>Number(a.legion)===l&&people.has(String(a.game_id)))
       .sort((a,b)=>Number(ps.get(b.game_id)?.power??-1)-Number(ps.get(a.game_id)?.power??-1));
     return legionName(l)+(l!==0?" · "+minutes(legionTime(l)):"")+"\n"+
       (rows.length?rows.map(a=>{
         const p=people.get(String(a.game_id));
         return String(p.name)+" | "+a.game_id+" | "+t(a.availability)+" | "+t(a.combat_role);
       }).join("\n"):"—");
   });
   return t(eventType)+" · "+date+"\n"+groups.join("\n\n");
 }
 if(root){
   root.addEventListener("change",e=>{
     if(mapUI.change(e))return;
     const el=e.target;
     if(el.matches("[data-fight-fast-legion]")){fastLegion=Number(el.value);return;}
     if(el.matches("[data-fight-fast-availability]")){fastAvailability=el.value;return;}
     if(el.matches("[data-fight-type]")){eventType=el.value;date="";filter="all";search="";draw();}
     else if(el.matches("[data-fight-date]")){date=el.value;filter="all";search="";draw();}
     else if(el.matches("[data-fight-filter]")){filter=el.value;draw();}
   });
   root.addEventListener("input",e=>{
     if(!e.target.matches("[data-fight-search]"))return;
     search=e.target.value;const pos=e.target.selectionStart;draw();
     const input=root.querySelector("[data-fight-search]");input?.focus();
     if(Number.isInteger(pos))input?.setSelectionRange(pos,pos);
   });
   root.addEventListener("click",async e=>{
     if(await mapUI.click(e))return;
     if(e.target.closest("[data-fight-fast-save]")){await fastSave();return;}
     const target=e.target;
     if(target.closest("[data-fight-refresh]")){load(true);return;}
     const known=target.closest("[data-fight-known]");
     if(known){date=known.dataset.fightKnown;filter="all";search="";draw();return;}
     const player=target.closest("[data-fight-profile]");
     if(player){openPlayer(player.dataset.fightProfile);return;}
     const saveBtn=target.closest("[data-fight-save]");
     if(saveBtn){save(saveBtn.dataset.fightSave);return;}
     const remove=target.closest("[data-fight-remove]");
     if(remove){save(remove.dataset.fightRemove,true);return;}
     if(target.closest("[data-fight-export]")){
       try{await navigator.clipboard.writeText(exportText());flash(t("copied"));}
       catch{flash(t("copyError"),true);}
     }
   });
 }
 function reset(){fastLegion=1;fastAvailability="full";rosterExpanded=false;mapUI.reset();generation++;state=null;loading=null;pending.clear();date="";search="";filter="all";eventType="swordland";if(root){root.innerHTML="";root.textContent="";}}
 return {enabled,open:load,render:draw,reset};
}
