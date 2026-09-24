/* Native, single-session ScreenRecording for the V2 test app.
 * The recording never leaves the browser. Only reviewed OCR hits and small
 * evidence still frames are sent to the existing protected Supabase RPCs.
 */
(()=>{'use strict';
if(window.NAP_NATIVE_IMPORTER)return;
const API='https://bdzlgirowutasrsycjfj.supabase.co';
const KEY='sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL';
const SESSION_KEY='nap_v4_supabase_session';
const EVENTS=['Strongest Governor','Alliance Brawl','Officer Project','Armament Competition'];
const PHASES={
 'Strongest Governor':[['sg1','Day 1'],['sg2','Day 2'],['sg3','Day 3'],['sg4','Day 4'],['sg5','Day 5'],['sg6','Day 6'],['sg7','Day 7']],
 'Alliance Brawl':[['b1','Day 1'],['b2','Day 2'],['b3','Day 3'],['b4','Day 4'],['b5','Day 5'],['b6','Day 6']],
 'Officer Project':[['op1','Charms'],['op2','Forgehammers']],
 'Armament Competition':[['ac1','Phase 1'],['ac2','Truegold']]
};
const WORDS={
 de:{event:'Event',day:'Eventtag / Phase',occ:'Event-Durchlauf',date:'Aufnahmetag (UTC)',file:'ScreenRecording auswählen',analyze:'Video analysieren',review:'Ergebnisse prüfen',save:'Geprüfte Treffer speichern',choose:'Bitte zuerst Event, Tag und Video auswählen.',prep:'Video wird vorbereitet',recognize:'Spieler und Punkte erkennen',check:'Ergebnisse zusammenstellen',ready:'Fertig. Prüfe die erkannten Werte.',video:'Das Video bleibt auf deinem Gerät. Nur geprüfte Ergebnisse und Evidence-Bilder werden gespeichert.',found:'Erkannte Spieler',score:'Punkte',rank:'Rang',name:'Spieler',alliance:'Allianz',unmatched:'Nicht sicher zugeordnet – bitte manuell prüfen',nohits:'Keine eindeutigen Treffer. Bitte Aufnahme und Eventauswahl prüfen.',error:'Analyse fehlgeschlagen',saving:'Geprüfte Treffer werden gespeichert …',done:'Import abgeschlossen',upload:'Evidence-Bilder speichern …',duplicate:'Dieses Video wurde bereits erfasst.',type:'Performance-Art',needRank:'KvK Top 200: nur Einträge mit Rang 1–200 werden gespeichert.',prohibit:'TriAlliance und Swordland werden ausschließlich manuell erfasst.',wrongDay:'Der ausgewählte Tag liegt außerhalb des Event-Durchlaufs.',retry:'Erneut analysieren',missingEvent:'Kein passender Event-Durchlauf gefunden.',frame:'Erkanntes Bild',result:'Serverprüfung',invalid:'Bitte zuerst den tatsächlichen Eventtag wählen.',assign:'Spieler zuordnen',selectPlayer:'Spieler auswählen',manual:'Manuell zugeordnet'},
 en:{event:'Event',day:'Event day / phase',occ:'Event occurrence',date:'Recording day (UTC)',file:'Choose recording',analyze:'Analyze video',review:'Review results',save:'Save reviewed hits',choose:'Choose the event, day and video first.',prep:'Preparing video',recognize:'Recognizing players and scores',check:'Preparing results',ready:'Done. Review the detected values.',video:'Your video stays on your device. Only reviewed results and evidence stills are saved.',found:'Detected players',score:'Score',rank:'Rank',name:'Player',alliance:'Alliance',unmatched:'Not confidently matched – review manually',nohits:'No clear matches. Check your recording and event.',error:'Analysis failed',saving:'Saving reviewed hits …',done:'Import complete',upload:'Saving evidence stills …',duplicate:'This video has already been imported.',type:'Performance type',needRank:'KvK Top 200: only ranks 1–200 are saved.',prohibit:'TriAlliance and Swordland are manual only.',wrongDay:'The selected day is outside this occurrence.',retry:'Analyze again',missingEvent:'No matching occurrence found.',frame:'Detected frame',result:'Server check',invalid:'Select the actual event day first.',assign:'Assign player',selectPlayer:'Select player',manual:'Manually matched'},
 fr:{event:'Événement',day:'Jour / phase',occ:'Session',date:'Jour de vidéo (UTC)',file:'Choisir une vidéo',analyze:'Analyser',review:'Vérifier les résultats',save:'Enregistrer les résultats vérifiés',choose:'Choisissez événement, jour et vidéo.',prep:'Préparation vidéo',recognize:'Reconnaissance des joueurs et scores',check:'Préparation des résultats',ready:'Terminé. Vérifiez les valeurs.',video:'La vidéo reste sur votre appareil. Seuls les résultats vérifiés et les preuves sont enregistrés.',found:'Joueurs détectés',score:'Points',rank:'Rang',name:'Joueur',alliance:'Alliance',unmatched:'Association incertaine : vérification manuelle',nohits:'Aucun résultat fiable.',error:'Échec de l’analyse',saving:'Enregistrement …',done:'Import terminé',upload:'Enregistrement des preuves …',duplicate:'Vidéo déjà importée.',type:'Type de performance',needRank:'KvK Top 200 : rangs 1–200 uniquement.',prohibit:'TriAlliance et Swordland : saisie manuelle uniquement.',wrongDay:'Jour hors de cet événement.',retry:'Analyser à nouveau',missingEvent:'Aucune session trouvée.',frame:'Image',result:'Vérification serveur',invalid:'Choisissez le jour réel de l’événement.',assign:'Associer un joueur',selectPlayer:'Choisir un joueur',manual:'Associé manuellement'},
 es:{event:'Evento',day:'Día / fase',occ:'Edición del evento',date:'Día del vídeo (UTC)',file:'Elegir vídeo',analyze:'Analizar vídeo',review:'Revisar resultados',save:'Guardar resultados revisados',choose:'Selecciona evento, día y vídeo.',prep:'Preparando vídeo',recognize:'Reconociendo jugadores y puntos',check:'Preparando resultados',ready:'Listo. Revisa los valores.',video:'El vídeo permanece en tu dispositivo. Solo se guardan resultados revisados y capturas de prueba.',found:'Jugadores detectados',score:'Puntos',rank:'Puesto',name:'Jugador',alliance:'Alianza',unmatched:'Sin coincidencia segura: revisar manualmente',nohits:'No hay resultados claros.',error:'Error de análisis',saving:'Guardando resultados …',done:'Importación completada',upload:'Guardando pruebas …',duplicate:'Vídeo ya importado.',type:'Tipo de rendimiento',needRank:'KvK Top 200: solo puestos del 1 al 200.',prohibit:'TriAlliance y Swordland solo se registran manualmente.',wrongDay:'Día fuera del evento.',retry:'Analizar de nuevo',missingEvent:'No hay ninguna edición disponible.',frame:'Imagen',result:'Comprobación servidor',invalid:'Selecciona el día real del evento.',assign:'Asignar jugador',selectPlayer:'Seleccionar jugador',manual:'Asignado manualmente'}
};
const $=(s,root=document)=>root.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const lng=()=>$('#languagePicker')?.value||'de';
const tr=k=>(WORDS[lng()]||WORDS.de)[k]||k;
const fmt=x=>Number(x||0).toLocaleString(lng()==='de'?'de-DE':lng()==='fr'?'fr-FR':lng()==='es'?'es-ES':'en-US');
let run=null,workerPromise=null,rosterPromise=null;
function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
async function headers(json=true){
 let s=getSession();if(!s?.access_token)throw Error('Your V2 session expired. Please sign in again.');
 if(s.expires_at&&s.expires_at<Date.now()/1000+40&&s.refresh_token){
  const r=await fetch(API+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
  if(!r.ok)throw Error('Your V2 session expired. Please sign in again.');
  const d=await r.json();s={...d,expires_at:Math.floor(Date.now()/1000)+(d.expires_in||3600)};localStorage.setItem(SESSION_KEY,JSON.stringify(s));
 }
 return {apikey:KEY,Authorization:'Bearer '+s.access_token,...(json?{'Content-Type':'application/json'}:{})};
}
async function rpc(name,body={}){
 const r=await fetch(API+'/rest/v1/rpc/'+name,{method:'POST',headers:await headers(),body:JSON.stringify(body)});
 const raw=await r.text();let result;try{result=raw?JSON.parse(raw):null}catch{result=raw}
 if(!r.ok)throw Error(result?.message||result?.error||String(result)||'HTTP '+r.status);
 return result;
}
async function roster(){
 if(rosterPromise)return rosterPromise;
 rosterPromise=(async()=>{
  const [rows,own]=await Promise.all([rpc('get_nap_screen_import_directory_test'),rpc('get_own_player_identity_directory')]);
  const aliases=new Map((own||[]).map(x=>[String(x.player_game_id),x.aliases||[]]));
  return (rows||[]).map(x=>({...x,aliases:aliases.get(String(x.player_game_id))||[],player_id:x.player_id||null}));
 })().catch(e=>{rosterPromise=null;throw e});
 return rosterPromise;
}
async function ensureWorker(){
 if(workerPromise)return workerPromise;
 workerPromise=(async()=>{
  if(!window.Tesseract){
   await new Promise((resolve,reject)=>{
    const el=document.createElement('script');el.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    el.onload=resolve;el.onerror=()=>reject(Error('OCR library could not be loaded'));document.head.appendChild(el);
   });
  }
  return window.Tesseract.createWorker('eng',1);
 })().catch(e=>{workerPromise=null;throw e});
 return workerPromise;
}
function dayUTC(stamp,delta=0){
 const d=new Date(stamp);if(Number.isNaN(d.getTime()))return '';
 return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+delta)).toISOString().slice(0,10);
}
function dayNum(d){return Date.parse(String(d)+'T00:00:00Z')}
function validDay(runDay,occ){return !!runDay&&!!occ&&dayNum(runDay)<Date.parse(occ.end_at)&&dayNum(runDay)+86400000>Date.parse(occ.begin_at)&&dayNum(runDay)<=dayNum(new Date().toISOString().slice(0,10))}
async function sha256(file){
 const n=Math.min(file.size,1048576),a=new Uint8Array(await file.slice(0,n).arrayBuffer());
 const b=new Uint8Array(await file.slice(Math.max(n,file.size-n)).arrayBuffer());
 const bytes=new Uint8Array(a.length+b.length+16);bytes.set(a);bytes.set(b,a.length);
 new DataView(bytes.buffer).setBigUint64(a.length+b.length,BigInt(file.size));
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
}
function sourceRank(line){
 const m=String(line||'').match(/^\s*#?\s*(\d{1,3})\s*[.)\-:]?\s+(?=\S)/);
 return m?Number(m[1]):null;
}
function extractRows(text){
 const out=[],lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 for(let i=0;i<lines.length;i++){
  let line=lines[i];
  let m=line.match(/(\d{1,3}(?:[.,\s]\d{3}){1,4}|\d{4,12})\s*$/);
  if(!m&&i+1<lines.length&&/^(?:\d{1,3}(?:[.,\s]\d{3})+|\d{4,12})$/.test(lines[i+1])){
   line+=' '+lines[++i];m=line.match(/(\d{1,3}(?:[.,\s]\d{3}){1,4}|\d{4,12})\s*$/);
  }
  if(!m)continue;
  const score=Number(m[1].replace(/[.,\s]/g,''));if(!Number.isSafeInteger(score)||score<1000)continue;
  const left=line.slice(0,m.index).replace(/^\s*#?\s*\d{1,3}\s*[.)\-:]?\s*/,'').trim();
  if(!left||left.length<2||/^(total|score|points|punkte|rang|rank|ranking|mission|server)\b/i.test(left))continue;
  const tag=left.match(/[\[(]\s*([a-z0-9]{2,6})\s*[\])]/i);
  out.push({name:left.replace(/[\[(]\s*[a-z0-9]{2,6}\s*[\])]/gi,' ').trim(),alliance:tag?.[1]||'',score,rank:sourceRank(line),raw:line});
 }
 return out;
}
function similarity(a,b){
 const x=norm(a),y=norm(b);if(!x||!y)return 0;if(x===y)return 1;
 if(x.length<3||y.length<3)return 0;
 if(x.length>=5&&y.length>=5&&(x.includes(y)||y.includes(x)))return .94;
 let prev=Array.from({length:y.length+1},(_,i)=>i);
 for(let i=1;i<=x.length;i++){const next=[i];for(let j=1;j<=y.length;j++)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(x[i-1]===y[j-1]?0:1));prev=next}
 return Math.max(0,1-prev[y.length]/Math.max(x.length,y.length));
}
function matchPlayer(row,members){
 if(!norm(row.name))return null;
 const tagged=members.filter(p=>!row.alliance||String(p.alliance_code).toLowerCase()===row.alliance.toLowerCase());
 const list=tagged.map(p=>{
  const names=[p.player_name,...(p.aliases||[])];return {p,s:Math.max(...names.map(n=>similarity(row.name,n)))};
 }).filter(x=>x.s>=.78).sort((a,b)=>b.s-a.s);
 const best=list[0],second=list[1];
 if(!best||best.s<(row.alliance?.92:.96)||second&&best.s-second.s<.07&&best.s<.995)return null;
 if(norm(row.name).length<=4&&best.s<.995)return null;
 return {...best.p,confidence:best.s};
}
function frameCanvas(video){
 const canvas=document.createElement('canvas'),scale=Math.min(2.1,1900/Math.max(1,video.videoWidth));
 canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
 const cx=canvas.getContext('2d',{willReadFrequently:true});cx.drawImage(video,0,0,canvas.width,canvas.height);
 return canvas;
}
async function seek(video,time){
 if(Math.abs(video.currentTime-time)<.03&&video.readyState>=2)return;
 await new Promise((resolve,reject)=>{
  const clean=()=>{video.removeEventListener('seeked',ok);video.removeEventListener('error',bad)};
  const ok=()=>{clean();resolve()};const bad=()=>{clean();reject(Error('Video frame could not be opened'))};
  video.addEventListener('seeked',ok,{once:true});video.addEventListener('error',bad,{once:true});video.currentTime=time;
 });
}
async function metadata(video,file){
 const url=URL.createObjectURL(file);video.src=url;video.preload='auto';video.muted=true;video.playsInline=true;
 try{
  await new Promise((resolve,reject)=>{
   if(video.readyState>=1)return resolve();
   video.onloadedmetadata=resolve;video.onerror=()=>reject(Error('Unsupported video format'));video.load();
  });
  if(!Number.isFinite(video.duration)||video.duration<=0||!video.videoWidth)throw Error('Video metadata unavailable');
  return url;
 }catch(e){URL.revokeObjectURL(url);throw e}
}
function shell(root,kind){
 const perf=kind==='perf';root.innerHTML=
 '<div class="nocr-layout"><section class="nocr-panel"><div class="nocr-fields">'+
 (perf?'<label>'+esc(tr('type'))+'<select id="nocrType"><option value="alliance_mobilization">Alliance Mobilization</option><option value="kvk_prep">KvK Prep · Top 200</option></select></label>':'')+
 (perf?'':'<label>'+esc(tr('event'))+'<select id="nocrEvent" disabled></select></label>')+
 '<label>'+esc(tr('occ'))+'<select id="nocrOcc"></select></label>'+
 (perf?'':'<label>'+esc(tr('day'))+'<select id="nocrPhase"></select></label><label>'+esc(tr('date'))+'<input id="nocrDay" type="date"></label>')+
 '</div><label class="nocr-file"><span class="nocr-file-icon">▣</span><strong>'+esc(tr('file'))+'</strong><small id="nocrFilename">MP4 / MOV</small><input id="nocrFile" type="file" accept="video/mp4,video/quicktime,video/*"></label>'+
 '<p class="nocr-note">'+esc(tr('video'))+'</p><button type="button" class="btn primary nocr-analyze" id="nocrAnalyze">'+esc(tr('analyze'))+'</button><div class="nocr-status" id="nocrStatus" role="status" aria-live="polite"></div></section>'+
 '<section class="nocr-panel nocr-progress" id="nocrProgress" hidden><h3>'+esc(tr('prep'))+'</h3><p id="nocrProgressText"></p><div class="nocr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="nocrBar"></span></div><div class="nocr-progress-foot"><b id="nocrPercent">0%</b><span id="nocrFound">0 '+esc(tr('found'))+'</span></div><div class="nocr-stages"><div data-step="0">✓ '+esc(tr('prep'))+'</div><div data-step="1">◎ '+esc(tr('recognize'))+'</div><div data-step="2">○ '+esc(tr('check'))+'</div></div></section></div>'+
 '<section class="nocr-panel nocr-review" id="nocrReview" hidden><div class="nocr-review-title"><h3>'+esc(tr('review'))+'</h3><strong id="nocrCount"></strong></div><div id="nocrResults"></div><div class="nocr-save-row"><button type="button" class="btn primary" id="nocrSave">'+esc(tr('save'))+'</button><div class="nocr-status" id="nocrSaveStatus" role="status"></div></div></section>';
 root.querySelector('#nocrFile').addEventListener('change',e=>{$('#nocrFilename',root).textContent=e.target.files?.[0]?.name||'MP4 / MOV'});
}
function progress(step,value,count){
 const el=run?.root;if(!el)return;
 const panel=$('#nocrProgress',el);panel.hidden=false;
 const pct=Math.max(0,Math.min(100,Math.round(value)));$('#nocrBar',el).style.width=pct+'%';
 $('#nocrPercent',el).textContent=pct+'%';$('.nocr-bar',el).setAttribute('aria-valuenow',String(pct));
 const title=tr(step===0?'prep':step===1?'recognize':'check');
 $('h3',panel).textContent=title;$('#nocrProgressText',el).textContent=title+' …';
 $('#nocrFound',el).textContent=count+' '+tr('found');
 for(const item of panel.querySelectorAll('[data-step]'))item.classList.toggle('active',Number(item.dataset.step)===step);
}
function status(txt,isError=false){
 const el=run?.root?.querySelector('#nocrStatus');if(!el)return;el.textContent=txt;el.classList.toggle('error',isError);
}
function selectOption(text,value){return '<option value="'+esc(value)+'">'+esc(text)+'</option>'}
async function lawOccurrence(){
 const r=run,root=r.root;if(!root.isConnected)return;
 r.hits=[];$('#nocrReview',root).hidden=true;
 const event=$('#nocrEvent',root).value;if(!EVENTS.includes(event)){status(tr('prohibit'),true);return}
 const occ=$('#nocrOcc',root);occ.innerHTML=selectOption('…','');
 try{
  const options=await rpc('get_screen_import_occurrences',{p_event_name:event});
  if(run!==r)return;
  const permitted=r.allowed.filter(x=>x.event_name===event);
  const open=(options||[]).filter(o=>permitted.some(p=>p.begin_at&&o.begin_at&&Date.parse(p.begin_at)===Date.parse(o.begin_at)));
  r.occurrences=open;
  occ.innerHTML=open.length?open.map(o=>selectOption(dayUTC(o.begin_at)+' · '+(dayUTC(o.end_at))+(o.phase_hint?' · '+o.phase_hint:''),o.event_schedule_id)).join(''):selectOption(tr('missingEvent'),'');
  setLawPhase();
  if(!open.length)status(tr('missingEvent'),true);else status('');
 }catch(e){occ.innerHTML=selectOption(tr('missingEvent'),'');status(e.message||String(e),true)}
}
function selectedOcc(){return run?.occurrences?.find(o=>String(o.event_schedule_id)===$('#nocrOcc',run.root)?.value)}
function setLawPhase(){
 const r=run;if(!r||r.kind!=='law')return;
 const root=r.root,event=$('#nocrEvent',root).value,occ=selectedOcc(),phase=$('#nocrPhase',root);
 const list=(PHASES[event]||[]).filter(p=>{
  if(occ?.phase_hint&&p[0]!==occ.phase_hint)return false;
  if((event==='Strongest Governor'||event==='Alliance Brawl')&&occ){
   return validDay(dayUTC(occ.begin_at,Number(p[0].slice(2))-1),occ);
  }
  return true;
 });
 const previous=phase.value;
 phase.innerHTML=list.map(p=>{
  const n=Number(p[0].slice(2)),day=(event==='Strongest Governor'||event==='Alliance Brawl')&&occ?dayUTC(occ.begin_at,n-1):'';
  return selectOption(p[1]+(day?' · '+day:''),p[0]);
 }).join('');
 if(list.some(p=>p[0]===previous))phase.value=previous;
 else if(list.length)phase.value=list[list.length-1][0];
 if(event==='Strongest Governor'||event==='Alliance Brawl'){
  const first=phase.value,offset=Number(first.slice(2))-1;
  const suggested=occ?dayUTC(occ.begin_at,offset):dayUTC(new Date());
  $('#nocrDay',root).value=suggested;
 }else{
  const now=dayUTC(new Date()),start=occ?dayUTC(occ.begin_at):now,end=occ?dayUTC(new Date(Math.min(Date.now(),Date.parse(occ.end_at)-1000))):now;
  $('#nocrDay',root).value=dayNum(now)>=dayNum(start)&&dayNum(now)<=dayNum(end)?now:end;
 }
 const input=$('#nocrDay',root);input.min=occ?dayUTC(occ.begin_at):'';input.max=occ?dayUTC(new Date(Math.min(Date.now(),Date.parse(occ.end_at)-1000))):dayUTC(new Date());
 input.readOnly=event==='Strongest Governor'||event==='Alliance Brawl';
 input.title=input.readOnly?'Date is determined by the selected event day.':'';
}
async function performanceOptions(){
 const r=run,root=r.root;if(!root.isConnected)return;
 const occ=$('#nocrOcc',root),type=$('#nocrType',root).value;occ.innerHTML=selectOption('…','');
 try{
  const d=await rpc('get_performance_import_options');if(run!==r)return;
  const options=type==='kvk_prep'?d.kvk:d.mobilization;
  r.occurrences=(options||[]).map(o=>({...o,event_schedule_id:o.event_schedule_id||null}));
  occ.innerHTML=r.occurrences.length?r.occurrences.map(o=>selectOption(dayUTC(o.begin_at||o.prep_start)+' · '+(type==='kvk_prep'?'KvK Prep':'Alliance Mobilization'),o.event_schedule_id||o.cycle_id)).join(''):selectOption(tr('missingEvent'),'');
  status(r.occurrences.length?'':tr('missingEvent'),!r.occurrences.length);
 }catch(e){occ.innerHTML=selectOption(tr('missingEvent'),'');status(e.message||String(e),true)}
}
function perfOcc(){return run?.occurrences?.find(o=>String(o.event_schedule_id||o.cycle_id)===$('#nocrOcc',run.root)?.value)}
async function analyze(){
 const r=run,root=r.root,btn=$('#nocrAnalyze',root);if(!r||r.busy)return;
 const file=$('#nocrFile',root).files?.[0];
 if(!file){status(tr('choose'),true);return}
 if(r.kind==='law'){
  const occ=selectedOcc(),day=$('#nocrDay',root).value;
  if(!occ||!$('#nocrPhase',root).value||!validDay(day,occ)){status(tr('invalid'),true);return}
 }else if(!perfOcc()){status(tr('missingEvent'),true);return}
 r.busy=true;btn.disabled=true;$('#nocrSave',root).disabled=true;$('#nocrReview',root).hidden=true;status('');
 let url,video,worker;
 try{
  progress(0,1,0);
  let members=[...(await roster())];
  if(r.kind==='perf'&&$('#nocrType',root).value==='alliance_mobilization'&&perfOcc()?.event_schedule_id){
   try{
    const extras=await rpc('get_performance_candidate_roster',{p_event_schedule_id:perfOcc().event_schedule_id});
    const ids=new Set(members.map(x=>String(x.player_game_id||x.player_id)));
    for(const p of extras||[]){const id=String(p.player_game_id||p.player_id);if(!ids.has(id)){members.push(p);ids.add(id)}}
   }catch(e){console.warn('Performance transfer roster unavailable',e)}
  }
  r.members=members;
  r.fileHash=await sha256(file);
  worker=await ensureWorker();
  video=document.createElement('video');url=await metadata(video,file);
  if(r!==run)return;
  progress(1,6,0);
  const dur=video.duration;
  const count=Math.min(46,Math.max(1,Math.floor(dur/.85)));
  const times=Array.from({length:count},(_,i)=>Math.min(Math.max(0,dur-.08),.25+i*Math.max(.85,(dur-.5)/Math.max(1,count))));
  const best=new Map(),unmatched=new Map();
  for(let i=0;i<times.length;i++){
   if(run!==r)break;
   const sec=times[i];await seek(video,sec);
   const canvas=frameCanvas(video);
   const text=(await worker.recognize(canvas)).data?.text||'';
   const rows=extractRows(text);
   let still=null;
   for(const row of rows){
    const p=matchPlayer(row,members);
    if(!p){const k=norm(row.name)+'|'+row.score;if(!unmatched.has(k)){if(!still)still=canvas.toDataURL('image/jpeg',.74);unmatched.set(k,{...row,time:sec,image:still})}continue}
    if(r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'&&!(row.rank>=1&&row.rank<=200))continue;
    const key=p.player_game_id||p.player_id;
    const existing=best.get(key);
    if(!existing||row.score>existing.score){
     if(!still)still=canvas.toDataURL('image/jpeg',.74);
     best.set(key,{...row,player:p,time:sec,image:still});
    }
   }
   progress(1,6+86*((i+1)/times.length),best.size);
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(run!==r)return;
  r.hits=[...best.values()].sort((a,b)=>b.score-a.score);
  r.unmatched=[...unmatched.values()].slice(0,30);
  progress(2,96,r.hits.length);
  if(r.kind==='law'){
   const occ=selectedOcc();
   r.preview=await rpc('preview_screen_recording_nap_occurrence_v2',{
    p_event_schedule_id:occ.event_schedule_id,p_event_name:$('#nocrEvent',root).value,
    p_phase_name:$('#nocrPhase',root).value,p_recording_day:$('#nocrDay',root).value,
    p_recording_captured_at:null,p_hits:r.hits.map(hitPayload)
   });
  }
  progress(2,100,r.hits.length);
  showReview(r);status(r.hits.length?tr('ready'):tr('nohits'),!r.hits.length);
 }catch(e){console.error('native screen OCR',e);status(tr('error')+': '+(e.message||e),true)}
 finally{if(url)URL.revokeObjectURL(url);if(video){video.removeAttribute('src');video.load()}r.busy=false;if(root.isConnected){btn.disabled=false;$('#nocrSave',root).disabled=!r.hits?.length}}
}
function hitPayload(h){return {player_id:h.player?.player_id||null,player_game_id:h.player?.player_game_id||null,player_name:h.player?.player_name||h.name,detected_alliance:h.alliance||h.player?.alliance_code||null,score:h.score,server_rank:h.rank||null}}
function showReview(r){
 const root=r.root,preview=r.preview?.results||[],statuses=new Map(preview.map(x=>[String(x.player_game_id||x.player_id||''),x]));
 $('#nocrReview',root).hidden=false;$('#nocrCount',root).textContent=r.hits.length+' '+tr('found');
 $('#nocrResults',root).innerHTML=r.hits.map((h,i)=>{
  const st=statuses.get(String(h.player?.player_game_id||h.player?.player_id||'')),label=st?.status||'';
  const allowed=r.kind==='perf'||['violation','update'].includes(label)||!!h.manual;
  return '<article class="nocr-hit"><label class="nocr-hit-check"><input type="checkbox" data-hit="'+i+'" '+(allowed?'checked':'')+'>'+
   '<span><strong>'+esc(h.player.player_name)+'</strong><small>'+esc(h.player.alliance_code||'')+' · '+esc(h.player.player_game_id||'')+'</small></span></label>'+
   '<input type="number" min="0" step="1" data-score="'+i+'" value="'+esc(h.score)+'" aria-label="'+esc(tr('score'))+'">'+
   (r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'?'<input type="number" min="1" max="200" step="1" data-rank="'+i+'" value="'+esc(h.rank||'')+'" aria-label="'+esc(tr('rank'))+'">':'')+
   '<span class="nocr-result-state">'+esc(label)+'</span>'+
   (h.image?'<details><summary>'+esc(tr('frame'))+'</summary><img src="'+h.image+'" alt="'+esc(tr('frame'))+'"></details>':'')+'</article>'
 }).join('')+
 (r.unmatched.length?'<details class="nocr-unmatched"><summary>'+esc(tr('unmatched'))+' ('+r.unmatched.length+')</summary>'+
 '<label>'+esc(tr('unmatched'))+'<select id="nocrUnknown">'+r.unmatched.map((x,i)=>selectOption(x.raw,i)).join('')+'</select></label>'+
 '<label>'+esc(tr('selectPlayer'))+'<select id="nocrMapPlayer"><option value="">–</option>'+r.members.map((p,i)=>selectOption(p.player_name+' · '+(p.alliance_code||'')+' · '+(p.player_game_id||''),i)).join('')+'</select></label>'+
 '<button class="btn secondary" type="button" id="nocrMapConfirm">'+esc(tr('assign'))+'</button></details>':'');
 const mapButton=$('#nocrMapConfirm',root);if(mapButton)mapButton.onclick=()=>{
  const index=Number($('#nocrUnknown',root).value),playerIndex=$('#nocrMapPlayer',root).value;
  if(playerIndex==='')return;
  const row=r.unmatched[index],p=r.members[Number(playerIndex)];if(!row||!p)return;
  const existing=r.hits.find(x=>String(x.player.player_game_id||x.player.player_id)===String(p.player_game_id||p.player_id));
  if(!existing||row.score>existing.score){const h={...row,player:p,manual:true};if(existing)r.hits=r.hits.filter(x=>x!==existing);r.hits.push(h)}
  r.unmatched.splice(index,1);r.hits.sort((x,y)=>y.score-x.score);showReview(r);
 };
 $('#nocrSave',root).disabled=!r.hits.length;
}
async function save(){
 const r=run,root=r.root;if(r.busy)return;
 const selected=r.hits.filter((h,i)=>{
  const c=$('[data-hit="'+i+'"]',root);
  if(!c?.checked)return false;
  const score=Number($('[data-score="'+i+'"]',root)?.value);
  if(!Number.isSafeInteger(score)||score<0)return false;h.score=score;
  if(r.kind==='perf'&&$('#nocrType',root).value==='kvk_prep'){
   const rank=Number($('[data-rank="'+i+'"]',root)?.value);
   if(!Number.isInteger(rank)||rank<1||rank>200)return false;h.rank=rank;
  }
  return true;
 });
 if(!selected.length){$('#nocrSaveStatus',root).textContent=tr('nohits');return}
 r.busy=true;$('#nocrSave',root).disabled=true;
 const out=$('#nocrSaveStatus',root);out.textContent=tr('saving');
 try{
  let response;
  if(r.kind==='law'){
   const occ=selectedOcc();
   const args={p_event_schedule_id:occ.event_schedule_id,p_event_name:$('#nocrEvent',root).value,
    p_phase_name:$('#nocrPhase',root).value,p_recording_day:$('#nocrDay',root).value,
    p_recording_captured_at:null,p_video_hash:r.fileHash,p_hits:selected.map(hitPayload)};
   // Mandatory fresh preview after editable scores, before any database write.
   const checked=await rpc('preview_screen_recording_nap_occurrence_v2',{
    p_event_schedule_id:args.p_event_schedule_id,p_event_name:args.p_event_name,p_phase_name:args.p_phase_name,
    p_recording_day:args.p_recording_day,p_recording_captured_at:null,p_hits:args.p_hits
   });
   const wanted=new Set(selected.map(h=>String(h.player.player_game_id||h.player.player_id)));
   const allowed=(checked.results||[]).filter(x=>wanted.has(String(x.player_game_id||x.player_id))&&['violation','update'].includes(x.status));
   if(!allowed.length){out.textContent=tr('nohits');return}
   args.p_hits=selected.filter(h=>allowed.some(x=>String(x.player_game_id||x.player_id)===String(h.player.player_game_id||h.player.player_id))).map(hitPayload);
   response=await rpc('import_screen_recording_nap_occurrence_v2',args);
   const evidenceRows=(response.results||[]).filter(x=>['created','updated'].includes(x.status)&&x.violation_id);
   if(evidenceRows.length){
    out.textContent=tr('upload');
    const uploads=await Promise.allSettled(evidenceRows.map(async row=>{
     const h=selected.find(x=>x.player.player_name===row.player_name&&x.player.alliance_code===row.assigned_alliance);
     if(!h?.image)return;
     const res=await fetch(API+'/functions/v1/screen-evidence-upload',{
      method:'POST',headers:await headers(),body:JSON.stringify({p_violation_id:row.violation_id,
       p_source_video_hash:r.fileHash,p_frame_time_seconds:h.time,p_data_url:h.image})
     });
     if(!res.ok){let err=await res.text();throw Error('Evidence '+res.status+': '+err.slice(0,160))}
    }));
    const failed=uploads.filter(x=>x.status==='rejected');
    if(failed.length){out.textContent=tr('done')+' · '+failed.length+' Evidence upload(s) failed. '+String(failed[0].reason||'');window.postMessage({type:'nap-screen-import-saved'},location.origin);return}
   }
  }else{
   const type=$('#nocrType',root).value,occ=perfOcc();
   const method=type==='kvk_prep'?'import_player_kvk_performance_batch':'import_player_performance_batch';
   const args=type==='kvk_prep'?{p_cycle_id:occ.cycle_id,p_video_hash:r.fileHash,p_hits:selected.map(hitPayload)}:
    {p_performance_type:'alliance_mobilization',p_event_schedule_id:occ.event_schedule_id,p_video_hash:r.fileHash,p_hits:selected.map(hitPayload)};
   response=await rpc(method,args);
  }
  out.textContent=response?.duplicate_video?tr('duplicate'):tr('done')+' · '+fmt(response.created||0)+' + '+fmt(response.updated||0);
  window.postMessage({type:'nap-screen-import-saved'},location.origin);
 }catch(e){out.textContent=(e.message||String(e));console.error('native OCR save',e)}
 finally{r.busy=false;if(root.isConnected)$('#nocrSave',root).disabled=false}
}
function mount(root,kind,allowed=[]){
 if(run?.busy)return;
 run={root,kind,allowed,hits:[],unmatched:[],occurrences:[],members:[],busy:false,preview:null,fileHash:null};
 shell(root,kind);
 const r=run;$('#nocrAnalyze',root).onclick=analyze;$('#nocrSave',root).onclick=save;
 if(kind==='law'){
  const event=$('#liveScreenEvent')?.value||allowed[0]?.event_name;
  $('#nocrEvent',root).innerHTML=EVENTS.filter(n=>allowed.some(o=>o.event_name===n)).map(x=>selectOption(x,x)).join('');
  if(event&&EVENTS.includes(event))$('#nocrEvent',root).value=event;
  $('#nocrEvent',root).onchange=lawOccurrence;$('#nocrOcc',root).onchange=setLawPhase;
  $('#nocrPhase',root).onchange=()=>{const occ=selectedOcc(),phase=$('#nocrPhase',root).value,event=$('#nocrEvent',root).value;if(occ&&(event==='Strongest Governor'||event==='Alliance Brawl'))$('#nocrDay',root).value=dayUTC(occ.begin_at,Number(phase.slice(2))-1);};
  lawOccurrence();
 }else{$('#nocrType',root).onchange=performanceOptions;performanceOptions()}
}
function initLaw(){
 const picker=$('#liveScreenEvent');if(!picker)return;
 // The mode is never allowed to receive attendance-only events.
 [...picker.options].forEach(o=>{if(o.value&&!EVENTS.includes(o.value))o.remove()});
 picker.onchange=()=>{if(run?.kind==='law'&&run.root.isConnected){$('#nocrEvent',run.root).value=picker.value;lawOccurrence()}};
}
function openLaw(silent=false){
 const root=$('#liveImporterHost'),allowed=window.NAP_V2_SCREEN_OPTIONS||[];
 if(!root)return;
 mount(root,'law',allowed.filter(x=>EVENTS.includes(x.event_name)));
 if(!silent)root.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function openPerformance(){
 const root=$('#livePerformanceExtra');if(!root)return;
 root.innerHTML='<section class="card"><div class="card-head"><div><div class="card-title">Performance ScreenRecording</div></div></div><div class="card-body"><div id="nocrPerformanceHost"></div></div></section>';
 mount($('#nocrPerformanceHost',root),'perf');
 root.scrollIntoView({behavior:'smooth',block:'nearest'});
}
window.NAP_NATIVE_IMPORTER={initLaw,openLaw,openPerformance};
})();