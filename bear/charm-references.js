/* Kingshot governor charm visual reference catalog
 * Source (third-party fan compilation): https://kingshotoptimizer.com/charms/references/
 * Twenty-two illustrated level entries (2026-10-08).
 * Images are linked, NOT redistributed or embedded.
 * Hero/gear charm screenshots remain local to the user's browser.
 *
 * A colour/glyph class is distinct from a level: infantry=green shield,
 * cavalry=cyan horse, archer=yellow bow. Level is indicated by changing
 * facet/outline shape. The guide screenshot directly confirms Lv 3–8.
 *
 * ⚠ Browser image pixel access depends on image host CORS; remote
 * files must not be silently assumed canvas-readable. Mark as unknown if
 * pixels are inaccessible or confidence falls below a validated threshold.
 */
(function(root){
'use strict';
const stats=[0,9,12,16,19,25,30,35,40,45,50,55,59,63,67,71,75,79,83,87,91,95,99];
const sources=Array.from({length:22},(_,i)=>({
 level:i+1,
 knownBonusPercent:stats[i+1],
 // Explicitly linked image references for infantry; image shape cross-check
 // with both other troop classes before enabling automated matching.
 reference:`https://kingshotoptimizer.com/images/charms-cards/infantry_lvl${i+1}.webp`
}));
root.NRW_BEAR_CHARM_REFERENCES={
 source:'https://kingshotoptimizer.com/charms/references/',
 maxLevel:22,
 typeGlyphs:{
  infantry:{color:'green',glyph:'shield'},
  cavalry:{color:'cyan',glyph:'horse'},
  archer:{color:'yellow',glyph:'bow'}
 },
 sourceImages:sources,
 totalStatPercentByLevel:stats,
 verifiedVisualLevels:[3,4,5,6,7,8],
 imagePixelAccess:'needs-cors-test',
 matcherStatus:'reference-data-only'
};
})(window);
