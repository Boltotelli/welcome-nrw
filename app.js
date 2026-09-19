
(function(){
 const root=document.documentElement, body=document.body;
 const savedTheme=localStorage.getItem('nrw_theme') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 root.dataset.theme=savedTheme;
 const themeBtn=document.getElementById('themeBtn');
 function themeIcon(){ if(themeBtn) themeBtn.textContent=root.dataset.theme==='dark'?'☀':'☾'; }
 themeIcon();
 themeBtn?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('nrw_theme',root.dataset.theme);themeIcon();});
 const savedLang=localStorage.getItem('nrw_page_lang')||'en';
 body.dataset.lang=savedLang;document.documentElement.lang=savedLang;
 document.querySelectorAll('[data-lang-btn]').forEach(b=>{
   b.classList.toggle('active',b.dataset.langBtn===savedLang);
   b.addEventListener('click',()=>{
     body.dataset.lang=b.dataset.langBtn;document.documentElement.lang=b.dataset.langBtn;localStorage.setItem('nrw_page_lang',b.dataset.langBtn);
     document.querySelectorAll('[data-lang-btn]').forEach(x=>x.classList.toggle('active',x===b));
     window.dispatchEvent(new CustomEvent('nrw-lang-change',{detail:b.dataset.langBtn}));
   });
 });
})();

const profileKey='nrw_member_profile_v1';
function loadProfile(){
 try{
  const p=JSON.parse(localStorage.getItem(profileKey)||'null'); if(!p)return;
  document.getElementById('playerName').value=p.playerName||'';document.getElementById('playerId').value=p.playerId||'';document.getElementById('otherLanguage').value=p.otherLanguage||'';
  document.querySelectorAll('#languageGrid input').forEach(i=>i.checked=(p.languages||[]).includes(i.value));
 }catch(e){}
}
function profileMessage(code){
 const lang=document.body.dataset.lang||'en';
 const m={
  missing:{de:'Bitte Ingame-Name und Player ID eingeben.',en:'Please enter your in-game name and Player ID.',fr:'Saisis ton nom en jeu et ta Player ID.'},
  noLanguage:{de:'Bitte mindestens eine Sprache auswählen.',en:'Please select at least one language.',fr:'Sélectionne au moins une langue.'},
  invalidId:{de:'Die Player ID sollte nur aus Zahlen bestehen.',en:'The Player ID should contain numbers only.',fr:'La Player ID doit contenir uniquement des chiffres.'},
  notFound:{de:'Spieler nicht gefunden. Bitte Name und Player ID prüfen.',en:'Player not found. Please check your name and Player ID.',fr:'Joueur introuvable. Vérifie ton nom et ta Player ID.'},
  saved:{de:'Im NRW-Spielerprofil gespeichert ✓',en:'Saved to your NRW member profile ✓',fr:'Enregistré dans ton profil NRW ✓'},
  queued:{de:'Zur Prüfung gespeichert ✓',en:'Saved for review ✓',fr:'Enregistré pour vérification ✓'},
  error:{de:'Speichern gerade nicht möglich. Bitte später erneut versuchen.',en:'Could not save right now. Please try again later.',fr:'Enregistrement impossible pour le moment. Réessaie plus tard.'}
 };
 return (m[code]||m.error)[lang] || (m[code]||m.error).en;
}

document.getElementById('saveProfile').addEventListener('click',async()=>{
 const button=document.getElementById('saveProfile');
 const status=document.getElementById('saveStatus');
 status.classList.remove('error','success');

 const profile={
  schemaVersion:2,
  playerName:document.getElementById('playerName').value.trim(),
  playerId:document.getElementById('playerId').value.trim(),
  languages:[...document.querySelectorAll('#languageGrid input:checked')].map(i=>i.value),
  otherLanguage:document.getElementById('otherLanguage').value.trim(),
  source:'nrw-welcome-page',
  updatedAt:new Date().toISOString()
 };

 if(!profile.playerName || !profile.playerId){
  status.textContent=profileMessage('missing'); status.classList.add('error'); return;
 }
 if(!/^\d+$/.test(profile.playerId)){
  status.textContent=profileMessage('invalidId'); status.classList.add('error'); return;
 }
 if(profile.languages.length===0 && !profile.otherLanguage){
  status.textContent=profileMessage('noLanguage'); status.classList.add('error'); return;
 }

 button.disabled=true;
 try{
  const response=await fetch('https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/nrw-welcome-language',{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify(profile)
  });
  const data=await response.json().catch(()=>({}));
  if(response.status===404 || data?.code==='player_not_found'){
   status.textContent=profileMessage('notFound'); status.classList.add('error'); return;
  }
  if(!response.ok || !data?.ok) throw new Error(data?.error||('HTTP '+response.status));

  localStorage.setItem(profileKey,JSON.stringify(profile));
  window.NRW_MEMBER_PROFILE_PAYLOAD=profile;
  status.textContent=profileMessage(data?.queued?'queued':'saved');
  status.classList.add('success');
 }catch(e){
  console.error('NRW language profile save failed',e);
  status.textContent=profileMessage('error');
  status.classList.add('error');
 }finally{
  button.disabled=false;
  setTimeout(()=>{status.textContent='';status.classList.remove('error','success');},5000);
 }
});

