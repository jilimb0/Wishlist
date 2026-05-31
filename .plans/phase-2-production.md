# Phase 2 — Production readiness

**Goal:** Deployable staging environment with secure defaults.  
**Estimate:** 2–4 weeks  
**Status:** Partial (config, mail, swagger, docs; no live deploy)

## Configuration

- [x] `web/.env.example` — `VITE_API_URL`
- [x] Extension `VITE_API_URL` in popup
- [ ] Extension manifest prod `host_permissions` — set at release time
- [x] Mobile `app.config.js` + `EXPO_PUBLIC_API_URL`
- [x] `docs/DEPLOYMENT.md` (emulator/device URLs)

## Infrastructure

- [ ] Staging: API + Postgres (Railway/Fly/Render) + static web (Vercel/Cloudflare)
- [ ] Production secrets via platform env (not docker-compose defaults)
- [ ] Migrate `uploads/` to S3/R2 + CDN URLs for avatars

## Email

- [x] SMTP via `nodemailer` (`MailService`)
- [x] Password reset email (dev logs link only in development)
- [x] Friend invitation email with register link

## Security

- [x] Helmet (Phase 0)
- [x] Restrict CORS to known origins in production (`CORS_ORIGINS`)
- [ ] JWT rotation / refresh tokens (optional for v1)
- [ ] Rate limit scraper endpoint separately

## Observability

- [x] `GET /api/health` (Phase 0)
- [ ] Structured logging (pino)
- [ ] Error tracking (Sentry)

## API docs

- [x] Swagger at `/api/docs`
