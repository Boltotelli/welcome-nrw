/* Field Commander (FC), Marshal (M) appointment buffs: King/High King.
 * Sources: lordrush.gg/tools/appointment-planner, Kingshot ministry display.
 * Separate appointment states; effects of identical posts from different
 * courts are NOT stacked without evidence that the game stacks them.
 * Values are not combined twice with already buffed screenshots.
 */
(function(root){
'use strict';
const FC_LETHALITY=10,MARSHAL_ATTACK=5,MARSHAL_CAPACITY=2500;
function active(model){
 const source=model?.v2?.ministers||{};
 const flags={king:{fc:false,m:false},highKing:{fc:false,m:false}};
 for(const group of ['king','highKing']){
  const entry=source[group]||{};
  flags[group]={fc:entry.fc===true,m:entry.m===true};
 }
 return flags;
}
function derived(model){
 const flags=active(model);
 const fc=flags.king.fc||flags.highKing.fc;
 const m=flags.king.m||flags.highKing.m;
 return {flags,fc,m,
  sources:[...(flags.king.fc?['King FC']:[]),
   ...(flags.highKing.fc?['High King FC']:[]),
   ...(flags.king.m?['King Marshal']:[]),
   ...(flags.highKing.m?['High King Marshal']:[])],
  lethality:fc?FC_LETHALITY:0,
  attack:m?MARSHAL_ATTACK:0,
  capacity:m&&!model?.v2?.ministerCapacityInBase?MARSHAL_CAPACITY:0,
  statCaptured:model?.v2?.ministerBuffCapturedInStats===true,
  noDoubleStack:true};
}
function applyStats(model,stats){
 const b=derived(model),result={...stats};
 if(b.statCaptured)return result;
 for(const k of ['i','c','a']){
  if(Number.isFinite(Number(stats[k+'Atk'])))result[k+'Atk']=Number(stats[k+'Atk'])+b.attack;
  if(Number.isFinite(Number(stats[k+'Let'])))result[k+'Let']=Number(stats[k+'Let'])+b.lethality;
 }
 return result;
}
root.NRW_BEAR_MINISTERS={derived,applyStats,active,
 metadata:{fieldCommanderLethality:FC_LETHALITY,marshalAttack:MARSHAL_ATTACK,
 marshalCapacity:MARSHAL_CAPACITY,assumption:'same-position-court-buffs-not-double-counted'}};
})(window);
