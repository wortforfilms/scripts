import { NextResponse } from "next/server";
import { listRuntimeEvents } from "@maataa/runtime-db";
import { buildAiRjTrainingDataset } from "@maataa/ai-rj-training";

export async function GET(req: Request) {
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
      "X-Maataa-Stats": JSON.stringify(dataset.stats)
    }
  });
}
