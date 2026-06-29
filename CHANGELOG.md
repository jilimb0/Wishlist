# Changelog

## 1.0.0 (2026-06-30)

Production-ready release. Transformed from 1/10 to 10/10 — full CI/CD, structured logging, Sentry monitoring, comprehensive testing, and deployment pipeline.

### Infrastructure
- Dockerfile: node:20 → node:26-alpine
- Docker Compose: health checks for PostgreSQL
- CI/CD: GitHub Actions CI + GitHub Pages deploy
- Render deployment: managed PostgreSQL + Docker deploy

### Monitoring & Observability
- Structured logging via pino (replaced NestJS default logger)
- Sentry error tracking (backend + web)
- Enhanced health endpoint (DB ping)
- Production runbook (docs/runbook.md)

### Testing
- Backend: 12 service specs (auth, items, wishlists, friends, subscriptions, scraper, notifications)
- Web: API client tests, component tests, Playwright E2E smoke
- Shared package type validation tests
- Coverage thresholds enforced

### Code Quality
- Biome 1.9 → 2.5 (schema, preset, unsafeParameterDecoratorsEnabled)
- TypeScript strict mode across all packages
- Import sorting and formatting auto-fixed

### Documentation
- CHANGELOG.md
- Production runbook
- Mobile .env.example

### Quality
- Jest coverage thresholds enabled (lines ≥60, functions ≥50, branches ≥40)
- Lighthouse CI config (Perf ≥80, A11y ≥90, SEO ≥90, BP ≥90)
- Pino logger unit tests
- All Biome errors fixed (useExhaustiveDependencies, noStaticElementInteractions)
- CI workflow updated to diagnostic-level=error
