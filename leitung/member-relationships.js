/* AllianceOS Phase 1 – account groups and true dated power observations.
 * Only enabled on GitHub Pages for the initial leadership preview.
 * Never creates player logins or modifies NAP player records. */
export function createMemberRelationships({getState,getLanguage,request,esc,flash,reloadDossier}){
  const enabled=true; // Released for both GitHub Pages and Vercel; access is enforced by server-side module permissions.
  const labels={
    de:{kind:"Account-Typ",main:"Main",alt:"Alt",mainAccount:"Zugehöriger Main",pickMain:"Main auswählen …",
      linkHelp:"Alts werden über ihre Kingshot-ID verknüpft. Der Main muss zu dieser Allianz gehören.",
      altAccounts:"Verknüpfte Alts",noAlt:"Noch keine Alts verknüpft.",
      powerHistory:"Kraftentwicklung (API-Snapshots)",historyLoading:"Echte API-Werte werden geladen …",
      historyEmpty:"Noch keine datierten API-Snapshots vorhanden.",historyError:"Kraftverlauf konnte nicht geladen werden.",
      observed:"Beobachtet",change:"Veränderung im angezeigten Zeitraum",provider:"Quelle: MightPulse-Allianzabruf",
      linked:"Verknüpft mit",mainHasAlts:"Dieser Main hat bereits Alts und kann daher nicht selbst als Alt gewählt werden."},
    en:{kind:"Account type",main:"Main",alt:"Alt",mainAccount:"Linked main",pickMain:"Select main …",
      linkHelp:"Alt accounts are linked by Kingshot ID. The main must belong to this alliance.",
      altAccounts:"Linked alts",noAlt:"No linked alts yet.",
      powerHistory:"Power history (API snapshots)",historyLoading:"Loading real API readings …",
      historyEmpty:"No dated API snapshots yet.",historyError:"Could not load power history.",
      observed:"Observed",change:"Change over the displayed period",provider:"Source: MightPulse alliance roster",
      linked:"Linked to",mainHasAlts:"This main already has alts and cannot also be assigned as an alt."},
    fr:{kind:"Type de compte",main:"Principal",alt:"Secondaire",mainAccount:"Compte principal lié",pickMain:"Choisir le principal …",
      linkHelp:"Les comptes secondaires sont liés par ID Kingshot. Le principal doit appartenir à cette alliance.",
      altAccounts:"Comptes secondaires liés",noAlt:"Aucun compte secondaire lié.",
      powerHistory:"Évolution de puissance (API)",historyLoading:"Chargement des valeurs API réelles …",
      historyEmpty:"Aucun relevé daté.",historyError:"Historique de puissance indisponible.",
      observed:"Relevé",change:"Évolution sur la période affichée",provider:"Source : effectif d'alliance MightPulse",
      linked:"Lié à",mainHasAlts:"Ce principal a déjà des comptes secondaires et ne peut pas en être un."},
    es:{kind:"Tipo de cuenta",main:"Principal",alt:"Alternativa",mainAccount:"Principal vinculado",pickMain:"Elegir principal …",
      linkHelp:"Las cuentas alternativas se vinculan mediante la ID Kingshot. El principal debe pertenecer a esta alianza.",
      altAccounts:"Cuentas alternativas vinculadas",noAlt:"Aún no hay cuentas alternativas vinculadas.",
      powerHistory:"Historial de poder (API)",historyLoading:"Cargando valores reales de la API …",
      historyEmpty:"Aún no hay registros fechados.",historyError:"No se pudo cargar el historial.",
      observed:"Registrado",change:"Cambio durante el periodo mostrado",provider:"Fuente: plantilla de alianza MightPulse",
      linked:"Vinculado a",mainHasAlts:"Esta cuenta principal ya tiene alternativas y no puede ser alternativa."}
  };
  const extra={
  de:{externalTitle:"Zweitaccounts außerhalb von NRW",externalHelp:"Nur eine private Übersicht. Keine NRW-Mitgliedschaft, keine Loginrechte, keine automatische Übernahme von API-Daten.",externalId:"Kingshot-ID des Zweitaccounts",externalName:"Name (optional)",externalAlliance:"Allianz (optional)",externalAdd:"Zweitaccount verknüpfen",externalRemove:"Entfernen",externalType:"Extern · manuell eingetragen",externalConfirm:"Diese externe Verknüpfung wirklich entfernen?",externalSaved:"Externer Zweitaccount gespeichert.",externalDeleted:"Externe Verknüpfung entfernt.",externalError:"Externer Zweitaccount konnte nicht gespeichert werden.",externalCount:"extern",externalNoMain:"Zuerst einen Main-Account öffnen."},
  en:{externalTitle:"Second accounts outside NRW",externalHelp:"Private overview only. No NRW membership, login rights or automatic API ownership claims.",externalId:"Second account Kingshot ID",externalName:"Name (optional)",externalAlliance:"Alliance (optional)",externalAdd:"Link second account",externalRemove:"Remove",externalType:"External · entered manually",externalConfirm:"Remove this external association?",externalSaved:"External second account saved.",externalDeleted:"External link removed.",externalError:"Unable to save external second account.",externalCount:"external",externalNoMain:"Open a main account first."},
  fr:{externalTitle:"Comptes secondaires hors NRW",externalHelp:"Vue privée uniquement : aucune adhésion NRW, aucun accès ni vérification automatique de propriété.",externalId:"ID Kingshot du secondaire",externalName:"Nom (facultatif)",externalAlliance:"Alliance (facultatif)",externalAdd:"Associer ce compte",externalRemove:"Supprimer",externalType:"Externe · saisi manuellement",externalConfirm:"Supprimer cette association ?",externalSaved:"Compte secondaire externe enregistré.",externalDeleted:"Association supprimée.",externalError:"Enregistrement impossible.",externalCount:"externes",externalNoMain:"Ouvrir d'abord le compte principal."},
  es:{externalTitle:"Cuentas secundarias fuera de NRW",externalHelp:"Solo vista privada. Sin membresía NRW, acceso ni verificación automática de propiedad.",externalId:"ID Kingshot secundaria",externalName:"Nombre (opcional)",externalAlliance:"Alianza (opcional)",externalAdd:"Vincular cuenta",externalRemove:"Quitar",externalType:"Externa · introducida manualmente",externalConfirm:"¿Quitar esta vinculación?",externalSaved:"Cuenta secundaria guardada.",externalDeleted:"Vinculación eliminada.",externalError:"No se pudo guardar.",externalCount:"externas",externalNoMain:"Abre una cuenta principal primero."}
  };
  const t=key=>extra[getLanguage()]?.[key]||(labels[getLanguage()]||labels.de)[key]||extra.de[key]||labels.de[key]||key;
  const player=id=>(getState()?.players||[]).find(x=>String(x.game_id)===String(id));
  const externalFor=id=>(getState()?.externalAlts||[]).filter(x=>String(x.main_game_id)===String(id));
  const format=n=>Number(n).toLocaleString({de:"de-DE",en:"en-GB",fr:"fr-FR",es:"es-ES"}[getLanguage()]||"de-DE");
  function rowBadge(p){
    if(!enabled)return "";
    if(p.main_game_id){
      const main=player(p.main_game_id);
      return ' <span class="member-account-tag alt" title="'+esc(t("linked"))+'">ALT → '+esc(main?.name||p.main_game_id)+'</span>';
    }
    const count=(getState()?.players||[]).filter(x=>x.main_game_id===p.game_id).length+externalFor(p.game_id).length;
    return count?' <span class="member-account-tag">MAIN · '+count+' ALT'+(count===1?'':'s')+'</span>':"";
  }
  function editorFields(record){
    if(!enabled)return "";
    const all=getState()?.players||[],related=all.filter(x=>x.main_game_id===record.game_id),
      external=externalFor(record.game_id),totalRelated=related.length+external.length;
    const isAlt=Boolean(record.main_game_id);
    const options=all.filter(x=>x.game_id!==record.game_id&&!x.main_game_id&&x.game_id)
      .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),getLanguage()));
    if(record.main_game_id&&!options.some(x=>x.game_id===record.main_game_id)){
      options.unshift({game_id:record.main_game_id,name:player(record.main_game_id)?.name||record.main_game_id});
    }
    const mainOptions=options.map(p=>'<option value="'+esc(p.game_id)+'" '+(p.game_id===record.main_game_id?'selected':'')+'>'+esc(p.name)+' · '+esc(p.game_id)+'</option>').join("");
    const nativeAccounts=related.map(alt=>'<button type="button" class="ghost member-related" data-related-player="'+esc(alt.game_id)+'">'+esc(alt.name)+' <small>· '+esc(alt.game_id)+'</small> ↗</button>').join("");
    const externalAccounts=external.map(alt=>'<div class="external-alt-row"><span><b>'+esc(alt.display_name||alt.alt_game_id)+'</b> <small>· '+esc(alt.alt_game_id)+(alt.reported_alliance?' · '+esc(alt.reported_alliance):'')+' · '+esc(t("externalType"))+'</small></span>'+
      '<button type="button" class="ghost" data-remove-external-alt="'+esc(alt.alt_game_id)+'">'+esc(t("externalRemove"))+'</button></div>').join("");
    const accounts=nativeAccounts+externalAccounts||( '<p class="muted">'+esc(t("noAlt"))+'</p>');
    const externalEditor='<div class="external-alt-editor"><h4>'+esc(t("externalTitle"))+'</h4><p class="small-note">'+esc(t("externalHelp"))+'</p>'+
      '<div class="form-grid"><label class="field"><span>'+esc(t("externalId"))+'</span><input class="control" name="external_alt_id" pattern="[0-9]{5,20}" inputmode="numeric" maxlength="20" placeholder="123456789"></label>'+
      '<label class="field"><span>'+esc(t("externalName"))+'</span><input class="control" name="external_alt_name" maxlength="80"></label>'+
      '<label class="field"><span>'+esc(t("externalAlliance"))+'</span><input class="control" name="external_alt_alliance" maxlength="24" placeholder="NWO / RDS"></label></div>'+
      '<button type="button" class="ghost" data-add-external-alt>'+esc(t("externalAdd"))+'</button></div>';
    return '<section class="member-links-panel"><h3>'+esc(t("kind"))+'</h3>'+
      '<div class="form-grid"><label class="field"><span>'+esc(t("kind"))+'</span><select class="control" name="account_kind">'+
      '<option value="main" '+(!isAlt?'selected':'')+'>'+esc(t("main"))+'</option>'+
      '<option value="alt" '+(isAlt?'selected':'')+' '+(totalRelated?'disabled':'')+'>'+esc(t("alt"))+'</option></select></label>'+
      '<div id="memberMainField" '+(!isAlt?'hidden':'')+'><label class="field"><span>'+esc(t("mainAccount"))+'</span>'+
      '<select class="control" name="main_game_id"><option value="">'+esc(t("pickMain"))+'</option>'+mainOptions+'</select></label></div></div>'+
      '<p class="small-note">'+esc(totalRelated?t("mainHasAlts"):t("linkHelp"))+'</p>'+
      (!isAlt?'<div class="member-related-list"><strong>'+esc(t("altAccounts"))+'</strong>'+accounts+'</div>'+externalEditor:
        '<div class="member-related-list"><strong>'+esc(t("mainAccount"))+'</strong><button type="button" class="ghost member-related" data-related-player="'+esc(record.main_game_id)+'">'+esc(player(record.main_game_id)?.name||record.main_game_id)+' ↗</button></div>')+
      '</section><section class="member-history-panel"><h3>'+esc(t("powerHistory"))+'</h3>'+
      '<p class="small-note">'+esc(t("provider"))+'</p>'+
      '<div id="memberPowerHistory" role="status">'+esc(t("historyLoading"))+'</div></section>';
  }
  function renderHistory(input){
    const rows=(Array.isArray(input)?input:[]).filter(x=>x.observed_on&&Number.isSafeInteger(Number(x.power))&&Number(x.power)>=0)
      .sort((a,b)=>String(a.observed_on).localeCompare(String(b.observed_on)));
    if(!rows.length)return '<p class="muted">'+esc(t("historyEmpty"))+'</p>';
    const shown=rows.slice(-31),start=shown[0],end=shown[shown.length-1];
    const change=Number(end.power)-Number(start.power);
    const pct=Number(start.power)>0?' ('+(change>=0?'+':'')+(100*change/Number(start.power)).toFixed(2)+' %)':"";
    const min=Math.min(...shown.map(x=>Number(x.power))),max=Math.max(...shown.map(x=>Number(x.power)));
    const bars=shown.map(x=>{
      const height=max===min?55:Math.round(18+82*(Number(x.power)-min)/(max-min));
      return '<span class="member-power-bar" style="height:'+height+'%" title="'+esc(x.observed_on+' · '+format(x.power))+'"></span>';
    }).join("");
    return '<div class="member-power-summary"><strong>'+esc(format(end.power))+'</strong><small>'+
      esc(t("change"))+': '+esc((change>0?'+':'')+format(change))+esc(pct)+'</small></div>'+
      '<div class="member-power-chart" role="img" aria-label="'+esc(t("powerHistory"))+'">'+bars+'</div>'+
      '<div class="member-power-period"><small>'+esc(start.observed_on)+'</small><small>'+esc(end.observed_on)+'</small></div>'+
      '<p class="small-note">'+esc(t("observed"))+': '+shown.length+' '+esc(getLanguage()==="de"?"Tage":"days")+'</p>';
  }
  function activate(record){
    if(!enabled)return;
    const dialog=document.getElementById("editDialog"),field=document.getElementById("memberMainField");
    const kind=dialog?.querySelector('[name="account_kind"]'),main=dialog?.querySelector('[name="main_game_id"]');
    if(!dialog||!field||!kind||!main)return;
    const update=()=>{
      field.hidden=kind.value!=="alt";
      main.required=kind.value==="alt";
      if(kind.value!=="alt")main.value="";
    };
    kind.addEventListener("change",update);
    update();
    dialog.dataset.memberGameId=record.game_id;
    request("bootstrap",{action:"power_history",game_id:record.game_id}).then(data=>{
      if(!dialog.open||dialog.dataset.memberGameId!==record.game_id)return;
      const target=document.getElementById("memberPowerHistory");
      if(target)target.innerHTML=renderHistory(data?.snapshots);
    }).catch(()=>{
      if(!dialog.open||dialog.dataset.memberGameId!==record.game_id)return;
      const target=document.getElementById("memberPowerHistory");
      if(target)target.textContent=t("historyError");
    });
  }
  // External references are separate actions; never create player records.
  const dialog=document.getElementById("editDialog");
  if(dialog){
    dialog.addEventListener("click",async event=>{
      const add=event.target.closest("[data-add-external-alt]");
      const remove=event.target.closest("[data-remove-external-alt]");
      if(!add&&!remove||!dialog.open)return;
      event.preventDefault();
      const main=dialog.dataset.memberGameId;
      const current=player(main);
      if(!current||current.main_game_id){flash(t("externalNoMain"),true);return;}
      const alt=remove?.dataset.removeExternalAlt||
        String(dialog.querySelector('[name="external_alt_id"]')?.value||"").trim();
      if(!/^[0-9]{5,20}$/.test(alt)){flash(t("externalError")+" (ID)",true);return;}
      if(remove&&!window.confirm(t("externalConfirm")))return;
      const btn=add||remove;
      btn.disabled=true;
      try{
        await request("bootstrap",{action:"external_alt_save",command:remove?"remove":"save",
          main_game_id:main,alt_game_id:alt,
          display_name:remove?"":String(dialog.querySelector('[name="external_alt_name"]')?.value||"").trim(),
          reported_alliance:remove?"":String(dialog.querySelector('[name="external_alt_alliance"]')?.value||"").trim()});
        flash(t(remove?"externalDeleted":"externalSaved"));
        if(reloadDossier)await reloadDossier(main);
      }catch(e){flash(t("externalError")+" ("+String(e?.message||e)+")",true);}
      finally{btn.disabled=false;}
    });
  }
  function appendSaveData(data,formData){
    if(!enabled)return;
    data.main_game_id=formData.get("account_kind")==="alt"?String(formData.get("main_game_id")||""):"";
  }
  return {enabled,rowBadge,editorFields,activate,appendSaveData};
}