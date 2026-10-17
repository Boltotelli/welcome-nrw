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
