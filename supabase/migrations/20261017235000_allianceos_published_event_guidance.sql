-- Published NRW leadership notes overlay source events instead of duplicating guides.
create table if not exists public.aos_event_guidance (
 id uuid primary key default gen_random_uuid(),
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 source_key text not null check (length(source_key) between 2 and 160),
 day date not null,
 notes jsonb not null default '{}'::jsonb,
 status text not null default 'draft' check (status in ('draft','published')),
 updated_by uuid null references auth.users(id),
 updated_at timestamptz not null default now(),
 unique(alliance_code,source_key,day),
 constraint aos_event_guidance_notes_obj check (jsonb_typeof(notes)='object')
);
alter table public.aos_event_guidance enable row level security;
revoke all on public.aos_event_guidance from anon,authenticated;
grant select,insert,update,delete on public.aos_event_guidance to service_role;
create index if not exists aos_event_guidance_published on public.aos_event_guidance(alliance_code,day) where status='published';
