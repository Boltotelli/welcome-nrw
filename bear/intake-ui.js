/* NRW Bear screenshot wizard — all OCR runs on the player's own device.
 * The only remote traffic is on-demand Tesseract.js code and language data.
 * Screenshot pixels are NEVER sent to a remote API. User confirmation
 * precedes ALL modifications to persistent player data.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE,Core=window.NRW_BEAR_INTAKE_CORE,cat=window.NRW_BEAR_CATALOG;
const restricted=document.getElementById('restricted'),quick=document.getElementById('uxQuickStart');
if(!B||!Core||!cat||!restricted||!quick)return;
const locale=()=>document.documentElement.lang||'de';
const isDe=()=>locale()==='de';
const say=(de,en)=>isDe()?de:en;
const $=id=>document.getElementById(id);
const types={troops:'🪖 Truppen',stats:'📊 Kampfstats',starter:'⚔️ Starter-Details',roster:'🃏 Heldenübersicht',gear:'🛡️ GovGear',unknown:'❓ Unbekannt'};
const captions={troopsI:'Infanterie',troopsC:'Kavallerie',troopsA:'Bogenschützen',
 iAtk:'Infanterie Angriff',iLet:'Infanterie Tödlichkeit',cAtk:'Kavallerie Angriff',cLet:'Kavallerie Tödlichkeit',
 aAtk:'Bogenschützen Angriff',aLet:'Bogenschützen Tödlichkeit',
 squadAtk:'Schwadron Angriff',squadLet:'Schwadron Tödlichkeit',
 squadDef:'Schwadron Verteidigung',squadHp:'Schwadron Gesundheit',
 iDef:'Infanterie Verteidigung',iHp:'Infanterie Gesundheit',
 cDef:'Kavallerie Verteidigung',cHp:'Kavallerie Gesundheit',
 aDef:'Bogenschützen Verteidigung',aHp:'Bogenschützen Gesundheit'};
const required=['troopsI','troopsC','troopsA','iAtk','iLet','cAtk','cLet','aAtk','aLet'];
const shell=document.createElement('section');shell.className='panel bear-intake-wizard';shell.id='bearIntakeWizard';
shell.innerHTML='<div class="bear-intake-header"><span class="micro">NRW · BEAR TRAP</span><h2>📸 '+say('Screenshots statt Eingabe','Screenshots instead of typing')+'</h2>'+
 '<p class="hint">'+say('Alle Bilder gleichzeitig auswählen – auch mehrere Stats- und Helden-Screenshots. Werte werden zusammengeführt und vor dem Speichern geprüft.','Choose multiple troop, combat and hero screenshots at once. Review all values before saving.')+'</p>'+
 '<div class="bear-intake-pickers"><label class="primary" id="intakePicker"><span>📂 '+say('Screenshots auswählen','Select screenshots')+'</span><input id="intakeFiles" type="file" accept="image/*" multiple hidden></label>'+
 '<button type="button" class="secondary-btn" id="intakeGear">🛡️ '+say('GovGear-Screenshot','GovGear screenshot')+'</button></div>'+
 '<p class="hint">🔒 '+say('Bilder bleiben lokal. OCR läuft auf deinem Gerät; dafür wird die Erkennungssoftware beim ersten Mal geladen.','Screenshots stay on-device. OCR libraries download once and run locally.')+'</p>'+
 '<div id="intakeStatus" role="status" aria-live="polite"></div></div>'+
 '<div id="intakeQueue" class="bear-intake-queue" hidden></div>'+
 '<div class="bear-intake-actions" id="intakeApplyRow" hidden><button class="primary" type="button" id="intakeApply">✓ '+say('Geprüfte Angaben übernehmen','Apply reviewed values')+'</button><button class="secondary-btn" type="button" id="intakeClear">'+say('Verwerfen','Discard')+'</button></div>'+
 '<div class="bear-intake-progress"><strong id="intakeProgress"></strong><span id="intakeMissing" class="hint"></span></div>'+
 '<div id="intakeAdvice" class="bear-intake-advice"></div>'+
 '<div id="intakeResultSlot"></div>';
restricted.insertBefore(shell,quick);
const missingDetails=document.createElement('details');missingDetails.id='intakeMissingDetails';missingDetails.className='bear-intake-missing';
const missingSummary=document.createElement('summary');missingSummary.textContent='✏️ '+say('Fehlende Werte / Einstellungen','Missing values / settings');
missingDetails.appendChild(missingSummary);quick.before(missingDetails);missingDetails.appendChild(quick);
const optimizeBox=document.querySelector('.bear-optimize-box');if(optimizeBox) $('intakeResultSlot').appendChild(optimizeBox);
const gear=document.querySelector('.bear-import-card');
if(gear){const gearDetails=document.createElement('details');gearDetails.className='bear-intake-gear-details';gearDetails.innerHTML='<summary>🛡️ '+say('GovGear & Talismane – Import prüfen','GovGear & charms – review')+'</summary>';gear.before(gearDetails);gearDetails.appendChild(gear);}
$('intakeGear').addEventListener('click',()=>{
 const d=gear?.closest('details');if(d)d.open=true;
 document.getElementById('bearGearPhoto')?.click();
});
// Fast re-entry for players who have previously imported or edited a profile.
 // This is a local picker, NOT a substitute for fresh API membership checking.
const governorInput=$('governorId'),lookup=$('lookupForm');
if(governorInput&&lookup){
 let savedIds=[];
 try{
  savedIds=Object.keys(localStorage).filter(k=>k.startsWith('nrw_bear_profile_v1_'))
   .map(k=>k.slice('nrw_bear_profile_v1_'.length)).filter(k=>/^\d{5,20}$/.test(k));
 }catch(_){}
 if(savedIds.length){
  const localRow=document.createElement('div');localRow.className='bear-local-id-row';
  const savedPick=inputChoice([['',say('Gespeicherte ID auswählen','Select saved ID')],...savedIds.map(id=>[id,id])]);
  const open=document.createElement('button');open.type='button';open.className='secondary-btn';
  open.textContent=say('Gespeicherten Stand öffnen','Open saved profile');
  savedPick.addEventListener('change',()=>{if(savedPick.value)governorInput.value=savedPick.value;});
  open.addEventListener('click',()=>{if(savedPick.value){governorInput.value=savedPick.value;$('offlineMode')?.click();}});
  localRow.append(savedPick,open);lookup.after(localRow);
  const note=document.createElement('p');note.className='hint';
  note.textContent=say('Lokale Daten sind kein erneuter Allianz-Check; für frische API-Daten ist eine sichere Serververbindung nötig.','Saved local data does not verify current alliance membership; live API access needs a secure backend.');
  localRow.after(note);
 }
}
let ocrWorker=null,queue=[],busy=false;
function state(){const m=B.model();if(!m.v2)m.v2={};if(!m.v2.manualHeroes)m.v2.manualHeroes={};if(!Array.isArray(m.v2.ownHeroes))m.v2.ownHeroes=['','',''];return m.v2;}
function esc(str){return String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function status(t){$('intakeStatus').textContent=t;}
async function loadOCR(){
 if(ocrWorker)return ocrWorker;
 if(!window.Tesseract){
  await new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
   script.onload=resolve;script.onerror=()=>reject(new Error('OCR library blocked'));document.head.appendChild(script);
  });
 }
 status(say('OCR wird vorbereitet …','Preparing OCR …'));
 try{ocrWorker=await window.Tesseract.createWorker('deu+eng',1,{logger:m=>{
  if(m.status==='recognizing text')status(say('Bilder werden lokal gelesen','Reading images locally')+' '+Math.round((m.progress||0)*100)+'%');
 }});}
 catch(_){ocrWorker=await window.Tesseract.createWorker('eng',1);}
 return ocrWorker;
}
async function imageCanvas(file){
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((resolve,reject)=>{
   const el=new Image();el.onload=()=>resolve(el);el.onerror=reject;el.src=url;
  });
  const canvas=document.createElement('canvas'),scale=Math.min(1.7,1400/img.naturalWidth,1800/img.naturalHeight);
  canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
  const cx=canvas.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,canvas.width,canvas.height);
  return canvas;
 }finally{URL.revokeObjectURL(url);}
}
function cropToThumb(src,x,y,w,h){
 const c=document.createElement('canvas');c.width=130;c.height=170;
 c.getContext('2d').drawImage(src,x*src.width,y*src.height,w*src.width,h*src.height,0,0,c.width,c.height);
 return c.toDataURL('image/jpeg',.74);
}
function inferStars(canvas,row,col){
 // The card's bottom edge displays five flower-shaped stars. Full stars
 // are light ivory; unfilled stars are dark orange. Compare relative light
 // pixel counts against the same card, not absolute colour alone.
 // Screenshot calibration: 716×1536, 4-column Kingshot hero inventory.
 const cx=canvas.getContext('2d',{willReadFrequently:true});
 const sx=canvas.width/716,sy=canvas.height/1536;
 const yCenter=(371+row*276)*sy;
 function lights(x,y){
  const left=Math.max(0,Math.round(x-9*sx)),top=Math.max(0,Math.round(y-11*sy));
  const w=Math.min(canvas.width-left,Math.max(1,Math.round(19*sx)));
  const h=Math.min(canvas.height-top,Math.max(1,Math.round(23*sy)));
  if(w<4||h<4)return 0;
  const pixels=cx.getImageData(left,top,w,h).data;let bright=0;
  for(let i=0;i<pixels.length;i+=4){
   const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
   if(r>170&&g>160&&b>100&&r-g<90&&r>b)bright++;
  }
  return bright/(w*h);
 }
 const xs=Array.from({length:5},(_,i)=>(33+col*167+22+i*27)*sx);
 let best=null;
 for(let dy=-24;dy<=24;dy+=3){
  const yy=yCenter+dy*sy,values=xs.map(x=>lights(x,yy));
  const score=values[0]+values[1]+values[2];
  if(!best||score>best.score)best={score,values};
 }
 if(!best)return {starSteps:null,confidence:0};
 const head=Math.max(...best.values.slice(0,3));
 if(head<.17)return {starSteps:null,confidence:0};
 let full=0;
 for(const n of best.values){if(n/head>=.77)full++;else break;}
 if(full<1)return {starSteps:null,confidence:0};
 const confidence=Math.min(1,(head/.28));
 return {starSteps:full*6,confidence,partiallyFilled:full<5&&best.values[full]/head>.45};
}
function heroLevelFromWords(words,canvas,row,col){
 const x0=(33+col*167)*canvas.width/716,x1=x0+152*canvas.width/716;
 const y0=(124+row*276+190)*canvas.height/1536,y1=(124+row*276+248)*canvas.height/1536;
 const candidates=(words||[]).filter(w=>w.bbox&&((w.bbox.x0+w.bbox.x1)/2)>=x0&&((w.bbox.x0+w.bbox.x1)/2)<=x1&&
  ((w.bbox.y0+w.bbox.y1)/2)>=y0&&((w.bbox.y0+w.bbox.y1)/2)<=y1)
  .sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' ');
 const match=candidates.match(/(?:Lv|Level)\s*\.?\s*(\d{1,3})/i);
 return match&&Number(match[1])<=80?Number(match[1]):null;
}
function overviewTiles(canvas,text,words){
 // Four-column Kingshot hero overview: names are absent, so the user must
 // confirm portrait identity. Never guess a name from text-only OCR.
 const collected=[],matches=[...String(text).matchAll(/Lv\.?\s*(\d{1,3})/ig)].map(m=>Number(m[1]));
 for(let row=0;row<5;row++)for(let col=0;col<4;col++){
  const x=.038+col*.232,y=.082+row*.177;
  if(y+.145>.945)continue;
  const index=col+row*4;
  const stars=row<4?inferStars(canvas,row,col):{starSteps:null,confidence:0};
  const positionalLevel=heroLevelFromWords(words,canvas,row,col);
  const safeSequenceFallback=matches.length===20?matches[index]:null;
  collected.push({image:cropToThumb(canvas,x,y,.211,.171),name:'',level:positionalLevel??safeSequenceFallback,
    starSteps:stars.starSteps,starConfidence:stars.confidence,partialStar:stars.partiallyFilled,selected:false});
 }
 return collected;
}
function spatialTroops(words,canvas){
 // OCR word bounding boxes are more reliable than reading the two top
 // troop cards left-to-right as one text line.
 const zones=[
  {key:'troopsI',x:[.16,.52],y:[.267,.313]},
  {key:'troopsC',x:[.65,.97],y:[.267,.313]},
  {key:'troopsA',x:[.16,.56],y:[.347,.394]}
 ],found={};
 for(const zone of zones){
  const hits=[];
  for(const word of words||[]){
   if(!word.bbox)continue;
   const bb=word.bbox,cx=((bb.x0+bb.x1)/2)/canvas.width,cy=((bb.y0+bb.y1)/2)/canvas.height;
   if(cx<zone.x[0]||cx>zone.x[1]||cy<zone.y[0]||cy>zone.y[1])continue;
   const value=Core.normalizeNumber(word.text);
   if(value!==null&&Number.isInteger(value)&&value>1000&&value<200000000)hits.push({value,distance:Math.abs(cy-(zone.y[0]+zone.y[1])/2)});
  }
  hits.sort((a,b)=>a.distance-b.distance);
  if(hits.length)found[zone.key]=hits[0].value;
 }
 return found;
}
function positionalLines(words,canvas){
 // Screenshots with two columns may OCR all labels first, then numbers.
 // Group words by visible text row and sort horizontally.
 const sorted=(words||[]).filter(w=>w.bbox&&w.text).map(w=>({
  x:w.bbox.x0,y:(w.bbox.y0+w.bbox.y1)/2,text:w.text
 })).sort((a,b)=>a.y-b.y||a.x-b.x);
 const rows=[];
 const threshold=canvas.height*.014;
 for(const word of sorted){
  let row=rows.find(r=>Math.abs(r.y-word.y)<threshold);
  if(!row){row={y:word.y,words:[]};rows.push(row);}
  row.words.push(word);
 }
 return rows.sort((a,b)=>a.y-b.y).map(r=>r.words.sort((a,b)=>a.x-b.x).map(w=>w.text).join(' ')).join('\n');
}
function allKnown(){
 const owned=Object.keys(state().manualHeroes||{});
 return [...new Set([...(cat.heroes||[]).map(h=>h.name),...owned])].sort((a,b)=>a.localeCompare(b));
}
async function inspect(file){
 const canvas=await imageCanvas(file);
 const worker=await loadOCR();
 const result=await worker.recognize(canvas);
 const text=result.data.text||'';
 const grouped=positionalLines(result.data.words,canvas);
 let type=Core.category(text+'\n'+grouped);
 // A portrait-only roster can be recognized from its dense 4-column grid;
 // unknown layouts remain unrecognized and manually selectable.
 const values=type==='troops'?
  {...Core.parseTroops(text),...spatialTroops(result.data.words,canvas)}:
  type==='stats'?{...Core.parseStats(text),...Core.parseStats(grouped)}:{};

 let detail=type==='starter'?Core.parseHeroDetail(text,allKnown()):null;
 if(type==='unknown'&&detail)type='starter';
 return {fileName:file.name,file,type,text,grouped,words:result.data.words||[],values,detail,canvas:(type==='roster'||type==='unknown')?canvas:null,
  cards:type==='roster'?overviewTiles(canvas,text,result.data.words):[],applied:false};
}
function inputChoice(items,current=''){
 const sel=document.createElement('select');
 for(const [value,title] of items){const o=document.createElement('option');o.value=String(value);o.textContent=title;if(String(value)===String(current))o.selected=true;sel.appendChild(o);}
 return sel;
}
const heroChoices=()=>[['',say('Nicht zuordnen','Skip')],...allKnown().map(n=>[n,n])];
function starOptions(){
 const options=[['',say('Sterne unbekannt','Stars unknown')]];
 for(let stars=1;stars<5;stars++){
  options.push([stars*6,stars+'★']);
  for(let tier=1;tier<=5;tier++)options.push([stars*6+tier,stars+'★ T'+tier]);
 }
 options.push([30,'5★ (MAX)']);
 return options;
}
function renderQueue(){
 const holder=$('intakeQueue');holder.innerHTML='';holder.hidden=queue.length===0;
 $('intakeApplyRow').hidden=queue.length===0;
 queue.forEach((item,i)=>{
  const card=document.createElement('div');card.className='bear-intake-item';
  const header=document.createElement('div');header.className='bear-intake-item-head';
  const title=document.createElement('b');title.textContent=item.fileName;
  const type=inputChoice(Object.entries(types).map(([key,name])=>[key,name]),item.type);
  type.addEventListener('change',()=>{item.type=type.value;item.values=item.type==='troops'?{...Core.parseTroops(item.text),...(item.canvas?spatialTroops(item.words,item.canvas):{})}:item.type==='stats'?{...Core.parseStats(item.text),...Core.parseStats(item.grouped||'')}:{};item.detail=item.type==='starter'?Core.parseHeroDetail(item.text,allKnown()):null;item.cards=item.type==='roster'&&item.canvas?overviewTiles(item.canvas,item.text,item.words):[];renderQueue();});
  header.append(title,type);card.appendChild(header);
  const content=document.createElement('div');content.className='bear-intake-values';
  if(item.type==='troops'||item.type==='stats'){
   const relevant=item.type==='troops'?['troopsI','troopsC','troopsA']:['squadAtk','squadLet','iAtk','iLet','cAtk','cLet','aAtk','aLet'];
   relevant.forEach(id=>{
    const label=document.createElement('label');label.className='bear-intake-value';
    const cap=document.createElement('span');cap.textContent=captions[id]||id;
    const field=document.createElement('input');field.type='number';field.step=id.startsWith('troops')?'1':'0.01';field.min='0';
    field.value=item.values[id]??'';field.dataset.field=id;
    field.addEventListener('input',()=>{if(field.value!=='')item.values[id]=Number(field.value);else delete item.values[id];});
    label.append(cap,field);content.appendChild(label);
   });
  }else if(item.type==='starter'){
   const picker=document.createElement('label');picker.className='bear-intake-value';
   picker.append(say('Heldenname','Hero name'));
   const name=inputChoice(heroChoices(),item.detail?.name||'');picker.append(name);content.appendChild(picker);
   name.addEventListener('change',()=>{item.detail=item.detail||{};item.detail.name=name.value;});
   const lvl=document.createElement('label');lvl.className='bear-intake-value';lvl.textContent='Level';
   const val=document.createElement('input');val.type='number';val.min='0';val.max='80';val.value=item.detail?.level??'';
   val.addEventListener('input',()=>{item.detail=item.detail||{};item.detail.level=val.value===''?null:Number(val.value);});
   lvl.append(val);content.append(lvl);
   const note=document.createElement('p');note.className='hint';
   note.textContent=say('Expeditionswerte werden separat zur Heldendokumentation gespeichert – NICHT zu den Kampfstats addiert.','Expedition values are saved separately and not added twice to battle stats.');
   content.append(note);
  }else if(item.type==='roster'){
   const note=document.createElement('p');note.className='hint';
   note.textContent=say('Die Heldennamen stehen nicht auf den Karten. Bitte nur relevante Bear-Helden zuordnen und Sterne bestätigen. Skill-Maximum wird aus Sternen vorgeschlagen.','Hero names are absent from overview cards. Match relevant portraits and confirm stars; skills default to the allowed maximum.');
   content.append(note);
   const grid=document.createElement('div');grid.className='bear-intake-roster';
   (item.cards||[]).forEach((tile,index)=>{
    const cell=document.createElement('div');cell.className='bear-intake-roster-tile';
    const image=new Image();image.src=tile.image;image.alt='Hero '+(index+1);cell.append(image);
    const name=inputChoice(heroChoices(),tile.name);name.setAttribute('aria-label','Hero '+(index+1));
    name.addEventListener('change',()=>{tile.name=name.value;tile.selected=Boolean(tile.name);});
    const level=document.createElement('input');level.type='number';level.min='1';level.max='80';level.value=tile.level??'';level.placeholder='Lv';
    level.addEventListener('change',()=>tile.level=level.value?Number(level.value):null);
    const stars=inputChoice(starOptions(),tile.starSteps??'');
    stars.addEventListener('change',()=>tile.starSteps=stars.value?Number(stars.value):null);
    const details=document.createElement('small');
    details.textContent=tile.starSteps!==null?
      '★ '+say('Bildvorschlag – prüfen','image guess – review')+(tile.partialStar?' · T?':''):
      say('Level / Sterne prüfen','Check level/stars');
    cell.append(name,level,details,stars);grid.append(cell);
   });
   content.append(grid);
  }else{
   const note=document.createElement('p');note.className='hint';
   note.textContent=item.type==='gear'?say('GovGear wird über den bereits vorhandenen, spezialisierten Importer erkannt.','GovGear uses the dedicated visual gear importer.'):say('Bildtyp nicht erkannt. Typ oben auswählen oder weglassen.','Screenshot type unknown. Select a type or skip.');
   content.append(note);
  }
  card.append(content);holder.append(card);
 });
}
function availableOwned(){
 const m=B.model(),api=window.NRW_BEAR_IMPORTED_HEROES||[];
 return [...new Map([...api,...Object.values(state().manualHeroes)].filter(h=>h&&h.name).map(h=>[h.name,h])).values()];
}
function updateAdvisor(){
 const m=B.model(),v=state();
 const advice=Core.advise(availableOwned(),v.ownHeroes,cat.heroTypes);
 const box=$('intakeAdvice');box.innerHTML='';
 if(!advice.length)return;
 const heading=document.createElement('strong');heading.textContent='🐻 '+say('Mögliche bessere Bear-Starter','Potentially better Bear starters');box.append(heading);
 for(const a of advice){
  const line=document.createElement('p');line.textContent=a.suggestion+' statt '+a.current+' ('+a.type+') – '+a.reason;box.append(line);
 }
 const source=document.createElement('a');source.href='https://ks-atlas.com/tools/atlas-database/bear-rally-heroes';source.target='_blank';source.rel='noopener noreferrer';source.textContent='KS Atlas · Bear Rally Heroes';box.append(source);
}
function updateProgress(){
 const v=B.model()?.values||{};
 const present=required.filter(id=>Number.isFinite(Number(v[id]))&&v[id]!==undefined).length;
 const own=state().ownHeroes.filter(Boolean).length;
 $('intakeProgress').textContent=present+'/'+required.length+' '+say('Pflichtwerte','required values')+' · '+own+'/3 Starter';
 const missing=required.filter(k=>v[k]===undefined).map(k=>captions[k]);
 const tier=(state().troopTiers||[]).filter(t=>Number(t.tier)>=1).length;
 $('intakeMissing').textContent=missing.length? say('Fehlt: ','Missing: ')+missing.join(', '):tier<3?say('Truppen-T-Stufen fehlen noch im Detailbereich.','Troop tiers still needed in details.'):say('Grundwerte vollständig; Modellvergleich möglich.','Base values present; model ready.');
 updateAdvisor();
}
function apply(){
 const m=B.model(),v=state();
 let accepted=0;
 for(const item of queue){
  if(item.type==='troops'||item.type==='stats'){
   for(const [key,num] of Object.entries(item.values)){
    if(!Number.isFinite(Number(num))||Number(num)<0)continue;
    m.values[key]=Number(num);const input=$(key);if(input){input.value=num;input.dispatchEvent(new Event('input',{bubbles:true}));}
    accepted++;
   }
  }else if(item.type==='starter'&&item.detail?.name){
   const h=item.detail;const previous=v.manualHeroes[h.name]||{};
   v.manualHeroes[h.name]={...previous,name:h.name,level:h.level||previous.level||0,
    expeditionStats:{...(previous.expeditionStats||{}),...(h.expeditionStats||{})},source:'screenshot'};
   const slot=['infantry','cavalry','archer'].indexOf(cat.heroTypes[h.name]);
   if(slot>=0&&!v.ownHeroes[slot])v.ownHeroes[slot]=h.name;
   accepted++;
  }else if(item.type==='roster'){
   for(const tile of item.cards){
    if(!tile.name)continue;
    const old=v.manualHeroes[tile.name]||{};
    const stars=tile.starSteps===null?Number(old.stars||0):Math.floor(tile.starSteps/6);
    const tier=tile.starSteps===null?Number(old.tier||0):tile.starSteps%6;
    const cap=Core.maxSkill(stars);
    v.manualHeroes[tile.name]={...old,name:tile.name,level:tile.level||old.level||0,stars,tier,
     skills:Array.isArray(old.skills)&&old.skills.some(Number)?old.skills:(cap?[cap,cap,cap]:[0,0,0]),
     skillsAssumedMax:!(Array.isArray(old.skills)&&old.skills.some(Number)),source:'screenshot'};
    accepted++;
   }
  }else if(item.type==='gear'){
   // Hand this screenshot to the existing specialized 6-gear/18-charm
   // browser-local importer. It retains its own separate review/confirm.
   try{
    const input=$('bearGearPhoto'),transfer=new DataTransfer();
    if(!input||!item.file)throw Error('missing file');
    transfer.items.add(item.file);input.files=transfer.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
    const details=input.closest('details');if(details)details.open=true;
   }catch(_){const details=$('bearGearPhoto')?.closest('details');if(details)details.open=true;
    status(say('GovGear-Screenshot bitte im ausklappbaren Import überprüfen.','Review GovGear in the dedicated screenshot importer.'));
   }
  }
 }
 // Combat report percentages already include governor equipment. The
 // squad percentages are tracked but NOT silently added twice.
 v.squadSeparate=false;const toggle=$('squadSeparate');if(toggle)toggle.checked=false;
 B.save();B.render();window.NRW_BEAR_ENHANCE?.refreshHeroes?.();
 updateProgress();status(accepted+' '+say('Angaben lokal gespeichert; unbekannte Werte bleiben unverändert.','values saved locally. Unknown values untouched.'));
 queue=[];renderQueue();
}
$('intakeApply').addEventListener('click',apply);
$('intakeClear').addEventListener('click',()=>{queue=[];renderQueue();status(say('Import verworfen.','Import discarded.'));});
$('intakeFiles').addEventListener('change',async e=>{
 const files=[...e.target.files||[]].filter(f=>f.type.startsWith('image/')).slice(0,12);
 e.target.value='';if(!files.length||busy)return;busy=true;$('intakeFiles').disabled=true;
 let success=0;
 for(let i=0;i<files.length;i++){
  status((i+1)+'/'+files.length+' · '+files[i].name);
  try{queue.push(await inspect(files[i]));success++;}
  catch(err){queue.push({fileName:files[i].name,type:'unknown',text:'',values:{},detail:null,cards:[],error:String(err)});}
 }
 busy=false;$('intakeFiles').disabled=false;
 status(success+'/'+files.length+' '+say('Bilder gelesen. Bitte alle Vorschläge prüfen und übernehmen.','screenshots read. Review and apply suggestions.'));
 renderQueue();
});
window.addEventListener('nrw-bear-loaded',updateProgress);
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(updateProgress,0)));
document.querySelectorAll('input').forEach(input=>{if(input.id&&required.includes(input.id))input.addEventListener('input',updateProgress);});
updateProgress();
})();