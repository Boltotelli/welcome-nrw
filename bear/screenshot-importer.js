/* NRW Bear screenshot import: on-device, preview-before-save, no upload.
 * Coordinates calibrated for Kingshot full Governor Equipment screen (716×1536).
 * Small charm glyphs are matched against player-provided Lv3–8 guide signatures.
 * If the reference host supports CORS, also compare Lv1–22 silhouettes.
 * Scores are heuristic. Never save unknown slots automatically.
 */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE, GUIDE=window.NRW_BEAR_CHARM_SHAPES, REF=window.NRW_BEAR_CHARM_REFERENCES, TIER=window.NRW_BEAR_TIER_RECOGNIZER;
const r=document.getElementById('restricted'),quick=document.getElementById('uxQuickStart');
if(!B||!GUIDE||!r||!quick)return;
const W=716,H=1536;
const slots=[
 {id:'helmet',type:'cavalry',caption:'Kavallerie · Hut',gear:[145,340],charms:[[112,410],[147,410],[180,410]]},
 {id:'neck',type:'cavalry',caption:'Kavallerie · Halskette',gear:[571,340],charms:[[538,410],[572,410],[605,410]]},
 {id:'coat',type:'infantry',caption:'Infanterie · Mantel',gear:[107,504],charms:[[73,575],[107,575],[140,575]]},
 {id:'pants',type:'infantry',caption:'Infanterie · Hose',gear:[606,504],charms:[[571,575],[605,575],[640,575]]},
 {id:'ring',type:'archer',caption:'Bogenschützen · Ring',gear:[145,669],charms:[[113,740],[147,740],[180,740]]},
 {id:'staff',type:'archer',caption:'Bogenschützen · Stab',gear:[570,669],charms:[[537,740],[571,740],[605,740]]}
];
const texts={
 de:{detected:'erkannt',tierUnknown:'Nicht erkannt',title:'📸 GovGear + 18 Talismane importieren',intro:'Ein Vollbild-Screenshot der Gouverneur-Ausrüstung reicht. Das Bild wird ausschließlich hier im Browser analysiert.',choose:'Screenshot auswählen',processing:'18 Talismane werden verglichen …',preview:'Erkennung prüfen',confirm:'Geprüfte Werte übernehmen',cancel:'Verwerfen',unknown:'Nicht erkannt – bitte auswählen oder überspringen',auto:'Vorschlag',manual:'Selbst gewählt',noPhoto:'Noch kein Bild ausgewählt.',layout:'Für diese Erkennung bitte die vollständige Gouverneur-Ausrüstung wie in deinem Screenshot verwenden (sechs Ausrüstungsteile sichtbar).',status:'Bild analysiert. Bitte alle Vorschläge vor der Übernahme kontrollieren.',saved:'Bestätigte Werte lokal übernommen. Nicht erkannte Felder wurden nicht überschrieben.',confidence:'Erkennung',gear:'Ausrüstung',quality:'Qualität',tier:'Stufe',stars:'Sterne',skip:'Unverändert lassen',offline:'Der Bildserver erlaubt keinen vollständigen Vergleich. Die bekannten Level 3–8 werden lokal geprüft; andere bleiben offen.',levels:'Level',privacy:'Keine Bildübertragung, kein externer OCR-Dienst.',invalid:'Bild konnte nicht verarbeitet werden.',remote:'Referenzen für Level 1–22 geladen.',partial:'Nur geprüfte Treffer übernehmen.'},
 en:{detected:'detected',tierUnknown:'Not recognized',title:'📸 Import gear + 18 charms',intro:'One full Governor Equipment screenshot is enough. The picture is processed only in this browser.',choose:'Select screenshot',processing:'Comparing 18 charms …',preview:'Review recognition',confirm:'Apply reviewed values',cancel:'Discard',unknown:'Unrecognized – choose a level or skip',auto:'Suggested',manual:'Chosen manually',noPhoto:'No screenshot selected.',layout:'Use the full Governor Equipment screen showing all six pieces.',status:'Analysis ready. Review all guesses before applying.',saved:'Confirmed values saved locally; unknowns were not overwritten.',confidence:'Detection',gear:'Gear',quality:'Quality',tier:'Tier',stars:'Stars',skip:'Leave unchanged',offline:'Online images could not be compared. Lv3–8 local examples used; other levels remain unknown.',levels:'Level',privacy:'No image upload or external OCR service.',invalid:'Cannot process this image.',remote:'All 22 level references loaded.',partial:'Apply only reviewed matches.'},
 fr:{detected:'reconnu',tierUnknown:'Non reconnu',title:'📸 Importer équipements et 18 talismans',intro:'Une capture complète suffit. L’image reste dans le navigateur.',choose:'Choisir une capture',processing:'Analyse des 18 talismans…',preview:'Vérifier',confirm:'Valider les valeurs',cancel:'Annuler',unknown:'Non identifié — corriger ou ignorer',auto:'Suggestion',manual:'Choisi',noPhoto:'Aucune image sélectionnée.',layout:'Utiliser la vue complète des six équipements.',status:'Analyse terminée. Vérifiez les propositions.',saved:'Valeurs confirmées enregistrées localement.',confidence:'Fiabilité',gear:'Équipement',quality:'Qualité',tier:'Niveau',stars:'Étoiles',skip:'Ne pas modifier',offline:'Seuls les exemples locaux niveaux 3–8 disponibles; les autres restent inconnus.',levels:'Niveaux',privacy:'Aucun transfert de votre image.',invalid:'Image non reconnue.',remote:'Références des 22 niveaux disponibles.',partial:'Valider les valeurs vérifiées.'}
};
const T=()=>texts[document.documentElement.lang]||texts.en;
const pane=document.createElement('section');pane.className='panel bear-import-card';pane.innerHTML=
 '<div class="bear-import-head"><div><h2 id="bearImportTitle"></h2><p class="hint" id="bearImportIntro"></p></div><label class="secondary-btn bear-import-picker"><span id="bearImportChoose"></span><input id="bearGearPhoto" type="file" accept="image/*" hidden></label></div>'+
 '<p class="hint bear-import-layout" id="bearImportLayout"></p><div id="bearImportStatus" class="bear-import-status" role="status" aria-live="polite"></div>'+
 '<div id="bearImportReview" hidden><div class="bear-import-preview-head"><h3 id="bearImportPreview"></h3><span id="bearImportConfidence" class="hint"></span></div>'+
 '<div id="bearImportGrid" class="bear-import-grid"></div><div class="bear-import-actions"><button type="button" id="bearImportApply" class="primary"></button><button type="button" id="bearImportCancel" class="secondary-btn"></button></div></div>';
