export type SemanticState = "ok" | "warn" | "error" | "info" | "neutral";
export type VaastuZone = "north" | "south" | "east" | "west" | "center";

export function stateTone(state: SemanticState) {
  switch (state) {
    case "ok":
      return {
        badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        panel: "border-emerald-500/10 bg-emerald-500/5",
        glow: "shadow-[0_0_24px_rgba(16,185,129,0.18)]"
      };
    case "warn":
      return {
        badge: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
        panel: "border-yellow-500/10 bg-yellow-500/5",
        glow: "shadow-[0_0_24px_rgba(250,204,21,0.12)]"
      };
    case "error":
      return {
        badge: "border-rose-500/20 bg-rose-500/10 text-rose-300",
        panel: "border-rose-500/10 bg-rose-500/5",
        glow: "shadow-[0_0_24px_rgba(244,63,94,0.18)]"
      };
    case "info":
      return {
        badge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
        panel: "border-cyan-500/10 bg-cyan-500/5",
        glow: "shadow-[0_0_24px_rgba(34,211,238,0.12)]"
      };
    default:
      return {
        badge: "border-white/10 bg-white/5 text-white/70",
        panel: "border-white/10 bg-white/5",
        glow: "shadow-none"
      };
  }
}

export function zoneTone(zone: VaastuZone) {
  switch (zone) {
    case "north":
      return {
        accent: "text-emerald-300",
        ring: "ring-emerald-500/20"
      };
    case "south":
      return {
        accent: "text-rose-300",
        ring: "ring-rose-500/20"
      };
    case "east":
      return {
        accent: "text-cyan-300",
        ring: "ring-cyan-500/20"
      };
    case "west":
      return {
        accent: "text-yellow-300",
        ring: "ring-yellow-500/20"
      };
    default:
      return {
        accent: "text-white",
        ring: "ring-white/10"
      };
  }
}
