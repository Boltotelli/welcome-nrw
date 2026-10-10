/* Pet skill cards + Valora expedition master levels: screenshot-assisted review.
 * OCR is 100% on-device. No screen pixels, usernames, or IDs are uploaded.
 * Changes are committed to the EXISTING Bear profile only after one review tap.
 */
(function(root){
'use strict';
const C=root.NRW_BEAR_BUFF_CORE,cat=root.NRW_BEAR_CATALOG;
if(!C||!cat)return;
const l=()=>document.documentElement.lang||'de';
const de=(x,en)=>l()==='de'?x:en;
const txt=(x)=>String(x??'');
const validLevel=(v,max)=>v!==''&&Number.isInteger(Number(v))&&Number(v)>=1&&Number(v)<=max;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
let draftPet=null,draftValora=null,petPhoto=null,petBusy=false,valoraBusy=false,appBridge=null;
function photoCanvas(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{
   try{
    // Keep native 955x2048 labels sharp; shrinking to 1600px lost tiny Lv glyphs.
    const scale=Math.min(1,2800/img.naturalHeight);
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    resolve(canvas);
   }catch(e){reject(e);}
   finally{URL.revokeObjectURL(url);}
  };img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Image loading failed'));};
  img.src=url;
 });
}
// Copy source pixels without changing the icon's aspect ratio. Previous
// previews stretched a near-square game tile to 520x340 (and distorted Lv).
function crop(src,region,mode='preview'){
 const x=Math.max(0,Math.round(src.width*region.x));
 let y=Math.max(0,Math.round(src.height*region.y));
 const w=Math.min(src.width-x,Math.round(src.width*region.w));
 let h=Math.min(src.height-y,Math.round(src.height*region.h));
 if(w<10||h<10)throw Error('Screenshot geometry not supported');
 if(mode==='footer'){const top=Math.floor(h*.48);y+=top;h-=top;}
 // Original screenshot OCR was verified at ~420px wide and 140px high.
 const scale=mode==='preview'?1:Math.min(5,Math.max(2,420/w,140/h));
 const roi=document.createElement('canvas');
 roi.width=Math.round(w*scale);roi.height=Math.round(h*scale);
 const cx=roi.getContext('2d',{willReadFrequently:true});
 cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
 cx.drawImage(src,x,y,w,h,0,0,roi.width,roi.height);
 return roi;
}
// Alternate OCR view for outlined white Lv digits over a colorful icon.
// Only the small, bottom-right badge is processed (never cooldown timers).
// Kingshot paints bright/white Lv lettering on colored skill cards.
// Retain white glyphs on black; the previous near-neutral threshold missed
// the cyan Panther and Rhino artwork on the supplied original screenshots.
function contrastBadge(canvas){
 const roi=document.createElement('canvas');
 roi.width=canvas.width;roi.height=canvas.height;
 const cx=roi.getContext('2d',{willReadFrequently:true});
 cx.drawImage(canvas,0,0);
 const pixels=cx.getImageData(0,0,roi.width,roi.height);
 for(let i=0;i<pixels.data.length;i+=4){
  const light=Math.min(pixels.data[i],pixels.data[i+1],pixels.data[i+2])>175;
  const value=light?255:0;
  pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;
 }
 cx.putImageData(pixels,0,0);
 return roi;
}
async function reader(){
 // The main screenshot scanner already loaded and initialized Tesseract;
 // reuse its worker instead of launching a second browser OCR engine.
 if(typeof root.NRW_BEAR_GET_OCR==='function')return root.NRW_BEAR_GET_OCR();
 if(!root.Tesseract)throw Error('OCR not loaded. Import a game screenshot first.');
 return root.Tesseract.createWorker('eng',1);
}
// OCR access is serialized between the two upload buttons because both
// scans reuse the existing Tesseract worker (also used for hero screenshots).
let scanQueue=Promise.resolve();
function recognizeSlots(canvas,slots,kind,progress){
 const task=scanQueue.then(()=>recognizeSlotsNow(canvas,slots,kind,progress));
 scanQueue=task.catch(()=>{});
 return task;
}
async function recognizeSlotsNow(canvas,slots,kind,progress){
 const worker=await reader(),out=[];
 const configure=async(params)=>{
  try{if(typeof worker.setParameters==='function')await worker.setParameters(params);}
  catch(_){/* Browser worker may not support optional parameters. */}
 };
 await configure({tessedit_pageseg_mode:'7',tessedit_char_whitelist:''});
 try{
  for(let i=0;i<slots.length;i++){
   const slot=slots[i];let level=null;
   progress?.(i+1,slots.length);
   try{
    const badge=kind==='pet'?C.petBadgeRect(slot.rect):C.valoraBadgeRect(slot.rect);
    const img=crop(canvas,badge,'badge');
    const raw=await worker.recognize(img);
    level=C.readSkillLevel(raw?.data?.text||'',slot.max);
    if(level===null){
     const highContrast=await worker.recognize(contrastBadge(img));
     level=C.readSkillLevel(highContrast?.data?.text||'',slot.max);
    }
    if(level===null){
     await configure({tessedit_pageseg_mode:'8'});
     const extra=await worker.recognize(contrastBadge(img));
     level=C.readSkillLevel(extra?.data?.text||'',slot.max);
     await configure({tessedit_pageseg_mode:'7'});
    }
   }catch(_){/* Uncertain labels are left blank, never guessed. */}
   out.push({...slot,level});
  }
 }finally{
  // Restore the shared worker for the unrelated hero/troop OCR steps.
  await configure({tessedit_pageseg_mode:'3',tessedit_char_whitelist:''});
 }
 return out;
}
function mount(host,B){
 appBridge=B;
 const panel=el('section','bear-buff-panel');
 const h=el('h3','',de('🐾 Begleiter-Buffs & 🏹 Valora','🐾 Pet buffs & 🏹 Valora'));
 const hint=el('p','hint',de(
  'Zwei Screenshots, ein Bestätigungsklick. Pet-Lv. bezeichnet das FÄHIGKEITSLEVEL, nicht das Tierlevel. Valoras vier Skills erkennen wir; Hunter Instinct (Lv. 8 im Beispiel) trägst du selbst ein.',
  'Two screenshots, one confirmation. Pet Lv. is the SKILL rank, not pet level. We read Valora’s four skills; enter Hunter Instinct (Lv. 8 in your example) yourself.'));
 const buttons=el('div','bear-buff-pickers');
 const petBtn=el('label','bear-buff-pick',de('📸 Pet-Fertigkeiten','📸 Pet skills'));
 const petInput=el('input');petInput.type='file';petInput.accept='image/*';petInput.hidden=true;petBtn.append(petInput);
 const valBtn=el('label','bear-buff-pick',de('📸 Valora-Fertigkeiten','📸 Valora skills'));
 const valInput=el('input');valInput.type='file';valInput.accept='image/*';valInput.hidden=true;valBtn.append(valInput);
 buttons.append(petBtn,valBtn);
 const petReview=el('div','bear-buff-review');const valReview=el('div','bear-buff-review');
 const talent=el('label','bear-buff-talent');
 const talentText=el('span','',de('Hunter Instinct – Talentlevel (manuell)','Hunter Instinct – talent level (manual)'));
 const talentInput=el('input');talentInput.type='number';talentInput.inputMode='numeric';talentInput.min='0';talentInput.max='10';talentInput.step='1';talentInput.placeholder='8';
 talent.append(talentText,talentInput);
 const clarification=el('p','hint',de(
  'Hinweis zum Valora-Bild: Die kleine Kachel unten links zeigt Hunter Instinct Lv. 8. Die Lv. 80-Anzeige am Meister ist ein ANDERER Fortschritt und wird nicht automatisch auf Buffs addiert.',
  'Valora screenshot: the bottom-left tile says Hunter Instinct Lv. 8. The master’s Lv. 80 is a DIFFERENT progression and is not added to buffs.'));
 const status=el('p','hint bear-buff-status');status.setAttribute('role','status');
 const save=el('button','primary bear-buff-save',de('✓ Geprüfte Werte übernehmen','✓ Apply reviewed values'));save.type='button';
 const description=el('p','hint',de(
  'Petnamen sind anhand der Bildposition nur Vorschläge – bitte die Symbole prüfen. Dunkle Timer bedeuten Abklingzeit, nicht „Buff aktiv“. Aktive Kampf-Buffs musst du selbst markieren. Keine Bonuswerte doppelt addieren.',
  'Pet names are position-based suggestions; verify icons. Dark timers mean cooldown, NOT “buff active”. Mark intended battle buffs yourself. Never add bonuses twice.'));
 panel.append(h,hint,buttons,petReview,valReview,talent,clarification,status,description,save);
 host.append(panel);
 function v2(){
  const model=B.model();if(!model.v2)model.v2={};
  if(!model.v2.petSkillRanks)model.v2.petSkillRanks={};
  if(!model.v2.petActive)model.v2.petActive={};
  if(!Array.isArray(model.v2.valora))model.v2.valora=[0,0,0,0];
  return model.v2;
 }
 function renderPet(){
  petReview.replaceChildren();
  if(!draftPet)return;
  petReview.append(el('h4','',de('Pet-Fertigkeiten prüfen','Review pet skills')));
  const choices=(cat.pets||[]).filter(x=>x.bearSkill);
  const grid=el('div','bear-buff-pet-grid');
  for(const item of draftPet){
   const row=el('div','bear-buff-pet-row');
   const img=el('img','bear-buff-thumbnail');img.alt='';img.src=item.preview;img.alt='';img.src=item.preview;
   const fields=el('div','bear-buff-fields');
   const name=el('select');name.setAttribute('aria-label',de('Begleiter auswählen','Choose pet'));
   for(const p of choices){
    const opt=el('option','',p.name);opt.value=p.name;
    if(item.name===p.name)opt.selected=true;name.append(opt);
   }
   name.addEventListener('change',()=>{item.name=name.value;});
   const level=el('input');level.type='number';level.inputMode='numeric';level.min='1';
   level.max=String(choices.find(x=>x.name===item.name)?.bearSkill.values.length||10);
   level.placeholder='Lv ?';level.value=item.level??'';
   level.setAttribute('aria-label',de('Fähigkeitslevel','Skill rank'));
   level.addEventListener('input',()=>{item.level=level.value===''?null:Number(level.value);});
   name.addEventListener('change',()=>{level.max=String(choices.find(x=>x.name===item.name)?.bearSkill.values.length||10);});
   const active=el('label','bear-buff-active');
   const box=el('input');box.type='checkbox';box.checked=Boolean(item.active);
   box.addEventListener('change',()=>{item.active=box.checked;});
   active.append(box,document.createTextNode(de(' Für Bär aktivieren',' Use for Bear')));
   fields.append(name,level,active);row.append(img,fields);grid.append(row);
  }
  petReview.append(grid);
  petReview.append(el('p','hint',de(
   'Nicht erkennbare Level bleiben leer. Das Bild liefert Skill-Ränge, KEINE Tierlevel. Bereits gespeicherte, nicht gezeigte Pets bleiben unberührt.',
   'Unknown levels stay blank. The image shows skill ranks, NOT overall pet levels. Other saved pets remain unchanged.')));
 }
 function renderVal(){
  valReview.replaceChildren();
  if(!draftValora)return;
  valReview.append(el('h4','',de('Valora: vier Fertigkeiten prüfen','Valora: review four skills')));
  const grid=el('div','bear-buff-valora-grid');
  draftValora.forEach((item,i)=>{
   const record=cat.valora[i];
   const row=el('label','bear-buff-valora-row');
   const img=el('img','bear-buff-thumbnail bear-buff-valora-thumbnail');img.alt='';img.src=item.preview;
   const name=el('span','',record?.name||'Skill '+(i+1));
   const input=el('input');input.type='number';input.inputMode='numeric';input.min='1';input.max=String(C.valoraSkillMax[i]);
   input.value=item.level??'';input.placeholder='Lv ?';
   input.addEventListener('input',()=>{item.level=input.value===''?null:Number(input.value);});
   row.append(img,name,input);grid.append(row);
  });
  valReview.append(grid);
  valReview.append(el('p','hint',de(
   'Skill 1 erhöht Rally-Kapazität; Skill 4 erhöht die eigene Bären-Marschkapazität (3.000 × Skilllevel). Skills 2/3 erhöhen Belohnungen, nicht Schaden.',
   'Skill 1 increases rally capacity; skill 4 increases personal Bear deployment capacity (3,000 × skill level). Skills 2/3 affect rewards, not damage.')));
 }
 async function handlePet(file){
  if(petBusy||!file)return;
  petBusy=true;petInput.disabled=true;status.textContent=de('Pet-Karten werden lokal gelesen …','Reading pet cards locally …');
  try{
   const canvas=await photoCanvas(file);
   const slots=C.petSlots.map(s=>({...s,rect:C.petRect(s)}));
   const recognized=await recognizeSlots(canvas,slots,'pet',(done,total)=>{
    status.textContent=de('Pet-Skill '+done+'/'+total+' wird gelesen …','Reading pet skill '+done+'/'+total+' …');
   });
   petPhoto=canvas;
   const ext=v2();
   draftPet=recognized.map(({rect,...item})=>({
    ...item,active:Boolean(ext.petActive[item.name]),preview:crop(canvas,rect,'preview').toDataURL('image/jpeg',.78)
   }));
   renderPet();
   const read=recognized.filter(x=>x.level!==null).length;
   status.textContent=de('Pet-Skill-Level erkannt: '+read+'/'+recognized.length+'. Fehlende Werte bitte prüfen.','Pet skill ranks recognized: '+read+'/'+recognized.length+'. Review any blanks.');
  }catch(e){status.textContent=de('Pet-Erkennung fehlgeschlagen: ','Pet recognition failed: ')+String(e?.message||e);}
  petBusy=false;petInput.disabled=false;
 }
 async function handleValora(file){
  if(valoraBusy||!file)return;
  valoraBusy=true;valInput.disabled=true;status.textContent=de('Valora-Skills werden lokal gelesen …','Reading Valora skills locally …');
  try{
   const canvas=await photoCanvas(file);
   const slots=C.valoraSkillMax.map((max,i)=>({max,rect:C.valoraRect(i)}));
   const recognized=await recognizeSlots(canvas,slots,'valora',(done,total)=>{
    status.textContent=de('Valora-Skill '+done+'/'+total+' wird gelesen …','Reading Valora skill '+done+'/'+total+' …');
   });
   draftValora=recognized.map(({rect,...item},i)=>({
    ...item,preview:crop(canvas,C.valoraPreviewRect(rect),'preview').toDataURL('image/jpeg',.87)
   }));
   renderVal();
   const found=recognized.filter(x=>x.level!==null).length;
   status.textContent=de('Valora-Skill-Level erkannt: '+found+'/4. Fehlende Werte bitte prüfen.','Valora skill ranks recognized: '+found+'/4. Review any blanks.');
  }catch(e){status.textContent=de('Valora-Erkennung fehlgeschlagen: ','Valora recognition failed: ')+String(e?.message||e);}
  valoraBusy=false;valInput.disabled=false;
 }
 petInput.addEventListener('change',()=>{const file=petInput.files?.[0];petInput.value='';if(file)handlePet(file);});
 valInput.addEventListener('change',()=>{const file=valInput.files?.[0];valInput.value='';if(file)handleValora(file);});
 function updateTalent(){const saved=B.model().v2?.valoraTalent||0;talentInput.value=saved?String(saved):'';}
 root.addEventListener('nrw-bear-loaded',updateTalent);updateTalent();
 save.addEventListener('click',()=>{
  if(petBusy||valoraBusy){status.textContent=de('Bitte zunächst die Bilderkennung abwarten.','Wait for screenshot analysis first.');return;}
  const tv=talentInput.value.trim();
  if(tv!==''&&(!Number.isInteger(Number(tv))||Number(tv)<0||Number(tv)>10)){
   status.textContent=de('Talentlevel muss zwischen 0 und 10 liegen.','Talent level must be 0–10.');return;
  }
  if(draftValora&&draftValora.some((x,i)=>x.level!==null&&!validLevel(x.level,C.valoraSkillMax[i]))){
   status.textContent=de('Ein Valora-Skilllevel ist ungültig.','An invalid Valora skill level was entered.');return;
  }
  const sourcePets=(cat.pets||[]).filter(p=>p.bearSkill);
  if(draftPet&&draftPet.some(x=>x.level!==null&&!C.checkPet(x.name,x.level,sourcePets))){
   status.textContent=de('Ein Pet-Level oder die Pet-Zuordnung ist ungültig.','Invalid pet skill rank or name.');return;
  }
  if(draftPet&&new Set(draftPet.filter(x=>x.level!==null).map(x=>x.name)).size!==
    draftPet.filter(x=>x.level!==null).length){
   status.textContent=de('Eine Pet-Zuordnung ist doppelt. Bitte korrigieren.','Duplicate pet names: please correct.');return;
  }
  const ext=v2();let count=0;
  if(draftPet){
   for(const pet of draftPet)if(pet.level!==null){
    ext.petSkillRanks[pet.name]=Number(pet.level);
    ext.petActive[pet.name]=Boolean(pet.active);
    count++;
   }
  }
  if(draftValora){
   for(let i=0;i<draftValora.length;i++)if(draftValora[i].level!==null){
    ext.valora[i]=Number(draftValora[i].level);count++;
   }
  }
  if(tv!==''){ext.valoraTalent=Number(tv);count++;}
  if(!count){status.textContent=de('Noch keine Werte zum Übernehmen.','No values to apply yet.');return;}
  B.save();
  root.NRW_BEAR_ENHANCE?.refreshBuffs?.();
  // Do not alter the base march capacity, hero equipment, total combat stats
  // or the existing manually confirmed master/pet bonus fields.
  status.textContent=de('✓ '+count+' geprüfte Skillwerte lokal gespeichert. Keine Buffs automatisch addiert.',
   '✓ '+count+' reviewed skill levels saved locally. No buffs auto-added.');
  draftPet=null;draftValora=null;petPhoto=null;renderPet();renderVal();
 });
 return {refresh:updateTalent};
}
root.NRW_BEAR_BUFF_IMPORT={mount};
})(window);
