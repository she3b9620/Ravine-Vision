# Community and Trust Flows — Preview Verification

**Date:** 2026-11-08 (continued into 2026-11-09)
**Environment:** isolated `ravine-vision` Vercel preview
`https://ravine-vision-5vxgto84n-she3b9620.vercel.app` (branch
`preview/vercel-review`; built from commit `990f7ab`). The same flows were first
exercised on `https://ravine-vision-3i7cxf58w-she3b9620.vercel.app`, and the earlier
trust checks ran on `https://ravine-vision-8v0fruxcs-she3b9620.vercel.app`.
**Database:** isolated Supabase project `pkgtxlmfzsvjarfdhhov` only
**Status:** preview verification with clearly labeled QA data. No production
promotion, no `main` changes, and no legacy project changes.

This note records what was actually exercised, what broke and was fixed, and what
remains unapproved. It does not convert any OPEN product decision into a policy.

## Implemented in this batch

- **Public community creation.** `/creator/community` now contains a real creation
  form for an owned **active** creative identity. The community is created as
  `public`, appears in `/communities`, and lists on the creator page across all
  owned identities. Community privacy levels and governance remain OPEN.
- **Active-identity gate.** Migration
  `20261108000100_community_creation_requires_active_identity.sql` enforces at the
  database level that only the owner of an active identity can insert a community.
- **RLS recursion fix.** Migration
  `20261108000200_fix_community_rls_recursion.sql` replaces the mutually recursive
  SELECT policies on `communities` and `community_memberships` with
  `security definer` helpers (`app_private.is_active_community_member` and
  `app_private.owns_community`). Before this fix every community read failed with
  `42P17: infinite recursion detected in policy for relation "communities"`, and
  the UI silently showed empty lists.
- **Membership stays request-only.** Insert is limited to
  `status = 'requested'`, `role = 'member'`, and the caller's own account. Accounts
  may withdraw a pending request and may request again after leaving, but can never
  set `active`, `muted`, or `suspended` themselves. Migration
  `20261109000100_allow_community_membership_rerequest.sql` narrows the self-update
  policy to `requested`/`left` and leaves owner approval as an OPEN workflow.
- **Metadata-only media attachment.** The merged media UI links an asset to a draft
  work with a display role (`primary`, `poster`, `trailer`, …). Those assets are
  still in the `initiated` state because no upload provider exists. Migration
  `20261109000200_allow_pending_media_metadata_links.sql` allows owners to link
  their own pending asset to their own draft without granting upload, playback,
  publication, or provider access.
- **Draft-only rights intake.** The declaration form appears only for drafts. A
  published work explains that changing declarations and the claims/disputes path
  are not approved yet.
- **Safety-report decision fix.** Migration
  `20261108000300_fix_safety_report_decision_cast.sql` casts the decision to
  `public.case_status`. The original function assigned `text` to an enum and every
  decision failed with `?error=save`.
- Removed a stray non-Arabic label from the creator community page.

## Verified end to end

All actions below ran through the deployed app with real authenticated sessions.

| Flow | Result |
| --- | --- |
| Creator requests tier `creator` | Request `f498b36c-c01b-47c9-8e73-455727ac4d6d` submitted |
| Staff reviewer approves the tier request | Profile tier becomes `creator`; approved request and review notes visible |
| Creator opens `/creator/community` with an active identity | Community `f4ddf242-4ea1-4c74-8e75-c399e342585f` created and listed |
| Guest opens `/ar/communities` and the community detail page | Public community appears with organizer, charter, and privacy label; guest sees a sign-in-to-request CTA, not a direct join button |
| Signed-in member requests to join the community | Row stored as `requested`; UI shows pending status and a withdraw action |
| Member withdraws the request | Row becomes `left`; the request button returns |
| Member requests again after leaving | Row returns to `requested`; no self-activation occurs |
| Staff membership row created during the join test | Deleted; community membership table returned to zero rows |
| Duplicate QA community from a retry | Duplicate `e793998a-e9b6-4654-8132-c2beb3487f8c` deleted |
| Creator creates a draft | Draft `1ae57f04-ac53-47d1-8d5b-4b46d73e9d8e`, private |
| Guest opens the draft URL directly | 404; no draft content leaked |
| Creator registers media metadata | `video/mp4`, 10,485,760 bytes, state `initiated`; no upload occurs |
| Creator links an `initiated` asset as `primary` | Failed with `?error=link` before the policy fix; succeeds after migration `20261109000200` |
| Creator detaches the media link | `work_media` row removed; asset remains; both test assets and the test link were cleaned up |
| Creator submits a rights declaration on the draft | Accepted declaration `f11f694b-59aa-49d9-8267-73cb14c0d5a0` |
| Duplicate declaration from a retry | Rejected with notes `ffe9308c-6e06-44cf-9e73-2f5bbc22e0eb` |
| Creator opens the published QA work's rights page | No form; page explains the published-work claims path is unapproved |
| Team invitation sent to the staff account | Pending invitation; staff accepts it |
| Creator views team | Member shown as active with role `editor` |
| Creator removes the member | Membership status becomes removed; page confirms the update |
| Creator submits safety reports | Reports `3aa21c07-0948-4956-888f-7bc5ac0b3ec6` and `0df81175-c913-412f-9d16-b93cdd0aba0e` |
| `reviewer` opens `/review` | Review queues visible; safety/moderation section absent |
| Staff role temporarily raised to `admin` | Both QA reports dismissed with notes; audit events recorded |
| Staff role reverted to `reviewer` | Verified in `app_private.staff_roles` and in the app; moderation section absent |
| Final creator pages on preview `5vxgto84n` | Tier `creator` with the approved request; team member shown as removed with the accepted invitation retained; draft rights show both accepted and rejected declarations; QA community listed; one media row and zero attached links |
| Final guest and session checks on preview `5vxgto84n` | Community page shows the sign-in-to-request CTA and the request-only note; draft URL returns 404 with no content; `reviewer` sees the review queues without the safety/moderation section; join request → pending → withdraw repeated successfully |

