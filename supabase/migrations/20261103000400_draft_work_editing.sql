-- Draft editing is limited to the work owner and only while the work remains a draft.
-- Publishing transitions remain unavailable to client-side roles.
drop policy if exists "Owners update works" on public.works;
create policy "Owners update draft works"
on public.works
for update to authenticated
using (
  created_by = (select auth.uid())
  and status = 'draft'
)
with check (
  created_by = (select auth.uid())
  and status = 'draft'
);

-- Keep editable fields explicit. In particular, status, creator ownership, and
-- publication timestamps are not client-writable.
revoke update on public.works from authenticated;
grant update (title, synopsis, kind, language_code, visibility, thumbnail_asset_id, updated_at)
on public.works to authenticated;
