# Welcome NRW surface brief

Status: implemented focused revision, 2026-10-21. Surface mode: **Persuasive**, with a separate member utility view.

## Approved direction and boundary

The user rejected the green, overloaded page and selected **“Dunkel & Gold – atmosphärisch, mit großer Kingshot-Bildwelt.”** This supersedes the former forest/paper direction. Neutral charcoal, NRW gold, and large existing crownless Helga artwork govern Welcome. No giant crown, oversized 1044 backdrop, overlay slogan, or green cast returns.

This brief and sibling DESIGN.md govern the public root Welcome implementation: index.html, welcome.css, welcome.js, and existing app.js integrations. Root PRODUCT.md and DESIGN.md remain historical leadership references. Dashboard, leadership, NAP, and synced sources are outside this documentation change. No new raster assets or backend changes were introduced.

## Three states, two audiences

Landing shows only the large two-line Welcome headline, one short explanation, two choices, and game artwork, followed by a compact footer. The member and transfer streams remain hidden until chosen. On phones, both choices precede the artwork.

Member view leads with the separate Player Dashboard and utility links, then current event times. Onboarding, server information, event explanations, language profile, rules, and Discord material stay in closed detail groups. Transfer view leads with fit/values, real in-game contacts, and a short process; event times and FAQ start closed. The single shared schedule opens on entry to member view and closes on entry to transfer view.

Audience switching and return-home links remain available in either selected view. Direct hashes reveal the correct audience and open ancestor disclosures before scrolling and moving keyboard focus. Browser back/forward restores the appropriate view. The skip link targets the current visible state. Keep original form/feed IDs and listeners; never duplicate schedule or profile nodes.

NRW United, kingdom 1044, international and F2P-friendly teamwork, real-life respect, and shared KvK preparation are alliance positioning. Do not invent rankings, member counts, testimonials, transfer availability, or guarantees.

## Data and integration invariants

Bear times come solely from the live leadership public-schedule feed: enabled bear-1 through bear-3 with valid UTC clocks. Optional local times derive only from published valid anchors/intervals. Refresh initially, on focus/visibility return, and each minute while visible. Failed refresh clears stale clocks and offers retry; empty data gets an explicit empty state. Swordland and Tri-Alliance have no hardcoded clock fallback. Both audiences share one authoritative schedule node and configuration.

Jey (151869669) and Demazeᴳᴱᴿ (155097147) remain static contact projections from existing stored player/cache records. Local portraits and Helga provenance are recorded in assets/welcome/sources.json. No external player lookup or refresh was added. Copy actions retain visible IDs, success/error status, and manual-copy guidance. Discord public-config remains the sole invite authority. Existing language-profile persistence remains; no Supabase schema, functions, or data were changed for this redesign.

DE/EN/FR and light/dark choices persist. Welcome uses its own nrw_welcome_theme_v3 preference, defaulting to dark; it does not reset other routes’ theme preferences. The neutral light alternative remains available.

## Verification record and limits

The implementation team reports 72 state/locale/width/theme combinations passing and a full independent hierarchy/visual review completed. The single skip-link finding was fixed and tested in all three states. Reported 390px DE dark heights are landing 952px, member 1614px, transfer 1726px, versus the former combined 13334px. These are scoped fixture measurements, not production engagement evidence. Synthetic schedule fixtures were never saved to production; production checks did not submit profiles.

Current screenshots: outputs/welcome-focused/local/{landing,member,transfer}-{1440,768,390,360}-{dark,light}.png, captured from the top with motion disabled and images loaded. This documentation pass checked source and the supplied review record; it did not rerun the browser matrix or certify complete accessibility. Preserve visible focus, state-aware skip navigation, labels, visible checkboxes, native disclosures, status feedback, and reduced motion.

## Source fingerprint

SHA256 snapshot of the implementation documented here:

- index.html: 2B5D3B0895B294549E3A4E95BE7E50406DE0B12BC2D8F298297FE8078A17D4A9
- welcome.css: 6D847322DFEF2FE3D7AC092CC9508B50624C0267CDE5D9B111861B405683607B
- welcome.js: 9470D6B4AFB2FF7D4F5298718F2A64BEEB47B6F88AC4693574183BB0BB3F7E69
- app.js: 4F50683D5166320C204A1A3CCF3903B75371833EAD0724B4272D50671C5DDA4F
