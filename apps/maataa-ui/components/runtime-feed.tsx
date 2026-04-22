"use client";

import { useEffect, useState } from "react";
import type { RuntimeEvent } from "@/lib/types";
import { connectEvents } from "@/lib/events";

const seed: RuntimeEvent[] = [
  { id: "1", time: "10:42:11", type: "scheduler.tick", state: "ok" },
  { id: "2", time: "10:42:13", type: "proof.generated", state: "ok" },
  { id: "3", time: "10:42:16", type: "render.queued", state: "warn" }
];

function badge(state: RuntimeEvent["state"]) {
  if (state === "ok") return "bg-emerald-500/10 text-emerald-300";
  if (state === "warn") return "bg-yellow-500/10 text-yellow-300";
  return "bg-rose-500/10 text-rose-300";
}

export function RuntimeFeed() {
  const [events, setEvents] = useState<RuntimeEvent[]>(seed);

  useEffect(() => {
    return connectEvents((raw) => {
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const event: RuntimeEvent = {
          id: parsed.id ?? crypto.randomUUID(),
          time: parsed.time ?? new Date().toLocaleTimeString(),
          type: parsed.type ?? "runtime.event",
          state: parsed.state ?? "ok"
        };
        setEvents((current) => [event, ...current].slice(0, 20));
      } catch {
        setEvents((current) => [
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString(),
            type: "runtime.raw",
            state: "warn"
          },
          ...current
        ].slice(0, 20));
      }
    });
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-white">Live Event Feed</div>
          <div className="text-sm text-white/55">Server-sent runtime, proof, wallet, and dhatu events.</div>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">SSE Ready</div>
      </div>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
            <div>
              <div className="font-medium text-white">{event.type}</div>
              <div className="text-xs text-white/45">{event.time}</div>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs ${badge(event.state)}`}>
              {event.state}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