quick.after(pane);
const $=id=>document.getElementById(id);
let pending=null,photoObjectUrl=null,cacheImages=null;
function locale(){
 $('bearImportTitle').textContent=T().title;$('bearImportIntro').textContent=T().intro;$('bearImportChoose').textContent=T().choose;
 $('bearImportLayout').textContent=T().layout;$('bearImportPreview').textContent=T().preview;
 $('bearImportApply').textContent=T().confirm;$('bearImportCancel').textContent=T().cancel;
}
function report(text){$('bearImportStatus').textContent=text;}
function glyph(raw,kind){
 // Hue (0..360), saturation (0..1), value (0..1) threshold.
 const target={infantry:[68,182],cavalry:[170,226],archer:[26,78]}[kind];
 if(!target)return false;
 const r=raw[0]/255,g=raw[1]/255,b=raw[2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
 if(max<.36||delta/max<.37)return false;
 let h=0;
 if(delta){if(max===r)h=60*((g-b)/delta%6);else if(max===g)h=60*((b-r)/delta+2);else h=60*((r-g)/delta+4);}
 if(h<0)h+=360;
 return h>=target[0]&&h<=target[1];
}
function maskOf(image,kind){
 // Largest connected coloured blob suppresses background and OCR text.
 const {width:w,height:h,data:d}=image;
 const active=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++){let p=4*i;if(d[p+3]>80&&glyph([d[p],d[p+1],d[p+2]],kind))active[i]=1;}
 const seen=new Uint8Array(w*h),stack=[],best={count:0};
 for(let i=0;i<w*h;i++){
  if(!active[i]||seen[i])continue;
  let count=0,x0=w,y0=h,x1=0,y1=0;stack.push(i);seen[i]=1;
  while(stack.length){const p=stack.pop(),x=p%w,y=Math.floor(p/w);count++;x0=Math.min(x,x0);x1=Math.max(x,x1);y0=Math.min(y,y0);y1=Math.max(y,y1);
   for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1])if(n>=0&&active[n]&&!seen[n]){seen[n]=1;stack.push(n);}
  }
  if(count>best.count)Object.assign(best,{count,x0,x1,y0,y1});
 }
 if(best.count<10||best.x1-best.x0<3||best.y1-best.y0<3)return null;
 const len=Math.max(best.x1-best.x0+1,best.y1-best.y0+1),norm=new Uint8Array(24*24);
 const originX=best.x0-Math.floor((len-(best.x1-best.x0+1))/2),originY=best.y0-Math.floor((len-(best.y1-best.y0+1))/2);
 for(let y=0;y<24;y++)for(let x=0;x<24;x++){
  const ox=originX+Math.min(len-1,Math.floor((x+.5)*len/24));
  const oy=originY+Math.min(len-1,Math.floor((y+.5)*len/24));
  norm[y*24+x]=(ox>=0&&ox<w&&oy>=0&&oy<h&&active[oy*w+ox])?1:0;
 }
 return {bits:norm,pixels:best.count};
}
function unpack(code){
 const bytes=atob(code),mask=new Uint8Array(576);
 for(let i=0;i<576;i++)mask[i]=(bytes.charCodeAt(i>>3)>>(7-(i&7)))&1;
 return mask;
}
const known=Object.fromEntries(Object.entries(GUIDE).map(([kind,byLevel])=>[kind,Object.entries(byLevel).map(([level,code])=>({level:Number(level),bits:unpack(code),source:'guide'}))]));
function compare(input,templates){
 if(!input||!templates.length)return {level:null,score:1,confidence:'unknown'};
 const scores=templates.map(t=>{
  let diff=0;for(let i=0;i<576;i++)if(input.bits[i]!==t.bits[i])diff++;
  return {level:t.level,score:diff/576,source:t.source};
 }).sort((a,b)=>a.score-b.score);
 const best=scores[0],next=scores.find(x=>x.level!==best.level);
 const margin=(next?next.score-best.score:1);
 // Conservative thresholds: ambiguity remains a user-editable unknown.
 const certain=best.score<=.14&&margin>=.05;
 return {level:certain?best.level:null,guess:best.level,score:best.score,margin,confidence:certain?'suggested':'unknown'};
}
function getCrop(ctx,center,radius){
 const x=center[0]*ctx.canvas.width/W,y=center[1]*ctx.canvas.height/H,scale=ctx.canvas.width/W;
 const q=Math.max(9,radius*scale),left=Math.max(0,Math.round(x-q)),top=Math.max(0,Math.round(y-q));
 const w=Math.min(ctx.canvas.width-left,Math.round(q*2)),h=Math.min(ctx.canvas.height-top,Math.round(q*2));
 return ctx.getImageData(left,top,w,h);
}
function drawThumb(ctx,center,radius){
 const src=getCrop(ctx,center,radius),canvas=document.createElement('canvas');canvas.width=src.width;canvas.height=src.height;
 canvas.getContext('2d').putImageData(src,0,0);
 return canvas.toDataURL('image/png');
}
function rarity(ctx,pos){
 // Governor gear backgrounds: broad purple/gold pixels in the outer ring of gear icons.
 const pix=getCrop(ctx,pos,52),d=pix.data,w=pix.width,h=pix.height;
 let purple=0,gold=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if(x>w*.25&&x<w*.75&&y>h*.25&&y<h*.75)continue;
  const p=(y*w+x)*4,R=d[p],G=d[p+1],B=d[p+2];
  if(B>R*1.1&&R>G*.9&&B>G*1.18&&R>80)purple++;
  if(R>175&&G>85&&G<R*.83&&B<R*.66)gold++;
 }
 const denom=w*h;
 if(purple>denom*.07&&purple>gold*1.7)return 'purple';
 if(gold>denom*.07&&gold>purple*1.7)return 'gold';
 return '';
}
function readGearStars(ctx,pos){
 // Count isolated yellow star components along the LEFT edge of the gear
 // icon. Only return a proposal when their size and position are plausible.
 const sx=ctx.canvas.width/W,sy=ctx.canvas.height/H;
 const x=Math.max(0,Math.round((pos[0]-58)*sx));
 const y=Math.max(0,Math.round((pos[1]-25)*sy));
 const w=Math.min(ctx.canvas.width-x,Math.round(40*sx));
 const h=Math.min(ctx.canvas.height-y,Math.round(89*sy));
 if(w<15||h<40)return null;
 const d=ctx.getImageData(x,y,w,h).data;
 const yes=new Uint8Array(w*h),seen=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++){
  const p=i*4,R=d[p],G=d[p+1],Blue=d[p+2];
  if(R>150&&G>115&&Blue<155&&R>Blue*1.20&&G>Blue*1.09)yes[i]=1;
 }
 const candidates=[];let ambiguous=false;
 for(let i=0;i<yes.length;i++){
  if(!yes[i]||seen[i])continue;
  let a=0,sumX=0,sumY=0;const stack=[i];seen[i]=1;
  while(stack.length){
   const id=stack.pop(),px=id%w,py=Math.floor(id/w);
   a++;sumX+=px;sumY+=py;
   for(const v of [px>0?id-1:-1,px+1<w?id+1:-1,py>0?id-w:-1,py+1<h?id+w:-1]){
    if(v>=0&&yes[v]&&!seen[v]){seen[v]=1;stack.push(v);}
   }
  }
  const nx=sumX/Math.max(1,a)/w,ny=sumY/Math.max(1,a)/h;
  const scaled=a/(sx*sy);
  // Gold-coloured equipment artwork can masquerade as an extra star.
  // Off-centre, large blobs render the count ambiguous instead of guessing.
  if(scaled>=260&&scaled<=420&&nx>=.61&&nx<.85&&ny>.2&&ny<.6)ambiguous=true;
  if(scaled>=80&&scaled<=420&&nx>.38&&nx<.61&&ny>.12&&ny<.82)candidates.push({x:nx,y:ny});
 }
 // Nearby fragments of one star could be counted twice; require distinct
 // vertical centres separated by roughly 12 original screenshot pixels.
 candidates.sort((a,b)=>a.y-b.y);
 const distinct=[];
 for(const c of candidates)if(distinct.every(v=>Math.abs(v.y-c.y)>12/89))distinct.push(c);
 return !ambiguous&&distinct.length>=1&&distinct.length<=3?distinct.length:null;
}
async function getRemoteTemplates(){
 if(cacheImages!==null)return cacheImages;
 cacheImages=[];
 // Prefer small same-origin, build-time generated glyph silhouettes.
 // Browser never sends a player screenshot to the reference image host.
 try{
  const response=await fetch('./charm-signatures.json',{cache:'force-cache'});
  if(response.ok){
   const bundle=await response.json();
   if(bundle&&bundle.shape_only===true&&bundle.levels&&typeof bundle.levels==='object'){
    const shapes=Object.entries(bundle.levels).filter(([lv,code])=>Number(lv)>=1&&Number(lv)<=22&&typeof code==='string')
     .map(([level,code])=>{try{return {level:Number(level),bits:unpack(code),source:'compiled'};}catch(_){return null;}}).filter(Boolean);
    if(shapes.length>=4){cacheImages=shapes;return cacheImages;}
   }
  }
 }catch(_){}
 // Cross-origin pixel access is permitted only if the public host explicitly
 // supplies an Access-Control-Allow-Origin response. No screenshot sent.
 const load=(level)=>new Promise(resolve=>{
  const img=new Image();img.crossOrigin='anonymous';
  let done=false;const end=r=>{if(done)return;done=true;resolve(r);};
  img.onerror=()=>end(null);
  img.onload=()=>{
   try{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
    const shape=maskOf(x.getImageData(0,0,c.width,c.height),'infantry');
    end(shape?{level,bits:shape.bits,source:'online'}:null);
   }catch(_){end(null);}
  };
  img.src='https://kingshotoptimizer.com/images/charms-cards/infantry_lvl'+level+'.webp';
 });
 // Probe CORS first. This prevents two dozen failed requests on blocked hosts.
 const probe=await load(9);
 if(!probe)return cacheImages;
 const more=await Promise.all(Array.from({length:22},(_,i)=>i+1).filter(n=>n!==9).map(load));
 cacheImages=[probe,...more.filter(Boolean)];
 return cacheImages;
}
function label(tag,text,control){const x=document.createElement('label');x.className='bear-import-field';const name=document.createElement('span');name.textContent=text;x.append(name,control);return x;}
function selectOptions(current,items){
 const select=document.createElement('select');
 for(const [v,text] of items){const opt=document.createElement('option');opt.value=v;opt.textContent=text;opt.selected=String(v)===String(current);select.appendChild(opt);}
 return select;
}
function review(scans,onlineCount){
 const box=$('bearImportGrid');box.innerHTML='';
 let definite=0;
 scans.forEach((g,gi)=>{
  const card=document.createElement('div');card.className='bear-import-gear';
  const title=document.createElement('div');title.className='bear-import-gear-head';
  const img=document.createElement('img');img.src=g.thumb;img.alt=g.caption;
  const caption=document.createElement('b');caption.textContent=g.caption;title.append(img,caption);card.appendChild(title);
  const meta=document.createElement('div');meta.className='bear-import-gear-meta';
  const qualities=[['',T().skip],['green','Green'],['blue','Blue'],['purple','Purple'],['gold','Gold'],['red','Red']];
  const q=selectOptions(g.quality,qualities);q.dataset.slot=String(gi);q.dataset.field='quality';
  const tier=selectOptions(g.tier?.tier??'',[['',T().skip],...Array.from({length:6},(_,i)=>[i+1,'T'+(i+1)])]);tier.dataset.slot=String(gi);tier.dataset.field='tier';
  const star=selectOptions(g.stars??'',[['',T().skip],...Array.from({length:4},(_,i)=>[i,i+'★'])]);star.dataset.slot=String(gi);star.dataset.field='stars';
  const tierField=label('tier',T().tier,tier);
  const tierNote=document.createElement('small');tierNote.className='bear-import-tier-note';
  tierNote.textContent=g.tier?.tier===1?('✓ T1 '+T().detected+' · '+Math.round(g.tier.score*100)+'%'):T().tierUnknown;
  tierField.appendChild(tierNote);
  meta.append(label('q',T().quality,q),tierField,label('stars',T().stars,star));card.appendChild(meta);
  const grid=document.createElement('div');grid.className='bear-import-charms';
  g.charms.forEach((ch,j)=>{
   const cell=document.createElement('div');cell.className='bear-import-charm';
   const thumb=document.createElement('img');thumb.src=ch.thumb;thumb.alt='Charm '+(j+1);
   const options=[['',T().skip],...Array.from({length:22},(_,i)=>[i+1,'Lv. '+(i+1)])];
   const choice=selectOptions(ch.level??'',options);choice.dataset.slot=String(gi);choice.dataset.charm=String(j);
   if(ch.level!==null)definite++;
   const note=document.createElement('small');note.textContent=ch.level!==null?('✓ '+T().auto+' · '+Math.round((1-ch.score)*100)+'%'):(ch.guess?'? '+T().unknown+' (Lv. '+ch.guess+')':T().unknown);
   cell.append(thumb,choice,note);grid.appendChild(cell);
  });
  card.appendChild(grid);box.appendChild(card);
 });
 $('bearImportConfidence').textContent=definite+'/18 · '+(onlineCount?T().remote:T().offline);
 $('bearImportReview').hidden=false;report(T().status);
}
async function analyse(file){
 if(!file||!file.type.startsWith('image/'))throw Error('type');
 const url=URL.createObjectURL(file);
 let image;
 try{
  image=await new Promise((resolve,reject)=>{
   const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;
  });
  if(image.naturalWidth<450||image.naturalHeight<800||image.naturalHeight/image.naturalWidth<1.3)throw Error('layout');
  const canvas=document.createElement('canvas');
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const remote=await getRemoteTemplates();
  const output=slots.map(slot=>({
   ...slot,thumb:drawThumb(ctx,slot.gear,47),quality:rarity(ctx,slot.gear),stars:readGearStars(ctx,slot.gear),tier:TIER?.recognize?.(ctx,slot.gear)||{tier:null,score:0},
   charms:slot.charms.map(pos=>{
    const input=maskOf(getCrop(ctx,pos,18),slot.type);
    const extra=remote.map(x=>({level:x.level,bits:x.bits,source:'online'}));
    const matches=compare(input,[...(known[slot.type]||[]),...extra]);
    return {...matches,thumb:drawThumb(ctx,pos,20)};
   })
  }));
  return {output,onlineCount:remote.length,dimensions:[canvas.width,canvas.height]};
 }finally{URL.revokeObjectURL(url);}
}
$('bearGearPhoto').addEventListener('change',async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 $('bearImportReview').hidden=true;report(T().processing);
 try{const result=await analyse(file);pending=result.output;review(result.output,result.onlineCount);}
 catch(error){pending=null;report(T().invalid+' '+(error.message==='layout'?T().layout:''));}
});
$('bearImportCancel').addEventListener('click',()=>{
 pending=null;$('bearImportReview').hidden=true;report(T().noPhoto);
});
$('bearImportApply').addEventListener('click',()=>{
 if(!pending)return;
 const m=B.model();m.v2=m.v2||{};m.v2.gear=m.v2.gear||{};
 $('bearImportGrid').querySelectorAll('[data-slot][data-field]').forEach(node=>{
  if(node.value==='')return;
  const g=pending[Number(node.dataset.slot)];
  const dest=m.v2.gear[g.id]||(m.v2.gear[g.id]={quality:'none',tier:0,stars:0,charms:[0,0,0]});
  dest[node.dataset.field]=node.dataset.field==='quality'?node.value:Number(node.value);
 });
 $('bearImportGrid').querySelectorAll('[data-slot][data-charm]').forEach(node=>{
  if(node.value==='')return;
  const g=pending[Number(node.dataset.slot)];
  const dest=m.v2.gear[g.id]||(m.v2.gear[g.id]={quality:'none',tier:0,stars:0,charms:[0,0,0]});
  if(!Array.isArray(dest.charms))dest.charms=[0,0,0];
  dest.charms[Number(node.dataset.charm)]=Number(node.value);
 });
 B.save();window.NRW_BEAR_ENHANCE?.refreshGear?.();pending=null;
 $('bearImportReview').hidden=true;report(T().saved);
});
window.NRW_BEAR_SCREEN_IMPORT={analyse,compare,maskOf,slots};
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(locale,0)));
locale();
})();