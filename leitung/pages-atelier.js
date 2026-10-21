/* Pages-only progressive enhancement. No game-data requests or auth logic. */
(() => {
 "use strict";
 if(location.hostname!=="boltotelli.github.io")return;
 document.documentElement.classList.add("pages-atelier");
 const run=()=>{
  const nav=document.getElementById("sideNav");
  if(!nav||nav.dataset.atelierReady==="true")return;
  nav.dataset.atelierReady="true";
  const translations={
   de:{main:"ALLIANZ",ops:"EVENT-OPERATIONS",org:"ORGANISATION",system:"VERWALTUNG",skip:"Zum Inhalt springen"},
   en:{main:"ALLIANCE",ops:"EVENT OPERATIONS",org:"ORGANIZATION",system:"MANAGEMENT",skip:"Skip to content"},
   fr:{main:"ALLIANCE",ops:"OPÉRATIONS ÉVÉNEMENTIELLES",org:"ORGANISATION",system:"GESTION",skip:"Aller au contenu"},
   es:{main:"ALIANZA",ops:"OPERACIONES DE EVENTOS",org:"ORGANIZACIÓN",system:"GESTIÓN",skip:"Saltar al contenido"}
  };
  const groups=[
   ["overview","main"],["bear","ops"],["transfers","org"],["laws","system"]
  ];
  const labels=new Map();
  for(const [tab,section] of groups){
   const button=nav.querySelector('.nav-item[data-tab="'+tab+'"]');
   if(!button)continue;
   const marker=document.createElement("div");
   marker.className="pages-nav-group";
   marker.setAttribute("aria-hidden","true");
   marker.dataset.group=section;
   button.before(marker);
   labels.set(section,marker);
  }
  const content=document.querySelector(".workspace main");
  if(content&&!content.id)content.id="workspaceMain";
  const skip=document.createElement("a");
  skip.className="pages-skip";
  skip.href="#workspaceMain";
  skip.addEventListener("click",()=>{content?.setAttribute("tabindex","-1")});
  document.body.prepend(skip);
  const update=()=>{
   const lang=document.getElementById("language")?.value||document.documentElement.lang||"de";
   const l=translations[lang]||translations.de;
   for(const [key,node] of labels)node.textContent=l[key];
   skip.textContent=l.skip;
  };
  document.getElementById("language")?.addEventListener("change",update);
  update();
  const items=[...nav.querySelectorAll(".nav-item")];
  const sync=()=>{
   for(const item of items){
    if(item.classList.contains("active"))item.setAttribute("aria-current","page");
    else item.removeAttribute("aria-current");
   }
  };
  const observer=new MutationObserver(sync);
  for(const item of items)observer.observe(item,{attributes:true,attributeFilter:["class"]});
  sync();
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});
 else run();
})();
