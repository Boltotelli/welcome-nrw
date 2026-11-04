# Leadership Tools

The Tools module uses the normal leadership login and the separate `tools` module permission. Defaults are seeded only for the existing verified Boltotelli (152394512), Jey (151869669), and Admin Auth identities. The ordinary owner bypass remains in effect. Existing owners can change the permission using the standard rights editor. Newly provisioned leaders default to no Tools access. SSL-only guests cannot access these routes.

## KvK calculator

- Six exact case-sensitive tags: NRW, NWO, THM, CWR, PxR, NwO.
- One common pre-Prep power/member snapshot. Optional name and snapshot date.
- Independent raw Prep points for days 1–5 and overall. No assumptions about totals or unfinished days. Blank is missing; an explicit 0 is valid for points.
- Formula verified against the current published NAP Law 9: `points / (power ** 0.7 * members ** 0.3)`. No scaling or intermediate rounding. Compare unrounded scores; output three decimal places with a decimal comma, matching the prior chat examples. Exact ties share a competition rank.
- Inputs accept whole digits or correctly grouped German thousands dots. They reject decimals, abbreviations, scientific notation, negative values and integers above JavaScript's safe range. The UI formats on blur. Powers and member counts must be positive when provided; partial drafts may contain nulls.
- Chat output contains only `rank. alliance - score`, one row per alliance. Copy requires all six valid snapshots and selected-period scores. If the clipboard is unavailable, show and select a plain text fallback.
- Each KvK is saved explicitly as an independent `aos_tools_kvk_runs` UUID with title and snapshot date. The original `aos_tools_kvk_state` row was copied without changing any input; the legacy row remains intact. A date is a label, not an upsert key. The archive picker switches saved runs and New KvK creates a separate draft. Unsaved switches require confirmation. Older clients without a run UUID are rejected instead of guessing which run to overwrite. Updates use a version compare-and-swap; stale writers receive 409 and keep their inputs. Input changes during a save remain dirty. Navigation within the module preserves drafts, language changes preserve valid inputs, and page unload warns about unsaved changes. No private data is stored in localStorage.

## Player ID lookup

`tools_player_lookup` calls the service-only, `SECURITY INVOKER` RPCs `aos_tools_player_lookup` and `aos_tools_player_context`, plus the separate Tools profile cache. Normal search reads saved data only. `tools_player_refresh` performs one explicit MightPulse base/ranks lookup by governor ID and caches only normalized profile fields in `aos_tools_player_profiles`. Repeated clicks within two minutes use the cache. Neither path modifies players, aliases, violations, membership, or the existing shared provider caches.

- Exact game ID resolves all matching `players.id` records; current tracker name and former names are shown. Names are escaped as text.
- Active count: existing violations with no expiration or an expiration after the query timestamp. Total: existing active + expired violations. Both join through `violations.player_id`, never through loose name matching.
- Deleted records are a separate count, excluded from active and total. Historic `violation_deleted` audit entries lack the subject game/player ID. The separate count therefore matches exact, case-insensitive known names in the source alliance, rejects names shared with another tracked game ID, deduplicates by violation UUID, and excludes records that currently exist again. Ambiguous candidates are disclosed separately and not counted. The UI explains this limited historical attribution. `deleted_by_game_id` identifies the deleting officer and is never treated as the subject.
- Only aggregate counts and names leave the API. Notes, evidence, reasons and unrelated player records are not returned. Unknown IDs are distinct from a database failure.

## Isolation and verification

All three Tools actions require verified staff access plus the `tools` permission before any data read/write. Direct `anon` and `authenticated` access to the workspace and lookup RPC is revoked. The workspace has RLS enabled and a service-only policy. No changes to existing source-table grants, Auth, credentials, or NAP CRUD functions.

Verified with `tests/tools-model.cjs` (formula, input validation, permissions and conflicting writes), `tests/tools-ui.cjs` (real app under isolated API fixtures, clipboard, retries/conflicts, mobile, language, escaping and access visibility), the SSL-only dispatcher regression suite, and live read-only database checks comparing exact-ID counts and role privileges. Browser fixtures are synthetic and do not change real player data.

## Profile fields and source availability

| Fields | Existing Supabase source before this extension | Manual provider refresh |
| --- | --- | --- |
| Game ID, saved name, alliance, alliance rank | players; shared kingdom caches | MightPulse base |
| Previous names | player_aliases and tracker identities | Does not invent retrospective names |
| Confirmed alliance transfers | player_alliance_transfers joined by player UUID/game ID | Current alliance only; provider API has no documented retrospective transfer endpoint |
| Power, Mystic Trial score | aos_member_power_snapshot, when observed | base power + ranks.mystic_trial |
| Town Center, coordinates, shield | kingshot_player_cache / location_player_cache, when observed | base town_center_level, x/y, shield_endtime |
| Kills, personal power/kill ranks, migrant score/rank, Mystic rank, burn end time | Not previously persisted as complete Tools profile fields | base kills/burn_endtime + ranks fields |

The profile displays all requested fields, using an em dash for unavailable values and showing retrieval/provider timestamps. Original power and Mystic observation times are retained as per-field tooltips. It does not use MightPulse online/last-active fields because the provider documents these as stale. Missing tracker records have unknown violation counts, not zero. An explicit API lookup can return a player from any kingdom; display the returned kingdom and never silently assign 1044 or enroll a player into NRW.

Current API documentation: https://api.mightpulse.com/ . Includes `base,ranks` in a single request, uses the existing server-side `KINGSHOTSTATS_API_KEY`, verifies the returned governor ID rather than internal UID, uses the documented 90-second refresh wait, handles 404/429 separately, preserves prior cache on error, and exposes no provider credentials. Provider data may be up to an hour old; the UI states that limitation.

Additional verification: `tests/tools-player.cjs` covers normalized profile fields, foreign kingdoms, absent values versus zero, timestamps, ID mismatch, cache reuse, provider errors, and the absence of tracker writes. The UI test creates two distinct runs, switches back without losing the original, checks stored alliance changes, fetches a missing foreign-kingdom player explicitly, and preserves values on rate-limit errors.
