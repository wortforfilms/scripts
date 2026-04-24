import { NextResponse } from "next/server";
import { requireFeature, requireUser, routeError } from "../../../../lib/auth";
import { createPendingOrder } from "../../../../lib/catalog-db";

export async function POST(request: Request) {
  try {
    await requireFeature("checkout");
    const user = await requireUser();
    const body = (await request.json()) as { skuIds?: string[]; acceptedLegal?: boolean };
    if (!body.acceptedLegal) throw new Error("Terms, Refund Policy, and Digital License must be accepted");
    if (!Array.isArray(body.skuIds) || body.skuIds.length === 0) throw new Error("Cart is empty");
    const order = await createPendingOrder({ userId: user.id, skuIds: body.skuIds });
    return NextResponse.json({
      order,
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID ?? "rzp_test_configure_me",
        mode: "test"
      }
    });
  } catch (error) {
    return routeError(error);
  }
}
