"use client";

import { useEffect, useMemo, useState } from "react";
import type { RuntimeEvent } from "@/lib/types";
import { connectEvents } from "@/lib/events";
import { RuntimeEventsViewer } from "@/components/runtime-events-viewer";

type NodeState = RuntimeEvent["state"];

type StatusNode = {
  id: string;
  label: string;
  description: string;
  state: NodeState;
  count: number;
  lastSeen: string | null;
};

const initialNodes: StatusNode[] = [
  {
    id: "scheduler",
    label: "Scheduler",
    description: "Tick, queue, and runtime planning events.",
    state: "warn",
    count: 0,
    lastSeen: null,
  },
  {
    id: "proof",
    label: "Proof",
    description: "Merkle, HKD, and signature generation events.",
    state: "warn",
    count: 0,
    lastSeen: null,
  },
  {
    id: "radio",
    label: "Radio",
    description: "Broadcast, playout, and now-playing events.",
    state: "warn",
    count: 0,
    lastSeen: null,
  },
];

function inferNodeId(event: RuntimeEvent) {
  if (event.type.startsWith("scheduler.")) return "scheduler";
  if (event.type.startsWith("proof.")) return "proof";
  if (event.type.startsWith("radio.")) return "radio";
  return "scheduler";
}

function normalizeState(value: unknown): RuntimeEvent["state"] {
  return value === "warn" || value === "critical" ? value : "ok";
}

function badge(state: NodeState) {
  if (state === "ok") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (state === "warn") return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
  return "bg-rose-500/10 text-rose-300 border-rose-500/20";
}

function glow(state: NodeState) {
  if (state === "ok") return "shadow-[0_0_24px_rgba(16,185,129,0.18)]";
  if (state === "warn") return "shadow-[0_0_24px_rgba(250,204,21,0.12)]";
  return "shadow-[0_0_24px_rgba(244,63,94,0.18)]";
}

export default function StatusPage() {
  const [nodes, setNodes] = useState<StatusNode[]>(initialNodes);
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const disconnect = connectEvents((raw) => {
      setConnected(true);

      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const event: RuntimeEvent = {
          id: parsed.id ?? crypto.randomUUID(),
          time: parsed.time ?? new Date().toLocaleTimeString(),
          type: parsed.type ?? "runtime.event",
          state: normalizeState(parsed.state),
        };

      const nodeId = inferNodeId(event);

      setEvents((current) => [event, ...current].slice(0, 30));
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            state: event.state,
            count: node.count + 1,
            lastSeen: event.time,
          };
        })
      );
    });

    return () => {
      setConnected(false);
      disconnect();
    };
  }, []);

  const totals = useMemo(() => {
    return {
      totalEvents: events.length,
      ok: nodes.filter((n) => n.state === "ok").length,
      warn: nodes.filter((n) => n.state === "warn").length,
      critical: nodes.filter((n) => n.state === "critical").length,
    };
  }, [events, nodes]);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-yellow-400/70">Maataa</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Status Matrix</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Live runtime visualization powered by the Spine SSE feed. Scheduler, proof, and radio states update in real time as events arrive.
            </p>
          </div>
          <div className={`inline-flex rounded-full border px-4 py-2 text-sm ${connected ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"}`}>
            {connected ? "SSE Connected" : "Waiting for stream"}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/50">Recent Events</div>
            <div className="mt-2 text-3xl font-semibold text-white">{totals.totalEvents}</div>
          </div>
          <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5">
            <div className="text-sm text-emerald-300/80">Healthy Nodes</div>
            <div className="mt-2 text-3xl font-semibold text-white">{totals.ok}</div>
          </div>
          <div className="rounded-3xl border border-yellow-500/10 bg-yellow-500/5 p-5">
            <div className="text-sm text-yellow-300/80">Warning Nodes</div>
            <div className="mt-2 text-3xl font-semibold text-white">{totals.warn}</div>
          </div>
          <div className="rounded-3xl border border-rose-500/10 bg-rose-500/5 p-5">
            <div className="text-sm text-rose-300/80">Error Nodes</div>
            <div className="mt-2 text-3xl font-semibold text-white">{totals.critical}</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white">System Nodes</div>
                <div className="text-sm text-white/50">Runtime domains fed from live SSE events.</div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`rounded-3xl border p-5 transition ${badge(node.state)} ${glow(node.state)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base font-semibold text-white">{node.label}</div>
                    <div className={`rounded-full border px-3 py-1 text-xs ${badge(node.state)}`}>
                      {node.state.toUpperCase()}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white/60">{node.description}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-black/30 p-3">
                      <div className="text-white/45">Events</div>
                      <div className="mt-1 text-xl font-semibold text-white">{node.count}</div>
                    </div>
                    <div className="rounded-2xl bg-black/30 p-3">
                      <div className="text-white/45">Last Seen</div>
                      <div className="mt-1 text-sm font-medium text-white">{node.lastSeen ?? "—"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4">
              <div className="text-lg font-semibold text-white">Live Event Feed</div>
              <div className="text-sm text-white/50">Most recent events from the Spine stream.</div>
            </div>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/55">
                  Waiting for incoming runtime events...
                </div>
              ) : (
                events.map((event, index) => (
                  <div
                    key={`${event.id}-${event.time}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-white">{event.type}</div>
                      <div className="text-xs text-white/45">{event.time}</div>
                    </div>
                    <div className={`rounded-full border px-3 py-1 text-xs ${badge(event.state)}`}>
                      {event.state}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <RuntimeEventsViewer />
      </div>
    </div>
  );
}
