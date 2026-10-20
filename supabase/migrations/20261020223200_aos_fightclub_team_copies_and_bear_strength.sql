-- AllianceOS private leadership planning additions (2026-10-20).
-- Allow an explicit NOT PARTICIPATING decision independently of any Bear slot.
ALTER TABLE public.aos_bear_assignments ALTER COLUMN slot_key DROP NOT NULL;
ALTER TABLE public.aos_bear_assignments ALTER COLUMN role SET DEFAULT 'starter';
ALTER TABLE public.aos_bear_assignments DROP CONSTRAINT IF EXISTS aos_bear_assignments_attendance_check;
ALTER TABLE public.aos_bear_assignments ADD CONSTRAINT aos_bear_assignments_attendance_check
 CHECK (attendance IN ('confirmed','tentative','no'));
ALTER TABLE public.aos_bear_assignments ADD CONSTRAINT aos_bear_assignments_slot_or_no_check
 CHECK (attendance='no' OR slot_key IS NOT NULL);

-- Explicit threshold is per-alliance, not a hard-coded opinion about power.
CREATE TABLE IF NOT EXISTS public.aos_bear_planning_settings (
  alliance_code text primary key REFERENCES public.aos_alliances(code) ON DELETE CASCADE,
  strong_power_threshold bigint CHECK (strong_power_threshold IS NULL OR strong_power_threshold BETWEEN 1 AND 9999999999999),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.aos_bear_planning_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.aos_bear_planning_settings FROM public,anon,authenticated;
GRANT ALL ON public.aos_bear_planning_settings TO service_role;

-- Separate team leaders per battle date; never inferred from example text.
CREATE TABLE IF NOT EXISTS public.aos_fightclub_team_leaders (
  alliance_code text not null references public.aos_alliances(code) on delete cascade,
  event_type text not null check (event_type in ('swordland','triforce')),
  battle_date date not null,
  legion smallint not null check (legion in (1,2)),
  game_id text not null check (game_id ~ '^[0-9]{1,20}$'),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key(alliance_code,event_type,battle_date,legion),
  constraint aos_fightclub_team_leader_roster_fk
    foreign key(alliance_code,event_type,battle_date,game_id)
    references public.aos_fightclub_assignments(alliance_code,event_type,battle_date,game_id)
    on delete cascade
);
CREATE INDEX IF NOT EXISTS aos_fightclub_team_leaders_date_idx ON public.aos_fightclub_team_leaders(alliance_code,event_type,battle_date);
ALTER TABLE public.aos_fightclub_team_leaders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.aos_fightclub_team_leaders FROM public,anon,authenticated;
GRANT ALL ON public.aos_fightclub_team_leaders TO service_role;
