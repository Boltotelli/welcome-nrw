/* Bear V3 contextual help. Original game screenshots can be added later to
 * HELP_ASSETS without changing any form fields. No invented game images. */
(function(root){
 'use strict';
 const CONTENT={
  heroes:{title:'Heldenübersicht: Besitz, Sterne und Widget',steps:[
   'Markiere in der Heldenübersicht alle Helden, die du besitzt. Ausgewählte Porträts werden farbig, nicht ausgewählte bleiben grau.',
   'Öffne im Spiel die jeweilige Heldenseite. Übertrage Sterne und die T-Zwischenstufe (Blütenblätter); der Rechner nimmt für alle Helden Level 80 an.',
   'Goldene Helden besitzen unter Umständen ein Widget. Öffne dessen Ausrüstungsansicht und stelle das angezeigte Widget-Level ein.']},
  troops:{title:'Truppenbestand: Anzahl, T und TG',steps:[
   'Öffne die Truppenübersicht deiner Stadt. Erfasse Infanterie, Kavallerie und Bogenschützen einschließlich aller vorhandenen unterschiedlichen Stufen.',
   'Lies pro Einheit die T-Stufe und – falls vorhanden – die zusätzliche TG-Stufe ab. Verwende für jede T-/TG-Kombination eine eigene Truppenzeile.',
   'Trage die jeweilige Truppenanzahl ein. Der Rechner bildet daraus die Summen, ohne verschiedene Stufen zu vermischen.']},
  march:{title:'Anzahl aller Märsche – eigenen Starter mitzählen',steps:[
   'Wichtig: Der eigene Rally-Starter zählt immer zur Gesamtzahl der Märsche dazu.',
   'Beispiel: Du startest 1 Rally und trittst 6 fremden Rallys bei. Dann wählst du insgesamt 7 Märsche (1 Starter + 6 Joiner).']},
  capacity:{title:'Basis-Marschkapazität ohne Helden',steps:[
   'Suche im Spiel die Marschkapazität ohne die vom Rechner separat hinzugerechneten Helden und aktivierten Kapazitätsboni.',
   'Heldenkapazität, aktiver Pet-Buff, Valora und gegebenenfalls Marschall werden im Optimierer zusätzlich berücksichtigt – diese Werte nicht in die Basiskapazität einrechnen.']},
  combatStats:{title:'Infanterie-, Kavallerie-, Bogenschützen- und Schwadronwerte',steps:[
   'Öffne die Bonusübersicht im Spiel und notiere für Infanterie, Kavallerie und Bogenschützen jeweils Angriff und Tödlichkeit.',
   'Notiere zusätzlich die separat ausgewiesenen Werte für Schwadron-Angriff und Schwadron-Tödlichkeit.',
   'Trage die Werte separat und ungebufft ein. Die Kampfstufen und Boni werden im Rechner addiert; keine bereits zusammengerechneten Gesamtwerte eingeben.']},
  expedition:{title:'Heldenausrüstung der drei Starter',steps:[
   'Ziehe deine beste passende Heldenausrüstung zunächst auf die drei vorgeschlagenen Starterhelden um.',
   'Öffne danach deren Helden-/Expeditionsdetailansichten und übertrage die tatsächlichen Werte für Expeditions-Angriff und Expeditions-Tödlichkeit. Die Werte dürfen nicht doppelt in anderen Feldern enthalten sein.']},
  pets:{title:'Pet-Buffs – gemeinsamer Überblick',steps:[
   'Öffne das Pet-Menü. Prüfe, welche der relevanten Pet-Fähigkeiten aktuell aktiv sind.',
   'Markiere nur die tatsächlich aktiven Boni und trage die jeweiligen Fähigkeitslevel ein. Die Boni werden nicht bei inaktiven Pets angewendet.']},
  valora:{title:'Valora – Meisterfähigkeiten',steps:[
   'Öffne Valoras Meisterübersicht und anschließend die Fähigkeitsansicht.',
   'Übertrage die Werte von Savage Advantage und Hunter Instinct getrennt. Die Grundwerte müssen weiterhin ungebufft sein.']}
 };
 // Screenshots will be supplied by the owner. Add {url,alt} entries here
 // only after original Kingshot images have been provided and verified.
 const HELP_ASSETS=Object.create(null);
 let dialog=null,previousFocus=null,fieldId=0;
 const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function close(){
  if(!dialog)return;
  document.removeEventListener('keydown',onKey);
  dialog.remove();dialog=null;
  if(previousFocus?.isConnected)previousFocus.focus();
  previousFocus=null;
 }
 function onKey(e){
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key==='Tab'&&dialog){
   const items=[...dialog.querySelectorAll('button:not([disabled])')];
   if(!items.length)return;
   const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 }
 function open(key){
  const help=CONTENT[key];if(!help)return;
  close();previousFocus=document.activeElement;
  const overlay=node('div','bear-name-help-backdrop');
  const panel=node('section','bear-name-help-dialog');
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  const id='bear-help-heading';panel.setAttribute('aria-labelledby',id);
  const heading=node('h3','',help.title);heading.id=id;
  const closeButton=node('button','bear-name-help-close','×');closeButton.type='button';
  closeButton.setAttribute('aria-label','Hilfe schließen');closeButton.addEventListener('click',close);
  const top=node('div','bear-name-help-top');top.append(heading,closeButton);panel.append(top);
  let index=0;
  const contents=node('div','bear-name-help-content');
  const nav=node('div','bear-name-help-nav');
  const back=node('button','bear-name-btn','← Zurück'),next=node('button','bear-name-btn primary','Weiter →'),
   done=node('button','bear-name-btn primary','Verstanden ✓');
  for(const b of [back,next,done])b.type='button';
  const counter=node('span','bear-name-help-counter','');
  function draw(){
   contents.replaceChildren();
   contents.append(node('p','bear-name-help-explainer',help.steps[index]));
   const shot=HELP_ASSETS[key]?.[index];
   if(shot?.url){
    const img=node('img','bear-name-help-image');img.src=shot.url;img.alt=shot.alt||help.title;
    img.loading='lazy';img.addEventListener('click',()=>img.classList.toggle('expanded'));
    contents.append(img);
   }else contents.append(node('p','bear-name-help-pending','📷 Beispiel-Screenshot folgt. Die Anleitung ist bereits nutzbar.'));
   counter.textContent=(index+1)+' / '+help.steps.length;
   back.hidden=index===0;next.hidden=index>=help.steps.length-1;
   done.hidden=index<help.steps.length-1;
  }
  back.addEventListener('click',()=>{index=Math.max(0,index-1);draw();});
  next.addEventListener('click',()=>{index=Math.min(help.steps.length-1,index+1);draw();});
  done.addEventListener('click',close);
  nav.append(back,counter,next,done);panel.append(contents,nav);overlay.append(panel);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.body.append(overlay);dialog=overlay;
  document.addEventListener('keydown',onKey);draw();closeButton.focus();
 }
 function icon(key){
  if(!CONTENT[key])return null;
  const b=node('button','bear-name-help-trigger','i');b.type='button';
  b.setAttribute('aria-label','Hilfe: '+CONTENT[key].title);
  b.title='Wo finde ich diesen Wert?';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(key);});
  return b;
 }
 function decorateField(wrapper,label,key){
  // Explicit opt-in only: no automatic buttons on each hero, troop
  // row, Pet skill, Rallyleader selector or minister setting.
  if(!key||!CONTENT[key])return wrapper;
  const field=wrapper.querySelector('input,select');
  const originalTitle=wrapper.querySelector('span');
  if(!field||!originalTitle)return wrapper;
  // Never put an interactive button inside a <label>: screen readers and
  // browsers must still associate the caption with the actual form control.
  const container=node('div','bear-name-field');
  const heading=node('div','bear-name-field-heading');
  const caption=node('label');
  const id='nrw-bear-help-field-'+(++fieldId);
  field.id=id;caption.htmlFor=id;caption.append(originalTitle);
  heading.append(caption,icon(key));
  container.append(heading,field);
  return container;
 }
 root.NRW_BEAR_HELP={icon,decorateField,open};
})(window);
