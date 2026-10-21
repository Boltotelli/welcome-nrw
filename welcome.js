/* Welcome uses the leadership's public schedule only. Never query player providers. */
(()=>{'use strict';
const endpoint='https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/allianceos-leitung?alliance=NRW&mode=public-schedule';
const root=document.getElementById('welcome-schedule');
const language=()=>['de','en','fr'].includes(document.body.dataset.lang)?document.body.dataset.lang:'en';
const words={de:{empty:'Zurzeit sind keine aktiven Bärenzeiten veröffentlicht.',error:'Die Eventkonfiguration ist gerade nicht erreichbar. Bitte später erneut versuchen oder im Spiel nachfragen.',source:'Aktuelle Konfiguration der NRW-Leitung · UTC ist maßgeblich.',unknown:'Uhrzeit noch nicht veröffentlicht – bitte Ingame-Abstimmung beachten.',local:'Ortszeit',retry:'Erneut laden',copied:'Spieler-ID kopiert.',copyError:'Kopieren nicht möglich. Bitte die sichtbare Spieler-ID markieren und kopieren.'},en:{empty:'No active Bear times are currently published.',error:'The event configuration is currently unavailable. Please try again later or ask in game.',source:'Current NRW leadership configuration · UTC is the reference.',unknown:'Time not published yet – please check the in-game poll.',local:'Local time',retry:'Try again',copied:'Player ID copied.',copyError:'Could not copy. Please select and copy the player ID shown above.'},fr:{empty:'Aucun horaire actif des ours n’est publié actuellement.',error:'La configuration est indisponible. Réessaie plus tard ou renseigne-toi en jeu.',source:'Configuration actuelle de la direction NRW · UTC fait référence.',unknown:'Horaire non publié – consulte le sondage en jeu.',local:'Heure locale',retry:'Réessayer',copied:'ID du joueur copié.',copyError:'Copie impossible. Sélectionne et copie l’ID affiché.'}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cycles=null,failed=false,busy=false;
const title=(c,l)=>typeof c.title==='string'?c.title:c.title?.[l]||c.title?.en||c.title?.de||c.group_key;
const clock=c=>typeof c.start_time_utc==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(c.start_time_utc)?c.start_time_utc.slice(0,5):null;
function nextOccurrence(c){
 const time=clock(c);if(!time||!/^\d{4}-\d{2}-\d{2}$/.test(c.anchor_date||''))return null;
 const first=Date.parse(c.anchor_date+'T'+time+':00Z'),step=Number(c.interval_days)*86400000;
 if(!Number.isFinite(first)||!Number.isFinite(step)||step<86400000)return null;
 return new Date(first+Math.max(0,Math.ceil((Date.now()-first)/step))*step);
}
function render(){if(!root)return;const l=language(),w=words[l];
 if(failed){root.innerHTML='<div class="schedule-state"><p>'+esc(w.error)+'</p><button class="btn btn-soft" data-retry-schedule>'+esc(w.retry)+'</button></div>';return;}
 if(!cycles)return;
 const bears=cycles.filter(c=>/^bear-[123]$/.test(c.group_key||'')&&c.enabled===true&&clock(c)).sort((a,b)=>a.group_key.localeCompare(b.group_key));
 root.innerHTML=bears.length?bears.map(c=>{const next=nextOccurrence(c);const local=next?new Intl.DateTimeFormat(l,{hour:'2-digit',minute:'2-digit',timeZoneName:'short',weekday:'short',day:'numeric',month:'short'}).format(next):'';return '<article class="time-card" data-bear-slot="'+esc(c.group_key)+'"><div class="time-icon"><img src="dashboard/assets/events/bear-trap.png" width="58" height="58" alt=""></div><b>'+esc(title(c,l))+'</b><div class="times"><span class="time-pill">'+esc(clock(c))+' UTC</span></div>'+(local?'<small>'+esc(w.local)+': '+esc(local)+'</small>':'')+'</article>';}).join(''):'<p class="schedule-state">'+esc(w.empty)+'</p>';
 const secondary=['catalog-swordland-showdown','catalog-tri-alliance-clash'].map(key=>cycles.find(c=>c.group_key===key&&c.enabled===true)).filter(Boolean);
 if(secondary.length)root.innerHTML+='<div class="schedule-secondary">'+secondary.map(c=>'<p><strong>'+esc(title(c,l))+'</strong><br>'+esc(clock(c)?clock(c)+' UTC':w.unknown)+'</p>').join('')+'</div>';
 root.insertAdjacentHTML('beforeend','<p class="schedule-source">'+esc(w.source)+'</p>');
}
async function refresh(){if(busy)return;busy=true;try{const r=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const d=await r.json();if(!Array.isArray(d.cycles))throw Error();cycles=d.cycles;failed=false;}catch{cycles=null;failed=true;}finally{busy=false;render();}}
root?.addEventListener('click',e=>{if(e.target.closest('[data-retry-schedule]'))refresh();});
window.addEventListener('nrw-lang-change',render);
window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
setInterval(()=>{if(!document.hidden)refresh();},60000);refresh();
document.querySelectorAll('[data-copy-id]').forEach(button=>button.addEventListener('click',async()=>{const status=document.getElementById('contact-status');try{await navigator.clipboard.writeText(button.dataset.copyId);status.textContent=words[language()].copied;}catch{status.textContent=words[language()].copyError;}}));
document.querySelectorAll('.contact-portrait img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.nextElementSibling.hidden=false;}));
// Two audience paths share data and original controls, but not a long mixed page.
function showPath(view){
 document.body.dataset.welcomeView=view;
 document.querySelector('.skip-link').href=location.pathname+location.search+(view==='member'?'#start':view==='transfer'?'#transfer':'#welcome-paths');
 document.getElementById('welcome-home').hidden=view!=='landing';
 window.NRW_MOTION?.setView(view);
 document.querySelectorAll('[data-path]').forEach(el=>{el.hidden=el.dataset.path!==view;});
 document.querySelectorAll('[data-shared]').forEach(el=>{el.hidden=view==='landing';});
 const switcher=document.querySelector('.audience-switch');switcher.hidden=view==='landing';
 switcher.querySelectorAll('[data-view-link]').forEach(a=>{if(a.dataset.viewLink===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function viewFor(target){
 const id=target.id;
 const path=target.closest('[data-path]')?.dataset.path;
 return id==='top'||id==='welcome-paths'?'landing':path||(document.body.dataset.welcomeView==='transfer'?'transfer':'member');
}
function go(hash,push=false){
 const id=decodeURIComponent((hash||'#top').slice(1));const target=document.getElementById(id);if(!target)return;
 const view=viewFor(target);
 const previous=document.body.dataset.welcomeView;showPath(view);
 if(previous!==view)document.getElementById('times-disclosure').open=view==='member';
 for(let node=target.parentElement;node;node=node.parentElement){if(node.tagName==='DETAILS')node.open=true;}
 if(target.tagName==='DETAILS')target.open=true;
 if(push&&location.hash!==hash)history.pushState(null,'',location.pathname+location.search+hash);
 if(id==='top')window.scrollTo(0,0);else target.scrollIntoView({block:'start'});
 target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
}
document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a[href]');if(!a)return;const url=new URL(a.href,document.baseURI);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search||!url.hash)return;const target=document.getElementById(url.hash.slice(1));if(!target)return;e.preventDefault();const update=()=>go(url.hash,true);if(window.NRW_MOTION&&viewFor(target)!==document.body.dataset.welcomeView)window.NRW_MOTION.navigate(update,e.detail===0);else update();});
window.addEventListener('popstate',()=>go(location.hash||'#top'));
window.addEventListener('hashchange',()=>go(location.hash||'#top'));
if(location.hash)go(location.hash);else showPath('landing');
})();
