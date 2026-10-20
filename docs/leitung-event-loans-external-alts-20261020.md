# Pilot update: calendar-day loans and external second accounts (2026-10-20)

## Event loan dates
The Transfer Center accepts **start_date** and **end_date** in YYYY-MM-DD only.
The date range is inclusive in Kingshot's UTC reset calendar. The backend stores:
- starts_at = start_date 00:00:00.000 UTC;
- ends_at = 00:00:00.000 UTC on the **day after** end_date (exclusive).
A one-day loan therefore starts at reset on the selected day and ends at the next reset, no arbitrary hour/minute inputs. Existing safeguards (max 21 days, owner approval, time-bounded optional leader protection, verified destination, automatic return reconciler, audit) remain unchanged. UI displays the inclusive last loan day.

## Main → second accounts outside NRW
Main player dossiers can link multiple external second accounts by Kingshot ID. Optional display_name (80 chars) and reported_alliance (24 chars) are manually entered labels, not live API verification. Each linked ID can have only one NRW main and cannot be itself a main. External links have a remove control and appear inside the main dossier and its count badge.

The existing `aos_member_account_links` database table is reused. No external player is inserted into `players`, counted as an active NRW member, or given a login, rank, Discord role or permissions. The owner/main must be an active verified NRW player. Server-side mutations require `members` permission, and every change is audited. Links do not alter NAP or transfer logs.

Only external accounts absent from the NRW roster receive the distinct manual external card. Existing in-roster Main/Alt links remain unchanged.

## Verification
- Database migration applied (two optional columns) and committed.
- Test insert transaction rolled back, no persistent synthetic account.
- JS rendering checked in DE/EN/FR/ES for external manual links and date fields.
- Client API payload validated to send only YYYY-MM-DD dates.
- Supabase Edge Function v52 active and repository source matched.
- The automatic GitHub Pages deployment publishes the private test pilot; Vercel production is not changed.
- A real authenticated browser test with an authorized NRW member is recommended.
