-- Private NRW temporary event loans, separate from permanent transfers.
create table if not exists public.aos_event_loans (
 id uuid primary key default gen_random_uuid(),
 home_alliance text not null references public.aos_alliances(code) on delete cascade,
 game_id text not null check (game_id ~ '^[0-9]{5,20}$'),
 event_type text not null check (event_type in ('fdt','castle','kvk')),
 target_alliance text not null check (target_alliance in ('NWO','RDS')),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'approved' check (status in ('approved','returned','cancelled')),
 protect_leadership boolean not null default false,
 original_rank smallint check(original_rank in (4,5)),
 away_seen_at timestamptz,
 returned_at timestamptz,
 note text not null default '' check (char_length(note)<=500),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 created_by uuid,
 updated_by uuid,
 constraint aos_event_loans_valid_window check (ends_at>starts_at and ends_at<=starts_at+interval '21 days'),
 constraint aos_event_loans_protection_rank check (not protect_leadership or original_rank in (4,5)),
 constraint aos_event_loans_returned check (status<>'returned' or returned_at is not null)
);
create unique index if not exists aos_event_loans_one_approved on public.aos_event_loans(home_alliance,game_id) where status='approved';
create index if not exists aos_event_loans_window on public.aos_event_loans(home_alliance,status,ends_at);
alter table public.aos_event_loans enable row level security;
revoke all on public.aos_event_loans from public,anon,authenticated;
grant all on public.aos_event_loans to service_role;