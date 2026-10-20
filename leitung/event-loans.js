export function createEventLoans({getState,getLanguage,request,esc,flash}){
 const root=document.getElementById("eventLoanRoot");
 const enabled=location.hostname==="boltotelli.github.io"||["localhost","127.0.0.1"].includes(location.hostname);
 const labels={
 de:["Temporäre Event-Ausleihen","NRW bleibt Heimatallianz. Das ist kein dauerhafter Transfer.","Genehmigen","Rückkehr bestätigen","Abbrechen","Beginn","Rückkehrfrist","Leitungszugang erhalten (R4/R5, Admin)","Aktuelle Allianz","Keine Einträge","Nur Admins bearbeiten Ausleihen.","Änderung bestätigen?","Aktualisieren","Rückkehr überfällig","Laufend"],
 en:["Temporary event loans","NRW stays home alliance. Not a permanent transfer.","Approve","Confirm return","Cancel","Start","Return deadline","Preserve leader access (R4/R5, admin)","Current alliance","No entries","Only admins may edit loans.","Confirm this change?","Refresh","Return overdue","Active"],
 fr:["Prêts temporaires","NRW reste l'alliance d'origine. Pas un transfert définitif.","Approuver","Confirmer le retour","Annuler","Début","Limite de retour","Préserver l'accès de direction (R4/R5, admin)","Alliance actuelle","Aucune entrée","Seuls les admins peuvent modifier.","Confirmer ?", "Actualiser","Retour en retard","En cours"],
 es:["Préstamos temporales","NRW sigue siendo la alianza de origen. No es un traslado permanente.","Aprobar","Confirmar regreso","Cancelar","Inicio","Límite de regreso","Mantener acceso de dirección (R4/R5, admin)","Alianza actual","Sin registros","Solo los administradores pueden editar.","¿Confirmar cambio?","Actualizar","Regreso atrasado","En curso"]
 };
 const t=i=>(labels[getLanguage()]||labels.de)[i],staff=()=>getState()?.staff||{};
 const canRead=()=>staff().is_owner||staff().permissions?.members||staff().permissions?.transfers;
 const admin=()=>staff().is_owner===true;
 let data=null,loading=null,selected="";
 function render(){
  if(!root||!enabled||!canRead()||!data)return;
  const entries=(data.loans||[]).map(l=>{
    const p=(getState()?.players||[]).find(p=>p.game_id===l.game_id);
    const badge=l.status==="returned"?"✓ "+t(3):l.status==="cancelled"?"× "+t(4):
     l.expired?"⚠ "+t(13):"● "+t(14);
    return '<article class="loan-record"><b>'+esc(p?.name||data.observed?.[l.game_id]?.name||l.game_id)+'</b> '+badge+
      '<small> · '+esc(l.game_id)+' · '+esc(l.event_type.toUpperCase())+' · NRW → '+esc(l.target_alliance)+'</small>'+
      '<p>'+esc(t(5))+': '+esc(new Date(l.starts_at).toLocaleString())+' · '+esc(t(6))+': '+esc(new Date(l.ends_at).toLocaleString())+'</p>'+
      '<p>'+esc(t(8))+': '+esc(data.observed?.[l.game_id]?.alliance||"—")+'</p>'+
      (l.protect_leadership?'<p>🔒 R'+esc(l.original_rank)+'</p>':'')+
      (l.status==="approved"&&admin()?'<div class="loan-actions"><button type="button" data-loan-action="return" data-id="'+esc(l.id)+'">'+esc(t(3))+'</button>'+
      '<button type="button" data-loan-action="cancel" data-id="'+esc(l.id)+'">'+esc(t(4))+'</button></div>':'')+
      '</article>';
  }).join("");
  const available=[...(getState()?.players||[]),...(getState()?.internalMoves||[])
     .filter(m=>m.from_alliance==="NRW").map(m=>({game_id:m.game_id,name:m.player_name}))];
  const seen=new Set();
  const suggestions=available.filter(p=>/^[0-9]{5,20}$/.test(String(p.game_id||""))&&
     (!seen.has(String(p.game_id))&&seen.add(String(p.game_id))))
     .map(p=>'<option value="'+esc(p.game_id)+'">'+esc(p.name||p.game_id)+'</option>').join("");
  const form=admin()?'<form id="eventLoanForm" class="loan-form">'+
    '<label>Game ID<input class="control" id="loanPlayer" name="game_id" list="loanPlayerList" pattern="[0-9]{5,20}" required value="'+esc(selected)+'"></label><datalist id="loanPlayerList">'+suggestions+'</datalist>'+
    '<label>Event<select class="control" name="event_type"><option value="fdt">FDT</option><option value="castle">Castle Battle</option><option value="kvk">KvK</option></select></label>'+
    '<label>Alliance<select class="control" name="target_alliance"><option>NWO</option><option>RDS</option></select></label>'+
    '<label>'+esc(t(5))+'<input class="control" name="starts_at" type="datetime-local" required></label>'+
    '<label>'+esc(t(6))+'<input class="control" name="ends_at" type="datetime-local" required></label>'+
    '<label>Notiz<input class="control" name="note" maxlength="500"></label>'+
    '<label class="loan-protect"><input type="checkbox" name="protect_leadership">'+esc(t(7))+'</label>'+
    '<button type="submit" class="primary">'+esc(t(2))+'</button></form>':'<p>'+esc(t(10))+'</p>';
  root.innerHTML='<header class="loan-header"><h3>'+esc(t(0))+'</h3><button type="button" data-loan-refresh>'+esc(t(12))+'</button></header>'+
    '<p>'+esc(t(1))+'</p>'+form+'<div class="loan-entries">'+(entries||esc(t(9)))+'</div>';
 }
 async function open(force=false){
  if(!root||!enabled||!canRead())return;
  if(data&&!force){render();return}if(loading)return loading;
  loading=request("bootstrap",{action:"event_loan_data"}).then(r=>{data=r;render()}).catch(e=>flash(String(e.message||e),true)).finally(()=>loading=null);
  return loading;
 }
 async function save(payload){
  try{await request("bootstrap",{action:"event_loan_save",...payload});data=null;selected="";await open(true)}
  catch(e){flash(String(e.message||e),true)}
 }
 if(root){
  root.addEventListener("submit",e=>{
   if(e.target.id!=="eventLoanForm")return;e.preventDefault();
   const fd=new FormData(e.target),start=Date.parse(fd.get("starts_at")),end=Date.parse(fd.get("ends_at"));
   if(!Number.isFinite(start)||!Number.isFinite(end)||start>=end)return;
   save({command:"approve",game_id:String(fd.get("game_id")||"").trim(),target_alliance:fd.get("target_alliance"),event_type:fd.get("event_type"),starts_at:new Date(start).toISOString(),ends_at:new Date(end).toISOString(),protect_leadership:fd.has("protect_leadership"),note:fd.get("note")});
  });
  root.addEventListener("click",e=>{
   if(e.target.closest("[data-loan-refresh]"))return open(true);
   const btn=e.target.closest("[data-loan-action]");if(btn&&admin()&&window.confirm(t(11)))save({command:btn.dataset.loanAction,id:btn.dataset.id});
  });
 }
 function selectPlayer(id){selected=String(id);render();const input=root?.querySelector("#loanPlayer");if(input){input.value=selected;input.focus();}}
 function reset(){data=null;loading=null;selected="";if(root)root.innerHTML="";}
 return {enabled,open,render,selectPlayer,reset};
}
