# Legion reserve slots in FightClub

Swordland, TriAlliance and SSL offer four mutually exclusive roster choices per player: L1, L1 Reserve, L2, L2 Reserve. Edits remain in memory until Save all. The separate reservation flag is stored with the existing legion number; no extra legion codes are introduced.

`docs/fightclub-legion-reserves.sql` adds `is_reserve boolean not null default false` and a constraint permitting true only for legion 1 or 2. Existing active assignments remain active. Old legion 0 reserves retain their original unscoped meaning and are displayed as Reserve · no legion until explicitly assigned; no home legion is guessed.

Read/write responses, scoped SSL read access, checkboxes, quick assignment, filters, overview totals and roster exports carry the flag. Active and reserve groups are counted and copied separately. A missing flag from an older client preserves the saved reserve state; explicit invalid values are rejected.

Reserves are excluded from map selectors, team messages, automatic deployment and leader selection. Saving a reserve clears any map assignment and leader entry for that date/player, including same-legion changes and cleanup retries. Promoting a reserve back to active does not invent a map position. Preview freshness includes the reserve flag.

Tests: `tests/fightclub-reserves.cjs` uses Playwright to verify all four choices in all three events, exclusivity, staged/batch save, persisted reload state, roster exports, map exclusion, automatic deployment exclusion and mobile overflow. `tests/fightclub-reserves-api.cjs` executes the real save/map/leader handlers for each event, optional-field compatibility and invalid input. Existing batch roster and SSL access tests pass.
