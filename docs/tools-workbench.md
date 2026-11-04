# Leadership Tools workbench

Implemented 2026-11-04 in the existing Tools module. Existing `tools` permission and its owner bypass remain unchanged; no additional grants were assigned. All new actions pass through the same verified staff check before database access. No changes to NAP CRUD, roster membership, Discord scheduling, existing KvK data or Auth.

## Shared documents

`aos_tools_documents` stores announcement templates, Rally-Sync plans and territory week snapshots. UUID identity, kind and alliance are checked on each request. Updates and deletes match the saved version; stale writers cannot overwrite another officer. Inputs stay in memory when switching tools. Saving, cloning, archive loading, list refresh and explicit deletion are available. Private data is not stored in localStorage. All four new screens use the selected app language (DE/EN/FR/ES), including controlled catalog labels, accessibility text, confirmations, errors, provider statuses and generated chat output. Existing user content, names, game tags and persisted outpost-type values are never translated. The existing KvK and player lookup translations remain intact.

## Announcement editor

2,000 UTF-16 code units, separate Alliance/Chat modes, insertion at selection/cursor, bold, italic, color, symbols, coordinate links, plain text preview, clipboard with manual fallback, and shared templates. Game tags are copied as text, never executed as HTML. Format support not validated in Kingshot is labelled. The complete reference palette is included: 27 item tags, 32 private-use game characters and all 47 symbols in five groups. Every item tag and character was checked by clicking its reference button and reading the resulting draft, then restoring the empty reference draft. 22 locally hosted game images provide previews; entries without source images retain their names. German and English names are searchable. No resource or private-use IDs were guessed. No external community publishing or message sending.

## Rally-Sync

Explicit UTC date/time, per-leader gather and march durations (`mm:ss`), reorderable leaders and arrival spacing in seconds. `start = arrival - march - gather`. Midnight crossings retain the correct date. Live countdown derives from the clock rather than decrementing a counter. Save plans and copy chat instructions. No automated game actions or promise of exact arrival when in-game speed changes.

## Territory

12 Sanctuaries and 4 Fortresses, coordinates and an eight-phase reward-type reference from https://kingshotwiki.com/alliance-ruins/ruins/ (checked 2026-11-04). Quantities and phase context are explicitly not claimed as verified live game data. An unidentified image remains linked as "Belohnung laut Wiki (Bild)" instead of inventing its contents. The current phase is selected manually; no assumed season anchor for 1044. Each snapshot may override reward text. Assigned alliance and actual holder remain separate.

Published Laws 8 and 9 are read-only. Complete saved KvK overall results can supply the normalized selection order; tied ranks are retained. Building allocation remains an officer decision. New/clone permits keeping an independent history of weekly decisions.

Outposts are manual entries with type, level, ownership and territory connection. The completeness comparison counts one connected owned type/level group once. It does not claim every missing group is available on the map or invent bonus percentages.

## Gift codes: bulk only

One code, recipient checkboxes defaulting to active NRW members, optional linked external accounts with an explicitly entered kingdom, one bulk start and saved results per recipient. No single-redemption screen, personal code library or subscription service.

`aos_tools_gift_runs` snapshots the selected eligible recipients. Eligibility is checked server-side against active NRW members and their linked alts. `aos_tools_gift_receipts` deduplicates by alliance/code/game ID across runs. A service-only `SECURITY INVOKER` RPC uses a transaction advisory lock and a processing claim to prevent two tabs sending the same redemption. A two-second minimum between claims applies per alliance.

Each browser step performs at most one provider request with a 20-second timeout. The browser waits between steps and can pause after the current player. Closing/navigating away stops further requests; unfinished recipients can be resumed explicitly. Status is stored before proceeding. Interrupted processing claims become unknown after two minutes. Unknown outcomes pause and require an explicit, warned retry. Confirmed success/already-used never sends again. Recipient throttle permits a later explicit retry; invalid/expired/capped codes stop the loop. Unrecognized replies are never labelled success. Existing provider replies recorded by this app are the only basis for status, not an assertion about all past redemptions in game.

Integration follows the public client's signed form (`cdk`, `fid`, `kid`, Unix-seconds `time`, MD5 `sign`) at the Century Games gift endpoint, documented by https://github.com/Gercekefsane/kingshot-bot/blob/main/API_ENDPOINTS.md . The public-client signing value is not an account credential. Hash dependency is pinned to `blueimp-md5@2.19.0`. No password, CAPTCHA solver, proxy rotation, or paid redemption service. The endpoint is not presented as a supported official developer API. No real code was redeemed during development; first successful provider redemption remains to be confirmed by a user-started run with a valid code.

## Verification

- `tests/notice-palette.cjs`: independent reference fixture parity for all 27 tags, 32 code points, 47 symbols and valid local PNGs. The browser suite clicks every icon and checks exact insertion, cursor position, clipboard, search and loaded previews.
- `tests/tools-workbench-model.cjs`: midnight/stagger math, limits, coordinate validation, duplicate outpost groups, backend input validation, gift request payload, receipt reservation and unknown outcomes.
- `tests/tools-workbench-ui.cjs`: full leadership app fixtures, cursor formatting, saved templates/plans/weeks, territory phase changes, bulk recipients, uncertainty pause/deliberate retry, no repeats of confirmed success, escaped names, permission visibility, mobile overflow and screenshots.
- The same browser suite passed using the actual published Vercel HTML/CSS/JS (`TOOLS_LIVE_ASSETS=1`) with all API calls still intercepted by synthetic fixtures. Create-run failures leave the bulk start usable for retry.
- Existing `tests/tools-model.cjs`, `tests/tools-ui.cjs`, `tests/tools-player.cjs` pass. New actions are included in the permission-before-I/O tests.
- Live SQL assertions verify duplicate processing/success claims, rolled back with no test receipts remaining. New tables have RLS and no anon/authenticated privileges; the reservation RPC is service-only. Security advisor finding counts match the pre-change baseline; no new workbench findings.

Design follows the existing requested Neumorph shell and typography. The taste-skill app draw selected true-black-flat as a composition reference; its flat-surface prescription was overridden by the user's explicit Neumorph preference. Main content is an editable message, start schedule, allocation table or redemption results, with advanced settings collapsed.

## Four-language release checks

`tools-workbench-locales.js` is the shared DE/EN/FR/ES catalog. `tests/tools-workbench-i18n-model.cjs` verifies key and placeholder parity plus coverage of every icon, reward, outpost type, tool title and validation error. `tests/tools-workbench-i18n-ui.cjs` switches through all four languages in all four screens, checks untranslated UI copy, dialogs/errors/statuses/chat output, unchanged drafts/game tags/IDs, persisted API values, and mobile overflow. The selected UI language also changes during existing work; coordinate/color/filter/selection inputs remain in memory. Published law translations are preferred. The known Law 8/9 text has a controlled translation fallback; changed laws without a translation are shown with an explicit source-language notice instead of claiming an invented translation.
