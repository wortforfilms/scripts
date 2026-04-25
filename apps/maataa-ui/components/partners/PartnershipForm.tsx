import { submitPartnershipInquiry } from "../../app/partners/actions";
import type { PartnershipType } from "../../lib/partnership-db";

type PartnershipFormProps = {
  type: PartnershipType;
  next: string;
};

export function PartnershipForm({ next, type }: PartnershipFormProps) {
  return (
    <form action={submitPartnershipInquiry} className="rounded border border-white/10 bg-white/5 p-5">
      <input name="type" type="hidden" value={type} />
      <input name="next" type="hidden" value={next} />
      <label className="grid gap-2 text-sm">
        <span className="text-white/70">Name</span>
        <input name="name" required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="Your name" />
      </label>
      <label className="mt-4 grid gap-2 text-sm">
        <span className="text-white/70">Email</span>
        <input name="email" type="email" required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="you@example.com" />
      </label>
      <label className="mt-4 grid gap-2 text-sm">
        <span className="text-white/70">Organization</span>
        <input name="organization" className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="Optional" />
      </label>
      <label className="mt-4 grid gap-2 text-sm">
        <span className="text-white/70">Intent</span>
        <textarea name="intent" required className="min-h-28 rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="Tell us what you want to fund, sponsor, publish, or build." />
      </label>
      <button className="mt-5 rounded bg-amber-300 px-5 py-3 font-semibold text-black" type="submit">
        Submit for review
      </button>
    </form>
  );
}
