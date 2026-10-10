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
// Verified from the original 955x2048 screenshots, not from a browser thumbnail.
// Capture the complete horizontal label, but exclude the artwork and cooldown.
function petBadgeRect(rect){
 return {x:rect.x+rect.w*.26,y:rect.y+rect.h*.72,w:rect.w*.74,h:rect.h*.27};
}
function valoraBadgeRect(rect){
 // Level is centered on a brown badge, approx y=1814..1858 at 2048px.
 return {x:rect.x+rect.w*.17,y:rect.y+rect.h*.49,w:rect.w*.72,h:rect.h*.35};
}
// Text-only OCR window, verified against the original 955x2048 screenshot.
// Excludes the top/bottom white badge rim that confused Tesseract on Lv4/5.
function valoraTextRect(rect){
 return {x:rect.x+rect.w*.18,y:rect.y+rect.h*.54,w:rect.w*.68,h:rect.h*.19};
}
function valoraPreviewRect(rect){
 // Entire 193x250 card, including the portrait AND its rank. The old
 // 125x125 slice missed most of the card and looked empty.
 return {x:rect.x-.017,y:rect.y-.050,w:rect.w+.009,h:rect.h+.061};
}
function readSkillLevel(text,max){
 const s=String(text||'').replace(/[\r\n]+/g,' ').trim();
 // Outlined game letters can be OCRed as Lvs5, Lv?7 or Ly.9.
 // Require a recognizable "Lv" prefix: stray cooldown digits never qualify.
 const candidates=[...s.matchAll(/(?:^|[^a-z0-9])(?:level|lvl|[l1i|]\s*[vuwy])\s*[. :;=\-\/s?]*([0-9oOil|]{1,2})(?![0-9])/gi)]
  .map(m=>Number(m[1].replace(/[oO]/g,'0').replace(/[iIl|]/g,'1')))
  .filter(n=>Number.isInteger(n)&&n>=1&&n<=max);
 const unique=[...new Set(candidates)];
 return unique.length===1?unique[0]:null;
}
// Restrict the common "S" versus "5" OCR confusion to the isolated
// Valora rank label. An unlabelled digit, "MAX", or a cooldown is never valid.
// The real deu+eng OCR of the 955x2048 original often appends one digit
// from the bright badge rim: "Lv. 109", "Lv. 47", "Lv57", "Lv. 9".
// ONLY use this recovery on Valora's known isolated rank badge.
function readValoraLevel(text,max){
 const strict=readSkillLevel(text,max);
 if(strict!==null)return strict;
 const s=String(text||'').replace(/[\r\n]+/g,' ');
 const matches=[...s.matchAll(/(?:^|[^a-z0-9])(?:level|lvl|[l1i|]\s*[vuwy])\s*[.:;=\-\/ ?]*([0-9oOsiIl|]{1,3})(?![0-9])/gi)];
 if(!matches.length)return null;
 const candidates=[];
 for(const m of matches){
  const digits=m[1].replace(/[oO]/g,'0').replace(/[iIl|]/g,'1').replace(/[sS]/g,'5');
  let rank=null;
  if(digits==='10'||/^10[0-9]$/.test(digits))rank=10;
  else if(/^[1-9]$/.test(digits))rank=Number(digits);
  else if(/^[1-9][1-9]$/.test(digits))rank=Number(digits[0]);
  // Do NOT reinterpret an unrelated "Lv.80" as skill rank 8,
  // and never accept an arbitrary 3-digit code as a rank.
  if(rank!==null&&rank>=1&&rank<=max)candidates.push(rank);
 }
 const unique=[...new Set(candidates)];
 return unique.length===1?unique[0]:null;
}
function checkPet(name,rank,petCatalog){
 const record=(petCatalog||[]).find(p=>p.name===name&&p.bearSkill);
 return Boolean(record&&Number.isInteger(Number(rank))&&Number(rank)>=1&&
  Number(rank)<=record.bearSkill.values.length);
}
root.NRW_BEAR_BUFF_CORE={petSlots,valoraSkillMax,petRect,valoraRect,petBadgeRect,valoraBadgeRect,valoraTextRect,valoraPreviewRect,readSkillLevel,readValoraLevel,checkPet};
})(window);
