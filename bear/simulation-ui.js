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
  head:'Relative Schadensprognose',own:'Starter · Modellindex',joins:'Joins · Stellvertreter',overall:'Summe · relativer Modellindex',
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
  head:'Relative damage forecast',own:'Starter · model index',joins:'Joins · proxy',overall:'Total · relative model index',
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
  head:'Dégâts relatifs prévus',own:'Départ · indice',joins:'Renforts · estimation',overall:'Total · indice relatif',
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
 // Calibration belongs to the player's EXISTING local profile, never to
 // all visitors of the public tool. "bearRef" in a shared link ONLY prefills
 // the form; it is not applied until the player explicitly confirms it.
 const calLabels={
  de:{title:'Eigener Referenzkampf (optional)',help:'Hier kannst du echten persönlichen Schaden aus einer selbst gestarteten Rally eingeben. Nur DEIN Starter wird damit näherungsweise kalibriert; fremde Joins bleiben Modellindizes.',
   damage:'Persönlicher Schaden',troops:'Gesendete Truppen',ratio:'Formation (I/K/B)',tiers:'Truppenstufen (T:TG je I/K/B)',
   apply:'Referenz übernehmen',clear:'Referenz löschen',saved:'Referenz aktiv · persönliche Starter-Prognose',
   invalid:'Bitte gültigen Schaden, Truppenzahl, eine 100%-Formation und drei T:TG-Stufen eingeben.',
   uncertain:'Kalibrierte Schätzung, keine garantierten Bärenpunkte. Join-Skills und damalige Kampfboni fehlen; aktuelle Klassenwerte dienen als Näherung.',
   projected:'Eigene Rally · kalibrierte Schätzung'},
  en:{title:'Your measured rally (optional)',help:'Enter actual PERSONAL damage from your own hosted rally. Only your starter is approximately calibrated; external joins remain relative model indices.',
   damage:'Personal damage',troops:'Deployed troops',ratio:'Formation (I/C/A)',tiers:'Troop tiers (T:TG for I/C/A)',
   apply:'Use this reference',clear:'Clear reference',saved:'Reference active · own starter estimate',
   invalid:'Enter valid damage, troop size, a 100% ratio and three T:TG values.',
   uncertain:'Calibrated approximation, not guaranteed Bear points. Prior join skills and battle buffs are unknown; current class stats are proxies.',
   projected:'Own rally · calibrated estimate'},
  fr:{title:'Combat mesuré (facultatif)',help:'Saisis les dégâts PERSONNELS d’un rallye que tu as lancé. Seul ton départ sera approximativement calibré.',
   damage:'Dégâts personnels',troops:'Troupes envoyées',ratio:'Formation (I/C/A)',tiers:'Niveaux des troupes (T:TG pour I/C/A)',
   apply:'Utiliser cette référence',clear:'Effacer la référence',saved:'Référence active · estimation personnelle',
   invalid:'Saisis dégâts, taille, ratio 100 % et trois niveaux T:TG valides.',
   uncertain:'Estimation calibrée, non garantie. Compétences des renforts et bonus du combat passé inconnus.',
   projected:'Mon rallye · estimation calibrée'}
 };
 const ct=()=>calLabels[language()]||calLabels.en;
 const calibration=el('details','bear-sim-calibration');const calTitle=el('summary');
 calibration.append(calTitle);
 const calHelp=el('p','hint');calibration.append(calHelp);
 const calInputs=el('div','bear-sim-cal-fields');calibration.append(calInputs);
 function field(key,type,placeholder){
  const label=el('label'),caption=el('span'),input=el('input');
  input.id='bearCal'+key;input.type=type;input.placeholder=placeholder;input.autocomplete='off';
  if(type==='number'){input.min='1';input.step='1';input.inputMode='numeric';}
  label.append(caption,input);calInputs.append(label);return {input,caption};
 }
 const cDamage=field('Damage','number','144000000');
 const cTroops=field('Troops','number','181820');
 const cRatio=field('Ratio','text','1/12/87');
 const cTiers=field('Tiers','text','10:6 / 10:5 / 10:6');
 const calActions=el('div','bear-sim-actions');
 const applyCal=el('button','secondary-btn'),clearCal=el('button','secondary-btn');
 applyCal.type=clearCal.type='button';calActions.append(applyCal,clearCal);calibration.append(calActions);
 const calFeedback=el('p','hint');calibration.append(calFeedback);
 container.append(calibration);
 function normalizeCal(x){
  const numeric=s=>Number.isSafeInteger(Number(s))?Number(s):NaN;
  if(!x||!Array.isArray(x.ratio)||!Array.isArray(x.tiers))return null;
  const out={damage:numeric(x.damage),troops:numeric(x.troops),
   ratio:x.ratio.map(numeric),tiers:x.tiers.map(t=>({tier:numeric(t.tier),tg:numeric(t.tg)}))};
  return sim.validateCalibration(out)?out:null;
 }
 function parseCalInputs(){
  const ratio=cRatio.input.value.trim().split(/\s*[/;|,]\s*/).map(Number);
  const tierParts=cTiers.input.value.trim().split(/\s*[/;|,]\s*/);
  const tiers=tierParts.map(part=>{
   const m=part.trim().match(/^(\d{1,2})\s*[:TGg\-]\s*(\d)$/);
   return m?{tier:Number(m[1]),tg:Number(m[2])}:null;
  });
  // Explicitly require ALL THREE ratio values to total 100.
  const valid=ratio.length===3&&ratio.every(Number.isInteger)&&ratio[2]===100-ratio[0]-ratio[1];
  return valid?normalizeCal({damage:Number(cDamage.input.value),troops:Number(cTroops.input.value),
   ratio:ratio.slice(0,2),tiers}):null;
 }
 function showCal(x){
  if(!x)return;
  cDamage.input.value=x.damage;cTroops.input.value=x.troops;
  cRatio.input.value=sim.ratio3(x.ratio).join('/');
  cTiers.input.value=x.tiers.map(t=>t.tier+':'+t.tg).join(' / ');
 }
 function prefCalFromUrl(){
  try{
   const raw=new URLSearchParams(location.search).get('bearRef');
   if(!raw||!/^\d+(,\d+){9}$/.test(raw))return null;
   const parts=raw.split(',').map(Number);
   return normalizeCal({damage:parts[0],troops:parts[1],ratio:[parts[2],parts[3]],
    tiers:[{tier:parts[4],tg:parts[5]},{tier:parts[6],tg:parts[7]},{tier:parts[8],tg:parts[9]}]});
  }catch(_){return null;}
 }
 function refreshCal(){
  const x=normalizeCal(B.model().v2?.bearCalibration);
  calFeedback.textContent=x?ct().saved:'';
  return x;
 }
 applyCal.addEventListener('click',()=>{
  const value=parseCalInputs();
  if(!value){calFeedback.textContent=ct().invalid;return;}
  const m=B.model();m.v2=m.v2||{};m.v2.bearCalibration=value;
  B.save();calFeedback.textContent=ct().saved;
  if(base)rerun(400);
 });
 clearCal.addEventListener('click',()=>{
  const m=B.model();if(m.v2)delete m.v2.bearCalibration;
  B.save();calFeedback.textContent='';
  if(base)rerun(400);
 });
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
  calTitle.textContent=ct().title;calHelp.textContent=ct().help;
  [cDamage,cTroops,cRatio,cTiers].forEach((field,i)=>field.caption.textContent=
   [ct().damage,ct().troops,ct().ratio,ct().tiers][i]);
  applyCal.textContent=ct().apply;clearCal.textContent=ct().clear;
  refreshCal();
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
 function renderResult(data){
  panel.replaceChildren();
  if(!data.ready){panel.append(el('p','bear-guide-needed',data.reason==='invalid-percentages'?t().invalid:t().missing));return;}
  const scores=el('section','bear-sim-score-card');
  scores.append(el('h3','',t().head));
  const trio=el('div','bear-sim-metrics');
  const measured=refreshCal();
  const own=measured?sim.calibrateOwn(data.rows[0],B.model(),root.NRW_BEAR_COMBAT,measured):null;
  trio.append(metric(own?ct().projected:t().own,
    scoreText(own?.estimated??data.score?.starter),own?own.relativeChangePercent:data.changes?.starterPct),
   metric(t().joins,scoreText(data.score?.joinProxy),data.changes?.joinPct),
   metric(t().overall,scoreText(data.score?.overall),data.changes?.totalPct));
  scores.append(trio);panel.append(scores);
  if(own)panel.append(el('p','bear-sim-disclaimer',ct().uncertain));
  // Never add calibrated personal damage to a join PROXY index.
  // The combined row intentionally stays a relative MODEL INDEX.
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
   box.append(el('strong','',name),el('span','',scoreText(measure?.score?.overall)));
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
  // URL parameters only prefill an opt-in form, never overwrite saved data.
  const stored=refreshCal();
  if(stored)showCal(stored);
  else showCal(prefCalFromUrl());
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
