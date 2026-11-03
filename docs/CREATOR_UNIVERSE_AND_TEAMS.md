# Creator Universe, Multiple Identities, and Teams

## Purpose

A RAVINE personal account may own multiple independent creative identities. The account is the human-level principal; each creative identity is a distinct public/professional presence with its own works, audience, applications, and future team.

## Current foundation

- `profiles` represents the personal account.
- `creator_identities.owner_account_id` binds each identity to its owning account.
- A single account can create multiple rows in `creator_identities`; no one-identity-per-account constraint exists.
- Each identity has its own name, handle, biography, disciplines, and lifecycle status.
- Creator applications attach to a specific identity and are reviewed independently.
- Works attach to a specific `creator_identity_id`; the account owner is the authenticated principal creating drafts.
- Team invitations and memberships attach to one identity, not to the personal account globally.
- Internal RAVINE staff roles are separate from creator-team roles.

## Security invariants

1. A user may create or manage only identities whose `owner_account_id` matches their authenticated account.
2. An invite can only be created by the owner of the identity and must name a different existing account.
3. Only the invited account may accept or decline its pending invitation.
4. Membership rows are created by the trusted invitation-response function, never directly by a client insert.
5. Membership grants visibility into team membership only. It does not currently grant write access to works, media, rights declarations, communities, analytics, economic records, or payouts.
6. Identity status, account tier, verification, publication, financial eligibility, and payout outcomes remain controlled by separate review/trusted workflows.
7. Team membership and creator identity ownership never confer internal staff authority.

## Current team roles (labels only)

- `manager`
- `editor`
- `analyst`

These are stored role labels, not an approved authorization matrix. Until permissions are explicitly approved, they confer no operational capabilities beyond team invitation acceptance and read-only team roster visibility.

## Open governance decisions

- Permission matrix for every role and resource.
- Whether managers can invite, suspend, or remove other members.
- Whether the owner can appoint co-owners or transfer identity ownership.
- Invitation expiry, revocation, and notification policy.
- Account discovery mechanism for invitations (account UUID is the temporary implementation).
- Rules for disputes, owner incapacity, and account closure.
- Whether team members may access sensitive audience or financial analytics.
- Audit retention and user-facing activity history.

## Next implementation gates

1. Confirm a successful CI build for the current account-tier and creator-team changes.
2. Approve the permission matrix before enabling team write operations.
3. Add owner-controlled revocation/removal workflows with audit records.
4. Add explicit identity-level navigation/context to creator studio and work editing, ensuring a work can never silently switch its owning identity.
5. Add identity ownership transfer only after dispute and recovery rules are approved.
6. Apply migrations only to a newly approved, isolated Supabase project; do not touch existing RAVINE projects.
