
(()=>{'use strict';
if(window.NAP_V2_TEST_BOOTSTRAP)return;
window.NAP_V2_TEST_BOOTSTRAP=true;

const V2TXT={
 de:{
  test:'TEST 2.0',homeTitle:'Deine NAP-Lage auf einen Blick.',homeSub:'Eigene Maßnahmen, NAP-weite 24h-Hinweise, relevante Allianzwechsel und aktuelle Verstöße.',
  myActions:'Mein Handlungsbedarf',ownOnly:'Nur Maßnahmen deiner eingeloggten Allianz',noActions:'Aktuell kein eigener Handlungsbedarf.',
  napAlerts:'NAP-Benachrichtigungen',napAlertsSub:'Nur Maßnahmen anderer Allianzen, die länger als 24h offen sind.',noNapAlerts:'Keine überfällige Maßnahme einer anderen NAP-Allianz.',
  activeNap:'Aktive NAP OUTs',activeNapSub:'NAP-weit veröffentlichte Ausschlüsse',noNap:'Keine aktive NAP Exclusion.',
  transfers:'Allianzwechsel',transfersSub:'Nur Wechsel, bei denen deine Allianz Quelle oder Ziel ist.',noTransfers:'Keine relevanten Allianzwechsel.',
  recent:'Letzte eigene Verfehlungen',recentSub:'Private Details bleiben nur in deiner Allianz.',open:'Öffnen',contact:'Als kontaktiert markieren',
  r1:'R1 als umgesetzt markieren',nap24:'24h NAP OUT aktivieren',level:'Stufe',created:'Erstellt',deadline:'24h-Frist',overdue:'überfällig',
  remaining:'verbleibend',confirmNap:'24h NAP OUT jetzt aktivieren? Dadurch startet der 24h-Timer.',r1TimerHint:'R1 wurde als umgesetzt markiert. Eine individuelle Endzeit kann weiterhin in der Spielerakte gesetzt werden.',
  notifications:'Benachrichtigungen',theme:'Theme',more:'Mehr',kvk:'KvK',performance:'Performance',crown:'Crown',activity:'Aktivität',settings:'Einstellungen',laws:'Laws',
  napWide:'NAP-weit',myAlliance:'Meine Allianz',system:'System',incoming:'Eingang',outgoing:'Ausgang',temporary:'Temporär',
  openActions:'Offene Maßnahmen',overdueActions:'NAP überfällig',activeExclusions:'Aktive NAP OUT',newViolations:'Neue Verstöße',
  from:'von',since:'seit',player:'Spieler',points:'Punkte',alliance:'Allianz',action:'Maßnahme',
  loading:'Lade Daten …',loadFailed:'Daten konnten nicht geladen werden.',top200:'KvK Top 200',mobilization:'Alliance Mobilization',
  score:'Score',recorded:'Erfasst',avg:'Ø Score',back:'Zurück',fullRanking:'Ranking',source:'Quelle',
  privacy:'Andere Allianzen sehen ausschließlich die für NAP-Transparenz nötigen Informationen – keine privaten Verstoßdetails.'
 },
 en:{
  test:'TEST 2.0',homeTitle:'Your NAP situation at a glance.',homeSub:'Your actions, NAP-wide 24h notices, relevant alliance transfers and recent violations.',
  myActions:'My action required',ownOnly:'Only actions from your signed-in alliance',noActions:'No action required for your alliance right now.',
  napAlerts:'NAP notifications',napAlertsSub:'Only actions from other alliances that have been open for more than 24h.',noNapAlerts:'No overdue action from another NAP alliance.',
  activeNap:'Active NAP OUTs',activeNapSub:'NAP-wide published exclusions',noNap:'No active NAP exclusion.',
  transfers:'Alliance transfers',transfersSub:'Only transfers where your alliance is source or destination.',noTransfers:'No relevant alliance transfers.',
  recent:'Recent own violations',recentSub:'Private details remain within your alliance.',open:'Open',contact:'Mark as contacted',
  r1:'Mark R1 as implemented',nap24:'Activate 24h NAP OUT',level:'Level',created:'Created',deadline:'24h deadline',overdue:'overdue',
  remaining:'remaining',confirmNap:'Activate the 24h NAP OUT now? This starts the 24h timer.',r1TimerHint:'R1 was marked as implemented. An individual end time can still be set in the player file.',
  notifications:'Notifications',theme:'Theme',more:'More',kvk:'KvK',performance:'Performance',crown:'Crown',activity:'Activity',settings:'Settings',laws:'Laws',
  napWide:'NAP-wide',myAlliance:'My alliance',system:'System',incoming:'Incoming',outgoing:'Outgoing',temporary:'Temporary',
  openActions:'Open actions',overdueActions:'NAP overdue',activeExclusions:'Active NAP OUT',newViolations:'New violations',
  from:'from',since:'since',player:'Player',points:'Points',alliance:'Alliance',action:'Action',
  loading:'Loading data …',loadFailed:'Data could not be loaded.',top200:'KvK Top 200',mobilization:'Alliance Mobilization',
  score:'Score',recorded:'Recorded',avg:'Avg score',back:'Back',fullRanking:'Ranking',source:'Source',
  privacy:'Other alliances only see the information required for NAP transparency – no private violation details.'
 },
 fr:{
  test:'TEST 2.0',homeTitle:'Votre situation NAP en un coup d’œil.',homeSub:'Vos mesures, alertes NAP 24 h, transferts pertinents et infractions récentes.',
  myActions:'Mes actions requises',ownOnly:'Uniquement les mesures de votre alliance connectée',noActions:'Aucune action requise pour votre alliance.',
  napAlerts:'Notifications NAP',napAlertsSub:'Uniquement les mesures des autres alliances ouvertes depuis plus de 24 h.',noNapAlerts:'Aucune mesure en retard d’une autre alliance NAP.',
  activeNap:'NAP OUT actifs',activeNapSub:'Exclusions publiées dans tout le NAP',noNap:'Aucune exclusion NAP active.',
  transfers:'Changements d’alliance',transfersSub:'Uniquement lorsque votre alliance est source ou destination.',noTransfers:'Aucun transfert pertinent.',
  recent:'Infractions récentes de votre alliance',recentSub:'Les détails privés restent dans votre alliance.',open:'Ouvrir',contact:'Marquer comme contacté',
  r1:'Marquer R1 comme appliqué',nap24:'Activer le NAP OUT 24 h',level:'Niveau',created:'Créé',deadline:'Délai 24 h',overdue:'en retard',
  remaining:'restant',confirmNap:'Activer maintenant le NAP OUT 24 h ? Cela démarre le minuteur de 24 h.',r1TimerHint:'R1 a été marqué comme appliqué. Une heure de fin individuelle peut encore être définie dans le dossier joueur.',
  notifications:'Notifications',theme:'Thème',more:'Plus',kvk:'KvK',performance:'Performance',crown:'Crown',activity:'Activité',settings:'Paramètres',laws:'Laws',
  napWide:'NAP entier',myAlliance:'Mon alliance',system:'Système',incoming:'Entrée',outgoing:'Sortie',temporary:'Temporaire',
  openActions:'Mesures ouvertes',overdueActions:'NAP en retard',activeExclusions:'NAP OUT actifs',newViolations:'Nouvelles infractions',
  from:'depuis',since:'depuis',player:'Joueur',points:'Points',alliance:'Alliance',action:'Mesure',
  loading:'Chargement …',loadFailed:'Impossible de charger les données.',top200:'KvK Top 200',mobilization:'Alliance Mobilization',
  score:'Score',recorded:'Enregistrés',avg:'Score moyen',back:'Retour',fullRanking:'Classement',source:'Source',
  privacy:'Les autres alliances ne voient que les informations nécessaires à la transparence NAP – aucun détail privé.'
 },
 es:{
  test:'TEST 2.0',homeTitle:'Tu situación NAP de un vistazo.',homeSub:'Tus medidas, avisos NAP de 24 h, cambios relevantes e infracciones recientes.',
  myActions:'Mis acciones pendientes',ownOnly:'Solo medidas de tu alianza conectada',noActions:'No hay acciones pendientes para tu alianza.',
  napAlerts:'Notificaciones NAP',napAlertsSub:'Solo medidas de otras alianzas abiertas durante más de 24 h.',noNapAlerts:'No hay medidas vencidas de otra alianza NAP.',
  activeNap:'NAP OUT activos',activeNapSub:'Exclusiones publicadas en todo el NAP',noNap:'No hay exclusiones NAP activas.',
  transfers:'Cambios de alianza',transfersSub:'Solo cuando tu alianza es origen o destino.',noTransfers:'No hay cambios relevantes.',
  recent:'Infracciones recientes propias',recentSub:'Los detalles privados permanecen en tu alianza.',open:'Abrir',contact:'Marcar como contactado',
  r1:'Marcar R1 como aplicado',nap24:'Activar NAP OUT 24 h',level:'Nivel',created:'Creado',deadline:'Plazo 24 h',overdue:'vencido',
  remaining:'restante',confirmNap:'¿Activar ahora el NAP OUT de 24 h? Esto inicia el temporizador de 24 h.',r1TimerHint:'R1 se marcó como aplicado. Aún se puede establecer una hora final individual en el expediente.',
  notifications:'Notificaciones',theme:'Tema',more:'Más',kvk:'KvK',performance:'Performance',crown:'Crown',activity:'Actividad',settings:'Ajustes',laws:'Laws',
  napWide:'NAP completo',myAlliance:'Mi alianza',system:'Sistema',incoming:'Entrada',outgoing:'Salida',temporary:'Temporal',
  openActions:'Medidas abiertas',overdueActions:'NAP vencido',activeExclusions:'NAP OUT activos',newViolations:'Nuevas infracciones',
  from:'desde',since:'desde',player:'Jugador',points:'Puntos',alliance:'Alianza',action:'Medida',
  loading:'Cargando datos …',loadFailed:'No se pudieron cargar los datos.',top200:'KvK Top 200',mobilization:'Alliance Mobilization',
  score:'Score',recorded:'Registrados',avg:'Score medio',back:'Volver',fullRanking:'Ranking',source:'Fuente',
  privacy:'Las demás alianzas solo ven la información necesaria para la transparencia NAP, sin detalles privados.'
 }
};
const v2lang=()=>String(state?.lang||'de').slice(0,2);
const v2t=k=>(V2TXT[v2lang()]||V2TXT.de)[k]||k;
const v2esc=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const v2fmt=n=>Number(n||0).toLocaleString(({de:'de-DE',en:'en-US',fr:'fr-FR',es:'es-ES'})[v2lang()]||'de-DE',{maximumFractionDigits:0});
const v2date=x=>{try{return new Date(x).toLocaleString(({de:'de-DE',en:'en-US',fr:'fr-FR',es:'es-ES'})[v2lang()]||'de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch{return '–'}};
const v2duration=sec=>{
  sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);
  return h+'h '+String(m).padStart(2,'0')+'m';
};
const v2Deadline=s=>{
  const created=new Date(s?.created_at||0).getTime();if(!created)return {text:'–',over:false,seconds:0};
  const diff=created+86400000-Date.now();return diff<0?{text:v2duration(-diff/1000)+' '+v2t('overdue'),over:true,seconds:-diff/1000}:{text:v2duration(diff/1000)+' '+v2t('remaining'),over:false,seconds:diff/1000};
};

state.v2Overdue=state.v2Overdue||[];
state.v2OverdueLoadedAt=state.v2OverdueLoadedAt||0;
let v2OverdueLoading=false;
async function v2LoadOverdue(force=false){
  if(!sbClient||!state?.alliance||v2OverdueLoading)return;
  if(!force&&Date.now()-Number(state.v2OverdueLoadedAt||0)<30000)return;
  v2OverdueLoading=true;
  try{
    const {data,error}=await sbClient.rpc('get_nap_overdue_action_notifications');
    if(error)throw error;
    state.v2Overdue=Array.isArray(data)?data:[];
    state.v2OverdueLoadedAt=Date.now();
    if(state.view==='dashboard')renderDashboardV2(false);
    v2RenderNotifications();
  }catch(e){console.warn('2.0 overdue notifications',e)}
  finally{v2OverdueLoading=false}
}

function v2OwnActionRows(){
  const vs=(ownViolations?.()||[]).filter(v=>activeViolation(v));
  const names=[...new Set(vs.map(v=>v.player_name).filter(Boolean))];
  const sanctions=ownSanctions?.()||[];
  return names.map(name=>{
    const pvs=vs.filter(v=>v.player_name===name);
    const level=Math.min(pvs.length,4);
    const s=sanctions.filter(x=>x.player_name===name&&Number(x.level)===level).sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0))[0]||null;
    let pending=false,targetViolation=null;
    if(level===1){targetViolation=pvs.filter(v=>!v.contacted).sort((a,b)=>new Date(b.occurred_at)-new Date(a.occurred_at))[0]||null;pending=!!targetViolation}
    else if(level===2||level===3)pending=!!s&&!s.completed;
    else if(level===4)pending=!!s&&!s.started_at;
    return pending?{name,level,s,violation:targetViolation||pvs[0],count:pvs.length}:null;
  }).filter(Boolean).sort((a,b)=>{
    const ad=v2Deadline(a.s||a.violation),bd=v2Deadline(b.s||b.violation);
    return (ad.over===bd.over)?ad.seconds-bd.seconds:(ad.over?-1:1);
  });
}

function v2RelevantTransfers(){
  const rows=Array.isArray(state.transferActivity)?state.transferActivity:[];
  return rows.filter(x=>{
    const from=x.from_alliance||x.from||null,to=x.to_alliance||x.to||null;
    return from===state.alliance||to===state.alliance;
  }).slice(0,6);
}

function v2ActionButton(row){
  if(row.level===1&&row.violation)return '<button class="v2-btn primary v2-quick" data-v2-action="contact" data-id="'+v2esc(row.violation.id)+'">'+v2esc(v2t('contact'))+'</button>';
  if(row.level===2&&row.s)return '<button class="v2-btn primary v2-quick" data-v2-action="r1" data-id="'+v2esc(row.s.id)+'">'+v2esc(v2t('r1'))+'</button>';
  if(row.level===3&&row.s)return '<button class="v2-btn primary v2-quick" data-v2-action="nap24" data-id="'+v2esc(row.s.id)+'">'+v2esc(v2t('nap24'))+'</button>';
  return '';
}
function v2LevelLabel(level){
  if(level===1)return v2t('contact');
  if(level===2)return 'R1';
  if(level===3)return '24h NAP OUT';
  return 'Extended NAP OUT';
}
function v2ActionHtml(row){
  const basis=row.s||row.violation,dl=v2Deadline(basis),date=basis?.created_at||row.violation?.occurred_at;
  return '<article class="v2-action">'+
    '<div><div class="v2-player">'+v2esc(row.name)+'</div><div class="v2-meta">'+v2esc(v2t('created'))+' '+v2esc(v2date(date))+' · '+v2esc(v2t('level'))+' '+row.level+'</div></div>'+
    '<div class="v2-action-right"><span class="v2-pill '+(row.level>=3?'red':row.level===2?'gold':'blue')+'">'+v2esc(v2LevelLabel(row.level))+'</span>'+
    '<span class="v2-deadline">'+v2esc(v2t('deadline'))+': '+v2esc(dl.text)+'</span>'+
    '<div class="v2-actions">'+v2ActionButton(row)+'<button class="v2-btn v2-open-player" data-player="'+v2esc(row.name)+'">'+v2esc(v2t('open'))+'</button></div></div></article>';
}

function renderDashboardV2(fetchRemote=true){
  if(!state?.alliance)return;
  const active=(ownViolations?.()||[]).filter(v=>activeViolation(v));
  const ownActions=v2OwnActionRows();
  const napOverdue=Array.isArray(state.v2Overdue)?state.v2Overdue:[];
  const publicEx=Array.isArray(state.remotePublicExclusions)?state.remotePublicExclusions.filter(x=>x.started_at&&(!x.end_at||new Date(x.end_at)>new Date())):[];
  const transfers=v2RelevantTransfers();
  const recent=(ownViolations?.()||[]).slice(0,6);
  content.innerHTML=
   '<div class="v2-hero"><div><div class="v2-kicker">NAP Event Tracker · '+v2esc(v2t('test'))+'</div><h1>'+v2esc(v2t('homeTitle'))+'</h1><p>'+v2esc(v2t('homeSub'))+'</p></div>'+
   '<div class="v2-hero-actions"><span class="v2-pill blue">'+v2esc(state.alliance)+'</span><span class="v2-pill green">LIVE DATA</span></div></div>'+
   '<div class="v2-private">🔒 '+v2esc(v2t('privacy'))+'</div>'+
   '<section class="v2-kpis">'+
    '<div class="v2-kpi"><div class="v2-kpi-label">'+v2esc(v2t('openActions'))+'</div><div class="v2-kpi-value">'+ownActions.length+'</div><div class="v2-kpi-sub">'+v2esc(v2t('myAlliance'))+'</div></div>'+
    '<div class="v2-kpi"><div class="v2-kpi-label">'+v2esc(v2t('overdueActions'))+'</div><div class="v2-kpi-value">'+napOverdue.length+'</div><div class="v2-kpi-sub">'+v2esc(v2t('napWide'))+'</div></div>'+
    '<div class="v2-kpi"><div class="v2-kpi-label">'+v2esc(v2t('activeExclusions'))+'</div><div class="v2-kpi-value">'+publicEx.length+'</div><div class="v2-kpi-sub">NAP</div></div>'+
    '<div class="v2-kpi"><div class="v2-kpi-label">'+v2esc(v2t('newViolations'))+'</div><div class="v2-kpi-value">'+active.length+'</div><div class="v2-kpi-sub">'+v2esc(v2t('myAlliance'))+'</div></div>'+
   '</section>'+
   '<div class="v2-grid"><div class="v2-stack">'+
    '<section class="v2-card"><div class="v2-card-head"><div><div class="v2-card-title">'+v2esc(v2t('myActions'))+'</div><div class="v2-card-sub">'+v2esc(v2t('ownOnly'))+'</div></div><span class="v2-count">'+ownActions.length+'</span></div>'+
    '<div class="v2-card-body">'+(ownActions.length?ownActions.map(v2ActionHtml).join(''):'<div class="v2-empty">✓ '+v2esc(v2t('noActions'))+'</div>')+'</div></section>'+
    '<section class="v2-card"><div class="v2-card-head"><div><div class="v2-card-title">'+v2esc(v2t('recent'))+'</div><div class="v2-card-sub">'+v2esc(v2t('recentSub'))+'</div></div><span class="v2-count">'+recent.length+'</span></div><div class="v2-card-body">'+
      (recent.length?recent.map(v=>'<div class="v2-list-row"><div><div class="v2-player">'+v2esc(v.player_name)+'</div><div class="v2-meta">'+v2esc(v.event_name)+' · '+v2esc(localizedStoredPhase(v.phase_name))+' · '+v2esc(v2date(v.occurred_at))+'</div></div><div><span class="v2-pill '+(v.kind==='swordland'?'blue':'red')+'">'+(v.kind==='overspend'&&v.target_value?(Number(v.score)/Number(v.target_value)).toFixed(2)+'×':'Attendance')+'</span></div></div>').join(''):'<div class="v2-empty">–</div>')+
    '</div></section>'+
   '</div><div class="v2-stack">'+
    '<section class="v2-card"><div class="v2-card-head"><div><div class="v2-card-title">🔔 '+v2esc(v2t('napAlerts'))+'</div><div class="v2-card-sub">'+v2esc(v2t('napAlertsSub'))+'</div></div><span class="v2-count">'+napOverdue.length+'</span></div><div class="v2-card-body">'+
      (napOverdue.length?napOverdue.slice(0,6).map(x=>'<div class="v2-alert"><div class="v2-alert-top"><div><b>'+v2esc(x.alliance_code)+' · '+v2esc(x.player_name||'–')+'</b><p>'+v2esc(v2t('level'))+' '+x.level+' · '+v2esc(v2LevelLabel(Number(x.level)))+'</p></div><span class="v2-pill red">'+v2esc(v2duration(x.overdue_seconds))+'</span></div></div>').join(''):'<div class="v2-empty">✓ '+v2esc(v2t('noNapAlerts'))+'</div>')+
    '</div></section>'+
    '<section class="v2-card"><div class="v2-card-head"><div><div class="v2-card-title">'+v2esc(v2t('activeNap'))+'</div><div class="v2-card-sub">'+v2esc(v2t('activeNapSub'))+'</div></div><span class="v2-count">'+publicEx.length+'</span></div><div class="v2-card-body">'+
      (publicEx.length?publicEx.slice(0,5).map(x=>'<div class="v2-list-row"><div><div class="v2-player">'+v2esc(x.player_name)+'</div><div class="v2-meta">'+v2esc(x.alliance_code||x.alliance||'')+' · '+v2esc(v2date(x.end_at))+'</div></div><span class="v2-pill red">NAP OUT</span></div>').join(''):'<div class="v2-empty">'+v2esc(v2t('noNap'))+'</div>')+
    '</div></section>'+
    '<section class="v2-card"><div class="v2-card-head"><div><div class="v2-card-title">↔ '+v2esc(v2t('transfers'))+'</div><div class="v2-card-sub">'+v2esc(v2t('transfersSub'))+'</div></div><span class="v2-count">'+transfers.length+'</span></div><div class="v2-card-body">'+
      (transfers.length?transfers.map(x=>{const from=x.from_alliance||x.from||'–',to=x.to_alliance||x.to||'–',incoming=to===state.alliance;return '<div class="v2-list-row"><div><div class="v2-player">'+v2esc(x.player_name||'–')+'</div><div class="v2-meta">'+v2esc(from)+' → '+v2esc(to)+'</div></div><span class="v2-pill '+(incoming?'green':'blue')+'">'+v2esc(incoming?v2t('incoming'):v2t('outgoing'))+'</span></div>'}).join(''):'<div class="v2-empty">'+v2esc(v2t('noTransfers'))+'</div>')+
    '</div></section>'+
   '</div></div>';
  v2BindHome();
  if(fetchRemote)v2LoadOverdue(false);
}

function v2BindHome(){
  content.querySelectorAll('.v2-open-player').forEach(b=>b.addEventListener('click',()=>renderPlayerDetail(b.dataset.player)));
  content.querySelectorAll('.v2-quick').forEach(b=>b.addEventListener('click',async()=>{
    if(b.disabled)return;b.disabled=true;
    try{
      if(b.dataset.v2Action==='contact'){await toggleContact(b.dataset.id,true);renderDashboardV2(true);return}
      if(b.dataset.v2Action==='r1'){await completeSanction(b.dataset.id,true);alert(v2t('r1TimerHint'));return}
      if(b.dataset.v2Action==='nap24'){if(!confirm(v2t('confirmNap'))){b.disabled=false;return}await completeSanction(b.dataset.id,true);return}
    }catch(e){alert((e?.message||String(e)));b.disabled=false}
  }));
}

function v2NotificationRows(){
  const rows=[];
  (state.v2Overdue||[]).forEach(x=>rows.push({kind:'nap',title:x.alliance_code+' · '+(x.player_name||'–'),copy:v2t('level')+' '+x.level+' · '+v2duration(x.overdue_seconds)+' '+v2t('overdue')}));
  v2OwnActionRows().forEach(x=>{const d=v2Deadline(x.s||x.violation);if(!d.over&&d.seconds<=21600)rows.push({kind:'own',title:x.name,copy:v2LevelLabel(x.level)+' · '+d.text})});
  v2RelevantTransfers().forEach(x=>{const from=x.from_alliance||x.from||'–',to=x.to_alliance||x.to||'–';rows.push({kind:'transfer',title:x.player_name||'–',copy:from+' → '+to})});
  return rows;
}
function v2RenderNotifications(){
  const drawer=document.getElementById('v2NotificationDrawer'),list=document.getElementById('v2NotificationList'),count=document.getElementById('v2BellCount');
  const rows=v2NotificationRows();
  if(count){count.textContent=String(rows.length);count.hidden=!rows.length}
  if(list)list.innerHTML=rows.length?rows.map(x=>'<div class="v2-notification"><b>'+v2esc(x.title)+'</b><p>'+v2esc(x.copy)+'</p></div>').join(''):'<div class="v2-empty">✓</div>';
}
function v2ToggleDrawer(){
  const d=document.getElementById('v2NotificationDrawer');if(!d)return;d.hidden=!d.hidden;if(!d.hidden)v2LoadOverdue(true);
}

function v2ThemeIcon(){
  const light=document.documentElement.dataset.v2Theme==='light';
  document.querySelectorAll('.v2-theme-icon').forEach(x=>x.textContent=light?'☾':'☀');
}
function v2ToggleTheme(){
  const next=document.documentElement.dataset.v2Theme==='light'?'dark':'light';
  document.documentElement.dataset.v2Theme=next;document.documentElement.dataset.theme=next;localStorage.setItem('nap-v2-theme',next);v2ThemeIcon();
}

function v2MakeNavButton(view,icon,label,extra='v2-desktop-extra'){
  const b=document.createElement('button');b.type='button';b.className='nav-btn '+extra;b.dataset.view=view;b.innerHTML='<span>'+icon+'</span><small>'+v2esc(label)+'</small>';
  b.addEventListener('click',()=>{if(view==='v2more'){v2ToggleMore();return}setView(view)});
  return b;
}
function v2DecorateShell(){
  const savedTheme=localStorage.getItem('nap-v2-theme')||'dark';document.documentElement.dataset.v2Theme=savedTheme;document.documentElement.dataset.theme=savedTheme;
  const top=document.querySelector('.topbar .row');
  if(top&&!document.getElementById('v2BellBtn')){
    const badge=document.createElement('span');badge.className='v2-test-badge';badge.textContent=v2t('test');top.prepend(badge);
    const bell=document.createElement('button');bell.id='v2BellBtn';bell.type='button';bell.className='v2-icon-btn';bell.innerHTML='🔔<span id="v2BellCount" class="v2-bell-count" hidden></span>';bell.title=v2t('notifications');bell.onclick=v2ToggleDrawer;top.insertBefore(bell,document.getElementById('logoutBtn'));
    const theme=document.createElement('button');theme.id='v2ThemeBtn';theme.type='button';theme.className='v2-icon-btn';theme.innerHTML='<span class="v2-theme-icon"></span>';theme.title=v2t('theme');theme.onclick=v2ToggleTheme;top.insertBefore(theme,bell);
  }
  if(!document.getElementById('v2NotificationDrawer')){
    const d=document.createElement('aside');d.id='v2NotificationDrawer';d.className='v2-drawer';d.hidden=true;d.innerHTML='<div class="v2-drawer-head"><div><b>'+v2esc(v2t('notifications'))+'</b><div class="v2-card-sub">'+v2esc(state?.alliance||'')+'</div></div><button class="v2-icon-btn" id="v2DrawerClose">×</button></div><div id="v2NotificationList"></div>';document.body.appendChild(d);d.querySelector('#v2DrawerClose').onclick=()=>d.hidden=true;
  }
  const nav=document.querySelector('.bottom-nav');
  if(nav&&!nav.querySelector('[data-v2-nav="1"]')){
    const laws=nav.querySelector('[data-view="laws"]');
    const kvk=v2MakeNavButton('kvkV2','🏆',v2t('kvk'));kvk.dataset.v2Nav='1';
    const perf=v2MakeNavButton('performanceV2','▥',v2t('performance'));perf.dataset.v2Nav='1';
    const crown=v2MakeNavButton('crown','♛',v2t('crown'));crown.dataset.v2Nav='1';
    const activity=v2MakeNavButton('activity','◷',v2t('activity'));activity.dataset.v2Nav='1';
    if(laws){nav.insertBefore(kvk,laws);nav.insertBefore(perf,laws);nav.insertBefore(crown,laws);nav.insertBefore(activity,laws)}
    const more=v2MakeNavButton('v2more','•••',v2t('more'),'v2-mobile-more');more.dataset.v2Nav='1';nav.appendChild(more);
  }
  if(!document.getElementById('v2MoreSheet')){
    const s=document.createElement('div');s.id='v2MoreSheet';s.className='v2-more-sheet';s.hidden=true;
    s.innerHTML='<div class="v2-more-grid">'+
      '<button data-more-view="kvkV2">🏆<small>'+v2esc(v2t('kvk'))+'</small></button>'+
      '<button data-more-view="laws">⚖<small>'+v2esc(v2t('laws'))+'</small></button>'+
      '<button data-more-view="performanceV2">▥<small>'+v2esc(v2t('performance'))+'</small></button>'+
      '<button data-more-view="crown">♛<small>'+v2esc(v2t('crown'))+'</small></button>'+
      '<button data-more-view="activity">◷<small>'+v2esc(v2t('activity'))+'</small></button>'+
      '<button data-more-view="settings">⚙<small>'+v2esc(v2t('settings'))+'</small></button>'+
      '<button data-more-view="support"><svg class="support-agent-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.4 11.2V9.7C4.4 5.6 7.7 2.3 11.8 2.3s7.4 3.3 7.4 7.4v1.5"/><path d="M4.5 10.2c-1.2.2-2.1 1.2-2.1 2.5v2.2c0 1.5 1.2 2.7 2.7 2.7h1.1v-7.4H4.5Z"/><path d="M19.1 10.2c1.4 0 2.5 1.1 2.5 2.5v2.2c0 1.5-1.2 2.7-2.7 2.7h-1.2"/><path d="M6.2 10.2v4.4c0 4 2.5 6.8 5.8 6.8"/><path d="M17.8 10.2v5.2c0 3.3-2.2 5-5.4 5"/><path d="M12.4 20.4h2.5"/><path d="M7.7 7.4c1.4-.4 2.6-1.4 3.2-2.7 1.8 1.7 4.1 2.5 6.8 2.5"/><circle cx="9.5" cy="12.2" r=".65" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12.2" r=".65" fill="currentColor" stroke="none"/></svg><small>Support</small></button>'+
      '<button id="v2MoreTheme"><span class="v2-theme-icon"></span><small>'+v2esc(v2t('theme'))+'</small></button>'+
      '<button id="v2MoreBell">🔔<small>'+v2esc(v2t('notifications'))+'</small></button>'+
    '</div>';document.body.appendChild(s);
    s.querySelectorAll('[data-more-view]').forEach(b=>b.onclick=()=>{s.hidden=true;setView(b.dataset.moreView)});
    s.querySelector('#v2MoreTheme').onclick=v2ToggleTheme;s.querySelector('#v2MoreBell').onclick=()=>{s.hidden=true;v2ToggleDrawer()};
  }
  v2ThemeIcon();v2RenderNotifications();
}
function v2ToggleMore(){const s=document.getElementById('v2MoreSheet');if(s)s.hidden=!s.hidden}

async function renderPerformanceV2(){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='performanceV2'));
  content.innerHTML='<div class="v2-hero"><div><div class="v2-kicker">'+v2esc(v2t('performance'))+'</div><h1>'+v2esc(v2t('performance'))+' 2.0</h1></div></div><div class="v2-card"><div class="v2-card-body v2-empty">'+v2esc(v2t('loading'))+'</div></div>';
  try{
    const {data,error}=await sbClient.rpc('get_performance_dashboard',{});if(error)throw error;
    const m=data?.mobilization||{},k=data?.kvk||{};
    const blocks=[
      {title:v2t('mobilization'),d:m},
      {title:v2t('top200'),d:k}
    ];
    content.innerHTML='<div class="v2-hero"><div><div class="v2-kicker">'+v2esc(v2t('performance'))+'</div><h1>'+v2esc(v2t('performance'))+' 2.0</h1><p>'+v2esc(v2t('myAlliance'))+' · '+v2esc(state.alliance)+'</p></div></div><div class="v2-stack">'+blocks.map(x=>'<section class="v2-card"><div class="v2-card-head"><div><div class="v2-card-title">'+v2esc(x.title)+'</div><div class="v2-card-sub">'+v2esc(x.d?.event?.label||'')+'</div></div></div><div class="v2-card-body"><div class="v2-kpis"><div class="v2-kpi"><div class="v2-kpi-label">'+v2esc(v2t('recorded'))+'</div><div class="v2-kpi-value">'+v2fmt(x.d?.recorded_players||x.d?.known_top200_players||0)+'</div></div><div class="v2-kpi"><div class="v2-kpi-label">'+v2esc(v2t('score'))+'</div><div class="v2-kpi-value">'+v2fmt(x.d?.total_score||x.d?.known_top200_score||0)+'</div></div></div></div></section>').join('')+'</div>';
  }catch(e){content.innerHTML+='<div class="v2-alert">'+v2esc(v2t('loadFailed'))+'</div>'}
}
async function renderKvkV2(){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='kvkV2'));
  content.innerHTML='<div class="v2-hero"><div><div class="v2-kicker">'+v2esc(v2t('kvk'))+'</div><h1>'+v2esc(v2t('kvk'))+' 2.0</h1></div></div><div class="v2-card"><div class="v2-card-body v2-empty">'+v2esc(v2t('loading'))+'</div></div>';
  try{
    const {data,error}=await sbClient.rpc('get_performance_dashboard',{});if(error)throw error;
    const k=data?.kvk||{};
    let rows=[];
    if(k?.event?.id){
      const rr=await sbClient.rpc('get_kvk_full_ranking',{p_performance_event_id:k.event.id});
      if(!rr.error)rows=Array.isArray(rr.data?.rows)?rr.data.rows:[];
    }
    content.innerHTML='<div class="v2-hero"><div><div class="v2-kicker">'+v2esc(v2t('kvk'))+'</div><h1>'+v2esc(v2t('top200'))+'</h1><p>'+v2esc(k?.event?.label||'')+'</p></div></div><section class="v2-card"><div class="v2-card-head"><div><div class="v2-card-title">'+v2esc(v2t('fullRanking'))+'</div><div class="v2-card-sub">'+v2fmt(rows.length)+' '+v2esc(v2t('player'))+'</div></div></div><div class="v2-card-body">'+(rows.length?rows.slice(0,50).map(r=>'<div class="v2-list-row"><div><div class="v2-player">'+v2esc(r.name||'–')+'</div><div class="v2-meta">#'+v2esc(r.server_rank||'–')+' · '+v2esc(r.source_type||'screen')+'</div></div><b>'+v2fmt(r.score)+'</b></div>').join(''):'<div class="v2-empty">–</div>')+'</div></section>';
  }catch(e){content.innerHTML+='<div class="v2-alert">'+v2esc(v2t('loadFailed'))+'</div>'}
}

