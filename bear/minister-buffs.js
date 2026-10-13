/* Kingshot King / High King minister buffs in one selected court.
 * Inputs in Bear V3 are ALWAYS unbuffed. Do not double count multiple courts.
 * King's bonuses and High King's bonuses are user-confirmed game values.
 */
(function(root){
'use strict';
const VALUES=Object.freeze({
 king:Object.freeze({fcLethality:10,marshalAttack:5,marshalCapacity:2500}),
 highKing:Object.freeze({fcLethality:15,marshalAttack:8,marshalCapacity:3750})
});
function normalized(source){
 const m=source||{};
 // Migrate old dual-court flags once, preferring the High King if both
 // were selected. Never stack both courts.
 const legacyHigh=m.highKing?.fc===true||m.highKing?.m===true;
 const selected=m.court==='highKing'||m.court==='king'?m.court:
   legacyHigh?'highKing':'king';
 const original=m[selected]||{};
 const oldStyle=(m.fc===undefined&&m.m===undefined);
 return {court:selected,
   fc:oldStyle?original.fc===true:m.fc===true,
   m:oldStyle?original.m===true:m.m===true};
}
function active(model){
 const m=normalized(model?.v2?.ministers);
 return {court:m.court,fc:m.fc,m:m.m};
}
function derived(model){
 const a=active(model),values=VALUES[a.court];
 return {court:a.court,fc:a.fc,m:a.m,
  flags:{king:{fc:a.court==='king'&&a.fc,m:a.court==='king'&&a.m},
   highKing:{fc:a.court==='highKing'&&a.fc,m:a.court==='highKing'&&a.m}},
  sources:[...(a.fc?[a.court+' FC']:[]),...(a.m?[a.court+' Marshal']:[])],
  lethality:a.fc?values.fcLethality:0,
  attack:a.m?values.marshalAttack:0,
  capacity:a.m?values.marshalCapacity:0,
  statCaptured:false,noDoubleStack:true,
  valueSource:'user-confirmed; input stats and capacity always unbuffed'};
}
function applyStats(model,stats){
 const b=derived(model),result={...stats};
 for(const k of ['i','c','a']){
  if(Number.isFinite(Number(stats[k+'Atk'])))result[k+'Atk']=Number(stats[k+'Atk'])+b.attack;
  if(Number.isFinite(Number(stats[k+'Let'])))result[k+'Let']=Number(stats[k+'Let'])+b.lethality;
 }
 return result;
}
root.NRW_BEAR_MINISTERS={derived,applyStats,active,normalized,
 metadata:{...VALUES,assumption:'one-court-only, all inputs unbuffed'}};
})(window);
