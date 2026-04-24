import { VerifiedGlyph } from "../../../../components/scripts/VerifiedGlyph";
import { verifiedScriptsSeed } from "../../../../lib/script-data";

export const metadata = { title: "Script Verification | Maataa Scripts" };

export default function ScriptVerificationPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Script Verification</h1>
      <div className="mt-6 grid gap-4">
        {verifiedScriptsSeed.map((script) => (
          <article key={script.id} className="rounded border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{script.name}</h2>
                <p className="text-sm text-white/60">{script.sources.join("; ")}</p>
              </div>
              <VerifiedGlyph script={script} className="text-4xl" />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
