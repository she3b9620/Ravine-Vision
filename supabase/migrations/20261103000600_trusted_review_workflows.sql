-- Trusted review foundation. Staff membership is provisioned out-of-band by an authorized operator.
-- No client can grant itself a staff role. Do not apply until an isolated Supabase project is approved.

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create table app_private.staff_roles (
  account_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('reviewer','moderator','admin','owner')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);
revoke all on app_private.staff_roles from public, anon, authenticated;

create or replace function app_private.has_staff_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app_private.staff_roles s
    where s.account_id = (select auth.uid())
      and s.role = any(allowed_roles)
  );
$$;
revoke all on function app_private.has_staff_role(text[]) from public, anon;
grant execute on function app_private.has_staff_role(text[]) to authenticated;

-- Reviewer queue access without exposing private notes or granting direct mutation.
drop policy if exists "Staff review creator applications" on public.creator_applications;
create policy "Staff review creator applications"
on public.creator_applications
for select to authenticated
using (app_private.has_staff_role(array['reviewer','admin','owner']));

drop policy if exists "Staff review rights declarations" on public.rights_declarations;
create policy "Staff review rights declarations"
on public.rights_declarations
for select to authenticated
using (app_private.has_staff_role(array['reviewer','admin','owner']));

drop policy if exists "Staff review media assets" on public.media_assets;
create policy "Staff review media assets"
on public.media_assets
for select to authenticated
using (app_private.has_staff_role(array['moderator','admin','owner']));

-- All review decisions are atomic, role-checked, and recorded in the audit log.
create or replace function public.review_creator_application(
  p_application_id uuid,
  p_decision text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_application public.creator_applications%rowtype;
begin
  if not app_private.has_staff_role(array['reviewer','admin','owner']) then
    raise exception 'insufficient_review_role' using errcode = '42501';
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception 'invalid_review_decision' using errcode = '22023';
  end if;
  if p_notes is not null and char_length(p_notes) > 4000 then
    raise exception 'review_notes_too_long' using errcode = '22023';
  end if;
  select * into v_application
  from public.creator_applications
  where id = p_application_id
  for update;
  if not found or v_application.status not in ('submitted','under_review') then
    raise exception 'application_not_reviewable' using errcode = 'P0002';
  end if;

  update public.creator_applications
  set status = p_decision,
      reviewer_account_id = (select auth.uid()),
      review_notes = p_notes,
      reviewed_at = now()
  where id = p_application_id;

  if p_decision = 'approved' then
    update public.creator_identities
    set status = 'active', updated_at = now()
    where id = v_application.creator_identity_id
      and owner_account_id = v_application.applicant_account_id
      and status in ('draft','submitted');
    if not found then
      raise exception 'creator_identity_not_approvable' using errcode = 'P0002';
    end if;
  end if;

  insert into public.audit_events(actor_account_id,action,subject_type,subject_id,metadata)
  values ((select auth.uid()),'creator_application_reviewed','creator_application',p_application_id,
    jsonb_build_object('decision',p_decision,'notes_present',p_notes is not null));
end;
$$;
revoke all on function public.review_creator_application(uuid,text,text) from public, anon;
grant execute on function public.review_creator_application(uuid,text,text) to authenticated;

create or replace function public.review_rights_declaration(
  p_declaration_id uuid,
  p_decision text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_declaration public.rights_declarations%rowtype;
begin
  if not app_private.has_staff_role(array['reviewer','admin','owner']) then
    raise exception 'insufficient_review_role' using errcode = '42501';
  end if;
  if p_decision not in ('accepted','disputed','rejected') then
    raise exception 'invalid_review_decision' using errcode = '22023';
  end if;
  if p_notes is not null and char_length(p_notes) > 4000 then
    raise exception 'review_notes_too_long' using errcode = '22023';
  end if;
  select * into v_declaration
  from public.rights_declarations
  where id = p_declaration_id
  for update;
  if not found or v_declaration.review_status not in ('unreviewed','under_review') then
    raise exception 'declaration_not_reviewable' using errcode = 'P0002';
  end if;

  update public.rights_declarations
  set review_status = p_decision
  where id = p_declaration_id;

  insert into public.audit_events(actor_account_id,action,subject_type,subject_id,metadata)
  values ((select auth.uid()),'rights_declaration_reviewed','rights_declaration',p_declaration_id,
    jsonb_build_object('decision',p_decision,'notes_present',p_notes is not null));
end;
$$;
revoke all on function public.review_rights_declaration(uuid,text,text) from public, anon;
grant execute on function public.review_rights_declaration(uuid,text,text) to authenticated;

-- Staff audit visibility; ordinary users retain their own actor-scoped policy.
drop policy if exists "Staff inspect audit events" on public.audit_events;
create policy "Staff inspect audit events"
on public.audit_events
for select to authenticated
using (app_private.has_staff_role(array['moderator','reviewer','admin','owner']));

-- No direct client writes to review outcomes or staff membership.
revoke insert, update, delete on public.creator_applications from authenticated;
revoke update on public.rights_declarations from authenticated;
