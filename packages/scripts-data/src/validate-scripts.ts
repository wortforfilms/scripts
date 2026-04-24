import { assertValidScripts } from "./script.schema";
import { scriptDatasetStatus, verifiedScriptsSeed } from "./verified-scripts.seed";

export function validateScriptsSeed() {
  assertValidScripts(verifiedScriptsSeed);
  return {
    ok: true,
    dataset: scriptDatasetStatus(),
    scripts: verifiedScriptsSeed.map((script) => ({
      id: script.id,
      slug: script.slug,
      verificationStatus: script.verificationStatus
    }))
  };
}
