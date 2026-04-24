import { generateSkuAction } from "../../app/admin/catalog/actions";

export function GenerateSkuForm() {
  return (
    <form action={generateSkuAction} className="mt-8 rounded border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-semibold">Generate Draft SKU</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm">
          <span className="text-white/70">Title</span>
          <input name="title" required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-white/70">Amount in paise</span>
          <input name="amountInPaise" required type="number" min="1" className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-white/70">Description</span>
          <input name="description" className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" />
        </label>
      </div>
      <button className="mt-4 rounded bg-emerald-400 px-4 py-2 font-medium text-black" type="submit">
        Generate as Draft
      </button>
    </form>
  );
}
