# Refresh API data after saving a player

Existing player dossiers now offer an explicit Power & Mystic Trial refresh. The saved roster ID is sent to the existing `power_sync` action with `include_listed:true`. The server validates membership in the authoritative visible roster before any provider call. A targeted request bypasses the aggregate roster endpoint, the 25-minute power cache and the hourly score cache and fetches exactly that ID with `include=base,ranks`. Bulk refresh retains its existing cache and batch behavior.

Snapshots and history use the existing tables and source enum. Failures and rate limits preserve previous values and return no fake success player. No schema, membership, Auth or permissions changes are made. API keys remain server-side.

Dossier readouts and history update in place. Inputs, unsaved notes, manual override edits and existing account links remain intact. Saved manual power overrides retain precedence over fresh API power. Busy, failure and rate-limit states remain retryable. A late response cannot update a closed or replaced dossier.

Saved external secondary accounts also offer an API refresh by their stored ID. This reuses the existing members-only lookup and link-save actions, updates only the external link's display name/alliance and preserves its main association. It does not create an NRW membership. It updates the row in place without rebuilding the dossier form.

Verification: `tests/mystic-sync.cjs` covers bulk behavior, targeted fresh-cache bypass, repeated refresh, unknown-ID rejection, null-value retention and 429 handling. `tests/member-api-refresh.cjs` tests the actual app dossier, value/date updates, unchanged unsaved inputs, external-account refresh and provider errors in Playwright.
