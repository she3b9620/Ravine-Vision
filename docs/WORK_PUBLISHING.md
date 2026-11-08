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
