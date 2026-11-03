-- RAVINE Vision: close client-side privilege escalation paths.
-- Git-only migration. Do not apply until the user approves a new isolated Supabase project.

-- A client may create a draft identity, but cannot self-activate or self-submit it.
drop policy if exists "Owners create creator identities" on public.creator_identities;
create policy "Owners create draft creator identities"
on public.creator_identities
for insert to authenticated
with check (
  owner_account_id = (select auth.uid())
  and status = 'draft'
);

-- Remove table-wide INSERT and grant only user-editable identity columns.
revoke insert on public.creator_identities from authenticated;
grant insert (
  owner_account_id,
  display_name,
  handle,
  biography,
  discipline_tags
) on public.creator_identities to authenticated;

-- Membership begins as a request. Activation and role changes are trusted operations.
drop policy if exists "Accounts request membership" on public.community_memberships;
create policy "Accounts request membership"
on public.community_memberships
for insert to authenticated
with check (
  account_id = (select auth.uid())
  and role = 'member'
  and status = 'requested'
);

-- Keep the existing column-level update grant, but make sure clients cannot update
-- membership state to active/suspended or alter roles through the Data API.
revoke update on public.community_memberships from authenticated;
grant update (status) on public.community_memberships to authenticated;

-- A member may only leave or withdraw their own membership request.
drop policy if exists "Accounts leave membership" on public.community_memberships;
create policy "Accounts leave or withdraw own membership"
on public.community_memberships
for update to authenticated
using (account_id = (select auth.uid()))
with check (
  account_id = (select auth.uid())
  and role = 'member'
  and status in ('left', 'requested')
);
