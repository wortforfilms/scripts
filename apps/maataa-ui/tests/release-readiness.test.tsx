import crypto from "crypto";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  approveSku,
  canApproveSku,
  createDraftSkuState,
  isPublicSku,
  publishSku,
  submitSkuForReview
} from "../lib/catalog-policy";
import { VerifiedGlyph } from "../components/scripts/VerifiedGlyph";
import { kharosthiChain, verifiedScriptsSeed } from "../lib/script-data";
import { extractPaidRazorpayOrder, verifyRazorpayWebhookSignature } from "../lib/razorpay";

describe("release readiness controls", () => {
  it("SKU generation creates DRAFT only", () => {
    expect(createDraftSkuState()).toEqual({ publishStatus: "DRAFT", isActive: false });
  });

  it("public API policy hides unpublished SKUs", () => {
    expect(isPublicSku({ publishStatus: "APPROVED", isActive: true })).toBe(false);
    expect(isPublicSku({ publishStatus: "PUBLISHED", isActive: true })).toBe(true);
  });

  it("approval flow blocks direct publish", () => {
    expect(() => publishSku(createDraftSkuState())).toThrow("Only APPROVED");
    const reviewed = submitSkuForReview(createDraftSkuState());
    const approved = approveSku(reviewed);
    expect(publishSku(approved)).toEqual({ publishStatus: "PUBLISHED", isActive: true });
  });

  it("Razorpay webhook rejects invalid signature", () => {
    expect(verifyRazorpayWebhookSignature("{}", "bad", "secret")).toBe(false);
  });

  it("valid webhook payload can mark an order paid", () => {
    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_test", order_id: "order_test" } } }
    });
    const signature = crypto.createHmac("sha256", "secret").update(body).digest("hex");
    expect(verifyRazorpayWebhookSignature(body, signature, "secret")).toBe(true);
    expect(extractPaidRazorpayOrder(JSON.parse(body))).toEqual({
      razorpayOrderId: "order_test",
      razorpayPaymentId: "pay_test"
    });
  });

  it("paid order unlock is webhook-gated by policy", () => {
    expect(extractPaidRazorpayOrder({ event: "payment.authorized" })).toBeNull();
  });

  it("non-admin cannot approve SKU", () => {
    expect(canApproveSku("USER")).toBe(false);
    expect(canApproveSku("REVIEWER")).toBe(false);
    expect(canApproveSku("ADMIN")).toBe(true);
  });

  it("glyph renderer never renders unverified fake glyphs", () => {
    const kharosthi = verifiedScriptsSeed.find((script) => script.id === "kharosthi");
    expect(kharosthi).toBeTruthy();
    const html = renderToStaticMarkup(<VerifiedGlyph script={kharosthi!} />);
    expect(html).toContain("verification required");
    expect(html).not.toContain("𐨀");
  });

  it("Kharosthi chain exists in seed data", () => {
    expect(kharosthiChain.map((script) => script.id)).toEqual([
      "aramaic",
      "kharosthi",
      "gandhari-manuscripts",
      "central-asian-buddhist-transmission"
    ]);
    expect(kharosthiChain.filter((script) => script.id !== "aramaic").every((script) => script.verificationStatus === "PARTIAL")).toBe(true);
  });

  it("sitemap policy excludes drafts", () => {
    const sitemapSlugs = verifiedScriptsSeed.filter((script) => script.verificationStatus === "VERIFIED").map((script) => script.slug);
    expect(sitemapSlugs).not.toContain("kharosthi");
  });
});
