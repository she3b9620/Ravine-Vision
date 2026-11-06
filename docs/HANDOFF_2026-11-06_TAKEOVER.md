# RAVINE VISION — Takeover Handoff

**Date:** 2026-11-06
**Repository:** `she3b9620/Ravine-Vision`
**Branch:** `preview/vercel-review`
**Deployment status:** **NOT DEPLOYED.** No Vercel deployment, no push, no database change.

---

## ملخص تنفيذي (Arabic summary)

تم التحقق من الحالة الفعلية للمشروع على GitHub وVercel وSupabase بأدلة حقيقية،
ثم نُفِّذت أول دفعة إصلاحات مترابطة داخل النطاق المصرح به:

1. **الشعار الرسمي** أصبح مدمجًا فعليًا (كان نصًا فقط: `RAVINE.`).
2. **خط Avenir Arabic** من حزمة المؤسس أصبح مستضافًا ذاتيًا، وأُزيل الاعتماد
   على Google Fonts الخارجي.
3. **إصلاح خلل مُثبت**: الصفحة الرئيسية كانت تُرجع **500** عند غياب متغيرات
   Supabase. الآن تُرجع **200** (تم البناء والاختبار فعليًا بدون المتغيرات).
4. **سلامة أسطح الاكتشاف**: فحص كل المسارات (43 مسارًا) — **صفر أخطاء 5xx** —
   وأُزيلت روابط ميتة (404) وأرقام نشاط ملفّقة وأزرار «انضم» لا تعمل،
   وأصبح `?category=` في الاكتشاف يعمل فعليًا، مع 6 اختبارات تحمي ذلك.

**غير منشور:** لم يتم Push ولم يتم Deploy، لأن Push على هذا الفرع يشغّل
Preview Deployment تلقائيًا عبر تكامل Vercel.

---

## 1. Access and control status (verified)

| Service | Status | Evidence |
|---|---|---|
| **GitHub** | ✅ Authenticated as `she3b9620` | `gh auth status` → token scopes `repo`, `workflow`, `gist`, `read:org` |
| **Vercel** | ✅ Authenticated as `she3b9620` | `vercel whoami` → `she3b9620`; CLI 65.12.1 (native) |
| **Vercel project** | ✅ Linked | `ravine-vision` / `prj_P0RvrYqQcsraVTtpjsRjskeDSkBI` / team `team_rxy3B37uy6vUZ7dU87jn8SnK` |
| **Supabase** | ⚠️ Partial — data-plane only | Project `pkgtxlmfzsvjarfdhhov` reachable (GoTrue `v2.197.0` health 200). **No management access token available**, so control-plane actions (settings, branches, SQL, logs) are not possible. |

### Vercel Git integration — critical operational fact

The project is connected to GitHub (`productionBranch: main`), and any push to
`preview/vercel-review` **automatically creates a Preview deployment**
(observed: `dpl_CqxBnQsbAaSPGEzfhdfFwPTzD4Mk`, branch alias
`ravine-vision-git-preview-vercel-review-she3b9620.vercel.app`).

