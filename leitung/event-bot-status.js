/* AllianceOS Event Bot operations panel: read-only preview + explicitly authorized controls.
 * Never starts production delivery automatically. */
export function createEventBotStatusPanel({supabase,can,flash,esc}){
 const root=document.createElement("section");
 root.className="card aos-event-bot-ops";
 root.id="eventBotOperations";
 root.innerHTML=`
 <style>
 .aos-event-bot-ops {margin:16px 0 24px;}
 .aos-bot-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:12px 0;}
 .aos-bot-toolbar button,.aos-bot-toolbar select{max-width:240px;}
 .aos-bot-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:16px 0;}
 .aos-bot-stats>div{background:var(--surface-2,rgba(127,127,127,.08));border-radius:10px;padding:12px;}
 .aos-bot-stats b{display:block;font-size:1.05rem;overflow-wrap:anywhere}
 .aos-bot-table{overflow-x:auto;overscroll-behavior:auto;max-height:none}
 .aos-bot-table table{border-collapse:collapse;width:100%;min-width:760px;font-size:12px}
 .aos-bot-table td,.aos-bot-table th{padding:7px 9px;border-bottom:1px solid rgba(128,128,128,.25);text-align:left;}
 .aos-bot-warning{padding:7px 10px;border-left:3px solid #f59e0b;background:rgba(245,158,11,.09);margin:6px 0;}
 .aos-bot-info{margin:8px 0 16px}
 .aos-bot-filter{display:flex;gap:10px;flex-wrap:wrap}
 .aos-bot-filter>*{width:auto;min-width:155px}
 </style>
 <div class="filters"><div><span class="eyebrow">ALLIANCEOS · EVENT DISPATCHER</span>
 <h3>Bot-Status</h3>
 <p class="muted">Verbindung, Versand und Scheduler · alle Zeiten UTC.</p></div>
 <button type="button" id="aosBotRefresh" class="ghost">↻ Aktualisieren</button></div>
 <p id="aosBotProgress" role="status" class="small-note">Status wird geladen…</p>
 <div id="aosBotSummary"></div>
 <details class="ux-disclosure aos-bot-more"><summary>Vorschau, Versandhistorie & Bot-Steuerung</summary><div class="ux-disclosure-body">
 <div class="aos-bot-toolbar">
 <label class="field"><span>Testkanal</span><select id="aosBotTestLang" class="control">
 <option value="de">🇩🇪 DE</option><option value="en">🇬🇧 EN</option><option value="fr">🇫🇷 FR</option><option value="es">🇪🇸 ES</option></select></label>
 <button type="button" id="aosBotTest" class="ghost">🧪 Testnachricht senden</button>
 <button type="button" id="aosBotAlliancePause" class="ghost" hidden>Allianz pausieren</button>
 <button type="button" id="aosBotGlobalPause" class="ghost" hidden>🛑 Globaler Not-Aus</button>
 </div>
 <div class="aos-bot-toolbar">
  <button type="button" class="ghost" id="aosBotAllianceMentions">🔕 Sprachrollen NRW: AUS</button>
  <button type="button" class="ghost" id="aosBotGlobalMentions" hidden>🔕 Sprachrollen global: AUS</button>
 </div>
 <details><summary>Sprachrollen-Erwähnungen pro Nachricht</summary>
  <div id="aosBotRoleRules" class="aos-bot-table"></div></details>
 <div id="aosBotWarnings"></div>
 <h4>📅 Nächste Nachrichten</h4><div id="aosBotPreview" class="aos-bot-table"></div>
 <h4>📜 Versandhistorie</h4>
 <div class="aos-bot-filter">
  <select class="control" id="aosBotStatusFilter"><option value="">Alle Status</option>
   <option value="planned">Geplant</option><option value="sent">Versendet</option>
   <option value="failed">Fehlgeschlagen</option><option value="skipped">Übersprungen</option>
   <option value="cancelled">Abgebrochen</option><option value="uncertain">Unklar – prüfen</option></select>
  <select class="control" id="aosBotLangFilter"><option value="">Alle Sprachen</option>
   <option value="de">DE</option><option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option></select>
  <input class="control" id="aosBotEventFilter" placeholder="Event filtern…">
 </div>
 <div id="aosBotHistory" class="aos-bot-table"></div>
 <p class="muted">Unklar = Discord könnte trotz technischer Unterbrechung versendet haben. Vor manuellem Eingriff im Kanal prüfen.</p></div></details>
 `;
 const target=document.querySelector('[data-page="discord"] .discord-bot-layout');
 const heading=document.querySelector('[data-page="discord"] .page-heading');
 if(heading)heading.after(root);else if(target)target.before(root);
 const $=id=>document.getElementById(id);
 const at=x=>x?new Date(x).toISOString().slice(0,16).replace("T"," ")+" UTC":"—";
 let state=null,working=false;
 const api="https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/alliance-event-bot-admin?alliance=NRW";
 async function call(payload){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error("authentication_required");
  const options={method:payload?"POST":"GET",cache:"no-store",
   headers:{Authorization:"Bearer "+session.access_token,
   "Content-Type":"application/json",
   apikey:"sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL"}};
  if(payload)options.body=JSON.stringify(payload);
  const res=await fetch(api,options);
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(data.error||"http_"+res.status);
  return data;
 }
 const bool=x=>x?"Ja":"Nein";
 const badges=j=>({planned:"Geplant",sending:"In Bearbeitung",sent:"Versendet",
   failed:"Fehlgeschlagen",skipped:"Übersprungen",cancelled:"Abgebrochen",uncertain:"Unklar"}[j]||j);
 function table(rows){
  if(!rows.length)return '<p class="muted">Keine Nachrichten gefunden.</p>';
  return '<table><thead><tr><th>Versand (UTC)</th><th>Event / Durchlauf</th><th>Tag</th><th>Sprache</th><th>Status</th><th>Discord / Fehler</th></tr></thead><tbody>'+
   rows.map(r=>'<tr><td>'+esc(at(r.scheduled_at))+'</td><td>'+esc(r.event_key)+' · '+esc(r.occurrence_date)+'</td>'+
   '<td>'+esc(r.event_day)+'</td><td>'+esc((r.language||"").toUpperCase())+'</td><td>'+esc(badges(r.status))+
   ' · '+esc(r.attempts||0)+'×</td><td title="'+esc(r.error_detail||"")+'">'+esc(r.discord_message_id||r.error_code||"—")+'</td></tr>').join('')+
   '</tbody></table>';
 }
 function render(){
  if(!state)return;
  const {global:g,local:l,heartbeat:h,connected,botProblem,counts,history,preview,warnings}=state;
  $("aosBotProgress").textContent=connected?"🟢 Discord-Bot verbunden":"⚪ Discord: "+botProblem;
  const stats=[
   ["Bot-Verbindung",connected?"🟢 Verbunden":"🔴 Nicht verbunden"],
   ["Freigabe",g.production_approved?"Erteilt":"⛔ Ausstehend"],
   ["Globaler Versand",g.sending_enabled?"Aktiv":"⏸ Pausiert"],
   ["Allianz NRW",l.sending_enabled?"Aktiv":"⏸ Pausiert"],
   ["Scheduler",h?.last_success&&Date.now()-Date.parse(h.last_success)<180000?"🟢 Aktiv":"⚠ Keine aktuelle Prüfung"],
   ["Letzte Prüfung",at(h?.last_check)],
   ["Nächster Versand",at(preview.filter(x=>x.status==="planned"&&Date.parse(x.scheduled_at)>=Date.now()).sort((a,b)=>a.scheduled_at.localeCompare(b.scheduled_at))[0]?.scheduled_at)],
   ["Geplant / Fehlgeschlagen",(counts.planned||0)+" / "+(counts.failed||0)]
  ];
  $("aosBotSummary").innerHTML='<div class="aos-bot-stats">'+stats.map(([label,value])=>
   '<div><small>'+esc(label)+'</small><b>'+esc(value)+'</b></div>').join('')+'</div>'+
   '<p class="aos-bot-info small-note">Letzter Scheduler-Fehler: '+esc(h?.last_error||"keiner")+
   ' · Rollen-Erwähnungen global: '+(g.role_mentions_enabled?"AN":"AUS")+
   ', Allianz: '+(l.role_mentions_enabled?"AN":"AUS")+'</p>';
  $("aosBotWarnings").innerHTML=warnings.length?'<h4>⚠ Nicht planbare Nachrichten</h4>'+
   warnings.slice(0,80).map(x=>'<p class="aos-bot-warning">'+esc(x.event_key)+" · Tag "+esc(x.event_day)+
   ": "+esc(x.reason)+'</p>').join(''):'';
  $("aosBotPreview").innerHTML=table(preview.filter(x=>x.status==="planned").slice(0,70));
  const status=$("aosBotStatusFilter").value,lang=$("aosBotLangFilter").value,ev=$("aosBotEventFilter").value.trim().toLowerCase();
  $("aosBotHistory").innerHTML=table(history.filter(x=>(!status||x.status===status)&&(!lang||x.language===lang)&&
   (!ev||x.event_key.toLowerCase().includes(ev))).slice(0,150));
  const enabled=can("event_bot");
  $("aosBotTest").disabled=!enabled||!connected;
  $("aosBotAlliancePause").hidden=!enabled||!l.sending_enabled;
  $("aosBotGlobalPause").hidden=!state.isOwner||!g.sending_enabled;
  $("aosBotAllianceMentions").disabled=!enabled;
  $("aosBotAllianceMentions").textContent=(l.role_mentions_enabled?"🔔":"🔕")+" Sprachrollen NRW: "+(l.role_mentions_enabled?"AN":"AUS");
  $("aosBotGlobalMentions").hidden=!state.isOwner||!g.production_approved;
  $("aosBotGlobalMentions").textContent=(g.role_mentions_enabled?"🔔":"🔕")+" Sprachrollen global: "+(g.role_mentions_enabled?"AN":"AUS");
  const roleRules=state.roleRules||[];
  $("aosBotRoleRules").innerHTML=roleRules.length?'<table><thead><tr><th>Event</th><th>Nachricht</th><th>Erwähnung</th></tr></thead><tbody>'+
   roleRules.map(r=>'<tr><td>'+esc(r.event_key)+' · Tag '+esc(r.event_day)+'</td><td>'+esc(r.title)+'</td><td>'+
   '<button type="button" class="ghost" data-bot-mention="'+esc(r.id)+'" '+(!state.canEvents?'disabled':'')+'>'+
   (r.mention_role?'🔔 AN':'🔕 AUS')+'</button></td></tr>').join('')+'</tbody></table>':
   '<p class="muted">Keine aktiven Nachrichtenregeln vorhanden.</p>';
 }
 async function refresh(){
  if(working)return;
  working=true;
  $("aosBotProgress").textContent="Bot-Status wird geprüft…";
  try{state=await call();render()}
  catch(e){$("aosBotProgress").textContent="Status nicht verfügbar: "+String(e.message||e);}
  finally{working=false}
 }
 async function mutate(payload,confirmMessage){
  if(confirmMessage&&!confirm(confirmMessage))return;
  if(working)return;
  working=true;
  try{
   const r=await call(payload);
   flash(payload.action==="test"?"Test erfolgreich · Message ID: "+r.message_id:"Einstellung gespeichert.");
  }catch(e){flash(String(e.message||e),true)}
  finally{working=false;await refresh()}
 }
 $("aosBotRefresh").addEventListener("click",refresh);
 for(const id of ["aosBotStatusFilter","aosBotLangFilter","aosBotEventFilter"])
  $(id).addEventListener("input",render);
 $("aosBotTest").addEventListener("click",()=>mutate({action:"test",language:$("aosBotTestLang").value},
   "Eine klar gekennzeichnete Testnachricht jetzt im ausgewählten Discord-Kanal veröffentlichen?"));
 $("aosBotAlliancePause").addEventListener("click",()=>mutate({action:"set_alliance",enabled:false},
   "Den automatischen Versand für NRW sofort pausieren?"));
 $("aosBotGlobalPause").addEventListener("click",()=>mutate({action:"pause_global"},
   "GLOBALER NOT-AUS: Event-Bot für ALLE Allianzen pausieren?"));
 $("aosBotAllianceMentions").addEventListener("click",()=>mutate({action:"set_alliance_mentions",
    enabled:!state?.local?.role_mentions_enabled},
   "Sprachrollen-Erwähnungen für NRW "+(state?.local?.role_mentions_enabled?"deaktivieren":"vorbereiten")+"? Die Einstellung gilt nur für NRW."));
 $("aosBotGlobalMentions").addEventListener("click",()=>mutate({action:"set_global_mentions",
   enabled:!state?.global?.role_mentions_enabled},
   "Globale Rollen-Erwähnungen "+(state?.global?.role_mentions_enabled?"deaktivieren":"aktivieren")+"?"));
 root.addEventListener("click",e=>{
   const btn=e.target.closest?.("[data-bot-mention]");
   if(!btn||!state?.canEvents)return;
   const rule=(state.roleRules||[]).find(x=>x.id===btn.dataset.botMention);
   if(rule)mutate({action:"set_rule_mention",rule_id:rule.id,enabled:!rule.mention_role});
 });
 return {refresh,reset(){state=null;$("aosBotProgress").textContent="Status nicht geladen.";}};
}
