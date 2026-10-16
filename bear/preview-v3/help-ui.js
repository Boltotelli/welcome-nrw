/* Bear V3 contextual help. Original game screenshots can be added later to
 * HELP_ASSETS without changing any form fields. No invented game images. */
(function(root){
 'use strict';
 const CONTENT={
  troops:{title:'Truppenbestand',steps:['Öffne die Truppenübersicht deiner Stadt. Erfasse jede vorhandene Infanterie-, Kavallerie- und Bogenschützenstufe getrennt.','Die Anzahl jeder Einheit sowie ihre T- und TG-Stufe müssen genau zur ausgewählten Zeile passen.']},
  tier:{title:'T-Level und TG-Level',steps:['T steht für die Grundstufe der Einheit (z. B. T10). TG steht für die zusätzliche Truppengeneration/-verbesserung.','Lies beide Angaben direkt an der jeweiligen Truppeneinheit ab; unterschiedliche Stufen bitte als eigene Zeile erfassen.']},
  capacity:{title:'Basis-Marschkapazität',steps:['Suche im Spiel die Marschkapazität ohne die zusätzlich vom Rechner erfassten Helden- und temporären Kapazitätsboni.','Helden, aktive Bison-Fähigkeit, Valora und gegebenenfalls Marschall werden separat hinzugerechnet.']},
  stats:{title:'Angriff und Tödlichkeit',steps:['Öffne die Bonusübersicht im Spiel und suche die Werte für Infanterie, Kavallerie und Bogenschützen.','Trage Angriff und Tödlichkeit je Truppentyp separat ein. Keine zuvor zusammengerechneten Gesamtwerte verwenden.']},
  squad:{title:'Schwadron-Boni',steps:['In der Bonusübersicht findest du die allgemeinen Boni für Schwadron-Angriff und Schwadron-Tödlichkeit.','Diese Werte getrennt von den Truppentyp-Boni eintragen. Der Rechner addiert die Ebenen selbst.']},
  heroes:{title:'Helden auswählen',steps:['Markiere nur die Helden, die dein Account besitzt. Nicht ausgewählte Helden bleiben grau.','Stelle bei jedem ausgewählten Helden die Sterne und den T-Fortschritt ein. Alle Helden gelten hier als Level 80.']},
  stars:{title:'Sterne und T-Fortschritt',steps:['Öffne den jeweiligen Helden und lies Sterne sowie die T-Stufe vom Heldendetail ab.','Die fünf Blumen und die Zwischenschritte werden getrennt berücksichtigt.']},
  widget:{title:'Helden-Widget',steps:['Öffne bei einem goldenen Helden seine Widget-/exklusive Ausrüstungsansicht.','Trage das angezeigte Widget-Level ein; nicht jeder Held besitzt ein Widget.']},
  expedition:{title:'Expeditionsboni der Starter',steps:['Öffne die Detailansicht des ausgewählten Starterhelden und suche seine Expeditionseigenschaften.','Nur die einzeln ausgewiesenen Expeditionswerte eingeben, wenn sie nicht bereits in einem anderen eingegebenen Gesamtwert enthalten sind.']},
  march:{title:'Anzahl der Märsche',steps:['Ein eigener Startermarsch plus die Märsche, mit denen du fremden Rallys beitrittst.','Sechs Joiner entsprechen beispielsweise insgesamt sieben Märschen.']},
  leaders:{title:'Stärke fremder Rallyleader',steps:['Wähle, ob die Rallyleader, denen du beitrittst, im Durchschnitt schwächer, gleich stark oder stärker als du sind.','Das bestimmt die Priorität bei knappen Bogenschützen: eigene Rally oder Joiner zuerst.']},
  ministers:{title:'Ministerboni',steps:['Wähle König oder Hochkönig und aktiviere FC und/oder Marschall nur dann, wenn dieser Bonus tatsächlich auf deinen Marsch wirkt.','Ministerboni werden auf die ungebufften Ausgangswerte addiert.']},
  pets:{title:'Pet-Fähigkeiten',steps:['Öffne das Pet-Menü und prüfe, welche der relevanten Fähigkeiten aktiv sind.','Trage deren Fähigkeitenlevel ein. Nur aktive Boni werden berücksichtigt.']},
  valora:{title:'Valora-Fähigkeiten',steps:['Öffne Valoras Meisteransicht und die Ansicht der relevanten Fähigkeiten.','Stelle das Level nach den Fähigkeitsbildern ein. Die eingetragenen Grundwerte müssen ungebufft sein.']}
 };
 // Screenshots will be supplied by the owner. Add {url,alt} entries here
 // only after original Kingshot images have been provided and verified.
 const HELP_ASSETS=Object.create(null);
 let dialog=null,previousFocus=null,fieldId=0;
 const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function resolveField(label){
  const s=String(label);
  if(/TG|^T$|^Typ$/.test(s))return 'tier';
  if(/^Anzahl$/.test(s))return 'troops';
  if(/^Fähigkeitslevel$/.test(s))return 'pets';
  if(/Kapazität/.test(s))return 'capacity';
  if(/Schwadron.*(Angriff|Tödlichkeit)/.test(s))return 'squad';
  if(/Expeditions-/.test(s))return 'expedition';
  if(/Angriff|Tödlichkeit/.test(s))return 'stats';
  if(/Widget/.test(s))return 'widget';
  if(/Märsche/.test(s))return 'march';
  if(/Rallyleader/.test(s))return 'leaders';
  if(/Valora|Savage|Dance of the Hunt/.test(s))return 'valora';
  return null;
 }
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
 function decorateField(wrapper,label){
  const key=resolveField(label);if(!key)return wrapper;
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
 root.NRW_BEAR_HELP={icon,decorateField,open,resolveField};
})(window);
