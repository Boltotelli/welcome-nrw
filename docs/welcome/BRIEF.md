# Welcome NRW surface brief

Status: implemented illustrated scroll and legion-clock revision, 2026-10-21. Surface mode: **Persuasive**, with directly available member information.

## Approved direction and boundary

The latest explicit user instruction adds more substantial game-world graphics and L1 14:00 UTC / L2 19:00 UTC for both Swordland and Tri-Alliance, editable in leadership. The continuous page and progressive native scroll scene remain. This supersedes the hidden member/transfer-view architecture. The cinematic charcoal/gold/Cinzel/citadel/official crownless Helga hero remains; no green surfaces, former Lord, or giant crown hero returns.

These three documents govern public Welcome only. Root PRODUCT.md and DESIGN.md remain historical leadership references. Root leadership design documents, Dashboard, NAP, and synced references remain unchanged. The explicit legion-clock request authorizes the narrow backend/schema/event-editor change recorded below, superseding the earlier freeze for that feature only; this documentation pass changes no implementation. Current source authority: index.html; welcome.css followed by welcome-cinematic.css and welcome-story.css; welcome-cinematic.js, welcome.js, welcome-story.js, and existing app.js integrations.

## Continuous information journey

Order: cinematic hero; shared alliance banner; transfer fit; NRW/server facts; authoritative event times; event guides; member Dashboard; onboarding; language profile; Discord; cached real contacts; FAQ. Hero choices are ordinary same-document anchors. Header anchors remain visible at all widths. No audience selection is required to access information. Primary content groups no longer use disclosures; FAQ questions and the historical account warning retain native details. The optional externally populated public-feed region remains conditional on real configuration.

The authored scroll moment traces the real NRW crest standard and illuminates three localized lines: Many languages / One banner / Stronger together. It follows ordinary scroll position and reverses as the reader scrolls back. No scroll hijacking, horizontal pinning, invented rewards, or new factual claims. Other section headings receive a quiet once-only masked entrance; factual body copy remains readable. No-JS defaults show information. Reduced motion and keyboard navigation settle the effects; direct hashes reveal targets immediately.

## Data and feature invariants

public-schedule remains the sole Bear-clock authority: enabled bear-1 through bear-3 with valid UTC clocks, optional local time only from valid published recurrence. Initial/focus/visibility/minute refresh, retry, explicit empty state, and clearing stale clocks on failure remain. One schedule node and configuration serve the page. Swordland and Tri-Alliance display persisted leadership legion clocks from that same public-schedule response; each requires a valid pair. There is no hardcoded public 14/19 fallback. Group assignment remains coordinated in game, while time configuration is owned by leadership. No external player lookup or refresh was added.

Jey (151869669) and Demazeᴳᴱᴿ (155097147) remain static contact projections with local cached portraits and sources.json provenance. IDs, copy status, manual fallback, original profile IDs/listeners, and existing language-profile persistence remain. Discord public-config is the sole invite authority. DE/EN/FR and the isolated nrw_welcome_theme_v3 preference persist, defaulting to dark without changing other route preferences. The scene/banner/contact regions retain explicit dark colors; other content follows the neutral selected theme.

## Assets and licensing

The citadel kingdom-dusk.webp remains an AI fantasy illustration, explicitly credited, not a Kingshot screenshot. Its adjacent provenance JSON records the exact prompt and format-only optimization; original generation is preserved. Cinzel-Variable.ttf retains Cinzel-OFL.txt. Helga and cached contact sources remain in assets/welcome/sources.json. This revision adds alliance-camp.webp (336082 bytes) and bear-rally.webp (350806 bytes), original AI fantasy illustrations, not game screenshots. Adjacent exact-prompt provenance JSON and embedded Exif record their origin; processing is WebP conversion only. Larger local game-event emblems and the existing crossed-swords SVG make guides more visual. Images lazy-load with intrinsic 1672×941 dimensions and responsive cover crops. There are no new animation effects. Broken external decorative media were removed; local Helga and an authored crossed-swords SVG replace them. The SVG is decoration, not evidence of game data.

## Explicit legion-clock extension

Migration supabase/migrations/20261021181556_event_legion_times.sql adds nullable time(0) legion1_time_utc and legion2_time_utc columns to aos_event_cycles. A paired/group check permits both null or a complete minute-precision pair for the two supported event keys. Only NRW Swordland and Tri-Alliance cycles are seeded to 14:00/19:00 UTC; existing Bear 17:00/18:30 remains untouched.

The applied migration and active Edge v64 extend the existing events ACL and audit path. Strict HH:mm validation, paired clearing, title-only preservation, and compatibility with older clients remain. Manual authentication and verify_jwt=false are unchanged. Leadership Event Planning / Event Library / Turnus gains two clock inputs only for Swordland/Tri; existing names and recurrence are preserved and read-only staff cannot edit. The public-schedule response exposes the persisted fields without a second public source. This feature-specific record does not redefine the leadership visual system.

## Deployment boundary

Vercel root remains the production target. The existing GitHub Pages publisher preserves the Bear root and publishes Welcome at /welcome. The prescribed release sequence is Pages first, then Vercel from the same tested SHA. This documentation pass performs no deployment, provider refresh, backend mutation, or unrelated route change.

## Verification record and limits

The implementation team reports 24 local combinations passing (DE/EN/FR, four widths, two themes). The fresh art_legion_finish reviewer resolved the Bear crop finding and returned SHIP. Desktop Bear crop is 440px high at center top; phone crop is 220px high at 62% center. The actual Event Library module fixture verified both event save payloads, incomplete-pair blocking, and read-only disabled controls. Backend ACL/unit coverage passed invalid time, paired clearing, old-client/title preservation, and audit cases. The Supabase public API already returns 14/19 for both types; frontend release follows review/docs/Pages then Vercel.

Evidence: outputs/welcome-art-legions/local/{hero,story,world,times,guides,contacts}-{1440,390}-{dark,light}.png, full-page captures at four widths, plus legion-editor.png and editor.json. World/guides use viewport crops to avoid the known oversized-locator Skip-link capture artifact. This documentation pass performs no further UI review. No full accessibility, physical-device, or frame-rate certification is claimed.
## Source fingerprint

SHA256 snapshot of this documentation context:

- index.html: B34F35D5A3A2A47F4AB05DA2BD10C59B85A701D342181A60EBB22A141028491E
- welcome.css: 6D847322DFEF2FE3D7AC092CC9508B50624C0267CDE5D9B111861B405683607B
- welcome-cinematic.css: F25A7B4E0CBB4F4728EB5398E995566A8B41C7A945440B5F522218E3E01240BD
- welcome-cinematic.js: 7724931D81978930CFDF04F72D7B098C363A4D206EEB1C2C2CB071BA95A0C834
- welcome-story.css: 5AA4992104153E6A07FC92314C23049E4384716B2A8F97346350A99B9F4D6579
- welcome-story.js: 77FD872FD4C186C5F718762B9EB3C090A7507E7212FA722C5C008B1F65FEF622
- welcome.js: AC71CB2C5D4056742E11AB05531CA9269231E18595341AE1CF8FF10117101015
- app.js: 4F50683D5166320C204A1A3CCF3903B75371833EAD0724B4272D50671C5DDA4F
- event-library.js: 62F1A1BADE2A72AE15F1394593C45CE9548DB0C15064DB275AC6BA8768A709B8
- index.ts: 2EE5184F4CD402379CED5945EE2198076C0BE34BE5763D606591CFD1395AC26A
- 20261021181556_event_legion_times.sql: 767856B873B67BE93AE2546BED754CE84F32C71CCCF429D73D9685468E744B43

