import { ScriptSelectionPanel } from "../../components/scripts/ScriptSelectionPanel";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../../lib/script-data";
import { signUpWithCredentials } from "../signin/actions";

export const metadata = {
  title: "Create account | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const dataset = scriptDatasetStatus();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8 grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Create account</p>
          <h1 className="mt-2 text-3xl font-semibold">Start with a script, then unlock tools</h1>
          <p className="mt-3 text-white/70">
            Accounts use server-side credential auth, signed session cookies, and the same access engine used by middleware and route handlers.
          </p>
        </div>
        <form action={signUpWithCredentials} className="rounded border border-white/10 bg-white/5 p-5">
          <input name="next" type="hidden" value="/dashboard" />
          <label className="grid gap-2 text-sm">
            <span className="text-white/70">Name</span>
            <input name="name" required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="Your name" />
          </label>
          <label className="mt-4 grid gap-2 text-sm">
            <span className="text-white/70">Email</span>
            <input name="email" type="email" required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="you@example.com" />
          </label>
          <label className="mt-4 grid gap-2 text-sm">
            <span className="text-white/70">Password</span>
            <input name="password" type="password" minLength={8} required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="At least 8 characters" />
          </label>
          {params.error ? <p className="mt-4 text-sm text-red-300">{params.error}</p> : null}
          <button type="submit" className="mt-5 rounded bg-amber-300 px-5 py-3 font-semibold text-black">
            Create account
          </button>
        </form>
      </section>
      <ScriptSelectionPanel
        scripts={verifiedScriptsSeed}
        targetCount={dataset.target}
        heading="Select your first script"
        subheading="Choose the script you want to study, verify, or follow. You can create an account first or continue from a selected script."
        ctaLabel="Start"
        ctaBaseHref="/signup/script"
      />
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold">Learner</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Follow scripts, courses, and verified glyph updates.</p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold">Researcher</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Track source status, references, and verification gaps.</p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold">Reviewer</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Prepare for admin approval workflows after real auth is connected.</p>
        </div>
      </section>
    </main>
  );
}
