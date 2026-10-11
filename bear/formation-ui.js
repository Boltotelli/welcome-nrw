/* Guided Bear Trap march-slot selection and proposed stock-safe formations. */
(function(root){
'use strict';
const types=['Inf','Cav','Arch'];
function mount(step,results,B,language){
 const host=document.createElement('section');
 host.id='bearMarchQueueSetup';host.className='bear-march-queue-setup';
 const title=document.createElement('h3');host.append(title);
 const sub=document.createElement('p');sub.className='hint';host.append(sub);
 const grid=document.createElement('div');grid.className='bear-march-queue-controls';
 const starter=document.createElement('div');starter.className='bear-queue-fixed';grid.append(starter);
 const label=document.createElement('label');label.htmlFor='bearGuidedJoins';grid.append(label);
 const select=document.createElement('select');select.id='bearGuidedJoins';
 for(let n=0;n<=6;n++){const o=document.createElement('option');o.value=String(n);o.textContent=String(n);select.append(o);}
 label.append(select);
 const total=document.createElement('p');total.className='bear-queue-total';grid.append(total);
 host.append(grid);step.append(host);
 const card=document.createElement('div');card.id='bearFormationProposal';card.className='bear-formation-proposal';results.prepend(card);
 const esTexts={"March queues":"Colas de marcha","One starter is fixed. Select 0–6 additional joins you can send simultaneously.":"Una marcha inicial está fija. Selecciona de 0 a 6 apoyos que puedas enviar simultáneamente.","★ Starter: 1 (fixed)":"★ Inicio: 1 (fijo)","Simultaneous joins: ":"Apoyos simultáneos: ","marches":"marchas","Your Bear formation proposal":"Tu formación recomendada para el oso","Only the first Expedition skill of Hero 1 (left) can count when joining.":"En los apoyos solo puede contar la primera habilidad de expedición del héroe 1 (izquierda).","Missing confirmed inputs for the formation: ":"Faltan datos confirmados para la formación: ","Not enough scanned heroes for three unique heroes on every march. Empty slots remain marked, never invented.":"No hay suficientes héroes escaneados para tres distintos por marcha. Los huecos permanecen vacíos.","Some join heroes or their levels are missing. Their capacity is a conservative lower bound; verify in game.":"Faltan héroes de apoyo o sus niveles. Su capacidad es una estimación mínima; compruébala en el juego.","Total troop utilization":"Uso total de tropas"," left":" restantes","Assigned: ":"Asignadas: ","Remaining: ":"Restantes: ","★ Start your rally":"★ Iniciar rally","↗ Join ":"↗ Apoyo ","Missing":"Falta","Left · Skill 1 counts":"Izquierda · cuenta habilidad 1","No suitable join leader – no troops assigned":"Sin líder de apoyo válido · no se asignan tropas","Vivian and other offensive joiners are considered if present in your scanned hero roster.":"Vivian y otros héroes de apoyo ofensivos se consideran si aparecen en tus capturas."," troops":" tropas"," (lower bound)":" (estimación mínima)"};
 const tr=(de,en,fr)=>language()==='de'?de:language()==='fr'?fr:language()==='es'?(esTexts[en]||en):en;
 const fmt=n=>Number(n||0).toLocaleString(language()==='de'?'de-DE':language()==='fr'?'fr-FR':language()==='es'?'es-ES':'en-US');
 function refreshSetup(){
  title.textContent=tr('Marschschlangen','March queues','Files de marche');
  sub.textContent=tr('1 Starter ist fest. Wähle 0–6 zusätzliche Joins, die du gleichzeitig senden kannst.',
   'One starter is fixed. Select 0–6 additional joins you can send simultaneously.',
   "Un départ est fixe. Choisis 0–6 renforts simultanés.");
  starter.textContent=tr('★ Starter: 1 (fest)','★ Starter: 1 (fixed)','★ Départ : 1 (fixe)');
  label.firstChild?.nodeType===3&&(label.firstChild.textContent=tr('Gleichzeitige Joins: ','Simultaneous joins: ','Renforts simultanés : '));
  if(!label.firstChild||label.firstChild.nodeType!==3)label.prepend(document.createTextNode(tr('Gleichzeitige Joins: ','Simultaneous joins: ','Renforts simultanés : ')));
  const count=Math.max(0,Math.min(6,Number(B.model().v2?.joinCount)||0));
  select.value=String(count);
  total.textContent=(count+1)+' / 7 '+tr('Märsche','marches','marches');
 }
 select.addEventListener('change',()=>{
  const m=B.model();m.v2=m.v2||{};
  m.v2.joinCount=Math.max(0,Math.min(6,Number(select.value)||0));
  const original=document.getElementById('joinCount');
  if(original)original.value=String(m.v2.joinCount);
  B.save();B.render();refreshSetup();
 });
 function create(tag,cls,text){
  const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;
  return el;
 }
 function show(){
  card.replaceChildren();
  const m=B.model(),F=root.NRW_BEAR_FORMATION;
  const plan=F?.plan(m,root.NRW_BEAR_CATALOG,root.NRW_BEAR_COMBAT,root.NRW_BEAR_CAPACITY);
  if(!plan)return;
  card.append(create('h3','',tr('Dein Bären-Formationsvorschlag','Your Bear formation proposal','Formation conseillée pour l’ours')));
  card.append(create('p','bear-formation-primary-note',tr(
   'Nur der erste Expeditionsskill von Held 1 (links) kann beim Joinen zählen.',
   'Only the first Expedition skill of Hero 1 (left) can count when joining.',
   'Seule la première compétence d’expédition du héros 1 (à gauche) compte en renfort.')));
  if(!plan.ready){
   const missing=create('p','bear-guide-needed',tr('Für die Formation fehlen bestätigte Angaben: ','Missing confirmed inputs for the formation: ','Données manquantes : ')+plan.missing.join(', '));
   card.append(missing);return;
  }
  if(!plan.allHeroesAssigned)card.append(create('p','bear-guide-needed',
   tr('Nicht genügend eingescannte Helden für drei unterschiedliche Helden pro Marsch. Freie Plätze werden als „fehlt“ markiert – keine erfundenen Helden.',
      'Not enough scanned heroes for three unique heroes on every march. Empty slots remain marked, never invented.',
      "Pas assez de héros reconnus pour trois héros différents par marche.")));
  if(!plan.allHeroLevelsKnown)card.append(create('p','bear-guide-needed',
   tr('Einzelne Join-Helden fehlen oder ihr Level ist unbekannt. Für diese Märsche ist die Kapazität eine Untergrenze; bitte im Spiel prüfen.',
      'Some join heroes or their levels are missing. Their capacity is a conservative lower bound; verify in game.',
      "Certains niveaux de héros manquent ; capacité minimale à vérifier dans le jeu.")));
  const allNames=['Infanterie','Kavallerie','Bogenschützen'];
  const allNamesEn=['Infantry','Cavalry','Archers'];
  const allNamesFr=['Infanterie','Cavalerie','Archers'];
  const classNames=language()==='de'?allNames:language()==='fr'?allNamesFr:allNamesEn;
  const table=create('div','bear-usage-summary');table.hidden=true;
  table.append(create('h4','',tr('Truppen-Auslastung gesamt','Total troop utilization','Utilisation totale des troupes')));
  for(let k=0;k<3;k++){
   const row=create('div','bear-usage-row');
   const legend=create('div','bear-usage-label');
   legend.append(create('span','',classNames[k]),create('strong','',fmt(plan.used[k])+' / '+fmt(plan.stock[k])+' · '+fmt(plan.leftover[k])+tr(' frei',' left',' restantes')));
   const track=create('div','bear-usage-track');
   const fill=create('div','bear-usage-fill type-'+k);fill.style.width=(plan.stock[k]?100*plan.used[k]/plan.stock[k]:0)+'%';
   track.append(fill);row.append(legend,track);table.append(row);
  }
  card.append(table);
  const summary=create('p','hint',tr('Gesendet: ','Assigned: ','Envoyés : ')+fmt(plan.used.reduce((a,b)=>a+b,0))+
   ' / '+fmt(plan.stock.reduce((a,b)=>a+b,0))+' · '+
   tr('Übrig: ','Remaining: ','Restantes : ')+fmt(plan.leftover.reduce((a,b)=>a+b,0)));
  // Shared inventory bookkeeping remains internal; no clutter in result.
  for(const march of plan.marches){
   const section=create('section','bear-formation-march');
   section.append(create('h4','',march.slot===0?
    tr('★ Eigene Rally starten','★ Start your rally','★ Lancer son rally'):
    tr('↗ Join ','↗ Join ','↗ Renfort ')+march.slot));
   const heroList=create('div','bear-formation-heroes');
   march.heroes.slice(0,3).forEach((hero,j)=>{
    const item=create('div','bear-formation-hero'+(march.slot>0&&j===0?' first':''));
    const photo=root.NRW_BEAR_CATALOG?.heroes?.find(x=>x.name===hero?.name)?.img;
    if(photo){const img=create('img');img.src=photo;img.alt='';img.loading='lazy';item.append(img);}
    else item.append(create('span','bear-hero-blank','?'));
    const details=create('div');
    details.append(create('strong','',hero?.name||tr('Fehlt','Missing','Manquant')));
    details.append(create('small','',hero?.level?'Lv. '+hero.level:'Lv. ?'));
    if(march.slot>0&&j===0)details.append(create('small','bear-formation-first-note',tr('Links · Skill 1 zählt','Left · Skill 1 counts','Gauche · compétence 1')));
    item.append(details);heroList.append(item);
   });
   section.append(heroList);
   // Help is displayed exactly once, above the whole formation.
   const rows=create('div','bear-formation-troops');
   if(march.eligible===false){
    rows.append(create('strong','',tr('Kein Join-Leader – keine Truppen eingeplant',
     'No suitable join leader – no troops assigned',
     'Aucun héros adapté – aucune troupe planifiée')));
    rows.append(create('span','',tr(
     'Vivian und andere offensive Joiner werden berücksichtigt, sobald sie in der gescannten Heldenübersicht vorhanden sind.',
     'Vivian and other offensive joiners are considered if present in your scanned hero roster.',
     'Vivian et les autres héros offensifs doivent figurer dans les captures reconnues.')));
   }else{
    rows.append(create('strong','',fmt(march.filled)+' / '+fmt(march.capacity)+
     tr(' Truppen',' troops',' troupes')+(march.capacityKnown?'':tr(' (mindestens)',' (lower bound)',' (minimum)'))));
    rows.append(create('span','bear-formation-counts',classNames.map((name,k)=>
     name+': '+fmt(march.troops[k])+' ('+march.ratio[k]+'%)').join(' · ')));
   }
   section.append(rows);card.append(section);
  }
  // Detailed damage-model caveats remain internal, not in the hero lineup.
 }
 refreshSetup();
 return {refreshSetup,show};
}
root.NRW_BEAR_FORMATION_UI={mount};
})(window);
