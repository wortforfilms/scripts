import { listRuntimeEvents } from "@maataa/runtime-db";
import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../services/playout-worker/index.js";
import { getAudioRuntimeConfig } from "../../../../../services/playout-worker/audio-config.js";
import { isAdminAuthConfigured } from "@/lib/api-security";

export async function GET() {
  await ensureRadioStateReady();

  const radioState = getRadioState() as {
    queue?: Array<unknown>;
    currentTrack?: {
      title?: string;
      audioUrl?: string;
    } | null;
  };
  const latestEvents = await listRuntimeEvents(5);
  const streamUrl =
    process.env.RADIO_STREAM_URL ??
    process.env.NEXT_PUBLIC_RADIO_STREAM_URL ??
    null;
  const publicAppUrl =
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    null;
  const audioRuntime = getAudioRuntimeConfig();
  const adminAuthConfigured = isAdminAuthConfigured();

  return Response.json({
    ok: true,
    service: "maataa-ui",
    version: "0.1.0-private-alpha",
    checkedAt: new Date().toISOString(),
    checks: {
      runtimeEvents: {
        ok: true,
        count: latestEvents.length,
        latestEventId: latestEvents[0]?.id ?? null
      },
      runtimeState: {
        ok: true,
        queueSize: radioState.queue?.length ?? 0,
        nowPlaying: radioState.currentTrack?.title ?? null
      },
      radio: {
        ok: Boolean(streamUrl),
        streamUrl,
        currentTrackAudioUrl: radioState.currentTrack?.audioUrl ?? null,
        ttsMode: audioRuntime.ttsMode,
        ttsAudioEnabled: audioRuntime.ttsAudioEnabled
      },
      app: {
        ok: true,
        publicAppUrl
      },
      security: {
        ok: adminAuthConfigured,
        adminAuthConfigured
      }
    }
  });
}
