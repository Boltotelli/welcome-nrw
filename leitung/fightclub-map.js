import {decodeDeployment} from './deployment-engine.js?v=20261021-plan-1';
import {createDeploymentPlanner} from './deployment-planner.js?v=20261021-plan-1';
/* FightClub battlefield planning: private, date-scoped map objectives for both legions.
 * Maps are planning aids; no Kingshot orders, registration or Discord posts are sent.
 * TriAlliance map illustration credited to its author; pin geometry remains usable
 * even if the external background image is unavailable.
 */
const SWORD=[
 ["bell",300,123,"Bell Tower","buff"],
 ["safe-zone",95,360,"Safe Zone","safe"],
 ["abbey-north",498,141,"Abbey · North","abbey"],
 ["mercenary",408,198,"Mercenary","buff"],
 ["sanctum-west",222,310,"Sanctum · West","sanctum"],
 ["shrine",403,347,"Swordshrine","shrine"],
 ["sanctum-east",572,415,"Sanctum · East","sanctum"],
 ["abbey-east",616,324,"Abbey · East","abbey"],
 ["abbey-west",199,433,"Abbey · West","abbey"],
 ["reformation",398,515,"Reformation","buff"],
 ["stables",505,608,"Stables","buff"],
 ["abbey-south",310,606,"Abbey · South","abbey"],
 ["under-nw",275,240,"Undercellars · NW","under"],
 ["under-ne",565,250,"Undercellars · NE","under"],
 ["under-sw",265,495,"Undercellars · SW","under"],
 ["under-se",520,491,"Undercellars · SE","under"]
].map(([key,x,y,name,group])=>({key,x:x/785*100,y:y/710*100,name,group}));
const TRI_COORDS={
 A:[[725,991],[613,915],[733,915],[826,913],[540,862],[670,864],[795,860],[916,862],[454,808],[612,801],[839,802],[993,813],[380,755],[516,755],[675,755],[786,762],[934,754],[1084,820],[215,764],[435,729],[595,722],[728,723],[870,721],[502,680],[657,680],[824,682],[933,688],[595,620],[732,619],[671,579],[798,579]],
 B:[[96,350],[216,272],[183,360],[139,422],[324,184],[244,322],[250,409],[227,464],[426,117],[300,275],[290,431],[306,509],[543,114],[427,193],[360,315],[362,366],[372,466],[225,588],[676,141],[609,175],[443,247],[418,340],[442,429],[565,184],[495,310],[504,401],[462,498],[664,210],[577,323],[636,328],[572,392]],
 C:[[1345,347],[1282,415],[1271,350],[1222,271],[1215,464],[1208,406],[1217,325],[1123,181],[1138,510],[1146,427],[1128,251],[1007,112],[1064,583],[1081,484],[1090,365],[1090,304],[1069,177],[907,117],[1170,670],[1006,493],[952,414],[950,349],[1008,268],[863,489],[863,396],[948,302],[902,177],[930,548],[866,327],[866,413],[791,328]]
};
const TRI=Object.entries(TRI_COORDS).flatMap(([side,coords])=>coords.map(([x,y],i)=>{
 const number=i+1;
 const suffix=number===1?" · HQ":number===24?" · Garrison":number===29?" · Transit access":"";
 return {key:side+number,x:x/1440*100,y:y/1050*100,name:side+number+suffix,group:side};
})).concat([{key:"temple",x:725/1440*100,y:477/1050*100,name:"Temple of Tides",group:"temple"}]);
const WORDS={
 de:{positionCopy:"Namen für Spiel-Label kopieren",teamCopy:"Teamtext kopieren",leader:"Teamleiter",leaderSave:"Leader speichern",teamTexts:"Ingame-Einsatztexte",copiedNames:"Spielernamen kopiert",heading:"Taktische Kartenplanung",hint:"Markiere einen Ort und teile ihm Spieler aus der ausgewählten Legion zu. Mehrere Spieler pro Ort sind möglich. Die Planung sendet keine Ingame-Befehle.",
   assign:"Spieler zuweisen",none:"Spieler auswählen",location:"Zielposition",legion:"Legion",assigned:"Eingeplant",free:"Noch ohne Ort",
   noLegion:"Ordne Spieler zuerst oben in der Legionplanung Legion 1 oder 2 zu.",save:"Zuteilen / umplanen",remove:"Entfernen",clipboard:"Kartenplan kopieren",copied:"Kartenplan kopiert",
   error:"Kartenplanung konnte nicht gespeichert werden",swordNote:"Die Undercellars sind dynamische Sammelziele – die vier Bereiche sind Planungspositionen und keine garantierten Spawns.",
   triNote:"A / B / C zeigen die drei möglichen Startseiten, keine automatische Zuweisung eurer Allianz. Die exakte Startseite muss im Match geprüft werden.",
   source:"Kartenvorlage: Daryl · Kingshot Guides",locationEmpty:"Für diesen Ort ist noch niemand geplant.",count:"Plätze mit Zuordnung",
   waiting:"Speichert …",confirmRemove:"Diese Zuweisung von der Karte entfernen?",noDate:"Bitte Datum wählen.",hintMobile:"Auf dem Handy die Karte seitlich verschieben oder die Zielliste nutzen."},
 en:{positionCopy:"Copy names for game label",teamCopy:"Copy team message",leader:"Team leader",leaderSave:"Save leader",teamTexts:"In-game deployment messages",copiedNames:"Player names copied",heading:"Battlefield assignment map",hint:"Select an objective and assign players from the chosen legion. Several players can share an objective. No in-game orders are sent.",
   assign:"Assign player",none:"Select player",location:"Objective",legion:"Legion",assigned:"Planned",free:"Without objective",
   noLegion:"Assign players to Legion 1 or 2 in the roster planner above first.",save:"Assign / move",remove:"Remove",clipboard:"Copy map plan",copied:"Map plan copied",
   error:"Could not save map assignment",swordNote:"Undercellars spawn dynamically; the four sectors are planning targets, not guaranteed locations.",
   triNote:"A / B / C represent possible starting sides, not your alliance's confirmed side. Verify the actual starting side in-game.",
   source:"Illustration: Daryl · Kingshot Guides",locationEmpty:"No players planned for this objective.",count:"Occupied objectives",
   waiting:"Saving …",confirmRemove:"Remove this assignment from the map?",noDate:"Please choose a date.",hintMobile:"On mobile, scroll the map horizontally or use the objective selector."},
 fr:{positionCopy:"Copier les noms pour le jeu",teamCopy:"Copier le message",leader:"Chef d’équipe",leaderSave:"Enregistrer",teamTexts:"Instructions en jeu",copiedNames:"Noms copiés",heading:"Planification sur carte",hint:"Sélectionner un objectif et attribuer des joueurs de la légion. Plusieurs joueurs peuvent partager un objectif. Aucun ordre envoyé au jeu.",
   assign:"Attribuer un joueur",none:"Choisir un joueur",location:"Objectif",legion:"Légion",assigned:"Planifiés",free:"Sans objectif",
   noLegion:"Attribuez d'abord les joueurs à la légion 1 ou 2 dans la liste.",save:"Attribuer / déplacer",remove:"Retirer",clipboard:"Copier le plan",copied:"Plan copié",
   error:"Enregistrement du plan impossible",swordNote:"Les Undercellars apparaissent dynamiquement ; les secteurs sont indicatifs.",
   triNote:"A / B / C sont des côtés de départ possibles, pas un côté confirmé. Vérifiez en jeu.",
   source:"Illustration : Daryl · Kingshot Guides",locationEmpty:"Aucun joueur prévu ici.",count:"Objectifs occupés",
   waiting:"Enregistrement…",confirmRemove:"Retirer ce joueur de la carte ?",noDate:"Choisissez une date.",hintMobile:"Sur mobile, faites défiler la carte ou utilisez la liste."},
 es:{positionCopy:"Copiar nombres para el juego",teamCopy:"Copiar mensaje",leader:"Líder de equipo",leaderSave:"Guardar",teamTexts:"Mensajes en el juego",copiedNames:"Nombres copiados",heading:"Planificación en el mapa",hint:"Selecciona un objetivo y asigna jugadores de la legión. Varios jugadores pueden compartir objetivo. No se envían órdenes al juego.",
   assign:"Asignar jugador",none:"Seleccionar jugador",location:"Objetivo",legion:"Legión",assigned:"Asignados",free:"Sin objetivo",
   noLegion:"Primero asigna jugadores a la Legión 1 o 2 en la planificación.",save:"Asignar / mover",remove:"Quitar",clipboard:"Copiar plan",copied:"Plan copiado",
   error:"No se pudo guardar la asignación",swordNote:"Las Undercellars aparecen dinámicamente; los sectores son solo para planificación.",
   triNote:"A / B / C indican posibles lados iniciales, no el lado confirmado. Compruébalo en el juego.",
   source:"Ilustración: Daryl · Kingshot Guides",locationEmpty:"No hay jugadores previstos aquí.",count:"Objetivos ocupados",
   waiting:"Guardando…",confirmRemove:"¿Quitar esta asignación del mapa?",noDate:"Elige una fecha.",hintMobile:"En el móvil, desplaza el mapa o usa la lista de objetivos."}
};
export function createFightClubMap({getContext,getLanguage,request,flash,esc,onUpdated}){
 let selected="shrine",legion=1,selectedPlayer="",busy=false,scope="",leaderChoice={1:"",2:""};
 const t=k=>(WORDS[getLanguage()]||WORDS.de)[k]||WORDS.de[k]||k;
 const sites=()=>(getContext()?.eventType==="triforce"?TRI:SWORD).concat([{key:"guerrilla",name:"GUERILLA",group:"guerrilla",virtual:true}],getContext()?.eventType==="triforce"?[{key:"safe-zone",name:"SECURE · Safe Zone",group:"safe",virtual:true}]:[]);
 const ctx=()=>getContext()||{};
 const roster=()=>ctx().assignments||[];
 const mapRows=()=>(ctx().mapAssignments||[]).filter(m=>m.event_type===ctx().eventType&&m.battle_date===ctx().date).map(m=>{const d=decodeDeployment(m.location_key,sites());return {...m,location_key:d.location,deployment_group:d.group};});
 const planner=createDeploymentPlanner({getContext:()=>({...ctx(),legion}),getSites:sites,getLanguage,request,esc,onUpdated});
 const leaders=()=>ctx().state?.leaders?.filter(l=>l.event_type===ctx().eventType&&l.battle_date===ctx().date)||[];
 const leaderFor=lg=>leaders().find(l=>Number(l.legion)===lg)?.game_id||"";
 const siteList=()=>sites().map(s=>s.key);
 const activeLegion=()=>roster().filter(x=>Number(x.legion)===legion&&x.availability!=="unavailable");
 const seenIds=()=>new Map((ctx().players||[]).map(p=>[String(p.game_id),p]));
 const playerName=id=>seenIds().get(String(id))?.name||String(id);
 const rowsForLocation=key=>mapRows().filter(m=>m.location_key===key&&activeLegion().some(a=>String(a.game_id)===String(m.game_id)));
 const sortedPlayers=()=>activeLegion().slice().sort((a,b)=>playerName(a.game_id).localeCompare(playerName(b.game_id)));
 const renderedAssigned=()=>mapRows().filter(m=>activeLegion().some(a=>String(a.game_id)===String(m.game_id)));
 function resetIfScope(){
  const key=ctx().eventType+"|"+ctx().date;
  if(scope!==key){scope=key;selected=ctx().eventType==="triforce"?"A24":"shrine";legion=1;selectedPlayer="";}
  if(!siteList().includes(selected))selected=siteList()[0];
 }
 const options=(values,choice)=>values.map(([v,label])=>'<option value="'+esc(v)+'" '+(String(v)===String(choice)?"selected":"")+'>'+esc(label)+'</option>').join("");
 function swordBackdrop(){
  // Exact image coordinate layout represented as a neutral original diagram.
  return '<svg class="fight-map-sketch" viewBox="0 0 785 710" preserveAspectRatio="none" aria-hidden="true">'+
   '<defs><radialGradient id="fight-ground"><stop stop-color="#b88d61"/><stop offset="1" stop-color="#604a3d"/></radialGradient></defs>'+
   '<rect width="785" height="710" fill="url(#fight-ground)"/>'+
   '<path d="M0 90L100 0h565L785 93V604L668 710H95L0 614Z" fill="none" stroke="#dac7a1" stroke-width="32" opacity=".8"/>'+
   '<path d="M93 364L405 352L716 363" fill="none" stroke="#56a6e9" stroke-width="5" stroke-dasharray="10 18" opacity=".8"/>'+
   '<path d="M405 95L405 640" stroke="#e17b6c" stroke-width="3" stroke-dasharray="14 16" opacity=".4"/>'+
   '<path d="M300 123L408 198 498 141 616 324 572 415 505 608 398 515 310 606 199 433 222 310Z" fill="none" stroke="#fff2cd" stroke-width="1.8" stroke-dasharray="4 12" opacity=".25"/>'+
   '<path d="M55 344l40 -42 42 42 -42 44Z" fill="none" stroke="#4db1f0" stroke-width="7"/>'+
   '<path d="M659 350l45 -44 44 44 -44 45Z" fill="none" stroke="#eb7752" stroke-width="7"/>'+
   '</svg>';
 }
 function pins(){
  return sites().filter(s=>!s.virtual).map(s=>{
   const n=rowsForLocation(s.key).length,selectedClass=s.key===selected?" selected":"";
   return '<button type="button" class="fight-map-pin fight-map-pin--'+esc(s.group)+selectedClass+(n?" occupied":"")+
    '" style="left:'+s.x.toFixed(3)+'%;top:'+s.y.toFixed(3)+'%" data-map-site="'+esc(s.key)+
    '" aria-pressed="'+(s.key===selected)+'" title="'+esc(s.name)+' · '+n+'">'+
    '<span class="fight-map-pin-label">'+esc(ctx().eventType==="triforce"?s.key:s.name)+'</span>'+
    (n?'<span class="fight-map-pin-count">'+n+'</span>':"")+'</button>';
  }).join("");
 }
 function siteDetail(){
  const key=selected,site=sites().find(s=>s.key===key),listed=rowsForLocation(key),everyone=sortedPlayers();
  const rosterSize=everyone.length,chosen=everyone.some(p=>String(p.game_id)===selectedPlayer)?selectedPlayer:"";
  return '<aside class="fight-map-detail"><div class="fight-map-detail-heading"><h4>'+esc(site?.name||key)+'</h4>'+
     '<span>'+listed.length+' '+esc(t("assigned"))+'</span></div>'+ 
     '<button class="ghost" type="button" data-map-copy-position>'+esc(t("positionCopy"))+' 📋</button>'+
     '<label class="fight-map-field">'+esc(t("location"))+'<select class="control" data-map-location>'+options(sites().map(s=>[s.key,s.name]),selected)+'</select></label>'+
     '<div class="fight-map-occupants">'+(listed.length?listed.map(m=>
       '<div class="fight-map-occupant"><span><strong>'+esc(playerName(m.game_id))+'</strong><small>'+esc(m.game_id)+'</small></span>'+
       '<button type="button" class="ghost" data-map-remove="'+esc(m.game_id)+'" '+(busy?"disabled":"")+'>'+esc(t("remove"))+'</button></div>'
      ).join(""):'<p class="small-note">'+esc(t("locationEmpty"))+'</p>')+'</div>'+
     (rosterSize?'<label class="fight-map-field">'+esc(t("assign"))+'<select class="control" data-map-player>'+
       '<option value="">'+esc(t("none"))+'</option>'+
       options(everyone.map(a=>[String(a.game_id),playerName(a.game_id)+' ('+a.game_id+')'+
         (mapRows().some(m=>String(m.game_id)===String(a.game_id))?' • ':'')]),chosen)+
       '</select></label>'+
       '<button class="primary fight-map-submit" type="button" data-map-save '+(busy?"disabled":"")+'>'
         +esc(busy?t("waiting"):t("save"))+'</button>':
       '<p class="small-note">'+esc(t("noLegion"))+'</p>')+
     '</aside>';
 }

 function teamMembers(team){
  const seen=new Set();
  // A legion is a battle roster; North/South are geographic deployment areas
  // within the selected legion. Reserve accounts never imply Safe Zone.
  const group=team===0?'secure':team===3?'guerrilla':team===2?'north':'south';
  const ids=new Set(renderedAssigned().filter(m=>m.deployment_group===group).map(m=>String(m.game_id)));
  return activeLegion().filter(a=>ids.has(String(a.game_id))).filter(a=>{
   const id=String(a.game_id);if(seen.has(id))return false;seen.add(id);return true;
  });
 }
 function teamMessage(team){
  if(team===3)return "GUERILLA\n"+(teamMembers(3).map(a=>"• "+playerName(a.game_id)).join("\n")||"—");
  if(team===0){
   const names=teamMembers(0).map(a=>"• "+playerName(a.game_id)).join("\n")||"—";
   return "SECURE · SAFE ZONE\n"+names+"\n\n"+
     "Stay in the Safe Zone as long as possible.\n"+
     "Before battle: reinforce Guerrilla players or Team Leaders.\n"+
     "Join rallies in your assigned area – use free troop speed-ups if necessary.\n"+
     "Prioritize nearby strongholds and resource gathering.";
  }
  const leader=teamMembers(team).some(a=>String(a.game_id)===String(leaderFor(legion)))?leaderFor(legion):"",members=teamMembers(team).filter(a=>String(a.game_id)!==String(leader))
    .map(a=>"• "+playerName(a.game_id)).join("\n")||"—";
  return (team===2?"NORD · NORTH":"SÜD · SOUTH")+"\n👑 Leader: "+
    (leader?playerName(leader):"—")+"\n\n"+members;
 }
 function legionLeaderEditor(){
  const people=sortedPlayers(),leader=leaderFor(legion);
  return '<div class="fight-map-leader-row"><label>'+esc(t("leader"))+' · '+esc(t("legion"))+' '+legion+
   '<select class="control" data-map-leader="'+legion+'">'+options([["","—"],...people.map(p=>[String(p.game_id),playerName(p.game_id)])],leaderChoice[legion]||leader)+'</select></label>'+
   '<button class="ghost" type="button" data-map-leader-save="'+legion+'" '+(busy?'disabled':'')+'>'+esc(t("leaderSave"))+'</button></div>';
 }
 function teamCard(team){
  const name=team===3?"GUERILLA":team===2?"NORD · NORTH":team===1?"SÜD · SOUTH":"SECURE · SAFE ZONE";
  const people=teamMembers(team);
  return '<article class="fight-map-team-card"><div class="fight-map-team-header"><strong>'+name+'</strong><small>'+people.length+' '+esc(t("assigned"))+'</small></div>'+
    '<pre>'+esc(teamMessage(team))+'</pre>'+
    '<button type="button" class="ghost" data-map-copy-team="'+team+'">'+esc(t("teamCopy"))+' 📋</button></article>';
 }
 async function copyText(value,label){
  try{await navigator.clipboard.writeText(value);flash(label);}
  catch{flash(t("error"),true);}
 }
 async function saveLeader(team){
  if(busy)return;
  const gameId=leaderChoice[team]??leaderFor(team);
  const {eventType,date}=ctx();busy=true;onUpdated();
  try{
   const result=await request("bootstrap",{action:"fightclub_leader_save",event_type:eventType,battle_date:date,legion:team,game_id:gameId||""});
   if(!result?.ok)throw Error("save_failed");
   const state=ctx().state;
   if(state){
    state.leaders=(state.leaders||[]).filter(x=>!(x.event_type===eventType&&x.battle_date===date&&Number(x.legion)===team));
    if(!result.removed)state.leaders.push(result.leader);
   }
   leaderChoice[team]="";flash(t("leaderSave"));
  }catch(e){flash(t("error")+" ("+String(e?.message||e)+")",true);}
  finally{busy=false;onUpdated();}
 }

 function render(){
  if(!ctx().date)return "";
  resetIfScope();
  const tri=ctx().eventType==="triforce";
  const used=new Set(renderedAssigned().map(a=>a.location_key)).size,
    nPlayers=renderedAssigned().length;
  return '<section class="card fight-map-card" aria-label="'+esc(t("heading"))+'">'+
   '<div class="fight-map-title"><div><h3>'+esc(t("heading"))+'</h3><p class="small-note">'+esc(t("hint"))+'</p></div>'+
   '<div class="fight-map-actions"><button type="button" class="primary" data-map-auto-plan>'+esc(planner.label())+'</button><button type="button" class="ghost" data-map-export>'+esc(t("clipboard"))+' ↗</button></div></div>'+
   '<div class="fight-map-topbar"><label>'+esc(t("legion"))+
      '<select class="control" data-map-legion>'+options([["1","1"],["2","2"]],String(legion))+'</select></label>'+
      '<span>'+nPlayers+' '+esc(t("assigned"))+' · '+used+' '+esc(t("count"))+'</span></div>'+
   '<p class="small-note">'+esc(tri?t("triNote"):t("swordNote"))+'</p>'+
   '<div class="fight-map-layout"><div class="fight-map-scroll" tabindex="0"><div class="fight-map-stage '+(tri?"fight-map-tri":"fight-map-sword")+'">'+
     (tri?'<img class="fight-map-photo" src="https://kingshotguides.com/wp-content/uploads/2025/10/tri-alliance-clash-map-by-daryl-scaled.webp" alt="" loading="lazy" referrerpolicy="no-referrer">':swordBackdrop())+
     pins()+'</div></div>'+siteDetail()+'</div>'+ 
   ('<div class="fight-map-team-section"><h4>'+esc(t("teamTexts"))+' · '+esc(t("legion"))+' '+legion+'</h4>'+legionLeaderEditor()+'<div class="fight-map-team-grid">'+[1,2,0,3].map(teamCard).join("")+'</div></div>')+
   '<p class="small-note">'+esc(t("hintMobile"))+(tri?' · <a href="https://kingshotguides.com/guide/tri-alliance-clash-map/" target="_blank" rel="noopener noreferrer">'+esc(t("source"))+'</a>':"")+'</p>'+
   '</section>';
 }
 function exportText(){
  if(!ctx().date)return "";
  const lines=[(ctx().eventType==="triforce"?"TriAlliance":"Swordland")+' · '+ctx().date];
  for(const lg of [1,2]){
   lines.push("Legion "+lg);
   const all=roster().filter(a=>Number(a.legion)===lg);
   for(const s of sites()){
    const list=mapRows().filter(m=>m.location_key===s.key&&all.some(a=>String(a.game_id)===String(m.game_id)));
    if(list.length)lines.push(s.name+": "+list.map(m=>playerName(m.game_id)+" ("+m.game_id+")").join(", "));
   }
   const without=all.filter(a=>!mapRows().some(m=>String(m.game_id)===String(a.game_id)));
   if(without.length)lines.push(t("free")+": "+without.map(a=>playerName(a.game_id)).join(", "));
   lines.push("");
  }
  return lines.join("\n").trim();
 }
 async function save(gameId,remove=false){
  const {eventType,date}=ctx();
  if(!date){flash(t("noDate"),true);return;}
  if(busy)return;
  if(!gameId){flash(t("none"),true);return;}
  const locationKey=selected;
  busy=true;onUpdated();
  try{
   const result=await request("bootstrap",{action:"fightclub_map_save",event_type:eventType,battle_date:date,
     game_id:String(gameId),location_key:locationKey,remove});
   if(!result?.ok)throw Error("save_failed");
   const data=ctx().state;if(data){
     if(!Array.isArray(data.map_assignments))data.map_assignments=[];
     data.map_assignments=data.map_assignments.filter(x=>!(x.event_type===eventType&&x.battle_date===date&&String(x.game_id)===String(gameId)));
     if(!result.removed)data.map_assignments.push(result.assignment);
   }
   selectedPlayer="";flash(remove?t("remove"):t("save"));
  }catch(e){flash(t("error")+" ("+String(e?.message||e)+")",true);}
  finally{busy=false;onUpdated();}
 }
 function change(e){
  const el=e.target;if(el.matches("[data-map-legion]")){legion=Number(el.value)===2?2:1;selectedPlayer="";onUpdated();return true;}
  if(el.matches("[data-map-location]")){selected=el.value;selectedPlayer="";onUpdated();return true;}
  if(el.matches("[data-map-leader]")){leaderChoice[Number(el.dataset.mapLeader)]=el.value;return true;}
  if(el.matches("[data-map-player]")){selectedPlayer=el.value;return true;}
  return false;
 }
 async function click(e){
  const el=e.target;
  const auto=el.closest("[data-map-auto-plan]");if(auto){planner.open(auto);return true;}
  const site=el.closest("[data-map-site]");
  if(site){selected=site.dataset.mapSite;selectedPlayer="";onUpdated();return true;}
  if(el.closest("[data-map-copy-position]")){await copyText(rowsForLocation(selected).map(x=>playerName(x.game_id)).join(", "),t("copiedNames"));return true;}
  const teamCopy=el.closest("[data-map-copy-team]");
  if(teamCopy){await copyText(teamMessage(Number(teamCopy.dataset.mapCopyTeam)),t("copied"));return true;}
  const leaderSave=el.closest("[data-map-leader-save]");
  if(leaderSave){await saveLeader(Number(leaderSave.dataset.mapLeaderSave));return true;}
  if(el.closest("[data-map-save]")){await save(selectedPlayer);return true;}
  const remove=el.closest("[data-map-remove]");
  if(remove){if(window.confirm(t("confirmRemove")))await save(remove.dataset.mapRemove,true);return true;}
  if(el.closest("[data-map-export]")){
   try{await navigator.clipboard.writeText(exportText());flash(t("copied"));}
   catch(e){flash(t("error"),true);}return true;
  }
  return false;
 }
 return {render,change,click,reset(){planner.reset();scope="";selected="shrine";selectedPlayer="";legion=1;busy=false;leaderChoice={1:"",2:""};}};
}
