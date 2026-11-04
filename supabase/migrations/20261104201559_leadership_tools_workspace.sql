-- All access goes through the existing verified Tools dispatcher.
create table public.aos_tools_documents (
 id uuid primary key,
 alliance_code text not null references public.aos_alliances(code),
 kind text not null check(kind in ('notice','rally','territory')),
 title text not null check(length(title) between 1 and 100),
 data jsonb not null check(jsonb_typeof(data)='object' and octet_length(data::text)<=120000),
 version integer not null check(version>0),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id)
);
create index aos_tools_documents_alliance_updated on public.aos_tools_documents(alliance_code,updated_at desc);
create table public.aos_tools_gift_runs (
 id uuid primary key,
 alliance_code text not null references public.aos_alliances(code),
 code text not null check(length(code) between 1 and 80),
 recipients jsonb not null check(jsonb_typeof(recipients)='array' and jsonb_array_length(recipients) between 1 and 500),
 created_at timestamptz not null default now(),
 created_by uuid not null references auth.users(id)
);
create index aos_tools_gift_runs_alliance_created on public.aos_tools_gift_runs(alliance_code,created_at desc);
create table public.aos_tools_gift_receipts (
 alliance_code text not null references public.aos_alliances(code),
 code text not null,
 game_id text not null,
 kingdom_id integer not null,
 status text not null check(status in ('processing','success','already','failed','unknown')),
 retryable boolean not null default false,
 provider_code integer,
 attempts integer not null default 1,
 claim_id uuid not null,
 updated_at timestamptz not null default now(),
 primary key(alliance_code,code,game_id)
);
alter table public.aos_tools_documents enable row level security;
alter table public.aos_tools_gift_runs enable row level security;
alter table public.aos_tools_gift_receipts enable row level security;
revoke all on public.aos_tools_documents,public.aos_tools_gift_runs,public.aos_tools_gift_receipts from public,anon,authenticated;
grant select,insert,update,delete on public.aos_tools_documents to service_role;
grant select,insert on public.aos_tools_gift_runs to service_role;
grant select,insert,update on public.aos_tools_gift_receipts to service_role;
create policy tools_documents_service on public.aos_tools_documents for all to service_role using(true) with check(true);
create policy tools_gift_runs_service on public.aos_tools_gift_runs for all to service_role using(true) with check(true);
create policy tools_gift_receipts_service on public.aos_tools_gift_receipts for all to service_role using(true) with check(true);

-- Atomic, service-only reservation: concurrent tabs cannot send the same claim.
-- A timed-out request becomes unknown and is never retried implicitly.
create function public.aos_tools_claim_gift(p_alliance text,p_code text,p_game_id text,p_kingdom integer,p_claim uuid,p_retry boolean default false)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare r public.aos_tools_gift_receipts; last_attempt timestamptz;
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
 select max(updated_at) into last_attempt from public.aos_tools_gift_receipts where alliance_code=p_alliance;
 if last_attempt>now()-interval '2 seconds' then return jsonb_build_object('claimed',false,'status','wait','retry_after',2); end if;
 insert into public.aos_tools_gift_receipts(alliance_code,code,game_id,kingdom_id,status,claim_id)
 values(p_alliance,p_code,p_game_id,p_kingdom,'processing',p_claim)
 on conflict(alliance_code,code,game_id) do update set status='processing',kingdom_id=p_kingdom,claim_id=p_claim,attempts=aos_tools_gift_receipts.attempts+1,provider_code=null,retryable=false,updated_at=now();
 return jsonb_build_object('claimed',true);
end $$;
revoke all on function public.aos_tools_claim_gift(text,text,text,integer,uuid,boolean) from public,anon,authenticated;
grant execute on function public.aos_tools_claim_gift(text,text,text,integer,uuid,boolean) to service_role;
