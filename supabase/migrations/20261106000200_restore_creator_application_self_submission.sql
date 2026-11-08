-- Correction after the end-to-end QA publish cycle (2026-11-06).
-- 00600 revoked insert on creator_applications together with update/delete to block
-- direct client writes to review outcomes. That also blocked the intended, strictly
-- guarded self-submission path: policy "Applicants submit applications for their own
-- identities" accepts only status='submitted' rows for the applicant's own draft
-- identity, with reviewer fields null. Restore the column-scoped insert grant so a
-- creator can file their own application; update and delete stay revoked, keeping
-- every review decision a trusted server-side operation.
grant insert (creator_identity_id, applicant_account_id, statement)
  on public.creator_applications to authenticated;
