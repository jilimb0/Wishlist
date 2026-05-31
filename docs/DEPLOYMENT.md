# Deployment guide

## Prerequisites

- Node 22+, pnpm 9+
- PostgreSQL 16
- (Optional) SMTP for transactional email

## Environment

Copy `backend/.env.example` → `backend/.env` and set production values:

- `JWT_SECRET` — strong random string
- `CORS_ORIGINS` — your web app origin(s)
- `APP_URL` — public web URL (reset/invite links)
- `SMTP_*` — for email delivery

Web: copy `web/.env.example` → `web/.env` with `VITE_API_URL=https://api.yourdomain.com`.

Extension: build with `VITE_API_URL=https://api.yourdomain.com pnpm --filter wishtracker-extension run build`.

Mobile: set `EXPO_PUBLIC_API_URL` in `.env` (see `mobile/app.config.js`).

## Database

```bash
pnpm db:up
pnpm db:generate
pnpm db:migrate
```

Production: `pnpm --filter wishtracker-backend run prisma:migrate:prod`

## Suggested stack

| Component | Suggestion |
|-----------|------------|
| API | Fly.io, Railway, or Render |
| Postgres | Managed Postgres on same provider |
| Web | GitHub Pages / Vercel / Cloudflare Pages (static `web/dist`) |
| Avatars | S3/R2 (future — currently local `uploads/`) |

## GitHub Pages (web)

The repo includes a workflow that deploys `web/dist` to GitHub Pages on pushes to `main`/`master`.

- Set `VITE_API_URL` in `web/.env` (local) and set a repository variable (or secret) `VITE_API_URL` for the Pages workflow to point at your deployed API.
- Ensure the backend `CORS_ORIGINS` includes your GitHub Pages origin (`https://jilimb0.github.io`) and `APP_URL` matches the public Pages URL (`https://jilimb0.github.io/<repo>`).

## Render (API + Postgres)

The repo includes a `render.yaml` blueprint.

- Create a new Blueprint in Render and point it at this repo.
- Set `APP_URL` to your GitHub Pages URL (including the `/repo` path), e.g. `https://jilimb0.github.io/<repo>`.
- Set `CORS_ORIGINS` to `https://jilimb0.github.io`.
- After Render assigns the API URL, set `VITE_API_URL` (repo variable/secret) to `https://<your-service>.onrender.com` and re-run the Pages deploy.

## Health check

`GET /api/health` — use for load balancer probes.

## API docs

`GET /api/docs` — Swagger UI when API is running.

## Safari extension sync

After building the Chrome extension:

```bash
./scripts/sync-safari-extension.sh
```

Then open `Wishlist/Wishlist.xcodeproj` in Xcode.
