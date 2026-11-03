# Security and Data Boundaries

## Non-negotiable boundaries

- Never commit API keys, passwords, service-role keys, signing secrets, or private tokens.
- Do not connect this project to legacy RAVINE Supabase projects, Cloudinary accounts, or deployment environments by assumption.
- Do not run migrations against any existing database.
- Do not treat client-side state, hidden controls, or submitted role names as authorization.
- Enforce access control on the server for every private resource and mutation.
- Separate public creator identity data from private account and payout data.
- Minimize collection, define retention, and provide export/deletion paths before production launch.
- Record security-sensitive administrative actions in an auditable log.

## Data classification to design for

- Public: published works, public creator profiles, public community content.
- Account-private: email, authentication identifiers, preferences, private drafts.
- Sensitive operational: moderation cases, reports, appeals, risk signals.
- Financial: balances, ledger entries, tax and payout information.
- Restricted secrets: credentials and cryptographic material; never expose to clients or repository history.

## Before connecting services

Require a documented data-flow diagram, threat model, access matrix, backup/recovery plan, retention policy, and explicit approval of the new isolated provider/project.
