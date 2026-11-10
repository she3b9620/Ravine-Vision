# Community Visibility, Membership, and Entry Quizzes

This document records the community behaviour implemented on 2026-11-10 and the
database rules that enforce it. It complements
[Community and Trust Verification](COMMUNITY_AND_TRUST_VERIFICATION.md) and the
[Roadmap](ROADMAP.md).

## Visibility levels

Communities have one of three levels, chosen at creation:

| Level | Who can see it | Who can join |
|---|---|---|
| `public` | Everyone, including signed-out visitors | Request only; owner approval required |
| `discoverable_private` | Signed-in accounts | Request only; owner approval required |
| `invite_only` | Owner and active members only | Invitation workflow is not implemented yet |

The public directory lists `public` communities to everyone and
`discoverable_private` communities to signed-in accounts. Row-level security
enforces the same split at the database, so hiding a level in the UI is not the
only protection.

## Membership flow

Membership is request-only. A signed-in account inserts a row with status
`requested`; it can withdraw by moving the row to `left`, and can request again
later. The account can never set `active` itself.

The community owner approves or rejects requests from the community page. This
relies on the `app_private.owns_community(uuid)` helper and explicit owner
UPDATE/DELETE policies on `community_memberships`. Before migration
`20261110000100`, the only update policy was scoped to the member's own row, so
owner approvals silently matched zero rows and rejections failed on a missing
DELETE grant.

## Entry quizzes

A community may require a short quiz before a join request is created.

- **Public questions** live in `communities.entry_questions` (id, question, type,
  options). They are safe to render.
- **Correct answers** live in the private `community_entry_answer_keys` table.
  No client role has SELECT/INSERT/UPDATE/DELETE on it. The table has RLS enabled
  and a `using (false)` policy so it is never accidentally world-readable.
- `save_community_entry_quiz(uuid, jsonb)` (SECURITY DEFINER) is owner-only and
  replaces both the public question list and the private keys.
- `validate_community_entry_quiz(uuid, jsonb)` (SECURITY DEFINER, stable) returns
  a boolean. It never returns the key, so answers cannot be scraped from the
  browser or the REST API.

Owners edit quizzes at `/[locale]/creator/community/[communityId]/quiz`. Saving
replaces the whole set, because existing answers are never sent back to the
browser.

## Migration requirement

The behaviour above depends on
`supabase/migrations/20261110000100_community_approval_quiz_security_and_visibility.sql`.
Until it is applied to the isolated Supabase project, the UI renders but owner
approval remains blocked by the old policies and answers stay in the public
column. The migration also moves any legacy `correct_answer` values into the
private table and strips them from `entry_questions`.

## Still open

Community governance, moderator roles, sanctions and appeals, moderation
retention, content battle/management, published-work rights and licensing, team
capability enforcement, and the invitation workflow for `invite_only`
communities remain OPEN decisions (see [Open Decisions](OPEN_DECISIONS.md)).
