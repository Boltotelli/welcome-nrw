create table public.aos_ssl_seasons (
 alliance_code text not null references public.aos_alliances(code),
 season_key text not null,
 registration_closes_at timestamptz not null,
 revision integer not null default 1,
 primary key(alliance_code,season_key)
);
create table public.aos_ssl_matches (
 alliance_code text not null,
 season_key text not null,
 match_key text not null,
 battle_date date not null,
 stage text not null check(stage in ('qualifier','points','championship')),
 round integer not null,
 is_final boolean not null default false,
 primary key(alliance_code,season_key,match_key),
 foreign key(alliance_code,season_key) references public.aos_ssl_seasons
);
create table public.aos_ssl_pool (
 alliance_code text not null,
 season_key text not null,
 game_id text not null check(game_id ~ '^[0-9]{1,20}$'),
 name text not null,
 home_alliance text not null default 'NRW',
 mystic_trial bigint,
 source text not null default 'manual',
 registered_at timestamptz not null default now(),
 registered_by uuid references auth.users(id),
 primary key(alliance_code,season_key,game_id),
 foreign key(alliance_code,season_key) references public.aos_ssl_seasons
);
create table public.aos_ssl_plans (
 alliance_code text not null,
 season_key text not null,
 match_key text not null,
 game_id text not null,
 legion smallint not null check(legion in (-1,0,1,2)),
 is_reserve boolean not null default false check(not is_reserve or legion in (1,2)),
 availability text not null check(availability in ('unknown','full','partial','unavailable')),
 combat_role text not null check(combat_role in ('flex','attack','defense','support')),
 notes text not null default '' check(length(notes)<=500),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id),
 primary key(alliance_code,season_key,match_key,game_id),
 foreign key(alliance_code,season_key,match_key) references public.aos_ssl_matches,
 foreign key(alliance_code,season_key,game_id) references public.aos_ssl_pool on delete restrict,
 check(not (legion in (1,2) and availability='unavailable'))
);
create table public.aos_ssl_map_plans (
 alliance_code text not null,season_key text not null,match_key text not null,game_id text not null,
 location_key text not null,
 updated_at timestamptz not null default now(),updated_by uuid not null references auth.users(id),
 primary key(alliance_code,season_key,match_key,game_id),
 foreign key(alliance_code,season_key,match_key,game_id) references public.aos_ssl_plans on delete cascade
);
create table public.aos_ssl_leaders (
 alliance_code text not null,season_key text not null,match_key text not null,legion smallint not null check(legion in (1,2)),game_id text not null,
 updated_at timestamptz not null default now(),updated_by uuid not null references auth.users(id),
 primary key(alliance_code,season_key,match_key,legion),
 foreign key(alliance_code,season_key,match_key,game_id) references public.aos_ssl_plans on delete cascade
);
insert into public.aos_ssl_seasons values('NRW','2026-season-2','2026-11-07T00:00:00Z',1);
insert into public.aos_ssl_matches(alliance_code,season_key,match_key,battle_date,stage,round,is_final) values
 ('NRW','2026-season-2','qualifier-1','2026-11-08','qualifier',1,false),
 ('NRW','2026-season-2','qualifier-2','2026-11-15','qualifier',2,false),
 ('NRW','2026-season-2','qualifier-3','2026-11-22','qualifier',3,false),
 ('NRW','2026-season-2','qualifier-4','2026-11-29','qualifier',4,false),
 ('NRW','2026-season-2','points-1','2026-11-15','points',1,false),
 ('NRW','2026-season-2','points-2','2026-11-22','points',2,false),
 ('NRW','2026-season-2','points-3','2026-11-29','points',3,false),
 ('NRW','2026-season-2','points-4','2026-12-06','points',4,false),
 ('NRW','2026-season-2','points-5','2026-12-11','points',5,false),
 ('NRW','2026-season-2','championship-1','2026-12-06','championship',1,false),
 ('NRW','2026-season-2','championship-2','2026-12-11','championship',2,false),
 ('NRW','2026-season-2','championship-final','2026-12-13','championship',3,true);
-- Preserve the existing first-round work. This is an officer planning pool,
-- never a claim that game-side registration was performed or verified.
insert into public.aos_ssl_pool(alliance_code,season_key,game_id,name,home_alliance,mystic_trial,source,registered_by)
select distinct on(a.game_id) 'NRW','2026-season-2',a.game_id,coalesce(g.name,p.name,a.game_id),coalesce(g.home_alliance,'NRW'),coalesce(g.mystic_trial,s.mystic_trial),'existing_plan',a.updated_by
from public.aos_fightclub_assignments a
left join public.players p on p.game_id=a.game_id and p.alliance_code='NRW'
left join public.aos_fightclub_ssl_guests g on g.game_id=a.game_id and g.alliance_code='NRW'
left join public.aos_member_power_snapshot s on s.game_id=a.game_id and s.alliance_code='NRW'
where a.alliance_code='NRW' and a.event_type='swordland_summit' and a.battle_date='2026-11-08'
order by a.game_id,p.active desc nulls last;
insert into public.aos_ssl_plans select alliance_code,'2026-season-2','qualifier-1',game_id,legion,is_reserve,availability,combat_role,notes,updated_at,updated_by
from public.aos_fightclub_assignments where alliance_code='NRW' and event_type='swordland_summit' and battle_date='2026-11-08';
insert into public.aos_ssl_map_plans select alliance_code,'2026-season-2','qualifier-1',game_id,location_key,updated_at,updated_by
from public.aos_fightclub_map_assignments m where alliance_code='NRW' and event_type='swordland_summit' and battle_date='2026-11-08' and exists(select 1 from public.aos_ssl_plans p where p.alliance_code=m.alliance_code and p.game_id=m.game_id and p.match_key='qualifier-1');
insert into public.aos_ssl_leaders select alliance_code,'2026-season-2','qualifier-1',legion,game_id,updated_at,updated_by
from public.aos_fightclub_team_leaders l where alliance_code='NRW' and event_type='swordland_summit' and battle_date='2026-11-08' and exists(select 1 from public.aos_ssl_plans p where p.alliance_code=l.alliance_code and p.game_id=l.game_id and p.match_key='qualifier-1');

