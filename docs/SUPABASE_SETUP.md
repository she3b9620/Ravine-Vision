# RAVINE Supabase setup

This repository is the source of truth for the new RAVINE Vision database contract.

## Isolation rule

Do not connect this project to the existing Supabase project named `Ravine`. That project belongs to an earlier platform environment and is explicitly out of scope. Provision a distinct Supabase project named `ravine-vision` after its organization, region, and cost are confirmed.

## Current state

- `supabase/config.toml`: local Supabase configuration.
- `supabase/migrations/20261103000100_initial_ravine_schema.sql`: initial relational foundation and restrictive RLS policies.
- The migration is committed to GitHub only. It has not been applied to any hosted database.
- Auth providers, SMTP, redirect URLs, Storage buckets, Realtime authorization, and operational secrets still require environment-specific configuration.
- No service-role or secret key belongs in GitHub or any `NEXT_PUBLIC_*` variable.

## Provisioning checklist

1. Create a separate Supabase project in the user-confirmed organization and region.
2. Review the quoted recurring/compute cost before creating a paid project.
3. Apply migrations only to the new project.
4. Run security and performance advisors; fix every critical/high finding.
5. Verify table access and RLS with anonymous, owner, non-owner, and moderator test identities.
6. Create private media buckets and narrowly scoped Storage policies before enabling uploads.
7. Configure Auth email confirmation, password recovery, OAuth providers, rate limits, and redirect URLs.
8. Generate TypeScript database types and commit them.
9. Configure local environment variables outside Git; never commit real secrets.

## Security invariants

- Authorization is derived from verified identity and database ownership, never user-editable profile metadata.
- Every exposed public table has RLS enabled.
- Owner update policies include both `USING` and `WITH CHECK`.
- Public work discovery is limited to published + public records.
- Ledger and payout data are private to their account owner.
- Rights declarations are claims and are not proof of ownership.
- No client can write ledger entries or mark payouts as paid.
- Financial calculations and payout execution must be performed by trusted server-side workflows.
- Moderation and administrative actions require a separately designed privileged role and immutable audit trail.

## Open decisions

No pricing, fees, revenue split, eligibility, payout threshold, payment provider, identity-verification vendor, or creator-tier criteria are activated by this migration.
