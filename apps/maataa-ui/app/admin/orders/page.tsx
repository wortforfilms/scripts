import { FeatureGate } from "../../../components/access/FeatureGate";

export const metadata = { title: "Orders | Maataa Scripts" };

export default function AdminOrdersPage() {
  return (
    <FeatureGate featureKey="adminOrders">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="mt-4 text-white/70">Paid orders unlock access only after Razorpay webhook signature verification.</p>
      </main>
    </FeatureGate>
  );
}
