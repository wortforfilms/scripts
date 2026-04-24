import { createHmac, randomUUID } from "crypto";
import { tmpdir } from "os";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertDatasetQa, runDatasetQa } from "../../../packages/scripts-data/src/qa";
import { verifiedScriptsSeed } from "../../../packages/scripts-data/src/verified-scripts.seed";
import { assertGlyphQa } from "../lib/glyph-qa";
import { buildReleaseMatrix } from "../lib/release-matrix";
import { createSessionTokenForTests, verifySessionToken } from "../lib/auth/session";

describe("launch validation: auth provider", () => {
  it("accepts signed production session JWTs and rejects tampering", async () => {
    const token = await createSessionTokenForTests(
      { sub: "user_launch", role: "ADMIN", plan: "ENTERPRISE", permissions: ["catalog-admin"] },
      "launch-secret"
    );

    await expect(verifySessionToken(token, "launch-secret")).resolves.toMatchObject({
      id: "user_launch",
      role: "ADMIN",
      plan: "ENTERPRISE",
      permissions: ["catalog-admin"],
      isLoggedIn: true
    });
    await expect(verifySessionToken(`${token.slice(0, -1)}x`, "launch-secret")).resolves.toBeNull();
  });
});

describe("launch validation: dataset and glyph QA", () => {
  it("rejects hallucinated or unverifiable script records", () => {
    const result = runDatasetQa([
      {
        ...verifiedScriptsSeed[0],
        id: "fake-script",
        slug: "fake-script",
        sources: ["AI generated placeholder"]
      }
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("unverifiable/generated");
  });

  it("passes current verified/partial script seed QA", () => {
    expect(assertDatasetQa(verifiedScriptsSeed).ok).toBe(true);
  });

  it("passes glyph/font QA for public scripts and verification-required placeholders", () => {
    expect(assertGlyphQa(join(process.cwd(), "public")).ok).toBe(true);
  });
});

describe("launch validation: Razorpay local test-mode E2E", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.RAZORPAY_E2E_MODE = "local";
    process.env.RAZORPAY_WEBHOOK_SECRET = "webhook-secret";
    process.env.RUNTIME_DATABASE_URL = `file:${join(tmpdir(), `maataa-razorpay-${randomUUID()}.db`)}`;
    delete process.env.RUNTIME_DATABASE_AUTH_TOKEN;
  });

  it("creates order, verifies webhook signature, marks PAID, and unlocks access only after verified webhook", async () => {
    const { runtimeDb } = await import("../lib/runtime-db");
    const { ensureCatalogDb, createPendingOrder, listUserAccess } = await import("../lib/catalog-db");
    const { POST: webhookPost } = await import("../app/api/payments/razorpay/webhook/route");
    await ensureCatalogDb();

    const now = new Date().toISOString();
    await runtimeDb.execute({
      sql: `
        INSERT INTO products (id, slug, title, description, product_type, publish_status, is_paid, price_in_paise, currency, created_at, updated_at)
        VALUES ('prod_launch', 'launch-product', 'Launch Product', 'Staging validation product', 'digital', 'PUBLISHED', 1, 4900, 'INR', ?, ?)
      `,
      args: [now, now]
    });
    await runtimeDb.execute({
      sql: `
        INSERT INTO skus (id, code, product_id, publish_status, is_active, created_at, updated_at)
        VALUES ('sku_launch', 'SKU-LAUNCH', 'prod_launch', 'PUBLISHED', 1, ?, ?)
      `,
      args: [now, now]
    });

    const order = await createPendingOrder({ userId: "user_launch", skuIds: ["sku_launch"], razorpayOrderId: "order_launch" });
    expect(order.razorpayOrderId).toBe("order_launch");
    await expect(listUserAccess("user_launch")).resolves.toEqual([]);

    const invalidResponse = await webhookPost(
      new Request("https://scripts.vaigyaaniq.info/api/payments/razorpay/webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": "bad" },
        body: JSON.stringify({ event: "payment.captured" })
      })
    );
    expect(invalidResponse.status).toBe(400);
    await expect(listUserAccess("user_launch")).resolves.toEqual([]);

    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_launch", order_id: "order_launch" } } }
    });
    const signature = createHmac("sha256", "webhook-secret").update(body).digest("hex");
    const validResponse = await webhookPost(
      new Request("https://scripts.vaigyaaniq.info/api/payments/razorpay/webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": signature },
        body
      })
    );
    expect(validResponse.status).toBe(200);
    await expect(listUserAccess("user_launch")).resolves.toEqual([
      expect.objectContaining({ productId: "prod_launch", orderId: expect.any(String) })
    ]);
  }, 20_000);
});

describe("launch validation: release matrix", () => {
  it("keeps paid marketplace NO-GO unless Razorpay E2E and auth are ready", () => {
    const matrix = buildReleaseMatrix({
      datasetQaPassed: true,
      glyphQaPassed: true,
      razorpayE2ePassed: false,
      authProviderConfigured: true
    });
    expect(matrix.find((gate) => gate.gate === "Paid Marketplace")?.status).toBe("NO-GO");
  });

  it("keeps public preview NO-GO unless dataset and glyph QA pass", () => {
    const matrix = buildReleaseMatrix({
      datasetQaPassed: false,
      glyphQaPassed: true,
      razorpayE2ePassed: true,
      authProviderConfigured: true
    });
    expect(matrix.find((gate) => gate.gate === "Public Preview")?.status).toBe("NO-GO");
  });
});
