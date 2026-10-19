alter table public.aos_staff add column if not exists disabled_reason text; 
update public.aos_staff s
set enabled=false,disabled_reason='rank_lost'
from auth.users u
where s.user_id=u.id and s.alliance_code='NRW'
 and u.email ~* '^leader-[0-9]{5,20}@accounts[.]allianceos[.]invalid$'
 and not exists(
  select 1 from public.players p
  where p.alliance_code=s.alliance_code
   and p.game_id=substring(u.email from '^leader-([0-9]+)@')
   and p.active=true and p.alliance_rank in (4,5)
 );
update public.aos_staff s
set rank=case when p.alliance_rank=5 then 'R5' else 'R4' end
from auth.users u join public.players p
on p.game_id=substring(u.email from '^leader-([0-9]+)@') and p.alliance_code='NRW' and p.active and p.alliance_rank in (4,5)
where s.user_id=u.id and s.alliance_code='NRW' and u.email ~* '^leader-[0-9]{5,20}@accounts[.]allianceos[.]invalid$';