"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth";
import { generateDraftSku } from "../../../lib/catalog-db";
import { parseGenerateSkuForm } from "../../../lib/forms/schemas";

export async function generateSkuAction(formData: FormData) {
  const user = await requireAdmin();
  const parsed = parseGenerateSkuForm(formData);
  if (!parsed.ok) redirect(`/admin/catalog?error=${encodeURIComponent(parsed.error)}`);
  await generateDraftSku({
    title: parsed.value.title,
    description: parsed.value.description,
    amountInPaise: parsed.value.amountInPaise,
    actorId: user.id
  });
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/skus/review");
  redirect("/admin/skus/review");
}
