# SSL season 2: shared registration, separate match plans

Registration closes at **2026-11-07 00:00 UTC**, as explicitly specified by alliance leadership. This overrides the registration dates in the supplied season image. The manually maintained planning pool does not register players in Kingshot or verify their in-game registration.

The twelve matches use stable stage/round keys. Qualifier and points matches on the same date remain independent, as do points and championship matches. No match times or qualification decisions are inferred. L1, L1 reserve, L2, L2 reserve, availability, attendance notes, positions and leaders are saved per match.

Six service-only RLS tables hold season metadata, matches, pool, plans, map positions and leaders. The existing 16 November 8 planning entries are copied into `qualifier-1` and seed the pool; legacy rows remain untouched. The UI asks officers to compare this carryover with actual game registration.

Pool changes use a revision check and server-side validation of current NRW members / verified active 1044 guests. A database trigger and the save function reject edits at or after the deadline. Players with match plans must have those plans removed before withdrawal, preserving notes and lineups. Pool identity snapshots keep registered players available after leaving NRW. Match membership references the season pool. Read-only SSL accounts receive the pool and all match plans without private notes or write controls.

New UI and errors are translated in DE/EN/FR/ES; language changes preserve unsaved pool and roster edits.

Validation: `ssl-season-api.cjs`, `ssl-season-ui.cjs`, existing authorization/matrix/objective tests; transactional database checks for revision conflicts and exact cutoff (rolled back), carryover equality, table grants, RLS and advisors.

Territory: new snapshots default to phase 4 as of November 5. Historical phases remain unchanged. Reward thumbnails are stored locally with source/checksum metadata in `leitung/assets/territory-rewards/manifest.json` and rendered with translated alternative text. The existing catalog's quantities and phase assignments remain reference data for in-game comparison.
