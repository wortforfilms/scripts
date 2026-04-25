import { NextResponse } from "next/server";
import { markOrderPaidFromWebhook } from "../../../../../lib/catalog-db";
import { extractPaidRazorpayOrder, verifyRazorpayWebhookSignature } from "../../../../../lib/payments/razorpay";
import { recordSpineEvent } from "../../../../../lib/spine";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");

  if (!verifyRazorpayWebhookSignature(body, signature)) {
    await recordSpineEvent({ eventType: "PAYMENT_FAILED", payload: { reason: "invalid_signature" } });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!eventId) {
    await recordSpineEvent({ eventType: "PAYMENT_FAILED", payload: { reason: "missing_event_id" } });
    return NextResponse.json({ error: "Missing x-razorpay-event-id" }, { status: 400 });
  }

  const event = JSON.parse(body) as unknown;
  const paidOrder = extractPaidRazorpayOrder(event);
  if (!paidOrder) return NextResponse.json({ ok: true, ignored: true });

  const result = await markOrderPaidFromWebhook({ ...paidOrder, eventId, rawEvent: event });
  return NextResponse.json({ ok: true, result });
}
