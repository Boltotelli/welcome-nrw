-- Don't silently alter the existing Dashboard rotation just by registering a template.
-- Set true only after the leadership explicitly saves the recurrence.
alter table public.aos_event_cycles add column if not exists override_schedule boolean not null default false;
