# Creator Team Permission Boundaries

## Current implementation state

Team roles `manager`, `editor`, and `analyst` are labels only. An accepted invitation creates a membership record, but does not grant the member access to edit works, upload media, declare rights, manage audiences, view financial records, or initiate payouts.

The identity owner remains the only principal with the currently implemented owner controls: invite, revoke pending invitations, and remove memberships. Invitees can accept or decline their own invitations. All such mutations are performed through authenticated server-side database functions and audited.

## Proposed capability domains (not activated)

| Capability domain | Owner | Manager | Editor | Analyst |
|---|---|---|---|---|
| Identity profile and ownership | Full | OPEN | OPEN | Read-only candidate |
| Invite and remove team members | Full | OPEN | No | No |
| Draft metadata | Full | OPEN | OPEN | Read-only candidate |
| Media upload and replacement | Full | OPEN | OPEN | No |
| Publish, unlist, archive | Full | OPEN | OPEN | No |
| Rights declarations and licensing | Full | OPEN | No | Read-only candidate |
| Community moderation | Full | OPEN | OPEN | Read-only candidate |
| Analytics | Full | OPEN | No | OPEN candidate |
| Contracts and revenue shares | Full | OPEN | No | No |
| Earnings and ledger | Own account only | No by default | No | No |
| Payout requests and payee settings | Verified payee only | No | No | No |
| Ownership transfer and closure | Full, guarded | No | No | No |

This table is a discussion baseline, not an authorization policy. In particular, no team role should inherit access to financial data or payee settings merely because it is named manager.

## Security requirements before enabling capabilities

- Model capabilities as explicit permission keys, not role-name checks scattered through application code.
- Resolve permissions server-side for every read and write; hiding a button is not authorization.
- Scope every capability to one creator identity and, where relevant, one work/community.
- Use deny-by-default behavior and re-check membership status on every request.
- Prevent members from granting themselves roles or escalating permissions.
- Require explicit owner approval for role changes and sensitive capability grants.
- Separate rights/ownership declarations from editorial metadata editing.
- Keep financial ledger, contracts, beneficiary splits, and payout details outside team permissions unless a separately approved policy says otherwise.
- Audit grants, revocations, role changes, exports, and sensitive reads.
- Define emergency suspension, appeal, removal, and access-revocation propagation.

## OPEN approvals

The owner must approve the final capability matrix, whether managers can invite/remove members, whether a work can have work-specific collaborators, and whether any team member may view commercial analytics. Financial permissions remain separately gated.
