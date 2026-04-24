import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../../services/playout-worker/index.js";

export async function GET() {
  await ensureRadioStateReady();

  const state = getRadioState() as {
    currentTrack?: {
      title?: string;
      audioUrl?: string;
    } | null;
  };
  const currentTrack = state.currentTrack;
  const streamUrl =
    process.env.RADIO_STREAM_URL ??
    process.env.NEXT_PUBLIC_RADIO_STREAM_URL ??
    currentTrack?.audioUrl ??
    "http://localhost:8000/live.mp3";

  return Response.json({
    title: currentTrack?.title ?? "Maataa Radio",
    status: currentTrack ? "live" : "idle",
    streamUrl,
    currentTrack
  });
}
