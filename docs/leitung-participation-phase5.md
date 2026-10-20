# AllianceOS / Phase 5: Event participation and attendance

Pilot implementation: 2026-10-20, NRW (Kingdom 1044).

## Overview
Phase 5 fills the gap between event planning and player coordination. It is a **manual R4/R5 leadership register**, not a public RSVP service and not a feature of the Discord sending bot.

- Source event types come from NRW's enabled `aos_event_cycles` configuration, read-only. Duplicate Bear and Swordland/TriAlliance types are excluded from the generic register and linked to their specialized Phase 3/4 planners instead.
- Recurring dates are **calculated from configured anchors and intervals**. They are proposals, **not independently confirmed in-game schedules**. Dates can be edited within a defined window.
- For each active game account, event key and date, staff may record `unknown`, `yes`, `maybe`, `no`, and a separate **actual attendance** value `unknown`, `present`, `absent`, `excused`.
- Actual attendance before the corresponding UTC date is rejected by the API.
- Per-account internal notes, status filters, clipboard export, access to the player's dossier, and main/alt informational labels.
- Counts of actual Bear assignments and FightClub legion placements are fetched **read-only** from their own tables, with links to those planners.
- Four interface languages: German, English, French, Spanish, plus mobile layout.

## Security and operational boundaries

- Private table `public.aos_event_participation` with RLS enabled and **no direct** `anon` or `authenticated` SELECT grants. The service-role Edge Function checks the authenticated `aos_staff` member permission, alliance scope, active roster member, configured active event type, allowed status, and date range.
- Saves and deletions are audited.
- Composite key (alliance, event type, event date, game ID) prevents multiple conflicting status rows for one account per event.
- No new player accounts are created.
- **No Discord messages**, DM requests, minister edits, Bear slot changes, FightClub registrations, or modifications to NAP player records.
- No assumed attendance from event entry, game power, prior behavior, or missing response. A missing response remains **unknown, not a decline**.
- Only the GitHub Pages pilot renders the nav tab. Production Vercel keeps the new tab hidden.

## Tests
- SQL create/rollback, RLS/grants, initial zero data, API deployment, JS syntax, four-language rendering, mocked click/save and count updates.
- Still required before promoting to Vercel: authenticated R4/R5 browser test of navigation, edit/delete/filters and clipboard, plus mobile devices and real participant review.
- Discord-verified player signups could be a later integration when Discord–Kingshot ID association and opt-in semantics are proven; it is **not** present in Phase 5.
