import { ScriptSelectionPanel } from "../../components/scripts/ScriptSelectionPanel";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../../lib/script-data";

export const metadata = {
  title: "Create account | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default function SignupPage() {
  const dataset = scriptDatasetStatus();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <ScriptSelectionPanel
        scripts={verifiedScriptsSeed}
        targetCount={dataset.target}
        heading="Select your first script"
        subheading="Signup starts by choosing the script you want to study, verify, or follow. Account creation is staged behind production auth, so this screen records intent without minting fake users."
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
