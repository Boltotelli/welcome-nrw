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
function readSkillLevel(text,max){
 const s=String(text||'').replace(/[Il|]/g,'1');
 const m=s.match(/(?:Lv|Lvv|L.v|Lvl|Level)\s*[.:]?\s*([0-9]{1,2})\b/i);
 if(m){const n=Number(m[1]);return n>=1&&n<=max?n:null;}
 const clean=s.trim();
 if(/^\d{1,2}$/.test(clean)){const n=Number(clean);return n>=1&&n<=max?n:null;}
 return null;
}
function checkPet(name,rank,petCatalog){
 const record=(petCatalog||[]).find(p=>p.name===name&&p.bearSkill);
 return Boolean(record&&Number.isInteger(Number(rank))&&Number(rank)>=1&&
  Number(rank)<=record.bearSkill.values.length);
}
root.NRW_BEAR_BUFF_CORE={petSlots,valoraSkillMax,petRect,valoraRect,readSkillLevel,checkPet};
})(window);
