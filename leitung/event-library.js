/* NRW AllianceOS event hub: READ the existing Dashboard's event sources and shared rhythm.
 * Private message overrides are saved exclusively in aos_event_messages via the authenticated API.
 * There is no second event calendar or guide database. */
export function createEventHub({request,flash,esc,t}) {
 const $=id=>document.getElementById(id);
 const localeName={de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"};
 const guideIds={brawl:"alliance-brawl",kvk:"kingdom-of-power-prep",strongest:"strongest-governor",armament:"armament-competition",officer:"officer-project",golden:"golden-glaives",merchant:"merchant-empire",fishing:"fishing-tournament",viking:"viking-vengeance",eternity:"eternitys-reach",cesare:"cesares-fury",championship:"alliance-championship",kill:"kill-event",bear:"bear-trap",transfer:"kingdom-transfer",champagne:"champagne-fair",roulette:"hero-roulette"};
 let sources=null,loading=null,items=[],extraEvents=[],groups=[],state=null,language="de",canEdit=false,selected=null,rhythmByDay=new Map();
 const lk=(value,lang=language)=>typeof value==="string"?value:Array.isArray(value)?value:(value?.[lang]||value?.en||value?.de||value?.fr||value?.es||"");
 const dayKey=d=>new Date(d).toISOString().slice(0,10);
 const dateRange=(start,end,max=90)=>{
   const a=Date.parse(start+"T00:00:00Z"),b=Date.parse((end||start)+"T00:00:00Z");
   if(!Number.isFinite(a)||!Number.isFinite(b)||a>b)return [];
   return Array.from({length:Math.min(max,Math.floor((b-a)/86400000)+1)},(_,i)=>dayKey(a+i*86400000));
 };
 const offset=(base,n)=>dayKey(Date.parse(base+"T00:00:00Z")+n*86400000);
 const kind=e=>{
   if(e.aos_group)return e.aos_group;
   const automatic=window.NRW_EVENT_RHYTHM?.groupKey(e);if(automatic)return automatic;
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
 const groupName=group=>lk(group.guide?.names||group.guide?.name)||name(group.instances[0]);
 const normalizeKey=raw=>String(raw||"").toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70);
 const keyForEntry=(x)=>{
   if(x.source==="custom"){const recognized=kind(x.record);return recognized!=="generic"?recognized:"custom-"+x.record.id;}
   const k=kind(x.record);
   if(k!=="generic")return k;
   const id=String(x.guide?.id||x.record?.id||"");
   return normalizeKey(id.replace(/-20[0-9]{2}(?:-[0-9]{2}){0,2}.*$/,""))||"event";
 };
 function buildGroups(){
  if(!sources)return;
  const pool=[...items,...extraEvents],
    lookup=new Map((sources.guides.events||[]).map(g=>[g.id,g]));
  const map=new Map();
  function add(entry){
    const key=keyForEntry(entry);if(!key)return;
    if(!map.has(key))map.set(key,{key,instances:[],guide:entry.guide||null});
    const group=map.get(key);
    group.instances.push(entry);
    if(entry.guide&&!group.guide)group.guide=entry.guide;
  }
  pool.forEach(add);
  for(const guide of sources.guides.events||[])add({source:"guide",key:"guide-"+guide.id,record:guide,guide,days:[]});
  for(const cat of sources.guides.catalogOnly||[]){
    const catalog={source:"catalog",key:"catalog-"+String(cat.id||cat.name||"unknown"),record:cat,guide:null,days:[]};
    // Prefer an existing full guide or dated event with the same recognizable type/name.
    const normalized=(name(catalog)||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    const group=[...map.values()].find(g=>g.instances.some(item=>
      name(item).toLowerCase().replace(/[^a-z0-9]+/g," ").trim()===normalized));
    if(group)continue;
    add(catalog);
  }
  for(const g of map.values()){
    g.instances.sort((a,b)=>{
      const quality=x=>(x.source==="manual"&&x.record.dailyPlans?10000:0)+
        (x.source==="manual"?5000:x.source==="rhythm"?3000:x.source==="custom"?4000:0);
      return quality(b)-quality(a)||String(b.record.start||"").localeCompare(String(a.record.start||""));
    });
    const full=lookup.get(g.key)||lookup.get(guideIds[g.key]);
    if(full)g.guide=full;
  }
  groups=[...map.values()].sort((a,b)=>groupName(a).localeCompare(groupName(b),language));
 }
 const cycleFor=g=>(state?.eventCycles||[]).find(c=>c.group_key===g.key)||null;
 const cycleDefaults=g=>{
   const options={
     brawl:["2026-09-14",28,7,6],strongest:["2026-09-21",28,7,7],
     kvk:["2026-10-05",28,5,5],mobilization:["2026-09-28",28,6,6],
     merchant:["2026-09-14",28,7,7],golden:["2026-09-21",14,3,3],
     championship:["2026-10-19",7,2,2],bear:["2026-09-13",2,1,1]
   };
   const baseline=options[g.key];if(baseline)return{anchor_date:baseline[0],interval_days:baseline[1],duration_days:baseline[2],phase_count:baseline[3]};
   const instance=g.instances.find(e=>e.record.start);
   const start=instance?.record.start||dayKey(new Date());
   const phaseCount=Array.isArray(g.guide?.phases)?g.guide.phases.length:1;
   return {anchor_date:start,interval_days:28,duration_days:Math.min(14,Math.max(phaseCount,1)),phase_count:Math.min(14,Math.max(phaseCount,1))};
 };
 const cycleOf=g=>cycleFor(g)||cycleDefaults(g);
 const phaseCount=g=>Math.min(14,Number(cycleOf(g)?.phase_count||cycleOf(g)?.duration_days||1));
 const periodLabel=cycle=>{
   if(!cycle)return t("noCycle");
   const n=Number(cycle.interval_days);
   if(n===7)return t("everyWeek");
   if(n===14)return t("everyTwoWeeks");
   if(n===28)return t("everyFourWeeks");
   if(n===1)return t("everyDay");
   return t("everyN").replace("{n}",n);
 };
 function nextOccurrence(cycle){
   const start=Date.parse(cycle.anchor_date+"T00:00:00Z"),now=Date.parse(dayKey(new Date())+"T00:00:00Z");
   if(!Number.isFinite(start))return null;
   const runs=Math.max(0,Math.ceil((now-start)/(cycle.interval_days*86400000)));
   return dayKey(start+runs*cycle.interval_days*86400000);
 }
 function list(){
  if(!sources){$("eventLibraryList").innerHTML='<p class="muted">'+esc(t("libraryLoadError"))+'</p>';return;}
  buildGroups();
  const search=$("eventLibrarySearch").value.trim().toLowerCase(),filter=$("eventLibraryFilter").value,
    today=dayKey(new Date()),limit=offset(today,56);
  const shown=groups.filter(g=>{
    if(search&&!((groupName(g)+" "+g.key+" "+g.instances.map(x=>name(x)).join(" ")).toLowerCase().includes(search)))return false;
    if(filter==="guides"&&!g.guide)return false;
    if(filter==="upcoming"){
      const cycle=cycleFor(g);
      if(cycle&&cycle.enabled!==false){const next=nextOccurrence(cycle);return next&&next<=limit;}
      return g.instances.some(x=>x.days?.some(d=>d>=today&&d<=limit));
    }
    return true;
  });
  $("eventLibraryCount").textContent=String(shown.length);
  $("eventLibraryList").innerHTML=shown.map(groupCard).join("")||'<p class="muted">'+esc(t("noEvents"))+'</p>';
 }
 function groupCard(g){
   const cycle=cycleFor(g),phases=phaseCount(g),recurring=periodLabel(cycle),
    days=Array.from({length:phases},(_,i)=>{
      const template=(state?.eventDayTemplates||[]).find(r=>r.group_key===g.key&&r.day_number===i+1);
      const source=g.instances.find(x=>x.record.start&&x.record.dailyPlans?.[offset(x.record.start,i)]);
      const plan=source?.record.dailyPlans?.[offset(source.record.start,i)];
      const existing=plan?.steps?.[language]?.[0]||plan?.steps?.en?.[0]||lk(plan?.points)||"";
      const note=template?.instructions?.[language]||template?.instructions?.en||template?.instructions?.de||existing;
      return '<div class="event-phase-row"><span>'+esc(t("phaseN").replace("{n}",i+1))+'</span><small>'+esc(note.slice(0,130)||t("phaseEmpty"))+'</small>'+
        '<button type="button" class="ghost" data-library-key="'+esc(g.key)+'" data-phase="'+(i+1)+'">'+esc(t("edit"))+'</button></div>';
    }).join("");
   const today=dayKey(new Date());
   // If no custom cycle is saved, use the existing NRW calendar instead of listing old occurrences.
   const futureDates=g.instances
     .map(x=>x.record?.start)
     .filter(d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=today)
     .sort();
   const upcoming=cycle&&cycle.enabled!==false?nextOccurrence(cycle):futureDates[0]||null;
   const difference=upcoming?Math.round((Date.parse(upcoming+"T00:00:00Z")-Date.parse(today+"T00:00:00Z"))/86400000):null;
   const badge=cycle?recurring:t("noCycle");
   const desc=difference===null?t("nextUnknown"):difference===0?t("nextToday"):difference===1?t("nextTomorrow"):t("nextInDays").replace("{n}",difference);
   return '<details class="event-group"><summary><span class="event-group-title"><b>'+esc(groupName(g))+'</b>'+
      '<small>'+esc(badge)+' · '+esc(desc)+'</small></span><span class="event-group-count">'+esc(t("daysCount").replace("{n}",phases))+'</span></summary>'+
      '<div class="event-group-body"><div class="event-group-actions"><span>'+esc(t("cycleInfo"))+'</span><button type="button" class="ghost" data-library-key="'+esc(g.key)+'" data-phase="1">'+esc(t("cycleSettings"))+'</button>'+((g.instances.find(x=>x.source==="custom")?.record?.id&&canEdit)?'<button class="ghost" type="button" data-edit="event" data-id="'+esc(g.instances.find(x=>x.source==="custom").record.id)+'">'+esc(t("edit"))+'</button>':"")+'</div>'+days+'</div></details>';
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
  fillGuidance();
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
 function guidanceStored(){
  return state?.eventGuidance?.find(x=>x.source_key===selected?.key&&x.day===activeDay())||null;
 }
 function fillGuidance(){
  const row=guidanceStored(),enabled=canEdit&&["manual","rhythm"].includes(selected?.source);
  $("libraryGuidance").value=row?.notes?.[language]||"";
  $("libraryGuidanceStatus").value=row?.status||"draft";
  $("libraryGuidance").readOnly=!enabled;
  $("libraryGuidanceStatus").disabled=!enabled;
  $("saveLibraryGuidance").disabled=!enabled;
  $("libraryGuidanceInfo").textContent=enabled?
    (row?.status==="published"?t("guidancePublished"):t("guidanceDraft")):t("guidanceNotSupported");
 }
 async function saveGuidance(){
  if(!selected||!canEdit||!["manual","rhythm"].includes(selected.source))return;
  const note=$("libraryGuidance").value.trim(),status=$("libraryGuidanceStatus").value;
  const row=guidanceStored(),notes={...(row?.notes||{}),[language]:note};
  if(note.length>1200||status==="published"&&!Object.values(notes).some(v=>String(v).trim())){
   flash(t("invalidMessage"),true);return;
  }
  const btn=$("saveLibraryGuidance");btn.disabled=true;
  try{
   const result=await request("bootstrap",{action:"event_guidance",source_key:selected.key,
     day:activeDay(),notes,status});
   state.eventGuidance=(state.eventGuidance||[]).filter(x=>!(x.source_key===selected.key&&x.day===activeDay()));
   state.eventGuidance.unshift(result.item);
   fillGuidance();flash(t("saved"));
  }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
  finally{btn.disabled=!canEdit;}
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
 function phaseRecord(){
   return (state?.eventDayTemplates||[]).find(r=>r.group_key===selected?.group_key&&r.day_number===Number($("libraryPhase").value))||null;
 }
 function sourceForPhase(phase){
   const g=groups.find(x=>x.key===selected?.group_key);if(!g)return null;
   for(const x of g.instances){
     const day=x.record.start&&offset(x.record.start,phase-1),plan=x.record.dailyPlans?.[day];
     if(plan)return {day,plan,record:x.record};
   }
   return null;
 }
 function setPhaseOptions(preferred=1){
   if(!selected?.group_key)return;
   const group=groups.find(x=>x.key===selected.group_key);
   const number=group?phaseCount(group):1;
   $("libraryPhase").innerHTML=Array.from({length:number},(_,i)=>'<option value="'+(i+1)+'">'+esc(t("phaseN").replace("{n}",i+1))+'</option>').join("");
   $("libraryPhase").value=String(Math.min(number,Math.max(1,Number(preferred)||1)));
 }
 function cycleFields(){
   const g=groups.find(x=>x.key===selected?.group_key);if(!g)return;
   const cycle=cycleOf(g);
   $("cycleAnchor").value=cycle.anchor_date;
   $("cycleEvery").value=cycle.interval_days;
   $("cycleLength").value=cycle.duration_days;
   $("cyclePhases").value=cycle.phase_count||cycle.duration_days;
   $("cycleSummary").textContent=cycleFor(g)?periodLabel(cycleFor(g)):t("cycleUnconfigured");
   for(const id of ["cycleAnchor","cycleEvery","cycleLength","cyclePhases"])$(id).disabled=!canEdit;
   $("saveCycle").disabled=!canEdit;
 }
 function updatePhaseCounts(){
   for(const [field,label,max] of [["phaseChat","phaseChatCount",512],["phaseNote","phaseNoteCount",300]]){
     $(label).textContent=$(field).value.length+" / "+max;
     $(label).classList.toggle("too-long",$(field).value.length>max);
   }
 }
 function fillPhase(){
   if(!selected?.group_key)return;
   const n=Number($("libraryPhase").value)||1,r=phaseRecord(),source=sourceForPhase(n);
   // Reuse original daily source instructions as a non-destructive editing starting point.
   let original="";
   if(source){
     const plan=source.plan,values=[
       lk(plan.points),...((plan.steps?.[language]||plan.steps?.en||[]).filter(Boolean))
     ].filter(x=>typeof x==="string"&&x.trim());
     original=values.join("\n").slice(0,1200);
   }else{
     const suggestions=selected?.guide?.nrwGuide?.[language]||selected?.guide?.nrwGuide?.en||[];
     if(Array.isArray(suggestions))original=suggestions.join("\n").slice(0,1200);
   }
   $("phaseInstructions").value=r?.instructions?.[language]??original;
   // Phase chat and note templates deliberately contain NO fixed date, so reuse works each cycle.
   const intro=groupName(groups.find(g=>g.key===selected.group_key)||{instances:[selected]})+" · "+t("phaseN").replace("{n}",n);
   const text=$("phaseInstructions").value.replace(/\s+/g," ").trim();
   const sample=max=>{const capacity=Math.max(0,max-intro.length-1);return (intro+"\n"+text.slice(0,capacity)).trim().slice(0,max);};
   $("phaseChat").value=r?.chat_text?.[language]??sample(512);
   $("phaseNote").value=r?.note_text?.[language]??sample(300);
   $("phaseStatus").value=r?.status||"draft";
   const canSave=canEdit&&Boolean(cycleFor(groups.find(g=>g.key===selected.group_key)));
   $("savePhase").disabled=!canSave;
   for(const id of ["phaseInstructions","phaseChat","phaseNote"])$(id).readOnly=!canEdit;
   $("phaseStatus").disabled=!canEdit;
   $("phaseInfo").textContent=!canEdit?t("permissionDenied"):
      !canSave?t("saveCycleFirst"):r?.status==="published"?t("templatePublished"):t("templateDraft");
   updatePhaseCounts();
   // In the original source detail, show this phase's stored scoring day if available.
   const days=selected.days||[],match=source?.day;
   if(match&&days.includes(match)){$("libraryDay").value=match;renderDetails();}
 }
 async function saveCycle(){
   if(!selected?.group_key||!canEdit)return;
   const anchor_date=$("cycleAnchor").value,interval_days=Number($("cycleEvery").value),
     duration_days=Number($("cycleLength").value),phase_count=Number($("cyclePhases").value);
   if(!/^\d{4}-\d{2}-\d{2}$/.test(anchor_date)||!Number.isInteger(interval_days)||interval_days<1||interval_days>365||
      !Number.isInteger(duration_days)||duration_days<1||duration_days>14||duration_days>interval_days||
      !Number.isInteger(phase_count)||phase_count<1||phase_count>duration_days){
     flash(t("cycleInvalid"),true);return;
   }
   const id=$("saveCycle");id.disabled=true;
   try{
     const group=groups.find(g=>g.key===selected.group_key),original=group?.guide?.names||group?.record?.name||selected.guide?.names||selected.record?.name;
     const title=original&&typeof original==="object"&&!Array.isArray(original)?original:{de:groupName(group),en:groupName(group)};
     const r=await request("bootstrap",{action:"event_cycle",group_key:selected.group_key,anchor_date,interval_days,duration_days,phase_count,enabled:true,title});
     state.eventCycles=(state.eventCycles||[]).filter(c=>c.group_key!==selected.group_key);
     state.eventCycles.push(r.item);
     setPhaseOptions(Number($("libraryPhase").value));
     cycleFields();fillPhase();list();flash(t("saved"));
   }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
   finally{id.disabled=!canEdit;}
 }
 async function savePhase(){
   if(!selected?.group_key||!canEdit)return;
   const day_number=Number($("libraryPhase").value),r=phaseRecord(),status=$("phaseStatus").value;
   const instructions={...(r?.instructions||{}),[language]:$("phaseInstructions").value.trim()},
     chat_text={...(r?.chat_text||{}),[language]:$("phaseChat").value.trim()},
     note_text={...(r?.note_text||{}),[language]:$("phaseNote").value.trim()};
   if(instructions[language].length>1200||chat_text[language].length>512||note_text[language].length>300){
     flash(t("invalidMessage"),true);return;
   }
   const button=$("savePhase");button.disabled=true;
   try{
     const result=await request("bootstrap",{action:"event_day_template",group_key:selected.group_key,day_number,status,instructions,chat_text,note_text});
     state.eventDayTemplates=(state.eventDayTemplates||[]).filter(v=>!(v.group_key===selected.group_key&&v.day_number===day_number));
     state.eventDayTemplates.push(result.item);
     fillPhase();list();flash(t("saved"));
   }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
   finally{button.disabled=!canEdit||!Boolean(cycleFor(groups.find(g=>g.key===selected.group_key)));}
 }
 async function copyPhase(which){
   const el=$(which==="chat"?"phaseChat":"phaseNote"),limit=which==="chat"?512:300;
   if(!el.value||el.value.length>limit){flash(t("invalidMessage"),true);return;}
   try{await navigator.clipboard.writeText(el.value);flash(t("copiedText"));}
   catch{el.focus();el.select();flash(t("copySelect"));}
 }
 function open(key,phase=1){
   const group=groups.find(x=>x.key===key);
   if(!group)return;
   const original=group.instances.find(x=>x.record.dailyPlans)||group.instances.find(x=>x.source==="rhythm")||group.instances[0];
   selected={...original,group_key:group.key,guide:group.guide||original.guide};
   $("libraryModalTitle").textContent=groupName(group);
   $("libraryModalSource").textContent=t("oneEvent");
   const dates=selected.days?.length?selected.days:[dayKey(new Date())];
   $("libraryDay").innerHTML=dates.map(d=>'<option value="'+esc(d)+'">'+esc(formatDate(d))+'</option>').join("");
   $("libraryDay").value=dates[0];
   cycleFields();
   setPhaseOptions(phase);
   renderDetails();
   fillPhase();
   $("eventLibraryDialog").showModal();
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
  $("eventLibraryList").addEventListener("click",e=>{const btn=e.target.closest("[data-library-key]");if(btn)open(btn.dataset.libraryKey,Number(btn.dataset.phase||1));});
  $("closeLibraryDialog").addEventListener("click",()=>$("eventLibraryDialog").close());
  $("libraryDay").addEventListener("change",renderDetails);
  $("libraryChat").addEventListener("input",updateCounters);
  $("libraryNote").addEventListener("input",updateCounters);
  $("copyLibraryChat").addEventListener("click",()=>copyText("chat"));
  $("copyLibraryNote").addEventListener("click",()=>copyText("note"));
  $("saveLibraryMessages").addEventListener("click",saveTexts);
  $("saveLibraryGuidance").addEventListener("click",saveGuidance);
  $("libraryPhase").addEventListener("change",fillPhase);
  $("saveCycle").addEventListener("click",saveCycle);
  $("savePhase").addEventListener("click",savePhase);
  $("phaseChat").addEventListener("input",updatePhaseCounts);
  $("phaseNote").addEventListener("input",updatePhaseCounts);
  $("copyPhaseChat").addEventListener("click",()=>copyPhase("chat"));
  $("copyPhaseNote").addEventListener("click",()=>copyPhase("note"));
 }
 function stats(){
   if(!sources)return null;
   buildGroups();
   const today=dayKey(new Date());
   const upcoming=groups.map(g=>{
     const cycle=cycleFor(g),date=cycle?.enabled!==false&&cycle?nextOccurrence(cycle):
       g.instances.flatMap(x=>x.days||[]).filter(d=>d>=today).sort()[0];
     return date?{title:groupName(g),date}:null;
   }).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title)).slice(0,3);
   return {count:groups.length,upcoming};
 }
 attach();
 return {load,render,stats};
}
