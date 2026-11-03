-- Creator application workflow. Applying never grants creator permissions.
-- Review decisions belong to trusted server-side operations.
create table public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  creator_identity_id uuid not null references public.creator_identities(id) on delete cascade,
  applicant_account_id uuid not null references public.profiles(id) on delete restrict,
  statement text not null check (char_length(statement) between 50 and 4000),
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','rejected','withdrawn')),
  reviewer_account_id uuid references public.profiles(id) on delete set null,
  review_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (creator_identity_id)
);
create index creator_applications_queue_idx on public.creator_applications(status, submitted_at);
create index creator_applications_applicant_idx on public.creator_applications(applicant_account_id, submitted_at desc);
alter table public.creator_applications enable row level security;
create policy "Applicants view their own creator applications"
on public.creator_applications for select to authenticated
using (applicant_account_id = (select auth.uid()));
create policy "Applicants submit applications for their own identities"
on public.creator_applications for insert to authenticated
with check (
  applicant_account_id = (select auth.uid())
  and status = 'submitted'
  and reviewer_account_id is null
  and reviewed_at is null
  and exists (
    select 1 from public.creator_identities identity
    where identity.id = creator_identity_id
      and identity.owner_account_id = (select auth.uid())
      and identity.status = 'draft'
  )
);
grant select on public.creator_applications to authenticated;
grant insert (creator_identity_id, applicant_account_id, statement) on public.creator_applications to authenticated;
