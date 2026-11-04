const words={de:{button:'Stärke & Mystic Trial per API aktualisieren',loading:'Spieler wird abgerufen …',done:'API-Werte aktualisiert.',failed:'Abruf fehlgeschlagen. Vorhandene Werte bleiben erhalten.',limit:'API-Limit erreicht. Bitte später erneut versuchen.'},en:{button:'Refresh power & Mystic Trial from API',loading:'Fetching player …',done:'API values updated.',failed:'Refresh failed. Existing values remain unchanged.',limit:'API limit reached. Please try later.'},fr:{button:'Actualiser puissance et Mystic Trial',loading:'Recherche du joueur …',done:'Valeurs API actualisées.',failed:'Échec. Les valeurs existantes sont conservées.',limit:'Limite API atteinte. Réessayez plus tard.'},es:{button:'Actualizar poder y Mystic Trial',loading:'Consultando jugador …',done:'Valores API actualizados.',failed:'Error. Se conservan los valores anteriores.',limit:'Límite API alcanzado. Inténtalo más tarde.'}};
export const memberApiLabels=lang=>words[lang]||words.de;
export function activateMemberApiRefresh({root,gameId,getLanguage,request,onValues}){
 const button=root.querySelector('[data-member-api-refresh]'),status=root.querySelector('[data-member-api-status]');
 if(!button||!status)return;
 const t=()=>memberApiLabels(getLanguage());
 button.addEventListener('click',async()=>{
  if(button.disabled)return;button.disabled=true;status.textContent=t().loading;
  const current=()=>root.open&&root.dataset.memberGameId===String(gameId)&&button.isConnected;
  try{
   const r=await request('bootstrap',{action:'power_sync',include_listed:true,game_id:String(gameId)});
   if(!current())return;
   if(!r?.ok||r.failed?.length||!r.player||String(r.player.game_id)!==String(gameId)){status.textContent=r?.rate_limited?t().limit:t().failed;return;}
   onValues(r.player);status.textContent=t().done;
  }catch(e){if(current())status.textContent=String(e.message).includes('rate_limit')?t().limit:t().failed;}
  finally{if(button.isConnected)button.disabled=false;}
 });
}
