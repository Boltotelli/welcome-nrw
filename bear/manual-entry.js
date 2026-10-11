/* Optional screenshot-free Bear Trap intake. All changes use the existing
 * ID-scoped local model. No OCR, remote upload or fabricated hero ownership.
 */
(function(root){
'use strict';
const C=root.NRW_BEAR_CATALOG;
const types=['infantry','cavalry','archer'],codes=['troopsI','troopsC','troopsA'];
const rare=new Set(['Olive','Edwin','Forrest','Seth']);
const epic=new Set(['Quinn','Diana','Amane','Yeonwoo','Gordon','Chenko','Fahd','Howard']);
const translations={
 de:{manual:'✍️ Manuell eingeben',ocr:'📷 Screenshots / OCR',add:'＋ Truppen hinzufügen',remove:'Entfernen',type:'Truppentyp',level:'T-Level',tg:'TG-Level',count:'Anzahl',inf:'Infanterie',cav:'Kavallerie',arc:'Bogenschützen',groups:'Truppen nach Stufe',empty:'Füge für jeden vorhandenen Truppentyp eine Zeile hinzu. Du kannst dieselbe Gattung mehrfach verwenden.',saved:'Werte werden automatisch im gewählten Profil gespeichert.',incomplete:'Unvollständige Zeilen werden nicht zur Truppenanzahl addiert.',owned:'Tippe auf die Helden, die du besitzt. Farbig = vorhanden; schwarz-weiß = nicht vorhanden.',stars:'Sterne / Teilstufe',heroLevel:'Heldenlevel',widget:'Widget',noWidget:'Nur goldene Helden haben Widgets.',none:'Nicht ausgewählt',rarityRare:'Selten (blau)',rarityEpic:'Episch (lila)',rarityGold:'Legendär (gold)',season:'Generation',stats:'Kampfwerte (%)',source:'Herkunft der Kampfwerte',separate:'Getrennte Bonusübersicht (Werte einzeln addieren)',combined:'Gesamtwerte (nicht erneut addieren)',pick:'Wähle deine drei Starter im vorherigen Schritt aus.',details:'Helden-Expeditionswerte (%)',pet:'Pet-Level',petSkill:'Fertigkeitslevel',active:'Für Bären aktiv',valora:'Valora-Fähigkeiten',valoraLevel:'Valora Level',talent:'Hunter Instinct',reminder:'Manuelle Eingabe statt Screenshot. Alle Änderungen werden direkt gespeichert.',unknown:'Bitte angeben',squad:'Schwadron',atk:'Angriff',let:'Tödlichkeit',def:'Verteidigung',hp:'Gesundheit'},
 en:{manual:'✍️ Enter manually',ocr:'📷 Screenshots / OCR',add:'＋ Add troop group',remove:'Remove',type:'Troop type',level:'T level',tg:'TG level',count:'Quantity',inf:'Infantry',cav:'Cavalry',arc:'Archers',groups:'Troops by tier',empty:'Add a row for every troop group you own. You can add the same type more than once.',saved:'Values are saved automatically to this player profile.',incomplete:'Incomplete rows are not counted.',owned:'Tap the heroes you own. Color = owned; grayscale = not owned.',stars:'Stars / partial progress',heroLevel:'Hero level',widget:'Widget',noWidget:'Only legendary heroes have Widgets.',none:'Not selected',rarityRare:'Rare (blue)',rarityEpic:'Epic (purple)',rarityGold:'Legendary (gold)',season:'Generation',stats:'Combat stats (%)',source:'Combat-stat source',separate:'Separate bonus overview (add distinct components)',combined:'Combined total report (avoid double counting)',pick:'Choose your three starters in the previous step.',details:'Hero expedition stats (%)',pet:'Pet level',petSkill:'Skill level',active:'Active for Bear',valora:'Valora skills',valoraLevel:'Valora level',talent:'Hunter Instinct',reminder:'Manual entry replaces screenshots. Changes save automatically.',unknown:'Enter value',squad:'Squad',atk:'Attack',let:'Lethality',def:'Defense',hp:'Health'},
 fr:{manual:'✍️ Saisie manuelle',ocr:'📷 Captures / OCR',add:'＋ Ajouter des troupes',remove:'Retirer',type:'Type de troupe',level:'Niveau T',tg:'Niveau TG',count:'Quantité',inf:'Infanterie',cav:'Cavalerie',arc:'Archers',groups:'Troupes par niveau',empty:'Ajoute une ligne par niveau. Plusieurs lignes du même type sont possibles.',saved:'Sauvegarde automatique par profil.',incomplete:'Les lignes incomplètes ne sont pas comptées.',owned:'Touche les héros possédés. Couleur = possédé; gris = absent.',stars:'Étoiles / progression',heroLevel:'Niveau héros',widget:'Widget',noWidget:'Widgets réservés aux héros légendaires.',none:'Non choisi',rarityRare:'Rare (bleu)',rarityEpic:'Épique (violet)',rarityGold:'Légendaire (or)',season:'Génération',stats:'Statistiques (%)',source:'Origine des statistiques',separate:'Bonus séparés',combined:'Valeurs totales',pick:'Choisis trois héros avant cette étape.',details:'Statistiques expédition (%)',pet:'Niveau familier',petSkill:'Niveau compétence',active:'Actif contre ours',valora:'Talents Valora',valoraLevel:'Niveau Valora',talent:'Hunter Instinct',reminder:'Saisie sans capture ; sauvegarde automatique.',unknown:'Saisir',squad:'Escouade',atk:'Attaque',let:'Létalité',def:'Défense',hp:'Santé'},
 es:{manual:'✍️ Entrada manual',ocr:'📷 Capturas / OCR',add:'＋ Añadir tropas',remove:'Eliminar',type:'Tipo',level:'Nivel T',tg:'Nivel TG',count:'Cantidad',inf:'Infantería',cav:'Caballería',arc:'Arqueros',groups:'Tropas por nivel',empty:'Añade una fila por nivel. Puedes repetir el mismo tipo.',saved:'Guardado automático por perfil.',incomplete:'Las filas incompletas no se suman.',owned:'Toca a los héroes que tienes. Color = disponible; gris = no disponible.',stars:'Estrellas / progreso',heroLevel:'Nivel héroe',widget:'Widget',noWidget:'Widgets solo para héroes legendarios.',none:'No elegido',rarityRare:'Raro (azul)',rarityEpic:'Épico (morado)',rarityGold:'Legendario (oro)',season:'Generación',stats:'Estadísticas (%)',source:'Origen de estadísticas',separate:'Bonos separados',combined:'Valores totales',pick:'Selecciona antes tres héroes.',details:'Estadísticas de expedición (%)',pet:'Nivel mascota',petSkill:'Nivel habilidad',active:'Activo para el oso',valora:'Habilidades Valora',valoraLevel:'Nivel Valora',talent:'Hunter Instinct',reminder:'Entrada manual sin capturas, guardado automático.',unknown:'Introducir',squad:'Escuadrón',atk:'Ataque',let:'Letalidad',def:'Defensa',hp:'Salud'}
};
const rarity=name=>rare.has(name)?'rare':epic.has(name)?'epic':'legendary';
const parsed=(v,min,max,integer=false)=>{
 if(v===null||v===undefined||String(v).trim()==='')return null;
 const n=Number(String(v).replace(',','.'));
 return Number.isFinite(n)&&n>=min&&n<=max&&(!integer||Number.isInteger(n))?n:null;
};
const isGroupValid=g=>types.includes(g?.type)&&parsed(g?.tier,1,11,true)!==null&&parsed(g?.tg,0,8,true)!==null&&parsed(g?.count,1,200000000,true)!==null;
function aggregateGroups(groups){
 const stock=[0,0,0],byType=[[],[],[]];
 for(const g of groups||[])if(isGroupValid(g)){
  const i=types.indexOf(g.type);stock[i]+=Number(g.count);
  byType[i].push({tier:Number(g.tier),tg:Number(g.tg),count:Number(g.count)});
 }
 const levels=byType.map(rows=>{
  if(rows.length===0)return {tier:0,tg:null};
  const first=rows[0];
  return rows.every(x=>x.tier===first.tier&&x.tg===first.tg)?
   {tier:first.tier,tg:first.tg}:{tier:0,tg:null};
 });
 return {stock,levels,valid:groups.filter(isGroupValid).length};
}
function syncGroups(model){
 model.v2=model.v2||{};model.values=model.values||{};
 const rows=model.v2.troopGroups||[],computed=aggregateGroups(rows);
 codes.forEach((k,i)=>{model.values[k]=computed.stock[i];const input=document.getElementById(k);if(input)input.value=computed.stock[i];});
 model.v2.troopTiers=computed.levels;
 return computed;
}
function mount(sections,B,language,changed){
 const stageList=[1,2,4,6,7],views=new Map(), modes=()=>{const m=B.model();m.v2=m.v2||{};return m.v2.manualEntryModes=m.v2.manualEntryModes||{};};
 const l=()=>translations[language()]||translations.en;
 const tr=k=>l()[k]||translations.en[k]||k;
 const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
 const option=(select,value,label)=>{const o=node('option','',label);o.value=String(value);select.append(o);};
 function inputField(parent,label,value,fn,{min=0,max=5000,step='any',type='number'}={}){
  const box=node('label','bear-manual-field'),caption=node('span','',label),input=node('input');
  input.type=type;input.min=String(min);input.max=String(max);input.step=String(step);
  input.inputMode=step===1?'numeric':'decimal';
  input.value=value===null||value===undefined?'':String(value);
  input.placeholder=tr('unknown');
  input.setAttribute('aria-label',label);
  input.addEventListener('input',()=>fn(input.value));
  box.append(caption,input);parent.append(box);return input;
 }
 function selectField(parent,label,items,value,fn){
  const box=node('label','bear-manual-field'),title=node('span','',label),s=node('select');
  s.setAttribute('aria-label',label);
  items.forEach(([v,txt])=>option(s,v,txt));s.value=value===null||value===undefined?'':String(value);
  s.addEventListener('change',()=>fn(s.value));
  box.append(title,s);parent.append(box);return s;
 }
 function persist(){B.save();changed?.();}
 function stored(name){const m=B.model();m.v2=m.v2||{};m.v2.manualHeroes=m.v2.manualHeroes||{};return m.v2.manualHeroes[name]||null;}
 function heroSet(){const m=B.model();m.v2=m.v2||{};m.v2.scannedOwnedHeroes=m.v2.scannedOwnedHeroes||[];return m.v2.scannedOwnedHeroes;}
 function prepareGroups(){
  const m=B.model();m.v2=m.v2||{};
  if(Array.isArray(m.v2.troopGroups))return;
  const legacy=m.v2.troopTiers||[],v=m.values||{};
  m.v2.troopGroups=[];
  codes.forEach((k,i)=>{
   const c=parsed(v[k],1,200000000,true),tier=parsed(legacy[i]?.tier,1,11,true),tg=parsed(legacy[i]?.tg,0,8,true);
   if(c!==null&&tier!==null&&tg!==null)m.v2.troopGroups.push({type:types[i],tier,tg,count:c});
  });
 }
 function drawTroops(target){
  prepareGroups();target.replaceChildren();
  const heading=node('h3','',tr('groups'));target.append(heading,node('p','hint',tr('empty')));
  const list=node('div','bear-manual-troops');
  const rows=B.model().v2.troopGroups;
  rows.forEach((g,idx)=>{
   const row=node('div','bear-manual-troop-row');
   const make=(key,value)=>{g[key]=value;const result=syncGroups(B.model());list.dataset.valid=String(result.valid);status.textContent=
    result.valid+' / '+rows.length+' · '+result.stock.map((n,i)=>tr(['inf','cav','arc'][i])+': '+n.toLocaleString()).join(' · ');persist();};
   selectField(row,tr('type'),[['',tr('none')],...types.map((t,i)=>[t,tr(['inf','cav','arc'][i])])],g.type,s=>make('type',s));
   selectField(row,tr('level'),[['',tr('unknown')],...Array.from({length:11},(_,i)=>[i+1,'T'+(i+1)])],g.tier,s=>make('tier',parsed(s,1,11,true)));
   selectField(row,tr('tg'),[['',tr('unknown')],...Array.from({length:9},(_,i)=>[i,'TG'+i])],g.tg,s=>make('tg',parsed(s,0,8,true)));
   inputField(row,tr('count'),g.count,s=>make('count',parsed(s,1,200000000,true)),{min:1,max:200000000,step:1});
   const remove=node('button','secondary-btn bear-manual-remove',tr('remove'));remove.type='button';
   remove.addEventListener('click',()=>{rows.splice(idx,1);syncGroups(B.model());persist();drawTroops(target);});
   row.append(remove);list.append(row);
  });
  target.append(list);
  const add=node('button','secondary-btn bear-manual-add',tr('add'));add.type='button';
  add.addEventListener('click',()=>{rows.push({type:'',tier:null,tg:null,count:null});B.save();drawTroops(target);list.lastElementChild?.querySelector('select')?.focus();});
  const status=node('p','hint bear-manual-status');
  const result=aggregateGroups(rows);
  status.textContent=result.valid+' / '+rows.length+' · '+result.stock.map((n,i)=>tr(['inf','cav','arc'][i])+': '+n.toLocaleString()).join(' · ');
  target.append(add,status,node('p','hint',tr('incomplete')));
 }
 function drawStats(target){
  target.replaceChildren();target.append(node('h3','',tr('stats')),node('p','hint',tr('saved')));
  const m=B.model(),grid=node('div','bear-manual-stat-grid');
  const spec=[['squadAtk','squad','atk'],['squadLet','squad','let'],
   ...['i','c','a'].flatMap((key,i)=>[[''+key+'Atk',['inf','cav','arc'][i],'atk'],[''+key+'Let',['inf','cav','arc'][i],'let']])];
  for(const [key,type,metric] of spec){
   inputField(grid,tr(type)+' · '+tr(metric)+' %',m.values[key],raw=>{
    const n=parsed(raw,0,5000);
    if(n===null)delete B.model().values[key];else B.model().values[key]=n;
    const original=document.getElementById(key);if(original&&original.value!==raw)original.value=raw;
    persist();
   });
  }
  target.append(grid);
  selectField(target,tr('source'),[['separate-overview',tr('separate')],['combined-report',tr('combined')]],
   m.v2?.combatStatOrigin||'separate-overview',value=>{B.model().v2.combatStatOrigin=value;persist();});
 }
 function drawHeroes(target){
  target.replaceChildren();target.append(node('h3','',tr('owned')),node('p','hint',tr('saved')));
  const current=heroSet(),model=B.model();model.v2.manualHeroes=model.v2.manualHeroes||{};
  const referenceRecords=root.NRW_BEAR_HERO_REFERENCE_DATA?.records;
  const heroNames=C.heroes||[];
  const gens={1:heroNames.slice(0,16).map(h=>h.name),2:heroNames.slice(16,19).map(h=>h.name),
   3:heroNames.slice(19,22).map(h=>h.name),4:heroNames.slice(22,25).map(h=>h.name),
   5:heroNames.slice(25,28).map(h=>h.name),6:heroNames.slice(28,31).map(h=>h.name),
   7:heroNames.slice(31,34).map(h=>h.name),8:heroNames.slice(34,37).map(h=>h.name)};
  let selected=current.find(n=>heroNames.some(h=>h.name===n))||'';
  const editor=node('div','bear-manual-hero-editor');editor.hidden=true;
  const tiles=new Map();
  const heroIcon=new Map(heroNames.map(h=>[h.name,h.img]));
  function updateEditor(){
   editor.replaceChildren();
   if(!selected||!heroSet().includes(selected)){editor.hidden=true;return;}
   editor.hidden=false;
   const h=model.v2.manualHeroes[selected]||{},gold=rarity(selected)==='legendary';
   const head=node('div','bear-manual-hero-edit-head');
   const img=node('img');img.src=heroIcon.get(selected)||'';img.alt='';img.loading='lazy';
   head.append(img,node('h3','',selected));editor.append(head);
   const grid=node('div','bear-manual-stat-grid');
   const steps=Number.isInteger(h.stars)&&Number.isInteger(h.tier)?6*h.stars+h.tier:null;
   const items=[['',tr('unknown')],...Array.from({length:31},(_,i)=>{
    const stars=Math.floor(i/6),tier=i%6;
    return [i,stars+'★'+(tier?' T'+tier:'')];
   })];
   selectField(grid,tr('stars'),items,steps===null?'':steps,value=>{
    const step=parsed(value,0,30,true);
    h.stars=step===null?null:Math.floor(step/6);
    h.tier=step===null?null:step%6;
    h.starPendingReview=step===null;h.skillsAssumedMax=true;
    if(step!==null)h.skills=Array(3).fill(Math.min(5,h.stars+1));
    persist();updateTile(selected);
   });
   inputField(grid,tr('heroLevel'),h.level,raw=>{
    h.level=parsed(raw,1,80,true);persist();updateTile(selected);
   },{min:1,max:80,step:1});
   if(gold)selectField(grid,tr('widget'),
    Array.from({length:11},(_,i)=>[i,String(i)]),h.widget??0,value=>{
     h.widget=Number(value);model.v2.starterWidgetLevels=model.v2.starterWidgetLevels||{};
     model.v2.starterWidgetLevels[selected]=h.widget;persist();updateTile(selected);
    });
   else editor.append(node('p','hint',tr('noWidget')));
   editor.append(grid);
  }
  function updateTile(name){
   const tile=tiles.get(name);if(!tile)return;
   const owned=heroSet().includes(name),h=stored(name);
   tile.classList.toggle('is-owned',owned);tile.setAttribute('aria-pressed',String(owned));
   const desc=tile.querySelector('.bear-manual-hero-data');
   if(desc)desc.textContent=owned?(h?.stars===null||h?.stars===undefined?'★ ?':h.stars+'★'+(h.tier?' T'+h.tier:''))+
    ' · Lv '+(h?.level??'?')+(rarity(name)==='legendary'?' · W'+(h?.widget??0):''):'＋';
  }
  for(let gen=1;gen<=8;gen++){
   const wrap=node('section','bear-manual-season');
   const title=node('h4','',tr('season')+' '+gen);wrap.append(title);
   if(gen===1)wrap.append(node('p','hint',tr('rarityRare')+' · '+tr('rarityEpic')+' · '+tr('rarityGold')));
   const gallery=node('div','bear-manual-hero-grid');
   const list=gens[gen]||[];
   // First-generation blue/purple/gold cards appear together under Season 1.
   for(const name of list){
    const tile=node('button','bear-manual-hero-card');
    tile.type='button';tile.dataset.rarity=rarity(name);tile.setAttribute('aria-label',name);
    const pic=node('img');pic.src=heroIcon.get(name)||'';pic.alt='';pic.loading='lazy';pic.referrerPolicy='no-referrer';
    tile.append(pic,node('b','',name),node('small','bear-manual-hero-data',''));
    tile.addEventListener('click',()=>{
     const owned=heroSet();const index=owned.indexOf(name);
     if(index>=0){
      owned.splice(index,1);
      if(selected===name)selected=owned[0]||'';
      delete model.v2.manualHeroes[name];
      if(model.v2.starterWidgetLevels)delete model.v2.starterWidgetLevels[name];
     }else{
      owned.push(name);
      const api=(root.NRW_BEAR_IMPORTED_HEROES||[]).find(h=>h.name===name)||{};
      const prev=model.v2.manualHeroes[name]||api;
      model.v2.manualHeroes[name]={...prev,name,
       stars:Number.isInteger(prev.stars)?prev.stars:null,
       tier:Number.isInteger(prev.tier)?prev.tier:(Number.isInteger(prev.stars)?0:null),
       level:parsed(prev.level,1,80,true),
       widget:rarity(name)==='legendary'?(parsed(prev.widget,0,10,true)??0):0,
       starPendingReview:!Number.isInteger(prev.stars),skillsAssumedMax:true,source:'manual'};
      selected=name;
     }
     persist();for(const k of tiles.keys())updateTile(k);updateEditor();
    });
    gallery.append(tile);tiles.set(name,tile);
   }
   wrap.append(gallery);target.append(wrap);
  }
  target.append(editor);
  tiles.forEach((_,name)=>updateTile(name));updateEditor();
 }
 function drawDetails(target){
  target.replaceChildren();target.append(node('h3','',tr('details')),node('p','hint',tr('reminder')));
  const v=B.model().v2||{},selected=(v.ownHeroes||[]).filter(Boolean);
  if(!selected.length){target.append(node('p','hint',tr('pick')));return;}
  selected.forEach(name=>{
   const type=C.heroTypes?.[name],cl={infantry:'i',cavalry:'c',archer:'a'}[type];
   if(!cl)return;
   const card=node('section','bear-manual-detail-card');
   const head=node('div','bear-manual-hero-edit-head'),image=C.heroes.find(h=>h.name===name)?.img;
   if(image){const img=node('img');img.src=image;img.alt='';head.append(img);}
   head.append(node('h4','',name));card.append(head);
   const h=B.model().v2.manualHeroes=B.model().v2.manualHeroes||{};
   h[name]=h[name]||{name};h[name].expeditionStats=h[name].expeditionStats||{};
   const grid=node('div','bear-manual-stat-grid');
   [['Atk','atk'],['Def','def'],['Let','let'],['Hp','hp']].forEach(([key,label])=>{
    const field=cl+key;inputField(grid,tr(label)+' (%)',h[name].expeditionStats[field],raw=>{
     const val=parsed(raw,0,5000);
     if(val===null)delete h[name].expeditionStats[field];else h[name].expeditionStats[field]=val;
     persist();
    });
   });
   card.append(grid);target.append(card);
  });
 }
 function drawBuffs(target){
  target.replaceChildren();target.append(node('h3','',tr('pet')+' / '+tr('valora')),node('p','hint',tr('saved')));
  const v=B.model().v2;
  v.petLevels=v.petLevels||{};v.petSkillRanks=v.petSkillRanks||{};v.petActive=v.petActive||{};v.valora=v.valora||[0,0,0,0];
  for(const p of C.pets.filter(p=>p.bearSkill)){
   const card=node('div','bear-manual-pet-card');
   const head=node('div','bear-manual-hero-edit-head');const img=node('img');img.src=p.img;img.alt='';
   head.append(img,node('b','',p.name));card.append(head);
   const grid=node('div','bear-manual-stat-grid');
   inputField(grid,tr('pet'),v.petLevels[p.name],raw=>{const val=parsed(raw,0,p.maxLevel,true);if(val===null)delete v.petLevels[p.name];else v.petLevels[p.name]=val;persist();},{min:0,max:p.maxLevel,step:1});
   selectField(grid,tr('petSkill'),[['',tr('unknown')],...p.bearSkill.values.map((_,i)=>[i+1,'Lv '+(i+1)])],
    v.petSkillRanks[p.name],raw=>{if(raw==='')delete v.petSkillRanks[p.name];else v.petSkillRanks[p.name]=Number(raw);persist();});
   const label=node('label','bear-manual-check'),checkbox=node('input');checkbox.type='checkbox';
   checkbox.checked=Boolean(v.petActive[p.name]);checkbox.addEventListener('change',()=>{
    v.petActive[p.name]=checkbox.checked;persist();
   });label.append(checkbox,document.createTextNode(tr('active')));grid.append(label);
   card.append(grid);target.append(card);
  }
  const val=node('section','bear-manual-detail-card');val.append(node('h3','',tr('valora')));
  const grid=node('div','bear-manual-stat-grid');
  inputField(grid,tr('valoraLevel'),v.valoraBaseLevel,raw=>{v.valoraBaseLevel=parsed(raw,0,80,true);persist();},{min:0,max:80,step:1});
  inputField(grid,tr('talent'),v.valoraTalent,raw=>{v.valoraTalent=parsed(raw,0,11,true)??0;persist();},{min:0,max:11,step:1});
  C.valora.forEach((skill,i)=>selectField(grid,skill.name,Array.from({length:skill.max+1},(_,j)=>[j,'Lv '+j]),
   v.valora[i]??0,raw=>{v.valora[i]=Number(raw);persist();}));
  val.append(grid);target.append(val);
 }
 const draws={1:drawTroops,2:drawStats,4:drawHeroes,6:drawDetails,7:drawBuffs};
 for(const stage of stageList){
  const host=node('section','bear-manual-entry'),bar=node('div','bear-manual-modebar');
  const manually=node('button','secondary-btn',tr('manual')),ocr=node('button','secondary-btn',tr('ocr'));
  manually.type=ocr.type='button';manually.addEventListener('click',()=>switchMode(stage,true));
  ocr.addEventListener('click',()=>switchMode(stage,false));
  bar.append(manually,ocr);
  const content=node('div','bear-manual-body');
  host.append(bar,content);sections[stage].prepend(host);
  views.set(stage,{host,bar,content,manually,ocr});
 }
 function isManual(stage){return modes()[stage]!==false;}
 function switchMode(stage,manual){
  modes()[stage]=manual;B.save();render(stage);
 }
 function render(stage){
  const view=views.get(stage);if(!view)return;
  view.manually.textContent=tr('manual');view.ocr.textContent=tr('ocr');
  const manual=isManual(stage);
  view.manually.classList.toggle('is-active',manual);view.ocr.classList.toggle('is-active',!manual);
  view.manually.setAttribute('aria-pressed',String(manual));view.ocr.setAttribute('aria-pressed',String(!manual));
  view.content.hidden=!manual;
  const importer=document.getElementById('bearIntakeWizard');
  if([1,2,4,6].includes(stage)&&importer?.parentNode===sections[stage])importer.hidden=manual;
  for(const example of sections[stage].querySelectorAll('.bear-guide-example'))example.hidden=manual;
  if(stage===4){const widget=sections[4].querySelector('.bear-widget-panel');if(widget)widget.hidden=manual;}
  if(stage===7){const buff=document.getElementById('bearBuffScreenshotHost');if(buff)buff.hidden=manual;}
  if(manual)draws[stage](view.content);
 }
 return {render,isManual,switchMode,syncGroups,aggregateGroups,validGroup:isGroupValid};
}
root.NRW_BEAR_MANUAL={mount,aggregateGroups,syncGroups,validGroup:isGroupValid,rarity};
})(window);