create function public.aos_ssl_pool_deadline() returns trigger language plpgsql security invoker set search_path=public as $$
declare deadline timestamptz;
begin
 select registration_closes_at into deadline from public.aos_ssl_seasons where alliance_code=coalesce(new.alliance_code,old.alliance_code) and season_key=coalesce(new.season_key,old.season_key);
 if deadline is null or clock_timestamp()>=deadline then raise exception 'ssl_registration_closed' using errcode='P0001'; end if;
 if tg_op='DELETE' then return old; end if;return new;
end $$;
create trigger ssl_pool_deadline before insert or update or delete on public.aos_ssl_pool for each row execute function public.aos_ssl_pool_deadline();
create function public.aos_ssl_save_pool(p_alliance text,p_season text,p_revision integer,p_ids text[],p_actor uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare season public.aos_ssl_seasons;
begin
 select * into season from public.aos_ssl_seasons where alliance_code=p_alliance and season_key=p_season for update;
 if not found then raise exception 'ssl_season_not_found'; end if;
 if clock_timestamp()>=season.registration_closes_at then raise exception 'ssl_registration_closed'; end if;
 if season.revision<>p_revision then raise exception 'ssl_pool_conflict'; end if;
 if p_ids is null or cardinality(p_ids)>500 or exists(select 1 from unnest(p_ids) id where id is null or id !~ '^[0-9]{1,20}$') or cardinality(p_ids)<>(select count(distinct id) from unnest(p_ids) id) then raise exception 'invalid_ssl_pool'; end if;
 if exists(select 1 from unnest(p_ids) id where not exists(select 1 from aos_ssl_pool p where p.alliance_code=p_alliance and p.season_key=p_season and p.game_id=id) and not exists(select 1 from players p where p.alliance_code=p_alliance and p.active and p.game_id=id) and not exists(select 1 from aos_fightclub_ssl_guests g where g.alliance_code=p_alliance and g.kingdom_id=1044 and g.active and g.game_id=id)) then raise exception 'invalid_ssl_pool_player'; end if;
 -- RESTRICT keeps match notes, placements and leaders from disappearing on withdrawal.
 if exists(select 1 from aos_ssl_plans p where p.alliance_code=p_alliance and p.season_key=p_season and not(p.game_id=any(p_ids))) then raise exception 'ssl_pool_player_has_plans'; end if;
 delete from aos_ssl_pool where alliance_code=p_alliance and season_key=p_season and not(game_id=any(p_ids));
 insert into aos_ssl_pool(alliance_code,season_key,game_id,name,home_alliance,mystic_trial,registered_by)
 select distinct on(c.game_id) p_alliance,p_season,c.game_id,c.name,c.home_alliance,c.mystic_trial,p_actor from (
  select p.game_id,p.name,p_alliance as home_alliance,s.mystic_trial,0 as priority from players p left join aos_member_power_snapshot s on s.alliance_code=p_alliance and s.game_id=p.game_id where p.alliance_code=p_alliance and p.active and p.game_id=any(p_ids)
  union all select game_id,name,home_alliance,mystic_trial,1 from aos_fightclub_ssl_guests where alliance_code=p_alliance and kingdom_id=1044 and active and game_id=any(p_ids)
 ) c order by c.game_id,c.priority on conflict do nothing;
 update aos_ssl_seasons set revision=revision+1 where alliance_code=p_alliance and season_key=p_season;
 return jsonb_build_object('revision',p_revision+1);
end $$;
revoke all on function public.aos_ssl_pool_deadline() from public,anon,authenticated;
revoke all on function public.aos_ssl_save_pool(text,text,integer,text[],uuid) from public,anon,authenticated;
grant execute on function public.aos_ssl_save_pool(text,text,integer,text[],uuid) to service_role;
do $$ declare t text; begin foreach t in array array['aos_ssl_seasons','aos_ssl_matches','aos_ssl_pool','aos_ssl_plans','aos_ssl_map_plans','aos_ssl_leaders'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select,insert,update,delete on public.%I to service_role',t);
 execute format('create policy ssl_service_only on public.%I for all to service_role using(true) with check(true)',t);
end loop;end $$;

create index aos_ssl_plans_pool_idx on public.aos_ssl_plans(alliance_code,season_key,game_id);
create index aos_ssl_leaders_player_idx on public.aos_ssl_leaders(alliance_code,season_key,match_key,game_id);
grant execute on function public.aos_ssl_pool_deadline() to service_role;
