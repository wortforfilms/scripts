import {
  approveSkuAction,
  archiveSkuAction,
  publishSkuAction,
  submitSkuReviewAction
} from "../../app/admin/skus/review/actions";
import type { CatalogSku } from "../../lib/catalog-db";

export function SkuWorkflowButtons({ sku }: { sku: CatalogSku }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={submitSkuReviewAction}>
        <input name="skuId" type="hidden" value={sku.id} />
        <button disabled={sku.publishStatus !== "DRAFT"} className="rounded border border-white/10 px-3 py-1 text-sm disabled:opacity-40">
          Submit
        </button>
      </form>
      <form action={approveSkuAction}>
        <input name="skuId" type="hidden" value={sku.id} />
        <button disabled={sku.publishStatus !== "REVIEW"} className="rounded border border-white/10 px-3 py-1 text-sm disabled:opacity-40">
          Approve
        </button>
      </form>
      <form action={publishSkuAction}>
        <input name="skuId" type="hidden" value={sku.id} />
        <button disabled={sku.publishStatus !== "APPROVED"} className="rounded border border-white/10 px-3 py-1 text-sm disabled:opacity-40">
          Publish
        </button>
      </form>
      <form action={archiveSkuAction}>
        <input name="skuId" type="hidden" value={sku.id} />
        <button disabled={sku.publishStatus === "ARCHIVED"} className="rounded border border-white/10 px-3 py-1 text-sm disabled:opacity-40">
          Archive
        </button>
      </form>
    </div>
  );
}
