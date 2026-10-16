/* NRW Bear contextual Kingshot guide. Genuine player-supplied screenshots only.
 * Highlight overlays are DOM/CSS, keeping the original pixels intact.
 * Screenshot pack is requested lazily after the user opens a guide.
 */
(function(root){
 'use strict';
 const imgSource='./preview-v3/help-image-pack.js?v=20261016-final-guides-1';
 // Crop rectangles in original screenshot coordinates, not CSS pixels.
 const CROPS={
  city:[0,0,955,2048],governor:[0,0,955,2048],
  troops:[0,0,955,790],bonus:[0,195,1080,1490],
  combat:[0,245,1080,1660],heroes:[0,0,955,1870],
  widget:[0,510,1080,1920],expedition:[0,855,955,2048],
  pets:[0,295,955,1675],petDetail:[0,180,1080,1685],
  valoraBuilding:[0,360,955,1560],
  valoraHunter:[0,900,955,2048],valoraSavage:[0,855,955,2048]
 };
 // The pack holds genuine screenshots at their original crop aspect ratios.
 // Crop again IN THE VIEWER to show only the relevant area: no extra images
 // and no scroll through a full 2048px city screen just to tap an icon.
 const GUIDE_CROPS={
  troops:[[0,0,680,350],[0,1450,955,2048],[0,0,955,765]],
  capacity:[[0,0,680,350],[65,330,1020,790]],
  combatStats:[[0,0,680,350],[65,850,1020,1450],[65,335,1020,1640]],
  heroes:[[0,1590,955,2048],[25,110,930,1155],[210,1000,1080,1920]],
  expedition:[[0,855,955,2048],[0,855,955,2048]],
  pets:[[60,295,910,1180],[60,1030,1030,1650]],
  valora:[[200,795,825,1280],[25,920,920,2048],[20,1060,935,2048]]
 };
 // Markers: x1,y1,x2,y2 in ORIGINAL screenshots.
 const box=(rect,text,color='gold')=>({rect,text,color});
 const GUIDES={
  troops:{title:'Truppen: Anzahl, T-Level und TG-Level',steps:[
   {text:'Tippe oben links auf dein Profilbild, um dein Gouverneursprofil zu öffnen.',
    image:'city',marks:[box([0,0,115,114],'Profilbild oben links')]},
   {text:'Im Gouverneursprofil findest du unten den Button „Squad“. Tippe darauf, um die vollständige Truppenübersicht zu öffnen.',
    image:'governor',marks:[box([245,1900,478,2042],'Squad öffnen')]},
   {text:'Wähle „All“, damit auch Truppen außerhalb der Stadt erfasst werden. Übertrage jeden Truppentyp, seine Anzahl, die römische T-Stufe unter dem Symbol und die goldene TG-Stufe oben rechts. Für verschiedene T-/TG-Stufen desselben Truppentyps jeweils eine eigene Zeile anlegen.',
    image:'troops',marks:[
     box([30,120,324,235],'„All“ – alle Truppen','gold'),
     box([202,476,427,563],'Name und Anzahl','green'),
     box([119,537,162,585],'T-Level: X = T10','blue'),
     box([157,461,207,515],'TG-Level: 6 = TG6','orange')
    ]}
  ]},
  march:{title:'Anzahl aller Märsche',steps:[
   {text:'Wichtig: Deinen eigenen Startermarsch musst du bei der Gesamtzahl immer mitzählen. Die Anzahl ist nicht nur die Zahl deiner Joiner.'},
   {text:'Beispiel: 1 eigene Starter-Rally + 6 Joiner = 7 Märsche insgesamt. Im Optimierer stellst du also 7 ein.'}
  ]},
  capacity:{title:'Basis-Marschkapazität finden',steps:[
   {text:'Tippe in der Stadtansicht auf deine persönliche Kraft oben links – die Zahl neben dem Faustsymbol, nicht das Profilbild.',
    image:'city',marks:[box([117,68,376,135],'Persönliche Kraft')]},
   {text:'Scrolle in der „Bonus Overview“ zu „Military“. Übertrage „Deployment Capacity“ (hier: 112.100). „March Queue“ ist lediglich die Anzahl möglicher Märsche und NICHT die Truppenkapazität. Zusätzliche Helden-, Pet-, Valora- und Marschall-Boni nicht selbst hinzurechnen.',
    image:'bonus',marks:[
     box([75,335,855,411],'Military','blue'),
     box([79,499,852,589],'Deployment Capacity: 112.100','green')
    ]}
  ]},
  combatStats:{title:'Schwadron, Infanterie, Kavallerie und Bogenschützen',steps:[
   {text:'Tippe oben links auf die persönliche Kraft (Faustsymbol mit Zahl), um „Bonus Overview“ zu öffnen.',
    image:'city',marks:[box([115,66,376,135],'Persönliche Kraft')]},
   {text:'Im Bereich „Military“ findest du „Squads’ Attack“ und „Squads’ Lethality“. Hier sind es 276,3 % Angriff und 60,1 % Tödlichkeit. Defense und Health werden nicht abgefragt.',
    image:'bonus',marks:[
     box([80,1080,853,1185],'Squads’ Attack: 276,3 %','green'),
     box([80,1290,853,1395],'Squads’ Lethality: 60,1 %','gold')
    ]},
   {text:'Scrolle weiter nach unten. Notiere je Truppentyp die Werte „Attack“ und „Lethality“: Infanterie 184,4 / 276,5 %, Kavallerie 174,9 / 250,7 %, Bogenschützen 252,9 / 318,8 %. Defense und Health ignorieren. Nur getrennte, nicht schon zusammengerechnete Werte ohne temporäre aktive Boni eintragen.',
    image:'combat',marks:[
     box([80,400,847,500],'Infanterie Angriff','green'),
     box([80,700,847,797],'Infanterie Tödlichkeit','green'),
     box([80,800,847,899],'Kavallerie Angriff','gold'),
     box([80,1100,847,1198],'Kavallerie Tödlichkeit','gold'),
     box([80,1200,847,1298],'Bogenschützen Angriff','blue'),
     box([80,1500,847,1600],'Bogenschützen Tödlichkeit','blue')
    ]}
  ]},
  heroes:{title:'Heldenübersicht, Sterne und Widget',steps:[
   {text:'Tippe in der Stadtansicht unten in der Menüleiste auf „Heroes“, um deine gesamte Heldenübersicht zu öffnen.',
    image:'city',marks:[box([170,1900,332,2044],'Heroes öffnen')]},
   {text:'Markiere im Optimierer alle Helden, die du besitzt. Lies ihre Sternstufe und den Fortschritt anhand der Blumen unter jedem Porträt ab. Alle Helden gelten im Rechner als Level 80. Wichtig: „S4“, „S5“ usw. oben rechts bezeichnen die Heldengeneration, NICHT die Anzahl Sterne.',
    image:'heroes',marks:[
     box([215,115,417,426],'Besessener Held','green'),
     box([232,381,416,427],'Blumen = Sternfortschritt','gold'),
     box([369,118,407,162],'S5 = Generation, nicht Sterne','blue')
    ]},
   {text:'Tippe bei einem goldenen Helden auf sein Porträt, öffne „Gear“ und suche unten das exklusive Widget. Beim gezeigten Long Fei beträgt „Immortal’s Flask +5“ das Widget-Level 5. Die Ausrüstung links und rechts vom Helden ist NICHT das Widget.',
    image:'widget',marks:[
     box([395,1127,683,1454],'Widget: +5','gold'),
     box([690,1738,1078,1920],'Reiter Gear','blue')
    ]}
  ]},
  expedition:{title:'Heldenausrüstung nach dem Umziehen prüfen',steps:[
   {text:'Ziehe zuerst deine beste Ausrüstung auf die drei empfohlenen Starterhelden um. Öffne danach den jeweiligen Helden, tippe auf „Stats“ und auf das Listen-Symbol rechts unten. Der nächste Schritt wird für alle drei Starter wiederholt.',
    image:'expedition',marks:[
     box([28,1880,329,2048],'Stats','blue'),
     box([773,1740,901,1865],'Detailwerte öffnen','gold')
    ]},
   {text:'Im eingeblendeten „Expedition“-Abschnitt NUR Angriff und Tödlichkeit ablesen, z. B. bei Yang Archer Attack +492,17 % und Archer Lethality +323,80 %. Defense, Health und „Conquest“ nicht eintragen. Die Truppenbezeichnung wechselt je nach Starterheld. Werte erst NACH dem Umziehen erfassen und nicht doppelt in Basiswerte rechnen.',
    image:'expedition',marks:[
     box([357,1508,908,1570],'Expedition Attack: +492,17 %','green'),
     box([357,1624,908,1682],'Expedition Lethality: +323,80 %','gold')
    ]}
  ]},
  pets:{title:'Pet-Buffs: Fähigkeiten und Level',steps:[
   {text:'Öffne „Pet Skill“. Die gekreuzten Schwerter kennzeichnen Kampffähigkeiten; das „Lv.“ auf jedem Symbol zeigt das Fähigkeitslevel. Tippe die relevante Fähigkeit an, um ihren Namen und ihre tatsächliche Wirkung zu überprüfen.',
    image:'pets',marks:[
     box([79,565,157,652],'Kampf-Symbol','orange'),
     box([101,685,245,782],'Level unter dem Pet-Symbol','green'),
     box([85,577,245,787],'Beispiel-Fähigkeit öffnen','gold')
    ]},
   {text:'In den Details stehen Fähigkeitsname, Level, Wirkungsdauer und Cooldown. Beispiel: „Antler Impact Lv. 5“ gibt 100.000 RALLY-Kapazität für 2 Stunden – das ist NICHT deine persönliche Marschkapazität. Aktiviere im Optimierer nur Pet-Buffs, die während der Bärenfalle tatsächlich wirken. Ein Cooldown allein beweist keinen aktiven Bonus.',
    image:'petDetail',marks:[
     box([72,1151,691,1221],'Antler Impact Lv. 5','gold'),
     box([86,1260,900,1379],'+100.000 Rally Capacity, nicht March Capacity','green')
    ]}
  ]},
  valora:{title:'Valora: Hunter Instinct und Savage Advantage',steps:[
   {text:'Tippe in der Stadt auf das Meistergebäude, über dem Valoras Symbol und der grüne Fortschrittsbalken angezeigt werden.',
    image:'valoraBuilding',marks:[box([304,931,709,1260],'Meistergebäude öffnen')]},
   {text:'Öffne Valoras „Stats“ und tippe auf das Fähigkeitssymbol unten links. „Hunter Instinct Lv. 9“ gibt hier +24 % eigene Bear Hunt Damage Points. Der „Next Level Bonus“ (+27 %) gilt noch NICHT. Die Beziehungsstufe „Close 2“ oben links ist ebenfalls kein Fähigkeitslevel.',
    image:'valoraHunter',marks:[
     box([48,1510,214,1680],'Hunter Instinct Level 9','gold'),
     box([52,958,632,1445],'Current Bonus: +24 %','green')
    ]},
   {text:'Wechsle zu „Skills“ und tippe unten rechts auf „Savage Advantage“. Das gezeigte Level 10 bringt +30.000 Bear Hunt Squad Capacity. WICHTIG: Hunter Instinct und Savage Advantage haben UNABHÄNGIGE Fähigkeitslevel; keinesfalls automatisch für beide denselben Wert eintragen.',
    image:'valoraSavage',marks:[
     box([635,1400,923,1650],'Savage Advantage Level 10','gold'),
     box([43,1134,898,1444],'+30.000 Bear Hunt Squad Capacity','green'),
     box([418,1835,918,2048],'Skills','blue')
    ]}
  ]}
 };
 let dialog=null,previousFocus=null,imagePromise=null;
 const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 function loadImages(){
  if(root.NRW_BEAR_HELP_IMAGES)return Promise.resolve(true);
  if(!imagePromise)imagePromise=new Promise(resolve=>{
   const script=node('script');script.src=imgSource;script.async=true;
   script.onload=()=>resolve(Boolean(root.NRW_BEAR_HELP_IMAGES));
   script.onerror=()=>{imagePromise=null;resolve(false);};
   document.head.append(script);
  });
  return imagePromise;
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
   const items=[...dialog.querySelectorAll('button:not([disabled])')].filter(el=>!el.hidden);
   if(!items.length)return;
   const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 }
 function photo(step,guideKey,stepIndex){
  const source=root.NRW_BEAR_HELP_IMAGES?.[step.image];
  if(!source)return node('p','bear-name-help-pending','📷 Bild lädt …');
  const sourceRect=CROPS[step.image],focusRect=GUIDE_CROPS[guideKey]?.[stepIndex]||sourceRect;
  const [ox,oy,or,ob]=sourceRect,[x,y,r,b]=focusRect;
  const srcWidth=or-ox,srcHeight=ob-oy;
  const width=r-x,height=b-y;
  if(x<ox||y<oy||r>or||b>ob||width<=0||height<=0){
   console.error('[Bear Help] Invalid crop bounds',guideKey,stepIndex);
   return node('p','bear-name-help-pending','Bildbereich vorübergehend nicht verfügbar.');
  }
  const pane=node('div','bear-name-help-photo-scroll'),canvas=node('div','bear-name-help-photo');
  canvas.style.aspectRatio=width+' / '+height;
  // Scale the screenshot so its ORIGINAL pixel coordinates still map 1:1
  // to the focused viewport, even if the WebP was resized at build time.
  const maxImageHeight=Math.max(205,Math.min(400,Math.round((window.visualViewport?.height||window.innerHeight||780)*0.44)));
  canvas.style.width='min(100%, '+Math.round(width/height*maxImageHeight)+'px)';
  const img=node('img','bear-name-help-image');img.src=source;
  img.alt='Original Kingshot-Screenshot: '+step.image;img.loading='eager';img.draggable=false;
  img.style.position='absolute';
  img.style.width=(srcWidth/width*100)+'%';
  img.style.height=(srcHeight/height*100)+'%';
  img.style.left=(-(x-ox)/width*100)+'%';
  img.style.top=(-(y-oy)/height*100)+'%';
  canvas.append(img);
  const legend=node('div','bear-name-help-legend');
  (step.marks||[]).forEach((mark,index)=>{
   let [left,top,right,bottom]=mark.rect;
   left=Math.max(x,left);right=Math.min(r,right);
   top=Math.max(y,top);bottom=Math.min(b,bottom);
   if(right<=left||bottom<=top)return;
   const frame=node('span','bear-name-help-marker bear-name-help-marker-'+mark.color);
   frame.style.left=((left-x)/width*100).toFixed(3)+'%';
   frame.style.top=((top-y)/height*100).toFixed(3)+'%';
   frame.style.width=((right-left)/width*100).toFixed(3)+'%';
   frame.style.height=((bottom-top)/height*100).toFixed(3)+'%';
   frame.append(node('span','bear-name-help-marker-number',String(index+1)));
   canvas.append(frame);
   const label=node('div','bear-name-help-legend-item');
   label.append(node('span','bear-name-help-legend-number bear-name-help-legend-'+mark.color,String(index+1)),
    node('span','',mark.text));
   legend.append(label);
  });
  pane.append(canvas);
  const zoom=node('button','bear-name-help-zoom','🔍 Bild vergrößern');zoom.type='button';
  zoom.addEventListener('click',()=>{
   const expanded=pane.classList.toggle('zoomed');
   zoom.textContent=expanded?'Bild verkleinern':'🔍 Bild vergrößern';
  });
  const group=node('div','bear-name-help-visual');group.append(pane,zoom,legend);
  return group;
 }
 function open(key){
  const guide=GUIDES[key];if(!guide)return;
  close();previousFocus=document.activeElement;
  const overlay=node('div','bear-name-help-backdrop');
  const panel=node('section','bear-name-help-dialog');
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  const id='bear-help-heading';panel.setAttribute('aria-labelledby',id);
  const heading=node('h3','',guide.title);heading.id=id;
  const closeButton=node('button','bear-name-help-close','×');closeButton.type='button';
  closeButton.setAttribute('aria-label','Hilfe schließen');closeButton.addEventListener('click',close);
  const top=node('div','bear-name-help-top');top.append(heading,closeButton);panel.append(top);
  let index=0;
  const contents=node('div','bear-name-help-content');
  const nav=node('div','bear-name-help-nav');
  const back=node('button','bear-name-btn','← Zurück');
  const next=node('button','bear-name-btn primary','Weiter →');
  const done=node('button','bear-name-btn primary','Verstanden ✓');
  for(const b of [back,next,done])b.type='button';
  const counter=node('span','bear-name-help-counter','');
  function draw(){
   if(dialog!==overlay)return;
   const step=guide.steps[index];contents.replaceChildren();
   const note=node('p','bear-name-help-explainer',step.text);contents.append(note);
   if(step.image){
    if(root.NRW_BEAR_HELP_IMAGES?.[step.image])contents.append(photo(step,key,index));
    else{
     contents.append(node('p','bear-name-help-pending','📷 Screenshot wird geladen …'));
     void loadImages().then(ok=>{
      if(dialog===overlay&&guide.steps[index]===step){
       if(ok)draw();
       else contents.querySelector('.bear-name-help-pending').textContent=
        'Screenshot konnte nicht geladen werden. Die Anleitung bleibt lesbar.';
      }
     });
    }
   }
   counter.textContent=(index+1)+' / '+guide.steps.length;
   back.hidden=index===0;next.hidden=index===guide.steps.length-1;
   done.hidden=index!==guide.steps.length-1;
  }
  back.addEventListener('click',()=>{index=Math.max(0,index-1);draw();});
  next.addEventListener('click',()=>{index=Math.min(guide.steps.length-1,index+1);draw();});
  done.addEventListener('click',close);
  nav.append(back,counter,next,done);panel.append(contents,nav);overlay.append(panel);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  // The V3 shell hides every direct <body> child except #bearNewApp.
  // Append modals INSIDE the visible app root or clicks appear to do nothing.
  const appRoot=document.getElementById('bearNewApp');
  if(!appRoot){
   console.error('[Bear Help] Visible app root missing; cannot open help dialog.');
   return;
  }
  appRoot.append(overlay);dialog=overlay;
  document.addEventListener('keydown',onKey);draw();closeButton.focus();
 }
 function icon(key){
  if(!GUIDES[key])return null;
  const b=node('button','bear-name-help-trigger','i');b.type='button';
  b.setAttribute('aria-label','Hilfe: '+GUIDES[key].title);
  b.title='Wo finde ich diesen Wert?';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(key);});
  return b;
 }
 function decorateField(wrapper,label,key){
  if(!key||!GUIDES[key])return wrapper;
  const field=wrapper.querySelector('input,select'),oldCaption=wrapper.querySelector('span');
  if(!field||!oldCaption)return wrapper;
  const container=node('div','bear-name-field'),row=node('div','bear-name-field-heading');
  const caption=node('label');
  const id='nrw-bear-help-field-'+(++decorateField.count);
  field.id=id;caption.htmlFor=id;caption.append(oldCaption);
  row.append(caption,icon(key));container.append(row,field);
  return container;
 }
 decorateField.count=0;
 root.NRW_BEAR_HELP={icon,decorateField,open,GUIDES,CROPS,GUIDE_CROPS};
})(window);
