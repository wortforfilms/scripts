import { NextResponse } from "next/server";
import { createPartnershipInquiry, type PartnershipType } from "../../../../lib/partnership-db";

const types = new Set<PartnershipType>(["INVESTOR", "SPONSOR", "CREATOR", "AFFILIATE", "PARTNER"]);

export async function POST(request: Request) {
  const body = (await request.json()) as {
    type?: unknown;
    name?: unknown;
    email?: unknown;
    organization?: unknown;
    intent?: unknown;
  };
  if (typeof body.type !== "string" || !types.has(body.type as PartnershipType)) {
    return NextResponse.json({ error: "Invalid partnership type" }, { status: 400 });
  }
  if (typeof body.name !== "string" || typeof body.email !== "string" || typeof body.intent !== "string") {
    return NextResponse.json({ error: "name, email, and intent are required" }, { status: 400 });
  }
  const result = await createPartnershipInquiry({
    type: body.type as PartnershipType,
    name: body.name,
    email: body.email,
    organization: typeof body.organization === "string" ? body.organization : undefined,
    intent: body.intent
  });
  return NextResponse.json(result);
}
