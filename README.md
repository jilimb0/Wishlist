# WishTracker Monorepo

WishTracker is a comprehensive wishlist management ecosystem allowing users to create wishlists, reserve items, track prices, and share with friends.

**Stack**:

- **Backend**: NestJS, PostgreSQL, Prisma ORM, Docker
- **Web**: React (Vite), Tailwind CSS, React Query
- **Extension**: Chrome Extension (Manifest V3), React
- **Shared**: TypeScript types and utilities shared across packages

## Project Structure

```
.
├── packages/
│   └── shared/       # Shared TypeScript types and utilities
├── backend/          # NestJS API Server
├── web/              # React Frontend Application
└── extension/        # Chrome Browser Extension
```

## Quick Start (Monorepo)

This project uses [pnpm](https://pnpm.io/) workspaces.

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development

You can start services individually:

```bash
# Start Backend (requires Docker for DB)
cd backend && npm run start:dev

# Start Web Frontend
cd web && pnpm dev

# Build Extension (for loading into Chrome)
cd extension && npm run build
```

## Contributing

Please refer to individual package READMEs for detailed instructions:

- [Backend Documentation](./backend/README.md)
- [Web Documentation](./web/README.md)
- [Extension Documentation](./extension/README.md)
- [Shared Module](./packages/shared/README.md)
