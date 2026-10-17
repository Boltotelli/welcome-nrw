-- Existing event guides supply localized titles for the configured rhythm.
alter table public.aos_event_cycles add column if not exists title jsonb not null default '{}'::jsonb;
alter table public.aos_event_cycles add constraint aos_event_cycles_title_object check (jsonb_typeof(title)='object');
