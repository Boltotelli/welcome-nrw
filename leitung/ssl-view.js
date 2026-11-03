import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm';
import {SSL_SITES} from './fightclub-map.js?v=20261103-access-1';
import {decodeDeployment} from './deployment-engine.js?v=20261103-ssl-1';
const BASE='https://bdzlgirowutasrsycjfj.supabase.co',KEY='sb_publishable_8i1ismeQtj9WM-xVN_Vm0w_Tj7AvVtL';
const auth=createClient(BASE,KEY,{auth:{storageKey:'aos_ssl_readonly_auth_v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data=null,generation=0;
const status=(s,error=false)=>{$('status').textContent=s;$('status').classList.toggle('error',error);};
function signedOut(){generation++;data=null;$('plan').replaceChildren();$('view').hidden=true;$('login').hidden=false;$('logout').hidden=true;}
function render(){
 const legion=Number($('legion').value),rows=data.assignments.filter(a=>Number(a.legion)===legion),people=new Map(data.players.map(p=>[String(p.game_id),p]));
 const name=id=>people.get(String(id))?.name||id;
 const positions=data.map_assignments.filter(p=>rows.some(a=>a.game_id===p.game_id)).map(p=>({...p,...decodeDeployment(p.location_key,SSL_SITES)}));
 const siteName=key=>SSL_SITES.find(s=>s.key===key)?.name||(key==='guerrilla'?'GUERILLA':'Noch ohne Ort');
 $('summary').textContent=(data.date?'SSL · '+data.date+' · ':'')+rows.length+' eingeplante Spieler · nur lesen';
 let html='<section class="panel"><div class="panel-heading"><h2>'+(legion?'Legion '+legion:'Reserve')+'</h2><button data-copy-roster>Spielerliste kopieren</button></div><div class="table-wrap"><table><thead><tr><th>Spieler</th><th>Mystic Trial</th><th>Position</th></tr></thead><tbody>'+rows.map(a=>{const p=people.get(String(a.game_id)),pos=positions.find(x=>x.game_id===a.game_id);return '<tr><td>'+esc(name(a.game_id))+'<small>'+esc(a.game_id)+' · '+esc(p?.home_alliance||'NRW')+'</small></td><td>'+esc(p?.mystic_trial??'—')+'</td><td>'+esc(siteName(pos?.location))+'</td></tr>';}).join('')+'</tbody></table></div>'+(rows.length?'':'<p class="empty">Für diese Auswahl sind noch keine Spieler eingeplant.</p>')+'</section>';
 if(legion){
  html+='<section class="panel"><h2>Kartenplanung</h2><p>Planungsübersicht · auf kleinen Bildschirmen seitlich verschieben.</p><div class="map-wrap" tabindex="0" aria-label="SSL-Karte"><div class="battle-map">'+SSL_SITES.map(s=>{const list=positions.filter(p=>p.location===s.key);return '<div class="site '+(list.length?'has-players':'')+'" style="left:'+s.x+'%;top:'+s.y+'%"><b>'+esc(s.name)+'</b>'+list.map(p=>esc(name(p.game_id))).join('<br>')+'</div>';}).join('')+'</div></div></section>';
  const labels={north:'NORD · NORTH',south:'SÜD · SOUTH',secure:'SECURE · SAFE ZONE',guerrilla:'GUERILLA'};
  const instructions={north:'Capture NORTH as quickly as possible.\nJoin rallies and reinforce occupied strongholds.',south:'Capture SOUTH as quickly as possible.\nJoin rallies and reinforce occupied strongholds.',guerrilla:'Early Occupation & fast support for North/South.\nStay mobile and help wherever needed.',secure:'Stay in the Safe Zone as long as possible.\nBefore battle: reinforce Guerrilla players or Team Leaders.\nJoin rallies in your assigned area – use free troop speed-ups if necessary.\nPrioritize nearby strongholds and resource gathering.'};
  html+='<h2>Ingame-Teamtexte</h2><div class="teams">'+Object.entries(labels).map(([group,label])=>{const members=positions.filter(p=>p.group===group&&rows.find(a=>a.game_id===p.game_id)?.availability!=='unavailable'),leader=data.leaders.find(l=>Number(l.legion)===legion&&members.some(p=>p.game_id===l.game_id))?.game_id,text=label+'\n'+(['north','south'].includes(group)?'👑 Leader: '+(leader?name(leader):'—')+'\n\n':'')+(members.filter(p=>!(['north','south'].includes(group)&&p.game_id===leader)).map(p=>'• '+name(p.game_id)).join('\n')||'—')+'\n\n'+instructions[group];return '<article class="panel team"><div class="panel-heading"><h2>'+esc(label)+'</h2><button data-copy-team>Teamtext kopieren</button></div><pre>'+esc(text)+'</pre></article>';}).join('')+'</div>';
 }
 $('plan').innerHTML=html;
 $('plan').querySelector('[data-copy-roster]').onclick=()=>copy(rows.map(a=>name(a.game_id)+' | '+a.game_id).join('\n'));
 $('plan').querySelectorAll('[data-copy-team]').forEach(b=>b.onclick=()=>copy(b.closest('article').querySelector('pre').textContent));
}
async function copy(text){try{await navigator.clipboard.writeText(text);status('Kopiert.');}catch{status('Kopieren nicht verfügbar. Bitte den Text markieren und kopieren.',true);}}
async function load(date=''){
 const gen=++generation;$('refresh').disabled=true;$('date').disabled=true;status('SSL-Planung wird geladen …');
 try{
  const {data:{session}}=await auth.auth.getSession();if(!session)throw Error('authentication_required');
  const r=await fetch(BASE+'/functions/v1/allianceos-leitung?alliance=NRW&mode=ssl-view'+(date?'&date='+encodeURIComponent(date):''),{headers:{Authorization:'Bearer '+session.access_token,apikey:KEY},cache:'no-store'});
  if(!r.ok)throw Error([401,403].includes(r.status)?'access_denied':'load_failed');
  const value=await r.json();if(gen!==generation)return;data=value;
  $('date').innerHTML=value.dates.length?value.dates.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join(''):'<option value="">Noch keine SSL-Planung</option>';
  $('date').value=value.date;$('login').hidden=true;$('view').hidden=false;$('logout').hidden=false;render();status('Angemeldet als '+value.name+' · SSL-Lesezugang');
 }catch(e){if(gen!==generation)return;if(['authentication_required','access_denied'].includes(e.message)){signedOut();status('Bitte mit einem freigegebenen SSL-Gastzugang anmelden.',true);}else{$('plan').replaceChildren();status('Planung konnte nicht geladen werden. Bitte erneut aktualisieren.',true);}}
 finally{if(gen===generation){$('refresh').disabled=false;$('date').disabled=false;}}
}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,b=form.querySelector('button'),login=form.elements.username.value.trim().toLowerCase();b.disabled=true;status('Anmeldung wird geprüft …');try{if(!/^ssl-[a-f0-9]{16}$/.test(login))throw Error();const {error}=await auth.auth.signInWithPassword({email:login+'@guests.allianceos.invalid',password:form.elements.password.value});if(error)throw error;form.elements.password.value='';await load();}catch{status('Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.',true);}finally{b.disabled=false;}});
$('logout').onclick=async()=>{signedOut();await auth.auth.signOut();status('Abgemeldet.');};
$('refresh').onclick=()=>load($('date').value);$('date').onchange=()=>load($('date').value);$('legion').onchange=()=>{if(data)render();};
load();
