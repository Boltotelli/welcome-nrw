-- NRW recruitment: provider-sourced kingdom-transfer phases and candidate portraits.
-- No changes to production NAP Tracker tables.
alter table public.aos_transfers add column if not exists avatar_url text;
create table if not exists public.aos_transfer_phase_feed (
 alliance_code text primary key references public.aos_alliances(code) on delete cascade,
 kingdom_id integer not null,
 phases jsonb not null default '[]'::jsonb check(jsonb_typeof(phases)='array'),
 fetched_at timestamptz not null default now(),
 source text not null default 'mightpulse_kingdom_events',
 provider_count integer not null default 0
);
alter table public.aos_transfer_phase_feed enable row level security;
revoke all on public.aos_transfer_phase_feed from anon,authenticated;
grant select,insert,update,delete on public.aos_transfer_phase_feed to service_role;
