# Product status snapshot

**Product:** WishTracker — cross-platform wishlist with reservations, sharing, and discovery.  
**Repo:** `Wishlist` monorepo (pnpm workspaces).  
**Last updated:** 2026-05-31

## Maturity scorecard

| Dimension | ~Score | Notes |
|-----------|--------|-------|
| Product clarity | 85% | Domain model matches UX |
| Backend API | 75% | Core modules done; no price worker or email |
| Web app | 70% | Full flows; needs tests + deploy |
| Mobile | 65% | Feature parity; hardcoded API URL |
| Chrome extension | 45% | Local MVP; logout bug, no prod config |
| Safari (Xcode) | 5% | Template only |
| Shared architecture | 40% → **improving** | Consolidating on `@wishtracker/shared` |
| Automated tests | 0% → **starting** | Phase 0 adds first tests + CI |
| DevOps | 25% → **improving** | CI added in Phase 0 |

**Overall:** ~48–55% toward public beta.

## Implemented domain features

- Auth (JWT), password reset (token in DB; email not sent)
- Wishlists (privacy, type, emoji), items (status, price history on create)
- Reservations (transactional, anonymous)
- Subscriptions / follow, discover, friends, invitations (API)
- Notifications (NEW_ITEM, RESERVATION; PRICE_DROP enum unused)
- URL scraper with SSRF checks
- Web + mobile UI for above; extension add-from-page

## Known gaps

1. No automated price-drop job (`trackPrice` unused)
2. No transactional email
3. Triple type definitions (being fixed in Phase 0)
4. No CI until Phase 0
5. Safari project disconnected from `extension/`
6. Extension ↔ web auth not shared

## Open product questions

1. Launch priority: web vs mobile vs extension?
2. Production hosting target?
3. Keep or drop Safari Xcode scaffold?
4. Is price tracking required for v1?
5. OAuth planned?
