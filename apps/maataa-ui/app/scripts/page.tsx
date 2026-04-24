import Link from "next/link";
import { VerifiedGlyph } from "../../components/scripts/VerifiedGlyph";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../../lib/script-data";

export const metadata = {
  title: "Scripts | Maataa Scripts",
  description: "Verified and partially verified script records with safe glyph rendering."
};

export default function ScriptsIndexPage() {
  const dataset = scriptDatasetStatus();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Scripts</h1>
          <p className="mt-2 max-w-2xl text-white/70">
            Verified scripts render Unicode samples; partial records use verification-required glyph assets.
          </p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          {dataset.current} / {dataset.target} records
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {verifiedScriptsSeed.map((script) => (
          <Link
            key={script.id}
            href={`/scripts/${script.slug}`}
            className="rounded border border-white/10 bg-white/5 p-5 transition hover:border-emerald-300/50 hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{script.name}</h2>
                <p className="mt-1 text-sm text-white/55">{script.region}</p>
              </div>
              <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/70">{script.verificationStatus}</span>
            </div>
            <div className="mt-5 text-4xl">
              <VerifiedGlyph script={script} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
