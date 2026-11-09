-- The media attachment UI records roles (primary, poster, trailer, ...) for a
-- pending asset before any storage upload exists. The previous link policy only
-- accepted assets in 'uploaded' or 'ready', so every metadata-only attachment
-- failed with a link error and left an orphan asset row.
--
-- Allow owners to link their own pending ('initiated') asset to their own draft
-- work. This grants no upload, playback, publication, or provider access; the
-- storage provider and upload transport remain OPEN, and an initiated asset is
-- still clearly labeled as pending.

drop policy if exists "Work owners link their own media" on public.work_media;
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
      and a.state in ('initiated','uploaded','ready')
  )
);
