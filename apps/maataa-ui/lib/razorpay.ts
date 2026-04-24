import { createHmac, timingSafeEqual } from "crypto";

type RazorpayOrderInput = {
  amountInPaise: number;
  currency: string;
  receipt: string;
};

export async function createRazorpayTestOrder(input: RazorpayOrderInput) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const localMode = process.env.RAZORPAY_E2E_MODE === "local" || !keyId || !keySecret;

  if (localMode) {
    return {
      id: `order_test_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`,
      amount: input.amountInPaise,
      currency: input.currency,
      receipt: input.receipt,
      mode: "local-test" as const
    };
  }

  if (!keyId.startsWith("rzp_test_")) {
    throw new Error("Refusing to create Razorpay launch-validation orders without a test-mode key");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: input.amountInPaise,
      currency: input.currency,
      receipt: input.receipt,
      payment_capture: 1
    })
  });

  if (!response.ok) {
    throw new Error(`Razorpay test order creation failed: ${response.status}`);
  }

  const order = (await response.json()) as { id?: string; amount?: number; currency?: string; receipt?: string };
  if (!order.id) throw new Error("Razorpay test order response did not include an id");
  return {
    id: order.id,
    amount: order.amount ?? input.amountInPaise,
    currency: order.currency ?? input.currency,
    receipt: order.receipt ?? input.receipt,
    mode: "razorpay-test" as const
  };
}

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
