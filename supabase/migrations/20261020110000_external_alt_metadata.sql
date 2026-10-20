-- Private AllianceOS references to second accounts outside NRW.
-- This extends the EXISTING Main/Alt map; no separate player identities,
-- memberships, leader grants or NAP tables are created or changed.
alter table public.aos_member_account_links
  add column if not exists display_name text,
  add column if not exists reported_alliance text;
alter table public.aos_member_account_links
  drop constraint if exists aos_member_account_links_display_name_len;
alter table public.aos_member_account_links
  add constraint aos_member_account_links_display_name_len check (char_length(display_name)<=80);
alter table public.aos_member_account_links
  drop constraint if exists aos_member_account_links_reported_alliance_len;
alter table public.aos_member_account_links
  add constraint aos_member_account_links_reported_alliance_len check (char_length(reported_alliance)<=24);
