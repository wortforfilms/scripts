import { NextResponse } from "next/server";
import { requireAdmin, routeError } from "../../../../../../lib/auth";
import { transitionSku } from "../../../../../../lib/catalog-db";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    const { id } = await context.params;
    return NextResponse.json({ sku: await transitionSku(id, "publish", user.id) });
  } catch (error) {
    return routeError(error);
  }
}
