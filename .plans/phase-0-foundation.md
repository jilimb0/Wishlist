# Phase 0 — Foundation

**Goal:** Clean repo, honest tooling, single source of types, CI, and critical bug fixes.  
**Estimate:** 1–2 weeks  
**Status:** Complete (2026-05-31)

## Tasks

### 0.1 Repository hygiene

- [x] Expand root `.gitignore` (dist, uploads, Xcode user data, `.DS_Store`, coverage)
- [x] Stop tracking Xcode `xcuserdata` (removed from git index; stays in `.gitignore`)
- [x] Add `backend/uploads/.gitkeep` pattern via gitignore rule

### 0.2 Documentation

- [x] Update root `README.md` (mobile, pnpm, scripts, `.plans/`)
- [x] Align backend README (Helmet note accurate after implementation)

### 0.3 CI pipeline

- [x] `.github/workflows/ci.yml` — install, build shared, type-check, biome check, test

### 0.4 Testing bootstrap

- [x] Fix root `test` script (`pnpm -r --if-present run test`)
- [x] `@wishtracker/shared` — Vitest smoke test
- [x] `backend` — Jest unit test for `AuthService.register` conflict path
- [ ] Expand coverage in Phase 1

### 0.5 Shared types consolidation

- [x] Web depends on `@wishtracker/shared`; remove `web/src/shared/`
- [x] Mobile re-exports `@wishtracker/shared` from `src/types`
- [x] Extension uses shared types in popup
- [x] Vite aliases for web + extension

### 0.6 Quick fixes

- [x] Extension logout clears `token` (was `auth_token`)
- [x] `GET /api/health` public endpoint
- [x] Helmet middleware in `main.ts`
- [x] `backend/prisma/seed.ts` stub (fixes broken `prisma:seed` script)

## Exit criteria

- `pnpm check && pnpm type-check && pnpm test` pass locally
- CI green on push
- No duplicate `web/src/shared` types file
- Extension logout works

## Not in Phase 0

- Email delivery, price cron, deployment, Safari integration (later phases)
