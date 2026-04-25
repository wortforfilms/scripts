import { FeatureGate } from "../../../components/access/FeatureGate";
import { requireFeature } from "../../../lib/auth";
import { listPartnershipInquiries } from "../../../lib/partnership-db";

export const metadata = { title: "Partnerships | Admin", robots: { index: false, follow: false } };

export default async function AdminPartnershipsPage() {
  await requireFeature("adminPartnerships");
  const inquiries = await listPartnershipInquiries();

  return (
    <FeatureGate featureKey="adminPartnerships">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Intake</p>
        <h1 className="mt-2 text-3xl font-semibold">Partnerships</h1>
        <p className="mt-3 max-w-3xl text-white/70">
          Investor, sponsor, creator, affiliate, and partner inquiries land here for manual review.
        </p>
        <div className="mt-8 grid gap-4">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{inquiry.type} · {inquiry.name}</h2>
                  <p className="mt-1 text-sm text-white/60">{inquiry.email}{inquiry.organization ? ` · ${inquiry.organization}` : ""}</p>
                </div>
                <span className="h-fit rounded border border-amber-300/30 px-3 py-1 text-xs text-amber-200">{inquiry.status}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/70">{inquiry.intent}</p>
            </article>
          ))}
          {inquiries.length === 0 ? <p className="text-white/60">No inquiries yet.</p> : null}
        </div>
      </main>
    </FeatureGate>
  );
}
