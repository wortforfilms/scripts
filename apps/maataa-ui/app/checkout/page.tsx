import { CheckoutClient } from "../../components/checkout/CheckoutClient";
import { listSkus } from "../../lib/catalog-db";

export const metadata = { title: "Checkout | Maataa Scripts", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const skus = await listSkus(true);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p className="mt-3 text-white/70">Paid access unlocks only after Razorpay webhook verification.</p>
      <CheckoutClient skus={skus} />
    </main>
  );
}
