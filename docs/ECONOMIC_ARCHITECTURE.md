# RAVINE Economic Architecture

## 1. Economic participants

The economy must distinguish four principals:

- **Platform:** RAVINE operating entity and platform treasury.
- **Creative identity:** the public/professional identity that owns or licenses a work.
- **Account holder:** the legal/person-level account that may receive earnings or make purchases.
- **Participating user:** a viewer, supporter, referrer, curator, contributor, or community participant who may qualify for a defined reward.

A single account may control multiple creative identities. Earnings must retain the originating identity and work attribution while the payable beneficiary remains an explicitly verified account or legal entity. Never infer payee ownership from a display name or team membership.

## 2. Revenue and value-transfer catalogue

All entries below are candidates to evaluate, not launch promises.

### Audience-supported
- Recurring creator memberships and subscriptions.
- One-time tips, gifts, patronage, and campaign contributions.
- Paid access, rentals, premieres, tickets, workshops, and events.
- Voluntary support for a work, series, community, or creator identity.

### Rights and commerce
- Licensing, syndication, distribution, format adaptation, and territory/window rights.
- Commissioned creative work, services, and production marketplace.
- Educational materials, courses, books, research, archives, and digital goods.
- Clearly disclosed sponsorships and brand partnerships.
- Affiliate commerce where recommendations are relevant and disclosure is mandatory.

### Platform-led
- Optional professional plans and workflow tools.
- RAVINE Originals and commissioned productions.
- Grants, challenges, awards, and a future RAVINE Fund.
- Carefully governed advertising or sponsorship inventory, if compatible with the product charter.

### Participant value-sharing
- Referral rewards for verified valuable outcomes, never raw sign-ups alone.
- Curator, translator, captioner, accessibility, reviewer, and community-contributor compensation where work and impact can be verified.
- Revenue participation for collaborators based on explicit contracts and recorded consent.

## 3. Ledger model

The ledger is the accounting source of truth; UI balances are projections, never manually editable balances.

Every economic event must capture:
- immutable event and idempotency identifiers;
- source type and source reference;
- payer, beneficiary account, creative identity, work, and contract where applicable;
- currency and integer minor-unit amount;
- gross amount, platform fee, tax/withholding, refunds/chargebacks, reserves, and net amount as separate facts;
- debit/credit direction and lifecycle status;
- effective time, recorded time, actor, and audit reference;
- reversal links rather than destructive edits.

No client may insert, update, or delete ledger entries. Trusted server-side workflows create balanced postings. Corrections use reversal and replacement events. A single transaction must not mix currencies. FX conversion requires an explicit rate, source, timestamp, and separate paired postings.

## 4. Entitlement and distribution lifecycle

Candidate lifecycle:
1. Commercial action or contribution is authorized.
2. Payment/provider confirmation is received and deduplicated.
3. Gross amount and contractual obligations are recorded.
4. Applicable fee, tax, reserve, and refund exposure are calculated by approved policy.
5. Beneficiary shares are calculated from explicit contracts/consents.
6. Pending funds mature into available funds under approved risk rules.
7. A payout request is checked against available funds and existing reservations.
8. Trusted payout processing updates the request and records provider references.
9. Refunds, disputes, chargebacks, and corrections create traceable reversals/adjustments.

The current database foundation is intentionally narrower: it has a generic ledger and payout-request tables. The new payout integrity function only allows requesting up to the same-currency available ledger balance, serializes concurrent requests per account, and reserves active requests. It does not send money or approve eligibility.

## 5. Creative identity and collaboration

- Attribute a transaction to the exact creative identity and work that generated it.
- Team membership does not imply ownership, payee status, contract authority, or payout access.
- Co-creator splits require explicit, versioned agreement and acceptance by all beneficiaries.
- Rights/licensing proceeds must follow the specific licensed rights and territory/time scope.
- Disputes can place only the affected amount on hold where feasible; unrelated balances should remain distinguishable.
- Identity transfer must preserve transaction history and legal payee records.

## 6. Fairness and anti-abuse

Do not pay solely for views, watch time, likes, follows, or raw referral volume. Candidate qualification signals include verified contribution, rights clearance, meaningful audience support, originality, accessibility, quality review, and demonstrated community value. Any scoring must be explainable, appealable, privacy-conscious, and resistant to coordinated manipulation.

Threat model includes fake accounts, self-referrals, bot traffic, engagement rings, stolen payment methods, refund abuse, collusive licensing, impersonation, undisclosed sponsorships, fake rights claims, account takeover, and staff conflicts of interest.

## 7. Financial operations and user rights

Before real payments: country/currency matrix, provider due diligence, KYC/KYB where legally required, tax reporting, sanctions screening, consumer protection, age restrictions, refund and cancellation rules, chargeback handling, reserves, dormant balances, unclaimed funds, account closure, statements, export, and appeals must be defined.

Staff actions require least privilege, dual control for high-risk changes, immutable audit, reason codes, and separation between review, accounting, and payout execution.

## 8. UI contract

The creator earnings area is private and read-only at this stage. It displays ledger entries and payout request history without fabricating a spendable balance, exchange rate, or decimal conversion. Payout initiation stays disabled until eligibility, currency precision, countries, providers, and compliance are approved.

## 9. OPEN decisions — never silently infer

- Launch revenue streams and their order.
- Platform fees, creator shares, collaborator splits, taxes, reserve rates, and payout thresholds.
- Whether tips, memberships, paid access, marketplace, sponsorships, affiliate, grants, or participant rewards launch in beta.
- Definition of meaningful contribution and anti-manipulation thresholds.
- Eligibility by account tier, identity status, age, country, work type, and rights status.
- Payee identity, legal entity, co-owner and beneficiary verification.
- Supported currencies, minor-unit handling, FX source, and settlement currency.
- Payment providers, payout schedule, minimums, fees, and failure handling.
- Refund windows, reserves, disputes, chargebacks, and negative balances.
- Tax/KYC/KYB and sanctions responsibilities.
- Staff access, approvals, financial audit retention, and user appeals.
