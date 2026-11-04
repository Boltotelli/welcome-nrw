# Leadership Tools

The Tools module uses the normal leadership login and the separate `tools` module permission. Defaults are seeded only for the existing verified Boltotelli (152394512), Jey (151869669), and Admin Auth identities. The ordinary owner bypass remains in effect. Existing owners can change the permission using the standard rights editor. Newly provisioned leaders default to no Tools access. SSL-only guests cannot access these routes.

## KvK calculator

- Six exact case-sensitive tags: NRW, NWO, THM, CWR, PxR, NwO.
- One common pre-Prep power/member snapshot. Optional name and snapshot date.
- Independent raw Prep points for days 1–5 and overall. No assumptions about totals or unfinished days. Blank is missing; an explicit 0 is valid for points.
- Formula verified against the current published NAP Law 9: `points / (power ** 0.7 * members ** 0.3)`. No scaling or intermediate rounding. Compare unrounded scores; output three decimal places with a decimal comma, matching the prior chat examples. Exact ties share a competition rank.
- Inputs accept whole digits or correctly grouped German thousands dots. They reject decimals, abbreviations, scientific notation, negative values and integers above JavaScript's safe range. The UI formats on blur. Powers and member counts must be positive when provided; partial drafts may contain nulls.
- Chat output contains only `rank. alliance - score`, one row per alliance. Copy requires all six valid snapshots and selected-period scores. If the clipboard is unavailable, show and select a plain text fallback.
- The shared current workspace is saved explicitly to `aos_tools_kvk_state`. Updates use a version compare-and-swap; stale writers receive 409 and keep their inputs. Input changes during a save remain dirty. Navigation within the module preserves drafts, language changes preserve valid inputs, and page unload warns about unsaved changes. No private data is stored in localStorage.

## Player ID lookup

`tools_player_lookup` calls the service-only, `SECURITY INVOKER` RPC `aos_tools_player_lookup`. It reads existing tracker records; it does not call MightPulse or modify players, aliases, violations, audit logs or membership.

- Exact game ID resolves all matching `players.id` records; current tracker name and former names are shown. Names are escaped as text.
- Active count: existing violations with no expiration or an expiration after the query timestamp. Total: existing active + expired violations. Both join through `violations.player_id`, never through loose name matching.
- Deleted records are a separate count, excluded from active and total. Historic `violation_deleted` audit entries lack the subject game/player ID. The separate count therefore matches exact, case-insensitive known names in the source alliance, rejects names shared with another tracked game ID, deduplicates by violation UUID, and excludes records that currently exist again. Ambiguous candidates are disclosed separately and not counted. The UI explains this limited historical attribution. `deleted_by_game_id` identifies the deleting officer and is never treated as the subject.
- Only aggregate counts and names leave the API. Notes, evidence, reasons and unrelated player records are not returned. Unknown IDs are distinct from a database failure.

## Isolation and verification

All three Tools actions require verified staff access plus the `tools` permission before any data read/write. Direct `anon` and `authenticated` access to the workspace and lookup RPC is revoked. The workspace has RLS enabled and a service-only policy. No changes to existing source-table grants, Auth, credentials, or NAP CRUD functions.

Verified with `tests/tools-model.cjs` (formula, input validation, permissions and conflicting writes), `tests/tools-ui.cjs` (real app under isolated API fixtures, clipboard, retries/conflicts, mobile, language, escaping and access visibility), the SSL-only dispatcher regression suite, and live read-only database checks comparing exact-ID counts and role privileges. Browser fixtures are synthetic and do not change real player data.
