import { NextResponse } from "next/server";
import { requireFeature, requireUser, routeError } from "../../../../lib/auth";
import { createPendingOrder, quoteSkus } from "../../../../lib/catalog-db";
import { createRazorpayTestOrder } from "../../../../lib/razorpay";

export async function POST(request: Request) {
  try {
    await requireFeature("checkout");
    const user = await requireUser();
    const body = (await request.json()) as { skuIds?: string[]; acceptedLegal?: boolean };
    if (!body.acceptedLegal) throw new Error("Terms, Refund Policy, and Digital License must be accepted");
    if (!Array.isArray(body.skuIds) || body.skuIds.length === 0) throw new Error("Cart is empty");
    const quote = await quoteSkus(body.skuIds);
    const razorpayOrder = await createRazorpayTestOrder({
      amountInPaise: quote.amountInPaise,
      currency: quote.currency,
      receipt: `maataa_${crypto.randomUUID().slice(0, 18)}`
    });
    const order = await createPendingOrder({ userId: user.id, skuIds: body.skuIds, razorpayOrderId: razorpayOrder.id });
    return NextResponse.json({
      order,
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID ?? "rzp_test_configure_me",
        orderId: razorpayOrder.id,
        mode: razorpayOrder.mode
      }
    });
  } catch (error) {
    return routeError(error);
  }
}
