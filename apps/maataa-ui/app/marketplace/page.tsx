import Link from "next/link";
import { FeatureGate } from "../../components/access/FeatureGate";

export default function MarketplacePage() {
  return (
    <FeatureGate featureKey="marketplace">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Marketplace</p>
        <h1 className="mt-2 text-3xl font-semibold">Verified marketplace paths</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Public product discovery, creator intake, checkout, access unlock, and revenue ledger review are connected.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/products" className="rounded border border-white/10 bg-white/5 p-5">Browse product areas</Link>
          <Link href="/creators" className="rounded border border-white/10 bg-white/5 p-5">Publish as creator</Link>
          <Link href="/access" className="rounded border border-white/10 bg-white/5 p-5">View my access</Link>
        </div>
      </main>
    </FeatureGate>
  );
}
