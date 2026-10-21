# Player Dashboard 2.0

This surface is a daily Kingshot companion for NRW players in kingdom 1044, primarily on phones. The approved 2026-10-21 brief extends the existing dashboard with local checkable daily actions, an always-accessible guide library, verified UTC recommendations, one general leadership announcement and a persistent compact view. Existing calendar calculations, profiles, Bear optimizer, Discord invitation and leadership instructions survive. NAP and Discord bots are outside scope. The brief authorizes test-site publication, verification, then Vercel production.

The user's visual direction takes precedence over the earlier leadership-only PRODUCT.md restrictions: this surface should be an eye-catcher that players enjoy visiting. It retains the crest, gold and real existing Kingshot hero portraits. The task remains readable and one click away. The existing architecture remains vanilla HTML/CSS/JS; no framework or paid service is added.

Question answered first: What should I do for NRW today, and what have I already completed?

Visual contract: warm near-black and ivory, NRW gold on meaningful progress/status, a large two-line greeting with an italic serif second line, existing Yang portrait as the recognizable game character, a compact UTC date block, a real completion bar and Bear countdowns. Flat tone separation, clear native checkboxes and restrained radii replace ambient glows. The gold progress advance and completion message are the signature feedback; reduced motion disables transitions. This adapts Taste's true-black-flat community direction to the user's explicitly more expressive player brief, without copying the leadership shell or adding invented metrics. The intro is an intentional exception to the app-sheet's no-hero default.

Task metadata stores only identities, actionable flags and confirmed timing; instruction text stays in the incumbent sources. Completion keys include event ID, UTC date and canonical instruction identity. Unknown leadership prose is not guessed to be an executable task or timed rule. Leadership notes suppress automatic timing. No new time windows are inferred for KvK or other stages without confirmed data.

Announcement editing belongs to the existing events permission in the leadership Eventplanung module. It requires preview before publication, uses DE/EN/FR with DE→EN→FR fallback after the selected language, explicit expiry in UTC, optimistic revisions and atomic audit. Public readers receive published, unexpired text only; failure leaves the dashboard usable.

Verification evidence lives outside shipping sources in outputs/player-dashboard-2 and work/player-qa.cjs. Browser authentication/provider data are isolated fixtures for write tests. Live deployment assets and read-only public API are verified separately. No live gameplay records are test targets.
