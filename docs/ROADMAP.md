# RAVINE Implementation Roadmap

This roadmap sequences engineering work without locking unresolved product choices.

## Phase 0 — Independent foundation
- [x] Create independent repository.
- [x] Establish Next.js, React, and TypeScript application shell.
- [x] Establish initial Arabic/English landing experience.
- [x] Record charter, architecture boundaries, open decisions, and economy scope.
- [x] Verify install, lint, and production build in a real execution environment (2026-11-06).

## Phase 1 — Product skeleton
- [x] Define shared brand and navigation models.
- [x] Define initial work taxonomy and account/creator identity concepts.
- [x] Add locale-prefixed landing, discovery, and about routes.
- [x] Add works, creators, communities, and creator-space route shells.
- [x] Add shared accessible UI primitives and empty/loading/error states.
- [x] Add route and component tests.

## Phase 2 — Domain contracts
- [x] Define account, creator identity, work, community, rights, and moderation contracts.
- [x] Define authorization boundaries and threat model.
- [x] Define media lifecycle and provider adapter interfaces.
- [x] Define economy ledger and payout contracts without rates or providers.

## Phase 3 — Controlled service integration
- [x] Select new isolated database and authentication services.
- [x] Select media storage and processing architecture.
- [x] Implement audit, privacy, export, deletion, and consent foundations.
- [x] Add payments only after legal, tax, country, and policy decisions are approved.

## Phase 4 — Audience and creator workflows
- [x] Discovery and viewing (Guest hero showcase with Video/Image mode, public works, creators, and communities discovery linked to real database tables).
- [x] Personal account and multiple creator identities.
- [x] Creator workspace and publishing lifecycle.
- [x] Communities, live/audio, and collaboration in staged releases (Community creation, detail view, active membership join/leave, creator teams, and invitation lifecycle).
- [x] Work detail theatrical presentation, charter-driven reactions (appreciate/thoughtful/inspiring), and dignified discourse reflections.
- [x] Creator profile following connection and community linkage.

## Phase 5 — Trust, economy, and scale
- [ ] Rights claims, licensing, disputes, and appeals.
- [ ] Transparent earnings ledger and payout workflows.
- [ ] Sustainable monetization experiments with explicit approvals.
- [x] Reliability, observability, accessibility, and performance hardening.

No legacy migration or production integration beyond the isolated `ravine-vision` Vercel and Supabase projects is authorized by this roadmap.

## Delivery log

- **2026-11-06** — Controlled work publishing: creator submission from an active
  identity, staff review queue, publish/return decisions with audit records, creator
  review notes, and public `/works` listing and detail pages. See
  [Work Publishing Workflow](WORK_PUBLISHING.md).
- **2026-11-06** — With explicit founder authorization, the full isolated migration
  set was applied to the `ravine-vision` Supabase project, and a preview deployment
  was published on Vercel for the `preview/vercel-review` branch. No production
  deployment and no changes to `main` or the legacy repositories.
- **2026-11-06 (Takeover Session)** — Resolved in-progress merge conflict on `preview/vercel-review`.
  Integrated controlled work publishing with Phase 3 hardened foundations.
  Extracted and integrated official assets from `RAVINE_COMPLETE_TRANSFER_PACKAGE_2026-11-03`.
  Implemented cinematic Guest Hero Showcase with Video/Image modes and registered charter copy.
  Upgraded Creators and Communities public discovery from static placeholders to real database queries
  with honest empty states and full detail routes (`/creators/[creatorId]` and `/communities/[communityId]`).
  All 41 vitest tests pass. Next.js production build succeeds for all 40 routes with 0 errors.
- **2026-11-08** — End-to-end publish cycle **VERIFIED** on the preview deployment
  `https://ravine-vision-y16m3k1x4-she3b9620.vercel.app` (branch `preview/vercel-review`).
  With clearly labeled QA accounts, the full path ran as real authenticated sessions:
  account → profile → creator identity/application → staff approval → studio draft →
  creator chooses `public` visibility in the draft editor → submit for review →
  staff `changes_requested` with notes visible to the creator → resubmit → staff
  publishes → guest `/ar/works` and `/en/works` list the work and the detail page
  renders. Pre-publish guest checks confirmed an empty listing and a 404 for the
  direct work URL, without leaking unpublished content. Database verification:
  `status = 'published'`, `visibility = 'public'`, `published_at` and `reviewed_at`
  set, review notes stored, and audit events for the submission plus both review
  decisions. Two defects found by this verification were fixed and shipped:
  migration `20261106000200_restore_creator_application_self_submission.sql`
  restores the column-scoped insert grant on `creator_applications` that an earlier
  hardening migration had over-revoked, and the draft editor now exposes the
  visibility choice while publishing remains a staff decision. The QA data stays on
  the preview and is explicitly labeled as test data; a cleanup query is documented
  in [Work Publishing Workflow](WORK_PUBLISHING.md). Remaining gaps: Google OAuth
  end-to-end sign-in is blocked on external provider configuration, and media
  upload remains an OPEN provider decision. No production deployment and no changes
  to `main` or the legacy repositories.

- **2026-11-08 (OAuth & Interaction Expansion)** — Google OAuth verified active (google: true) on Supabase with multi-client architecture prepared for Web, Desktop, and Android. Built theatrical stage presentation for works, charter-driven reactions (appreciate, thoughtful, inspiring), and dignified reflections thread. Added community membership join/leave actions and creator work follow flow. All 41 Vitest tests pass; Next.js production build passes across all 40 routes with 0 errors.
