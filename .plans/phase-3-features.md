# Phase 3 — Core product gaps

**Goal:** Deliver marketed capabilities that are schema-only today.  
**Estimate:** 3–5 weeks  
**Status:** Mostly done (UI polish remains on mobile)

## Price tracking

- [x] `@nestjs/schedule` cron (`PriceTrackingService`)
- [x] Query `trackPrice = true` items
- [x] Re-scrape, `PriceHistory`, `PRICE_DROP` notifications
- [x] Web price history list on item card (owner)
- [ ] Mobile price history UI

## Invitations

- [x] `GET /api/friends/invitations/:token`
- [x] Web register with `?token=` + invite preview
- [x] `redeemInvitation` on register; `isUsed` + `expiresAt`

## Subscriptions

- [x] Web `PendingSubscriptions` on Profile
- [x] Notification on subscription approved
- [ ] Mobile pending subscription UI

## Extension

- [ ] Optional: read token from web app via externally_connectable or documented “paste token” UX
- [ ] Production build pipeline in CI artifact

## Privacy audit

- [ ] Verify wishlist owner cannot see reserver identity when `isAnonymous`
- [ ] FRIENDS privacy enforced on all read paths
