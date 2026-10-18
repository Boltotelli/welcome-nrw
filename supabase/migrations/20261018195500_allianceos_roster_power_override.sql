-- NRW leadership can record optional power without mutating Kingshot/NAP source caches.
alter table public.aos_member_notes add column if not exists power_override bigint null;
alter table public.aos_member_notes add column if not exists power_override_at timestamptz null;
alter table public.aos_member_notes add constraint aos_member_notes_power_override_valid
 check (power_override is null or power_override between 0 and 9999999999999);
