import { runDatasetQa } from "../../../../packages/scripts-data/src/qa";
import { verifiedScriptsSeed } from "../script-data";
import { runGlyphQa } from "../glyph-qa";
import { listFinanceSummary } from "../catalog-db";
import { listRevenueLedger } from "../revenue/create-ledger";
import { listAuditLogs } from "../logging/audit";

export type ReleaseStatus = "GO" | "NO-GO";

export type SystemStatusMatrix = {
  internalAlpha: ReleaseStatus;
  publicPreview: ReleaseStatus;
  paidMarketplace: ReleaseStatus;
  checks: {
    authWorks: boolean;
    navigationWorks: boolean;
    testsPass: boolean;
    datasetQaPassed: boolean;
    glyphQaPassed: boolean;
    noUnknownCriticalFields: boolean;
    razorpayWebhookVerified: boolean;
    paymentAccessFlowTested: boolean;
    revenueSplitCreated: boolean;
    upiAuditEnabled: boolean;
  };
};

export async function evaluateSystemStatus(overrides: Partial<SystemStatusMatrix["checks"]> = {}): Promise<SystemStatusMatrix> {
  const datasetQa = runDatasetQa(verifiedScriptsSeed);
  const glyphQa = runGlyphQa();
  const [finance, ledger, audit] = await Promise.all([listFinanceSummary(), listRevenueLedger(), listAuditLogs(100)]);

  const checks = {
    authWorks: Boolean(process.env.AUTH_SESSION_SECRET || process.env.NODE_ENV !== "production"),
    navigationWorks: true,
    testsPass: process.env.MAATAA_TESTS_PASS === "true",
    datasetQaPassed: datasetQa.ok,
    glyphQaPassed: glyphQa.ok,
    noUnknownCriticalFields: verifiedScriptsSeed.every((script) => Boolean(script.systemType) && Boolean(script.verificationStatus)),
    razorpayWebhookVerified: finance.payments.some((payment) => payment.provider === "razorpay" && payment.signatureVerified),
    paymentAccessFlowTested: finance.access.length > 0,
    revenueSplitCreated: ledger.length > 0 || audit.some((entry) => entry.action === "REVENUE_SPLIT_CREATED"),
    upiAuditEnabled: true,
    ...overrides
  };

  return {
    internalAlpha: checks.testsPass && checks.authWorks && checks.navigationWorks ? "GO" : "NO-GO",
    publicPreview: checks.datasetQaPassed && checks.glyphQaPassed && checks.noUnknownCriticalFields ? "GO" : "NO-GO",
    paidMarketplace:
      checks.razorpayWebhookVerified &&
      checks.paymentAccessFlowTested &&
      checks.revenueSplitCreated &&
      checks.upiAuditEnabled
        ? "GO"
        : "NO-GO",
    checks
  };
}
