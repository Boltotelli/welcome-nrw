-- NRW AllianceOS pilot: player dossier overlays and cross-kingdom planning.
-- All NAP/Tracker tables continue to be read-only from AllianceOS.
alter table public.aos_member_notes
  add column if not exists spoken_languages text[] null,
  add column if not exists joined_on date null,
  add column if not exists responsibilities text not null default '';
alter table public.aos_member_notes
  add constraint aos_member_notes_spoken_languages_check
  check (spoken_languages is null or spoken_languages <@ array['de','en','fr','es']::text[]);
alter table public.aos_transfers
  add column if not exists target_kingdom integer null,
  add column if not exists priority smallint not null default 2,
  add column if not exists invitation_type text not null default 'not_assigned';
alter table public.aos_transfers
  add constraint aos_transfers_target_kingdom_check check (target_kingdom is null or target_kingdom between 1 and 99999);
alter table public.aos_transfers
  add constraint aos_transfers_priority_check check (priority between 1 and 3);
alter table public.aos_transfers
  add constraint aos_transfers_invitation_type_check check (invitation_type in ('not_assigned','ordinary','special'));
