/* Presentation only. The exact hostname is the production boundary. */
(() => {
  'use strict';
  if(location.hostname!=='boltotelli.github.io')return;
  document.documentElement.classList.add('pages-atelier');
  function run(){
    const nav=document.getElementById('sideNav'),main=document.querySelector('.workspace main');
    if(!nav||!main||nav.dataset.atelierReady)return;
    nav.dataset.atelierReady='true';
    const words={
      de:['Allianz','Einsätze','Organisation','Verwaltung','Zum Inhalt springen','Module öffnen','Schließen','Leitungszentrale','NRW · Königreich 1044','Bärenfalle planen','Swordland planen','Teilnahme prüfen','Hinweise zum Betriebsstand','Passwort ändern'],
      en:['Alliance','Operations','Organization','Management','Skip to content','Open modules','Close','Leadership console','NRW · Kingdom 1044','Plan bear trap','Plan Swordland','Review attendance','Service information','Change password'],
      fr:['Alliance','Opérations','Organisation','Gestion','Aller au contenu','Ouvrir les modules','Fermer','Centre de direction','NRW · Royaume 1044','Planifier le piège','Planifier Swordland','Voir la participation','Informations de service','Changer le mot de passe'],
      es:['Alianza','Operaciones','Organización','Gestión','Saltar al contenido','Abrir módulos','Cerrar','Centro de dirección','NRW · Reino 1044','Planificar trampa','Planificar Swordland','Ver participación','Información de servicio','Cambiar contraseña']};
    const items=[...nav.querySelectorAll('.nav-item')];
    const paths={overview:'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',roster:'M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m3 10v-3a5 5 0 0 0-3-4M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',performance:'M4 4v16h17M8 15l4-5 4 3 5-8',bear:'M5 20h14M6 17V8l6-5 6 5v9M9 17v-5h6v5m-5-9h4',fightclub:'m4 3 14 14m-1-4 4 4-4 4-4-4M20 3 6 17m1-4-4 4 4 4 4-4',participation:'M4 4h16v17H4ZM8 2v4m8-4v4M8 13l3 3 5-6',transfers:'M3 7h17l-4-4m4 4-4 4M21 17H4l4-4m-4 4 4 4',laws:'M7 3h12v18H5V5a2 2 0 0 1 2-2ZM5 17h14M9 7h6m-6 4h6',events:'M3 5h18v16H3ZM7 3v4m10-4v4M3 11h18m-13 4h3m3 0h3',discord:'M4 4h16v13H9l-5 4ZM8 9h8m-8 4h5',settings:'M4 6h16M4 12h16M4 18h16M6 4h4v4H6Zm8 6h4v4h-4Zm-6 6h4v4H8Z'};
    // Bear head: rounded ears, face and muzzle; no building/house metaphor.
    paths.bear='M5 9C2 8 2 3 5.2 3c1.4 0 2.3.8 2.7 2a9 9 0 0 1 8.2 0c.4-1.2 1.3-2 2.7-2C22 3 22 8 19 9c.7 1.1 1 2.4 1 3.8C20 17.7 16.6 21 12 21S4 17.7 4 12.8C4 11.4 4.3 10.1 5 9ZM8.5 11h.01m7 0h.01M8.3 16a3.7 3 0 1 1 7.4 0 3.7 3 0 1 1-7.4 0Zm2.7-1.5h2l-1 1Zm1 1v1.5';
    const iconSVG=tab=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[tab]||paths.overview)+'"/></svg>';
    items.forEach(item=>{const icon=item.querySelector('i');if(icon&&paths[item.dataset.tab]){icon.innerHTML=iconSVG(item.dataset.tab);icon.setAttribute('aria-hidden','true');}});
    const groups=['overview','bear','transfers','laws'].map(tab=>{const before=nav.querySelector('[data-tab="'+tab+'"]');const node=document.createElement('div');node.className='pages-nav-group';node.setAttribute('aria-hidden','true');before?.before(node);return{node,before};});
    main.id||='workspaceMain';main.tabIndex=-1;
    const skip=document.createElement('a');skip.className='pages-skip';skip.href='#'+main.id;skip.addEventListener('click',()=>main.focus());document.body.prepend(skip);
    const header=document.createElement('div');header.className='os-page-header';
    const titleBlock=document.createElement('div'),heading=document.createElement('h1'),scope=document.createElement('p');titleBlock.append(heading,scope);
    titleBlock.className='os-title-block';
    const moduleIcon=document.createElement('span');moduleIcon.className='os-module-icon';moduleIcon.setAttribute('aria-hidden','true');titleBlock.prepend(moduleIcon);
    const actions=document.createElement('div');actions.className='os-header-actions';
    const shortcuts=['bear','fightclub','participation'].map(tab=>{const button=document.createElement('button');button.type='button';button.className='ghost';button.addEventListener('click',()=>nav.querySelector('[data-tab="'+tab+'"]')?.click());actions.append(button);return{tab,button};});
    const appearance=document.createElement('label');appearance.className='os-appearance';
    const appearanceText=document.createElement('span'),appearanceSelect=document.createElement('select');
    appearanceSelect.className='control';appearanceSelect.id='osAppearance';
    for(const [value,text] of [['clear','Klar'],['bento','Bento'],['neumorph','Neumorph']]){const option=document.createElement('option');option.value=value;option.textContent=text;appearanceSelect.append(option);}
    let savedAppearance='neumorph';try{savedAppearance=localStorage.getItem('allianceos-appearance')||'neumorph';}catch{}
    if(!['clear','bento','neumorph'].includes(savedAppearance))savedAppearance='neumorph';
    appearanceSelect.value=savedAppearance;document.documentElement.dataset.appearance=savedAppearance;
    appearanceSelect.addEventListener('change',()=>{document.documentElement.dataset.appearance=appearanceSelect.value;try{localStorage.setItem('allianceos-appearance',appearanceSelect.value);}catch{}});
    appearance.append(appearanceText,appearanceSelect);
    header.append(titleBlock,appearance,actions);document.getElementById('liveArea')?.prepend(header);
    // Hero IDs remain intact for application renderers; only their visual role changes.
    const notice=document.querySelector('[data-page="overview"] > .notice');let noticeSummary;
    if(notice){const details=document.createElement('details');details.className='os-notice';noticeSummary=document.createElement('summary');notice.before(details);details.append(noticeSummary,notice);}
    const anchor=document.createComment('Original module navigation position');nav.before(anchor);
    const home=document.querySelector('.side-foot a');
    const homeAnchor=document.createComment('Original Welcome link position');home?.before(homeAnchor);
    const menu=document.createElement('dialog');menu.className='os-nav-dialog';menu.id='osModuleMenu';menu.setAttribute('aria-labelledby','osMenuTitle');
    const menuHead=document.createElement('div');menuHead.className='os-nav-heading';
    const menuTitle=document.createElement('strong');menuTitle.id='osMenuTitle';
    const close=document.createElement('button');close.type='button';close.className='ghost';close.addEventListener('click',()=>menu.close());menuHead.append(menuTitle,close);
    const password=document.createElement('button');password.type='button';password.className='ghost full';password.addEventListener('click',()=>{menu.close();document.getElementById('changePasswordBtn')?.click();});menu.append(menuHead,password);document.body.append(menu);
    const toggle=document.createElement('button');toggle.type='button';toggle.className='ghost os-menu-toggle';toggle.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';toggle.setAttribute('aria-controls',menu.id);toggle.setAttribute('aria-expanded','false');
    toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true');});
    menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');toggle.focus();});
    menu.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;
      const focusable=[...menu.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    });
    nav.addEventListener('click',e=>{if(e.target.closest('.nav-item')&&menu.open)menu.close();});
    menu.addEventListener('click',e=>{if(e.target!==menu)return;const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)menu.close();});
    document.querySelector('.topbar')?.prepend(toggle);
    const compact=matchMedia('(max-width:1100px)');
    const moveNav=()=>{if(menu.open)menu.close();if(compact.matches){menu.insertBefore(nav,password);if(home)menu.append(home);}else{anchor.after(nav);if(home)homeAnchor.after(home);}};compact.addEventListener('change',moveNav);moveNav();
    const update=()=>{
      const language=document.getElementById('language')?.value||'de';
      const l=words[language]||words.de;
      appearanceText.textContent=({de:'Ansicht',en:'Appearance',fr:'Apparence',es:'Apariencia'})[language]||'Appearance';
      appearanceSelect.options[0].textContent=({de:'Klar',en:'Clear',fr:'Épuré',es:'Simple'})[language]||'Clear';
      const active=items.find(x=>x.classList.contains('active'));
      items.forEach(x=>{if(x===active)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});
      groups.forEach(({node,before},i)=>{node.textContent=l[i];node.hidden=before?.hidden===true;});
      const label=active?.querySelector('[data-i18n]')?.textContent||l[7];heading.textContent=label;header.dataset.tab=active?.dataset.tab||'overview';moduleIcon.innerHTML=iconSVG(active?.dataset.tab||'overview');
      const breadcrumb=document.getElementById('pageLabel');if(breadcrumb)breadcrumb.textContent=label;
      scope.textContent=l[8];skip.textContent=l[4];toggle.setAttribute('aria-label',l[5]);close.textContent=l[6];menuTitle.textContent=l[7];password.textContent=l[13];password.hidden=document.getElementById('changePasswordBtn')?.hidden!==false;
      shortcuts.forEach(({tab,button},i)=>{button.textContent=l[9+i];button.hidden=nav.querySelector('[data-tab="'+tab+'"]')?.hidden!==false;});actions.hidden=active?.dataset.tab!=='overview';
      if(noticeSummary)noticeSummary.textContent=l[12];
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content',document.documentElement.dataset.theme==='light'?'#f4f5f6':'#0c0d0e');
    };
    const observer=new MutationObserver(update);items.forEach(x=>observer.observe(x,{attributes:true,attributeFilter:['class','hidden']}));observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    const labels=new MutationObserver(update);items.forEach(x=>{const span=x.querySelector('[data-i18n]');if(span)labels.observe(span,{childList:true,subtree:true,characterData:true});});
    document.getElementById('language')?.addEventListener('change',()=>queueMicrotask(update));
    // Reorder disclosures only after a module renders. Move the original nodes,
    // preserving inputs, delegated handlers and the application's source text.
    const moduleRoot=document.getElementById('participationRoot');
    const enhanceParticipation=()=>{
      if(!moduleRoot)return;
      const l=document.getElementById('language')?.value||'de';
      const text={de:'Planungshinweise',en:'Planning notes',fr:'Notes de planification',es:'Notas de planificación'}[l]||'Planning notes';
      for(const container of moduleRoot.querySelectorAll('.participation-picker,.participation-players')){
        const notes=[...container.querySelectorAll(':scope > p.small-note')];
        if(!notes.length)continue;
        const disclosure=document.createElement('details');disclosure.className='os-module-notes';
        const summary=document.createElement('summary');summary.textContent=text;disclosure.append(summary);
        notes[0].before(disclosure);notes.forEach(note=>disclosure.append(note));
      }
    };
    if(moduleRoot)new MutationObserver(enhanceParticipation).observe(moduleRoot,{childList:true});
    const bearRoot=document.getElementById('bearManagementRoot');
    let rosterOpen=true;
    // This is a two-role choice. The original checkbox is an implementation
    // detail kept only for the existing application's checked-value contract.
    const enhanceBear=()=>{
      if(!bearRoot)return;
      const roster=bearRoot.querySelector('[data-bear-roster]');
      if(roster&&!roster.dataset.osDisclosure){
        roster.dataset.osDisclosure='true';roster.open=rosterOpen;
        roster.addEventListener('toggle',()=>{rosterOpen=roster.open;});
      }
      for(const shell of bearRoot.querySelectorAll('.bear-switch:not(.os-role-shell)')){
        const original=shell.querySelector('input[type=checkbox]');if(!original)continue;
        const names=[...shell.querySelectorAll(':scope > span')].map(x=>x.textContent.trim());
        const track=document.createElement('span');track.className='os-role-choice';track.setAttribute('role','radiogroup');
        const lang=document.getElementById('language')?.value||'de';
        track.setAttribute('aria-label',({de:'Rally-Rolle',en:'Rally role',fr:'Rôle du ralliement',es:'Rol de rally'})[lang]||'Rally role');
        const thumb=document.createElement('span');thumb.className='os-role-thumb';thumb.setAttribute('aria-hidden','true');track.append(thumb);
        const buttons=names.map((name,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.textContent=name;b.disabled=original.disabled;b.dataset.roleValue=String(i);track.append(b);return b;});
        const paint=()=>{track.dataset.value=original.checked?'1':'0';thumb.style.transform='';buttons.forEach((b,i)=>{const active=i===Number(original.checked);b.setAttribute('aria-checked',String(active));b.tabIndex=active?0:-1;});};
        const choose=(i,keyboard=false)=>{
          track.dataset.keyboard=String(keyboard);
          const changed=original.checked!==Boolean(i);original.checked=Boolean(i);paint();
          if(changed)original.dispatchEvent(new Event('change',{bubbles:true}));
          if(keyboard)buttons[i]?.focus();
        };
        original.hidden=true;original.removeAttribute('role');original.setAttribute('aria-hidden','true');original.tabIndex=-1;
        shell.classList.add('os-role-shell');shell.replaceChildren(original,track);paint();
        // A native label would still activate the hidden checkbox when its
        // heading is clicked. The radio group provides its own accessible name.
        const legacyLabel=shell.closest('label.bear-switch-label');
        if(legacyLabel){const field=document.createElement('div');for(const a of legacyLabel.attributes)if(a.name!=='for')field.setAttribute(a.name,a.value);field.append(...legacyLabel.childNodes);legacyLabel.replaceWith(field);}
        let gesture=null,suppressClick=false;
        track.addEventListener('pointerdown',e=>{
          if(e.button!==0||original.disabled||gesture)return;
          gesture={id:e.pointerId,x:e.clientX,dragged:false};track.setPointerCapture(e.pointerId);track.dataset.keyboard='false';
        });
        track.addEventListener('pointermove',e=>{
          if(!gesture||gesture.id!==e.pointerId)return;
          if(Math.abs(e.clientX-gesture.x)>6)gesture.dragged=true;
          if(!gesture.dragged)return;
          const r=track.getBoundingClientRect(),travel=(r.width-8)/2;
          const x=Math.max(0,Math.min(travel,e.clientX-r.left-travel/2-4));
          track.dataset.dragging='true';thumb.style.transform='translateX('+x+'px)';
        });
        track.addEventListener('pointerup',e=>{
          if(!gesture||gesture.id!==e.pointerId)return;
          const r=track.getBoundingClientRect();suppressClick=gesture.dragged;gesture=null;delete track.dataset.dragging;
          choose(e.clientX<r.left+r.width/2?0:1);track.releasePointerCapture(e.pointerId);
        });
        const cancel=()=>{gesture=null;delete track.dataset.dragging;paint();};
        track.addEventListener('pointercancel',cancel);
        track.addEventListener('lostpointercapture',()=>{if(gesture)cancel();});
        track.addEventListener('click',e=>{
          // Suppress the legacy wrapping label's checkbox activation: the
          // role group owns selection, including pointer-captured clicks.
          e.preventDefault();
          if(suppressClick){suppressClick=false;e.preventDefault();return;}
          const b=e.target.closest('[data-role-value]');if(b)choose(Number(b.dataset.roleValue),e.detail===0);
        });
        track.addEventListener('keydown',e=>{
          if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
          e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?1:Number(!original.checked);choose(i,true);
        });
        original.addEventListener('change',paint);
      }
    };
    if(bearRoot)new MutationObserver(enhanceBear).observe(bearRoot,{childList:true});
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
