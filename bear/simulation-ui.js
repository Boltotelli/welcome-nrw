/* Guided step 10: interactive, local-only Bear damage-index comparison.
 * Adjust starter, ALL joins, or any single join; instantly reallocate one
 * shared troop inventory. No stored hero/formation changes are overwritten.
 * The original 5-second transparent animation is expected at
 * assets/kingshot_beartrap_v3_action_transparent.webm (WebP fallback);
 * until those binary files are provided, a textual loading fallback shows.
 */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
function el(tag,cls,text){
 const x=document.createElement(tag);if(cls)x.className=cls;
 if(text!==undefined)x.textContent=text;
 return x;
}
function mount(host,B,language){
 const L={
 de:{title:'🐻 Schadenssimulation',desc:'Probiere Formationen aus. Dein gemeinsamer Truppenbestand bleibt immer die Obergrenze.',
  target:'Marsch ändern',starter:'★ Eigene Rally',all:'Alle Joins gemeinsam',join:'Join',
  preset:'Vorlage',i:'Infanterie %',c:'Kavallerie %',a:'Bogenschützen %',
  custom:'Manuell',reset:'Optimierte Formation wiederherstellen',save:'Variante vergleichen',
  baseline:'Empfehlung',comparison:'Gespeicherte Varianten',load:'Übernehmen',
  head:'Relativer Formationsvergleich',own:'Starter · relativ zur Empfehlung',joins:'Joins · relativer Stellvertreter',overall:'Keine vergleichbare Schadenssumme',
  stocks:'Truppenverbrauch',free:'übrig',assigned:'eingesetzt',total:'Truppen',
  results:'Auswirkungen je Marsch',desired:'Gewünscht',actual:'Tatsächlich',
  adapted:'Wegen des gemeinsamen Truppenbestands musste mindestens eine Wunschverteilung angepasst werden.',
  pending:'Für den Schadensvergleich fehlen vollständige Kampfwerte oder gültige Truppenstufen. Die tatsächlichen Truppenzahlen werden trotzdem geprüft.',
  uncertain:'Dies sind relative Modellwerte, keine vorhergesagten Bärenpunkte. Für fremde Join-Rallys fehlen die Kampfwerte ihrer Leader; deine Klassenwerte dienen nur als Vergleichsannahme. Helden-Procs und Widgets sind nicht vollständig simuliert.',
  missing:'Zuerst müssen Kapazität, Starter und Truppenbestand vollständig erfasst sein.',
  invalid:'Nur ganze Prozentwerte zwischen 0 und 100 sind zulässig, zusammen höchstens 100.',
  loader:'Bärenkampf wird simuliert …',unassigned:'Joins ohne passenden linken Helden erhalten keine Truppen.', versus:'gegenüber Empfehlung',
  noVideo:'Ladeanimation wird nach Bereitstellung der Originaldatei eingeblendet'},
 en:{title:'🐻 Damage simulation',desc:'Try different lineups. All marches share one real troop inventory.',
  target:'Change march',starter:'★ Own rally',all:'All joins together',join:'Join',
  preset:'Preset',i:'Infantry %',c:'Cavalry %',a:'Archers %',
  custom:'Custom',reset:'Restore optimized formation',save:'Save comparison',
  baseline:'Recommendation',comparison:'Saved comparisons',load:'Restore',
  head:'Relative formation comparison',own:'Starter · vs recommended',joins:'Joins · relative proxy',overall:'No comparable absolute total',
  stocks:'Troop usage',free:'remaining',assigned:'assigned',total:'troops',
  results:'Effects by march',desired:'Requested',actual:'Actual',
  adapted:'At least one requested formation was adjusted to fit the shared troop inventory.',
  pending:'Combat stats or troop tier data are incomplete. Troop totals are validated, but damage comparisons cannot be calculated yet.',
  uncertain:'These are RELATIVE model values, not predicted Bear points. Other join leaders’ stats are unknown; your class bonuses are only a proxy. Hero procs and widgets are not fully simulated.',
  missing:'Enter capacity, starter heroes and troops before simulating.',
  invalid:'Use whole percentages from 0 to 100 that sum to no more than 100.',
  loader:'Simulating Bear fight …',unassigned:'Joins without suitable left-slot leaders receive no troops.',versus:'vs recommendation',
  noVideo:'The approved loading animation will appear after its original file is supplied'},
 fr:{title:'🐻 Simulation des dégâts',desc:'Teste plusieurs formations. Toutes les marches partagent les mêmes troupes.',
  target:'Marche à modifier',starter:'★ Mon rallye',all:'Tous les renforts',join:'Renfort',
  preset:'Préréglage',i:'Infanterie %',c:'Cavalerie %',a:'Archers %',
  custom:'Personnalisé',reset:'Rétablir la formation optimisée',save:'Mémoriser',
  baseline:'Recommandation',comparison:'Variantes comparées',load:'Appliquer',
  head:'Comparaison relative des formations',own:'Départ · relatif à la recommandation',joins:'Renforts · indice relatif',overall:'Aucun total de dégâts absolus',
  stocks:'Troupes utilisées',free:'restantes',assigned:'affectées',total:'troupes',
  results:'Détails par marche',desired:'Demandé',actual:'Réel',
  adapted:'Certaines répartitions ont été adaptées au stock commun.',
  pending:'Il manque des statistiques ou des niveaux de troupes. Les quantités restent vérifiées.',
  uncertain:'Indices RELATIFS, pas des points Ours garantis. Les statistiques des chefs des renforts sont inconnues; les bonus de classe servent de référence. Les effets aléatoires ne sont pas entièrement simulés.',
  missing:'Saisis capacité, héros et troupes avant de simuler.',
  invalid:'Uniquement des pourcentages entiers de 0 à 100 avec une somme maximale de 100.',
  loader:'Simulation de l’ours …',unassigned:'Les renforts sans héros offensif ne reçoivent pas de troupes.',versus:'par rapport à la recommandation',
  noVideo:'L’animation approuvée sera affichée après réception du fichier'}
 };
 const t=()=>L[language()]||L.en,fmt=n=>Number(n||0).toLocaleString(language()==='de'?'de-DE':language()==='fr'?'fr-FR':'en-US',{maximumFractionDigits:0});
 const sim=root.NRW_BEAR_SIMULATION;
 const container=el('div','bear-sim-page');host.append(container);
 const heading=el('h2'),desc=el('p','hint');
 container.append(heading,desc);
 const controls=el('section','bear-sim-controls');container.append(controls);
 const row=el('div','bear-sim-controls-row');controls.append(row);
 const targetLabel=el('label');const targetText=el('span');targetLabel.append(targetText);
 const target=el('select');target.id='bearSimTarget';targetLabel.append(target);row.append(targetLabel);
 const presetLabel=el('label');const presetText=el('span');presetLabel.append(presetText);
 const preset=el('select');preset.id='bearSimPreset';presetLabel.append(preset);row.append(presetLabel);
 const nums=el('div','bear-sim-numbers');controls.append(nums);
 const fields=[];
 for(let k=0;k<3;k++){
  const label=el('label'),name=el('span');label.append(name);
  const input=el('input');input.type='number';input.min='0';input.max='100';input.step='1';
  input.inputMode='numeric';input.id='bearSimRatio'+k;if(k===2){input.readOnly=true;input.tabIndex=-1;}
  label.append(input);nums.append(label);fields.push({input,name});
 }
 const error=el('p','bear-sim-error');error.setAttribute('role','alert');controls.append(error);
 const actions=el('div','bear-sim-actions');controls.append(actions);
 const reset=el('button','secondary-btn'),save=el('button','secondary-btn');reset.type=save.type='button';actions.append(reset,save);
 const loader=el('div','bear-sim-loader');loader.setAttribute('role','status');loader.setAttribute('aria-live','polite');
 const ring=el('div','bear-sim-fallback');ring.textContent='🐻';
 const video=el('video','bear-sim-video');video.autoplay=true;video.muted=true;video.loop=true;video.playsInline=true;video.preload='metadata';
 video.style.display='none';
 const webm=el('source');webm.src='./assets/kingshot_beartrap_v3_action_transparent.webm';webm.type='video/webm';video.append(webm);
 video.addEventListener('canplay',()=>{video.style.display='block';ring.hidden=true;video.play().catch(()=>{});});
 video.addEventListener('error',()=>{video.style.display='none';ring.hidden=false;});
 webm.addEventListener('error',()=>{video.style.display='none';ring.hidden=!image.hidden;});
 // The previously produced WebP is a fallback for browsers without WebM.
 const image=el('img','bear-sim-webp');
 image.src='./assets/kingshot_beartrap_v3_action_transparent.webp';
 image.alt='';image.hidden=true;
 image.addEventListener('load',()=>{if(video.style.display==='none'){image.hidden=false;ring.hidden=true;}});
 image.addEventListener('error',()=>{image.hidden=true;ring.hidden=video.style.display!=='none';});
 loader.append(video,image,ring,el('p','',t().loader));container.append(loader);
 const panel=el('div','bear-sim-results');container.append(panel);
 const compared=el('section','bear-sim-comparisons');container.append(compared);
 let base=null,ratios=[],comparisons=[],loadingVersion=0,inputVersion=0,previousSnapshot='';
 let last=null;
 function output(text){error.textContent=text||'';error.hidden=!text;}
 function cur(){
  const choice=target.value;
  const index=choice==='all'?1:Number(choice);
  return ratios[index]||ratios[0]||[0,0];
 }
 function fillInputs(){
  const [inf,cav]=cur();fields[0].input.value=inf;fields[1].input.value=cav;fields[2].input.value=100-inf-cav;
  const chosen=sim.PRESETS.find(p=>p.ratios&&p.ratios[0]===inf&&p.ratios[1]===cav);
  preset.value=chosen?.id||'custom';
 }
 function setRatios(newRatio){
  const copy=newRatio.slice(),pick=target.value;
  if(pick==='all'){for(let i=1;i<ratios.length;i++)ratios[i]=copy.slice();}
  else ratios[Number(pick)||0]=copy;
  fillInputs();schedule(600);
 }
 function takeInputs(){
  const values=fields.slice(0,2).map(x=>x.input.value);
  if(values.some(s=>!/^\d{1,3}$/.test(s)))return output(t().invalid);
  const pair=values.map(Number);if(!sim.ratioValid(pair))return output(t().invalid);
  output('');
  const choice=target.value;
  if(choice==='all'){for(let i=1;i<ratios.length;i++)ratios[i]=pair.slice();}
  else ratios[Number(choice)||0]=pair.slice();
  // Preserve the active input/caret while the user types two digits.
  fields[2].input.value=100-pair[0]-pair[1];
  const known=sim.PRESETS.find(p=>p.ratios&&p.ratios[0]===pair[0]&&p.ratios[1]===pair[1]);
  preset.value=known?.id||'custom';
  schedule(600);
 }
 let debounce;
 function schedule(wait=400){
  clearTimeout(debounce);debounce=setTimeout(()=>rerun(wait),260);
 }
 function showLoader(){
  loader.hidden=false;panel.hidden=true;ring.hidden=video.style.display!=='none'||!image.hidden;
  const p=loader.querySelector('p');if(p)p.textContent=t().loader;
 }
 function rerun(wait){
  if(!base)return;
  const v=++loadingVersion;
  showLoader();
  // Real computation happens after the busy state has been drawn. Keep the
  // animation visible briefly; no long artificial wait on every keypress.
  setTimeout(()=>{
   if(v!==loadingVersion)return;
   const result=sim.evaluate(base,B.model(),root.NRW_BEAR_COMBAT,root.NRW_BEAR_FORMATION,ratios);
   if(v!==loadingVersion)return;
   last=result;renderResult(result);
   loader.hidden=true;panel.hidden=false;
  },Math.max(400,Number(wait)||400));
 }
 function translate(){
  heading.textContent=t().title;desc.textContent=t().desc;
  targetText.textContent=t().target;presetText.textContent=t().preset;
  [t().i,t().c,t().a].forEach((s,i)=>fields[i].name.textContent=s);
  reset.textContent='↶ '+t().reset;save.textContent='＋ '+t().save;

  target.replaceChildren();
  function option(value,name){const o=el('option','',name);o.value=String(value);target.append(o);}
  option('0',t().starter);
  if(base?.marches.length>2)option('all',t().all);
  for(let i=1;i<(base?.marches.length||0);i++)option(String(i),t().join+' '+i);
  preset.replaceChildren();
  for(const p of sim.PRESETS){const o=el('option','',p.label);o.value=p.id;preset.append(o);}
  const manual=el('option','',t().custom);manual.value='custom';preset.append(manual);
 }
 function metric(label,value,delta){
  const item=el('div','bear-sim-metric');item.append(el('small','',label),el('strong','',value));
  if(delta!==null&&delta!==undefined&&Number.isFinite(delta)){
   const sign=delta>0?'+':'',tag=el('span','bear-sim-delta'+(delta>0?' positive':delta<0?' negative':''),
    sign+delta.toFixed(2)+'% '+t().versus);item.append(tag);
  }
  return item;
 }
 function scoreText(v){return v===null||v===undefined?'—':fmt(Math.round(v));}
 function calculateOwn(row){
  return root.NRW_BEAR_OWN_BASELINE?.calculate(B.model(),row,root.NRW_BEAR_COMBAT,root.NRW_BEAR_HERO_REFERENCE);
 }
 function renderOwnBaseline(data){
  const own=calculateOwn(data.rows[0]);
  const previous=calculateOwn(base.marches[0].troops);
  const l=language();
  const title=l==='de'?'Grundschaden – eigene Rally (ohne Joiner)':
   l==='fr'?'Dégâts de base – mon rallye sans renforts':'Own-rally base damage – no joining skills';
  const card=el('section','bear-sim-scenarios');
  card.append(el('h3','',title));
  if(!own?.ready){
   card.append(el('p','hint',l==='de'?'Für das Grundmodell fehlen Truppenstufen oder Kampfwerte.':
    l==='fr'?'Données de combat incomplètes.':'Troop tiers or combat stats are incomplete.'));
   panel.append(card);return;
  }
  const make=(label,value)=>{const child=el('div','bear-sim-scenario');
   child.append(el('span','',label),el('strong','',scoreText(value)));return child;};
  const group=el('div','bear-sim-scenario-grid');
  group.append(make(l==='de'?'Nur Truppen + erfasste Stats':
    l==='fr'?'Troupes et stats relevées':'Troops and captured stats',own.withoutAbilitiesIndex));
  group.append(make(l==='de'?'Mit belegten festen Starter- und Widget-Fähigkeiten':
    l==='fr'?'Avec les capacités fixes documentées':'With verified fixed starter and widget abilities',own.modelIndex));
  card.append(group);
  // Expose every value that actually reaches the soldier formula. No hidden
  // calibration, guessed profile stats or total rally damage.
  const trace=own.troopBreakdown;
  if(trace){
   const details=el('details','bear-sim-math-audit');
   const summary=el('summary','',
    l==='de'?'Rechenweg prüfen · Truppen / Angriff / Tödlichkeit':
    l==='fr'?'Contrôler le calcul et les statistiques utilisées':
    'Inspect exact troop / attack / lethality values used');
   details.append(summary);
   const trapLabel=l==='de'?'Bärenfalle fix: Lv 5 = +25 Prozentpunkte Angriff':
    l==='fr'?'Piège fixé au niveau 5 = +25 points d’attaque':
    'Pitfall fixed at Lv5 = +25 ATTACK percentage points';
   details.append(el('p','hint',trapLabel));
   const statSource=own.assembledStats?.origin||{mode:'combined-report',reason:'unknown'};
   const provenance=el('label','bear-stat-origin');
   const sourceText=el('span','',
    l==='de'?'Herkunft der sechs Klassenwerte:':
    l==='fr'?'Provenance des six statistiques de classe :':'Source of six class stats:');
   const source=el('select');
   const modes=[
    ['',l==='de'?'Automatisch erkennen':l==='fr'?'Détection automatique':'Auto detect'],
    ['separate-overview',l==='de'?'Bonusübersicht · Werte getrennt':
     l==='fr'?'Bonus séparés':'Bonus overview · separate components'],
    ['combined-report',l==='de'?'Kampfbericht · bereits zusammengefasst':
     l==='fr'?'Rapport · valeurs combinées':'Battle report · already combined']
   ];
   for(const [value,label] of modes){const opt=el('option','',label);opt.value=value;source.append(opt);}
   source.value=B.model().v2?.combatStatOrigin||'';
   source.addEventListener('change',()=>{
    const model=B.model();model.v2=model.v2||{};
    if(source.value)model.v2.combatStatOrigin=source.value;
    else delete model.v2.combatStatOrigin;
    B.save();
    rerun(400);
   });
   provenance.append(sourceText,source);details.append(provenance);
   details.append(el('p','hint',
    (l==='de'?'Aktuell berechnet: ':l==='fr'?'Mode actif : ':'Using: ')+
    (statSource.mode==='separate-overview'?
     (l==='de'?'Klassenbonus + Schwadron + Starterheld':
      'Class + squad + own starter'):
     (l==='de'?'Bereits zusammengefasste Klassenwerte':'Combined class stats'))+
    (statSource.reason==='component-exceeds-class-total'?
     (l==='de'?' (aus deinen gespeicherten Einzelwerten erkannt)':' (inferred from saved components)'):'')
   ));
   const pre=el('div','bear-sim-math-grid');
   const names=l==='de'?['Infanterie','Kavallerie','Bogenschützen']:
    l==='fr'?['Infanterie','Cavalerie','Archers']:['Infantry','Cavalry','Archers'];
   trace.types.forEach((type,i)=>{
    const p=el('div','bear-sim-math-type');
    p.append(el('strong','',names[i]+' · T'+type.tier+' TG'+type.tg));
    const num=n=>fmt(n);
    p.append(el('span','',num(type.count)+' '+
     (l==='de'?'Soldaten · Grundangriff':'troops · base ATK')+' '+num(type.baseAttack)));
    const components=own.assembledStats?.totals?.[i];
    if(components){
     const value=x=>x===null||x===undefined?'—':Number(x).toFixed(1)+'%';
     p.append(el('span','',
      (l==='de'?'ATK: Klasse ':'ATK: class ')+value(components.Atk.classPct)+
      ' + '+(l==='de'?'Schwadron ':'squad ')+value(components.Atk.squadPct)+
      ' + '+(l==='de'?'Held ':'hero ')+value(components.Atk.heroPct)));
     p.append(el('span','',
      (l==='de'?'LET: Klasse ':'LET: class ')+value(components.Let.classPct)+
      ' + '+(l==='de'?'Schwadron ':'squad ')+value(components.Let.squadPct)+
      ' + '+(l==='de'?'Held ':'hero ')+value(components.Let.heroPct)));
    }
    p.append(el('span','',
     (l==='de'?'Verwendeter Gesamtwert: ATK ':'Effective combined ATK ')+
     type.capturedAttackPct.toFixed(1)+' % · '+
     (l==='de'?'Tödlichkeit ':'Lethality ')+type.lethalityPct.toFixed(1)+' %'));
    p.append(el('span','',
     (l==='de'?'Effektiver ATK-Wert inkl. Bärenfalle: ':
      'Effective ATK including Pitfall: ')+type.appliedAttackPct.toFixed(1)+' %'));
    p.append(el('small','',
     (l==='de'?'10-Runden-Anteil (Index): ':'10-round share (index): ')+
     num(type.damageTenRounds)));
    pre.append(p);
   });
   details.append(pre);
   details.append(el('p','hint',
    (l==='de'?'Starter-Soldaten gesamt: ':'Starter troops total: ')+
     fmt(trace.totalTroops)+' · '+
     (l==='de'?'Truppenschaden vor festen Fähigkeiten: ':
      'Base before fixed abilities: ')+
     scoreText(trace.totalTenRounds)));
   details.append(el('p','hint',l==='de'?
    'Wenn diese ATK-/Tödlichkeitswerte niedriger als im anderen Rechner sind, ist die Eingabe/Erkennung der Kampfwerte die Ursache. Die Werte werden hier nur angezeigt, nicht verändert.':
    'If these ATK/Lethality values differ from the comparison calculator, inspect the original screenshot import. No data is changed here.'));
   card.append(details);
  }
  const extra=root.NRW_BEAR_OWN_BASELINE?.inspectUnusedBonuses?.(
   B.model(),data.rows[0],root.NRW_BEAR_COMBAT);
  if(extra){
   const notes=el('details','bear-sim-math-audit');
   const title=l==='de'?'Kampfwerte vergleichen · Schwadron & 3 Starterhelden':
    l==='fr'?'Comparer les valeurs de classe, escouade et héros':
    'Compare component stats for squad and starters';
   notes.append(el('summary','',title));
   const explain=l==='de'?
    'Der Rechner verwendet jetzt die durch die Quelle bestätigte Zusammenführung. Die vier Varianten darunter zeigen den Unterschied zu anderen Interpretationen; sie verändern dein Profil nicht.':
    l==='fr'?
    'Le calcul actif compose les bonus selon la provenance. Les variantes sont des comparaisons sans modification.':
    'The active calculation uses the source-appropriate composition. The four variants only compare alternative interpretations, without changing your profile.';
   notes.append(el('p','hint',explain));
   const num=x=>x===null?'—':Number(x).toFixed(1)+'%';
   const squadLine=(l==='de'?'Schwadron – Angriff: ':'Squad ATK: ')+
    num(extra.squadAttackPct)+' · '+(l==='de'?'Tödlichkeit: ':'Lethality: ')+
    num(extra.squadLethalityPct)+' · '+
    (extra.origin.mode==='separate-overview'?
     (l==='de'?'wird zusammengeführt':'added once'):
     (l==='de'?'Klassenwerte bereits kombiniert':'class totals already include bonuses'));
   notes.append(el('p','hint',squadLine));
   const classes=l==='de'?['Infanterie','Kavallerie','Bogenschützen']:
    l==='fr'?['Infanterie','Cavalerie','Archers']:['Infantry','Cavalry','Archers'];
   for(const [i,h] of extra.heroes.entries()){
    notes.append(el('p','hint',(h.name||classes[i])+' · '+classes[i]+
     ' · '+(l==='de'?'Expedition-ATK ':'Expedition ATK ')+num(h.attackPct)+
     ' · '+(l==='de'?'Tödlichkeit ':'Lethality ')+num(h.lethalityPct)));
   }
   const hasSquad=!extra.squadAlreadyApplied&&
    (extra.squadAttackPct!==null&&extra.squadAttackPct>0||
     extra.squadLethalityPct!==null&&extra.squadLethalityPct>0);
   const hasHeroes=extra.heroes.some(h=>h.attackPct!==null||h.lethalityPct!==null);
   if(hasSquad||hasHeroes){
    const group=el('div','bear-sim-scenario-grid');
    const score=extra.hypotheticals;
    const scenarios=[
     [l==='de'?'Nur Klassenwerte':'Class values only',score.current],
     [l==='de'?'Klasse + Schwadron':'Class + squad',score.withSquad],
     [l==='de'?'Klasse + Helden':'Class + starter heroes',score.withHeroes],
     [l==='de'?'Klasse + beide':'Class + both',score.withBoth]
    ];
    for(const [label,value] of scenarios){
     const x=el('div','bear-sim-scenario');
     x.append(el('span','',label),el('strong','',scoreText(value)));
     group.append(x);
    }
    notes.append(group);
   }
   notes.append(el('p','hint',
    (l==='de'?'Für deine Quelle angewendeter Truppenschaden (vor Spezialfähigkeiten): ':
     'Source-selected base damage (before special abilities): ')+scoreText(extra.hypotheticals.applied)));
   notes.append(el('p','bear-sim-disclaimer',l==='de'?
    'Die Vergleichswerte sind Modellindizes, keine garantierten Kingshot-Schadenspunkte. Entscheidend ist nur die anhand der Quelle ausgewählte Berechnung, damit Boni nicht doppelt zählen.':
    'These are model indices, not guaranteed game points. Only the source-selected composition is applied to prevent double counting.'));
   card.append(notes);
  }
  if(previous?.ready&&previous.modelIndex>0){
   const delta=100*(own.modelIndex/previous.modelIndex-1);
   card.append(el('p','hint',(delta>=0?'+':'')+delta.toFixed(2)+'% '+
    (l==='de'?'gegenüber der vorgeschlagenen Starter-Formation':
     l==='fr'?'par rapport à la formation de départ recommandée':'vs recommended starter lineup')));
  }
  if(own.assembledStats?.origin.mode==='separate-overview'&&
     own.assembledStats?.missing?.length){
   card.append(el('p','bear-guide-needed',
    (l==='de'?'In den getrennten Bonuswerten fehlen noch: ':
     l==='fr'?'Bonus séparés manquants : ':'Missing separately captured bonuses: ')+
    own.assembledStats.missing.join(' · ')));
  }
  for(const fx of own.included)card.append(el('p','hint',
   fx.hero+' · '+fx.skill+' Lv'+fx.level+': +'+fx.effectiveBonusPct.toFixed(1)+'% '+
    (fx.kind==='fixed-enemy-damage-taken'?
     (l==='de'?'feste Erhöhung des erlittenen Schadens':'fixed enemy damage taken'):
     (l==='de'?'fester Zusatzschlag-Anteil':'fixed extra-strike contribution'))));
  for(const w of own.widgets)card.append(el('p','hint',
   w.name+' · '+w.skillName+' (Widget '+w.widgetLevel+'): '+
   (w.type==='defense-only'?'0%':w.bonusPct+'% '+
    (w.type==='rally-attack'?'Rally-Angriff':'Rally-Tödlichkeit'))));
  if(own.missing.length||own.unmodeled.length){
   card.append(el('p','bear-guide-needed',
    (l==='de'?'Nicht vollständig modelliert: ':l==='fr'?'Effets incomplets : ':'Not fully modeled: ')+
    [...own.missing,...own.unmodeled].join(' · ')));
  }
  card.append(el('p','bear-sim-disclaimer',l==='de'?
   'Die Werte sind Modellindizes, KEINE garantierten oder in Millionen prognostizierten Bärenpunkte. Zufällige Helden-Procs und alle Joiner-Skills sind ausgeschlossen; passive Helden-/Widget-Stats werden nicht nochmals addiert. Der angezeigte Schaden kann vom Spiel abweichen.':
   l==='fr'?'Indices de modèle seulement, pas de dégâts garantis. Aucun effet aléatoire, renfort ou statistique de héros doublée.':
   'MODEL INDICES only, not guaranteed in-game damage or predicted millions. Chance skills and all joining skills excluded; passive hero and widget stats not added twice.'));
  panel.append(card);
 }
 function renderResult(data){
  panel.replaceChildren();
  if(!data.ready){panel.append(el('p','bear-guide-needed',data.reason==='invalid-percentages'?t().invalid:t().missing));return;}
  const scores=el('section','bear-sim-score-card');
  scores.append(el('h3','',t().head));
  const trio=el('div','bear-sim-metrics');
  // Relative indices normalised to each role's original formation.
  // Never mistake raw model values for actual Kingshot Bear damage points.
  const ownCurrent=calculateOwn(data.rows[0]);
  const ownOriginal=calculateOwn(base.marches[0].troops);
  const ownPct=ownCurrent?.ready&&ownOriginal?.ready&&ownOriginal.modelIndex>0?
   100*ownCurrent.modelIndex/ownOriginal.modelIndex:null;
  const joinPct=data.score&&data.reference?.joinProxy?
   100*data.score.joinProxy/data.reference.joinProxy:null;
  trio.append(metric(t().own,ownPct===null?'—':ownPct.toFixed(2)+' %',
   ownPct===null?null:ownPct-100),
   metric(t().joins,joinPct===null?'—':joinPct.toFixed(2)+' %',data.changes?.joinPct));
  scores.append(trio);panel.append(scores);
  // Join scores are relative PROXIES from foreign-leader contexts and
  // cannot be summed meaningfully with personal starter scores.
  renderOwnBaseline(data);
  if(!data.score)panel.append(el('p','bear-guide-needed',t().pending));
  if(data.limited)panel.append(el('p','bear-guide-needed',t().adapted));
  if(data.missingLeads)panel.append(el('p','hint',t().unassigned));
  const usage=el('section','bear-sim-usage');usage.append(el('h3','',t().stocks));
  const names=language()==='de'?['Infanterie','Kavallerie','Bogenschützen']:
   language()==='fr'?['Infanterie','Cavalerie','Archers']:['Infantry','Cavalry','Archers'];
  for(let k=0;k<3;k++){
   const label=el('div','bear-sim-usage-label');label.append(el('span','',names[k]),
    el('strong','',fmt(data.used[k])+' / '+fmt(data.stock[k])+' · '+fmt(data.left[k])+' '+t().free));
   const track=el('div','bear-sim-bar');const fill=el('div','bear-sim-fill kind-'+k);
   fill.style.width=(data.stock[k]?100*data.used[k]/data.stock[k]:0)+'%';track.append(fill);
   usage.append(label,track);
  }
  panel.append(usage);
  const out=el('section','bear-sim-marches');out.append(el('h3','',t().results));
  for(const m of data.measures){
   const item=el('div','bear-sim-march-row');
   item.append(el('strong','',m.slot===0?t().starter:t().join+' '+m.slot));
   const details=el('div');
   const ratio=x=>x.join(' / ');
   details.append(el('span','',t().desired+': '+ratio(m.desired)+'%'));
   details.append(el('span','',t().actual+': '+ratio(m.actual)+'%'));
   details.append(el('small','',fmt(m.filled)+' / '+fmt(m.cap)+' '+t().total));
   item.append(details);out.append(item);
  }
  panel.append(out,el('p','bear-sim-disclaimer',t().uncertain));
  renderComparisons();
 }
 function renderComparisons(){
  compared.replaceChildren();compared.append(el('h3','',t().comparison));
  function line(name,measure,onRestore){
   const box=el('div','bear-sim-comparison');
   const ownCalc=measure?.ready?calculateOwn(measure.rows[0]):null;
   const original=base?calculateOwn(base.marches[0].troops):null;
   const own=ownCalc?.ready&&original?.ready&&original.modelIndex>0?
    (100*ownCalc.modelIndex/original.modelIndex).toFixed(2)+' %':'—';
   const joins=measure?.score?.joinProxy&&measure?.reference?.joinProxy?
    (100*measure.score.joinProxy/measure.reference.joinProxy).toFixed(2)+' %':'—';
   box.append(el('strong','',name),el('span','',t().starter+': '+own+' · '+t().joins+': '+joins));
   if(onRestore){const b=el('button','secondary-btn',t().load);b.type='button';
    b.addEventListener('click',onRestore);box.append(b);}
   compared.append(box);
  }
  if(base){
   const original=sim.evaluate(base,B.model(),root.NRW_BEAR_COMBAT,root.NRW_BEAR_FORMATION,sim.presetFromPlan(base));
   line(t().baseline,original,null);
  }
  comparisons.forEach((v,i)=>line(t().custom+' '+(i+1),v.measure,()=>{
   ratios=v.ratios.map(x=>x.slice());target.value='0';fillInputs();rerun(500);
  }));
 }
 function enter(){
  const plan=root.NRW_BEAR_FORMATION?.plan(B.model(),root.NRW_BEAR_CATALOG,root.NRW_BEAR_COMBAT,root.NRW_BEAR_CAPACITY);
  if(!plan){container.append(el('p','bear-guide-needed',t().missing));return;}
  base=plan;ratios=plan.marches.map(m=>[m.ratio?.[0]||0,m.ratio?.[1]||0]);
  comparisons=[];translate();target.value='0';fillInputs();output('');
  // The approved animation is ~5s. Keep the FIRST calculation on screen long
  // enough to perceive it, but subsequent recalculations remain responsive.
  rerun(1900);
 }
 target.addEventListener('change',fillInputs);
 preset.addEventListener('change',()=>{
  const value=sim.PRESETS.find(p=>p.id===preset.value);
  if(!value)return;
  if(value.id==='optimized'){
   const original=sim.presetFromPlan(base);
   if(target.value==='all'){for(let i=1;i<ratios.length;i++)ratios[i]=original[i].slice();}
   else ratios[Number(target.value)||0]=original[Number(target.value)||0].slice();
   fillInputs();schedule(500);return;
  }
  if(value.ratios)setRatios(value.ratios);
 });
 fields.slice(0,2).forEach(x=>x.input.addEventListener('input',takeInputs));
 reset.addEventListener('click',()=>{
  if(!base)return;ratios=sim.presetFromPlan(base);target.value='0';fillInputs();output('');rerun(500);
 });
 save.addEventListener('click',()=>{
  if(!last?.ready)return;
  comparisons.push({ratios:ratios.map(x=>x.slice()),measure:last});
  if(comparisons.length>4)comparisons.shift();
  renderComparisons();
 });
 return {enter,refresh:rerun};
}
root.NRW_BEAR_SIMULATION_UI={mount};
})(window);
