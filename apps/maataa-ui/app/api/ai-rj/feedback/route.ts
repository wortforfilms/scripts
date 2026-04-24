import { NextResponse } from "next/server";
import { persistRuntimeEvent } from "@maataa/runtime-db";

export async function POST(req: Request) {
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

  return NextResponse.json({ ok: true, event });
}
