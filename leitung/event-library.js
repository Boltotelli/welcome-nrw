/* NRW AllianceOS event hub: READ the existing Dashboard's event sources and shared rhythm.
 * Private message overrides are saved exclusively in aos_event_messages via the authenticated API.
 * There is no second event calendar or guide database. */
export function createEventHub({request,flash,esc,t}) {
 const $=id=>document.getElementById(id);
 const localeName={de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"};
 const guideIds={brawl:"alliance-brawl",kvk:"kingdom-of-power-prep",strongest:"strongest-governor",armament:"armament-competition",officer:"officer-project",golden:"golden-glaives",merchant:"merchant-empire",fishing:"fishing-tournament",viking:"viking-vengeance",eternity:"eternitys-reach",cesare:"cesares-fury",championship:"alliance-championship",kill:"kill-event",bear:"bear-trap",transfer:"kingdom-transfer",champagne:"champagne-fair",roulette:"hero-roulette"};
 let sources=null,loading=null,items=[],extraEvents=[],state=null,language="de",canEdit=false,selected=null,rhythmByDay=new Map();
 const lk=(value,lang=language)=>typeof value==="string"?value:Array.isArray(value)?value:(value?.[lang]||value?.en||value?.de||value?.fr||value?.es||"");
 const dayKey=d=>new Date(d).toISOString().slice(0,10);
 const dateRange=(start,end,max=90)=>{
   const a=Date.parse(start+"T00:00:00Z"),b=Date.parse((end||start)+"T00:00:00Z");
   if(!Number.isFinite(a)||!Number.isFinite(b)||a>b)return [];
   return Array.from({length:Math.min(max,Math.floor((b-a)/86400000)+1)},(_,i)=>dayKey(a+i*86400000));
 };
 const offset=(base,n)=>dayKey(Date.parse(base+"T00:00:00Z")+n*86400000);
 const kind=e=>{
   const x=(String(e.id||"")+" "+String(lk(e.name,"en"))).toLowerCase();
   if(x.includes("alliance-brawl")||x.includes("alliance brawl"))return "brawl";
   if(x.includes("kingdom-of-power")||x.includes("kvk"))return "kvk";
   if(x.includes("strongest-governor")||x.includes("strongest governor"))return "strongest";
   if(x.includes("fishing")||x.includes("fischer"))return "fishing";
   if(x.includes("viking"))return "viking";
   if(x.includes("eternity"))return "eternity";
   if(x.includes("cesare"))return "cesare";
   if(x.includes("golden-glaives")||x.includes("golden glaives"))return "golden";
   if(x.includes("kill-event")||x.includes("kill event"))return "kill";
   if(x.includes("officer-project")||x.includes("officer project"))return "officer";
   if(x.includes("armament"))return "armament";
   if(x.includes("alliance-mobilization")||x.includes("alliance mobilization")||x.includes("allianz-mobilisierung"))return "mobilization";
   if(x.includes("merchant empire")||x.includes("handelsimperium")||x.includes("empire commercial"))return "merchant";
   if(x.includes("alliance-championship")||x.includes("alliance championship"))return "championship";
   if(x.includes("bear-trap")||x.includes("bear trap"))return "bear";
   if(x.includes("champagne"))return "champagne";
   if(x.includes("roulette"))return "roulette";
   if(x.includes("transfer"))return "transfer";
   return "generic";
 };
 const guideFor=e=>{
   const id=String(e.id||""),all=sources.guides.events||[];
   return all.find(g=>id===g.id||id.startsWith(g.id+"-"))||all.find(g=>g.id===guideIds[kind(e)])||null;
 };
 const name=item=>lk(item.record.name||item.record.names||item.record.title)||item.record.id;
 const formatDate=day=>{const d=new Date(day+"T00:00:00Z");return Number.isNaN(d.getTime())?day:new Intl.DateTimeFormat(localeName[language]||"de-DE",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(d);};
 async function load(){
  if(sources)return sources;
  if(!loading)loading=Promise.all([
    fetch("/dashboard/events.json",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject(new Error("events_source_unavailable"))),
    fetch("/dashboard/event-guides.json",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject(new Error("guides_source_unavailable")))
  ]).then(([schedule,guides])=>{sources={schedule,guides};assemble();return sources;}).catch(e=>{loading=null;throw e;});
  return loading;
 }
 function assemble(){
  const base=dayKey(new Date()),start=offset(base,-15),end=offset(base,56),manual=(sources.schedule.events||[]).filter(x=>x?.id&&/^\d{4}-\d{2}-\d{2}$/.test(x.start||""));
  const dict=new Map(),manualAt=new Map();
  for(const item of manual){
    const days=dateRange(item.start,item.end,120);
    const obj={key:item.id,source:"manual",record:item,days,guide:guideFor(item)};
    dict.set(item.id,obj);
    for(const day of days){
      if(!manualAt.has(day))manualAt.set(day,new Set());
      manualAt.get(day).add(kind(item));
    }
  }
  if(!window.NRW_EVENT_RHYTHM?.forDate)throw new Error("shared_rhythm_missing");
  for(const day of dateRange(start,end,85)){
    const derived=window.NRW_EVENT_RHYTHM.forDate(day)||[];
    rhythmByDay.set(day,derived);
    for(const item of derived){
      if(manualAt.get(day)?.has(kind(item)))continue;
      const existing=dict.get(item.id);
      if(existing){if(!existing.days.includes(day))existing.days.push(day);}
      else dict.set(item.id,{key:item.id,source:"rhythm",record:item,days:[day],guide:guideFor(item)});
    }
  }
  items=[...dict.values()].sort((a,b)=>a.record.start.localeCompare(b.record.start)||name(a).localeCompare(name(b)));

 }
 function list(){
  const search=$("eventLibrarySearch").value.trim().toLowerCase(),filter=$("eventLibraryFilter").value;
  const today=dayKey(new Date()),eight=offset(today,56);
  if(!sources){$("eventLibraryList").innerHTML='<p class="muted">'+esc(t("libraryLoadError"))+'</p>';return;}
  if(filter==="guides"){
    const all=[...(sources.guides.events||[]).map(g=>({key:"guide-"+g.id,source:"guide",record:g,days:[today],guide:g})),...(sources.guides.catalogOnly||[]).map((g,i)=>({key:"catalog-"+String(g.id||i),source:"catalog",record:g,days:[today],guide:g}))];
    const shown=all.filter(item=>!search||((name(item)+" "+item.key).toLowerCase().includes(search)));
    $("eventLibraryCount").textContent=String(shown.length);
    $("eventLibraryList").innerHTML=shown.map(item=>itemCard(item)).join("")||'<p class="muted">'+esc(t("noEvents"))+'</p>';
    return;
  }
  const shown=[...items,...extraEvents].filter(item=>{
   if(search && !(name(item)+" "+item.key).toLowerCase().includes(search))return false;
   const days=item.days;
   if(filter==="past")return item.record.start<today;
   if(filter==="upcoming")return days.some(d=>d>=today&&d<=eight);
   return true;
  }).sort((a,b)=>filter==="past"?b.record.start.localeCompare(a.record.start):a.record.start.localeCompare(b.record.start)).slice(0,180);
  $("eventLibraryCount").textContent=String(shown.length);
  $("eventLibraryList").innerHTML=shown.map(item=>itemCard(item)).join("")||'<p class="muted">'+esc(t("noEvents"))+'</p>';
 }
 function itemCard(item){
  const k=item.source,tag=k==="manual"?t("manualSource"):k==="rhythm"?t("rhythmSource"):k==="custom"?t("customSource"):k==="guide"?t("guideSource"):t("catalogSource");
  const dates=k==="guide"||k==="catalog"?t("guideOnly"):formatDate(item.record.start)+(item.record.end&&item.record.end!==item.record.start?" – "+formatDate(item.record.end):"");
  const mark=item.record.confidence==="predicted"?' · '+t("notConfirmed"):"";
  return '<article class="event-source-item"><div><span class="eyebrow">'+esc(tag+mark)+'</span><h3>'+esc(name(item))+'</h3><small>'+esc(dates)+'</small></div>'+
   '<button type="button" class="ghost" data-library-key="'+esc(item.key)+'">'+esc(t("showEvent"))+' →</button></article>';
 }
 function render(current,lang,allowed){
  state=current;language=lang;canEdit=allowed;
  extraEvents=(current?.events||[]).filter(e=>e.id&&e.start_at).map(e=>({
    key:"aos-"+e.id,source:"custom",record:{...e,id:e.id,name:e.title,start:e.start_at.slice(0,10),end:(e.end_at||e.start_at).slice(0,10),tips:e.description},
    days:dateRange(e.start_at.slice(0,10),(e.end_at||e.start_at).slice(0,10),90),guide:null
  }));
  if(sources)list();
 }
 function findItem(key){return [...items,...extraEvents].find(x=>x.key===key)||[...(sources?.guides.events||[]).map(g=>({key:"guide-"+g.id,source:"guide",record:g,days:[dayKey(new Date())],guide:g})),...(sources?.guides.catalogOnly||[]).map((g,i)=>({key:"catalog-"+String(g.id||i),source:"catalog",record:g,days:[dayKey(new Date())],guide:g}))].find(x=>x.key===key);}
 function activeDay(){return $("libraryDay").value||selected?.days?.[0]||dayKey(new Date());}
 function detailFor(){
  if(!selected)return null;
  const rec=selected.record,day=activeDay(),g=selected.guide,plan=rec.dailyPlans?.[day]||null,coach=rec.rhythmCoach?.[language]||rec.rhythmCoach?.en||null;
  const implied=rhythmByDay.get(day)?.find(x=>kind(x)===kind(rec));
  const rhythmic=(selected.source==="rhythm"?(implied?.rhythmCoach?.[language]||implied?.rhythmCoach?.en||coach):coach||implied?.rhythmCoach?.[language]||implied?.rhythmCoach?.en)||null;
  const lines=[];
  const push=(heading,value)=>{
    if(value==null)return;
    let resolved=lk(value);
    if(typeof resolved==="string"&&resolved.trim())lines.push({heading,text:resolved.trim()});
    else if(Array.isArray(resolved))for(const v of resolved){const vv=lk(v);if(typeof vv==="string"&&vv.trim())lines.push({heading,text:vv.trim()});}
  };
  push(t("dailyPoints"),plan?.points||rhythmic?.points);
  push(t("dailySteps"),plan?.steps||rhythmic?.steps);
  push(t("eventNote"),plan?.note);
  push(t("eventTips"),rec.tips);
  push(t("eventPrepare"),plan?.prepare?.title);
  push(t("eventPrepare"),plan?.prepare?.steps);
  push(t("dailyDetails"),rhythmic?.details);
  if(!plan && !rhythmic){push(t("guideObjective"),g?.objective);push(t("guideNrwRule"),g?.nrwRule);push(t("guideNrwRule"),g?.globalNrwRules);push(t("dailySteps"),g?.nrwGuide);}
  const limits=plan?.limits||rhythmic?.limits;
  if(limits)push(t("eventLimits"),limits.note||limits);
  return {day,rec,guide:g,plan,rhythmic,lines};
 }
 function renderDetails(){
  if(!selected)return;
  const detail=detailFor();
  const compact=detail.lines.map(o=>'<div class="library-fact"><span>'+esc(o.heading)+'</span><p>'+esc(o.text)+'</p></div>').join("");
  const g=detail.guide,raw=JSON.stringify(g||detail.rec,null,2);
  const sourceLink=detail.rec.sourceUrl&&/^https:\/\//.test(detail.rec.sourceUrl)?'<a target="_blank" rel="noopener noreferrer" href="'+esc(detail.rec.sourceUrl)+'">'+esc(t("sourceLink"))+' ↗</a>':"";
  $("libraryDetails").innerHTML='<div class="library-facts">'+compact+'</div>'+
    (g?'<p class="muted">'+esc(t("guideConnected"))+' · '+esc(lk(g.names||g.name)||g.id)+'</p>':"")+
    (sourceLink?'<p>'+sourceLink+'</p>':"")+
    '<details><summary>'+esc(t("rawSource"))+'</summary><pre>'+esc(raw)+'</pre></details>'+
    (detail.plan?'<details><summary>'+esc(t("rawDaily"))+'</summary><pre>'+esc(JSON.stringify(detail.plan,null,2))+'</pre></details>':"");
  fillMessages();
 }
 function buildText(limit){
  const d=detailFor(),head='['+formatDate(d.day)+'] '+name(selected),lines=[head];
  const fragments=d.lines.map(x=>x.text.replace(/\s+/g," ").trim()).filter(Boolean);
  if(d.lines.length===0){
    const guide=d.guide;
    for(const v of [lk(guide?.objective),lk(guide?.nrwRule),...(Array.isArray(lk(guide?.nrwGuide))?lk(guide.nrwGuide):[])])
      if(typeof v==="string"&&v.trim())fragments.push(v.trim());
  }
  for(const line of fragments){
   if(lines.join("\n").length+1+line.length<=limit){lines.push(line);continue;}
   const rest=limit-lines.join("\n").length-2;
   if(rest>=35){
     const shortened=line.slice(0,rest).replace(/\s+\S*$/,"").trim();
     if(shortened)lines.push(shortened+"…");
   }
   break;
  }
  if(lines[0].length>limit)lines[0]=lines[0].slice(0,limit);
  return lines.join("\n");
 }
 function stored(){
  return state?.eventMessages?.find(x=>x.source_key===selected?.key&&x.day===activeDay())||null;
 }
 function fillMessages(){
  const row=stored();$("libraryChat").value=row?.chat_text?.[language]||buildText(512);
  $("libraryNote").value=row?.note_text?.[language]||buildText(300);
  $("libraryChat").readOnly=!canEdit;$("libraryNote").readOnly=!canEdit;
  $("saveLibraryMessages").disabled=!canEdit;
  $("libraryMessageState").textContent=row?.chat_text?.[language]||row?.note_text?.[language]?t("customTextSaved"):t("generatedFromGuide");
  updateCounters();
 }
 function updateCounters(){
  for(const [id,target,max] of [["libraryChat","chatCount",512],["libraryNote","noteCount",300]]){
   const n=$(id).value.length;$(target).textContent=n+" / "+max;$(target).classList.toggle("too-long",n>max);
  }
 }
 function open(key){
  selected=findItem(key);if(!selected)return;
  $("libraryModalTitle").textContent=name(selected);
  $("libraryModalSource").textContent=selected.source==="manual"?t("manualSource"):selected.source==="rhythm"?t("rhythmSource"):t("guideSource");
  const dates=selected.days.length?selected.days:[dayKey(new Date())];
  $("libraryDay").innerHTML=dates.map(d=>'<option value="'+esc(d)+'">'+esc(formatDate(d))+'</option>').join("");
  const today=dayKey(new Date());if(dates.includes(today))$("libraryDay").value=today;
  else if(dates.some(d=>d>today))$("libraryDay").value=dates.find(d=>d>today);
  renderDetails();$("eventLibraryDialog").showModal();
 }
 async function copyText(kind){
  const el=$(kind==="chat"?"libraryChat":"libraryNote"),max=kind==="chat"?512:300;
  if(!el.value||el.value.length>max){flash(t("invalidMessage"),true);return;}
  try{
   if(!navigator.clipboard?.writeText)throw Error("clipboard_unavailable");
   await navigator.clipboard.writeText(el.value);
   flash(t("copiedText"));
  }catch{
   el.focus();el.select();flash(t("copySelect"));
  }
 }
 async function saveTexts(){
  if(!selected||!canEdit)return;
  const chat=$("libraryChat").value.trim(),note=$("libraryNote").value.trim();
  if(chat.length>512||note.length>300){flash(t("invalidMessage"),true);return;}
  const old=stored(),chat_text={...(old?.chat_text||{}),[language]:chat},note_text={...(old?.note_text||{}),[language]:note};
  const btn=$("saveLibraryMessages");btn.disabled=true;
  try{
   const result=await request("bootstrap",{action:"event_message",source_key:selected.key,day:activeDay(),chat_text,note_text});
   state.eventMessages=(state.eventMessages||[]).filter(m=>!(m.source_key===selected.key&&m.day===activeDay()));
   state.eventMessages.unshift(result.item);
   $("libraryMessageState").textContent=t("customTextSaved");flash(t("saved"));
  }catch(e){flash(t("genericError")+" ("+e.message+")",true);}
  finally{btn.disabled=!canEdit;}
 }
 function attach(){
  $("eventLibrarySearch").addEventListener("input",list);
  $("eventLibraryFilter").addEventListener("change",list);
  $("eventLibraryList").addEventListener("click",e=>{const btn=e.target.closest("[data-library-key]");if(btn)open(btn.dataset.libraryKey);});
  $("closeLibraryDialog").addEventListener("click",()=>$("eventLibraryDialog").close());
  $("libraryDay").addEventListener("change",renderDetails);
  $("libraryChat").addEventListener("input",updateCounters);
  $("libraryNote").addEventListener("input",updateCounters);
  $("copyLibraryChat").addEventListener("click",()=>copyText("chat"));
  $("copyLibraryNote").addEventListener("click",()=>copyText("note"));
  $("saveLibraryMessages").addEventListener("click",saveTexts);
 }
 attach();
 return {load,render};
}
