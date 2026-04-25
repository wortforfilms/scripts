import { notFound } from "next/navigation";
import { VerifiedGlyph } from "../../../components/scripts/VerifiedGlyph";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../../../lib/script-data";

function formatUnicodeRange(range: { start: string; end: string }) {
  return range.start === range.end ? range.start : `${range.start}-${range.end}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const script = verifiedScriptsSeed.find((item) => item.slug === slug);
  if (!script) return { title: "Script not found", robots: { index: false, follow: false } };
  return {
    title: `${script.name} Script | Maataa Scripts`,
    description: `${script.name} script verification status, sources, direction, region, and glyph display policy.`
  };
}

export default async function ScriptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const script = verifiedScriptsSeed.find((item) => item.slug === slug);
  if (!script) notFound();
  const dataset = scriptDatasetStatus();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: script.name,
    about: script.family,
    inLanguage: "und"
  };
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">{script.name}</h1>
        <span className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          {dataset.current} / {dataset.target} records
        </span>
      </div>
      <div className="mt-6 text-6xl"><VerifiedGlyph script={script} /></div>
      <dl className="mt-8 grid gap-4 md:grid-cols-2">
        <div><dt className="text-white/50">Status</dt><dd>{script.verificationStatus}</dd></div>
        <div><dt className="text-white/50">Direction</dt><dd>{script.direction}</dd></div>
        <div><dt className="text-white/50">Region</dt><dd>{script.region}</dd></div>
        <div><dt className="text-white/50">Family</dt><dd>{script.family}</dd></div>
        <div><dt className="text-white/50">System type</dt><dd>{script.systemType}</dd></div>
        <div><dt className="text-white/50">Unicode coverage</dt><dd>{script.unicodeSupported ? `${script.unicodeRanges.length} ranges` : "Not directly mapped"}</dd></div>
      </dl>
      <section className="mt-8 rounded border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-semibold">Unicode ranges</h2>
        {script.unicodeRanges.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {script.unicodeRanges.slice(0, 80).map((range) => (
              <span key={`${range.start}-${range.end}`} className="rounded border border-white/10 bg-black/20 px-3 py-1 text-sm text-white/70">
                {formatUnicodeRange(range)}
              </span>
            ))}
            {script.unicodeRanges.length > 80 ? (
              <span className="rounded border border-white/10 bg-black/20 px-3 py-1 text-sm text-white/70">
                +{script.unicodeRanges.length - 80} more
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/65">
            No direct Unicode `Scripts.txt` range is mapped for this record. Composite, special, manuscript-chain, and transmission records stay cautious.
          </p>
        )}
      </section>
    </main>
  );
}
