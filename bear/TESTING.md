# Bear war room and recommendation evidence — 2026-10-21

## Scope and model invariants

The active Vercel `/bear/` route rewrites to `preview-v3.html`. The Pages `/bear/` entry now forwards to that same active V3 page; the legacy implementation is retained in source. V3 uses name-flow, advisor, formation, skill-effects and damage-skills, plus the shared `bear/hero-reference.js` loader. There is no `preview-v3/hero-reference.js` in the active graph.

`hero-explanations.js` presents the existing advisor groups. It never reorders them, changes their scores or writes to profiles. Each comparison uses the next scored owned candidate of the same troop class and the group's single shared model context. Relative gap is `(winner.score / alternative.score - 1) * 100`; ties are described as ties. This is an isolated recommendation-model contribution, not a complete three-hero team swap or measured Bear damage. Five percent is only a presentation threshold for small/clear model gaps and never a scoring weight.

Star-derived skill maxima, simplified level 80, illustrative class weights when stats are missing, unsupported mechanics and overlapping sensitivity intervals are disclosed. Confirmed profile inputs do not imply an official Kingshot formula. No input, profile-schema, API or database change was introduced.

SHA-256 comparisons against baseline `24ecfa9b9165f59873d878052c8aaebe19ccfbb5` confirm these files are unchanged: V3 hero-advisor, formation-core, skill-effects, damage-skills, profile-service and shared hero-reference. Existing core calculations are preserved; the community model is not an official damage formula.

## Automated checks

- All 14 `bear/preview-v3/test-*.cjs` tests pass, including minister modes, mixed troop stock, constrained allocation, seven marches, relative leaders, profile service, PIN gates, independent base stats and all translated help guides.
- The new evidence test covers 72 combinations for Zoe/Long Fei, Alcar/Zoe and Rosa/Yang: multiple stars, tiers, widgets and known/missing stats. It checks exact gaps, same-class alternatives, immutable outputs and explicit assumptions; it does not hardcode winners.
- All 41 Bear test scripts were exercised. Six older root tests also fail on the unchanged baseline: `test-github-profiles.cjs` (old cache assertion), `test-hero-reference-ui.cjs` (literal invalid newline token), `test-hero-stars.cjs` and `test-troop-entries.cjs` (legacy OCR assertions), `test-score-bonuses.cjs` and `test-wizard.cjs` (workflow only present on the publisher branch). The unrelated OCR workflow was not revived.
- Syntax checks and `git diff --check` pass. The security-help test now checks dependency order independently of the name-flow cache-version string.

## Browser verification

Headless installed Microsoft Edge, isolated local QA data, shared API mocked to prevent any test writes to real profiles:

- 1440, 810, 390 and 320 CSS pixel widths: no page-level horizontal overflow.
- DE/EN/FR/ES disclosures, model values and profile state survive language changes.
- Stored profile roundtrip after reload; star/tier and widget edits update recommendations; read-only inputs remain disabled while native explanation disclosures work.
- One starter plus six joiners, 21 hero positions, mixed T/TG stock and archer-constrained allocation render.
- Ready formation appeared in 45–88 ms in local runs; this is a local observation, not a performance guarantee.
- Original seven-second formation video plays fully without delaying results. Reduced motion skips the media entirely. Original cloud URL remains unchanged; local source availability differs from the Pages/Vercel asset route.
- No JavaScript page errors in the exercised flows. Remote portrait images were verified in the desktop capture; some lazy images in long captures are still pending.

Taste draw, lint and browser inspector were used; lint has no failures. The inspector's tiny-text failure names hidden legacy wizard elements outside the active surface. Warm parchment text and the larger requested landing headline produce style warnings. Impeccable context launcher was unavailable, so project context and craft references were read directly. Its independent finish review approved the static UI; its final source verdict marked the original-video finding resolved. Emil and mobile-native guidance informed motion, touch sizes and reduced motion. The user-pinned gaming palette overrides the dealt light-sheet material.

## Release boundary and remaining limits

Publish and verify Pages first. Vercel's existing production baseline is `22a58321273360123a707cb4941aafde1348ad73`; apply only this Bear change there so other live NRW sections are retained. Record actual resulting commit, Pages run and production state in the delivery report.

Real-phone Safari/hardware testing is still needed. Live PIN writes to other players' profiles were intentionally not used for QA. No official Kingshot mathematical verification is claimed.
