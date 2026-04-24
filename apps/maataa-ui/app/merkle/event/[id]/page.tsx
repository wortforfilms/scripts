"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { buildMerkleLeaves, sha256 } from "@/lib/proof-client";

type TimelineEvent = {
  id: string;
  type: string;
  source?: string;
  time: string;
};

function buildProofPath(leaves: string[], index: number) {
  const path: Array<{ sibling: string; position: "left" | "right" }> = [];
  let idx = index;
  let layer = [...leaves];

  while (layer.length > 1) {
    const next: string[] = [];

    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] ?? left;

      if (i === idx || i + 1 === idx) {
        const isLeft = idx === i;
        const sibling = isLeft ? right : left;
        path.push({ sibling, position: isLeft ? "right" : "left" });
        idx = Math.floor(i / 2);
      }

      next.push(sha256(`${left}:${right}`));
    }

    layer = next;
  }

  return path;
}

export default function MerkleEventPage() {
  const params = useParams();
  const search = useSearchParams();
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const id = params?.id as string;
  const index = Number(search.get("index") ?? 0);

  useEffect(() => {
    fetch("/api/runtime/timeline")
      .then((r) => r.json())
      .then((data) => setEvents(data.timeline ?? []));
  }, []);

  const leaves = useMemo(() => buildMerkleLeaves(events as Array<Record<string, unknown>>), [events]);
  const leaf = leaves[index];
  const path = useMemo(() => buildProofPath(leaves, index), [leaves, index]);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-300">Merkle Proof Path</h1>
          <p className="mt-2 text-white/60">Proof path for event {id}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Leaf Hash</div>
          <div className="mt-2 break-all font-mono text-sm text-white">{leaf}</div>
        </div>

        <div className="space-y-3">
          {path.map((step, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-xs text-white/50">Step {i + 1}</div>
              <div className="text-xs text-yellow-300">Sibling ({step.position})</div>
              <div className="mt-1 break-all font-mono text-xs text-white">{step.sibling}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
