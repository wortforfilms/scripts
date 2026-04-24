export const metadata = { title: "Privacy | Maataa Scripts" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <p className="mt-4 text-white/75">We collect account, access, order, and payment verification metadata needed to provide digital access and audit marketplace operations. Sensitive payment data is handled by Razorpay and is not exposed through Spine events.</p>
    </main>
  );
}
