/* Kingshot Buff skill screenshot coordinates are normalized to a 955x2048
 * reference (only after user-selected screenshot type, never guessed).
 * Skill Lv. labels are NOT overall pet levels; Valora Lv.8 below the
 * character is Hunter Instinct, not the Lv.80 affinity/relationship track.
 */
(function(root){
'use strict';
const petSlots=[
 {name:'Moose',column:0,row:1,max:7},
 {name:'Giant Rhino',column:3,row:1,max:10},
 {name:'Mighty Bison',column:0,row:2,max:10},
 {name:'Great Moose',column:1,row:2,max:10},
 {name:'Black Panther',column:2,row:2,max:10}
];
const valoraSkillMax=[10,5,5,10];
function petRect(slot){
 return {x:.090+slot.column*.203,y:.254+slot.row*.091,w:.184,h:.087};
}
function valoraRect(i){
 return {x:.048+i*.235,y:.856,w:.193,h:.061};
}
// Level text is at the LOWER RIGHT of a pet skill icon, not in the
// artwork, cooldown mark or the pet training-level UI.
function petBadgeRect(rect){
 return {x:rect.x+rect.w*.42,y:rect.y+rect.h*.60,w:rect.w*.58,h:rect.h*.40};
}
function readSkillLevel(text,max){
 const s=String(text||'').replace(/[\r\n]+/g,' ').trim();
 const candidates=[...s.matchAll(/(?:^|[^a-z0-9])(?:level|lvl|l\s*[vuwy]|[1i|]\s*v)\s*[. :;=\-]*([0-9oOil|]{1,2})(?![0-9])/gi)]
  .map(m=>Number(m[1].replace(/[oO]/g,'0').replace(/[iIl|]/g,'1')))
  .filter(n=>Number.isInteger(n));
 // Do not accept contradictory OCR readings or timestamps/cooldowns.
 if(candidates.length){
  const unique=[...new Set(candidates)];
  return unique.length===1&&unique[0]>=1&&unique[0]<=max?unique[0]:null;
 }
 // A number alone is only valid when OCR was limited to the level badge.
 if(/^[0-9]{1,2}$/.test(s)){
  const n=Number(s);return n>=1&&n<=max?n:null;
 }
 return null;
}
function checkPet(name,rank,petCatalog){
 const record=(petCatalog||[]).find(p=>p.name===name&&p.bearSkill);
 return Boolean(record&&Number.isInteger(Number(rank))&&Number(rank)>=1&&
  Number(rank)<=record.bearSkill.values.length);
}
root.NRW_BEAR_BUFF_CORE={petSlots,valoraSkillMax,petRect,valoraRect,petBadgeRect,readSkillLevel,checkPet};
})(window);
