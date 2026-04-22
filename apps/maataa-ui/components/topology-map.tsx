"use client";

import { useState } from "react";
import { useTopologyStore } from "@/lib/topology-store";

function clamp(v: number) {
  return Math.max(8, Math.min(92, v));
}

export function TopologyMap() {
  const { nodes, selected, setSelected, moveNode } = useTopologyStore();
  const [drag, setDrag] = useState<string | null>(null);

  return (
    <div
      className="relative h-[320px] rounded-3xl border border-yellow-500/10 bg-black/30"
      onMouseMove={(e) => {
        if (!drag) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = clamp(((e.clientX - rect.left) / rect.width) * 100);
        const y = clamp(((e.clientY - rect.top) / rect.height) * 100);
        moveNode(drag, x, y);
      }}
      onMouseUp={() => setDrag(null)}
      onMouseLeave={() => setDrag(null)}
    >
      {nodes.map((n: any) => (
        <button
          key={n.id}
          onMouseDown={() => setDrag(n.id)}
          onClick={() => setSelected(n.id)}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <div className={`h-12 w-12 flex items-center justify-center rounded-full text-black font-semibold ${n.color} ${selected === n.id ? "ring-2 ring-yellow-400" : ""}`}>
            {n.label}
          </div>
        </button>
      ))}
    </div>
  );
}
