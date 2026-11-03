-- Account tier progression requests. Tier eligibility and evidence thresholds remain OPEN.
-- A request never changes the account tier; only a trusted reviewer decision can do so.

create table public.account_tier_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id) on delete cascade,
  requested_tier public.account_tier not null,
  statement text not null check (char_length(statement) between 50 and 4000),
  evidence_references text[] not null default '{}',
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','rejected','withdrawn')),
  reviewer_account_id uuid references public.profiles(id) on delete set null,
  review_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index account_tier_requests_queue_idx on public.account_tier_requests(status,submitted_at);
create index account_tier_requests_account_idx on public.account_tier_requests(account_id,submitted_at desc);
create unique index account_tier_requests_one_pending_per_account
on public.account_tier_requests(account_id)
where status in ('submitted','under_review');

alter table public.account_tier_requests enable row level security;
create policy "Accounts view own tier requests" on public.account_tier_requests
for select to authenticated using (account_id=(select auth.uid()));
create policy "Accounts submit viewer progression requests" on public.account_tier_requests
for insert to authenticated with check (
 account_id=(select auth.uid())
 and requested_tier in ('creator','verified','select')
 and status='submitted'
 and reviewer_account_id is null
 and reviewed_at is null
);
create policy "Authorized reviewers view tier requests" on public.account_tier_requests
for select to authenticated using (app_private.has_staff_role(array['reviewer','admin','owner']));
grant select on public.account_tier_requests to authenticated;
grant insert (account_id,requested_tier,statement,evidence_references) on public.account_tier_requests to authenticated;

create or replace function public.review_account_tier_request(
 p_request_id uuid,p_decision text,p_notes text default null
)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_request public.account_tier_requests%rowtype;
begin
 if not app_private.has_staff_role(array['reviewer','admin','owner']) then
  raise exception 'insufficient_review_role' using errcode='42501';
 end if;
 if p_decision not in ('approved','rejected') then
  raise exception 'invalid_tier_decision' using errcode='22023';
 end if;
 if p_notes is not null and char_length(p_notes)>4000 then
  raise exception 'review_notes_too_long' using errcode='22023';
 end if;
 select * into v_request from public.account_tier_requests where id=p_request_id for update;
 if not found or v_request.status not in ('submitted','under_review') then
  raise exception 'tier_request_not_reviewable' using errcode='P0002';
 end if;
 if p_decision='approved' then
  update public.profiles set account_tier=v_request.requested_tier,updated_at=now()
  where id=v_request.account_id;
 end if;
 update public.account_tier_requests set status=p_decision,reviewer_account_id=(select auth.uid()),
 review_notes=p_notes,reviewed_at=now() where id=p_request_id;
 insert into public.audit_events(actor_account_id,action,subject_type,subject_id,metadata)
 values ((select auth.uid()),'account_tier_request_reviewed','account_tier_request',p_request_id,
 jsonb_build_object('decision',p_decision,'requested_tier',v_request.requested_tier,'notes_present',p_notes is not null));
end;
$$;
revoke all on function public.review_account_tier_request(uuid,text,text) from public,anon;
grant execute on function public.review_account_tier_request(uuid,text,text) to authenticated;
