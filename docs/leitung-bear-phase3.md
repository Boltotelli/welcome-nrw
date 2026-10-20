# AllianceOS – Phase 3: Bear Trap Management

Implemented for NRW as a **GitHub Pages-only leadership pilot** on 2026-10-20.

## What the first version does

- R4/R5 with `members` permission can assign each active Kingshot Game ID to **one primary Bear Trap slot** (17:00 or 18:30 UTC, read from the existing NRW `discord_bear_slots` table).
- Per account: planned starter/joiner/flexible role, leadership-entered confirmed/tentative status, private notes, and unassign.
- Attendance counts per trap and copyable text lists for Discord; nothing is posted automatically.
- Shows read-only **sanitized** Bear Optimizer profiles for players currently belonging to NRW: saved starter-hero selections, star/tier/widget/level, march capacity, join count, troop stock, combat bonuses, data timestamp. These values are user-entered and are **not** a mathematically verified best formation.
- Main/alt reference is displayed when existing Phase 1 links are present. Each Kingshot account remains a distinct planning row.
- DE, EN, FR, ES and mobile layouts.

## Data access / safety

- New table: `aos_bear_assignments` (unique alliance + game ID, one primary slot). This belongs solely to AllianceOS.
- The authenticated `allianceos-leitung` backend exposes two POST actions: `bear_management` (read) and `bear_assignment` (save/remove).
- Both actions require staff `members` permission and confirm the specific alliance; saving also requires an active roster entry and an active slot from the same alliance.
- The service-role backend selects only safe `bear_player_profiles` columns and responds with an allowlisted projection. **Never return** `edit_key_sha256`, recovery info, full unfiltered profile JSON or PIN metadata.
- New table has RLS on and revokes direct access from `anon` and `authenticated`.
- Does not modify Discord rotation, slot definitions, minister roles, optimizer saved profiles, game data, NAP records, or Vercel frontend.
- No individual player logins. `confirmed` is a **leadership-entered** planning flag, not a verified Discord RSVP.

## What's next

- Actual optimization recommendations need **measured damage** under controlled comparable buffs, formations, starter heroes and target conditions. Until then, provide no fake averages or invented damage potential.
- Optional event-date attendance, overrides, player Discord RSVP integration, and multi-account collision warnings after Main/Alt links are populated.
- Live browser end-to-end R4/R5 login and save/remove tests on GitHub Pages are still required; only static module tests, schema/constraint test with ROLLBACK, role grants and backend deployment were verified.
