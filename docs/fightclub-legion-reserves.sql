alter table public.aos_fightclub_assignments add column is_reserve boolean not null default false;
alter table public.aos_fightclub_assignments add constraint aos_fightclub_reserve_legion_check check (not is_reserve or legion in (1,2));
