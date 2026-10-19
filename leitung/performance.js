/* AllianceOS Phase 2 – GitHub Pages leadership performance preview.
 * Real dated API observations and historical rank imports; no estimated points.
 * Private data is fetched only via the authorized AllianceOS Edge Function. */
export function createPerformance({getState,getLanguage,request,esc,openPlayer}){
 const root=document.getElementById("performanceRoot");
 const enabled=location.hostname==="boltotelli.github.io"||["localhost","127.0.0.1"].includes(location.hostname);
 const dict={
 de:{title:"Performance",subtitle:"Kraftentwicklung, KvK Prep und Allianzmobilisierung – ausschließlich dokumentierte Werte.",
   power:"Kraftentwicklung",events:"Event-Rankings",powerType:"Ansicht",allPlayers:"Erfasste Allianz-Accounts",player:"Spieler",
   days:"Zeitraum",coverage:"Erfasste Accounts",powerTotal:"Summe erfasster Kraft",noTotal:"Keine vollständige Allianzkraft: nur tatsächlich erfasste Accounts.",
   source:"Quelle: MightPulse-Allianzabruf · Tagesdatum UTC",sync:"Letzter API-Snapshot",delta:"Veränderung vergleichbarer Spieler",
   comparable:"Vergleich nur für Accounts, die an beiden Endtagen gemessen wurden.",
   noComparison:"Noch keine zwei Tage mit denselben gemessenen Accounts.",
   kvk:"KvK Prep",am:"Allianzmobilisierung",event:"Durchlauf",recorded:"Erfasste Spieler",
   total:"Summe der erfassten Punkte",notComplete:"Nur importierte Rankings. Fehlende Spieler gelten NICHT als 0 Punkte.",
   provisional:"Nicht als abgeschlossen markiert",finalized:"Als abgeschlossen markiert",
   historical:"Punkte aus Ranking-Importen",top:"Top 8 erfasste Beiträge",rankObserved:"NRW-Platz*",serverRank:"Server-Platz",name:"Name",score:"Punkte",
   previous:"Δ zum vorherigen Durchlauf",unknown:"–",search:"Spieler suchen …",noRows:"Keine Ergebnisse für diese Auswahl.",
   sourceNote:"* NRW-Platz = Sortierung der erfassten NRW-Spieler, keine bestätigte vollständige Allianzplatzierung. Server-Platz stammt aus dem ursprünglichen Screenshot.",
   refreshed:"Aktualisieren",loading:"Echte Daten werden geladen …",failed:"Daten konnten nicht geladen werden.",
   missing:"Für diesen Zeitraum liegen noch keine echten Daten vor.",day:"Tag",points:"Messpunkte",
   observedLast:"Letzter Beobachtungstag",partial:"Die Abfrage wurde begrenzt; die historische Auswertung ist möglicherweise unvollständig.",
   noEvents:"Noch keine Rankings importiert.",noPlayer:"Spielerakte nicht verfügbar",recordedAt:"Erfasst",
   current:"Aktuelle Auswahl",onlySource:"Nur tatsächlich importierte Werte werden verglichen."},
 en:{title:"Performance",subtitle:"Power development, KvK Prep and Alliance Mobilization – recorded values only.",
   power:"Power development",events:"Event rankings",powerType:"View",allPlayers:"Observed alliance accounts",player:"Player",
   days:"Period",coverage:"Observed accounts",powerTotal:"Sum of observed power",noTotal:"Not the full alliance power: includes observed accounts only.",
   source:"Source: MightPulse alliance roster · UTC dates",sync:"Latest API snapshot",delta:"Change for comparable players",
   comparable:"Only accounts measured on both endpoint dates are compared.",
   noComparison:"No two days with overlapping observed accounts yet.",
   kvk:"KvK Prep",am:"Alliance Mobilization",event:"Cycle",recorded:"Observed players",
   total:"Sum of observed scores",notComplete:"Imported rankings only. Missing players are NOT scored as zero.",
   provisional:"Not marked final",finalized:"Marked final",
   historical:"Scores from ranking imports",top:"Top 8 observed contributions",rankObserved:"NRW position*",serverRank:"Server rank",name:"Name",score:"Score",
   previous:"Δ vs. previous cycle",unknown:"–",search:"Search players …",noRows:"No results for this selection.",
   sourceNote:"* NRW position is a sorting of observed NRW players, not a verified complete alliance ranking. Server rank comes from the original screenshot.",
   refreshed:"Refresh",loading:"Loading recorded data …",failed:"Could not load performance data.",
   missing:"No real observations in this period yet.",day:"Day",points:"Observations",
   observedLast:"Latest observation date",partial:"The query was capped; historical results might be incomplete.",
   noEvents:"No rankings imported yet.",noPlayer:"Player file unavailable",recordedAt:"Captured",
   current:"Current view",onlySource:"Only actual imported scores are compared."},
 fr:{title:"Performance",subtitle:"Évolution de puissance, préparation KvK et mobilisation – valeurs enregistrées uniquement.",
   power:"Évolution de puissance",events:"Classements d'événements",powerType:"Vue",allPlayers:"Comptes d'alliance observés",player:"Joueur",
   days:"Période",coverage:"Comptes observés",powerTotal:"Somme des puissances observées",noTotal:"Pas la puissance totale de l'alliance : uniquement les comptes observés.",
   source:"Source : effectif MightPulse · jours UTC",sync:"Dernier relevé API",delta:"Évolution des joueurs comparables",
   comparable:"Seuls les comptes relevés aux deux dates extrêmes sont comparés.",
   noComparison:"Pas encore deux dates avec des comptes observés en commun.",
   kvk:"Préparation KvK",am:"Mobilisation d'alliance",event:"Cycle",recorded:"Joueurs observés",
   total:"Somme des scores observés",notComplete:"Classements importés uniquement. Les absents ne valent PAS zéro.",
   provisional:"Non marqué final",finalized:"Marqué final",
   historical:"Scores des classements importés",top:"8 meilleures contributions relevées",rankObserved:"Position NRW*",serverRank:"Rang serveur",name:"Nom",score:"Score",
   previous:"Δ cycle précédent",unknown:"–",search:"Rechercher un joueur …",noRows:"Aucun résultat.",
   sourceNote:"* Position NRW : tri des joueurs observés, pas un classement complet confirmé. Rang serveur : capture d'origine.",
   refreshed:"Actualiser",loading:"Chargement des valeurs réelles …",failed:"Impossible de charger les données.",
   missing:"Aucun relevé réel sur cette période.",day:"Jour",points:"Relevés",
   observedLast:"Dernière date observée",partial:"Résultats limités, l'historique peut être incomplet.",
   noEvents:"Aucun classement importé.",noPlayer:"Fiche indisponible",recordedAt:"Relevé",
   current:"Vue actuelle",onlySource:"Seuls les scores importés réels sont comparés."},
 es:{title:"Rendimiento",subtitle:"Evolución de poder, preparación KvK y movilización – solo datos registrados.",
   power:"Evolución de poder",events:"Clasificaciones de eventos",powerType:"Vista",allPlayers:"Cuentas de alianza registradas",player:"Jugador",
   days:"Periodo",coverage:"Cuentas registradas",powerTotal:"Suma del poder registrado",noTotal:"No es el poder total de la alianza: solo cuentas registradas.",
   source:"Fuente: plantilla MightPulse · fechas UTC",sync:"Última lectura de API",delta:"Variación de jugadores comparables",
   comparable:"Solo se comparan cuentas medidas en ambas fechas.",
   noComparison:"Aún no hay dos fechas con cuentas medidas en común.",
   kvk:"Preparación KvK",am:"Movilización de alianza",event:"Ciclo",recorded:"Jugadores registrados",
   total:"Suma de puntos registrados",notComplete:"Solo clasificaciones importadas. Los ausentes NO cuentan como cero.",
   provisional:"No marcado como definitivo",finalized:"Marcado como definitivo",
   historical:"Puntos de clasificaciones importadas",top:"8 contribuciones registradas principales",rankObserved:"Posición NRW*",serverRank:"Rango servidor",name:"Nombre",score:"Puntos",
   previous:"Δ ciclo anterior",unknown:"–",search:"Buscar jugadores …",noRows:"Sin resultados.",
   sourceNote:"* Posición NRW: orden de jugadores registrados, no clasificación completa verificada. Rango servidor: captura original.",
   refreshed:"Actualizar",loading:"Cargando datos reales …",failed:"No se pudieron cargar los datos.",
   missing:"No hay datos reales para este periodo.",day:"Día",points:"Lecturas",
   observedLast:"Última fecha registrada",partial:"Consulta limitada; el historial puede estar incompleto.",
   noEvents:"Sin clasificaciones importadas.",noPlayer:"Ficha no disponible",recordedAt:"Registrado",
   current:"Vista actual",onlySource:"Solo se comparan puntos realmente importados."}
 };
 const t=k=>(dict[getLanguage()]||dict.de)[k]||dict.de[k]||k;
 const locale=()=>({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[getLanguage()]||"de-DE");
 const num=n=>Number(n).toLocaleString(locale());
 const compact=n=>new Intl.NumberFormat(locale(),{notation:"compact",maximumFractionDigits:2}).format(n);
 const safe=x=>Number.isSafeInteger(Number(x))&&Number(x)>=0;
 const fmtDate=d=>d?String(d).slice(0,10):"–";
 let cache=null,loading=null,error="",days=30,selectedPower="all",type="kvk_prep",eventId="",search="",generation=0;
 function powerRows(){
   if(!cache)return [];
   const utcCutoff=new Date(Date.now()-(days-1)*86400000).toISOString().slice(0,10);
   return (cache.power||[]).filter(p=>p.date>=utcCutoff&&safe(p.value)&&
     (selectedPower==="all"||p.game_id===selectedPower));
 }
 function dailyData(rows){
   const map=new Map();
   rows.forEach(p=>{
     if(!map.has(p.date))map.set(p.date,new Map());
     map.get(p.date).set(p.game_id,Number(p.value));
   });
   return [...map.entries()].sort(([a],[b])=>a.localeCompare(b))
     .map(([date,accounts])=>({date,count:accounts.size,value:[...accounts.values()].reduce((n,v)=>n+v,0),accounts}));
 }
 function comparable(daily){
   if(daily.length<2)return null;
   const a=daily[0],b=daily[daily.length-1];
   let before=0,after=0,count=0;
   a.accounts.forEach((value,id)=>{if(b.accounts.has(id)){before+=value;after+=b.accounts.get(id);count++;}});
   return count?{count,before,after,delta:after-before}:null;
 }
 function lineSvg(daily){
   if(!daily.length)return '<div class="perf-empty">'+esc(t("missing"))+'</div>';
   const w=660,h=230,left=20,right=18,top=26,bottom=28;
   const vals=daily.map(x=>x.value),min=Math.min(...vals),max=Math.max(...vals);
   const pad=max===min?Math.max(1,max*.08):Math.max(1,(max-min)*.15);
   const lo=Math.max(0,min-pad),hi=max+pad||1;
   const xy=(x,i)=>({x:left+(daily.length===1?(w-left-right)/2:i*(w-left-right)/(daily.length-1)),
     y:top+(hi-x.value)*(h-top-bottom)/(hi-lo)});
   const pts=daily.map(xy),line=pts.map(p=>p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ");
   const grid=[.25,.5,.75,1].map(r=>'<line x1="'+left+'" x2="'+(w-right)+'" y1="'+(top+(h-top-bottom)*r)+'" y2="'+(top+(h-top-bottom)*r)+'" class="perf-gridline"/>').join("");
   const dots=pts.map((p,i)=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(i===pts.length-1?5:3)+'" class="perf-dot"><title>'+esc(daily[i].date+' · '+num(daily[i].value)+' · '+daily[i].count+' '+t("coverage"))+'</title></circle>').join("");
   return '<svg class="perf-line" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(t("powerTotal"))+'" preserveAspectRatio="xMidYMid meet">'+
     grid+'<polyline points="'+line+'" class="perf-linepath"/>'+dots+
     '<text x="'+left+'" y="'+(h-5)+'" class="perf-label">'+esc(daily[0].date)+'</text>'+
     '<text x="'+(w-right)+'" y="'+(h-5)+'" text-anchor="end" class="perf-label">'+esc(daily[daily.length-1].date)+'</text>'+
     '<text x="'+left+'" y="16" class="perf-label">'+esc(compact(max))+'</text>'+
     '</svg>';
 }
 function powerUI(){
   const players=(getState()?.players||[]).filter(p=>p.game_id).slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),locale()));
   if(selectedPower!=="all"&&!players.some(p=>p.game_id===selectedPower))selectedPower="all";
   const data=dailyData(powerRows()),last=data[data.length-1],comparison=comparable(data);
   const delta=comparison?(comparison.delta>0?"+":"")+num(comparison.delta)+
     (comparison.before>0?" · "+((comparison.delta/comparison.before)*100).toFixed(2)+" %":""):"–";
   const latest=(cache.power||[]).slice().sort((a,b)=>String(b.observed_at||"").localeCompare(String(a.observed_at||"")))[0];
   const option=players.map(p=>'<option value="'+esc(p.game_id)+'" '+(selectedPower===p.game_id?'selected':'')+'>'+
      esc(p.name||p.game_id)+' · '+esc(p.game_id)+'</option>').join("");
   return '<section class="card perf-panel"><div class="perf-head"><div><h3>'+esc(t("power"))+'</h3>'+
     '<p class="muted">'+esc(t("source"))+'</p></div>'+
     '<button class="ghost" type="button" data-perf-refresh>'+esc(t("refreshed"))+' ↻</button></div>'+
     '<div class="perf-controls"><label class="field"><span>'+esc(t("player"))+'</span><select class="control" data-perf-player>'+
       '<option value="all">'+esc(t("allPlayers"))+'</option>'+option+'</select></label>'+
     '<label class="field"><span>'+esc(t("days"))+'</span><select class="control" data-perf-days>'+
       [7,30,90].map(n=>'<option value="'+n+'" '+(days===n?'selected':'')+'>'+n+' '+esc(t("day"))+'</option>').join("")+
       '</select></label></div>'+
     '<div class="perf-stats"><div class="perf-stat"><span>'+esc(t("powerTotal"))+'</span><strong>'+(last?esc(num(last.value)):'–')+'</strong>'+
       '<small>'+esc(t("coverage"))+': '+(last?last.count:0)+'</small></div>'+
     '<div class="perf-stat"><span>'+esc(t("delta"))+'</span><strong>'+esc(delta)+'</strong>'+
       '<small>'+(comparison?comparison.count+' '+esc(t("coverage")):esc(t("noComparison")))+'</small></div>'+
     '<div class="perf-stat"><span>'+esc(t("observedLast"))+'</span><strong>'+esc(last?.date||"–")+'</strong>'+
       '<small>'+esc(t("sync"))+': '+esc(fmtDate(latest?.observed_at))+'</small></div></div>'+
     lineSvg(data)+
     '<p class="small-note">'+esc(t("noTotal"))+' '+esc(t("comparable"))+
       (cache.partial?' '+esc(t("partial")):'')+'</p></section>';
 }
 function optionsForType(){
   return (cache?.events||[]).filter(e=>e.performance_type===type&&
     (cache.rankings||[]).some(r=>r.event_id===e.id));
 }
 function uniqueRows(id){
   return (cache?.rankings||[]).filter(x=>x.event_id===id&&safe(x.score))
     .slice().sort((a,b)=>Number(b.score)-Number(a.score)||String(a.game_id||a.player_name).localeCompare(String(b.game_id||b.player_name)));
 }
 function eventsUI(){
   let events=optionsForType();
   if(!events.some(e=>e.id===eventId))eventId=events[0]?.id||"";
   const current=events.find(e=>e.id===eventId),all=uniqueRows(eventId);
   const filtered=all.filter(x=>!search||String(x.player_name||"").toLocaleLowerCase().includes(search.toLocaleLowerCase())||String(x.game_id||"").includes(search));
   const total=all.reduce((sum,x)=>sum+Number(x.score),0),previousEvent=events.find(e=>e.period_start<current?.period_start);
   const prevMap=new Map((previousEvent?uniqueRows(previousEvent.id):[]).filter(x=>x.game_id).map(x=>[x.game_id,x]));
   const rankMap=new Map(all.map((p,i)=>[p.game_id||p.player_name,i+1]));
   const maxScore=Number(all[0]?.score)||1;
   const contributionChart=all.length?'<div class="perf-top-chart"><strong>'+esc(t("top"))+'</strong>'+
     all.slice(0,8).map((p,i)=>{
       const pct=Math.max(1,Math.min(100,Math.round(Number(p.score)*100/maxScore)));
       return '<div class="perf-top-row"><span class="perf-top-name">'+(i+1)+'. '+esc(p.player_name||p.game_id||"–")+'</span>'+
         '<div class="perf-top-track"><div class="perf-top-bar" style="width:'+pct+'%"></div></div>'+
         '<b>'+esc(compact(p.score))+'</b></div>';
     }).join("")+'</div>':"";
   const trs=filtered.map(x=>{
     const prev=prevMap.get(x.game_id),diff=prev?Number(x.score)-Number(prev.score):null;
     return '<tr><td><b>'+esc(rankMap.get(x.game_id||x.player_name))+'</b></td>'+
       '<td><div class="perf-player-cell"><button type="button" data-perf-open-player="'+esc(x.game_id||"")+'" '+(!x.game_id?'disabled':'')+'>'+
       esc(x.player_name||x.game_id||"–")+'</button><small>'+esc(x.game_id||"")+'</small></div></td>'+
       '<td class="perf-number">'+esc(num(x.score))+'</td>'+
       '<td class="perf-number">'+esc(x.server_rank||"–")+'</td>'+
       '<td class="perf-number">'+(diff===null?'–':esc((diff>0?'+':'')+num(diff)))+'</td></tr>';
   }).join("");
   return '<section class="card perf-panel"><div class="perf-head"><div><h3>'+esc(t("events"))+'</h3><p class="muted">'+esc(t("historical"))+'</p></div></div>'+
     '<div class="perf-controls"><label class="field"><span>'+esc(t("events"))+'</span><select class="control" data-perf-type>'+
       '<option value="kvk_prep" '+(type==="kvk_prep"?'selected':'')+'>'+esc(t("kvk"))+'</option>'+
       '<option value="alliance_mobilization" '+(type==="alliance_mobilization"?'selected':'')+'>'+esc(t("am"))+'</option></select></label>'+
       '<label class="field"><span>'+esc(t("event"))+'</span><select class="control" data-perf-event>'+
       events.map(e=>'<option value="'+esc(e.id)+'" '+(e.id===eventId?'selected':'')+'>'+
         esc(e.label||e.event_name||e.period_start)+'</option>').join("")+'</select></label></div>'+
     (current?
       '<div class="perf-stats"><div class="perf-stat"><span>'+esc(t("recorded"))+'</span><strong>'+num(all.length)+'</strong>'+
       '<small>'+esc(fmtDate(current.period_start))+'</small></div>'+
       '<div class="perf-stat"><span>'+esc(t("total"))+'</span><strong>'+esc(compact(total))+'</strong>'+
       '<small>'+esc(t("notComplete"))+'</small></div>'+
       '<div class="perf-stat"><span>'+esc(t("current"))+'</span><strong class="perf-status">'+esc(current.finalized?t("finalized"):t("provisional"))+'</strong>'+
       '<small>'+esc(t("source"))+'</small></div></div>'+
       contributionChart+
       '<div class="perf-filter"><input type="search" class="control" data-perf-search placeholder="'+esc(t("search"))+'" value="'+esc(search)+'">'+
       '<span class="counter">'+num(filtered.length)+' / '+num(all.length)+'</span></div>'+
       '<div class="table-scroll"><table class="perf-table"><thead><tr><th>'+esc(t("rankObserved"))+'</th><th>'+esc(t("name"))+'</th>'+
       '<th>'+esc(t("score"))+'</th><th>'+esc(t("serverRank"))+'</th><th>'+esc(t("previous"))+'</th></tr></thead>'+
       '<tbody>'+(filtered.length?trs:'<tr><td colspan="5" class="empty">'+esc(t("noRows"))+'</td></tr>')+'</tbody></table></div>'+
       '<p class="small-note">'+esc(t("sourceNote"))+' '+esc(t("notComplete"))+' '+esc(t("onlySource"))+'</p>'
       :'<p class="perf-empty">'+esc(t("noEvents"))+'</p>')+
     '</section>';
 }
 function draw(){
   if(!root||!enabled)return;
   const subtitle=document.getElementById("performanceSubtitle");
   if(subtitle)subtitle.textContent=t("subtitle");
   if(error){root.innerHTML='<div class="notice"><p>'+esc(t("failed"))+' ('+esc(error)+')</p>'+
     '<button class="ghost" type="button" data-perf-refresh>'+esc(t("refreshed"))+'</button></div>';return;}
   if(!cache){root.textContent=t("loading");return;}
   root.innerHTML=powerUI()+eventsUI();
 }
 async function open(force=false){
   if(!root||!enabled)return;
   if(cache&&!force){draw();return;}
   if(loading)return loading;
   error="";if(!cache)root.textContent=t("loading");
   const ticket=generation;
   loading=request("bootstrap",{action:"performance_dashboard"}).then(data=>{
     if(ticket!==generation)return;
     if(!data?.ok||!Array.isArray(data.power)||!Array.isArray(data.events)||!Array.isArray(data.rankings))
       throw new Error("invalid_performance_response");
     cache=data;error="";draw();
   }).catch(e=>{if(ticket!==generation)return;error=String(e?.message||e);draw();}).finally(()=>{if(ticket===generation)loading=null;});
   return loading;
 }
 if(root){
   root.addEventListener("change",event=>{
     const el=event.target;
     if(el.matches("[data-perf-days]"))days=Number(el.value)||30;
     else if(el.matches("[data-perf-player]"))selectedPower=el.value;
     else if(el.matches("[data-perf-type]")){type=el.value;eventId="";search="";}
     else if(el.matches("[data-perf-event]")){eventId=el.value;search="";}
     else return;
     draw();
   });
   root.addEventListener("input",event=>{
     if(!event.target.matches("[data-perf-search]"))return;
     search=event.target.value;
     // Keep focus and caret while replacing the results table.
     const pos=event.target.selectionStart;
     draw();
     const next=root.querySelector("[data-perf-search]");
     next?.focus();if(Number.isInteger(pos))next?.setSelectionRange(pos,pos);
   });
   root.addEventListener("click",event=>{
     if(event.target.closest("[data-perf-refresh]")){open(true);return;}
     const btn=event.target.closest("[data-perf-open-player]");
     if(btn?.dataset.perfOpenPlayer)openPlayer(btn.dataset.perfOpenPlayer);
   });
 }
 function reset(){generation++;cache=null;loading=null;error="";eventId="";search="";selectedPower="all";if(root)root.textContent="";}
 return {enabled,open,render:draw,reset};
}
