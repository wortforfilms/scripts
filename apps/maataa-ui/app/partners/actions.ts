"use server";

import { redirect } from "next/navigation";
import { createPartnershipInquiry, type PartnershipType } from "../../lib/partnership-db";

const types = new Set<PartnershipType>(["INVESTOR", "SPONSOR", "CREATOR", "AFFILIATE", "PARTNER"]);

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitPartnershipInquiry(formData: FormData) {
  const type = field(formData, "type") as PartnershipType;
  const name = field(formData, "name");
  const email = field(formData, "email");
  const organization = field(formData, "organization");
  const intent = field(formData, "intent");
  const next = field(formData, "next") || "/partners";
  if (!types.has(type)) redirect(`${next}?status=invalid-type`);
  if (!name || !email || !intent) redirect(`${next}?status=missing`);
  await createPartnershipInquiry({ type, name, email, organization, intent });
  redirect(`${next}?status=received`);
}
