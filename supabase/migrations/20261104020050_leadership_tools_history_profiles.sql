-- Each KvK is independently addressable; dates are labels, never overwrite keys.
create table public.aos_tools_kvk_runs (
 id uuid primary key default gen_random_uuid(),
 alliance_code text not null references public.aos_alliances(code),
 data jsonb not null check (jsonb_typeof(data)='object'),
 version integer not null default 1 check (version>0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id),
 legacy_alliance_code text unique
);
create index aos_tools_kvk_runs_alliance_updated on public.aos_tools_kvk_runs(alliance_code,updated_at desc);
alter table public.aos_tools_kvk_runs enable row level security;
revoke all on public.aos_tools_kvk_runs from public,anon,authenticated;
grant select,insert,update on public.aos_tools_kvk_runs to service_role;
create policy tools_runs_service_only on public.aos_tools_kvk_runs for all to service_role using(true) with check(true);
insert into public.aos_tools_kvk_runs(alliance_code,data,version,created_at,updated_at,updated_by,legacy_alliance_code)
 select alliance_code,data,version,updated_at,updated_at,updated_by,alliance_code from public.aos_tools_kvk_state;

-- Explicit ID lookups are cached separately. Never modify tracker membership.
create table public.aos_tools_player_profiles (
 game_id text primary key check(game_id ~ '^[0-9]{1,20}$'),
 profile jsonb not null check(jsonb_typeof(profile)='object'),
 fetched_at timestamptz not null default now()
);
alter table public.aos_tools_player_profiles enable row level security;
revoke all on public.aos_tools_player_profiles from public,anon,authenticated;
grant select,insert,update on public.aos_tools_player_profiles to service_role;
create policy tools_profiles_service_only on public.aos_tools_player_profiles for all to service_role using(true) with check(true);

create or replace function public.aos_tools_player_context(p_game_id text)
returns jsonb language sql stable security invoker set search_path=public as $function$
 with identities as (
  select * from public.players where game_id=p_game_id and p_game_id ~ '^[0-9]{1,20}$'
 ), tracker as (
  select * from identities order by active desc,provider_seen_at desc nulls last,created_at desc,id limit 1
 ), cache as (
  select player_id,name,alliance,tc_level,x,y,shield_state,shield_end_at,fetched_at,kingdom_id
   from public.kingshot_player_cache where kingdom_id=1044 and player_id=p_game_id
  union all
  select player_id,name,alliance,tc_level,x,y,shield_state,shield_end_at,fetched_at,kingdom_id
   from public.location_player_cache where kingdom_id=1044 and player_id=p_game_id
 ), latest as (
  select * from cache order by fetched_at desc nulls last limit 1
 ), power as (
  select * from public.aos_member_power_snapshot where game_id=p_game_id order by fetched_at desc nulls last limit 1
 ), moves as (
  select distinct t.from_alliance,t.to_alliance,t.moved_at
  from public.player_alliance_transfers t join identities i on i.id=t.player_id
 )
 select jsonb_build_object(
  'profile',case when exists(select 1 from latest) or exists(select 1 from tracker) then jsonb_build_object(
   'game_id',p_game_id,'kingdom_id',1044,
   'name',coalesce((select name from latest),(select name from tracker)),
   'alliance',coalesce((select alliance from latest),(select alliance_code from tracker)),
   'tc_level',(select tc_level from latest),'x',(select x from latest),'y',(select y from latest),
   'shield_state',(select shield_state from latest),'shield_end_at',(select shield_end_at from latest),
   'alliance_rank',(select alliance_rank from tracker),'alliance_rank_label',(select alliance_rank_label from tracker),
   'power',(select power from power),'power_observed_at',(select fetched_at from power),
   'mystic_trial',(select mystic_trial from power),'mystic_observed_at',(select mystic_trial_fetched_at from power),
   'fetched_at',coalesce((select fetched_at from latest),(select provider_seen_at from tracker)),
   'source','supabase'
  ) else null end,
  'alliance_history',coalesce((select jsonb_agg(jsonb_build_object('from_alliance',from_alliance,'to_alliance',to_alliance,'moved_at',moved_at) order by moved_at desc,from_alliance,to_alliance) from moves),'[]'::jsonb)
 );
$function$;
revoke all on function public.aos_tools_player_context(text) from public,anon,authenticated;
grant execute on function public.aos_tools_player_context(text) to service_role;
