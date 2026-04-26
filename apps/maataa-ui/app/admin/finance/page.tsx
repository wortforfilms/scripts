import { FeatureGate } from "../../../components/access/FeatureGate";
import type React from "react";
import { requireFeature } from "../../../lib/auth";
import { listFinanceSummary } from "../../../lib/catalog-db";
import { listRevenueLedger } from "../../../lib/revenue/create-ledger";

export const metadata = { title: "Finance Ledger | Admin", robots: { index: false, follow: false } };

export default async function AdminFinancePage() {
  await requireFeature("adminFinance");
  const [summary, ledger] = await Promise.all([listFinanceSummary(), listRevenueLedger()]);

  return (
    <FeatureGate featureKey="adminFinance">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Paid marketplace controls</p>
        <h1 className="mt-2 text-3xl font-semibold">Finance Ledger</h1>
        <p className="mt-3 max-w-3xl text-white/70">
          Verified webhooks can unlock access and create split-ledger rows. External transfers remain pending admin approval.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Orders" value={summary.orders.length} />
          <Metric label="Payments" value={summary.payments.length} />
          <Metric label="Webhook events" value={summary.webhooks.length} />
          <Metric label="UPI reconciliations" value={summary.upiReconciliations.length} />
        </div>
        <Section title="Revenue split ledger">
          {ledger.map((row) => (
            <Row key={`${row.orderId}-${row.party}-${row.amountInPaise}`} title={`${row.party} · ${row.transferStatus}`} detail={`${row.amountInPaise} ${row.currency} · ${row.basisPoints} bp · order ${row.orderId}`} />
          ))}
        </Section>
        <Section title="Orders">
          {summary.orders.map((row) => (
            <Row key={row.id} title={`${row.status} · ${row.amountInPaise} ${row.currency}`} detail={`${row.id} · ${row.paymentProvider} · ${row.providerOrderId ?? row.razorpayOrderId ?? "no provider order"}`} />
          ))}
        </Section>
        <Section title="UPI reconciliations">
          {summary.upiReconciliations.map((row) => (
            <Row key={row.id} title={`${row.status} · ${row.reference}`} detail={`${row.orderId} · proof ${row.proofUrl ?? "missing"} · ${row.createdAt}`} />
          ))}
        </Section>
        <Section title="Webhook idempotency">
          {summary.webhooks.map((row) => (
            <Row key={`${row.provider}-${row.eventId}`} title={`${row.provider} · ${row.eventType}`} detail={`${row.eventId} · ${row.processedAt}`} />
          ))}
        </Section>
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

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-8 rounded border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">{children || <p className="text-sm text-white/60">No rows yet.</p>}</div>
    </section>
  );
}

function Row({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-3">
      <strong>{title}</strong>
      <p className="mt-1 text-sm text-white/60">{detail}</p>
    </div>
  );
}