Database state after the run: account tier `creator`; two safety reports
`dismissed`, zero open; accepted and rejected rights declarations present; one media
metadata row (the retry duplicates were removed) with zero `work_media` links; one
public QA community with zero membership rows; the team membership removed.
`app_private.staff_roles` for the QA staff account is back to `reviewer`.

## Defects found and fixed

1. **Infinite RLS recursion (blocking).** `communities` SELECT referenced
   `community_memberships`, whose SELECT referenced `communities` again. Every read
   failed with `42P17` and was presented as an empty list. Fixed with
   security-definer helpers and split anonymous/authenticated policies.
2. **Safety-report decisions always failed.** `review_safety_report` assigned a
   `text` parameter to the `case_status` enum without a cast. Fixed with
   `p_decision::public.case_status`.
3. **Community creation was not reachable.** The public "create community" link led
   to a page with no form. Implemented the form and the active-identity gate.
4. **Rights form was offered for published works.** Now limited to drafts, with an
   explicit explanation for published works.
5. **Stray non-Arabic label** in the creator community listing. Removed.
6. **Merged join action tried to self-activate.** The remote `joinCommunityAction`
   updated an existing row to `active`, which RLS silently rejected. Rewritten to
   insert/update only `requested`, to support withdrawal and re-request, and to show
   the pending/withdraw state. No self-activation path remains.
7. **Media attachment rejected pending assets.** The merged UI records roles before
   upload, but the link policy accepted only `uploaded`/`ready` assets, so every
   metadata-only link failed with `?error=link` and left an orphan asset row. The
   policy now accepts the owner's own `initiated` asset for the owner's draft.

## Not proven / still OPEN or blocked

- Community privacy levels, discoverability rules, governance, and moderator roles.
- Owner approval or rejection of join requests; joining is request-only today.
- Community content, posts, and membership management beyond listing.
- Rights claims, licensing, disputes, and appeals for published works.
- Actual media upload, processing, playback, retention, and storage provider.
- Enforcement of creator-team role capabilities; membership alone grants no work,
  media, rights, or finance access.
- Google OAuth consent-screen branding still names the Supabase project URL
  (`pkgtxlmfzsvjarfdhhov.supabase.co`); Google Cloud app name/branding is not
  configured.
- Cross-client Google OAuth on Desktop and Android is not verified.
- Web Google OAuth is now verified end-to-end (see below); it is no longer
  listed as fully unproven, but the two items above remain OPEN.
- Moderation standards, sanctions, appeals, and retention policy.

## Google OAuth web verification (2026-11-09)

**Environment:** stable branch alias
`https://ravine-vision-git-preview-vercel-review-she3b9620.vercel.app` (now
serving deployment `gfiysnbmb`), with the final direct preview
`https://ravine-vision-5vxgto84n-she3b9620.vercel.app` still allowlisted. Supabase
project `pkgtxlmfzsvjarfdhhov`.

**Supabase URL configuration change:**
- `Site URL` was `http://localhost:3000`; corrected to the stable branch alias.
- Allowlist was only the old preview `ravine-vision-1mihy6b9h-...` plus a malformed
  combined URL; corrected to the stable alias plus the verified final preview
  `ravine-vision-5vxgto84n-...`. The old/malformed entries were removed.
- Google provider remains enabled; email provider enabled; `mailer_autoconfirm=false`.

**Verified path:**
- Guest `/ar/login` renders "Continue with Google" only because `/auth/v1/settings`
  reports `google: true`.
