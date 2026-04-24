# GO / NO-GO Matrix

| Release Gate | Status | Reason |
| --- | --- | --- |
| Internal Alpha | GO | Dashboard/runtime app is intact, verified seed subset exists, Kharosthi chain is represented safely, admin draft SKU flow is implemented, and Spine SSE has audit events plus heartbeat. |
| Public Preview | NO-GO | Legal and SEO foundations exist, but the full 426-script dataset is intentionally incomplete until verified source records are added. Paid checkout must stay off. |
| Paid Marketplace | NO-GO | Razorpay webhook verification and access unlock code/tests exist, but real Razorpay test-mode E2E and production auth provider integration still need operator verification. |

## Blocker Conversion

- Font/script glyph accuracy: PARTIAL GO. Verified scripts render Unicode through Noto font mapping; unsupported ancient glyphs use verification-required SVG placeholders.
- Full 426-script dataset: NO-GO. No hallucinated data was added.
- Kharosthi chain: GO for alpha. Uncertain links are PARTIAL.
- Checkout/payment E2E: PARTIAL GO. Webhook verification and order/access logic exist; external Razorpay test run remains.
- SKU generator approval safety: GO. Generated SKUs are DRAFT and inactive.
- Admin approval workflow: GO for alpha.
- Legal pages: GO.
- Production auth/access control: PARTIAL GO. Guards exist; production identity provider wiring remains.
- SEO/content review: PARTIAL GO. Metadata, sitemap, robots, and JSON-LD foundations exist; editorial review remains.
- Maataa Spine runtime: GO for alpha. Audit log, jobs, SSE recent events, and heartbeat exist.
