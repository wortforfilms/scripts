import Link from "next/link";
import { PartnershipForm } from "../../components/partners/PartnershipForm";

export const metadata = {
  title: "Partners | Maataa Scripts",
  description: "Investor, sponsor, creator, affiliate, and institutional partner journeys for scripts.vaigyaaniq.info."
};

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const cards = [
    { title: "Investors", href: "/investors", body: "Fund marketplace growth, tool development, and verified data infrastructure." },
    { title: "Sponsors", href: "/sponsors", body: "Sponsor script digitization, glyph review, public datasets, and cultural preservation." },
    { title: "Creators", href: "/creators", body: "Publish reviewed books, fonts, datasets, tools, and research products." }
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Business flows</p>
      <h1 className="mt-2 text-4xl font-semibold">Investors, sponsors, creators, and partners</h1>
      <p className="mt-4 max-w-3xl text-white/70">
        These journeys now connect to admin review and the revenue-ledger model. No split, transfer, or paid launch is automatic.
      </p>
      {params.status === "received" ? (
        <div className="mt-6 rounded border border-emerald-300/30 bg-emerald-300/10 p-4 text-emerald-100">
          Inquiry received for admin review.
        </div>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded border border-white/10 bg-white/5 p-5 hover:border-amber-300/60">
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">{card.body}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded border border-white/10 bg-white/5 p-5">
          <h2 className="text-2xl font-semibold">Revenue roles exposed</h2>
          <div className="mt-4 grid gap-2 text-sm text-white/70">
            {["PLATFORM", "CREATOR", "INVESTOR", "SPONSOR", "AFFILIATE", "TAX"].map((role) => (
              <div key={role} className="rounded border border-white/10 bg-black/20 px-3 py-2">{role}</div>
            ))}
          </div>
        </div>
        <PartnershipForm next="/partners" type="PARTNER" />
      </section>
    </main>
  );
}
