import { NextResponse } from "next/server";
import { markOrderPaidFromWebhook } from "../../../../../lib/catalog-db";
import { extractPaidRazorpayOrder, verifyRazorpayWebhookSignature } from "../../../../../lib/payments/razorpay";
import { recordSpineEvent } from "../../../../../lib/spine";
import { recordAudit } from "../../../../../lib/logging/audit";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");

  if (!verifyRazorpayWebhookSignature(body, signature)) {
    await recordAudit({
      action: "PAYMENT_WEBHOOK_REJECTED",
      severity: "ERROR",
      payload: { provider: "razorpay", reason: "invalid_signature", eventId: eventId ?? null }
    });
    await recordSpineEvent({ eventType: "PAYMENT_FAILED", payload: { reason: "invalid_signature" } });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!eventId) {
    await recordAudit({
      action: "PAYMENT_WEBHOOK_REJECTED",
      severity: "ERROR",
      payload: { provider: "razorpay", reason: "missing_event_id" }
    });
    await recordSpineEvent({ eventType: "PAYMENT_FAILED", payload: { reason: "missing_event_id" } });
    return NextResponse.json({ error: "Missing x-razorpay-event-id" }, { status: 400 });
  }

  const event = JSON.parse(body) as unknown;
  await recordAudit({
    action: "PAYMENT_WEBHOOK_RECEIVED",
    subjectId: eventId,
    payload: { provider: "razorpay", signatureValid: true, event: (event as { event?: unknown }).event ?? null }
  });
  const paidOrder = extractPaidRazorpayOrder(event);
  if (!paidOrder) return NextResponse.json({ ok: true, ignored: true });

  const result = await markOrderPaidFromWebhook({ ...paidOrder, eventId, rawEvent: event });
  return NextResponse.json({ ok: true, result });
}
