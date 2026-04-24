export const metadata = { title: "Checkout | Maataa Scripts", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <form className="mt-6 rounded border border-white/10 bg-white/5 p-5">
        <label className="flex items-start gap-3 text-sm text-white/80">
          <input required name="acceptedLegal" type="checkbox" className="mt-1" />
          <span>I agree to Terms, Refund Policy, and Digital License.</span>
        </label>
        <button className="mt-5 rounded bg-emerald-400 px-4 py-2 font-medium text-black" type="submit">
          Create Razorpay test order
        </button>
      </form>
    </main>
  );
}
