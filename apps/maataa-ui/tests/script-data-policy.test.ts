import { describe, expect, it } from "vitest";
import { kharosthiChain, verifiedScriptsSeed } from "../lib/script-data";
import { scriptFontMap } from "../lib/script-font-map";
import { runDatasetQa } from "../../../packages/scripts-data/src/qa";

describe("script data and glyph policy coverage", () => {
  it("does not expose verified Unicode samples for partial or unverified records", () => {
    const nonVerified = verifiedScriptsSeed.filter((script) => script.verificationStatus !== "VERIFIED");
    expect(nonVerified.length).toBeGreaterThan(0);
    for (const script of nonVerified) {
      expect(script.verifiedUnicodeSample).toBeNull();
      expect(script.fallbackGlyphAsset).toContain("verification-required");
    }
  });

  it("requires verified records to have source-backed Unicode samples and font mappings", () => {
    const verified = verifiedScriptsSeed.filter((script) => script.verificationStatus === "VERIFIED");
    expect(verified.length).toBeGreaterThan(0);
    for (const script of verified) {
      expect(script.verifiedUnicodeSample).toEqual(expect.any(String));
      expect(script.sources.length).toBeGreaterThan(0);
      expect(scriptFontMap[script.slug]).toEqual(expect.any(String));
    }
  });

  it("keeps Unicode-supported records mapped to concrete ranges", () => {
    const supported = verifiedScriptsSeed.filter((script) => script.unicodeSupported);
    expect(supported.length).toBeGreaterThan(0);
    for (const script of supported) {
      expect(["UNICODE_SCRIPT", "SPECIAL"]).toContain(script.systemType);
      expect(script.unicodeRanges.length).toBeGreaterThan(0);
      expect(script.unicodeRanges[0]).toEqual({ start: expect.any(String), end: expect.any(String) });
    }
  });

  it("rejects verified claims without concrete authority sources", () => {
    const result = runDatasetQa([
      {
        ...verifiedScriptsSeed.find((script) => script.verificationStatus === "VERIFIED")!,
        id: "verified-without-authority",
        slug: "verified-without-authority",
        sources: ["Community note"]
      }
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("VERIFIED records require a concrete authority source");
  });

  it("preserves the Kharosthi transmission chain with partial uncertainty", () => {
    expect(kharosthiChain.map((node) => node.slug)).toEqual([
      "aramaic",
      "kharosthi",
      "gandhari-manuscripts",
      "central-asian-buddhist-transmission"
    ]);
    expect(kharosthiChain.some((node) => node.verificationStatus === "PARTIAL")).toBe(true);
  });
});