loadProfile();

document.getElementById('copyHello')?.addEventListener('click', async ()=>{
 const de="Hey zusammen, ich bin neu bei NRW 👋 Freue mich auf die Zeit mit euch! Wenn ich bei Events oder Abläufen etwas übersehe, sagt mir einfach kurz Bescheid 😊";
 const en="Hey everyone, I'm new to NRW 👋 Looking forward to playing with you! If I miss anything about events or our routines, just let me know 😊";
 const fr="Salut tout le monde, je viens d’arriver chez NRW 👋 Hâte de jouer avec vous ! Si je rate quelque chose concernant un événement ou nos habitudes, dites-le-moi simplement 😊";
 const text=document.body.dataset.lang==='en'?en:document.body.dataset.lang==='fr'?fr:de;
 const status=document.getElementById('copyHelloStatus');
 try{ await navigator.clipboard.writeText(text); status.textContent=document.body.dataset.lang==='en'?'Copied ✓':document.body.dataset.lang==='fr'?'Copié ✓':'Kopiert ✓'; }
 catch(e){ status.textContent=document.body.dataset.lang==='en'?'Select the text above':document.body.dataset.lang==='fr'?'Sélectionne le texte ci-dessus':'Text oben markieren'; }
 setTimeout(()=>status.textContent='',2600);
});

let sagrWatchlistPlayers=new Map();
let sagrCheckedAt=null;
const sagrPositionStateKey='nrw_sagr_position_history_v1';

function sagrLang(){
 const value=document.body?.dataset?.lang||document.documentElement.lang||'en';
 return ['de','en','fr'].includes(value)?value:'en';
}

function sagrLocationAge(value){
 const parsed=Date.parse(value||'');
 if(!Number.isFinite(parsed)) return '';
 const diff=Math.max(0,Date.now()-parsed);
 const minutes=Math.floor(diff/60000);
 const hours=Math.floor(diff/3600000);
 const days=Math.floor(diff/86400000);
 const lang=sagrLang();
 if(minutes<2) return {de:'gerade eben',en:'just now',fr:'à l’instant'}[lang];
 if(minutes<60) return {de:`vor ${minutes} Min.`,en:`${minutes}m ago`,fr:`il y a ${minutes} min`}[lang];
 if(hours<24) return {de:`vor ${hours} Std.`,en:`${hours}h ago`,fr:`il y a ${hours} h`}[lang];
 return {de:`vor ${days} Tg.`,en:`${days}d ago`,fr:`il y a ${days} j`}[lang];
}

function sagrDurationSince(value){
 const parsed=Date.parse(value||'');
 if(!Number.isFinite(parsed)) return '';
 const diff=Math.max(0,Date.now()-parsed);
 const minutes=Math.floor(diff/60000);
 const hours=Math.floor(diff/3600000);
 const days=Math.floor(diff/86400000);
 const lang=sagrLang();
 if(minutes<2) return {de:'wenigen Augenblicken',en:'a moment',fr:'un instant'}[lang];
 if(minutes<60) return {de:`${minutes} Min.`,en:`${minutes}m`,fr:`${minutes} min`}[lang];
 if(hours<24) return {de:`${hours} Std.`,en:`${hours}h`,fr:`${hours} h`}[lang];
 return {de:`${days} Tg.`,en:`${days}d`,fr:`${days} j`}[lang];
}

