-- Fix review_safety_report: safety_reports.status is public.case_status (an enum),
-- while p_decision is text. The original function assigned text directly, which
-- fails with "column status is of type case_status but expression is of type text"
-- on every decision. Cast explicitly after validating the allowed values.
-- Moderation standards, sanctions, and appeals remain OPEN decisions; the function
-- still records the decision and applies no automatic sanction except comment hiding.

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

  update public.safety_reports
  set status = p_decision::public.case_status
  where id = p_report_id;

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
