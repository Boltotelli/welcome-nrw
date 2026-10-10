/* Kingshot hero star flowers: five flowers with 6 petals each.
 * Absolute brightness varies with orange, purple and blue frames. Compare
 * flower fill to the same card's known-full FIRST flower instead.
 * Real Android screenshots exposed a faulty .91 full-flower threshold:
 * a truly full 4th flower can measure only ~.90 of the first one.
 */
(function(root){
'use strict';
const FULL_FLOWER_RATIO=.87; // tested against genuine 716x1536 mobile uploads
function analyze(ratios){
 if(!Array.isArray(ratios)||ratios.length!==5||
    ratios.some(v=>!Number.isFinite(v)||v<0||v>1))
  return {steps:null,confidence:0,review:true,reason:'invalid'};
 // A recruited hero's first flower is full. Locked 0/20 characters do
 // not have any lit flowers and must never turn into a hero.
 const ref=ratios[0];
 if(ref<.14||ref>.56)
  return {steps:null,confidence:0,review:true,reason:'no-reference'};
 let full=0,nearBoundary=false;
 for(const r of ratios){
  const fraction=r/ref;
  if(Math.abs(fraction-FULL_FLOWER_RATIO)<.018)nearBoundary=true;
  if(fraction>=FULL_FLOWER_RATIO)full++;
  else break;
 }
 if(full===5)return {steps:30,confidence:nearBoundary?.5:1,review:nearBoundary,reason:nearBoundary?'boundary':'complete'};
 if(full===0)return {steps:null,confidence:0,review:true,reason:'no-full-flowers'};
 const portion=ratios[full]/ref;
 const exact=portion*6;
 const partial=portion<.13?0:Math.min(5,Math.max(1,Math.round(exact)));
 // Flower fill is not linearly proportional to a precise petal count.
 // Show close rounding-boundary proposals as requiring review.
 const nearPetalBoundary=portion>=.13&&Math.abs((exact-Math.floor(exact))-.5)<.13;
 const review=nearBoundary||nearPetalBoundary;
 return {steps:full*6+partial,confidence:review?.5:1,
  review,reason:nearBoundary?'flower-boundary':nearPetalBoundary?'petal-boundary':'measured'};
}
function stepsFromRatios(ratios){return analyze(ratios).steps;}
// Reconcile overlapping cards without silently choosing a conflicting
// estimate. A manual correction always wins.
function merge(existing,incoming){
 if(!existing||!incoming||existing.starManual)return;
 const n=incoming.starSteps,o=existing.starSteps;
 if(o===null&&n!==null){
  existing.starSteps=n;
  existing.starConfidence=incoming.starConfidence;
  existing.starReview=Boolean(incoming.starReview);
  return;
 }
 if(o!==null&&n!==null&&o!==n){
  existing.starSuggestion=o;
  existing.starSteps=null;
  existing.starConfidence=0;
  existing.starReview=true;
 }
}

function parts(steps){
 if(!Number.isInteger(steps)||steps<0||steps>30)return null;
 return {stars:Math.floor(steps/6),tier:steps%6,complete:steps===30};
}
root.NRW_BEAR_HERO_STARS={stepsFromRatios,analyze,merge,parts,version:'phone-flowers-20261010-2'};
})(window);
