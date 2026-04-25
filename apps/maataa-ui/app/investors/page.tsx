import { AccessibilityCommitment } from "../../components/accessibility/AccessibilityCommitment";
import { PartnershipForm } from "../../components/partners/PartnershipForm";

export const metadata = { title: "Investors | Maataa Scripts" };

export default function InvestorsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Investor path</p>
          <h1 className="mt-2 text-4xl font-semibold">Invest in verified script infrastructure</h1>
          <p className="mt-4 text-white/70">
            Investor intake connects to admin review and revenue split rules. External transfers stay locked until admin approval.
          </p>
          <div className="mt-6 grid gap-3">
            {["Dataset QA and Unicode coverage", "Tool registry and paid marketplace", "Creator revenue ledger", "Sponsor-backed digitization", "Divyaang-friendly access for differently enabled learners"].map((item) => (
              <div key={item} className="rounded border border-white/10 bg-white/5 p-4">{item}</div>
            ))}
          </div>
        </section>
        <PartnershipForm next="/investors" type="INVESTOR" />
      </div>
      <AccessibilityCommitment />
    </main>
  );
}
