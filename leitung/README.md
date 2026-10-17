# AllianceOS · Leitung (NRW pilot)

**Production route:** `https://welcome-nrw.vercel.app/leitung/` (or `/leitung`).
**Repository:** `Boltotelli/welcome-nrw`.
**Backend:** existing Supabase project `bdzlgirowutasrsycjfj`, isolated Edge Function `allianceos-leitung` (source: `supabase/functions/allianceos-leitung/index.ts`).
**Database migration:** `20261017210011_allianceos_isolated_leitung_pilot`, applied on 17 October 2026.

## What actually works
- Authenticated R4/R5 console with a responsive multi-language DE/EN/FR/ES interface.
- NRW roster populated **read-only** from existing `players`, scoped by staff alliance and annotated with currently matched Discord IDs, stored spoken languages and cached avatars. Optional per-player power is sourced exclusively from the alliance-scoped `discord_bear_buff_power` cache; unknown power is displayed as unavailable, never guessed.
- Server-side search-friendly roster payload, browser filtering and sorting by name, rank, ID and known power.
- Member status and private notes in isolated AllianceOS tables. Players with no numeric game ID cannot yet be edited.
- Incoming and outgoing transfer records, planned windows, status pipeline, capacity calculation and a per-alliance transfer history.
- Alliance language settings (default and enabled languages).
- Draft/publish AllianceOS alliance rules, four manually editable language variants, version numbers and per-version audit snapshots.
- Draft/publish event schedule, four editable language variants, UTC storage and local time display. Published events appear in **a separate block** on Welcome and Player Dashboard; published **alliance rules** appear below existing official server laws, not instead of them. Public feeds only return explicitly published items.
- Alliance settings: name, max places, external logo URL, Discord guild ID, pending advertising option.
- R5 can grant, adjust or disable R4 feature rights for **existing verified Supabase Auth accounts** by email. R4 permissions are checked on the Edge Function for every action, not merely hidden in the frontend.
- Audit records for management changes.
- NRW R5 access bootstrapped only for the existing verified Supabase ADMIN application account; read/write NAP alliance-wide shared login does not automatically grant AllianceOS rights.

## Explicitly NOT implemented yet
- The user-specific R4 invitation/account creation workflow (R5 grants only existing accounts for now).
- AllianceOS billing, advertising delivery, subscription entitlements and cross-alliance administration.
- Cross-alliance transfer details sharing, transferable slots automation, invitations, Discord onboarding triggers, actual Kingshot transfers.
- Actual AI translation; all published translations must currently be entered manually and reviewed.
- Discord event bot, reminders and other automatic delivery; `reminder_minutes` and event templates are only saved.
- Recurring event-cycle engine and merging dynamically published events into the existing dashboard's `events.json` orchestration. The current add-on is a **separate visible section** for confirmed AllianceOS dates.
- Full multi-tenant frontend routing: the current HTML frontend always requests NRW, even though the Edge Function validates an alliance code and all records are alliance scoped.
- Editing the NAP kingdom laws through AllianceOS: existing laws remain unchanged. Kingdom-scoped AllianceOS drafts intentionally cannot be published until a separate shared approval process is implemented.

## Security boundaries

1. **Isolation:** the new `aos_*` tables are separate from all NAP tables. Existing NAP tables are *read-only* in this module. Avoid changing NAP laws, sanctions, transfer confirmation workflows and Discord bot assignment logic.
2. **Authentication:** the Edge Function explicitly verifies an authenticated bearer token with Supabase Auth and checks `aos_staff` for the requested alliance. No user metadata grants rights.
3. **Least privilege:** `aos_*` tables have RLS enabled and all `anon`/`authenticated` table grants revoked. Service-role credentials exist **only** in Edge Function secrets; never export them to the browser.
4. **Authorization:** R5 has all edit features, R4 only manually enabled edit features; roster read is for authorized R4/R5. All writes are alliance scoped and audited.
5. **Public:** `GET ?alliance=NRW&mode=public-events` and `GET ?alliance=NRW&mode=public-laws` return only published, non-private records; public laws include only **alliance**, never unapproved kingdom drafts. Do not include transfer notes or player profiles in these endpoints.
6. **Client:** player, transfer and staff records are not persisted in browser localStorage; only authenticated session, theme and language preferences use browser storage. Public text is HTML-escaped.
7. **Security advisory from the unrelated legacy project:** the existing Supabase linter found RLS disabled on `public.app_bundle_chunks` and four legacy `public.law14_nonnap_*` tables. **Do not turn on RLS without inventorying consumers and adding appropriate policies**, as that can break the NAP tracker. Must be reviewed separately with the project owner.

