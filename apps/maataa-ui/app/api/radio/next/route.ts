import { emitSchedulerEvent } from "../../../../../../services/scheduler/index.js";
import { getRadioState, setNowPlaying } from "../../../../../../services/playout-worker/index.js";

export async function POST() {
  const state = getRadioState();
  const queue = state.queue || [];

  if (!queue.length) {
    return Response.json({ error: "empty_queue" }, { status: 400 });
  }

  const currentIndex = queue.findIndex((q) => q.id === state.currentTrackId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % queue.length : 0;

  const nextTrack = queue[nextIndex];

  const correlationId = `radio-${Date.now()}`;

  const event = {
    id: `radio-${Date.now()}`,
    type: "radio.now_playing",
    source: "radio",
    state: "ok",
    time: new Date().toISOString(),
    correlationId,
    parentEventId: null,
    trackId: nextTrack.id,
    track: nextTrack.title,
    audioUrl: nextTrack.audioUrl
  };

  setNowPlaying(nextTrack);
  emitSchedulerEvent(event);

  return Response.json({ ok: true, nowPlaying: nextTrack });
}
