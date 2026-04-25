import { notFound } from "next/navigation";
import { VerifiedGlyph } from "../../../components/scripts/VerifiedGlyph";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../../../lib/script-data";

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
      </dl>
    </main>
  );
}
