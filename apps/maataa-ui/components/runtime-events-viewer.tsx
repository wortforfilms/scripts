"use client";

import { useEffect, useState } from "react";

export function RuntimeEventsViewer() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/runtime/events?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-white/60">Loading runtime events...</div>;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-white">Runtime Events</div>
          <div className="text-sm text-white/50">Persisted libSQL event timeline</div>
        </div>
        <div className="text-xs text-white/40">{events.length} events</div>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-2">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2"
          >
            <div>
              <div className="text-white text-sm font-medium">{e.type}</div>
              <div className="text-xs text-white/40">{e.source} • {e.time}</div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
              {e.state}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
