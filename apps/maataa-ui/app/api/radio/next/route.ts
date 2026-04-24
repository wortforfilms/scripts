import {
  ensureRadioStateReady,
  getRadioState,
  scheduleNextRadioItem
} from "../../../../../../services/playout-worker/index.js";

export async function POST() {
  await ensureRadioStateReady();
  const state = getRadioState();

  if (!state.queue?.length) {
    return Response.json({ error: "empty_queue" }, { status: 400 });
  }

  const event = await scheduleNextRadioItem();

  return Response.json({
    ok: true,
    nowPlaying: state.currentTrack,
    event
  });
}
