import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("release status matrix", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.RUNTIME_DATABASE_URL = `file:${join(tmpdir(), `maataa-status-${randomUUID()}.db`)}`;
    process.env.MAATAA_TESTS_PASS = "true";
    process.env.AUTH_SESSION_SECRET = "status-secret";
    delete process.env.RUNTIME_DATABASE_AUTH_TOKEN;
  });

  it("keeps paid marketplace NO-GO until payment/access/revenue are proven", async () => {
    const { evaluateSystemStatus } = await import("../lib/release/status-matrix");
    const matrix = await evaluateSystemStatus({
      datasetQaPassed: true,
      glyphQaPassed: true,
      noUnknownCriticalFields: true,
      razorpayWebhookVerified: false,
      paymentAccessFlowTested: false,
      revenueSplitCreated: false,
      upiAuditEnabled: true
    });
    expect(matrix.internalAlpha).toBe("GO");
    expect(matrix.publicPreview).toBe("GO");
    expect(matrix.paidMarketplace).toBe("NO-GO");
  });

  it("returns GO only when all paid marketplace proof points pass", async () => {
    const { evaluateSystemStatus } = await import("../lib/release/status-matrix");
    const matrix = await evaluateSystemStatus({
      testsPass: true,
      authWorks: true,
      navigationWorks: true,
      datasetQaPassed: true,
      glyphQaPassed: true,
      noUnknownCriticalFields: true,
      razorpayWebhookVerified: true,
      paymentAccessFlowTested: true,
      revenueSplitCreated: true,
      upiAuditEnabled: true
    });
    expect(matrix).toMatchObject({
      internalAlpha: "GO",
      publicPreview: "GO",
      paidMarketplace: "GO"
    });
  });
});
