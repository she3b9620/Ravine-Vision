-- Expose only the minimum identity label needed to understand an incoming invitation.
-- The invitee can see their own pending invitation and the identity's public-facing name/handle.
-- No owner account ID, private biography, team roster, or other identity metadata is returned.

create or replace function public.list_my_pending_creator_team_invitations()
returns table (
  invitation_id uuid,
  identity_display_name text,
  identity_handle text,
  invited_role text,
  invitation_created_at timestamptz,
  invitation_expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    invitation.id,
    identity.display_name,
    identity.handle,
    invitation.role,
    invitation.created_at,
    invitation.expires_at
  from public.creator_team_invitations invitation
  join public.creator_identities identity
    on identity.id = invitation.creator_identity_id
  where invitation.invited_account_id = (select auth.uid())
    and invitation.status = 'pending'
    and invitation.expires_at > now()
  order by invitation.created_at desc;
$$;

revoke all on function public.list_my_pending_creator_team_invitations() from public, anon;
grant execute on function public.list_my_pending_creator_team_invitations() to authenticated;
