# NRW Bear Optimizer — isolated development prototype

Branch: feature/bear-optimizer-nrw-prototype
Route: /bear/
Endpoint: /api/bear-profile?id={governor_id}

## Access / separation
- Public page, no login. A Governor ID is not proof of identity.
- Only IDs with current kingdom 1044 and exact alliance ID 105300097 are accepted by the API route.
- MightPulse records can be up to one hour old; clan changes are not instantaneous.
- Profile responses are minimized and exclude location, last login, online status and raw provider data.
- Manual troops, buffs, offensive stats and formations stay in browser localStorage per Governor ID; no shared writes.
- NAP app and Supabase are never called. No existing KingshotStats route is edited.
- A NEW, private BEAR_MIGHTPULSE_API_KEY must be configured in Vercel before the live profile lookup can work. Never reuse the key exposed in chat.
- Add persistent rate limiting before public release to protect the API quota.

## Prototype features
- One leader march plus six join marches, independently editable.
- Shared troop inventory enforced. Starter has priority; join marches shrink evenly if a required troop type is scarce.
- Presets 1/12/87, 1/10/89, 5/5/90, 10/10/80, 2.5/15/82.5, plus sliders and quick copy to six joins.
- Only arena defense heroes (up to five) are returned by MightPulse. Players may manually enter other heroes.
- Offensive comparison is an UNVALIDATED heuristic using sqrt(troop quantity) and manual attack/lethality weights; it does NOT predict true Kingshot Bear damage.
- DE/EN/FR and light/dark preferences reuse nrw_page_lang and nrw_theme.

## Test checklist before merge
1. Set new preview-only secret BEAR_MIGHTPULSE_API_KEY without disclosing it.
2. Check Governor ID 152394512 loads and API returns only minimized NRW data.
3. Confirm non-NRW account IDs return HTTP 403 without profile information.
4. Confirm invalid IDs return 400, missing secret returns 503, and no key is exposed.
5. Test language/theme, mobile UI, personal data persistence across reloads.
6. Test formations with known inventory: 5/5/90 should shrink joins if archers are scarce; 10/10/80 should fit fully for the known example.
7. Compare model with real combat reports before publishing an optimization claim.

## Deferred
Do not edit the existing live dashboard navigation until the user approves the game page. Do not merge this branch into main automatically.

## GitHub Pages preview (October 8, 2026)

- Frontend is developed and deployed ONLY through GitHub Actions on branch `feature/bear-optimizer-nrw-prototype`.
- Pages test URL: https://boltotelli.github.io/welcome-nrw/
- Pages artifact contains only the Bear Optimizer HTML and NRW banner image, not the entire Welcome site.
- Vercel preview deployments are disabled on `welcome-nrw` to preserve deployment quota. Production remains linked to `main` and was not changed for this prototype.
- GitHub Pages cannot host a secure API key or run Vercel serverless functions. Automatic profile lookup on the Pages preview intentionally displays an explanatory message. For UI testing use Offline mode, upload a MightPulse JSON export or paste the raw JSON response into the browser. No keys are stored or copied into the static page.
- Manual locally saved inputs: all three troop totals, march cap, Valora + Bison capacity boosts, offensive attack/lethality values, pet levels/buffs, Valora skill levels, affinity, gear/charm notes, missing starter heroes, six join hero names and per-join leader offensive stats.
- Damage modeling is disabled until own and all six rallyleader offensive values are present. There is NO universal claim that 5/15/80 wins: model depends on leader focus. More archer-heavy joins can require smaller marches because of shared archer inventory.
- Future production API work requires a NEW private provider key set server-side, anti-abuse/rate limiting, and separate security approval. The previously chat-exposed BEAR_OPTIMIZER key must be revoked. Never use the existing NAP key.

## Interactive art-based setup update (October 8, 2026)

- **Variable march capacity:** Joiner count is selectable 0–6; the user's own starter rally is separate, so the total is 1–7. The shared-allocation and comparison calculations iterate over only the enabled marches. Legacy six-join presets do not grant extra marches.
- **Troop inventory stays manual:** MightPulse does NOT supply infantry/cavalry/archer counts or unbuffed march capacity. The app neither invents nor pre-fills them.
- **Visual hero catalogue:** 37 hero portraits are linked from the Kingshot wiki, with direct selection, stars, tier, widget and three actual expedition-skill levels. Four stars permit **a skill maximum of five**; this does not assert all skills have been upgraded. Arena-defense API data (at most five heroes) is merged with locally added heroes. Selected first join hero and starter's three heroes are stored per profile.
- **Pets:** 14 official wiki portraits, individually editable levels, active toggle and optional manually recorded buff effect/amount. Pet effects are *not* added automatically on top of total battle stats.
- **Valora:** Four actual named skills and icons from the Kingshot.net database: Dance of the Hunt, Leader by Example, Weapon Obsession, Savage Advantage; also the Hunter Instinct talent. A deliberate button can set the march-bonus field to 3,000 × Savage Advantage level, not automatically add to existing stats. Dance of the Hunt affects rally capacity rather than personal march capacity.
- **GovGear and Charms:** Six visually grouped slots, individual rarity/tiers/stars, plus 18 charm levels; none pre-filled as owned gear. Uses a general Governor Gear image and troop/slot symbols until suitable slot-specific icons are vetted. Stats stay descriptive until they can be computed without double counting.
- **Remote images:** Original character and pet URLs belong to their upstream sites (Kingshot official wiki, Kingshot.net). They are not copied into the repository; images require internet connectivity and can be temporarily unavailable if the image host changes.
- **Files:** `bear/catalog.js`, `bear/v2.js`, `bear/v2.css`, extended `bear/index.html`. GitHub Pages workflow copies all frontend assets.
- **Security:** No Keys embedded in static pages. The Github Pages preview is intentionally offline/JSON-import capable. It is NOT authenticated authorization; NRW membership for production must be validated server-side through the separate protected backend.
- **Simulation:** Troop constraints can be used without all stats. Damage indices remain unavailable until own and each leader's six attack/lethality values are known, and even then they are unvalidated relative heuristics, never exact Bear points.

