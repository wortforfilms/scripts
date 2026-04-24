import {
  ensureRadioStateReady,
  getRadioState,
  scheduleNextRadioItem
} from "../../../../../../services/playout-worker/index.js";
import { checkRateLimit, jsonWithHeaders, requireAdminToken } from "@/lib/api-security";

export async function POST(req: Request) {
  const unauthorized = requireAdminToken(req);
  if (unauthorized) return unauthorized;

  const rateLimit = checkRateLimit(req, {
    key: "radio-next",
    limit: 12,
    windowMs: 60_000
  });
  if (!rateLimit.ok) return rateLimit.response!;

  await ensureRadioStateReady();
  const state = getRadioState();

  if (!state.queue?.length) {
    return jsonWithHeaders({ error: "empty_queue" }, { status: 400 }, rateLimit.headers);
  }

  const event = await scheduleNextRadioItem();

  return jsonWithHeaders(
    {
      ok: true,
      nowPlaying: state.currentTrack,
      event
    },
    undefined,
    rateLimit.headers
  );
}
