create table public.aos_ssl_viewers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 alliance_code text not null references public.aos_alliances(code) check(alliance_code='NRW'),
 name text not null check(length(name) between 1 and 60),
 login_name text not null unique check(login_name ~ '^ssl-[a-f0-9]{16}$'),
 enabled boolean not null default true,
 created_at timestamptz not null default now(),
 created_by uuid references auth.users(id) on delete set null
);
alter table public.aos_ssl_viewers enable row level security;
revoke all on public.aos_ssl_viewers from anon,authenticated;
grant all on public.aos_ssl_viewers to service_role;
create policy ssl_viewers_service_only on public.aos_ssl_viewers for all to service_role using(true) with check(true);
