import { FeatureGate } from "../../components/access/FeatureGate";
import { requireUser } from "../../lib/auth";
import { listUserAccess } from "../../lib/catalog-db";

export default async function AccessPage() {
  const user = await requireUser();
  const access = await listUserAccess(user.id);
  return (
    <FeatureGate featureKey="userAccess">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Entitlements</p>
        <h1 className="mt-2 text-3xl font-semibold">My Access</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Paid items appear here only after verified Razorpay webhook unlock.
        </p>
        <div className="mt-8 grid gap-3">
          {access.map((item) => (
            <div key={`${item.productId}-${item.orderId}`} className="rounded border border-white/10 bg-white/5 p-4">
              <strong>{item.productId}</strong>
              <p className="mt-1 text-sm text-white/60">Order {item.orderId} · granted {item.grantedAt}</p>
            </div>
          ))}
          {access.length === 0 ? <p className="rounded border border-white/10 bg-white/5 p-4 text-white/60">No paid access unlocked yet.</p> : null}
        </div>
      </main>
    </FeatureGate>
  );
}
