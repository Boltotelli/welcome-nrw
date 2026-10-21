-- One general announcement per alliance. Only the existing authenticated Edge API
-- can manage it; the public API projects published, non-expired text only.
create table public.aos_alliance_announcements (
 alliance_code text primary key references public.aos_alliances(code),
 text jsonb not null default '{}'::jsonb check(jsonb_typeof(text)='object'),
 status text not null default 'draft' check(status in ('draft','published','disabled')),
 expires_at timestamptz,
 revision integer not null default 0 check(revision>=0),
 updated_by uuid references auth.users(id),
 updated_at timestamptz not null default now()
);
alter table public.aos_alliance_announcements enable row level security;
revoke all on table public.aos_alliance_announcements from public, anon, authenticated;
grant select,insert,update,delete on public.aos_alliance_announcements to service_role;

-- SECURITY INVOKER and service-role-only execution. The Edge Function checks
-- live staff membership and the existing events permission before calling this.
-- Update and audit form one transaction; a conflicting revision writes neither.
create function public.aos_write_announcement(p_alliance text,p_actor uuid,p_text jsonb,
 p_status text,p_expires timestamptz,p_revision integer,p_remove boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_row public.aos_alliance_announcements; result_row public.aos_alliance_announcements;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('aos-announcement:'||p_alliance,0));
 select * into current_row from public.aos_alliance_announcements where alliance_code=p_alliance for update;
 if coalesce(current_row.revision,0)<>p_revision then raise exception 'announcement_conflict' using errcode='40001'; end if;
 if p_remove then
   -- Keep a tombstone revision, so stale editors cannot recreate a removed message.
   p_text:='{}'::jsonb; p_status:='disabled'; p_expires:=null;
 end if;
 insert into public.aos_alliance_announcements(alliance_code,text,status,expires_at,revision,updated_by)
 values(p_alliance,p_text,p_status,p_expires,p_revision+1,p_actor)
 on conflict(alliance_code) do update set text=excluded.text,status=excluded.status,expires_at=excluded.expires_at,
 revision=excluded.revision,updated_by=excluded.updated_by,updated_at=now()
 returning * into result_row;
 insert into public.aos_audit(alliance_code,actor_id,entity,entity_id,action)
 values(p_alliance,p_actor,'alliance_announcement',p_alliance,
 (case when p_remove then 'remove' else p_status end)||'_revision_'||(p_revision+1)::text);
 return to_jsonb(result_row);
end;
$$;
revoke all on function public.aos_write_announcement(text,uuid,jsonb,text,timestamptz,integer,boolean) from public,anon,authenticated;
grant execute on function public.aos_write_announcement(text,uuid,jsonb,text,timestamptz,integer,boolean) to service_role;
