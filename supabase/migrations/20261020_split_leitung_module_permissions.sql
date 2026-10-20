-- AllianceOS 2026-10-20: preserve pre-existing access on permission split.
-- Legacy members=true implied access to performance/bear/fightclub/participation.
-- Keep explicit per-module grants/revocations if the keys already exist.
-- Administration is held by aos_staff.is_admin and still overrides module grants.
update public.aos_staff
set permissions = coalesce(permissions, '{}'::jsonb) || jsonb_build_object(
  'performance', case when permissions ? 'performance' then permissions->'performance'
                      else to_jsonb(coalesce((permissions->>'members')::boolean,false)) end,
  'bear', case when permissions ? 'bear' then permissions->'bear'
               else to_jsonb(coalesce((permissions->>'members')::boolean,false)) end,
  'fightclub', case when permissions ? 'fightclub' then permissions->'fightclub'
                    else to_jsonb(coalesce((permissions->>'members')::boolean,false)) end,
  'participation', case when permissions ? 'participation' then permissions->'participation'
                        else to_jsonb(coalesce((permissions->>'members')::boolean,false)) end
)
where alliance_code = 'NRW';
