import { previewScheduledItems } from "../../../../../../services/playout-worker/index.js";
import { checkRateLimit, jsonWithHeaders } from "@/lib/api-security";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "preview_failed";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestedCount = Number(searchParams.get("count") ?? 30);
  const count = Number.isFinite(requestedCount)
    ? Math.max(1, Math.min(Math.trunc(requestedCount), 100))
    : 30;
  const rateLimit = checkRateLimit(req, {
    key: "radio-preview",
    limit: 60,
    windowMs: 60_000
  });
  if (!rateLimit.ok) return rateLimit.response!;

  try {
    const items = await previewScheduledItems(count);

    return jsonWithHeaders(
      {
        ok: true,
        count: items.length,
        items
      },
      undefined,
      rateLimit.headers
    );
  } catch (error) {
    return jsonWithHeaders(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
      rateLimit.headers
    );
  }
}
