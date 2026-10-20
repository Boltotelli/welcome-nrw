/* AllianceOS Phase 3 – Leadership Bear Trap planner (GitHub Pages pilot).
   Source schedule and optimizer profiles are read-only; this only saves AllianceOS
   participation, attendance, role, and leadership notes by immutable game ID. */
export function createBearManagement({getState,getLanguage,request,esc,openPlayer,flash}){
 const root=document.getElementById("bearManagementRoot");
 const enabled=location.hostname==="boltotelli.github.io"||["localhost","127.0.0.1"].includes(location.hostname);
 const messages={
 de:{intro:"Wer spielt welche Bärenfalle? Teilnehmer zuordnen und gespeicherte Optimierer-Werte einsehen.",
  source:"Fallenzeiten aus der bestehenden Discord-Rotation (UTC), schreibgeschützt. Diese Planung verändert keine Bot-Zeiten oder Minister.",
  unavailable:"Für NRW sind derzeit keine aktiven Bärenzeiten hinterlegt.",assignment:"Teilnehmerplanung",
  summary:"Belegung der Fallen",confirmed:"Bestätigt",tentative:"Unsicher",starter:"Starter",joiner:"Joiner",flex:"Flexibel",
  empty:"Nicht zugeordnet",all:"Alle",role:"Rolle",attendance:"Teilnahme",time:"Bärenfalle",player:"Spieler",
  search:"Spielername oder Kingshot-ID …",filter:"Anzeigen",count:"Spieler",save:"Speichern",saving:"Speichert …",
  note:"Leitungsnotiz",notePlaceholder:"Optional (nicht öffentlich)",unsaved:"Noch nicht gespeichert",
  optimizer:"Bären-Optimierer",withProfile:"Optimierer vorhanden",withoutProfile:"Kein Profil",data:"Gespeicherte Optimierer-Werte",
  heroes:"Eingegebene Starter-Helden",capacity:"Schwadronskapazität",joinCount:"Join-Märsche",
  troops:"Truppenbestand",inf:"Infanterie",cav:"Kavallerie",arc:"Bogenschützen",
  attack:"Angriff",lethality:"Tödlichkeit",widget:"Widget",tier:"Tier",stars:"Sterne",level:"Level",
  comparison:"Selbsteinschätzung",stronger:"Stärker als Rallyleader",weaker:"Schwächer als Rallyleader",similar:"Etwa gleich",
  disclaimer:"Optimierer-Werte sind vom Spieler eingegeben und stellen keine bestätigte optimale Formation dar. Das geplante Starter-/Joiner-Feld ist eine separate Leitungsentscheidung.",
  noHeroes:"Keine Starter-Helden gespeichert.",latest:"Profilstand",noData:"Noch kein Optimierer-Profil.",
  showAssigned:"Zugeordnete Spieler",export:"Listen kopieren",copied:"Listen kopiert.",copyFailed:"Kopieren fehlgeschlagen.",
  loading:"Bären-Daten werden geladen …",error:"Daten konnten nicht geladen werden.",refresh:"Aktualisieren",
  saved:"Bären-Zuordnung gespeichert.",removed:"Zuordnung aufgehoben.",required:"Bitte eine Bärenzeit auswählen.",
  noPlayers:"Keine passenden Mitglieder.",management:"Verwaltung ausschließlich durch berechtigte R4/R5 – Spieler brauchen keinen eigenen Login.",
  activeOnly:"Nur aktive Allianzmitglieder. Frühere Optimierer-Profile bleiben erhalten, werden aber nicht in die Planung übernommen.",
  noteSource:"Anmeldestatus ist eine Eingabe der Leitung, keine vom Spieler bestätigte Discord-Rückmeldung.",
  altInfo:"Alt-Account",mainInfo:"Main",allCount:"Aktive Spieler"},
 en:{intro:"Assign members to Bear Traps and review their saved optimizer values.",
  source:"UTC Bear times from the existing Discord rotation (read-only). This planner does not alter bot schedules or ministers.",
  unavailable:"No active Bear Trap times are configured for this alliance.",assignment:"Member planning",
  summary:"Bear Trap attendance",confirmed:"Confirmed",tentative:"Tentative",starter:"Starter",joiner:"Joiner",flex:"Flexible",
  empty:"Unassigned",all:"All",role:"Role",attendance:"Attendance",time:"Bear Trap",player:"Player",
  search:"Player name or Kingshot ID …",filter:"Show",count:"Members",save:"Save",saving:"Saving …",
  note:"Leadership note",notePlaceholder:"Optional (not public)",unsaved:"Not saved yet",
  optimizer:"Bear Optimizer",withProfile:"Optimizer available",withoutProfile:"No profile",data:"Saved optimizer values",
  heroes:"Entered starter heroes",capacity:"Squad capacity",joinCount:"Join marches",
  troops:"Troop inventory",inf:"Infantry",cav:"Cavalry",arc:"Archers",
  attack:"Attack",lethality:"Lethality",widget:"Widget",tier:"Tier",stars:"Stars",level:"Level",
  comparison:"Self-assessment",stronger:"Stronger than rally leaders",weaker:"Weaker than rally leaders",similar:"Similar strength",
  disclaimer:"Optimizer values are player-entered, not a verified optimal lineup. Planned Starter/Joiner role is a separate leadership decision.",
  noHeroes:"No starter heroes entered.",latest:"Profile updated",noData:"No optimizer profile yet.",
  showAssigned:"Assigned members",export:"Copy lists",copied:"Lists copied.",copyFailed:"Could not copy lists.",
  loading:"Loading Bear Trap data …",error:"Could not load Bear Trap data.",refresh:"Refresh",
  saved:"Bear assignment saved.",removed:"Assignment removed.",required:"Select a Bear Trap time.",
  noPlayers:"No matching members.",management:"Managed by authorized R4/R5 only; player logins are not required.",
  activeOnly:"Active alliance members only. Former optimizer profiles are retained but excluded from planning.",
  noteSource:"Attendance is entered by leadership; it is not a confirmed Discord response from the player.",
  altInfo:"Alt account",mainInfo:"Main",allCount:"Active players"},
 fr:{intro:"Répartir les joueurs entre les pièges à ours et consulter les valeurs enregistrées.",
  source:"Heures UTC de la rotation Discord existante (lecture seule). Aucun horaire du bot ou ministre n'est modifié.",
  unavailable:"Aucun horaire actif de piège à ours.",assignment:"Organisation des membres",
  summary:"Participation aux pièges",confirmed:"Confirmé",tentative:"Incertain",starter:"Lanceur",joiner:"Participant",flex:"Flexible",
  empty:"Non attribué",all:"Tous",role:"Rôle",attendance:"Participation",time:"Piège à ours",player:"Joueur",
  search:"Nom ou identifiant Kingshot …",filter:"Afficher",count:"Joueurs",save:"Enregistrer",saving:"Enregistrement …",
  note:"Note de direction",notePlaceholder:"Facultatif (non public)",unsaved:"Non enregistré",
  optimizer:"Optimiseur ours",withProfile:"Profil disponible",withoutProfile:"Aucun profil",data:"Valeurs enregistrées",
  heroes:"Héros de départ saisis",capacity:"Capacité de marche",joinCount:"Marches de renfort",
  troops:"Troupes",inf:"Infanterie",cav:"Cavalerie",arc:"Archers",
  attack:"Attaque",lethality:"Létalité",widget:"Widget",tier:"Palier",stars:"Étoiles",level:"Niveau",
  comparison:"Auto-évaluation",stronger:"Plus fort que les lanceurs",weaker:"Moins fort que les lanceurs",similar:"Force semblable",
  disclaimer:"Données saisies par les joueurs, pas une formation optimale certifiée. Le rôle est défini séparément par la direction.",
  noHeroes:"Aucun héros renseigné.",latest:"Profil modifié",noData:"Aucun profil d'optimiseur.",
  showAssigned:"Joueurs attribués",export:"Copier les listes",copied:"Listes copiées.",copyFailed:"Copie impossible.",
  loading:"Chargement des données …",error:"Chargement impossible.",refresh:"Actualiser",
  saved:"Affectation enregistrée.",removed:"Affectation effacée.",required:"Choisir un horaire.",
  noPlayers:"Aucun joueur correspondant.",management:"Gestion réservée aux R4/R5 autorisés – aucun compte joueur requis.",
  activeOnly:"Membres actifs seulement. Les anciens profils restent conservés hors de cette liste.",
  noteSource:"Participation renseignée par la direction, non confirmée par une réponse Discord du joueur.",
  altInfo:"Compte secondaire",mainInfo:"Principal",allCount:"Joueurs actifs"},
 es:{intro:"Organiza quién juega cada trampa de oso y consulta los datos guardados del optimizador.",
  source:"Horarios UTC de la rotación existente de Discord (solo lectura). No cambia horarios ni ministros.",
  unavailable:"No hay horarios activos de trampa de oso.",assignment:"Planificación de miembros",
  summary:"Asistencia a trampas",confirmed:"Confirmado",tentative:"Posible",starter:"Iniciador",joiner:"Participante",flex:"Flexible",
  empty:"Sin asignar",all:"Todos",role:"Rol",attendance:"Asistencia",time:"Trampa de oso",player:"Jugador",
  search:"Nombre o ID de Kingshot …",filter:"Mostrar",count:"Jugadores",save:"Guardar",saving:"Guardando …",
  note:"Nota de dirección",notePlaceholder:"Opcional (no público)",unsaved:"Aún sin guardar",
  optimizer:"Optimizador de oso",withProfile:"Optimizador disponible",withoutProfile:"Sin perfil",data:"Valores del optimizador",
  heroes:"Héroes iniciales introducidos",capacity:"Capacidad de marcha",joinCount:"Marchas de unión",
  troops:"Tropas",inf:"Infantería",cav:"Caballería",arc:"Arqueros",
  attack:"Ataque",lethality:"Letalidad",widget:"Widget",tier:"Grado",stars:"Estrellas",level:"Nivel",
  comparison:"Autoevaluación",stronger:"Más fuerte que los líderes",weaker:"Más débil que los líderes",similar:"Fuerza similar",
  disclaimer:"Valores introducidos por jugadores, no una formación óptima confirmada. La función planificada se decide por separado.",
  noHeroes:"No hay héroes iniciales.",latest:"Perfil actualizado",noData:"Sin perfil de optimizador.",
  showAssigned:"Jugadores asignados",export:"Copiar listas",copied:"Listas copiadas.",copyFailed:"No se pudo copiar.",
  loading:"Cargando datos …",error:"No se pudieron cargar datos.",refresh:"Actualizar",
  saved:"Asignación guardada.",removed:"Asignación eliminada.",required:"Selecciona una hora.",
  noPlayers:"Ningún miembro coincide.",management:"Solo R4/R5 autorizados; no se necesita cuenta individual.",
  activeOnly:"Solo miembros activos. Los perfiles anteriores se conservan, pero no aparecen aquí.",
  noteSource:"Asistencia introducida por la dirección; no es una respuesta confirmada del jugador en Discord.",
  altInfo:"Cuenta alternativa",mainInfo:"Principal",allCount:"Jugadores activos"}
 };
 const t=k=>(messages[getLanguage()]||messages.de)[k]||messages.de[k]||k;
 const locale=()=>({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[getLanguage()]||"de-DE");
 const fmt=n=>n===null||n===undefined||n===""?"–":Number(n).toLocaleString(locale());
 const pct=n=>n===null||n===undefined||n===""?"–":Number(n).toLocaleString(locale(),{maximumFractionDigits:2})+"%";
 const when=raw=>raw?new Date(raw).toLocaleDateString(locale()):"–";
 const hhmm=s=>String(s||"").slice(0,5);
 let cache=null,loading=null,generation=0,filter="all",query="",pending=new Set();
 const byId=()=>new Map((getState()?.players||[]).map(p=>[String(p.game_id),p]));
 function active(){return (getState()?.players||[]).filter(p=>p.active&&p.member_status!=="left"&&/^[0-9]{1,20}$/.test(String(p.game_id||""))).slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),locale()));}
 function assignment(id){return (cache?.assignments||[]).find(x=>String(x.game_id)===String(id));}
 function profile(id){return (cache?.profiles||[]).find(x=>String(x.game_id)===String(id));}
 function slot(id){return (cache?.slots||[]).find(x=>x.slot_key===id);}
 function slotLabel(s){return (s.slot_label?s.slot_label+" · ":"")+hhmm(s.start_time)+" UTC";}
 function select(options,value,extra=""){return '<select class="control" '+extra+'>'+options.map(([v,label])=>
  '<option value="'+esc(v)+'" '+(v===value?'selected':'')+'>'+esc(label)+'</option>').join("")+'</select>';}
 function dataProfile(p){
  if(!p)return '<div class="bear-opt-empty">'+esc(t("noData"))+'</div>';
  const heroes=(p.heroes||[]).length?(p.heroes||[]).map(h=>
    '<div class="bear-hero-chip"><b>'+esc(h.name)+'</b><small>★ '+esc(fmt(h.stars))+' · T'+esc(fmt(h.tier))+
    ' · '+esc(t("level"))+' '+esc(fmt(h.level))+' · '+esc(t("widget"))+' '+esc(fmt(h.widget))+'</small></div>').join("")
    :'<span class="muted">'+esc(t("noHeroes"))+'</span>';
  const values=[["capacity",fmt(p.capacity)],["joinCount",fmt(p.join_count)],
    ["inf",fmt(p.troops?.inf)],["cav",fmt(p.troops?.cav)],["arc",fmt(p.troops?.arc)]];
  const stats=[["inf",p.stats?.inf_attack,p.stats?.inf_lethality],
    ["cav",p.stats?.cav_attack,p.stats?.cav_lethality],["arc",p.stats?.arc_attack,p.stats?.arc_lethality]];
  return '<div class="bear-profile-details"><p class="small-note">'+esc(t("disclaimer"))+'</p>'+
    '<strong>'+esc(t("heroes"))+'</strong><div class="bear-heroes">'+heroes+'</div>'+
    '<div class="bear-profile-grid">'+values.map(([key,value])=>'<div><small>'+esc(t(key))+'</small><b>'+esc(value)+'</b></div>').join("")+'</div>'+
    '<strong>'+esc(t("troops"))+' · '+esc(t("attack"))+' / '+esc(t("lethality"))+'</strong>'+
    '<div class="bear-attack-grid">'+stats.map(([key,a,l])=>
      '<span>'+esc(t(key))+'</span><b>'+esc(pct(a))+'</b><b>'+esc(pct(l))+'</b>').join("")+'</div>'+
    '<p class="small-note">'+esc(t("comparison"))+': '+esc(p.comparison?t(p.comparison):"–")+
    ' · '+esc(t("latest"))+': '+esc(when(p.updated_at))+'</p></div>';
 }
 function counters(){
  const activeIds=new Set(active().map(p=>String(p.game_id)));
  const assigned=(cache?.assignments||[]).filter(x=>activeIds.has(String(x.game_id)));
  return (cache?.slots||[]).map(s=>{
   const rows=assigned.filter(x=>x.slot_key===s.slot_key);
   return '<article class="bear-count-card"><div class="bear-count-top"><strong>'+esc(slotLabel(s))+'</strong>'+
    '<span>'+rows.length+' '+esc(t("count"))+'</span></div><div class="bear-count-pills">'+
    '<span>'+esc(t("confirmed"))+': <b>'+rows.filter(x=>x.attendance==="confirmed").length+'</b></span>'+
    '<span>'+esc(t("tentative"))+': <b>'+rows.filter(x=>x.attendance==="tentative").length+'</b></span>'+
    '<span>'+esc(t("starter"))+': <b>'+rows.filter(x=>x.role==="starter").length+'</b></span>'+
    '<span>'+esc(t("joiner"))+': <b>'+rows.filter(x=>x.role==="joiner").length+'</b></span>'+
    '</div></article>';
  }).join("");
 }
 function row(p){
  const a=assignment(p.game_id)||{},prof=profile(p.game_id);
  const parent=p.main_game_id?(byId().get(String(p.main_game_id))?.name||p.main_game_id):null;
  return '<article class="bear-member-row" data-bear-row="'+esc(p.game_id)+'">'+
   '<div class="bear-member-head"><button type="button" class="bear-member-name" data-bear-open="'+esc(p.game_id)+'">'+esc(p.name||p.game_id)+'</button>'+
   '<small>'+esc(p.game_id)+(parent?' · '+esc(t("altInfo"))+' → '+esc(parent):'')+'</small>'+
   '<span class="bear-opt-flag '+(prof?'ready':'')+'">'+esc(t(prof?"withProfile":"withoutProfile"))+'</span></div>'+
   '<div class="bear-fields"><label><span>'+esc(t("time"))+'</span>'+
    select([["",t("empty")],...(cache.slots||[]).map(s=>[s.slot_key,slotLabel(s)])],a.slot_key||"",'data-bear-slot')+'</label>'+
    '<label><span>'+esc(t("role"))+'</span>'+
    select([["flex",t("flex")],["starter",t("starter")],["joiner",t("joiner")]],a.role||"flex",'data-bear-role')+'</label>'+
    '<label><span>'+esc(t("attendance"))+'</span>'+
    select([["tentative",t("tentative")],["confirmed",t("confirmed")]],a.attendance||"tentative",'data-bear-attendance')+'</label></div>'+
    '<div class="bear-note-row"><label><span>'+esc(t("note"))+'</span>'+
    '<input type="text" maxlength="500" class="control" data-bear-note placeholder="'+esc(t("notePlaceholder"))+'" value="'+esc(a.notes||"")+'"></label>'+
    '<button type="button" class="primary" data-bear-save="'+esc(p.game_id)+'">'+esc(t("save"))+'</button></div>'+
    (prof?'<details class="bear-details"><summary>'+esc(t("data"))+' · '+esc((prof.heroes||[]).map(h=>h.name).join(" / ")||"—")+'</summary>'+dataProfile(prof)+'</details>':"")+
    '</article>';
 }
 function eligible(){
  const all=active();
  return all.filter(p=>{
   const a=assignment(p.game_id);
   return (filter==="all"||filter==="unassigned"&&!a||filter==="optimizer"&&Boolean(profile(p.game_id))||
       filter===a?.slot_key)&&(!query||
     String(p.name||"").toLocaleLowerCase().includes(query.toLocaleLowerCase())||
     String(p.game_id||"").includes(query));
  });
 }
 function render(){
  if(!root||!enabled)return;
  const sub=document.getElementById("bearManagementSubtitle");if(sub)sub.textContent=t("intro");
  if(!cache){root.textContent=loading?t("loading"):t("error");return;}
  const slots=cache.slots||[];
  if(!slots.length){root.innerHTML='<div class="notice">'+esc(t("unavailable"))+'</div>';return;}
  if(filter!=="all"&&filter!=="unassigned"&&filter!=="optimizer"&&!slots.some(s=>s.slot_key===filter))filter="all";
  const all=eligible();
  root.innerHTML='<section class="bear-intro"><p>'+esc(t("source"))+'</p><p>'+esc(t("management"))+'</p></section>'+
   '<section class="bear-slot-summary"><div class="bear-section-heading"><h3>'+esc(t("summary"))+'</h3>'+
   '<button type="button" class="ghost" data-bear-refresh>'+esc(t("refresh"))+' ↻</button></div>'+
   '<div class="bear-count-grid">'+counters()+'</div></section>'+
   '<section class="card bear-roster-card"><div class="bear-section-heading"><h3>'+esc(t("assignment"))+'</h3>'+
   '<button type="button" class="ghost" data-bear-copy>'+esc(t("export"))+' ↗</button></div>'+
   '<p class="small-note">'+esc(t("noteSource"))+' '+esc(t("activeOnly"))+'</p>'+
   '<div class="bear-filter-row"><input class="control" type="search" data-bear-search value="'+esc(query)+'" placeholder="'+esc(t("search"))+'">'+
    '<select class="control" data-bear-filter>'+
     [["all",t("all")],["unassigned",t("empty")],["optimizer",t("withProfile")],
      ...slots.map(s=>[s.slot_key,slotLabel(s)])].map(([value,label])=>
       '<option value="'+esc(value)+'" '+(filter===value?'selected':'')+'>'+esc(label)+'</option>').join("")+'</select>'+
     '<span class="counter">'+all.length+' / '+active().length+'</span></div>'+
     '<div class="bear-member-list">'+(all.length?all.map(row).join(""):'<p class="perf-empty">'+esc(t("noPlayers"))+'</p>')+
     '</div></section>';
  pending.forEach(id=>{
   const btn=root.querySelector('[data-bear-save="'+id+'"]');if(btn){btn.disabled=true;btn.textContent=t("saving");}
  });
 }
 async function open(force=false){
  if(!root||!enabled)return;
  if(cache&&!force){render();return;}
  if(loading)return loading;
  const ticket=generation;
  if(!cache)root.textContent=t("loading");
  loading=request("bootstrap",{action:"bear_management"}).then(result=>{
   if(ticket!==generation)return;
   if(!result?.ok||!Array.isArray(result.slots)||!Array.isArray(result.assignments)||
      !Array.isArray(result.profiles))throw Error("invalid_bear_response");
   cache=result;render();
  }).catch(e=>{if(ticket!==generation)return;root.textContent=t("error")+" ("+String(e.message||e)+")";})
    .finally(()=>{if(ticket===generation)loading=null;});
  return loading;
 }
 async function save(id){
  if(pending.has(id))return;
  const item=root.querySelector('[data-bear-row="'+id+'"]');if(!item)return;
  const slotKey=item.querySelector("[data-bear-slot]")?.value||"";
  const role=item.querySelector("[data-bear-role]")?.value||"flex";
  const attendance=item.querySelector("[data-bear-attendance]")?.value||"tentative";
  const notes=item.querySelector("[data-bear-note]")?.value||"";
  if(slotKey&&!slot(slotKey)){flash(t("required"),true);return;}
  const ticket=generation;pending.add(id);
  const button=item.querySelector("[data-bear-save]");if(button){button.disabled=true;button.textContent=t("saving");}
  try{
   const result=await request("bootstrap",{action:"bear_assignment",game_id:id,slot_key:slotKey,role,attendance,notes});
   if(ticket!==generation)return;
   if(!result.ok)throw Error("save_failed");
   if(result.removed)cache.assignments=cache.assignments.filter(a=>String(a.game_id)!==id);
   else cache.assignments=[...cache.assignments.filter(a=>String(a.game_id)!==id),result.assignment];
   flash(t(result.removed?"removed":"saved"));render();
  }catch(e){if(ticket===generation)flash(t("error")+" ("+String(e.message||e)+")",true);}
  finally{pending.delete(id);if(ticket===generation){const b=root.querySelector('[data-bear-save="'+id+'"]');if(b){b.disabled=false;b.textContent=t("save");}}}
 }
 function exportText(){
  const ids=new Set(active().map(p=>String(p.game_id))),people=byId();
  return (cache?.slots||[]).map(s=>{
   const rows=(cache?.assignments||[]).filter(a=>a.slot_key===s.slot_key&&ids.has(String(a.game_id)))
    .sort((a,b)=>String(people.get(a.game_id)?.name||a.game_id).localeCompare(String(people.get(b.game_id)?.name||b.game_id),locale()));
   return slotLabel(s)+"\n"+(rows.length?rows.map(a=>{
    const p=people.get(String(a.game_id));
    return (p?.name||a.game_id)+" ("+(t(a.role)||a.role)+" · "+t(a.attendance)+")";
   }).join("\n"):"—");
  }).join("\n\n");
 }
 if(root){
  root.addEventListener("click",async e=>{
   const target=e.target;
   const refresh=target.closest("[data-bear-refresh]");
   if(refresh){open(true);return;}
   const copy=target.closest("[data-bear-copy]");
   if(copy){try{await navigator.clipboard.writeText(exportText());flash(t("copied"));}catch{flash(t("copyFailed"),true);}return;}
   const saveBtn=target.closest("[data-bear-save]");
   if(saveBtn){save(saveBtn.dataset.bearSave);return;}
   const dossier=target.closest("[data-bear-open]");
   if(dossier)openPlayer(dossier.dataset.bearOpen);
  });
  root.addEventListener("change",e=>{
   const el=e.target;
   if(el.matches("[data-bear-filter]")){filter=el.value;render();}
   // Row-level role/time fields deliberately do not auto-save.
  });
  root.addEventListener("input",e=>{
   const el=e.target;
   if(!el.matches("[data-bear-search]"))return;
   query=el.value;const pos=el.selectionStart;render();
   const next=root.querySelector("[data-bear-search]");
   next?.focus();if(Number.isInteger(pos))next?.setSelectionRange(pos,pos);
  });
 }
 function reset(){generation++;cache=null;loading=null;pending.clear();filter="all";query="";if(root){root.innerHTML="";root.textContent="";}}
 return {enabled,open,render,reset};
}
