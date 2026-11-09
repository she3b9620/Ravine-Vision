-- Fix infinite RLS recursion between communities and community_memberships.
-- The SELECT policy on communities queried community_memberships, whose own SELECT
-- policy queried communities again, so every read failed with 42P17 and the app
-- silently showed empty lists. Membership checks now run through security-definer
-- helpers that bypass RLS instead of re-entering it.

create or replace function app_private.is_active_community_member(p_community_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.community_memberships membership
    where membership.community_id = p_community_id
      and membership.account_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;
revoke all on function app_private.is_active_community_member(uuid) from public, anon;
grant execute on function app_private.is_active_community_member(uuid) to authenticated;

create or replace function app_private.owns_community(p_community_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.communities community
    join public.creator_identities identity on identity.id = community.owner_creator_identity_id
    where community.id = p_community_id
      and identity.owner_account_id = (select auth.uid())
  );
$$;
revoke all on function app_private.owns_community(uuid) from public, anon;
grant execute on function app_private.owns_community(uuid) to authenticated;

-- Anonymous visitors only see public communities.
drop policy if exists "Public communities are discoverable" on public.communities;
create policy "Public communities are discoverable"
on public.communities
for select to anon
using (visibility = 'public');

-- Signed-in accounts see public communities plus the ones they actively belong to.
create policy "Members discover their communities"
on public.communities
for select to authenticated
using (visibility = 'public' or app_private.is_active_community_member(id));

-- Membership visibility no longer re-enters the communities policy directly.
drop policy if exists "Members see their own membership" on public.community_memberships;
create policy "Members see their own membership"
on public.community_memberships
for select to authenticated
using (account_id = (select auth.uid()) or app_private.owns_community(community_id));

-- Joining is a request, not a self-grant. Only owners may activate membership,
-- through a future owner-approval path that is still an OPEN workflow decision.
drop policy if exists "Accounts request membership" on public.community_memberships;
create policy "Accounts request membership"
on public.community_memberships
for insert to authenticated
with check (
  account_id = (select auth.uid())
  and role = 'member'
  and status = 'requested'
);

-- Accounts may only leave (set status to left); they cannot self-activate or
-- change any other membership field.
drop policy if exists "Accounts leave membership" on public.community_memberships;
create policy "Accounts leave membership"
on public.community_memberships
for update to authenticated
using (account_id = (select auth.uid()) and role = 'member')
with check (account_id = (select auth.uid()) and role = 'member' and status = 'left');
