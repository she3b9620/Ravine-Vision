-- Owner-controlled team administration. No role-based work/finance permissions are granted here.
-- Git-only migration; do not apply until an isolated Supabase project is explicitly approved.

create or replace function public.revoke_creator_team_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_identity_id uuid;
begin
  select invitation.creator_identity_id into v_identity_id
  from public.creator_team_invitations invitation
  join public.creator_identities identity
    on identity.id = invitation.creator_identity_id
  where invitation.id = p_invitation_id
    and identity.owner_account_id = (select auth.uid())
    and invitation.status = 'pending'
  for update of invitation;

  if not found then
    raise exception 'pending_invitation_not_owned_or_not_found' using errcode = 'P0002';
  end if;

  update public.creator_team_invitations
  set status = 'revoked', responded_at = now()
  where id = p_invitation_id and status = 'pending';

  insert into public.audit_events(actor_account_id, action, subject_type, subject_id, metadata)
  values (
    (select auth.uid()),
    'creator_team_invitation_revoked',
    'creator_team_invitation',
    p_invitation_id,
    jsonb_build_object('creator_identity_id', v_identity_id)
  );
end;
$$;

create or replace function public.remove_creator_team_member(
  p_creator_identity_id uuid,
  p_member_account_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
begin
  if p_member_account_id = (select auth.uid()) then
    raise exception 'owner_cannot_remove_self_with_this_action' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.creator_identities identity
    where identity.id = p_creator_identity_id
      and identity.owner_account_id = (select auth.uid())
  ) then
    raise exception 'identity_not_owned_or_not_found' using errcode = '42501';
  end if;

  update public.creator_team_memberships
  set status = 'removed'
  where creator_identity_id = p_creator_identity_id
    and account_id = p_member_account_id
    and status <> 'removed'
  returning role into v_role;

  if not found then
    raise exception 'active_team_member_not_found' using errcode = 'P0002';
  end if;

  insert into public.audit_events(actor_account_id, action, subject_type, subject_id, metadata)
  values (
    (select auth.uid()),
    'creator_team_member_removed',
    'creator_team_membership',
    p_creator_identity_id,
    jsonb_build_object('member_account_id', p_member_account_id, 'role', v_role)
  );
end;
$$;

revoke all on function public.revoke_creator_team_invitation(uuid) from public, anon;
revoke all on function public.remove_creator_team_member(uuid,uuid) from public, anon;
grant execute on function public.revoke_creator_team_invitation(uuid) to authenticated;
grant execute on function public.remove_creator_team_member(uuid,uuid) to authenticated;
