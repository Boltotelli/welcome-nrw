/* NRW Bear Optimizer - mobile-first quick setup, all advanced fields preserved.
 * No parallel data store: these views move the original inputs, keeping existing
 * listeners, localStorage and model validation unchanged.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE, C=window.NRW_BEAR_COMBAT;
const r=document.getElementById('restricted');
const roster=document.querySelector('.bear-v2-mount');
const arsenal=document.getElementById('troopsI')?.closest('section.panel');
const warRoom=document.getElementById('marches')?.closest('section.panel');
if(!B||!C||!r||!roster||!arsenal||!warRoom)return;
const strings={
 de:{
  title:'🐻 Bärenfalle · Schnellstart',sub:'Deine Aufstellung in drei Schritten – Details nur, wenn du sie brauchst.',
  troops:'Truppen',troopsNote:'Ein Truppentyp = eine Stufe. Für gemischte T-Stufen brauchen wir später eine eigene Verteilung.',
  type:['Infanterie','Kavallerie','Bogenschützen'],qty:'Anzahl',stage:'Stufe',tg:'Truegold',
  cap:'Schwadronskapazität ohne Helden',team:'Märsche und Starterhelden',
  combat:'Kampfwerte',statNote:'Die sechs Angriffs-/Tödlichkeitswerte aus dem Spiel eintragen. Keine unbestätigten Boni hinzurechnen.',
  atk:'Angriff %',let:'Tödlichkeit %',advanced:'⚙️ Helden, Pets, Valora, Ausrüstung und Märsche bearbeiten',
  overview:'Deine Starter-Formation',need:'Noch Angaben nötig',ready:'Für die Modellberechnung bereit',
  saved:'Werte bleiben nur auf diesem Gerät.',preview:'Aktuelle Ratio',advanceHint:'Tippe hier für Einzelheiten, Skills, Pets oder individuelle Join-Märsche.',
  heroHint:'Drei Starterhelden optional – ohne genaue Heldendaten ist die Empfehlung vorläufig.',
  required:'Fehlend',complete:'Alle Pflichtangaben eingetragen',detail:'Weitere Einstellungen',
  attackNote:'Die Schätzung ist noch nicht Kingshot-validiert. Helden-Skills und Widgets sind noch nicht vollständig berechnet.'
 },
 en:{
  title:'🐻 Bear Trap · Quick setup',sub:'Build your lineup in three steps. Expand the details only when needed.',
  troops:'Troops',troopsNote:'One tier per troop class. Mixed tiers will need a separate breakdown.',
  type:['Infantry','Cavalry','Archers'],qty:'Amount',stage:'Tier',tg:'Truegold',
  cap:'Squad capacity without heroes',team:'Marches and starter heroes',
  combat:'Combat stats',statNote:'Enter six attack/lethality values from the game. Do not add buffs already counted.',
  atk:'Attack %',let:'Lethality %',advanced:'⚙️ Edit heroes, pets, Valora, gear and marches',
  overview:'Your starter formation',need:'More information needed',ready:'Ready for model calculation',
  saved:'Values stay on this device.',preview:'Current ratio',advanceHint:'Open for hero skills, pets and individual join marches.',
  heroHint:'Three starter heroes are optional; without complete hero data the recommendation is provisional.',
  required:'Missing',complete:'All required inputs entered',detail:'Advanced settings',
  attackNote:'Estimates are not validated against Kingshot; hero skills and widgets are not completely modeled.'
 },
 fr:{
  title:'🐻 Piège à ours · Démarrage rapide',sub:'Prépare ta formation en trois étapes. Les détails restent repliés.',
  troops:'Troupes',troopsNote:'Un seul niveau par classe. Les niveaux mixtes nécessiteront une saisie séparée.',
  type:['Infanterie','Cavalerie','Archers'],qty:'Quantité',stage:'Niveau',tg:'Truegold',
  cap:'Capacité d’escadron sans héros',team:'Marches et héros',
  combat:'Stats de combat',statNote:'Renseigne les six valeurs d’attaque et létalité. Évite les bonus comptés deux fois.',
  atk:'Attaque %',let:'Létalité %',advanced:'⚙️ Héros, animaux, Valora, équipements et marches',
  overview:'Formation de départ',need:'Informations manquantes',ready:'Calcul du modèle disponible',
  saved:'Les données restent sur cet appareil.',preview:'Ratio actuelle',advanceHint:'Ouvrir les détails des héros, animaux et marches individuelles.',
  heroHint:'Trois héros facultatifs; le résultat reste approximatif sans leurs données.',
  required:'Manquant',complete:'Toutes les valeurs présentes',detail:'Réglages avancés',
  attackNote:'Estimation non validée dans Kingshot. Compétences et widgets non entièrement modélisés.'
 },
 es:{
  "title": "🐻 Trampa del oso · Configuración rápida",
  "sub": "Prepara tu formación paso a paso. Abre los detalles solo cuando los necesites.",
  "troops": "Tropas",
  "troopsNote": "Un tipo de tropa por nivel. Si tienes niveles mixtos, se requiere una distribución separada.",
  "type": [
    "Infantería",
    "Caballería",
    "Arqueros"
  ],
  "qty": "Cantidad",
  "stage": "Nivel",
  "tg": "Oro verdadero",
  "cap": "Capacidad de escuadrón sin héroes",
  "team": "Marchas y héroes iniciales",
  "combat": "Estadísticas de combate",
  "statNote": "Introduce los seis valores de ataque/letalidad del juego. No añadas bonificaciones que no estén confirmadas.",
  "atk": "Ataque %",
  "let": "Letalidad %",
  "advanced": "⚙️ Editar héroes, mascotas, Valora, equipo y marchas",
  "overview": "Tu formación inicial",
  "need": "Faltan datos",
  "ready": "Lista para estimar",
  "saved": "Los datos se guardan solo en este dispositivo.",
  "preview": "Proporción actual",
  "advanceHint": "Abre aquí los detalles, habilidades, mascotas y apoyos personalizados.",
  "heroHint": "Tres héroes iniciales; sin sus estadísticas completas, la recomendación es provisional.",
  "required": "Falta",
  "complete": "Todos los datos obligatorios están completos",
  "detail": "Más opciones",
  "attackNote": "La estimación aún no está validada en Kingshot. Las habilidades y Widgets no están totalmente simulados."
}
};
const l=()=>strings[document.documentElement.lang]||strings.en;
const el=id=>document.getElementById(id);
function make(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function labelInput(input,title,cls){
 const orig=input.closest('.field');const outer=make('label','ux-field '+(cls||''));outer.append(make('span','ux-input-title',title),input);
 orig?.remove();return outer;
}
const quick=make('section','panel ux-quick-start');quick.id='uxQuickStart';
quick.innerHTML='<div class="ux-quick-head"><div><span class="micro">NRW · KINGDOM 1044</span><h2 id="uxTitle"></h2><p id="uxSub" class="hint"></p></div><div id="uxProgress" class="ux-progress" role="status"></div></div>'+
 '<div class="ux-step"><div class="ux-step-head"><b>01</b><h3 id="uxStepTroops"></h3></div><div id="uxTroopRows" class="ux-troop-rows"></div><p id="uxTroopsNote" class="hint"></p></div>'+
 '<div class="ux-step"><div class="ux-step-head"><b>02</b><h3 id="uxStepTeam"></h3></div><div class="ux-cap-line" id="uxCapLine"></div><div id="uxHeroLine"></div><p class="hint" id="uxHeroHint"></p></div>'+
 '<div class="ux-step"><div class="ux-step-head"><b>03</b><h3 id="uxStepStats"></h3></div><div id="uxStatsRows" class="ux-stats-rows"></div><p class="hint" id="uxStatHint"></p></div>'+
 '<div class="ux-summary"><div><span class="micro" id="uxRatioTitle"></span><strong id="uxRatio">–</strong></div><div><span class="micro" id="uxScoreTitle"></span><strong id="uxModelState">–</strong></div></div>'+
 '<div id="uxActionSlot"></div><p class="hint" id="uxDisclaimer"></p>';
r.insertBefore(quick,r.firstElementChild);
const troopNames=['troopsI','troopsC','troopsA'];
const atks=['iAtk','cAtk','aAtk'],lets=['iLet','cLet','aLet'];
const icons=['🛡️','🐴','🏹'];
troopNames.forEach((id,i)=>{
 const row=make('div','ux-troop-row');
 const name=make('b','ux-troop-type',icons[i]+' '+l().type[i]);name.dataset.index=String(i);row.appendChild(name);
 row.appendChild(labelInput(el(id),l().qty,'ux-count'));
 const ts=document.querySelector('.bear-troop-tier[data-idx="'+i+'"]');
 const gs=document.querySelector('.bear-troop-tg[data-idx="'+i+'"]');
 if(ts&&gs){
  const tWrap=make('label','ux-field ux-tier');tWrap.append(make('span','ux-input-title',l().stage),ts);
  const gWrap=make('label','ux-field ux-tg');gWrap.append(make('span','ux-input-title',l().tg),gs);
  row.append(tWrap,gWrap);
 }
 el('uxTroopRows').appendChild(row);
});
const cap=el('cap');
el('uxCapLine').appendChild(labelInput(cap,l().cap,'ux-cap-input'));
const count=document.querySelector('.bear-march-count');
if(count){count.classList.add('ux-count-marches');count.querySelector('p.hint')?.remove();el('uxCapLine').appendChild(count);}
const ownPickers=document.querySelector('.bear-own-pickers');
if(ownPickers){ownPickers.classList.add('ux-hero-picks');el('uxHeroLine').appendChild(ownPickers);}
atks.forEach((id,i)=>{
 const row=make('div','ux-stat-row');
 const title=make('b','ux-stat-type',icons[i]+' '+l().type[i]);title.dataset.index=String(i);row.appendChild(title);
 row.appendChild(labelInput(el(id),l().atk,'ux-atk'));
 row.appendChild(labelInput(el(lets[i]),l().let,'ux-let'));
 el('uxStatsRows').appendChild(row);
});
const optimize=document.querySelector('.bear-optimize-box');
if(optimize){optimize.classList.add('ux-top-optimize');el('uxActionSlot').appendChild(optimize);}
const advanced=make('details','ux-advanced');
advanced.id='uxAdvanced';
const summary=make('summary','ux-advanced-heading');
summary.innerHTML='<span id="uxAdvancedTitle"></span><small id="uxAdvancedHint"></small>';
advanced.appendChild(summary);
const inside=make('div','ux-advanced-body');advanced.appendChild(inside);
inside.append(roster,arsenal,warRoom);
r.appendChild(advanced);
// Keep the original controls and all event handlers. These containers now
// only house advanced inputs and may be collapsed without losing saved data.
const tierBox=document.querySelector('.bear-troop-tier-wrap');
if(tierBox)tierBox.hidden=true;
const sourceInputs=arsenal.querySelector('.panel-body>.inputs');
if(sourceInputs&&!sourceInputs.querySelector('input,select'))sourceInputs.hidden=true;
const oldDetails=arsenal.querySelector('#iAtk')?.closest('details');
if(oldDetails&&!oldDetails.querySelector('input'))oldDetails.hidden=true;
let loaded=false;
function translate(){
 const d=l();
 [['uxTitle',d.title],['uxSub',d.sub],['uxStepTroops',d.troops],['uxStepTeam',d.team],['uxStepStats',d.combat],
  ['uxTroopsNote',d.troopsNote],['uxHeroHint',d.heroHint],['uxStatHint',d.statNote],
  ['uxRatioTitle',d.preview],['uxScoreTitle',d.overview],['uxDisclaimer',d.attackNote],
  ['uxAdvancedTitle',d.advanced],['uxAdvancedHint',d.advanceHint]].forEach(([id,t])=>{const x=el(id);if(x)x.textContent=t;});
 document.querySelectorAll('.ux-troop-type,.ux-stat-type').forEach(node=>{const i=Number(node.dataset.index);node.textContent=icons[i]+' '+d.type[i];});
 document.querySelectorAll('.ux-count>.ux-input-title').forEach(x=>x.textContent=d.qty);
 document.querySelectorAll('.ux-tier>.ux-input-title').forEach(x=>x.textContent=d.stage);
 document.querySelectorAll('.ux-tg>.ux-input-title').forEach(x=>x.textContent=d.tg);
 document.querySelectorAll('.ux-cap-input>.ux-input-title').forEach(x=>x.textContent=d.cap);
 document.querySelectorAll('.ux-atk>.ux-input-title').forEach(x=>x.textContent=d.atk);
 document.querySelectorAll('.ux-let>.ux-input-title').forEach(x=>x.textContent=d.let);
}
function update(){
 if(!loaded)return;
 const m=B.model(),v=m.values||{},tiers=m.v2?.troopTiers||[],levelOK=tiers.length===3&&tiers.every(t=>Number(t?.tier)>=1&&Number(t?.tier)<=11);
 const haveTroops=troopNames.some(id=>Number(v[id])>0);
 const haveCap=Number(v.cap)>0;
 const statsOK=atks.concat(lets).every(id=>Object.prototype.hasOwnProperty.call(v,id)&&Number.isFinite(Number(v[id])));
 const ok=levelOK&&haveTroops&&haveCap&&statsOK;
 const n=[levelOK&&haveTroops,haveCap,statsOK].filter(Boolean).length;
 const progress=el('uxProgress');
 progress.textContent=(ok?'✓ ':'')+n+'/3 · '+(ok?l().ready:l().need);
 progress.classList.toggle('is-ready',ok);
 const march=m.marches?.[0]||{i:0,c:0};
 el('uxRatio').textContent=Number(march.i)+' / '+Number(march.c)+' / '+(100-Number(march.i)-Number(march.c));
 el('uxModelState').textContent=ok?l().ready:l().required;
 quick.classList.toggle('ux-is-ready',ok);
}
function refresh(){
 translate();update();
}
quick.addEventListener('input',()=>queueMicrotask(update));
quick.addEventListener('change',()=>queueMicrotask(update));
quick.addEventListener('click',()=>queueMicrotask(update));
window.addEventListener('nrw-bear-loaded',()=>{loaded=true;refresh();});
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,0)));
const oldRender=B.render;
B.render=function(){const result=oldRender();queueMicrotask(update);return result;};
translate();
})();
