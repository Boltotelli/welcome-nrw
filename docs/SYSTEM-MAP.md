# Kingshot 1044 — System Map

This file is a migration-time inventory. It is intentionally descriptive and must not be treated as authorization to modify unrelated systems.

## Applications

### NRW Welcome / Player Dashboard
- Source: Boltotelli/welcome-nrw
- Production: Vercel project welcome-nrw
- Source includes public Welcome page, laws page and dashboard
- Shared backend: Supabase project bdzlgirowutasrsycjfj

### NAP Event Tracker
- Current source: Boltotelli/welcome-nrw/nap-event-tracker
- Current development source: Boltotelli/welcome-nrw/nap-event-tracker-test plus fix/nap2-navigation-mobile
- Production Vercel: nap-event-tracker
- Test Vercel: nap-event-tracker-test
- Backend: shared Supabase project
- Planned source repository: Boltotelli/nap-event-tracker

### NAP Admin
- Vercel project: nap-event-tracker-admin
- Backend: shared Supabase project
- Planned dedicated source repository: Boltotelli/nap-event-tracker-admin
- Do not migrate until NAP app repository split is complete.

### Discord bots
Runtime is hosted through Supabase Edge Functions / shared backend.

Known logical apps:
- LocationBot
- 1044 Bot
- AllianceOnboarder

Each should eventually have its own GitHub source repository while runtime may remain on Supabase.

## Shared backend

Supabase project:
- Name: Kingshot 1044 NAP
- Ref: bdzlgirowutasrsycjfj
- Region: eu-central-1

The database remains shared to avoid unnecessary migration risk and additional cost.

Ownership should be documented rather than enforced by moving tables during this cleanup.

## Cleanup principle

Repository = source ownership
Vercel/Supabase = runtime/deployment
Supabase database = shared data platform

Chat history is not a source of truth. Each application repository should carry PROJECT.md and WORK-HANDOFF.md so a new ChatGPT conversation can recover the current state from GitHub.