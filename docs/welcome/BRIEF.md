# Welcome NRW surface brief

Status: implemented cinematic revision, 2026-10-21. Surface mode: **Persuasive**, with a separate member utility view.

## Approved direction and boundary

The user rejected the green, overloaded page and selected **“Dunkel & Gold – atmosphärisch, mit großer Kingshot-Bildwelt.”** This supersedes the former forest/paper direction. The user subsequently rejected the focused version as too plain and informational. A midnight-blue/charcoal citadel scene, warm gold lighting, Cinzel display type, and existing crownless Helga foreground now govern Welcome. No giant crown, oversized 1044 backdrop, overlay slogan, or green cast returns.

This brief and sibling DESIGN.md govern the public root Welcome implementation: index.html, welcome.css, welcome.js, and existing app.js integrations. Root PRODUCT.md and DESIGN.md remain historical leadership references. Dashboard, leadership, NAP, and synced sources are outside this documentation change. The cinematic layer adds one AI-generated fantasy backdrop and a locally hosted OFL font; no backend changes were introduced. The active cascade is styles.css, welcome.css, then welcome-cinematic.css; welcome-cinematic.js coordinates scene motion with welcome.js.

## Three states, two audiences

Landing shows only the large two-line Welcome headline, one short explanation, two choices, and game artwork, followed by a compact footer. The member and transfer streams remain hidden until chosen. On phones, the composition places game artwork above the readable introduction and immediately usable choices; the desktop scene pairs the wordmark and choices with Helga on the right.

Member view leads with the separate Player Dashboard and utility links, then current event times. Onboarding, server information, event explanations, language profile, rules, and Discord material stay in closed detail groups. Transfer view leads with fit/values, real in-game contacts, and a short process; event times and FAQ start closed. The single shared schedule opens on entry to member view and closes on entry to transfer view.

Audience switching and return-home links remain available in either selected view. Direct hashes reveal the correct audience and open ancestor disclosures before scrolling and moving keyboard focus. Browser back/forward restores the appropriate view. The skip link targets the current visible state. Keep original form/feed IDs and listeners; never duplicate schedule or profile nodes.

NRW United, kingdom 1044, international and F2P-friendly teamwork, real-life respect, and shared KvK preparation are alliance positioning. Do not invent rankings, member counts, testimonials, transfer availability, or guarantees.

## Data and integration invariants

Bear times come solely from the live leadership public-schedule feed: enabled bear-1 through bear-3 with valid UTC clocks. Optional local times derive only from published valid anchors/intervals. Refresh initially, on focus/visibility return, and each minute while visible. Failed refresh clears stale clocks and offers retry; empty data gets an explicit empty state. Swordland and Tri-Alliance have no hardcoded clock fallback. Both audiences share one authoritative schedule node and configuration.

Jey (151869669) and Demazeᴳᴱᴿ (155097147) remain static contact projections from existing stored player/cache records. Local portraits and Helga provenance are recorded in assets/welcome/sources.json. No external player lookup or refresh was added. Copy actions retain visible IDs, success/error status, and manual-copy guidance. Discord public-config remains the sole invite authority. Existing language-profile persistence remains; no Supabase schema, functions, or data were changed for this redesign.

DE/EN/FR and light/dark choices persist. Welcome uses its own nrw_welcome_theme_v3 preference, defaulting to dark; it does not reset other routes’ theme preferences. The neutral light alternative remains available for selected views. Landing stays a dark illustrated scene in either theme.

## Scene, assets, and interaction

The landing wordmark is NRW./United. in self-hosted Cinzel, with Inter for body and controls. The citadel is an AI fantasy illustration, explicitly credited, not a Kingshot screenshot. assets/welcome/kingdom-dusk.provenance.json contains its exact generation prompt, original dimensions, and format-only optimization record. The optimized kingdom-dusk.webp is 138644 bytes; the original generation remains untouched. Cinzel-Variable.ttf is bundled with Cinzel-OFL.txt; Helga and cached contacts retain assets/welcome/sources.json provenance. Custom inline SVG icons distinguish both choices. Selected-view mastheads retain a subtle version of the backdrop.

Six first-landing elements arrive with bounded transform/opacity animation; the choices are usable during entry. CTA entrances run on noninteractive path-reveal wrappers with backwards fill so anchor hover/press remains independent. Fine-pointer depth moves scenery and Helga only, never text. It stops when settled or ineligible. Audience changes use an interruptible staged native view transition with a short fallback; keyboard, reduced-motion, and same-view navigation remain direct. Exact values and pointer gates are in DESIGN.md and the sidecar.

## Deployment boundary

Vercel root remains the production target. The existing GitHub Pages publisher preserves the Bear root and publishes Welcome at /welcome. This documentation update performs no deployment, backend/schema/auth change, provider refresh, or unrelated Dashboard/leadership/NAP modification.

## Verification record and limits

The implementation team reports 72 local combinations across landing/member/transfer, DE/EN/FR, widths 1440/768/390/360, and dark/light, preserving form, clipboard, history, and deep links. The motion reviewer reports PASS for all four requested corrections and a deliverable implementation. Checks included real intro frames at 0/300/1300ms, transition frames at 40/80/160ms, hover/press, keyboard, reduced motion, spring, and fallback assertions. This replaces the earlier focused-version screenshot and height record; those figures do not describe the cinematic page.

No physical-device, frame-budget, or complete accessibility certification is claimed. This documentation-only pass used source and the supplied verification record without adding browser reviews. Keep labels, visible checkboxes, state-aware skip navigation, focus outlines, native disclosures, and status feedback. Synthetic schedule fixtures were not saved to production and production checks did not submit profiles.

## Source fingerprint

SHA256 snapshot of the implementation documented here:

- index.html: A9BA1C255FEDFD8E18F33E352BF4D5033AA5E5238EABE39846C822A12BA6D2BE
- welcome.css: 6D847322DFEF2FE3D7AC092CC9508B50624C0267CDE5D9B111861B405683607B
- welcome.js: DFA6631AF10D26D593482562350C1E4357900FC2A005DE1D4346586DE0AA68B5
- app.js: 4F50683D5166320C204A1A3CCF3903B75371833EAD0724B4272D50671C5DDA4F
- welcome-cinematic.css: F25A7B4E0CBB4F4728EB5398E995566A8B41C7A945440B5F522218E3E01240BD
- welcome-cinematic.js: 7724931D81978930CFDF04F72D7B098C363A4D206EEB1C2C2CB071BA95A0C834
