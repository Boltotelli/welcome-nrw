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

## Phase 2 · Event calendar and ingame message tools (18 October 2026)

**Source of truth preserved:** existing manually entered events in `dashboard/events.json`, the complete guide database `dashboard/event-guides.json`, and the 28-day official rotation algorithm from `dashboard/app.js`. The rotation algorithm was moved **without changing its calculations** to `dashboard/event-rhythm.js` and is now loaded by both the Player Dashboard and AllianceOS; there is no second independently maintained rotation.

AllianceOS Event tab now provides:
- One combined searchable **existing events** browser including past entries, currently active and next eight weeks, projected 28-day rotation, and custom AllianceOS events.
- Full guide catalog: 18 detailed guides and 33 additional catalog entries from the existing `dashboard/event-guides.json`. All original structured guide information remains inspectable via an expand/collapse view; day-specific plans and scoring instructions come directly from the source.
- Per-event **day selection**, with the relevant original daily plan, scoring notes, original guide, projected day-specific rhythm and provenance/forecast tags.
- Automatically composed, editable **512-character alliance chat** and **300-character alliance notice** plain-text messages. Copy buttons work independently for each channel; clipboard fallback selects text if permission is denied.
- Permissioned R4/R5 save for the selected event, day and UI language. User-specific messages persist in `aos_event_messages` (isolated, RLS enabled, anon/authenticated table access denied); backend validates limits and checks `events` staff permissions. These messages do not change the original guides or NAP tracker.
- Additional manually created AllianceOS events remain in `aos_events` and can be edited/published as before; the library surfaces them too.

**Not yet connected:** the user's local Windows Messaging Queue Excel and already sent messages, since that local controller isn't hosted in this repo. Also no automatic Discord bot posting or game posting has been added. Before sending any auto-composed text, leaders should check the current Law14 exceptions and Discord decisions, which may have changed since static guides were written. Guide contents are source material, not independently validated current event rules.

**Verification performed:** extracted rhythm script simulated for multiple 2026 UTC calendar dates; existing dashboard JS and leadership JS parsed successfully after the refactor; event library simulated with the real 20 event records and 18+33 guide records (52 upcoming event records in the sample period and 51 catalog entries, may vary by current date); clipboard text generation returned <=512/<=300 characters; simulated save payload preserved language, source ID and UTC day. Authenticated R5 browser smoke test of the production write/save/reload remains outstanding.

## Phase 2b · Central published leadership event instructions (18 October 2026)

In the Event Hub's existing event/day detail view, an R5 or R4 with `events` permissions can now prepare (draft) or publish an additional **NRW leadership instruction**, stored by original source event ID, UTC event day, and locale.

- Published instructions appear directly as a highlighted top step in the **existing Player Dashboard event coach** on that same event/day, without modifying or copying the canonical guide or timetable. This supplies a real one-edit-to-player-visible workflow.
- Drafts remain exclusively in the leadership console. The new unauthenticated `public-guidance` API mode publishes only the `source_key`, `day`, `notes` and update timestamp of explicitly published rows. It never exposes staff notes, private ingame message drafts, player details or transfers.
- The public dashboard will pick up a published instruction on a new load; the original event steps remain intact underneath. The dashboard degrades gracefully if the additional public fetch fails.
- Only events resolved through the original manual/28-day calendar support this editorial overlay. Guide-only reference records and additional custom AllianceOS events are not falsely advertised as feeding the same day-specific coach.
- All internal writes use isolated `aos_event_guidance` with RLS enabled and no anon/authenticated grants; access is checked by the Edge Function against `aos_staff` events feature permission.

Verified through a simulated UI save and day-scoped data overlay and a simulated Player Dashboard event coach render. Authenticated production browser tests are still pending.

## Phase 2c – group once / recurring event / editable day phases (18 October 2026)

User-required mental model: **one Event type -> editable recurrence -> one editor per event day**, rather than a list of dozens of dated event instances. The Event Hub now deduplicates existing dashboard manual entries, 28-day rotation instances, full guides, catalog-only records and additional alliance custom events by event category. Open the accordion for a category to see its individual phases; clicking one opens the day editor.

