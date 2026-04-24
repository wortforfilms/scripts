import React from "react";
import { fontForScript } from "../../lib/script-font-map";
import type { ScriptRecord } from "../../lib/script-data";

type VerifiedGlyphProps = {
  script: ScriptRecord;
  className?: string;
};

export function VerifiedGlyph({ script, className }: VerifiedGlyphProps) {
  const canRenderVerifiedText = script.verificationStatus === "VERIFIED" && Boolean(script.verifiedUnicodeSample);

  if (canRenderVerifiedText) {
    return (
      <span
        className={className}
        dir={script.direction === "RTL" ? "rtl" : "ltr"}
        lang="und"
        style={{ fontFamily: fontForScript(script) }}
      >
        {script.verifiedUnicodeSample}
      </span>
    );
  }

  return (
    <span className={className} aria-label={`${script.name} glyph pending verification`}>
      <img
        alt={`${script.name} glyph verification required`}
        src={script.fallbackGlyphAsset}
        style={{ display: "inline-block", height: "1.25em", width: "auto", verticalAlign: "-0.15em" }}
      />
      <span className="ml-2 rounded border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-100">
        glyph pending verification
      </span>
    </span>
  );
}
