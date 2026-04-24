# Release Checklist

## Internal Alpha

- [x] Dashboard and existing runtime surfaces remain available.
- [x] Script seed subset validates without fake glyphs.
- [x] Kharosthi chain is present with uncertain links marked PARTIAL.
- [x] SKU generation is DRAFT and inactive by default.
- [x] Admin draft/review/approval/publish endpoints are guarded.
- [x] Maataa Spine audit events stream over `/api/spine/events` with heartbeat.

## Public Preview

- [x] Terms, Privacy, Refund, and Digital License pages exist.
- [x] Footer links legal pages globally.
- [x] Verified glyph renderer uses Unicode only for VERIFIED scripts.
- [x] Unverified ancient glyphs render verification-required SVG placeholders.
- [x] Sitemap includes verified public script pages and excludes draft products.
- [ ] Full 426-script dataset is not complete; records must be added only after source verification.
- [ ] Paid checkout should remain disabled for public preview.

## Paid Marketplace

- [x] Checkout requires legal acceptance.
- [x] Public SKU listing requires PUBLISHED and active.
- [x] Razorpay webhook signature verification is implemented.
- [x] Access unlock happens only from webhook-verified payment.
- [x] Tests cover SKU status, webhook signature, access policy, glyph safety, Kharosthi chain, and sitemap draft exclusion.
- [ ] Razorpay dashboard test-mode end-to-end run must be completed with real test keys before paid launch.
- [ ] Production auth provider must be connected to the header/server guards before public paid traffic.

## Environment Separation

- [ ] Configure staging `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Configure production equivalents separately.
- [ ] Set `MAATAA_INTERNAL_AUTH_SECRET` in staging and production.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://scripts.vaigyaaniq.info` in production.
