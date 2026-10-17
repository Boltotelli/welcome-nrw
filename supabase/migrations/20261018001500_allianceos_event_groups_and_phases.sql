-- Group each event once; recurring schedule and reusable per-phase notices.
-- Preserves the existing event/calendar/guide sources and their date-specific overrides.
create table if not exists public.aos_event_cycles (
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 group_key text not null check(group_key ~ '^[a-z0-9-]{2,70}$'),
 anchor_date date not null,
 interval_days smallint not null check(interval_days between 1 and 365),
 duration_days smallint not null check(duration_days between 1 and 14),
 enabled boolean not null default true,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id),
 primary key(alliance_code,group_key),
 check(duration_days<=interval_days)
);
create table if not exists public.aos_event_day_templates (
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 group_key text not null check(group_key ~ '^[a-z0-9-]{2,70}$'),
 day_number smallint not null check(day_number between 1 and 14),
 instructions jsonb not null default '{}'::jsonb check(jsonb_typeof(instructions)='object'),
 chat_text jsonb not null default '{}'::jsonb check(jsonb_typeof(chat_text)='object'),
 note_text jsonb not null default '{}'::jsonb check(jsonb_typeof(note_text)='object'),
 status text not null default 'draft' check(status in ('draft','published')),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id),
 primary key(alliance_code,group_key,day_number)
);
alter table public.aos_event_cycles enable row level security;
alter table public.aos_event_day_templates enable row level security;
revoke all on public.aos_event_cycles,public.aos_event_day_templates from anon,authenticated;
grant select,insert,update,delete on public.aos_event_cycles,public.aos_event_day_templates to service_role;
create index if not exists aos_event_day_templates_group_idx on public.aos_event_day_templates(alliance_code,group_key,status);
alter table public.aos_event_cycles add column if not exists phase_count smallint null check(phase_count between 1 and 14);
alter table public.aos_event_cycles add constraint aos_event_cycles_phase_count_le_duration check (phase_count is null or phase_count<=duration_days);
insert into public.aos_event_cycles (alliance_code,group_key,anchor_date,interval_days,duration_days,phase_count,enabled)
values ('NRW','brawl','2026-09-14',28,7,6,true)
on conflict (alliance_code,group_key) do nothing;
