import { existsSync } from "fs";
import { join } from "path";
import { scriptFontMap } from "./script-font-map";
import { verifiedScriptsSeed } from "./script-data";

export type GlyphQaResult = {
  ok: boolean;
  errors: string[];
};

export function runGlyphQa(publicDir = join(process.cwd(), "public")): GlyphQaResult {
  const errors: string[] = [];

  for (const script of verifiedScriptsSeed) {
    if (script.verificationStatus === "VERIFIED") {
      if (!script.verifiedUnicodeSample) errors.push(`${script.id}: public verified script has no Unicode sample`);
      if (!scriptFontMap[script.slug]) errors.push(`${script.id}: public verified script has no Noto font mapping`);
      continue;
    }

    if (!script.fallbackGlyphAsset.includes("verification-required")) {
      errors.push(`${script.id}: unverified glyph fallback must be marked verification-required`);
    }
    const assetPath = join(publicDir, script.fallbackGlyphAsset.replace(/^\//, ""));
    if (!existsSync(assetPath)) errors.push(`${script.id}: fallback glyph asset missing at ${script.fallbackGlyphAsset}`);
  }

  return { ok: errors.length === 0, errors };
}

export function assertGlyphQa(publicDir?: string) {
  const result = runGlyphQa(publicDir);
  if (!result.ok) throw new Error(`Glyph QA failed:\n${result.errors.join("\n")}`);
  return result;
}
