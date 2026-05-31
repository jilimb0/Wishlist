# Phase 1 — Testing & quality

**Goal:** Confidence to refactor and ship.  
**Estimate:** 2–3 weeks  
**Status:** Partial (unit/smoke tests added; integration + full e2e deferred)

## Backend

- [ ] Jest + Supertest integration tests with test DB (Testcontainers or dedicated Postgres service in CI) — **deferred**
- [ ] Auth: register, login, invalid password, throttle behavior — **partial** (`auth.service.spec.ts`)
- [ ] Wishlists: CRUD + privacy enforcement
- [ ] Reservations: double-reserve race, cannot reserve own item
- [x] Scraper: SSRF blocked hosts (unit tests, no network) — `scraper.service.spec.ts`

## Web

- [x] Vitest bootstrap — `web/vitest.config.ts`, `api.spec.ts`
- [ ] `ProtectedRoute`, `AuthContext`, login form validation
- [ ] Mock API hooks for Dashboard / WishlistDetail critical paths

## E2E

- [x] Playwright smoke — login/register page loads (`web/e2e/smoke.spec.ts`)
- [ ] Playwright full flow with API — **deferred**

## Extension

- [ ] Unit test for `scrapePage` logic (extract from content script if needed)

## Coverage targets (v1)

| Package | Line coverage target |
|---------|---------------------|
| backend services | 60% on auth, reservations, wishlists |
| web hooks/pages | 40% smoke |
| shared | 80% (small surface) |

## CI updates

- [ ] Upload coverage artifact (optional Codecov)
- [ ] Fail PR if coverage drops below threshold on touched files
