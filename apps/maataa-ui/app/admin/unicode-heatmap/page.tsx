import { FeatureGate } from "../../../components/access/FeatureGate";
import { requireFeature } from "../../../lib/auth";
import { runDatasetQa, verifiedScriptsSeed } from "../../../lib/script-data";

export const metadata = { title: "Unicode Heatmap | Admin", robots: { index: false, follow: false } };

export default async function AdminUnicodeHeatmapPage() {
  await requireFeature("adminUnicodeHeatmap");
  const result = runDatasetQa(verifiedScriptsSeed);
  const covered = verifiedScriptsSeed.filter((script) => script.unicodeSupported && script.unicodeRanges.length > 0).length;
  const percent = Math.round((covered / verifiedScriptsSeed.length) * 100);

  return (
    <FeatureGate featureKey="adminUnicodeHeatmap">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Coverage</p>
        <h1 className="mt-2 text-3xl font-semibold">Unicode Heatmap</h1>
        <div className="mt-6 rounded border border-white/10 bg-white/5 p-5">
          <div className="h-4 overflow-hidden rounded bg-white/10">
            <div className={result.ok ? "h-full bg-emerald-300" : "h-full bg-red-300"} style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-3 text-white/70">
            {covered} of {verifiedScriptsSeed.length} records have Unicode range coverage. Dataset QA has {result.errors.length} fail count.
          </p>
        </div>
      </main>
    </FeatureGate>
  );
}
