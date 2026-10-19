/* AllianceOS public branding: only deliberately public alliance settings are loaded.
 * Never includes leadership records or an authenticated session. */
(()=>{
"use strict";
const ENDPOINT="https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/allianceos-leitung?alliance=NRW&mode=public-config";
const SUPPORTED=["de","en","fr"]; // public pages currently have complete copy in these three languages
const key="nrw_page_lang";
function validImg(raw){
 try{
  const u=new URL(raw);
  return u.protocol==="https:" && u.hostname==="bdzlgirowutasrsycjfj.supabase.co" &&
   u.pathname.startsWith("/storage/v1/object/public/allianceos-logos/NRW/")?u.href:null;
 }catch{return null;}
}
function validInvite(raw){
 try{
  const u=new URL(raw);
  return u.protocol==="https:" &&
   (u.hostname==="discord.gg"||u.hostname==="discord.com"||u.hostname==="www.discord.com"||
    u.hostname==="discordapp.com"||u.hostname==="www.discordapp.com")?u.href:null;
 }catch{return null;}
}
function update(){
 const data=window.NRW_PUBLIC_ALLIANCE;
 if(!data)return;
 const img=validImg(data.logo_url);
 if(img)document.querySelectorAll("[data-alliance-logo]").forEach(node=>{node.src=img;});
 if(data.name)document.querySelectorAll("[data-alliance-name]").forEach(node=>{node.textContent=data.name;});
 const invite=validInvite(data.discord_invite_url);
 if(invite)document.querySelectorAll("[data-discord-invite]").forEach(node=>{node.href=invite;});
 const available=SUPPORTED.filter(code=>(data.languages||SUPPORTED).includes(code));
 // Keep at least one visible option if the public translations are temporarily unavailable.
 const options=available.length?available:SUPPORTED;
 const preferred=localStorage.getItem(key);
 const selected=options.includes(preferred)?preferred:
   options.includes(data.default_language)?data.default_language:options[0];
 document.querySelectorAll("[data-lang-btn]").forEach(btn=>{
   btn.hidden=!options.includes(btn.dataset.langBtn);
   btn.classList.toggle("active",btn.dataset.langBtn===selected);
 });
 if(document.body.dataset.lang!==selected){
   document.body.dataset.lang=selected;
   document.documentElement.lang=selected;
   // Existing pages listen to this when additional copy needs rerendering.
   window.dispatchEvent(new CustomEvent("nrw-lang-change",{detail:selected}));
 }
}
fetch(ENDPOINT,{headers:{Accept:"application/json"},cache:"no-store"})
.then(r=>r.ok?r.json():Promise.reject())
.then(({alliance})=>{if(!alliance||!Array.isArray(alliance.languages))return;
 window.NRW_PUBLIC_ALLIANCE=alliance;update();
 // Persist public configuration for the main dashboard's language logic.
 window.dispatchEvent(new CustomEvent("nrw-public-config",{detail:alliance}));
})
.catch(()=>{ /* Retain existing working images, invitation and language options on API failure. */ });
})();
