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
  troops:[[0,0,680,350],[0,1450,955,2048],[0,0,885,765]],
  capacity:[[0,0,680,350],[68,376,1010,725]],
  combatStats:[[0,0,680,350],[65,850,1020,1450],[65,335,1020,1640]],
  heroes:[[0,1590,955,2048],[20,100,935,890],[210,1000,1080,1920]],
  expedition:[[0,855,955,2048],[0,855,955,2048]],
  pets:[[60,320,910,1095],[65,1155,1010,1555]],
  valora:[[200,795,825,1280],[28,1040,911,1940],[20,1240,935,2048]]
 };
 // Markers: x1,y1,x2,y2 in ORIGINAL screenshots.
 const box=(rect,text,color='gold')=>({rect,text,color});
 const GUIDES={
  troops:{title:'Truppen: Anzahl, T-Level und TG-Level',steps:[
   {text:'Tippe oben links auf dein Profilbild, um dein Gouverneursprofil zu öffnen.',
    image:'city',marks:[box([0,0,115,114],'Profilbild oben links')]},
   {text:'Im Gouverneursprofil findest du unten den Button „Squad“. Tippe darauf, um die vollständige Truppenübersicht zu öffnen.',
    image:'governor',marks:[box([245,1900,478,2042],'Squad öffnen')]},
   {text:'Wähle „All“, damit auch Truppen außerhalb der Stadt erfasst werden. Bei jedem Truppentyp findest du die Anzahl unter dem Namen, das T-Level als römische Zahl unter dem Symbol (X = T10) und das TG-Level als goldene Zahl oben rechts (6 = TG6). Unterschiedliche Stufen desselben Typs als eigene Zeilen eintragen.',
    image:'troops',marks:[
     box([26,106,283,205],'„All“ – alle Truppen','gold'),
     box([207,490,411,525],'Typ: Apex Infantry','green'),
     box([207,526,347,568],'Anzahl: 637.997','green'),
     box([125,540,178,581],'T-Level: X = T10','blue'),
     box([149,461,205,510],'TG-Level: goldene 6 = TG6','orange')
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
     box([92,396,988,483],'Military','blue'),
     box([92,577,988,686],'Deployment Capacity: 112.100','green')
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
     box([270,193,463,438],'Besessener Held','green'),
     box([264,443,465,491],'Blumen = Sternfortschritt','gold'),
     box([410,134,467,184],'S5 = Generation, nicht Sterne','blue')
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
     box([88,696,147,752],'Kampf-Symbol','orange'),
     box([163,823,251,872],'Level unter dem Pet-Symbol','green'),
     box([148,755,255,820],'Beispiel-Fähigkeit öffnen','gold')
    ]},
   {text:'In den Details stehen Fähigkeitsname, Level, Wirkungsdauer und Cooldown. Beispiel: „Antler Impact Lv. 5“ gibt 100.000 RALLY-Kapazität für 2 Stunden – das ist NICHT deine persönliche Marschkapazität. Aktiviere im Optimierer nur Pet-Buffs, die während der Bärenfalle tatsächlich wirken. Ein Cooldown allein beweist keinen aktiven Bonus.',
    image:'petDetail',marks:[
     box([96,1184,574,1257],'Antler Impact Lv. 5','gold'),
     box([96,1255,895,1390],'+100.000 Rally Capacity, nicht March Capacity','green')
    ]}
  ]},
  valora:{title:'Valora: Hunter Instinct und Savage Advantage',steps:[
   {text:'Tippe in der Stadt auf das Meistergebäude, über dem Valoras Symbol und der grüne Fortschrittsbalken angezeigt werden.',
    image:'valoraBuilding',marks:[box([304,931,709,1260],'Meistergebäude öffnen')]},
   {text:'Öffne Valoras „Stats“ und tippe auf das Fähigkeitssymbol unten links. „Hunter Instinct Lv. 9“ gibt hier +24 % eigene Bear Hunt Damage Points. Der „Next Level Bonus“ (+27 %) gilt noch NICHT. Die Beziehungsstufe „Close 2“ oben links ist ebenfalls kein Fähigkeitslevel.',
    image:'valoraHunter',marks:[
     box([65,1064,469,1155],'Hunter Instinct Level 9','gold'),
     box([505,1272,615,1350],'Current Bonus: +24 %','green'),
     box([54,1756,170,1898],'Hunter-Instinct-Symbol unten links','blue')
    ]},
   {text:'Wechsle zu „Skills“ und tippe unten rechts auf „Savage Advantage“. Das gezeigte Level 10 bringt +30.000 Bear Hunt Squad Capacity. WICHTIG: Hunter Instinct und Savage Advantage haben UNABHÄNGIGE Fähigkeitslevel; keinesfalls automatisch für beide denselben Wert eintragen.',
    image:'valoraSavage',marks:[
     box([73,1327,639,1452],'Savage Advantage Level 10','gold'),
     box([74,1453,918,1575],'+30.000 Bear Hunt Squad Capacity','green'),
     box([735,1658,931,1886],'Savage Advantage – Fähigkeit unten rechts','orange'),
     box([474,1920,935,2048],'Skills','blue')
    ]}
  ]}
 };
 // Resolve translations when a guide is opened: the same icon reflects the
 // currently selected DE/EN/FR/ES language without altering screenshots.
 const LOCALES=root.NRW_BEAR_HELP_LOCALES||{};
 function currentLanguage(){
  const value=root.NRW_BEAR_I18N?.language?.()||document.documentElement.lang||'de';
  return ['de','en','fr','es'].includes(value)?value:'de';
 }
 function uiText(value){
  return LOCALES.ui?.[currentLanguage()]?.[value]||value;
 }
 function localizedGuide(key){
  const original=GUIDES[key];
  if(!original)return null;
  const translated=LOCALES.guides?.[currentLanguage()]?.[key];
  if(!translated)return original;
  return {title:translated.title||original.title,
   steps:original.steps.map((step,i)=>{
    const row=translated.steps?.[i];
    return {...step,text:row?.[0]||step.text,
     marks:(step.marks||[]).map((mark,j)=>({...mark,text:row?.[1]?.[j]||mark.text}))};
   })};
 }
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
  if(!source)return node('p','bear-name-help-pending',uiText('📷 Bild lädt …'));
  const sourceRect=CROPS[step.image],focusRect=GUIDE_CROPS[guideKey]?.[stepIndex]||sourceRect;
  const [ox,oy,or,ob]=sourceRect,[x,y,r,b]=focusRect;
  const srcWidth=or-ox,srcHeight=ob-oy;
  const width=r-x,height=b-y;
  if(x<ox||y<oy||r>or||b>ob||width<=0||height<=0){
   console.error('[Bear Help] Invalid crop bounds',guideKey,stepIndex);
   return node('p','bear-name-help-pending',uiText('Bildbereich vorübergehend nicht verfügbar.'));
  }
  const pane=node('div','bear-name-help-photo-scroll'),canvas=node('div','bear-name-help-photo');
  canvas.style.aspectRatio=width+' / '+height;
  // Scale the screenshot so its ORIGINAL pixel coordinates still map 1:1
  // to the focused viewport, even if the WebP was resized at build time.
  const maxImageHeight=Math.max(205,Math.min(400,Math.round((window.visualViewport?.height||window.innerHeight||780)*0.44)));
  canvas.style.width='min(100%, '+Math.round(width/height*maxImageHeight)+'px)';
  const img=node('img','bear-name-help-image');img.src=source;
  img.alt=uiText('Original Kingshot-Screenshot: ')+step.image;img.loading='eager';img.draggable=false;
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
   // Avoid badges covering the tiny Roman T and golden TG in screenshots.
   // All annotations stay as narrow, transparent outlines over original pixels.
   frame.style.background='transparent';
   frame.style.boxShadow='none';
   frame.style.borderWidth='2px';
   frame.style.borderRadius='4px';
   canvas.append(frame);
   const label=node('div','bear-name-help-legend-item');
   const swatch=node('span','bear-name-help-legend-number bear-name-help-legend-'+mark.color,'');
   swatch.style.minWidth='15px';swatch.style.width='15px';swatch.style.height='15px';
   swatch.style.borderRadius='4px';swatch.setAttribute('aria-hidden','true');
   label.append(swatch,node('span','',mark.text));
   legend.append(label);
  });
  pane.append(canvas);
  const zoom=node('button','bear-name-help-zoom',uiText('🔍 Bild vergrößern'));zoom.type='button';
  const originalWidth=canvas.style.width;
  zoom.addEventListener('click',()=>{
   const expanded=pane.classList.toggle('zoomed');
   // Width must be changed inline: a CSS rule cannot override the inline
   // compact-size setting. All marker coordinates scale together with img.
   canvas.style.width=expanded?
    Math.max(520,Math.round(width/height*maxImageHeight*1.8))+'px':originalWidth;
   zoom.textContent=expanded?uiText('Bild verkleinern'):uiText('🔍 Bild vergrößern');
  });
  const group=node('div','bear-name-help-visual');group.append(pane,zoom,legend);
  return group;
 }
 function open(key){
  const guide=localizedGuide(key);if(!guide)return;
  close();previousFocus=document.activeElement;
  const overlay=node('div','bear-name-help-backdrop');
  const panel=node('section','bear-name-help-dialog');
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  const id='bear-help-heading';panel.setAttribute('aria-labelledby',id);
  const heading=node('h3','',guide.title);heading.id=id;
  const closeButton=node('button','bear-name-help-close','×');closeButton.type='button';
  closeButton.setAttribute('aria-label',uiText('Hilfe schließen'));closeButton.addEventListener('click',close);
  const top=node('div','bear-name-help-top');top.append(heading,closeButton);panel.append(top);
  let index=0;
  const contents=node('div','bear-name-help-content');
  const nav=node('div','bear-name-help-nav');
  const back=node('button','bear-name-btn',uiText('← Zurück'));
  const next=node('button','bear-name-btn primary',uiText('Weiter →'));
  const done=node('button','bear-name-btn primary',uiText('Verstanden ✓'));
  for(const b of [back,next,done])b.type='button';
  const counter=node('span','bear-name-help-counter','');
  function draw(){
   if(dialog!==overlay)return;
   const step=guide.steps[index];contents.replaceChildren();
   const note=node('p','bear-name-help-explainer',step.text);contents.append(note);
   if(step.image){
    if(root.NRW_BEAR_HELP_IMAGES?.[step.image])contents.append(photo(step,key,index));
    else{
     contents.append(node('p','bear-name-help-pending',uiText('📷 Screenshot wird geladen …')));
     void loadImages().then(ok=>{
      if(dialog===overlay&&guide.steps[index]===step){
       if(ok)draw();
       else contents.querySelector('.bear-name-help-pending').textContent=
        uiText('Screenshot konnte nicht geladen werden. Die Anleitung bleibt lesbar.');
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
  b.setAttribute('aria-label',uiText('Hilfe: ')+localizedGuide(key).title);
  b.title=uiText('Wo finde ich diesen Wert?');
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
 root.NRW_BEAR_HELP={icon,decorateField,open,GUIDES,localizedGuide,uiText,CROPS,GUIDE_CROPS};
})(window);
