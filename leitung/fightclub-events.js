export const SSL_EVENT='swordland_summit';
export const fightEventName=(type,language='en')=>type===SSL_EVENT?(language==='de'?'SSL · Schwertland Gipfel Liga':'SSL · Swordland Summit League'):type==='triforce'?'TriAlliance':'Swordland';
export function mergeFightPlayers(base,guests,assignments,type,date){
 const list=[...base],ids=new Set(base.filter(p=>p.active&&p.member_status!=='left').map(p=>String(p.game_id)));
 if(type===SSL_EVENT)for(const guest of guests||[]){
  const id=String(guest.game_id);if(ids.has(id))continue;
  const planned=assignments.some(a=>a.event_type===SSL_EVENT&&a.battle_date===date&&String(a.game_id)===id);
  if(!guest.active&&!planned)continue;
  const row={...guest,game_id:id,active:true,member_status:'active',is_ssl_guest:true,guest_inactive:!guest.active};const at=list.findIndex(p=>String(p.game_id)===id);if(at<0)list.push(row);else list[at]=row;ids.add(id);
 }
 return list;
}
