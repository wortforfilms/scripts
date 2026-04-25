"use client";

import { Joyride } from "../joyride/Joyride";
import { accessibilityPreset } from "../joyride/joyride-presets";

export function AccessibilityJoyride() {
  return (
    <Joyride
      autoStart
      launcherLabel="Start accessibility joyride"
      preset={accessibilityPreset}
      storageKey="maataa-accessibility-joyride-dismissed"
    />
  );
}
