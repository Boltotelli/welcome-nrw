-- AllianceOS phase 5: authenticated leadership RSVP & attendance register.
-- Separate from Discord's event bot. No player logins, no automatic messaging.
create table if not exists public.aos_event_participation (
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  event_key text not null check (event_key ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  event_date date not null,
  game_id text not null check (game_id ~ '^[0-9]{1,20}$'),
  response text not null default 'unknown'
    check (response in ('unknown','yes','maybe','no')),
  attendance text not null default 'unknown'
    check (attendance in ('unknown','present','absent','excused')),
  notes text not null default '' check (char_length(notes) <= 500),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key (alliance_code,event_key,event_date,game_id)
);
create index if not exists aos_event_participation_event_idx
  on public.aos_event_participation(alliance_code,event_date desc,event_key);
alter table public.aos_event_participation enable row level security;
revoke all on public.aos_event_participation from public,anon,authenticated;
grant all on public.aos_event_participation to service_role;
