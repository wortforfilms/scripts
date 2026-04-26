import { ScriptCatalogBrowser } from "../../components/scripts/ScriptCatalogBrowser";
import { ScriptNavigationScreen } from "../../components/scripts/ScriptNavigationScreen";
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

      <ScriptNavigationScreen scripts={verifiedScriptsSeed} targetCount={dataset.target} />
      <ScriptCatalogBrowser scripts={verifiedScriptsSeed} targetCount={dataset.target} />
    </main>
  );
}
