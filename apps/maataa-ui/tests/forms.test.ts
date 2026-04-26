import { describe, expect, it } from "vitest";
import { parseCheckoutRequest, parseGenerateSkuForm, parseSignInForm } from "../lib/forms/schemas";

describe("form schemas", () => {
  it("requires compact JWT session token for sign-in", () => {
    const bad = new FormData();
    bad.set("sessionToken", "not-a-token");
    expect(parseSignInForm(bad)).toEqual({ ok: false, error: "Session token must be a compact JWT" });

    const good = new FormData();
    good.set("sessionToken", "a.b.c");
    good.set("next", "/scripts");
    expect(parseSignInForm(good)).toEqual({ ok: true, value: { sessionToken: "a.b.c", nextPath: "/scripts" } });
  });

  it("validates draft SKU generation input", () => {
    const form = new FormData();
    form.set("title", "Intro Pack");
    form.set("amountInPaise", "9900");
    expect(parseGenerateSkuForm(form)).toEqual({
      ok: true,
      value: { title: "Intro Pack", amountInPaise: 9900, description: undefined }
    });
  });

  it("blocks checkout requests without legal acceptance", () => {
    expect(parseCheckoutRequest({ skuIds: ["sku_1"], acceptedLegal: false })).toEqual({
      ok: false,
      error: "Terms, Refund Policy, and Digital License must be accepted"
    });
    expect(parseCheckoutRequest({ skuIds: ["sku_1"], acceptedLegal: true })).toEqual({
      ok: true,
      value: { skuIds: ["sku_1"], acceptedLegal: true, paymentMethod: "RAZORPAY" }
    });
    expect(parseCheckoutRequest({ skuIds: ["sku_1"], acceptedLegal: true, paymentMethod: "UPI_MANUAL" })).toEqual({
      ok: true,
      value: { skuIds: ["sku_1"], acceptedLegal: true, paymentMethod: "UPI_MANUAL" }
    });
  });
});
