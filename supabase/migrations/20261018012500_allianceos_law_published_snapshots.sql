-- Keep the previously published alliance law publicly visible while leadership edits a draft.
-- Kingdom-level NAP Laws remain outside AllianceOS authority.
create table if not exists public.aos_law_publications(
 law_id uuid primary key references public.aos_laws(id) on delete cascade,
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 number text not null,
 scope text not null default 'alliance' check(scope='alliance'),
 title jsonb not null default '{}'::jsonb,
 body jsonb not null default '{}'::jsonb,
 version integer not null check(version>=1),
 published_at timestamptz not null default now()
);
alter table public.aos_law_publications enable row level security;
revoke all on public.aos_law_publications from anon,authenticated;
grant select,insert,update,delete on public.aos_law_publications to service_role;
create index if not exists aos_law_publications_alliance on public.aos_law_publications(alliance_code,number);
insert into public.aos_law_publications(law_id,alliance_code,number,scope,title,body,version,published_at)
select id,alliance_code,number,scope,title,body,version,coalesce(published_at,updated_at)
from public.aos_laws where scope='alliance' and status='published'
on conflict(law_id) do nothing;
