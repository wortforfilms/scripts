import phase1UnicodeDataset from "./data/phase1-unicode-script-dataset.json";
import unicodeScriptsFull from "./data/unicode-scripts-full.json";
import { assertValidScripts, type ScriptDirection, type ScriptRecord, type UnicodeRange, type VerificationStatus } from "./script.schema";

type Phase1UnicodeEntry = {
  id: string;
  unicodeScriptValue: string;
  name: string;
  slug: string;
  iso15924: string | null;
  family: string;
  parentId: string | null;
  region: string | null;
  eraStart: number | null;
  eraEnd: number | null;
  direction: ScriptDirection;
  verifiedUnicodeSample: string | null;
  fallbackGlyphAsset: string;
  verificationStatus: VerificationStatus;
  sources: string[];
  notes: string;
};

type Phase1UnicodeDataset = {
  dataset: string;
  generatedAt: string;
  count: number;
  status: string;
  sourcePolicy: string;
  entries: Phase1UnicodeEntry[];
};

const dataset = phase1UnicodeDataset as Phase1UnicodeDataset;
const unicodeRangeMap = new Map(
  (unicodeScriptsFull as Array<{ name: string; unicodeRanges: Array<{ start: string; end: string }> }>).map((script) => [
    script.name.replace(/[^a-z0-9]/gi, "").toLowerCase(),
    script.unicodeRanges.map((range): UnicodeRange => ({
      start: `U+${range.start.replace(/^U\+/i, "").toUpperCase()}`,
      end: `U+${range.end.replace(/^U\+/i, "").toUpperCase()}`
    }))
  ])
);

function unicodeRangesFor(entry: Phase1UnicodeEntry) {
  return unicodeRangeMap.get(entry.unicodeScriptValue.replace(/[^a-z0-9]/gi, "").toLowerCase()) ?? [];
}

export const phase1UnicodeDatasetMeta = {
  dataset: dataset.dataset,
  generatedAt: dataset.generatedAt,
  count: dataset.count,
  status: dataset.status,
  sourcePolicy: dataset.sourcePolicy
};

export const phase1UnicodeScriptsSeed: ScriptRecord[] = dataset.entries.map((entry) => ({
  id: entry.id,
  slug: entry.slug,
  name: entry.name,
  nativeName: entry.name,
  verifiedUnicodeSample: null,
  fallbackGlyphAsset: "/glyph-placeholders/verification-required.svg",
  family: entry.family,
  parentId: entry.parentId,
  region: entry.region,
  eraStart: entry.eraStart,
  eraEnd: entry.eraEnd,
  direction: entry.direction,
  systemType: entry.id === "unknown" || entry.id === "common" || entry.id === "inherited" ? "SPECIAL" : "UNICODE_SCRIPT",
  unicodeSupported: unicodeRangesFor(entry).length > 0,
  unicodeRanges: unicodeRangesFor(entry),
  verificationStatus: entry.verificationStatus,
  sources: entry.sources
}));

assertValidScripts(phase1UnicodeScriptsSeed);