function sagrPositionChangedAt(player){
 if(!player?.locationAvailable || !Number.isFinite(Number(player.x)) || !Number.isFinite(Number(player.y))) return null;
 let state={};
 try{ state=JSON.parse(localStorage.getItem(sagrPositionStateKey)||'{}')||{}; }catch(e){ state={}; }
 const id=String(player.id);
 const x=Number(player.x), y=Number(player.y);
 const previous=state[id];
 const same=previous && Number(previous.x)===x && Number(previous.y)===y;
 if(!same){
  state[id]={x,y,changedAt:player.locationUpdatedAt||sagrCheckedAt||new Date().toISOString()};
 }else if(!previous.changedAt){
  previous.changedAt=player.locationUpdatedAt||sagrCheckedAt||new Date().toISOString();
 }
 try{ localStorage.setItem(sagrPositionStateKey,JSON.stringify(state)); }catch(e){}
 return state[id]?.changedAt||null;
}

function ensureSagrLocationStyles(){
 if(document.getElementById('sagrLocationStyles')) return;
 const style=document.createElement('style');
 style.id='sagrLocationStyles';
 style.textContent=`
 .outlaw-location{display:flex;flex-direction:column;gap:2px;margin-top:7px;padding:7px 9px;border-radius:10px;background:color-mix(in srgb,var(--surface2) 72%,transparent);border:1px solid var(--line)}
 .outlaw-location b{font-size:11px;letter-spacing:.01em;color:var(--ink)}
 .outlaw-location small{font-size:8px;color:var(--muted);line-height:1.35;display:block}
 .outlaw-location.is-missing b{color:var(--muted)}
 @media(max-width:760px){
  .outlaw-accounts>div{grid-template-columns:68px minmax(0,1fr) auto;gap:6px}
  .outlaw-accounts>div>span:first-child{white-space:nowrap}
  .outlaw-location{margin-left:-7px;padding:7px 7px}
  .outlaw-location:not(.is-missing) b{font-size:10.5px;white-space:nowrap}
  .outlaw-location small{font-size:7.5px;white-space:nowrap}
 }
 `;
 document.head.appendChild(style);
}

function renderSagrLocations(){
 ensureSagrLocationStyles();
 const lang=sagrLang();
 const missing={de:'📍 Standort derzeit nicht erfasst',en:'📍 Location currently unavailable',fr:'📍 Position actuellement indisponible'}[lang];
 const tcLabel=level=>level?`TC ${level}`:'TC ?';
 const positionChangedLabel={de:'unverändert',en:'unchanged',fr:'inchangée'}[lang];
 const mapLabel={de:'MightPulse-Karte',en:'MightPulse map',fr:'carte MightPulse'}[lang];
 const checkedLabel={de:'geprüft',en:'checked',fr:'vérifié'}[lang];
 const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const shieldLabel=player=>{
  const state=String(player?.shieldState||'unknown');
  if(state==='active'){
   const end=Date.parse(player?.shieldEndAt||'');
   const minutes=Number.isFinite(end)?Math.max(0,Math.ceil((end-Date.now())/60000)):null;
   if(minutes!=null) return {de:`🛡️ Schild · ~${minutes} Min.`,en:`🛡️ Shield · ~${minutes}m`,fr:`🛡️ Bouclier · ~${minutes} min`}[lang];
   return {de:'🛡️ Schild aktiv',en:'🛡️ Shield active',fr:'🛡️ Bouclier actif'}[lang];
  }
  if(state==='none') return {de:'⭕ Kein Schild',en:'⭕ No shield',fr:'⭕ Sans bouclier'}[lang];
  return {de:'❔ Schild unbekannt',en:'❔ Shield unknown',fr:'❔ Bouclier inconnu'}[lang];
 };
 document.querySelectorAll('.outlaw-accounts [data-player-id]').forEach(card=>{
  const player=sagrWatchlistPlayers.get(card.dataset.playerId);
  if(!player) return;
  const nameTarget=card.querySelector('[data-player-name]');
  if(player.nickname&&nameTarget) nameTarget.textContent=player.nickname;
  let location=card.querySelector('[data-player-location]');
  if(!location){
   location=document.createElement('span');
   location.dataset.playerLocation='';
   location.className='outlaw-location';
   const idLine=card.querySelector('small');
   if(idLine) card.insertBefore(location,idLine); else card.appendChild(location);
  }
  const tc=Number(player.townCenterLevel);
  const tcText=tcLabel(Number.isFinite(tc)&&tc>0?tc:null);
  const checkedAge=sagrLocationAge(sagrCheckedAt);
  const sourceAge=sagrLocationAge(player.locationUpdatedAt);
  const allianceText=player.alliance?`[${safe(player.alliance)}]`:'—';
  const shieldText=shieldLabel(player);
  if(player.locationAvailable&&Number.isFinite(Number(player.x))&&Number.isFinite(Number(player.y))){
   location.classList.remove('is-missing');
   const changedAt=sagrPositionChangedAt(player);
   const unchangedFor=sagrDurationSince(changedAt);
   const positionLine=unchangedFor
    ? (lang==='de'?`seit ${unchangedFor} ${positionChangedLabel}`:lang==='fr'?`${positionChangedLabel} depuis ${unchangedFor}`:`${positionChangedLabel} for ${unchangedFor}`)
    : positionChangedLabel;
   location.innerHTML=`<b>📍 X: ${Number(player.x)} · Y: ${Number(player.y)}</b><small>${allianceText} · ${tcText} · ${shieldText}</small><small>${positionLine} · ${mapLabel}${sourceAge?` ${sourceAge}`:''}${checkedAge?` · ${checkedLabel} ${checkedAge}`:''}</small>`;
  }else{
   location.classList.add('is-missing');
   location.innerHTML=`<b>${missing}</b><small>${allianceText} · ${tcText} · ${shieldText}${checkedAge?` · ${checkedLabel} ${checkedAge}`:''}</small>`;
  }
 });
}

