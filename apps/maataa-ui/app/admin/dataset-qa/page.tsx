import { FeatureGate } from "../../../components/access/FeatureGate";
import { requireFeature } from "../../../lib/auth";
import { runDatasetQa, verifiedScriptsSeed } from "../../../lib/script-data";

export const metadata = { title: "Dataset QA | Admin", robots: { index: false, follow: false } };

export default async function AdminDatasetQaPage() {
  await requireFeature("adminDatasetQa");
  const result = runDatasetQa(verifiedScriptsSeed);
  const verified = verifiedScriptsSeed.filter((script) => script.verificationStatus === "VERIFIED").length;
  const unicodeCovered = verifiedScriptsSeed.filter((script) => script.unicodeSupported && script.unicodeRanges.length > 0).length;

  return (
    <FeatureGate featureKey="adminDatasetQa">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Public preview gate</p>
        <h1 className="mt-2 text-3xl font-semibold">Dataset QA</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">Records</p>
            <strong className="mt-2 block text-2xl">{verifiedScriptsSeed.length}</strong>
          </div>
          <div className="rounded border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">Verified</p>
            <strong className="mt-2 block text-2xl">{verified}</strong>
          </div>
          <div className="rounded border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">Unicode ranges covered</p>
            <strong className="mt-2 block text-2xl">{unicodeCovered}</strong>
          </div>
        </div>
        <section className="mt-6 rounded border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">{result.ok ? "PASS" : "FAIL"}</h2>
          {result.errors.length === 0 ? (
            <p className="mt-2 text-white/70">Dataset records include required sources, verification status, system type, and Unicode metadata policy.</p>
          ) : (
            <ul className="mt-4 grid gap-2 text-sm text-red-200">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </FeatureGate>
  );
}
