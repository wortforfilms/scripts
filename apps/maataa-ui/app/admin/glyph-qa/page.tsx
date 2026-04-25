import { join } from "path";
import { FeatureGate } from "../../../components/access/FeatureGate";
import { requireFeature } from "../../../lib/auth";
import { runAndRecordGlyphQa } from "../../../lib/glyph-qa";

export const metadata = { title: "Glyph QA | Admin", robots: { index: false, follow: false } };

export default async function AdminGlyphQaPage() {
  await requireFeature("adminGlyphQa");
  const result = await runAndRecordGlyphQa(join(process.cwd(), "public"));

  return (
    <FeatureGate featureKey="adminGlyphQa">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Font and glyph gate</p>
        <h1 className="mt-2 text-3xl font-semibold">Glyph QA</h1>
        <div className="mt-6 rounded border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">{result.ok ? "PASS" : "FAIL"}</h2>
          <p className="mt-2 text-white/70">
            Checked {result.checkedCount} public script records for verified font mappings and verification-required fallback assets.
          </p>
          {result.errors.length > 0 ? (
            <ul className="mt-4 grid gap-2 text-sm text-red-200">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
    </FeatureGate>
  );
}
