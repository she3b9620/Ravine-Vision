# RAVINE — The Path to Light

**RAVINE** is an independent, human-centered creative and knowledge platform. Its purpose is to help people discover meaningful work, understand one another, create with dignity, and preserve human expression.

**رَافِين — الشِّعب، الطريق إلى النور.**

This repository, `Ravine-Vision`, is the clean foundation for the next engineering evolution of RAVINE. It is deliberately independent from the existing `Ravine` and `Ravine-Next` repositories.

## Principles

- Human dignity before revenue.
- Freedom of expression with accountable safeguards.
- Evidence and context matter; popularity is not proof of value.
- Preserve creative ownership, attribution, and provenance.
- Build sustainable economic opportunities for the platform, creators, and participants.
- Keep unresolved product, policy, and commercial choices explicit until approved.

## Development

Requirements: Node.js 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Current foundation

- Next.js App Router + React + TypeScript.
- Responsive bilingual ready experience (Arabic/RTL and English/LTR).
- Supabase authentication and a restrictive RLS database contract.
- Personal accounts, multiple creator identities, creator applications, account
  tier requests, work drafts, media metadata, rights declarations, creator teams,
  and a trusted review console.
- Controlled work publishing: private draft, creator submission, staff review, and
  public discovery for approved public works.
- No media storage provider, payment processor, analytics vendor, or payout
  provider is connected yet.
- Production hosting is configured on Vercel for this repository.

## Project boundaries

This repository is independent. Do not copy credentials, connect legacy infrastructure, run migrations against existing projects, or modify the existing RAVINE repositories as part of this work.

See:
- [Foundation Charter](docs/FOUNDATION_CHARTER.md)
- [Architecture Principles](docs/ARCHITECTURE_PRINCIPLES.md)
- [Open Decisions](docs/OPEN_DECISIONS.md)
- [Work Publishing Workflow](docs/WORK_PUBLISHING.md)
- [Economy and Monetization](docs/ECONOMY_AND_MONETIZATION.md)
