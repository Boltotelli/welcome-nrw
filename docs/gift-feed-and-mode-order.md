# Shared gift-code feed and planning refinements

The leadership gift library reads the same `/api/kingshot-codes` feed as the Player Dashboard. Active codes are merged with codes from saved bulk runs, deduplicated without changing the active feed's spelling. Every active code offers a direct bulk action using the current recipient selection and existing confirmation, server validation, receipt and pause/retry path. Merely opening or refreshing the feed never redeems anything. Cancelling a card's confirmation preserves the typed code.

The public read-only feed allows the approved GitHub Pages origin to read it. Pages uses the production feed URL; Vercel uses its own origin. Feed requests omit credentials. Fetch failure preserves previously loaded codes with an explicit stale-state label; saved runs remain independently available. New interface text covers DE/EN/FR/ES.

SSL guest search is immediately after the common season-pool summary, ahead of the pool's player-name/ID filter. Season locking and eligibility are unchanged.

The Bear mode choice places advanced damage optimization first and gives it the existing gold primary treatment. Hero-only planning is second with the neutral button treatment. The callbacks and translations remain the same.

Checks: active-code normalization and feed CORS success/error cases; active/historical code merge, all four UI languages, direct confirmation/cancel, failed create and stale refresh in browser fixtures; exact SSL section order; both Bear modes, gold styling and all four languages in mobile Playwright. No real codes were redeemed and no server-side player profile was modified in testing.