## Hero/Pet usability revision (2026-10-08)

- User feedback: two nested hero panels were too cumbersome. Now the imported Arena heroes and manually added hero cards share one compact roster. Tap a card to edit; add heroes with a searchable image gallery. The editor stays closed until selected.
- Hero advancement uses a **single 0–30 star-step** progression: 24 = 4★; 25–29 = 4★ T1–T5; 30 = 5★ MAX. No tiers beyond five stars. Existing `stars` and `tier` storage remains readable. At 4★ the UI explicitly shows possible skill cap Lv. 5, but it never guesses a hero's actually upgraded skills.
- Only **five relevant active bear pets** appear: Mighty Bison (squad/march size), Giant Rhino (attack), Alpha Black Panther (lethality), Great Moose (starter rally capacity), Ironclad War Bear (enemy-defense debuff, boss effectiveness unverified). Old Wolf, Lion, Cheetah, gathering Bison, etc. are hidden; passive stat refinements are not inferred here.
- Pet display value is derived from level via the documented skill rank milestones (Lv. 10 / 20 / ... / 100), not MightPulse API. Ranks below level 10 are conservatively left unverified. Source arrays:
  - Mighty Bison: +1500 to +15000 squad capacity (10 ranks)
  - Giant Rhino: +2.5% to +10% troop attack (10 ranks)
  - Alpha Black Panther: +2.5% to +10% lethality (10 ranks)
  - Great Moose: +60000 to +150000 rally capacity (10 ranks, starter rally only)
  - War Bear: 2.5–10% enemy defense down (10 ranks; boss interaction not guaranteed)
