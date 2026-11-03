# Authorization Boundaries and Threat Model

This document defines the server-enforced security boundaries for RAVINE, ensuring platform power is accountable and user rights are protected per the [Foundation Charter](../docs/FOUNDATION_CHARTER.md).

## 1. Core Principles

- **Deny-by-default:** Access is forbidden unless explicitly granted by a verified policy.
- **Server-enforced:** Client-side UI toggles are cosmetic. All mutations and sensitive reads must re-validate authority on the server (Supabase RLS or Server Actions).
- **Universe Isolation:** Permissions are scoped to specific creative identities or projects, never granted globally by assumption.
- **Auditability:** Sensitive operations (role changes, content removal, financial requests) must be recorded in the audit log.

## 2. Universe Boundaries

### Personal Universe (Account Holder)
- **Scope:** Private data (email, preferences), relationships (follows), saved works.
- **Rule:** Only the account holder (authenticated via Supabase `auth.uid()`) can read or write their own profile and private collections.

### Creator Universe (Creative Identity)
- **Scope:** Public identity profile, work drafts, team management, analytics.
- **Ownership:** The `owner_account_id` has ultimate authority.
- **Delegation:** Team members (manager, editor, analyst) have scoped access defined by their role. 
- **Constraint:** A team member cannot escalate their own role or remove the owner.

### Work / Expression Universe
- **Scope:** Published works, project metadata, rights declarations.
- **Rule:** Visibility follows the `visibility` flag (public, unlisted, private).
- **Rights:** Uploading does not prove ownership. Deleting or modifying a work requires ownership or "Editor" permissions for the associated identity.

## 3. Role-Based Access Control (RBAC) - Baseline

| Role | Profile | Manage Team | Create/Edit Works | Publish | Financials |
|---|---|---|---|---|---|
| **Owner** | Full | Yes | Full | Full | Full |
| **Manager** | Read | Yes | Edit Meta | No | Read-only |
| **Editor** | Read | No | Full | Yes | No |
| **Analyst** | Read | No | Read-only | No | Read-only |

## 4. Threat Model and Mitigations

### 4.1. Account and Identity
- **Threat:** Impersonation or account takeover.
- **Mitigation:** MFA support, session monitoring, and strict handle uniqueness checks.
- **Threat:** Squatting on reputable handles.
- **Mitigation:** Identity verification (Verified/Select tiers) and manual review for high-impact handles.

### 4.2. Content and Rights
- **Threat:** Plagiarism or unauthorized uploads.
- **Mitigation:** Mandatory rights declaration workflow. Community reporting with expedited review for verified rights holders.
- **Threat:** Manipulation of discovery (engagement rings).
- **Mitigation:** Discovery governed by relevance and evidence, not raw counts. Use of "Creative Evidence" to weight recommendations.

### 4.3. Platform Power
- **Threat:** Abuse of moderator authority.
- **Mitigation:** Staff actions are logged. Users have a right to appeal. Suspension requires a recorded rationale and policy reference.

## 5. Security Invariants

1. `profiles.id` must match `auth.uid()` for all personal data access.
2. `creator_identities.owner_account_id` must match `auth.uid()` for identity management.
3. No user can modify another user's `account_tier` directly.
4. Payout requests must never exceed the validated ledger balance.
