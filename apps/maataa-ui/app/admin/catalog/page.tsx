import { listSkus } from "../../../lib/catalog-db";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../../../lib/script-data";
import { GenerateSkuForm } from "../../../components/admin/GenerateSkuForm";

export const metadata = { title: "Admin Catalog | Maataa Scripts" };

export default async function AdminCatalogPage() {
  const skus = await listSkus(false);
  const dataset = scriptDatasetStatus();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Catalog Control</h1>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Script records</p>
          <p className="text-2xl">{dataset.current} / {dataset.target}</p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">SKU visibility</p>
          <p className="text-2xl">{skus.filter((sku) => sku.publishStatus === "PUBLISHED" && sku.isActive).length} public</p>
        </div>
        <div className="rounded border border-amber-400/30 bg-amber-400/10 p-4">
          <p className="text-sm text-amber-100">426-script dataset</p>
          <p className="text-sm text-amber-50">{dataset.note}</p>
        </div>
      </section>
      <GenerateSkuForm />
      <h2 className="mt-10 text-xl font-semibold">Verified Seed Subset</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {verifiedScriptsSeed.map((script) => (
          <div key={script.id} className="rounded border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <strong>{script.name}</strong>
              <span className="text-xs text-white/60">{script.verificationStatus}</span>
            </div>
            <p className="mt-2 text-sm text-white/60">{script.region}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
