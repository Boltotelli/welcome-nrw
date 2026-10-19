/* AllianceOS Discord event planner.
 * Preparation only: never sends Discord messages or schedules jobs.
 * The future bot consumes alliance-scoped rules through a server-side API. */
export function createDiscordEventPlanner({request,flash,esc,can,eventHub}){
 const $=id=>document.getElementById(id);
 const L={
  de:{loading:"Konfiguration wird geladen …",notReady:"Bot noch nicht verbunden · kein Versand",notConfigured:"Keine UTC-Uhrzeit gespeichert – relative Nachrichten sind noch nicht ausführbar.",startAt:"Start: {time} UTC",notChosen:"Bitte Event auswählen.",noRules:"Noch keine gespeicherten Nachrichten. Lege eine Vorlage an oder erstelle eine eigene.",count:"{n} Nachrichten",ready:"Aktiv / für Bot vorbereitet",draft:"Entwurf",day:"Tag {n}",before:"{n} Min. vor {event}",after:"{n} Min. nach {event}",at:"{time} UTC",needThree:"Zum Aktivieren sind alle drei Texte (DE/EN/FR) erforderlich.",needsTitle:"Bitte einen Namen für die Nachricht eingeben.",needClock:"Bitte eine UTC-Uhrzeit eingeben.",saved:"Discord-Einstellungen gespeichert.",anchorSaved:"Eventzeiten gespeichert.",ruleSaved:"Nachricht gespeichert.",deleted:"Nachricht gelöscht.",confirmDelete:"Diese Discord-Nachricht wirklich löschen?",presetsSaved:"Vorlagen als Entwürfe gespeichert. Jede Nachricht ist separat bearbeitbar.",noSelection:"Noch kein Event gewählt.",choosePreset:"Standardvorlage hinzufügen",bearPreset:"3 Bärenfallen-Vorlagen (15 / 10 / 5 Minuten) hinzufügen",edit:"Bearbeiten",duplicate:"Duplizieren",delete:"Löschen",noSend:"Noch kein Versand",clockWarn:"Eine feste UTC-Uhrzeit gilt für den gewählten Eventtag. Das Eventdatum muss im Eventkalender feststehen.",unknown:"Termin ist noch nicht verbindlich geplant."},
  en:{loading:"Loading configuration …",notReady:"Bot not connected · no messages sent",notConfigured:"No UTC start time configured – relative rules cannot run yet.",startAt:"Start: {time} UTC",notChosen:"Choose an event.",noRules:"No saved messages yet. Add a preset or create your own.",count:"{n} messages",ready:"Enabled / prepared",draft:"Draft",day:"Day {n}",before:"{n} min before {event}",after:"{n} min after {event}",at:"{time} UTC",needThree:"To enable, fill out all three language texts.",needsTitle:"Give this message a name.",needClock:"Enter a UTC time.",saved:"Discord configuration saved.",anchorSaved:"Event times saved.",ruleSaved:"Message saved.",deleted:"Message deleted.",confirmDelete:"Delete this Discord message?",presetsSaved:"Presets saved as drafts. Each message can be edited independently.",noSelection:"No event selected.",choosePreset:"Add default preset",bearPreset:"Add 3 Bear Trap presets (15 / 10 / 5 min)",edit:"Edit",duplicate:"Duplicate",delete:"Delete",noSend:"No delivery yet",clockWarn:"A fixed UTC time applies to the selected event day. The event date must be scheduled.",unknown:"Event date is not confirmed."},
  fr:{loading:"Chargement de la configuration …",notReady:"Bot non connecté · aucun envoi",notConfigured:"Aucune heure UTC – les messages relatifs ne peuvent pas être exécutés.",startAt:"Début : {time} UTC",notChosen:"Choisissez un événement.",noRules:"Aucun message enregistré. Ajoutez un modèle ou créez-en un.",count:"{n} messages",ready:"Actif / préparé",draft:"Brouillon",day:"Jour {n}",before:"{n} min avant {event}",after:"{n} min après {event}",at:"{time} UTC",needThree:"Remplissez DE, EN et FR avant d'activer.",needsTitle:"Indiquez un titre.",needClock:"Indiquez une heure UTC.",saved:"Configuration Discord enregistrée.",anchorSaved:"Heures de l'événement enregistrées.",ruleSaved:"Message enregistré.",deleted:"Message supprimé.",confirmDelete:"Supprimer ce message Discord ?",presetsSaved:"Modèles enregistrés comme brouillons, modifiables séparément.",noSelection:"Aucun événement.",choosePreset:"Ajouter un modèle",bearPreset:"Ajouter 3 modèles de piège à ours (15 / 10 / 5 min)",edit:"Modifier",duplicate:"Dupliquer",delete:"Supprimer",noSend:"Aucun envoi",clockWarn:"Heure UTC fixe pour le jour sélectionné. La date doit être connue.",unknown:"Date non confirmée."},
  es:{loading:"Cargando configuración …",notReady:"Bot no conectado · sin envíos",notConfigured:"Sin hora UTC: los mensajes relativos no pueden ejecutarse.",startAt:"Inicio: {time} UTC",notChosen:"Elige un evento.",noRules:"No hay mensajes guardados. Añade una plantilla o crea una.",count:"{n} mensajes",ready:"Activo / preparado",draft:"Borrador",day:"Día {n}",before:"{n} min antes de {event}",after:"{n} min después de {event}",at:"{time} UTC",needThree:"Completa los tres textos (DE/EN/FR) para activar.",needsTitle:"Introduce un título.",needClock:"Introduce una hora UTC.",saved:"Configuración de Discord guardada.",anchorSaved:"Horas guardadas.",ruleSaved:"Mensaje guardado.",deleted:"Mensaje eliminado.",confirmDelete:"¿Eliminar este mensaje?",presetsSaved:"Plantillas guardadas como borradores, editables por separado.",noSelection:"Sin evento.",choosePreset:"Añadir plantilla",bearPreset:"Añadir 3 plantillas de oso (15 / 10 / 5 min)",edit:"Editar",duplicate:"Duplicar",delete:"Eliminar",noSend:"Sin envíos",clockWarn:"La hora UTC se aplica al día elegido. La fecha debe estar confirmada.",unknown:"Fecha no confirmada."}
 };
 const DAY_UI={
 de:{eventDays:"Eventtage",everyDay:"{n} Tage · jede Phase separat",phase:"Tagesphase",phaseUnknown:"Für diesen Tag ist noch keine Phasenbeschreibung hinterlegt.",guideDay:"Tageshinweise aus der Eventplanung",scoring:"Unter anderem gewertete Aktionen:",startTimeMissing:"Keine genaue Startzeit für diesen Tag erfasst.",dayStart:"Tagesbeginn: {time} UTC",savedDays:"Tageszeiten gespeichert.",allDaysSaved:"UTC-Zeiten für alle Eventtage gespeichert.",allTimesConfirm:"Die aktuellen UTC-Zeiten für alle Eventtage übernehmen? Vorhandene individuelle Tageszeiten werden überschrieben.",dayPreset:"Tagesvorlage für Tag {n} hinzufügen",allPresets:"Tagesvorlagen für alle {n} Tage anlegen",presetMissing:"Für alle Eventtage sind bereits Vorlagen vorhanden.",dayPresetTitle:"Tageshinweis · Tag {n}",dayReminder:"Erinnerung vor dem Tagesbeginn",phaseLine:"Tag {n}: {phase}",guideLine:"Bitte beachtet die aktuelle Tagesplanung und nutzt eure Ressourcen abgestimmt mit der Allianz.",dayMessage:"📣 {event} · Tag {n}{phase}\n{notes}",botTimesInfo:"Die Uhrzeiten gelten nur für Tag {n}. Vorher/nachher ist relativ zum Beginn oder Ende dieses Tages. Ohne Uhrzeit keine relative Ausführung.",dateLabel:"{date} · Tag {n}",unconfirmed:"Kein bestätigter Termin in der Eventplanung."},
 en:{eventDays:"Event days",everyDay:"{n} days · each phase planned separately",phase:"Day phase",phaseUnknown:"No phase information recorded for this day.",guideDay:"Daily guidance from event planning",scoring:"Among the scoring actions:",startTimeMissing:"No exact start time saved for this day.",dayStart:"Day starts: {time} UTC",savedDays:"Day times saved.",allDaysSaved:"UTC times saved for every event day.",allTimesConfirm:"Apply these UTC times to every event day? Existing day-specific overrides will be replaced.",dayPreset:"Add a day {n} template",allPresets:"Create day-specific templates for all {n} days",presetMissing:"Templates already exist for every event day.",dayPresetTitle:"Daily reminder · Day {n}",dayReminder:"Reminder before the day begins",phaseLine:"Day {n}: {phase}",guideLine:"Please check today's alliance plan and coordinate resource spending.",dayMessage:"📣 {event} · Day {n}{phase}\n{notes}",botTimesInfo:"These times apply to day {n} only. Relative triggers use this day's start/end. No start time means no relative delivery.",dateLabel:"{date} · Day {n}",unconfirmed:"No confirmed schedule in the event planner."},
 fr:{eventDays:"Jours de l'événement",everyDay:"{n} jours · chaque phase distincte",phase:"Phase du jour",phaseUnknown:"Aucune information pour cette journée.",guideDay:"Consignes du jour selon la planification",scoring:"Actions rapportant des points :",startTimeMissing:"Aucune heure de début exacte enregistrée.",dayStart:"Début de la journée : {time} UTC",savedDays:"Horaires enregistrés.",allDaysSaved:"Horaires UTC enregistrés pour tous les jours.",allTimesConfirm:"Appliquer ces horaires UTC à tous les jours ? Les horaires déjà configurés seront remplacés.",dayPreset:"Ajouter un modèle pour le jour {n}",allPresets:"Créer des modèles pour les {n} jours",presetMissing:"Chaque jour possède déjà un modèle.",dayPresetTitle:"Consigne du jour · Jour {n}",dayReminder:"Rappel avant le début de la journée",phaseLine:"Jour {n} : {phase}",guideLine:"Consultez les consignes d'alliance du jour et coordonnez vos dépenses.",dayMessage:"📣 {event} · Jour {n}{phase}\n{notes}",botTimesInfo:"Les horaires concernent seulement le jour {n}. Les rappels relatifs se réfèrent au début/à la fin de ce jour.",dateLabel:"{date} · Jour {n}",unconfirmed:"Aucun calendrier confirmé pour cet événement."},
 es:{eventDays:"Días del evento",everyDay:"{n} días · cada fase independiente",phase:"Fase del día",phaseUnknown:"Sin información de esta fase.",guideDay:"Instrucciones del día",scoring:"Acciones puntuables:",startTimeMissing:"No hay hora de inicio exacta.",dayStart:"Inicio del día: {time} UTC",savedDays:"Horas guardadas.",allDaysSaved:"Horas UTC guardadas para todos los días.",allTimesConfirm:"¿Aplicar estas horas a todos los días? Se sustituirán los horarios individuales.",dayPreset:"Añadir plantilla para día {n}",allPresets:"Crear plantillas para los {n} días",presetMissing:"Todos los días tienen plantillas.",dayPresetTitle:"Aviso diario · Día {n}",dayReminder:"Recordatorio antes del día",phaseLine:"Día {n}: {phase}",guideLine:"Consultad las normas diarias y coordinad el gasto de recursos.",dayMessage:"📣 {event} · Día {n}{phase}\n{notes}",botTimesInfo:"Los horarios se aplican solo al día {n}. Los avisos relativos usan el inicio/fin de ese día.",dateLabel:"{date} · Día {n}",unconfirmed:"Sin calendario confirmado para este evento."}
 };
 const tx=(key)=>DAY_UI[language]?.[key]||L[language]?.[key]||DAY_UI.de[key]||L.de[key]||key;
 let language="de",config={guild_id:"",channels:{}},rules=[],anchors=[],dayTimes=[],catalog=[],selected=null,selectedDay=1,loading=null,loaded=false,dirtySettings=false;
 let editingId=null;
 const botForm=$("discordRuleForm");
 const cleanTime=raw=>String(raw||"").slice(0,5);
 const event=()=>catalog.find(x=>x.key===selected)||null;
 const anchor=()=>anchors.find(x=>x.event_key===selected)||null;
 const dayAnchor=(day=selectedDay)=>dayTimes.find(x=>x.event_key===selected&&Number(x.day_number)===day)||null;
 const eventDay=(day=selectedDay)=>event()?.days?.find(x=>Number(x.number)===day)||null;
 const daysCount=()=>Math.max(1,Math.min(14,event()?.duration_days||1));
 const dayDate=(evt,day)=>{
  const c=evt?.cycle;
  if(!evt?.calendar_confirmed||c?.enabled===false||!c?.anchor_date||!Number(c?.interval_days))return null;
  const a=Date.parse(c.anchor_date+"T00:00:00Z"),n=Date.now(),step=Number(c.interval_days)*86400000;
  if(!Number.isFinite(a)||!Number.isFinite(step)||step<=0)return null;
  let iteration=Math.max(0,Math.floor((n-a)/step));
  let start=a+iteration*step;
  if(start+(Math.min(14,evt.duration_days||1))*86400000<=n){iteration++;start=a+iteration*step;}
  return new Date(start+(day-1)*86400000).toISOString().slice(0,10);
 };
 const currentRules=()=>rules.filter(x=>x.event_key===selected&&Number(x.day_number)===selectedDay).sort((a,b)=>Number(a.offset_minutes)-Number(b.offset_minutes)||String(a.id).localeCompare(String(b.id)));
 const ruleTime=r=>{
  if(r.trigger_type==="clock")return tx("at").replace("{time}",cleanTime(r.clock_utc)||"—");
  return tx(r.offset_minutes<=0?"before":"after").replace("{n}",Math.abs(r.offset_minutes)).replace("{event}",r.relative_to==="end"?(language==="de"?"Ende":language==="fr"?"la fin":language==="es"?"el final":"end"):(language==="de"?"Start":language==="fr"?"le début":language==="es"?"el inicio":"start"));
 };
 const validId=s=>!s||/^\d{17,20}$/.test(s);
 const getChannelFields=()=>({de:$("discordChannelDe").value.trim(),en:$("discordChannelEn").value.trim(),fr:$("discordChannelFr").value.trim()});
 function renderChannels(){
  if(dirtySettings)return;
  $("discordGuild").value=config.guild_id||"";
  for(const [lang,id] of Object.entries({de:"discordChannelDe",en:"discordChannelEn",fr:"discordChannelFr"}))$(id).value=config.channels?.[lang]||"";
  for(const id of ["discordGuild","discordChannelDe","discordChannelEn","discordChannelFr"])$(id).disabled=!can("settings");
  $("discordSettingsForm").querySelector('[type="submit"]').disabled=!can("settings");
 }
 function renderEvents(){
  const search=$("discordEventSearch").value.trim().toLowerCase();
  const filtered=catalog.filter(e=>(e.name+" "+Object.values(e.names||{}).join(" ")+" "+e.key).toLowerCase().includes(search));
  $("discordEventCount").textContent=String(filtered.length)+" / "+catalog.length;
  $("discordEventList").innerHTML=filtered.map(e=>{
   const amount=rules.filter(r=>r.event_key===e.key).length;
   return '<button type="button" class="discord-bot-event'+(e.key===selected?" selected":"")+'" data-bot-event="'+esc(e.key)+'" aria-pressed="'+(e.key===selected?'true':'false')+'"><span>'+esc(e.name)+'</span><small>'+amount+'</small></button>';
  }).join("")||'<p class="muted">—</p>';
 }
 function renderRuleList(){
  const e=event();
  if(!e){$("discordEventTitle").textContent=tx("notChosen");$("discordRuleList").innerHTML="";return;}
  $("discordEventTitle").textContent=e.name;
  const a=anchor(),start=cleanTime(a?.start_time_utc||e.suggested_time_utc),end=cleanTime(a?.end_time_utc);
  $("discordAnchorStart").value=cleanTime(a?.start_time_utc)||start;
  $("discordAnchorEnd").value=end;
  const cycle=e.cycle,validCycle=Boolean(cycle?.anchor_date&&cycle?.interval_days&&cycle?.enabled!==false);
  $("discordEventTimingHint").textContent=(start?tx("startAt").replace("{time}",start):tx("notConfigured"))+
    (validCycle?" · "+String(cycle.interval_days)+" d": " · "+tx("unknown"));
  $("saveDiscordAnchor").disabled=!can("events");
  for(const id of ["discordAnchorStart","discordAnchorEnd"])$(id).disabled=!can("events");
  const r=currentRules();
  $("discordMessageCount").textContent=tx("count").replace("{n}",r.length)+" · "+tx("noSend");
  $("discordRuleList").innerHTML=r.length?r.map(item=>{
   const localeContent=item.messages?.[language]||item.messages?.de||item.messages?.en||"";
   const status=item.enabled?tx("ready"):tx("draft");
   return '<article class="discord-bot-rule"><div><span class="eyebrow">'+esc(tx("day").replace("{n}",item.day_number))+' · '+esc(ruleTime(item))+'</span><h4>'+esc(item.title)+'</h4>'+
    '<p>'+esc(localeContent.slice(0,240)||"—")+'</p><small>'+esc(status)+' · 🇩🇪 '+(item.messages?.de?"✓":"–")+' · 🇬🇧 '+(item.messages?.en?"✓":"–")+' · 🇫🇷 '+(item.messages?.fr?"✓":"–")+'</small></div>'+
    '<div class="discord-rule-actions"><button type="button" class="ghost" data-bot-edit="'+esc(item.id)+'" '+(!can("events")?"disabled":"")+'>'+esc(tx("edit"))+'</button>'+
    '<button type="button" class="ghost" data-bot-copy="'+esc(item.id)+'" '+(!can("events")?"disabled":"")+'>'+esc(tx("duplicate"))+'</button></div></article>';
  }).join(""):'<p class="muted">'+esc(tx("noRules"))+'</p>';
  $("discordAddRule").disabled=!can("events");
  $("discordPreset").disabled=!can("events");
  $("discordPreset").textContent=/^bear-[123]$/.test(selected)?tx("bearPreset"):tx("choosePreset");
 }
 function render(lang){
  language=lang||language;
  if(catalog.length)catalog=eventHub.catalog(language);
  if(!loaded&& !loading)$("discordRuleList").innerHTML='<p class="muted">'+esc(tx("loading"))+'</p>';
  if(catalog.length&&!catalog.some(e=>e.key===selected))selected=catalog[0]?.key||null;
  renderChannels();renderEvents();renderRuleList();
 }
 async function pull(){
  const all=[];let page=0,first;
  while(true){
   const response=await request("discord-bot:"+page);
   if(!first)first=response;
   all.push(...(response.rules||[]));
   if(!response.has_more)break;
   if(++page>100000)throw Error("discord_rule_pages_limit");
  }
  config=first?.config||{guild_id:"",channels:{}};
  anchors=first?.anchors||[];
  rules=all;loaded=true;
  dirtySettings=false;
 }
 async function open(lang){
  language=lang||language;
  if(!loading)loading=(async()=>{
   await Promise.all([eventHub.load(), loaded?Promise.resolve():pull()]);
   catalog=eventHub.catalog(language);
  })().finally(()=>loading=null);
  await loading;
  render(language);
 }
 async function reload(){
  await pull();
  catalog=eventHub.catalog(language);
  render(language);
 }
 const ruleFromForm=()=>{
  const fd=new FormData(botForm),type=fd.get("trigger_type"),amount=Number(fd.get("offset_amount"));
  return {
   action:"discord_message_rule",id:editingId,event_key:selected,
   title:String(fd.get("title")||"").trim(),
   trigger_type:type,relative_to:fd.get("relative_to"),
   offset_minutes:(fd.get("direction")==="before"?-1:1)*amount,
   clock_utc:type==="clock"?fd.get("clock_utc"):"",
   day_number:Number(fd.get("day_number")),enabled:fd.has("enabled"),
   messages:Object.fromEntries(["de","en","fr"].map(l=>[l,String(fd.get(l)||"")]))
  };
 };
 const makeDefault=(e,n=0)=>{
  const bear=/^bear-[123]$/.test(e.key),lead=bear?[15,10,5][n]:15,
   name=l=>e.names?.[l]||e.name,detail={
    de:bear?["Bitte Truppen, Märsche und Buffs vorbereiten.","Regeln: Abgesprochene Starter- und Joiner-Formationen verwenden; Rallyplätze freihalten.","Jetzt letzte Vorbereitungen abschließen und auf die Rallys achten."][n]:"Bitte bereitet euch vor und beachtet die Eventregeln.",
    en:bear?["Prepare your troops, marches and buffs.","Rules: Use the agreed starter and joiner formations; keep rally slots free.","Finish your preparations and watch for rallies."][n]:"Please prepare and follow the event rules.",
    fr:bear?["Préparez vos troupes, marches et bonus.","Règles : utilisez les formations de départ et de renfort convenues ; gardez les places libres.","Terminez vos préparatifs et surveillez les rallyes."][n]:"Préparez-vous et respectez les règles de l'événement."
   };
  return {id:null,event_key:e.key,
   title:bear?["Erinnerung – 15 Minuten","Regeln – 10 Minuten","Letzte Infos – 5 Minuten"][n]:"Erinnerung – 15 Minuten",
   trigger_type:"relative",relative_to:"start",offset_minutes:-lead,clock_utc:null,day_number:1,enabled:false,
   messages:{
    de:"⏰ "+name("de")+" beginnt in "+lead+" Minuten. "+detail.de,
    en:"⏰ "+name("en")+" starts in "+lead+" minutes. "+detail.en,
    fr:"⏰ "+name("fr")+" commence dans "+lead+" minutes. "+detail.fr
   }
  };
 };
 function toggleClock(){
  const fixed=botForm.elements.trigger_type.value==="clock";
  for(const id of ["botRelativeTarget","botRelativeAmount","botRelativeDirection"])$(id).hidden=fixed;
  $("botFixedClock").hidden=!fixed;
  botForm.elements.offset_amount.required=!fixed;
  botForm.elements.clock_utc.required=fixed;
 }
 function counts(){
  for(const l of ["de","en","fr"])$("discord"+l[0].toUpperCase()+l.slice(1)+"Count").textContent=botForm.elements[l].value.length+" / 1800";
 }
 function editRule(item){
  if(!can("events")||!event())return;
  editingId=item?.id||null;
  botForm.reset();
  botForm.elements.title.value=item?.title||"";
  botForm.elements.day_number.value=item?.day_number||1;
  botForm.elements.trigger_type.value=item?.trigger_type||"relative";
  botForm.elements.relative_to.value=item?.relative_to||"start";
  botForm.elements.offset_amount.value=Math.abs(Number(item?.offset_minutes??-15));
  botForm.elements.direction.value=Number(item?.offset_minutes??-15)<0?"before":"after";
  botForm.elements.clock_utc.value=cleanTime(item?.clock_utc)||"";
  botForm.elements.enabled.checked=item?.enabled===true;
  for(const l of ["de","en","fr"])botForm.elements[l].value=item?.messages?.[l]||"";
  $("discordRuleDelete").hidden=!editingId;
  $("discordRuleSave").disabled=false;
  toggleClock();counts();$("discordRuleDialog").showModal();
 }
 async function saveRule(ev){
  ev.preventDefault();
  if(!can("events"))return;
  const rule=ruleFromForm();
  if(!rule.title){flash(tx("needsTitle"),true);return;}
  if(rule.trigger_type==="clock"&&!rule.clock_utc){flash(tx("needClock"),true);return;}
  if(rule.enabled&&!Object.values(rule.messages).every(v=>v.trim())){flash(tx("needThree"),true);return;}
  const btn=$("discordRuleSave");btn.disabled=true;
  try{await request("bootstrap",rule);$("discordRuleDialog").close();await reload();flash(tx("ruleSaved"));}
  catch(e){flash(String(e.message),true);}
  finally{btn.disabled=false;}
 }
 async function deleteRule(){
  if(!editingId||!can("events")||!window.confirm(tx("confirmDelete")))return;
  try{await request("bootstrap",{action:"discord_message_delete",id:editingId});$("discordRuleDialog").close();await reload();flash(tx("deleted"));}
  catch(e){flash(String(e.message),true);}
 }
 async function saveChannels(ev){
  ev.preventDefault();if(!can("settings"))return;
  const guild=$("discordGuild").value.trim(),channels=getChannelFields(),values=[guild,...Object.values(channels)];
  if(values.some(v=>!validId(v))){flash("Discord IDs: 17–20 digits",true);return;}
  const distinct=Object.values(channels).filter(Boolean);
  if(new Set(distinct).size!==distinct.length){flash("Discord channels must be different.",true);return;}
  const button=$("discordSettingsForm").querySelector('[type="submit"]');button.disabled=true;
  try{const response=await request("bootstrap",{action:"discord_bot_config",guild_id:guild,channels});config=response.config;dirtySettings=false;renderChannels();$("discordSettingsStatus").textContent=tx("saved");flash(tx("saved"));}
  catch(e){flash(String(e.message),true);}
  finally{button.disabled=!can("settings");}
 }
 async function saveAnchor(){
  if(!can("events")||!selected)return;
  $("saveDiscordAnchor").disabled=true;
  try{
   const start_time_utc=$("discordAnchorStart").value,end_time_utc=$("discordAnchorEnd").value;
   await request("bootstrap",{action:"discord_event_anchor",event_key:selected,start_time_utc,end_time_utc});
   anchors=anchors.filter(a=>a.event_key!==selected);
   if(start_time_utc||end_time_utc)anchors.push({event_key:selected,start_time_utc,end_time_utc});
   renderRuleList();flash(tx("anchorSaved"));
  }catch(e){flash(String(e.message),true);}
  finally{$("saveDiscordAnchor").disabled=!can("events");}
 }
 async function addPresets(){
  if(!can("events")||!event())return;
  const e=event(),count=/^bear-[123]$/.test(e.key)?3:1,button=$("discordPreset");button.disabled=true;
  try{
   for(let n=0;n<count;n++){const x=makeDefault(e,n);await request("bootstrap",{action:"discord_message_rule",...x});}
   await reload();flash(tx("presetsSaved"));
  }catch(e){await reload().catch(()=>{});flash(String(e.message),true);}
  finally{button.disabled=!can("events");}
 }
 function attach(){
  $("discordSettingsForm").addEventListener("submit",saveChannels);
  for(const id of ["discordGuild","discordChannelDe","discordChannelEn","discordChannelFr"])$(id).addEventListener("input",()=>dirtySettings=true);
  $("discordEventSearch").addEventListener("input",renderEvents);
  $("discordEventList").addEventListener("click",ev=>{
   const btn=ev.target.closest("[data-bot-event]");if(!btn)return;
   selected=btn.dataset.botEvent;renderEvents();renderRuleList();
  });
  $("saveDiscordAnchor").addEventListener("click",saveAnchor);
  $("discordAddRule").addEventListener("click",()=>editRule(null));
  $("discordPreset").addEventListener("click",addPresets);
  $("discordRuleList").addEventListener("click",ev=>{
   const edit=ev.target.closest("[data-bot-edit]"),copy=ev.target.closest("[data-bot-copy]");
   const id=edit?.dataset.botEdit||copy?.dataset.botCopy;if(!id)return;
   const r=rules.find(x=>x.id===id);if(r)editRule(copy?{...r,id:null,title:r.title+" (copy)"}:r);
  });
  botForm.elements.trigger_type.addEventListener("change",toggleClock);
  for(const l of ["de","en","fr"])botForm.elements[l].addEventListener("input",counts);
  botForm.addEventListener("submit",saveRule);
  $("discordRuleDelete").addEventListener("click",deleteRule);
  $("discordRuleCancel").addEventListener("click",()=>$("discordRuleDialog").close());
  $("discordRuleCloseTop").addEventListener("click",()=>$("discordRuleDialog").close());
 }
 attach();
 return {open,render,reset(){loaded=false;config={guild_id:"",channels:{}};rules=[];anchors=[];catalog=[];selected=null;dirtySettings=false;}};
}
