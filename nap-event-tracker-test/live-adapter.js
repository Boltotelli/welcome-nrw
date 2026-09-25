(()=>{'use strict';
if(window.NAP2_LIVE_ADAPTER)return;window.NAP2_LIVE_ADAPTER=true;
const C={u:'https://bdzlgirowutasrsycjfj.supabase.co',k:'sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL',s:'nap_v4_supabase_session'};
let crownAllowed2=false;
const S={a:null,profile:null,p:[],v:[],x:[],e:[],o:[],t:[],bans:[],spend:[],reviews:[],shared:[],settings:null,avatars:{},laws:[],lawCases:[],lawEvidence:[],performance:null,crown:null,activity:[],eventOptions:[],features:null,law9:null,notificationReads:new Set(),syncStatus:null,level4Hosting:[],napStats:[],sgWindow:null,supportTickets:[],supportMessages:[],supportEvidence:[]};
let ses=null;try{ses=JSON.parse(localStorage.getItem(C.s)||'null')}catch{}
const L=()=>window.currentLang||document.querySelector('#languagePicker')?.value||'de';
const T={de:{login:'Anmelden',alliance:'Allianz',password:'Passwort',hint:'Ein zentraler Login pro Allianz. Private Daten bleiben innerhalb der eigenen Allianz.',fail:'Login fehlgeschlagen.',logout:'Abmelden',live:'LIVE DATEN',open:'Öffnen',contact:'Kontaktiert',r1:'R1 umgesetzt',nap:'24h NAP OUT aktivieren',none:'Keine Einträge.',actions:'offen',over:'überfällig',left:'verbleibend',tempTransfer:'Als temporär markieren',rejectTemp:'Ablehnen · temporär',tempTransferQ:'Diesen Wechsel als temporär markieren? Die Spielerakte bleibt in der Heimatallianz; der Hinweis wird 7 Tage ausgeblendet.',rejectTempQ:'Diesen Neuzugang als temporär ablehnen? Die Spielerakte bleibt bei der bisherigen Allianz. Der Hinweis wird 7 Tage ausgeblendet und erscheint erneut, falls der Spieler danach weiterhin bei deiner Allianz geführt wird.'},en:{login:'Sign in',alliance:'Alliance',password:'Password',hint:'One central login per alliance. Private data stays within your alliance.',fail:'Login failed.',logout:'Sign out',live:'LIVE DATA',open:'Open',contact:'Contacted',r1:'R1 implemented',nap:'Activate 24h NAP OUT',none:'No entries.',actions:'open',over:'overdue',left:'remaining',tempTransfer:'Mark as temporary',rejectTemp:'Reject · temporary',tempTransferQ:'Mark this transfer as temporary? The player file stays with the home alliance and the notice is hidden for 7 days.',rejectTempQ:'Reject this incoming player as temporary? The player file stays with the previous alliance. The notice is hidden for 7 days and will appear again if the player is still listed with your alliance afterwards.'},fr:{login:'Connexion',alliance:'Alliance',password:'Mot de passe',hint:'Un login central par alliance. Les données privées restent dans votre alliance.',fail:'Échec de connexion.',logout:'Déconnexion',live:'DONNÉES LIVE',open:'Ouvrir',contact:'Contacté',r1:'R1 appliqué',nap:'Activer NAP OUT 24 h',none:'Aucune entrée.',actions:'ouvert',over:'en retard',left:'restant',tempTransfer:'Marquer temporaire',rejectTemp:'Refuser · temporaire',tempTransferQ:'Marquer ce transfert comme temporaire ? Le dossier reste dans l’alliance d’origine et l’alerte est masquée pendant 7 jours.',rejectTempQ:'Refuser ce joueur entrant comme transfert temporaire ? Le dossier reste dans l’alliance précédente. L’alerte est masquée pendant 7 jours et réapparaît si le joueur est toujours dans votre alliance ensuite.'},es:{login:'Iniciar sesión',alliance:'Alianza',password:'Contraseña',hint:'Un login central por alianza. Los datos privados permanecen en tu alianza.',fail:'Error de inicio de sesión.',logout:'Cerrar sesión',live:'DATOS LIVE',open:'Abrir',contact:'Contactado',r1:'R1 aplicado',nap:'Activar NAP OUT 24 h',none:'No hay entradas.',actions:'abiertas',over:'vencido',left:'restante',tempTransfer:'Marcar temporal',rejectTemp:'Rechazar · temporal',tempTransferQ:'¿Marcar este cambio como temporal? El expediente permanece en la alianza de origen y el aviso se oculta durante 7 días.',rejectTempQ:'¿Rechazar este jugador entrante como temporal? El expediente permanece en la alianza anterior. El aviso se oculta durante 7 días y volverá a aparecer si el jugador sigue en tu alianza después.'}};
const t=k=>(T[L()]||T.de)[k]||k, E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ACTION_WORDS2={
 de:{connectionFail:'Verbindung fehlgeschlagen.',connectionRetry:'Die Daten konnten nicht geladen werden. Deine Sitzung bleibt erhalten.',retry:'Erneut versuchen',accountIncomplete:'Account ist nicht vollständig eingerichtet.',wrongAlliance:'Der Account gehört zu einer anderen Allianz.',endRequired:'Bitte eine Endzeit auswählen.',endFuture:'Bitte eine Endzeit in der Zukunft auswählen.',contactComment:'Optionaler Akten-Kommentar zum Kontakt:',activateNapOut:'24h NAP OUT aktivieren?',endSpending:'Spending Exclusion beenden?',deactivateBan:'NAP Ban deaktivieren?',confirmTransfer:'Diesen Allianzwechsel jetzt bestätigen? Die Spielerakte wird der neuen Allianz zugeordnet.',memberCountCheck:'Mitgliederzahl prüfen.',pointsMustExceed:'Punkte müssen über {mult}× Ziel liegen.',sgNotRunning:'Aktuell läuft kein Strongest Governor.',noPerformance:'Kein Performance-Durchlauf vorhanden.',scoreCheck:'Score prüfen.',kvkRankCheck:'KvK benötigt Serverrang 1–200.',lawImageRule:'Nur PNG/JPEG/WebP, max. 8 MB.',caseIdMissing:'Fall-ID fehlt.',saving:'Speichere …',saved:'✓ Gespeichert',deleting:'Lösche …',loadingMore:'Lade weitere Einträge …',importerMissing:'Importer nicht geladen. Bitte Seite aktualisieren.'},
 en:{connectionFail:'Connection failed.',connectionRetry:'The data could not be loaded. Your session has been kept.',retry:'Try again',accountIncomplete:'The account is not fully configured.',wrongAlliance:'This account belongs to another alliance.',endRequired:'Please select an end time.',endFuture:'Please select an end time in the future.',contactComment:'Optional player-file comment for the contact:',activateNapOut:'Activate 24h NAP OUT?',endSpending:'End Spending Exclusion?',deactivateBan:'Deactivate NAP ban?',confirmTransfer:'Confirm this alliance transfer now? The player file will be assigned to the new alliance.',memberCountCheck:'Check the member count.',pointsMustExceed:'Points must be above {mult}× the target.',sgNotRunning:'No Strongest Governor is currently running.',noPerformance:'No performance occurrence is available.',scoreCheck:'Check the score.',kvkRankCheck:'KvK requires a server rank from 1–200.',lawImageRule:'PNG/JPEG/WebP only, max. 8 MB.',caseIdMissing:'Case ID is missing.',saving:'Saving …',saved:'✓ Saved',deleting:'Deleting …',loadingMore:'Loading more entries …',importerMissing:'Importer is not loaded. Please refresh the page.'},
 fr:{connectionFail:'Échec de la connexion.',connectionRetry:'Les données n’ont pas pu être chargées. Votre session a été conservée.',retry:'Réessayer',accountIncomplete:'Le compte n’est pas entièrement configuré.',wrongAlliance:'Ce compte appartient à une autre alliance.',endRequired:'Veuillez sélectionner une heure de fin.',endFuture:'Veuillez sélectionner une heure de fin future.',contactComment:'Commentaire facultatif dans le dossier du joueur :',activateNapOut:'Activer NAP OUT 24 h ?',endSpending:'Terminer la Spending Exclusion ?',deactivateBan:'Désactiver le ban NAP ?',confirmTransfer:'Confirmer ce changement d’alliance ? Le dossier du joueur sera attribué à la nouvelle alliance.',memberCountCheck:'Vérifiez le nombre de membres.',pointsMustExceed:'Les points doivent dépasser {mult}× la cible.',sgNotRunning:'Aucun Strongest Governor n’est actuellement en cours.',noPerformance:'Aucune session Performance disponible.',scoreCheck:'Vérifiez le score.',kvkRankCheck:'Le KvK exige un rang serveur de 1 à 200.',lawImageRule:'PNG/JPEG/WebP uniquement, max. 8 Mo.',caseIdMissing:'Identifiant du cas manquant.',saving:'Enregistrement …',saved:'✓ Enregistré',deleting:'Suppression …',loadingMore:'Chargement d’autres entrées …',importerMissing:'L’importateur n’est pas chargé. Actualisez la page.'},
 es:{connectionFail:'Error de conexión.',connectionRetry:'No se pudieron cargar los datos. Tu sesión se ha conservado.',retry:'Reintentar',accountIncomplete:'La cuenta no está configurada por completo.',wrongAlliance:'Esta cuenta pertenece a otra alianza.',endRequired:'Selecciona una hora de finalización.',endFuture:'Selecciona una hora de finalización futura.',contactComment:'Comentario opcional en el expediente del jugador:',activateNapOut:'¿Activar NAP OUT de 24 h?',endSpending:'¿Finalizar la Spending Exclusion?',deactivateBan:'¿Desactivar el ban NAP?',confirmTransfer:'¿Confirmar ahora este cambio de alianza? El expediente se asignará a la nueva alianza.',memberCountCheck:'Revisa el número de miembros.',pointsMustExceed:'Los puntos deben superar {mult}× el objetivo.',sgNotRunning:'No hay ningún Strongest Governor en curso.',noPerformance:'No hay una sesión de Performance disponible.',scoreCheck:'Revisa la puntuación.',kvkRankCheck:'KvK requiere un rango del servidor entre 1 y 200.',lawImageRule:'Solo PNG/JPEG/WebP, máx. 8 MB.',caseIdMissing:'Falta el ID del caso.',saving:'Guardando …',saved:'✓ Guardado',deleting:'Eliminando …',loadingMore:'Cargando más entradas …',importerMissing:'El importador no está cargado. Actualiza la página.'}
};
function actionWord2(k,vars={}){
 let s=(ACTION_WORDS2[L()]||ACTION_WORDS2.de)[k]||k;
 for(const [name,value] of Object.entries(vars))s=s.replaceAll('{'+name+'}',String(value));
 return s;
}
function isSessionAuthError2(err){
 const status=Number(err?.status||0),msg=String(err?.message||'').toLowerCase();
 return status===401||(status===400&&/(refresh|token|jwt|session)/.test(msg));
}
const loc=()=>({de:'de-DE',en:'en-US',fr:'fr-FR',es:'es-ES'}[L()]||'de-DE');
const N=n=>Number(n||0).toLocaleString(loc()), D=x=>x?new Date(x).toLocaleString(loc(),{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'–';
function monthYear2(x){if(!x)return '';const d=new Date(x);return Number.isFinite(d.getTime())?d.toLocaleDateString(loc(),{month:'long',year:'numeric'}):''}
function performanceDate2(e){return monthYear2(e?.period_start||e?.period_end)||String(e?.label||'').trim()}
function dur(ms){ms=Math.max(0,ms||0);return Math.floor(ms/3600000)+'h '+String(Math.floor(ms%3600000/60000)).padStart(2,'0')+'m'}
function durLong2(ms){
 const total=Math.max(0,Math.floor(Number(ms||0)/60000)),days=Math.floor(total/1440),
   hours=Math.floor((total%1440)/60),minutes=total%60,lang=L();
 const words={
  de:{d:['Tag','Tage'],h:['Stunde','Stunden'],m:['Minute','Minuten']},
  en:{d:['day','days'],h:['hour','hours'],m:['minute','minutes']},
  fr:{d:['jour','jours'],h:['heure','heures'],m:['minute','minutes']},
  es:{d:['día','días'],h:['hora','horas'],m:['minuto','minutos']}
 }[lang]||{d:['Tag','Tage'],h:['Stunde','Stunden'],m:['Minute','Minuten']};
 const unit=(n,k)=>n+' '+words[k][n===1?0:1];
 return days>0?[unit(days,'d'),unit(hours,'h'),unit(minutes,'m')].join(' '):
   [unit(hours,'h'),unit(minutes,'m')].join(' ');
}
function save(s){ses=s;try{s?localStorage.setItem(C.s,JSON.stringify(s)):localStorage.removeItem(C.s)}catch{}}
async function q(url,opt={}){
 let r;
 try{r=await fetch(url,opt)}
 catch(cause){const err=Error(actionWord2('connectionFail'));err.isNetwork=true;err.cause=cause;throw err}
 const z=await r.text();let d;try{d=z?JSON.parse(z):null}catch{d=z}
 if(!r.ok){const err=Error(d?.message||d?.error_description||d?.error||z||('HTTP '+r.status));err.status=r.status;err.payload=d;throw err}
 return d;
}
async function token(){
 if(!ses)return null;
 if(ses.expires_at&&ses.expires_at<Math.floor(Date.now()/1000)+20&&ses.refresh_token){
  try{
   const d=await q(C.u+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:C.k,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:ses.refresh_token})});
   save({...d,expires_at:Math.floor(Date.now()/1000)+(d.expires_in||3600)});
  }catch(err){
   if(isSessionAuthError2(err)){save(null);return null}
   throw err;
  }
 }
 return ses?.access_token||null;
}
async function h(json=false){const a=await token();return {apikey:C.k,...(a?{Authorization:'Bearer '+a}:{}),...(json?{'Content-Type':'application/json'}:{})}}
async function tab(n,s=''){return q(C.u+'/rest/v1/'+n+(s?'?'+s:''),{headers:await h()})}
async function rpc(n,b={}){return q(C.u+'/rest/v1/rpc/'+n,{method:'POST',headers:await h(true),body:JSON.stringify(b)})}
async function upd(n,id,b){return q(C.u+'/rest/v1/'+n+'?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{...(await h(true)),Prefer:'return=minimal'},body:JSON.stringify(b)})}
function css(){const s=document.createElement('style');s.textContent=`body.n2lock .app{filter:blur(5px);pointer-events:none}.n2login{position:fixed;inset:0;z-index:999;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(16px);display:grid;place-items:center;padding:18px}.n2login[hidden]{display:none}.n2box{width:min(420px,100%);padding:24px;border:1px solid var(--line);border-radius:22px;background:var(--panel);box-shadow:var(--shadow)}.n2box h2{margin:5px 0}.n2box p{color:var(--muted);font-size:11px}.n2grid{display:grid;gap:10px;margin-top:16px}.n2grid label{display:grid;gap:5px;font-size:10px;color:var(--muted);font-weight:800}.n2grid input,.n2grid select{min-height:42px;border:1px solid var(--line);border-radius:11px;background:var(--panel-2);color:var(--text);padding:9px 11px}.n2err{min-height:16px;color:var(--red);font-size:10px}.n2live{font-size:8px;padding:4px 7px;border-radius:999px;background:var(--green);color:#08140d;font-weight:900}.n2empty{padding:18px;text-align:center;color:var(--muted);font-size:10px}.user-pill{cursor:pointer}@media(min-width:801px){.sidebar:hover{--sidebar:var(--sidebar-open)}.sidebar:hover~.shell{margin-left:var(--sidebar-open)}.sidebar:hover .brandtext,.sidebar:hover .nav-label{opacity:1;transform:none}.sidebar:hover .nav-section,.sidebar:hover .concept{opacity:.9}}.home-hero-tools{min-width:220px}.home-sync-status{margin-top:9px;padding:9px 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel-2);display:grid;gap:4px;min-width:220px}.home-sync-status>span,.home-sync-status small{font-size:9px;color:var(--muted);font-weight:800}.home-sync-status b{font-size:11px}.home-sync-meta{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}.home-sync-meta b,.home-sync-meta small{white-space:nowrap}@media(max-width:640px){.home-hero-tools{width:100%;min-width:0}.home-hero-tools .hero-actions{margin-bottom:10px}.home-sync-status{min-width:0;width:100%;margin-top:0;padding:9px 11px;gap:5px}.home-sync-meta{justify-content:space-between;column-gap:12px;row-gap:4px}}.support-thread{display:grid;gap:9px}.support-msg{max-width:min(760px,92%);padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:var(--panel-2);display:grid;gap:5px}.support-msg.alliance{justify-self:end;background:color-mix(in srgb,var(--blue) 8%,var(--panel-2));border-color:color-mix(in srgb,var(--blue) 28%,var(--line))}.support-msg.support{justify-self:start;background:color-mix(in srgb,var(--green) 8%,var(--panel-2));border-color:color-mix(in srgb,var(--green) 28%,var(--line))}.support-msg small{color:var(--muted);font-size:9px}.support-evidence-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.support-evidence-grid a{display:block;width:88px;height:66px;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--panel-3)}.support-evidence-grid img{width:100%;height:100%;object-fit:cover}.support-ticket{margin-bottom:14px}.support-safety-note{border-color:color-mix(in srgb,var(--blue) 30%,var(--line));background:color-mix(in srgb,var(--blue) 6%,var(--panel-2))}`;document.head.appendChild(s)}
function login(){const d=document.createElement('div');d.id='n2login';d.className='n2login';d.innerHTML=`<div class="n2box"><div class="kicker">NAP Event Tracker 2.0 · TEST</div><h2>Kingdom 1044</h2><p>${E(t('hint'))}</p><form class="n2grid" id="n2form"><label>${E(t('alliance'))}<select id="n2a" class="n2alliance-select" tabindex="-1" aria-hidden="true"><option>NRW</option><option>THM</option><option>NWO</option><option>NwO</option><option>CWR</option><option>PxR</option></select></label><div class="n2alliance-grid" role="group" aria-label="${E(t('alliance'))}">${['NRW','THM','NWO','NwO','CWR','PxR'].map(a=>`<button type="button" class="n2alliance-choice ${a==='NRW'?'active':''}" data-login-alliance="${a}" aria-pressed="${a==='NRW'}">${a}</button>`).join('')}</div><label>${E(t('password'))}<input id="n2p" type="password" required></label><div id="n2e" class="n2err"></div><button class="btn primary" type="submit">${E(t('login'))}</button><button class="btn secondary" type="button" id="n2retry" hidden>${E(actionWord2('retry'))}</button></form></div>`;document.body.appendChild(d);d.querySelectorAll('[data-login-alliance]').forEach(b=>b.onclick=()=>{
 const code=b.dataset.loginAlliance;d.querySelector('#n2a').value=code;
 d.querySelectorAll('[data-login-alliance]').forEach(x=>{const selected=x.dataset.loginAlliance===code;x.classList.toggle('active',selected);x.setAttribute('aria-pressed',String(selected))});
});
 const retry=d.querySelector('#n2retry');if(retry)retry.onclick=retrySavedSession2;
 document.querySelector('#n2form').onsubmit=async e=>{
  e.preventDefault();const a=n2a.value,p=n2p.value,errBox=d.querySelector('#n2e');if(retry)retry.hidden=true;
  try{
   const z=await q(C.u+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:C.k,'Content-Type':'application/json'},body:JSON.stringify({email:a.toLowerCase()+'@nap-tracker.invalid',password:p})});
   save({...z,expires_at:Math.floor(Date.now()/1000)+(z.expires_in||3600)});await enter(a);
  }catch(x){
   if(isSessionAuthError2(x)||x?.code==='ACCOUNT_INCOMPLETE'||x?.code==='ACCOUNT_MISMATCH')save(null);
   if(errBox)errBox.textContent=x?.isNetwork?actionWord2('connectionFail'):t('fail')+' '+(x?.message||'');
  }
 };
}
function active(v){return !v.expires_at||new Date(v.expires_at)>new Date()}
function p(name){return S.p.find(x=>(x.name||x.player_name)===name)||{}}
function vv(name){return S.v.filter(x=>x.player_name===name)}
function ss(name){return S.x.filter(x=>x.player_name===name)}
/* Single read-only stage source for Home, player list and profile.
   Only active, sanction-eligible violations with linked sanctions count. */
function sanctionState2(name){
 const eligible=new Map(vv(name).filter(v=>
   v.kind==='overspend'&&v.sanction_eligible!==false&&active(v)
 ).map(v=>[String(v.id),v]));
 const sanctions=ss(name).filter(s=>{
   const v=eligible.get(String(s.violation_id||''));
   return !!v&&s.alliance_code===S.a&&v.alliance_code===S.a&&
     !(s.player_id&&v.player_id&&String(s.player_id)!==String(v.player_id));
 }).sort((a,b)=>Number(b.level||0)-Number(a.level||0)||
   new Date(b.created_at||0)-new Date(a.created_at||0));
 const current=Math.min(4,Math.max(0,...sanctions.map(s=>Number(s.level)||0)));
 const action=sanctions.find(s=>{
   const v=eligible.get(String(s.violation_id));
   if(Number(s.level)===1)return !v.contacted&&!s.completed;
   if(Number(s.level)===2)return !s.completed||!s.started_at||!s.end_at;
   if(Number(s.level)===4)return !s.started_at;
   return !s.completed;
 })||null;
 const currentSanction=sanctions.find(s=>Number(s.level||0)===current)||null;
 return {level:current,action,violation:action?eligible.get(String(action.violation_id)):null,
   currentSanction,currentViolation:currentSanction?eligible.get(String(currentSanction.violation_id)):null};
}
function level(name){return sanctionState2(name).level}
function act(name){return sanctionState2(name).action}
const SANCTION_STATUS_WORDS2={
 de:{open:'offen',active:'aktiv',expired:'abgelaufen',done:'erledigt',timerMissing:'Timer fehlt'},
 en:{open:'open',active:'active',expired:'expired',done:'done',timerMissing:'Timer missing'},
 fr:{open:'ouvert',active:'actif',expired:'expiré',done:'terminé',timerMissing:'Minuteur manquant'},
 es:{open:'abierto',active:'activo',expired:'finalizado',done:'hecho',timerMissing:'Falta temporizador'}
};
function sanctionStatus2(s,v=null){
 const w=SANCTION_STATUS_WORDS2[L()]||SANCTION_STATUS_WORDS2.de;
 if(!s)return {key:'none',label:'OK',short:'OK',cls:'green'};
 const lvl=Number(s.level||0),now=Date.now(),end=s.end_at?new Date(s.end_at).getTime():null;
 if(lvl===1){
   const done=!!(v?.contacted||s.completed);
   return {key:done?'done':'open',label:done?w.done:w.open,short:done?'✓':w.open,cls:done?'green':'gold'};
 }
 if(lvl===2){
   if(!s.completed)return {key:'open',label:w.open,short:w.open,cls:'gold'};
   if(!s.started_at||!s.end_at)return {key:'timer_missing',label:w.timerMissing,short:w.timerMissing,cls:'gold'};
   if(Number.isFinite(end)&&end>Date.now())return {key:'active',label:w.active,short:dur(end-now),cls:'red'};
   return {key:'expired',label:w.expired,short:w.expired,cls:'green'};
 }
 if(lvl===3){
   if(!s.completed)return {key:'open',label:w.open,short:w.open,cls:'gold'};
   if(!s.started_at||!s.end_at)return {key:'timer_missing',label:w.timerMissing,short:w.timerMissing,cls:'gold'};
   if(Number.isFinite(end)&&end>now)return {key:'active',label:w.active,short:dur(end-now),cls:'red'};
   return {key:'expired',label:w.expired,short:w.expired,cls:'green'};
 }
 if(lvl===4){
   // Level 4 is vote/start driven. "completed" alone must never make an
   // unstarted extended exclusion look finished.
   if(!s.started_at)return {key:'open',label:w.open,short:w.open,cls:'gold'};
   if(!s.end_at||(Number.isFinite(end)&&end>now))
     return {key:'active',label:w.active,short:s.end_at?dur(end-now):w.active,cls:'red'};
   if(Number.isFinite(end)&&end<=now)return {key:'expired',label:w.expired,short:w.expired,cls:'green'};
   return {key:'active',label:w.active,short:w.active,cls:'red'};
 }
 return {key:'open',label:w.open,short:w.open,cls:'gold'};
}
function actions(){
 return [...new Set(S.v.filter(v=>
   v.kind==='overspend'&&v.sanction_eligible!==false&&active(v)
 ).map(v=>v.player_name))].map(name=>{
   const state=sanctionState2(name);
   return state.action?{name,l:state.level,actionLevel:Number(state.action.level),
     v:state.violation,s:state.action}:null;
 }).filter(Boolean);
}
function dl(a){const z=new Date((a.s||a.v)?.created_at||(a.v?.occurred_at)||0).getTime()+86400000-Date.now();return dur(Math.abs(z))+' '+t(z<0?'over':'left')}
function renderHome(){document.querySelectorAll('[data-current-alliance]').forEach(x=>x.textContent=S.a);const A=actions(),k=document.querySelectorAll('#view-home .home-kpis .stat-value');if(k[0])k[0].textContent=A.length;if(k[1])k[1].textContent=S.o.length;if(k[2])k[2].textContent=S.e.length;if(k[3])k[3].textContent=S.t.length;homeActionCountBadge.textContent=A.length+' '+t('actions');const box=document.querySelector('#view-home .home-main-grid > .stack:first-child .card:first-child .card-body');if(box)box.innerHTML=A.length?A.map(a=>{const P=p(a.name),r1Missing=a.l===2&&a.s?.completed&&(!a.s.started_at||!a.s.end_at),lab=a.l===1?'Stufe 1 · Kontakt':a.l===2?(r1Missing?'Stufe 2 · R1 · Timer fehlt':'Stufe 2 · R1'):a.l===3?'Stufe 3 · 24h NAP OUT':'Stufe 4 · Extended',b=a.l===1?`<button class="btn small primary n2act" data-k="contact" data-id="${E(a.v.id)}">${E(t('contact'))}</button>`:a.l===2?`<button class="btn small primary n2act" data-k="r1" data-id="${E(a.s.id)}">${E(t('r1'))}</button>`:a.l===3?`<button class="btn small primary n2act" data-k="nap" data-id="${E(a.s.id)}">${E(t('nap'))}</button>`:'';return `<div class="action-item"><div><div class="player-line"><div class="player-avatar">${E(a.name[0])}</div><div><div class="player-name">${E(a.name)}</div><div class="player-id">ID ${E(P.game_id||'–')} · ${E(S.a)}</div></div></div></div><div class="action-right"><span class="pill gold">${E(lab)}</span><span class="deadline">${E(dl(a))}</span><div class="home-action-buttons">${b}<button class="mini-link n2open" data-p="${E(a.name)}">${E(t('open'))}</button></div></div></div>`}).join(''):`<div class="n2empty">✓ ${E(t('none'))}</div>`;const tb=document.querySelector('#view-home .home-main-grid > .stack:first-child .card:nth-child(2) tbody');if(tb)tb.innerHTML=S.v.slice(0,8).map(v=>`<tr><td><b>${E(v.player_name)}</b><br><span class="muted tiny">${E(S.a)}</span></td><td>${E(v.event_name||'')} · ${E(v.phase_name||'')}</td><td>${N(v.score)}</td><td>${violationLimit2(v)?N(violationLimit2(v).points):'–'}</td><td><span class="pill">${level(v.player_name)}</span></td><td>${v.contacted?'✓':'–'}</td></tr>`).join('')||`<tr><td colspan="6">${E(t('none'))}</td></tr>`;const tr=document.querySelector('#homeTransfers');if(tr)tr.innerHTML=S.t.length?S.t.map(x=>`<div class="transfer-card"><div class="transfer-main"><div class="player-line"><div class="player-avatar">${E((x.player_name||'?')[0])}</div><div><b>${E(x.player_name||'–')}</b><div class="muted tiny">ID ${E(x.game_id||'–')}</div></div></div><div class="transfer-route"><span class="pill">${E(x.from_alliance||'POOL')}</span><span>→</span><span class="pill blue">${E(x.to_alliance||'POOL')}</span></div></div><div class="muted small">${E(D(x.detected_since))}</div></div>`).join(''):`<div class="n2empty">${E(t('none'))}</div>`;document.querySelectorAll('.n2act').forEach(b=>b.onclick=()=>doAct(b.dataset.k,b.dataset.id));document.querySelectorAll('.n2open').forEach(b=>b.onclick=()=>openProfile(b.dataset.p))}
function renderPlayers(){const g=document.querySelector('#playerGrid');if(!g)return;g.innerHTML=S.p.map(P=>{const name=P.name||P.player_name||'',V=vv(name),l=level(name),att=V.some(v=>v.kind==='swordland'||/swordland|trialliance|triforce/i.test(String(v.event_name||''))),last=V[0],A=act(name);let val=l===1?(V.some(v=>active(v)&&!v.contacted)?'offen':'✓'):l===2?(A?dl({s:A}):'–'):l===3?(A?.end_at?dur(new Date(A.end_at)-Date.now()):'offen'):'OK';return `<div class="player-card" data-p="${E(name)}" data-has-entry="${V.length||ss(name).length?'1':'0'}" data-attendance="${att?'1':'0'}" data-search="${E((name+' '+(P.game_id||'')).toLowerCase())}"><div class="player-card-top"><div class="player-meta"><div class="player-avatar">${E((name[0]||'?').toUpperCase())}</div><div><div class="player-name">${E(name)}</div><div class="player-id">${E(P.game_id||'–')}</div></div></div><span class="pill">${E(S.a)}</span></div><div class="metric-row"><div class="metric"><b>${V.length}</b><span>Verstöße</span></div><div class="metric"><b>${l}</b><span>Stufe</span></div><div class="metric"><b>${E(val)}</b><span>Status</span></div></div><div class="player-card-foot">${att?'<span class="pill gold">Swordland / TriAlliance</span>':'<span></span>'}<span class="muted tiny">${last?E(D(last.occurred_at)):'–'}</span></div></div>`}).join('');g.querySelectorAll('[data-p]').forEach(c=>c.onclick=()=>openProfile(c.dataset.p));if(typeof applyPlayerFilters==='function')applyPlayerFilters()}
function openProfile(name){const P=p(name),V=vv(name),X=ss(name),l=level(name),view=document.querySelector('#view-profile');if(!view)return;view.querySelector('.profile-name').textContent=name;view.querySelector('.profile-main .profile-avatar span').textContent=(name[0]||'?').toUpperCase();view.querySelector('.profile-main .muted.small').innerHTML=`Player ID ${E(P.game_id||'–')} · <span class="pill">${E(S.a)}</span> · ${E((P.languages||[]).map(languageName2).join(' / ')||'–')}`;const h=view.querySelector('[data-profile-panel="violations"] tbody');if(h)h.innerHTML=V.map(v=>`<tr><td>${E(D(v.occurred_at))}</td><td>${E(v.event_name||'')} · ${E(v.phase_name||'')}</td><td>${N(v.score)}</td><td>${violationLimit2(v)?N(violationLimit2(v).points):'–'}</td><td>${E(v.source_type||'manual')}</td><td>–</td></tr>`).join('');setView('profile');if(typeof setProfileTab==='function')setProfileTab('violations')}
function toLocalInput2(d){if(!d)return '';const x=new Date(d);if(Number.isNaN(x.getTime()))return '';const z=new Date(x.getTime()-x.getTimezoneOffset()*60000);return z.toISOString().slice(0,16)}
async function setR1Timer2(id,input){
 const s=S.x.find(x=>String(x.id)===String(id));const val=typeof input==='string'?input:input?.value;
 if(!s||!val){alert(actionWord2('endRequired'));return}
 const end=new Date(val);if(Number.isNaN(end.getTime())||end<=new Date()){alert(actionWord2('endFuture'));return}
 try{await upd('sanctions',id,{started_at:s.started_at||new Date().toISOString(),end_at:end.toISOString()});await load();renderHomeFull2();renderPlayers2();if(document.getElementById('view-profile')?.classList.contains('active'))await openProfile2(s.player_name)}catch(err){alert(err.message||String(err))}
}
async function doAct(k,id){
 if(k==='contact'){
   const violation=S.v.find(v=>String(v.id)===String(id));
   await upd('violations',id,{contacted:true,contacted_at:new Date().toISOString()});
   const note=window.prompt(actionWord2('contactComment'),'');
   if(note&&note.trim()){
     const pid=violation?.player_id||p(violation?.player_name)?.id;
     if(pid){try{await rpc('add_player_file_comment',{p_player_id:pid,p_comment:note.trim()})}catch(err){console.warn('contact comment',err)}}
   }
 }else{
   if(k==='nap'&&!confirm(actionWord2('activateNapOut')))return;
   await upd('sanctions',id,{completed:true});
 }
 await load();renderHome();renderPlayers()
}
async function syncCrownVisibility2(){
 let permitted=false;
 try{
  if(S.a){const d=await rpc('get_crown_dashboard',{});S.crown=d;permitted=!!(d?.has_access&&d?.king?.alliance_code===S.a)}
 }catch(err){console.warn('Crown access',err)}
 crownAllowed2=permitted;
 document.querySelectorAll('[data-view="crown"],[data-go="crown"]').forEach(el=>{el.hidden=!permitted;el.style.display=permitted?'':'none'});
 if(!permitted&&document.getElementById('view-crown')?.classList.contains('active'))setView('home');
}
function decorate(){const ab=document.querySelector('.alliance-badge');if(ab)ab.innerHTML=allianceLogo2(S.a,'alliance-top-logo')+'<span>'+E(S.a)+'</span>';document.querySelectorAll('[data-current-alliance]').forEach(x=>x.textContent=S.a);const u=document.querySelector('.user-pill');if(u){u.innerHTML=allianceLogo2(S.a,'alliance-user-logo')+'<span>'+E(S.a)+'</span> <span class="n2live">'+E(t('live'))+'</span>';u.title=t('logout');u.onclick=()=>{if(confirm(t('logout')+'?')){save(null);location.reload()}}}}
async function load(){
 const a=encodeURIComponent(S.a);
 const [p1,v,x,e,o,tr,bans,spend,settings,reviews,shared,notificationReads,syncStatus,level4Hosting,napStats,sgWindow,performance]=await Promise.all([
  tab('players','select=*&alliance_code=eq.'+a+'&order=name.asc'),
  tab('violations','select=*&alliance_code=eq.'+a+'&order=occurred_at.desc'),
  tab('sanctions','select=*&alliance_code=eq.'+a+'&order=created_at.desc'),
  rpc('get_public_nap_exclusions',{}),
  rpc('get_nap_overdue_action_notifications_v2',{}),
  rpc('get_my_roster_transfer_candidates',{}),
  tab('nap_bans','select=*&active=eq.true&order=created_at.desc').catch(()=>[]),
  rpc('get_public_nap_spending_exclusions',{}).catch(()=>[]),
  tab('alliance_settings','select=*&alliance_code=eq.'+a+'&limit=1').catch(()=>[]),
  rpc('get_pending_post_contact_spending_reviews',{}).catch(()=>[]),
  rpc('get_my_shared_spending_cases',{}).catch(()=>[]),
  tab('notification_read_state','select=notification_id&alliance_code=eq.'+a+'&order=read_at.desc').catch(()=>[]),
  rpc('get_roster_sync_status_v2',{}).catch(()=>null),
  rpc('get_level4_hosting_alerts_v2',{}).catch(()=>[]),
  rpc('get_nap_violation_stats_v2',{}).catch(()=>[]),
  rpc('get_current_sg_window_v2',{}).catch(()=>null),
  rpc('get_performance_dashboard',{}).catch(()=>null)
 ]);
 S.p=(p1||[]).filter(r=>r.alliance_code===S.a);S.v=(v||[]).filter(r=>r.alliance_code===S.a);S.x=(x||[]).filter(r=>r.alliance_code===S.a);
 S.e=e||[];S.o=o||[];S.t=(tr||[]).filter(r=>r.from_alliance===S.a||r.to_alliance===S.a);S.bans=bans||[];S.spend=spend||[];
 S.reviews=reviews||[];S.shared=shared||[];S.notificationReads=new Set((notificationReads||[]).map(r=>String(r.notification_id)));
 S.syncStatus=syncStatus||null;S.settings=settings?.[0]||null;S.level4Hosting=level4Hosting||[];S.napStats=napStats||[];S.sgWindow=sgWindow||null;S.performance=performance||null;
 window.NAP2_PLAYER_AVATARS=S.avatars;loadAvatars().catch(e=>console.warn('avatar load',e));
}
async function enter(expected){
 const P=await tab('profiles','select=alliance_code,can_manage_bans,is_admin&limit=1'),prof=P?.[0]||null,a=prof?.alliance_code;
 if(!a){const err=Error(actionWord2('accountIncomplete'));err.code='ACCOUNT_INCOMPLETE';throw err}
 if(expected&&expected!==a){const err=Error(actionWord2('wrongAlliance'));err.code='ACCOUNT_MISMATCH';throw err}
 S.a=a;S.profile=prof;await load();await migrateLocalNotificationReads2();await syncCrownVisibility2();
 n2login.hidden=true;document.body.classList.remove('n2lock');decorate();renderHome();renderPlayers();if(typeof applyTranslations==='function')applyTranslations();
}
function showLoginRetry2(err){
 const box=document.getElementById('n2e'),button=document.getElementById('n2retry');
 if(box)box.textContent=actionWord2('connectionRetry')+(err?.message&&err.message!==actionWord2('connectionFail')?' '+err.message:'');
 if(button){button.textContent=actionWord2('retry');button.hidden=false}
}
async function retrySavedSession2(){
 const button=document.getElementById('n2retry');if(button)button.disabled=true;
 try{
  if(!await token()){if(button)button.hidden=true;return}
  await enter();
 }catch(err){
  if(isSessionAuthError2(err)||err?.code==='ACCOUNT_INCOMPLETE'||err?.code==='ACCOUNT_MISMATCH'){save(null);if(button)button.hidden=true;const box=document.getElementById('n2e');if(box)box.textContent=t('fail');return}
  showLoginRetry2(err);
 }finally{if(button)button.disabled=false}
}
async function boot(){
 css();login();document.body.classList.add('n2lock');
 try{if(!await token())return;await enter()}
 catch(err){
  if(isSessionAuthError2(err)||err?.code==='ACCOUNT_INCOMPLETE'||err?.code==='ACCOUNT_MISMATCH'){save(null);return}
  showLoginRetry2(err);
 }
}
setTimeout(boot,0);document.querySelector('#languagePicker')?.addEventListener('change',()=>setTimeout(()=>{if(S.a){decorate();renderHome();renderPlayers()}},0));

/* === LIVE HELPERS V2 === */
const NAP_LOGO_CODES2=new Set(['NRW','THM','NWO','NwO','CWR','PxR']);
function allianceLogoUrl2(code){return NAP_LOGO_CODES2.has(String(code||''))?'./assets/alliance/'+encodeURIComponent(String(code))+'.png':null}
function allianceLogo2(code,cls){
 const u=allianceLogoUrl2(code),k=cls||'alliance-logo-img';
 const size=k==='alliance-user-logo'?'width:24px;height:28px;max-width:24px;max-height:28px;':k==='alliance-top-logo'?'width:22px;height:26px;max-width:22px;max-height:26px;':'width:18px;height:22px;max-width:18px;max-height:22px;';
 return u?'<img class="'+k+'" style="'+size+'object-fit:contain;display:block;pointer-events:none;position:static;flex:none" src="'+E(u)+'" alt="'+E(code)+'">':'';
}
function allianceBadge2(code){
 const u=allianceLogoUrl2(code);return '<span class="alliance-logo-badge">'+(u?'<img style="width:15px;height:18px;max-width:15px;max-height:18px;object-fit:contain;pointer-events:none;position:static;flex:none" src="'+E(u)+'" alt="">':'')+'<b>'+E(code||'–')+'</b></span>';
}

const PHASES2={
 'Strongest Governor':[['sg1','Day 1',333000],['sg2','Day 2',312000],['sg3','Day 3',362000],['sg4','Day 4',250000],['sg5','Day 5',296000],['sg6','Day 6',380000],['sg7','Day 7',345000]],
 'Alliance Brawl':[['b1','Day 1',125000],['b2','Day 2',125000],['b3','Day 3',125000],['b4','Day 4',125000],['b5','Day 5',187500],['b6','Day 6',187500]],
 'Officer Project':[['op1','Charms',310000],['op2','Forgehammers',453000]],
 'Armament Competition':[['ac1','Phase 1',20000],['ac2','Truegold',38000]],
 'Swordland Showdown':[['sword','Attendance',null]],
 'Tri-Alliance Clash':[['tri','Attendance',null]]
};
async function ins(n,b){return q(C.u+'/rest/v1/'+n,{method:'POST',headers:{...(await h(true)),Prefer:'return=representation'},body:JSON.stringify(b)})}
const avatarObjects2=new Map(),avatarPending2=new Map(),avatarFailures2=new Set();
let avatarObserver2=null;
function playerInitial2(id){
 const P=S.p.find(p=>String(p.game_id||p.player_game_id||'')===id);
 return String(P?.name||P?.player_name||'?').trim().slice(0,1).toUpperCase()||'?';
}
function avatarFallback2(el){
 if(!el?.isConnected)return;
 const id=el.dataset.napPlayerAvatar;
 el.replaceChildren(document.createTextNode(playerInitial2(id)));
 el.classList.remove('live-avatar');
 el.dataset.napAvatarState='fallback';
}
async function avatarObject2(id){
 if(avatarObjects2.has(id))return avatarObjects2.get(id);
 if(avatarFailures2.has(id))return null;
 if(avatarPending2.has(id))return avatarPending2.get(id);
 const promise=(async()=>{
  const res=await fetch(C.u+'/functions/v1/nap-player-avatar-v2?player_id='+encodeURIComponent(id),{
   method:'GET',headers:await h(),signal:AbortSignal.timeout(38000)
  });
  if(!res.ok)throw Error('Avatar source '+res.status);
  const blob=await res.blob();
  if(!blob.type.startsWith('image/')||blob.size<1||blob.size>3000000)throw Error('Invalid avatar');
  const obj=URL.createObjectURL(blob);
  avatarObjects2.set(id,obj);
  return obj;
 })().catch(e=>{
  avatarFailures2.add(id);
  console.warn('Avatar unavailable for player '+id,e?.message||e);
  return null;
 }).finally(()=>avatarPending2.delete(id));
 avatarPending2.set(id,promise);
 return promise;
}
async function showAvatar2(el){
 if(!el?.isConnected||el.querySelector('img'))return;
 const id=String(el.dataset.napPlayerAvatar||'');
 if(!S.avatars[id]||avatarFailures2.has(id))return;
 const src=await avatarObject2(id);
 if(!el.isConnected)return;
 if(!src){avatarFallback2(el);return}
 const image=document.createElement('img');
 image.alt='';image.decoding='async';image.loading='lazy';
 image.onerror=()=>{avatarFailures2.add(id);avatarFallback2(el)};
 image.src=src;
 el.replaceChildren(image);
 el.classList.add('live-avatar');
 el.dataset.napAvatarState='loaded';
}
function refreshAvatarNodes2(){
 if(!avatarObserver2&&'IntersectionObserver' in window){
  avatarObserver2=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){
    avatarObserver2.unobserve(entry.target);
    entry.target.dataset.napAvatarState='';
    showAvatar2(entry.target);
   }
  },{rootMargin:'160px'});
 }
 document.querySelectorAll('[data-nap-player-avatar]').forEach(el=>{
  const id=String(el.dataset.napPlayerAvatar||'');
  if(!S.avatars[id]||el.querySelector('img')||el.dataset.napAvatarState==='waiting')return;
  if(avatarFailures2.has(id)){avatarFallback2(el);return}
  el.dataset.napAvatarState='waiting';
  if(avatarObserver2)avatarObserver2.observe(el);
  else showAvatar2(el);
 });
}
window.NAP2_REFRESH_PLAYER_AVATARS=refreshAvatarNodes2;
function avatarHtml(P,cls){
 const id=String(P?.game_id||P?.player_game_id||''),name=P?.name||P?.player_name||'?';
 cls=cls||'player-avatar';
 if(id)queueMicrotask(refreshAvatarNodes2);
 return '<div class="'+cls+'"'+(id?' data-nap-player-avatar="'+E(id)+'"':'')+'>'+E((name[0]||'?').toUpperCase())+'</div>';
}
async function loadAvatars(){
 const ids=[...new Set((S.p||[]).map(x=>String(x.game_id||'')).filter(x=>/^\d{5,20}$/.test(x)))];
 for(let i=0;i<ids.length;i+=20){
   try{
     const z=await q(C.u+'/functions/v1/kingshot-data?player_ids='+encodeURIComponent(ids.slice(i,i+20).join(',')),{headers:{apikey:C.k}});
     for(const p of z?.players||[])if(p?.playerId&&p?.avatarUrl&&/^https:\/\//i.test(p.avatarUrl))S.avatars[String(p.playerId)]=p.avatarUrl;
     window.NAP2_PLAYER_AVATARS=S.avatars;
     refreshAvatarNodes2();
   }catch(e){console.warn('avatar load',e)}
 }
}
function addLiveCss(){
 if(document.getElementById('n2LiveCss'))return;
 const s=document.createElement('style');s.id='n2LiveCss';s.textContent=
 '.live-avatar{overflow:hidden}.live-avatar img{width:100%;height:100%;object-fit:cover;display:block}.alliance-top-logo{width:22px;height:26px;object-fit:contain;display:block}.alliance-user-logo{width:24px;height:28px;object-fit:contain;display:block}.alliance-logo-badge{display:inline-flex;align-items:center;gap:5px;min-height:24px;padding:3px 7px;border:1px solid var(--line);border-radius:999px;background:var(--panel-3);font-size:9px;font-weight:900;white-space:nowrap;vertical-align:middle}.alliance-logo-badge img{width:15px;height:18px;object-fit:contain}.alliance-badge,.user-pill{display:flex;align-items:center;gap:7px}.profile-alliance-line{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.live-transfer-route{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px}.live-transfer-route>small{margin-left:2px}.live-language-editor{margin-top:12px;padding:10px 11px;border:1px solid var(--line);border-radius:11px;background:var(--panel-2)}.live-language-editor summary{cursor:pointer;font-size:10px;font-weight:850}.live-language-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:10px}.live-language-option{display:flex!important;align-items:center!important;gap:6px!important;padding:7px 8px;border:1px solid var(--line);border-radius:9px;background:var(--panel);font-size:9px!important;color:var(--text)!important}.live-language-option input{width:auto!important;min-height:0!important}.r1-home-timer{display:flex;gap:6px;align-items:center}.r1-home-end{min-height:31px!important;height:31px!important;width:175px!important;padding:4px 6px!important;font-size:9px!important}@media(max-width:700px){.r1-home-timer{flex-wrap:wrap}.r1-home-end{width:100%!important}}@media(max-width:700px){.live-language-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
 '.live-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px;padding:5px;background:var(--panel);border:1px solid var(--line);border-radius:14px;width:max-content;max-width:100%}'+
 '.live-tab{border:0;background:transparent;color:var(--muted);font:inherit;font-weight:850;font-size:10px;padding:8px 12px;border-radius:9px;cursor:pointer}.live-tab.active{background:var(--panel-3);color:var(--text);box-shadow:inset 0 0 0 1px var(--line)}'+
 '.live-panel-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:14px;align-items:start}'+
 '.live-form{display:grid;gap:10px}.live-form label{display:grid;gap:5px;color:var(--muted);font-size:9px;font-weight:800}.live-form input,.live-form select,.live-form textarea{width:100%;border:1px solid var(--line);border-radius:10px;background:var(--panel-2);color:var(--text);padding:9px 10px;min-height:38px}.live-form textarea{min-height:84px;resize:vertical}'+
 '.live-form-row{display:grid;grid-template-columns:1fr 1fr;gap:9px}.live-note{padding:10px 11px;border:1px dashed var(--line);border-radius:11px;color:var(--muted);font-size:9px;line-height:1.5}'+
 '.live-import-frame{width:100%;min-height:690px;border:1px solid var(--line);border-radius:14px;background:var(--panel-2)}'+
 '.live-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:13px}.live-stat{padding:12px;border:1px solid var(--line);border-radius:13px;background:var(--panel);min-width:0}.live-stat b{font-size:20px;display:block;max-width:100%;font-variant-numeric:tabular-nums;line-height:1.12;white-space:nowrap}.live-stat small{color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.06em}.performance-panel-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.performance-mob-card .live-stat-grid{grid-template-columns:minmax(72px,.55fr) minmax(150px,1.25fr) minmax(150px,1.25fr) minmax(72px,.55fr)}.performance-kvk-card .live-stat-grid{grid-template-columns:minmax(72px,.55fr) minmax(160px,1.45fr) minmax(160px,1.45fr) minmax(82px,.65fr)}'+
 '.live-list{display:grid;gap:7px}.live-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;border:1px solid var(--line);border-radius:11px;background:var(--panel-2)}.live-row small{display:block;color:var(--muted);font-size:8px;margin-top:3px}'+
 '.live-empty-state{padding:24px;text-align:center;border:1px dashed var(--line);border-radius:13px;color:var(--muted);font-size:10px;background:var(--panel)}'+
 '.live-status{font-size:9px;color:var(--muted);min-height:16px}'+
 '@media(max-width:900px){.live-panel-grid,.performance-panel-grid{grid-template-columns:1fr}.live-stat-grid,.performance-mob-card .live-stat-grid,.performance-kvk-card .live-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.live-form-row{grid-template-columns:1fr}.live-import-frame{min-height:580px}}';
 document.head.appendChild(s);
}
function phaseMultiplier2(event,phase,dateValue){
 // Match public.law14_threshold_multiplier: compare the UTC event day.
 // Date-only recording days are already UTC; datetime-local inputs must first
 // be converted to UTC, exactly as the timestamp sent to Supabase is.
 const raw=String(dateValue||''),dateOnly=/^\d{4}-\d{2}-\d{2}$/.test(raw);
 const parsed=dateOnly?null:raw?new Date(raw):null;
 const day=dateOnly?raw:parsed&&!Number.isNaN(parsed.getTime())?
   parsed.toISOString().slice(0,10):'';
 return event==='Strongest Governor'&&((phase==='sg2'&&day==='2026-09-22')||
   (phase==='sg3'&&day==='2026-09-23'))?4:3;
}
function violationLimit2(v){
 if(v.kind!=='overspend'||!(Number(v.target_value)>0))return null;
 const multiplier=phaseMultiplier2(v.event_name,v.phase_name,v.occurred_at);
 return {multiplier,points:Number(v.target_value)*multiplier};
}
function isInternalCase2(v){
 return !!v&&(v.kind!=='overspend'||/swordland|tri[- ]?alliance|triforce/i.test(String(v.event_name||'')));
}
function isLaw14Case2(v){
 return !!v&&v.kind==='overspend'&&v.sanction_eligible!==false&&!isInternalCase2(v);
}
const PLAYER_CASE_WORDS2={
 de:{law:'Law 14',internal:'Intern',lawCases:'Law 14 Fälle',lawActive:'Law 14 aktiv',internalCases:'interne Fälle',stage:'Stufe',status:'Status'},
 en:{law:'Law 14',internal:'Internal',lawCases:'Law 14 cases',lawActive:'Law 14 active',internalCases:'internal cases',stage:'Level',status:'Status'},
 fr:{law:'Loi 14',internal:'Interne',lawCases:'Cas loi 14',lawActive:'Loi 14 actifs',internalCases:'cas internes',stage:'Niveau',status:'Statut'},
 es:{law:'Law 14',internal:'Interno',lawCases:'Casos Law 14',lawActive:'Law 14 activos',internalCases:'casos internos',stage:'Nivel',status:'Estado'}
};
function playerCaseWords2(){return PLAYER_CASE_WORDS2[L()]||PLAYER_CASE_WORDS2.de}

function targetFor2(event,phase){const cfg=S.settings?.event_targets||{},p=(PHASES2[event]||[]).find(x=>x[0]===phase);return cfg[phase]??p?.[2]??null}
function neutralizeMocks(){
 const concept=document.querySelector('.concept');if(concept)concept.textContent='NAP Event Tracker 2.0 · TEST';
}


/* === ADD VIEW LIVE V2 === */
function renderAddLive(){
 const v=document.getElementById('view-add');if(!v)return;
 v.innerHTML='<div class="hero"><div><div class="kicker">2.0 · LIVE</div><h1>Verstoß erfassen</h1><p>ScreenRecording und manuelle Eingabe sind getrennt, nutzen aber dieselben aktuellen Eventfreigaben und Regeln.</p></div></div>'+
 '<div class="live-tabs"><button class="live-tab active" data-addmode="screen">ScreenRecording</button><button class="live-tab" data-addmode="manual">Manuell</button></div>'+
 '<div id="addScreenPanel"><section class="card"><div class="card-head"><div><div class="card-title">ScreenRecording</div><div class="card-sub">Event und Tag auswählen · Video prüfen · Treffer speichern.</div></div></div><div class="card-body"><div id="liveImporterHost">Verfügbare Events werden geladen …</div></div></section></div>'+
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
 S.eventOptions=opts;window.NAP_V2_SCREEN_OPTIONS=opts.filter(x=>['Strongest Governor','Alliance Brawl','Officer Project','Armament Competition'].includes(x.event_name));
 const eventNames=[...new Set(opts.map(x=>x.event_name).filter(Boolean))];
 const options=eventNames.length?eventNames.map(x=>'<option value="'+E(x)+'">'+E(x)+'</option>').join(''):'<option value="">Kein Event freigegeben</option>';
 const me=document.getElementById('liveManualEvent');if(me)me.innerHTML=options;
 if(document.getElementById('liveImporterHost'))window.NAP_NATIVE_IMPORTER?.openLaw?.(true);
 const player=document.getElementById('liveManualPlayer');if(player)player.innerHTML=S.p.map(p=>'<option value="'+E(p.name||p.player_name)+'">'+E(p.name||p.player_name)+' · '+E(p.game_id||'–')+'</option>').join('');
 const occ=document.getElementById('liveManualOccurred');if(occ){const d=new Date(Date.now()-new Date().getTimezoneOffset()*60000);occ.value=d.toISOString().slice(0,16)}
 function syncPhases(){
   const event=me?.value||'',ph=document.getElementById('liveManualPhase'),source=S.eventOptions.find(x=>x.event_name===event)?.source_event_id,phases=PHASES2[event]||[['general','General',null]];
   if(ph)ph.innerHTML=phases.map(x=>'<option value="'+E(x[0])+'">'+E(x[1])+'</option>').join('');
   updateManualPreview2(source);
 }
 me?.addEventListener('change',syncPhases);document.getElementById('liveManualPhase')?.addEventListener('change',()=>updateManualPreview2(S.eventOptions.find(x=>x.event_name===me?.value)?.source_event_id));document.getElementById('liveManualScore')?.addEventListener('input',()=>updateManualPreview2(S.eventOptions.find(x=>x.event_name===me?.value)?.source_event_id));document.getElementById('liveManualOccurred')?.addEventListener('change',()=>updateManualPreview2());
 syncPhases();
 document.getElementById('liveManualForm')?.addEventListener('submit',saveManualViolation2);
}
function updateManualPreview2(sourceId){
 const event=document.getElementById('liveManualEvent')?.value||'',phase=document.getElementById('liveManualPhase')?.value||'',score=Number(String(document.getElementById('liveManualScore')?.value||'').replace(/\D/g,'')),target=targetFor2(event,phase),occurredValue=document.getElementById('liveManualOccurred')?.value||'',mult=phaseMultiplier2(event,phase,occurredValue),limit=target==null?null:Number(target)*mult;
 const text=target==null?event+': Anwesenheits-Sonderfall':'Ziel '+N(target)+' · aktuelle Grenze '+N(limit)+' ('+mult+'×)'+(Number.isFinite(score)&&score>0?' · '+(score>limit?'Verstoß':'kein Verstoß'):'');
 const a=document.getElementById('liveManualPreview'),b=document.getElementById('liveRuleCard');if(a)a.textContent=text;if(b)b.textContent=text;
}
async function saveManualViolation2(e){
 e.preventDefault();const out=document.getElementById('liveManualStatus');out.textContent=actionWord2('saving');
 try{
   const player=document.getElementById('liveManualPlayer').value,event=document.getElementById('liveManualEvent').value,phase=document.getElementById('liveManualPhase').value,note=document.getElementById('liveManualNote').value.trim()||null,occurred=new Date(document.getElementById('liveManualOccurred').value).toISOString(),source=S.eventOptions.find(x=>x.event_name===event)?.source_event_id,target=targetFor2(event,phase),score=Number(String(document.getElementById('liveManualScore').value||'').replace(/\D/g,'')),kind=(event==='Swordland Showdown'||event==='Tri-Alliance Clash')?'swordland':'overspend',mult=phaseMultiplier2(event,phase,document.getElementById('liveManualOccurred').value);
   if(kind==='overspend'&&(!Number.isFinite(score)||score<=Number(target||0)*mult))throw Error(actionWord2('pointsMustExceed',{mult}));
   await rpc('record_violation_fast',{p_player_name:player,p_event_name:event,p_phase_name:phase,p_kind:kind,p_score:kind==='swordland'?0:score,p_target_value:target,p_occurred_at:occurred,p_expiry_days:Number(S.settings?.violation_expiry_days||30),p_note:note});
   out.textContent=actionWord2('saved');await load();renderHome();renderPlayers();document.getElementById('liveManualScore').value='';
 }catch(err){out.textContent=err.message||String(err)}
}
async function loadScreenImporter2(){
 window.NAP_NATIVE_IMPORTER?.openLaw?.();
}
window.addEventListener('message',async e=>{if(e.data?.type==='nap-screen-import-saved'){await load();renderHome();renderPlayers();const current=document.querySelector('.view.active')?.id?.replace('view-','');if(current==='performance')await renderPerformanceLive();else if(current==='kvk')await renderKvkLive()}});


/* === NAP CENTER LIVE V2 === */
let liveNapTab='overview';
function napRow2(title,sub,right,cls){
 return '<div class="live-row"><div><b>'+E(title)+'</b><small>'+E(sub||'')+'</small></div><div>'+ (right||'') +'</div></div>';
}
const NAP_STATS_WORDS2={
 de:{title:'Gültige Law-14-Verstöße',sub:'NAP-weit aggregiert · keine fremden Spieler- oder Falldetails',players:'Spieler'},
 en:{title:'Valid Law 14 violations',sub:'NAP-wide aggregate · no foreign player or case details',players:'players'},
 fr:{title:'Infractions Law 14 valides',sub:'Agrégé pour le NAP · aucun détail de dossier ou joueur étranger',players:'joueurs'},
 es:{title:'Infracciones Law 14 válidas',sub:'Agregado NAP · sin detalles de jugadores o casos ajenos',players:'jugadores'}
};
const SPEND_WORDS2={
 de:{ended:'beendet',planned:'geplant',expired:'abgelaufen',active:'aktiv',title:'SG Spending Exclusions',sub:'Gelten ausschließlich für Strongest Governor im aktuellen SG-Durchlauf.',add:'SG Spending Exclusion hinzufügen',addSub:'Nur Spieler deiner Allianz · Ende automatisch mit dem laufenden SG.',run:'Aktueller SG-Durchlauf',rule:'Die Ausnahme gilt nur für Strongest Governor; andere Law-14-Events bleiben normal aktiv.',none:'Aktuell läuft kein Strongest Governor. Es kann keine SG Spending Exclusion angelegt werden.',player:'Spieler',reason:'Grund',placeholder:'Optional · z. B. SG nomination',save:'Für aktuellen SG freistellen',end:'vorzeitig beenden'},
 en:{ended:'ended',planned:'planned',expired:'expired',active:'active',title:'SG Spending Exclusions',sub:'Apply only to Strongest Governor in the current SG occurrence.',add:'Add SG Spending Exclusion',addSub:'Own-alliance players only · ends automatically with the current SG.',run:'Current SG occurrence',rule:'The exemption applies only to Strongest Governor; other Law 14 events remain active.',none:'No Strongest Governor is currently running. No SG Spending Exclusion can be created.',player:'Player',reason:'Reason',placeholder:'Optional · e.g. SG nomination',save:'Exempt for current SG',end:'end early'},
 fr:{ended:'terminé',planned:'prévu',expired:'expiré',active:'actif',title:'Exclusions de dépenses SG',sub:'Valables uniquement pour Strongest Governor pendant le SG actuel.',add:'Ajouter une exclusion SG',addSub:'Uniquement vos joueurs · fin automatique avec le SG actuel.',run:'SG actuel',rule:'L’exemption ne vaut que pour Strongest Governor ; les autres événements Law 14 restent actifs.',none:'Aucun Strongest Governor en cours. Impossible de créer une exclusion SG.',player:'Joueur',reason:'Motif',placeholder:'Facultatif · ex. SG nomination',save:'Exempter pour le SG actuel',end:'terminer plus tôt'},
 es:{ended:'finalizada',planned:'programada',expired:'caducada',active:'activa',title:'Exclusiones de gasto SG',sub:'Solo se aplican a Strongest Governor en el SG actual.',add:'Añadir exclusión SG',addSub:'Solo jugadores propios · termina automáticamente con el SG actual.',run:'SG actual',rule:'La exención solo se aplica a Strongest Governor; los demás eventos Law 14 siguen activos.',none:'No hay Strongest Governor activo. No se puede crear una exclusión SG.',player:'Jugador',reason:'Motivo',placeholder:'Opcional · p. ej. SG nomination',save:'Eximir para el SG actual',end:'terminar antes'}
};
function napStatsWords2(){return NAP_STATS_WORDS2[L()]||NAP_STATS_WORDS2.de}
function spendWords2(){return SPEND_WORDS2[L()]||SPEND_WORDS2.de}
function spendingStatus2(x){
 const w=spendWords2(),now=Date.now(),start=x?.starts_at?new Date(x.starts_at).getTime():null,end=x?.ends_at?new Date(x.ends_at).getTime():null;
 if(x?.ended_at)return {key:'ended',label:w.ended,cls:''};
 if(start&&now<start)return {key:'planned',label:w.planned,cls:'gold'};
 if(end&&now>=end)return {key:'expired',label:w.expired,cls:''};
 return {key:'active',label:w.active,cls:'green'};
}
function napViolationStats2(){
 const raw=Array.isArray(S.napStats)?S.napStats:[],w=napStatsWords2(),codes=['NRW','THM','NWO','NwO','CWR','PxR'];
 if(!raw.length)return '';
 const rows=codes.map(code=>raw.find(x=>String(x.alliance_code)===code)||{alliance_code:code,valid_violations:0,affected_players:0});
 return '<section class="card" style="margin-bottom:14px"><div class="card-head"><div><div class="card-title">'+E(w.title)+'</div><div class="card-sub">'+E(w.sub)+'</div></div><span class="pill">'+rows.reduce((n,x)=>n+Number(x.valid_violations||0),0)+'</span></div><div class="card-body"><div class="live-stat-grid">'+
 rows.map(x=>'<div class="live-stat"><b>'+N(x.valid_violations||0)+'</b><small><span style="text-transform:none">'+E(x.alliance_code)+'</span> · '+N(x.affected_players||0)+' '+E(w.players)+'</small></div>').join('')+
 '</div></div></section>';
}
function renderNapLive(){
 const v=document.getElementById('view-nap');if(!v)return;
 const now=Date.now(),activeSpend=(S.spend||[]).filter(x=>!x.ended_at&&(!x.starts_at||new Date(x.starts_at).getTime()<=now)&&(!x.ends_at||new Date(x.ends_at).getTime()>now)),
  hosts=S.level4Hosting||[],hw=level4HomeWords2();
 const tabs=[['overview','Übersicht',0],['alerts','Hinweise',hosts.length+S.o.length],['exclusions','Exclusions',S.e.length],['bans','NAP Bans',S.bans.length],['spending','Spending Exclusions',activeSpend.length]];
 v.innerHTML='<div class="hero"><div><div class="kicker">NAP CENTER · LIVE</div><h1>NAP-weite Transparenz, private Details getrennt.</h1><p>Exclusions, Bans, Spending Exclusions und NAP-Hinweise an einem Ort.</p></div></div>'+
 '<div class="live-tabs">'+tabs.map(x=>'<button class="live-tab '+(liveNapTab===x[0]?'active':'')+'" data-live-naptab="'+x[0]+'">'+x[1]+(x[2]?'<span class="tab-count">'+x[2]+'</span>':'')+'</button>').join('')+'</div><div id="liveNapBody"></div>';
 v.querySelectorAll('[data-live-naptab]').forEach(b=>b.onclick=()=>{liveNapTab=b.dataset.liveNaptab;renderNapLive()});
 const body=document.getElementById('liveNapBody');
 if(liveNapTab==='overview'){
   body.innerHTML='<div class="live-stat-grid">'+
    '<div class="live-stat"><b>'+hosts.length+'</b><small>'+E(hw.section)+'</small></div>'+
    '<div class="live-stat"><b>'+S.o.length+'</b><small>24h überfällig</small></div>'+
    '<div class="live-stat"><b>'+S.e.length+'</b><small>aktive NAP OUT</small></div>'+
    '<div class="live-stat"><b>'+S.bans.length+'</b><small>aktive Bans</small></div>'+
    '<div class="live-stat"><b>'+activeSpend.length+'</b><small>Spending Exclusions</small></div></div>'+
    (hosts.length?'<section class="card" style="margin-bottom:14px"><div class="card-head"><div><div class="card-title">'+E(hw.section)+'</div><div class="card-sub">'+E(hw.sectionSub)+'</div></div><span class="pill red">'+hosts.length+'</span></div><div class="card-body live-list">'+hosts.map(h=>napRow2(h.player_name,h.current_alliance+' · '+hw.eyebrow,'<span class="pill red">Stufe 4</span>')).join('')+'</div></section>':'')+
    '<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">NAP-Benachrichtigungen</div><div class="card-sub">Maßnahmen anderer NAP-Allianzen, die nach 24h nicht umgesetzt wurden.</div></div></div><div class="card-body live-list">'+
    (S.o.length?S.o.slice(0,8).map(x=>napRow2((x.alliance_code||'')+' · '+(x.player_name||'–'),'Stufe '+x.level+' · seit '+durLong2(Number(x.overdue_seconds||0)*1000),'<span class="pill red">überfällig</span>')).join(''):'<div class="live-empty-state">Keine überfälligen NAP-Maßnahmen.</div>')+
    '</div></section><section class="card"><div class="card-head"><div><div class="card-title">Aktive NAP OUTs</div><div class="card-sub">NAP-weit sichtbare Ausschlüsse.</div></div></div><div class="card-body live-list">'+
    (S.e.length?S.e.slice(0,8).map(x=>napRow2(x.player_name,(x.alliance_code||'')+' · Stufe '+x.level+(x.end_at?' · Ende '+D(x.end_at):''),'<span class="pill red">NAP OUT</span>')).join(''):'<div class="live-empty-state">Keine aktive NAP Exclusion.</div>')+
    '</div></section></div>'+napViolationStats2();
   return;
 }
 if(liveNapTab==='alerts'){
   body.innerHTML=(hosts.length?'<section class="card" style="margin-bottom:14px"><div class="card-head"><div><div class="card-title">'+E(hw.section)+'</div><div class="card-sub">'+E(hw.sectionSub)+'</div></div><span class="pill red">'+hosts.length+'</span></div><div class="card-body live-list">'+hosts.map(h=>napRow2(h.player_name,h.current_alliance+' · '+hw.eyebrow,'<span class="pill red">Stufe 4</span>')).join('')+'</div></section>':'')+
   '<section class="card"><div class="card-head"><div><div class="card-title">Überfällige Maßnahmen</div><div class="card-sub">Nur notwendige NAP-Informationen, keine privaten Verstoßdetails.</div></div><span class="pill red">'+S.o.length+'</span></div><div class="card-body live-list">'+
   (S.o.length?S.o.map(x=>napRow2((x.alliance_code||'')+' · '+(x.player_name||'–'),'Stufe '+x.level+' · erstellt '+D(x.action_created_at),'<span class="pill red">'+E(durLong2(Number(x.overdue_seconds||0)*1000))+'</span>')).join(''):'<div class="live-empty-state">Keine überfälligen Maßnahmen.</div>')+'</div></section>';return;
 }
 if(liveNapTab==='exclusions'){
   body.innerHTML='<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">Aktive Exclusions</div></div><span class="pill red">'+S.e.length+'</span></div><div class="card-body live-list">'+
   (S.e.length?S.e.map(x=>napRow2(x.player_name,(x.alliance_code||'')+' · Stufe '+x.level,(Number(x.level)===4&&x.alliance_code===S.a&&x.id?'<div class="hero-actions"><span class="pill">'+(x.end_at?E(D(x.end_at)):'∞')+'</span><button class="btn small secondary live-end-exclusion" data-id="'+E(x.id)+'">'+E(extendedActionWords2().endNow)+'</button></div>':'<span class="pill">'+(x.end_at?E(D(x.end_at)):'∞')+'</span>'))).join(''):'<div class="live-empty-state">Keine aktive Exclusion.</div>')+
   '</div></section><section class="card"><div class="card-head"><div><div class="card-title">Manuelle Exclusion</div><div class="card-sub">Wie in 1.0: zusätzliche NAP-Exclusion anlegen.</div></div></div><div class="card-body"><form id="liveExclusionForm" class="live-form"><label>Spieler<input id="liveExPlayer" required></label><div class="live-form-row"><label>Stufe<select id="liveExLevel"><option value="3">3 · 24h</option><option value="4">4 · Extended</option></select></label><label>Ende<input id="liveExEnd" type="datetime-local"></label></div><button class="btn primary" type="submit">Exclusion speichern</button><div id="liveExStatus" class="live-status"></div></form></div></section></div>';
   document.getElementById('liveExclusionForm').onsubmit=saveManualExclusion2;document.querySelectorAll('.live-end-exclusion').forEach(b=>b.onclick=()=>endExclusion2(b.dataset.id));return;
 }
 if(liveNapTab==='bans'){
   const can=!!S.profile?.can_manage_bans;
   body.innerHTML='<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">NAP Bans</div><div class="card-sub">Aktive permanente NAP-Bans.</div></div><span class="pill red">'+S.bans.length+'</span></div><div class="card-body live-list">'+
   (S.bans.length?S.bans.map(x=>napRow2(x.player_name,(x.former_alliance||'–')+(x.player_game_id?' · ID '+x.player_game_id:'')+(x.reason?' · '+x.reason:''),can?'<button class="btn small secondary live-end-ban" data-id="'+E(x.id)+'">deaktivieren</button>':'<span class="pill red">BAN</span>')).join(''):'<div class="live-empty-state">Keine aktiven NAP Bans.</div>')+
   '</div></section>'+(can?'<section class="card"><div class="card-head"><div><div class="card-title">Ban hinzufügen</div></div></div><div class="card-body"><form id="liveBanForm" class="live-form"><label>Spieler<input id="liveBanPlayer" required></label><label>Player ID<input id="liveBanId"></label><label>Frühere Allianz<input id="liveBanAlliance"></label><label>Grund<textarea id="liveBanReason" required></textarea></label><button class="btn primary" type="submit">NAP Ban speichern</button><div id="liveBanStatus" class="live-status"></div></form></div></section>':'')+'</div>';
   document.querySelectorAll('.live-end-ban').forEach(b=>b.onclick=()=>endBan2(b.dataset.id));document.getElementById('liveBanForm')?.addEventListener('submit',saveBan2);return;
 }
 const sg=S.sgWindow||null,sw=spendWords2();
 body.innerHTML='<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">'+E(sw.title)+'</div><div class="card-sub">'+E(sw.sub)+'</div></div><span class="pill gold">'+activeSpend.length+'</span></div><div class="card-body live-list">'+
 (S.spend.length?S.spend.map(x=>{const st=spendingStatus2(x);return napRow2(x.player_name,(x.owner_alliance||'')+(x.player_game_id?' · ID '+x.player_game_id:'')+(x.reason?' · '+x.reason:'')+(x.ends_at?' · bis '+D(x.ends_at):''),(!x.ended_at&&x.owner_alliance===S.a&&st.key==='active'?'<div class="hero-actions"><span class="pill '+st.cls+'">'+E(st.label)+'</span><button class="btn small secondary live-end-spend" data-id="'+E(x.id)+'">'+E(sw.end)+'</button></div>':'<span class="pill '+st.cls+'">'+E(st.label)+'</span>') )}).join(''):'<div class="live-empty-state">Keine Spending Exclusions vorhanden.</div>')+
 '</div></section><section class="card"><div class="card-head"><div><div class="card-title">'+E(sw.add)+'</div><div class="card-sub">'+E(sw.addSub)+'</div></div></div><div class="card-body">'+
 (sg?'<div class="live-note" style="margin-bottom:12px"><b>'+E(sw.run)+'</b><br>'+E(D(sg.begin_at))+' → '+E(D(sg.end_at))+'<br>'+E(sw.rule)+'</div>':'<div class="live-empty-state">'+E(sw.none)+'</div>')+
 (sg?'<form id="liveSpendForm" class="live-form"><label>'+E(sw.player)+'<select id="liveSpendPlayer">'+S.p.map(p=>'<option value="'+E(p.id)+'">'+E(p.name||p.player_name)+' · '+E(p.game_id||'–')+'</option>').join('')+'</select></label><label>'+E(sw.reason)+'<textarea id="liveSpendReason" placeholder="'+E(sw.placeholder)+'"></textarea></label><button class="btn primary" type="submit">'+E(sw.save)+'</button><div id="liveSpendStatus" class="live-status"></div></form>':'')+
 '</div></section></div>';document.querySelectorAll('.live-end-spend').forEach(b=>b.onclick=()=>endSpending2(b.dataset.id));document.getElementById('liveSpendForm')?.addEventListener('submit',saveSpending2);
}
async function saveSpending2(e){e.preventDefault();const out=document.getElementById('liveSpendStatus');out.textContent=actionWord2('saving');try{if(!S.sgWindow?.end_at)throw Error(actionWord2('sgNotRunning'));await rpc('create_nap_spending_exclusion',{p_player_id:document.getElementById('liveSpendPlayer').value,p_starts_at:new Date().toISOString(),p_ends_at:S.sgWindow.end_at,p_reason:document.getElementById('liveSpendReason').value.trim()||'Strongest Governor'});await load();renderNapLive()}catch(err){out.textContent=err.message||String(err)}}
async function endSpending2(id){if(!confirm(actionWord2('endSpending')))return;try{await rpc('end_nap_spending_exclusion',{p_id:id});await load();renderNapLive()}catch(err){alert(err.message||String(err))}}
async function endExclusion2(id){
 const x=(S.e||[]).find(r=>String(r.id)===String(id)),w=extendedActionWords2();
 if(!x||Number(x.level)!==4||x.alliance_code!==S.a)return;
 if(!confirm(w.endConfirm))return;
 try{
  await upd('sanctions',id,{end_at:new Date().toISOString(),completed:true});
  await load();renderNapLive();renderNotifications2();renderHomeFull2();
 }catch(err){alert(err.message||String(err))}
}
async function saveManualExclusion2(e){
 e.preventDefault();const out=document.getElementById('liveExStatus');out.textContent=actionWord2('saving');
 try{const name=document.getElementById('liveExPlayer').value.trim(),level=Number(document.getElementById('liveExLevel').value),end=document.getElementById('liveExEnd').value;await rpc('create_manual_nap_exclusion',{p_player_name:name,p_level:level,p_started_at:new Date().toISOString(),p_end_at:end?new Date(end).toISOString():null});await load();out.textContent=actionWord2('saved');renderNapLive()}catch(err){out.textContent=err.message||String(err)}
}
async function saveBan2(e){
 e.preventDefault();const out=document.getElementById('liveBanStatus');out.textContent=actionWord2('saving');
 try{await ins('nap_bans',{player_name:document.getElementById('liveBanPlayer').value.trim(),player_game_id:document.getElementById('liveBanId').value.trim()||null,former_alliance:document.getElementById('liveBanAlliance').value.trim()||null,reason:document.getElementById('liveBanReason').value.trim(),active:true});await load();renderNapLive()}catch(err){out.textContent=err.message||String(err)}
}
async function endBan2(id){if(!confirm(actionWord2('deactivateBan')))return;await upd('nap_bans',id,{active:false,updated_at:new Date().toISOString()});await load();renderNapLive()}


/* === PERFORMANCE + KVK LIVE V2 === */
function perfTopList2(rows,kvk){
 if(!Array.isArray(rows)||!rows.length)return '<div class="live-empty-state">Keine Daten vorhanden.</div>';
 return '<div class="live-list">'+rows.map((r,i)=>'<div class="live-row"><div><b>#'+(r.alliance_rank||i+1)+' · '+E(r.name||'–')+'</b><small>'+E(r.source_type||'')+(kvk&&r.server_rank?' · Server #'+E(r.server_rank):'')+'</small></div><strong>'+N(r.score)+'</strong></div>').join('')+'</div>';
}
async function renderPerformanceLive(){
 const v=document.getElementById('view-performance');if(!v)return;
 v.innerHTML='<div class="hero"><div><div class="kicker">PERFORMANCE · LIVE</div><h1>Performance ohne Dashboard-Überladung.</h1><p>Alliance Mobilization und KvK Top 200 mit echten Daten, Rankings und manueller Korrektur.</p></div></div><div class="live-empty-state">Performance wird geladen …</div>';
 try{
  const d=await rpc('get_performance_dashboard',{});S.performance=d||null;
  const m=d?.mobilization,k=d?.kvk;
  v.innerHTML='<div class="hero"><div><div class="kicker">PERFORMANCE · LIVE</div><h1>Performance ohne Dashboard-Überladung.</h1><p>'+E(S.a)+' · höchste Werte pro Spieler</p></div><div class="hero-actions"><button class="btn primary" id="livePerfScreen">ScreenRecording importieren</button><button class="btn secondary" id="livePerfManual">Manuell ergänzen / korrigieren</button></div></div>'+
   '<div class="live-panel-grid performance-panel-grid"><section class="card performance-summary-card performance-mob-card"><div class="card-head"><div><div class="card-title">Alliance Mobilization</div><div class="card-sub">'+E(m?.event?.label||'')+'</div></div></div><div class="card-body">'+
   '<div class="live-stat-grid"><div class="live-stat"><b>'+N(m?.recorded_players||0)+'</b><small>erfasste Spieler</small></div><div class="live-stat"><b>'+N(m?.total_score||0)+'</b><small>Gesamtscore</small></div><div class="live-stat"><b>'+N(m?.average_score||0)+'</b><small>Ø Score</small></div><div class="live-stat"><b>'+N(m?.roster_players||0)+'</b><small>Roster</small></div></div>'+perfTopList2(m?.top5,false)+'<div class="hero-actions" style="margin-top:10px"><button class="btn tertiary live-full-ranking" data-type="mob">Vollständiges Ranking</button></div></div></section>'+
   '<section class="card performance-summary-card performance-kvk-card"><div class="card-head"><div><div class="card-title">KvK Prep · Top 200</div><div class="card-sub">'+E(k?.event?.label||'')+'</div></div></div><div class="card-body">'+
   '<div class="live-stat-grid"><div class="live-stat"><b>'+N(k?.known_top200_players||0)+'</b><small>Top-200 Spieler</small></div><div class="live-stat"><b>'+N(k?.known_top200_score||0)+'</b><small>bekannter Score</small></div><div class="live-stat"><b>'+N(k?.alliance_prep_score||0)+'</b><small>Alliance Prep</small></div><div class="live-stat"><b>'+E(S.a)+'</b><small>Allianz</small></div></div>'+perfTopList2(k?.top5,true)+'<div class="hero-actions" style="margin-top:10px"><button class="btn tertiary live-full-ranking" data-type="kvk">Vollständiges Ranking</button></div></div></section></div><div id="livePerformanceExtra" style="margin-top:14px"></div>';
  document.getElementById('livePerfScreen').onclick=openPerformanceScreenImport2;
  document.getElementById('livePerfManual').onclick=openManualPerformance2;
  v.querySelectorAll('.live-full-ranking').forEach(b=>b.onclick=()=>loadFullPerformance2(b.dataset.type));
 }catch(err){v.innerHTML+='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
async function openPerformanceScreenImport2(){
 const out=document.getElementById('livePerformanceExtra');
 if(!window.NAP_NATIVE_IMPORTER){if(out)out.textContent=actionWord2('importerMissing');return}
 window.NAP_NATIVE_IMPORTER.openPerformance();
}
async function loadFullPerformance2(type){
 const out=document.getElementById('livePerformanceExtra');if(!out)return;out.innerHTML='<div class="live-empty-state">Ranking wird geladen …</div>';
 try{
   const ev=type==='kvk'?S.performance?.kvk?.event:S.performance?.mobilization?.event;if(!ev?.id)throw Error(actionWord2('noPerformance'));
   const d=await rpc(type==='kvk'?'get_kvk_full_ranking':'get_mobilization_full_ranking',{p_performance_event_id:ev.id}),rows=Array.isArray(d)?d:(d?.rows||[]);
   out.innerHTML='<section class="card"><div class="card-head"><div><div class="card-title">'+(type==='kvk'?'KvK Prep · Top 200':'Alliance Mobilization')+'</div><div class="card-sub">'+E(performanceDate2(ev)||'Ohne Zeitangabe')+(ev.period_start?' · '+E(D(ev.period_start)):'')+'</div></div><span class="pill">'+rows.length+'</span></div><div class="card-body live-list">'+
   (rows.length?rows.map((r,i)=>'<div class="live-row"><div><b>#'+E(r.server_rank||r.alliance_rank||i+1)+' · '+E(r.name||'–')+'</b><small>'+E(r.source_type||'')+'</small></div><strong>'+N(r.score)+'</strong></div>').join(''):'<div class="live-empty-state">Keine Daten.</div>')+'</div></section>';
 }catch(err){out.innerHTML='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
async function openManualPerformance2(){
 const out=document.getElementById('livePerformanceExtra');if(!out)return;out.innerHTML='<div class="live-empty-state">Optionen werden geladen …</div>';
 try{
  const o=await rpc('get_performance_import_options',{}),mob=o?.mobilization||[],kvk=o?.kvk||[];
  out.innerHTML='<section class="card"><div class="card-head"><div><div class="card-title">Performance manuell ergänzen / korrigieren</div><div class="card-sub">Manuelle Werte haben für Spieler + Durchlauf Vorrang.</div></div></div><div class="card-body"><form id="livePerfForm" class="live-form">'+
   '<label>Spieler<select id="livePerfPlayer">'+S.p.map(p=>'<option value="'+E(p.id)+'">'+E(p.name||p.player_name)+'</option>').join('')+'</select></label>'+
   '<label>Typ<select id="livePerfType"><option value="alliance_mobilization">Alliance Mobilization</option><option value="kvk_prep">KvK Prep</option></select></label>'+
   '<label>Durchlauf<select id="livePerfOcc"></select></label><div class="live-form-row"><label>Score<input id="livePerfScore" inputmode="numeric"></label><label>Serverrang 1–200<input id="livePerfRank" inputmode="numeric"></label></div><label>Notiz<textarea id="livePerfNote"></textarea></label><button class="btn primary" type="submit">Speichern</button><div id="livePerfStatus" class="live-status"></div></form></div></section>';
  const typ=document.getElementById('livePerfType'),occ=document.getElementById('livePerfOcc'),rank=document.getElementById('livePerfRank');
  function paint(){const isK=typ.value==='kvk_prep',arr=isK?kvk:mob;occ.innerHTML=arr.map(x=>'<option value="'+E(isK?x.cycle_id:x.event_schedule_id)+'">'+E(D(isK?x.prep_start:x.begin_at))+'</option>').join('');rank.disabled=!isK}
  typ.onchange=paint;paint();document.getElementById('livePerfForm').onsubmit=saveManualPerformance2;
 }catch(err){out.innerHTML='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
async function saveManualPerformance2(e){
 e.preventDefault();const out=document.getElementById('livePerfStatus'),type=document.getElementById('livePerfType').value,isK=type==='kvk_prep',score=Number(String(document.getElementById('livePerfScore').value||'').replace(/\D/g,'')),rank=Number(String(document.getElementById('livePerfRank').value||'').replace(/\D/g,''));out.textContent=actionWord2('saving');
 try{if(!Number.isFinite(score)||score<0)throw Error(actionWord2('scoreCheck'));if(isK&&(rank<1||rank>200))throw Error(actionWord2('kvkRankCheck'));await rpc('add_manual_player_performance',{p_performance_type:type,p_player_id:document.getElementById('livePerfPlayer').value,p_event_schedule_id:isK?null:Number(document.getElementById('livePerfOcc').value),p_cycle_id:isK?document.getElementById('livePerfOcc').value:null,p_score:score,p_server_rank:isK?rank:null,p_note:document.getElementById('livePerfNote').value.trim()||null});out.textContent=actionWord2('saved');await renderPerformanceLive()}catch(err){out.textContent=err.message||String(err)}
}
async function renderKvkLive(){
 const v=document.getElementById('view-kvk');if(!v)return;v.innerHTML='<div class="hero"><div><div class="kicker">KVK · LIVE</div><h1>KvK & Law 9</h1><p>Snapshot, Prep-Scores, normalisiertes Ranking und Top-200-Performance.</p></div></div><div class="live-empty-state">KvK-Daten werden geladen …</div>';
 try{
  const [law,perf]=await Promise.all([rpc('get_law9_dashboard',{}),rpc('get_performance_dashboard',{})]);S.law9=law;S.performance=perf;
  const cycle=law?.cycle||{},ranking=law?.ranking||[],base=law?.baselines||[],memberPlan=law?.member_plan||[],canEditMembers=!!law?.can_edit_member_counts;
  v.innerHTML='<div class="hero"><div><div class="kicker">KVK · LIVE</div><h1>KvK & Law 9</h1><p>'+E(D(cycle.prep_start))+' · '+E(law?.formula||'')+'</p></div></div>'+
   '<div class="live-stat-grid"><div class="live-stat"><b>'+E(cycle.snapshot_status||'–')+'</b><small>Snapshot</small></div><div class="live-stat"><b>'+N(cycle.baseline_count||0)+'</b><small>Baselines</small></div><div class="live-stat"><b>'+N(cycle.score_count||0)+'</b><small>Prep Scores</small></div><div class="live-stat"><b>'+N(perf?.kvk?.known_top200_players||0)+'</b><small>Top-200 Spieler</small></div></div>'+
   '<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">Law-9 Ranking</div><div class="card-sub">Prep Score / ((Power^0.7) × (Members^0.3))</div></div></div><div class="card-body live-list">'+
   (ranking.length?ranking.map(r=>'<div class="live-row"><div><b>'+(r.rank?'#'+r.rank+' · ':'')+E(r.alliance_code)+'</b><small>Power '+N(r.alliance_power)+' · '+N(r.member_count)+' Mitglieder</small></div><div style="text-align:right"><strong>'+N(r.prep_score||0)+'</strong><small>'+((r.normalized_score==null)?'–':Number(r.normalized_score).toFixed(4))+'</small></div></div>').join(''):'<div class="live-empty-state">Noch kein Ranking.</div>')+
   '</div></section><section class="card"><div class="card-head"><div><div class="card-title">Snapshot / Baseline</div><div class="card-sub">'+E(cycle.baseline_locked?'eingefroren':'noch offen')+'</div></div></div><div class="card-body live-list">'+
   (base.length?base.map(r=>'<div class="live-row"><div><b>'+E(r.alliance_code)+'</b><small>'+E(D(r.captured_at))+'</small></div><div style="text-align:right"><strong>'+N(r.alliance_power)+'</strong><small>'+N(r.member_count)+' Mitglieder</small></div></div>').join(''):'<div class="live-empty-state">Noch kein Snapshot.</div>')+
   '</div></section></div>'+
   '<section class="card" style="margin-top:14px"><div class="card-head"><div><div class="card-title">Mitgliederplaner</div><div class="card-sub">Tracker-Zahl prüfen und vor dem Snapshot bei Bedarf korrigieren.</div></div><span class="pill '+(cycle.baseline_locked?'green':'gold')+'">'+E(cycle.baseline_locked?'Snapshot eingefroren':'noch editierbar')+'</span></div><div class="card-body live-list">'+
   (memberPlan.length?memberPlan.map(r=>'<form class="live-row live-member-plan" data-code="'+E(r.alliance_code)+'"><div><b>'+E(r.alliance_code)+'</b><small>Tracker '+N(r.tracker_member_count)+' · '+(r.overridden?'manuell überschrieben':'kein Override')+(r.frozen_member_count!=null?' · eingefroren '+N(r.frozen_member_count):'')+'</small></div><input style="width:100px" inputmode="numeric" value="'+E(r.effective_member_count??r.tracker_member_count??'')+'" '+(!canEditMembers||cycle.baseline_locked?'disabled':'')+'><button class="btn small secondary" '+(!canEditMembers||cycle.baseline_locked?'disabled':'')+'>Speichern</button></form>').join(''):'<div class="live-empty-state">Kein Mitgliederplan vorhanden.</div>')+
   '</div></section>'+
   '<section class="card" style="margin-top:14px"><div class="card-head"><div><div class="card-title">Prep Scores</div><div class="card-sub">'+E(cycle.score_entry_open?'Eingabe offen':'Eingabe noch gesperrt')+'</div></div></div><div class="card-body"><div class="live-list">'+
   ranking.map(r=>'<form class="live-row live-prep-score" data-code="'+E(r.alliance_code)+'"><div><b>'+E(r.alliance_code)+'</b><small>'+N(r.member_count)+' Mitglieder</small></div><input style="width:150px" inputmode="numeric" value="'+E(r.prep_score??'')+'" '+(cycle.score_entry_open?'':'disabled')+'><button class="btn small primary" '+(cycle.score_entry_open?'':'disabled')+'>Speichern</button></form>').join('')+
   '</div></div></section><div id="liveKvkTop" style="margin-top:14px"></div>';
  v.querySelectorAll('.live-member-plan').forEach(form=>form.onsubmit=saveMemberPlan2);v.querySelectorAll('.live-prep-score').forEach(form=>form.onsubmit=savePrepScore2);
  if(perf?.kvk?.event?.id)loadKvkTop2(perf.kvk.event.id);
 }catch(err){v.innerHTML+='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
async function saveMemberPlan2(e){
 e.preventDefault();const form=e.currentTarget,count=Number(String(form.querySelector('input').value||'').replace(/\D/g,''));
 if(!Number.isInteger(count)||count<0||count>200){alert(actionWord2('memberCountCheck'));return}
 try{await rpc('set_law9_member_override',{p_cycle_id:S.law9.cycle.id,p_alliance_code:form.dataset.code,p_member_count:count});await renderKvkLive()}catch(err){alert(err.message||String(err))}
}
async function savePrepScore2(e){
 e.preventDefault();const form=e.currentTarget,score=Number(String(form.querySelector('input').value||'').replace(/\D/g,''));try{await rpc('upsert_law9_prep_score',{p_cycle_id:S.law9.cycle.id,p_alliance_code:form.dataset.code,p_prep_score:score});await renderKvkLive()}catch(err){alert(err.message||String(err))}
}
async function loadKvkTop2(id){
 const box=document.getElementById('liveKvkTop');if(!box)return;
 try{const d=await rpc('get_kvk_full_ranking',{p_performance_event_id:id}),rows=Array.isArray(d)?d:(d?.rows||[]);box.innerHTML='<section class="card"><div class="card-head"><div><div class="card-title">KvK Prep · Top 200'+(performanceDate2(S.performance?.kvk?.event)?' · '+E(performanceDate2(S.performance.kvk.event)):'')+'</div><div class="card-sub">Bekannte Serverränge 1–200'+(S.performance?.kvk?.event?.period_start?' · '+E(D(S.performance.kvk.event.period_start)):'')+'</div></div><span class="pill">'+rows.length+'</span></div><div class="card-body live-list">'+(rows.length?rows.slice(0,200).map(r=>'<div class="live-row"><div><b>#'+E(r.server_rank||'–')+' · '+E(r.name||'–')+'</b><small>'+E(performanceDate2(S.performance?.kvk?.event)||'')+' · '+E(r.source_type||'')+'</small></div><strong>'+N(r.score)+'</strong></div>').join(''):'<div class="live-empty-state">Keine Top-200-Daten.</div>')+'</div></section>'}catch(err){box.innerHTML='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}


/* === LAWS LIVE V2 === */
let liveLawTab='book',liveLawSearch='',liveLawCategory='';
async function signStorage2(bucket,path){
 const d=await q(C.u+'/storage/v1/object/sign/'+bucket+'/'+path,{method:'POST',headers:await h(true),body:JSON.stringify({expiresIn:300})});
 const u=d?.signedURL||d?.signedUrl;return u?(u.startsWith('http')?u:C.u+'/storage/v1'+u):null;
}
async function uploadStorage2(bucket,path,file){
 const r=await fetch(C.u+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{...(await h()),'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});
 if(!r.ok)throw Error((await r.text())||('Upload '+r.status));return r.json().catch(()=>({}));
}
async function loadLaws2(){
 const [laws,cases,evidence]=await Promise.all([rpc('get_current_nap_laws_v2',{p_language:L()}),tab('nap_law_violations','select=*&order=occurred_at.desc'),tab('nap_law_evidence','select=*&order=created_at.asc')]);
 S.laws=laws||[];S.lawCases=cases||[];S.lawEvidence=evidence||[];
}
async function renderLawsLive(){
 const v=document.getElementById('view-laws');if(!v)return;
 v.innerHTML='<div class="hero"><div><div class="kicker">LAWS · LIVE</div><h1>Lawbook und Fälle.</h1><p>Aktuelle Law-Versionen, Ausnahmen, Sanktionen, private Fälle und Evidence.</p></div></div><div class="live-empty-state">Laws werden geladen …</div>';
 try{
  await loadLaws2();
  v.innerHTML='<div class="hero"><div><div class="kicker">LAWS · LIVE</div><h1>Lawbook und Fälle.</h1><p>Aktuelle Versionen aus der Datenbank.</p></div></div>'+
   '<div class="live-tabs"><button class="live-tab '+(liveLawTab==='book'?'active':'')+'" data-live-lawtab="book">Lawbook</button><button class="live-tab '+(liveLawTab==='cases'?'active':'')+'" data-live-lawtab="cases">NAP Verstöße <span class="tab-count">'+S.lawCases.length+'</span></button></div><div id="liveLawBody"></div>';
  v.querySelectorAll('[data-live-lawtab]').forEach(b=>b.onclick=()=>{liveLawTab=b.dataset.liveLawtab;paintLaws2()});paintLaws2();
 }catch(err){v.innerHTML+='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
function paintLaws2(){
 const box=document.getElementById('liveLawBody');if(!box)return;
 document.querySelectorAll('[data-live-lawtab]').forEach(b=>b.classList.toggle('active',b.dataset.liveLawtab===liveLawTab));
 if(liveLawTab==='cases'){
   box.innerHTML='<div class="live-list">'+(S.lawCases.length?S.lawCases.map(ca=>{
    const law=S.laws.find(l=>String(l.law_key)===String(ca.law_key)),files=S.lawEvidence.filter(x=>x.violation_id===ca.id);
    return '<article class="card"><div class="card-head"><div><div class="card-title">Law '+E(law?.display_number||ca.law_key)+' · '+E(law?.title||'')+'</div><div class="card-sub">'+E(ca.subject_label||ca.player_name||ca.subject_alliance||'–')+' · '+E(D(ca.occurred_at))+'</div></div><span class="pill">'+E(ca.status||'open')+'</span></div><div class="card-body"><p style="margin-top:0">'+E(ca.description||'')+'</p>'+(ca.evidence_note?'<div class="live-note">'+E(ca.evidence_note)+'</div>':'')+(files.length?'<div class="hero-actions" style="margin-top:10px">'+files.map(f=>'<button class="btn small secondary live-law-file" data-path="'+E(f.storage_path)+'">📎 '+E(f.file_name||'Evidence')+'</button>').join('')+'</div>':'')+'</div></article>';
   }).join(''):'<div class="live-empty-state">Noch keine Fälle.</div>')+'</div>';
   box.querySelectorAll('.live-law-file').forEach(b=>b.onclick=async()=>{try{const u=await signStorage2('nap-law-evidence',b.dataset.path);if(u)window.open(u,'_blank','noopener')}catch(err){alert(err.message||String(err))}});
   return;
 }
 const cats=[...new Set(S.laws.map(l=>l.category).filter(Boolean))],qv=liveLawSearch.toLowerCase(),rows=S.laws.filter(l=>(!liveLawCategory||l.category===liveLawCategory)&&(!qv||(String(l.display_number)+' '+l.title+' '+(l.short_summary||'')).toLowerCase().includes(qv)));
 box.innerHTML='<div class="toolbar"><div class="toolbar-left"><input class="filter-input" id="liveLawSearch" placeholder="Law suchen …" value="'+E(liveLawSearch)+'"><select class="compact-select" id="liveLawCat"><option value="">Alle Bereiche</option>'+cats.map(c=>'<option value="'+E(c)+'" '+(liveLawCategory===c?'selected':'')+'>'+E(c)+'</option>').join('')+'</select></div></div>'+
 '<div class="law-list-2">'+(rows.length?rows.map(l=>'<article class="law-card-2"><button class="law-card-toggle live-law-toggle" type="button"><span><b>LAW '+E(l.display_number)+' · '+E(l.title)+'</b><small>'+E(l.short_summary||'')+'</small></span><span class="chev">⌄</span></button><div class="law-card-detail"><div class="law-meta"><span class="pill">'+E(l.category||'')+'</span><span class="pill">v'+E(l.version)+'</span></div><p>'+E(l.full_text||'')+'</p>'+
 ((Array.isArray(l.exceptions)&&l.exceptions.length)?'<div class="live-note"><b>Ausnahmen</b><br>'+l.exceptions.map(E).join('<br>')+'</div>':'')+
 ((Array.isArray(l.penalties)&&l.penalties.length)?'<div class="live-note" style="margin-top:8px"><b>Sanktionen</b><br>'+l.penalties.map(E).join('<br>')+'</div>':'')+
 (l.trackable&&String(l.law_key)!=='14'?'<div class="hero-actions" style="margin-top:10px"><button class="btn primary live-report-law" data-law="'+E(l.law_key)+'">NAP-Verstoß melden</button></div>':'')+
 (String(l.law_key)==='14'?'<div class="hero-actions" style="margin-top:10px"><button class="btn primary" data-go="add">Zum Eintragen</button></div>':'')+
 '</div></article>').join(''):'<div class="live-empty-state">Keine Laws gefunden.</div>')+'</div>';
 document.getElementById('liveLawSearch').oninput=e=>{liveLawSearch=e.target.value;paintLaws2()};document.getElementById('liveLawCat').onchange=e=>{liveLawCategory=e.target.value;paintLaws2()};
 box.querySelectorAll('.live-law-toggle').forEach(b=>b.onclick=()=>b.closest('.law-card-2').classList.toggle('open'));
 box.querySelectorAll('.live-report-law').forEach(b=>b.onclick=()=>openLawReport2(b.dataset.law));
}
function openLawReport2(key){
 const l=S.laws.find(x=>String(x.law_key)===String(key));if(!l)return;
 let modal=document.getElementById('liveLawModal');modal?.remove();modal=document.createElement('div');modal.id='liveLawModal';modal.className='modal-backdrop';
 modal.innerHTML='<div class="modal-card"><div class="modal-head"><div><b>Law '+E(l.display_number)+' melden</b><small>Fall bleibt für die meldende Allianz privat.</small></div><button class="icon-btn" id="liveLawClose">×</button></div><form id="liveLawForm" class="live-form">'+
 '<div class="live-form-row"><label>Verursacher / Beschuldigter<input id="liveLawSubject" required></label><label>Player ID<input id="liveLawSubjectId"></label></div>'+
 '<div class="live-form-row"><label>Betroffene Partei<input id="liveLawAffected"></label><label>Betroffene Player ID<input id="liveLawAffectedId"></label></div>'+
 '<label>Zeitpunkt<input id="liveLawOccurred" type="datetime-local" required></label><label>Beschreibung<textarea id="liveLawDesc" required></textarea></label><label>Evidence-Notiz<textarea id="liveLawNote"></textarea></label><label>Screenshots / Evidence<input id="liveLawFiles" type="file" accept="image/png,image/jpeg,image/webp" multiple></label>'+
 '<button class="btn primary" type="submit">Fall speichern</button><div id="liveLawStatus" class="live-status"></div></form></div>';document.body.appendChild(modal);
 const d=new Date(Date.now()-new Date().getTimezoneOffset()*60000);document.getElementById('liveLawOccurred').value=d.toISOString().slice(0,16);document.getElementById('liveLawClose').onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove()};document.getElementById('liveLawForm').onsubmit=e=>saveLawReport2(e,l);
}
async function saveLawReport2(e,l){
 e.preventDefault();const out=document.getElementById('liveLawStatus'),files=[...document.getElementById('liveLawFiles').files];out.textContent=actionWord2('saving');
 try{
  for(const f of files)if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>8388608)throw Error(actionWord2('lawImageRule'));
  const d=await rpc('record_nap_law_violation_v2',{p_law_key:l.law_key,p_subject_label:document.getElementById('liveLawSubject').value.trim(),p_subject_game_id:document.getElementById('liveLawSubjectId').value.trim()||null,p_affected_party:document.getElementById('liveLawAffected').value.trim()||null,p_affected_game_id:document.getElementById('liveLawAffectedId').value.trim()||null,p_occurred_at:new Date(document.getElementById('liveLawOccurred').value).toISOString(),p_description:document.getElementById('liveLawDesc').value.trim(),p_evidence_note:document.getElementById('liveLawNote').value.trim()||null,p_sanction_type:null,p_sanction_start:null,p_sanction_end:null});
  const vid=d?.id;if(!vid)throw Error(actionWord2('caseIdMissing'));const uid=ses?.user?.id||'user';
  for(const file of files){const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_'),path=uid+'/'+vid+'/'+Date.now()+'-'+safe;await uploadStorage2('nap-law-evidence',path,file);await ins('nap_law_evidence',{violation_id:vid,storage_path:path,file_name:file.name,mime_type:file.type,size_bytes:file.size})}
  document.getElementById('liveLawModal')?.remove();liveLawTab='cases';await renderLawsLive();
 }catch(err){out.textContent=err.message||String(err)}
}


/* === CROWN + ACTIVITY + SETTINGS LIVE V2 === */
async function renderCrownLive(){
 const v=document.getElementById('view-crown');if(!v)return;v.innerHTML='<div class="hero"><div><div class="kicker">CROWN · LIVE</div><h1>Minister-Ausschlüsse klar priorisiert.</h1><p>Nur die für Minister-Eignung notwendigen Informationen werden gezeigt.</p></div></div><div class="live-empty-state">Crown-Daten werden geladen …</div>';
 try{
  const d=await rpc('get_crown_dashboard',{});S.crown=d;const k=d?.king||{},rows=d?.restrictions||[],recent=d?.recently_ended||[];
  const crownLang2={
   de:{privacy:'Hier wird nur angezeigt, ob Spieler laut Law 14 Ministerposten übernehmen dürfen. Private Verstoßdetails bleiben bei ihrer Allianz.',locked:'Die aktiven Minister-Sperren sieht nur die derzeitige Königsallianz. Diese Ansicht zeigt nur, wo Crown liegt – keine fremden Akten.',title:'Minister-Sperren nach Law 14'},
   en:{privacy:'Only minister eligibility under Law 14 is shown; violation details remain private to each alliance.',locked:'Only the current king alliance can see active minister restrictions. No other alliance files are shown.',title:'Law 14 minister restrictions'},
   fr:{privacy:'Seule l’éligibilité aux postes de ministre selon la loi 14 est affichée ; les infractions restent privées.',locked:'Seule l’alliance du roi peut voir les restrictions actives. Aucun dossier d’autre alliance n’est affiché.',title:'Restrictions ministérielles – loi 14'},
   es:{privacy:'Solo se muestra la elegibilidad ministerial según la ley 14; las infracciones siguen siendo privadas.',locked:'Solo la alianza del rey puede ver las restricciones activas. No se muestran expedientes ajenos.',title:'Restricciones ministeriales – ley 14'}
  }[L()]||{privacy:'Nur der Ministerstatus wird gezeigt.',locked:'Nur die Königsallianz hat Zugriff.',title:'Minister-Sperren nach Law 14'};
  v.innerHTML='<div class="hero"><div><div class="kicker">CROWN · LIVE</div><h1>'+E(crownLang2.title)+'</h1><p>'+E(crownLang2.privacy)+'</p></div><div class="hero-actions"><span class="pill gold">Königsallianz · '+E(k.alliance_code||'–')+'</span></div></div>'+
   (d?.has_access?'<div class="live-stat-grid"><div class="live-stat"><b>'+rows.length+'</b><small>aktive Minister-Sperren</small></div><div class="live-stat"><b>'+recent.length+'</b><small>beendet · 24h</small></div>'+(k.name?'<div class="live-stat"><b>'+E(k.name)+'</b><small>König</small></div>':'')+'<div class="live-stat"><b>'+E(D(k.refreshed_at))+'</b><small>aktualisiert</small></div></div>':'<div class="live-stat-grid"><div class="live-stat"><b>'+E(k.alliance_code||'–')+'</b><small>Königsallianz</small></div>'+(k.name?'<div class="live-stat"><b>'+E(k.name)+'</b><small>König</small></div>':'')+'<div class="live-stat"><b>'+E(D(k.refreshed_at))+'</b><small>aktualisiert</small></div></div>')+
   (!d?.has_access?'<div class="live-empty-state">'+E(crownLang2.locked)+'</div>':
   '<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">Aktive Minister-Sperren</div><div class="card-sub">Law 14 · minimale Crown-Information</div></div><span class="pill red">'+rows.length+'</span></div><div class="card-body live-list">'+
   (rows.length?rows.map(x=>'<div class="live-row"><div><b>'+E(x.player_name||'–')+'</b><small>'+E(x.alliance_code||'')+(x.player_game_id?' · ID '+E(x.player_game_id):'')+'</small></div><div style="text-align:right"><span class="pill '+(Number(x.level)>=3?'red':'gold')+'">Stufe '+E(x.level)+'</span><small>'+E(x.end_at?D(x.end_at):'ohne Endzeit')+'</small></div></div>').join(''):'<div class="live-empty-state">Keine aktiven Minister-Sperren.</div>')+
   '</div></section><section class="card"><div class="card-head"><div><div class="card-title">Beendet · letzte 24h</div></div></div><div class="card-body live-list">'+
   (recent.length?recent.map(x=>'<div class="live-row"><div><b>'+E(x.player_name||'–')+'</b><small>'+E(x.alliance_code||'')+' · Stufe '+E(x.level)+'</small></div><span class="pill green">'+E(D(x.ended_at))+'</span></div>').join(''):'<div class="live-empty-state">Keine kürzlich beendeten Maßnahmen.</div>')+
   '</div></section></div>');
 }catch(err){v.innerHTML+='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
let activityType2='all',activityAlliance2='all',activityOffset2=0,activityMore2=false,activityLoading2=false,activityAlliances2=[];
function activityCategory2(a){const s=String(a?.action||'').toLowerCase();if(s.includes('screen')||s.includes('import')||s.includes('upload'))return'uploads';if(s.includes('player')||s.includes('roster')||s.includes('alliance_updated'))return'players';if(s.includes('event')||s.includes('settings'))return'events';if(s.includes('delete'))return'deleted';if(s.includes('violation')||s.includes('sanction')||s.includes('exclusion')||s.includes('ban'))return'violations';return'all'}
const ACTIVITY_EXTRA_TITLES2={
 de:{
  sanction_review_correction:'Sanktionsprüfung korrigiert',sanction_manual_timer_restore:'Sanktions-Timer wiederhergestellt',
  screen_import_occurrence_created_test:'ScreenRecording Test erfasst',screen_import_phase_corrected:'ScreenRecording Phase korrigiert',
  screen_import_case_corrected:'ScreenImport-Fall korrigiert',screen_import_false_positive_removed:'ScreenImport-Fehlerkennung entfernt',
  performance_import_video_corrected:'Performance-Video korrigiert',nap_spending_exemption_created:'Spending Exclusion eingetragen',
  law9_baseline_manual_correction:'KvK Baseline korrigiert',roster_transfer_marked_temporary:'Allianzwechsel als temporär markiert',
  crown_manual_override:'Crown manuell korrigiert',frontend_live_loader_updated:'Frontend aktualisiert',alliance_created:'Allianz angelegt'
 },
 en:{
  sanction_review_correction:'Sanction review corrected',sanction_manual_timer_restore:'Sanction timer restored',
  screen_import_occurrence_created_test:'ScreenRecording test recorded',screen_import_phase_corrected:'ScreenRecording phase corrected',
  screen_import_case_corrected:'ScreenImport case corrected',screen_import_false_positive_removed:'ScreenImport false detection removed',
  performance_import_video_corrected:'Performance video corrected',nap_spending_exemption_created:'Spending Exclusion added',
  law9_baseline_manual_correction:'KvK baseline corrected',roster_transfer_marked_temporary:'Alliance move marked temporary',
  crown_manual_override:'Crown corrected manually',frontend_live_loader_updated:'Frontend updated',alliance_created:'Alliance created'
 },
 fr:{
  sanction_review_correction:'Révision de sanction corrigée',sanction_manual_timer_restore:'Minuteur de sanction restauré',
  screen_import_occurrence_created_test:'Test ScreenRecording enregistré',screen_import_phase_corrected:'Phase ScreenRecording corrigée',
  screen_import_case_corrected:'Cas ScreenImport corrigé',screen_import_false_positive_removed:'Fausse détection ScreenImport supprimée',
  performance_import_video_corrected:'Vidéo de performance corrigée',nap_spending_exemption_created:'Spending Exclusion ajoutée',
  law9_baseline_manual_correction:'Baseline KvK corrigée',roster_transfer_marked_temporary:'Changement d’alliance marqué temporaire',
  crown_manual_override:'Crown corrigée manuellement',frontend_live_loader_updated:'Frontend mis à jour',alliance_created:'Alliance créée'
 },
 es:{
  sanction_review_correction:'Revisión de sanción corregida',sanction_manual_timer_restore:'Temporizador de sanción restaurado',
  screen_import_occurrence_created_test:'Prueba ScreenRecording registrada',screen_import_phase_corrected:'Fase ScreenRecording corregida',
  screen_import_case_corrected:'Caso ScreenImport corregido',screen_import_false_positive_removed:'Detección errónea ScreenImport eliminada',
  performance_import_video_corrected:'Vídeo de rendimiento corregido',nap_spending_exemption_created:'Spending Exclusion añadida',
  law9_baseline_manual_correction:'Baseline KvK corregida',roster_transfer_marked_temporary:'Cambio de alianza marcado temporal',
  crown_manual_override:'Crown corregida manualmente',frontend_live_loader_updated:'Frontend actualizado',alliance_created:'Alianza creada'
 }
};
function activityTitle2(a){
 const act=String(a?.action||''),extra=(ACTIVITY_EXTRA_TITLES2[L()]||ACTIVITY_EXTRA_TITLES2.de)[act];
 if(extra)return extra;
 const map={
  violation_created:'Verstoß eingetragen',violation_created_vnext:'Verstoß eingetragen',violation_updated:'Verstoß aktualisiert',
  violation_details_updated:'Verstoß aktualisiert',violation_contact_updated:'Kontaktstatus geändert',violation_deleted:'Eintrag gelöscht',
  player_id_updated:'Spieler-ID aktualisiert',player_alliance_updated:'Allianzwechsel',player_status_updated:'Spielerstatus geändert',
  player_name_updated:'Spielername geändert',player_file_comment_added:'Aktenkommentar hinzugefügt',sanction_updated:'Maßnahme aktualisiert',
  sanction_review_correction:'Sanktionsprüfung korrigiert',sanction_manual_timer_restore:'Sanktions-Timer wiederhergestellt',
  alliance_settings_updated:'Einstellungen aktualisiert',screen_recording_import:'ScreenRecording Import',
  screen_import_occurrence_created:'ScreenRecording erfasst',screen_import_occurrence_updated:'ScreenRecording aktualisiert',
  screen_import_occurrence_created_test:'ScreenRecording Test erfasst',screen_import_phase_corrected:'ScreenRecording Phase korrigiert',
  screen_import_case_corrected:'ScreenImport-Fall korrigiert',screen_import_false_positive_removed:'ScreenImport-Fehlerkennung entfernt',
  performance_screen_import:'Performance ScreenRecording',performance_import_video_corrected:'Performance-Video korrigiert',
  manual_nap_exclusion_created_v3:'NAP Exclusion eingetragen',nap_spending_exemption_created:'Spending Exclusion eingetragen',
  performance_manual_snapshot_added:'Performance manuell korrigiert',performance_feature_settings_updated:'Performance-Anzeige geändert',
  law9_prep_score_saved:'KvK Prep Score gespeichert',law9_baseline_manual_correction:'KvK Baseline korrigiert',
  roster_transfer_marked_temporary:'Allianzwechsel als temporär markiert',crown_manual_override:'Crown manuell korrigiert',
  frontend_live_loader_updated:'Frontend aktualisiert',alliance_created:'Allianz angelegt'
 };
 return map[act]||act.replaceAll('_',' ');
}
function activityMeta2(a){
 const d=a?.details||{},p={...(d.public||{}),...(d.private||{}),...d},bits=[];
 if(p.player_name)bits.push(p.player_name);
 if(p.event_name)bits.push(p.event_name);
 if(p.phase_name)bits.push(p.phase_name);
 if(p.from_alliance&&p.to_alliance)bits.push(p.from_alliance+' → '+p.to_alliance);
 if(p.score!=null)bits.push(N(p.score));
 if(a?.reason){
  const label={de:'Grund',en:'Reason',fr:'Motif',es:'Motivo'}[L()]||'Grund';
  bits.push(label+': '+a.reason);
 }
 return bits.join(' · ');
}
function activityRpcArgs2(offset=0){
 return {p_limit:250,p_offset:offset,p_alliance:activityAlliance2==='all'?null:activityAlliance2,p_category:activityType2};
}
async function renderActivityLive(){
 const v=document.getElementById('view-activity');if(!v)return;
 v.innerHTML='<div class="hero"><div><div class="kicker">AKTIVITÄT · LIVE</div><h1>Filterbarer Audit-Feed.</h1><p>Uploads, Spieleränderungen, Verstöße und Maßnahmen.</p></div></div><div class="live-empty-state">Aktivität wird geladen …</div>';
 try{
  const d=await rpc('get_activity_log_v2',activityRpcArgs2(0));
  S.activity=Array.isArray(d?.rows)?d.rows:[];
  activityAlliances2=Array.isArray(d?.alliances)?d.alliances:[];
  activityOffset2=S.activity.length;activityMore2=!!d?.has_more;
  paintActivity2();
 }catch(err){v.innerHTML+='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
async function loadMoreActivity2(){
 if(activityLoading2||!activityMore2)return;
 activityLoading2=true;
 const btn=document.getElementById('liveActivityMore');
 if(btn){btn.disabled=true;btn.textContent=actionWord2('loadingMore')}
 try{
  const d=await rpc('get_activity_log_v2',activityRpcArgs2(activityOffset2));
  const page=Array.isArray(d?.rows)?d.rows:[];
  const known=new Set((S.activity||[]).map(x=>String(x.id)));
  S.activity.push(...page.filter(x=>!known.has(String(x.id))));
  activityOffset2+=page.length;activityMore2=!!d?.has_more;
  if(Array.isArray(d?.alliances))activityAlliances2=d.alliances;
  paintActivity2();
 }catch(err){if(btn){btn.disabled=false;btn.textContent='Weitere Einträge laden'}alert(err.message||String(err))}
 finally{activityLoading2=false}
}
function paintActivity2(){
 const v=document.getElementById('view-activity');if(!v)return;
 const types=[['all','Alle'],['uploads','Uploads'],['players','Spieler'],['events','Events'],['violations','Verstöße'],['deleted','Gelöscht']];
 const rows=S.activity||[],alliances=activityAlliances2||[];
 v.innerHTML='<div class="hero"><div><div class="kicker">AKTIVITÄT · LIVE</div><h1>Filterbarer Audit-Feed.</h1><p>Uploads, Spieleränderungen, Verstöße und Maßnahmen.</p></div><div class="hero-actions"><button id="liveActivityRefresh" class="btn secondary">↻ Aktualisieren</button></div></div>'+
 '<div class="toolbar"><div class="toolbar-left">'+types.map(x=>'<button class="filter-chip '+(activityType2===x[0]?'active':'')+'" data-acttype="'+x[0]+'">'+x[1]+'</button>').join('')+'</div><div class="toolbar-right"><label class="live-activity-alliance-label"><span>Allianz</span><select id="liveActivityAlliance" aria-label="Allianz"><option value="all">Alle Allianzen</option>'+alliances.map(a=>'<option value="'+E(a)+'" '+(activityAlliance2===a?'selected':'')+'>'+E(a)+'</option>').join('')+'</select></label></div></div>'+
 '<div class="live-note live-audit-scope">Serverweites Aktivitätsprotokoll: Bei anderen Allianzen werden ausschließlich öffentliche Log-Informationen angezeigt. Private Verstoßdetails, Gründe und Kommentare bleiben verborgen.</div>'+
 '<section class="card"><div class="card-body live-list">'+(rows.length?rows.map(a=>'<div class="live-row"><div><b>'+E(a.alliance_code||'System')+' · '+E(activityTitle2(a))+'</b><small>'+E(activityMeta2(a))+'</small></div><time class="muted tiny">'+E(D(a.created_at))+'</time></div>').join(''):'<div class="live-empty-state">Keine Aktivitäten für diesen Filter.</div>')+'</div></section>'+(activityMore2?'<div class="hero-actions" style="margin-top:14px"><button type="button" class="btn secondary" id="liveActivityMore">Weitere Einträge laden</button></div>':'');
 v.querySelectorAll('[data-acttype]').forEach(b=>b.onclick=async()=>{if(activityLoading2)return;activityType2=b.dataset.acttype;activityOffset2=0;await renderActivityLive()});
 v.querySelector('#liveActivityAlliance')?.addEventListener('change',async e=>{if(activityLoading2)return;activityAlliance2=e.target.value;activityOffset2=0;await renderActivityLive()});
 document.getElementById('liveActivityMore')?.addEventListener('click',loadMoreActivity2);
 document.getElementById('liveActivityRefresh').onclick=renderActivityLive;
}
function settingTargetRows2(){
 const targets=S.settings?.event_targets||{};return Object.entries(PHASES2).flatMap(([event,phases])=>phases.filter(x=>x[2]!=null).map(x=>'<div class="live-row"><div><b>'+E(event)+'</b><small>'+E(x[1])+' · '+E(x[0])+'</small></div><input class="live-target-input" data-key="'+E(x[0])+'" style="width:130px" inputmode="numeric" value="'+E(targets[x[0]]??x[2]??'')+'"></div>')).join('')
}
async function renderSettingsLive(){
 const v=document.getElementById('view-settings');if(!v)return;let opts=[];try{opts=await rpc('get_open_event_entry_options',{})||[]}catch{}S.eventOptions=opts;
 let features=null;try{features=await rpc('get_performance_feature_settings',{})}catch{}S.features=features;
 const s=S.settings||{},over=s.manual_event_entry_overrides||{},events=['Strongest Governor','Alliance Brawl','Officer Project','Armament Competition','Swordland Showdown','Tri-Alliance Clash'];
 v.innerHTML='<div class="hero"><div><div class="kicker">EINSTELLUNGEN · LIVE</div><h1>Konfiguration getrennt von den Laws.</h1><p>Zielwerte, Gültigkeit, Event-Verfügbarkeit und Performance.</p></div></div>'+
 '<div class="live-tabs"><button class="live-tab active" data-settab="general">Allgemein</button><button class="live-tab" data-settab="events">Event-Verfügbarkeit</button><button class="live-tab" data-settab="targets">Zielwerte</button><button class="live-tab" data-settab="performance">Performance</button></div>'+
 '<div id="liveSettingsGeneral"><div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">Verstoß-Fenster</div></div></div><div class="card-body"><form id="liveSettingsForm" class="live-form"><div class="live-form-row"><label>Warnfenster · Tage<input id="liveWarnDays" type="number" min="1" value="'+E(s.warning_window_days||7)+'"></label><label>Verfehlung gültig · Tage<input id="liveExpiryDays" type="number" min="1" value="'+E(s.violation_expiry_days||30)+'"></label></div><div class="live-note">Die Gültigkeitsdauer bestimmt, wie lange Law-14-Fälle zur aktuellen Stufe zählen. Nach Ablauf wird die Stufe automatisch neu berechnet. Eine reine Änderung dieser Dauer erzeugt keinen zusätzlichen Activity-Log-Eintrag.</div><button class="btn primary">Speichern</button><div id="liveSettingsStatus" class="live-status"></div></form></div></section><section class="card"><div class="card-head"><div><div class="card-title">Allianz</div></div></div><div class="card-body"><div class="live-stat"><b>'+E(S.a)+'</b><small>eingeloggte Allianz</small></div></div></section></div></div>'+
 '<div id="liveSettingsEvents" hidden><section class="card"><div class="card-head"><div><div class="card-title">Event-Verfügbarkeit</div><div class="card-sub">Automatische Fenster plus manuelle Freigabe.</div></div></div><div class="card-body live-list">'+events.map(ev=>{const auto=opts.some(x=>x.event_name===ev),always=ev==='Swordland Showdown'||ev==='Tri-Alliance Clash',manual=over[ev]===true;return '<div class="live-row"><div><b>'+E(ev)+'</b><small>'+(always?'immer offen':auto?'automatisch offen':manual?'manuell offen':'geschlossen')+'</small></div>'+(always?'<span class="pill blue">immer</span>':'<button class="btn small secondary live-event-override" data-event="'+E(ev)+'" data-enabled="'+(manual?'1':'0')+'">'+(manual?'Freigabe entfernen':'manuell aktivieren')+'</button>')+'</div>'}).join('')+'</div></section></div>'+
 '<div id="liveSettingsTargets" hidden><section class="card"><div class="card-head"><div><div class="card-title">Law-14 Zielwerte</div><div class="card-sub">Aktuelle persönliche Zielwerte je Event/Phase.</div></div></div><div class="card-body"><form id="liveTargetsForm" class="live-form"><div class="live-list">'+settingTargetRows2()+'</div><button class="btn primary">Zielwerte speichern</button><div id="liveTargetsStatus" class="live-status"></div></form></div></section></div>'+
 '<div id="liveSettingsPerformance" hidden><div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">KvK Top 200</div></div></div><div class="card-body"><button id="liveFeatKvk" class="btn secondary">'+(features?.kvk_top200_enabled!==false?'✓ sichtbar':'ausgeblendet')+'</button></div></section><section class="card"><div class="card-head"><div><div class="card-title">Alliance Mobilization</div></div></div><div class="card-body"><button id="liveFeatMob" class="btn secondary">'+(features?.mobilization_enabled!==false?'✓ sichtbar':'ausgeblendet')+'</button></div></section></div></div>';
 const panels={general:'liveSettingsGeneral',events:'liveSettingsEvents',targets:'liveSettingsTargets',performance:'liveSettingsPerformance'};v.querySelectorAll('[data-settab]').forEach(b=>b.onclick=()=>{v.querySelectorAll('[data-settab]').forEach(x=>x.classList.toggle('active',x===b));Object.entries(panels).forEach(([k,id])=>document.getElementById(id).hidden=k!==b.dataset.settab)});
 document.getElementById('liveSettingsForm').onsubmit=saveGeneralSettings2;document.getElementById('liveTargetsForm').onsubmit=saveTargets2;v.querySelectorAll('.live-event-override').forEach(b=>b.onclick=()=>toggleEventOverride2(b));document.getElementById('liveFeatKvk').onclick=()=>toggleFeature2('kvk');document.getElementById('liveFeatMob').onclick=()=>toggleFeature2('mob');
}
async function upsertSettings2(body){return q(C.u+'/rest/v1/alliance_settings?alliance_code=eq.'+encodeURIComponent(S.a),{method:'PATCH',headers:{...(await h(true)),Prefer:'return=representation'},body:JSON.stringify({...body,updated_at:new Date().toISOString()})})}
async function saveGeneralSettings2(e){e.preventDefault();const out=document.getElementById('liveSettingsStatus');out.textContent=actionWord2('saving');try{const rows=await upsertSettings2({warning_window_days:Number(document.getElementById('liveWarnDays').value)||7,violation_expiry_days:Number(document.getElementById('liveExpiryDays').value)||30});S.settings={...S.settings,...rows?.[0]};out.textContent=actionWord2('saved')}catch(err){out.textContent=err.message||String(err)}}
async function saveTargets2(e){e.preventDefault();const out=document.getElementById('liveTargetsStatus'),targets={...(S.settings?.event_targets||{})};document.querySelectorAll('.live-target-input').forEach(i=>targets[i.dataset.key]=i.value?Number(i.value):null);out.textContent=actionWord2('saving');try{const rows=await upsertSettings2({event_targets:targets});S.settings={...S.settings,...rows?.[0]};out.textContent=actionWord2('saved')}catch(err){out.textContent=err.message||String(err)}}
async function toggleEventOverride2(btn){try{await rpc('set_manual_event_entry_override',{p_event_name:btn.dataset.event,p_enabled:btn.dataset.enabled!=='1'});await load();renderSettingsLive()}catch(err){alert(err.message||String(err))}}
async function toggleFeature2(which){const f=S.features||{kvk_top200_enabled:true,mobilization_enabled:true},next={kvk_top200_enabled:f.kvk_top200_enabled!==false,mobilization_enabled:f.mobilization_enabled!==false};if(which==='kvk')next.kvk_top200_enabled=!next.kvk_top200_enabled;else next.mobilization_enabled=!next.mobilization_enabled;try{S.features=await rpc('set_performance_feature_settings',{p_kvk_top200_enabled:next.kvk_top200_enabled,p_mobilization_enabled:next.mobilization_enabled});await renderSettingsLive()}catch(err){alert(err.message||String(err))}}



/* === SUPPORT LIVE V2 === */
const SUPPORT_WORDS2={
 de:{kicker:'SUPPORT · LIVE',title:'Problem melden oder Frage stellen.',sub:'Beschreibe den Sachverhalt möglichst genau. Screenshots helfen bei der Prüfung.',safeTitle:'Prüfen statt automatisch ändern',safe:'Supportmeldungen ändern niemals automatisch Spieler, Verstöße, Sanktionen oder Einstellungen. Der Fall wird zuerst geprüft und das weitere Vorgehen abgestimmt.',newTicket:'Neue Support-Anfrage',category:'Kategorie',subject:'Betreff',message:'Beschreibung',screens:'Screenshots',screenHint:'Optional · PNG/JPEG/WebP · max. 3 Dateien pro Nachricht · 5 MB je Bild',send:'Anfrage senden',sending:'Wird gesendet …',sent:'✓ Support-Anfrage gespeichert',mine:'Deine Support-Fälle',none:'Noch keine Support-Anfragen.',reply:'Nachricht ergänzen',replyPlaceholder:'Weitere Informationen …',replySend:'Senden',support:'Support',alliance:'Allianz',new:'Neu',reviewing:'Wird geprüft',awaiting_user:'Rückfrage',resolved:'Gelöst',problem:'Problem / Fehler',data:'Datenfehler',ui:'Anzeige / Übersetzung',question:'Frage',other:'Sonstiges',image:'Screenshot',fileType:'Nur PNG, JPEG oder WebP sind erlaubt.',fileSize:'Ein Screenshot darf höchstens 5 MB groß sein.',sentPartial:'✓ Support-Anfrage gespeichert. {count} Screenshot(s) konnten nicht gespeichert werden.',replySaved:'✓ Nachricht gespeichert',replyPartial:'✓ Nachricht gespeichert. {count} Screenshot(s) konnten nicht gespeichert werden.'},
 en:{kicker:'SUPPORT · LIVE',title:'Report a problem or ask a question.',sub:'Describe the issue as precisely as possible. Screenshots help with review.',safeTitle:'Review first, no automatic changes',safe:'Support reports never automatically change players, violations, sanctions or settings. The case is reviewed first and the next step is discussed.',newTicket:'New support request',category:'Category',subject:'Subject',message:'Description',screens:'Screenshots',screenHint:'Optional · PNG/JPEG/WebP · max. 3 files per message · 5 MB each',send:'Send request',sending:'Sending …',sent:'✓ Support request saved',mine:'Your support cases',none:'No support requests yet.',reply:'Add message',replyPlaceholder:'Additional information …',replySend:'Send',support:'Support',alliance:'Alliance',new:'New',reviewing:'Under review',awaiting_user:'Question pending',resolved:'Resolved',problem:'Problem / bug',data:'Data issue',ui:'Display / translation',question:'Question',other:'Other',image:'Screenshot',fileType:'Only PNG, JPEG or WebP screenshots are allowed.',fileSize:'A screenshot must be 5 MB or smaller.',sentPartial:'✓ Support request saved. {count} screenshot(s) could not be saved.',replySaved:'✓ Message saved',replyPartial:'✓ Message saved. {count} screenshot(s) could not be saved.'},
 fr:{kicker:'SUPPORT · LIVE',title:'Signaler un problème ou poser une question.',sub:'Décrivez le cas le plus précisément possible. Les captures facilitent la vérification.',safeTitle:'Vérifier avant toute modification',safe:'Les demandes Support ne modifient jamais automatiquement joueurs, infractions, sanctions ou paramètres. Le cas est d’abord vérifié et la suite est discutée.',newTicket:'Nouvelle demande',category:'Catégorie',subject:'Objet',message:'Description',screens:'Captures',screenHint:'Facultatif · PNG/JPEG/WebP · max. 3 fichiers · 5 Mo par image',send:'Envoyer',sending:'Envoi …',sent:'✓ Demande enregistrée',mine:'Vos demandes Support',none:'Aucune demande Support.',reply:'Ajouter un message',replyPlaceholder:'Informations supplémentaires …',replySend:'Envoyer',support:'Support',alliance:'Alliance',new:'Nouveau',reviewing:'En cours de vérification',awaiting_user:'Question en attente',resolved:'Résolu',problem:'Problème / bug',data:'Erreur de données',ui:'Affichage / traduction',question:'Question',other:'Autre',image:'Capture',fileType:'Seuls PNG, JPEG ou WebP sont autorisés.',fileSize:'Une capture ne doit pas dépasser 5 Mo.',sentPartial:'✓ Demande enregistrée. {count} capture(s) n’ont pas pu être enregistrées.',replySaved:'✓ Message enregistré',replyPartial:'✓ Message enregistré. {count} capture(s) n’ont pas pu être enregistrées.'},
 es:{kicker:'SUPPORT · LIVE',title:'Reportar un problema o hacer una pregunta.',sub:'Describe el caso con el mayor detalle posible. Las capturas ayudan a revisarlo.',safeTitle:'Revisar antes de cambiar',safe:'Las solicitudes de Support nunca modifican automáticamente jugadores, infracciones, sanciones o ajustes. Primero se revisa el caso y se acuerda el siguiente paso.',newTicket:'Nueva solicitud',category:'Categoría',subject:'Asunto',message:'Descripción',screens:'Capturas',screenHint:'Opcional · PNG/JPEG/WebP · máx. 3 archivos · 5 MB por imagen',send:'Enviar',sending:'Enviando …',sent:'✓ Solicitud guardada',mine:'Tus casos de Support',none:'Aún no hay solicitudes.',reply:'Añadir mensaje',replyPlaceholder:'Información adicional …',replySend:'Enviar',support:'Support',alliance:'Alianza',new:'Nuevo',reviewing:'En revisión',awaiting_user:'Pregunta pendiente',resolved:'Resuelto',problem:'Problema / bug',data:'Error de datos',ui:'Visualización / traducción',question:'Pregunta',other:'Otro',image:'Captura',fileType:'Solo se permiten PNG, JPEG o WebP.',fileSize:'Cada captura debe tener 5 MB o menos.',sentPartial:'✓ Solicitud guardada. No se pudieron guardar {count} captura(s).',replySaved:'✓ Mensaje guardado',replyPartial:'✓ Mensaje guardado. No se pudieron guardar {count} captura(s).'}
};
let supportFlash2=null;
function supportWords2(){return SUPPORT_WORDS2[L()]||SUPPORT_WORDS2.de}
function supportFormat2(text,vars={}){let s=String(text||'');for(const [k,v] of Object.entries(vars))s=s.replaceAll('{'+k+'}',String(v));return s}
function supportStatus2(status){const w=supportWords2();return w[status]||status||w.new}
function supportCategory2(cat){const w=supportWords2();return w[cat]||cat||w.other}
async function loadSupport2(){
 const [tickets,messages,evidence]=await Promise.all([
  rpc('get_my_support_tickets',{}),
  rpc('get_my_support_ticket_messages',{}),
  rpc('get_my_support_ticket_evidence',{})
 ]);
 S.supportTickets=tickets||[];S.supportMessages=messages||[];S.supportEvidence=evidence||[];
}
function supportEvidenceFor2(ticketId){return (S.supportEvidence||[]).filter(x=>String(x.ticket_id)===String(ticketId))}
function supportMessagesFor2(ticketId){return (S.supportMessages||[]).filter(x=>String(x.ticket_id)===String(ticketId))}
async function hydrateSupportImages2(root){
 const imgs=[...root.querySelectorAll('[data-support-evidence-path]')];
 await Promise.all(imgs.map(async img=>{
  try{
   const url=await signStorage2('support-evidence',img.dataset.supportEvidencePath);
   if(url){img.src=url;img.closest('a').href=url}
  }catch(e){console.warn('support evidence',e)}
 }));
}
function validateSupportFiles2(fileList){
 const w=supportWords2(),files=[...fileList].slice(0,3);
 for(const file of files){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error(w.fileType);
  if(file.size>5242880)throw Error(w.fileSize);
 }
 return files;
}
async function uploadSupportFiles2(ticketId,fileList){
 const files=validateSupportFiles2(fileList),failed=[];
 for(const file of files){
  try{
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const path=S.a+'/'+ticketId+'/'+crypto.randomUUID()+'.'+ext;
   await uploadStorage2('support-evidence',path,file);
   await rpc('add_support_ticket_evidence',{p_ticket_id:ticketId,p_storage_path:path,p_file_name:file.name||('screenshot.'+ext),p_mime_type:file.type,p_size_bytes:file.size});
  }catch(err){failed.push({file,error:err})}
 }
 return failed;
}
async function createSupportTicket2(e){
 e.preventDefault();const w=supportWords2(),form=e.currentTarget,out=form.querySelector('.live-status'),btn=form.querySelector('button[type="submit"]');
 let files;try{files=validateSupportFiles2(form.querySelector('[name="screens"]').files)}catch(err){out.textContent=err.message||String(err);return}
 out.textContent=w.sending;btn.disabled=true;
 try{
  const tid=await rpc('create_support_ticket',{p_category:form.querySelector('[name="category"]').value,p_subject:form.querySelector('[name="subject"]').value.trim(),p_message:form.querySelector('[name="message"]').value.trim()});
  const failed=files.length?await uploadSupportFiles2(tid,files):[];
  form.reset();supportFlash2=failed.length?supportFormat2(w.sentPartial,{count:failed.length}):w.sent;
  await renderSupportLive();
 }catch(err){out.textContent=err.message||String(err)}
 finally{btn.disabled=false}
}
async function addSupportMessage2(e){
 e.preventDefault();const w=supportWords2(),form=e.currentTarget,input=form.querySelector('textarea'),btn=form.querySelector('button'),out=form.querySelector('.live-status');
 const msg=input.value.trim();if(!msg)return;
 let files;try{files=validateSupportFiles2(form.querySelector('input[type="file"]')?.files||[])}catch(err){out.textContent=err.message||String(err);return}
 btn.disabled=true;out.textContent=w.sending;
 try{
  await rpc('add_support_ticket_message',{p_ticket_id:form.dataset.ticketId,p_message:msg});
  const failed=files.length?await uploadSupportFiles2(form.dataset.ticketId,files):[];
  input.value='';const fi=form.querySelector('input[type="file"]');if(fi)fi.value='';
  supportFlash2=failed.length?supportFormat2(w.replyPartial,{count:failed.length}):w.replySaved;
  await renderSupportLive();
 }catch(err){out.textContent=err.message||String(err)}
 finally{btn.disabled=false}
}
async function renderSupportLive(){
 const v=document.getElementById('view-support');if(!v)return;const w=supportWords2();
 v.innerHTML='<div class="hero"><div><div class="kicker">'+E(w.kicker)+'</div><h1>'+E(w.title)+'</h1><p>'+E(w.sub)+'</p></div></div><div class="live-empty-state">…</div>';
 try{await loadSupport2()}catch(err){v.innerHTML+='<div class="live-empty-state">'+E(err.message||String(err))+'</div>';return}
 const tickets=S.supportTickets||[],flash=supportFlash2;supportFlash2=null;
 v.innerHTML='<div class="hero"><div><div class="kicker">'+E(w.kicker)+'</div><h1>'+E(w.title)+'</h1><p>'+E(w.sub)+'</p></div></div>'+(flash?'<div class="live-note" style="margin-bottom:14px">'+E(flash)+'</div>':'')+
 '<div class="live-note support-safety-note" style="margin-bottom:14px"><b>'+E(w.safeTitle)+'</b><br>'+E(w.safe)+'</div>'+
 '<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">'+E(w.newTicket)+'</div></div></div><div class="card-body"><form id="liveSupportCreate" class="live-form">'+
 '<label>'+E(w.category)+'<select name="category"><option value="problem">'+E(w.problem)+'</option><option value="data">'+E(w.data)+'</option><option value="ui">'+E(w.ui)+'</option><option value="question">'+E(w.question)+'</option><option value="other">'+E(w.other)+'</option></select></label>'+
 '<label>'+E(w.subject)+'<input name="subject" maxlength="120" required></label>'+
 '<label>'+E(w.message)+'<textarea name="message" maxlength="4000" required></textarea></label>'+
 '<label>'+E(w.screens)+'<input name="screens" type="file" accept="image/png,image/jpeg,image/webp" multiple><small>'+E(w.screenHint)+'</small></label>'+
 '<button class="btn primary" type="submit">'+E(w.send)+'</button><div class="live-status"></div></form></div></section>'+
 '<section class="card"><div class="card-head"><div><div class="card-title">'+E(w.mine)+'</div></div><span class="pill">'+tickets.length+'</span></div><div class="card-body"><div class="live-note">'+E(w.safe)+'</div></div></section></div>'+
 '<div style="margin-top:14px">'+(tickets.length?tickets.map(tk=>{
   const msgs=supportMessagesFor2(tk.id),ev=supportEvidenceFor2(tk.id);
   return '<section class="card support-ticket"><div class="card-head"><div><div class="card-title">'+E(tk.subject)+'</div><div class="card-sub">'+E(supportCategory2(tk.category))+' · '+E(D(tk.created_at))+'</div></div><span class="pill '+(tk.status==='resolved'?'green':tk.status==='awaiting_user'?'gold':'blue')+'">'+E(supportStatus2(tk.status))+'</span></div><div class="card-body">'+
    '<div class="support-thread">'+msgs.map(m=>'<div class="support-msg '+(m.sender_type==='support'?'support':'alliance')+'"><b>'+E(m.sender_type==='support'?w.support:(S.a||w.alliance))+'</b><div>'+E(m.message).replace(/\n/g,'<br>')+'</div><small>'+E(D(m.created_at))+'</small></div>').join('')+'</div>'+
    (ev.length?'<div class="support-evidence-grid">'+ev.map(x=>'<a target="_blank" rel="noopener" title="'+E(x.file_name)+'"><img alt="'+E(w.image)+'" data-support-evidence-path="'+E(x.storage_path)+'"></a>').join('')+'</div>':'')+
    '<form class="live-form live-support-reply" data-ticket-id="'+E(tk.id)+'" style="margin-top:12px"><label>'+E(w.reply)+'<textarea maxlength="4000" placeholder="'+E(w.replyPlaceholder)+'"></textarea></label><label>'+E(w.screens)+'<input type="file" accept="image/png,image/jpeg,image/webp" multiple><small>'+E(w.screenHint)+'</small></label><button class="btn small secondary" type="submit">'+E(w.replySend)+'</button><div class="live-status"></div></form>'+
   '</div></section>';
  }).join(''):'<div class="live-empty-state">'+E(w.none)+'</div>')+'</div>';
 document.getElementById('liveSupportCreate').onsubmit=createSupportTicket2;
 v.querySelectorAll('.live-support-reply').forEach(form=>form.onsubmit=addSupportMessage2);
 hydrateSupportImages2(v).catch(e=>console.warn('support images',e));
}

/* === PLAYER FILES + NOTIFICATIONS + VIEW ROUTER LIVE V2 === */
const LANG_OPTIONS2=[
 ['de','Deutsch'],['en','English'],['fr','Français'],['es','Español'],['tr','Türkçe'],
 ['it','Italiano'],['pt','Português'],['pl','Polski'],['nl','Nederlands'],['sv','Svenska'],
 ['no','Norsk'],['da','Dansk'],['fi','Suomi'],['cs','Čeština'],['hu','Magyar'],['ro','Română'],
 ['bg','Български'],['ru','Русский'],['uk','Українська'],['ar','العربية'],['fa','فارسی'],
 ['he','עברית'],['zh','中文'],['ja','日本語'],['ko','한국어'],['id','Bahasa Indonesia'],
 ['ms','Bahasa Melayu'],['vi','Tiếng Việt'],['th','ไทย'],['duck','Duck']
];
function languageName2(code){return LANG_OPTIONS2.find(x=>x[0]===String(code||'').toLowerCase())?.[1]||String(code||'')}
async function renderWelcomeLanguageQueue2(){
 if(S.a!=='NRW')return;
 document.getElementById('liveWelcomeLanguageQueue')?.remove();
 const grid=document.getElementById('playerGrid');if(!grid?.parentElement)return;
 const panel=document.createElement('details');panel.id='liveWelcomeLanguageQueue';panel.className='card';panel.style.marginBottom='12px';
 panel.innerHTML='<summary style="display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;padding:12px 14px"><span><b>🌐 Offene Spracheingaben</b><small style="display:block;color:var(--muted);margin-top:2px">Nicht automatisch zugeordnete Angaben aus der NRW-Welcome-Seite.</small></span><span class="pill gold" id="liveWelcomeLangCount">…</span></summary><div class="card-body live-list" id="liveWelcomeLangBody"><div class="live-empty-state">Wird geladen …</div></div>';
 grid.parentElement.insertBefore(panel,grid);
 try{
   const rows=await tab('welcome_language_submissions','select=id,player_name,player_id,languages,status,first_submitted_at,last_submitted_at,submission_count&status=eq.pending&order=last_submitted_at.desc');
   document.getElementById('liveWelcomeLangCount').textContent=String(rows?.length||0);
   const body=document.getElementById('liveWelcomeLangBody');
   body.innerHTML=(rows||[]).length?rows.map(r=>'<div class="live-row"><div><b>'+E(r.player_name||'–')+'</b><small>Player ID '+E(r.player_id||'–')+' · '+E(D(r.last_submitted_at))+' · '+E((r.languages||[]).map(languageName2).join(' / '))+'</small></div><span class="pill gold">'+E(r.submission_count||1)+'×</span></div>').join(''):'<div class="live-empty-state">Keine offenen Spracheingaben.</div>';
 }catch(err){document.getElementById('liveWelcomeLangBody').innerHTML='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}
}
function languageEditor2(P){
 const selected=new Set((P.languages||[]).map(x=>String(x).toLowerCase()));
 return '<details class="live-language-editor"><summary>🌐 Sprachen bearbeiten</summary><div class="live-language-grid">'+LANG_OPTIONS2.map(x=>'<label class="live-language-option"><input type="checkbox" value="'+E(x[0])+'" '+(selected.has(x[0])?'checked':'')+'><span>'+E(x[1])+'</span></label>').join('')+'</div><div class="hero-actions" style="margin-top:10px"><button type="button" class="btn secondary" id="liveSaveLanguages">Sprachen speichern</button><span id="liveLanguageStatus" class="live-status"></span></div></details>';
}
async function saveLanguages2(P){
 const out=document.getElementById('liveLanguageStatus'),langs=[...document.querySelectorAll('.live-language-option input:checked')].map(x=>x.value);if(out)out.textContent=actionWord2('saving');
 try{
   const rows=await upd('players',P.id,{languages:langs}),updated=rows?.[0]||{...P,languages:langs},idx=S.p.findIndex(x=>x.id===P.id);if(idx>=0)S.p[idx]=updated;
   if(out)out.textContent=actionWord2('saved');
   const line=document.querySelector('.profile-alliance-line');if(line)line.innerHTML='Player ID '+E(updated.game_id||'–')+' · '+allianceBadge2(S.a)+' · '+E(langs.map(languageName2).join(' / ')||'–');
 }catch(err){if(out)out.textContent=err.message||String(err)}
}
function renderPlayers2(){
 const g=document.getElementById('playerGrid');if(!g)return;
 const w=playerCaseWords2();
 g.innerHTML=S.p.map(P=>{
  const name=P.name||P.player_name||'',V=vv(name),law=V.filter(isLaw14Case2),internal=V.filter(isInternalCase2),
   state=sanctionState2(name),l=state.level,last=V[0],
   status=sanctionStatus2(state.currentSanction,state.currentViolation),val=status.short;
  return '<div class="player-card" data-p="'+E(name)+'" data-has-entry="'+(V.length||ss(name).length?'1':'0')+'" data-attendance="'+(internal.length?'1':'0')+'" data-search="'+E((name+' '+(P.game_id||'')).toLowerCase())+'">'+
   '<div class="player-card-top"><div class="player-meta">'+avatarHtml(P,'player-avatar')+'<div><div class="player-name">'+E(name)+'</div><div class="player-id">'+E(P.game_id||'–')+'</div></div></div>'+allianceBadge2(S.a)+'</div>'+
   '<div class="metric-row"><div class="metric"><b>'+law.length+'</b><span>'+E(w.law)+'</span></div><div class="metric"><b>'+l+'</b><span>'+E(w.stage)+'</span></div><div class="metric"><b>'+E(val)+'</b><span>'+E(w.status)+'</span></div></div>'+
   '<div class="player-card-foot">'+(internal.length?'<span class="pill blue">'+E(w.internal)+' · '+internal.length+'</span>':'<span></span>')+'<span class="muted tiny">'+(last?E(D(last.occurred_at)):'–')+'</span></div></div>';
 }).join('')||'<div class="live-empty-state">Keine Spieler.</div>';
 g.querySelectorAll('[data-p]').forEach(c=>c.onclick=()=>openProfile2(c.dataset.p));if(typeof applyPlayerFilters==='function')applyPlayerFilters();renderWelcomeLanguageQueue2();
}
function violationRule2(v){
 const phases=PHASES2[v.event_name]||[];
 return phases.find(x=>x[0]===v.phase_name)||[v.phase_name||'general',v.phase_name||'General',v.target_value??null];
}
function openViolationEditor2(id){
 const v=S.v.find(x=>String(x.id)===String(id));if(!v)return;
 document.getElementById('liveViolationEditModal')?.remove();
 const modal=document.createElement('div');modal.id='liveViolationEditModal';modal.className='modal-backdrop';
 const events=Object.keys(PHASES2),date=new Date(v.occurred_at);const local=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
 modal.innerHTML='<div class="modal-card"><div class="modal-head"><div><b>Verstoß korrigieren</b><small>'+E(v.player_name)+' · '+E(v.event_name||'')+'</small></div><button class="icon-btn" id="liveVioEditClose">×</button></div>'+
 '<form id="liveVioEditForm" class="live-form"><label>Spieler<input id="liveVioPlayer" value="'+E(v.player_name)+'" required></label>'+
 '<label>Event<select id="liveVioEvent">'+events.map(ev=>'<option '+(ev===v.event_name?'selected':'')+'>'+E(ev)+'</option>').join('')+'</select></label>'+
 '<label>Phase<select id="liveVioPhase"></select></label>'+
 '<div class="live-form-row" id="liveVioScoreRow"><label>Ziel<input id="liveVioTarget" inputmode="numeric" value="'+E(v.target_value??'')+'"></label><label>Punkte<input id="liveVioScore" inputmode="numeric" value="'+E(v.score??'')+'"></label></div>'+
 '<div id="liveVioThreshold" class="live-note"></div><label>Zeitpunkt<input id="liveVioOccurred" type="datetime-local" value="'+E(local)+'"></label><label>Notiz<textarea id="liveVioNote" maxlength="500">'+E(v.note||'')+'</textarea></label>'+
 '<div class="hero-actions"><button class="btn primary" type="submit">Änderungen speichern</button><button class="btn danger" id="liveDeleteViolation" type="button">Verstoß löschen</button></div><div id="liveVioEditStatus" class="live-status"></div></form></div>';
 document.body.appendChild(modal);
 const event=document.getElementById('liveVioEvent'),phase=document.getElementById('liveVioPhase');
 function sync(){
   const ev=event.value,arr=PHASES2[ev]||[['general','General',null]],old=phase.value||v.phase_name;
   phase.innerHTML=arr.map(x=>'<option value="'+E(x[0])+'" '+(x[0]===old?'selected':'')+'>'+E(x[1])+'</option>').join('');
   if(!arr.some(x=>x[0]===phase.value))phase.value=arr[0][0];
   const special=ev==='Swordland Showdown'||ev==='Tri-Alliance Clash';
   document.getElementById('liveVioScoreRow').hidden=special;document.getElementById('liveVioThreshold').hidden=special;
   if(ev!==v.event_name){const t=targetFor2(ev,phase.value);document.getElementById('liveVioTarget').value=t??''}
   updateViolationEditPreview2(v);
 }
 event.onchange=sync;phase.onchange=()=>updateViolationEditPreview2(v);document.getElementById('liveVioTarget').oninput=()=>updateViolationEditPreview2(v);document.getElementById('liveVioScore').oninput=()=>updateViolationEditPreview2(v);document.getElementById('liveVioOccurred').onchange=()=>updateViolationEditPreview2(v);
 document.getElementById('liveVioEditClose').onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove()};
 document.getElementById('liveVioEditForm').onsubmit=e=>saveViolationEdit2(e,v);
 document.getElementById('liveDeleteViolation').onclick=()=>deleteViolation2(v);
 sync();
}
function updateViolationEditPreview2(original){
 const ev=document.getElementById('liveVioEvent')?.value||'',ph=document.getElementById('liveVioPhase')?.value||'',target=Number(String(document.getElementById('liveVioTarget')?.value||'').replace(/\D/g,'')),score=Number(String(document.getElementById('liveVioScore')?.value||'').replace(/\D/g,'')),source=S.eventOptions?.find(x=>x.event_name===ev)?.source_event_id,mult=phaseMultiplier2(ev,ph,document.getElementById('liveVioOccurred')?.value||''),box=document.getElementById('liveVioThreshold');
 if(!box||box.hidden)return;box.textContent=target?'Grenze '+N(target*mult)+' ('+mult+'×)'+(score?(' · '+(score>target*mult?'Verstoß':'kein Verstoß')):''):'Zielwert fehlt';
}
async function saveViolationEdit2(e,old){
 e.preventDefault();const out=document.getElementById('liveVioEditStatus'),event=document.getElementById('liveVioEvent').value,phase=document.getElementById('liveVioPhase').value,special=event==='Swordland Showdown'||event==='Tri-Alliance Clash',target=special?null:Number(String(document.getElementById('liveVioTarget').value||'').replace(/\D/g,'')),score=special?0:Number(String(document.getElementById('liveVioScore').value||'').replace(/\D/g,'')),source=S.eventOptions?.find(x=>x.event_name===event)?.source_event_id,mult=phaseMultiplier2(event,phase,document.getElementById('liveVioOccurred').value);
 if(!special&&(!target||!(score>target*mult))){out.textContent='Der korrigierte Wert ist kein Verstoß mehr. Nutze „Verstoß löschen“. ';return}
 out.textContent=actionWord2('saving');
 try{
  const editedPlayer=document.getElementById('liveVioPlayer').value.trim();await rpc('update_violation_fast',{p_id:old.id,p_player_name:editedPlayer,p_event_name:event,p_phase_name:phase,p_kind:special?'swordland':'overspend',p_score:special?null:score,p_target_value:target,p_occurred_at:new Date(document.getElementById('liveVioOccurred').value).toISOString(),p_expiry_days:Number(S.settings?.violation_expiry_days||30),p_note:document.getElementById('liveVioNote').value.trim()||null});
  document.getElementById('liveViolationEditModal')?.remove();await load();await openProfile2(editedPlayer||old.player_name);
 }catch(err){out.textContent=err.message||String(err)}
}
const DELETE_REASON_WORDS2={
 de:{title:'Verstoß löschen',sub:'Die zugehörige Sanktionskette wird neu berechnet.',label:'Begründung',hint:'Mindestens 5 Zeichen. Die Begründung wird im Audit-Log gespeichert.',cancel:'Abbrechen',confirm:'Endgültig löschen',short:'Bitte eine Begründung mit mindestens 5 Zeichen eingeben.'},
 en:{title:'Delete violation',sub:'The linked sanction chain will be recalculated.',label:'Reason',hint:'At least 5 characters. The reason is stored in the audit log.',cancel:'Cancel',confirm:'Delete permanently',short:'Enter a reason with at least 5 characters.'},
 fr:{title:'Supprimer l’infraction',sub:'La chaîne de sanctions associée sera recalculée.',label:'Motif',hint:'Au moins 5 caractères. Le motif est enregistré dans le journal d’audit.',cancel:'Annuler',confirm:'Supprimer définitivement',short:'Saisissez un motif d’au moins 5 caractères.'},
 es:{title:'Eliminar infracción',sub:'Se recalculará la cadena de sanciones asociada.',label:'Motivo',hint:'Mínimo 5 caracteres. El motivo se guarda en el registro de auditoría.',cancel:'Cancelar',confirm:'Eliminar definitivamente',short:'Introduce un motivo de al menos 5 caracteres.'}
};
function askDeleteReason2(v){
 const w=DELETE_REASON_WORDS2[L()]||DELETE_REASON_WORDS2.de;
 document.getElementById('liveDeleteReasonModal')?.remove();
 return new Promise(resolve=>{
  const modal=document.createElement('div');modal.id='liveDeleteReasonModal';modal.className='modal-backdrop';
  modal.innerHTML='<div class="modal-card"><div class="modal-head"><div><b>'+E(w.title)+'</b><small>'+E(v.player_name||'–')+' · '+E(v.event_name||'')+'</small></div><button class="icon-btn live-delete-close" type="button">×</button></div>'+
   '<div class="live-form"><div class="notice warn">'+E(w.sub)+'</div><label>'+E(w.label)+'<textarea class="live-delete-reason" maxlength="500" rows="4" placeholder="'+E(w.hint)+'"></textarea></label>'+
   '<div class="hero-actions"><button class="btn secondary live-delete-cancel" type="button">'+E(w.cancel)+'</button><button class="btn danger live-delete-confirm" type="button">'+E(w.confirm)+'</button></div><div class="live-status live-delete-status"></div></div></div>';
  document.body.appendChild(modal);
  const close=val=>{modal.remove();resolve(val)};
  modal.querySelector('.live-delete-close').onclick=()=>close(null);
  modal.querySelector('.live-delete-cancel').onclick=()=>close(null);
  modal.onclick=e=>{if(e.target===modal)close(null)};
  modal.querySelector('.live-delete-confirm').onclick=()=>{
   const reason=modal.querySelector('.live-delete-reason').value.trim();
   if(reason.length<5){modal.querySelector('.live-delete-status').textContent=w.short;return}
   close(reason);
  };
  modal.querySelector('.live-delete-reason').focus();
 });
}
async function deleteViolation2(v){
 const reason=await askDeleteReason2(v);if(!reason)return;
 const out=document.getElementById('liveVioEditStatus');if(out)out.textContent=actionWord2('deleting');
 try{
  await rpc('delete_violation_fast',{p_id:v.id,p_reason:reason});
  document.getElementById('liveViolationEditModal')?.remove();
  await load();renderHomeFull2();renderPlayers2();await openProfile2(v.player_name);
 }catch(err){if(out)out.textContent=err.message||String(err)}
}
function profileStage2(l){
 const text={
 de:{labs:['Kontakt','R1','24h NAP OUT','Erweitert'],current:'aktuell'},
 en:{labs:['Contact','R1','24h NAP OUT','Extended'],current:'current'},
 fr:{labs:['Contact','R1','Exclusion 24 h','Prolongée'],current:'actuel'},
 es:{labs:['Contacto','R1','Exclusión 24 h','Ampliada'],current:'actual'}
 }[L()]||{labs:['Kontakt','R1','24h NAP OUT','Erweitert'],current:'aktuell'};
 const labs=text.labs;
 return '<div class="stage-progress stage-progress-loading"><div class="stage-progress-bar"><div class="stage-progress-fill" style="width:'+([0,12,38,66,100][l]||0)+'%"></div><div class="stage-marks">'+labs.map((_,i)=>'<span class="stage-mark '+(i+1<l?'done':i+1===l?'current':'')+'">'+(i+1)+'</span>').join('')+'</div></div><div class="stage-progress-labels">'+labs.map((x,i)=>'<span><b>'+E(x)+'</b><span>'+(i+1<l?'✓':i+1===l?E(text.current):'')+'</span></span>').join('')+'</div></div>';
}
function profileActionDone2(s){
 if(Number(s.level)===1){
  const v=S.v.find(v=>String(v.id)===String(s.violation_id));
  return !!(v?.contacted||s.completed);
 }
 return !!s.completed;
}
function profileActionLabel2(s){
 const v=Number(s.level)===1?S.v.find(v=>String(v.id)===String(s.violation_id)):null;
 return v?.contacted?t('contact'):profileActionDone2(s)?'erledigt':'offen';
}
const EXTENDED_ACTION_WORDS2={
 de:{notice:'Nur nach NAP-Abstimmung starten. Ohne Endzeit bleibt die Extended Exclusion aktiv, bis sie manuell beendet wird.',end:'Optionales Ende',start:'Extended Exclusion starten',confirm:'Extended NAP Exclusion jetzt starten?',badEnd:'Das optionale Ende muss in der Zukunft liegen.',started:'Extended Exclusion gestartet',endNow:'Extended beenden',endConfirm:'Extended NAP Exclusion jetzt beenden?',ended:'Extended Exclusion beendet'},
 en:{notice:'Start only after a NAP vote. Without an end time, the Extended Exclusion remains active until it is ended manually.',end:'Optional end',start:'Start Extended Exclusion',confirm:'Start the Extended NAP Exclusion now?',badEnd:'The optional end time must be in the future.',started:'Extended Exclusion started',endNow:'End Extended',endConfirm:'End the Extended NAP Exclusion now?',ended:'Extended Exclusion ended'},
 fr:{notice:'Démarrer uniquement après un vote NAP. Sans date de fin, l’exclusion prolongée reste active jusqu’à sa clôture manuelle.',end:'Fin facultative',start:'Démarrer l’exclusion prolongée',confirm:'Démarrer maintenant l’exclusion NAP prolongée ?',badEnd:'La fin facultative doit être dans le futur.',started:'Exclusion prolongée démarrée',endNow:'Terminer l’exclusion prolongée',endConfirm:'Terminer maintenant l’exclusion NAP prolongée ?',ended:'Exclusion prolongée terminée'},
 es:{notice:'Iniciar solo después de una votación NAP. Sin fecha de fin, la exclusión ampliada seguirá activa hasta que se cierre manualmente.',end:'Fin opcional',start:'Iniciar exclusión ampliada',confirm:'¿Iniciar ahora la exclusión NAP ampliada?',badEnd:'La fecha de fin opcional debe estar en el futuro.',started:'Exclusión ampliada iniciada',endNow:'Finalizar exclusión ampliada',endConfirm:'¿Finalizar ahora la exclusión NAP ampliada?',ended:'Exclusión ampliada finalizada'}
};
function extendedActionWords2(){return EXTENDED_ACTION_WORDS2[L()]||EXTENDED_ACTION_WORDS2.de}
async function startExtendedExclusion2(id,input){
 const s=S.x.find(x=>String(x.id)===String(id));if(!s||Number(s.level)!==4||s.started_at)return;
 const w=extendedActionWords2(),raw=input?.value?.trim()||'',end=raw?new Date(raw):null;
 if(end&&(Number.isNaN(end.getTime())||end<=new Date())){alert(w.badEnd);return}
 if(!confirm(w.confirm))return;
 try{
  await upd('sanctions',id,{started_at:new Date().toISOString(),end_at:end?end.toISOString():null,completed:true});
  await load();renderHomeFull2();renderPlayers2();
  if(document.getElementById('view-profile')?.classList.contains('active'))await openProfile2(s.player_name);
 }catch(err){alert(err.message||String(err))}
}
function profileActionCard2(s){
 const v=S.v.find(v=>String(v.id)===String(s.violation_id))||null;
 const status=sanctionStatus2(s,v),start=Number(s.level)===1?v?.contacted_at||s.started_at:s.started_at;
 const r1Missing=status.key==='timer_missing'&&Number(s.level)===2,
  l4Open=Number(s.level)===4&&!s.started_at,w4=extendedActionWords2();
 const remaining=status.key==='active'&&s.end_at?dur(new Date(s.end_at)-Date.now()):
   status.key==='expired'?(SANCTION_STATUS_WORDS2[L()]||SANCTION_STATUS_WORDS2.de).expired:'–';
 return '<article class="card" data-profile-sanction="'+E(s.id)+'"><div class="card-head"><div><div class="card-title">Stufe '+E(s.level)+' · '+E(Number(s.level)===2?'R1':Number(s.level)===3?'24h NAP OUT':Number(s.level)===4?'Extended':'Kontakt')+'</div><div class="card-sub">Erstellt '+E(D(s.created_at))+'</div></div><span class="pill '+E(status.cls)+'">'+E(status.label)+'</span></div><div class="card-body">'+(r1Missing?'<div class="notice warn" style="margin-bottom:10px">⚠ R1 bestätigt – individuelle Endzeit noch setzen.</div><div class="live-form-row"><label>Ende<input class="profile-r1-end" type="datetime-local" value="'+E(toLocalInput2(s.end_at))+'"></label><div style="display:flex;align-items:end"><button class="btn secondary profile-r1-save" data-id="'+E(s.id)+'">Timer setzen</button></div></div>':'')+(l4Open?'<div class="notice warn" style="margin-bottom:10px">⚠ '+E(w4.notice)+'</div><div class="live-form-row"><label>'+E(w4.end)+'<input class="profile-l4-end" type="datetime-local"></label><div style="display:flex;align-items:end"><button class="btn primary profile-l4-start" data-id="'+E(s.id)+'">'+E(w4.start)+'</button></div></div>':'')+'<div class="action-date-grid"><div><span>Start</span><b>'+E(D(start))+'</b></div><div><span>Ende</span><b>'+E(D(s.end_at))+'</b></div><div><span>Restzeit</span><b>'+E(remaining)+'</b></div><div><span>Status</span><b>'+E(status.label)+'</b></div></div></div></article>';
}
function bindProfileR1Timers2(){
 document.querySelectorAll('.profile-r1-save').forEach(b=>b.onclick=()=>setR1Timer2(b.dataset.id,b.closest('[data-profile-sanction]')?.querySelector('.profile-r1-end')));
 document.querySelectorAll('.profile-l4-start').forEach(b=>b.onclick=()=>startExtendedExclusion2(b.dataset.id,b.closest('[data-profile-sanction]')?.querySelector('.profile-l4-end')));
}

const SHARED_SPENDING_WORDS2={
 de:{
 title:'Shared Spending · Ausnahme',sub:'Nur bei tatsächlich gemeinsam verwendeten Ressourcen öffnen. Ohne Kennzeichnung läuft alles automatisch nach den normalen Regeln.',select:'Diese Verstöße als Ausnahme gemeinsam prüfen',pending:'Standard: keine Ausnahme markieren',shared:'Gemeinsame Ausgaben · 1 Sanktionsfall',separate:'Getrennte Ausgaben · getrennt zählen',reason:'Begründung / gemeinsam verwendete Ressourcen',hint:'Beide Events und Screenshots bleiben erhalten. Nur die zuständige Allianz entscheidet.',save:'Entscheidung speichern',confirm:'Die Sanktionsstufen werden neu berechnet. Eine vorhandene Maßnahme kann entfallen oder sich ändern; dies wird protokolliert. Wirklich als gemeinsame Ausgaben speichern?',success:'Shared-Spending-Entscheidung gespeichert.',needTwo:'Bitte mindestens zwei Verstöße aus unterschiedlichen Events desselben Tages wählen.',short:'Für gemeinsame Ausgaben bitte die Ressource kurz begründen (mindestens 8 Zeichen).',badge:'Shared Spending',source:'Mehrere Events · gemeinsame Ressourcen'
 },
 en:{
 title:'Shared Spending · exception',sub:'Open only when the same resources actually scored in multiple events. The normal process needs no decision.',select:'Review these violations as an exception',pending:'Default: no exception',shared:'Shared resources · 1 sanction case',separate:'Separate spending · count separately',reason:'Reason / shared resources',hint:'Both events and screenshots remain. Only the responsible alliance decides.',save:'Save decision',confirm:'Sanction levels will be recalculated. An existing action may disappear or change; this will be logged. Confirm shared spending?',success:'Shared Spending decision saved.',needTwo:'Select at least two violations from different events on the same day.',short:'Briefly explain the shared resources (at least 8 characters).',badge:'Shared Spending',source:'Multiple events · shared resources'
 },
 fr:{
 title:'Shared Spending · exception',sub:'Ouvrir uniquement si les mêmes ressources ont servi dans plusieurs événements. Aucune décision n’est nécessaire normalement.',select:'Examiner ces infractions comme exception',pending:'Par défaut : aucune exception',shared:'Ressources communes · 1 cas de sanction',separate:'Dépenses distinctes · compter séparément',reason:'Motif / ressources communes',hint:'Les deux événements et captures sont conservés. Seule l’alliance responsable décide.',save:'Enregistrer la décision',confirm:'Les niveaux de sanction seront recalculés. Une mesure existante peut disparaître ou changer ; cela sera journalisé. Confirmer les dépenses communes ?',success:'Décision Shared Spending enregistrée.',needTwo:'Sélectionnez au moins deux infractions de différents événements du même jour.',short:'Expliquez brièvement les ressources communes (au moins 8 caractères).',badge:'Shared Spending',source:'Plusieurs événements · ressources communes'
 },
 es:{
 title:'Shared Spending · excepción',sub:'Abrir solo si los mismos recursos puntuaron en varios eventos. El proceso habitual no requiere decisión.',select:'Revisar estas infracciones como excepción',pending:'Predeterminado: sin excepción',shared:'Recursos compartidos · 1 caso de sanción',separate:'Gastos separados · contar por separado',reason:'Motivo / recursos compartidos',hint:'Se conservan ambos eventos y las capturas. Solo decide la alianza responsable.',save:'Guardar decisión',confirm:'Se recalcularán los niveles de sanción. Una medida existente puede desaparecer o cambiar; quedará registrada. ¿Confirmar gastos compartidos?',success:'Decisión Shared Spending guardada.',needTwo:'Selecciona al menos dos infracciones de eventos distintos del mismo día.',short:'Describe brevemente los recursos compartidos (mínimo 8 caracteres).',badge:'Shared Spending',source:'Varios eventos · recursos compartidos'
 }
};
function sharedWords2(){return SHARED_SPENDING_WORDS2[L()]||SHARED_SPENDING_WORDS2.de}

function sharedSpendingPanel2(violations){
 const w=sharedWords2(),byDay=new Map();
 for(const v of violations||[]){
   if(v.kind!=='overspend')continue;
   const day=String(v.violation_day||String(v.occurred_at||'').slice(0,10));
   if(!day)continue;
   if(!byDay.has(day))byDay.set(day,[]);
   byDay.get(day).push(v);
 }
 const days=[...byDay].filter(([,a])=>a.length>=2&&new Set(a.map(v=>v.event_name)).size>=2);
 if(!days.length)return '';
 return '<details class="card live-shared-spending"><summary style="cursor:pointer;padding:14px 17px;list-style:revert"><b>'+E(w.title)+'</b><div class="card-sub">'+E(w.sub)+'</div></summary><div class="card-body live-list">'+
 days.map(([day,entries])=>{
   const date=new Date(day+'T00:00:00Z').toLocaleDateString(loc());
   const allIds=new Set(entries.map(v=>String(v.id)));
   const existing=(S.shared||[]).filter(x=>
     x.player_id===entries[0].player_id && String(x.violation_day)===day &&
     Array.isArray(x.violation_ids) && x.violation_ids.length>=2 &&
     x.violation_ids.every(id=>allIds.has(String(id)))
   ).sort((a,b)=>Number(b.status==='shared')-Number(a.status==='shared')||
     new Date(b.updated_at||0)-new Date(a.updated_at||0))[0];
   const selected=existing?existing.violation_ids.map(String):entries.slice(0,5).map(v=>String(v.id));
   const status=existing?.status||'pending';
   return '<form class="live-shared-form live-form" data-shared-day="'+E(day)+'" style="padding:11px;border:1px solid var(--line);border-radius:12px">'+
    '<b>'+E(date)+' · '+E(w.select)+'</b>'+
    entries.map((v,i)=>'<label class="live-shared-choice" style="display:flex;flex-direction:row;align-items:center;gap:9px"><input style="width:auto;min-height:0" type="checkbox" class="live-shared-violation" data-event="'+E(v.event_name||'')+'" value="'+E(v.id)+'" '+(selected.includes(String(v.id))?'checked':'')+'><span>'+E(v.event_name||'–')+' · '+E(v.phase_name||'')+' · '+N(v.score)+'</span></label>').join('')+
    '<select class="live-shared-status" aria-label="'+E(w.title)+'">'+
      ['pending','shared','separate'].map(k=>'<option value="'+k+'" '+(status===k?'selected':'')+'>'+E(w[k])+'</option>').join('')+
    '</select>'+
    '<label>'+E(w.reason)+'<textarea class="live-shared-reason" maxlength="500" rows="2">'+E(existing?.reason||'')+'</textarea></label>'+
    '<div class="live-note">'+E(w.hint)+'</div>'+
    '<div class="hero-actions"><button class="btn small primary" type="submit">'+E(w.save)+'</button><span class="live-status live-shared-output"></span></div>'+
    '</form>';
 }).join('')+'</div></details>';
}
async function saveSharedSpending2(form,name){
 const w=sharedWords2(),out=form.querySelector('.live-shared-output'),
 ids=[...form.querySelectorAll('.live-shared-violation:checked')].map(c=>c.value),
 events=[...form.querySelectorAll('.live-shared-violation:checked')].map(c=>c.dataset.event);
 const status=form.querySelector('.live-shared-status').value;
 const reason=form.querySelector('.live-shared-reason').value.trim();
 if(ids.length<2||ids.length>5||new Set(events).size<2){
   out.textContent=w.needTwo;return;
 }
 if(status==='shared'&&reason.length<8){out.textContent=w.short;return}
 if(status==='shared'&&!window.confirm(w.confirm))return;
 out.textContent='…';const btn=form.querySelector('button[type="submit"]');btn.disabled=true;
 try{
   await rpc('decide_shared_spending',{p_violation_ids:ids,p_status:status,p_reason:reason});
   await load();renderHomeFull2();renderPlayers2();
   await openProfile2(name);
   document.querySelector('[data-live-profiletab="violations"]')?.click();
 }catch(err){out.textContent=err.message||String(err);btn.disabled=false}
}
function profileWords2(){
 const d={
 de:{back:'← Spielerakten',head:'SPIELERPROFIL',overview:'Übersicht',violations:'Fälle',actions:'Maßnahmen',performance:'Performance',comments:'Kommentare',history:'Historie',points:'Punkte',limit:'Grenze',contact:'Kontakt',open:'offen',fix:'✎ Korrigieren',attend:'Intern · keine Law 14',internalNote:'Interner Allianzfall. Dieser Eintrag erzeugt keine Law-14-Stufe oder NAP-Sanktion.',shot:'Screenshots zum Verstoß',noShot:'Kein Screenshot zu diesem Verstoß gespeichert.',failedShot:'Screenshot konnte nicht geladen werden.',note:'Kommentar / Notiz zum Verstoß',file:'Weitere Aktenkommentare zum Spieler',notLinked:'Diese Aktenkommentare sind nicht einem einzelnen Verstoß zugeordnet.',noFile:'Keine weiteren Aktenkommentare.',frame:'Videoposition',none:'Keine Verstöße.',import:'Aus einem früheren NAP-weiten ScreenRecording-Test importiert.'},
 en:{back:'← Player files',head:'PLAYER PROFILE',overview:'Overview',violations:'Cases',actions:'Actions',performance:'Performance',comments:'Comments',history:'History',points:'Points',limit:'Limit',contact:'Contact',open:'open',fix:'✎ Correct',attend:'Internal · not Law 14',internalNote:'Internal alliance case. This entry does not create a Law 14 level or NAP sanction.',shot:'Violation screenshots',noShot:'No screenshot stored for this violation.',failedShot:'Could not load screenshot.',note:'Violation comment / note',file:'Other player-file comments',notLinked:'These comments are not linked to an individual violation.',noFile:'No other player-file comments.',frame:'Video position',none:'No violations.',import:'Imported from an earlier NAP-wide ScreenRecording test.'},
 fr:{back:'← Dossiers joueurs',head:'PROFIL DU JOUEUR',overview:'Aperçu',violations:'Cas',actions:'Mesures',performance:'Performance',comments:'Commentaires',history:'Historique',points:'Points',limit:'Limite',contact:'Contact',open:'ouvert',fix:'✎ Corriger',attend:'Interne · pas loi 14',internalNote:'Cas interne à l’alliance. Cette entrée ne crée aucun niveau loi 14 ni sanction NAP.',shot:'Captures de l’infraction',noShot:'Aucune capture enregistrée pour cette infraction.',failedShot:'Impossible de charger la capture.',note:'Commentaire / note sur l’infraction',file:'Autres commentaires du dossier',notLinked:'Ces commentaires ne sont pas liés à une infraction précise.',noFile:'Aucun autre commentaire.',frame:'Position dans la vidéo',none:'Aucune infraction.',import:'Importé d’un ancien test ScreenRecording NAP.'},
 es:{back:'← Expedientes',head:'PERFIL DEL JUGADOR',overview:'Resumen',violations:'Casos',actions:'Medidas',performance:'Rendimiento',comments:'Comentarios',history:'Historial',points:'Puntos',limit:'Límite',contact:'Contacto',open:'pendiente',fix:'✎ Corregir',attend:'Interno · no Law 14',internalNote:'Caso interno de la alianza. Esta entrada no crea un nivel Law 14 ni una sanción NAP.',shot:'Capturas de la infracción',noShot:'No hay captura guardada para esta infracción.',failedShot:'No se pudo cargar la captura.',note:'Comentario / nota de la infracción',file:'Otros comentarios del expediente',notLinked:'Estos comentarios no están asociados a una infracción concreta.',noFile:'Sin otros comentarios.',frame:'Posición en el vídeo',none:'Sin infracciones.',import:'Importado de una prueba anterior de ScreenRecording NAP.'}
 };return d[L()]||d.de;
}
async function openProfile2(name){
 const P=p(name),V=vv(name),X=ss(name),l=level(name),view=document.getElementById('view-profile');if(!view)return;
 const w=profileWords2();
 view.innerHTML='<button class="btn small" data-go="players">'+E(w.back)+'</button>'+
 '<div class="profile-head" style="margin-top:12px"><div class="profile-main">'+avatarHtml(P,'profile-avatar')+'<div><div class="kicker">'+E(w.head)+'</div><div class="profile-name">'+E(name)+'</div><div class="muted small">Player ID '+E(P.game_id||'–')+' · <span class="pill">'+E(S.a)+'</span> · '+E((P.languages||[]).map(languageName2).join(' / ')||'–')+'</div></div></div></div>'+
 profileStage2(l)+
 '<div class="profile-tabs"><button class="profile-tab active" data-live-profiletab="overview">'+E(w.overview)+'</button><button class="profile-tab" data-live-profiletab="violations">'+E(w.violations)+'</button><button class="profile-tab" data-live-profiletab="actions">'+E(w.actions)+'</button><button class="profile-tab" data-live-profiletab="performance">'+E(w.performance)+'</button><button class="profile-tab" data-live-profiletab="comments">'+E(w.comments)+'</button><button class="profile-tab" data-live-profiletab="history">'+E(w.history)+'</button></div><div id="liveProfileBody"></div>';
 setViewBase2('profile');view.querySelectorAll('[data-live-profiletab]').forEach(b=>b.onclick=()=>{view.querySelectorAll('[data-live-profiletab]').forEach(x=>x.classList.toggle('active',x===b));paintProfileTab2(name,b.dataset.liveProfiletab)});await paintProfileTab2(name,'overview');
}
async function paintProfileTab2(name,tab){
 const body=document.getElementById('liveProfileBody');if(!body)return;const P=p(name),V=vv(name),X=ss(name),l=level(name),latest=X[0];
 if(tab==='overview'){
  const lawCases=V.filter(isLaw14Case2),internalCases=V.filter(isInternalCase2),cw=playerCaseWords2();
  body.innerHTML='<div class="live-panel-grid"><section class="card"><div class="card-head"><div><div class="card-title">Übersicht</div></div></div><div class="card-body"><div class="live-stat-grid"><div class="live-stat"><b>'+lawCases.length+'</b><small>'+E(cw.lawCases)+'</small></div><div class="live-stat"><b>'+lawCases.filter(active).length+'</b><small>'+E(cw.lawActive)+'</small></div><div class="live-stat"><b>'+internalCases.length+'</b><small>'+E(cw.internalCases)+'</small></div><div class="live-stat"><b>'+l+'</b><small>'+E(cw.stage)+'</small></div><div class="live-stat"><b>'+E((P.languages||[]).map(languageName2).join(' / ')||'–')+'</b><small>Sprachen</small></div></div>'+languageEditor2(P)+'<form id="livePlayerIdForm" class="live-form"><label>Player ID<input id="livePlayerId" value="'+E(P.game_id||'')+'" inputmode="numeric"></label><button class="btn secondary">Player ID speichern</button><div id="livePlayerIdStatus" class="live-status"></div></form></div></section><section>'+ (latest?profileActionCard2(latest):'<div class="live-empty-state">Keine Maßnahme vorhanden.</div>') +'</section></div>';
  document.getElementById('liveSaveLanguages')?.addEventListener('click',()=>saveLanguages2(P));bindProfileR1Timers2();document.getElementById('livePlayerIdForm').onsubmit=async e=>{e.preventDefault();const out=document.getElementById('livePlayerIdStatus');try{const d=await rpc('set_player_game_id',{p_player_name:name,p_game_id:document.getElementById('livePlayerId').value.replace(/\D/g,'')});if(d){const i=S.p.findIndex(x=>x.id===P.id);if(i>=0)S.p[i]=d}out.textContent=actionWord2('saved');await loadAvatars();renderPlayers2()}catch(err){out.textContent=err.message||String(err)}};return;
 }
 if(tab==='violations'){
  const w=profileWords2();
  body.innerHTML=sharedSpendingPanel2(V)+'<div class="live-list">'+(V.length?V.map(v=>'<article class="card" data-live-vio="'+E(v.id)+'"><div class="card-head"><div><div class="card-title">'+E(v.event_name||'–')+' · '+E(v.phase_name||'')+'</div><div class="card-sub">'+E(D(v.occurred_at))+(v.source_type?' · '+E(v.source_type):'')+'</div></div><div class="hero-actions">'+(v.shared_spending_group_id?'<span class="pill green">'+E(sharedWords2().badge)+'</span>':'')+'<span class="pill '+(isInternalCase2(v)?'blue':'red')+'">'+(isLaw14Case2(v)&&v.target_value?(Number(v.score)/Number(v.target_value)).toFixed(2)+'×':E(w.attend))+'</span><button class="btn small secondary live-edit-violation" data-id="'+E(v.id)+'">'+E(w.fix)+'</button></div></div><div class="card-body">'+(isInternalCase2(v)?'<div class="live-note"><b>'+E(w.attend)+'</b><p>'+E(w.internalNote)+'</p></div>':'<div class="action-date-grid"><div><span>'+E(w.points)+'</span><b>'+N(v.score)+'</b></div><div><span>'+E(w.limit)+'</span><b>'+(violationLimit2(v)?N(violationLimit2(v).points)+' ('+violationLimit2(v).multiplier+'×)':'–')+'</b></div><div><span>'+E(w.contact)+'</span><b>'+(v.contacted?'✓':E(w.open))+'</b></div></div>')+(v.note?'<div class="live-note live-violation-comment"><b>'+E(w.note)+'</b><p>'+E(v.note==='Imported from NAP-wide ScreenRecording test for selected event occurrence'?w.import:v.note)+'</p></div>':'')+'<div class="live-violation-proof"><b>'+E(w.shot)+'</b><div class="live-evidence" data-vio="'+E(v.id)+'"><div class="live-empty-state">'+E(w.noShot)+'</div></div></div></div></article>').join(''):'<div class="live-empty-state">'+E(w.none)+'</div>')+'</div><section class="card live-player-comments"><div class="card-head"><div><div class="card-title">'+E(w.file)+'</div><div class="card-sub">'+E(w.notLinked)+'</div></div></div><div class="card-body live-list" id="liveViolationPlayerComments"><div class="live-empty-state">'+E(w.noFile)+'</div></div></section>';
  body.querySelectorAll('.live-edit-violation').forEach(b=>b.onclick=()=>openViolationEditor2(b.dataset.id));
  body.querySelectorAll('.live-shared-form').forEach(form=>form.onsubmit=e=>{e.preventDefault();saveSharedSpending2(form,name)});
  const destination=body.querySelector('#liveViolationPlayerComments');
  // These are player-wide file comments, not evidence that a specific violation caused them.
  try{
   const comments=await rpc('get_player_file_comments',{p_player_id:P.id});
   if(destination&&destination.isConnected)destination.innerHTML=(comments||[]).length?comments.map(r=>'<div class="live-row"><div><b>'+E(r.author_alliance||S.a)+'</b><small>'+E(r.comment)+'</small></div><time class="muted tiny">'+E(D(r.created_at))+'</time></div>').join(''):'<div class="live-empty-state">'+E(w.noFile)+'</div>';
  }catch(err){console.warn('Player comments',err)}
  try{
   const evidence=await rpc('get_player_screen_evidence',{p_player_id:P.id});
   const grouped=new Map();
   for(const x of evidence||[]){const key=String(x.violation_id),rows=grouped.get(key)||[];rows.push(x);grouped.set(key,rows)}
   for(const [violationId,rows] of grouped){
    const box=body.querySelector('.live-evidence[data-vio="'+CSS.escape(violationId)+'"]');if(!box)continue;
    const html=[];
    for(const x of rows){try{
     const url=await signStorage2('screen-violation-evidence',x.storage_path);
     if(url)html.push('<a class="live-evidence-image" target="_blank" rel="noopener noreferrer" href="'+E(url)+'"><img src="'+E(url)+'" alt="'+E(w.shot)+'" decoding="async"><span>'+E(w.frame)+' · '+E(Number(x.frame_time_seconds||0).toFixed(1))+' s ↗</span></a>');
    }catch(err){console.warn('Evidence image',err)}}
    box.innerHTML=html.length?html.join(''):'<div class="live-empty-state">'+E(w.failedShot)+'</div>';
   }
  }catch(err){console.warn('Player evidence',err);body.querySelectorAll('.live-evidence').forEach(box=>box.innerHTML='<div class="live-empty-state">'+E(w.failedShot)+'</div>')}
  return;
 }
 if(tab==='actions'){body.innerHTML='<div class="live-list">'+(X.length?X.map(profileActionCard2).join(''):'<div class="live-empty-state">Keine Maßnahmen.</div>')+'</div>';bindProfileR1Timers2();return}
 if(tab==='performance'){body.innerHTML='<div class="live-empty-state">Performance wird geladen …</div>';try{const rows=await rpc('get_player_performance_history',{p_player_id:P.id});body.innerHTML='<div class="live-list">'+((rows||[]).length?rows.map(r=>'<div class="live-row"><div><b>'+E(r.performance_type==='kvk_prep'?'KvK Prep':'Alliance Mobilization')+'</b><small>'+E(monthYear2(r.period_start||r.period_end)||'Ohne Monat')+' · '+E(r.label||r.event_name||'')+(r.server_rank?' · Server #'+E(r.server_rank):'')+' · '+E(r.source_type||'')+'</small></div><strong>'+N(r.score)+'</strong></div>').join(''):'<div class="live-empty-state">Keine Performance-Daten.</div>')+'</div>'}catch(err){body.innerHTML='<div class="live-empty-state">'+E(err.message||String(err))+'</div>'}return}
 if(tab==='comments'){body.innerHTML='<section class="card"><div class="card-body"><form id="liveCommentForm" class="live-form"><label>Interner Aktenkommentar<textarea id="liveCommentText" maxlength="1000"></textarea></label><button class="btn primary">Kommentar speichern</button></form><div id="liveComments" class="live-list" style="margin-top:12px"></div></div></section>';const paint=async()=>{const rows=await rpc('get_player_file_comments',{p_player_id:P.id}),box=document.getElementById('liveComments');box.innerHTML=(rows||[]).length?rows.map(r=>'<div class="live-row"><div><b>'+E(r.author_alliance||S.a)+'</b><small>'+E(r.comment)+'</small></div><time class="muted tiny">'+E(D(r.created_at))+'</time></div>').join(''):'<div class="live-empty-state">Noch keine Kommentare.</div>'};await paint();document.getElementById('liveCommentForm').onsubmit=async e=>{e.preventDefault();const text=document.getElementById('liveCommentText').value.trim();if(!text)return;await rpc('add_player_file_comment',{p_player_id:P.id,p_comment:text});document.getElementById('liveCommentText').value='';await paint()};return}
 const events=[...V.map(v=>({d:v.occurred_at||v.created_at,t:v.event_name,s:v.phase_name||'',k:'Verstoß'})),...X.map(x=>({d:x.created_at,t:'Stufe '+x.level,s:profileActionLabel2(x),k:'Maßnahme'}))].filter(x=>x.d).sort((a,b)=>new Date(b.d)-new Date(a.d));body.innerHTML='<div class="live-list">'+(events.length?events.map(x=>'<div class="live-row"><div><b>'+E(x.k)+' · '+E(x.t||'–')+'</b><small>'+E(x.s||'')+'</small></div><time class="muted tiny">'+E(D(x.d))+'</time></div>').join(''):'<div class="live-empty-state">Keine Historie.</div>')+'</div>';
}
const POST_CONTACT_REVIEW_TEXT2={
 de:{required:'Prüfung erforderlich',notice:'Punkte nach Kontakt erkannt. Ein höherer OCR-Wert allein ist kein Beweis.',newScore:'Neuer Score nach Kontakt erkannt',contactScore:'Kontakt-Score',proof:'Ein höherer OCR-Wert allein ist kein Beweis für weiteres Ausgeben.',source:'Quelle',open:'Prüfung offen',confirm:'Weiteres Ausgeben bestätigen',dismiss:'Ohne Bestätigung schließen',confirmQ:'Nur bestätigen, wenn sicher ist, dass der Spieler nach der Kontaktaufnahme erneut ausgegeben hat. Dadurch kann die nächste Sanktionsstufe entstehen. Bestätigen?',dismissQ:'Diesen Prüffall ohne weitere Sanktionsstufe schließen?',section:'Weiteres Ausgeben prüfen',sectionSub:'Nur deine Allianz kann diese Fälle bestätigen und damit eine weitere Sanktionsstufe auslösen.',openSuffix:'offen'},
 en:{required:'Review required',notice:'points detected after contact. A higher OCR score alone is not proof.',newScore:'New score detected after contact',contactScore:'Contact score',proof:'A higher OCR score alone is not proof of additional spending.',source:'Source',open:'Review open',confirm:'Confirm additional spending',dismiss:'Close without confirmation',confirmQ:'Confirm only if you know the player spent again after being contacted. This may trigger the next sanction level. Confirm?',dismissQ:'Close this review without another sanction level?',section:'Review additional spending',sectionSub:'Only your alliance can confirm these cases and trigger another sanction level.',openSuffix:'open'},
 fr:{required:'Vérification requise',notice:'points détectés après le contact. Un score OCR plus élevé ne constitue pas une preuve à lui seul.',newScore:'Nouveau score détecté après le contact',contactScore:'Score au contact',proof:'Un score OCR plus élevé ne prouve pas à lui seul de nouvelles dépenses.',source:'Source',open:'Vérification ouverte',confirm:'Confirmer de nouvelles dépenses',dismiss:'Fermer sans confirmation',confirmQ:'Confirmez uniquement si vous savez que le joueur a de nouveau dépensé après avoir été contacté. Cela peut déclencher le niveau de sanction suivant. Confirmer ?',dismissQ:'Fermer cette vérification sans niveau de sanction supplémentaire ?',section:'Vérifier les dépenses supplémentaires',sectionSub:'Seule votre alliance peut confirmer ces cas et déclencher un niveau de sanction supplémentaire.',openSuffix:'ouvert'},
 es:{required:'Revisión necesaria',notice:'puntos detectados después del contacto. Una puntuación OCR más alta por sí sola no es una prueba.',newScore:'Nueva puntuación detectada después del contacto',contactScore:'Puntuación al contactar',proof:'Una puntuación OCR más alta por sí sola no prueba un gasto adicional.',source:'Fuente',open:'Revisión abierta',confirm:'Confirmar gasto adicional',dismiss:'Cerrar sin confirmación',confirmQ:'Confirma solo si sabes que el jugador volvió a gastar después del contacto. Esto puede activar el siguiente nivel de sanción. ¿Confirmar?',dismissQ:'¿Cerrar esta revisión sin otro nivel de sanción?',section:'Revisar gasto adicional',sectionSub:'Solo tu alianza puede confirmar estos casos y activar otro nivel de sanción.',openSuffix:'abiertas'}
};
function postContactReviewText2(k){return (POST_CONTACT_REVIEW_TEXT2[L()]||POST_CONTACT_REVIEW_TEXT2.de)[k]||k}
function liveNotifications2(){
 const rows=[],hw=typeof level4HomeWords2==='function'?level4HomeWords2():null;
 for(const h of S.level4Hosting||[])rows.push({
  key:'level4-host|'+String(h.sanction_id||h.player_id)+'|'+String(h.current_alliance||''),
  cat:'nap',
  title:(h.player_name||'–')+' · '+(h.current_alliance||'–'),
  copy:(hw?.eyebrow||'Extended NAP Exclusion')+' · '+(hw?.notice||'Level 4'),
  go:'nap'
 });
 for(const r of S.reviews||[])rows.push({key:'post-contact-review|'+String(r.review_id),cat:'alliance',title:(r.player_name||'–')+' · '+postContactReviewText2('required'),copy:(r.event_name||'Event')+' · '+(r.phase_name||'')+' · '+N(r.score)+' '+postContactReviewText2('notice'),go:'home'});
 for(const x of S.o||[])rows.push({key:'nap|'+String(x.sanction_id||x.alliance_code+'|'+x.player_name+'|'+x.level),cat:'nap',title:(x.alliance_code||'')+' · '+(x.player_name||'–'),copy:'Stufe '+x.level+' · '+durLong2(Number(x.overdue_seconds||0)*1000)+' über 24h-Frist (laut Tracker)',go:'nap'});
 for(const a of actions()){const z=new Date((a.s||a.v)?.created_at||(a.v?.occurred_at)||0).getTime()+86400000-Date.now();if(z>0&&z<=21600000)rows.push({key:'action|'+String(a.s?.id||a.v?.id||a.name),cat:'alliance',title:a.name,copy:'Stufe '+a.l+' · '+dur(z)+' verbleibend',go:'home'})}
 for(const x of S.t||[])rows.push({key:'transfer|'+String(x.candidate_id||x.id||x.player_name),cat:'alliance',title:x.player_name||'–',copy:(x.from_alliance||'POOL')+' → '+(x.to_alliance||'POOL'),go:'home'});
 return rows;
}
function renderNotifications2(){
 const list=document.getElementById('notificationList'),badge=document.querySelector('#bellBtn .badge-count');if(!list)return;const rows=liveNotifications2();if(badge){badge.textContent=rows.length;badge.style.display=rows.length?'grid':'none'}list.innerHTML=rows.length?rows.map(x=>'<button class="notification-item unread" data-live-notify="'+E(x.go)+'"><span class="notification-dot"></span><span><b>'+E(x.title)+'</b><small>'+E(x.copy)+'</small></span></button>').join(''):'<div class="live-empty-state">Keine neuen Meldungen.</div>';list.querySelectorAll('[data-live-notify]').forEach(b=>b.onclick=()=>{setView(b.dataset.liveNotify);document.getElementById('notificationPanel')?.classList.remove('show');document.getElementById('overlay')?.classList.remove('show')})}
const NAP_ALLIANCES2=new Set(['NRW','THM','NWO','NwO','CWR','PxR']);
function isNapAlliance2(code){return !!code&&NAP_ALLIANCES2.has(String(code))}
function transferRow2(x){
 const ownSource=x.from_alliance===S.a,ownTarget=x.to_alliance===S.a,watching=x.status==='watching',ready=x.status==='ready';
 const inboundExternal=ownTarget&&(!x.from_alliance||!isNapAlliance2(x.from_alliance));
 let buttons='';
 if((ownSource||inboundExternal)&&(watching||ready)){
   buttons+='<button class="btn small secondary live-transfer-temp" data-id="'+E(x.candidate_id)+'" data-reject="'+(inboundExternal?'1':'0')+'">↩ '+E(inboundExternal?t('rejectTemp'):t('tempTransfer'))+'</button>';
 }
 if(ownSource){
   if(watching)buttons+='<button class="btn small primary live-transfer-confirm" data-id="'+E(x.candidate_id)+'">✓ Jetzt bestätigen</button>';
   else if(ready)buttons+='<button class="btn small primary live-transfer-confirm" data-id="'+E(x.candidate_id)+'">✓ Wechsel bestätigen</button>';
 }else if(inboundExternal){
   if(x.from_alliance&&(watching||ready))buttons+='<button class="btn small primary live-transfer-confirm" data-id="'+E(x.candidate_id)+'">✓ Neuzugang bestätigen</button>';
   else if(ready)buttons+='<button class="btn small primary live-transfer-confirm" data-id="'+E(x.candidate_id)+'">✓ Neuzugang bestätigen</button>';
   else if(watching)buttons+='<span class="pill gold">Bestätigung nach Beobachtungsfrist</span>';
 }
 return '<div class="live-row live-transfer-row"><div><b>'+E(x.player_name||'–')+'</b><div class="live-transfer-route">'+allianceBadge2(x.from_alliance||'POOL')+'<span>→</span>'+allianceBadge2(x.to_alliance||'POOL')+'<small>'+E(D(x.detected_since))+'</small></div>'+(buttons?'<div class="hero-actions" style="margin-top:7px">'+buttons+'</div>':'')+'</div><span class="pill '+(ownTarget?'green':'blue')+'">'+E(ownTarget?'Eingang':'Ausgang')+'</span></div>';
}
async function confirmTransfer2(id){
 if(!confirm(actionWord2('confirmTransfer')))return;
 try{await rpc('confirm_roster_transfer_candidate',{p_candidate_id:id});await load();renderHomeFull2();renderNotifications2()}catch(err){alert(err.message||String(err))}
}
async function markTransferTemporary2(id,rejectIncoming=false){
 if(!confirm(t(rejectIncoming?'rejectTempQ':'tempTransferQ')))return;
 try{await rpc('mark_roster_transfer_temporary',{p_candidate_id:id});await load();renderHomeFull2();renderNotifications2()}catch(err){alert(err.message||String(err))}
}
function postContactReviewCard2(r){
 const P=p(r.player_name),source=r.detected_by_alliance&&r.detected_by_alliance!==S.a?r.detected_by_alliance:'ScreenRecording';
 const date=r.recording_day?new Date(String(r.recording_day)+'T00:00:00Z').toLocaleDateString(loc()):'–';
 return '<div class="action-item home-v2-action post-contact-review-card"><div><div class="player-line">'+avatarHtml(P,'player-avatar')+
  '<div><div class="player-name">'+E(r.player_name||'–')+'</div><div class="player-id">ID '+E(r.player_game_id||P.game_id||'–')+' · '+E(r.event_name||'')+' · '+E(r.phase_name||'')+' · '+E(date)+'</div></div></div>'+
  '<div class="live-note" style="margin-top:9px"><b>'+E(postContactReviewText2('newScore'))+'</b><br>'+
  'OCR '+N(r.score)+(r.warning_score!=null?' · '+E(postContactReviewText2('contactScore'))+' '+N(r.warning_score):'')+
  '. '+E(postContactReviewText2('proof'))+' '+E(postContactReviewText2('source'))+': '+E(source)+'.</div></div>'+
  '<div class="action-right"><span class="pill gold">'+E(postContactReviewText2('open'))+'</span><div class="home-action-buttons">'+
  '<button class="btn small primary live-post-contact-confirm" type="button" data-review-id="'+E(r.review_id)+'">'+E(postContactReviewText2('confirm'))+'</button>'+
  '<button class="btn small secondary live-post-contact-dismiss" type="button" data-review-id="'+E(r.review_id)+'">'+E(postContactReviewText2('dismiss'))+'</button>'+
  '</div></div></div>';
}
async function resolvePostContactReview2(id,confirmSpend){
 const question=postContactReviewText2(confirmSpend?'confirmQ':'dismissQ');
 if(!window.confirm(question))return;
 try{
  await rpc('resolve_post_contact_spending_review',{p_review_id:id,p_confirm:!!confirmSpend});
  await load();renderHomeFull2();renderPlayers2();renderNotifications2();
 }catch(err){alert(err.message||String(err))}
}
function homeV2Stages2(level){
 return '<div class="home-v2-stages" aria-label="Law 14 · '+E(String(level||1))+'">'+[1,2,3,4].map(n=>
 '<span class="home-v2-stage '+(n<level?'done':n===level?'current':'')+'" title="'+E('Stufe '+n)+'">'+n+'</span>'
 ).join('<span class="home-v2-stage-line"></span>')+'</div>';
}
const HOME_SYNC_WORDS2={
 de:{title:'Letzter API-Sync',never:'noch kein erfolgreicher Sync',ago:'vor',now:'gerade eben'},
 en:{title:'Last API sync',never:'no successful sync yet',ago:'ago',now:'just now'},
 fr:{title:'Dernière synchro API',never:'aucune synchro réussie',ago:'il y a',now:'à l’instant'},
 es:{title:'Última sincronización API',never:'aún no hay sincronización correcta',ago:'hace',now:'ahora mismo'}
};
function exactDateTime2(value){
 if(!value)return '–';
 const d=new Date(value);if(Number.isNaN(d.getTime()))return '–';
 return d.toLocaleString(loc(),{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function relativeSyncAge2(value){
 const w=HOME_SYNC_WORDS2[L()]||HOME_SYNC_WORDS2.de;
 if(!value)return w.never;
 const diff=Math.max(0,Date.now()-new Date(value).getTime());
 if(!Number.isFinite(diff)||diff<60000)return w.now;
 const minutes=Math.floor(diff/60000),hours=Math.floor(minutes/60),days=Math.floor(hours/24);
 let amount=minutes<60?minutes+' min':hours<24?hours+'h '+String(minutes%60).padStart(2,'0')+'m':days+'d '+String(hours%24).padStart(2,'0')+'h';
 return L()==='en'?amount+' '+w.ago:w.ago+' '+amount;
}
function homeSyncBadge2(){
 const w=HOME_SYNC_WORDS2[L()]||HOME_SYNC_WORDS2.de,s=S.syncStatus?.last_success_at;
 return '<div class="home-sync-status"><span>'+E(w.title)+'</span><div class="home-sync-meta"><b>'+E(s?exactDateTime2(s):w.never)+'</b>'+(s?'<small>'+E(relativeSyncAge2(s))+'</small>':'')+'</div></div>';
}
function homeV2RecentButton2(x,i){
 const P=p(x.player_name),name=x.player_name||'–',internal=isInternalCase2(x),cw=playerCaseWords2();
 return '<button type="button" class="live-row n2open home-v2-recent-item" data-p="'+E(name)+'">'+
 '<span class="home-v2-recent-person">'+avatarHtml({...P,name},'player-avatar')+
 '<span class="home-v2-recent-copy"><b>'+E(name)+'</b><small>'+E(x.event_name||'')+' · '+E(x.phase_name||'')+' · '+E(D(x.occurred_at))+'</small></span></span>'+
 (internal?'<span class="pill blue">'+E(cw.internal)+'</span>':'<strong>'+N(x.score)+'</strong>')+'</button>';
}
const LEVEL4_HOME_WORDS2={
 de:{eyebrow:'Extended NAP Exclusion',single:'Spieler mit Stufe 4 ist noch/erneut in einer NAP-Allianz',multi:'Spieler mit Stufe 4 sind noch/erneut in NAP-Allianzen',section:'Stufe 4 im Roster',sectionSub:'Diese Spieler dürfen während der Extended NAP Exclusion nicht in einer NAP-Allianz geführt oder aufgenommen werden.',cases:'Fälle',open:'Alle Fälle ansehen',notice:'Stufe 4 · Spieler muss entfernt werden bzw. darf nicht aufgenommen werden.'},
 en:{eyebrow:'Extended NAP Exclusion',single:'Level 4 player is still/back in a NAP alliance',multi:'Level 4 players are still/back in NAP alliances',section:'Level 4 on roster',sectionSub:'These players must not remain in or be accepted by a NAP alliance during an Extended NAP Exclusion.',cases:'cases',open:'View all cases',notice:'Level 4 · player must be removed and must not be accepted into an alliance.'},
 fr:{eyebrow:'Exclusion NAP prolongée',single:'Un joueur niveau 4 est toujours/de nouveau dans une alliance NAP',multi:'Des joueurs niveau 4 sont toujours/de nouveau dans des alliances NAP',section:'Niveau 4 dans l’effectif',sectionSub:'Pendant une exclusion NAP prolongée, ces joueurs ne doivent pas rester dans une alliance NAP ni y être acceptés.',cases:'cas',open:'Voir tous les cas',notice:'Niveau 4 · le joueur doit être retiré et ne doit pas être accepté dans une alliance.'},
 es:{eyebrow:'Exclusión NAP ampliada',single:'Un jugador de nivel 4 sigue/está de nuevo en una alianza NAP',multi:'Jugadores de nivel 4 siguen/están de nuevo en alianzas NAP',section:'Nivel 4 en el roster',sectionSub:'Durante una exclusión NAP ampliada, estos jugadores no deben permanecer ni ser aceptados en una alianza NAP.',cases:'casos',open:'Ver todos los casos',notice:'Nivel 4 · el jugador debe ser expulsado y no debe ser aceptado en una alianza.'}
};
function level4HomeWords2(){return LEVEL4_HOME_WORDS2[L()]||LEVEL4_HOME_WORDS2.de}
function homeV2PriorityPanels2(A){
 const notice=S.o?.[0],own=A?.[0],hosts=S.level4Hosting||[];let html='';
 if(hosts.length){
  const hw=level4HomeWords2();
  html+='<article class="priority-alert critical"><div class="priority-icon">4</div><div class="priority-main">'+
   '<div class="priority-eyebrow">'+E(hw.eyebrow)+'</div><b>'+E(hosts.length===1?hw.single:(hosts.length+' '+hw.multi))+'</b>'+
   '<p>'+E(hw.sectionSub)+'</p>'+
   '<div class="live-list" style="margin-top:8px">'+hosts.map(h=>'<div class="live-row" style="padding:7px 0"><div><b>'+E(h.player_name||'–')+'</b><small>'+E(h.current_alliance||'–')+'</small></div><span class="pill red">Stufe 4</span></div>').join('')+'</div>'+
   '</div><button type="button" class="btn small secondary" data-home-level4-alert>'+E(hw.open)+'</button></article>';
 }
 if(notice){
  html+='<article class="priority-alert critical"><div class="priority-icon">!</div><div class="priority-main">'+
   '<div class="priority-eyebrow">NAP-weite Meldung · laut Tracker</div><b>'+S.o.length+' Maßnahmen über der 24h-Frist</b>'+
   '<p>'+E(notice.alliance_code||'')+' · '+E(notice.player_name||'–')+' · Stufe '+E(notice.level)+' · '+E(durLong2(Number(notice.overdue_seconds||0)*1000))+' über der 24h-Frist. Nur die betroffene Allianz kann die Umsetzung im Spiel bestätigen.</p>'+
   '<div class="alert-meta"><span class="pill red">'+S.o.length+' offen gemeldet</span><span class="pill">'+E(notice.alliance_code||'')+'</span></div>'+
   '</div><button type="button" class="btn small secondary" data-home-nap-alert>NAP öffnen</button></article>';
 }
 if(own){
  html+='<article class="priority-alert own"><div class="priority-icon">◷</div><div class="priority-main">'+
   '<div class="priority-eyebrow">Nur deine Allianz</div><b>Eigene Maßnahme: '+E(own.name)+'</b>'+
   '<p>Stufe '+E(own.actionLevel)+' · '+E(own.actionLevel===4?'Abstimmung/Start prüfen':dl(own))+(own.actionLevel!==own.l?' · aktuelle Stufe '+E(own.l):'')+'</p>'+
   '<div class="alert-meta"><span class="pill gold">'+E(S.a)+'</span><span class="pill">noch nicht erledigt</span></div>'+
   '</div><button type="button" class="btn small secondary n2open" data-p="'+E(own.name)+'">Spieler öffnen</button></article>';
 }
 return html?'<div class="priority-grid home-v2-priorities">'+html+'</div>':'';
}
function renderHomeFull2(){
 const v=document.getElementById('view-home');if(!v)return;const A=actions(),recent=S.v.slice(0,8);
 v.innerHTML='<div class="hero"><div><div class="kicker">Kingdom 1044 · '+E(S.a)+'</div><h1>Dein NAP-Lagebild auf einen Blick.</h1><p>Eigene Maßnahmen, NAP-weite Hinweise und relevante Allianzwechsel – sauber nach Zuständigkeit getrennt.</p></div><div class="home-hero-tools"><div class="hero-actions"><button class="btn primary" data-go="add">＋ Verstoß eintragen</button><button class="btn secondary" data-go="players">Spielerakten</button></div>'+homeSyncBadge2()+'</div></div>'+
 homeV2PriorityPanels2(A)+
 '<div class="grid stat-grid home-kpis"><div class="stat-card"><div class="stat-top"><span>Eigene offene Maßnahmen</span></div><div class="stat-value">'+A.length+'</div><div class="stat-sub">'+E(S.a)+'</div></div><div class="stat-card"><div class="stat-top"><span>NAP-weit überfällig*</span></div><div class="stat-value">'+S.o.length+'</div><div class="stat-sub">*laut Tracker · 24h-Frist</div></div><div class="stat-card"><div class="stat-top"><span>Aktive NAP OUT</span></div><div class="stat-value">'+S.e.length+'</div><div class="stat-sub">NAP-weit</div></div><div class="stat-card"><div class="stat-top"><span>Allianzwechsel</span></div><div class="stat-value">'+S.t.length+'</div><div class="stat-sub">nur '+E(S.a)+' betreffend</div></div></div>'+
 '<div class="home-main-grid"><div class="stack">'+
 (S.reviews.length?'<section class="card post-contact-review-panel"><div class="card-head"><div><div class="card-title">'+E(postContactReviewText2('section'))+'</div><div class="card-sub">'+E(postContactReviewText2('sectionSub'))+'</div></div><span class="pill gold">'+S.reviews.length+' '+E(postContactReviewText2('openSuffix'))+'</span></div><div class="card-body">'+S.reviews.map(postContactReviewCard2).join('')+'</div></section>':'')+
 '<section class="card home-v2-action-panel"><div class="card-head"><div><div class="card-title">Mein Handlungsbedarf</div><div class="card-sub">Spieler, aktuelle Stufe und nächste Aktion</div></div><div class="hero-actions"><span class="pill gold">'+A.length+' offen</span><button type="button" class="btn small secondary home-v2-actions-toggle" aria-expanded="true">Einklappen</button></div></div><div class="card-body home-v2-actions-body">'+(A.length?A.map(a=>{const P=p(a.name),lab=a.actionLevel===1?'Stufe 1 · Kontakt':a.actionLevel===2?'Stufe 2 · R1':a.actionLevel===3?'Stufe 3 · 24h NAP OUT':'Stufe 4 · Extended',b=a.actionLevel===1?'<button class="btn small primary n2act" data-k="contact" data-id="'+E(a.v.id)+'">'+E(t('contact'))+'</button>':a.actionLevel===2?(a.s?.completed&&(!a.s.started_at||!a.s.end_at)?'<div class="r1-home-timer"><input class="r1-home-end" type="datetime-local"><button class="btn small primary live-r1-timer" data-id="'+E(a.s.id)+'">Timer setzen</button></div>':'<button class="btn small primary n2act" data-k="r1" data-id="'+E(a.s.id)+'">'+E(t('r1'))+'</button>'):a.actionLevel===3?'<button class="btn small primary n2act" data-k="nap" data-id="'+E(a.s.id)+'">'+E(t('nap'))+'</button>':a.actionLevel===4?'<button class="btn small primary n2open" data-p="'+E(a.name)+'">'+E(extendedActionWords2().start)+'</button>':'';return '<div class="action-item home-v2-action"><div><div class="player-line">'+avatarHtml(P,'player-avatar')+'<div><div class="player-name">'+E(a.name)+'</div><div class="player-id">ID '+E(P.game_id||'–')+' · '+E(S.a)+'</div></div></div>'+homeV2Stages2(a.l)+'</div><div class="action-right"><span class="pill gold">'+E(lab)+'</span>'+(a.actionLevel!==a.l?'<span class="muted tiny">Aktuelle Stufe '+E(a.l)+'</span>':'')+'<span class="deadline">'+E(dl(a))+'</span><div class="home-action-buttons">'+b+'<button class="mini-link n2open" data-p="'+E(a.name)+'">Öffnen</button></div></div></div>'}).join(''):'<div class="live-empty-state">✓ Aktuell kein eigener Handlungsbedarf.</div>')+'</div></section>'+
 '<section class="card home-v2-recent"><div class="card-head"><div><div class="card-title">Letzte eigene Verfehlungen</div><div class="card-sub">Spieler und Punkte · private Details bleiben bei '+E(S.a)+'</div></div>'+(recent.length>4?'<button class="btn small secondary home-v2-expand" type="button" aria-expanded="false">Alle '+recent.length+' anzeigen</button>':'')+'</div><div class="card-body live-list">'+(recent.length?recent.map(homeV2RecentButton2).join(''):'<div class="live-empty-state">Keine Verfehlungen.</div>')+'</div></section></div>'+
 '<div class="stack"><section class="card"><div class="card-head"><div><div class="card-title">🔔 NAP-Benachrichtigungen</div><div class="card-sub">24h-Frist überschritten · laut Tracker</div></div><span class="pill red">'+S.o.length+'</span></div><div class="card-body live-list">'+(S.o.length?S.o.slice(0,6).map(x=>'<div class="live-row"><div><b>'+E(x.alliance_code)+' · '+E(x.player_name||'–')+'</b><small>Stufe '+E(x.level)+'</small></div><span class="pill red">'+E(durLong2(Number(x.overdue_seconds||0)*1000))+'</span></div>').join(''):'<div class="live-empty-state">Keine überfälligen Maßnahmen.</div>')+'</div></section>'+
 '<section class="card"><div class="card-head"><div><div class="card-title">Allianzwechsel</div><div class="card-sub">nur Quelle oder Ziel '+E(S.a)+'</div></div><span class="pill">'+S.t.length+'</span></div><div class="card-body live-list">'+(S.t.length?S.t.map(transferRow2).join(''):'<div class="live-empty-state">Keine relevanten Wechsel.</div>')+'</div></section><section class="card" id="liveHomePerformance"><div class="card-body"><div class="live-empty-state">Performance wird geladen …</div></div></section></div></div>';
 v.querySelectorAll('[data-home-nap-alert]').forEach(b=>b.onclick=()=>{liveNapTab='alerts';setView('nap')});v.querySelectorAll('[data-home-level4-alert]').forEach(b=>b.onclick=()=>{liveNapTab='alerts';setView('nap')});v.querySelectorAll('.home-v2-actions-toggle').forEach(b=>b.onclick=()=>{const body=b.closest('.home-v2-action-panel')?.querySelector('.home-v2-actions-body');if(!body)return;const expanded=b.getAttribute('aria-expanded')!=='false';b.setAttribute('aria-expanded',String(!expanded));body.hidden=expanded;b.textContent=expanded?'Ausklappen':'Einklappen'});v.querySelectorAll('.n2act').forEach(b=>b.onclick=()=>doAct(b.dataset.k,b.dataset.id));v.querySelectorAll('.live-r1-timer').forEach(b=>b.onclick=()=>setR1Timer2(b.dataset.id,b.closest('.r1-home-timer')?.querySelector('.r1-home-end')));v.querySelectorAll('.n2open').forEach(b=>b.onclick=()=>openProfile2(b.dataset.p));v.querySelectorAll('.home-v2-expand').forEach(b=>b.onclick=()=>{const card=b.closest('.home-v2-recent'),expanded=card.classList.toggle('expanded');b.setAttribute('aria-expanded',String(expanded));b.textContent=expanded?'Weniger anzeigen':'Alle '+recent.length+' anzeigen'});v.querySelectorAll('.live-transfer-confirm').forEach(b=>b.onclick=()=>confirmTransfer2(b.dataset.id));v.querySelectorAll('.live-transfer-temp').forEach(b=>b.onclick=()=>markTransferTemporary2(b.dataset.id,b.dataset.reject==='1'));v.querySelectorAll('.live-post-contact-confirm').forEach(b=>b.onclick=()=>resolvePostContactReview2(b.dataset.reviewId,true));v.querySelectorAll('.live-post-contact-dismiss').forEach(b=>b.onclick=()=>resolvePostContactReview2(b.dataset.reviewId,false));renderHomePerformance2();renderNotifications2();
}
async function renderHomePerformance2(){
 const box=document.getElementById('liveHomePerformance');if(!box)return;try{const d=S.performance||await rpc('get_performance_dashboard',{});if(!S.performance)S.performance=d||null;const m=d?.mobilization,k=d?.kvk;box.innerHTML='<div class="card-head"><div><div class="card-title">Performance</div><div class="card-sub">kompakter Überblick</div></div><button class="mini-link" data-go="performance">Öffnen</button></div><div class="card-body live-list">'+(m?'<div class="live-row"><div><b>Alliance Mobilization</b><small>'+E(m.event?.label||'')+'</small></div><strong>'+N(m.total_score||0)+'</strong></div>':'')+(k?'<div class="live-row"><div><b>KvK Top 200</b><small>'+E(k.event?.label||'')+'</small></div><strong>'+N(k.known_top200_score||0)+'</strong></div>':'')+'</div>'}catch{box.innerHTML='<div class="card-body"><div class="live-empty-state">Keine Performance-Daten.</div></div>'}}
const setViewBase2=setView;
let lastMotionView2=document.querySelector('.view.active')?.id?.replace('view-','')||'home',motionTimer2=null;
function animateViewChange2(name){
 const v=document.getElementById('view-'+name);
 if(!v||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){lastMotionView2=name;return}
 v.classList.remove('motion-enter');
 v.querySelectorAll('.motion-surface').forEach(el=>{el.classList.remove('motion-surface');el.style.removeProperty('--motion-i')});
 const surfaces=[...v.querySelectorAll('.hero,.priority-alert,.card,.live-stat,.player-card,.transfer-card,.v2-card,.p2-player-card')].slice(0,9);
 surfaces.forEach((el,i)=>{el.classList.add('motion-surface');el.style.setProperty('--motion-i',String(i))});
 void v.offsetWidth;
 v.classList.add('motion-enter');
 clearTimeout(motionTimer2);
 motionTimer2=setTimeout(()=>{
  v.classList.remove('motion-enter');
  v.querySelectorAll('.motion-surface').forEach(el=>{el.classList.remove('motion-surface');el.style.removeProperty('--motion-i')});
 },430);
 lastMotionView2=name;
}
setView=function(name){
 if(name==='crown'&&!crownAllowed2)return;
 const changed=name!==lastMotionView2;
 setViewBase2(name);
 if(!S.a){if(changed)requestAnimationFrame(()=>animateViewChange2(name));return}
 if(name==='home')renderHomeFull2();
 else if(name==='add')renderAddLive();
 else if(name==='players')renderPlayers2();
 else if(name==='nap')renderNapLive();
 else if(name==='kvk')renderKvkLive();
 else if(name==='laws')renderLawsLive();
 else if(name==='performance')renderPerformanceLive();
 else if(name==='crown')renderCrownLive();
 else if(name==='activity')renderActivityLive();
 else if(name==='settings')renderSettingsLive();
 else if(name==='support')renderSupportLive();
 if(changed)requestAnimationFrame(()=>animateViewChange2(name));
};
renderHome=renderHomeFull2;renderPlayers=renderPlayers2;openProfile=openProfile2;


/* === FINAL BOOT + LIVE NOTIFICATION STATE V2 === */
let liveNotificationFilter='all';
function notificationReadSet2(){return new Set(S.notificationReads||[])}
function notificationId2(x){return x.key||[x.cat,x.title,x.go].join('|')}
async function markNotificationReads2(ids){
 const clean=[...new Set((ids||[]).map(String).filter(id=>id&&id.length<=300))];
 if(!S.a||!clean.length)return;
 const url=C.u+'/rest/v1/notification_read_state?on_conflict=alliance_code,notification_id';
 await q(url,{method:'POST',headers:{...(await h(true)),Prefer:'resolution=merge-duplicates,return=minimal'},
  body:JSON.stringify(clean.map(notification_id=>({alliance_code:S.a,notification_id,read_at:new Date().toISOString()})))});
 for(const id of clean)S.notificationReads.add(id);
}
async function migrateLocalNotificationReads2(){
 const key='nap2_read_'+S.a;let old=[];
 try{old=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
 if(!Array.isArray(old)||!old.length)return;
 try{await markNotificationReads2(old);localStorage.removeItem(key)}
 catch(err){console.warn('notification read-state migration',err)}
}
const baseRenderNotifications2=renderNotifications2;
renderNotifications2=function(){
 const list=document.getElementById('notificationList'),badge=document.querySelector('#bellBtn .badge-count'),filters=document.getElementById('notificationFilters'),mark=document.getElementById('markAllRead');if(!list)return;
 const all=liveNotifications2(),read=notificationReadSet2(),rows=all.filter(x=>liveNotificationFilter==='all'||x.cat===liveNotificationFilter),unread=all.filter(x=>!read.has(notificationId2(x))).length;
 if(badge){badge.textContent=unread;badge.style.display=unread?'grid':'none'}
 if(filters){filters.innerHTML='<button class="notification-filter '+(liveNotificationFilter==='all'?'active':'')+'" data-live-nf="all">Alle</button><button class="notification-filter '+(liveNotificationFilter==='nap'?'active':'')+'" data-live-nf="nap">NAP</button><button class="notification-filter '+(liveNotificationFilter==='alliance'?'active':'')+'" data-live-nf="alliance">Meine Allianz</button>';filters.querySelectorAll('[data-live-nf]').forEach(b=>b.onclick=()=>{liveNotificationFilter=b.dataset.liveNf;renderNotifications2()})}
 list.innerHTML=rows.length?rows.map(x=>{const id=notificationId2(x),isRead=read.has(id);return '<button class="notification-item '+(isRead?'':'unread')+'" data-live-notify="'+E(x.go)+'" data-live-nid="'+E(id)+'"><span class="notification-dot"></span><span><b>'+E(x.title)+'</b><small>'+E(x.copy)+'</small></span></button>'}).join(''):'<div class="live-empty-state">Keine Meldungen.</div>';
 list.querySelectorAll('[data-live-notify]').forEach(b=>b.onclick=async()=>{try{await markNotificationReads2([b.dataset.liveNid])}catch(err){console.warn('notification read state',err)}if(b.dataset.liveNid?.startsWith('level4-host|'))liveNapTab='alerts';setView(b.dataset.liveNotify);document.getElementById('notificationPanel')?.classList.remove('show');document.getElementById('overlay')?.classList.remove('show');renderNotifications2()});
 if(mark){const clone=mark.cloneNode(true);mark.replaceWith(clone);clone.onclick=async()=>{try{await markNotificationReads2(all.map(notificationId2))}catch(err){console.warn('notification mark all',err)}renderNotifications2()}}
};
renderNotifications=()=>renderNotifications2();
updateBellCount=()=>renderNotifications2();
addLiveCss();neutralizeMocks();
document.getElementById('languagePicker')?.addEventListener('change',()=>setTimeout(()=>{if(S.a){const active=document.querySelector('.view.active')?.id?.replace('view-','')||'home';setView(active)}},0));


/* === LIVE RUNTIME TRANSLATION V2 === */
const LIVE_TRANSLATE={
 en:{
  'Verstoß erfassen':'Record violation','ScreenRecording und manuelle Eingabe sind getrennt, nutzen aber dieselben aktuellen Eventfreigaben und Regeln.':'ScreenRecording and manual entry are separated but use the same current event availability and rules.',
  'Manuell':'Manual','Manuell eintragen':'Manual entry','Spieler':'Player','Punkte':'Points','Zeitpunkt':'Time','Notiz':'Note','Verstoß speichern':'Save violation',
  'Regelprüfung':'Rule check','Grenze aus den Allianz-Einstellungen.':'Limit from alliance settings.','Importer laden':'Load importer','Importer wird geladen …':'Loading importer …','Importer bereit':'Importer ready',
  'NAP-weite Transparenz, private Details getrennt.':'NAP-wide transparency with private details kept separate.','Hinweise':'Notices','NAP-Hinweise':'NAP notices','Als temporär markieren':'Mark as temporary','Übersicht':'Overview','24h Meldungen':'24h notices','Maßnahmen anderer NAP-Allianzen, die nach 24h nicht umgesetzt wurden.':'Actions from other NAP alliances not implemented after 24h.',
  'Aktive Exclusions':'Active exclusions','Manuelle Exclusion':'Manual exclusion','Exclusion speichern':'Save exclusion','NAP Bans':'NAP bans','Ban hinzufügen':'Add ban','Grund':'Reason','NAP Ban speichern':'Save NAP ban',
  'NAP Spending Exclusions':'NAP Spending Exclusions','Spending Exclusion hinzufügen':'Add Spending Exclusion','Nur Spieler deiner Allianz.':'Only players from your alliance.','Start':'Start','Ende':'End','Spending Exclusion speichern':'Save Spending Exclusion','beenden':'End',
  'Performance ohne Dashboard-Überladung.':'Performance without dashboard clutter.','Manuell ergänzen / korrigieren':'Add / correct manually','erfasste Spieler':'recorded players','Gesamtscore':'total score','Vollständiges Ranking':'Full ranking','Durchlauf':'Occurrence','Serverrang 1–200':'Server rank 1–200',
  'KvK & Law 9':'KvK & Law 9','Snapshot / Baseline':'Snapshot / baseline','Mitglieder':'members','Prep Scores':'Prep scores','Eingabe offen':'Entry open','Eingabe noch gesperrt':'Entry not open yet',
  'Lawbook und Fälle.':'Lawbook and cases.','Aktuelle Versionen aus der Datenbank.':'Current versions from the database.','NAP Verstöße':'NAP violations','Alle Bereiche':'All categories','Law suchen …':'Search laws …','Ausnahmen':'Exceptions','Sanktionen':'Sanctions','NAP-Verstoß melden':'Report NAP violation','Fall speichern':'Save case','Beschreibung':'Description',
  'Minister-Ausschlüsse klar priorisiert.':'Minister restrictions clearly prioritized.','aktive Minister-Sperren':'active minister restrictions','beendet · 24h':'ended · 24h','König':'King','aktualisiert':'updated','Aktive Minister-Sperren':'Active minister restrictions','Beendet · letzte 24h':'Ended · last 24h',
  'Filterbarer Audit-Feed.':'Filterable audit feed.','Aktualisieren':'Refresh','Alle Allianzen':'All alliances','Uploads':'Uploads','Verstöße':'Violations','Gelöscht':'Deleted',
  'Konfiguration getrennt von den Laws.':'Configuration separated from Laws.','Allgemein':'General','Event-Verfügbarkeit':'Event availability','Zielwerte':'Targets','Verstoß-Fenster':'Violation window','Warnfenster · Tage':'Warning window · days','Verfehlung gültig · Tage':'Violation valid · days','Speichern':'Save','Zielwerte speichern':'Save targets','manuell aktivieren':'enable manually','Freigabe entfernen':'remove override','sichtbar':'visible','ausgeblendet':'hidden',
  'Dein NAP-Lagebild auf einen Blick.':'Your NAP situation at a glance.','Einklappen':'Collapse','Ausklappen':'Expand','Eigene Maßnahmen, NAP-weite Hinweise und relevante Allianzwechsel – sauber nach Zuständigkeit getrennt.':'Your actions, NAP-wide notices and relevant alliance transfers – clearly separated by responsibility.','Eigene offene Maßnahmen':'Your open actions','NAP-weit überfällig':'NAP-wide overdue','Aktive NAP OUT':'Active NAP OUT','Allianzwechsel':'Alliance transfers','Mein Handlungsbedarf':'My action required','direkt auf Home erledigen':'complete directly on Home','Letzte eigene Verfehlungen':'Recent own violations','Performance wird geladen …':'Loading performance …',
  'SPIELERPROFIL':'PLAYER PROFILE','Spielerakten':'Player files','Aktuelle Stufe':'Current stage','Verstöße gesamt':'total violations','Sprachen':'Languages','Player ID speichern':'Save Player ID','Maßnahmen':'Actions','Kommentare':'Comments','Historie':'History','Keine Maßnahmen.':'No actions.','Keine Verstöße.':'No violations.','Noch keine Kommentare.':'No comments yet.'
 },
 fr:{
  'Verstoß erfassen':'Enregistrer une infraction','Manuell':'Manuel','Manuell eintragen':'Saisie manuelle','Spieler':'Joueur','Punkte':'Points','Zeitpunkt':'Heure','Notiz':'Note','Verstoß speichern':'Enregistrer l’infraction','Regelprüfung':'Vérification des règles','Importer laden':'Charger l’importateur',
  'NAP-weite Transparenz, private Details getrennt.':'Transparence NAP tout en séparant les détails privés.','Hinweise':'Alertes','NAP-Hinweise':'Alertes NAP','Als temporär markieren':'Marquer comme temporaire','Übersicht':'Aperçu','24h Meldungen':'Alertes 24 h','Aktive Exclusions':'Exclusions actives','Manuelle Exclusion':'Exclusion manuelle','Exclusion speichern':'Enregistrer l’exclusion','NAP Bans':'Bans NAP','Ban hinzufügen':'Ajouter un ban','Grund':'Motif',
  'Spending Exclusion hinzufügen':'Ajouter une Spending Exclusion','Nur Spieler deiner Allianz.':'Uniquement les joueurs de votre alliance.','Start':'Début','Ende':'Fin','beenden':'Terminer',
  'Performance ohne Dashboard-Überladung.':'Performance sans surcharger le tableau de bord.','Manuell ergänzen / korrigieren':'Ajouter / corriger manuellement','erfasste Spieler':'joueurs enregistrés','Gesamtscore':'score total','Vollständiges Ranking':'Classement complet','Durchlauf':'Occurrence','Serverrang 1–200':'Rang serveur 1–200',
  'KvK & Law 9':'KvK & Law 9','Snapshot / Baseline':'Snapshot / baseline','Mitglieder':'membres','Prep Scores':'Scores Prep','Eingabe offen':'Saisie ouverte','Eingabe noch gesperrt':'Saisie encore fermée',
  'Lawbook und Fälle.':'Lawbook et cas.','Aktuelle Versionen aus der Datenbank.':'Versions actuelles de la base de données.','NAP Verstöße':'Infractions NAP','Alle Bereiche':'Toutes les catégories','Law suchen …':'Rechercher une Law …','Ausnahmen':'Exceptions','Sanktionen':'Sanctions','NAP-Verstoß melden':'Signaler une infraction NAP','Fall speichern':'Enregistrer le cas','Beschreibung':'Description',
  'Minister-Ausschlüsse klar priorisiert.':'Restrictions ministérielles clairement priorisées.','aktive Minister-Sperren':'restrictions ministérielles actives','König':'Roi','aktualisiert':'actualisé','Aktive Minister-Sperren':'Restrictions ministérielles actives','Beendet · letzte 24h':'Terminées · dernières 24 h',
  'Filterbarer Audit-Feed.':'Journal d’audit filtrable.','Aktualisieren':'Actualiser','Alle Allianzen':'Toutes les alliances','Uploads':'Uploads','Verstöße':'Infractions','Gelöscht':'Supprimé',
  'Konfiguration getrennt von den Laws.':'Configuration séparée des Laws.','Allgemein':'Général','Event-Verfügbarkeit':'Disponibilité des événements','Zielwerte':'Objectifs','Verstoß-Fenster':'Fenêtre d’infraction','Warnfenster · Tage':'Fenêtre d’alerte · jours','Verfehlung gültig · Tage':'Infraction valable · jours','Speichern':'Enregistrer','Zielwerte speichern':'Enregistrer les objectifs','manuell aktivieren':'activer manuellement','Freigabe entfernen':'retirer l’activation','sichtbar':'visible','ausgeblendet':'masqué',
  'ScreenRecording und manuelle Eingabe sind getrennt, nutzen aber dieselben aktuellen Eventfreigaben und Regeln.':'ScreenRecording et la saisie manuelle sont séparés, mais utilisent les mêmes événements et règles actuels.','Grenze aus den Allianz-Einstellungen.':'Limite issue des paramètres de l’alliance.','Importer wird geladen …':'Chargement de l’importateur …','Importer bereit':'Importateur prêt','Maßnahmen anderer NAP-Allianzen, die nach 24h nicht umgesetzt wurden.':'Mesures des autres alliances NAP non appliquées après 24 h.','NAP Ban speichern':'Enregistrer le ban NAP','NAP Spending Exclusions':'Exclusions de dépenses NAP','Spending Exclusion speichern':'Enregistrer l’exclusion de dépenses','beendet · 24h':'terminé · 24 h','Eigene Maßnahmen, NAP-weite Hinweise und relevante Allianzwechsel – sauber nach Zuständigkeit getrennt.':'Vos mesures, alertes NAP et transferts pertinents – clairement séparés selon la responsabilité.','direkt auf Home erledigen':'à traiter directement sur Home','Performance wird geladen …':'Chargement des performances …','Noch keine Kommentare.':'Aucun commentaire pour le moment.',
  'Dein NAP-Lagebild auf einen Blick.':'Votre situation NAP en un coup d’œil.','Einklappen':'Réduire','Ausklappen':'Développer','Eigene offene Maßnahmen':'Vos mesures ouvertes','NAP-weit überfällig':'NAP en retard','Aktive NAP OUT':'NAP OUT actifs','Allianzwechsel':'Changements d’alliance','Mein Handlungsbedarf':'Mes actions requises','Letzte eigene Verfehlungen':'Infractions récentes de votre alliance',
  'SPIELERPROFIL':'PROFIL JOUEUR','Spielerakten':'Dossiers joueurs','Aktuelle Stufe':'Niveau actuel','Verstöße gesamt':'infractions totales','Sprachen':'Langues','Player ID speichern':'Enregistrer Player ID','Maßnahmen':'Mesures','Kommentare':'Commentaires','Historie':'Historique','Keine Maßnahmen.':'Aucune mesure.','Keine Verstöße.':'Aucune infraction.'
 },
 es:{
  'Verstoß erfassen':'Registrar infracción','Manuell':'Manual','Manuell eintragen':'Registro manual','Spieler':'Jugador','Punkte':'Puntos','Zeitpunkt':'Hora','Notiz':'Nota','Verstoß speichern':'Guardar infracción','Regelprüfung':'Comprobación de reglas','Importer laden':'Cargar importador',
  'NAP-weite Transparenz, private Details getrennt.':'Transparencia NAP manteniendo separados los detalles privados.','Hinweise':'Avisos','NAP-Hinweise':'Avisos NAP','Als temporär markieren':'Marcar como temporal','Übersicht':'Resumen','24h Meldungen':'Avisos 24 h','Aktive Exclusions':'Exclusiones activas','Manuelle Exclusion':'Exclusión manual','Exclusion speichern':'Guardar exclusión','NAP Bans':'Bans NAP','Ban hinzufügen':'Añadir ban','Grund':'Motivo',
  'Spending Exclusion hinzufügen':'Añadir Spending Exclusion','Nur Spieler deiner Allianz.':'Solo jugadores de tu alianza.','Start':'Inicio','Ende':'Fin','beenden':'Finalizar',
  'Performance ohne Dashboard-Überladung.':'Performance sin sobrecargar el panel.','Manuell ergänzen / korrigieren':'Añadir / corregir manualmente','erfasste Spieler':'jugadores registrados','Gesamtscore':'score total','Vollständiges Ranking':'Ranking completo','Durchlauf':'Ocurrencia','Serverrang 1–200':'Rango servidor 1–200',
  'KvK & Law 9':'KvK & Law 9','Snapshot / Baseline':'Snapshot / baseline','Mitglieder':'miembros','Prep Scores':'Scores Prep','Eingabe offen':'Registro abierto','Eingabe noch gesperrt':'Registro aún cerrado',
  'Lawbook und Fälle.':'Lawbook y casos.','Aktuelle Versionen aus der Datenbank.':'Versiones actuales de la base de datos.','NAP Verstöße':'Infracciones NAP','Alle Bereiche':'Todas las categorías','Law suchen …':'Buscar Law …','Ausnahmen':'Excepciones','Sanktionen':'Sanciones','NAP-Verstoß melden':'Reportar infracción NAP','Fall speichern':'Guardar caso','Beschreibung':'Descripción',
  'Minister-Ausschlüsse klar priorisiert.':'Restricciones ministeriales claramente priorizadas.','aktive Minister-Sperren':'restricciones ministeriales activas','König':'Rey','aktualisiert':'actualizado','Aktive Minister-Sperren':'Restricciones ministeriales activas','Beendet · letzte 24h':'Finalizadas · últimas 24 h',
  'Filterbarer Audit-Feed.':'Registro de auditoría filtrable.','Aktualisieren':'Actualizar','Alle Allianzen':'Todas las alianzas','Uploads':'Uploads','Verstöße':'Infracciones','Gelöscht':'Eliminado',
  'Konfiguration getrennt von den Laws.':'Configuración separada de las Laws.','Allgemein':'General','Event-Verfügbarkeit':'Disponibilidad de eventos','Zielwerte':'Objetivos','Verstoß-Fenster':'Ventana de infracción','Warnfenster · Tage':'Ventana de aviso · días','Verfehlung gültig · Tage':'Infracción válida · días','Speichern':'Guardar','Zielwerte speichern':'Guardar objetivos','manuell aktivieren':'activar manualmente','Freigabe entfernen':'quitar activación','sichtbar':'visible','ausgeblendet':'oculto',
  'ScreenRecording und manuelle Eingabe sind getrennt, nutzen aber dieselben aktuellen Eventfreigaben und Regeln.':'ScreenRecording y la entrada manual están separados, pero usan los mismos eventos y reglas actuales.','Grenze aus den Allianz-Einstellungen.':'Límite según la configuración de la alianza.','Importer wird geladen …':'Cargando importador …','Importer bereit':'Importador listo','Maßnahmen anderer NAP-Allianzen, die nach 24h nicht umgesetzt wurden.':'Medidas de otras alianzas NAP no aplicadas tras 24 h.','NAP Ban speichern':'Guardar ban NAP','NAP Spending Exclusions':'Exclusiones de gasto NAP','Spending Exclusion speichern':'Guardar exclusión de gasto','beendet · 24h':'finalizado · 24 h','Eigene Maßnahmen, NAP-weite Hinweise und relevante Allianzwechsel – sauber nach Zuständigkeit getrennt.':'Tus medidas, avisos NAP y cambios de alianza relevantes, claramente separados por responsabilidad.','direkt auf Home erledigen':'resolver directamente en Home','Performance wird geladen …':'Cargando rendimiento …','Noch keine Kommentare.':'Todavía no hay comentarios.',
  'Dein NAP-Lagebild auf einen Blick.':'Tu situación NAP de un vistazo.','Einklappen':'Contraer','Ausklappen':'Expandir','Eigene offene Maßnahmen':'Tus medidas abiertas','NAP-weit überfällig':'NAP vencido','Aktive NAP OUT':'NAP OUT activos','Allianzwechsel':'Cambios de alianza','Mein Handlungsbedarf':'Mis acciones pendientes','Letzte eigene Verfehlungen':'Infracciones recientes propias',
  'SPIELERPROFIL':'PERFIL DEL JUGADOR','Spielerakten':'Expedientes','Aktuelle Stufe':'Nivel actual','Verstöße gesamt':'infracciones totales','Sprachen':'Idiomas','Player ID speichern':'Guardar Player ID','Maßnahmen':'Medidas','Kommentare':'Comentarios','Historie':'Historial','Keine Maßnahmen.':'No hay medidas.','Keine Verstöße.':'No hay infracciones.'
 }
};
function translateLiveTree2(root){
 const lc=L();if(lc==='de'||!root)return;const map=LIVE_TRANSLATE[lc]||{};
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const raw=n.nodeValue,trim=raw.trim();if(!trim)continue;let rep=map[trim];if(!rep){const m=trim.match(/^Stufe\s+(\d+)(.*)$/);if(m){const word=lc==='en'?'Level':lc==='fr'?'Niveau':'Nivel';rep=word+' '+m[1]+m[2]}}if(rep)n.nodeValue=raw.replace(trim,rep)}
 root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{const p=el.getAttribute('placeholder');if(map[p])el.setAttribute('placeholder',map[p])});
}
function wrapTranslation2(fn,id){return function(...args){const r=fn.apply(this,args);return Promise.resolve(r).finally(()=>translateLiveTree2(document.getElementById(id)))}}
renderAddLive=wrapTranslation2(renderAddLive,'view-add');renderNapLive=wrapTranslation2(renderNapLive,'view-nap');renderKvkLive=wrapTranslation2(renderKvkLive,'view-kvk');renderLawsLive=wrapTranslation2(renderLawsLive,'view-laws');renderPerformanceLive=wrapTranslation2(renderPerformanceLive,'view-performance');renderCrownLive=wrapTranslation2(renderCrownLive,'view-crown');renderActivityLive=wrapTranslation2(renderActivityLive,'view-activity');renderSettingsLive=wrapTranslation2(renderSettingsLive,'view-settings');renderHomeFull2=wrapTranslation2(renderHomeFull2,'view-home');renderPlayers2=wrapTranslation2(renderPlayers2,'view-players');renderHome=renderHomeFull2;renderPlayers=renderPlayers2;


/* Navigation: the validated v7 inline handler delegates to the live setView override. */

})();