import {OUTPOST_CATALOG,OUTPOST_SOURCE} from './tools-outpost-catalog.js?v=20261105-territory-season-1';
import {prepareTerritory,rewardScope,manualReward} from './territory-state.js?v=20261105-territory-season-1';
import {loadActiveGiftCodes} from './gift-feed.js?v=20261105-followup-1';
import {workbenchText,hasWorkbenchText} from './tools-workbench-locales.js?v=20261106-territory-holder-1';
import {NOTICE_ITEM_TAGS,NOTICE_SPECIAL_ICONS,NOTICE_SYMBOL_GROUPS} from './tools-notice-palette.js?v=20261104-tools-i18n-1';
import {WORKBENCH_TOOLS,rallyPlan,rallyText,utc,insertText,coordinateTag,OUTPOST_TYPES,outpostSummary,territoryGameText} from './tools-workbench-model.js?v=20261105-territory-season-1';
import {TERRITORY_SITES,TERRITORY_SOURCE,CURRENT_TERRITORY_PHASE,territoryReward} from './tools-territory-catalog.js?v=20261105-territory-season-1';
import {rankKvk} from './tools-kvk.js?v=20261104-kvk-order-1';

const statusLabels={pending:'Noch offen',processing:'Wird eingelöst',success:'Eingelöst',already:'Bereits eingelöst',failed:'Fehlgeschlagen',unknown:'Ergebnis unbekannt'};
const providerLabels={40001:'Spieler nicht gefunden',40005:'Code-Limit erreicht',40006:'Voraussetzung nicht erfüllt',40007:'Code abgelaufen',40010:'Voraussetzung nicht erfüllt',40011:'Belohnung dieses Typs bereits erhalten',40014:'Code ungültig',40019:'Zu viele Einlösungen – später erneut versuchen',40020:'Spieler-ID oder Königreich prüfen'};
const today=()=>new Date().toISOString().slice(0,10);
function blank(kind){
 const data=kind==='notice'?{mode:'alliance',text:''}:kind==='rally'?{date:today(),time:'19:00:00',gap:0,leaders:[{name:'',gather:'05:00',march:'01:00'}]}:prepareTerritory({date:today(),season:CURRENT_TERRITORY_PHASE.season,phase:CURRENT_TERRITORY_PHASE.phase,lawNote:'',selectionOrder:'',sites:{},outposts:[]});
 return {id:crypto.randomUUID(),kind,title:'',data,version:0,dirty:false};
}
export function createToolsWorkbench({root,getState,getAccountId=()=>null,getLanguage=()=>'de',request,esc,can}){
 let mode='',target=null,documents=[],laws=[],loaded=false,busy=false,message='',epoch=0,timer=null,docsLoading=false,giftLoop=0,paletteQuery='',noticeUi={color:'#d4ae62',kingdom:'1044',x:'',y:''},kvkRuns=[],selectedKvk='',giftAudienceOpen=false,outpostFilter='all',outpostQuery='',selectedOutpost='';
 let drafts={notice:blank('notice'),rally:blank('rally'),territory:blank('territory')};
 let territoryInitialized=false,territoryChosen=false,localSnapshot=null,territoryBackedUp=false;
 let gifts={loaded:false,candidates:[],runs:[],selected:new Set(),kingdoms:{},code:'',run:null,receipts:[],running:false,activeCodes:[],feedLoading:false,feedError:false,feedUpdatedAt:null};
 const language=()=>getLanguage(),t=(key,values)=>workbenchText(language(),key,values);
 const siteName=site=>t(site.key.startsWith('sanc-')?t('Sanctuary {n}'):t('Fort {n}'),{n:site.key.split('-')[1]});
 const lawValue=(law,field)=>law[field]?.[language()]||(hasWorkbenchText(law[field]?.de)?t(law[field].de):law[field]?.en||law[field]?.de||'');
 const lawHtml=()=>laws.map(l=>`${!l.body?.[language()]&&!hasWorkbenchText(l.body?.de)?`<p class="small-note">${esc(t('Diese Fassung liegt noch nicht in deiner Sprache vor. Angezeigt wird die verfügbare Originalfassung.'))}</p>`:''}<h4>${esc(t('Gesetz {number}',{number:l.number}))} · ${esc(lawValue(l,'title'))}</h4><p class="wb-law">${esc(lawValue(l,'body'))}</p>`).join('')||`<p>${esc(t(loaded?t('Keine veröffentlichten Gesetze gefunden.'):t('Gesetzestext wird geladen.')))}</p>`;
 const outpostText=summary=>t('{active} aktive Typ-/Stufengruppen · {disconnected} gehaltene Posten ohne Anbindung',summary);
 const d=()=>drafts[mode],call=(action,body={})=>request('bootstrap',{action,...body});
 const input=(label,name,value,type='text',extra='')=>`<label>${esc(t(label))}<input class="control" data-wb-field="${name}" type="${type}" value="${esc(value??'')}" ${extra}></label>`;
 const button=(action,label,cls='ghost',extra='')=>`<button type="button" class="${cls}" data-wb-action="${action}" ${extra}>${esc(t(label))}</button>`;
 function territoryDraftKey(){
  const account=getAccountId(),alliance=getState()?.alliance?.code;
  return account&&alliance?'aos:territory-draft:v1:'+alliance+':'+account:null;
 }
 function restoreTerritoryDraft(){
  if(territoryInitialized)return;
  territoryInitialized=true;
  const key=territoryDraftKey();
  if(!key)return;
  try{
   const raw=localStorage.getItem(key);
   if(!raw)return;
   const saved=JSON.parse(raw);
   if(saved?.kind!=='territory'||!saved.dirty||!saved.id||!saved.data)return;
   drafts.territory={...saved,data:prepareTerritory(saved.data)};
   territoryChosen=true;
   localSnapshot=raw;
   territoryBackedUp=true;
  }catch{/* Storage may be disabled. Shared saves are still available. */}
 }
 function persistTerritoryDraft(){
  const key=territoryDraftKey();
  territoryBackedUp=false;
  if(!key)return false;
  try{
   const snapshot=JSON.stringify(drafts.territory);
   localStorage.setItem(key,snapshot);
   localSnapshot=snapshot;
   territoryBackedUp=true;
   return true;
  }catch{return false;}
 }
 function clearTerritoryDraft(){
  const key=territoryDraftKey();
  try{if(key&&localSnapshot&&localStorage.getItem(key)===localSnapshot)localStorage.removeItem(key);}catch{}
  localSnapshot=null;
  territoryBackedUp=false;
 }
 function loadLatestTerritory(){
  if(territoryChosen||drafts.territory.dirty||drafts.territory.version)return false;
  const latest=documents.find(item=>item.kind==='territory');
  if(!latest)return false;
  drafts.territory={...latest,data:prepareTerritory(latest.data),dirty:false};
  territoryChosen=true;
  return true;
 }
 function previousHolders(sites){
  return Object.fromEntries(Object.entries(sites).flatMap(([key,site])=>{
   const holder=site.holder?.trim()||site.assigned?.trim();
   return holder?[[key,{holder}]]:[];
  }));
 }
 const localDraftLabel=()=>t(territoryBackedUp?'Entwurf in diesem Browser gesichert. Mit Speichern für die Allianz übernehmen.':'Entwurf noch nicht gesichert. Bitte vor dem Schließen speichern.');
 function header(){const current=d();return `<div class="wb-heading"><div><span class="eyebrow">${esc(t("NRW · TOOLS"))}</span><h3>${esc(t(WORKBENCH_TOOLS[mode]))}</h3></div><div class="tools-actions">${button('new',t('Neu'))}${button('clone',t('Kopie anlegen'))}${button('save',busy?t('Speichert …'):t('Speichern'),'primary',busy||!current.dirty?'disabled':'')}</div></div><p class="small-note" data-wb-status role="status" aria-live="polite">${esc(t(message)||(!loaded?t('Gespeicherte Stände werden geladen …'):current.dirty?t('Ungespeicherte Änderungen'):current.version?t('Gemeinsam gespeichert'):t('Neuer Entwurf')))}</p>${mode==='territory'?`<p class="small-note" data-wb-local-draft ${current.dirty?'':'hidden'}>${esc(localDraftLabel())}</p>`:''}<div class="wb-archive"><label>${esc(t(mode==='notice'?t('Gespeicherte Vorlagen'):t('Gespeicherte Stände')))}<select class="control" data-wb-archive ${busy?'disabled':''}><option value="">${current.version?t('Gespeicherten Stand wählen'):t('Neuer Entwurf')}</option>${documents.filter(x=>x.kind===mode).map(x=>`<option value="${x.id}" ${x.id===current.id?'selected':''}>${esc(x.title)} · ${esc(x.updated_at.slice(0,10))}</option>`).join('')}</select></label>${button('reload',t('Liste aktualisieren'))}${current.version?button('delete',t('Löschen')):''}</div>${input(mode==='notice'?t('Vorlagenname'):t('Bezeichnung'),'title',current.title,'text','maxlength="100"')}`;}
 function render(){
  if(!target||!can('tools'))return;
  target.innerHTML=`<section class="wb" data-wb-mode="${mode}">${mode==='gifts'?giftHtml():header()+(mode==='notice'?noticeHtml():mode==='rally'?rallyHtml():territoryHtml())}</section>`;
  if(mode==='rally')paintRally();if(mode==='notice'){paintCounter();filterPalette(!!paletteQuery);}if(mode==='gifts'){paintGiftProgress();target.querySelectorAll('[data-wb-gift-row]').forEach(row=>row.hidden=!row.dataset.search.includes((gifts.filter||'').toLowerCase()));}
 }
 function noticeHtml(){const n=d().data;return `<div class="wb-editor-layout"><article class="card wb-panel"><div class="tools-periods" role="group" aria-label="${esc(t("Nachrichtentyp"))}">${['alliance','chat'].map(m=>button('notice-mode',m==='alliance'?t('Allianz-Mitteilung'):t('Chat'),'ghost',`data-value="${m}" aria-pressed="${n.mode===m}"`)).join('')}</div><label for="wb-notice-text">${esc(t("Nachricht"))}</label><textarea id="wb-notice-text" class="control wb-notice-text" maxlength="2000" spellcheck="true">${esc(n.text)}</textarea><div class="wb-editor-footer"><span data-wb-count></span>${button('copy',t('Spieltext kopieren'),'primary')}</div><details class="wb-details"><summary>${esc(t("Textvorschau"))}</summary><p class="small-note">${esc(t("Tags und Sonderzeichen können im Spiel anders aussehen. Die Vorschau zeigt den kopierten Text."))}</p><pre class="wb-preview" data-wb-preview></pre></details></article><aside class="card wb-panel wb-notice-palette">${noticePaletteHtml()}<h4>${esc(t("Formatierung"))}</h4><p class="small-note">${esc(t("Text markieren und formatieren. Spiel-Tags sind teilweise ungetestet."))}</p><div class="wb-palette">${button('wrap',t('Fett'),'ghost','data-before="&lt;b&gt;" data-after="&lt;/b&gt;"')}${button('wrap',t('Kursiv'),'ghost','data-before="&lt;i&gt;" data-after="&lt;/i&gt;"')}<label class="wb-color">${esc(t("Farbe"))}<input type="color" value="${esc(noticeUi.color)}" data-wb-color></label>${button('color',t('Farbe setzen'))}</div><details class="wb-details"><summary>${esc(t("Koordinaten-Link"))}</summary><div class="wb-coordinates"><label>${esc(t("Königreich"))}<input class="control" data-wb-kingdom type="number" min="1" max="999999" value="${esc(noticeUi.kingdom)}"></label><label>X<input class="control" data-wb-x type="number" min="0" max="1199" value="${esc(noticeUi.x)}"></label><label>Y<input class="control" data-wb-y type="number" min="0" max="1199" value="${esc(noticeUi.y)}"></label></div>${button('coords',t('Koordinaten einfügen'))}</details></aside></div>`;}
 function noticePaletteHtml(){
  const icons=(rows,type)=>`<div class="wb-icon-grid">${rows.map(item=>`<button type="button" class="ghost wb-icon-button" data-wb-action="insert" data-wb-icon="${item.id}" data-wb-icon-type="${type}" data-value="${esc(item.value)}" data-wb-icon-search-text="${esc(t(item.label)+' '+item.label+' '+item.reference+' '+item.value)}" title="${esc(t(item.label)+' · '+(type==='tag'?item.value:'U+'+item.codepoint.toString(16).toUpperCase()))}" aria-label="${esc(t('{name} einfügen ({type})',{name:t(item.label),type:t(type==='tag'?'Item-Tag':'Spielzeichen')}))}">${item.image?`<img src="${esc(item.image)}" alt="" width="32" height="32" loading="lazy" decoding="async">`:''}<span>${esc(t(item.label))}</span></button>`).join('')}</div>`;
  return `<h4>${esc(t("Icons & Zeichen"))}</h4><label>${esc(t("Icon suchen"))}<input class="control" data-wb-icon-search type="search" placeholder="${esc(t("z. B. Brot, Hammer, Speedup …"))}" value="${esc(paletteQuery)}"></label><p class="small-note">${esc(t('{tags} Item-Tags · {characters} Spielzeichen. In Allianz-Mitteilungen teilweise ungetestet.',{tags:NOTICE_ITEM_TAGS.length,characters:NOTICE_SPECIAL_ICONS.length}))}</p><p class="small-note" data-wb-icon-empty role="status" hidden>${esc(t("Kein passendes Icon gefunden. Suche auch nach dem englischen Namen."))}</p><details class="wb-details" data-wb-icon-group data-wb-default-open="true" open><summary>${esc(t("Item-Icons (Text-Tags)"))} <span data-wb-icon-group-count>${NOTICE_ITEM_TAGS.length}</span></summary><p class="small-note">${esc(t("Fügt den Item-Tag ein. Dies ist meist zuverlässiger als das Sonderzeichen."))}</p>${icons(NOTICE_ITEM_TAGS,'tag')}</details><details class="wb-details" data-wb-icon-group data-wb-default-open="false"><summary>${esc(t("Weitere Icons (Sonderzeichen)"))} <span data-wb-icon-group-count>${NOTICE_SPECIAL_ICONS.length}</span></summary><p class="small-note">${esc(t("Fügt das Spielzeichen ein. Über „Spieltext kopieren“ ins Spiel übernehmen; im Browser kann stattdessen ein Kästchen erscheinen."))}</p>${icons(NOTICE_SPECIAL_ICONS,'special')}</details><details class="wb-details"><summary>${esc(t("Zeichen & Rahmen"))} <span>${NOTICE_SYMBOL_GROUPS.reduce((n,g)=>n+g.values.length,0)}</span></summary>${NOTICE_SYMBOL_GROUPS.map(group=>`<h5>${esc(t(group.label))}</h5><div class="wb-palette">${group.values.map(value=>button('insert',value,'ghost',`data-value="${esc(value)}" aria-label="${esc(value+' '+t('einfügen'))}"`)).join('')}</div>`).join('')}</details>`;
 }
 function filterPalette(updateOpen=false){
  const normalize=s=>s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''),query=normalize(paletteQuery.trim());let total=0;
  target?.querySelectorAll('[data-wb-icon-group]').forEach(group=>{let count=0;group.querySelectorAll('[data-wb-icon]').forEach(b=>{b.hidden=query!==''&&!normalize(b.dataset.wbIconSearchText).includes(query);if(!b.hidden)count++;});group.querySelector('[data-wb-icon-group-count]').textContent=count;group.hidden=count===0;total+=count;if(updateOpen)group.open=query?count>0:group.dataset.wbDefaultOpen==='true';});
  const empty=target?.querySelector('[data-wb-icon-empty]');if(empty)empty.hidden=total>0;
 }
 function paintCounter(){const n=target?.querySelector('[data-wb-count]');if(n)n.textContent=drafts.notice.data.text.length+' / 2000';const p=target?.querySelector('[data-wb-preview]');if(p)p.textContent=drafts.notice.data.text;}
 function rallyHtml(){const r=d().data;return `<article class="card wb-panel"><div class="wb-form-grid">${input('Ankunftsdatum (UTC)','date',r.date,'date')}${input('Erste Ankunft (UTC)','time',r.time,'time','step="1"')}${input('Ankunftsabstand (Sekunden; 0 = gleichzeitig)','gap',r.gap,'number','min="0" max="3600"')}</div><p class="small-note">${esc(t("Reihenfolge wie unten. Sammeldauer und Marschzeit als Minuten:Sekunden. Geänderte Marschgeschwindigkeit im Spiel berücksichtigen."))}</p><div class="wb-table-scroll"><table class="wb-leaders"><thead><tr><th>${esc(t("Rally-Leader"))}</th><th>${esc(t("Sammeln (mm:ss)"))}</th><th>${esc(t("Marsch (mm:ss)"))}</th><th>${esc(t("Reihenfolge"))}</th></tr></thead><tbody>${r.leaders.map((l,i)=>`<tr data-wb-leader="${i}"><td><input class="control" aria-label="${esc(t('Leader {n}',{n:i+1}))}" data-wb-leader-field="name" maxlength="80" value="${esc(l.name)}" list="wb-roster-names"></td><td><input class="control" aria-label="${esc(t('Sammeldauer {n}',{n:i+1}))}" data-wb-leader-field="gather" value="${esc(l.gather)}" placeholder="05:00"></td><td><input class="control" aria-label="${esc(t('Marschzeit {n}',{n:i+1}))}" data-wb-leader-field="march" value="${esc(l.march)}" placeholder="01:30"></td><td><div class="wb-row-actions">${button('up','↑','ghost',`data-index="${i}" aria-label="${esc(t("Leader nach oben"))}" ${i===0?'disabled':''}`)}${button('down','↓','ghost',`data-index="${i}" aria-label="${esc(t("Leader nach unten"))}" ${i===r.leaders.length-1?'disabled':''}`)}${button('remove-leader',t('Entfernen'),'ghost',`data-index="${i}"`)}</div></td></tr>`).join('')}</tbody></table></div><datalist id="wb-roster-names">${(getState()?.players||[]).map(p=>`<option value="${esc(p.name)}"></option>`).join('')}</datalist>${button('add-leader',t('+ Rally-Leader'))}</article><article class="card wb-panel"><div class="wb-heading"><h4>${esc(t("Startplan · UTC"))}</h4>${button('copy',t('Chattext kopieren'),'primary')}</div><p data-wb-rally-error role="status"></p><div class="wb-table-scroll" data-wb-rally-result></div></article>`;}
 function paintRally(){try{const rows=rallyPlan(drafts.rally.data);target.querySelector('[data-wb-rally-error]').textContent='';target.querySelector('[data-wb-rally-result]').innerHTML=`<table><thead><tr><th>${esc(t("Leader"))}</th><th>${esc(t("Rally starten"))}</th><th>${esc(t("Abmarsch"))}</th><th>${esc(t("Ankunft"))}</th><th>${esc(t("Start in"))}</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${esc(r.name)}</th><td>${utc(r.start)}</td><td>${utc(r.depart)}</td><td>${utc(r.arrival)}</td><td data-wb-countdown="${r.start}"></td></tr>`).join('')}</tbody></table>`;tick();}catch(e){target.querySelector('[data-wb-rally-error]').textContent=t(e.message);target.querySelector('[data-wb-rally-result]').replaceChildren();}}
 function tick(){if(mode!=='rally'||!can('tools'))return;target?.querySelectorAll('[data-wb-countdown]').forEach(el=>{const seconds=Math.ceil((Number(el.dataset.wbCountdown)-Date.now())/1000);el.textContent=seconds<0?t('Startzeit vorbei'):Math.floor(seconds/3600)+'h '+Math.floor(seconds%3600/60)+'m '+seconds%60+'s';});}
 function outpostSummaryFor(rows){return outpostSummary(rows,OUTPOST_CATALOG);}
 function outpostMatch(o){return (outpostFilter==='all'||o.type===outpostFilter)&&(!outpostQuery||(o.name+' '+o.type+' '+o.level+' '+(o.x??'')+' '+(o.y??'')).toLocaleLowerCase().includes(outpostQuery.toLocaleLowerCase()));}
 function outpostMapHtml(rows){const known=rows.filter(o=>Number.isInteger(o.x)&&Number.isInteger(o.y));return `<div class="wb-coordinate-map"><svg viewBox="-45 -45 1300 1300" role="group" aria-label="${esc(t('Koordinatenkarte der Außenposten'))}"><rect x="0" y="0" width="1200" height="1200" fill="var(--panel)" stroke="var(--border)"/>${[0,300,600,900,1200].map(n=>`<path d="M${n} 0V1200M0 ${n}H1200" stroke="var(--border)" stroke-width="1"/><text x="${n}" y="1240" text-anchor="middle">${n}</text><text x="-12" y="${1200-n}" text-anchor="end">${n}</text>`).join('')}<text x="1260" y="1240">X</text><text x="-30" y="-14">Y</text>${known.map(o=>`<g data-wb-action="focus-outpost" data-wb-outpost-focus="${esc(o.id||String(rows.indexOf(o)))}" data-index="${rows.indexOf(o)}" role="button" tabindex="0" aria-label="${esc(t(o.type)+' · '+t('Stufe')+' '+o.level+' · X '+o.x+' · Y '+o.y)}" class="wb-map-marker ${selectedOutpost===String(rows.indexOf(o))?'selected':''}" opacity="${outpostMatch(o)?1:.18}"><title>${esc(t(o.type)+' · '+t('Stufe')+' '+o.level+' · X '+o.x+' · Y '+o.y)}</title><circle cx="${o.x}" cy="${1200-o.y}" r="17" fill="${o.owned&&o.connected?'var(--green,#8dc8a7)':o.owned?'var(--accent)':o.connected?'var(--blue,#72b4de)':'var(--muted)'}"/><text x="${o.x}" y="${1200-o.y+6}" text-anchor="middle" class="wb-map-level">${o.level}</text></g>`).join('')}</svg><ul class="wb-map-legend">${[['var(--green,#8dc8a7)','Gehalten und verbunden'],['var(--accent)','Gehalten, nicht verbunden'],['var(--blue,#72b4de)','Verbunden, nicht gehalten'],['var(--muted)','Weder gehalten noch verbunden']].map(([color,label])=>`<li><span style="background:${color}"></span>${esc(t(label))}</li>`).join('')}</ul></div>`;}
 function territoryHtml(){const territory=d().data,summary=outpostSummaryFor(territory.outposts),known=OUTPOST_CATALOG.length,scope=rewardScope(territory);
 const rewardHtml=site=>{const reward=territoryReward(site.key,territory.season,territory.phase);if(!reward)return `<p class="small-note">${esc(t('Für diese Saison und Phase noch nicht erfasst.'))}</p>`;return `<a class="wb-reward" href="${reward.image}" target="_blank" rel="noopener"><span class="wb-reward-crop"><img src="${reward.image}" alt="${esc(t(reward.name)+' · '+reward.quantity)}" style="left:-${reward.crop.x}px;top:-${reward.crop.y}px" loading="lazy" decoding="async"></span><span><b>${reward.quantity} ×</b> ${esc(t(reward.name))}</span></a>`;};
 return `<article class="card wb-panel"><div class="wb-form-grid">${input('Wochenbeginn / Stichtag','date',territory.date,'date')}<label>${esc(t('Saison'))}<select class="control" data-wb-field="season"><option value="">${esc(t('Saison nicht erfasst'))}</option>${Array.from({length:20},(_,i)=>i+1).map(n=>`<option value="${n}" ${Number(territory.season)===n?'selected':''}>${n}</option>`).join('')}</select></label><label>${esc(t('Saisonphase'))}<select class="control" data-wb-field="phase"><option value="">${esc(t('Phase auswählen'))}</option>${[1,2,3,4,5,6,7,8].map(n=>`<option ${Number(territory.phase)===n?'selected':''}>${n}</option>`).join('')}</select></label></div><p class="small-note">${esc(t('Aktueller Stand: Saison {season}, Phase {phase}',{season:CURRENT_TERRITORY_PHASE.season,phase:CURRENT_TERRITORY_PHASE.phase}))} · ${esc(t('Belohnungen für Saison 8 / Phase 4 laut bereitgestelltem Ingame-Bild. Andere Kombinationen werden nicht aus Saison 1 abgeleitet.'))}</p>
 <details class="wb-details"><summary>${esc(t("Server Law & Auswahlreihenfolge"))}</summary><div data-wb-laws>${lawHtml()}</div><div class="wb-heading"><label>${esc(t("Gespeicherten KvK verwenden"))}<select class="control" data-wb-kvk><option value="">${esc(t("KvK auswählen"))}</option>${kvkRuns.map(r=>`<option value="${r.id}" ${r.id===selectedKvk?'selected':''}>${esc(r.title||r.snapshot_date||'KvK')}</option>`).join('')}</select></label>${button('kvk-list',t('KvKs laden'))}${button('kvk-order',t('Gesamtranking übernehmen'))}</div>${input('Auswahlreihenfolge (manuell änderbar)','selectionOrder',territory.selectionOrder,'text','maxlength="500"')}${input('Vereinbarte Zuteilung / Notiz','lawNote',territory.lawNote,'text','maxlength="1000"')}<p class="small-note">${esc(t("Die Rangfolge bestimmt die Auswahl. Gebäude werden hier ausdrücklich zugeteilt."))}</p></details>
 <div class="wb-table-scroll"><table class="wb-territory-table"><thead><tr><th>${esc(t('Gebäude / Position'))}</th><th>${esc(t('Belohnung dieser Phase'))}</th><th>${esc(t('Zuteilung'))}</th><th>${esc(t('Gehalten von'))}</th></tr></thead><tbody>${TERRITORY_SITES.map(site=>{const v=territory.sites[site.key]||{};return `<tr data-wb-site="${site.key}"><th>${esc(siteName(site))}<small>X ${site.x} · Y ${site.y}</small></th><td>${rewardHtml(site)}<input class="control" data-wb-site-field="reward" aria-label="${esc(t('Eigene Belohnung {site}',{site:siteName(site)}))}" maxlength="300" value="${esc(manualReward(territory,site.key))}" placeholder="${esc(t('Eigene Belohnungsangabe (optional)'))}"></td><td><input class="control" data-wb-site-field="assigned" aria-label="${esc(t('Zuteilung {site}',{site:siteName(site)}))}" value="${esc(v.assigned||'')}" maxlength="40" placeholder="${esc(t('z. B. NRW'))}"></td><td><input class="control" data-wb-site-field="holder" aria-label="${esc(t('Besitzer {site}',{site:siteName(site)}))}" value="${esc(v.holder||'')}" maxlength="40"></td></tr>`;}).join('')}</tbody></table></div>${button('copy',t('Wochenübersicht kopieren'),'primary')}</article>
 <article class="card wb-panel"><h4>${esc(t('Außenposten'))} · ${known}</h4><p class="small-note">${esc(t('Neue Wochen übernehmen die Außenposten aus dem jüngsten gespeicherten Wochenstand. Gehalten und Verbunden kannst du getrennt ändern.'))} <a href="${OUTPOST_SOURCE}" target="_blank" rel="noopener">${esc(t('Koordinatenquelle'))}</a></p><p data-wb-outpost-summary>${esc(outpostText(summary))}</p><div class="wb-outpost-layout">${outpostMapHtml(territory.outposts)}<div><div class="wb-outpost-filters"><label>${esc(t('Außenposten suchen'))}<input class="control" type="search" data-wb-outpost-search value="${esc(outpostQuery)}" placeholder="${esc(t('Typ, Name oder Koordinaten'))}"></label><label>${esc(t('Bonus-Typ'))}<select class="control" data-wb-outpost-type><option value="all">${esc(t('Alle Typen'))}</option>${OUTPOST_TYPES.map(type=>`<option value="${type}" ${outpostFilter===type?'selected':''}>${esc(t(type))}</option>`).join('')}</select></label></div><div class="wb-outpost-table wb-table-scroll"><table><thead><tr><th>${esc(t('Posten / Position'))}</th><th>${esc(t('Bonus-Typ'))}</th><th>${esc(t('Stufe'))}</th><th>${esc(t('Gehalten'))}</th><th>${esc(t('Verbunden'))}</th><th></th></tr></thead><tbody>${territory.outposts.filter(outpostMatch).map(o=>{const i=territory.outposts.indexOf(o),ref=OUTPOST_CATALOG.find(r=>r.id===o.id);return `<tr data-wb-outpost="${i}" ${ref?'data-wb-outpost-id="'+ref.id+'"':''} class="${selectedOutpost===String(i)?'selected':''}"><td>${ref?`<strong>${esc(o.name===ref.name?t(o.name):o.name)}</strong><small>X ${o.x} · Y ${o.y}</small>`:`<input class="control" data-wb-outpost-field="name" aria-label="${esc(t('Postenname'))}" maxlength="100" value="${esc(o.name)}"><small>${esc(t('Eigener Eintrag'))}</small>`}</td><td data-label="${esc(t('Bonus-Typ'))}">${ref?`${esc(t(o.bonusLabel))}<small>+${o.bonus}%</small>`:`<select class="control" data-wb-outpost-field="type" aria-label="${esc(t('Bonustyp'))}">${OUTPOST_TYPES.map(type=>`<option value="${type}" ${o.type===type?'selected':''}>${esc(t(type))}</option>`).join('')}</select>`}</td><td data-label="${esc(t('Stufe'))}">${ref?o.level:`<select class="control" data-wb-outpost-field="level" aria-label="${esc(t('Stufe'))}">${[1,2,3,4].map(n=>`<option ${o.level===n?'selected':''}>${n}</option>`).join('')}</select>`}</td>${['owned','connected'].map(key=>`<td data-label="${esc(t(key==='owned'?'Gehalten':'Verbunden'))}"><input type="checkbox" data-wb-outpost-field="${key}" aria-label="${esc(t(key==='owned'?'Gehalten':'Verbunden')+' · '+(ref?t(o.name):o.name)+' · '+(o.x??''))}" ${o[key]?'checked':''}></td>`).join('')}<td>${ref?'':button('remove-outpost',t('Entfernen'),'ghost',`data-index="${i}"`)}</td></tr>`;}).join('')}</tbody></table></div>${button('add-outpost',t('+ Außenposten'))}</div></div><p class="small-note">${esc(t('Kartenpunkt wählen, um den Eintrag zu öffnen. Referenzkoordinaten im Königreich abgleichen.'))}</p><details class="wb-details"><summary>${esc(t('Welche Bonusgruppen fehlen?'))}</summary><p class="small-note">${esc(t('Vergleich mit den tatsächlich aufgeführten Typ-/Stufengruppen. Doppelte Posten derselben Gruppe zählen einmal.'))}</p><div data-wb-missing>${missingHtml(summary)}</div></details></article>`;
 }
 const missingHtml=s=>s.missing.map(m=>`<span class="wb-missing">${esc(t(m.type))} · ${esc(t('Stufe'))} ${m.level}</span>`).join('')||t('Alle Gruppen vorhanden.');
 function giftHtml(){const g=gifts,active=new Set(g.activeCodes.map(r=>r.code.toUpperCase())),codes=[...new Map([...g.activeCodes.map(r=>r.code),...g.runs.map(r=>r.code).filter(code=>!active.has(code.toUpperCase()))].map(code=>[code.toUpperCase(),code])).values()];return `<div class="wb-heading"><h3>${esc(t("Geschenkcodes"))}</h3>${button('gift-load',t('Aktualisieren'),'ghost',g.running?'disabled':'')}</div><p class="small-note" role="status" data-wb-status>${esc(t(message))}</p>
 <section class="wb-gift-banner"><svg viewBox="0 0 32 32" width="42" height="42" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 15h22v14H5zM3 10h26v5H3zM16 10v19M16 10C5 10 7 1 12 4l4 6Zm0 0c11 0 9-9 4-6l-4 6Z"/></svg><div><h4>${esc(t('Ein Code. Für dein ganzes Team.'))}</h4><p><span data-wb-selected>${g.selected.size}</span> ${esc(t('Empfänger ausgewählt'))}</p></div></section>
 <p class="small-note">${esc(t("Ein Code für alle ausgewählten Spieler. Der Lauf geht auch bei einzelnen Fehlern weiter. Lass diese Seite offen, bis er fertig ist."))}</p>
 <section class="wb-gift-compose"><label>${esc(t("Geschenkcode"))}<input class="control" data-wb-gift-code value="${esc(g.code)}" maxlength="80" autocomplete="off" ${g.running?'disabled':''}></label>${button('gift-start',g.running?t('Sammellauf läuft …'):t('Jetzt für alle Ausgewählten einlösen'),'primary',g.running||!g.loaded?'disabled':'')}</section>
 <details class="wb-details wb-gift-audience" ${giftAudienceOpen?'open':''}><summary>${esc(t('Empfänger auswählen'))} · <span data-wb-selected>${g.selected.size}</span></summary><div class="tools-actions">${button('gift-all',t('Alle NRW-Spieler'))}${button('gift-none',t('Keine'))}</div><label>${esc(t("Spieler filtern"))}<input class="control" data-wb-gift-filter value="${esc(g.filter||'')}" placeholder="${esc(t("Name oder ID"))}"></label><div class="wb-gift-recipients">${g.candidates.map(p=>`<div class="wb-gift-recipient" data-wb-gift-row data-search="${esc((p.name+' '+p.game_id).toLowerCase())}"><label><input type="checkbox" data-wb-gift-recipient="${p.game_id}" ${g.selected.has(p.game_id)?'checked':''} ${g.running?'disabled':''}><span><b>${esc(p.name)}</b><small>${p.game_id}${p.external?' · '+t('externer Zweitaccount'):''}</small></span></label><label>${esc(t("Königreich"))}<input class="control" type="number" min="1" max="999999" data-wb-gift-kingdom="${p.game_id}" value="${esc(g.kingdoms[p.game_id]??p.kingdom_id??'')}" ${g.running?'disabled':''}></label></div>`).join('')||`<p>${esc(t("Noch keine Empfänger geladen."))}</p>`}</div></details>
 <section class="wb-gift-library"><h4>${esc(t('Deine Code-Bibliothek'))}</h4><p class="small-note" data-wb-active-codes-status role="status">${esc(t(g.feedLoading?'Aktive Codes werden geladen …':g.feedError?'Aktive Codes konnten nicht aktualisiert werden. Letzte geladene Codes und eigene Einträge bleiben verfügbar.':g.activeCodes.length?'Aktive Codes aus derselben Liste wie im Player Dashboard.':'Aktuell keine aktiven Codes im Player Dashboard.'))}${g.feedUpdatedAt?' · '+esc(g.feedUpdatedAt.slice(0,16).replace('T',' ')+' UTC'):''}</p><div class="wb-gift-code-grid">${codes.map(code=>{const runs=g.runs.filter(r=>r.code.toUpperCase()===code.toUpperCase()),last=runs[0],isActive=active.has(code.toUpperCase());return `<article class="wb-gift-code"><header><span class="wb-code-dot" aria-hidden="true"></span><strong>${esc(code)}</strong>${isActive?`<small class="wb-active-code">${esc(t(g.feedError?'Zuletzt als aktiv geladen':'Aktiv im Player Dashboard'))}</small>`:''}</header><p class="small-note">${runs.length} ${esc(t('gespeicherte Sammelläufe'))}${last?' · '+last.created_at.slice(0,10):''}</p><div class="tools-actions">${button(isActive?'gift-code-redeem':'gift-use',t(isActive?'Für Auswahl einlösen':'Sammellauf vorbereiten'),isActive?'primary':'ghost',`data-code="${esc(code)}" ${g.running||!g.loaded?'disabled':''}`)}${button('gift-code-copy',t('Kopieren'),'ghost',`data-code="${esc(code)}"`)}</div></article>`;}).join('')||`<p class="small-note">${esc(t('Deine eingelösten Codes erscheinen hier.'))}</p>`}</div></section>
 <section class="wb-gift-history"><h4>${esc(t('Einlöse-Verlauf'))}</h4><label>${esc(t("Gespeicherte Sammelläufe"))}<select class="control" data-wb-gift-run ${g.running?'disabled':''}><option value="">${esc(t("Sammellauf auswählen"))}</option>${g.runs.map(r=>`<option value="${r.id}" ${r.id===g.run?.id?'selected':''}>${esc(r.code)} · ${r.created_at.slice(0,10)} · ${r.recipients.length} ${esc(t('Spieler'))}</option>`).join('')}</select></label><div data-wb-gift-progress></div><div class="tools-actions">${g.running&&!g.creating?button('gift-pause',t('Nach diesem Spieler pausieren')):!g.running&&g.run?button('gift-resume',t('Offene fortsetzen'),'primary'):''}${g.run&&!g.running?button('gift-retry',t('Fehlgeschlagene erneut versuchen')):''}</div><div data-wb-gift-results></div></section>`;}
 function paintGiftProgress(){if(mode!=='gifts'||!gifts.run||!target?.querySelector('[data-wb-gift-progress]'))return;const g=gifts,receipts=new Map(g.receipts.map(r=>[r.game_id,r])),done=g.run.recipients.filter(p=>['success','already'].includes(receipts.get(p.game_id)?.status)).length;const processed=g.run.recipients.filter(p=>['success','already','failed','unknown'].includes(receipts.get(p.game_id)?.status)).length;target.querySelector('[data-wb-gift-progress]').innerHTML=`<h4>${esc(t('{done} / {total} bestätigt',{done,total:g.run.recipients.length}))}</h4><progress max="${g.run.recipients.length}" value="${processed}" aria-label="${esc(t('{done} / {total} bearbeitet',{done:processed,total:g.run.recipients.length}))}"></progress><small>${esc(t('{done} / {total} bearbeitet',{done:processed,total:g.run.recipients.length}))}</small>`;target.querySelector('[data-wb-gift-results]').innerHTML=`<div class="wb-table-scroll"><table><thead><tr><th>${esc(t("Spieler"))}</th><th>${esc(t("Ergebnis"))}</th></tr></thead><tbody>${g.run.recipients.map(p=>{const r=receipts.get(p.game_id);return `<tr><th>${esc(p.name)}<small>${p.game_id} · #${p.kingdom_id}</small></th><td>${esc(t(statusLabels[r?.status||'pending']))}${r?.provider_code?`<small>${esc(providerLabels[r.provider_code]?t(providerLabels[r.provider_code]):t('Anbieter-Antwort {code}',{code:r.provider_code}))}</small>`:''}${r?.status==='unknown'?button('gift-unknown-retry',t('Bewusst erneut versuchen'),'ghost',`data-id="${p.game_id}" ${g.running?'disabled':''}`):''}</td></tr>`;}).join('')}</tbody></table></div>`;}
 function setMessage(text){message=text;const el=target?.querySelector('[data-wb-status]');if(el)el.textContent=t(text);}
 function dirty(){d().dirty=true;if(mode==='territory'){
   territoryChosen=true;persistTerritoryDraft();
   const hint=target.querySelector('[data-wb-local-draft]');
   if(hint){hint.hidden=false;hint.textContent=localDraftLabel();}
  }setMessage(t('Ungespeicherte Änderungen'));const b=target.querySelector('[data-wb-action="save"]');if(b)b.disabled=busy;}
 async function loadDocs(){if(docsLoading)return;docsLoading=true;const token=epoch;try{const r=await call('tools_documents_load');if(token!==epoch||!can('tools'))return;documents=r.documents; laws=r.laws;loaded=true;if(mode==='territory'&&loadLatestTerritory()){message='';render();return;}const lawTarget=target?.querySelector('[data-wb-laws]');if(lawTarget)lawTarget.innerHTML=lawHtml();setMessage(t('Gespeicherte Stände geladen. Aktuelle Eingaben bleiben erhalten.'));const select=target?.querySelector('[data-wb-archive]');if(select&&mode!=='gifts'){const list=documents.filter(x=>x.kind===mode);select.innerHTML=`<option value="">${esc(t("Gespeicherten Stand wählen"))}</option>`+list.map(x=>`<option value="${x.id}" ${x.id===d().id?'selected':''}>${esc(x.title)}</option>`).join('');}}catch{if(token===epoch)setMessage(t('Gespeicherte Stände konnten nicht geladen werden. Bitte erneut versuchen.'));}finally{if(token===epoch)docsLoading=false;}}
 async function giftStatus(){const token=epoch,loop=giftLoop,id=gifts.run?.id;if(!id)return;const r=await call('tools_gifts_status',{run_id:id});if(token===epoch&&loop===giftLoop&&id===gifts.run?.id&&can('tools')){gifts.run=r.item;const saved=new Set(r.receipts.map(x=>x.game_id));gifts.receipts=[...r.receipts,...gifts.receipts.filter(x=>x.provisional&&!saved.has(x.game_id))];paintGiftProgress();}}
 async function giftLoad(){const token=epoch;gifts.feedLoading=true;if(mode==='gifts')render();
  const [bulk,feed]=await Promise.allSettled([call('tools_gifts_load'),loadActiveGiftCodes()]);if(token!==epoch||!can('tools'))return;
  if(bulk.status==='fulfilled'){const r=bulk.value;gifts.runs=r.runs;gifts.candidates=r.candidates;if(!gifts.loaded)gifts.selected=new Set(r.candidates.filter(p=>!p.external).map(p=>p.game_id));gifts.loaded=true;}else message=t('Sammelläufe konnten nicht geladen werden. Bitte aktualisieren.');
  gifts.feedLoading=false;gifts.feedError=feed.status==='rejected';if(feed.status==='fulfilled'){gifts.activeCodes=feed.value.codes;gifts.feedUpdatedAt=feed.value.updatedAt;}
  if(mode==='gifts')render();if(gifts.run)await giftStatus();
 }
 async function executeGifts(ids,retry=false){
  if(gifts.running)return;
  const token=epoch,runId=gifts.run.id,loop=++giftLoop;
  const current=()=>token===epoch&&loop===giftLoop&&runId===gifts.run?.id&&can('tools');
  const active=()=>current()&&!gifts.stopRequested;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  let nextStart=0;
  gifts.running=true;gifts.stopRequested=false;render();
  try{
   for(const id of new Set(ids)){
    if(!active())break;
    const delay=nextStart-performance.now();
    if(delay>0)await sleep(delay);
    if(!active())break;
    let result;
    // A reservation wait means no redemption was sent. Only that response can be retried here.
    for(let waits=0;active();waits++){
     const started=performance.now();
     nextStart=started+2000;
     try{result=await call('tools_gifts_step',{run_id:runId,game_id:id,retry});}
     catch{result={status:'unknown',provisional:true};}
     if(!active()||result.status!=='wait'||waits>=3)break;
     await sleep(Math.max(50,result.retry_after_ms??((result.retry_after??2)*1000))+30);
    }
    if(!current())return;
    if(result?.provider_code===40019)nextStart=performance.now()+5000;
    if(['success','already','failed','unknown','processing'].includes(result?.status)){
     const previous=gifts.receipts.find(r=>r.game_id===id);
     const receipt={...previous,...result,game_id:id,provisional:!!result.provisional};
     gifts.receipts=[...gifts.receipts.filter(r=>r.game_id!==id),receipt];
     paintGiftProgress();
    }
   }
   if(!current())return;
   try{await giftStatus();}catch{/* Keep the latest results already returned for each player. */}
   if(!current())return;
   if(gifts.stopRequested)setMessage(t('Pausiert nach dem laufenden Spieler.'));
   else if(ids.some(id=>!gifts.receipts.some(r=>r.game_id===id)))setMessage(t('Einige Spieler sind noch offen. Du kannst sie separat fortsetzen.'));
   else setMessage(t('Sammellauf bearbeitet. Ergebnisse stehen in der Liste.'));
  }finally{if(current()){gifts.running=false;gifts.stopRequested=false;if(mode==='gifts')render();}}
 }
 let selection={start:0,end:0};
 window.addEventListener('beforeunload',event=>{
  if(drafts.territory.dirty&&!territoryBackedUp){event.preventDefault();event.returnValue='';}
 });
 root.addEventListener('toggle',e=>{if(e.target.isConnected&&e.target.matches('.wb-gift-audience'))giftAudienceOpen=e.target.open;},true);
 root.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('[data-wb-outpost-focus]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 root.addEventListener('select',e=>{if(e.target.id==='wb-notice-text')selection={start:e.target.selectionStart,end:e.target.selectionEnd};});
 root.addEventListener('keyup',e=>{if(e.target.id==='wb-notice-text')selection={start:e.target.selectionStart,end:e.target.selectionEnd};});
 root.addEventListener('click',e=>{if(e.target.id==='wb-notice-text')selection={start:e.target.selectionStart,end:e.target.selectionEnd};});
 root.addEventListener('input',e=>{
  const el=e.target;if(!target?.contains(el)||!can('tools'))return;
  for(const [attr,key] of [['data-wb-color','color'],['data-wb-kingdom','kingdom'],['data-wb-x','x'],['data-wb-y','y']]){if(el.hasAttribute(attr)){noticeUi[key]=el.value;return;}}
  if(el.matches('[data-wb-icon-search]')){paletteQuery=el.value;filterPalette(true);return;}
  if(el.matches('[data-wb-gift-code]')){gifts.code=el.value;return;}
  if(el.matches('[data-wb-gift-filter]')){gifts.filter=el.value;target.querySelectorAll('[data-wb-gift-row]').forEach(row=>row.hidden=!row.dataset.search.includes(el.value.toLowerCase()));return;}
  if(el.dataset.wbGiftKingdom){gifts.kingdoms[el.dataset.wbGiftKingdom]=el.value;return;}
  if(el.dataset.wbGiftRecipient){if(el.checked)gifts.selected.add(el.dataset.wbGiftRecipient);else gifts.selected.delete(el.dataset.wbGiftRecipient);target.querySelectorAll('[data-wb-selected]').forEach(el=>el.textContent=gifts.selected.size);return;}
  if(el.matches('[data-wb-outpost-search]')){outpostQuery=el.value;const pos=el.selectionStart;render();const next=target.querySelector('[data-wb-outpost-search]');next?.focus();if(pos!=null)next?.setSelectionRange(pos,pos);return;}
  if(mode==='gifts')return;
  if(el.id==='wb-notice-text'){d().data.text=el.value;selection={start:el.selectionStart,end:el.selectionEnd};dirty();paintCounter();return;}
  if(el.matches('[data-wb-field="phase"],[data-wb-field="season"]'))return;
  if(el.dataset.wbField){if(el.dataset.wbField==='title')d().title=el.value;else d().data[el.dataset.wbField]=el.value;dirty();if(mode==='rally')paintRally();return;}
  const leader=el.closest('[data-wb-leader]');if(leader&&el.dataset.wbLeaderField){d().data.leaders[Number(leader.dataset.wbLeader)][el.dataset.wbLeaderField]=el.value;dirty();paintRally();return;}
  const site=el.closest('[data-wb-site]');if(site&&el.dataset.wbSiteField){const key=site.dataset.wbSite;d().data.sites[key]??={};if(el.dataset.wbSiteField==='reward'){const scope=rewardScope(d().data);d().data.rewardOverrides[scope]??={};d().data.rewardOverrides[scope][key]=el.value;}else d().data.sites[key][el.dataset.wbSiteField]=el.value;dirty();return;}
  const outpost=el.closest('[data-wb-outpost]');if(outpost&&el.dataset.wbOutpostField){const key=el.dataset.wbOutpostField;d().data.outposts[Number(outpost.dataset.wbOutpost)][key]=el.type==='checkbox'?el.checked:key==='level'?Number(el.value):el.value;dirty();const s=outpostSummaryFor(d().data.outposts);target.querySelector('[data-wb-outpost-summary]').textContent=outpostText(s);target.querySelector('[data-wb-missing]').innerHTML=missingHtml(s);target.querySelector('.wb-coordinate-map').outerHTML=outpostMapHtml(d().data.outposts);}
 });
 root.addEventListener('change',async e=>{
  const el=e.target;if(!target?.contains(el)||!can('tools'))return;
  if(el.matches('[data-wb-kvk]')){selectedKvk=el.value;return;}
  if(el.matches('[data-wb-field="phase"],[data-wb-field="season"]')){
   const territory=d().data,field=el.dataset.wbField,value=el.value===''?'':Number(el.value);
   if(Number(territory[field])>0&&Number(value)>Number(territory[field])){
    for(const [key,{holder}] of Object.entries(previousHolders(territory.sites)))territory.sites[key].holder=holder;
   }
   territory[field]=value;
   dirty();render();return;
  }
  if(el.matches('[data-wb-outpost-type]')){outpostFilter=el.value;render();return;}
  if(el.matches('[data-wb-archive]')&&el.value){if(d().dirty&&!confirm(t('Ungespeicherte Änderungen verwerfen und diesen Stand laden?'))){el.value=d().version?d().id:'';return;}const found=documents.find(x=>x.id===el.value&&x.kind===mode);if(found){if(mode==='territory'){territoryChosen=true;clearTerritoryDraft();}drafts[mode]={...structuredClone(found),data:mode==='territory'?prepareTerritory(found.data):structuredClone(found.data),dirty:false};message='';render();}}
  if(el.matches('[data-wb-gift-run]')){gifts.running=false;gifts.run=gifts.runs.find(r=>r.id===el.value)||null;gifts.receipts=[];render();if(gifts.run)try{await giftStatus();}catch{setMessage(t('Ergebnisse konnten nicht geladen werden.'));}}
 });
 root.addEventListener('click',async e=>{
  const b=e.target.closest('[data-wb-action]');if(!b||b.disabled||!target?.contains(b)||!can('tools'))return;
  const a=b.dataset.wbAction,token=epoch;
  try{
   if(a==='save'){
    const current=d();
    if(mode==='territory'&&!current.title.trim()){
     current.title=t('Gebietskontrolle')+' · '+(current.data.date||today());
     persistTerritoryDraft();
    }
    if(!current.title.trim())throw Error(t('Bitte eine Bezeichnung eingeben.'));if(mode==='rally')rallyPlan(current.data);
    const sent=JSON.stringify(current),payload=structuredClone(current);busy=true;render();
    try{const r=await call('tools_document_save',payload);if(token!==epoch)return;documents=documents.filter(x=>x.id!==r.item.id);documents.unshift(r.item);current.version=r.item.version;current.dirty=JSON.stringify({...current,version:payload.version})!==sent;if(current.kind==='territory'&&drafts.territory===current){
      if(current.dirty)persistTerritoryDraft();else clearTerritoryDraft();
    }message=current.dirty?t('Gespeichert; weitere Änderungen sind noch offen.'):t('Gemeinsam gespeichert.');}
    catch(err){message=String(err.message).includes('conflict')?t('Dieser Stand wurde inzwischen geändert. Deine Eingaben bleiben erhalten. Als Kopie speichern oder nach Aktualisieren neu laden.'):t('Speichern fehlgeschlagen. Deine Eingaben bleiben erhalten.');}
    finally{if(token===epoch){busy=false;render();}}return;
   }
   if(a==='reload'){await loadDocs();return;}
   if(a==='new'){
    if(mode==='territory'&&!loaded){await loadDocs();return;}
    if(d().dirty&&!confirm(t('Ungespeicherte Änderungen verwerfen?')))return;
    const next=blank(mode);
    if(mode==='territory'){
     territoryChosen=true;
     clearTerritoryDraft();
     // An edit to an older week should not become the starting point for the next week.
     const latest=documents.filter(item=>item.kind==='territory').sort((a,b)=>b.data.date.localeCompare(a.data.date))[0];
     if(latest)next.data=prepareTerritory({...next.data,outposts:latest.data.outposts,sites:previousHolders(latest.data.sites)});
    }
    drafts[mode]=next;
    message='';
    render();
    return;
   }
   if(a==='clone'){Object.assign(d(),{id:crypto.randomUUID(),version:0,title:(d().title+' · '+t('Kopie')).slice(0,100),dirty:true});if(mode==='territory'){territoryChosen=true;persistTerritoryDraft();}message=t('Neue Kopie – zum Übernehmen speichern.');render();return;}
   if(a==='delete'){if(!confirm(t('Diesen gespeicherten Stand löschen?')))return;await call('tools_document_delete',d());if(token!==epoch)return;documents=documents.filter(x=>x.id!==d().id);if(mode==='territory')clearTerritoryDraft();drafts[mode]=blank(mode);message=t('Gelöscht.');render();return;}
   if(['insert','wrap','color','coords'].includes(a)){
    const text=target.querySelector('#wb-notice-text');let before=b.dataset.value??b.dataset.before??'',after=b.dataset.after??'';
    if(a==='color'){before='<color='+target.querySelector('[data-wb-color]').value+'>';after='</color>';}
    if(a==='coords')before=coordinateTag(target.querySelector('[data-wb-kingdom]').value,target.querySelector('[data-wb-x]').value,target.querySelector('[data-wb-y]').value);
    const next=insertText(text.value,selection.start,selection.end,before,after);text.value=next.text;d().data.text=next.text;selection={start:next.start,end:next.end};text.focus({preventScroll:true});text.setSelectionRange(next.start,next.end);dirty();paintCounter();return;
   }
   if(a==='notice-mode'){d().data.mode=b.dataset.value;dirty();render();return;}
   if(a==='add-leader'){if(d().data.leaders.length>=100)throw Error(t('Maximal 100 Rally-Leader.'));d().data.leaders.push({name:'',gather:'05:00',march:'01:00'});dirty();render();return;}
   if(['up','down','remove-leader'].includes(a)){const i=Number(b.dataset.index),rows=d().data.leaders;if(a==='remove-leader')rows.splice(i,1);else{const j=i+(a==='up'?-1:1);[rows[i],rows[j]]=[rows[j],rows[i]];}dirty();render();return;}
   if(a==='focus-outpost'){selectedOutpost=b.dataset.index;outpostFilter='all';outpostQuery='';render();const row=target.querySelector('[data-wb-outpost="'+selectedOutpost+'"]');row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('[type=checkbox]')?.focus();return;}
   if(a==='add-outpost'){if(d().data.outposts.length>=500)throw Error(t('Maximal 500 Außenposten.'));d().data.outposts.push({name:'',type:OUTPOST_TYPES[0],level:1,owned:false,connected:false});dirty();render();return;}
   if(a==='remove-outpost'){d().data.outposts.splice(Number(b.dataset.index),1);dirty();render();return;}
   if(a==='kvk-list'){const r=await call('tools_kvk_load');if(token!==epoch)return;kvkRuns=r.runs;target.querySelector('[data-wb-kvk]').innerHTML=`<option value="">${esc(t("KvK auswählen"))}</option>`+r.runs.map(r=>`<option value="${r.id}">${esc(r.title||r.snapshot_date||'KvK')}</option>`).join('');return;}
   if(a==='kvk-order'){const id=target.querySelector('[data-wb-kvk]').value;if(!id)throw Error(t('Zuerst einen gespeicherten KvK auswählen.'));const r=await call('tools_kvk_load',{run_id:id});if(token!==epoch)return;const ranked=rankKvk(r.item.data,'overall');if(!ranked.complete)throw Error(t('Das Gesamtranking dieses KvKs ist noch unvollständig.'));d().data.selectionOrder=ranked.rows.map(r=>`${r.rank}. ${r.tag}`).join(' · ');dirty();target.querySelector('[data-wb-field="selectionOrder"]').value=d().data.selectionOrder;return;}
   if(a==='copy'){
    const text=mode==='notice'?d().data.text:mode==='rally'?rallyText({...d().data,title:d().title},{title:t('Rally-Sync'),start:t('Start'),depart:t('Abmarsch'),arrival:t('Ankunft')}):territoryGameText(d().data.sites);
    if(!text.trim())throw Error(t('Zuerst Text eingeben.'));try{await navigator.clipboard.writeText(text);setMessage(t('In die Zwischenablage kopiert.'));}catch{let fallback=target.querySelector('[data-wb-copy-fallback]');if(!fallback){fallback=document.createElement('textarea');fallback.className='control wb-copy-fallback';fallback.dataset.wbCopyFallback='';fallback.setAttribute('aria-label',t('Text zum manuellen Kopieren'));target.append(fallback);}fallback.value=text;fallback.focus();fallback.select();setMessage(t('Bitte den markierten Text manuell kopieren.'));}return;
   }
   if(a==='gift-use'){if(gifts.running)return;gifts.code=b.dataset.code;render();target.querySelector('[data-wb-gift-code]').focus();return;}
   if(a==='gift-code-copy'){try{await navigator.clipboard.writeText(b.dataset.code);setMessage(t('In die Zwischenablage kopiert.'));}catch{setMessage(t('Bitte den Code manuell kopieren.'));}return;}
   if(a==='gift-load'){if(!gifts.running)await giftLoad();return;}
   if(a==='gift-all'||a==='gift-none'){if(gifts.running)return;gifts.selected=new Set(a==='gift-all'?gifts.candidates.filter(p=>!p.external).map(p=>p.game_id):[]);render();return;}
   if(a==='gift-pause'){gifts.stopRequested=true;b.disabled=true;return;}
   if(a==='gift-start'||a==='gift-code-redeem'){
    const code=(a==='gift-code-redeem'?b.dataset.code:gifts.code).trim(),recipients=gifts.candidates.filter(p=>gifts.selected.has(p.game_id)).map(p=>({game_id:p.game_id,kingdom_id:Number(gifts.kingdoms[p.game_id]??p.kingdom_id)}));
    if(!/^[A-Za-z0-9_.-]{1,80}$/.test(code)||!recipients.length)throw Error(t('Code und mindestens einen Empfänger auswählen.'));if(recipients.some(p=>!Number.isInteger(p.kingdom_id)||p.kingdom_id<1))throw Error(t('Für jeden ausgewählten Spieler das Königreich angeben.'));
    if(!confirm(t('Geschenkcode „{code}“ jetzt für {count} Spieler einlösen?',{code,count:recipients.length})))return;
    if(gifts.running)return;gifts.code=code;gifts.creating=true;gifts.running=true;render();let r;try{r=await call('tools_gifts_create',{code,recipients});}finally{if(token===epoch){gifts.running=false;gifts.creating=false;}}if(token!==epoch)return;gifts.run=r.item;gifts.runs.unshift(r.item);gifts.receipts=[];message='';await executeGifts(recipients.map(p=>p.game_id));return;
   }
   if(a==='gift-resume'||a==='gift-retry'){
    await giftStatus();const retry=a==='gift-retry',ids=gifts.run.recipients.filter(p=>{const r=gifts.receipts.find(r=>r.game_id===p.game_id);return retry?r?.status==='failed'&&r.retryable:!r;}).map(p=>p.game_id);
    if(!ids.length)throw Error(retry?t('Keine wiederholbaren Fehler. Unbekannte Ergebnisse bitte einzeln prüfen.'):t('Keine offenen Spieler. Unbekannte Ergebnisse bitte zuerst prüfen.'));message='';await executeGifts(ids,retry);return;
   }
   if(a==='gift-unknown-retry'){if(!confirm(t('Das Ergebnis ist unbekannt. Der Code könnte bereits eingelöst sein. Für diesen Spieler bewusst erneut versuchen?')))return;message='';await executeGifts([b.dataset.id],true);}
  }catch(err){if(token===epoch){const text=String(t(err.message)||'');setMessage(text&&!/^[a-z_]+$/.test(text)?t(text):t('Aktion fehlgeschlagen. Eingaben bleiben erhalten. Bitte erneut versuchen.'));if(mode==='gifts')render();}}
 });
 window.addEventListener('beforeunload',e=>{if(Object.values(drafts).some(d=>d.dirty)||gifts.running){e.preventDefault();e.returnValue='';}});
 return {
  open(el,next){if(!can('tools'))return;target=el;if(mode!==next&&gifts.running){giftLoop++;gifts.running=false;}if(mode!==next)message='';mode=next;if(mode==='territory'){restoreTerritoryDraft();if(loaded)loadLatestTerritory();}render();clearInterval(timer);timer=mode==='rally'?setInterval(tick,1000):null;if(!loaded)loadDocs();if(mode==='gifts'&&!gifts.loaded)giftLoad().catch(()=>setMessage(t('Sammelläufe konnten nicht geladen werden. Bitte aktualisieren.')));},
  leave(){giftLoop++;gifts.running=false;clearInterval(timer);},
  reset(){epoch++;giftLoop++;territoryInitialized=false;territoryChosen=false;localSnapshot=null;territoryBackedUp=false;paletteQuery='';noticeUi={color:'#d4ae62',kingdom:'1044',x:'',y:''};kvkRuns=[];selectedKvk='';clearInterval(timer);gifts.running=false;mode='';target=null;documents=[];laws=[];loaded=false;busy=false;docsLoading=false;message='';drafts={notice:blank('notice'),rally:blank('rally'),territory:blank('territory')};gifts={loaded:false,candidates:[],runs:[],selected:new Set(),kingdoms:{},code:'',run:null,receipts:[],running:false,activeCodes:[],feedLoading:false,feedError:false,feedUpdatedAt:null};}
 };
}
