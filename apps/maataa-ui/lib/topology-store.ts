"use client";
import { create } from "zustand";

export const useTopologyStore = create((set) => ({
  nodes: [
    { id: "api", x: 20, y: 20, label: "API", color: "bg-green-400" },
    { id: "scheduler", x: 50, y: 15, label: "Scheduler", color: "bg-yellow-400" }
  ],
  selected: "api",
  setSelected: (id: string) => set({ selected: id }),
  moveNode: (id: string, x: number, y: number) =>
    set((state: any) => ({
      nodes: state.nodes.map((n: any) => n.id === id ? { ...n, x, y } : n)
    }))
}));
