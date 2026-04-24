export const metadata = {
  title: "Product | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default function ProductPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Draft product",
    offers: { "@type": "Offer", availability: "https://schema.org/Discontinued" }
  };
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-semibold">Product pending publication</h1>
      <p className="mt-4 text-white/70">Draft, review, and approved products are noindex and hidden until PUBLISHED and active.</p>
    </main>
  );
}
