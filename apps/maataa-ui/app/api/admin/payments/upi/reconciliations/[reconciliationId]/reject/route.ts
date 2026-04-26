import { NextResponse } from "next/server";
import { rejectUpiReconciliation } from "../../../../../../../../lib/catalog-db";
import { requireFeature, requireUser, routeError } from "../../../../../../../../lib/auth";
import { checkRateLimit } from "../../../../../../../../lib/api-rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ reconciliationId: string }> }) {
  try {
    await requireFeature("adminFinance");
    const viewer = await requireUser();
    if (!checkRateLimit(`upi:${viewer.id}:reject`, 10, 60_000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    const { reconciliationId } = await params;
    const body = (await request.json()) as { note?: unknown };
    const result = await rejectUpiReconciliation({
      reconciliationId,
      actorId: viewer.id,
      note: typeof body.note === "string" ? body.note : ""
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return routeError(error);
  }
}
