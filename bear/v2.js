/* NRW Bear Optimizer V2: visual game-card editor; all profile edits stay local. */
(function(){
'use strict';
const B=window.NRW_BEAR_BRIDGE, C=window.NRW_BEAR_CATALOG;
if(!B||!C)return;
const names=['de','en','fr'];
const translations={
de:{marches:'Marschplätze',joins:'Mögliche Join-Märsche',manualTroops:'Die Truppenzahlen stehen nicht in der API. Bitte im Truppenarsenal selbst eintragen.',heroDeck:'Deine Heldenkarten',heroInfo:'Nur die fünf Arena-Helden kommen aus der API. Weitere Helden aus dem Katalog selbst hinzufügen, Sterne und tatsächliche Skillstufen eingeben.',hero:'Held auswählen',star:'Sterne',tier:'Tier',widget:'Widget',skill:'Expeditionsskill',skillHint:'Vier Sterne schalten maximal Skill-Level 5 frei. Tatsächlich verbesserte Skills bitte selbst auswählen.',addHero:'Heldenkarte speichern',removeHero:'Karte entfernen',pets:'Deine Begleiter',petsInfo:'Level mit +/− oder Eingabe ändern. Für aktive Buffs optional Effekt und Wert angeben, aber nicht doppelt in Kampfstats zählen.',valora:'Valora – Bärenjägerin',valoraHint:'Savage Advantage erhöht die eigene Bären-Marschkapazität um 3.000 pro Skill-Level. Dance of the Hunt betrifft die Rally-Kapazität und ist nicht dasselbe.',valoraApply:'Savage Advantage in Marschkapazität übernehmen',gear:'GovGear & Talismane',gearInfo:'Die sechs Governor-Gear-Teile, jeweils mit drei Talismanen. Alle Angaben bleiben lokal; keine automatische Doppelberechnung von Kampfboni.',grade:'Qualität',gearTier:'Stufe',gearStar:'Sterne',charms:'Talismane',leadHeroes:'Drei Helden für die eigene Rally',joinHero:'Erster Held dieses Joins',pickEmpty:'Noch nicht gewählt',addFirst:'Heldenkarte hinzufügen',petActive:'Im Kampf aktiviert',level:'Level',imported:'API · Arena',manual:'Manuell',skillMax:'Skill-Maximum nach Sternen',notSet:'Nicht eingetragen',buffValue:'Buff-Wert',buffType:'Buff-Art',talent:'Hunter Instinct (Talent)',talentInfo:'Bonus auf eigene Bärenpunkte, nicht automatisch im Modell eingerechnet'},
en:{marches:'March slots',joins:'Available join marches',manualTroops:'The API does not provide troop counts. Enter them manually in the troop arsenal.',heroDeck:'Your hero cards',heroInfo:'Only five arena-defense heroes come from the API. Add other heroes from the catalog; enter stars and actual skill levels yourself.',hero:'Choose hero',star:'Stars',tier:'Tier',widget:'Widget',skill:'Expedition skill',skillHint:'Four stars unlock a maximum skill level of 5. Enter the levels you actually upgraded.',addHero:'Save hero card',removeHero:'Remove card',pets:'Your pets',petsInfo:'Adjust levels with +/− or type a value. Optional: enter active buff type and value; never double-count in battle stats.',valora:'Valora – Bear Hunter',valoraHint:'Savage Advantage adds 3,000 to Bear march capacity per skill level. Dance of the Hunt increases rally capacity instead.',valoraApply:'Use Savage Advantage as march bonus',gear:'Governor gear & charms',gearInfo:'Six governor gear pieces, each with three charms. Data stays local; no automatic double-counting of battle bonuses.',grade:'Quality',gearTier:'Tier',gearStar:'Stars',charms:'Charms',leadHeroes:'Three heroes for your own rally',joinHero:'First hero of this join',pickEmpty:'Not selected',addFirst:'Add a hero card',petActive:'Active in battle',level:'Level',imported:'API · Arena',manual:'Manual',skillMax:'Skill cap based on stars',notSet:'Not entered',buffValue:'Buff value',buffType:'Buff type',talent:'Hunter Instinct (talent)',talentInfo:'Personal Bear damage-points bonus; not automatically included in the model'},
fr:{marches:'Emplacements de marche',joins:'Renforts disponibles',manualTroops:"L’API ne fournit pas les quantités de troupes. Saisis-les manuellement.",heroDeck:'Tes cartes de héros',heroInfo:"L’API montre cinq héros d’arène. Ajoute les autres du catalogue, avec étoiles et niveaux de compétence réels.",hero:'Choisir le héros',star:'Étoiles',tier:'Palier',widget:'Équipement',skill:'Compétence expédition',skillHint:'Quatre étoiles permettent le niveau de compétence maximal 5. Indique les niveaux réellement améliorés.',addHero:'Enregistrer le héros',removeHero:'Supprimer le héros',pets:'Tes animaux',petsInfo:'Ajuste les niveaux avec +/− ou saisis-les. Renseigne éventuellement effet et valeur du bonus actif sans le compter deux fois.',valora:'Valora – chasseuse d’ours',valoraHint:"Savage Advantage ajoute 3 000 places par niveau à la marche d’ours. Dance of the Hunt concerne la capacité du rallye.",valoraApply:'Appliquer Savage Advantage à la marche',gear:'Équipements & talismans',gearInfo:'Six équipements de gouverneur avec trois talismans chacun. Tout est sauvegardé localement, sans double comptage.',grade:'Qualité',gearTier:'Palier',gearStar:'Étoiles',charms:'Talismans',leadHeroes:'Trois héros pour ton rallye',joinHero:'Premier héros de ce renfort',pickEmpty:'Non sélectionné',addFirst:'Ajouter une carte',petActive:'Actif en combat',level:'Niveau',imported:'API · Arène',manual:'Manuel',skillMax:'Maximum selon les étoiles',notSet:'Non saisi',buffValue:'Valeur du bonus',buffType:'Type de bonus',talent:'Hunter Instinct (talent)',talentInfo:'Bonus aux points personnels contre l’ours, non pris en compte automatiquement'}
};
const tx=k=>(translations[document.documentElement.lang]||translations.en)[k]||k;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const max=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(Number(v)||0)));
const choices=(entries,current)=>entries.map(([value,label])=>'<option value="'+esc(value)+'" '+(String(value)===String(current)?'selected':'')+'>'+esc(label)+'</option>').join('');
const catalogHero=n=>C.heroes.find(h=>h.name===n)||{name:n,img:''};
const catImg=n=>catalogHero(n).img||'';
const validModel=()=>B.profile()&&B.model();
const defaults=()=>({joinCount:0,petLevels:{},petActive:{},petEffects:{},petValues:{},valora:[0,0,0,0],valoraTalent:0,gear:{},manualHeroes:{},ownHeroes:['','','']});
function state(){
 const m=B.model();
 if(!m.v2||typeof m.v2!=='object')m.v2=defaults();
 const s=m.v2;
 if(!Number.isInteger(Number(s.joinCount)))s.joinCount=0;
 s.joinCount=max(s.joinCount,0,6);
 if(!s.petLevels)s.petLevels={};if(!s.petActive)s.petActive={};if(!s.petEffects)s.petEffects={};if(!s.petValues)s.petValues={};
 if(!Array.isArray(s.valora))s.valora=[0,0,0,0];
 if(!s.gear)s.gear={};if(!s.manualHeroes)s.manualHeroes={};
 if(!Array.isArray(s.ownHeroes))s.ownHeroes=['','',''];
 return s;
}
let sourceHeroes=[];
let container,petPanel,masterPanel,gearPanel,rosterPanel,joinSelect,ownPickers;
function availableHeroes(){
 const values=new Map();
 for(const h of sourceHeroes){if(h&&h.name)values.set(h.name,Object.assign({source:'api'},h));}
 for(const [name,h] of Object.entries(state().manualHeroes)){
    values.set(name,Object.assign({},values.get(name)||{},h,{name,source:'manual'}));
 }
 return Array.from(values.values());
}
function icon(url,alt,cl=''){
 const img=document.createElement('img');img.alt=alt||'';img.className=cl;img.loading='lazy';img.referrerPolicy='no-referrer';img.src=url||'';img.onerror=()=>{img.style.display='none';};
 return img;
}
function cardSection(iconText,titleKey,descriptionKey,id){
 const section=document.createElement('section');section.className='panel bear-v2-panel';section.innerHTML='<div class="panel-head"><h2>'+iconText+' <span>'+esc(tx(titleKey))+'</span></h2><span class="micro">LOCAL SAVE</span></div><div class="panel-body"><p class="hint">'+esc(tx(descriptionKey))+'</p><div id="'+id+'"></div></div>';
 return section;
}
function makeLayout(){
 const r=document.getElementById('restricted');
 const originalHeroPanel=document.getElementById('heroes').closest('section.panel');
 originalHeroPanel.querySelector('[data-t="heroTitleSection"]').textContent=tx('heroDeck');
 const v1=document.querySelector('[data-t="missingTitle"]').closest('section.panel');
 v1.classList.add('bear-v1-manual');
 container=document.createElement('div');container.className='bear-v2-mount';
 r.insertBefore(container,v1);
 const heroSection=cardSection('🃏','heroDeck','heroInfo','heroBuilder');
 const petSection=cardSection('🐾','pets','petsInfo','petsVisuals');
 const masterSection=cardSection('🏹','valora','valoraHint','masterVisuals');
 const gearSection=cardSection('🛡','gear','gearInfo','gearVisuals');
 container.append(heroSection,petSection,masterSection,gearSection);
 rosterPanel=heroSection.querySelector('#heroBuilder');
 petPanel=petSection.querySelector('#petsVisuals');
 masterPanel=masterSection.querySelector('#masterVisuals');
 gearPanel=gearSection.querySelector('#gearVisuals');
 const editor=document.querySelector('.editor');
 const editGrid=editor.querySelector('.editor-grid');
 editGrid.querySelector('#heroInput').hidden=true; // original input remains for backward compatibility
 joinSelect=document.createElement('div');joinSelect.className='field';
 joinSelect.innerHTML='<label>'+esc(tx('joinHero'))+'</label><select id="joinHeroPick"></select>';
 editGrid.insertBefore(joinSelect,editGrid.firstElementChild);
 document.getElementById('heroInput').closest('.field').hidden=true;
 ownPickers=document.createElement('div');ownPickers.className='bear-own-pickers';ownPickers.innerHTML='<p class="micro">'+esc(tx('leadHeroes'))+'</p><div class="bear-own-grid"><label class="field">🛡️ <span>Infanterie</span><select id="pickOwnI"></select></label><label class="field">🐴 <span>Kavallerie</span><select id="pickOwnC"></select></label><label class="field">🏹 <span>Bogenschützen</span><select id="pickOwnA"></select></label></div>';
 editGrid.after(ownPickers);
 const count=document.createElement('div');count.className='bear-march-count';
 count.innerHTML='<label for="joinCount">'+esc(tx('joins'))+'</label><select id="joinCount"></select><p class="hint">'+esc(tx('manualTroops'))+'</p>';
 count.querySelector('select').innerHTML=Array.from({length:7},(_,i)=>'<option value="'+i+'">'+i+' Joins · '+(i+1)+' '+esc(tx('marches'))+'</option>').join('');
 document.getElementById('marches').before(count);
 count.querySelector('#joinCount').addEventListener('change',e=>{state().joinCount=max(e.target.value,0,6);B.save();B.render();renderEditor();});
 joinSelect.querySelector('select').addEventListener('change',e=>{const m=B.model().marches[B.active()];m.hero=e.target.value||'';B.save();B.render();});
 ownPickers.querySelectorAll('select').forEach((node,i)=>node.addEventListener('change',e=>{state().ownHeroes[i]=e.target.value;B.model().marches[0].hero=state().ownHeroes.filter(Boolean).join(' / ');B.save();B.render();}));
 // The user must enter troop counts; never populate them from MightPulse.
 const arsenal=document.getElementById('troopsI').closest('section.panel');
 arsenal.querySelector('.panel-body').insertAdjacentHTML('afterbegin','<p class="bear-data-note">✍️ '+esc(tx('manualTroops'))+'</p>');
 const heroList=document.getElementById('heroes');heroList.classList.add('bear-hero-roster');
 document.querySelector('.stickers').querySelectorAll('.sticker')[1].textContent='⚔ 1–7 RALLIES';
}
function heroCap(s){return Number(s)>=4?5:Math.max(1,Number(s)+1);}
function heroBuilder(){
 const selectOptions=C.heroes.map(h=>[h.name,h.name]);const old=rosterPanel.querySelector('#heroName');
 const chosen=old&&old.value||'Yang';const entries=availableHeroes();
 rosterPanel.innerHTML='<div class="bear-hero-preview"><img id="heroPreviewImage" alt=""><div><b id="heroPreviewName"></b><small>★ NRW HERO CARD</small></div></div><div class="bear-hero-maker"><label class="field">'+esc(tx('hero'))+'<select id="heroName">'+choices(selectOptions,chosen)+'</select></label><label class="field">'+esc(tx('star'))+'<select id="heroStars">'+choices(Array.from({length:6},(_,i)=>[i,i+' ★']),4)+'</select></label><label class="field">'+esc(tx('tier'))+'<select id="heroTier">'+choices(Array.from({length:7},(_,i)=>[i,i?'T'+i:'—']),4)+'</select></label><label class="field">Widget +<input type="number" id="heroWidget" min="0" max="10" value="0"></label></div>'+
 '<div class="bear-skill-row">'+[1,2,3].map(n=>'<label class="field">'+esc(tx('skill'))+' '+n+'<select id="heroSkill'+n+'"></select></label>').join('')+'</div>'+
 '<div class="bear-skill-tip" id="heroSkillTip"></div>'+
 '<div class="bear-hero-actions"><button type="button" class="primary" id="saveHero">'+esc(tx('addHero'))+'</button><button type="button" class="secondary-btn" id="deleteHero">'+esc(tx('removeHero'))+'</button></div>';
 const selector=rosterPanel.querySelector('#heroName');
 function fillHero(){
   const name=selector.value,h=state().manualHeroes[name]||entries.find(v=>v.name===name)||{};
   const preview=rosterPanel.querySelector('#heroPreviewImage');preview.src=catImg(name)||h.icon||'';preview.alt=name;
   rosterPanel.querySelector('#heroPreviewName').textContent=name;
   rosterPanel.querySelector('#heroStars').value=Number.isFinite(Number(h.stars))?String(h.stars):'4';
   rosterPanel.querySelector('#heroTier').value=String(max(h.tier||0,0,6));
   rosterPanel.querySelector('#heroWidget').value=max(h.widget||0,0,10);
   fillSkills(Array.isArray(h.skills)?h.skills:[],false);
 }
 function fillSkills(skills,keep){
   const stars=Number(rosterPanel.querySelector('#heroStars').value),cap=heroCap(stars);
   for(let i=1;i<=3;i++){
      const x=rosterPanel.querySelector('#heroSkill'+i);const prior=keep?Number(x.value):Number(skills[i-1]||0);
      x.innerHTML=choices(Array.from({length:cap+1},(_,v)=>[v,v===0?tx('notSet'):'Lv. '+v]),Math.min(prior,cap));
   }
   rosterPanel.querySelector('#heroSkillTip').textContent=tx('skillMax')+': '+cap+' · '+tx('skillHint');
 }
 selector.addEventListener('change',fillHero);
 rosterPanel.querySelector('#heroStars').addEventListener('change',()=>fillSkills([],true));
 rosterPanel.querySelector('#saveHero').addEventListener('click',()=>{
   const name=selector.value;
   state().manualHeroes[name]={
    name,stars:max(rosterPanel.querySelector('#heroStars').value,0,5),
    tier:max(rosterPanel.querySelector('#heroTier').value,0,6),
    widget:max(rosterPanel.querySelector('#heroWidget').value,0,10),
    skills:[1,2,3].map(n=>max(rosterPanel.querySelector('#heroSkill'+n).value,0,5)),source:'manual'
   };
   B.save();renderRoster();renderEditor();
 });
 rosterPanel.querySelector('#deleteHero').addEventListener('click',()=>{delete state().manualHeroes[selector.value];B.save();renderRoster();renderEditor();});
 fillHero();
}
function renderRoster(){
 const el=document.getElementById('heroes');el.innerHTML='';
 const list=availableHeroes();
 if(!list.length){el.innerHTML='<p class="hint">'+esc(tx('addFirst'))+'</p>';return;}
 list.forEach(h=>{
   const div=document.createElement('button');div.type='button';div.className='hero-tile bear-character';div.title=h.name;
   const picture=icon(catImg(h.name)||h.icon,h.name);
   const image=document.createElement('div');image.className='portrait';image.appendChild(picture);
   div.appendChild(image);
   const stars=Number.isFinite(Number(h.stars))?Number(h.stars):null;
   div.insertAdjacentHTML('beforeend','<b>'+esc(h.name)+'</b><span class="stars">'+(stars===null?'☆ ?':'★'.repeat(Math.max(0,stars))+'☆'.repeat(Math.max(0,5-stars)))+(h.tier?' T'+esc(h.tier):'')+'</span><small>Widget +'+esc(h.widget??'?')+'</small><br><small>'+esc((h.skills||[]).map(v=>v?'Lv '+v:'?').join(' / '))+'</small><br><small>'+esc(h.source==='manual'?tx('manual'):tx('imported'))+'</small>');
   div.addEventListener('click',()=>{rosterPanel.querySelector('#heroName').value=h.name;rosterPanel.querySelector('#heroName').dispatchEvent(new Event('change'));rosterPanel.scrollIntoView({behavior:'smooth',block:'nearest'});});
   el.appendChild(div);
 });
}
function makeStepper(parent,{id,name,url,maxLevel,value,callback,note}){
 const tile=document.createElement('div');tile.className='bear-art-card';
 tile.appendChild(icon(url,name));
 const b=document.createElement('b');b.textContent=name;tile.appendChild(b);
 if(note){const p=document.createElement('small');p.className='bear-note';p.textContent=note;tile.appendChild(p);}
 const row=document.createElement('div');row.className='bear-level-row';
 row.innerHTML='<button type="button" aria-label="minus">−</button><input type="number" inputmode="numeric" aria-label="'+esc(name)+'" min="0" max="'+maxLevel+'" value="'+max(value,0,maxLevel)+'"><button type="button" aria-label="plus">+</button>';
 const input=row.querySelector('input');
 const update=v=>{input.value=max(v,0,maxLevel);callback(Number(input.value));};
 row.querySelectorAll('button')[0].addEventListener('click',()=>update(Number(input.value)-1));
 row.querySelectorAll('button')[1].addEventListener('click',()=>update(Number(input.value)+1));
 input.addEventListener('change',()=>update(input.value));tile.appendChild(row);parent.appendChild(tile);
 return tile;
}
function renderPets(){
 petPanel.innerHTML='';petPanel.className='bear-art-grid';
 C.pets.forEach(p=>{
   const s=state(),value=s.petLevels[p.name]||0;
   const tile=makeStepper(petPanel,{name:p.name,url:p.img,maxLevel:p.maxLevel,value,callback:v=>{
      s.petLevels[p.name]=v;
      const link={'Black Panther':'pantherLevel','Giant Rhino':'rhinoLevel','Mighty Bison':'bisonLevel','Great Moose':'mooseLevel'}[p.name];
      if(link&&document.getElementById(link)){const x=document.getElementById(link);x.value=v;x.dispatchEvent(new Event('input'));}
      B.save();
    }});
   const label=document.createElement('label');label.className='bear-active';label.innerHTML='<input type="checkbox"> '+esc(tx('petActive'));
   label.querySelector('input').checked=Boolean(s.petActive[p.name]);label.querySelector('input').addEventListener('change',e=>{state().petActive[p.name]=e.target.checked;B.save();});
   tile.appendChild(label);
   const buff=document.createElement('div');buff.className='bear-pet-buff';
   buff.innerHTML='<label>'+esc(tx('buffType'))+'<select><option value="none">—</option><option value="attack">Attack %</option><option value="lethality">Lethality %</option><option value="capacity">March +</option><option value="health">Health %</option><option value="defense">Defense %</option><option value="other">Other</option></select></label><label>'+esc(tx('buffValue'))+'<input type="number" min="0" step=".1" inputmode="decimal" placeholder="—"></label>';
   const effect=buff.querySelector('select'),amount=buff.querySelector('input');
   effect.value=s.petEffects[p.name]||'none';
   amount.value=s.petValues[p.name]??'';
   effect.addEventListener('change',()=>{state().petEffects[p.name]=effect.value;B.save();});
   amount.addEventListener('input',()=>{state().petValues[p.name]=amount.value===''?'':Math.max(0,Number(amount.value)||0);B.save();});
   tile.appendChild(buff);
 });
}
function renderValora(){
 masterPanel.innerHTML='';masterPanel.className='bear-art-grid bear-master-grid';
 makeStepper(masterPanel,{name:tx('talent'),url:'https://kingshot.net/images/masters/valora/valora.png',maxLevel:11,value:state().valoraTalent||0,note:tx('talentInfo'),callback:v=>{state().valoraTalent=v;B.save();}});
 C.valora.forEach((s,i)=>makeStepper(masterPanel,{name:s.name,url:s.img,maxLevel:s.max,value:state().valora[i],note:i===3?'+3,000 / Lv. squad':i===0?'+30,000 / Lv. rally':'Rewards only',callback:v=>{state().valora[i]=v;B.save();}}));
 const previous=masterPanel.parentElement.querySelector('.bear-valora-footer');if(previous)previous.remove();
 const control=document.createElement('div');control.className='bear-valora-footer';
 control.innerHTML='<p class="hint">'+esc(tx('valoraHint'))+'</p><button class="secondary-btn" type="button">'+esc(tx('valoraApply'))+'</button>';
 control.querySelector('button').addEventListener('click',()=>{const v=state().valora[3]*3000;const x=document.getElementById('master');x.value=v;x.dispatchEvent(new Event('input'));});
 masterPanel.after(control);
}
const gearSlots=[
 ['helmet','🐴','Kavallerie · Hut'],['neck','🐴','Kavallerie · Halskette'],
 ['coat','🛡️','Infanterie · Mantel'],['pants','🛡️','Infanterie · Hose'],
 ['ring','🏹','Bogenschützen · Ring'],['staff','🏹','Bogenschützen · Stab']
];
function renderGear(){
 gearPanel.innerHTML='';gearPanel.className='bear-gear-grid';
 gearSlots.forEach(([id,emoji,title])=>{
   const s=state();if(!s.gear[id])s.gear[id]={quality:'none',tier:0,stars:0,charms:[0,0,0]};
   const value=s.gear[id],div=document.createElement('div');div.className='bear-gear-card';
   const head=document.createElement('div');head.className='bear-gear-head';
   head.appendChild(icon(C.govIcon,title));
   head.insertAdjacentHTML('beforeend','<div><b>'+emoji+' '+esc(title)+'</b><small>'+esc(tx('gear'))+'</small></div>');
   div.appendChild(head);
   div.insertAdjacentHTML('beforeend','<div class="bear-gear-settings"><label>'+esc(tx('grade'))+'<select data-f="quality">'+choices([['none','—'],['green','Green'],['blue','Blue'],['purple','Purple'],['gold','Gold'],['red','Red']],value.quality)+'</select></label><label>'+esc(tx('gearTier'))+'<select data-f="tier">'+choices(Array.from({length:7},(_,i)=>[i,i?'T'+i:'–']),value.tier)+'</select></label><label>'+esc(tx('gearStar'))+'<select data-f="stars">'+choices(Array.from({length:4},(_,i)=>[i,i+'★']),value.stars)+'</select></label></div>');
   const charmDiv=document.createElement('div');charmDiv.className='bear-charm-row';
   for(let i=0;i<3;i++){
      const label=document.createElement('label');label.innerHTML='<span>💠 '+(i+1)+'</span><input type="number" min="0" max="22" inputmode="numeric" value="'+max(value.charms?.[i],0,22)+'">';
      label.querySelector('input').addEventListener('change',e=>{state().gear[id].charms[i]=max(e.target.value,0,22);e.target.value=state().gear[id].charms[i];B.save();});
      charmDiv.appendChild(label);
   }
   div.appendChild(charmDiv);
   div.querySelectorAll('select').forEach(select=>select.addEventListener('change',e=>{const f=e.target.dataset.f;state().gear[id][f]=f==='quality'?e.target.value:max(e.target.value,0,f==='tier'?6:3);B.save();}));
   gearPanel.appendChild(div);
 });
}
function renderEditor(){
 if(!validModel())return;
 const s=state(),count=document.getElementById('joinCount'),active=B.active();
 if(count)count.value=s.joinCount;
 if(!joinSelect)return;
 const options=[['',tx('pickEmpty')],...availableHeroes().map(h=>[h.name,h.name])];
 const m=B.model().marches[active];
 const join=joinSelect.querySelector('select');join.innerHTML=choices(options,m?.hero||'');
 joinSelect.hidden=active===0;ownPickers.hidden=active!==0;
 ['pickOwnI','pickOwnC','pickOwnA'].forEach((id,i)=>{document.getElementById(id).innerHTML=choices(options,s.ownHeroes[i]);});
 const help=document.querySelector('.hero-note');if(help)help.textContent=tx('heroInfo');
}
function showForProfile(evt){
 if(!validModel())return;
 const data=evt?.detail||{};
 sourceHeroes=Array.isArray(data.heroes)?data.heroes.map(h=>Object.assign({},h,{stars:Number.isFinite(Number(h.stars))?h.stars:parseInt(String(h.star_label||'').slice(0,1),10),tier:Number((String(h.star_label||'').match(/Tier (\d+)/)||[])[1]||0)})):[];
 // Initial seed from older freeform hero fields, not from assumption of owned heroes.
 state();
 heroBuilder();renderRoster();renderPets();renderValora();renderGear();renderEditor();
}
makeLayout();
B.renderV2=()=>renderEditor();
window.NRW_BEAR_ENHANCE={renderEditor};
window.addEventListener('nrw-bear-loaded',showForProfile);
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>{
 setTimeout(()=>{if(!validModel())return;const heads=container.querySelectorAll('section.panel');
const tKeys=[['heroDeck','heroInfo'],['pets','petsInfo'],['valora','valoraHint'],['gear','gearInfo']];
heads.forEach((panel,i)=>{if(!tKeys[i])return;panel.querySelector('h2 span').textContent=tx(tKeys[i][0]);panel.querySelector('.panel-body>p.hint').textContent=tx(tKeys[i][1]);});
document.querySelector('.bear-march-count>label').textContent=tx('joins');
document.querySelector('.bear-data-note').textContent='✍️ '+tx('manualTroops');
heroBuilder();renderRoster();renderPets();renderValora();renderGear();renderEditor();},0);
}));
})();