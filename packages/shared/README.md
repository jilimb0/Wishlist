# @wishtracker/shared

This package contains shared TypeScript definitions, enums, and utility functions used across the WishTracker monorepo (Backend, Web, and Extension).

## Contents

- **Entities**: `User`, `Wishlist`, `Item`, `Reservation`, `Subscription`, `Notification`
- **Enums**: `Privacy`, `ReservationStatus`, `NotificationType`
- **API Responses**: `AuthResponse` (and others)

## Usage

### In Backend

```typescript
import { Privacy } from "@wishtracker/shared"
// ...
```

### In Web / Extension

```typescript
import { User } from "@wishtracker/shared"
// ...
```

## Development

Run build in watch mode for changes to propagate:

```bash
npm run dev
```
