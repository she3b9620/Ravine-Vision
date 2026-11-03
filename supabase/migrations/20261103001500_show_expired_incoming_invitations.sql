-- Include expired pending invitations in the invitee's private inbox so expiry is visible.
-- Expiry remains enforced by the response RPC; this listing does not mutate state.

create or replace function public.list_my_pending_creator_team_invitations()
returns table (
  invitation_id uuid,
  identity_display_name text,
  identity_handle text,
  invited_role text,
  invitation_status text,
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
    case
      when invitation.status = 'pending' and invitation.expires_at <= now() then 'expired'
      else invitation.status
    end,
    invitation.created_at,
    invitation.expires_at
  from public.creator_team_invitations invitation
  join public.creator_identities identity
    on identity.id = invitation.creator_identity_id
  where invitation.invited_account_id = (select auth.uid())
    and (
      invitation.status = 'pending'
      or invitation.status = 'expired'
    )
  order by invitation.created_at desc;
$$;

revoke all on function public.list_my_pending_creator_team_invitations() from public, anon;
grant execute on function public.list_my_pending_creator_team_invitations() to authenticated;
