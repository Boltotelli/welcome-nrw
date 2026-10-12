/* Field Commander (FC), Marshal (M) appointment buffs: King/High King.
 * Sources: lordrush.gg/tools/appointment-planner, Kingshot ministry display.
 * Separate appointment states; effects of identical posts from different
 * courts are NOT stacked without evidence that the game stacks them.
 * Values are not combined twice with already buffed screenshots.
 */
(function(root){
'use strict';
const KING={fcLethality:10,marshalAttack:5,marshalCapacity:2500};
function active(model){
 const src=model?.v2?.ministers||{};
 return {king:{fc:src.king?.fc===true,m:src.king?.m===true},
  highKing:{fc:src.highKing?.fc===true,m:src.highKing?.m===true}};
}
function derived(model){
 const flags=active(model),data=model?.v2?.ministers?.highKingValues||{};
 const asVerified=(name,max)=>{
  if(data[name]===undefined||data[name]===null||data[name]==='')return null;
  const n=Number(data[name]);
  return Number.isFinite(n)&&n>=0&&n<=max?n:null;
 };
 const wantsHigh=flags.highKing.fc||flags.highKing.m;
 const high={fcLethality:asVerified('fcLethality',100),
  marshalAttack:asVerified('marshalAttack',100),
  marshalCapacity:asVerified('marshalCapacity',100000)};
 const unconfirmed=(flags.highKing.fc&&high.fcLethality===null)||
  (flags.highKing.m&&(high.marshalAttack===null||!Number.isInteger(high.marshalCapacity)));
 // Do not assume High King posts have King's ordinary numbers: reference
 // descriptions say High King appointments are stronger, but exact numbers
 // remain unverified. Ignore them until the player enters in-game values.
 const fc=flags.king.fc||flags.highKing.fc,m=flags.king.m||flags.highKing.m;
 const lethal=Math.max(flags.king.fc?KING.fcLethality:0,
  flags.highKing.fc?(high.fcLethality||0):0);
 const attack=Math.max(flags.king.m?KING.marshalAttack:0,
  flags.highKing.m?(high.marshalAttack||0):0);
 const capacity=Math.max(flags.king.m?KING.marshalCapacity:0,
  flags.highKing.m?(high.marshalCapacity||0):0);
 return {flags,fc,m,unconfirmedHighKing:unconfirmed,
  sources:[...(flags.king.fc?['King FC']:[]),...(flags.highKing.fc?['High King FC']:[]),
   ...(flags.king.m?['King Marshal']:[]),...(flags.highKing.m?['High King Marshal']:[])],
  lethality:lethal,attack,
  capacity:!model?.v2?.ministerCapacityInBase?capacity:0,
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
 metadata:{...KING,assumption:'same-position-court-buffs-not-double-counted'}};
})(window);
