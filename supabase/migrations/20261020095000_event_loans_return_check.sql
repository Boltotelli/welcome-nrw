-- Read-only physical membership verification with writes to the PRIVATE loan table only.
-- Job runs every ten minutes; never changes NAP player records or staff rights.
create or replace function public.aos_reconcile_event_loans()
returns table(away_marked integer, returned_marked integer)
language plpgsql security definer set search_path=public,pg_temp as $body$
declare a integer:=0; r integer:=0;
begin
 update public.aos_event_loans l
 set away_seen_at=p.provider_seen_at,updated_at=now()
 from public.players p
 where l.status='approved' and l.away_seen_at is null
   and l.starts_at<=now() and l.ends_at>=now()
   and p.game_id=l.game_id and p.alliance_code=l.target_alliance and p.active
   and p.provider_seen_at is not null
   and p.provider_seen_at>=l.starts_at
   and p.provider_seen_at<=now()+interval '5 minutes'
   and p.provider_seen_at>=now()-interval '48 hours';
 get diagnostics a=row_count;
 update public.aos_event_loans l
 set status='returned',returned_at=now(),updated_at=now()
 from public.players p
 where l.status='approved' and l.away_seen_at is not null
   and p.game_id=l.game_id and p.alliance_code=l.home_alliance and p.active
   and p.provider_seen_at is not null and p.provider_seen_at>l.away_seen_at
   and p.provider_seen_at>=now()-interval '48 hours'
   and p.provider_seen_at<=now()+interval '5 minutes'
   and not exists (
     select 1 from public.players newer
     where newer.game_id=l.game_id and newer.active
       and newer.alliance_code<>l.home_alliance
       and newer.provider_seen_at is not null
       and newer.provider_seen_at>=p.provider_seen_at
   );
 get diagnostics r=row_count;
 return query select a,r;
end;
$body$;
revoke all on function public.aos_reconcile_event_loans() from public,anon,authenticated;
grant execute on function public.aos_reconcile_event_loans() to service_role;
select cron.schedule('allianceos-event-loan-return-check','*/10 * * * *',
  'select * from public.aos_reconcile_event_loans();');