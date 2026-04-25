import { assertValidScripts, type ScriptRecord } from "./script.schema";

const suspectSourcePatterns = [/generated/i, /ai[- ]?generated/i, /placeholder/i, /unknown/i, /tbd/i];

export type DatasetQaResult = {
  ok: boolean;
  errors: string[];
};

export function runDatasetQa(scripts: ScriptRecord[]): DatasetQaResult {
  const errors: string[] = [];
  try {
    assertValidScripts(scripts);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Script schema validation failed");
  }

  for (const script of scripts) {
    if (!script.systemType) errors.push(`${script.id}: systemType is required`);
    if (script.unicodeSupported && script.unicodeRanges.length === 0) {
      errors.push(`${script.id}: unicodeRanges are required when unicodeSupported is true`);
    }
    if (!script.verificationStatus) errors.push(`${script.id}: verificationStatus is required`);
    if (script.sources.some((source) => suspectSourcePatterns.some((pattern) => pattern.test(source)))) {
      errors.push(`${script.id}: source list contains unverifiable/generated wording`);
    }
    if (script.verificationStatus === "VERIFIED" && !script.sources.some((source) => /unicode|catalog|standard|epigraph|manuscript/i.test(source))) {
      errors.push(`${script.id}: VERIFIED records require a concrete authority source`);
    }
    if (script.verificationStatus !== "VERIFIED") {
      if (!script.fallbackGlyphAsset.includes("verification-required")) {
        errors.push(`${script.id}: unverified/partial glyphs require verification-required fallback asset`);
      }
      if (script.verifiedUnicodeSample) {
        errors.push(`${script.id}: unverified/partial glyphs must not expose Unicode samples`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function assertDatasetQa(scripts: ScriptRecord[]) {
  const result = runDatasetQa(scripts);
  if (!result.ok) throw new Error(`Dataset QA failed:\n${result.errors.join("\n")}`);
  return result;
}
