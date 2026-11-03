-- Invitation expiry is enforced server-side, not by client-provided timestamps.
-- Git-only migration; do not apply without approval of a new isolated Supabase project.

alter table public.creator_team_invitations
  add column expires_at timestamptz not null default (now() + interval '7 days');

create index creator_team_pending_expiry_idx
on public.creator_team_invitations(expires_at)
where status = 'pending';

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

  if v_invitation.expires_at <= now() then
    update public.creator_team_invitations
    set status = 'expired', responded_at = now()
    where id = p_invitation_id;

    insert into public.audit_events(actor_account_id, action, subject_type, subject_id, metadata)
    values (
      (select auth.uid()),
      'creator_team_invitation_expired',
      'creator_team_invitation',
      p_invitation_id,
      jsonb_build_object('creator_identity_id', v_invitation.creator_identity_id)
    );
    return;
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
