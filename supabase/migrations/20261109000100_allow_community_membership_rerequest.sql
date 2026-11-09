-- Keep community joining request-only while allowing an account to ask again after
-- leaving. Accounts may move their own membership between requested and left, and
-- may leave an active membership, but can never set active/muted/suspended
-- themselves. Owner approval of requests remains an OPEN workflow decision.

drop policy if exists "Accounts leave membership" on public.community_memberships;
drop policy if exists "Accounts leave or re-request membership" on public.community_memberships;
create policy "Accounts leave or re-request membership"
on public.community_memberships
for update to authenticated
using (
  account_id = (select auth.uid())
  and role = 'member'
  and status in ('requested','active','left')
)
with check (
  account_id = (select auth.uid())
  and role = 'member'
  and status in ('requested','left')
);
