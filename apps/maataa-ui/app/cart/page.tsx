import Link from "next/link";

export const metadata = {
  title: "Cart | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Cart</h1>
      <div className="mt-6 rounded border border-white/10 bg-white/5 p-6">
        <p className="text-white/70">No paid items are active in this preview. Checkout remains locked to approved, published, licensed products only.</p>
        <Link href="/products" className="mt-5 inline-flex rounded bg-amber-300 px-5 py-3 font-semibold text-black">
          Browse products
        </Link>
      </div>
    </main>
  );
}
