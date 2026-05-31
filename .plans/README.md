# WishTracker — Delivery Plans

This directory tracks product/engineering work from the [product audit](../README.md) (May 2026).

## Documents

| File | Purpose |
|------|---------|
| [00-product-status.md](./00-product-status.md) | Snapshot of maturity, gaps, and scorecard |
| [phase-0-foundation.md](./phase-0-foundation.md) | Repo hygiene, CI, shared types, quick fixes |
| [phase-1-testing.md](./phase-1-testing.md) | Automated test strategy |
| [phase-2-production.md](./phase-2-production.md) | Deploy, email, security hardening |
| [phase-3-features.md](./phase-3-features.md) | Price tracking, invitations, extension sync |
| [phase-4-platform.md](./phase-4-platform.md) | Mobile release, Safari, OAuth |
| [IMPLEMENTATION-LOG.md](./IMPLEMENTATION-LOG.md) | What was implemented and when |

## Execution order

```
Phase 0 (foundation) → Phase 1 (tests) → Phase 2 (prod) → Phase 3 (features) → Phase 4 (platform)
```

Phases **0–4 are largely implemented** in the working tree — see [IMPLEMENTATION-LOG.md](./IMPLEMENTATION-LOG.md). Remaining work: integration tests, mobile UI parity, OAuth, production deploy, store listings.
