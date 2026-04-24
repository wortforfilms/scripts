"use client";

import { useEffect, useState } from "react";

export default function RadioPage() {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/radio/config")
      .then((res) => res.json())
      .then((data) => {
        setStreamUrl(data.streamUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">📻 Maataa Radio</h1>
          <p className="text-white/60 mt-2">
            Live stream powered by Maataa runtime (scheduler → proof → radio).
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          {loading ? (
            <div className="text-white/60">Loading stream...</div>
          ) : !streamUrl ? (
            <div className="text-red-400">No stream URL configured</div>
          ) : (
            <div className="space-y-4">
              <audio
                controls
                autoPlay
                className="w-full"
                src={streamUrl}
              />

              <div className="text-xs text-white/40 break-all">
                Stream: {streamUrl}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/50">
          If no audio plays, ensure your stream is running (Liquidsoap/Icecast or any test stream).
        </div>
      </div>
    </div>
  );
}
