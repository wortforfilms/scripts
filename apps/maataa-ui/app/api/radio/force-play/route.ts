import { forcePlayTrack } from "../../../../../../services/playout-worker/index.js";
import { checkRateLimit, jsonWithHeaders, requireAdminToken } from "@/lib/api-security";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "force_play_failed";
}

export async function POST(req: Request) {
  const unauthorized = requireAdminToken(req);
  if (unauthorized) return unauthorized;

  const rateLimit = checkRateLimit(req, {
    key: "radio-force-play",
    limit: 8,
    windowMs: 60_000
  });
  if (!rateLimit.ok) return rateLimit.response!;

  try {
    const body = await req.json();

    const event = await forcePlayTrack(body.track, {
      reason: "preview-node-click"
    });

    return jsonWithHeaders({ ok: true, event }, undefined, rateLimit.headers);
  } catch (error) {
    return jsonWithHeaders(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
      rateLimit.headers
    );
  }
}
