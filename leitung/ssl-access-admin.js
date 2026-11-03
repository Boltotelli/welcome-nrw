export function createSslAccessAdmin({root,request,esc,flash,showCredentials}){
 let busy=false,rows=[];
 async function load(){
  try{rows=(await request('bootstrap',{action:'ssl_viewers_list'})).viewers||[];draw();}
  catch(e){root.textContent='SSL-Gastzugänge konnten nicht geladen werden.';}
 }
 function draw(){
  root.innerHTML='<h3>SSL-Gastzugänge · nur lesen</h3><p class="small-note">Nur SSL-Roster, Karte und Teamtexte. Keine internen Notizen, Teilnahmevermerke oder weiteren Leitungsmodule. Sperren wirkt beim nächsten Abruf, auch in bestehenden Sitzungen.</p><form data-viewer-create><label class="field">Name des Gastes<input class="control" name="name" maxlength="60" required autocomplete="off"></label><button class="primary" '+(busy?'disabled':'')+'>Gastzugang erstellen</button></form><div class="ssl-access-list">'+(rows.length?rows.map(p=>'<article class="ssl-access-row"><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.login_name)+' · '+(p.enabled?'Aktiv':'Gesperrt')+'</small></div><div><button type="button" class="ghost" data-viewer-toggle="'+esc(p.user_id)+'" '+(busy?'disabled':'')+'>'+(p.enabled?'Sperren':'Freigeben')+'</button> <button type="button" class="ghost" data-viewer-reset="'+esc(p.user_id)+'" '+(busy?'disabled':'')+'>Passwort erneuern</button></div></article>').join(''):'<p class="small-note">Noch keine SSL-Gastzugänge.</p>')+'</div>';
 }
 async function run(body){
  if(busy)return;busy=true;root.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const r=await request('bootstrap',body);if(r.password)showCredentials(['SSL-Gastzugang · nur lesen','Anmeldung: '+new URL('./ssl.html',location.href).href,'Benutzername: '+r.login_name,'Passwort: '+r.password],'Zugangsdaten werden nur jetzt angezeigt. Sicher an den Gast weitergeben.');flash('SSL-Gastzugang aktualisiert.');await load();}
  catch{flash('Gastzugang konnte nicht aktualisiert werden.',true);}
  finally{busy=false;root.querySelectorAll('button').forEach(b=>b.disabled=false);}
 }
 root.addEventListener('submit',e=>{if(!e.target.matches('[data-viewer-create]'))return;e.preventDefault();run({action:'ssl_viewer_create',name:e.target.elements.name.value});});
 root.addEventListener('click',e=>{const b=e.target.closest('[data-viewer-toggle],[data-viewer-reset]');if(!b)return;const id=b.dataset.viewerToggle||b.dataset.viewerReset,row=rows.find(r=>r.user_id===id);if(!row)return;if(b.dataset.viewerReset&&!window.confirm('Ein neues Passwort ausstellen? Das bisherige Passwort funktioniert danach nicht mehr.'))return;run({action:b.dataset.viewerToggle?'ssl_viewer_toggle':'ssl_viewer_reset',user_id:id,...(b.dataset.viewerToggle?{enabled:!row.enabled}:{})});});
 return {load};
}
