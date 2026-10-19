-- AllianceOS admin access is independent of Kingshot R4/R5 status.
-- No grants to anon/authenticated: verified access remains server-side.
ALTER TABLE public.aos_staff ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
DO $grant$
DECLARE matching integer;
BEGIN
 SELECT count(*) INTO matching FROM public.aos_staff s
 JOIN auth.users u ON u.id=s.user_id
 JOIN public.players p ON p.game_id='152394512' AND p.alliance_code='NRW'
 WHERE s.alliance_code='NRW' AND u.email='leader-152394512@accounts.allianceos.invalid'
 AND s.enabled=true AND p.active=true AND p.alliance_rank IN (4,5);
 IF matching<>1 THEN RAISE EXCEPTION 'Expected exactly one active Boltotelli staff account, found %',matching; END IF;
 UPDATE public.aos_staff s
 SET is_admin=true,
     permissions=coalesce(s.permissions,'{}'::jsonb) || '{"members":true,"transfers":true,"laws":true,"events":true,"event_bot":true,"settings":true}'::jsonb
 FROM auth.users u
 WHERE s.user_id=u.id AND s.alliance_code='NRW'
 AND u.email='leader-152394512@accounts.allianceos.invalid';
END
$grant$;