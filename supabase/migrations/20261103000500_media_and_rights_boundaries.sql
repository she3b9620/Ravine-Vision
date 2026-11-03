-- RAVINE Vision: enforce ownership boundaries between works, media, and rights declarations.
-- Storage provider and upload transport remain intentionally unconfigured.
-- This migration is committed to Git only; do not apply without approval of an isolated Supabase project.

-- A media record belongs to the authenticated account that created it.
drop policy if exists "Owners register media metadata" on public.media_assets;
create policy "Accounts register their own initiated media"
on public.media_assets
for insert to authenticated
with check (
  owner_account_id = (select auth.uid())
  and state = 'initiated'
  and provider is null
  and provider_asset_id is null
);

-- A work can only reference media owned by the same account that owns the work.
drop policy if exists "Work owners manage media links" on public.work_media;
create policy "Work owners link their own media"
on public.work_media
for insert to authenticated
with check (
  exists (
    select 1
    from public.works w
    join public.media_assets a on a.id = asset_id
    where w.id = work_id
      and w.created_by = (select auth.uid())
      and w.status = 'draft'
      and a.owner_account_id = (select auth.uid())
      and a.state in ('uploaded','ready')
  )
);

create policy "Work owners unlink their own media"
on public.work_media
for delete to authenticated
using (
  exists (
    select 1 from public.works w
    where w.id = work_id
      and w.created_by = (select auth.uid())
      and w.status = 'draft'
  )
);

-- A claimant can declare rights only for a work they own.
drop policy if exists "Claimants submit rights declarations" on public.rights_declarations;
create policy "Work owners submit rights declarations"
on public.rights_declarations
for insert to authenticated
with check (
  claimant_account_id = (select auth.uid())
  and review_status = 'unreviewed'
  and exists (
    select 1 from public.works w
    where w.id = work_id
      and w.created_by = (select auth.uid())
      and w.status = 'draft'
  )
);

-- Declarations are append-only for ordinary users. Review decisions are trusted operations.
revoke update, delete on public.rights_declarations from authenticated;
revoke update on public.media_assets from authenticated;

-- Do not allow clients to alter media ownership, provider references, or processing state.
revoke insert on public.media_assets from authenticated;
grant insert (owner_account_id, asset_kind, mime_type, byte_size)
on public.media_assets to authenticated;