const baseRenderDashboardV2=renderDashboard;
renderDashboard=function(){return renderDashboardV2(true)};
const baseRenderV2=render;
render=function(){
  if(state?.view==='kvkV2')return renderKvkV2();
  if(state?.view==='performanceV2')return renderPerformanceV2();
  return baseRenderV2();
};
const baseEnterAppV2=enterApp;
enterApp=function(){const r=baseEnterAppV2();v2DecorateShell();setTimeout(()=>{if(state?.view==='dashboard')renderDashboardV2(true)},0);return r};
const baseSetLanguageV2=setLanguage;
setLanguage=function(lang){const r=baseSetLanguageV2(lang);v2DecorateShell();if(state?.view==='dashboard')setTimeout(()=>renderDashboardV2(false),0);return r};

v2DecorateShell();
if(state?.alliance){setTimeout(()=>{if(state.view==='dashboard')renderDashboardV2(true)},0)}

/* ===== Players 2.0: full visual replacement ===== */
const P2={
 de:{kicker:'SPIELERAKTEN',title:'Spieler zuerst, Details auf Wunsch.',sub:'Suchen und filtern, dann in eine vollständige Spielerakte wechseln.',search:'Spielername oder ID suchen …',onlyEntries:'Nur mit Einträgen',attendance:'Swordland / TriAlliance',players:'Spieler',combine:'Filter lassen sich kombinieren.',violations:'Verstöße',stage:'Stufe',contact:'Kontakt',open:'Offen',deadline:'Frist',napOut:'NAP OUT',lastEntry:'letzter Eintrag',noPlayers:'Keine Spieler entsprechen den aktuellen Filtern.',sortRecent:'Letzter Eintrag',sortName:'Name A–Z',sortStage:'Höchste Stufe',pendingLanguages:'Offene Spracheingaben',overview:'Übersicht',measures:'Maßnahmen',performance:'Performance',comments:'Kommentare',history:'Historie',back:'Zurück zu Spielerakten',playerId:'Player ID',saveId:'ID speichern',languages:'Sprachen',noLanguages:'Keine Sprachen hinterlegt',currentStage:'Aktuelle Stufe',stage1:'Kontakt',stage2:'R1',stage3:'24h NAP OUT',stage4:'Extended',created:'Erstellt',implemented:'Umgesetzt',ends:'Ende',remaining:'Restzeit',noMeasures:'Keine Maßnahmen vorhanden.',noViolations:'Keine Verstöße vorhanden.',score:'Score',limit:'Grenze',evidence:'ScreenRecording-Beweise',commentPlaceholder:'Interne Notiz zur Spielerakte …',saveComment:'Kommentar speichern',noComments:'Noch keine Kommentare.',loading:'Lädt …',noPerformance:'Noch keine Performance-Daten.',source:'Quelle',snapshots:'Snapshots',total:'Gesamt',active:'Aktiv',latestAction:'Aktuelle Maßnahme',status:'Status',completed:'Erledigt',pending:'Offen',profile:'Spielerprofil',editId:'Player ID bearbeiten',saved:'Gespeichert.',actionNeeded:'Handlungsbedarf',frame:'Frame'},
 en:{kicker:'PLAYER FILES',title:'Players first, details on demand.',sub:'Search and filter, then switch to a complete player file.',search:'Search player name or ID …',onlyEntries:'Only with entries',attendance:'Swordland / TriAlliance',players:'players',combine:'Filters can be combined.',violations:'Violations',stage:'Stage',contact:'Contact',open:'Open',deadline:'Deadline',napOut:'NAP OUT',lastEntry:'last entry',noPlayers:'No players match the current filters.',sortRecent:'Latest entry',sortName:'Name A–Z',sortStage:'Highest stage',pendingLanguages:'Pending language submissions',overview:'Overview',measures:'Actions',performance:'Performance',comments:'Comments',history:'History',back:'Back to player files',playerId:'Player ID',saveId:'Save ID',languages:'Languages',noLanguages:'No languages stored',currentStage:'Current stage',stage1:'Contact',stage2:'R1',stage3:'24h NAP OUT',stage4:'Extended',created:'Created',implemented:'Implemented',ends:'End',remaining:'Remaining',noMeasures:'No actions available.',noViolations:'No violations available.',score:'Score',limit:'Limit',evidence:'ScreenRecording evidence',commentPlaceholder:'Internal note for this player file …',saveComment:'Save comment',noComments:'No comments yet.',loading:'Loading …',noPerformance:'No performance data yet.',source:'Source',snapshots:'Snapshots',total:'Total',active:'Active',latestAction:'Current action',status:'Status',completed:'Completed',pending:'Open',profile:'Player profile',editId:'Edit Player ID',saved:'Saved.',actionNeeded:'Action required',frame:'Frame'},
 fr:{kicker:'DOSSIERS JOUEURS',title:'Les joueurs d’abord, les détails à la demande.',sub:'Rechercher et filtrer, puis ouvrir un dossier joueur complet.',search:'Rechercher nom ou ID …',onlyEntries:'Avec entrées uniquement',attendance:'Swordland / TriAlliance',players:'joueurs',combine:'Les filtres peuvent être combinés.',violations:'Infractions',stage:'Niveau',contact:'Contact',open:'Ouvert',deadline:'Délai',napOut:'NAP OUT',lastEntry:'dernière entrée',noPlayers:'Aucun joueur ne correspond aux filtres.',sortRecent:'Dernière entrée',sortName:'Nom A–Z',sortStage:'Niveau le plus élevé',pendingLanguages:'Langues en attente',overview:'Aperçu',measures:'Mesures',performance:'Performance',comments:'Commentaires',history:'Historique',back:'Retour aux dossiers',playerId:'Player ID',saveId:'Enregistrer ID',languages:'Langues',noLanguages:'Aucune langue enregistrée',currentStage:'Niveau actuel',stage1:'Contact',stage2:'R1',stage3:'NAP OUT 24 h',stage4:'Extended',created:'Créé',implemented:'Appliqué',ends:'Fin',remaining:'Temps restant',noMeasures:'Aucune mesure.',noViolations:'Aucune infraction.',score:'Score',limit:'Limite',evidence:'Preuves ScreenRecording',commentPlaceholder:'Note interne pour ce dossier …',saveComment:'Enregistrer',noComments:'Aucun commentaire.',loading:'Chargement …',noPerformance:'Aucune donnée de performance.',source:'Source',snapshots:'Snapshots',total:'Total',active:'Actif',latestAction:'Mesure actuelle',status:'Statut',completed:'Terminé',pending:'Ouvert',profile:'Profil joueur',editId:'Modifier Player ID',saved:'Enregistré.',actionNeeded:'Action requise',frame:'Image'},
 es:{kicker:'EXPEDIENTES',title:'Primero los jugadores, detalles cuando quieras.',sub:'Busca y filtra, después abre un expediente completo.',search:'Buscar jugador o ID …',onlyEntries:'Solo con entradas',attendance:'Swordland / TriAlliance',players:'jugadores',combine:'Los filtros se pueden combinar.',violations:'Infracciones',stage:'Nivel',contact:'Contacto',open:'Abierto',deadline:'Plazo',napOut:'NAP OUT',lastEntry:'última entrada',noPlayers:'Ningún jugador coincide con los filtros.',sortRecent:'Última entrada',sortName:'Nombre A–Z',sortStage:'Nivel más alto',pendingLanguages:'Idiomas pendientes',overview:'Resumen',measures:'Medidas',performance:'Performance',comments:'Comentarios',history:'Historial',back:'Volver a expedientes',playerId:'Player ID',saveId:'Guardar ID',languages:'Idiomas',noLanguages:'Sin idiomas registrados',currentStage:'Nivel actual',stage1:'Contacto',stage2:'R1',stage3:'NAP OUT 24 h',stage4:'Extended',created:'Creado',implemented:'Aplicado',ends:'Fin',remaining:'Tiempo restante',noMeasures:'No hay medidas.',noViolations:'No hay infracciones.',score:'Score',limit:'Límite',evidence:'Pruebas ScreenRecording',commentPlaceholder:'Nota interna para este expediente …',saveComment:'Guardar comentario',noComments:'Aún no hay comentarios.',loading:'Cargando …',noPerformance:'Aún no hay datos de performance.',source:'Fuente',snapshots:'Snapshots',total:'Total',active:'Activo',latestAction:'Medida actual',status:'Estado',completed:'Finalizado',pending:'Abierto',profile:'Perfil jugador',editId:'Editar Player ID',saved:'Guardado.',actionNeeded:'Acción requerida',frame:'Fotograma'}
};
Object.assign(P2.de,{contacted:'Kontaktiert'});
Object.assign(P2.en,{contacted:'Contacted'});
Object.assign(P2.fr,{contacted:'Contacté'});
Object.assign(P2.es,{contacted:'Contactado'});
const p2t=k=>(P2[v2lang()]||P2.de)[k]||k;
let p2OnlyEntries=true,p2Attendance=false,p2Sort='recent',p2Query='',p2CurrentPlayer=null,p2CurrentTab='overview';
function p2PlayerName(p){return p?.name||p?.player_name||''}
function p2Violations(name){return (ownViolations?.()||[]).filter(v=>v.player_name===name)}
function p2Sanctions(name){return (ownSanctions?.()||[]).filter(s=>s.player_name===name).sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0))}
function p2AttendanceViolations(name){return p2Violations(name).filter(v=>v.kind==='swordland'||/swordland|trialliance|triforce/i.test(String(v.event_name||'')))}
function p2ActiveViolations(name){return p2Violations(name).filter(v=>activeViolation(v))}
function p2LatestDate(name){const arr=[...p2Violations(name).map(v=>v.occurred_at||v.created_at),...p2Sanctions(name).map(s=>s.created_at)].filter(Boolean).map(x=>new Date(x).getTime()).filter(Number.isFinite);return arr.length?Math.max(...arr):0}
function p2CurrentLevel(name){const active=p2ActiveViolations(name).length;const pending=p2Sanctions(name).find(s=>{if(Number(s.level)===1)return false;if(Number(s.level)===4)return !s.started_at;return !s.completed});return Math.min(4,Math.max(active,Number(pending?.level||0)))}
function p2Initial(name){const s=String(name||'?').trim();return (s[0]||'?').toUpperCase()}
function p2AvatarHtml(player,large=false){
 const name=p2PlayerName(player),id=String(player?.game_id||player?.player_game_id||'');
 const cl=large?'p2-profile-avatar':'p2-avatar';
 if(id)queueMicrotask(()=>window.NAP2_REFRESH_PLAYER_AVATARS?.());
 return '<div class="'+cl+'"'+(id?' data-nap-player-avatar="'+v2esc(id)+'"':'')+'>'+v2esc(p2Initial(name))+'</div>';
}
function p2CardStatus(name){const level=p2CurrentLevel(name),s=p2Sanctions(name).find(x=>Number(x.level)===level),active=p2ActiveViolations(name);if(level===0)return {value:'–',label:p2t('stage')};if(level===1)return {value:active.some(v=>!v.contacted)?p2t('open'):'✓',label:p2t('contact')};if(level===2){const d=s?v2Deadline(s):null;return {value:d&&!d.over?v2duration(d.seconds):p2t('open'),label:p2t('deadline')}}if(level===3){if(s?.started_at&&s?.end_at)return {value:v2duration(Math.max(0,(new Date(s.end_at)-Date.now())/1000)),label:p2t('napOut')};return {value:p2t('open'),label:p2t('napOut')}}return {value:p2t('open'),label:'Extended'}}
function p2PlayerRecords(){const map=new Map();(ownPlayers?.()||[]).forEach(p=>map.set(p2PlayerName(p),p));(ownViolations?.()||[]).forEach(v=>{if(v.player_name&&!map.has(v.player_name))map.set(v.player_name,{name:v.player_name,game_id:'',alliance_code:state.alliance})});return [...map.values()].filter(p=>p2PlayerName(p))}
function p2FilteredPlayers(){let rows=p2PlayerRecords().filter(p=>{const name=p2PlayerName(p),game=String(p.game_id||'');if(p2OnlyEntries&&!p2Violations(name).length&&!p2Sanctions(name).length)return false;if(p2Attendance&&!p2AttendanceViolations(name).length)return false;if(p2Query&&!((name+' '+game).toLowerCase().includes(p2Query.toLowerCase())))return false;return true});if(p2Sort==='name')rows.sort((a,b)=>p2PlayerName(a).localeCompare(p2PlayerName(b)));else if(p2Sort==='stage')rows.sort((a,b)=>p2CurrentLevel(p2PlayerName(b))-p2CurrentLevel(p2PlayerName(a))||p2PlayerName(a).localeCompare(p2PlayerName(b)));else rows.sort((a,b)=>p2LatestDate(p2PlayerName(b))-p2LatestDate(p2PlayerName(a))||p2PlayerName(a).localeCompare(p2PlayerName(b)));return rows}
function p2AttendanceBadge(name){const a=p2AttendanceViolations(name);if(!a.length)return '';const last=a.sort((x,y)=>new Date(y.occurred_at||0)-new Date(x.occurred_at||0))[0],lab=/trialliance|triforce/i.test(String(last.event_name||''))?'TriAlliance':'Swordland';return '<span class="p2-attendance-badge">'+v2esc(lab)+'</span>'}
function p2PlayerCard(p){const name=p2PlayerName(p),vs=p2Violations(name),active=p2ActiveViolations(name),level=p2CurrentLevel(name),status=p2CardStatus(name),last=p2LatestDate(name);return '<button class="p2-player-card" type="button" data-p2-player="'+v2esc(name)+'"><div class="p2-card-head"><div class="p2-identity">'+p2AvatarHtml(p)+'<div><strong>'+v2esc(name)+'</strong><small>'+v2esc(p.game_id||'–')+'</small></div></div><span class="p2-alliance-badge">'+v2esc(p.alliance_code||state.alliance)+'</span></div><div class="p2-metrics"><div><b>'+vs.length+'</b><small>'+v2esc(p2t('violations'))+'</small></div><div><b>'+level+'</b><small>'+v2esc(p2t('stage'))+'</small></div><div><b>'+v2esc(status.value)+'</b><small>'+v2esc(status.label)+'</small></div></div><div class="p2-card-foot"><div>'+p2AttendanceBadge(name)+(v2OwnActionRows().some(row=>row.name===name)?'<span class="p2-action-dot">'+v2esc(p2t('actionNeeded'))+'</span>':'')+'</div><small>'+(last?v2esc(v2date(last))+' · '+v2esc(p2t('lastEntry')):'–')+'</small></div></button>'}
async function p2LoadPendingLanguageCount(){const badge=document.getElementById('p2PendingLanguages');if(!badge||state.alliance!=='NRW')return;try{const {data,error}=await sbClient.from('welcome_language_submissions').select('id').eq('status','pending');if(error)throw error;const n=(data||[]).length;badge.hidden=n===0;badge.querySelector('b').textContent=String(n)}catch{badge.hidden=true}}
function p2SetTopbar(title){const h=document.getElementById('allianceTitle');if(h)h.innerHTML='<span class="p2-top-title">'+v2esc(title)+'</span><span class="p2-top-alliance">'+v2esc(state.alliance||'')+'</span>'}
function renderPlayersV2(){p2CurrentPlayer=null;p2CurrentTab='overview';p2SetTopbar(p2t('kicker'));document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='players'));const rows=p2FilteredPlayers();content.innerHTML='<div class="p2-hero"><div><div class="v2-kicker">'+v2esc(p2t('kicker'))+'</div><h1>'+v2esc(p2t('title'))+'</h1><p>'+v2esc(p2t('sub'))+'</p></div>'+(state.alliance==='NRW'?'<button id="p2PendingLanguages" class="p2-pending-languages" type="button" hidden>🌐 '+v2esc(p2t('pendingLanguages'))+' <b>0</b></button>':'')+'</div><div class="p2-toolbar"><div class="p2-toolbar-main"><input id="p2Search" class="p2-search" value="'+v2esc(p2Query)+'" placeholder="'+v2esc(p2t('search'))+'"><label class="p2-filter-chip '+(p2OnlyEntries?'active':'')+'"><input id="p2OnlyEntries" type="checkbox" '+(p2OnlyEntries?'checked':'')+'><span>✓</span>'+v2esc(p2t('onlyEntries'))+'</label><label class="p2-filter-chip '+(p2Attendance?'active':'')+'"><input id="p2Attendance" type="checkbox" '+(p2Attendance?'checked':'')+'><span>✓</span>'+v2esc(p2t('attendance'))+'</label></div><div class="p2-toolbar-side"><span class="p2-player-count"><b>'+rows.length+'</b> '+v2esc(p2t('players'))+'</span><select id="p2Sort" class="p2-sort"><option value="recent" '+(p2Sort==='recent'?'selected':'')+'>'+v2esc(p2t('sortRecent'))+'</option><option value="name" '+(p2Sort==='name'?'selected':'')+'>'+v2esc(p2t('sortName'))+'</option><option value="stage" '+(p2Sort==='stage'?'selected':'')+'>'+v2esc(p2t('sortStage'))+'</option></select></div></div><div class="p2-filter-note"><span class="p2-count-pill">'+rows.length+' '+v2esc(p2t('players'))+'</span><span>'+v2esc(p2t('combine'))+'</span></div><div class="p2-player-grid">'+(rows.length?rows.map(p2PlayerCard).join(''):'<div class="p2-no-players">'+v2esc(p2t('noPlayers'))+'</div>')+'</div>';document.getElementById('p2Search')?.addEventListener('input',e=>{p2Query=e.target.value;renderPlayersV2();const el=document.getElementById('p2Search');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}});document.getElementById('p2OnlyEntries')?.addEventListener('change',e=>{p2OnlyEntries=e.target.checked;renderPlayersV2()});document.getElementById('p2Attendance')?.addEventListener('change',e=>{p2Attendance=e.target.checked;renderPlayersV2()});document.getElementById('p2Sort')?.addEventListener('change',e=>{p2Sort=e.target.value;renderPlayersV2()});content.querySelectorAll('[data-p2-player]').forEach(b=>b.addEventListener('click',()=>renderPlayerDetailV2(b.dataset.p2Player)));p2LoadPendingLanguageCount()}
function p2StageTimeline(level){const labs=[p2t('stage1'),p2t('stage2'),p2t('stage3'),p2t('stage4')];return '<div class="p2-stage-wrap"><div class="p2-stage-line">'+labs.map((lab,i)=>{const n=i+1,done=n<level,current=n===level;return '<div class="p2-stage-node '+(done?'done ':'')+(current?'current':'')+'"><span>'+n+'</span><small>'+v2esc(lab)+'</small></div>'}).join('')+'</div></div>'}
function p2Metric(label,value,sub=''){return '<div class="p2-profile-metric"><b>'+v2esc(value)+'</b><small>'+v2esc(label)+'</small>'+(sub?'<em>'+v2esc(sub)+'</em>':'')+'</div>'}
function p2SanctionHtml(s){
 const level=Number(s.level);
 const v=level===1?p2Violations(s.player_name).find(x=>String(x.id)===String(s.violation_id)):null;
 // Stage 1 is completed by the contact flag, even if a historic sanction has completed=false.
 const contacted=level===1&&!!v?.contacted;
 const completed=!!s.completed||contacted;
 const running=!!s.started_at&&!completed&&(!s.end_at||new Date(s.end_at)>new Date());
 const remainingText=s.end_at?v2duration(Math.max(0,(new Date(s.end_at)-Date.now())/1000)):'–';
 const implementedAt=contacted?(v.contacted_at||s.started_at):s.started_at;
 return '<article class="p2-record-card"><div class="p2-record-head"><div><b>'+v2esc(p2t('stage'))+' '+level+' · '+v2esc(v2LevelLabel(level))+'</b><small>'+v2esc(p2t('created'))+' '+v2esc(v2date(s.created_at))+'</small></div><span class="v2-pill '+(completed?'green':running?'red':'gold')+'">'+v2esc(contacted?p2t('contacted'):completed?p2t('completed'):p2t('pending'))+'</span></div><div class="p2-record-meta"><span><small>'+v2esc(p2t('implemented'))+'</small><b>'+v2esc(implementedAt?v2date(implementedAt):'–')+'</b></span><span><small>'+v2esc(p2t('ends'))+'</small><b>'+v2esc(s.end_at?v2date(s.end_at):'–')+'</b></span><span><small>'+v2esc(p2t('remaining'))+'</small><b>'+v2esc(s.end_at?remainingText:'–')+'</b></span></div></article>';
}
function p2ViolationHtml(v){const mult=v.kind==='overspend'&&v.target_value?(Number(v.score)/Number(v.target_value)).toFixed(2)+'×':'Attendance';return '<article class="p2-record-card" data-p2-violation="'+v2esc(v.id)+'"><div class="p2-record-head"><div><b>'+v2esc(v.event_name||'–')+'</b><small>'+v2esc(localizedStoredPhase(v.phase_name)||'')+' · '+v2esc(v2date(v.occurred_at))+'</small></div><span class="v2-pill '+(v.kind==='swordland'?'blue':'red')+'">'+v2esc(mult)+'</span></div>'+(v.kind==='overspend'?'<div class="p2-record-meta"><span><small>'+v2esc(p2t('score'))+'</small><b>'+v2fmt(v.score)+'</b></span><span><small>'+v2esc(p2t('limit'))+'</small><b>'+v2fmt(Number(v.target_value||0)*3)+'</b></span><span><small>'+v2esc(p2t('status'))+'</small><b>'+(v.contacted?'✓ '+v2esc(p2t('contact')):v2esc(p2t('open')))+'</b></span></div>':'')+(v.note?'<div class="p2-note">'+v2esc(v.note)+'</div>':'')+'<div class="p2-evidence-slot" data-evidence-for="'+v2esc(v.id)+'"></div></article>'}
async function p2LoadEvidence(playerId){if(!playerId)return;try{const {data,error}=await sbClient.rpc('get_player_screen_evidence',{p_player_id:playerId});if(error)throw error;for(const row of (data||[])){const slot=content.querySelector('[data-evidence-for="'+CSS.escape(String(row.violation_id))+'"]');if(!slot)continue;const signed=await sbClient.storage.from('screen-violation-evidence').createSignedUrl(row.storage_path,900);if(signed.error||!signed.data?.signedUrl)continue;const n=Number(row.frame_time_seconds||0),m=Math.floor(n/60),s=n-m*60,frame=String(m).padStart(2,'0')+':'+s.toFixed(1).padStart(4,'0');const a=document.createElement('a');a.className='p2-evidence-thumb';a.href=signed.data.signedUrl;a.target='_blank';a.rel='noopener';a.innerHTML='<img loading="lazy" src="'+v2esc(signed.data.signedUrl)+'"><span>'+v2esc(p2t('frame'))+' '+v2esc(frame)+'</span>';slot.appendChild(a)}}catch(e){console.warn('P2 evidence',e)}}
function p2ProfileShell(name,tab){const player=(ownPlayers?.()||[]).find(p=>p2PlayerName(p)===name)||{},level=p2CurrentLevel(name);p2CurrentPlayer=name;p2CurrentTab=tab||p2CurrentTab||'overview';p2SetTopbar(name);content.innerHTML='<button class="p2-back" id="p2Back" type="button">← '+v2esc(p2t('back'))+'</button><section class="p2-profile-head"><div class="p2-profile-id">'+p2AvatarHtml({...player,name},true)+'<div><div class="v2-kicker">'+v2esc(p2t('profile'))+'</div><h1>'+v2esc(name)+'</h1><p>'+v2esc(p2t('playerId'))+' · '+v2esc(player.game_id||'–')+'</p></div></div><span class="p2-alliance-badge big">'+v2esc(player.alliance_code||state.alliance)+'</span></section>'+p2StageTimeline(level)+'<div class="p2-profile-tabs">'+['overview','violations','measures','performance','comments','history'].map(k=>'<button class="'+(p2CurrentTab===k?'active':'')+'" data-p2-tab="'+k+'">'+v2esc(p2t(k))+'</button>').join('')+'</div><div id="p2ProfileBody"></div>';document.getElementById('p2Back').onclick=()=>renderPlayersV2();content.querySelectorAll('[data-p2-tab]').forEach(b=>b.onclick=()=>{p2CurrentTab=b.dataset.p2Tab;p2ProfileShell(name,p2CurrentTab);p2RenderProfileTab(name,p2CurrentTab)});return player}
async function p2RenderProfileTab(name,tab){const body=document.getElementById('p2ProfileBody');if(!body)return;const player=(ownPlayers?.()||[]).find(p=>p2PlayerName(p)===name)||{},vs=p2Violations(name),ss=p2Sanctions(name),active=p2ActiveViolations(name),level=p2CurrentLevel(name),langs=Array.isArray(player.languages)?player.languages:[];if(tab==='overview'){const latest=ss[0],status=p2CardStatus(name);body.innerHTML='<div class="p2-profile-grid"><section class="p2-panel"><div class="p2-panel-head"><b>'+v2esc(p2t('overview'))+'</b></div><div class="p2-panel-body"><div class="p2-profile-metrics">'+p2Metric(p2t('total'),vs.length)+p2Metric(p2t('active'),active.length)+p2Metric(p2t('currentStage'),String(level))+p2Metric(status.label,status.value)+'</div><div class="p2-inline-section"><b>'+v2esc(p2t('languages'))+'</b><div class="p2-lang-list">'+(langs.length?langs.map(x=>'<span class="v2-pill blue">'+v2esc(typeof pleName==='function'?pleName(x):x)+'</span>').join(''):'<span class="p2-muted">'+v2esc(p2t('noLanguages'))+'</span>')+'</div></div><form id="p2IdForm" class="p2-id-form"><label>'+v2esc(p2t('editId'))+'<input id="p2GameId" inputmode="numeric" value="'+v2esc(player.game_id||'')+'"></label><button class="v2-btn" type="submit">'+v2esc(p2t('saveId'))+'</button><span id="p2IdResult"></span></form></div></section><section class="p2-panel"><div class="p2-panel-head"><b>'+v2esc(p2t('latestAction'))+'</b></div><div class="p2-panel-body">'+(latest?p2SanctionHtml(latest):'<div class="p2-empty">'+v2esc(p2t('noMeasures'))+'</div>')+'</div></section></div>';document.getElementById('p2IdForm')?.addEventListener('submit',async e=>{e.preventDefault();const val=document.getElementById('p2GameId').value.replace(/\D/g,''),out=document.getElementById('p2IdResult');try{const {data,error}=await sbClient.rpc('set_player_game_id',{p_player_name:name,p_game_id:val});if(error)throw error;const idx=(state.players[state.alliance]||[]).findIndex(p=>p2PlayerName(p)===name);if(idx>=0)state.players[state.alliance][idx]=data;out.textContent='✓ '+p2t('saved')}catch(err){out.textContent=err.message||String(err)}});return}
 if(tab==='violations'){body.innerHTML='<div class="p2-record-list">'+(vs.length?vs.map(p2ViolationHtml).join(''):'<div class="p2-empty">'+v2esc(p2t('noViolations'))+'</div>')+'</div>';p2LoadEvidence(player.id);return}
 if(tab==='measures'){body.innerHTML='<div class="p2-record-list">'+(ss.length?ss.map(p2SanctionHtml).join(''):'<div class="p2-empty">'+v2esc(p2t('noMeasures'))+'</div>')+'</div>';return}
 if(tab==='performance'){body.innerHTML='<div class="p2-empty">'+v2esc(p2t('loading'))+'</div>';try{const {data,error}=await sbClient.rpc('get_player_performance_history',{p_player_id:player.id});if(error)throw error;const rows=data||[];body.innerHTML='<div class="p2-record-list">'+(rows.length?rows.map(x=>'<article class="p2-record-card"><div class="p2-record-head"><div><b>'+v2esc(x.performance_type==='kvk_prep'?'KvK Prep':'Alliance Mobilization')+'</b><small>'+v2esc(x.label||x.event_name||'')+(x.server_rank?' · #'+v2esc(x.server_rank):'')+'</small></div><strong>'+v2fmt(x.score)+'</strong></div><div class="p2-record-meta"><span><small>'+v2esc(p2t('source'))+'</small><b>'+v2esc(x.source_type||'–')+'</b></span><span><small>'+v2esc(p2t('snapshots'))+'</small><b>'+v2esc(x.snapshots||1)+'</b></span></div></article>').join(''):'<div class="p2-empty">'+v2esc(p2t('noPerformance'))+'</div>')+'</div>'}catch(e){body.innerHTML='<div class="p2-empty">'+v2esc(e.message||String(e))+'</div>'}return}
 if(tab==='comments'){body.innerHTML='<section class="p2-panel"><div class="p2-panel-body"><form id="p2CommentForm" class="p2-comment-form"><textarea id="p2CommentText" maxlength="1000" placeholder="'+v2esc(p2t('commentPlaceholder'))+'"></textarea><button class="v2-btn primary" type="submit">'+v2esc(p2t('saveComment'))+'</button></form><div id="p2Comments"><div class="p2-empty">'+v2esc(p2t('loading'))+'</div></div></div></section>';const load=async()=>{const box=document.getElementById('p2Comments'),{data,error}=await sbClient.rpc('get_player_file_comments',{p_player_id:player.id});if(error){box.innerHTML='<div class="p2-empty">'+v2esc(error.message)+'</div>';return}const rows=data||[];box.innerHTML=rows.length?rows.map(c=>'<article class="p2-comment"><div><b>'+v2esc(c.author_alliance||state.alliance)+'</b><small>'+v2esc(v2date(c.created_at))+'</small></div><p>'+v2esc(c.comment)+'</p></article>').join(''):'<div class="p2-empty">'+v2esc(p2t('noComments'))+'</div>'};await load();document.getElementById('p2CommentForm')?.addEventListener('submit',async e=>{e.preventDefault();const inp=document.getElementById('p2CommentText'),txt=inp.value.trim();if(!txt)return;const {error}=await sbClient.rpc('add_player_file_comment',{p_player_id:player.id,p_comment:txt});if(error){alert(error.message);return}inp.value='';load()});return}
 if(tab==='history'){const events=[...vs.map(v=>({date:v.occurred_at||v.created_at,title:v.event_name,sub:localizedStoredPhase(v.phase_name),kind:'violation'})),...ss.map(s=>({date:s.created_at,title:p2t('stage')+' '+s.level+' · '+v2LevelLabel(Number(s.level)),sub:s.completed?p2t('completed'):p2t('pending'),kind:'action'}))].filter(x=>x.date).sort((a,b)=>new Date(b.date)-new Date(a.date));body.innerHTML='<div class="p2-history">'+(events.length?events.map(x=>'<div class="p2-history-row"><div class="p2-history-dot '+x.kind+'"></div><div><b>'+v2esc(x.title||'–')+'</b><small>'+v2esc(x.sub||'')+'</small></div><time>'+v2esc(v2date(x.date))+'</time></div>').join(''):'<div class="p2-empty">–</div>')+'</div>';return}}
function renderPlayerDetailV2(name){p2ProfileShell(name,p2CurrentTab||'overview');p2RenderProfileTab(name,p2CurrentTab||'overview')}

const p2PrevSetView=setView;
setView=function(view){
  if(view==='players')p2CurrentPlayer=null;
  else if(view!=='players')p2CurrentPlayer=null;
  return p2PrevSetView(view);
};
const p2PrevDashboard=renderDashboard;
renderDashboard=function(){
  p2SetTopbar(state?.alliance||'NAP Event Tracker');
  return p2PrevDashboard();
};

const p2PreviousRenderPlayerDetail=renderPlayerDetail;renderPlayerDetail=function(name){return renderPlayerDetailV2(name)};
const p2PreviousRender=render;render=function(){if(state?.view==='players'&&!p2CurrentPlayer)return renderPlayersV2();return p2PreviousRender()};

})();