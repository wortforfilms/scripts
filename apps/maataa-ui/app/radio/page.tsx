"use client";

import { useEffect, useRef, useState } from "react";
import { connectEvents } from "@/lib/events";

type NowPlayingEvent = {
  id?: string;
  correlationId?: string;
  parentEventId?: string | null;
  source?: string;
  type?: string;
  time?: string;
  state?: string;
  track?: string;
};

export default function RadioPage() {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/radio/config")
      .then((res) => res.json())
      .then((data) => {
        setStreamUrl(data.streamUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const disconnect = connectEvents((raw) => {
      try {
        const event = typeof raw === "string" ? JSON.parse(raw) : raw;
        setSseConnected(true);

        if (event?.type === "radio.now_playing" || event?.type === "radio.queue_updated") {
          setNowPlaying(event);
        }
      } catch {}
    });

    return () => {
      setSseConnected(false);
      disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">📻 Maataa Radio</h1>
            <p className="mt-2 text-white/60">
              Live stream powered by Maataa runtime (scheduler → proof → radio).
            </p>
          </div>
          <div className={`rounded-full border px-3 py-1 text-xs ${sseConnected ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"}`}>
            {sseConnected ? "SSE Live" : "Waiting SSE"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          {loading ? (
            <div className="text-white/60">Loading stream...</div>
          ) : !streamUrl ? (
            <div className="text-red-400">No stream URL configured</div>
          ) : (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                controls
                autoPlay
                className="w-full"
                src={streamUrl}
              />

              <div className="break-all text-xs text-white/40">
                Stream: {streamUrl}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
          <div className="text-sm text-white/50">Now Playing</div>
          {nowPlaying ? (
            <div className="mt-2 space-y-1">
              <div className="text-xl font-semibold text-white">
                {nowPlaying.track ?? nowPlaying.type ?? "Radio Event"}
              </div>
              <div className="text-xs text-white/50">
                {nowPlaying.source ?? "radio"} • {nowPlaying.time ?? "live"}
              </div>
              <div className="break-all text-[11px] text-white/35">
                correlation: {nowPlaying.correlationId ?? "—"}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-white/40">Waiting for radio.now_playing event...</div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/50">
          If no audio plays, ensure your stream is running. The UI now listens to <span className="text-cyan-300">/api/spine/events</span> directly for radio events.
        </div>
      </div>
    </div>
  );
}
