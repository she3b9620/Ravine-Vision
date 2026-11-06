# Open Decisions

These items must not be silently finalized by implementation. Record options, trade-offs, and recommendations before asking for approval.

## Product and experience

- Account tiers, eligibility, verification, and upgrade criteria.
- Exact relationship between personal accounts and multiple creator identities.
- Discovery ranking, editorial selection, and recommendation controls.
- Community privacy levels and governance.
- Live, audio, podcast, and collaboration capabilities.
- Content categories, metadata, and archival standards.

## Trust, rights, and governance

- Identity verification requirements and acceptable evidence.
- Copyright claims, licensing workflows, disputes, and appeals.
- Moderation standards, enforcement levels, and review process.
- Evidence labels and the distinction between fact, belief, opinion, and interpretation.
- Data retention, privacy, export, and deletion policies.

## Creator teams — OPEN

- Whether team invitations should target an existing RAVINE account, verified email, or both.
- Whether one account may join multiple creator teams and whether a creator identity may have multiple owners.
- Proposed team labels in the initial schema: manager, editor, analyst. These labels do not yet define an approved permission matrix.
- Exact permissions for works, media, rights declarations, audience/community management, analytics, monetization, payouts, and account settings.
- Whether team members may invite other members, and which roles may remove or suspend members.
- Ownership transfer, creator incapacity, disputes, and team exit procedures.
- Invitation expiry, revocation, notification, and account-discovery safeguards.

## Economy

- Revenue streams enabled at launch versus later phases.
- Eligibility for creator and participant earnings.
- Platform fees, creator shares, payout thresholds, and payout schedules.
- Supported countries, currencies, payment providers, tax handling, and compliance.
- Refunds, chargebacks, fraud reserves, and dispute handling.
- Rules for tips, memberships, licensing, marketplace transactions, referrals, funds, and originals.

- Economic beneficiary model: account, legal entity, creative identity, and multi-beneficiary/co-creator agreements.
- Ledger posting model, reversal policy, accounting period, statements, and audit retention.
- Definition of available funds, settlement maturity, reserves, and treatment of negative balances.
- Currency minor-unit rules, FX source/timestamp, and cross-currency settlement.
- Country-by-country payout availability, KYC/KYB, tax, sanctions, age, and consumer-protection obligations.
- Refund/cancellation windows, chargeback allocation, and dispute/appeal process.
- Financial staff separation of duties, dual approval thresholds, and payout execution controls.
- Whether community curators, translators, accessibility contributors, reviewers, and referrers can earn, and how impact is verified.

## Technical

- Database and hosting providers for this independent project.
- Media storage, processing, delivery, and regional strategy.
- Authentication provider and account recovery model.
- Analytics and privacy-preserving measurement.
- Search infrastructure and recommendation architecture.
- Native application strategy and release sequencing.
- Content-Security-Policy strategy: nonce versus hash, permitted script/style
  sources, and whether to roll out report-only first. Baseline headers
  (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`) are already applied in `next.config.ts`; CSP is
  deliberately deferred because Next.js injects inline bootstrap scripts and the
  UI uses inline style attributes, so a naive policy would break rendering.
- Whether third-party sites may embed RAVINE pages. `X-Frame-Options` is
  currently `SAMEORIGIN` (blocks clickjacking, allows first-party embeds);
  revisit before any public embedding feature.

## Decision protocol

Each decision should include: context, options, consequences, dependencies, recommendation, approval status, and the person authorized to approve it. Until approved, mark it **OPEN**.
