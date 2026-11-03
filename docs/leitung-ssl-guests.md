# FightClub SSL and Kingdom 1044 guests

SSL uses event type `swordland_summit`, with independent dated assignments, leaders, map planning, no-show notes, staged roster changes and exports. Select the actual match date manually. Regular Swordland dates and 14:00/19:00 UTC times are not copied into SSL: league registration and match times are separate.

The SSL guest panel searches cached Kingdom 1044 profiles by name or ID (maximum 25 results). Players missing from this cache can be fetched by ID through the existing MightPulse connection. No documented global provider name-search endpoint is assumed. Adding or refreshing always fetches the ID again and verifies its current kingdom is 1044. Client-supplied profile, kingdom, power and score are ignored.

Guests are stored in `aos_fightclub_ssl_guests`, isolated from NRW membership and Auth. The existing FightClub staff permission is required for every guest action; the API limits these actions to NRW. The table has RLS enabled and only service-role access. Home alliance is retained. Search responses omit map coordinates. API calls occur on click, not in a background polling loop.

Guest profiles participate only in SSL. Removing a guest deactivates it for new dates while retaining dated planning history. Existing dated assignments remain editable. Guest changes require pending roster edits to be saved or discarded first. Guest stat changes invalidate an already opened auto-assignment preview.

Apply `docs/ssl-fightclub-schema.sql` before deploying the entrypoint and `fightclub-ssl.ts` together. Existing authentication, CORS and manual staff authorization remain unchanged. This feature is internal planning, not registration in Kingshot.

Verification: `tests/ssl-guests-api.cjs` executes the helper plus actual assignment/map/leader handlers with isolated test data. `tests/ssl-fightclub.cjs` covers search, lookup validation, add, batch save and attendance, guest score, no SL/Tri leakage, fresh preview checks, map apply and mobile overflow in Playwright. Existing legion matrix and map-objective regression suites also pass.

Official rules:
- https://centurygames.helpshift.com/hc/en/140-kingshot/faq/9218-how-does-swordland-summit-league-work/
- https://centurygames.helpshift.com/hc/en/140-kingshot/faq/9226-swordland-summit-league-battlefield-rules/
- https://api.mightpulse.com/
