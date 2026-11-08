-- Public community creation requires an active creative identity, matching the
-- review gate that governs public works and creator discovery. Community privacy
-- levels and governance remain OPEN and are not settled by this migration.

drop policy if exists "Community owners create communities" on public.communities;
create policy "Active identity owners create communities"
on public.communities
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and owner_creator_identity_id is not null
  and exists (
    select 1 from public.creator_identities identity
    where identity.id = owner_creator_identity_id
      and identity.owner_account_id = (select auth.uid())
      and identity.status = 'active'
  )
);
