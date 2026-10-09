/* Kingshot hero star bar: five flowers, six light petals per flower.
 * All measurements are ratios of card pixels, independent of screen size.
 * Partial stars must never be upgraded to whole stars.
 */
(function(root){
'use strict';
function stepsFromRatios(ratios){
 if(!Array.isArray(ratios)||ratios.length!==5||
    ratios.some(v=>!Number.isFinite(v)||v<0||v>1))return null;
 // A recruited hero's first flower is full. Subsequent flowers can be
 // partial, so the first is the ONLY safe reference.
 const reference=ratios[0];
 if(reference<.14||reference>.56)return null;
 let full=0;
 for(const r of ratios){
  if(r/reference>=.91)full++;
  else break;
 }
 if(full===5)return 30;
 if(full===0)return null;
 const portion=ratios[full]/reference;
 const partial=portion<.13?0:Math.min(5,Math.max(1,Math.round(portion*6)));
 return full*6+partial;
}
function parts(steps){
 if(!Number.isInteger(steps)||steps<0||steps>30)return null;
 return {stars:Math.floor(steps/6),tier:steps%6,complete:steps===30};
}
root.NRW_BEAR_HERO_STARS={stepsFromRatios,parts,version:'pixel-flowers-20261010'};
})(window);
