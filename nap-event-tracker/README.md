# NAP Event Tracker

Git-backed deployment source for the Kingshot 1044 NAP Event Tracker.

## Production
Target Vercel project: `nap-event-tracker`
Production domain: `nap-event-tracker.vercel.app`

## Deployment model
- Source of truth for deployed frontend: `index.html` in this directory.
- Vercel should be connected to this GitHub repository with Root Directory `nap-event-tracker`.
- Pushes to `main` should deploy to production automatically.
- Supabase remains the backend/database and operational configuration store.

## Current source
This file set was initialized from Supabase `public.app_assets.asset_key = full_live_html_v11`.