## First-time use
1. Open `/leitung/`. Only the pre-authorized R5 ADMIN account can currently sign in and see NRW data.
2. Within Settings, an R5 can authorize **existing** Auth accounts by email for any subset of `members`, `transfers`, `laws`, `events` and `settings`. Existing accounts not explicitly authorized cannot access the data.
3. Plan a transfer/event, keep as draft, then publish once it should appear publicly. The public feed deliberately ignores drafts.
4. For shared kingdom laws, continue using established NAP governance. AllianceOS publication for kingdom-scoped law drafts is blocked.
5. R5 should periodically verify all authorized staff accounts and revoke access when a person leaves.

## Next implementation steps
1. Secure account invitations and creation for R4 with per-alliance onboarding, account recovery and automated revocation on membership departure.
2. Convert the dynamic event feed into the existing Dashboard's authoritative event resolution and connect the new Discord event bot with idempotent jobs, alerts and reminders.
3. Add translation drafts, human review and optional AI translation (with language fallback), and propagate player language preferences through the Welcome profile endpoint, which is currently disabled.
4. Add independent per-alliance customer organizations/branding, billing/advertising and policy-protected cross-alliance transfer sharing.
5. Add test coverage for authentication, denial of cross-alliance reads/writes, approval gating, timezone/DST and version conflicts.

## Verification notes

Completed: inspected production GitHub source, database schema, row-security posture, migration history, preexisting NRW roster count, and Vercel production deployment status. Static frontend JS syntax verified with a JavaScript parser. **Not yet verified**: a real R5 browser session, sign-in, CRUD flows, or full visual browser rendering. A READY Vercel deployment and ACTIVE Supabase Edge Function are not an end-to-end proof.

## Phase 1 implementation (18 October 2026)

**Purpose:** Make the NRW pilot a real administration tool without duplicating or editing existing Tracker player records.

- Source roster remains the existing `players` table (read-only), enhanced by existing cached avatar/TC, optional power cache and Discord onboarding links. Data quality is never guessed.
- Each known roster Game-ID can be edited in the `Spielerakte`: manually maintained member status, Discord-ID, membership date, responsibilities, private leadership notes and multiple spoken languages, persisted only to `aos_member_notes`.
- Spoken languages are deliberately independent of UI locale. DE/EN/FR/ES/TR plus free-form additional languages are supported, preserving values already present in `players.languages`. UI site defaults are configured separately.
- Each player dossier includes linked kingdom transfer plans and existing intra-1044 alliance movements. From an active player dossier a kingdom-outbound transfer can be prefilled.
- The primary transfer planner is for **kingdom-to-kingdom**, inbound to kingdom 1044 / outbound from 1044, with **origin and destination kingdom** fields, planned windows, priority, invitation type, status, power, alliance and private notes. Entries are stored in `aos_transfers`. Status "completed" is set manually; the UI separately shows whether an incoming player is currently observed in the NRW roster. Do not claim that manual completion is verified arrival.
- The secondary read-only section shows **historical in-kingdom transfers involving NRW** from existing `player_alliance_transfers` and `players`. These do not become `aos_transfers` entries and cannot affect the Tracker's confirmation workflow. At migration time there were 75 existing moves involving NRW (53 from NRW, 22 to NRW).
- No NAP/Tracker table was altered; all new writes remain scoped to R4/R5-authorized `aos_*` records and audited.
- The NRW pilot is **free and advertising-free**; the advertising control is hidden in the UI and permanently disabled on the server for alliance `NRW`. Billing has not been activated.

### Existing event sources inventoried for Phase 2 (do not duplicate!)

- `dashboard/events.json`: 20 manually tracked events/entries as of 16 October 2026, with localized names, tips, daily plans, dates and confirmed sources.
- `dashboard/event-guides.json`: 18 full event guides, 33 catalog-only types, 29 actions and 13 cited sources. This is the event knowledge layer, NOT an alternative date store.
- `dashboard/app.js`: official runtime event rotation/cycle calculation, day-specific tasks, Bear Trap rhythms and the UI event coach; not all derived events are materialized in `events.json`.
- Existing `aos_events` currently contains separately managed manually published records, not yet merged into the established event engine.
- **Next:** expose the full existing runtime-derived and manual event calendar in leadership, include all existing guide content and ingame text templates, use one editable event record source, and add a copy button validating **512 alliance-chat / 300 alliance-note characters**. Do not create parallel event guides, and do not modify the existing Bear Buff scheduling bot.

### Verification and known caveats

- Database migration applied and checked; new `aos_*` tables keep RLS enabled with no anon/authenticated table access. Supabase Edge Function version 7+ deployed and ACTIVE.
- Frontend source verified as parseable JavaScript, and production builds observed READY in Vercel.
- No authenticated browser R5 end-to-end user-input/write/reload test has been performed in this execution environment. This remains a necessary hands-on smoke test. When a player is not in the source roster or has no numeric Game-ID, dossier editing is unavailable by design.
- The existing Welcome public self-service language-saving endpoint remains disabled, so manually maintained dossier language overlays **do not yet flow back** to that public Welcome profile. Do not call the on-site spoken-language editing end-to-end synced.
