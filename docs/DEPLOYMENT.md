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

## External Integrations & Monetization Setup

### 1. Telegram Bot (Notifications)
To enable real-time notifications for gift reservations, price drops, and crowdfunding contributions:
1. Open [@BotFather](https://t.me/botfather) in Telegram and send `/newbot`.
2. Follow the prompts to create your bot name and username (e.g. `MyWishTrackerBot`).
3. Copy the HTTP API token into `backend/.env`:
   ```bash
   TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
   TELEGRAM_BOT_USERNAME="MyWishTrackerBot"
   ```
4. Set up the Telegram Webhook pointing to your deployed API:
   ```bash
   curl -F "url=https://<your-api-domain>/api/telegram/webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
   ```

### 2. Affiliate Programs (Marketplace Commissions)
To earn 3–8% commissions on gifts purchased by friends through generated links:
- **Amazon Associates**: Register at [affiliate-program.amazon.com](https://affiliate-program.amazon.com/) and set `AMAZON_AFFILIATE_TAG="yourtag-20"`.
- **Ozon Partner / Profit**: Register in Ozon Affiliate Program or CPA networks (Admitad) and set `OZON_PARTNER_CODE="your_code"`.
- **Wildberries CPA**: Register on affiliate networks (Admitad / Perfluence / WB Affiliate) and set `WB_PARTNER_CODE="your_code"`.

### 3. Payment Gateway & Pro Subscriptions
- By default, the system provides an automated **14-day free Pro trial** for all new users and supports instant promo code redemption (e.g. `WISHTRACKERPRO`, `GIFT2026`).
- For production payments (Stripe / CloudPayments / YooKassa):
  1. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `backend/.env`.
  2. Point Stripe webhook events (`checkout.session.completed`, `customer.subscription.updated`) to `/api/billing/webhook`.

---

## Safari extension sync

After building the Chrome extension:

```bash
./scripts/sync-safari-extension.sh
```

Then open `Wishlist/Wishlist.xcodeproj` in Xcode.