- NRW **Alliance Brawl** is initialized with anchor 2026-09-14 UTC, a repeat period of 28 days, a 7-calendar-day event window and 6 editable phase days. This preserves the one-week calendar span including the last day while meeting the requested six daily records.
- `aos_event_cycles` stores the per-alliance recurrence settings: group, anchor, interval (1–365 days), full duration (1–14 days), editable phase count, localized name and enabled flag. To protect the original Dashboard calendar, the seeded Brawl cycle has `override_schedule=false`; only an explicit save by leadership sets it true.
- `aos_event_day_templates` stores recurring **day 1–6 etc** instructions (up to 1200 characters), chat text (512), notice text (300), translations and draft/published status by event type and phase, not by calendar date. Original daily plans are used as an editable starting point but never rewritten in place.
- Server permission checks use the existing `aos_staff.events` authorization. Only published phase instructions and enabled cycle settings are served via the new public `public-schedule` API; private chat/notice texts and drafts remain staff-only.
- The shared event generator reads public recurrence settings and applies edited dates only after `override_schedule=true`. The Dashboard consumes the exact same published schedule and overlays published phase notes on the relevant day of every occurrence.
- Old date-specific notes remain accessible under the collapsible **Single occurrence / original guide** section, so no previous messages are lost. The old second "additional events" list is hidden; custom events join the consolidated event list.
- The Overview counter uses the deduplicated event types rather than only newly authored `aos_events` records. Empty phases are not populated with invented entries; legacy daily plans are previewed.
- Additional event types can define their own recurrence and phase counts, but events with multiple variants inside the existing 28-day rotation should be reviewed by NRW leadership before changing their schedule.
- Verification used the actual 20 dashboard records + 18 detailed and 33 catalog guides in a simulated DOM: **23 distinct groups**, **one Brawl** with **six phase rows**, event-cycle and phase-save payloads validated; schedule override simulation confirmed existing rhythm unchanged while override is inactive, changed when explicitly enabled. No authenticated R5 browser write/reload smoke test is claimed.

## Phases 4, 6 and 7 – consolidated functional pass (18 October 2026)

### 4. Alliance laws (without replacing kingdom/NAP Laws)
- Existing private editor saves localized DE/EN/FR/ES alliance rules, drafts, publishes and records every version in `aos_law_versions`.
- The revision-history button fetches earlier snapshots on demand and restores any alliance-law version as a NEW, unpublished draft after checking its current version. Kingdom laws are not editable in this module, even if the input is tampered with. This is enforced on the server **before** any write.
- `aos_law_publications` preserves the most recent explicitly published alliance-law snapshot while a new revision or restoration remains a draft. The existing `/laws.html` page already reads the `public-laws` API and renders these snapshots; NAP-tracker laws are never written or shadowed.
- The editor contains a link to the public laws page. R4 requires the `laws` permission; only law-related payloads are returned to the relevant R4.

### 6. Kingdom transfer planning (real planning, not actual game invitations)
- New `aos_transfer_windows` allows a start/end date, phase status, internal notes, **optional** ordinary/special invitation capacities, and a label; none are made up. Blank capacity means unknown.
- Candidates in existing `aos_transfers` can be assigned to a window and given a separate manual invitation-status field (not sent/sent/accepted/declined), without issuing any Kingshot invite. Filters by window, and live counts of reserved inbound invited/confirmed/completed ordinary and special slots are shown.
- Server verifies the window belongs to the alliance, prevents new reservations in a closed window, and rejects over-capacity reservations for a known slot type where a finite limit was actually entered. Waitlisted and non-reserved candidates do not consume capacity.
- Inbound **observed arrival** confirmation is possible only after the game ID exists as an active member of NRW in the existing roster. The manual transfer status alone never constitutes proof.
- Existing read-only 1044 intra-kingdom alliance moves remain separate and are not copied into the transfer planner.

### 7. Roles/access
- The R5 can assign or update permissions of *existing* Supabase-authenticated accounts as AllianceOS R4, enable/disable access, and explicitly request an invitation to a new account by email. An actual invitation email is sent only if the R5 presses the corresponding button; delivery requires Supabase Auth email configuration.
- The staff overview shows enabled status and permitted modules, with a live grant matrix and the latest authorized `aos_audit` actions. R5 staff changes are recorded.
- Backend redacts unauthorized module records on R4 bootstrap; saving mutations is separately gated by each module. UI hides navigation entries for unauthorized modules. R4 cannot manage R5 or grant themselves higher privileges.
- `aos_transfer_windows` and `aos_law_publications` have RLS enabled with no direct anon/authenticated read or write privileges. The Edge Function uses a validated Supabase access token + alliance-specific `aos_staff` grants.
- NRW remains an advertising-free pilot. No subscription service, messaging/game bot or automated Kingshot game invitation was created.

### Verification boundaries
- Isolated database tables/columns were verified using SQL, and Supabase Edge Function deployed ACTIVE. Static browser JS syntax and integration hooks were checked. No R5-authenticated manual write + reload flow has been run as the user in a browser. Live Auth invitation delivery and actual email configuration have not been tested. No fake transfer window or candidate was inserted into production.

### Deployment limitation encountered in this pass

Supabase Edge Function `allianceos-leitung` v15 was deployed ACTIVE and migration DDL validated. GitHub `main` has all frontend changes, and the new R4 invite-account password setup is included. **Vercel refused a fresh production deployment with HTTP 402, `api-deployments-free-per-day` (over 100 deployments in the daily free quota); the last confirmed READY deployment did not yet include this whole pass.** An explicit production deploy attempt using GitHub `main` returned that limit. Container fallback has Git but not an authenticated Vercel CLI / checkout. Do not claim these new UI features are live on the Vercel domain until the current commit deploys and is verified; keep this deployment caveat in handoff. The backend will accept prior clients throughout the delayed frontend release.
