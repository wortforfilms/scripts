"use server";

import { revalidatePath } from "next/cache";
import { createScriptProofSubmission, reviewScriptProofSubmission } from "../../../../lib/catalog-db";
import { requireAdmin, requireReviewer } from "../../../../lib/auth/guards";

function boolFromForm(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function textFromForm(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createScriptProofAction(_: { ok: boolean; message: string } | null, formData: FormData) {
  try {
    const viewer = await requireReviewer();
    await createScriptProofSubmission({
      slug: textFromForm(formData, "slug"),
      name: textFromForm(formData, "name"),
      nativeName: textFromForm(formData, "nativeName"),
      direction: textFromForm(formData, "direction"),
      systemType: textFromForm(formData, "systemType"),
      verificationStatus: textFromForm(formData, "verificationStatus"),
      unicodeSupported: boolFromForm(formData.get("unicodeSupported")),
      unicodeRanges: textFromForm(formData, "unicodeRanges"),
      fallbackGlyphAsset: textFromForm(formData, "fallbackGlyphAsset"),
      sources: textFromForm(formData, "sources"),
      evidenceNote: textFromForm(formData, "evidenceNote"),
      proofUrl: textFromForm(formData, "proofUrl"),
      actorId: viewer.id
    });
    revalidatePath("/admin/scripts/proof");
    return { ok: true, message: "Draft script proof saved. It is not public and not verified." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to save script proof" };
  }
}

export async function reviewScriptProofAction(formData: FormData) {
  const viewer = await requireAdmin();
  const id = textFromForm(formData, "id");
  const action = textFromForm(formData, "action");
  if (action !== "submit-review" && action !== "approve" && action !== "reject") {
    throw new Error("Unsupported review action");
  }
  await reviewScriptProofSubmission({
    id,
    action,
    actorId: viewer.id,
    reviewNote: textFromForm(formData, "reviewNote")
  });
  revalidatePath("/admin/scripts/proof");
}
