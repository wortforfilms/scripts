# Release Checklist

## Internal Alpha

- [x] Dashboard and existing runtime surfaces remain available.
- [x] Script seed subset validates without fake glyphs.
- [x] Kharosthi chain is present with uncertain links marked PARTIAL.
- [x] SKU generation is DRAFT and inactive by default.
- [x] Admin draft/review/approval/publish endpoints are guarded.
- [x] Maataa Spine audit events stream over `/api/spine/events` with heartbeat.
- [x] Signed session auth is enforced in middleware and server guards.
- [x] Release checklist CI runs launch-validation tests.

## Public Preview

- [x] Terms, Privacy, Refund, and Digital License pages exist.
- [x] Footer links legal pages globally.
- [x] Verified glyph renderer uses Unicode only for VERIFIED scripts.
- [x] Unverified ancient glyphs render verification-required SVG placeholders.
- [x] Sitemap includes verified public script pages and excludes draft products.
- [x] Dataset QA rejects generated/placeholder sources and missing verification fields.
- [x] Glyph/font QA checks Noto mappings and verification-required fallbacks.
- [ ] Full 426-script dataset is not complete; records must be added only after source verification.
- [ ] Paid checkout should remain disabled for public preview.

## Paid Marketplace

- [x] Checkout requires legal acceptance.
- [x] Public SKU listing requires PUBLISHED and active.
- [x] Razorpay webhook signature verification is implemented.
- [x] Access unlock happens only from webhook-verified payment.
- [x] Tests cover SKU status, webhook signature, access policy, glyph safety, Kharosthi chain, and sitemap draft exclusion.
- [x] Local staging-safe Razorpay E2E validates create order, invalid signature rejection, valid webhook PAID transition, and UserAccess unlock.
- [ ] Razorpay dashboard test-mode end-to-end run must be completed with real test keys before paid launch.
- [ ] External auth provider must mint signed `maataa_session` JWTs before public paid traffic.

## Environment Separation

- [ ] Configure staging `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Configure production equivalents separately.
- [ ] Set `AUTH_SESSION_SECRET` in staging and production.
- [ ] Set `AUTH_SESSION_ISSUER` and `AUTH_SESSION_AUDIENCE` when the external auth provider is connected.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://scripts.vaigyaaniq.info` in production.
