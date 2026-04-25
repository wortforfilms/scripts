"use client";

import { usePathname } from "next/navigation";
import { Joyride } from "./Joyride";
import { getJoyridePreset } from "./joyride-presets";

export function GlobalJoyride() {
  const pathname = usePathname();
  if (pathname.startsWith("/accessibility")) return null;
  return <Joyride preset={getJoyridePreset(pathname)} />;
}
