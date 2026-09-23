# NAP Event Tracker 2.0 Test

Isolated test frontend for the Kingshot 1044 NAP Event Tracker.

- Vercel project: `nap-event-tracker-test`
- Target domain: `nap-event-tracker-test.vercel.app`
- Git root directory: `nap-event-tracker-test`
- Production frontend remains in `nap-event-tracker/`
- Backend stays on the existing Supabase project.
- This test build starts from the current production logic and layers the 2.0 UI on top.

## Phase 1
- 2.0 desktop/sidebar + mobile More navigation
- dark/light theme
- Home 2.0 driven by live alliance data
- direct Level 1/2/3 action buttons on Home
- relevant alliance transfers only
- NAP-wide overdue-action RPC (>24h)
- notification bell
- initial KvK/Performance 2.0 views

The production app is not changed by files in this directory.
