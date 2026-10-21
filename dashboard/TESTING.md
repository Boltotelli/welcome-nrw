# Player Dashboard 2.0 verification

The application remains static HTML/CSS/JS; no build or runtime dependency was added.

Run pure behavior and backend-boundary regressions with Node 24:

```sh
node dashboard/test-player-core.cjs
node supabase/tests/test-announcement.cjs
```

The browser suite requires an installed Playwright package and its Chromium:

```sh
node dashboard/test-player-browser.cjs
```

`NRW_PLAYWRIGHT_MODULE` can point to an existing Playwright installation and `NRW_CHROMIUM_EXECUTABLE` to an existing Chromium binary. No installation is performed by the test. `NRW_QA_OUTPUT_DIR` selects screenshots/JSON output; the default is `test-results/player-dashboard`.

Browser requests use the actual local source with isolated API/announcement fixtures and a controlled UTC clock. Existing remote game pictures are read from their original URLs. The suite checks task persistence across reload/languages, event/date isolation at midnight, notice expiry and fallback, guide search/catalog distinction, compact-mode persistence, four viewport widths, both themes and preserved navigation. It makes no real profile or announcement writes.

To inspect deployed assets with the same isolated fixtures, set `PLAYER_LIVE=1` and `PLAYER_HOST` to the approved origin. GitHub Pages uses `/welcome-nrw/dashboard/`; Vercel uses `/dashboard/`. This tests the actual shipped HTML/CSS/JS, not production authorization or real player records. Public API smoke tests and the database transaction/privilege checks are separate release checks.

Instruction metadata is derived from existing canonical English instructions; localized content stays in the incumbent event and guide data. Regenerate after reviewing source changes with `node dashboard/build-task-rules.cjs`, review the metadata diff, and rerun tests. Do not attach guessed timings to unstructured leadership text. UTC Intel boundaries and Bear starts come only from confirmed existing data; unknown windows retain general advice.

The announcement migration version `20261021145815` was assigned by the database migration service. The service-role-only invoker RPC writes the notice revision and audit event atomically. Anonymous/authenticated table and RPC grants are revoked and RLS is enabled. Publication requires the existing server-side events permission; the browser requires a current preview. No NAP table, bot, calendar or authentication model is changed.
