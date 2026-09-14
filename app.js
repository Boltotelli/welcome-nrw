
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


async function refreshSagrAccountNames(){
 try{
  const response=await fetch('/api/sagr-accounts',{headers:{'Accept':'application/json'}});
  if(!response.ok) return;
  const payload=await response.json();
  const names=new Map((payload.players||[]).map(player=>[String(player.id),player.nickname]));
  document.querySelectorAll('.outlaw-accounts [data-player-id]').forEach(card=>{
   const name=names.get(card.dataset.playerId);
   const target=card.querySelector('[data-player-name]');
   if(name && target) target.textContent=name;
  });
 }catch(error){
  console.warn('Sagr account names could not be refreshed',error);
 }
}
refreshSagrAccountNames();
