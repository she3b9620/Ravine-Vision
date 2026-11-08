# Work Publishing Workflow

## Purpose

This document records the first controlled path from a private draft to a publicly
discoverable work. It does not settle review criteria, rights requirements, or
monetization eligibility; those remain OPEN decisions.

## Implemented states

```text
draft --(creator submits)--> in_review --(staff publishes)--> published
                                  |
                                  +--(staff requests changes)--> draft + review notes
```

- `submit_work_for_review(work_id)` accepts only a draft owned by the authenticated
  account through an active creative identity.
- `review_work(work_id, decision, notes)` is restricted to RAVINE staff roles
  `reviewer`, `admin`, and `owner`.
- Decisions are `published` or `changes_requested`.
- Returning a work to the creator restores `draft` status so the work can be edited
  and resubmitted. Reviewer notes are shown to the owning creator.
- Publishing records `published_at`; public discovery still requires
  `visibility = 'public'`.
- The creator chooses `visibility` (public / unlisted / private) in the draft editor.
  Choosing `public` does not publish anything by itself; the work stays a private
  draft until a staff decision publishes it.
- Every submission and decision writes an `audit_events` record.

## Authorization boundaries

- Clients cannot write `status`, `published_at`, `reviewed_at`, or `review_notes`.
- Staff can read works while they are in review; ordinary users cannot see another
  account's drafts.
- Public read access remains limited to `status = 'published'` and
  `visibility = 'public'`.
- Publishing does not transfer ownership, grant monetization eligibility, or
  activate payouts.

## Creator and public surfaces

- `/creator/library` shows review status, reviewer notes, and a submit action for
  eligible drafts.
- `/creator/library/[workId]/edit` lets the owning creator edit draft metadata and
  choose the visibility that will apply after publication approval.
- `/review` includes a works queue for authorized reviewers.
- `/works` lists publicly published works.
- `/works/[workId]` shows one publicly published work and its declared creative
  identity.

## OPEN decisions

- Whether an accepted rights declaration, ready media, or a minimum metadata set is
  required before submission or publication.
- Final review criteria, rejection/appeal language, and notification policy.
- Whether reviewers may publish on behalf of a restricted or closed identity.
- Whether `unlisted` or `private` works can be approved without public discovery.
- Moderation visibility into unpublished drafts.
- Review SLA, reviewer assignment, and conflict-of-interest rules.

## Migration status

`supabase/migrations/20261106000100_work_publishing_workflow.sql` is committed to the
repository and was applied to the isolated `ravine-vision` Supabase project
(`pkgtxlmfzsvjarfdhhov`) on 2026-11-06 with explicit founder authorization, together
with the earlier foundation migrations. It must never be applied to the legacy RAVINE
projects.

`supabase/migrations/20261106000200_restore_creator_application_self_submission.sql`
was applied on 2026-11-08 to restore the column-scoped insert grant on
`creator_applications`. An earlier hardening migration had revoked insert together
with update/delete, which blocked the intended RLS-guarded self-submission path. The
restored grant stays column-scoped and insert-only; update and delete remain revoked.

## QA verification data

The 2026-11-08 end-to-end verification used labeled test accounts and left their
data on the preview environment so the cycle can be inspected:

- creator: `ravine-qa@ravine-vision.test` (label `(بيانات اختبار QA)`)
- staff reviewer: `ravine-qa-staff@ravine-vision.test` (role `reviewer`)
- one published work: `d30667e1-73eb-4af6-81cc-62acbc16df7f`

To remove the QA data later, sign in as staff through the app first (staff RPCs
require an authenticated session), then run this in the dashboard SQL editor:

```sql
delete from public.audit_events
where subject_id in (
  select id from public.works where created_by = 'ead4e980-7410-47e9-8c97-41c9a0899489'
);
delete from public.works where created_by = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.creator_applications
where applicant_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.creator_identities
where owner_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from app_private.staff_roles where account_id = 'a74cafd0-db46-44c5-a335-8d23ca688e27';
delete from public.profiles
where id in ('ead4e980-7410-47e9-8c97-41c9a0899489', 'a74cafd0-db46-44c5-a335-8d23ca688e27');
```

The matching `auth.users` rows must be removed through the Supabase Authentication
dashboard (or the Admin API) before those profile rows; delete them in that order.
QA data is intentionally kept for now and is clearly labeled, not passed off as real
content.
