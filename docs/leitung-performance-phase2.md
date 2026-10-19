# AllianceOS – Phase 2: Performance (GitHub Pages Pilot)

Implemented on 2026-10-19 for NRW. The leadership-facing tab is enabled only on `boltotelli.github.io` and local development, and only when the logged-in R4/R5 has the `members` permission (or the owner flag).

## Sources and meaning

- Power: `aos_member_power_history`. Every row is one real MightPulse alliance-roster observation for a Kingshot Game ID and UTC date, inserted when the existing AllianceOS `power_sync` succeeds. It is **not a snapshot of the entire roster**. The plotted alliance sum is the sum of **observed accounts** on each date; coverage is shown alongside.
- A meaningful change across two dates uses the **intersection of Game IDs observed on both endpoints**, so missing accounts are never counted as zero. The graph of observed sums may change if daily coverage changes.
- Ranking imports: `performance_events` + `player_performance_snapshots` scoped by `alliance_code`. Source rows are read-only. Duplicate frames for the same event and player ID are deduplicated to the **highest observed score**, with the rank attached to that exact frame.
- The NRW position is a position among **imported NRW participants**; it is not a claim of complete alliance rank.
- Server rank is the captured screenshot rank, not necessarily the final rank.
- Historical event total = sum of observed unique participant scores. It must never be presented as an official final alliance score unless a complete/final data source is later verified.
- Missing data is unknown, not zero. `finalized=false` is visibly disclosed.
- Do not use today's power to normalize September or October rankings: a contemporaneous power measurement is needed first.

## Access and endpoints

The new read-only POST action `performance_dashboard` is on `allianceos-leitung`, authenticates via existing `staffFor` and checks `members` permission. No direct public SQL grants were added, and no NAP tables were modified.

The query loads a rolling 90-day window of real power readings, plus the available PvP event imports, and rejects records with unsafe scores.

## Frontend

- GitHub Pages URL: `https://boltotelli.github.io/welcome-nrw/leitung/?tab=performance`
- Separate `leitung/performance.js` module; CSS in `leitung/styles.css`; translations for DE, EN, FR, ES.
- Select 7/30/90 days; choose a measured player or all observed accounts.
- Select KvK Prep or Alliance Mobilization and an imported cycle. Search/filter by name or ID, view raw points and screenshot rank, open a linked player dossier.
- Real-data-only charts and explicit incomplete-data warnings. Mobile layout.

## Still to verify or schedule

- Final live end-to-end authenticated browser test on GitHub Pages (including responsive UI and player-file navigation). Code and service deployment tests are not a substitute for this.
- An **unattended** daily MightPulse trigger is NOT yet configured. At present the existing AllianceOS login/refresh-triggered power sync is the source of new daily readings; repeat calls within 25 minutes use the provider cache. Never copy yesterday's readings into a new day and claim a new measurement.
- Confirm API quota and secure scheduling approach before enabling an unattended daily job.
- Expand rank import coverage where possible, without claiming missing players scored zero.
- Normalized contribution by player strength needs event-date power measurements or another defensible denominator.
