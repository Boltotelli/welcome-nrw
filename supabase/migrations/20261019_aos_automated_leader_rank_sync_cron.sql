-- A standalone, private credential for the automated R4/R5 rank reconciliation worker.
create table if not exists public.aos_leader_sync_control(
 id integer primary key check(id=1),
 scheduler_key text not null,
 last_check timestamptz,
 last_success timestamptz,
 last_error text,
 last_result jsonb,
 updated_at timestamptz not null default now()
);
alter table public.aos_leader_sync_control enable row level security;
revoke all on public.aos_leader_sync_control from public, anon, authenticated;
grant select,insert,update on public.aos_leader_sync_control to service_role;
insert into public.aos_leader_sync_control(id,scheduler_key)
values (1,encode(gen_random_bytes(32),'hex'))
on conflict(id) do nothing;
select cron.schedule('allianceos-leader-rank-sync-10m','*/10 * * * *',
 $job$
 select net.http_post(
  url := 'https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/allianceos-leader-sync',
  headers := jsonb_build_object('Content-Type','application/json',
     'x-aos-leader-sync-key',(select scheduler_key from public.aos_leader_sync_control where id=1)),
  body := '{}'::jsonb,
  timeout_milliseconds := 30000
 )
 $job$
);