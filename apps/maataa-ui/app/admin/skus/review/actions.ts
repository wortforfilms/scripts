"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireReviewer } from "../../../../lib/auth";
import { transitionSku } from "../../../../lib/catalog-db";

export async function submitSkuReviewAction(formData: FormData) {
  const user = await requireReviewer();
  const skuId = String(formData.get("skuId") ?? "");
  if (!skuId) throw new Error("skuId is required");
  await transitionSku(skuId, "submit-review", user.id);
  revalidatePath("/admin/skus/review");
}

export async function approveSkuAction(formData: FormData) {
  const user = await requireAdmin();
  const skuId = String(formData.get("skuId") ?? "");
  if (!skuId) throw new Error("skuId is required");
  await transitionSku(skuId, "approve", user.id);
  revalidatePath("/admin/skus/review");
}

export async function publishSkuAction(formData: FormData) {
  const user = await requireAdmin();
  const skuId = String(formData.get("skuId") ?? "");
  if (!skuId) throw new Error("skuId is required");
  await transitionSku(skuId, "publish", user.id);
  revalidatePath("/admin/skus/review");
}

export async function archiveSkuAction(formData: FormData) {
  const user = await requireAdmin();
  const skuId = String(formData.get("skuId") ?? "");
  if (!skuId) throw new Error("skuId is required");
  await transitionSku(skuId, "archive", user.id);
  revalidatePath("/admin/skus/review");
}
