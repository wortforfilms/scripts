import { createHmac, randomUUID } from "crypto";
import { tmpdir } from "os";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertDatasetQa, runDatasetQa } from "../../../packages/scripts-data/src/qa";
import { verifiedScriptsSeed } from "../../../packages/scripts-data/src/verified-scripts.seed";
import { assertGlyphQa } from "../lib/glyph-qa";
import { evaluateSystemStatus } from "../lib/release/status-matrix";
import { createSessionTokenForTests, verifySessionToken } from "../lib/auth/session";
import { calculateSplits } from "../lib/revenue/calculate-splits";
import { createUpiPaymentIntent } from "../lib/payments/upi";

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

  it("fails when unicodeSupported records do not provide ranges", () => {
    const result = runDatasetQa([
      {
        ...verifiedScriptsSeed[0],
        id: "missing-ranges",
        slug: "missing-ranges",
        unicodeSupported: true,
        unicodeRanges: []
      }
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("unicodeRanges are required");
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
    const { listRevenueLedger } = await import("../lib/revenue/create-ledger");
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
        headers: { "x-razorpay-signature": signature, "x-razorpay-event-id": "evt_launch" },
        body
      })
    );
    expect(validResponse.status).toBe(200);
    await expect(listUserAccess("user_launch")).resolves.toEqual([
      expect.objectContaining({ productId: "prod_launch", orderId: expect.any(String) })
    ]);
    await expect(listRevenueLedger(order.id)).resolves.toEqual([
      expect.objectContaining({ orderId: order.id, party: "PLATFORM", basisPoints: 10000, transferStatus: "PENDING_ADMIN_APPROVAL" })
    ]);

    const duplicateResponse = await webhookPost(
      new Request("https://scripts.vaigyaaniq.info/api/payments/razorpay/webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": signature, "x-razorpay-event-id": "evt_launch" },
        body
      })
    );
    expect(duplicateResponse.status).toBe(200);
    expect(await duplicateResponse.json()).toMatchObject({ result: { duplicate: true } });
  }, 20_000);
});

describe("launch validation: own UPI manual reconciliation", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.UPI_PAYEE_VPA = "maataa-test@upi";
    process.env.UPI_PAYEE_NAME = "Maataa Scripts Test";
    process.env.RUNTIME_DATABASE_URL = `file:${join(tmpdir(), `maataa-upi-${randomUUID()}.db`)}`;
    delete process.env.RUNTIME_DATABASE_AUTH_TOKEN;
  });

  it("creates a UPI intent but unlocks access only after admin verification", async () => {
    const { runtimeDb } = await import("../lib/runtime-db");
    const { ensureCatalogDb, createPendingOrder, listUserAccess, verifyUpiReconciliation, approveUpiReconciliation } = await import("../lib/catalog-db");
    const { listRevenueLedger } = await import("../lib/revenue/create-ledger");
    await ensureCatalogDb();

    const now = new Date().toISOString();
    await runtimeDb.execute({
      sql: `
        INSERT INTO products (id, slug, title, description, product_type, publish_status, is_paid, price_in_paise, currency, created_at, updated_at)
        VALUES ('prod_upi', 'upi-product', 'UPI Product', 'Manual UPI validation product', 'digital', 'PUBLISHED', 1, 9900, 'INR', ?, ?)
      `,
      args: [now, now]
    });
    await runtimeDb.execute({
      sql: `
        INSERT INTO skus (id, code, product_id, publish_status, is_active, created_at, updated_at)
        VALUES ('sku_upi', 'SKU-UPI', 'prod_upi', 'PUBLISHED', 1, ?, ?)
      `,
      args: [now, now]
    });

    const upi = createUpiPaymentIntent({ amountInPaise: 9900, currency: "INR", orderId: "upi_test_order" });
    expect(upi.upiUri).toContain("upi://pay?");
    expect(upi.upiUri).toContain("pa=maataa-test%40upi");
    const order = await createPendingOrder({
      userId: "user_upi",
      skuIds: ["sku_upi"],
      provider: "upi_manual",
      providerOrderId: upi.providerOrderId,
      paymentReference: upi.reference
    });

    await expect(listUserAccess("user_upi")).resolves.toEqual([]);
    await expect(verifyUpiReconciliation({
      orderId: order.id,
      reference: "UPI-TXN-123",
      proofUrl: "",
      actorId: "admin_upi"
    })).rejects.toThrow("proof URL");
    await expect(listUserAccess("user_upi")).resolves.toEqual([]);

    await expect(approveUpiReconciliation({
      reconciliationId: "missing-reconciliation",
      actorId: "admin_upi"
    })).rejects.toThrow("not found");

    const verification = await verifyUpiReconciliation({
      orderId: order.id,
      reference: "UPI-TXN-123",
      proofUrl: "https://proof.local/upi-txn-123.png",
      actorId: "admin_upi"
    });
    await expect(listUserAccess("user_upi")).resolves.toEqual([]);

    const result = await approveUpiReconciliation({
      reconciliationId: verification.id,
      actorId: "admin_approver"
    });
    expect(result).toMatchObject({ duplicate: false, unlocked: 1, ledgerEntries: 1 });
    await expect(listUserAccess("user_upi")).resolves.toEqual([
      expect.objectContaining({ productId: "prod_upi", orderId: order.id })
    ]);
    await expect(listRevenueLedger(order.id)).resolves.toEqual([
      expect.objectContaining({ orderId: order.id, party: "PLATFORM", transferStatus: "PENDING_ADMIN_APPROVAL" })
    ]);
  });
});

describe("launch validation: revenue splits", () => {
  it("rejects split rules that do not total 10000 basis points", () => {
    expect(() => calculateSplits(1000, [{ party: "PLATFORM", accountId: null, basisPoints: 9000 }])).toThrow("10000");
  });

  it("calculates ledger amounts from basis points", () => {
    expect(
      calculateSplits(1001, [
        { party: "PLATFORM", accountId: null, basisPoints: 5000 },
        { party: "CREATOR", accountId: "acct_creator", basisPoints: 5000 }
      ])
    ).toEqual([
      { party: "PLATFORM", accountId: null, basisPoints: 5000, amountInPaise: 500 },
      { party: "CREATOR", accountId: "acct_creator", basisPoints: 5000, amountInPaise: 501 }
    ]);
  });
});

describe("launch validation: release matrix", () => {
  it("keeps paid marketplace NO-GO unless Razorpay E2E and auth are ready", async () => {
    const matrix = await evaluateSystemStatus({
      testsPass: true,
      authWorks: true,
      navigationWorks: true,
      datasetQaPassed: true,
      glyphQaPassed: true,
      noUnknownCriticalFields: true,
      razorpayWebhookVerified: false,
      paymentAccessFlowTested: false,
      revenueSplitCreated: false,
      upiAuditEnabled: true
    });
    expect(matrix.paidMarketplace).toBe("NO-GO");
  });

  it("keeps public preview NO-GO unless dataset and glyph QA pass", async () => {
    const matrix = await evaluateSystemStatus({
      testsPass: true,
      authWorks: true,
      navigationWorks: true,
      datasetQaPassed: false,
      glyphQaPassed: true,
      noUnknownCriticalFields: true,
      razorpayWebhookVerified: true,
      paymentAccessFlowTested: true,
      revenueSplitCreated: true,
      upiAuditEnabled: true
    });
    expect(matrix.publicPreview).toBe("NO-GO");
  });
});
