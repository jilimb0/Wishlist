# WishTracker Monorepo

WishTracker is a cross-platform wishlist ecosystem: create wishlists, reserve items, track prices, share with friends, and add items from the browser.

**Stack**

| Package | Tech |
|---------|------|
| [backend](./backend/) | NestJS, PostgreSQL, Prisma |
| [web](./web/) | React 19, Vite, Tailwind 4, React Query |
| [mobile](./mobile/) | Expo 50, React Native |
| [extension](./extension/) | Chrome Extension MV3, React |
| [packages/shared](./packages/shared/) | Shared TypeScript types |

**Roadmap & status:** see [.plans/](./.plans/).

## Quick start

Requires [pnpm](https://pnpm.io/) 9+ and Node 22+.

```bash
# Install all workspace packages
pnpm install

# Start PostgreSQL (and optional API container)
pnpm db:up

# Backend (from repo root)
cp backend/.env.example backend/.env
pnpm db:generate
pnpm db:migrate
pnpm --filter wishtracker-backend run dev

# Web (port 3011, proxies /api → 3010)
pnpm --filter wishtracker-web run dev

# Mobile
pnpm --filter wishtracker-mobile run start

# Extension — build then load unpacked from extension/dist
pnpm --filter wishtracker-extension run build
```

## Monorepo scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run `dev` in all packages (parallel) |
| `pnpm build` | Build all packages |
| `pnpm test` | Build shared + run tests where defined |
| `pnpm type-check` | TypeScript check shared + backend + web + extension |
| `pnpm type-check:mobile` | TypeScript check mobile app |
| `pnpm check` | Biome lint/format check |
| `pnpm db:up` / `pnpm db:down` | Docker Compose for Postgres |
| `pnpm db:migrate` | Prisma migrate (backend) |

## Project layout

```
.
├── .plans/              # Product & engineering roadmap
├── .github/workflows/   # CI
├── backend/
├── web/
├── mobile/
├── extension/
├── packages/shared/
└── Wishlist/            # Safari Web Extension Xcode template (not wired to extension/ yet)
```

## Documentation

- [Backend](./backend/README.md)
- [Web](./web/README.md)
- [Extension](./extension/README.md)
- [Shared types](./packages/shared/README.md)

## Contributing

1. Run `pnpm check && pnpm type-check && pnpm test` before opening a PR.
2. Prefer `@wishtracker/shared` for types shared across clients.
3. Follow phases in `.plans/` for larger features.
