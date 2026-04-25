import { PartnershipForm } from "../../components/partners/PartnershipForm";

export const metadata = { title: "Sponsors | Maataa Scripts" };

export default function SponsorsPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_0.9fr]">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Sponsor path</p>
        <h1 className="mt-2 text-4xl font-semibold">Sponsor scripts, datasets, and preservation work</h1>
        <p className="mt-4 text-white/70">
          Sponsors can fund script verification, public datasets, glyph QA, and learning resources. Attribution and access rules require review.
        </p>
        <div className="mt-6 grid gap-3">
          {["Sponsor a script family", "Fund fallback glyph asset verification", "Support open dataset QA", "Sponsor courses and public media"].map((item) => (
            <div key={item} className="rounded border border-white/10 bg-white/5 p-4">{item}</div>
          ))}
        </div>
      </section>
      <PartnershipForm next="/sponsors" type="SPONSOR" />
    </main>
  );
}
