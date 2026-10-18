-- NRW pilot: permit publishing manually entered 1044 server Laws; do not touch NAP Tracker laws.
-- Old AllianceOS alliance law snapshots, if present, stay stored but are no longer returned on /laws.html.
alter table public.aos_law_publications drop constraint if exists aos_law_publications_scope_check;
alter table public.aos_law_publications add constraint aos_law_publications_scope_check
 check (scope in ('alliance','kingdom'));
-- Each planned inter-kingdom transfer can have one assigned NRW R4/R5 contact.
alter table public.aos_transfers
 add column if not exists contact_staff_user_id uuid null references auth.users(id) on delete set null;
create index if not exists aos_transfers_contact_staff_idx on public.aos_transfers(alliance_code,contact_staff_user_id);
