-- Creator team foundation. Creator roles are separate from internal RAVINE staff roles.
-- Capability-level permissions remain OPEN; membership alone grants no work or finance access.
-- Git-only migration. Do not apply until a new isolated Supabase project is explicitly approved.

create table public.creator_team_invitations (
  id uuid primary key default gen_random_uuid(),
  creator_identity_id uuid not null references public.creator_identities(id) on delete cascade,
  invited_account_id uuid not null references public.profiles(id) on delete cascade,
  invited_by_account_id uuid not null references public.profiles(id) on delete restrict,
  role text not null check (role in ('manager','editor','analyst')),
  status text not null default 'pending' check (status in ('pending','accepted','declined','revoked','expired')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (id, creator_identity_id, invited_account_id)
);

create unique index creator_team_one_pending_invitation
on public.creator_team_invitations(creator_identity_id, invited_account_id)
where status = 'pending';

create table public.creator_team_memberships (
  creator_identity_id uuid not null references public.creator_identities(id) on delete cascade,
  account_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('manager','editor','analyst')),
  status text not null default 'active' check (status in ('active','suspended','removed')),
  invitation_id uuid not null unique,
  joined_at timestamptz not null default now(),
  primary key (creator_identity_id, account_id),
  constraint creator_team_membership_invitation_fk
    foreign key (invitation_id, creator_identity_id, account_id)
    references public.creator_team_invitations(id, creator_identity_id, invited_account_id)
);

create index creator_team_memberships_account_idx
on public.creator_team_memberships(account_id, status);

alter table public.creator_team_invitations enable row level security;
alter table public.creator_team_memberships enable row level security;

create policy "Identity owners and invitees view team invitations"
on public.creator_team_invitations
for select to authenticated
using (
  invited_account_id = (select auth.uid())
  or exists (
    select 1 from public.creator_identities identity
    where identity.id = creator_identity_id
      and identity.owner_account_id = (select auth.uid())
  )
);

create policy "Identity owners invite team members"
on public.creator_team_invitations
for insert to authenticated
with check (
  invited_by_account_id = (select auth.uid())
  and invited_account_id <> (select auth.uid())
  and status = 'pending'
  and responded_at is null
  and exists (
    select 1 from public.creator_identities identity
    where identity.id = creator_identity_id
      and identity.owner_account_id = (select auth.uid())
  )
);

create policy "Owners and members view team membership"
on public.creator_team_memberships
for select to authenticated
using (
  account_id = (select auth.uid())
  or exists (
    select 1 from public.creator_identities identity
    where identity.id = creator_identity_id
      and identity.owner_account_id = (select auth.uid())
  )
);

grant select on public.creator_team_invitations, public.creator_team_memberships to authenticated;
grant insert (creator_identity_id, invited_account_id, invited_by_account_id, role)
on public.creator_team_invitations to authenticated;
revoke update, delete on public.creator_team_invitations from authenticated;
revoke insert, update, delete on public.creator_team_memberships from authenticated;

create or replace function public.respond_to_creator_team_invitation(
  p_invitation_id uuid,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitation public.creator_team_invitations%rowtype;
begin
  if p_decision not in ('accepted','declined') then
    raise exception 'invalid_invitation_decision' using errcode = '22023';
  end if;

  select * into v_invitation
  from public.creator_team_invitations
  where id = p_invitation_id
    and invited_account_id = (select auth.uid())
  for update;

  if not found or v_invitation.status <> 'pending' then
    raise exception 'invitation_not_pending_or_not_yours' using errcode = 'P0002';
  end if;

  update public.creator_team_invitations
  set status = p_decision, responded_at = now()
  where id = p_invitation_id;

  if p_decision = 'accepted' then
    insert into public.creator_team_memberships (
      creator_identity_id, account_id, role, invitation_id
    ) values (
      v_invitation.creator_identity_id,
      v_invitation.invited_account_id,
      v_invitation.role,
      v_invitation.id
    )
    on conflict (creator_identity_id, account_id)
    do update set
      role = excluded.role,
      status = 'active',
      invitation_id = excluded.invitation_id,
      joined_at = now();
  end if;

  insert into public.audit_events(actor_account_id, action, subject_type, subject_id, metadata)
  values (
    (select auth.uid()),
    'creator_team_invitation_' || p_decision,
    'creator_team_invitation',
    p_invitation_id,
    jsonb_build_object('creator_identity_id', v_invitation.creator_identity_id, 'role', v_invitation.role)
  );
end;
$$;

revoke all on function public.respond_to_creator_team_invitation(uuid,text) from public, anon;
grant execute on function public.respond_to_creator_team_invitation(uuid,text) to authenticated;
