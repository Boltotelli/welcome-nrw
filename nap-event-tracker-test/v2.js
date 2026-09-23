
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
  document.documentElement.dataset.v2Theme=next;localStorage.setItem('nap-v2-theme',next);v2ThemeIcon();
}

function v2MakeNavButton(view,icon,label,extra='v2-desktop-extra'){
  const b=document.createElement('button');b.type='button';b.className='nav-btn '+extra;b.dataset.view=view;b.innerHTML='<span>'+icon+'</span><small>'+v2esc(label)+'</small>';
  b.addEventListener('click',()=>{if(view==='v2more'){v2ToggleMore();return}setView(view)});
  return b;
}
function v2DecorateShell(){
  document.documentElement.dataset.v2Theme=localStorage.getItem('nap-v2-theme')||'dark';
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
})();