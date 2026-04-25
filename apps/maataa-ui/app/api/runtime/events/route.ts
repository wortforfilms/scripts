import type { RuntimeEventRecord } from "@maataa/runtime-db";
import { listRuntimeEvents } from "@maataa/runtime-db";
import { checkRateLimit, jsonWithHeaders } from "@/lib/api-security";
import { requireFeature, routeError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireFeature("runtimeStatus");
    const { searchParams } = new URL(req.url);
    const requestedLimit = Number(searchParams.get("limit") ?? "100");
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(Math.trunc(requestedLimit), 500))
      : 100;
    const source = searchParams.get("source");
    const type = searchParams.get("type");
    const rateLimit = checkRateLimit(req, {
      key: "runtime-events",
      limit: 120,
      windowMs: 60_000
    });
    if (!rateLimit.ok) return rateLimit.response!;

    const events = await listRuntimeEvents(limit);
    const filtered = events.filter((event: RuntimeEventRecord) => {
      if (source && event.source !== source) return false;
      if (type && event.type !== type) return false;
      return true;
    });

    return jsonWithHeaders(
      {
        events: filtered,
        total: filtered.length
      },
      undefined,
      rateLimit.headers
    );
  } catch (error) {
    return routeError(error);
  }
}
