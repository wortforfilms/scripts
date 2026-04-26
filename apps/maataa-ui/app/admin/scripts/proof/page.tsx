import { FileCheck2, ShieldAlert } from "lucide-react";
import { ScriptProofForm } from "../../../../components/admin/ScriptProofForm";
import { listScriptProofSubmissions } from "../../../../lib/catalog-db";
import { reviewScriptProofAction } from "./actions";

export const metadata = { title: "Script Proofs | Maataa Admin", robots: { index: false, follow: false } };

function StatusBadge({ status }: { status: string }) {
  const tone = status === "APPROVED" ? "bg-emerald-300 text-emerald-950" : status === "REJECTED" ? "bg-rose-300 text-rose-950" : status === "REVIEW" ? "bg-sky-300 text-sky-950" : "bg-white/10 text-white/75";
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

export default async function ScriptProofPage() {
  const submissions = await listScriptProofSubmissions();
  const pending = submissions.filter((submission) => submission.status === "DRAFT" || submission.status === "REVIEW").length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Script Proof Panel</h1>
          <p className="mt-2 max-w-2xl text-white/65">
            Add candidate script records with sources, glyph placeholders, and evidence notes. Nothing here is public until it becomes verified seed data through a separate review.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          {pending} pending proof item{pending === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <ScriptProofForm />

        <section className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-200" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Proof rules</h2>
          </div>
          <ul className="mt-4 grid gap-3 text-sm text-white/68">
            <li className="rounded-lg border border-white/10 bg-black/20 p-3">VERIFIED cannot be selected here. Use this panel for UNVERIFIED or PARTIAL submissions only.</li>
            <li className="rounded-lg border border-white/10 bg-black/20 p-3">Sources and fallback glyph assets are required before a draft can be saved.</li>
            <li className="rounded-lg border border-white/10 bg-black/20 p-3">Unicode ranges are required when Unicode support is claimed.</li>
            <li className="rounded-lg border border-white/10 bg-black/20 p-3">Approval marks internal proof acceptance only. It does not publish to the storefront or visible catalog.</li>
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-emerald-200" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Submission queue</h2>
        </div>
        <div className="grid gap-4">
          {submissions.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-white/60">No script proof submissions yet.</div>
          ) : null}
          {submissions.map((submission) => (
            <article key={submission.id} className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{submission.name}</h3>
                    <StatusBadge status={submission.status} />
                    <span className="rounded bg-black/25 px-2 py-1 text-xs text-white/60">{submission.verificationStatus}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/55">/{submission.slug} · {submission.direction} · {submission.systemType}</p>
                </div>
                <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/55">{submission.createdAt}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/68">{submission.evidenceNote}</p>
              <div className="mt-4 grid gap-3 text-xs text-white/58 md:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">Sources: {submission.sources.length}</div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">Ranges: {submission.unicodeRanges.length || "none"}</div>
                <div className="truncate rounded-lg border border-white/10 bg-black/20 p-3">Fallback: {submission.fallbackGlyphAsset}</div>
              </div>
              <form action={reviewScriptProofAction} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={submission.id} />
                <label className="grid min-w-56 flex-1 gap-1 text-xs uppercase tracking-wide text-white/45">
                  Review note
                  <input name="reviewNote" className="rounded border border-white/15 bg-black/25 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none" placeholder="Optional reviewer note" />
                </label>
                {submission.status === "DRAFT" ? (
                  <button name="action" value="submit-review" className="rounded-lg border border-sky-200/40 px-3 py-2 text-sm text-sky-100 hover:bg-sky-300/10">
                    Submit review
                  </button>
                ) : null}
                {submission.status === "REVIEW" ? (
                  <>
                    <button name="action" value="approve" className="rounded-lg border border-emerald-200/40 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-300/10">
                      Approve proof
                    </button>
                    <button name="action" value="reject" className="rounded-lg border border-rose-200/40 px-3 py-2 text-sm text-rose-100 hover:bg-rose-300/10">
                      Reject
                    </button>
                  </>
                ) : null}
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
