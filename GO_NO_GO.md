# GO / NO-GO Matrix

| Release Gate | Status | Reason |
| --- | --- | --- |
| Internal Alpha | GO | Signed session auth, dashboard/runtime app, verified seed subset, Kharosthi chain, admin draft SKU flow, Spine SSE, dataset QA, and glyph QA are implemented. |
| Public Preview | NO-GO | Dataset/glyph QA exists and passes for the seed subset, but the full 426-script dataset is intentionally incomplete until verified source records are added. Paid checkout must stay off. |
| Paid Marketplace | NO-GO | Staging-safe local Razorpay E2E passes in CI, but Razorpay dashboard test-mode delivery with real test keys must pass before paid launch. |

## Blocker Conversion

- Font/script glyph accuracy: PARTIAL GO. Verified scripts render Unicode through Noto font mapping; unsupported ancient glyphs use verification-required SVG placeholders.
- Full 426-script dataset: NO-GO. No hallucinated data was added.
- Kharosthi chain: GO for alpha. Uncertain links are PARTIAL.
- Checkout/payment E2E: PARTIAL GO. Local staging-safe E2E covers create order, webhook signature verification, PAID order, and access unlock. Razorpay dashboard test-mode run remains.
- SKU generator approval safety: GO. Generated SKUs are DRAFT and inactive.
- Admin approval workflow: GO for alpha.
- Legal pages: GO.
- Production auth/access control: GO for v0.1. Signed `maataa_session` JWT verification is shared by middleware and server guards. External identity provider handoff must mint the signed session.
- SEO/content review: PARTIAL GO. Metadata, sitemap, robots, and JSON-LD foundations exist; editorial review remains.
- Maataa Spine runtime: GO for alpha. Audit log, jobs, SSE recent events, and heartbeat exist.
