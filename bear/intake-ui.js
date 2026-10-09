/* NRW Bear screenshot wizard — all OCR runs on the player's own device.
 * The only remote traffic is on-demand Tesseract.js code and language data.
 * Screenshot pixels are NEVER sent to a remote API. User confirmation
 * precedes ALL modifications to persistent player data.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE,Core=window.NRW_BEAR_INTAKE_CORE,cat=window.NRW_BEAR_CATALOG,TROOP=window.NRW_BEAR_TROOP_BADGES,MATCHER=window.NRW_BEAR_PORTRAIT_MATCHER;
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
// Detect actual four-column hero rows instead of assuming the first card
// always starts at the top. Scroll screenshots can start/end mid-card.
function heroRows(canvas){
 // Sample the narrow left margin INSIDE each of the four portrait tiles.
 // Beige is the inventory's neutral background, so a colour change at
 // at least three columns exposes the actual card row independently of scroll.
 const w=canvas.width,h=canvas.height,ctx=canvas.getContext('2d',{willReadFrequently:true});
 const data=ctx.getImageData(0,0,w,h).data;
 const sample=(x,y)=>{const p=(Math.floor(y)*w+Math.floor(x))*4;return [data[p],data[p+1],data[p+2]];};
 const bg=sample(.023,.30);
 const xs=[.054,.286,.518,.750],y0=Math.round(h*.064),y1=Math.round(h*.785);
 const present=new Uint8Array(h);
 for(let y=y0;y<y1;y+=2){
  let changed=0;
  for(const x of xs){
   const c=sample(x,y);
   if(Math.abs(c[0]-bg[0])+Math.abs(c[1]-bg[1])+Math.abs(c[2]-bg[2])>75)changed++;
  }
  if(changed>=3){present[y]=1;present[y+1]=1;}
 }
 // Remove isolated animation/text glitches; merge tiny horizontal overlays.
 const smooth=new Uint8Array(h);
 for(let y=y0+6;y<y1-6;y++){
  let count=0;for(let d=-6;d<=6;d++)count+=present[y+d];
  if(count>=7)smooth[y]=1;
 }
 const raw=[],mergeGap=Math.round(h*.013);
 let first=-1;
 for(let y=y0;y<=y1;y++){
  if(y<y1&&smooth[y]&&first<0)first=y;
  else if((y===y1||!smooth[y])&&first>=0){raw.push({top:first,bottom:y});first=-1;}
 }
 const merged=[];
 for(const seg of raw){
  const last=merged[merged.length-1];
  // Merge disruptions *inside* a card, not the narrow beige separator
  // between adjacent rows. Full rows are ~21% of screen height.
  const left=last?last.bottom-last.top:0,right=seg.bottom-seg.top;
  const joined=last?seg.bottom-last.top:0;
  if(last&&seg.top-last.bottom<=mergeGap &&
      left<h*.16 && right<h*.16 && joined<=h*.255)
   last.bottom=seg.bottom;
  else merged.push({...seg});
 }
 // The hidden top/bottom row of a scrolling list must not become an
 // invented hero. An overlapping screenshot supplies its complete version.
 return merged.filter(r=>r.bottom-r.top>=h*.16&&r.bottom-r.top<=h*.29);
}
function inferStars(canvas,rect){
 // Measure five flower icons at the actual bottom of a detected hero card.
 // Partial final flowers remain reviewable rather than inventing T-progress.
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const y=Math.round(rect.y+rect.h*.915),radius=Math.max(5,Math.round(rect.w*.055));
 function lightRatio(x){
  const left=Math.max(0,Math.round(x-radius)),top=Math.max(0,y-radius);
  const w=Math.min(canvas.width-left,2*radius+1),h=Math.min(canvas.height-top,2*radius+1);
  if(w<=0||h<=0)return 0;
  const d=ctx.getImageData(left,top,w,h).data;let bright=0;
  for(let p=0;p<d.length;p+=4){
   const r=d[p],g=d[p+1],b=d[p+2];
   if(r>185&&g>173&&b>115&&r-g<85&&r>b)bright++;
  }
  return bright/(w*h);
 }
 const ratios=Array.from({length:5},(_,i)=>lightRatio(rect.x+rect.w*(.18+i*.165)));
 const reference=ratios.slice(0,3).sort((a,b)=>a-b)[1];
 if(reference<.18)return {starSteps:null,confidence:0};
 let full=0;
 for(const n of ratios){if(n/reference>=.80)full++;else break;}
 if(!full)return {starSteps:null,confidence:0};
 const partial=full<5&&ratios[full]/reference>.35;
 return {starSteps:full*6,confidence:Math.min(1,reference/.35),partiallyFilled:partial};
}
function heroLevelFromWords(words,rect){
 const candidates=(words||[]).filter(w=>w.bbox&&
  (w.bbox.x0+w.bbox.x1)/2>=rect.x&&(w.bbox.x0+w.bbox.x1)/2<=rect.x+rect.w&&
  (w.bbox.y0+w.bbox.y1)/2>=rect.y+rect.h*.64&&
  (w.bbox.y0+w.bbox.y1)/2<=rect.y+rect.h*.88)
  .sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' ');
 const match=candidates.match(/(?:Lv|Level)\s*\.?\s*(\d{1,3})\b/i);
 return match&&Number(match[1])<=80?Number(match[1]):null;
}
// Local pixel fingerprints deduplicate full hero cards between scroll shots.
function portraitSignature(canvas,rect){
 const small=document.createElement('canvas');small.width=24;small.height=32;
 const cx=small.getContext('2d',{willReadFrequently:true});
 cx.drawImage(canvas,rect.x+rect.w*.07,rect.y+rect.h*.04,
   rect.w*.86,rect.h*.67,0,0,24,32);
 return cx.getImageData(0,0,24,32).data;
}
function samePortrait(a,b){
 if(!a||!b||a.length!==b.length)return false;
 let difference=0,count=0;
 for(let p=0;p<a.length;p+=4){
  difference+=Math.abs(a[p]-b[p])+Math.abs(a[p+1]-b[p+1])+Math.abs(a[p+2]-b[p+2]);
  count+=3;
 }
 return difference/count<12;
}
function overviewTiles(canvas,text,words){
 const rows=heroRows(canvas),collected=[];
 // If the player scrolls, take only whole visible cards. Partial top/bottom
 // rows will be captured by an overlapping screenshot, not assigned falsely.
 for(const row of rows){
  for(let col=0;col<4;col++){
   const rect={x:Math.round(canvas.width*(.038+col*.232)),
    y:row.top+2,w:Math.round(canvas.width*.211),h:row.bottom-row.top-3};
   const stars=inferStars(canvas,rect);
   const level=heroLevelFromWords(words,rect);
   collected.push({image:cropToThumb(canvas,rect.x/canvas.width,rect.y/canvas.height,
     rect.w/canvas.width,rect.h/canvas.height),name:'',level,
    starSteps:stars.starSteps,starConfidence:stars.confidence,partialStar:stars.partiallyFilled,selected:false,
     signature:portraitSignature(canvas,rect),
     portraitCandidates:MATCHER?.candidates(canvas,rect)||[]});
  }
 }
 return collected;
}
function spatialTroops(words,canvas){
 const zones=[
  {key:'troopsI',x:[.19,.48],y:[.306,.350]},
  {key:'troopsC',x:[.66,.91],y:[.306,.350]},
  {key:'troopsA',x:[.19,.56],y:[.400,.445]}
 ],found={};
 for(const zone of zones){
  const hits=[];
  for(const word of words||[]){
   if(!word.bbox||!word.text)continue;
   const bb=word.bbox,cx=((bb.x0+bb.x1)/2)/canvas.width,
     cy=((bb.y0+bb.y1)/2)/canvas.height;
   if(cx<zone.x[0]||cx>zone.x[1]||cy<zone.y[0]||cy>zone.y[1])continue;
   hits.push({x:bb.x0,y:cy,word:String(word.text)});
  }
  hits.sort((a,b)=>a.x-b.x);
  // Tesseract sometimes reports "557", ".", "731" as three words.
  const joined=hits.map(x=>x.word).join('');
  const candidates=[...joined.matchAll(/\d{1,3}(?:[.,]\d{3})+|\d{4,9}/g)]
    .map(x=>Core.normalizeNumber(x[0]))
    .filter(n=>Number.isInteger(n)&&n>1000&&n<200000000);
  if(candidates.length)found[zone.key]=candidates[0];
  else{
   const singles=hits.map(x=>Core.normalizeNumber(x.word))
     .filter(n=>Number.isInteger(n)&&n>1000&&n<200000000);
   if(singles.length)found[zone.key]=singles[0];
  }
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
 // On a guided step, use its context when text recognition cannot identify
 // the image. Do not overwrite a confidently recognized different screen.
 if(type==='unknown'&&window.NRW_BEAR_SCREENSHOT_STAGE===1)type='troops';
 if(type==='unknown'&&window.NRW_BEAR_SCREENSHOT_STAGE===2)type='stats';
 if(type==='unknown'&&window.NRW_BEAR_SCREENSHOT_STAGE===4&&heroRows(canvas).length>=2)type='roster';
 // A portrait-only roster can be recognized from its dense 4-column grid;
 // unknown layouts remain unrecognized and manually selectable.
 const values=type==='troops'?
  {...Core.parseTroops(text),...spatialTroops(result.data.words,canvas)}:
  type==='stats'?{...Core.parseStats(text),...Core.parseStats(grouped)}:{};
 const troopTiers=type==='troops'&&TROOP?TROOP.recognize(canvas,text+'\n'+grouped,result.data.words||[]):null;

 let detail=(type==='starter'||type==='unknown')?Core.parseHeroDetail(text,allKnown()):null;
 if((type==='starter'||type==='unknown')&&!detail?.name){
  // Detail screenshots display the hero name at the TOP, above a huge 3D
  // character. A full-page OCR scan can miss the tiny outlined heading.
  const header=document.createElement('canvas');
  header.width=900;header.height=180;
  const hc=header.getContext('2d');
  hc.drawImage(canvas,canvas.width*.20,0,canvas.width*.60,canvas.height*.11,
    0,0,header.width,header.height);
  const headerOCR=await worker.recognize(header);
  const heading=headerOCR.data.text||'';
  detail=Core.parseHeroDetail(heading+'\n'+text,allKnown())||detail;
 }
 if(type==='unknown'&&detail?.name)type='starter';
 const allCards=type==='roster'?overviewTiles(canvas,text,result.data.words):[];
 const existing=queue.filter(q=>q.type==='roster').flatMap(q=>q.cards||[]);
 const fresh=allCards.filter(tile=>!existing.some(x=>samePortrait(x.signature,tile.signature)));
 if(type==='roster'&&MATCHER)await MATCHER.enrich(fresh);
 return {fileName:file.name,file,type,text,grouped,words:result.data.words||[],values,detail,troopTiers,canvas:(type==='roster'||type==='unknown'||type==='troops')?canvas:null,
  cards:fresh,duplicates:allCards.length-fresh.length,applied:false};
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
  type.addEventListener('change',()=>{item.type=type.value;item.values=item.type==='troops'?{...Core.parseTroops(item.text),...(item.canvas?spatialTroops(item.words,item.canvas):{})}:item.type==='stats'?{...Core.parseStats(item.text),...Core.parseStats(item.grouped||'')}:{};item.detail=item.type==='starter'?Core.parseHeroDetail(item.text,allKnown()):null;item.cards=item.type==='roster'&&item.canvas?overviewTiles(item.canvas,item.text,item.words):[];item.troopTiers=item.type==='troops'&&item.canvas&&TROOP?TROOP.recognize(item.canvas,item.text+'\n'+(item.grouped||''),item.words):null;renderQueue();});
  header.append(title,type);card.appendChild(header);
  const content=document.createElement('div');content.className='bear-intake-values';
  if(item.type==='troops'||item.type==='stats'){
   const relevant=item.type==='troops'?['troopsI','troopsC','troopsA']:['squadAtk','squadLet','iAtk','iLet','cAtk','cLet','aAtk','aLet'];
   relevant.forEach(id=>{
    // A guided review should show only found values. Anything not recognized
    // is collected in the final missing-values step, not a wall of blank inputs.
    if(window.NRW_BEAR_WIZARD&&!Object.prototype.hasOwnProperty.call(item.values,id))return;
    const label=document.createElement('label');label.className='bear-intake-value';
    const cap=document.createElement('span');cap.textContent=captions[id]||id;
    const field=document.createElement('input');field.type='number';field.step=id.startsWith('troops')?'1':'0.01';field.min='0';
    field.value=item.values[id]??'';field.dataset.field=id;
    field.addEventListener('input',()=>{if(field.value!=='')item.values[id]=Number(field.value);else delete item.values[id];});
    label.append(cap,field);content.appendChild(label);
   });
   if(item.type==='troops'){
    const extra=document.createElement('div');extra.className='bear-intake-tier-review';
    const heading=document.createElement('b');heading.textContent='🛡️ '+say('Stufen aus den Truppensymbolen – bitte prüfen','Troop badge tiers – please verify');
    extra.append(heading);
    if(!Array.isArray(item.troopTiers))item.troopTiers=Array.from({length:3},()=>({tier:null,tg:null}));
    item.troopTiers.forEach((entry,index)=>{
     const box=document.createElement('div');box.className='bear-intake-tier-row';
     const name=document.createElement('strong');name.textContent=['Infanterie','Kavallerie','Bogenschützen'][index];
     const tiers=inputChoice([['',say('T?','T?')],...Array.from({length:11},(_,n)=>[n+1,'T'+(n+1)])],entry.tier??'');
     const tgs=inputChoice([['',say('TG?','TG?')],...Array.from({length:9},(_,n)=>[n,'TG'+n])],entry.tg??'');
     tiers.setAttribute('aria-label','Tier '+index);tgs.setAttribute('aria-label','Truegold '+index);
     tiers.addEventListener('change',()=>entry.tier=tiers.value===''?null:Number(tiers.value));
     tgs.addEventListener('change',()=>entry.tg=tgs.value===''?null:Number(tgs.value));
     const note=document.createElement('small');note.textContent=entry.tg!==null?
      '✓ '+say('Bildvorschlag · prüfen','image guess · review'):
      say('Goldenes Abzeichen nicht eindeutig','Gold badge unrecognized');
     box.append(name,tiers,tgs,note);extra.append(box);
    });
    content.append(extra);
   }
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
    const seen=new Set(tile.suggestions||[]);
    const choices=[['',say('Nicht zuordnen','Skip')],
      ...(tile.suggestions||[]).map(n=>[n,'✦ '+n]),
      ...allKnown().filter(n=>!seen.has(n)).map(n=>[n,n])];
    const name=inputChoice(choices,tile.name);name.setAttribute('aria-label','Hero '+(index+1));
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
 const appliedTypes=[];
 for(const item of queue){
  if(item.type==='troops'||item.type==='stats'){
   if(Object.keys(item.values).length)appliedTypes.push(item.type);
   for(const [key,num] of Object.entries(item.values)){
    if(!Number.isFinite(Number(num))||Number(num)<0)continue;
    m.values[key]=Number(num);const input=$(key);if(input){input.value=num;input.dispatchEvent(new Event('input',{bubbles:true}));}
    accepted++;
   }
   if(item.type==='troops'&&Array.isArray(item.troopTiers)){
    if(!Array.isArray(v.troopTiers)||v.troopTiers.length!==3)v.troopTiers=[{tier:0,tg:null},{tier:0,tg:null},{tier:0,tg:null}];
    item.troopTiers.forEach((suggestion,index)=>{
     const dest=v.troopTiers[index];if(!suggestion)return;
     if(suggestion.tier!==null&&Number.isInteger(suggestion.tier)){
      dest.tier=suggestion.tier;
      const input=document.querySelector('.bear-troop-tier[data-idx="'+index+'"]');if(input)input.value=dest.tier;accepted++;
     }
     if(suggestion.tg!==null&&Number.isInteger(suggestion.tg)){
      dest.tg=suggestion.tg;
      const input=document.querySelector('.bear-troop-tg[data-idx="'+index+'"]');if(input)input.value=dest.tg;accepted++;
     }
    });
   }
  }else if(item.type==='starter'&&item.detail?.name){
   appliedTypes.push('starter');
   const h=item.detail;const previous=v.manualHeroes[h.name]||{};
   v.manualHeroes[h.name]={...previous,name:h.name,level:h.level||previous.level||0,
    expeditionStats:{...(previous.expeditionStats||{}),...(h.expeditionStats||{})},source:'screenshot'};
   const slot=['infantry','cavalry','archer'].indexOf(cat.heroTypes[h.name]);
   if(slot>=0&&!v.ownHeroes[slot])v.ownHeroes[slot]=h.name;
   accepted++;
  }else if(item.type==='roster'){
   if(item.cards?.some(tile=>tile.name))appliedTypes.push('roster');
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
 window.dispatchEvent(new CustomEvent('nrw-bear-intake-applied',{
  detail:{accepted,types:[...new Set(appliedTypes)]}
 }));
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