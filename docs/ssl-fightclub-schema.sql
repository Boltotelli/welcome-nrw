-- Extends only FightClub event types and stores SSL guest profiles separately.
alter table public.aos_fightclub_assignments drop constraint aos_fightclub_assignments_event_type_check;
alter table public.aos_fightclub_assignments add constraint aos_fightclub_assignments_event_type_check check(event_type in ('swordland','triforce','swordland_summit'));
alter table public.aos_fightclub_map_assignments drop constraint aos_fightclub_map_assignments_event_type_check;
alter table public.aos_fightclub_map_assignments add constraint aos_fightclub_map_assignments_event_type_check check(event_type in ('swordland','triforce','swordland_summit'));
alter table public.aos_fightclub_team_leaders drop constraint aos_fightclub_team_leaders_event_type_check;
alter table public.aos_fightclub_team_leaders add constraint aos_fightclub_team_leaders_event_type_check check(event_type in ('swordland','triforce','swordland_summit'));
create table public.aos_fightclub_ssl_guests (
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 game_id text not null check(game_id ~ '^[0-9]{1,20}$'),
 name text not null check(length(name)<=100),
 kingdom_id integer not null check(kingdom_id=1044),
 home_alliance text not null default '' check(length(home_alliance)<=40),
 power bigint check(power between 0 and 9999999999999),
 mystic_trial bigint check(mystic_trial between 0 and 9999999999999),
 fetched_at timestamptz not null,
 active boolean not null default true,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null,
 primary key(alliance_code,game_id)
);
alter table public.aos_fightclub_ssl_guests enable row level security;
revoke all on public.aos_fightclub_ssl_guests from anon,authenticated;
grant all on public.aos_fightclub_ssl_guests to service_role;
create policy ssl_guests_service_only on public.aos_fightclub_ssl_guests for all to service_role using(true) with check(true);
