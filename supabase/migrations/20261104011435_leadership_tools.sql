-- Shared leadership Tools workspace. Browser roles have no direct table/RPC access.
create table public.aos_tools_kvk_state (
 alliance_code text primary key references public.aos_alliances(code),
 data jsonb not null check (jsonb_typeof(data)='object'),
 version integer not null default 1 check (version>0),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id)
);
alter table public.aos_tools_kvk_state enable row level security;
revoke all on public.aos_tools_kvk_state from public,anon,authenticated;
grant select,insert,update on public.aos_tools_kvk_state to service_role;
create policy tools_service_only on public.aos_tools_kvk_state for all to service_role using (true) with check (true);

-- Exact game-ID joins for current/expired violations. Historical deletions did
-- not preserve the subject ID; report their separate, conservative name match.
-- Never confuse deleted_by_game_id (the deleting officer) with the subject.
create or replace function public.aos_tools_player_lookup(p_game_id text)
returns jsonb language sql stable security invoker set search_path=public as $function$
 with identities as (
  select id,game_id,name,alliance_code,active,provider_seen_at,created_at
  from public.players where game_id=p_game_id and p_game_id ~ '^[0-9]{1,20}$'
 ), current_player as (
  select * from identities order by active desc,provider_seen_at desc nulls last,created_at desc,id limit 1
 ), names as (
  select name,alliance_code,coalesce(provider_seen_at,created_at) as seen_at from identities
  union all
  select a.alias_name,i.alliance_code,a.created_at from public.player_aliases a join identities i on i.id=a.player_id
 ), previous as (
  select n.name,max(n.seen_at) as seen_at from names n
  where btrim(n.name)<>'' and n.name<>(select name from current_player)
  group by n.name
 ), existing as (
  select v.id,v.expires_at from public.violations v join identities i on i.id=v.player_id
 ), deletion_matches as (
  select distinct on (a.entity_id) a.entity_id,a.alliance_code,
   coalesce(a.details->'private'->>'player_name',a.details->'public'->>'player_name') as name
  from public.audit_log a
  where a.action='violation_deleted' and a.entity_type='violation' and a.entity_id is not null
   and exists (select 1 from names n where n.alliance_code=a.alliance_code
    and lower(btrim(n.name))=lower(btrim(coalesce(a.details->'private'->>'player_name',a.details->'public'->>'player_name'))))
   and not exists (select 1 from public.violations v where v.id=a.entity_id)
  order by a.entity_id,a.created_at desc,a.id desc
 ), deletions as (
  select d.*,exists (
   select 1 from public.players p where p.alliance_code=d.alliance_code
    and (p.game_id is null or p.game_id<>p_game_id)
    and (lower(btrim(p.name))=lower(btrim(d.name)) or exists (
      select 1 from public.player_aliases pa where pa.player_id=p.id and lower(btrim(pa.alias_name))=lower(btrim(d.name))
    ))
  ) as ambiguous from deletion_matches d
 )
 select case when not exists (select 1 from identities) then jsonb_build_object('found',false,'game_id',p_game_id)
 else jsonb_build_object(
  'found',true,'game_id',p_game_id,
  'name',(select name from current_player),'alliance',(select alliance_code from current_player),
  'previous_names',coalesce((select jsonb_agg(jsonb_build_object('name',name,'seen_at',seen_at) order by seen_at desc,name) from previous),'[]'::jsonb),
  'active_count',(select count(*) from existing where expires_at is null or expires_at>now()),
  'total_count',(select count(*) from existing),
  'deleted_count',(select count(*) from deletions where not ambiguous),
  'deleted_ambiguous_count',(select count(*) from deletions where ambiguous),
  'deleted_match','historical_name','as_of',now()
 ) end;
$function$;
revoke all on function public.aos_tools_player_lookup(text) from public,anon,authenticated;
grant execute on function public.aos_tools_player_lookup(text) to service_role;

-- Default access: the verified existing Boltotelli, Jey and Admin identities.
-- Do not match a mutable display name and do not change any other permission.
update public.aos_staff s set permissions=jsonb_set(coalesce(s.permissions,'{}'::jsonb),'{tools}',
 to_jsonb(u.email in ('leader-152394512@accounts.allianceos.invalid','leader-151869669@accounts.allianceos.invalid','admin@nap-tracker.invalid')),true)
from auth.users u where u.id=s.user_id and s.alliance_code='NRW';
