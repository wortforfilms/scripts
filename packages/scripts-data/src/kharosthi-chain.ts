import type { ScriptRecord } from "./script.schema";

export const kharosthiChain: ScriptRecord[] = [
  {
    id: "aramaic",
    slug: "aramaic",
    name: "Aramaic",
    nativeName: "Aramaic",
    verifiedUnicodeSample: "𐡀𐡓𐡌𐡉𐡀",
    fallbackGlyphAsset: "/glyphs/aramaic.svg",
    family: "Northwest Semitic",
    parentId: null,
    region: "Levant and Achaemenid imperial networks",
    eraStart: -900,
    eraEnd: 700,
    direction: "RTL",
    verificationStatus: "VERIFIED",
    sources: ["Unicode Standard, Aramaic block U+10840-U+1085F"]
  },
  {
    id: "kharosthi",
    slug: "kharosthi",
    name: "Kharosthi",
    nativeName: "Kharosthi",
    verifiedUnicodeSample: null,
    fallbackGlyphAsset: "/glyphs/kharosthi-verification-required.svg",
    family: "Indic",
    parentId: "aramaic",
    region: "Gandhara and northwest South Asia",
    eraStart: -300,
    eraEnd: 400,
    direction: "RTL",
    verificationStatus: "PARTIAL",
    sources: [
      "Unicode Standard, Kharoshthi block U+10A00-U+10A5F",
      "Salomon, Indian Epigraphy, 1998"
    ]
  },
  {
    id: "gandhari-manuscripts",
    slug: "gandhari-manuscripts",
    name: "Gandhari Manuscripts",
    nativeName: "Gandhari manuscripts",
    verifiedUnicodeSample: null,
    fallbackGlyphAsset: "/glyphs/gandhari-manuscripts-verification-required.svg",
    family: "Buddhist manuscript transmission",
    parentId: "kharosthi",
    region: "Gandhara",
    eraStart: -100,
    eraEnd: 300,
    direction: "RTL",
    verificationStatus: "PARTIAL",
    sources: ["British Library Kharosthi/Gandhari manuscript catalogues"]
  },
  {
    id: "central-asian-buddhist-transmission",
    slug: "central-asian-buddhist-transmission",
    name: "Central Asian Buddhist Transmission",
    nativeName: "Central Asian Buddhist transmission",
    verifiedUnicodeSample: null,
    fallbackGlyphAsset: "/glyphs/central-asian-buddhist-transmission-verification-required.svg",
    family: "Buddhist manuscript transmission",
    parentId: "gandhari-manuscripts",
    region: "Central Asia",
    eraStart: 100,
    eraEnd: 900,
    direction: "RTL",
    verificationStatus: "PARTIAL",
    sources: ["Scholarly secondary literature on Gandhari Buddhist transmission"]
  }
];
