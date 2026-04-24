import { scheduleNextRadioItem, getRadioState } from "../../../../../../services/playout-worker/index.js";

export async function POST() {
  const state = getRadioState();

  if (!state.queue?.length) {
    return Response.json({ error: "empty_queue" }, { status: 400 });
  }

  const event = scheduleNextRadioItem();

  return Response.json({
    ok: true,
    nowPlaying: state.currentTrack,
    event
  });
}
