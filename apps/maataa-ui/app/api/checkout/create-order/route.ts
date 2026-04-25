import { NextResponse } from "next/server";
import { requireFeature, requireUser, routeError } from "../../../../lib/auth";
import { createPendingOrder, quoteSkus } from "../../../../lib/catalog-db";
import { parseCheckoutRequest } from "../../../../lib/forms/schemas";
import { createRazorpayTestOrder } from "../../../../lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    await requireFeature("checkout");
    const user = await requireUser();
    const parsed = parseCheckoutRequest(await request.json());
    if (!parsed.ok) throw new Error(parsed.error);
    const quote = await quoteSkus(parsed.value.skuIds);
    const razorpayOrder = await createRazorpayTestOrder({
      amountInPaise: quote.amountInPaise,
      currency: quote.currency,
      receipt: `maataa_${crypto.randomUUID().slice(0, 18)}`
    });
    const order = await createPendingOrder({ userId: user.id, skuIds: parsed.value.skuIds, razorpayOrderId: razorpayOrder.id });
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
