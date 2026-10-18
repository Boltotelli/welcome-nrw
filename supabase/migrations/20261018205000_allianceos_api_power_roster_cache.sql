-- Isolated AllianceOS cache of verified Kingshot/MightPulse alliance roster power.
-- Never update the existing NAP Tracker caches from AllianceOS.
create table if not exists public.aos_member_power_snapshot (
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 game_id text not null,
 power bigint not null check(power>=0 and power<=9999999999999),
 fetched_at timestamptz not null default now(),
 source text not null default 'mightpulse_roster' check(source='mightpulse_roster'),
 primary key(alliance_code,game_id)
);
create index if not exists aos_member_power_snapshot_freshness on public.aos_member_power_snapshot(alliance_code,fetched_at desc);
alter table public.aos_member_power_snapshot enable row level security;
revoke all on public.aos_member_power_snapshot from anon,authenticated;
grant select,insert,update,delete on public.aos_member_power_snapshot to service_role;
