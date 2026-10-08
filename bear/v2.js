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
for(const lang of ['de','en','fr'])Object.assign(translations[lang],{"de":{"petBelowTier":"Ab Level 10 ist der erste dokumentierte Skill-Rang erreicht.","petRank":"Skill-Rang","buffAttack":"Truppenangriff","buffLethality":"Tödlichkeit","buffSquad":"Marschkapazität","buffRally":"Rally-Kapazität","buffDefense":"Gegnerische Verteidigung ↓","conditionalBuff":"Wirkung auf Bären-Boss noch nicht bestätigt","rallyOnly":"Nur beim Starten der eigenen Rally","applyBison":"Aktiven Bison-Bonus übernehmen","petDisclaimer":"Automatisch aus dem Tierlevel und der Skill-Rang-Tabelle berechnet (10 Level pro Rang). Tierlevel stammen nicht aus der API. Buffs nur einmal in den Stats berücksichtigen."},"en":{"petBelowTier":"First documented skill rank at pet level 10.","petRank":"Skill rank","buffAttack":"Squad attack","buffLethality":"Lethality","buffSquad":"March capacity","buffRally":"Rally capacity","buffDefense":"Enemy defense ↓","conditionalBuff":"Bear boss interaction not yet verified","rallyOnly":"Only when starting your own rally","applyBison":"Apply active bison bonus","petDisclaimer":"Automatically derived from pet level and skill tier tables (one rank per ten levels). The API does not supply pet levels. Avoid counting active buffs twice."},"fr":{"petBelowTier":"Premier palier documenté au niveau 10.","petRank":"Rang de compétence","buffAttack":"Attaque","buffLethality":"Létalité","buffSquad":"Capacité de marche","buffRally":"Capacité du rallye","buffDefense":"Défense ennemie ↓","conditionalBuff":"Effet sur le boss ours non confirmé","rallyOnly":"Uniquement en lançant ton propre rallye","applyBison":"Appliquer le bonus bison actif","petDisclaimer":"Calculé automatiquement selon le niveau et les paliers de compétence (10 niveaux par rang). Les niveaux ne viennent pas de l'API. Ne compte pas deux fois les bonus."}}[lang]);
for(const lang of ['de','en','fr'])Object.assign(translations[lang],{"de":{"openHeroGallery":"＋ Held hinzufügen","saveHeroCard":"Heldenwerte speichern","petHelp":"Nur Bären-relevante aktive Pet-Fähigkeiten. Trage das Tierlevel ein: Skill-Rang und Buff-Wert werden automatisch ermittelt.","heroShortHelp":"Tippe eine Karte an, um ihre Sterne, das Widget und ihre Fähigkeiten zu bearbeiten. Über + weitere Helden hinzufügen."},"en":{"openHeroGallery":"＋ Add a hero","saveHeroCard":"Save hero stats","petHelp":"Only active pet skills relevant to Bear Trap. Enter the pet level to calculate skill rank and bonus automatically.","heroShortHelp":"Tap a card to edit stars, widget and skills. Use + to add other heroes."},"fr":{"openHeroGallery":"＋ Ajouter un héros","saveHeroCard":"Enregistrer les stats","petHelp":"Uniquement les capacités actives utiles contre l’ours. Saisis le niveau pour calculer automatiquement le rang et le bonus.","heroShortHelp":"Touche une carte pour modifier étoiles, équipement et compétences. Utilise + pour ajouter d’autres héros."}}[lang]);
for(const lang of ['de','en','fr'])Object.assign(translations[lang],{"de":{"troopTierHeading":"Truppenstufen für die Schadensberechnung","troopTierHelp":"Pro Typ T1–T11 und TG0–TG8 wählen. Nicht gesetzte Stufen werden nicht geschätzt.","typeInf":"Infanterie","typeCav":"Kavallerie","typeArch":"Bogenschützen","heroCapacityOverride":"Helden-Marschbonus (optional überschreiben)","heroCapacityNote":"Drei gewählte Helden auf Level 80 liefern automatisch +40.410. Bei anderen Leveln bitte den exakten Spielbonus eingeben.","squadAttack":"Schwadron Angriff %","squadLethality":"Schwadron Tödlichkeit %","squadSeparate":"Nur zusätzlich zählen, wenn NICHT bereits in Truppen-Kampfwerten enthalten","heroGearNote":"Ausrüstung dokumentieren; im Kampfbericht enthaltene Boni nicht doppelt rechnen."},"en":{"troopTierHeading":"Troop tiers for estimated damage","troopTierHelp":"Select T1–T11 and TG0–TG8 per troop type. Missing tiers are not guessed.","typeInf":"Infantry","typeCav":"Cavalry","typeArch":"Archers","heroCapacityOverride":"Hero capacity bonus (optional override)","heroCapacityNote":"Three selected Lv.80 heroes automatically add +40,410. Otherwise enter exact game bonus.","squadAttack":"Squad attack %","squadLethality":"Squad lethality %","squadSeparate":"Add only if NOT included in the per-class battle stats","heroGearNote":"Gear is recorded, but values already included in battle reports must not be counted twice."},"fr":{"troopTierHeading":"Niveaux des troupes","troopTierHelp":"Choisis T1–T11 et TG0–TG8. Aucune valeur manquante n'est inventée.","typeInf":"Infanterie","typeCav":"Cavalerie","typeArch":"Archers","heroCapacityOverride":"Bonus de capacité (facultatif)","heroCapacityNote":"Trois héros sélectionnés de niveau 80 ajoutent automatiquement 40 410.","squadAttack":"Attaque escouade %","squadLethality":"Létalité escouade %","squadSeparate":"Ajouter uniquement si non inclus dans les stats de classe","heroGearNote":"Équipement enregistré sans double comptage des bonus."}}[lang]);
for(const lang of ['de','en','fr'])Object.assign(translations[lang],{
de:{optimizeStart:"Ideale Starter-Formation berechnen",optimizeHint:"Durchsucht alle ganzzahligen Ratios unter deinen Truppen- und Kapazitätsgrenzen. Vorläufige Modell-Prognose, kein garantierter Kingshot-Schaden."},
en:{optimizeStart:"Calculate best starter formation",optimizeHint:"Searches integer ratios using your inventory and capacity. Provisional model estimate, not guaranteed Kingshot damage."},
fr:{optimizeStart:"Calculer la formation de départ",optimizeHint:"Compare les ratios entiers avec tes stocks et ta capacité. Estimation non validée, pas des dégâts garantis."}
}[lang]);
for(const lang of ['de','en','fr'])Object.assign(translations[lang],{de:{pitfall:"Bärenfalle-Forschungsstufe"},en:{pitfall:"Bear Trap level"},fr:{pitfall:"Niveau piège à ours"}}[lang]);
for(const lang of ['de','en','fr'])Object.assign(translations[lang],{de:{buffEnemyHealth:"Gegnerische Gesundheit ↓"},en:{buffEnemyHealth:"Enemy health ↓"},fr:{buffEnemyHealth:"Santé ennemie ↓"}}[lang]);
const tx=k=>(translations[document.documentElement.lang]||translations.en)[k]||k;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const max=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(Number(v)||0)));
const choices=(entries,current)=>entries.map(([value,label])=>'<option value="'+esc(value)+'" '+(String(value)===String(current)?'selected':'')+'>'+esc(label)+'</option>').join('');
const catalogHero=n=>C.heroes.find(h=>h.name===n)||{name:n,img:''};
const catImg=n=>catalogHero(n).img||'';
const validModel=()=>B.profile()&&B.model();
const defaults=()=>({joinCount:0,petLevels:{},petActive:{},petEffects:{},petValues:{},valora:[0,0,0,0],valoraTalent:0,gear:{},manualHeroes:{},ownHeroes:['','',''],troopTiers:[{tier:0,tg:0},{tier:0,tg:0},{tier:0,tg:0}],squadSeparate:false});
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
 if(!Array.isArray(s.troopTiers)||s.troopTiers.length!==3)s.troopTiers=[{tier:0,tg:0},{tier:0,tg:0},{tier:0,tg:0}];
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
 const heroSection=cardSection('🃏','heroDeck','heroShortHelp','heroBuilder');
 const petSection=cardSection('🐾','pets','petHelp','petsVisuals');
 const masterSection=cardSection('🏹','valora','valoraHint','masterVisuals');
 const gearSection=cardSection('🛡','gear','gearInfo','gearVisuals');
 container.append(heroSection,petSection,masterSection,gearSection);
 rosterPanel=heroSection.querySelector('#heroBuilder');
 // One compact panel for imported heroes plus the extra hero picker.
 rosterPanel.before(document.getElementById('heroes'));
 originalHeroPanel.hidden=true;
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
 const optimize=document.createElement('div');optimize.className='bear-optimize-box';
 optimize.innerHTML='<button type="button" class="primary" id="optimizeStarter">⚔️ '+esc(tx('optimizeStart'))+'</button>'+
 '<p class="hint">'+esc(tx('optimizeHint'))+'</p><div id="optimizeResults" class="bear-optimize-results" role="status" aria-live="polite"></div>';
 ownPickers.after(optimize);
 optimize.querySelector('button').addEventListener('click',()=>B.optimizeStarter());
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
 const levelPanel=document.createElement('div');levelPanel.className='bear-troop-tier-wrap';
 levelPanel.innerHTML='<p class="micro">'+esc(tx('troopTierHeading'))+'</p><div class="bear-troop-tier-grid">'+
 ['🛡️','🐴','🏹'].map((emoji,i)=>'<div class="bear-troop-tier-card"><b>'+emoji+' '+esc([tx('typeInf'),tx('typeCav'),tx('typeArch')][i])+'</b>'+
 '<label>T-Stufe<select class="bear-troop-tier" data-idx="'+i+'">'+choices([['0','—'],...Array.from({length:11},(_,j)=>[j+1,'T'+(j+1)])],0)+'</select></label>'+
 '<label>Truegold<select class="bear-troop-tg" data-idx="'+i+'">'+choices(Array.from({length:9},(_,j)=>[j,'TG'+j]),0)+'</select></label></div>').join('')+'</div><p class="hint">'+esc(tx('troopTierHelp'))+'</p>';
 arsenal.querySelector('.buff-row').before(levelPanel);
 levelPanel.querySelectorAll('select').forEach(node=>node.addEventListener('change',()=>{
  const i=Number(node.dataset.idx),obj=state().troopTiers[i];
  if(node.classList.contains('bear-troop-tier'))obj.tier=max(node.value,0,11);
  else obj.tg=max(node.value,0,8);
  B.save();B.render();
 }));
 const extra=document.createElement('div');extra.className='bear-cap-extra';
 extra.innerHTML='<label class="field">'+esc(tx('heroCapacityOverride'))+'<input id="heroCapManual" type="number" min="0" placeholder="Auto 3 × Lv80 = 40410"></label>'+
 '<p class="hint">'+esc(tx('heroCapacityNote'))+'</p>'+
 '<div class="bear-squad-buffs"><label class="field">'+esc(tx('squadAttack'))+'<input id="squadAtk" min="0" step="0.1" type="number" placeholder="275.2"></label>'+
 '<label class="field">'+esc(tx('squadLethality'))+'<input id="squadLet" min="0" step="0.1" type="number" placeholder="60.1"></label>'+
 '<label class="bear-active"><input type="checkbox" id="squadSeparate"> '+esc(tx('squadSeparate'))+'</label></div>'+ 
 '<label class="bear-pitfall">🐻 '+esc(tx('pitfall'))+'<select id="pitfall">'+choices(Array.from({length:6},(_,i)=>[i,'Lv. '+i+' ('+(i*5)+'% ATK)']),0)+'</select></label>';
 levelPanel.after(extra);
 ['heroCapManual','squadAtk','squadLet'].forEach(id=>{
  const field=extra.querySelector('#'+id);
  field.addEventListener('input',()=>{
   if(field.value.trim()==='')delete B.model().values[id];else B.model().values[id]=Math.max(0,Number(field.value)||0);
   B.save();B.render();
  });
 });
 extra.querySelector('#squadSeparate').addEventListener('change',e=>{state().squadSeparate=e.target.checked;B.save();B.render();});
 extra.querySelector('#pitfall').addEventListener('change',e=>{B.model().values.pitfall=Number(e.target.value);B.save();B.render();});
 document.querySelector('.stickers').querySelectorAll('.sticker')[1].textContent='⚔ 1–7 RALLIES';
}

