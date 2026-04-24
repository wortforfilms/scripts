import { NextResponse } from "next/server";
import { requireAdmin, routeError } from "../../../../../lib/auth";
import { generateDraftSku } from "../../../../../lib/catalog-db";

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const body = (await request.json()) as { productId?: string; title?: string; description?: string; amountInPaise?: number };
    if (!body.title || !Number.isInteger(body.amountInPaise)) throw new Error("title and amountInPaise are required");
    const amountInPaise = body.amountInPaise;
    if (typeof amountInPaise !== "number") throw new Error("amountInPaise is required");
    const sku = await generateDraftSku({
      productId: body.productId,
      title: body.title,
      description: body.description,
      amountInPaise,
      actorId: user.id
    });
    return NextResponse.json({ sku });
  } catch (error) {
    return routeError(error);
  }
}
