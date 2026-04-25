export type ScriptDirection = "LTR" | "RTL" | "TTB" | "BTT" | "MIXED";

export type VerificationStatus = "UNVERIFIED" | "PARTIAL" | "VERIFIED";

export type ScriptSystemType = "UNICODE_SCRIPT" | "SPECIAL" | "MANUSCRIPT_CHAIN" | "TRANSMISSION";

export type UnicodeRange = {
  start: string;
  end: string;
};

export type ScriptRecord = {
  id: string;
  slug: string;
  name: string;
  nativeName: string;
  verifiedUnicodeSample: string | null;
  fallbackGlyphAsset: string;
  family: string;
  parentId: string | null;
  region: string | null;
  eraStart: number | null;
  eraEnd: number | null;
  direction: ScriptDirection;
  systemType: ScriptSystemType;
  unicodeSupported: boolean;
  unicodeRanges: UnicodeRange[];
  verificationStatus: VerificationStatus;
  sources: string[];
};

const directions = new Set<ScriptDirection>(["LTR", "RTL", "TTB", "BTT", "MIXED"]);
const statuses = new Set<VerificationStatus>(["UNVERIFIED", "PARTIAL", "VERIFIED"]);
const systemTypes = new Set<ScriptSystemType>(["UNICODE_SCRIPT", "SPECIAL", "MANUSCRIPT_CHAIN", "TRANSMISSION"]);

export function validateScriptRecord(script: ScriptRecord): string[] {
  const errors: string[] = [];
  if (!script.id.trim()) errors.push("id is required");
  if (!/^[a-z0-9-]+$/.test(script.slug)) errors.push(`${script.id}: slug must be kebab-case`);
  if (!script.name.trim()) errors.push(`${script.id}: name is required`);
  if (!script.nativeName.trim()) errors.push(`${script.id}: nativeName is required`);
  if (!script.fallbackGlyphAsset.trim()) errors.push(`${script.id}: fallbackGlyphAsset is required`);
  if (!script.family.trim()) errors.push(`${script.id}: family is required`);
  if (script.region !== null && !script.region.trim()) errors.push(`${script.id}: region must be non-empty when provided`);
  if (!directions.has(script.direction)) errors.push(`${script.id}: invalid direction`);
  if (!systemTypes.has(script.systemType)) errors.push(`${script.id}: invalid systemType`);
  if (script.unicodeSupported && script.unicodeRanges.length === 0) {
    errors.push(`${script.id}: unicodeRanges are required when unicodeSupported is true`);
  }
  for (const range of script.unicodeRanges) {
    if (!/^U\+[0-9A-F]{4,6}$/.test(range.start) || !/^U\+[0-9A-F]{4,6}$/.test(range.end)) {
      errors.push(`${script.id}: invalid unicodeRange ${range.start}-${range.end}`);
    }
  }
  if (!statuses.has(script.verificationStatus)) errors.push(`${script.id}: invalid verificationStatus`);
  if (script.verificationStatus === "VERIFIED" && !script.verifiedUnicodeSample?.trim()) {
    errors.push(`${script.id}: VERIFIED scripts require verifiedUnicodeSample`);
  }
  if (script.verificationStatus !== "VERIFIED" && script.verifiedUnicodeSample) {
    errors.push(`${script.id}: non-VERIFIED scripts must not expose Unicode samples`);
  }
  if (script.sources.length === 0) errors.push(`${script.id}: at least one source is required`);
  return errors;
}

export function assertValidScripts(scripts: ScriptRecord[]) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const errors: string[] = [];

  for (const script of scripts) {
    if (ids.has(script.id)) errors.push(`${script.id}: duplicate id`);
    ids.add(script.id);
    if (slugs.has(script.slug)) errors.push(`${script.slug}: duplicate slug`);
    slugs.add(script.slug);
    errors.push(...validateScriptRecord(script));
  }

  for (const script of scripts) {
    if (script.parentId && !ids.has(script.parentId)) {
      errors.push(`${script.id}: parentId ${script.parentId} does not exist`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Script seed validation failed:\n${errors.join("\n")}`);
  }
}
