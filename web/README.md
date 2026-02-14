# WishTracker Web

React Frontend for WishTracker.

**Stack**: React 18 + TypeScript, Vite, React Router, React Query (TanStack), Tailwind CSS, Shared Types.

## Getting Started

```bash
# 1 — Install dependencies
pnpm install

# 2 — Start dev server (port 3011)
pnpm dev
```

> API requests are proxied to `http://localhost:3010` via Vite — ensure backend is running.

## Commands

| Command        | Description                    |
| -------------- | ------------------------------ |
| `pnpm dev`     | Dev server with HMR at `:3011` |
| `pnpm build`   | Production build to `dist/`    |
| `pnpm preview` | Preview production build       |

## Structure

```
web/src/
├── main.tsx               # Entry point (providers)
├── App.tsx                # Router
├── index.css              # Tailwind + global styles
├── vite-env.d.ts
├── types/index.ts         # Exports from @wishtracker/shared
├── lib/api.ts             # API client (fetch + JWT)
├── hooks/api.ts           # React Query hooks
├── context/AuthContext.tsx # Auth state
├── components/
│   ├── Layout.tsx         # Shell (Navbar + Outlet)
│   ├── Navbar.tsx         # Top navigation
│   ├── ProtectedRoute.tsx # Route guard
│   └── Forms.tsx          # WishlistForm + ItemForm
└── pages/
    ├── Login.tsx
    ├── Register.tsx
    ├── Dashboard.tsx      # My lists + subscriptions
    ├── WishlistDetail.tsx # Items, reserve, edit
    ├── Profile.tsx        # Settings + reservations
    ├── Discover.tsx       # Public wishlists
    └── Following.tsx      # Subscriptions
```

## JWT Storage

Tokens are stored in `localStorage` and sent via `Authorization: Bearer <token>` header.
On 401 error, token is cleared and user is redirected to `/login`, preventing infinite loops.