function heroCap(stars){return Number(stars)>=4?5:Math.max(1,Number(stars)+1);}
function heroSteps(stars,tier){
 if(Number(stars)>=5)return 30;
 return Math.max(0,Math.min(29,(Number(stars)||0)*6+Math.max(0,Math.min(5,Number(tier)||0))));
}
function starStepLabel(step){
 step=max(step,0,30);
 if(step===30)return '★★★★★ · MAX';
 const stars=Math.floor(step/6),tier=step%6;
 return '★'.repeat(stars)+'☆'.repeat(5-stars)+(tier?' · T'+tier:'');
}
let selectedHeroName='';
function heroBuilder(){
 // Compact two-stage editor: portraits first, details only after a card is selected.
 const keep=selectedHeroName;
 rosterPanel.innerHTML='<div class="bear-hero-controls"><button type="button" class="secondary-btn" id="showHeroCatalog">'+esc(tx('openHeroGallery'))+'</button><div class="bear-current-count" id="heroCount"></div></div>'+
 '<div class="bear-hero-browser" id="heroBrowser" hidden><input type="search" id="heroSearch" placeholder="'+esc(tx('hero'))+'…"><div id="heroGallery" class="bear-portrait-gallery"></div></div>'+
 '<div id="heroEditor" class="bear-card-editor" hidden>'+
 '<div class="bear-hero-preview"><img id="heroPreviewImage" alt=""><div><b id="heroPreviewName"></b><small>★ NRW HERO CARD</small></div><button type="button" class="bear-editor-close" id="closeHeroEditor" aria-label="Close">✕</button></div>'+
 '<div class="bear-star-progress"><label class="field">'+esc(tx('star'))+'<output id="heroStarDisplay">—</output></label><div class="bear-step-row"><button type="button" id="stepDown">−</button><input type="range" id="heroStarStep" min="0" max="30" step="1" value="0" aria-label="'+esc(tx('star'))+'"><button type="button" id="stepUp">+</button></div><small>4★ T5 → 5★ (MAX)</small></div>'+
 '<div class="bear-hero-basic-fields"><label class="field">'+esc(tx('level'))+'<input id="heroLevel" type="number" min="1" max="80" placeholder="80"></label><label class="field">Widget +<input id="heroWidget" type="number" min="0" max="10"></label></div>'+ 
 '<details class="bear-hero-gear"><summary>🛡️ Hero Gear · 4 Slots</summary><p class="hint">'+esc(tx('heroGearNote'))+'</p><div class="bear-hero-gear-grid">'+[0,1,2,3].map(i=>'<div class="bear-gear-entry"><b>'+(['①','②','③','④'][i])+'</b><label>Qualität<select id="heroGearQuality'+i+'">'+choices([['','—'],['green','Green'],['blue','Blue'],['purple','Purple'],['gold','Gold'],['red','Red']],'')+'</select></label><label>Enhance<input id="heroGearEnhance'+i+'" type="number" min="0" max="200" value="0"></label><label>Refine<input id="heroGearRefine'+i+'" type="number" min="0" max="20" value="0"></label></div>').join('')+'</div></details>'+
 '<details class="bear-skills-advanced"><summary>'+esc(tx('skill'))+' · <span id="skillMaximum"></span></summary>'+
 '<div class="bear-skill-row">'+[1,2,3].map(i=>'<label class="field">'+esc(tx('skill'))+' '+i+'<select id="heroSkill'+i+'"></select></label>').join('')+'</div><p class="hint">'+esc(tx('skillHint'))+'</p></details>'+
 '<div class="bear-hero-actions"><button type="button" class="primary" id="saveHero">'+esc(tx('saveHeroCard'))+'</button><button type="button" class="secondary-btn" id="deleteHero">'+esc(tx('removeHero'))+'</button></div></div>';
 const browser=rosterPanel.querySelector('#heroBrowser'),editor=rosterPanel.querySelector('#heroEditor');
 const selector=rosterPanel.querySelector('#heroStarStep');
 function renderGallery(filter=''){
   const gallery=rosterPanel.querySelector('#heroGallery');gallery.innerHTML='';
   const query=filter.trim().toLocaleLowerCase();
   C.heroes.filter(h=>h.name.toLocaleLowerCase().includes(query)).forEach(h=>{
     const btn=document.createElement('button');btn.type='button';btn.className='bear-portrait-pick';
     btn.appendChild(icon(h.img,h.name));
     const label=document.createElement('span');label.textContent=h.name;btn.appendChild(label);
     btn.addEventListener('click',()=>{browser.hidden=true;openEditor(h.name);});
     gallery.appendChild(btn);
   });
 }
 function skillOptions(h,keepExisting=false){
   const progress=Number(selector.value),stars=Math.floor(progress/6),cap=heroCap(stars),savedSkills=Array.isArray(h?.skills)?h.skills:[];
   rosterPanel.querySelector('#heroStarDisplay').textContent=starStepLabel(progress);
   rosterPanel.querySelector('#skillMaximum').textContent=tx('skillMax')+' '+cap;
   for(let i=1;i<=3;i++){
     const input=rosterPanel.querySelector('#heroSkill'+i);
     const prior=keepExisting?Number(input.value):Number(savedSkills[i-1]||0);
     input.innerHTML=choices(Array.from({length:cap+1},(_,v)=>[v,v===0?tx('notSet'):'Lv. '+v]),Math.min(Math.max(0,prior),cap));
   }
 }
 function openEditor(name){
   selectedHeroName=name;editor.hidden=false;browser.hidden=true;
   const saved=state().manualHeroes[name]||availableHeroes().find(h=>h.name===name)||{};
   rosterPanel.querySelector('#heroPreviewName').textContent=name;
   const portrait=rosterPanel.querySelector('#heroPreviewImage');portrait.src=catImg(name)||saved.icon||'';portrait.alt=name;
   selector.value=heroSteps(saved.stars,saved.tier);
   rosterPanel.querySelector('#heroWidget').value=saved.widget??0;
   rosterPanel.querySelector('#heroLevel').value=saved.level??'';
   for(let i=0;i<4;i++){const g=Array.isArray(saved.gear)?saved.gear[i]||{}:{};
    rosterPanel.querySelector('#heroGearQuality'+i).value=g.quality||'';
    rosterPanel.querySelector('#heroGearEnhance'+i).value=g.enhancement??0;
    rosterPanel.querySelector('#heroGearRefine'+i).value=g.refine??0;
   }
   skillOptions(saved,false);
   const isManual=Boolean(state().manualHeroes[name]);
   rosterPanel.querySelector('#deleteHero').hidden=!isManual;
   editor.scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 rosterPanel.querySelector('#showHeroCatalog').addEventListener('click',()=>{
   const next=browser.hidden;browser.hidden=!next;if(next){renderGallery();rosterPanel.querySelector('#heroSearch').focus();}
 });
 rosterPanel.querySelector('#heroSearch').addEventListener('input',e=>renderGallery(e.target.value));
 rosterPanel.querySelector('#closeHeroEditor').addEventListener('click',()=>{selectedHeroName='';editor.hidden=true;});
 rosterPanel.querySelector('#stepDown').addEventListener('click',()=>{selector.value=max(Number(selector.value)-1,0,30);skillOptions(null,true);});
 rosterPanel.querySelector('#stepUp').addEventListener('click',()=>{selector.value=max(Number(selector.value)+1,0,30);skillOptions(null,true);});
 selector.addEventListener('input',()=>skillOptions(null,true));
 rosterPanel.querySelector('#saveHero').addEventListener('click',()=>{
   if(!selectedHeroName)return;
   const progress=Number(selector.value),stars=Math.floor(progress/6),tier=progress%6;
   state().manualHeroes[selectedHeroName]={
     name:selectedHeroName,stars,tier:stars>=5?0:tier,widget:max(rosterPanel.querySelector('#heroWidget').value,0,10),
     level:max(rosterPanel.querySelector('#heroLevel').value,0,80),
     gear:Array.from({length:4},(_,i)=>({quality:rosterPanel.querySelector('#heroGearQuality'+i).value,enhancement:max(rosterPanel.querySelector('#heroGearEnhance'+i).value,0,200),refine:max(rosterPanel.querySelector('#heroGearRefine'+i).value,0,20)})),
     skills:[1,2,3].map(i=>max(rosterPanel.querySelector('#heroSkill'+i).value,0,5)),source:'manual'
   };
   B.save();renderRoster();renderEditor();
   rosterPanel.querySelector('#deleteHero').hidden=false;
 });
 rosterPanel.querySelector('#deleteHero').addEventListener('click',()=>{
   if(!selectedHeroName)return;
   delete state().manualHeroes[selectedHeroName];B.save();selectedHeroName='';editor.hidden=true;renderRoster();renderEditor();
 });
 if(keep&&availableHeroes().some(h=>h.name===keep))openEditor(keep);
}
function renderRoster(){
 const list=document.getElementById('heroes');list.innerHTML='';
 const heroes=availableHeroes();
 if(!heroes.length){list.innerHTML='<span class="hint">'+esc(tx('addFirst'))+'</span>';return;}
 heroes.forEach(h=>{
   const btn=document.createElement('button');btn.type='button';btn.className='hero-tile bear-character';btn.title=h.name;
   const art=document.createElement('div');art.className='portrait';art.appendChild(icon(catImg(h.name)||h.icon,h.name));btn.appendChild(art);
   const progress=heroSteps(h.stars,h.tier);
   btn.insertAdjacentHTML('beforeend','<b>'+esc(h.name)+'</b><span class="stars">'+esc(starStepLabel(progress))+'</span><small>Lv. '+esc(h.level??'?')+' · Widget +'+esc(h.widget??'?')+'</small>');
   btn.addEventListener('click',()=>{openCurrent(h.name);});
   list.appendChild(btn);
 });
 const count=rosterPanel.querySelector('#heroCount');if(count)count.textContent=heroes.length+' '+tx('heroDeck');
}
function openCurrent(name){
 selectedHeroName=name;
 const btn=rosterPanel.querySelector('#showHeroCatalog');if(!btn)return;
 heroBuilder();
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

function petLevelToRank(level){
 // Pet skill ranks are documented at level-10 advancement milestones.
 return Math.max(0,Math.min(10,Math.floor((Number(level)||0)/10)));
}
function petEffectText(p,level){
 const rank=petLevelToRank(level);
 const skill=p.bearSkill;
 if(!skill)return '';
 if(rank===0)return tx('petBelowTier');
 const value=skill.values[rank-1];
 const unit=skill.unit==='percent'?'%':'';
 return (skill.id.startsWith('enemy_')?'−':'+')+Number(value).toLocaleString(document.documentElement.lang||'de')+unit+' · '+tx('petRank')+' '+rank+'/'+skill.values.length;
}
function renderPets(){
 petPanel.innerHTML='';petPanel.className='bear-art-grid bear-relevant-pets';
 // Only active skills relevant to bear damage or raid size (and one
 // conditional enemy-defense debuff) appear here.
 const relevant=C.pets.filter(p=>p.bearSkill);
 relevant.sort((a,b)=>({
  "Mighty Bison":1,"Giant Rhino":2,"Black Panther":3,"Moose":4,"Great Moose":5,"War Bear":6
 })[a.name]-({
  "Mighty Bison":1,"Giant Rhino":2,"Black Panther":3,"Moose":4,"Great Moose":5,"War Bear":6
 })[b.name]);
 relevant.forEach(p=>{
   const saved=state();
   const existingOld={
     "Black Panther":"pantherLevel",
     "Giant Rhino":"rhinoLevel",
     "Mighty Bison":"bisonLevel",
     "Great Moose":"mooseLevel"
   }[p.name];
   if(saved.petLevels[p.name]===undefined&&existingOld&&Number(B.model().values[existingOld])>0){
     saved.petLevels[p.name]=Number(B.model().values[existingOld]);
   }
   const value=saved.petLevels[p.name]||0;
   const tile=makeStepper(petPanel,{name:p.name,url:p.img,maxLevel:p.maxLevel,value,
    note:p.bearSkill.skill,callback:v=>{
     saved.petLevels[p.name]=v;
     if(existingOld&&document.getElementById(existingOld)){
       B.model().values[existingOld]=v;
       const field=document.getElementById(existingOld);field.value=v;
     }
     updatePetLabel();
     B.save();
    }});
   tile.classList.add('bear-pet-compact');
   const description=document.createElement('div');description.className='bear-pet-effect';
   tile.appendChild(description);
   function updatePetLabel(){
     const level=saved.petLevels[p.name]||0;
     const rank=petLevelToRank(level),skill=p.bearSkill;
     const labels={
       attack:tx('buffAttack'),lethality:tx('buffLethality'),
       squad_capacity:tx('buffSquad'),rally_capacity:tx('buffRally'),
       enemy_defense:tx('buffDefense'),enemy_health:tx('buffEnemyHealth')
     };
     description.innerHTML='<small>'+esc(labels[skill.id]||skill.id)+'</small><strong>'+esc(petEffectText(p,level))+'</strong>'+
      (skill.category==='conditional'?'<small>'+esc(tx('conditionalBuff'))+'</small>':
       skill.category==='rally'?'<small>'+esc(tx('rallyOnly'))+'</small>':'');
     const button=tile.querySelector('.bear-apply-bison');
     if(button)button.disabled=!(saved.petActive[p.name]&&rank>0);
   }
   const label=document.createElement('label');label.className='bear-active';
   label.innerHTML='<input type="checkbox"> '+esc(tx('petActive'));
   const checkbox=label.querySelector('input');
   checkbox.checked=Boolean(saved.petActive[p.name]);
   checkbox.addEventListener('change',e=>{saved.petActive[p.name]=e.target.checked;B.save();updatePetLabel();});
   tile.appendChild(label);
   if(p.name==='Mighty Bison'){
     const apply=document.createElement('button');apply.type='button';apply.className='secondary-btn bear-apply-bison';
     apply.textContent=tx('applyBison');
     apply.addEventListener('click',()=>{
       if(!saved.petActive[p.name])return;
       const rank=petLevelToRank(saved.petLevels[p.name]||0);
       const v=rank?p.bearSkill.values[rank-1]:0;
       const input=document.getElementById('pet');input.value=v;input.dispatchEvent(new Event('input'));
     });
     tile.appendChild(apply);
   }
   updatePetLabel();
 });
 let footer=petPanel.parentElement.querySelector('.bear-pet-footnote');if(!footer){footer=document.createElement('p');footer.className='hint bear-pet-footnote';petPanel.after(footer);}footer.textContent=tx('petDisclaimer');
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
 joinSelect.hidden=active===0;ownPickers.hidden=active!==0 && !ownPickers.closest('#uxQuickStart');
 const optimize=document.querySelector('.bear-optimize-box');if(optimize)optimize.hidden=active!==0 && !optimize.closest('#uxQuickStart');
 ['pickOwnI','pickOwnC','pickOwnA'].forEach((id,i)=>{
   const troopType=['infantry','cavalry','archer'][i];
   const allowed=[['',tx('pickEmpty')],...availableHeroes().filter(h=>C.heroTypes[h.name]===troopType).map(h=>[h.name,h.name])];
   if(s.ownHeroes[i]&&!allowed.some(([n])=>n===s.ownHeroes[i])){s.ownHeroes[i]='';B.save();}
   document.getElementById(id).innerHTML=choices(allowed,s.ownHeroes[i]);
 });
 const help=document.querySelector('.hero-note');if(help)help.textContent=tx('heroShortHelp');
}
function showForProfile(evt){
 if(!validModel())return;
 const data=evt?.detail||{};
 selectedHeroName='';
 sourceHeroes=Array.isArray(data.heroes)?data.heroes.map(h=>Object.assign({},h,{stars:Number.isFinite(Number(h.stars))?h.stars:parseInt(String(h.star_label||'').slice(0,1),10),tier:Number((String(h.star_label||'').match(/Tier (\d+)/)||[])[1]||0)})):[];
 state().heroesLevelCache=Object.fromEntries(sourceHeroes.map(h=>[h.name,{level:h.level}]));
 // Initial seed from older freeform hero fields, not from assumption of owned heroes.
 state();
 heroBuilder();renderRoster();renderPets();renderValora();renderGear();renderEditor();
 const v=state();
 document.querySelectorAll('.bear-troop-tier').forEach(x=>x.value=v.troopTiers[Number(x.dataset.idx)].tier);
 document.querySelectorAll('.bear-troop-tg').forEach(x=>x.value=v.troopTiers[Number(x.dataset.idx)].tg);
 const box=document.getElementById('squadSeparate');if(box)box.checked=Boolean(v.squadSeparate);
 ['heroCapManual','squadAtk','squadLet'].forEach(id=>{const x=document.getElementById(id);if(x)x.value=Object.prototype.hasOwnProperty.call(B.model().values,id)?B.model().values[id]:'';});
 const pitfall=document.getElementById('pitfall');if(pitfall)pitfall.value=B.model().values.pitfall??0;
}
makeLayout();
B.renderV2=()=>renderEditor();
window.NRW_BEAR_ENHANCE={renderEditor};
window.addEventListener('nrw-bear-loaded',showForProfile);
document.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click',()=>{
 setTimeout(()=>{if(!validModel())return;const heads=container.querySelectorAll('section.panel');
const tKeys=[['heroDeck','heroShortHelp'],['pets','petHelp'],['valora','valoraHint'],['gear','gearInfo']];
heads.forEach((panel,i)=>{if(!tKeys[i])return;panel.querySelector('h2 span').textContent=tx(tKeys[i][0]);panel.querySelector('.panel-body>p.hint').textContent=tx(tKeys[i][1]);});
document.querySelector('.bear-march-count>label').textContent=tx('joins');
document.querySelector('.bear-data-note').textContent='✍️ '+tx('manualTroops');
heroBuilder();renderRoster();renderPets();renderValora();renderGear();renderEditor();},0);
}));
})();