async function refreshSagrAccountNames(){
 try{
  const response=await fetch('/api/sagr-accounts',{headers:{'Accept':'application/json'},cache:'no-store'});
  if(!response.ok) return;
  const payload=await response.json();
  sagrCheckedAt=payload.checkedAt||payload.updatedAt||new Date().toISOString();
  sagrWatchlistPlayers=new Map((payload.players||[]).map(player=>[String(player.id),player]));
  renderSagrLocations();
 }catch(error){
  console.warn('Sagr account data could not be refreshed',error);
 }
}
refreshSagrAccountNames();
setInterval(refreshSagrAccountNames,5*60*1000);
window.addEventListener('nrw-lang-change',renderSagrLocations);

(function add555ChatCulture(){
 const grid=document.querySelector('.transfer-summary');
 if(!grid || document.getElementById('nrw555Culture')) return;
 const card=document.createElement('article');
 card.id='nrw555Culture';
 card.className='know-card wide';
 card.innerHTML=`
  <div class="know-top"><div class="know-icon">😂</div><span class="know-no">05</span></div>
  <h3 class="de">Warum schreibt bei uns jeder „555+“?</h3>
  <h3 class="en">Why does everyone here write “555+”?</h3>
  <h3 class="fr">Pourquoi tout le monde écrit « 555+ » ici ?</h3>
  <p class="de">In Thailand wird die <b>5 wie „ha“</b> ausgesprochen. Deshalb bedeutet <b>555</b> so viel wie „hahaha“ – und <b>555+</b> einfach: noch mehr Lachen. Poneglyph und Akuma haben das bei uns geprägt; irgendwann hat NRW es übernommen. Wenn du also 555+ im Chat siehst: Jemand lacht. 😄</p>
  <p class="en">In Thai, the number <b>5 is pronounced “ha”</b>. That makes <b>555</b> the equivalent of “hahaha” — and <b>555+</b> simply means even more laughing. Poneglyph and Akuma brought it into our chat culture, and NRW eventually adopted it. So when you see 555+ in chat: someone is laughing. 😄</p>
  <p class="fr">En thaï, le chiffre <b>5 se prononce « ha »</b>. Ainsi, <b>555</b> signifie « hahaha » — et <b>555+</b> veut simplement dire encore plus de rire. Poneglyph et Akuma ont popularisé cette habitude chez nous, puis NRW l’a adoptée. Si tu vois 555+ dans le chat : quelqu’un rigole. 😄</p>`;
 grid.appendChild(card);
})();

(function useCurrentDiscordInvite(){
 const currentDiscord='https://discord.gg/cZp27eVYXC';
 const apply=()=>document.querySelectorAll('a[href*="discord.gg"]').forEach(link=>{link.href=currentDiscord});
 apply();
 const observer=new MutationObserver(()=>apply());
 observer.observe(document.body,{childList:true,subtree:true});
})();
