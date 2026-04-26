import { FeatureGate } from "../../../components/access/FeatureGate";
import { requireFeature } from "../../../lib/auth";
import { evaluateSystemStatus } from "../../../lib/release/status-matrix";

export const metadata = { title: "Release Checklist | Admin", robots: { index: false, follow: false } };

export default async function AdminReleasePage() {
  await requireFeature("adminFinance");
  const matrix = await evaluateSystemStatus();
  const checks = [
    ["Auth working", matrix.checks.authWorks],
    ["Feature gating correct", matrix.checks.navigationWorks],
    ["Dataset QA passed", matrix.checks.datasetQaPassed],
    ["Glyph QA passed", matrix.checks.glyphQaPassed],
    ["Razorpay webhook verified", matrix.checks.razorpayWebhookVerified],
    ["UPI audit enabled", matrix.checks.upiAuditEnabled],
    ["Revenue split working", matrix.checks.revenueSplitCreated]
  ] as const;

  return (
    <FeatureGate featureKey="adminFinance">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Final release gate</p>
        <h1 className="mt-2 text-3xl font-semibold">Release Checklist</h1>
        <div className="mt-8 grid gap-3">
          {checks.map(([label, ok]) => (
            <div key={label} className="rounded border border-white/10 bg-white/5 p-4">
              <span className={ok ? "text-emerald-300" : "text-red-300"}>{ok ? "[x]" : "[ ]"}</span> {label}
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Gate label="Internal Alpha" status={matrix.internalAlpha} />
          <Gate label="Public Preview" status={matrix.publicPreview} />
          <Gate label="Paid Marketplace" status={matrix.paidMarketplace} />
        </div>
        <form className="mt-8">
          <button className="rounded bg-amber-300 px-5 py-3 font-semibold text-black" type="submit">Evaluate System</button>
        </form>
      </main>
    </FeatureGate>
  );
}

function Gate({ label, status }: { label: string; status: "GO" | "NO-GO" }) {
  return (
    <div className="rounded border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">{label}</p>
      <strong className={status === "GO" ? "mt-2 block text-2xl text-emerald-300" : "mt-2 block text-2xl text-red-300"}>{status}</strong>
    </div>
  );
}
