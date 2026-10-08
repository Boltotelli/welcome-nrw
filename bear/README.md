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