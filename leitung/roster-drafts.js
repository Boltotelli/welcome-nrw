/* In-memory roster edits, scoped by event/date. No writes before Save all. */
export function createRosterDrafts({root,scope,getLanguage,esc,request,onSaved,redraw,flash}){
 const entries=new Map();let busy=false,epoch=0;
 const words={
  de:{save:'Alle Änderungen speichern',discard:'Änderungen verwerfen',pending:'Ungespeicherte Änderungen',empty:'Keine ungespeicherten Änderungen',hint:'Kreuze und weitere Angaben erst bearbeiten, dann gemeinsam speichern. Auch ausgeblendete Änderungen werden übernommen.',working:'Speichert …',saved:'Änderungen gespeichert',failed:'Speichern angehalten. Erfolgreiche Einträge sind gespeichert; offene Änderungen bleiben erhalten.',other:'Weitere Änderungen in anderen Terminen'},
  en:{save:'Save all changes',discard:'Discard changes',pending:'Unsaved changes',empty:'No unsaved changes',hint:'Edit checkboxes and other fields first, then save together. Filtered-out changes are included.',working:'Saving …',saved:'Changes saved',failed:'Saving stopped. Successful entries are saved; pending changes are retained.',other:'More changes in other event dates'},
  fr:{save:'Enregistrer les modifications',discard:'Annuler les modifications',pending:'Modifications non enregistrées',empty:'Aucune modification en attente',hint:'Modifiez les cases et les champs, puis enregistrez ensemble. Les lignes filtrées sont incluses.',working:'Enregistrement …',saved:'Modifications enregistrées',failed:'Enregistrement interrompu. Les modifications restantes sont conservées.',other:'Autres modifications à des dates différentes'},
  es:{save:'Guardar todos los cambios',discard:'Descartar cambios',pending:'Cambios sin guardar',empty:'Sin cambios pendientes',hint:'Edita las casillas y los campos y guarda todo junto. Se incluyen las filas filtradas.',working:'Guardando …',saved:'Cambios guardados',failed:'Guardado detenido. Los cambios pendientes se conservan.',other:'Más cambios en otras fechas'}
 };
 const t=k=>(words[getLanguage()]||words.en)[k];
 const key=id=>JSON.stringify([scope(),String(id)]);
 const current=()=>[...entries.entries()].filter(([key])=>JSON.parse(key)[0]===scope());
 const revision=()=>[scope(),current().length,entries.size,busy,getLanguage()].join(':');
 function toolbar(){const n=current().length,other=entries.size-n;return '<div class="roster-batch-actions" data-roster-state="'+esc(revision())+'" aria-busy="'+busy+'"><div><strong role="status" tabindex="-1" data-roster-status>'+esc(busy?t('working'):n?t('pending')+' · '+n:t('empty'))+'</strong><p>'+esc(t('hint'))+(other?' '+esc(t('other'))+': '+other:'')+'</p></div><div class="roster-batch-buttons"><button type="button" class="primary" data-roster-save-all '+(!n||busy?'disabled':'')+'>'+esc(busy?t('working'):t('save'))+'</button><button type="button" class="ghost" data-roster-discard '+(!n||busy?'disabled':'')+'>'+esc(t('discard'))+'</button></div></div>';}
 function refresh(){root.querySelectorAll('.roster-batch-actions').forEach(el=>{if(el.dataset.rosterState!==revision())el.outerHTML=toolbar();});}
 function set(id,payload,baseline){if(busy)return;const k=key(id);if(JSON.stringify(payload)===JSON.stringify(baseline))entries.delete(k);else entries.set(k,payload);refresh();}
 async function saveAll(){
  if(busy)return;const batch=current();if(!batch.length)return;
  busy=true;const ticket=epoch;redraw();let failed=false;
  try{for(const [key,payload] of batch){
   if(ticket!==epoch)return;
   const result=await request('bootstrap',payload);
   if(ticket!==epoch)return;
   if(!result?.ok||(!result.removed&&!result.assignment))throw Error('save_failed');
   onSaved(payload,result);if(entries.get(key)===payload)entries.delete(key);refresh();
  }}catch{failed=true;if(ticket===epoch)flash(t('failed'),true);}
  finally{if(ticket===epoch){busy=false;redraw();if(!failed)flash(t('saved'));(root.querySelector('[data-roster-save-all]:not(:disabled)')||root.querySelector('[data-roster-status]'))?.focus();}}
 }
 function click(e){if(e.target.closest('[data-roster-save-all]')){saveAll();return true;}if(e.target.closest('[data-roster-discard]')){if(!busy){for(const [key] of current())entries.delete(key);redraw();}return true;}return false;}
 window.addEventListener('beforeunload',e=>{if(entries.size){e.preventDefault();e.returnValue='';}});
 return {get:id=>entries.get(key(id)),has:id=>entries.has(key(id)),set,toolbar,click,count:()=>current().length,isBusy:()=>busy,reset(){epoch++;entries.clear();busy=false;}};
}
