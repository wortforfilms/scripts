import { FeatureGate } from "../../../../components/access/FeatureGate";
import { requireFeature } from "../../../../lib/auth";
import { getRazorpayMonitor } from "../../../../lib/payments/razorpay-monitor";

export const metadata = { title: "Razorpay Monitor | Admin", robots: { index: false, follow: false } };

export default async function RazorpayMonitorPage() {
  await requireFeature("adminFinance");
  const monitor = await getRazorpayMonitor();
  return (
    <FeatureGate featureKey="adminFinance">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Razorpay staging validation</p>
        <h1 className="mt-2 text-3xl font-semibold">Razorpay Monitor</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Webhook logs" value={monitor.webhookLogs.length} />
          <Metric label="Failed webhooks" value={monitor.failedWebhookCount} />
          <Metric label="Duplicate events" value={monitor.duplicateWebhookCount} />
          <Metric label="Captured payments" value={monitor.timeline.payments.length} />
        </div>
        <section className="mt-8 rounded border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">Webhook logs</h2>
          <div className="mt-4 grid gap-3">
            {monitor.webhookLogs.map((log) => (
              <div key={log.id} className="rounded border border-white/10 bg-black/20 p-3">
                <strong>{log.action} · {log.severity}</strong>
                <p className="mt-1 text-sm text-white/60">{log.createdAt} · {JSON.stringify(log.payload)}</p>
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
