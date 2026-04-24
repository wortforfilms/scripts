import { getAudioRuntimeConfig } from "../../../../../../services/playout-worker/audio-config.js";
import { isAdminAuthConfigured } from "@/lib/api-security";

export async function GET() {
  const audioRuntime = getAudioRuntimeConfig();
  const streamUrl =
    process.env.RADIO_STREAM_URL ??
    process.env.NEXT_PUBLIC_RADIO_STREAM_URL ??
    "http://localhost:8000/live.mp3";
  const radioPageUrl =
    process.env.RADIO_PAGE_URL ??
    process.env.NEXT_PUBLIC_RADIO_PAGE_URL ??
    "/radio-live";

  return Response.json({
    station: "Maataa Radio",
    streamUrl,
    radioPageUrl,
    fallbackStreamUrl: streamUrl,
    controlSurface: {
      adminAuthConfigured: isAdminAuthConfigured(),
      protectedRoutes: [
        "/api/radio/next",
        "/api/radio/force-play",
        "/api/ai-rj/feedback",
        "/api/ai-rj/training/export"
      ]
    },
    tts: {
      mode: audioRuntime.ttsMode,
      audioEnabled: audioRuntime.ttsAudioEnabled,
      defaultLang: audioRuntime.defaultTtsLang,
      maxChars: audioRuntime.maxTtsChars
    }
  });
}
