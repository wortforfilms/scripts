import { NextResponse } from "next/server";
import { listRuntimeEvents } from "@maataa/runtime-db";
import { buildAiRjTrainingDataset } from "@maataa/ai-rj-training";
import { checkRateLimit, requireAdminToken } from "@/lib/api-security";

export async function GET(req: Request) {
  const unauthorized = requireAdminToken(req);
  if (unauthorized) return unauthorized;

  const rateLimit = checkRateLimit(req, {
    key: "ai-rj-training-export",
    limit: 6,
    windowMs: 60_000
  });
  if (!rateLimit.ok) return rateLimit.response!;

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "1000");
  const includeFallback = url.searchParams.get("includeFallback") === "true";

  const events = await listRuntimeEvents(limit);

  const dataset = buildAiRjTrainingDataset(events, {
    includeFallback
  });

  return new NextResponse(dataset.jsonl, {
    headers: {
      "Content-Type": "application/jsonl",
      "Content-Disposition": "attachment; filename=ai-rj-training.jsonl",
      "X-Maataa-Stats": JSON.stringify(dataset.stats),
      "X-RateLimit-Limit": rateLimit.headers.get("X-RateLimit-Limit") ?? "",
      "X-RateLimit-Remaining": rateLimit.headers.get("X-RateLimit-Remaining") ?? "",
      "X-RateLimit-Reset": rateLimit.headers.get("X-RateLimit-Reset") ?? ""
    }
  });
}
