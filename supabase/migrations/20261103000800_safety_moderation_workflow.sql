-- Safety and moderation workflow. Enforcement remains limited to explicit supported actions.
-- Account sanctions, appeals policy, retention, and escalation rules remain OPEN product decisions.

alter table public.rights_declarations
  add column if not exists review_notes text;

create policy "Staff review safety reports"
on public.safety_reports
for select to authenticated
using (app_private.has_staff_role(array['moderator','admin','owner']));

create or replace function public.review_safety_report(
  p_report_id uuid,
  p_decision text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_report public.safety_reports%rowtype;
begin
  if not app_private.has_staff_role(array['moderator','admin','owner']) then
    raise exception 'insufficient_moderation_role' using errcode = '42501';
  end if;
  if p_decision not in ('triaged','actioned','dismissed','appealed') then
    raise exception 'invalid_report_decision' using errcode = '22023';
  end if;
  if p_notes is not null and char_length(p_notes) > 4000 then
    raise exception 'moderation_notes_too_long' using errcode = '22023';
  end if;

  select * into v_report
  from public.safety_reports
  where id = p_report_id
  for update;
  if not found or v_report.status in ('actioned','dismissed') then
    raise exception 'report_not_reviewable' using errcode = 'P0002';
  end if;

  update public.safety_reports set status = p_decision where id = p_report_id;

  -- A report against a comment can be hidden by a moderator decision.
  -- Other target types are recorded for human review; no unsupported automatic sanction is applied.
  if p_decision = 'actioned' and v_report.target_type = 'comment' then
    update public.work_comments set visibility = 'hidden' where id = v_report.target_id;
  end if;

  insert into public.audit_events(actor_account_id,action,subject_type,subject_id,metadata)
  values ((select auth.uid()),'safety_report_reviewed','safety_report',p_report_id,
    jsonb_build_object('decision',p_decision,'target_type',v_report.target_type,
      'target_id',v_report.target_id,'notes_present',p_notes is not null));
end;
$$;
revoke all on function public.review_safety_report(uuid,text,text) from public, anon;
grant execute on function public.review_safety_report(uuid,text,text) to authenticated;

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
  set review_status = p_decision, review_notes = p_notes
  where id = p_declaration_id;

  insert into public.audit_events(actor_account_id,action,subject_type,subject_id,metadata)
  values ((select auth.uid()),'rights_declaration_reviewed','rights_declaration',p_declaration_id,
    jsonb_build_object('decision',p_decision,'notes_present',p_notes is not null));
end;
$$;
revoke all on function public.review_rights_declaration(uuid,text,text) from public, anon;
grant execute on function public.review_rights_declaration(uuid,text,text) to authenticated;