**Consequence:** `git push` on this branch is equivalent to deploying.
Under the standing LOCKED rule ("no deploy, even Preview, without explicit
request"), work is committed locally only.

### Live deployment status (read-only check, 2026-11-06)

- Production `https://ravine-vision.vercel.app` (built from `main`, commit
  `c7ef17a` — **older than this branch**): `/ar`, `/en`, `/discover`, `/works`,
  `/creators`, `/communities`, `/login` all `200`; `/profile` and `/creator`
  correctly `307` to `/login`.
- The preview branch alias
  `ravine-vision-git-preview-vercel-review-she3b9620.vercel.app` answers `302`
  to Vercel SSO (`vercel.com/sso-api`). Deployment Protection is on, so a
  preview link **cannot be shared publicly** without a share link or disabling
  protection. Worth deciding before the next review round.

Note: because production tracks `main` and this work is on
`preview/vercel-review`, **none of the fixes below are live yet**.

### Verified Supabase project state

- Auth health: `200` — project is live.
- `GET /rest/v1/works` → `404` `PGRST205` — *"Could not find the table
  'public.works' in the schema cache"*.
- Therefore the 15 migration files in `supabase/migrations/` **have never been
  applied** to this project. The database is empty.
- `GET /auth/v1/settings` → `"google": false`, `"email": true`,
  `"mailer_autoconfirm": false`.

This closes an open question from the previous handoff: *Google OAuth is not
merely untested — the provider is disabled in Supabase, and no tables exist to
support any authenticated flow.*

### Vercel environment variables (names only, values not read)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — both present
in Development, Preview, Production. No service-role key is configured, and none
should be added to the client.

---

## 2. HEAD before and after

| | SHA | Description |
|---|---|---|
| `origin/preview/vercel-review` (unchanged) | `de4b9915763080e03388032cf0f643734d8c4132` | `fix(discover): use locale route params in client page` |
| Local HEAD at takeover | `9d23530` | `feat(test): set up vitest and implement component tests` |
| Local HEAD after | `87c7849` | `fix(a11y): global reduced motion, themed focus ring, readable light-theme accents` |

Two local commits were already ahead of `origin` when the session started
(`c14fcca`, `9d23530`), plus uncommitted work. Nothing has been pushed.

---

## 3. Quality gates — before and after (actually executed)

| Gate | Command | Before | After |
|---|---|---|---|
| Production build | `npm run build` | ✅ 39 routes, Next.js 16.4.5 (Turbopack) | ✅ 40 routes (+`/icon.png`) |
| Lint | `npx eslint .` | ⚠️ 1 warning (`empty-state.tsx`: unused `locale`) | ✅ **0 problems** |
| Tests | `npx vitest run` | ✅ 1 file / 2 tests passed | ✅ **5 files / 24 tests passed** |

---

## 4. Defects found and fixed (with evidence)

### FIXED — P1: public guest homepage returned HTTP 500 without Supabase env

`src/app/[locale]/page.tsx` called `createClient()` unconditionally (line 68),
which calls `requireSupabaseEnvironment()` and throws when the two public env
vars are absent. Combined with `export const dynamic = "force-dynamic"`, the
whole guest shell failed.

Reproduced with a real build that excluded `.env.local`:

```
GET /ar            => 500   (before)
GET /en            => 500   (before)
```

After guarding the call behind `getSupabaseEnvironment()` and catching auth
failures, the same no-env build returns:

```
GET /ar            => 200 (21393 bytes)
GET /en            => 200 (21933 bytes)
GET /ar/discover   => 200
GET /ar/about      => 200
```

This matches the charter rule that the public experience must not depend on a
backend it does not need.

### FIXED — P1: no real logo anywhere in the product

There was no `public/` directory at all. Branding was text-only
(`RAVINE.` / `RAVINE` + tagline) and `.rv-brand-mark` was a `Georgia` serif
monogram placeholder — the exact substitution the charter forbids (§41).

Fixed using the founder's own approved package (`اللوجو والفونت.zip`):
English wordmark, Arabic wordmark, monogram, and full lockups, trimmed from the
4000×4000 originals and optimised (15.8 KB wordmark, 61.9 KB lockup).

Implementation detail: the logos are white-on-transparent, so they are rendered
through CSS `mask` with `background-color: currentColor`. The mark therefore
follows the brand text colour in both dark and light themes, and `[dir=rtl]`
switches to the Arabic wordmark automatically — no JS, no duplicate markup.

### FIXED — P2: typography depended on a third-party CDN

`src/app/globals.css` line 1 was a render-blocking
`@import url("https://fonts.googleapis.com/...")` for DM Sans + IBM Plex Sans
Arabic. The founder's bilingual brand typeface **Avenir Arabic** sat unused in
the transfer package.

Verified with real glyph rendering (Pillow/FreeType) that `avenir-arabic-book.otf`
covers Latin, Arabic, and digits — so it is a legitimate full replacement.

Now self-hosted from `public/fonts/` (6 weights, `font-display: swap`), the
external import is removed, and family references were migrated. Verified in the
built CSS: `fonts.googleapis` occurrences = **0**, `Avenir Arabic` = 40.

### FIXED — P3: lint warning

`empty-state.tsx` declared `locale` but never used it. Now used for `lang`/`dir`
on the root element, which also fixes bidi rendering of the empty state.

---

## 5. Files changed

**Commit `b853049`** — preserved pre-existing WIP (not authored this session):
`tsconfig.json`, `vitest.setup.ts`, `docs/ROADMAP.md`, `src/lib/privacy.ts`.

**Commit `fbe86cd`** — this session's batch (35 files):
`src/app/globals.css`; 19 `src/app/[locale]/**/page.tsx` files;
`src/components/member-home.tsx`; `src/components/empty-state.tsx`;
`public/brand/*` (6 images); `public/fonts/avenir-arabic-*.otf` (6 fonts);
`src/app/icon.png`.

---

## 5b. Round 2 — full route verification and public-surface integrity

### Route sweep (evidence, not inspection)

Every page route was derived from the app directory and fetched from a real
production build served with the real Supabase environment. All 43 concrete
paths (`ar` + `en`) were probed with redirects disabled:

| Result | Count |
|---|---|
| `200` public pages | 16 |
| `307` → correct `/login` redirect | 27 |
| `5xx` or Next error pages | **0** |

Public 200s: `/`, `/ar`, `/en`, about ×2, communities ×2, creators ×2,
discover ×2, works ×2, login ×2, creator/community ×2.

`/creator/community` is public by design — it renders `SectionPlaceholder`
with no data access and no actions.

**Detector correction:** an initial run flagged `__next_error__` on the 307
bodies. That is Next.js's redirect response shell, not a failure. The check now
only applies to 2xx bodies; the corrected run shows zero defects.

### Verified defects found by probing, then fixed (commit `43dc5dc`)

| Defect | Evidence before | After |
|---|---|---|
| Works/Creators/Communities cards linked to routes that do not exist | `/ar/works/1` → **404**, `/ar/creators/1` → **404**, `/ar/communities/1` → **404** | 0 detail-route links on all three pages |
| Invented activity numbers | `worksCount: 5 / 12`, `membersCount: 42 / 28` rendered as fact | removed entirely |
| Dead "Join" action | "انضم →" on a non-navigable card | removed |
| Fake "published" status on examples | `status: "published"` badge | removed |
| `/discover?category=` silently ignored | `?category=cinema` → still showed "All worlds" | server-side parse; deep link renders the right world |

Deep-link behaviour now measured over HTTP:

```
/ar/discover                  => 200  active-tab='كل العوالم'
/ar/discover?category=cinema  => 200  active-tab='السينما والصورة'
/ar/discover?category=audio   => 200  active-tab='الصوت والحوار'
/ar/discover?category=bogus   => 200  active-tab='كل العوالم'
```

Sample cards stay for design review but are now non-interactive `<article>`
elements with a visible "Example / مثال توضيحي" badge, neutralised hover and
cursor, and no invented figures — consistent with the charter rule that demo
content must never present itself as real.

`/discover` changed from static (`●`) to dynamic (`ƒ`). That is accurate: its
content now depends on the URL.

Six new regression tests (`src/app/discovery-integrity.test.tsx`) assert no
dead detail links, no fabricated counters, no dead CTA, correct deep-link
selection, unknown-category fallback, and URL write-back on tab change.

---

## 5c. Round 3 — auth redirects pointed at localhost in production

**Verified defect.** `NEXT_PUBLIC_SITE_URL` was never configured in Vercel
(authoritative check: `vercel env ls` lists only the two Supabase variables),
yet `src/app/[locale]/auth/actions.ts` used
`process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` for both redirect
targets. In production that meant:

- every email-confirmation link (`emailRedirectTo`) pointed at `localhost:3000`;
- the Google OAuth `redirectTo` pointed at `localhost:3000`.

An environment-only fix was not possible within the no-console-change rule, so
the code now derives the origin from the request.

`src/lib/site-origin.ts`:

- an explicit `NEXT_PUBLIC_SITE_URL` still wins (trimmed of trailing slashes);
- otherwise the origin comes from `x-forwarded-host` / `x-forwarded-proto`;
- the host is validated against a strict hostname pattern and the first value of
  a proxy list is used, so a forged `Host` header cannot turn the OAuth redirect
  into an open redirect.

Covered by 8 unit tests (`src/lib/site-origin.test.ts`), including the
open-redirect rejection cases (`evil.example/path`, `?x=1`, `user@host`,
`host:notaport`).

Runtime check — `/ar/auth/callback` with no code redirects to the **real**
request origin rather than the hardcoded port:

```
/ar/auth/callback => 307  http://localhost:3041/ar/login?error=callback
/ar/login         => 200
/en/login         => 200
```

End-to-end confirmation of the full signup/OAuth round trip is still blocked:
Google is disabled in Supabase and no mail provider is configured.

---

## 5d. Round 4 — authenticated surfaces no longer crash without a backend

**Verified defect.** A build produced without Supabase env served HTTP `500` for
every authenticated route: 13 pages, 2 server actions, the 4 login actions and
the OAuth callback each called `createClient()` unconditionally, and
`requireSupabaseEnvironment()` throws when the variables are absent. The login
actions and the callback matter most because they are reachable from *public*
pages.

One guard now covers all of them — `requireUser(locale)` in
`src/lib/supabase/session.ts`:

- no backend configured, or the auth call throws → `…/login?error=backend`;
- valid backend but no session → `…/login` (unchanged behaviour).

Measured on a build with `.env.local` removed:

```
/ar/profile          => 307 /ar/login?error=backend     (was 500)
/en/profile          => 307 /en/login?error=backend     (was 500)
/ar/creator          => 307 /ar/login?error=backend     (was 500)
/ar/creator/studio   => 307 /ar/login?error=backend     (was 500)
/ar/creator/library  => 307 /ar/login?error=backend     (was 500)
/ar/creator/team     => 307 /ar/login?error=backend     (was 500)
/ar/creator/earnings => 307 /ar/login?error=backend     (was 500)
/ar/settings         => 307 /ar/login?error=backend     (was 500)
/ar/report           => 307 /ar/login?error=backend     (was 500)
/ar/review           => 307 /ar/login?error=backend     (was 500)
/ar/account/progression => 307 /ar/login?error=backend  (was 500)
/ar/creator/library/demo/edit => 307 /ar/login?error=backend
```

Public routes still return `200` with no backend: `/ar`, `/en`, `/discover`,
`/works`, `/creators`, `/communities`, `/about`, `/login`.

With the backend configured, behaviour is unchanged (`307` to plain `/login`),
and the new bilingual `error=backend` notice renders on the sign-in page in both
locales. Four new tests cover the guard → 20 total.

---

## 5e. Round 5 — the session-refresh proxy was never registered

**Verified defect (most consequential so far).** `proxy.ts` sat at the repository
root, but this project keeps its app under `src/`. Next resolves the file as
`(?:src/)?proxy`, and with a `src` directory present the root file was silently
ignored. Three independent pieces of evidence:

1. `next build` printed no `Proxy`/`Middleware` line;
2. `.next/server/middleware-manifest.json` contained empty `middleware`,
   `sortedMiddleware` and `functions`;
3. a temporary response header set inside `updateSession()` **never appeared on
   any response** — the handler genuinely never executed.

Impact: `updateSession()` never ran, so `@supabase/ssr` never refreshed session
cookies. With `jwt_expiry = 3600`, a signed-in user's access token would expire
after an hour and every server-side `getUser()` would then see no session — a
silent logout — and the `setAll` cookie-write path was dead code in production.

Fix: `git mv proxy.ts src/proxy.ts`. After the move:

- the build prints `ƒ Proxy (Middleware)`;
- the probe header appeared on `/ar`, `/en`, `/ar/profile` and static 404s,
  proving the handler runs on every matched request.

The probe header was removed before committing. Full sweep after the move:
43 routes, `16×200`, `27×307`, **0×5xx** — no regression.

I also checked the handler body was not itself broken:
`auth.getClaims()` exists in `@supabase/supabase-js` 2.118.0, and
`setAll(cookies, headers)` matches the `SetAllCookies` signature in
`@supabase/ssr` 0.12.7. Only the registration was missing.

---

## 5f. Code ↔ schema drift audit: zero drift

Everything the application asks the database for was cross-checked against the
15 migration files (static analysis of `.from(...)` and `.rpc(...)` against
`create table` / `create function`).

| Check | Result |
|---|---|
| Tables/views queried by code | 12 |
| RPCs called by code | 9 |
| Queried but never created | **0** |
| Called but never defined | **0** |

Tables in use: `account_tier_requests`, `creator_applications`,
`creator_identities`, `creator_team_invitations`, `creator_team_memberships`,
`economic_ledger`, `media_assets`, `payout_requests`, `profiles`,
`rights_declarations`, `safety_reports`, `works`.

RPCs in use: `current_staff_role`, `list_my_pending_creator_team_invitations`,
`remove_creator_team_member`, `respond_to_creator_team_invitation`,
`review_account_tier_request`, `review_creator_application`,
`review_rights_declaration`, `review_safety_report`,
`revoke_creator_team_invitation`.

**Why this matters:** the empty database is the biggest blocker, and this audit
shows the migrations are sufficient for every code path — no missing table or
function would fail after they are applied. (It does not validate columns, RLS
policy correctness, or function behaviour; those need a live database.)

Tables created but not yet queried: `audit_events`, `communities`,
`community_memberships`, `follows`, `work_comments`, `work_media`,
`work_reactions` — expected, these back features not yet wired to the UI.

---

## 5g. Round 6 — accessibility conformance (measured, not asserted)

Contrast ratios were computed from the shipped palette rather than eyeballed.

### Defect: light-theme accent text failed WCAG AA

| Pair | Ratio | AA (4.5:1) |
|---|---|---|
| sand `#D49A78` on cream `#F1E9DC` | 2.00 | FAIL |
| copper `#C47A52` on cream | 2.79 | FAIL |
| copper on sidebar `#F7F2E9` | 3.01 | FAIL |
| copper on card `#FFFAF2` | 3.23 | FAIL |
| brown `#70402F` on cream (**fix**) | 7.08 | PASS |
| brown on sidebar / card | 7.64 / 8.20 | PASS |

The palette's own brown replaces sand/copper for **accent text** in the light
theme only (20 selectors, scoped to `.rv-shell` and `.rv-discover-page` so the
pages that stay dark are unaffected). Copper backgrounds keep dark ink text
(`#100d0b` on copper ≈ 5.9:1), so buttons were already compliant.

Dark theme was already compliant: cream 16.53:1, muted 0.62 alpha 6.61:1,
copper 5.93:1, sand 8.24:1.

### Defect: no keyboard focus indicator

No `:focus-visible` rule existed anywhere, and `.auth-form` / `.creator-form`
inputs set `outline:none` with only a 1px border-colour change as feedback.

No single brand colour reaches 3:1 on both surfaces (sand 8.24:1 on ink but
2.00:1 on cream; brown is the inverse), so a themed `--rv-focus` token drives a
2px ring: sand in dark, brown in light.

### Defect: reduced motion only partly honoured

The three existing `prefers-reduced-motion` blocks covered `.ravine-home`,
`.rv-shell` and the auth modal only. Discover, creator, profile, works,
creators, communities, settings and auth screens were uncovered. A global rule
now applies to `*, *::before, *::after`.

Verified in the built stylesheet: `:focus-visible` ×11,
`prefers-reduced-motion` ×4 (including the global one), `#70402f` ×5.
A 4-test contract guard (`src/app/a11y-contract.test.ts`) reads `globals.css`
so these cannot silently disappear.

---

## 6. Claims I checked and did NOT confirm as defects

Recorded so they are not repeated as facts:

- **`src/app/layout.tsx` "mojibake"**: not real. Raw bytes are `\xe2\x80\x94`
  (a valid UTF-8 em dash). What looked like `â€"` was console/display decoding.
- **Arabic strings double-encoded**: not real. A byte-level scan of all 63
  source files found **0** mojibake markers and 0 invalid-UTF-8 files.
- **"Fonts are never loaded"**: wrong — they *were* loaded, via the Google
  Fonts `@import`. The real issue was the third-party dependency, which is now
  removed.

---

## 7. Remaining issues (not fixed in this batch)

| Severity | Issue |
|---|---|
| **BLOCKER (product)** | Supabase has **no tables** (schema drift audit proves the migrations are sufficient once applied). Every authenticated surface (profile, creator studio, library, team, review, reporting) will fail at runtime until migrations are applied — which requires founder approval and a management token. |
| **BLOCKER (auth)** | Google OAuth is **disabled** in the Supabase project (`google: false`). The "Continue with Google" button cannot work end-to-end. |
| ~~HIGH~~ FIXED | Authenticated routes no longer 500 without a backend: all 13 pages, 2 server actions, the login actions and the OAuth callback now redirect to `/login?error=backend` (commit `027b073`). |
| MEDIUM | Hero, creator, and studio visuals hotlink `images.unsplash.com` in `globals.css` — third-party stock imagery, extra origin, no brand control. Needs a design decision. |
| MEDIUM | `docs/ROADMAP.md` (in commit `b853049`) marks three Phase-3 items as `[x]`, including "Select media storage and processing architecture". **I found no storage integration, configuration, or credentials** to support that. Treat as unverified until evidence is supplied. |
| ~~LOW~~ FIXED | Dead CSS removed: `.rv-logo span`, `.rv-brand-mark` (+ its mobile override), `.rv-work-status`, `.rv-creator-link`, `.rv-community-link` (`4ee627b`). |
| LOW | `avenir-arabic-regular.otf` is not registered (duplicates the `book` 400 weight); kept on disk. |

---

## 8. LOCKED constraints respected

- No deploy of any kind; no `git push` (it would auto-deploy).
- No work on `main`, no changes to `she3b9620/Ravine` or `she3b9620/Ravine-Next`.
- No Supabase project/database created, no migration executed, no SQL run.
- No force push, no wide reset, no rollback, no merge.
- No secret values printed; env files contain only the two public keys.
- Brand colours and charter untouched.

## 9. OPEN decisions left untouched

Account tier names/criteria, verification conditions, creator acceptance rules,
Creative Evidence, ratings/nominations, Absolute Cinema, revenue splits, prices,
commissions, payout thresholds, currencies/providers, tax policy, RAVINE Fund,
RAVINE Originals, Marketplace, MVP scope. None were decided or implied.

## 10. External requirements (founder action)

1. **Supabase management token** (`sbp_…`) to grant control-plane access:
   provision the schema, enable Google OAuth, inspect logs. Without it, Supabase
   remains read-only data-plane.
2. **Deploy authorisation**, or explicit instruction to temporarily disconnect
   the GitHub integration, before any push.
3. Decision on whether `preview/vercel-review` should be the branch Vercel
   builds automatically, given the founder's no-deploy rule.

## 11. Recommended next step

Apply the existing migrations to the Supabase project under explicit approval
(or review them first, as files only), then enable Google OAuth and verify the
signup → callback → session flow end to end. Until the database exists, no
authenticated feature can be honestly called implemented.
