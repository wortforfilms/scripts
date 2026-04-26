import { NextResponse } from "next/server";
import { verifyUpiReconciliation } from "../../../../../../../../lib/catalog-db";
import { requireFeature, requireUser, routeError } from "../../../../../../../../lib/auth";
import { checkRateLimit } from "../../../../../../../../lib/api-rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireFeature("adminFinance");
    const viewer = await requireUser();
    if (!checkRateLimit(`upi:${viewer.id}:verify`, 10, 60_000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    const { orderId } = await params;
    const body = (await request.json()) as { reference?: unknown; proofUrl?: unknown; note?: unknown };
    const result = await verifyUpiReconciliation({
      orderId,
      reference: typeof body.reference === "string" ? body.reference : "",
      proofUrl: typeof body.proofUrl === "string" ? body.proofUrl : "",
      actorId: viewer.id,
      note: typeof body.note === "string" ? body.note : undefined
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return routeError(error);
  }
}
