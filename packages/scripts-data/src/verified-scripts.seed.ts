import { assertValidScripts, type ScriptRecord } from "./script.schema";
import { kharosthiChain } from "./kharosthi-chain";
import { phase1UnicodeDatasetMeta, phase1UnicodeScriptsSeed } from "./phase1-unicode-scripts";

const curatedScripts: ScriptRecord[] = [
  {
    id: "latin",
    slug: "latin",
    name: "Latin",
    nativeName: "Latin",
    verifiedUnicodeSample: "Scriptorium",
    fallbackGlyphAsset: "/glyphs/latin.svg",
    family: "Italic",
    parentId: null,
    region: "Europe and global",
    eraStart: -700,
    eraEnd: null,
    direction: "LTR",
    verificationStatus: "VERIFIED",
    sources: ["Unicode Standard, Basic Latin U+0000-U+007F"]
  },
  {
    id: "devanagari",
    slug: "devanagari",
    name: "Devanagari",
    nativeName: "देवनागरी",
    verifiedUnicodeSample: "देवनागरी",
    fallbackGlyphAsset: "/glyphs/devanagari.svg",
    family: "Brahmic",
    parentId: null,
    region: "South Asia",
    eraStart: 700,
    eraEnd: null,
    direction: "LTR",
    verificationStatus: "VERIFIED",
    sources: ["Unicode Standard, Devanagari block U+0900-U+097F"]
  },
  {
    id: "tamil",
    slug: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    verifiedUnicodeSample: "தமிழ்",
    fallbackGlyphAsset: "/glyphs/tamil.svg",
    family: "Brahmic",
    parentId: null,
    region: "South India and Sri Lanka",
    eraStart: -300,
    eraEnd: null,
    direction: "LTR",
    verificationStatus: "VERIFIED",
    sources: ["Unicode Standard, Tamil block U+0B80-U+0BFF"]
  },
  {
    id: "hebrew",
    slug: "hebrew",
    name: "Hebrew",
    nativeName: "עברית",
    verifiedUnicodeSample: "עברית",
    fallbackGlyphAsset: "/glyphs/hebrew.svg",
    family: "Northwest Semitic",
    parentId: null,
    region: "Levant and global",
    eraStart: -1000,
    eraEnd: null,
    direction: "RTL",
    verificationStatus: "VERIFIED",
    sources: ["Unicode Standard, Hebrew block U+0590-U+05FF"]
  },
  ...kharosthiChain
];

const curatedById = new Map(curatedScripts.map((script) => [script.id, script]));

export const verifiedScriptsSeed: ScriptRecord[] = [
  ...phase1UnicodeScriptsSeed.map((script) => curatedById.get(script.id) ?? script),
  ...curatedScripts.filter((script) => !phase1UnicodeScriptsSeed.some((phaseScript) => phaseScript.id === script.id))
];

assertValidScripts(verifiedScriptsSeed);

export const SCRIPT_DATASET_TARGET_COUNT = 426;

export function scriptDatasetStatus() {
  return {
    target: SCRIPT_DATASET_TARGET_COUNT,
    current: verifiedScriptsSeed.length,
    phase1Current: phase1UnicodeDatasetMeta.count,
    phase1Status: phase1UnicodeDatasetMeta.status,
    complete: verifiedScriptsSeed.length >= SCRIPT_DATASET_TARGET_COUNT,
    note: "Phase 1 uses Unicode Script property values plus curated verified overlays. Missing scripts remain excluded until source verification."
  };
}
