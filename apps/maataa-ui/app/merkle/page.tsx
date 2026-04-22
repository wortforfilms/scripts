"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMerkleLeaves, buildMerkleRoot, sha256 } from "@/lib/proof";

type TimelineEvent = {
  id: string;
  type: string;
  source?: string;
  time: string;
};

function buildLayers(leaves: string[]) {
  if (leaves.length === 0) return [[sha256("")]];
  const layers: string[][] = [leaves];
  let current = [...leaves];
  while (current.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] ?? left;
      next.push(sha256(`${left}:${right}`));
    }
    layers.push(next);
    current = next;
  }
  return layers;
}

export default function MerklePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetch("/api/runtime/timeline")
      .then((r) => r.json())
      .then((data) => setEvents(data.timeline ?? []));
  }, []);

  const leaves = useMemo(() => buildMerkleLeaves(events as Array<Record<string, unknown>>), [events]);
  const layers = useMemo(() => buildLayers(leaves), [leaves]);
  const root = useMemo(() => buildMerkleRoot(leaves), [leaves]);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-300">Merkle Tree Visualizer</h1>
          <p className="mt-2 text-white/60">Visual view of timeline events compressed into a Merkle root.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Merkle Root</div>
          <div className="mt-2 break-all font-mono text-sm text-white">{root}</div>
        </div>

        <div className="space-y-5">
          {layers.map((layer, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-sm font-semibold text-yellow-300">Layer {idx} • {layer.length} node(s)</div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {layer.map((node, nodeIdx) => (
                  <div key={`${idx}-${nodeIdx}`} className="rounded-xl bg-black/40 p-3">
                    <div className="text-xs text-white/40">Node {nodeIdx}</div>
                    <div className="mt-1 break-all font-mono text-xs text-white/85">{node}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-lg font-semibold text-white">Event Leaves</div>
          <div className="space-y-2">
            {events.map((event, index) => (
              <a
                key={event.id}
                href={`/merkle/event/${event.id}?index=${index}`}
                className="block rounded-xl border border-white/10 bg-black/40 p-3 hover:border-yellow-400/40 hover:bg-black/50"
              >
                <div className="text-sm font-medium text-white">{event.type}</div>
                <div className="text-xs text-white/50">{event.time} • {event.source ?? "unknown"}</div>
                <div className="mt-1 font-mono text-xs text-yellow-300/80">{leaves[index]}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
