# Wishlist — WishTracker

Full-stack multi-platform wishlist tracking: NestJS API backend, React web SPA, Expo React Native mobile app, Chrome browser extension.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces |
| API | NestJS 11 + Prisma ORM + PostgreSQL |
| Web | React 19 + Vite 7 + TanStack Query |
| Mobile | Expo 50 + React Native 0.73 |
| Extension | Chrome Extension API (Vite) |
| Auth | JWT (Passport) |
| Docs | Swagger |
| Lint/Format | Biome 1.9 (double quotes, asNeeded) |
| Git hooks | Lefthook |

## Packages
- `backend/` — NestJS + Prisma
- `web/` — Vite + React 19
- `mobile/` — Expo
- `extension/` — Chrome extension
- `packages/shared/` — Common types

## Commands
- `pnpm dev` — all workspaces in parallel
- `pnpm build` — recursive build
- `pnpm test` — all tests
- `pnpm type-check` — shared → backend + web + extension
- `pnpm lint` / `pnpm check` — Biome
- `pnpm db:migrate` / `pnpm db:studio` — Prisma
- `pnpm validate` — lint → type-check → test

## Conventions
- `@wishtracker/shared` workspace package consumed by all clients
- Docker Compose for local PostgreSQL
- NestJS with class-validator/class-transformer
- Lefthook instead of Husky for git hooks
