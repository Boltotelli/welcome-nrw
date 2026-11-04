create or replace function public.aos_ssl_save_pool(p_alliance text,p_season text,p_revision integer,p_ids text[],p_actor uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare season public.aos_ssl_seasons;
begin
 select * into season from public.aos_ssl_seasons where alliance_code=p_alliance and season_key=p_season for update;
 if not found then raise exception 'ssl_season_not_found'; end if;
 if clock_timestamp()>=season.registration_closes_at then raise exception 'ssl_registration_closed'; end if;
 if season.revision<>p_revision then raise exception 'ssl_pool_conflict'; end if;
 if p_ids is null or cardinality(p_ids)>500 or exists(select 1 from unnest(p_ids) id where id is null or id !~ '^[0-9]{1,20}$') or cardinality(p_ids)<>(select count(distinct id) from unnest(p_ids) id) then raise exception 'invalid_ssl_pool'; end if;
 if exists(select 1 from unnest(p_ids) as requested(game_id) where not exists(select 1 from aos_ssl_pool p where p.alliance_code=p_alliance and p.season_key=p_season and p.game_id=requested.game_id) and not exists(select 1 from players p where p.alliance_code=p_alliance and p.active and p.game_id=requested.game_id) and not exists(select 1 from aos_fightclub_ssl_guests g where g.alliance_code=p_alliance and g.kingdom_id=1044 and g.active and g.game_id=requested.game_id)) then raise exception 'invalid_ssl_pool_player'; end if;
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
