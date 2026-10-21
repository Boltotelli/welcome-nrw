begin;
alter table public.aos_event_cycles add column if not exists legion1_time_utc time(0), add column if not exists legion2_time_utc time(0);
alter table public.aos_event_cycles add constraint aos_event_cycles_legion_times_pair check (
 (legion1_time_utc is null and legion2_time_utc is null) or
 (group_key in ('catalog-swordland-showdown','catalog-tri-alliance-clash') and legion1_time_utc is not null and legion2_time_utc is not null and extract(second from legion1_time_utc)=0 and extract(second from legion2_time_utc)=0));
update public.aos_event_cycles set legion1_time_utc='14:00',legion2_time_utc='19:00',updated_at=now()
 where alliance_code='NRW' and group_key in ('catalog-swordland-showdown','catalog-tri-alliance-clash');
commit;
