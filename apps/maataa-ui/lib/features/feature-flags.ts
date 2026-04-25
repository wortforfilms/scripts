import type { FeatureKey, UserPlan, UserRole } from "../access/types";
import { CURRENT_PHASE, isPhaseEnabled, type ReleasePhase } from "./phase-config";
import { toolRegistry } from "../tools/tool-registry";

export type FeatureFlag = {
  key: FeatureKey;
  phase: ReleasePhase;
  enabled: boolean;
  roles?: UserRole[];
  plans?: UserPlan[];
};

const publicFeatureKeys: FeatureKey[] = [
  "home",
  "signin",
  "upgrade",
  "scriptCatalog",
  "scriptDetail",
  "verifiedGlyphs",
  "proofVerifier",
  "badgeViewer",
  "legal",
  "publicApi",
  "paymentsWebhook"
];

const userFeatureKeys: FeatureKey[] = ["dashboard", "scriptTree", "unicodeVisualizer", "glyphInspector", "glyphQa", "datasetQa"];

const premiumFeatureKeys: FeatureKey[] = [
  "learningTimeline",
  "proofInspector",
  "merkleExplorer",
  "replay",
  "anchor",
  "radio",
  "radioLive",
  "aiRjKnowledge",
  "marketplace",
  "checkout",
  "productDetail",
  "userAccess",
  "ipaMesh",
  "phoneticsLab",
  "transliterationLab",
  "dhwaniGranth",
  "granthReader",
  "maataaAi",
  "ocrWorkbench",
  "audioArchive"
];

const researcherFeatureKeys: FeatureKey[] = ["runtimeTimeline", "runtimeStatus", "spineEvents", "fontQa"];

const reviewerFeatureKeys: FeatureKey[] = [
  "adminCatalog",
  "adminSkuReview",
  "adminScriptVerification",
  "adminDatasetQa",
  "adminGlyphQa",
  "adminUnicode",
  "adminUnicodeHeatmap"
];

const adminFeatureKeys: FeatureKey[] = [
  "adminOrders",
  "adminSpine",
  "adminFeatures",
  "adminSkuGenerate",
  "adminSkuSubmitReview",
  "adminSkuApprove",
  "adminSkuPublish",
  "adminSkuArchive",
  "adminFinance",
  "adminPartnerships"
];

const toolPhaseByFeature = new Map<FeatureKey, ReleasePhase>(toolRegistry.map((tool) => [tool.featureKey, tool.phase]));

function phaseFor(featureKey: FeatureKey): ReleasePhase {
  return toolPhaseByFeature.get(featureKey) ?? "MVP";
}

function flagFor(featureKey: FeatureKey): FeatureFlag {
  const phase = phaseFor(featureKey);
  const enabled = phase === "MVP";
  if (publicFeatureKeys.includes(featureKey)) return { key: featureKey, phase, enabled };
  if (userFeatureKeys.includes(featureKey)) return { key: featureKey, phase, enabled, roles: ["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"], plans: ["FREE", "PREMIUM", "RESEARCHER", "ENTERPRISE"] };
  if (premiumFeatureKeys.includes(featureKey)) return { key: featureKey, phase, enabled, roles: ["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"], plans: ["PREMIUM", "RESEARCHER", "ENTERPRISE"] };
  if (researcherFeatureKeys.includes(featureKey)) return { key: featureKey, phase, enabled, roles: ["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"], plans: ["RESEARCHER", "ENTERPRISE"] };
  if (reviewerFeatureKeys.includes(featureKey)) return { key: featureKey, phase, enabled, roles: ["REVIEWER", "ADMIN", "SUPER_ADMIN"], plans: ["FREE", "PREMIUM", "RESEARCHER", "ENTERPRISE"] };
  if (adminFeatureKeys.includes(featureKey)) return { key: featureKey, phase, enabled, roles: ["ADMIN", "SUPER_ADMIN"], plans: ["FREE", "PREMIUM", "RESEARCHER", "ENTERPRISE"] };
  return { key: featureKey, phase, enabled: false };
}

const featureKeys: FeatureKey[] = [
  ...publicFeatureKeys,
  ...userFeatureKeys,
  ...premiumFeatureKeys,
  ...researcherFeatureKeys,
  ...reviewerFeatureKeys,
  ...adminFeatureKeys
];

export const featureFlags: Record<FeatureKey, FeatureFlag> = Object.fromEntries(
  [...new Set(featureKeys)].map((featureKey) => [featureKey, flagFor(featureKey)])
) as Record<FeatureKey, FeatureFlag>;

export function isFeatureFlagEnabled(featureKey: FeatureKey) {
  const flag = featureFlags[featureKey];
  if (!flag) return false;
  return flag.enabled || isPhaseEnabled(flag.phase, CURRENT_PHASE);
}

export function featureFlagList() {
  return Object.values(featureFlags).sort((a, b) => a.key.localeCompare(b.key));
}
