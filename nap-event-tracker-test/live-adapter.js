(()=>{'use strict';
if(window.NAP2_LIVE_ADAPTER)return;window.NAP2_LIVE_ADAPTER=true;
const C={u:'https://bdzlgirowutasrsycjfj.supabase.co',k:'sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL',s:'nap_v4_supabase_session'};
const S={a:null,profile:null,p:[],v:[],x:[],e:[],o:[],t:[],bans:[],spend:[],settings:null,avatars:{},laws:[],lawCases:[],lawEvidence:[],performance:null,crown:null,activity:[],eventOptions:[],features:null,law9:null};
let ses=null;try{ses=JSON.parse(localStorage.getItem(C.s)||'null')}catch{}
const L=()=>window.currentLang||document.querySelector('#languagePicker')?.value||'de';
const T={de:{login:'Anmelden',alliance:'Allianz',password:'Passwort',hint:'Ein zentraler Login pro Allianz. Private Daten bleiben innerhalb der eigenen Allianz.',fail:'Login fehlgeschlagen.',logout:'Abmelden',live:'LIVE DATEN',open:'Öffnen',contact:'Kontaktiert',r1:'R1 umgesetzt',nap:'24h NAP OUT aktivieren',none:'Keine Einträge.',actions:'offen',over:'überfällig',left:'verbleibend'},en:{login:'Sign in',alliance:'Alliance',password:'Password',hint:'One central login per alliance. Private data stays within your alliance.',fail:'Login failed.',logout:'Sign out',live:'LIVE DATA',open:'Open',contact:'Contacted',r1:'R1 implemented',nap:'Activate 24h NAP OUT',none:'No entries.',actions:'open',over:'overdue',left:'remaining'},fr:{login:'Connexion',alliance:'Alliance',password:'Mot de passe',hint:'Un login central par alliance. Les données privées restent dans votre alliance.',fail:'Échec de connexion.',logout:'Déconnexion',live:'DONNÉES LIVE',open:'Ouvrir',contact:'Contacté',r1:'R1 appliqué',nap:'Activer NAP OUT 24 h',none:'Aucune entrée.',actions:'ouvert',over:'en retard',left:'restant'},es:{login:'Iniciar sesión',alliance:'Alianza',password:'Contraseña',hint:'Un login central por alianza. Los datos privados permanecen en tu alianza.',fail:'Error de inicio de sesión.',logout:'Cerrar sesión',live:'DATOS LIVE',open:'Abrir',contact:'Contactado',r1:'R1 aplicado',nap:'Activar NAP OUT 24 h',none:'No hay entradas.',actions:'abiertas',over:'vencido',left:'restante'}};
const t=k=>(T[L()]||T.de)[k]||k, E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const loc=()=>({de:'de-DE',en:'en-US',fr:'fr-FR',es:'es-ES'}[L()]||'de-DE');
const N=n=>Number(n||0).toLocaleString(loc()), D=x=>x?new Date(x).toLocaleString(loc(),{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'–';
function dur(ms){ms=Math.max(0,ms||0);return Math.floor(ms/3600000)+'h '+String(Math.floor(ms%3600000/60000)).padStart(2,'0')+'m'}
function save(s){ses=s;try{s?localStorage.setItem(C.s,JSON.stringify(s)):localStorage.removeItem(C.s)}catch{}}
async function q(url,opt={}){const r=await fetch(url,opt),z=await r.text();let d;try{d=z?JSON.parse(z):null}catch{d=z}if(!r.ok)throw Error(d?.message||d?.error_description||d?.error||z||('HTTP '+r.status));return d}
async function token(){if(!ses)return null;if(ses.expires_at&&ses.expires_at<Math.floor(Date.now()/1000)+20&&ses.refresh_token){try{const d=await q(C.u+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:C.k,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:ses.refresh_token})});save({...d,expires_at:Math.floor(Date.now()/1000)+(d.expires_in||3600)})}catch{save(null)}}return ses?.access_token||null}
async function h(json=false){const a=await token();return {apikey:C.k,...(a?{Authorization:'Bearer '+a}:{}),...(json?{'Content-Type':'application/json'}:{})}}
async function tab(n,s=''){return q(C.u+'/rest/v1/'+n+(s?'?'+s:''),{headers:await h()})}
async function rpc(n,b={}){return q(C.u+'/rest/v1/rpc/'+n,{method:'POST',headers:await h(true),body:JSON.stringify(b)})}
async function upd(n,id,b){return q(C.u+'/rest/v1/'+n+'?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{...(await h(true)),Prefer:'return=minimal'},body:JSON.stringify(b)})}
function css(){const s=document.createElement('style');s.textContent=`body.n2lock .app{filter:blur(5px);pointer-events:none}.n2login{position:fixed;inset:0;z-index:999;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(16px);display:grid;place-items:center;padding:18px}.n2login[hidden]{display:none}.n2box{width:min(420px,100%);padding:24px;border:1px solid var(--line);border-radius:22px;background:var(--panel);box-shadow:var(--shadow)}.n2box h2{margin:5px 0}.n2box p{color:var(--muted);font-size:11px}.n2grid{display:grid;gap:10px;margin-top:16px}.n2grid label{display:grid;gap:5px;font-size:10px;color:var(--muted);font-weight:800}.n2grid input,.n2grid select{min-height:42px;border:1px solid var(--line);border-radius:11px;background:var(--panel-2);color:var(--text);padding:9px 11px}.n2err{min-height:16px;color:var(--red);font-size:10px}.n2live{font-size:8px;padding:4px 7px;border-radius:999px;background:var(--green);color:#08140d;font-weight:900}.n2empty{padding:18px;text-align:center;color:var(--muted);font-size:10px}.user-pill{cursor:pointer}@media(min-width:801px){.sidebar:hover{--sidebar:var(--sidebar-open)}.sidebar:hover~.shell{margin-left:var(--sidebar-open)}.sidebar:hover .brandtext,.sidebar:hover .nav-label{opacity:1;transform:none}.sidebar:hover .nav-section,.sidebar:hover .concept{opacity:.9}}`;document.head.appendChild(s)}
function login(){const d=document.createElement('div');d.id='n2login';d.className='n2login';d.innerHTML=`<div class="n2box"><div class="kicker">NAP Event Tracker 2.0 · TEST</div><h2>Kingdom 1044</h2><p>${E(t('hint'))}</p><form class="n2grid" id="n2form"><label>${E(t('alliance'))}<select id="n2a"><option>NRW</option><option>THM</option><option>NWO</option><option>NwO</option><option>CWR</option><option>PxR</option></select></label><label>${E(t('password'))}<input id="n2p" type="password" required></label><div id="n2e" class="n2err"></div><button class="btn primary">${E(t('login'))}</button></form></div>`;document.body.appendChild(d);document.querySelector('#n2form').onsubmit=async e=>{e.preventDefault();const a=n2a.value,p=n2p.value;try{const z=await q(C.u+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:C.k,'Content-Type':'application/json'},body:JSON.stringify({email:a.toLowerCase()+'@nap-tracker.invalid',password:p})});save({...z,expires_at:Math.floor(Date.now()/1000)+(z.expires_in||3600)});await enter(a)}catch(x){n2e.textContent=t('fail')+' '+x.message}}}
function active(v){return !v.expires_at||new Date(v.expires_at)>new Date()}
function p(name){return S.p.find(x=>(x.name||x.player_name)===name)||{}}
function vv(name){return S.v.filter(x=>x.player_name===name)}
function ss(name){return S.x.filter(x=>x.player_name===name)}
function level(name){const n=vv(name).filter(active).length,s=ss(name).find(x=>Number(x.level)===4?!x.started_at:!x.completed);return Math.min(4,Math.max(n,Number(s?.level||0)))}
function act(name){return ss(name).filter(x=>{if(Number(x.level)===1){const v=S.v.find(v=>v.id===x.violation_id);return v&&!v.contacted}if(Number(x.level)===4)return !x.started_at;return !x.completed}).sort((a,b)=>Number(b.level)-Number(a.level))[0]||null}
function actions(){return [...new Set(S.v.filter(active).map(v=>v.player_name))].map(name=>{const l=level(name),s=act(name);if(l===1){const v=vv(name).find(v=>active(v)&&!v.contacted);return v?{name,l,v,s}:null}return s?{name,l,v:S.v.find(v=>v.id===s.violation_id),s}:null}).filter(Boolean)}
function dl(a){const z=new Date((a.s||a.v)?.created_at||(a.v?.occurred_at)||0).getTime()+86400000-Date.now();return dur(Math.abs(z))+' '+t(z<0?'over':'left')}
function renderHome(){document.querySelectorAll('[data-current-alliance]').forEach(x=>x.textContent=S.a);const A=actions(),k=document.querySelectorAll('#view-home .home-kpis .stat-value');if(k[0])k[0].textContent=A.length;if(k[1])k[1].textContent=S.o.length;if(k[2])k[2].textContent=S.e.length;if(k[3])k[3].textContent=S.t.length;homeActionCountBadge.textContent=A.length+' '+t('actions');const box=document.querySelector('#view-home .home-main-grid > .stack:first-child .card:first-child .card-body');if(box)box.innerHTML=A.length?A.map(a=>{const P=p(a.name),lab=a.l===1?'Stufe 1 · Kontakt':a.l===2?'Stufe 2 · R1':a.l===3?'Stufe 3 · 24h NAP OUT':'Stufe 4 · Extended',b=a.l===1?`<button class="btn small primary n2act" data-k="contact" data-id="${E(a.v.id)}">${E(t('contact'))}</button>`:a.l===2?`<button class="btn small primary n2act" data-k="r1" data-id="${E(a.s.id)}">${E(t('r1'))}</button>`:a.l===3?`<button class="btn small primary n2act" data-k="nap" data-id="${E(a.s.id)}">${E(t('nap'))}</button>`:'';return `<div class="action-item"><div><div class="player-line"><div class="player-avatar">${E(a.name[0])}</div><div><div class="player-name">${E(a.name)}</div><div class="player-id">ID ${E(P.game_id||'–')} · ${E(S.a)}</div></div></div></div><div class="action-right"><span class="pill gold">${E(lab)}</span><span class="deadline">${E(dl(a))}</span><div class="home-action-buttons">${b}<button class="mini-link n2open" data-p="${E(a.name)}">${E(t('open'))}</button></div></div></div>`}).join(''):`<div class="n2empty">✓ ${E(t('none'))}</div>`;const tb=document.querySelector('#view-home .home-main-grid > .stack:first-child .card:nth-child(2) tbody');if(tb)tb.innerHTML=S.v.slice(0,8).map(v=>`<tr><td><b>${E(v.player_name)}</b><br><span class="muted tiny">${E(S.a)}</span></td><td>${E(v.event_name||'')} · ${E(v.phase_name||'')}</td><td>${N(v.score)}</td><td>${v.target_value?N(Number(v.target_value)*3):'–'}</td><td><span class="pill">${level(v.player_name)}</span></td><td>${v.contacted?'✓':'–'}</td></tr>`).join('')||`<tr><td colspan="6">${E(t('none'))}</td></tr>`;const tr=document.querySelector('#homeTransfers');if(tr)tr.innerHTML=S.t.length?S.t.map(x=>`<div class="transfer-card"><div class="transfer-main"><div class="player-line"><div class="player-avatar">${E((x.player_name||'?')[0])}</div><div><b>${E(x.player_name||'–')}</b><div class="muted tiny">ID ${E(x.game_id||'–')}</div></div></div><div class="transfer-route"><span class="pill">${E(x.from_alliance||'POOL')}</span><span>→</span><span class="pill blue">${E(x.to_alliance||'POOL')}</span></div></div><div class="muted small">${E(D(x.detected_since))}</div></div>`).join(''):`<div class="n2empty">${E(t('none'))}</div>`;document.querySelectorAll('.n2act').forEach(b=>b.onclick=()=>doAct(b.dataset.k,b.dataset.id));document.querySelectorAll('.n2open').forEach(b=>b.onclick=()=>openProfile(b.dataset.p))}
function renderPlayers(){const g=document.querySelector('#playerGrid');if(!g)return;g.innerHTML=S.p.map(P=>{const name=P.name||P.player_name||'',V=vv(name),l=level(name),att=V.some(v=>v.kind==='swordland'||/swordland|trialliance|triforce/i.test(String(v.event_name||''))),last=V[0],A=act(name);let val=l===1?(V.some(v=>active(v)&&!v.contacted)?'offen':'✓'):l===2?(A?dl({s:A}):'–'):l===3?(A?.end_at?dur(new Date(A.end_at)-Date.now()):'offen'):'OK';return `<div class="player-card" data-p="${E(name)}" data-has-entry="${V.length||ss(name).length?'1':'0'}" data-attendance="${att?'1':'0'}" data-search="${E((name+' '+(P.game_id||'')).toLowerCase())}"><div class="player-card-top"><div class="player-meta"><div class="player-avatar">${E((name[0]||'?').toUpperCase())}</div><div><div class="player-name">${E(name)}</div><div class="player-id">${E(P.game_id||'–')}</div></div></div><span class="pill">${E(S.a)}</span></div><div class="metric-row"><div class="metric"><b>${V.length}</b><span>Verstöße</span></div><div class="metric"><b>${l}</b><span>Stufe</span></div><div class="metric"><b>${E(val)}</b><span>Status</span></div></div><div class="player-card-foot">${att?'<span class="pill gold">Swordland / TriAlliance</span>':'<span></span>'}<span class="muted tiny">${last?E(D(last.occurred_at)):'–'}</span></div></div>`}).join('');g.querySelectorAll('[data-p]').forEach(c=>c.onclick=()=>openProfile(c.dataset.p));if(typeof applyPlayerFilters==='function')applyPlayerFilters()}
function openProfile(name){const P=p(name),V=vv(name),X=ss(name),l=level(name),view=document.querySelector('#view-profile');if(!view)return;view.querySelector('.profile-name').textContent=name;view.querySelector('.profile-main .profile-avatar span').textContent=(name[0]||'?').toUpperCase();view.querySelector('.profile-main .muted.small').innerHTML=`Player ID ${E(P.game_id||'–')} · <span class="pill">${E(S.a)}</span> · ${E((P.languages||[]).join(' / ')||'–')}`;const h=view.querySelector('[data-profile-panel="violations"] tbody');if(h)h.innerHTML=V.map(v=>`<tr><td>${E(D(v.occurred_at))}</td><td>${E(v.event_name||'')} · ${E(v.phase_name||'')}</td><td>${N(v.score)}</td><td>${v.target_value?N(Number(v.target_value)*3):'–'}</td><td>${E(v.source_type||'manual')}</td><td>–</td></tr>`).join('');setView('profile');if(typeof setProfileTab==='function')setProfileTab('violations')}
async function doAct(k,id){if(k==='contact')await upd('violations',id,{contacted:true,contacted_at:new Date().toISOString()});else{if(k==='nap'&&!confirm('24h NAP OUT aktivieren?'))return;await upd('sanctions',id,{completed:true})}await load();renderHome();renderPlayers()}
function decorate(){document.querySelector('.alliance-badge').innerHTML='<span class="alliance-dot"></span> '+E(S.a);document.querySelectorAll('[data-current-alliance]').forEach(x=>x.textContent=S.a);const u=document.querySelector('.user-pill');u.innerHTML='<span class="avatar">'+E(S.a[0])+'</span> '+E(S.a)+' <span class="n2live">'+E(t('live'))+'</span>';u.title=t('logout');u.onclick=()=>{if(confirm(t('logout')+'?')){save(null);location.reload()}}}
async function load(){const a=encodeURIComponent(S.a);const [p1,v,x,e,o,tr,bans,spend,settings]=await Promise.all([tab('players','select=*&alliance_code=eq.'+a+'&order=name.asc'),tab('violations','select=*&alliance_code=eq.'+a+'&order=occurred_at.desc'),tab('sanctions','select=*&alliance_code=eq.'+a+'&order=created_at.desc'),rpc('get_public_nap_exclusions',{}),rpc('get_nap_overdue_action_notifications',{}),rpc('get_my_roster_transfer_candidates',{}),tab('nap_bans','select=*&active=eq.true&order=created_at.desc').catch(()=>[]),tab('nap_spending_exemptions','select=*&order=created_at.desc').catch(()=>[]),tab('alliance_settings','select=*&alliance_code=eq.'+a+'&limit=1').catch(()=>[])]);S.p=(p1||[]).filter(r=>r.alliance_code===S.a);S.v=(v||[]).filter(r=>r.alliance_code===S.a);S.x=(x||[]).filter(r=>r.alliance_code===S.a);S.e=e||[];S.o=o||[];S.t=(tr||[]).filter(r=>r.from_alliance===S.a||r.to_alliance===S.a);S.bans=bans||[];S.spend=spend||[];S.settings=settings?.[0]||null;await loadAvatars().catch(()=>{})}
async function enter(expected){const P=await tab('profiles','select=alliance_code,can_manage_bans,is_admin&limit=1'),prof=P?.[0]||null,a=prof?.alliance_code;if(!a)throw Error('Account incomplete');if(expected&&expected!==a)throw Error('Wrong alliance');S.a=a;S.profile=prof;await load();n2login.hidden=true;document.body.classList.remove('n2lock');decorate();renderHome();renderPlayers();if(typeof applyTranslations==='function')applyTranslations()}
async function boot(){css();login();document.body.classList.add('n2lock');if(!await token())return;try{await enter()}catch{save(null)}}
setTimeout(boot,0);document.querySelector('#languagePicker')?.addEventListener('change',()=>setTimeout(()=>{if(S.a){decorate();renderHome();renderPlayers()}},0));

/* === LIVE HELPERS V2 === */
const PHASES2={
 'Strongest Governor':[['sg1','Day 1',333000],['sg2','Day 2',312000],['sg3','Day 3',362000],['sg4','Day 4',250000],['sg5','Day 5',296000],['sg6','Day 6',380000],['sg7','Day 7',345000]],
 'Alliance Brawl':[['b1','Day 1',125000],['b2','Day 2',125000],['b3','Day 3',125000],['b4','Day 4',125000],['b5','Day 5',187500],['b6','Day 6',187500]],
 'Officer Project':[['op1','Charms',310000],['op2','Forgehammers',453000]],
 'Armament Competition':[['ac1','Phase 1',20000],['ac2','Truegold',38000]],
 'Swordland Showdown':[['sword','Attendance',null]],
 'Tri-Alliance Clash':[['tri','Attendance',null]]
};
async function ins(n,b){return q(C.u+'/rest/v1/'+n,{method:'POST',headers:{...(await h(true)),Prefer:'return=representation'},body:JSON.stringify(b)})}
function avatarHtml(P,cls){
 const id=String(P?.game_id||P?.player_game_id||''),u=S.avatars?.[id],name=P?.name||P?.player_name||'?';
 cls=cls||'player-avatar';
 return u?'<div class="'+cls+' live-avatar"><img src="'+E(u)+'" alt=""></div>':'<div class="'+cls+'">'+E((name[0]||'?').toUpperCase())+'</div>';
}
async function loadAvatars(){
 const ids=[...new Set((S.p||[]).map(x=>String(x.game_id||'')).filter(x=>/^\\d{5,20}$/.test(x)))];
 for(let i=0;i<ids.length;i+=20){
   try{
     const z=await q(C.u+'/functions/v1/kingshot-data?player_ids='+encodeURIComponent(ids.slice(i,i+20).join(',')),{headers:{apikey:C.k}});
     for(const p of z?.players||[])if(p?.playerId&&p?.avatarUrl)S.avatars[String(p.playerId)]=p.avatarUrl;
   }catch(e){console.warn('avatar load',e)}
 }
}
function addLiveCss(){
 if(document.getElementById('n2LiveCss'))return;
 const s=document.createElement('style');s.id='n2LiveCss';s.textContent=
 '.live-avatar{overflow:hidden}.live-avatar img{width:100%;height:100%;object-fit:cover;display:block}'+
 '.live-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px;padding:5px;background:var(--panel);border:1px solid var(--line);border-radius:14px;width:max-content;max-width:100%}'+
 '.live-tab{border:0;background:transparent;color:var(--muted);font:inherit;font-weight:850;font-size:10px;padding:8px 12px;border-radius:9px;cursor:pointer}.live-tab.active{background:var(--panel-3);color:var(--text);box-shadow:inset 0 0 0 1px var(--line)}'+
 '.live-panel-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:14px;align-items:start}'+
 '.live-form{display:grid;gap:10px}.live-form label{display:grid;gap:5px;color:var(--muted);font-size:9px;font-weight:800}.live-form input,.live-form select,.live-form textarea{width:100%;border:1px solid var(--line);border-radius:10px;background:var(--panel-2);color:var(--text);padding:9px 10px;min-height:38px}.live-form textarea{min-height:84px;resize:vertical}'+
 '.live-form-row{display:grid;grid-template-columns:1fr 1fr;gap:9px}.live-note{padding:10px 11px;border:1px dashed var(--line);border-radius:11px;color:var(--muted);font-size:9px;line-height:1.5}'+
 '.live-import-frame{width:100%;min-height:690px;border:1px solid var(--line);border-radius:14px;background:var(--panel-2)}'+
 '.live-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:13px}.live-stat{padding:12px;border:1px solid var(--line);border-radius:13px;background:var(--panel)}.live-stat b{font-size:20px;display:block}.live-stat small{color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.06em}'+
 '.live-list{display:grid;gap:7px}.live-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;border:1px solid var(--line);border-radius:11px;background:var(--panel-2)}.live-row small{display:block;color:var(--muted);font-size:8px;margin-top:3px}'+
 '.live-empty-state{padding:24px;text-align:center;border:1px dashed var(--line);border-radius:13px;color:var(--muted);font-size:10px;background:var(--panel)}'+
 '.live-status{font-size:9px;color:var(--muted);min-height:16px}'+
 '@media(max-width:900px){.live-panel-grid{grid-template-columns:1fr}.live-stat-grid{grid-template-columns:repeat(2,1fr)}.live-form-row{grid-template-columns:1fr}.live-import-frame{min-height:580px}}';
 document.head.appendChild(s);
}
function phaseMultiplier2(event,phase,sourceId){return event==='Strongest Governor'&&String(sourceId)==='2304001'&&(phase==='sg2'||phase==='sg3')?4:3}
function targetFor2(event,phase){const cfg=S.settings?.event_targets||{},p=(PHASES2[event]||[]).find(x=>x[0]===phase);return cfg[phase]??p?.[2]??null}
function neutralizeMocks(){
 const concept=document.querySelector('.concept');if(concept)concept.textContent='NAP Event Tracker 2.0 · TEST';
}


/* === ADD VIEW LIVE V2 === */
function renderAddLive(){
 const v=document.getElementById('view-add');if(!v)return;
 v.innerHTML='<div class="hero"><div><div class="kicker">2.0 · LIVE</div><h1>Verstoß erfassen</h1><p>ScreenRecording und manuelle Eingabe sind getrennt, nutzen aber dieselben aktuellen Eventfreigaben und Regeln.</p></div></div>'+
 '<div class="live-tabs"><button class="live-tab active" data-addmode="screen">ScreenRecording</button><button class="live-tab" data-addmode="manual">Manuell</button></div>'+
 '<div id="addScreenPanel"><div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">ScreenRecording</div><div class="card-sub">Event auswählen, anschließend Video importieren und Treffer prüfen.</div></div></div><div class="card-body live-form">'+
 '<label>Event<select id="liveScreenEvent"><option value="">Verfügbare Events werden geladen …</option></select></label>'+
 '<div class="live-note">Der bestehende ScreenRecording-Importer wird in die 2.0 eingebettet. Serverweites 1044-Roster-Matching und Evidence bleiben erhalten.</div>'+
 '<button id="liveLoadImporter" class="btn primary" type="button">Importer laden</button><div id="liveImporterStatus" class="live-status"></div></div></section>'+
 '<section class="card"><div class="card-head"><div><div class="card-title">Import-Status</div><div class="card-sub">Nach dem Speichern werden die Tracker-Daten automatisch neu geladen.</div></div></div><div class="card-body"><div class="live-empty-state">Noch kein ScreenRecording geöffnet.</div></div></section></div><div id="liveImporterHost" style="margin-top:14px"></div></div>'+
 '<div id="addManualPanel" hidden><div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">Manuell eintragen</div><div class="card-sub">Nur aktuell freigegebene Events.</div></div></div><div class="card-body"><form id="liveManualForm" class="live-form">'+
 '<label>Spieler<select id="liveManualPlayer"></select></label><label>Event<select id="liveManualEvent"></select></label><label>Phase<select id="liveManualPhase"></select></label>'+
 '<div class="live-form-row"><label>Punkte<input id="liveManualScore" inputmode="numeric"></label><label>Zeitpunkt<input id="liveManualOccurred" type="datetime-local"></label></div>'+
 '<label>Notiz<textarea id="liveManualNote"></textarea></label><div id="liveManualPreview" class="live-note"></div>'+
 '<button class="btn primary" type="submit">Verstoß speichern</button><div id="liveManualStatus" class="live-status"></div></form></div></section>'+
 '<section class="card"><div class="card-head"><div><div class="card-title">Regelprüfung</div><div class="card-sub">Grenze aus den Allianz-Einstellungen.</div></div></div><div class="card-body"><div id="liveRuleCard" class="live-empty-state">Event und Phase auswählen.</div></div></section></div></div>';
 v.querySelectorAll('[data-addmode]').forEach(b=>b.onclick=()=>{v.querySelectorAll('[data-addmode]').forEach(x=>x.classList.toggle('active',x===b));document.getElementById('addScreenPanel').hidden=b.dataset.addmode!=='screen';document.getElementById('addManualPanel').hidden=b.dataset.addmode!=='manual'});
 setupAddData2();
}
async function setupAddData2(){
 let opts=[];try{opts=await rpc('get_open_event_entry_options',{})||[]}catch(e){console.warn(e)}
 S.eventOptions=opts;
 const eventNames=[...new Set(opts.map(x=>x.event_name).filter(Boolean))];
 const options=eventNames.length?eventNames.map(x=>'<option value="'+E(x)+'">'+E(x)+'</option>').join(''):'<option value="">Kein Event freigegeben</option>';
 const se=document.getElementById('liveScreenEvent'),me=document.getElementById('liveManualEvent');if(se)se.innerHTML=options;if(me)me.innerHTML=options;
 const player=document.getElementById('liveManualPlayer');if(player)player.innerHTML=S.p.map(p=>'<option value="'+E(p.name||p.player_name)+'">'+E(p.name||p.player_name)+' · '+E(p.game_id||'–')+'</option>').join('');
 const occ=document.getElementById('liveManualOccurred');if(occ){const d=new Date(Date.now()-new Date().getTimezoneOffset()*60000);occ.value=d.toISOString().slice(0,16)}
 function syncPhases(){
   const event=me?.value||'',ph=document.getElementById('liveManualPhase'),source=S.eventOptions.find(x=>x.event_name===event)?.source_event_id,phases=PHASES2[event]||[['general','General',null]];
   if(ph)ph.innerHTML=phases.map(x=>'<option value="'+E(x[0])+'">'+E(x[1])+'</option>').join('');
   updateManualPreview2(source);
 }
 me?.addEventListener('change',syncPhases);document.getElementById('liveManualPhase')?.addEventListener('change',()=>updateManualPreview2(S.eventOptions.find(x=>x.event_name===me?.value)?.source_event_id));document.getElementById('liveManualScore')?.addEventListener('input',()=>updateManualPreview2(S.eventOptions.find(x=>x.event_name===me?.value)?.source_event_id));
 syncPhases();
 document.getElementById('liveManualForm')?.addEventListener('submit',saveManualViolation2);
 document.getElementById('liveLoadImporter')?.addEventListener('click',loadScreenImporter2);
}
function updateManualPreview2(sourceId){
 const event=document.getElementById('liveManualEvent')?.value||'',phase=document.getElementById('liveManualPhase')?.value||'',score=Number(String(document.getElementById('liveManualScore')?.value||'').replace(/\D/g,'')),target=targetFor2(event,phase),mult=phaseMultiplier2(event,phase,sourceId),limit=target==null?null:Number(target)*mult;
 const text=target==null?event+': Anwesenheits-Sonderfall':'Ziel '+N(target)+' · aktuelle Grenze '+N(limit)+' ('+mult+'×)'+(Number.isFinite(score)&&score>0?' · '+(score>limit?'Verstoß':'kein Verstoß'):'');
 const a=document.getElementById('liveManualPreview'),b=document.getElementById('liveRuleCard');if(a)a.textContent=text;if(b)b.textContent=text;
}
async function saveManualViolation2(e){
 e.preventDefault();const out=document.getElementById('liveManualStatus');out.textContent='Speichere …';
 try{
   const player=document.getElementById('liveManualPlayer').value,event=document.getElementById('liveManualEvent').value,phase=document.getElementById('liveManualPhase').value,note=document.getElementById('liveManualNote').value.trim()||null,occurred=new Date(document.getElementById('liveManualOccurred').value).toISOString(),source=S.eventOptions.find(x=>x.event_name===event)?.source_event_id,target=targetFor2(event,phase),score=Number(String(document.getElementById('liveManualScore').value||'').replace(/\D/g,'')),kind=(event==='Swordland Showdown'||event==='Tri-Alliance Clash')?'swordland':'overspend',mult=phaseMultiplier2(event,phase,source);
   if(kind==='overspend'&&(!Number.isFinite(score)||score<=Number(target||0)*mult))throw Error('Punkte müssen über '+mult+'× Ziel liegen.');
   await rpc('record_violation_fast',{p_player_name:player,p_event_name:event,p_phase_name:phase,p_kind:kind,p_score:kind==='swordland'?0:score,p_target_value:target,p_occurred_at:occurred,p_expiry_days:Number(S.settings?.violation_expiry_days||30),p_note:note});
   out.textContent='✓ Gespeichert';await load();renderHome();renderPlayers();document.getElementById('liveManualScore').value='';
 }catch(err){out.textContent=err.message||String(err)}
}
async function loadScreenImporter2(){
 const host=document.getElementById('liveImporterHost'),status=document.getElementById('liveImporterStatus');if(!host)return;status.textContent='Importer wird geladen …';host.innerHTML='';
 try{
   const r=await fetch(C.u+'/functions/v1/screen-import-standalone-live-v16',{cache:'no-store'});if(!r.ok)throw Error('Importer '+r.status);const html=await r.text();
   const fr=document.createElement('iframe');fr.id='screenImportFrame';fr.className='live-import-frame';fr.srcdoc=html;host.appendChild(fr);
   fr.addEventListener('load',()=>{status.textContent='✓ Importer bereit';try{const sel=fr.contentDocument?.querySelector('#event'),wanted=document.getElementById('liveScreenEvent')?.value;if(sel&&wanted){const opt=[...sel.options].find(o=>String(o.textContent||'').includes(wanted));if(opt){sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}))}}}catch(e){console.warn('screen event sync',e)}});
 }catch(err){status.textContent=err.message||String(err)}
}
window.addEventListener('message',async e=>{if(e.data?.type==='nap-screen-import-saved'){await load();renderHome();renderPlayers()}});


