import { listRuntimeEvents } from "@maataa/runtime-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "100");
  const source = searchParams.get("source");
  const type = searchParams.get("type");

  const events = await listRuntimeEvents(Number.isFinite(limit) ? limit : 100);
  const filtered = events.filter((event) => {
    if (source && event.source !== source) return false;
    if (type && event.type !== type) return false;
    return true;
  });

  return Response.json({
    events: filtered,
    total: filtered.length
  });
}
