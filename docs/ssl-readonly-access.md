# SSL read-only guest access

Owner/admin management: Allianz & Rechte → SSL-Gastzugänge · nur lesen. Enter a display name to create a separate Auth account. Generated username and random password appear once in the existing credentials dialog. Credentials are not stored in SQL, logs or audit. Owners can disable/re-enable accounts and issue a new password. No guest account is created automatically by deployment.

Guest entry: `leitung/ssl.html` (also linked from the leadership login). Uses a separate auth storage key from leadership. It only calls authenticated GET `mode=ssl-view`, optionally with a selected date. It displays planned SSL players, legion and reserve lists, map objectives, Mystic Trial and copyable in-game team messages. It does not load the leadership bootstrap.

Security: `aos_ssl_viewers` is separate from `aos_staff`, RLS enabled, no anon/authenticated table privileges, service-role-only policy. Every read verifies the Supabase user and enabled viewer row; user metadata never authorizes access. Disabling blocks the next read even with an existing token. Existing in-browser content cannot be recalled. Reads select explicit allowlists and SSL-only/date/alliance scopes. Notes, no-show markers, dossiers, general power and unrelated players are not selected or returned. Guest accounts have no staff row, so the unchanged staff gate rejects every management action and every other protected module. Public endpoints remain public as before.

Only the existing NRW owner/admin can create, list, enable/disable and reset viewers. A failed profile insertion cleans up only the newly created Auth identity. Guest users are not invited into NRW or assigned a game rank. Password reset changes the login password; use Sperren to revoke data access for existing sessions.

Deployment: apply `docs/ssl-viewers-schema.sql`, deploy `index.ts`, `fightclub-ssl.ts`, `ssl-access.ts` together, then publish the static UI. Auth JWT verification and the existing staff authentication path are unchanged. No email service or new paid service is added.

Verification:
- `tests/ssl-access-api.cjs`: owner-only management, metadata ignored, no password persistence/audit, projection excludes private data, same-session disable, date checks and real request dispatcher rejection of writes/other modules.
- `tests/ssl-access-browser.cjs`: login, roster/map, escaping, filtering, clipboard, mobile overflow, disabled access clears view, GET-only requests, admin creation and disabling, credentials absent from the management list.
- Existing SSL guest API and Playwright suites pass.

API source documentation: https://supabase.com/docs/reference/javascript/auth-admin-createuser

The main leadership name dropdown also lists enabled SSL viewers in a separate SSL group. Selecting one signs in using the dedicated SSL session key and redirects directly to `ssl.html`; no leadership bootstrap is requested. The existing public login directory exposes only display name and generated login identifier for these enabled entries, never Auth UUIDs, passwords or permissions. Disabled viewers are omitted. `tests/ssl-login.cjs` tests the actual main login form, incorrect passwords, session handoff and redirect.
