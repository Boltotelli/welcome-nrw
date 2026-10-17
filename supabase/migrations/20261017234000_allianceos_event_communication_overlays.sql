-- Private, permissioned copies of ingame messages per authoritative NRW event and day.
-- NOT a duplicate event guide/schedule store.
create table if not exists public.aos_event_messages (
 id uuid primary key default gen_random_uuid(),
 alliance_code text not null references public.aos_alliances(code) on delete cascade,
 source_key text not null check (length(source_key) between 1 and 160),
 day date not null,
 chat_text jsonb not null default '{}'::jsonb,
 note_text jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 updated_by uuid null references auth.users(id),
 constraint aos_event_messages_unique unique (alliance_code,source_key,day),
 constraint aos_event_messages_text_objects check (jsonb_typeof(chat_text)='object' and jsonb_typeof(note_text)='object')
);
alter table public.aos_event_messages enable row level security;
revoke all on table public.aos_event_messages from anon,authenticated;
grant select,insert,update,delete on table public.aos_event_messages to service_role;
create index if not exists aos_event_messages_alliance_day_idx on public.aos_event_messages(alliance_code,day);
