/* Step 8: one base-capacity input and a transparent live, local breakdown.
 * Uses ONLY model.values.cap, scanned hero levels, active Bison and Valora.
 * No duplicate form fields and no extra persistence.
 */
(function(root){
'use strict';
function mount(host,B,language){
 const panel=document.createElement('div');
 panel.className='bear-capacity-review';
 panel.id='bearCapacityReview';
 panel.setAttribute('aria-live','polite');
 host.append(panel);
 function refresh(){
  const calc=root.NRW_BEAR_CAPACITY?.breakdown(B.model(),root.NRW_BEAR_CATALOG);
  if(!calc)return;
  const l=language(),tr=(de,en,fr)=>l==='de'?de:l==='fr'?fr:en;
  const fmt=n=>Number(n||0).toLocaleString(l==='de'?'de-DE':l==='fr'?'fr-FR':'en-US');
  panel.replaceChildren();
  const p=document.createElement('p');p.className='hint';
  p.textContent=tr('Bitte Basiswert OHNE Helden und aktive Bison-/Valora-Buffs eintragen.',
   'Enter the base WITHOUT heroes or active Bison/Valora bonuses.',
   'Saisis la base SANS héros ni bonus actifs du bison ou de Valora.');
  panel.append(p);
  function line(label,value,muted){
   const div=document.createElement('div');div.className='bear-capacity-line'+(muted?' muted':'');
   const span=document.createElement('span');span.textContent=label;
   const strong=document.createElement('strong');strong.textContent=value;
   div.append(span,strong);panel.append(div);
  }
  line(tr('Basis (manuell)','Base (manual)','Base (manuelle)'),calc.hasBase?fmt(calc.base):'—');
  for(const hero of calc.heroRows){
   const label=(hero.name||tr('Held fehlt','Hero missing','Héros manquant'))+
    (hero.level?' · Lv. '+hero.level:'');
   line(label,hero.value===null?'?':'+'+fmt(hero.value),true);
  }
  line(tr('Heldenbonus','Hero capacity','Bonus des héros'),
   calc.heroesPending?'?':'+'+fmt(calc.heroes)+(calc.heroSource==='manual'?' *':''));
  line('Valora · Savage Advantage','+'+fmt(calc.master)+(calc.masterSource==='manual'?' *':''));
  line('Mighty Bison','+'+fmt(calc.pet)+(calc.petSource==='manual'?' *':'')+
   (calc.petRank!==null&&!calc.petActive?tr(' (nicht aktiviert)',' (inactive)',' (inactif)'):''));
  const total=document.createElement('div');total.className='bear-capacity-total';
  const caption=document.createElement('span');caption.textContent=tr('Gesamte Schwadronskapazität','Total squad capacity',"Capacité totale d’escadron");
  const value=document.createElement('strong');value.textContent=!calc.hasBase?'—':
   calc.heroesPending?tr('Heldenbonus fehlt','Hero bonus missing','Bonus des héros manquant'):fmt(calc.total);
  total.append(caption,value);panel.append(total);
  const hint=document.createElement('p');hint.className='hint';
  hint.textContent=calc.heroesPending?
   tr('Für unbekannte Heldenlevel und Level 39 bitte den exakten Heldenbonus unten eintragen.',
    'Enter an exact hero bonus below if hero levels are unknown or level 39 is selected.',
    'Saisis le bonus exact si les niveaux des héros sont inconnus ou égaux à 39.'):
   calc.masterSource==='manual'||calc.petSource==='manual'?
   tr('* Ein alter manueller Bonus wird nur als Ersatz berücksichtigt, nicht doppelt addiert.',
    '* Legacy manual bonuses are only fallbacks, never added twice.',
    "* Les bonus manuels sont des valeurs de remplacement, jamais doublés."):
   tr('Rally-Kapazität wird hier nicht addiert.',
    'Rally capacity is excluded.',
    'La capacité de rallye est exclue.');
  panel.append(hint);
  // Reuse the EXISTING optional hero bonus override field, never clone it.
  const field=document.getElementById('heroCapManual')?.closest('.field');
  if(field){
   if(!host.contains(field))host.append(field);
   field.hidden=!calc.heroesPending&&calc.heroSource!=='manual';
  }
 }
 return {refresh};
}
root.NRW_BEAR_CAPACITY_UI={mount};
})(window);
