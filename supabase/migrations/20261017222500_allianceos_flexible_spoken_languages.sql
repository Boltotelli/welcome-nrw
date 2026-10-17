-- Spoken languages belong to member dossiers and are NOT restricted by website UI locales.
-- Welcome already supports Turkish and a free-form 'Other' choice.
alter table public.aos_member_notes drop constraint if exists aos_member_notes_spoken_languages_check;
alter table public.aos_member_notes add constraint aos_member_notes_spoken_languages_count_check
  check (spoken_languages is null or cardinality(spoken_languages)<=12);
