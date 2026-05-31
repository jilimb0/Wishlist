# Implementation log

## 2026-05-31 — Phase 0 (foundation)

See prior entry. Code lives in working tree (not committed per user request).

## 2026-05-31 — Phases 1–4 (bulk implementation)

### Backend

| Feature | Status |
|---------|--------|
| Mail module (SMTP or dev console) | Done |
| Password reset + friend invite emails | Done |
| Invitation preview `GET /api/friends/invitations/:token` | Done |
| Register with `inviteToken` → auto-friend | Done |
| Price tracking cron (`PriceTrackingModule`, 6h) | Done |
| `PRICE_DROP` notifications | Done |
| Subscription approve → notification | Done |
| Scraper rate limit (10/min) | Done |
| Swagger `/api/docs` | Done |
| Production CORS via `CORS_ORIGINS` | Done |
| Config expansion (`APP_URL`, SMTP, etc.) | Done |
| Tests: auth + scraper SSRF unit | Done |

### Web

| Feature | Status |
|---------|--------|
| `@wishtracker/shared` types | Done |
| Pending subscription approvals (Profile) | Done |
| Register with invitation token from URL | Done |
| Item `trackPrice` + price history display | Done |
| Vitest smoke + Playwright smoke specs | Done |
| `.env.example` | Done |
| Public-route 401 fix on register | Done |

### Mobile

| Feature | Status |
|---------|--------|
| `EXPO_PUBLIC_API_URL` / `app.config.js` | Done |
| `eas.json` | Done |
| Shared types re-export | Done (prior) |
| Pending subscriptions UI | Not done |

### Extension

| Feature | Status |
|---------|--------|
| `VITE_API_URL` build config | Done |
| Shared types + logout fix | Done (prior) |

### DevOps / docs

| Feature | Status |
|---------|--------|
| `docs/DEPLOYMENT.md` | Done |
| `scripts/sync-safari-extension.sh` | Done |
| CI from Phase 0 | Done (in tree) |

### Explicitly deferred (need infra or large scope)

- Testcontainers / full API integration test suite
- Google / Apple OAuth (endpoints + UI)
- S3/R2 avatar storage
- Hosted staging deploy
- Chrome Web Store listing + privacy policy
- Expo push notifications
- Public SEO pages / deep links
- Codecov coverage gates
- Wire Safari Xcode project to built extension (script provided; manual Xcode step)

### Verify

```bash
pnpm install
cd backend && pnpm exec prisma generate
pnpm test
pnpm type-check          # web may conflict with mobile @types/react override
pnpm type-check:mobile   # known React 18/19 type friction
pnpm run check:ci
```
