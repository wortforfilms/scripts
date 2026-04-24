import { NextResponse } from "next/server";
import { persistRuntimeEvent } from "@maataa/runtime-db";
import { checkRateLimit, jsonWithHeaders, requireAdminToken } from "@/lib/api-security";

export async function POST(req: Request) {
  const unauthorized = requireAdminToken(req);
  if (unauthorized) return unauthorized;

  const rateLimit = checkRateLimit(req, {
    key: "ai-rj-feedback",
    limit: 20,
    windowMs: 60_000
  });
  if (!rateLimit.ok) return rateLimit.response!;

  const body = await req.json();

  const event = await persistRuntimeEvent({
    source: "ai-rj-feedback",
    type: "ai-rj.feedback",
    targetEventId: body.eventId,
    rating: body.rating,
    score: body.score,
    note: body.note,
    reason: body.reason,
    time: new Date().toISOString(),
    state: "ok"
  });

  return jsonWithHeaders({ ok: true, event }, undefined, rateLimit.headers);
}
