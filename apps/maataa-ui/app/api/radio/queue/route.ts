import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../../services/playout-worker/index.js";

export async function GET() {
  await ensureRadioStateReady();

  const queue = (getRadioState().queue ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    duration: item.durationSec ?? 0,
    kind: item.kind ?? "song"
  }));

  return Response.json({ queue });
}
