-- AllianceOS FightClub location assignments for Swordland + TriAlliance.
-- Scoped by alliance, event and full UTC battle date. One active objective per
-- account per event; multiple players may share a target. Private R4/R5 data.
create table if not exists public.aos_fightclub_map_assignments (
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  event_type text not null check(event_type in ('swordland','triforce')),
  battle_date date not null,
  game_id text not null check(game_id ~ '^[0-9]{1,20}$'),
  location_key text not null check(length(location_key) between 2 and 32),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key(alliance_code,event_type,battle_date,game_id),
  constraint aos_fightclub_map_player_fkey
    foreign key(alliance_code,event_type,battle_date,game_id)
    references public.aos_fightclub_assignments(alliance_code,event_type,battle_date,game_id)
    on delete cascade
);
create index if not exists aos_fightclub_map_by_objective_idx
  on public.aos_fightclub_map_assignments(alliance_code,event_type,battle_date,location_key);
alter table public.aos_fightclub_map_assignments enable row level security;
revoke all on public.aos_fightclub_map_assignments from public,anon,authenticated;
grant all on public.aos_fightclub_map_assignments to service_role;
