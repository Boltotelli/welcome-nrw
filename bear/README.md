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
