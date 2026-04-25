import { PartnershipForm } from "../../components/partners/PartnershipForm";

export const metadata = { title: "Creators | Maataa Scripts" };

export default function CreatorsPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_0.9fr]">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Creator path</p>
        <h1 className="mt-2 text-4xl font-semibold">Publish verified books, fonts, datasets, and tools</h1>
        <p className="mt-4 text-white/70">
          Creator intake connects to draft catalog, SKU approval, license enforcement, checkout, access unlock, and split-ledger review.
        </p>
        <div className="mt-6 grid gap-3">
          {["Books and courses", "Fonts and glyph packs", "Datasets and research packs", "SaaS tools and APIs"].map((item) => (
            <div key={item} className="rounded border border-white/10 bg-white/5 p-4">{item}</div>
          ))}
        </div>
      </section>
      <PartnershipForm next="/creators" type="CREATOR" />
    </main>
  );
}
