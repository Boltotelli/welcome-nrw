/* Shape-only Governor Charm level matcher.
 * The centrally drawn troop-class glyph is NOT the level. All classes share
 * an outer contour at each level. Reference masks are from two player-owned
 * Kingshot Talisman Guide screenshots with explicit Lv1..11 labels.
 * Unknown or unseen shapes never receive a confirmed level.
 */
(function(root){
'use strict';
const reference=root.NRW_BEAR_GUIDE_SILHOUETTES;
function unpack(code){
 if(typeof code!=='string'||code.length!==96)return null;
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
 const bytes=[];
 for(let j=0;j<code.length;j+=4){
  const a=alphabet.indexOf(code[j]),b=alphabet.indexOf(code[j+1]);
  const c=alphabet.indexOf(code[j+2]),d=alphabet.indexOf(code[j+3]);
  if(Math.min(a,b,c,d)<0)return null;
  const value=(a<<18)|(b<<12)|(c<<6)|d;
  bytes.push((value>>16)&255,(value>>8)&255,value&255);
 }
 if(bytes.length!==72)return null;
 const mask=new Uint8Array(576);
 for(let i=0;i<576;i++)mask[i]=(bytes[i>>3]>>(7-(i&7)))&1;
 return mask;
}
const templates=reference&&reference.size===24?
 Object.entries(reference.levels||{}).map(([level,code])=>({
  level:Number(level),bits:unpack(code)
 })).filter(x=>Number.isInteger(x.level)&&x.level>=1&&x.level<=11&&x.bits):[];
function recognize(input){
 if(!input?.bits||input.bits.length!==576||templates.length!==11)
  return {level:null,guess:null,confidence:'unknown',score:1,margin:0};
 const scores=templates.map(t=>{
  let diff=0;for(let i=0;i<576;i++)diff+=Number(input.bits[i]!==t.bits[i]);
  return {level:t.level,score:diff/576};
 }).sort((a,b)=>a.score-b.score);
 const first=scores[0],second=scores[1],margin=second.score-first.score;
 // Thresholds were validated on 18 independent real gear charm crops and
 // cross-checked against guide images of the other two troop classes.
 const confident=first.score<=.14&&margin>=.05;
 return {level:confident?first.level:null,guess:first.level,
  confidence:confident?'suggested':'unknown',score:first.score,margin,
  source:'in-game-guide-1-11'};
}
root.NRW_BEAR_CHARM_MATCHER={recognize,templates,unpack,version:'verified-guide-lv1-11'};
})(window);
