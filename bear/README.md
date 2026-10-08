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