- Skill tables cross-checked against Kingshot Portal and Kingshot Guide references (e.g. https://kingshot.gg/database/pets/mighty-bison, https://kingshot.gg/database/pets/giant-rhino, https://kingshot.gg/database/pets/alpha-black-panther, https://kingshotguide.org/data-center/kingshot-pets-database/great-moose, https://kingshotguide.org/data-center/kingshot-pets-database/ironclad-war-bear). Level-50 means rank 5, level-80 rank 8. Derived effects are never silently added to already entered battle stats. The Bison has an explicit Apply button to fill the separate march-bonus input only when its active toggle is on.
- Per-profile browser storage remains intact for hero cards, troop inventory, pets and Valora. New image gallery uses original remote game art.
- All changes remain GitHub Pages preview only; no main merge, no NAP/Supabase changes, no Vercel deploy.

## Computation workstream — 2026-10-08 (GitHub Pages test branch only)

- New `bear/combat.js`: **community-sourced attack table** for T1–T11 × TG0–TG8 for infantry/cavalry/archer (297 tier/Truegold attack cells), all troop basic lethality values fixed at 10 in the source. Source: https://strategicnoodle.com/kingshot/database/troops . Not an official game API.
- Provisional relative battle estimate approximates `sqrt(own troop count * 5000 bear troops) × per-troop attack × (base lethality × offensive lethality multiplier) / bear defense × 10 rounds`; archer bonus vs infantry bear 10%; trap level 0–5 adds 0–25 percentage points to class attack. Cross-check against https://kingshotguides.com/guide/bear-trap-damage-mechanics-and-example-simulation/ (T6 6000 each, trap5: ~16,796.46 vs published ~16,797 after ceiling). **This is not yet a verified complete model**.
- Troop inputs now include **one T1–T11/TG0–TG8 pair per troop class**. If a march sends mixed tiers, the model is not yet sufficient: do not advertise result as exact. Tier selects start **unknown**, no tier is guessed.
- Governor's class attack/lethality percentages are required for own estimates. For joins the six class percentages of *each external rally leader* are required; no own stats are substituted. If missing, only the starter score is displayed, explicitly labeled. Squad attack/lethality may be captured separately and must be affirmatively marked as *not already in the class values* before addition, preventing double counting by default.
- Hero cards now store level and four hero gear slots (quality, enhancement, refinement) in addition to stars, tier, expedition skill levels and widgets. API fields, when supplied, are loaded for the five arena heroes; manually added heroes editable. **No fantasy numeric gear/hero buffs:** their actual total offensive effects should be captured from in-game battle report percentages while full skill, widget and proc formulas remain unverified. These are currently **tracked, not fully simulated**.
- Correct troop-class-specific starter hero selectors using 37 named hero mappings from https://ksformations.com/ and https://kingshot.net/heroes . Archer heroes cannot appear in infantry or cavalry slots. Existing invalid selections are reset rather than silently retained.
- Capacity: user enters **base march cap without heroes**. If three *selected* own rally heroes are explicitly Lv80, derived hero bonus is +13,470 each = **+40,410**. An optional manual hero capacity value **overrides** the auto calculation, not adds to it, to avoid duplication. Lower-level cap bonuses are not invented. Reference https://www.kingshotapp.com/guides/kingshot-beginners-bootcamp-guide . Starter and joins currently share a common per-march cap for allocation: independent join support-hero capacity requires further work.
- Three visible connected sliders (infantry/cavalry/archer). The new **Calculate best starter formation** button exhaustively enumerates **5,151 integer ratios** (I + C + A = 100%) using the actual troop stock + pre-reservation of starter before joins, current offensive stats and troop base values. It applies the best available starter ratio under the **provisional** model and displays top distinct alternatives. It does *not* automatically claim exact Kingshot Bear points.
- Pets distinction: **Moose** (Generation 2, Horror Stare) reduces enemy health 1.5–5% across seven ranks; **Great Moose** (Generation 5, Antler Impact) raises starter rally capacity 60k–150k across ten ranks. They are separate pets! Sources: https://kingshotdata.com/pets/moose/ and https://kingshotdata.com/pets/great-moose/ . Pet buffs not automatically counted twice in combat stats; boss interaction of enemy debuffs remains unverified.
- Added trap level, three-slider thumbs, responsive troop-tier, hero-gear and optimizer panels.
- Pages workflow **copies `combat.js`** and runs syntax checks and `node bear/test-combat.cjs` before publishing. No main merge, no NAP/Supabase modifications and no Vercel deploy.

### Remaining blockers before claiming true optimal formation

1. Verify the actual Kingshot implementation for expedition skill priorities/stacks, class-specific hero gear/refine stats, exclusive widget skills and chance/proc distributions. A hero's presence/level/gear **does not yet yield all battle effects automatically**. Do not present generated ratio as universally optimal.
2. Support multiple troop tiers inside each class, independent march capacity per join, detailed joiner-first-skill eligibility and hero skill attribution. Add defensible pet/Valora activation effects only when clearly separate from combat report stats.
3. Compare at least two real Bear reports per distinct ratio for the same captain, classes and stat snapshot. Calibrate numerical estimates before claiming raw damage accuracy.

## Quick-start UX revision — 2026-10-08

- In response to usability feedback, the first visible profile workspace is a **three-step quick setup**: (1) troop amount + T/TG tier in one row per class; (2) base march capacity, number of joins and three troop-type-filtered starter heroes; (3) six class-specific attack/lethality percentages. The provisional starter optimization action and its 5,151-ratio results also appear directly below these steps.
- Existing DOM **input nodes** are moved rather than recreated. Their event listeners, model references and `localStorage` persistence remain unchanged. Older saved data remains readable.
- The detailed hero portraits/skills/gear editor, pets, Valora, governor gear, extra bonus fields and individual march editor are grouped under **one collapsed advanced disclosure**. The starter-hero selectors and optimize button stay visible even when an individual join is selected.
- The top status distinguishes incomplete required model inputs from ready-to-estimate. Neither missing offensive percentages nor troop-tier values are silently invented. Outputs remain explicitly labeled **unvalidated provisional model recommendations**, not real Kingshot damage points.
- Files: new `bear/ux.js`, `bear/ux.css`, indexed after existing `v2.js`/CSS. The GitHub Pages test workflow publishes them and syntax-checks `ux.js`. No production merge, Supabase, NAP or Vercel deploy.


## Screenshot import decision — single governor gear overview (2026-10-08)

- User-provided Kingshot **Gouverneur-Ausrüstung** screenshot simultaneously shows all SIX governor equipment items and all EIGHTEEN charm badges (three per item). Therefore **do not request separate screenshots for governor gear and charms as default**: one screenshot is enough for the gear/charm overview.
- Important correction: **charm colour AND glyph/shape change on progression**. A one-shot importer should crop the 18 icon locations and match each icon against a curated per-level icon template library; numeric OCR alone will miss those levels. A badge can differ from its neighbour on the same gear piece, so resolve each charm separately.
- Also detect gear class/slot, rarity background, T-tier text and visible star count for all six pieces. Do not interpret the top-level selected item’s *upgrade preview* as the player's currently equipped bonus; current-vs-next arrows show different values.
- **Required before exact auto-import:** map each distinct in-game charm graphic to its actual charm level 1–22, using verified Kingshot icon assets or annotated known-level screenshots. Colour alone does not guarantee unique level and arbitrary thresholds are not acceptable. When confidence is low or templates incomplete, show an editable suggestion or “unknown” instead of inventing a number.
- Workflow: select ONE screenshot → crop/locate gear and 18 charms → image-template recognition, numeric OCR only where appropriate → preview all 24 fields in a six-card grid → user confirms → update existing `v2.gear` entries in localStorage. No screenshot upload to a server by default; browser-side import preferred.
- This is a **product specification, not an implemented importer yet**. Retain existing manual inputs until the matcher is tested against multiple source screenshots/resolutions.

## Full governor talisman shape reference FOUND (2026-10-08)

- Primary reference: **https://kingshotoptimizer.com/charms/references/** — complete illustrated Governor Charm progression **Lv1–Lv22**, with visual icon per level. Confirmed direct examples:
  - Lv1: https://kingshotoptimizer.com/images/charms-cards/infantry_lvl1.webp
  - Lv3: https://kingshotoptimizer.com/images/charms-cards/infantry_lvl3.webp
  - Lv4: https://kingshotoptimizer.com/images/charms-cards/infantry_lvl4.webp
  - Lv8: https://kingshotoptimizer.com/images/charms-cards/infantry_lvl8.webp
  - Lv15: https://kingshotoptimizer.com/images/charms-cards/infantry_lvl15.webp
  - Lv22: https://kingshotoptimizer.com/images/charms-cards/infantry_lvl22.webp
- Reference companion data file: `bear/charm-references.js` lists levels 1–22, linked **infantry icon references** and verified published stat totals (not image files). Third-party art is linked rather than copied. The reference dataset is groundwork; **no automatic screenshot importer has been implemented yet**.
- User's *in-game Talismanleitfaden* screenshot confirms six labelled examples Lv3–Lv8, with **all three glyph colours** visible on each row; they visually agree with the reference image geometry: Lv3 diamond/octagon, Lv4 square, Lv5 triangle, Lv6 pentagon, Lv7 shield, Lv8 teardrop. The **green shield / cyan horse / yellow bow** represents unit class, not a level code. Different stages also have different geometry/trim.
- Important reliability limit: online databases list current max **22** (Kingshot Optimizer, Kingshot Guide), while one KingshotData article dated Sep 2026 still lists **21**. Treat the 22-image ladder as source reference, but avoid silently coercing any unreadable image to a level. Use confirmed icon shape, class, and per-icon confidence.
- Before enabling automatic screenshot-to-level processing: validate image loading/CORS for local browser canvas, reference illustrations vs actual small HUD icons, screenshot coordinates at multiple phone aspect ratios, and false-positive handling. Fallback to an icon-matching visual picker with 22 levels rather than forcing 18 numeric inputs when CORS matching fails. Preserve all user data locally.

## Browser-only screenshot importer (2026-10-09 test iteration)

- **UI:** A single `image/*` file picker under the Bear quick setup accepts the user's complete **Governor Equipment** screen and shows six grouped gear items with 18 charm crops. Each charm has an auto-proposed Lv. 1–22 (if confidently recognized) and a drop-down correction/skip. Rarity/color of six gear frames is suggested where visually distinctive. Some gear-star counts are cautiously suggested from isolated gold stars; crowded artwork remains **unknown**. T-tier remains manual review because the tiny T-labels are not reliably distinguishable yet.
- **Privacy:** `URL.createObjectURL` loads screenshot into an ephemeral local canvas; source image bytes are **never posted, saved or shipped**. Cropped previews exist only in runtime memory. Clicking **Apply reviewed values** writes only explicitly selected/recognized values to the existing per-Governor local `v2.gear` fields. Unknown/skipped values remain unchanged. New imports do not touch NAP, Supabase, the player's Kingshot account, or any API key.
- **Cropping:** Six equipment and 18 charm centers are in `bear/screenshot-importer.js`, calibrated to the *716×1536* Governor Equipment full-screen screenshot supplied in the user conversation. Scale is relative to screenshot width/height. Different HUD skins/layouts, an open pop-up, cropped screenshots, or changed screen coordinate systems require additional template calibration; do not claim they are universally supported.
- **Matcher:** Group icons by gear troop class (infantry=green shield, cavalry=blue horse, archers=yellow bow). Use hue-filtering, largest connected colored blob, padded 24×24 binary silhouette comparison and strict best/second-best confidence gating. If confidence is too low, show **unknown** and request confirmation rather than guessing. Every icon is independently reviewed.
- **Templates:** `bear/charm-shapes.js` contains **18 packed per-troop silhouettes** for Lv3–8, extracted mathematically from the user's *in-game Talismanleitfaden* screenshot (no full screenshot/photo stored). This fallback works offline and without CORS. `bear/build-charm-shapes.py` is a best-effort GitHub Pages build step fetching the public source illustrations at `https://kingshotoptimizer.com/charms/references/` and producing only 24×24 silhouette signatures in `_site/charm-signatures.json` for Lv1–22; no third-party artwork is copied. If the reference host blocks the build, `screenshot-importer.js` can attempt browser CORS for an external sample; on blocked CORS it stays with local Lv3–8.
- **Limits:** A reference silhouette match does not alone prove numeric charm level when neighboring levels have very similar shapes; all recommendations are reviewable. Actual screenshot detection is **experimental**, not yet validated against a diverse sample of phone resolutions/skins. Exact GovGear enhancement bonus, full title and star counts are not inferred when not verified. **Do not add inferred gear/charm stats to the already entered battle report percentages**, which would double-count them.
- **Files added:** `charm-shapes.js`, `screenshot-importer.js`, `screenshot-importer.css`, `test-screenshot.cjs`, `build-charm-shapes.py` with updated Pages workflow and `v2.js` render refresh. No production merge or Vercel deployment.

## GovGear T1 badge recognition — 2026-10-09

- The user noted the screenshot importer never recognized the **T1** label; this was expected because automatic equipment **T-tier** detection had not yet been implemented. It is now supported for confidently matching **T1** labels.
- `bear/tier-recognizer.js` uses a tiny 20×17 mask of the **actual yellow T1 text** extracted from a user-provided Governor Equipment screenshot. It scans a normalized 42×29 crop of the upper-left edge of each of six equipment items and uses a conservative Dice score threshold (≥0.83). It **does not infer T-stages from rarity/background colour** and does not mislabel a gear piece with no T1 badge.
- The importer preselects T1 only for positive matches and shows its confidence next to the gear-tier dropdown. Unknown badges (including unverified T2–T6 and a blank/gold base piece) remain **unselected** pending manual review, never forced to T1.
- Regression test `node bear/test-tier.cjs` uses *binary masks* cropped from the user's original 716×1536 image (not the image itself). Expected: **5 gear positions matched T1, 1 position (gold ring, no T1) unknown**. The corresponding local calibration produced Dice similarity: helmet 0.952; necklace 1.000; coat 0.939; pants 0.962; ring 0.578 (unknown); staff 0.948. Tested under GitHub Actions in the Pages workflow.
- Remaining work: gather true source screenshots/templates of later governor tiers (T2+) and phone HUD variants before enabling their auto-recognition. Never guess these higher levels from a single T1 sample.


## Streamlined screenshot-first Bear workflow (2026-10-09)

Requested workflow: **select Governor ID → protected MightPulse API read → upload several screenshots → review only missing/uncertain items → get Top 3 ratios and model damage**. The GitHub Pages frontend work is on branch `feature/bear-optimizer-nrw-prototype` only; no NAP, Supabase, Vercel deploy or main merge.

- New `intake-core.js` contains local, independently testable OCR-text parsers. `intake-ui.js`/CSS implement a mobile-first **multi-file** picker (up to 12 screenshots per batch). Tesseract.js language/worker assets are fetched on-demand from a public CDN, but screenshot pixels are analyzed **within the browser**, not transmitted to a remote OCR API. A dialog previews extracted values; **Apply** is required for localStorage changes. There is no silent replacement of missing fields with zero.
- **Troops:** a screenshot of Schwadronvorschau can yield infantry, cavalry and archer totals. Position-aware recognition is used for two columns on the same row, with OCR text fallback. Troop T/TG badges are not confidently inferred from the supplied sample and remain editable in the manual details.
- **Stats:** multiple screenshots of the scrolling Bonusübersicht can be selected together. Recognizes the three class-specific attack/lethality pairs plus Squad Attack/Lethality. The squad row is recorded separately; it is **not silently added again** to class stats. The images show 274.8% squad atk, 60.1% squad lethality; 181.5%/276.5% inf, 169.2%/250.7% cav, 244.3%/314.0% arch. OCR must confirm, not hardcode these values.
- **Starter detail screens:** Yang/Petra/Zoe screenshots reveal hero name (top) and Expedition stats (popup). Name is matched to catalog. The screenshots' *S6* and *S3* badges are **hero generation, not star level**. The hero's separately displayed Expedition offensive stats are retained on the profile for reference and **are not automatically added to already entered global battle stats**, avoiding equipment double counting. When each screenshot is reviewed, the matching class starter slot is populated if not already chosen.
- **Hero overview:** a Kingshot four-column screenshot is split into character cards. Level is read from OCR words in the corresponding card rectangle. Five star flower icons are analyzed locally using light/dark contrast against each card to propose a 1–5-star *lower-bound*; small progress tiers (e.g. 4★ T4) require confirmation. Character names are **not written on cards**, so there is an image-based picker to match only relevant portraits instead of inventing identity. When stars are confirmed, the three Expedition skill levels default to the maximum allowed by stars **as an explicit assumption** (`skillsAssumedMax: true`), not as a verified upgrade. Existing actual skill levels from an API profile are not overwritten.
- **GovGear:** when a single mixed upload batch contains a Governor Equipment screenshot, it is handed to the existing specialized 6-gear/18-charm visual review. Both stages remain independently confirmed before committing.
- **Hero advice:** qualitative Gen6 Bear Rally Heroes guidance based on the Kingshot Atlas page `https://ks-atlas.com/tools/atlas-database/bear-rally-heroes`, with source cross-checks: `https://www.reddit.com/r/KingShot/comments/1tq3ixm/` (Atlas author) and `https://kingshotworld.com/guides/bear-hunt-expert-guide/`. Upgraded Yang can replace a *different archer*, e.g. Rosa, **never** Petra, who is cavalry. The advice filters to the same troop class and records that widget/star investment may reverse qualitative rankings. This qualitative hero ranking is **not part of the numeric damage model** yet.
- **Top 3:** the existing starter optimizer searches 5,151 integer formations with troop inventory and tier combat stats; now shows **three spaced alternatives**, each with its **provisional** raw battle model figure. They are not guaranteed Kingshot damage points because exact hero skill proc/stacking and widgets remain unimplemented. Do not falsely call them statistically proven optimal or claim that the image import itself reconstructs exact gear/skill values.
- **Simplified UI:** the profile form remains first, then screenshot wizard, completeness indicator, hero suggestion and Calculate button. Old manual controls are inside one collapsed **Missing values / settings** section. The large decorative header is hidden on mobile. A local ID selector lets users reopen existing saved profiles. This **does not bypass** NRW membership validation, which still needs a secure API backend.
- **Pages limitation:** GitHub Pages cannot store a MightPulse API secret. In this test environment the *live ID → provider API* step remains unavailable; selecting a saved ID opens a **locally cached, unverified** profile, or the user may import their NRW MightPulse JSON. To enable actual live lookup, the previously isolated server-side `api/bear-profile.js` proxy needs a separate security-approved deployment with a new secret, authentication/rate limiting and CORS decision. Never expose provider credentials in static GitHub Pages assets.

### Verification
- `node bear/test-intake.cjs` checks the user's troop figures, **two complementary stats screenshots**, level 80 Yang details, numerical locale parsing, skill-max assumptions and a class-safe Yang-vs-Rosa hero suggestion.
- Workflow `.github/workflows/bear-pages.yml` syntax-checks `intake-core.js` and `intake-ui.js`, validates those fixtures, and publishes the assets only to the isolated Pages preview.
- This is **new browser functionality requiring practical Android testing**: OCR quality varies with layout, screenshot compression, network access to the OCR library, and star/icon contrast. Low-confidence matches must remain editable; DO NOT mark the import production-ready solely because CI passes.


## 2026-10-09 – GovGear alignment + Troop T/TG screenshot regression fix

User test showed the original GovGear importer selecting chunks of items rather than their charm icons and troop screenshots not populating the tier fields.

- **GovGear localization** is now dynamic (`gear-layout.js`). The full input image is resized in memory to a width-normalized canvas; five purple equipment card frames are located by connected-component segmentation. The orange sixth gear item (ring) is positioned using the other column's grid, preserving global horizontal translation. Three talisman crops are derived from the **detected bottom edge of each card**, not from the old absolute 716×1536 screenshot y values. Crops are transformed back to native pixels using the *same width-derived scale on both axes*. `tier-recognizer.js` now shares that coordinate convention.
- Safety: when the screenshot does not yield a plausible 3×2 gear grid, the importer **does not apply old fixed-coordinate crops**; it shows a layout-unrecognized message instead. Still needs verification on the player's own Android screenshot.
- **Truppen level import** (`troop-badges.js`) distinguishes the **base T10 (roman X)** on the screenshot's *Spitzen* troop labels from the separate little golden Truegold badge numbers. Carefully matched number-image samples **TG6/TG5/TG6** from the user's troop screenshot serve as visual templates. Only known TG5 and TG6 are matched automatically. Any other or low-confidence TG badge remains unknown, never silently TG0.
- `intake-ui.js` includes a troop-tier and Truegold **review row for each of infantry, cavalry, and archers**; positive T/TG suggestions populate the existing `v2.troopTiers` only on explicit confirmation, leaving unknown values unchanged. The user does not need to reenter the total troop amounts.
- Regression test scripts `test-gear-layout.cjs` and `test-troop-badges.cjs` use **synthetic images** and tiny bitpacked binary masks derived from the provided screenshot (source images not committed). They check grid offsets, positive TG6/TG5/TG6 and a blank-screen rejection. GitHub Pages Action validates and publishes both modules.
- Limits: the current gold-number visual templates are calibrated for the supplied screenshot style and only TG5/TG6; not universal for every tier, HUD layout, image crop, or screenshot quality. The formation calculation itself remains provisional.


## Guided onboarding replacing the large Bear configuration page — 2026-10-09

The user found the screenshot-first interface still too complicated because all the forms and controls were visible simultaneously. The standard page now runs **`bear/wizard.js` / `bear/wizard.css`** and only shows one setup step at a time, with progress and Back / Continue buttons:

1. Governor ID or existing NRW MightPulse JSON / previously saved local profile. The static GitHub Pages preview **cannot make authenticated live MightPulse calls**: it never embeds a provider key in browser assets; it explains this limitation and disables the unworkable live lookup button. Local profiles are explicitly **not a fresh NRW membership verification**.
2. A troop overview screenshot, reviewed for three troop totals and separately identified T/TG badges.
3. One or more scrolling combat-stat screenshots, merged in the same existing OCR review; squad stats are kept separate from class stats to avoid accidental double counting.
4. One Governor Equipment overview screenshot with six gear pieces and 18 talismans via the existing on-device image matcher and confirmation dialog.
5. Hero overview and/or details of the three starters, with editable identity, level and star checks.
6. A *targeted* missing-values screen: sections for troops, march capacity/selected starters or attack/lethality percentages are hidden when complete; the existing full expert UI remains in a secondary expandable area.
7. A results screen with the starter optimizer's existing **three provisional** model formation alternatives. The model calculation starts on entry if all required data and troop tiers are ready; otherwise a clear instruction to complete missing fields appears.

The underlying DOM input elements and handlers are **moved** into steps rather than duplicated. The existing model/localStorage data remains compatible. The wizard does not create new storage or bypass the per-Governor cache. Unrecognized screenshot fields remain empty, not fabricated. Review is required before saving; moving to another screenshot stage discards an unconfirmed review rather than mixing categories. Skipping optional screenshot steps leaves them incomplete for follow-up. Additional events from existing importers (`nrw-bear-intake-applied`, `nrw-bear-gear-applied`) enable the corresponding Continue button only after the user confirmed reviewed data.

UI supports the three current languages and is mobile-first. In guided mode the previous full dashboard and decorative banner are hidden. Script order matters: `wizard.js` must load **after** `v2.js`, `ux.js`, `screenshot-importer.js` and `intake-ui.js`; `wizard.css` loads last.

Testing: `node bear/test-wizard.cjs` validates ordering, assets, source events, confirmation gates and syntax, in addition to the existing OCR, tier, gear and combat tests. **Automated static checks are not a complete touch/browser test.** Validate with actual Android screenshots and verify multi-image OCR, portrait matching and missing fields on the phone before proposing a production deployment. Only the GitHub Pages feature branch is modified; no Vercel, main, NAP or Supabase work.

## Follow-up from real Android test screenshots — 2026-10-09

- **GovGear:** Another six-item layout has **four purple items on the top two rows and two orange items in the bottom row**. The detection engine now accepts that configuration and reconstructs the two lower positions from the complete first two rows. Older five-purple/one-orange references remain supported; ambiguous frame grids still fail closed. A synthetic regression covers both configurations. Pixel-level real-device validation is still required before production.
- **Troop screenshots:** Truegold digits are now searched within a narrow aspect-ratio-adjusted region rather than a single fixed 716x1536 coordinate. This targets the vertical shift of 1080x1920 images. OCR quantity zones were aligned with Android screenshots so cavalry is not silently skipped. Unknown Truegold stays **unknown**, not automatically TG0. Detection currently has validated visual templates only for TG5 and TG6; no universal tier claim.
- **Flow:** Loading a profile and confirming a screenshot advances the seven-step guide automatically. Existing quantities, offensive stats and ready heroes/capacity are hidden in the missing-values step, even if another property in their row remains unknown. Back/skip remain available; unconfirmed reviews are not saved.
- **Hero list:** Rows are located by image coloration instead of assuming an unscrolled top position. Only complete cards are processed; item crops, level OCR boxes and flower-star proposals use the located card geometry. The star proposal intentionally leaves small partial tiers unverified. Detail screenshots get a second OCR attempt limited to the hero-name header when normal recognition fails.
- **Remaining limitations:** Hero portraits do not contain readable names. Matching every roster portrait against a verified, comprehensive reference library is not implemented; a few screenshots and syntax checks cannot validate that feature. Real Android/browser testing and confirmation are still needed for the actual three starter identities, all roster stars, governor charms and non-reference phone layouts. The combat model is still provisional.
- **Release boundary:** Changes affect the isolated GitHub Pages development branch only. Do not merge or alter Welcome-NRW production, the NAP app, Supabase or Vercel while this intake is being verified.

## 2026-10-09 – Original screenshot regression (Dev Chat continuation)

- Original **1080×1920** troop screenshot inspected: infantry **626621 / T10 TG6**, cavalry **557731 / T10 TG5**, archers **1116468 / T10 TG6**. Pixel-silhouette checks produced TG6/TG5/TG6 on the source image. Quantity extraction now uses aligned numeric regions plus a second, aspect-preserving local OCR pass for split/missed leading digits. March queue **6/6** may supply a confirmed six march slots, translated to one own rally + five joins; base march capacity is still unknown and never inferred.
- Original three scrolling hero pages inspected. The row detector now samples all four true column positions and rejects partial rows/blank slots/unrecruited **0/20** cards. Complete cards are fingerprinted in memory; near-identical overlaps are deduplicated. Level and star overlays are read relative to each detected card; stars remain **reviewable estimates** (not automatically proven progression).
- New conservative wiki hero matcher: GitHub Pages build downloads existing public hero catalogue images to derive only **12×12 RGB fingerprints** in `hero-signatures.json`. Actual artwork and game screenshots are not checked in. Strong match plus margin may preselect a name; ambiguous portraits remain suggestions for manual review. Matching reliability and availability of signature downloads require a live browser test; no unsupported claim of complete portrait recognition.
- Three starter-detail names **Zoe/Petra/Yang** and level 80 are separately supported through heading OCR and confirmed game text. Screenshot review confirmation automatically advances. Missing-values step does not repeat recognized quantities. Truegold not detected stays **null**, not inferred TG0; the experimental combat model requires explicit real tiers.
- Regression additions: revised troop-figure fixture, independent portrait conservative-match test, four-purple/two-orange equipment layout test. Existing Pages checks continue. Production/main untouched.

## 2026-10-09: Original screenshot verification and connection-resume fix

- Validated against the original 1080×1920 troop screenshot. Troop numbers are at approximately 26–29% height for infantry/cavalry and 35–38% for archers; earlier 30–45% OCR crops missed the text. Updated both the spatial text parser and its targeted number-strip OCR accordingly. The expected source values remain **626,621 / 557,731 / 1,116,468**, **T10**, **TG6/TG5/TG6**. Browser Tesseract execution still requires Android confirmation.
- Truegold badge reference centers now interpolate between the older 716×1536 crop template and the actual 1080×1920 layout. Unknown badges remain **unknown**, not TG0. The combat engine rejects unknown TG rather than treating it as zero.
- Found and fixed a real hero-row bug: normalized horizontal sample coordinates were treated as pixel coordinates. After correction, offline colour segmentation on all **three original hero overview screenshots** finds three complete rows in each image; a direct pixel comparison flags four portrait duplicates between the second and third images (average colour differences of ~1–4). These checks are offline image-analysis checks, not full Browser OCR tests.
- Examined the actual GovGear screenshot using the exact purple-frame colour predicate and connected-component measurements: all **four purple** gear frames are detected at the expected locations; the two orange slots are inferred below them. The actual 18 charm levels and equip-tier labels still need browser verification.
- Build includes a conservative portrait matcher with optional 12×12 colour signatures from the 37 reference URLs. Weak matches are not automatically assigned. External image downloads may fail, and matching has **not been proven on the real screenshot portraits**. Do not describe this as finished automatic hero identification.
- Changes remain on `feature/bear-optimizer-nrw-prototype` only. GitHub Pages Action completion and browser end-to-end behavior must be confirmed independently; source commits alone do not establish a successful deployment.

## 2026-10-09 – Guided Android retest: individual screenshots and missing capacity

The player retested the published preview and reported troop tiers + cavalry still unrecognized, governor archer quality detected but stars and three charms unresolved, hero levels/stars/names incomplete, and squad capacity hidden from the missing-values step.

- Wizard accepts **one screenshot at a time** for troops, Governor Gear and heroes; stats can still accept complementary screenshots together. Hero step remains open after each confirmed image, so the player can add one overview or individual Zoe/Petra/Yang detail at a time. The explicit Continue button ends the hero step. Other steps auto-advance after confirmed review.
- The missing-values screen treats squad capacity `cap=0` as missing and retains the capacity input while typing; it is labelled *Schwadronskapazität* / Squad capacity and is never inferred from a screenshot's 6/6 march slots.
- The October 9 1080x1920 troop screenshot was inspected with visible coordinates overlaid. Amounts are near y=584–655 / y=775–865; golden TG shields are centred near (202,542), (686,542), (202,740). Updated the numeric OCR zones and gold badge offsets. An isolated Roman X shield mask, taken from the screenshot, offers a separate T10 check if text recognition misses the troop label. Text-only parser regression recovers 626621 / 557731 / 1116468, but the entire browser OCR path still requires a real-device retest.
- Governor Gear: the two gold archer equipment items show *no visible T1 annotation*, so the specialized tier recognizer must keep tier unknown. Updated yellow-star segmentation to exclude the orange background, and added a **single explicit button** for accepting three matching low-confidence charm level guesses, without silently turning suggestions into verified levels.
- Hero roster: do not discard real cards based on darkness (the old filter lost several heroes). Added a second cropped OCR pass for missing `Lv.` labels, reduced false 5★-max calls when the fifth flower has partially filled petals, and carry duplicate signatures across sequential screenshot imports. Reset these signatures when the player changes Governor ID. A hero with no reliable name match remains unassigned pending confirmation; wiki fingerprint matching is still experimental.
- Checks: affected source scripts passed JS parsing checks; pure OCR-text troop/march fixtures passed. These checks do **not** certify GitHub Pages deployment or real Android OCR effectiveness. No production/main/NAP/Supabase changes.

## 2026-10-09 – Hero flow revised after user feedback (nine stages)

- User confirms troop import works; Governor Gear and charms have significantly improved. Do not risk those working components during hero-flow work.
- The user's offer to explain each screenshot was **for developer debugging**, not a request for mandatory one-by-one uploading. All scrolling hero overview pages can be selected **together**. Follow-up detail screenshots may also be selected in a batch; deduplication remains active.
- New sequence: ID/profile → troops → combat stats → Governor Gear and charms → **all owned hero overview images** → provisional **top-three rally-leader picks**, one per infantry/cavalry/archer → **distribute best hero gear across all three simultaneously**, then upload their hero detail/skills screenshots → only missing values → formation result.
- `bear/hero-advisor.js` creates the owned-only shortlist. It uses local qualitative KS Atlas-linked role priorities combined with verified or OCR-reported level, stars, known widget and actual or star-inferred skill cap. This is **a local heuristic, not an official KS Atlas score nor a validated battle simulator**. Inferred skill levels are visibly labelled **assumed**. If a role has no identified hero, users must confirm an actual owned hero; inventing one is prohibited.
- The three picks are not written to `v2.ownHeroes` until confirmation. After gear assignment, all three heroes' detailed screenshots are requested and recognised names are tracked; the user can explicitly skip unreadable images.
- Base squad capacity is the **original** persisted `#cap` input, now **reparented into its own required field** (`#bearRequiredCapacity`) whenever it is missing or zero. The old combined hero/marches panel no longer controls its visibility. The 6/6 march count is not base squad capacity.
- Remaining: actual hero portrait/name/level/star OCR requires another Android acceptance test, and the recommendations cannot be claimed optimal before comparing observed Bear damage and skill effects. GitHub Pages deployment status must be checked separately; code commits do not prove it.
- Test-only branch: `feature/bear-optimizer-nrw-prototype`. No change to `main`, production, NAP or Supabase.

### 2026-10-09 – Dev chat resumed after interrupted verification
- Fixed a repeat-import bug where star-inferred skills from `manualHeroes` could be promoted to falsely *confirmed* skills on subsequent roster uploads. `skillsAssumedMax` is preserved until truly known skills are entered.
- The gear-first stage now requires **new confirmed detail uploads for all three selected heroes**, not cached expedition statistics from before reallocating the best Hero Gear. Returning to the hero shortlist and confirming new picks clears the three detail confirmations. An explicit **Skip** still exists for unrecoverable screenshots.
- Verified static contracts by reading current branch files: nine stages, grouped hero overview uploads, independent original `#cap` field, advisor loaded before wizard, and both tests included in GitHub Pages workflow. Relevant JS is syntactically valid. **No full Android browser run or GitHub Pages deployment outcome is confirmed yet.**

## 2026-10-09 — Screenshot geometry and full hero roster auto-identification

**Confirmed user workflow:** One upload batch containing ALL scrolling hero overview pages (not the three details). Read every owned hero's portrait, name, level, and star progress and merge repeated cards. On the NEXT screen rank only those owned heroes for Bear rally starter roles and ask the player to confirm a recommended infantry/cavalry/archer trio. Then instruct the player to distribute their best available hero equipment simultaneously among those three and upload the three resulting hero detail screenshots. Missing inputs / optimizer follow later.

**Technical fixes:**
- `hero-grid.js` detects full card rows by sampling four relative horizontal positions and checking row dimensions **as a proportion of image width**, never a fixed number of image-height pixels. The `hero-grid` regression and independently executed validation find 3 complete rows each on simulated 1080×1920, 716×1536, and 1440×2560 images. On the three original Kingshot hero screens it finds 3+3+3 full rows with duplicates from scrolling. Image resolution is not encoded in OCR boxes.
- `hero-hud-fingerprints.json` contains **30 named 6×6 RGB references** from the user's three actual in-game hero overview images. These are tiny derived comparisons, not source screenshots or full hero artwork. `portrait-matcher.js` compares the same relative face region on the user's own device; browser does not contact the fan wiki or upload screenshots to any service for this matching. In direct matching tests all 30 identify correctly and tolerate ±3 RGB-unit variation; eight duplicated portraits between scrolling screenshots show actual same-hero mean differences approx 0–4 vs closest nonmatches >24. Other game versions/outfits/images may need manual confirmation. Do not assume recognition beyond these 30 until more references are verified.
- Star detection samples all five actual flower centres across the card width, counts each full star as 6 petals plus 1–5 partial petals. On the original screenshot reference Yang reports 28/30 = 4★ T4, Petra 28/30 = 4★ T4, Zoe 26/30 = 4★ T2. Older 5★MAX overestimates caused by incorrect x-spacing are addressed. OCR's focused Lv. passes remain in place; users can expand a card to correct uncertain values.
- A fresh accepted overview batch stores `v2.scannedOwnedHeroes` and subsequent scrolling pages extend the list; the Top-3 advisor restricts candidate heroes to these named owned screenshots instead of accidental older entries or the hero catalog. Visually unrecognized names remain reviewable, not fabricated.
- Troop follow-up: the last Android report detected TG6/TG5 but missed cavalry/T10 and TG6 archers. There is now an additional local OCR pass on **separate relative image areas** per class for counts and the visible `Spitzen` label. Its results feed the old conservative TG/T10 matcher. The final in-browser OCR outcome has **not** been independently confirmed.
- The hero overview itself no longer requires reviewing every detected dropdown. High-confidence cards show **name, level, star/tier** and collapse the correction fields. Unrecognized cards request verification.
- The staging flow remains nine steps, not the previously viewed seven-step build. `index.html` uses cache-versioned scripts to avoid stale assets.

**Limitations / release gate:** The full KS Atlas interactive bear ranking data are not reliably retrievable from their JS-only page using the current tools. `hero-advisor.js` therefore remains an **explicitly provisional local heuristic**, prioritizing Bear-role heroes and scaling by owned hero progression, *not* an official KS Atlas simulation. The exact hero/rally model remains subject to review. Original user screenshots have been used for offline source checks, and all added JS source can be syntactically checked. GitHub Pages CI must pass and the player must run an end-to-end mobile retest before declaring OCR production-ready. No changes to `main`, Vercel production, NAP or Supabase.

## 2026-10-09 — Governor Gear and Charm OCR, stage 1: six-frame localization

- On the user's original 1080×1920 screenshot, connected-component detection (normalized to image width 716) finds **four purple** frame boxes and **two orange/gold** boxes. Their measured centres are approximately (119,225), (597,225), (72,402), (644,402), (119,570), (598,570). The two orange/gold cards were previously *inferred* from purple row spacing, displacing their six talisman crop windows by about 10 normalized pixels.
- \`gear-layout.js\` now segments purple and gold frames independently, keeps their actual centres, frame-quality tags and 18 neighbouring charm positions. Normalization is proportional to the screenshot width; no absolute on-device pixel positions. The screenshot importer prefers the directly segmented rarity. Existing T1 OCR and yellow-star matching otherwise remain unchanged.
- Offline pixel checks of the current uploaded 1080×1920 screenshot show all 18 crop windows centred on coloured talismans: six cyan, six green, six yellow. The yellow-star component detector gives 2,2,2,2,1,1 as visibly displayed.
- Reproducible synthetic regression tests, based on measured geometric bounding boxes **without saving the user's screenshot or artwork**, cover 716px and 1074px image widths, all six detected frames, and all 18 charm centres.
- **Open limitation:** individual Governor Charm levels cannot be inferred from colour. The reference-silhouette matcher is heuristic and cannot safely auto-confirm exact levels without labelled in-game examples or individually verified reference art. The next dedicated step is to obtain labelled detail screenshots and test the 18 crop descriptors against them.
- No production, main, NAP, Supabase, troop OCR or hero optimizer modifications in this change.
