# AllianceOS Phase 4: FightClub (GitHub Pages pilot)

Implemented 2026-10-20 for NRW and designed for subsequent testing before production UI release.

## Coverage

- **Swordland** (backend `swordland`) and **TriAlliance** (existing Discord `triforce`) organized separately.
- Manual planning **date** is required. Existing dates come from the read-only Discord special event cycles; their past legion start times are displayed only when known. Manual future dates must **not** be presented as provider-confirmed events, and no future game date is guessed.
- One **planning entry** per Game ID, alliance, event type and date.
- Each player can be explicitly **unassigned (-1)**, **reserve (0)**, **Legion 1 (1)** or **Legion 2 (2)**.
- Leader-entered availability: unknown / full / partial / unavailable. Combat role: flexible / attack / defense / support. Private notes.
- Suggestions show **only saved available candidates** and sort by the actual cached MightPulse power (not combat strength). Staff must explicitly save placements; none are automated.
- Shows counts, strength coverage, time labels, mobile roster and copyable plaintext Legion 1 / Legion 2 / Reserve lists.
- Detects when already linked main and alt are both assigned to the same event and highlights that coordination risk.
- DE, EN, FR and ES labels.

## Access and data protection

- The new table `aos_fightclub_assignments` has RLS enabled with no anonymous/authenticated direct read grants. The only access is the existing authenticated `allianceos-leitung` staff function via `fightclub_data` and `fightclub_save`; both enforce the `members` permission.
- Save checks that the player is **active in NRW** and the event/date/role/status are valid. The unique primary key prevents the same Game ID being placed twice for one event/date.
- Data are **draft leadership plans**, not confirmed in-game registrations or official Discord RSVPs.
- The Discord event bot, minister settings, existing event schedules, and NAP player records remain unchanged.
- The Vercel leadership frontend does not expose the pilot tab. GitHub Pages currently hosts it.

## Boundaries and next steps

- Cached power is a *general* power number, not combat effectiveness, hero/troop suitability, or a reliable guarantee of strength. Unknown power stays unknown.
- No arbitrary legion capacities, automatic assignments, inferred participation or estimated future event times.
- Availability is recorded by staff because regular players have no AllianceOS login; Discord-bot RSVPs can be added separately later, with verified game-ID linking.
- Need authenticated browser end-to-end test with an authorized R4/R5 login, including navigation, mobile layout, save/delete, and clipboard permissions. Mocked UI interactions, SQL transaction rollback and function deployment are already verified.
