/* Read-only public stream from AllianceOS. Never embeds tokens or unpublished data. */
(()=>{
'use strict';
const ENDPOINT="https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/allianceos-leitung";
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const strings={
de:{eyebrow:"NEU AUS DER NRW-EVENTPLANUNG",title:"Bestätigte Allianztermine",intro:"Diese Termine wurden von der NRW-Leitung veröffentlicht. Die Uhrzeit wird für dein Gerät umgerechnet.",laws:"Server-Laws · Königreich 1044",lawsInfo:"Ausschließlich die von der Leitung veröffentlichten Server-Laws.",emptyLaws:"Noch keine Server-Laws veröffentlicht.",loadFailed:"Server-Laws sind derzeit nicht erreichbar.",nr:"Regel",version:"Version"},
en:{eyebrow:"NRW EVENT UPDATES",title:"Confirmed alliance events",intro:"These events were published by NRW leadership. Times are shown in your device timezone.",laws:"Server Laws · Kingdom 1044",lawsInfo:"Only server laws explicitly published by leadership.",emptyLaws:"No server laws have been published yet.",loadFailed:"Server laws are currently unavailable.",nr:"Rule",version:"Version"},
fr:{eyebrow:"ÉVÉNEMENTS NRW",title:"Événements confirmés",intro:"Ces dates ont été publiées par les responsables NRW. L’heure est adaptée à ton fuseau.",laws:"Lois du serveur · Royaume 1044",lawsInfo:"Uniquement les lois du serveur publiées par la direction.",emptyLaws:"Aucune loi du serveur publiée.",loadFailed:"Les lois du serveur sont indisponibles.",nr:"Règle",version:"Version"},
es:{eyebrow:"EVENTOS NRW",title:"Eventos confirmados",intro:"Fechas publicadas por los líderes de NRW, mostradas en tu zona horaria.",laws:"Leyes del servidor · Reino 1044",lawsInfo:"Solo las leyes publicadas por la dirección.",emptyLaws:"Todavía no se han publicado leyes.",loadFailed:"Las leyes del servidor no están disponibles.",nr:"Norma",version:"Versión"}};
const lawUI={"de":{"search":"Law suchen …","all":"Alle Kategorien","emptyResults":"Keine passenden Laws gefunden.","category":{"protection":"Schutz","conduct":"Verhalten","combat":"Kampf","alliance":"Allianz","buildings":"Gebäude","governance":"NAP intern","spending":"3×-Regel","other":"Sonstiges"}},"en":{"search":"Search laws …","all":"All categories","emptyResults":"No matching laws.","category":{"protection":"Protection","conduct":"Conduct","combat":"Combat","alliance":"Alliance","buildings":"Buildings","governance":"Governance","spending":"3× rule","other":"Other"}},"fr":{"search":"Rechercher une loi …","all":"Toutes les catégories","emptyResults":"Aucune loi correspondante.","category":{"protection":"Protection","conduct":"Comportement","combat":"Combat","alliance":"Alliance","buildings":"Bâtiments","governance":"Gouvernance","spending":"Règle 3×","other":"Autre"}},"es":{"search":"Buscar leyes …","all":"Todas las categorías","emptyResults":"No se encontraron leyes.","category":{"protection":"Protección","conduct":"Conducta","combat":"Combate","alliance":"Alianza","buildings":"Edificios","governance":"Gobierno","spending":"Regla 3×","other":"Otros"}}};
const selected=()=>{const l=document.body?.dataset.lang||localStorage.getItem("nrw_page_lang")||"en";return strings[l]?l:"en";};
const local=(obj,l)=>typeof obj==="string"?obj:(obj?.[l]||obj?.en||obj?.de||obj?.fr||obj?.es||"");
const date=(input,l)=>new Intl.DateTimeFormat(({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"})[l],{weekday:"short",year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",timeZoneName:"short"}).format(new Date(input));
const root=document.querySelector("[data-allianceos]");
if(!root)return;
const mode=root.dataset.allianceos==="laws"?"public-laws":"public-events";
let records=[],loadError=false;
const lawSearch=document.getElementById("publicLawSearch");
const lawCategory=document.getElementById("publicLawCategory");
lawSearch?.addEventListener("input",render);
lawCategory?.addEventListener("change",render);
function render(){
 const l=selected(),words=strings[l],outer=root.querySelector("[data-aos-content]");
 if(!outer)return;
 if(!records.length&&mode!=="public-laws"){root.hidden=true;return;}
 root.hidden=false;
 if(mode==="public-events"){
  outer.innerHTML='<div class="aos-public-block"><div class="aos-kicker">'+esc(words.eyebrow)+'</div><h2>'+esc(words.title)+'</h2><p class="aos-intro">'+esc(words.intro)+'</p><div class="aos-public-grid">'+records.map(e=>
   '<article class="aos-public-card"><strong>'+esc(local(e.title,l))+'</strong><small><time datetime="'+esc(e.start_at)+'">'+esc(date(e.start_at,l))+'</time></small>'+
   (e.requirements?'<p class="aos-public-meta">'+esc(e.requirements)+'</p>':'')+
   (local(e.description,l)?'<p>'+esc(local(e.description,l))+'</p>':'')+'</article>').join("")+'</div></div>';
 }else{
  const ui=lawUI[l]||lawUI.de;
  if(lawSearch)lawSearch.placeholder=ui.search;
  if(lawCategory){
    const selectedCategory=lawCategory.value||"all";
    lawCategory.innerHTML='<option value="all">'+esc(ui.all)+'</option>'+
      ["protection","conduct","combat","alliance","buildings","governance","spending","other"].map(k=>
        '<option value="'+k+'">'+esc(ui.category[k])+'</option>').join("");
    lawCategory.value=selectedCategory;
  }
  const term=(lawSearch?.value||"").toLocaleLowerCase(l).trim();
  const cat=lawCategory?.value||"all";
  const filtered=records.filter(x=>(cat==="all"||x.category===cat) &&
    (!term||[x.number,local(x.title,l),local(x.body,l),ui.category[x.category]||""]
      .some(v=>String(v||"").toLocaleLowerCase(l).includes(term))));
  outer.innerHTML='<div class="aos-public-block"><div class="aos-kicker">ALLIANCEOS</div><h2>'+esc(words.laws)+'</h2><p class="aos-intro">'+esc(words.lawsInfo)+'</p>'+
   (filtered.length?filtered.map(x=>'<details class="aos-public-card aos-public-law"><summary><span>'+esc(words.nr)+' '+esc(x.number)+'</span>'+esc(local(x.title,l))+'</summary><p>'+esc(local(x.body,l))+'</p><small>'+esc(ui.category[x.category]||"")+' · '+esc(words.version)+' '+esc(x.version)+'</small></details>').join(""):'<p class="aos-intro">'+esc(loadError?words.loadFailed:records.length?ui.emptyResults:words.emptyLaws)+'</p>')+'</div>';
 }
}
fetch(ENDPOINT+"?alliance=NRW&mode="+mode,{cache:"no-store",headers:{Accept:"application/json"}}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{
 records=mode==="public-events"?(Array.isArray(data.events)?data.events:[]):(Array.isArray(data.laws)?data.laws:[]);
 if(mode==="public-laws")records=records.filter(x=>x&&x.scope==="kingdom"&&Number.isInteger(Number(x.version))).sort((a,b)=>
   String(a.number||"").localeCompare(String(b.number||""),selected(),{numeric:true,sensitivity:"base"}));
 render();
}).catch(()=>{if(mode==="public-laws"){loadError=true;records=[];render();}else root.hidden=true;});
new MutationObserver(mutations=>{if(mutations.some(m=>m.attributeName==="data-lang"))render();}).observe(document.body,{attributes:true,attributeFilter:["data-lang"]});
window.addEventListener("nrw-lang-change",render);
})();