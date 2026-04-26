import { FeatureGate } from "../../../../components/access/FeatureGate";
import { requireFeature } from "../../../../lib/auth";
import { listFinanceSummary } from "../../../../lib/catalog-db";
import { countAuditLogs, listAuditLogs } from "../../../../lib/logging/audit";
import { runDatasetQa, verifiedScriptsSeed } from "../../../../lib/script-data";
import { runGlyphQa } from "../../../../lib/glyph-qa";

export const metadata = { title: "System Health | Admin", robots: { index: false, follow: false } };

export default async function SystemHealthPage() {
  await requireFeature("adminFinance");
  const [finance, audit, failedWebhookCount] = await Promise.all([
    listFinanceSummary(),
    listAuditLogs(25),
    countAuditLogs("PAYMENT_WEBHOOK_REJECTED")
  ]);
  const dataset = runDatasetQa(verifiedScriptsSeed);
  const glyph = runGlyphQa();
  const pendingUpi = finance.upiReconciliations.filter((row) => row.status === "VERIFIED").length;

  return (
    <FeatureGate featureKey="adminFinance">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Observability</p>
        <h1 className="mt-2 text-3xl font-semibold">System Health</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Failed webhooks" value={failedWebhookCount} />
          <Metric label="Dataset QA failures" value={dataset.errors.length} />
          <Metric label="Glyph QA failures" value={glyph.errors.length} />
          <Metric label="Pending UPI approvals" value={pendingUpi} />
        </div>
        <section className="mt-8 rounded border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">Recent audit activity</h2>
          <div className="mt-4 grid gap-3">
            {audit.map((row) => (
              <div key={row.id} className="rounded border border-white/10 bg-black/20 p-3">
                <strong>{row.action} · {row.severity}</strong>
                <p className="mt-1 text-sm text-white/60">{row.createdAt} · {row.subjectId ?? "system"}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </FeatureGate>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">{label}</p>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </div>
  );
}
