"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { buildMerkleLeaves, buildMerkleRoot, sha256 } from "@/lib/proof-client";

type TimelineEvent = {
  id: string;
  type: string;
  source?: string;
  time: string;
};

type LayerNode = {
  hash: string;
  fromLeafRange: [number, number];
};

function buildLayerObjects(leaves: string[]) {
  if (leaves.length === 0) {
    return [[{ hash: sha256(""), fromLeafRange: [0, 0] as [number, number] }]];
  }

  let current: LayerNode[] = leaves.map((hash, index) => ({
    hash,
    fromLeafRange: [index, index]
  }));

  const layers: LayerNode[][] = [current];

  while (current.length > 1) {
    const next: LayerNode[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] ?? current[i];
      next.push({
        hash: sha256(`${left.hash}:${right.hash}`),
        fromLeafRange: [left.fromLeafRange[0], right.fromLeafRange[1]]
      });
    }
    layers.push(next);
    current = next;
  }

  return layers;
}

function isInPath(range: [number, number], selectedIndex: number | null) {
  if (selectedIndex === null) return false;
  return selectedIndex >= range[0] && selectedIndex <= range[1];
}

export default function MerklePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeLayer, setActiveLayer] = useState<number>(-1);

  useEffect(() => {
    fetch("/api/runtime/timeline")
      .then((r) => r.json())
      .then((data) => setEvents(data.timeline ?? []));
  }, []);

  const leaves = useMemo(() => buildMerkleLeaves(events as Array<Record<string, unknown>>), [events]);
  const layers = useMemo(() => buildLayerObjects(leaves), [leaves]);
  const root = useMemo(() => buildMerkleRoot(leaves), [leaves]);

  useEffect(() => {
    if (selectedIndex === null) {
      setActiveLayer(-1);
      return;
    }

    setActiveLayer(0);
    let currentLayer = 0;
    const interval = setInterval(() => {
      currentLayer += 1;
      setActiveLayer(currentLayer);
      if (currentLayer >= layers.length - 1) {
        clearInterval(interval);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [selectedIndex, layers.length]);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-300">Step-by-Step Merkle Traversal</h1>
          <p className="mt-2 text-white/60">Select an event leaf to animate proof traversal from leaf to root, one layer at a time.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Merkle Root</div>
          <div className="mt-2 break-all font-mono text-sm text-white" data-testid="merkle-root">{root}</div>
          <div className="mt-3 text-xs text-yellow-300/80" data-testid="merkle-traversal-status">
            {selectedIndex !== null
              ? `Traversing leaf #${selectedIndex} • current layer ${Math.max(activeLayer, 0)} / ${Math.max(layers.length - 1, 0)}`
              : "Select a leaf below to begin traversal."}
          </div>
        </div>

        <div className="space-y-5">
          {layers.map((layer, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-sm font-semibold text-yellow-300">Layer {idx} • {layer.length} node(s)</div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {layer.map((node, nodeIdx) => {
                  const inPath = isInPath(node.fromLeafRange, selectedIndex);
                  const highlighted = inPath && idx <= activeLayer;
                  const future = inPath && idx > activeLayer;

                  return (
                    <motion.div
                      key={`${idx}-${nodeIdx}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: highlighted ? 1.05 : future ? 1.01 : 1,
                        boxShadow: highlighted
                          ? "0 0 0 1px rgba(250,204,21,0.4), 0 0 28px rgba(250,204,21,0.22)"
                          : future
                            ? "0 0 0 1px rgba(250,204,21,0.16)"
                            : "0 0 0 1px rgba(255,255,255,0.04)"
                      }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-xl p-3 ${highlighted ? "bg-yellow-400/12" : future ? "bg-yellow-400/5" : "bg-black/40"}`}
                    >
                      <div className="text-xs text-white/40">Node {nodeIdx}</div>
                      <div className="mt-1 break-all font-mono text-xs text-white/85">{node.hash}</div>
                      <div className="mt-2 text-[11px] text-yellow-300/80">
                        Leaves {node.fromLeafRange[0]} → {node.fromLeafRange[1]}
                      </div>
                      {highlighted ? <div className="mt-2 text-[11px] text-emerald-300">Active step</div> : null}
                      {future ? <div className="mt-2 text-[11px] text-yellow-300/70">Upcoming step</div> : null}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-lg font-semibold text-white">Event Leaves</div>
          <div className="space-y-2">
            {events.map((event, index) => {
              const active = selectedIndex === index;
              return (
                <button
                  key={event.id}
                  data-testid={`event-leaf-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className={`block w-full rounded-xl border p-3 text-left transition ${active ? "border-yellow-400/50 bg-yellow-400/10" : "border-white/10 bg-black/40 hover:border-yellow-400/40 hover:bg-black/50"}`}
                >
                  <div className="text-sm font-medium text-white">{event.type}</div>
                  <div className="text-xs text-white/50">{event.time} • {event.source ?? "unknown"}</div>
                  <div className="mt-1 font-mono text-xs text-yellow-300/80">{leaves[index]}</div>
                  <div className="mt-2 text-[11px] text-white/45">Click to start step-by-step proof traversal</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
