-- Private AllianceOS Phase 1 tables. Migrated on 2026-10-19.
-- Do not alter NAP's player records, accounts or event sanctions.
create table if not exists public.aos_member_account_links (
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  alt_game_id text not null check (alt_game_id ~ '^[0-9]{1,20}$'),
  main_game_id text not null check (main_game_id ~ '^[0-9]{1,20}$'),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key (alliance_code,alt_game_id),
  check (alt_game_id <> main_game_id)
);
create index if not exists aos_member_account_links_main_idx
  on public.aos_member_account_links(alliance_code,main_game_id);
alter table public.aos_member_account_links enable row level security;
revoke all on public.aos_member_account_links from public,anon,authenticated;
grant all on public.aos_member_account_links to service_role;

create table if not exists public.aos_member_power_history (
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  game_id text not null check (game_id ~ '^[0-9]{1,20}$'),
  observed_on date not null,
  power bigint not null check (power between 0 and 9999999999999),
  fetched_at timestamptz not null,
  source text not null check (source = 'mightpulse_roster'),
  primary key (alliance_code,game_id,observed_on)
);
create index if not exists aos_member_power_history_recent_idx
  on public.aos_member_power_history(alliance_code,observed_on desc);
alter table public.aos_member_power_history enable row level security;
revoke all on public.aos_member_power_history from public,anon,authenticated;
grant all on public.aos_member_power_history to service_role;

-- One genuine starting observation per player, not a fabricated history.
insert into public.aos_member_power_history(alliance_code,game_id,observed_on,power,fetched_at,source)
select alliance_code,game_id,(fetched_at at time zone 'UTC')::date,power,fetched_at,source
from public.aos_member_power_snapshot
where fetched_at is not null and source='mightpulse_roster'
on conflict (alliance_code,game_id,observed_on) do nothing;
