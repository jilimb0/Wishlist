# WishTracker — Production Runbook

## Architecture

- **API:** NestJS 11 + Prisma ORM + PostgreSQL 16
- **Web:** React 19 + Vite 7 + TanStack Query
- **Mobile:** Expo 50 + React Native 0.73
- **Extension:** Chrome MV3 (Vite build)
- **Monorepo:** pnpm workspaces
- **Containerization:** Docker Compose

## Environment Variables

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing key |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `PORT` | No | API port (default: 3010) |
| `APP_URL` | Yes | Web app URL for reset/invite links |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `MAIL_FROM` | No | Email from address |
| `SMTP_HOST` | No | SMTP server (logs to console if unset) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `PRICE_TRACKING_ENABLED` | No | Enable price cron (default: true) |
| `PRICE_TRACKING_CRON` | No | Cron schedule (default: 0 */6 * * *) |
| `SENTRY_DSN` | No | Sentry error tracking DSN |
| `LOG_LEVEL` | No | Logger level (debug/info/warn/error) |

### Web
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |

### Mobile
| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Backend API URL |

## Deployment

### Docker Compose
```bash
git clone <repo>
cd Wishlist
docker compose up -d
# Runs migrations automatically on start
```

### Render
```bash
# render.yaml configures:
# - Docker-based backend deployment
# - Managed PostgreSQL database
# - Health check at /api/health
# Migrations run at container start (not during build)
```

## Backup

### Database
```bash
pg_dump -U wishtracker -h localhost wishtracker > backup_$(date +%Y%m%d).sql
gzip backup_$(date +%Y%m%d).sql
```

### Restore
```bash
gunzip -c backup_20260101.sql.gz | psql -U wishtracker -h localhost wishtracker
```

## Monitoring

- Health endpoint: `GET /api/health` — returns DB status
- Sentry error tracking (when `SENTRY_DSN` is configured)
- All logs via pino (JSON format in production)

## Troubleshooting

### API won't start
1. Check `DATABASE_URL` is correct and PostgreSQL is reachable
2. Run `pnpm db:generate` to regenerate Prisma client
3. Check Docker logs: `docker compose logs backend`

### Database connection refused
1. Verify PostgreSQL is running: `docker compose ps postgres`
2. Check PostgreSQL logs: `docker compose logs postgres`
3. Verify credentials match `POSTGRES_USER`/`POSTGRES_PASSWORD`

### Health endpoint
```
GET /api/health
Response: { "status": "ok", "timestamp": "...", "checks": { "database": "ok" } }
```
