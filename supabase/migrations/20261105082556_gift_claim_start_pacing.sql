alter table public.aos_tools_gift_receipts add column attempt_started_at timestamptz;

-- Atomic, service-only reservation: concurrent tabs cannot send the same claim.
-- A timed-out request becomes unknown and is never retried implicitly.
create or replace function public.aos_tools_claim_gift(p_alliance text,p_code text,p_game_id text,p_kingdom integer,p_claim uuid,p_retry boolean default false)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare r public.aos_tools_gift_receipts; last_attempt timestamptz; started_at timestamptz; wait_ms integer;
begin
 perform pg_advisory_xact_lock(hashtextextended('tools_gifts:'||p_alliance,0));
 select * into r from public.aos_tools_gift_receipts where alliance_code=p_alliance and code=p_code and game_id=p_game_id for update;
 if found then
  if r.status in ('success','already') then return jsonb_build_object('claimed',false,'status',r.status); end if;
  if r.status='processing' and r.updated_at>now()-interval '2 minutes' then return jsonb_build_object('claimed',false,'status','processing'); end if;
  if r.status='processing' then
   update public.aos_tools_gift_receipts set status='unknown',retryable=false where alliance_code=p_alliance and code=p_code and game_id=p_game_id;
  end if;
  if not p_retry then return jsonb_build_object('claimed',false,'status',case when r.status='processing' then 'unknown' else r.status end); end if;
  if r.status='failed' and not r.retryable then return jsonb_build_object('claimed',false,'status','failed'); end if;
 end if;
 -- Pace claims from their start, so provider response time counts toward the interval.
 select max(coalesce(attempt_started_at,updated_at)) into last_attempt from public.aos_tools_gift_receipts where alliance_code=p_alliance;
 started_at:=clock_timestamp();
 wait_ms:=greatest(0,ceil(extract(epoch from last_attempt+interval '2 seconds'-started_at)*1000));
 if wait_ms>0 then return jsonb_build_object('claimed',false,'status','wait','retry_after',2,'retry_after_ms',wait_ms); end if;
 insert into public.aos_tools_gift_receipts(alliance_code,code,game_id,kingdom_id,status,claim_id,attempt_started_at,updated_at)
 values(p_alliance,p_code,p_game_id,p_kingdom,'processing',p_claim,started_at,started_at)
 on conflict(alliance_code,code,game_id) do update set status='processing',kingdom_id=p_kingdom,claim_id=p_claim,attempts=aos_tools_gift_receipts.attempts+1,provider_code=null,retryable=false,attempt_started_at=started_at,updated_at=started_at;
 return jsonb_build_object('claimed',true);
end $$;
revoke all on function public.aos_tools_claim_gift(text,text,text,integer,uuid,boolean) from public,anon,authenticated;
grant execute on function public.aos_tools_claim_gift(text,text,text,integer,uuid,boolean) to service_role;
