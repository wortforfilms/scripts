import phase1UnicodeDataset from "./data/phase1-unicode-script-dataset.json";
import { assertValidScripts, type ScriptDirection, type ScriptRecord, type VerificationStatus } from "./script.schema";

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
  verificationStatus: entry.verificationStatus,
  sources: entry.sources
}));

assertValidScripts(phase1UnicodeScriptsSeed);
