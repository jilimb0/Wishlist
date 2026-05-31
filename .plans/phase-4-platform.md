# Phase 4 — Platform expansion

**Goal:** Reach users on app stores and secondary browsers.  
**Status:** Partial (tooling/docs; store submissions manual)

## Chrome Web Store

- [ ] Store listing, privacy policy, permissions justification
- [ ] Prod API URL in manifest
- [ ] Review `content_scripts` on `<all_urls>`

## Mobile (Expo EAS)

- [x] `mobile/eas.json` profiles
- [ ] App icons, splash, bundle IDs
- [ ] TestFlight + Play internal testing
- [ ] Push notifications (Expo) for reservation/price events

## Safari

- [x] Keep template + `scripts/sync-safari-extension.sh` to copy `extension/dist`
- [ ] Manual Xcode archive/submit

## Auth expansion

- [ ] Google / Apple Sign-In (optional)
- [ ] Account linking with existing email users

## Growth (post-v1)

- [ ] Public wishlist SEO pages + OG meta
- [ ] Share cards / deep links
- [ ] Analytics (PostHog/Plausible)
