import { createHmac, timingSafeEqual } from "crypto";

export function verifyRazorpayWebhookSignature(body: string, signature: string | null, secret = process.env.RAZORPAY_WEBHOOK_SECRET) {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function extractPaidRazorpayOrder(event: unknown) {
  const root = event as { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } };
  const payment = root.payload?.payment?.entity;
  if (root.event !== "payment.captured" || !payment) return null;
  const orderId = payment.order_id;
  const paymentId = payment.id;
  if (typeof orderId !== "string" || typeof paymentId !== "string") return null;
  return { razorpayOrderId: orderId, razorpayPaymentId: paymentId };
}