/* === NAP CENTER LIVE V2 === */
let liveNapTab='overview';
function napRow2(title,sub,right,cls){
 return '<div class="live-row"><div><b>'+E(title)+'</b><small>'+E(sub||'')+'</small></div><div>'+ (right||'') +'</div></div>';
}
function renderNapLive(){
 const v=document.getElementById('view-nap');if(!v)return;
 const now=Date.now(),activeSpend=(S.spend||[]).filter(x=>!x.ended_at&&(!x.ends_at||new Date(x.ends_at).getTime()>now));
 const tabs=[['overview','Übersicht'],['alerts','24h Meldungen'],['exclusions','Exclusions'],['bans','NAP Bans'],['spending','Spending Exclusions']];
 v.innerHTML='<div class="hero"><div><div class="kicker">NAP CENTER · LIVE</div><h1>NAP-weite Transparenz, private Details getrennt.</h1><p>Exclusions, Bans, Spending Exclusions und überfällige Maßnahmen an einem Ort.</p></div></div>'+
 '<div class="live-tabs">'+tabs.map(x=>'<button class="live-tab '+(liveNapTab===x[0]?'active':'')+'" data-live-naptab="'+x[0]+'">'+x[1]+'</button>').join('')+'</div><div id="liveNapBody"></div>';
 v.querySelectorAll('[data-live-naptab]').forEach(b=>b.onclick=()=>{liveNapTab=b.dataset.liveNaptab;renderNapLive()});
 const body=document.getElementById('liveNapBody');
 if(liveNapTab==='overview'){
   body.innerHTML='<div class="live-stat-grid">'+
    '<div class="live-stat"><b>'+S.o.length+'</b><small>24h überfällig</small></div>'+
    '<div class="live-stat"><b>'+S.e.length+'</b><small>aktive NAP OUT</small></div>'+
    '<div class="live-stat"><b>'+S.bans.length+'</b><small>aktive Bans</small></div>'+
    '<div class="live-stat"><b>'+activeSpend.length+'</b><small>Spending Exclusions</small></div></div>'+
    '<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">NAP-Benachrichtigungen</div><div class="card-sub">Maßnahmen anderer NAP-Allianzen, die nach 24h nicht umgesetzt wurden.</div></div></div><div class="card-body live-list">'+
    (S.o.length?S.o.slice(0,8).map(x=>napRow2((x.alliance_code||'')+' · '+(x.player_name||'–'),'Stufe '+x.level+' · seit '+dur(Number(x.overdue_seconds||0)*1000),'<span class="pill red">überfällig</span>')).join(''):'<div class="live-empty-state">Keine überfälligen NAP-Maßnahmen.</div>')+
    '</div></section><section class="card"><div class="card-head"><div><div class="card-title">Aktive NAP OUTs</div><div class="card-sub">NAP-weit sichtbare Ausschlüsse.</div></div></div><div class="card-body live-list">'+
    (S.e.length?S.e.slice(0,8).map(x=>napRow2(x.player_name,(x.alliance_code||'')+' · Stufe '+x.level+(x.end_at?' · Ende '+D(x.end_at):''),'<span class="pill red">NAP OUT</span>')).join(''):'<div class="live-empty-state">Keine aktive NAP Exclusion.</div>')+
    '</div></section></div>';
   return;
 }
 if(liveNapTab==='alerts'){
   body.innerHTML='<section class="card"><div class="card-head"><div><div class="card-title">Überfällige Maßnahmen</div><div class="card-sub">Nur notwendige NAP-Informationen, keine privaten Verstoßdetails.</div></div><span class="pill red">'+S.o.length+'</span></div><div class="card-body live-list">'+
   (S.o.length?S.o.map(x=>napRow2((x.alliance_code||'')+' · '+(x.player_name||'–'),'Stufe '+x.level+' · erstellt '+D(x.action_created_at),'<span class="pill red">'+E(dur(Number(x.overdue_seconds||0)*1000))+'</span>')).join(''):'<div class="live-empty-state">Keine überfälligen Maßnahmen.</div>')+'</div></section>';return;
 }
 if(liveNapTab==='exclusions'){
   body.innerHTML='<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">Aktive Exclusions</div></div><span class="pill red">'+S.e.length+'</span></div><div class="card-body live-list">'+
   (S.e.length?S.e.map(x=>napRow2(x.player_name,(x.alliance_code||'')+' · Stufe '+x.level,'<span class="pill">'+(x.end_at?E(D(x.end_at)):'∞')+'</span>')).join(''):'<div class="live-empty-state">Keine aktive Exclusion.</div>')+
   '</div></section><section class="card"><div class="card-head"><div><div class="card-title">Manuelle Exclusion</div><div class="card-sub">Wie in 1.0: zusätzliche NAP-Exclusion anlegen.</div></div></div><div class="card-body"><form id="liveExclusionForm" class="live-form"><label>Spieler<input id="liveExPlayer" required></label><div class="live-form-row"><label>Stufe<select id="liveExLevel"><option value="3">3 · 24h</option><option value="4">4 · Extended</option></select></label><label>Ende<input id="liveExEnd" type="datetime-local"></label></div><button class="btn primary" type="submit">Exclusion speichern</button><div id="liveExStatus" class="live-status"></div></form></div></section></div>';
   document.getElementById('liveExclusionForm').onsubmit=saveManualExclusion2;return;
 }
 if(liveNapTab==='bans'){
   const can=!!S.profile?.can_manage_bans;
   body.innerHTML='<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">NAP Bans</div><div class="card-sub">Aktive permanente NAP-Bans.</div></div><span class="pill red">'+S.bans.length+'</span></div><div class="card-body live-list">'+
   (S.bans.length?S.bans.map(x=>napRow2(x.player_name,(x.former_alliance||'–')+(x.player_game_id?' · ID '+x.player_game_id:'')+(x.reason?' · '+x.reason:''),can?'<button class="btn small secondary live-end-ban" data-id="'+E(x.id)+'">deaktivieren</button>':'<span class="pill red">BAN</span>')).join(''):'<div class="live-empty-state">Keine aktiven NAP Bans.</div>')+
   '</div></section>'+(can?'<section class="card"><div class="card-head"><div><div class="card-title">Ban hinzufügen</div></div></div><div class="card-body"><form id="liveBanForm" class="live-form"><label>Spieler<input id="liveBanPlayer" required></label><label>Player ID<input id="liveBanId"></label><label>Frühere Allianz<input id="liveBanAlliance"></label><label>Grund<textarea id="liveBanReason" required></textarea></label><button class="btn primary" type="submit">NAP Ban speichern</button><div id="liveBanStatus" class="live-status"></div></form></div></section>':'')+'</div>';
   document.querySelectorAll('.live-end-ban').forEach(b=>b.onclick=()=>endBan2(b.dataset.id));document.getElementById('liveBanForm')?.addEventListener('submit',saveBan2);return;
 }
 body.innerHTML='<section class="card"><div class="card-head"><div><div class="card-title">NAP Spending Exclusions</div><div class="card-sub">Spieler, die für den angegebenen Zeitraum von Spending-Regeln ausgenommen sind.</div></div><span class="pill gold">'+activeSpend.length+'</span></div><div class="card-body live-list">'+
 (S.spend.length?S.spend.map(x=>napRow2(x.player_name,(x.owner_alliance||'')+(x.player_game_id?' · ID '+x.player_game_id:'')+(x.reason?' · '+x.reason:''),'<span class="pill '+(!x.ended_at&&(!x.ends_at||new Date(x.ends_at)>new Date())?'gold':'')+'">'+E(x.ended_at?'beendet':x.ends_at?D(x.ends_at):'aktiv')+'</span>')).join(''):'<div class="live-empty-state">Keine Spending Exclusions vorhanden.</div>')+'</div></section>';
}
async function saveManualExclusion2(e){
 e.preventDefault();const out=document.getElementById('liveExStatus');out.textContent='Speichere …';
 try{const name=document.getElementById('liveExPlayer').value.trim(),level=Number(document.getElementById('liveExLevel').value),end=document.getElementById('liveExEnd').value;await rpc('create_manual_nap_exclusion',{p_player_name:name,p_level:level,p_started_at:new Date().toISOString(),p_end_at:end?new Date(end).toISOString():null});await load();out.textContent='✓ Gespeichert';renderNapLive()}catch(err){out.textContent=err.message||String(err)}
}
async function saveBan2(e){
 e.preventDefault();const out=document.getElementById('liveBanStatus');out.textContent='Speichere …';
 try{await ins('nap_bans',{player_name:document.getElementById('liveBanPlayer').value.trim(),player_game_id:document.getElementById('liveBanId').value.trim()||null,former_alliance:document.getElementById('liveBanAlliance').value.trim()||null,reason:document.getElementById('liveBanReason').value.trim(),active:true});await load();renderNapLive()}catch(err){out.textContent=err.message||String(err)}
}
async function endBan2(id){if(!confirm('NAP Ban deaktivieren?'))return;await upd('nap_bans',id,{active:false,updated_at:new Date().toISOString()});await load();renderNapLive()}

})();