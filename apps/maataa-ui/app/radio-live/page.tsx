"use client";

import { useEffect, useState } from "react";

type NowPlaying = {
  title: string;
  status: string;
  streamUrl: string;
};

type QueueItem = {
  id: string;
  title: string;
  duration: number;
};

type RadioConfig = {
  station: string;
  streamUrl: string;
  radioPageUrl?: string;
};

export default function RadioLivePage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [config, setConfig] = useState<RadioConfig | null>(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/radio/config").then(r => r.json()).then(setConfig);
      fetch("/api/radio/now-playing").then(r => r.json()).then(setNowPlaying);
      fetch("/api/radio/queue").then(r => r.json()).then(d => setQueue(d.queue));
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-yellow-300">Radio Live</h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Now Playing</div>
          <div className="text-xl">{nowPlaying?.title}</div>
          <div className="mt-1 text-xs text-white/45">{config?.station ?? "Maataa Radio"}</div>
          <audio controls className="w-full mt-3">
            <source src={nowPlaying?.streamUrl ?? config?.streamUrl ?? "/radio"} />
          </audio>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Queue</div>
          <ul className="mt-3 space-y-2">
            {queue.map(q => (
              <li key={q.id} className="text-white/80">{q.title} ({q.duration}s)</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
