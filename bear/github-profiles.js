/* Read-only GitHub Pages profile lookup (never a MightPulse/API request).
 * Public GitHub profile files are opt-in, not automatically published from
 * saved browser values. Only files at ./profiles/<numeric-id>.json are read.
 * Existing localStorage profile remains functional when no GitHub file exists.
 */
(function(root){
'use strict';
const BASE='./profiles/';
const valid=id=>/^[0-9]{5,20}$/.test(String(id||''));
function validate(id,data){
 if(!valid(id)||!data||typeof data!=='object'||Array.isArray(data))return false;
 const own=String(data.governor_id||data.player?.governor_id||'');
 if(own!==String(id)||!data.values||typeof data.values!=='object'||
   !data.v2||typeof data.v2!=='object'||Array.isArray(data.v2))return false;
 return Object.entries(data.values).every(([k,v])=>
  /^[a-zA-Z][a-zA-Z0-9]{0,55}$/.test(k)&&
  ((typeof v==='number'&&Number.isFinite(v))||typeof v==='string'||v===null));
}
async function load(id,fetchImpl){
 if(!valid(id))return {source:'invalid',profile:null};
 const read=fetchImpl||root.fetch?.bind(root);
 if(typeof read!=='function')return {source:'local',profile:null};
 try{
  const reply=await read(BASE+id+'.json',{cache:'no-cache'});
  if(reply.status===404)return {source:'local',profile:null};
  if(!reply.ok)return {source:'error',profile:null};
  const data=await reply.json();
  if(!validate(id,data))return {source:'invalid-github-profile',profile:null};
  return {source:'github',profile:data};
 }catch(_){return {source:'local',profile:null};}
}
function install(){
 const form=root.document?.getElementById('lookupForm');
 if(!form||!root.NRW_BEAR_BRIDGE)return;
 const bridge=root.NRW_BEAR_BRIDGE,button=root.document.getElementById('lookupButton');
 const input=root.document.getElementById('governorId');
 const status=root.document.getElementById('lookupMessage');
 if(!input||!button)return;
 const language=()=>root.document.documentElement.lang||'de';
 const tr=(de,en,fr)=>language()==='de'?de:language()==='fr'?fr:en;
 const show=(message)=>{if(status){status.className='msg show';status.textContent=message;}};
 form.addEventListener('submit',async event=>{
  // Capture to suppress the original API-bound bubbling handler altogether.
  event.preventDefault();event.stopImmediatePropagation();
  if(button.disabled)return;
  const id=input.value.trim();
  if(!valid(id)){show(tr('Bitte gültige Spieler-ID eingeben.','Enter a valid player ID.','Saisis un ID valide.'));return;}
  button.disabled=true;show(tr('Gespeicherte Werte werden geladen …','Loading saved profile …','Chargement du profil …'));
  try{
   const result=await load(id);
   if(result.source==='invalid-github-profile'||result.source==='error'){
    show(tr('Die GitHub-Profildatei konnte nicht sicher gelesen werden. Bitte später erneut versuchen.',
     'Saved GitHub profile could not be read safely. Please try again later.','Le profil GitHub est invalide ou indisponible.'));
    return;
   }
   const saved=result.profile;
   const name=String(saved?.name||saved?.player?.name||id).slice(0,80);
   bridge.activateSavedId(id,name);
   if(saved){
    const m=bridge.model(),fields=['troopsI','troopsC','troopsA','cap','squadAtk','squadLet','iAtk','iLet','cAtk','cLet','aAtk','aLet'];
    for(const key of fields){
     const value=Number(saved.values[key]);
     if(saved.values[key]!==''&&saved.values[key]!=null&&Number.isFinite(value)&&value>=0)
      m.values[key]=value;
    }
    // Expected public file source is a complete, explicitly user-approved
    // snapshot. Never merge untrusted fields into DOM/HTML via innerHTML.
    m.v2=JSON.parse(JSON.stringify(saved.v2));
    // Existing form fields are still bound to the original in-memory model;
    // refresh displayed inputs only after the approved snapshot was loaded.
    for(const [key,value] of Object.entries(m.values)){
     const field=root.document.getElementById(key);
     if(field&&'value' in field&&typeof value==='number')field.value=String(value);
    }
    bridge.save();bridge.render();
    root.NRW_BEAR_ENHANCE?.refreshHeroes?.();
    root.dispatchEvent(new CustomEvent('nrw-bear-github-profile-loaded',{detail:{id}}));
   }
   root.NRW_BEAR_PROFILE_SOURCE=result.source;
   const playerName=root.document.getElementById('playerName');
   if(playerName)playerName.textContent=name;
   const playerMeta=root.document.getElementById('playerMeta');
   if(playerMeta)playerMeta.textContent=result.source==='github'?
    tr('GitHub-Profil geladen','GitHub profile loaded','Profil GitHub chargé'):
    tr('Auf diesem Gerät gespeichertes Profil / neue Eingabe',
     'Saved on this device / new profile','Profil local / nouveau');
   // The original activateSavedId intentionally dispatches the existing
   // nrw-bear-loaded event, so the wizard continues automatically.
  }catch(_){
   show(tr('Profil konnte nicht geöffnet werden.','Could not open profile.','Impossible d’ouvrir le profil.'));
  }finally{button.disabled=false;}
 },true);
 // Hide obsolete API/manual demo controls in guided mode only.
 root.document.body.classList.add('bear-github-id-mode');
}
root.NRW_BEAR_GITHUB_PROFILES={valid,validate,load,install};
if(root.document)install();
})(window);
