-- Work publishing workflow: the creator requests review, trusted staff publish or return the work.
-- Applied with founder authorization on 2026-11-06 to the isolated project pkgtxlmfzsvjarfdhhov.
-- No payment, monetization, or automatic publication is enabled here.

alter table public.works
  add column reviewed_at timestamptz,
  add column review_notes text;

alter table public.works
  add constraint works_review_notes_length
  check (review_notes is null or char_length(review_notes) <= 4000);

-- Staff need to read works while they are in review. Public discovery remains limited to
-- published + public works, and owners keep their own draft visibility.
drop policy if exists "Staff review works" on public.works;
create policy "Staff review works"
on public.works
for select to authenticated
using (app_private.has_staff_role(array['reviewer','admin','owner']));

-- A creator can submit only a draft that they own through an active creative identity.
-- The work status is never writable by a client role.
create or replace function public.submit_work_for_review(p_work_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_work public.works%rowtype;
  v_identity_status text;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select work.* into v_work
  from public.works work
  join public.creator_identities identity
    on identity.id = work.creator_identity_id
  where work.id = p_work_id
    and work.created_by = (select auth.uid())
    and identity.owner_account_id = (select auth.uid())
  for update of work;

  if not found then
    raise exception 'draft_work_not_owned_or_not_found' using errcode = 'P0002';
  end if;

  select status into v_identity_status
  from public.creator_identities
  where id = v_work.creator_identity_id;
  if v_work.status <> 'draft' then
    raise exception 'work_not_submittable' using errcode = 'P0002';
  end if;
  if v_identity_status <> 'active' then
    raise exception 'creator_identity_not_active' using errcode = '42501';
  end if;

  update public.works
  set status = 'in_review',
      review_notes = null,
      reviewed_at = null,
      updated_at = now()
  where id = p_work_id;

  insert into public.audit_events(actor_account_id, action, subject_type, subject_id, metadata)
  values (
    (select auth.uid()),
    'work_submitted_for_review',
    'work',
    p_work_id,
    jsonb_build_object('creator_identity_id', v_work.creator_identity_id)
  );
end;
$$;

-- A reviewer either publishes the work or returns it to draft with creator-facing notes.
-- Review criteria remain an OPEN product decision; this function only records the decision.
create or replace function public.review_work(
  p_work_id uuid,
  p_decision text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_work public.works%rowtype;
begin
  if not app_private.has_staff_role(array['reviewer','admin','owner']) then
    raise exception 'insufficient_review_role' using errcode = '42501';
  end if;
  if p_decision not in ('published','changes_requested') then
    raise exception 'invalid_review_decision' using errcode = '22023';
  end if;
  if p_notes is not null and char_length(p_notes) > 4000 then
    raise exception 'review_notes_too_long' using errcode = '22023';
  end if;

  select * into v_work
  from public.works
  where id = p_work_id
  for update;

  if not found or v_work.status <> 'in_review' then
    raise exception 'work_not_reviewable' using errcode = 'P0002';
  end if;

  if p_decision = 'published' then
    update public.works
    set status = 'published',
        published_at = now(),
        reviewed_at = now(),
        review_notes = p_notes,
        updated_at = now()
    where id = p_work_id;
  else
    update public.works
    set status = 'draft',
        published_at = null,
        reviewed_at = now(),
        review_notes = p_notes,
        updated_at = now()
    where id = p_work_id;
  end if;

  insert into public.audit_events(actor_account_id, action, subject_type, subject_id, metadata)
  values (
    (select auth.uid()),
    'work_reviewed',
    'work',
    p_work_id,
    jsonb_build_object(
      'decision', p_decision,
      'creator_identity_id', v_work.creator_identity_id,
      'notes_present', p_notes is not null
    )
  );
end;
$$;

revoke all on function public.submit_work_for_review(uuid) from public, anon;
revoke all on function public.review_work(uuid,text,text) from public, anon;
grant execute on function public.submit_work_for_review(uuid) to authenticated;
grant execute on function public.review_work(uuid,text,text) to authenticated;
