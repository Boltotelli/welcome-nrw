/* AllianceOS phase operations: transfer windows, law versions and access control.
 * Does not touch the NAP tracker or create any game/Discord automation. */
export function createOperations({getState,request,flash,esc,t,can,refresh}){
 const $=id=>document.getElementById(id);
 const fmt=d=>d||"—", n=v=>v==null?"?":Number(v).toLocaleString("de-DE");
 const statuses=new Set(["invited","confirmed","completed"]);
 function occupancy(window,kind){
   return (getState()?.transfers||[]).filter(x=>x.transfer_window_id===window.id&&x.direction==="incoming"&&
     statuses.has(x.status)&&x.invitation_type===kind).length;
 }
 let portraitsChecked=false;
 async function hydratePortraits(){
   if(portraitsChecked||!can("transfers"))return;
   portraitsChecked=true;
   try{
     const r=await request("bootstrap",{action:"transfer_portraits"});
     if(r?.filled>0)await refresh();
   }catch{/* If profile API has no image, retain the neutral avatar. */}
 }
 function windows(){
   const state=getState();if(!state)return;
   const target=$("transferWindowsList");if(!target)return;
   const today=new Date().toISOString().slice(0,10);
   // Only the three nearest current/upcoming windows that NRW leadership actually entered.
   const entries=(state.transferWindows||[]).filter(w=>w.end_date>=today)
     .slice().sort((a,b)=>a.start_date.localeCompare(b.start_date)).slice(0,3);
   target.innerHTML=entries.length?entries.map(w=>{
     const breakdown=["ordinary","special"].map(k=>{
       const cap=w[k+"_capacity"],used=occupancy(w,k);
       return '<span class="ops-slot">'+esc(k==="ordinary"?t("ordinarySlots"):t("specialSlots"))+': <b>'+esc(n(used))+' / '+esc(n(cap))+'</b></span>';
     }).join("");
     return '<article class="ops-window"><div><b>'+esc(w.label)+'</b><small>'+esc(fmt(w.start_date))+' – '+esc(fmt(w.end_date))+' · '+esc(t("phase_"+w.status))+'</small><div class="ops-slots">'+breakdown+'</div></div>'+
       '<button type="button" class="ghost" data-transfer-window="'+esc(w.id)+'" '+(!can("transfers")?"disabled":"")+'>'+esc(t("edit"))+'</button></article>';
   }).join(""):'<p class="muted">'+esc(t("noTransferWindows"))+'</p>';
 }
 function openWindow(id=null){
   if(!can("transfers"))return;
   const existing=(getState()?.transferWindows||[]).find(x=>x.id===id)||null;
   const form=$("transferWindowForm");form.reset();
   for(const f of ["id","label","start_date","end_date","ordinary_capacity","special_capacity","notes","status"]){
     if(form.elements[f])form.elements[f].value=existing?.[f]??(f==="status"?"planning":"");
   }
   $("twTitle").textContent=existing?t("editTransferWindow"):t("newTransferWindow");
   $("transferWindowDialog").showModal();
 }
 async function saveWindow(e){
   e.preventDefault();if(!can("transfers"))return;
   const form=e.currentTarget,values=Object.fromEntries(new FormData(form).entries());
   const btn=form.querySelector('[type="submit"]');btn.disabled=true;
   try{
     await request("bootstrap",{action:"transfer_window",id:values.id||null,data:values});
     $("transferWindowDialog").close();
     await refresh();flash(t("saved"));
   }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
   finally{btn.disabled=false;}
 }
 function renderAudit(){
   const target=$("accessAuditRows");if(!target)return;
   const state=getState();
   target.innerHTML=state?.staff?.rank==="R5"?
     (state.auditTrail||[]).map(x=>'<div class="ops-audit-entry"><b>'+esc(x.entity)+' · '+esc(x.action)+'</b><span>'+esc(x.entity_id)+' · '+esc(x.created_at?.slice(0,16).replace("T"," ")||"")+' UTC</span></div>').join("")||'<p class="muted">'+esc(t("noAudit"))+'</p>':"";
 }
 async function history(id){
   if(!can("laws"))return;
   const dialog=$("lawHistoryDialog");
   $("lawHistoryItems").innerHTML='<p class="muted">'+esc(t("loading"))+'</p>';
   dialog.showModal();
   try{
     const result=await request("bootstrap",{action:"law_history",id});
     const law=(getState()?.laws||[]).find(x=>x.id===id);
     $("lawHistoryTitle").textContent=(law?.number||"")+" · "+t("lawHistory");
     $("lawHistoryItems").innerHTML=(result.revisions||[]).map(row=>
       '<article class="ops-history"><div><strong>v'+esc(row.version)+'</strong> · '+esc(row.snapshot?.status||"")+'<small>'+esc(row.changed_at?.slice(0,16).replace("T"," ")||"")+' UTC</small></div>'+
       '<p>'+esc(row.snapshot?.title?.de||row.snapshot?.title?.en||"")+'</p>'+
       (law?.scope==="kingdom"&&can("laws")?'<button class="ghost" type="button" data-law-restore="'+esc(id)+'" data-version="'+esc(row.version)+'">'+esc(t("restoreAsDraft"))+'</button>':"")+'</article>').join("")||'<p class="muted">'+esc(t("noVersions"))+'</p>';
   }catch(e){$("lawHistoryItems").textContent=t("genericError")+" ("+e.message+")";}
 }
 async function restore(id,version){
   if(!can("laws"))return;
   const law=(getState()?.laws||[]).find(x=>x.id===id);
   if(!law||law.scope!=="kingdom")return;
   if(!window.confirm(t("restoreConfirm")))return;
   try{
     await request("bootstrap",{action:"law_restore",id,restore_version:version,expected_version:law.version});
     $("lawHistoryDialog").close();await refresh();flash(t("saved"));
   }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
 }
 async function unpublish(id){
  if(!can("laws"))return;
  const law=(getState()?.laws||[]).find(x=>x.id===id&&x.scope==="kingdom");
  const publication=(getState()?.lawPublications||[]).find(x=>x.law_id===id);
  if(!law||!publication)return;
  if(!window.confirm(t("lawUnpublishConfirm").replace("{n}",String(law.number))))return;
  try{
    await request("bootstrap",{action:"law_unpublish",id,expected_version:law.version});
    await refresh();flash(t("lawWithdrawn"));
  }catch(e){flash(t("genericError")+" ("+e.message+")",true);}
 }
 async function invite(){
   const state=getState();if(state?.staff?.rank!=="R5")return;
   const form=$("r4Form");
   const fd=new FormData(form);
   const permissions=Object.fromEntries(["members","transfers","laws","events","settings"].map(k=>[k,fd.has(k)]));
   const email=String(fd.get("email")||"").trim();
   if(!email||!Object.values(permissions).some(Boolean)){flash(t("missingStaffData"),true);return;}
   if(!window.confirm(t("inviteConfirm").replace("{email}",email)))return;
   const btn=$("inviteR4");btn.disabled=true;
   try{
     await request("bootstrap",{action:"staff_invite",email,permissions});
     await refresh();$("staffFormInfo").textContent=t("invitedUser");flash(t("invitedUser"));
   }catch(e){flash(t("genericError")+" ("+e.message+")",true)}
   finally{btn.disabled=false;}
 }
 function attach(){
   $("newTransferWindow")?.addEventListener("click",()=>openWindow());
   $("transferWindowForm")?.addEventListener("submit",saveWindow);
   for(const id of ["twCancel","twCancelTop"])$(id)?.addEventListener("click",()=>$("transferWindowDialog").close());
   $("lawHistoryClose")?.addEventListener("click",()=>$("lawHistoryDialog").close());
   $("inviteR4")?.addEventListener("click",invite);
   document.addEventListener("click",e=>{
     const w=e.target.closest("[data-transfer-window]");
     if(w){openWindow(w.dataset.transferWindow);return;}
     const wlaw=e.target.closest("[data-law-unpublish]");
     if(wlaw){unpublish(wlaw.dataset.lawUnpublish);return;}
     const h=e.target.closest("[data-law-history]");
     if(h){history(h.dataset.lawHistory);return;}
     const v=e.target.closest("[data-law-restore]");
     if(v){restore(v.dataset.lawRestore,Number(v.dataset.version));return;}
   });
 }
 attach();
 return {render(){windows();renderAudit();if(!portraitsChecked&&can("transfers"))hydratePortraits();}};
}
