-- Applied in Supabase project bdzlgirowutasrsycjfj as migration 20261017210011.
-- Strictly isolated AllianceOS pilot. Does not alter existing NAP tables.
create table if not exists public.aos_alliances (
  code text primary key,
  name text not null,
  kingdom_id integer not null,
  capacity integer not null default 100 check (capacity between 1 and 500),
  default_language text not null default 'de' check (default_language in ('de','en','fr','es')),
  languages text[] not null default array['de','en','fr','es'],
  logo_url text,
  discord_guild_id text,
  modules jsonb not null default '{"roster":true,"transfers":true,"languages":true,"laws":true,"events":true}'::jsonb,
  advertising_enabled boolean not null default false,
  subscription_status text not null default 'not_configured',
  updated_at timestamptz not null default now()
);

create table if not exists public.aos_staff (
  user_id uuid not null references auth.users(id) on delete cascade,
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  rank text not null check (rank in ('R4','R5')),
  permissions jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, alliance_code)
);

create table if not exists public.aos_member_notes (
  id uuid primary key default gen_random_uuid(),
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  game_id text not null check (game_id ~ '^[0-9]{1,20}$'),
  member_status text not null default 'active' check (member_status in ('active','planned','left')),
  discord_user_id text,
  notes text,
  updated_at timestamptz not null default now(),
  unique (alliance_code, game_id)
);

create table if not exists public.aos_transfers (
  id uuid primary key default gen_random_uuid(),
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  direction text not null check (direction in ('incoming','outgoing')),
  game_id text not null check (game_id ~ '^[0-9]{1,20}$'),
  player_name text not null default '',
  origin_kingdom integer,
  previous_alliance text,
  power bigint,
  target_alliance text not null,
  window_start date,
  window_end date,
  status text not null default 'interested'
    check (status in ('interested','shortlisted','confirmed','waitlist','completed','cancelled')),
  notes text,
  share_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (window_end is null or window_start is null or window_end >= window_start)
);
create index if not exists aos_transfers_alliance_idx
  on public.aos_transfers(alliance_code,status,window_start);

create table if not exists public.aos_laws (
  id uuid primary key default gen_random_uuid(),
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  scope text not null check (scope in ('kingdom','alliance')),
  number text not null,
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (alliance_code,scope,number)
);

create table if not exists public.aos_law_versions (
  id bigint generated always as identity primary key,
  law_id uuid not null references public.aos_laws(id) on delete cascade,
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  changed_by uuid not null references auth.users(id),
  changed_at timestamptz not null default now(),
  unique(law_id,version)
);

create table if not exists public.aos_events (
  id uuid primary key default gen_random_uuid(),
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  start_at timestamptz not null,
  end_at timestamptz,
  requirements text,
  template_code text,
  reminder_minutes integer[] not null default array[60],
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at is null or end_at >= start_at)
);
create index if not exists aos_events_alliance_start_idx
  on public.aos_events(alliance_code,start_at);

create table if not exists public.aos_audit (
  id bigint generated always as identity primary key,
  alliance_code text not null references public.aos_alliances(code),
  actor_id uuid not null references auth.users(id),
  entity text not null,
  entity_id text,
  action text not null,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array[
    'aos_alliances','aos_staff','aos_member_notes','aos_transfers',
    'aos_laws','aos_law_versions','aos_events','aos_audit'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all privileges on table public.%I from anon,authenticated', t);
  end loop;
end $$;

revoke all privileges on sequence public.aos_audit_id_seq from anon, authenticated;
revoke all privileges on sequence public.aos_law_versions_id_seq from anon, authenticated;

insert into public.aos_alliances(code,name,kingdom_id)
values ('NRW','[NRW]United',1044)
on conflict (code) do nothing;

-- Bootstrap R5 only from existing verified application admin.
-- Never promote shared NAP alliance logins by guessing roles.
insert into public.aos_staff(user_id,alliance_code,rank,permissions)
select p.user_id,'NRW','R5','{}'::jsonb
from public.profiles p
where p.alliance_code='ADMIN'
  and p.is_admin=true
  and p.access_mode='write'
on conflict (user_id,alliance_code) do nothing;
