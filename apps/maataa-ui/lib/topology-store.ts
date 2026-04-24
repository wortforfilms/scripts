"use client";
import { create } from "zustand";
import type { ServiceNode } from "@/lib/types";

type TopologyState = {
  nodes: ServiceNode[];
  selected: string;
  setSelected: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
};

export const useTopologyStore = create<TopologyState>()((set) => ({
  nodes: [
    { id: "api", x: 20, y: 20, label: "API", color: "bg-green-400" },
    { id: "scheduler", x: 50, y: 15, label: "Scheduler", color: "bg-yellow-400" }
  ],
  selected: "api",
  setSelected: (id: string) => set({ selected: id }),
  moveNode: (id: string, x: number, y: number) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === id ? { ...node, x, y } : node))
    }))
}));
