/* Read-only public stream from AllianceOS. Never embeds tokens or unpublished data. */
(()=>{
'use strict';
const ENDPOINT="https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/allianceos-leitung";
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const strings={
de:{eyebrow:"NEU AUS DER NRW-EVENTPLANUNG",title:"Bestätigte Allianztermine",intro:"Diese Termine wurden von der NRW-Leitung veröffentlicht. Die Uhrzeit wird für dein Gerät umgerechnet.",laws:"NRW-Allianzregeln",lawsInfo:"Zusätzliche Allianzregeln. Die Servergesetze oben bleiben maßgeblich.",nr:"Regel",version:"Version"},
en:{eyebrow:"NRW EVENT UPDATES",title:"Confirmed alliance events",intro:"These events were published by NRW leadership. Times are shown in your device timezone.",laws:"NRW alliance rules",lawsInfo:"Additional alliance rules. The server laws above remain authoritative.",nr:"Rule",version:"Version"},
fr:{eyebrow:"ÉVÉNEMENTS NRW",title:"Événements confirmés",intro:"Ces dates ont été publiées par les responsables NRW. L’heure est adaptée à ton fuseau.",laws:"Règles de l’alliance NRW",lawsInfo:"Règles supplémentaires. Les lois du serveur ci-dessus restent prioritaires.",nr:"Règle",version:"Version"},
es:{eyebrow:"EVENTOS NRW",title:"Eventos confirmados",intro:"Fechas publicadas por los líderes de NRW, mostradas en tu zona horaria.",laws:"Normas de la alianza NRW",lawsInfo:"Reglas adicionales. Las leyes del servidor anteriores siguen vigentes.",nr:"Norma",version:"Versión"}};
const selected=()=>{const l=document.body?.dataset.lang||localStorage.getItem("nrw_page_lang")||"en";return strings[l]?l:"en";};
const local=(obj,l)=>typeof obj==="string"?obj:(obj?.[l]||obj?.en||obj?.de||obj?.fr||obj?.es||"");
const date=(input,l)=>new Intl.DateTimeFormat(({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"})[l],{weekday:"short",year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",timeZoneName:"short"}).format(new Date(input));
const root=document.querySelector("[data-allianceos]");
if(!root)return;
const mode=root.dataset.allianceos==="laws"?"public-laws":"public-events";
let records=[];
function render(){
 const l=selected(),words=strings[l],outer=root.querySelector("[data-aos-content]");
 if(!outer)return;
 if(!records.length){root.hidden=true;return;}
 root.hidden=false;
 if(mode==="public-events"){
  outer.innerHTML='<div class="aos-public-block"><div class="aos-kicker">'+esc(words.eyebrow)+'</div><h2>'+esc(words.title)+'</h2><p class="aos-intro">'+esc(words.intro)+'</p><div class="aos-public-grid">'+records.map(e=>
   '<article class="aos-public-card"><strong>'+esc(local(e.title,l))+'</strong><small><time datetime="'+esc(e.start_at)+'">'+esc(date(e.start_at,l))+'</time></small>'+
   (e.requirements?'<p class="aos-public-meta">'+esc(e.requirements)+'</p>':'')+
   (local(e.description,l)?'<p>'+esc(local(e.description,l))+'</p>':'')+'</article>').join("")+'</div></div>';
 }else{
  outer.innerHTML='<div class="aos-public-block"><div class="aos-kicker">ALLIANCEOS</div><h2>'+esc(words.laws)+'</h2><p class="aos-intro">'+esc(words.lawsInfo)+'</p>'+
   records.map(x=>'<details class="aos-public-card aos-public-law"><summary><span>'+esc(words.nr)+' '+esc(x.number)+'</span>'+esc(local(x.title,l))+'</summary><p>'+esc(local(x.body,l))+'</p><small>'+esc(words.version)+' '+esc(x.version)+'</small></details>').join("")+'</div>';
 }
}
fetch(ENDPOINT+"?alliance=NRW&mode="+mode,{cache:"no-store",headers:{Accept:"application/json"}}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{
 records=mode==="public-events"?(Array.isArray(data.events)?data.events:[]):(Array.isArray(data.laws)?data.laws:[]);
 render();
}).catch(()=>{root.hidden=true;});
new MutationObserver(mutations=>{if(mutations.some(m=>m.attributeName==="data-lang"))render();}).observe(document.body,{attributes:true,attributeFilter:["data-lang"]});
window.addEventListener("nrw-lang-change",render);
})();