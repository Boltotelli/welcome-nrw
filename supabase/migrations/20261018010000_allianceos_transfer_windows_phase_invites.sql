-- NRW pilot: kingdom-to-kingdom transfer phases and optional slot planning.
-- Non-NRW Tracker data remains read-only. Null capacity means NOT specified, not zero.
create table if not exists public.aos_transfer_windows(
 id uuid primary key default gen_random_uuid(),
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 label text not null check(char_length(label) between 1 and 100),
 start_date date not null,
 end_date date not null,
 ordinary_capacity integer null check(ordinary_capacity between 0 and 500),
 special_capacity integer null check(special_capacity between 0 and 500),
 notes text not null default '',
 status text not null default 'planning' check(status in ('planning','open','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(end_date>=start_date)
);
create index if not exists aos_tw_alliance_start on public.aos_transfer_windows(alliance_code,start_date);
alter table public.aos_transfers add column if not exists transfer_window_id uuid null references public.aos_transfer_windows(id) on delete set null;
alter table public.aos_transfers add column if not exists invitation_status text not null default 'not_sent' check(invitation_status in ('not_sent','sent','accepted','declined'));
alter table public.aos_transfers add column if not exists invitation_sent_at timestamptz null;
alter table public.aos_transfers add column if not exists arrival_confirmed_at timestamptz null;
create index if not exists aos_transfers_window_idx on public.aos_transfers(alliance_code,transfer_window_id);
alter table public.aos_transfer_windows enable row level security;
revoke all on public.aos_transfer_windows from anon,authenticated;
grant select,insert,update,delete on public.aos_transfer_windows to service_role;