- Clicking it calls `signInWithGoogleAction`, which derives the origin from the
  request (`getSiteOrigin`) and redirects to Supabase with
  `redirectTo=https://ravine-vision-git-preview-vercel-review-she3b9620.vercel.app/ar/auth/callback`.
- Google account chooser and consent screen appear; consent granted.
- Supabase redirects to `/ar/auth/callback?code=...`; `exchangeCodeForSession`
  succeeds; `profiles` is upserted and the browser lands on `/ar/profile`.
- Profile shows the real founder account `she3b9620@gmail.com` / `Muhammad Shaaban`,
  tier `viewer`, with an active session and working sign-out.
- Database row: `auth.users` provider `google`, `email_verified=true`,
  `raw_user_meta_data.full_name = "Muhammad Shaaban"`; `public.profiles`
  `display_name = "Muhammad Shaaban"`, `account_tier = viewer`,
  `preferred_locale = ar`, `discoverable = true`.

**Code change made during this review:**
- `src/lib/display-name.ts` resolves a display name from `display_name`,
  `full_name`, then `name`, so Google OAuth no longer stores an empty name.
- `/auth/callback` and `signInAction` fill an empty profile name without
  overwriting a later user-chosen name.
- `/ar/profile` falls back to the same resolver before the neutral "RAVINE member"
  label.
- Verified by emptying the founder profile name, reloading `/ar/profile` (fallback
  showed "Muhammad Shaaban"), signing out, signing in with Google again, and
  confirming the callback repopulated `public.profiles.display_name`.

**Still OPEN / blocked:**
- Google Cloud consent-screen branding: App name set to `RAVINE` in Google Cloud Branding (account chooser now shows "المتابعة إلى RAVINE"), but the consent screen body still names `pkgtxlmfzsvjarfdhhov.supabase.co` pending OAuth client name update/propagation.
- Cross-client Google OAuth on Desktop and Android is not verified.
- No production deployment and no changes to `main` or the legacy repositories.

## QA data and cleanup

The QA accounts and rows remain on the preview, clearly labeled. They must not be
presented as real content. To remove all QA data created up to 2026-11-09, run the
following in the isolated project's SQL editor. Deleting profiles alone is not
enough: several rows use `on delete restrict` references.

```sql
-- Isolated ravine-vision project only (pkgtxlmfzsvjarfdhhov).
begin;

delete from public.audit_events
where subject_id in (
  select id from public.works
   where created_by = 'ead4e980-7410-47e9-8c97-41c9a0899489'
  union all
  select id from public.safety_reports
   where reporter_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489'
  union all
  select id from public.communities
   where created_by = 'ead4e980-7410-47e9-8c97-41c9a0899489'
  union all
  select id from public.rights_declarations
   where claimant_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489'
  union all
  select id from public.account_tier_requests
   where account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489'
);

delete from public.safety_reports
 where reporter_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.community_memberships
 where account_id in (
   'ead4e980-7410-47e9-8c97-41c9a0899489',
   'a74cafd0-db46-44c5-a335-8d23ca688e27'
 );
delete from public.communities
 where created_by = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.rights_declarations
 where claimant_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.work_media
 where work_id in (
   select id from public.works
    where created_by = 'ead4e980-7410-47e9-8c97-41c9a0899489'
 )
    or asset_id in (
      select id from public.media_assets
       where owner_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489'
    );
delete from public.media_assets
 where owner_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.works
 where created_by = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.creator_team_invitations
 where invited_by_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489'
    or invited_account_id = 'a74cafd0-db46-44c5-a335-8d23ca688e27';
delete from public.account_tier_requests
 where account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.creator_applications
 where applicant_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from app_private.staff_roles
 where account_id = 'a74cafd0-db46-44c5-a335-8d23ca688e27';
delete from public.creator_identities
 where owner_account_id = 'ead4e980-7410-47e9-8c97-41c9a0899489';
delete from public.profiles
 where id in (
   'ead4e980-7410-47e9-8c97-41c9a0899489',
   'a74cafd0-db46-44c5-a335-8d23ca688e27'
 );

commit;
```

The matching `auth.users` rows must be removed through the Supabase Authentication
dashboard or Admin API after the profile rows.

## Migration status

`20261108000100_community_creation_requires_active_identity.sql`,
`20261108000200_fix_community_rls_recursion.sql`,
`20261108000300_fix_safety_report_decision_cast.sql`,
`20261109000100_allow_community_membership_rerequest.sql`, and
`20261109000200_allow_pending_media_metadata_links.sql` are in the repository and
were applied to the isolated `ravine-vision` Supabase project with explicit founder
authorization. They must never be applied to the legacy RAVINE projects.
