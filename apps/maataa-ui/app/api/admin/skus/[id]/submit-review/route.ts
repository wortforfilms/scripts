import { NextResponse } from "next/server";
import { requireReviewer, routeError } from "../../../../../../lib/auth";
import { transitionSku } from "../../../../../../lib/catalog-db";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireReviewer();
    const { id } = await context.params;
    return NextResponse.json({ sku: await transitionSku(id, "submit-review", user.id) });
  } catch (error) {
    return routeError(error);
  }
}
