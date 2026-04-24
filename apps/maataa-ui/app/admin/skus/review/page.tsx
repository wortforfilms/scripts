import { listSkus } from "../../../../lib/catalog-db";

export const metadata = { title: "SKU Review | Maataa Scripts" };

export default async function SkuReviewPage() {
  const skus = await listSkus(false);
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">SKU Review</h1>
      <div className="mt-6 overflow-hidden rounded border border-white/10">
        {skus.map((sku) => (
          <div key={sku.id} className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-4">
            <span>{sku.code}</span>
            <span>{sku.title}</span>
            <span>{sku.publishStatus}</span>
            <span>{sku.isActive ? "active" : "inactive"}</span>
          </div>
        ))}
        {skus.length === 0 ? <p className="p-4 text-white/60">No generated SKUs yet.</p> : null}
      </div>
    </main>
  );
}
