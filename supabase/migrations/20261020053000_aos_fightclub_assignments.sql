-- AllianceOS Phase 4 / FightClub. Applied to pilot database 2026-10-20.
-- These are private draft plans, entirely separate from the Discord event bot.
create table if not exists public.aos_fightclub_assignments (
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 event_type text not null check(event_type in ('swordland','triforce')),
 battle_date date not null,
 game_id text not null check(game_id ~ '^[0-9]{1,20}$'),
 legion smallint not null check(legion in (-1,0,1,2)),
 availability text not null default 'unknown' check(availability in ('unknown','full','partial','unavailable')),
 combat_role text not null default 'flex' check(combat_role in ('flex','attack','defense','support')),
 notes text not null default '' check(char_length(notes)<=500),
 updated_at timestamptz not null default now(),
 updated_by uuid,
 primary key(alliance_code,event_type,battle_date,game_id)
);
create index if not exists aos_fightclub_assignments_event_idx
 on public.aos_fightclub_assignments(alliance_code,event_type,battle_date);
alter table public.aos_fightclub_assignments enable row level security;
revoke all on public.aos_fightclub_assignments from public,anon,authenticated;
grant all on public.aos_fightclub_assignments to service_role;
-- Support databases created before unassigned (-1) was introduced:
alter table public.aos_fightclub_assignments drop constraint if exists aos_fightclub_assignments_legion_check;
alter table public.aos_fightclub_assignments add constraint aos_fightclub_assignments_legion_check
 check(legion in (-1,0,1,2));
