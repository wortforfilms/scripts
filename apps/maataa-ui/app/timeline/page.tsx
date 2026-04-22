"use client";

import { useEffect, useState } from "react";

export default function TimelinePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/runtime/timeline").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-6 text-white">Loading timeline...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Unified Timeline</h1>
      <div className="mb-4 text-sm text-white/60">
        Total: {data.counts.total} | Scheduler: {data.counts.scheduler} | Proof: {data.counts.proof} | Radio: {data.counts.radio}
      </div>
      <div className="space-y-2">
        {data.timeline.map((event: any) => {
          const isRadio = event.source === "radio" || String(event.type).startsWith("radio.");
          return (
            <div key={event.id} className="p-3 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="font-medium">{event.type}</div>
                {isRadio ? (
                  <span className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-fuchsia-300">
                    Broadcast Proof
                  </span>
                ) : null}
              </div>
              <div className="text-xs text-white/50">{event.time}</div>
              <div className="text-xs text-yellow-300">{event.source}</div>
            </div>
          );
        })}
      </div>
      <a href="/api/proof/hkd" className="mt-6 inline-block px-4 py-2 bg-yellow-500 text-black rounded">
        Download HKD Proof
      </a>
    </div>
  );
}
