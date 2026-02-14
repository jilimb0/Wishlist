# WishTracker Backend

REST API for the cross-platform wishlist management ecosystem.

**Stack**: NestJS + TypeScript, PostgreSQL + Prisma ORM, JWT Authentication.

## Quick Start

### 1. Run via Docker (Recommended)

```bash
# Start PostgreSQL and Backend
docker-compose up -d

# API available at http://localhost:3010
```

### 2. Local Development

```bash
# 1 — Install dependencies
pnpm install

# 2 — Start PostgreSQL (via Docker or local)
docker-compose up -d postgres

# 3 — Create .env file (copy from example)
cp .env.example .env

# 4 — Generate Prisma Client
npx prisma generate

# 5 — Apply migrations
npx prisma migrate dev

# 6 — Start server in dev mode
npm run start:dev
```

## Commands

| Command                     | Description                       |
| --------------------------- | --------------------------------- |
| `npm run start:dev`         | Start in dev mode with hot reload |
| `npm run build`             | Build for production              |
| `npm run start:prod`        | Start production build            |
| `npx prisma migrate dev`    | Create and apply migration        |
| `npx prisma migrate deploy` | Apply migrations (CI/CD)          |
| `npx prisma studio`         | GUI for Database management       |
| `npx prisma generate`       | Regenerate Prisma Client          |

## Migrations

```bash
# Create new migration after schema changes
npx prisma migrate dev --name change_description

# Apply all pending migrations (production)
npx prisma migrate deploy

# Reset DB (WARNING — deletes data!)
npx prisma migrate reset
```

## API Endpoints

### Auth

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login (Rate limited: 10 req/min)
- `POST /api/auth/logout` — Logout

### Users

- `GET /api/users/me` — Current profile
- `PATCH /api/users/me` — Update profile
- `GET /api/users/:id` — Public profile

### Wishlists

- `GET /api/wishlists` — My wishlists
- `POST /api/wishlists` — Create wishlist
- `GET /api/wishlists/:id` — Wishlist details (Public accessible)
- `PATCH /api/wishlists/:id` — Update wishlist
- `DELETE /api/wishlists/:id` — Delete wishlist

### Items

- `POST /api/wishlists/:id/items` — Add item
- `PATCH /api/items/:id` — Update item
- `DELETE /api/items/:id` — Delete item
- `GET /api/items/:id/price-history` — Price history

### Reservations

- `POST /api/items/:id/reserve` — Reserve item
- `DELETE /api/reservations/:id` — Cancel reservation
- `GET /api/reservations/my` — My reservations

### Subscriptions

- `POST /api/wishlists/:id/subscribe` — Subscribe to wishlist
- `DELETE /api/subscriptions/:id` — Unsubscribe
- `GET /api/subscriptions` — My subscriptions

### Notifications

- `GET /api/notifications` — List notifications (Max limit: 100)
- `PATCH /api/notifications/:id/read` — Mark as read
- `PATCH /api/notifications/read-all` — Mark all as read

### Discovery

- `GET /api/discover` — Discover public wishlists
- `GET /api/discover/user/:userId` — Discover user's wishlists

### Scraping

- `POST /api/scrape` — Parse product URL (Protected against SSRF)

## Security Features

- **Rate Limiting**: Applied to Auth endpoints.
- **SSRF Protection**: Scraper blocks internal IP ranges.
- **Response Sanitization**: Uses DTOs to exclude sensitive data (password hashes).
- **Helmet & CORS**: Configured for security and extension support.

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma         # Data models
├── src/
│   ├── common/
│   │   ├── decorators/        # @CurrentUser
│   │   ├── filters/           # Exception filter
│   │   ├── guards/            # JWT guard, Throttler
│   │   └── interceptors/      # TransformInterceptor
│   ├── config/                # Configuration
│   ├── modules/
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── wishlists/         # Wishlist management
│   │   ├── items/             # Items & scraping
│   │   ├── reservations/      # Reservations logic
│   │   ├── subscriptions/     # Subscriptions
│   │   ├── notifications/     # Notifications
│   │   └── scraper/           # URL Parsing service
│   ├── prisma/                # Prisma service
│   ├── app.module.ts          # Root module
│   └── main.ts                # Entry point
├── docker-compose.yml
├── Dockerfile
└── package.json
```
