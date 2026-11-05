export const isSslLogin=value=>/^ssl-[a-f0-9]{16}$/.test(String(value||''));
export function selectedLogin(value){
 const id=String(value||'');
 if(/^manual-[a-f0-9]{24}$/.test(id))return {guest:false,email:id+'@accounts.allianceos.invalid'};
 if(isSslLogin(id))return {guest:true,email:id+'@guests.allianceos.invalid'};
 if(/^[0-9]{5,20}$/.test(id))return {guest:false,email:'leader-'+id+'@accounts.allianceos.invalid'};
 return {guest:false,email:''};
}
export function identityOptions(data,esc,placeholder){
 const leaders=(Array.isArray(data.leaders)?data.leaders:[]).filter(x=>/^[0-9]{5,20}$/.test(String(x.game_id)));
 const guests=(Array.isArray(data.guests)?data.guests:[]).filter(x=>isSslLogin(x.login_name));
 return '<option value="">'+esc(placeholder)+'</option>'+leaders.map(x=>'<option value="'+esc(x.game_id)+'">'+esc(x.name)+'</option>').join('')+(data.manual||[]).filter(x=>/^manual-[a-f0-9]{24}$/.test(x.login_name)).map(x=>'<option value="'+esc(x.login_name)+'">'+esc(x.name)+'</option>').join('')+(guests.length?'<optgroup label="SSL · nur lesen">'+guests.map(x=>'<option value="'+esc(x.login_name)+'">'+esc(x.name)+' · SSL</option>').join('')+'</optgroup>':'');
}
