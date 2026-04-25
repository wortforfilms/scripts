import type { FeatureKey, UserPlan, UserRole } from "./types";

type FlagEnv = Record<string, string | undefined>;

export type FeatureGateConfig = {
  key: FeatureKey;
  public: boolean;
  minimumRole?: UserRole;
  plans?: UserPlan[];
  comingSoon?: boolean;
  killSwitch?: boolean;
  releaseFlag?: string;
  permissionFlag?: string;
};

export const roleRank: Record<UserRole, number> = {
  GUEST: 0,
  USER: 1,
  REVIEWER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4
};

export const planRank: Record<UserPlan, number> = {
  FREE: 0,
  PREMIUM: 1,
  RESEARCHER: 2,
  ENTERPRISE: 3
};

const publicFeatures: FeatureKey[] = [
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

const premiumFeatures: FeatureKey[] = [
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
  "userAccess"
];

const researcherFeatures: FeatureKey[] = ["runtimeTimeline", "runtimeStatus", "spineEvents"];

const reviewerFeatures: FeatureKey[] = ["adminCatalog", "adminSkuReview", "adminScriptVerification"];

const adminFeatures: FeatureKey[] = [
  "adminOrders",
  "adminSpine",
  "adminSkuGenerate",
  "adminSkuSubmitReview",
  "adminSkuApprove",
  "adminSkuPublish",
  "adminSkuArchive"
];

function configFor(key: FeatureKey): FeatureGateConfig {
  if (publicFeatures.includes(key)) return { key, public: true };
  if (premiumFeatures.includes(key)) return { key, public: false, minimumRole: "USER", plans: ["PREMIUM", "RESEARCHER", "ENTERPRISE"] };
  if (researcherFeatures.includes(key)) return { key, public: false, minimumRole: "USER", plans: ["RESEARCHER", "ENTERPRISE"] };
  if (reviewerFeatures.includes(key)) return { key, public: false, minimumRole: "REVIEWER", permissionFlag: "catalog-review" };
  if (adminFeatures.includes(key)) return { key, public: false, minimumRole: "ADMIN", permissionFlag: "catalog-admin" };
  if (key === "dashboard") return { key, public: false, minimumRole: "USER", plans: ["FREE", "PREMIUM", "RESEARCHER", "ENTERPRISE"] };
  return { key, public: false };
}

export const featureGates: Record<FeatureKey, FeatureGateConfig> = {
  home: configFor("home"),
  signin: configFor("signin"),
  upgrade: configFor("upgrade"),
  dashboard: configFor("dashboard"),
  scriptCatalog: configFor("scriptCatalog"),
  scriptDetail: configFor("scriptDetail"),
  scriptTree: configFor("scriptTree"),
  unicodeVisualizer: configFor("unicodeVisualizer"),
  glyphInspector: configFor("glyphInspector"),
  glyphQa: configFor("glyphQa"),
  fontQa: configFor("fontQa"),
  datasetQa: configFor("datasetQa"),
  ipaMesh: configFor("ipaMesh"),
  phoneticsLab: configFor("phoneticsLab"),
  transliterationLab: configFor("transliterationLab"),
  dhwaniGranth: configFor("dhwaniGranth"),
  granthReader: configFor("granthReader"),
  audioArchive: configFor("audioArchive"),
  maataaAi: configFor("maataaAi"),
  ocrWorkbench: configFor("ocrWorkbench"),
  verifiedGlyphs: configFor("verifiedGlyphs"),
  learningTimeline: configFor("learningTimeline"),
  proofVerifier: configFor("proofVerifier"),
  proofInspector: configFor("proofInspector"),
  merkleExplorer: configFor("merkleExplorer"),
  badgeViewer: configFor("badgeViewer"),
  replay: configFor("replay"),
  anchor: configFor("anchor"),
  radio: configFor("radio"),
  radioLive: configFor("radioLive"),
  aiRjKnowledge: configFor("aiRjKnowledge"),
  marketplace: configFor("marketplace"),
  checkout: configFor("checkout"),
  productDetail: configFor("productDetail"),
  userAccess: configFor("userAccess"),
  runtimeStatus: configFor("runtimeStatus"),
  runtimeTimeline: configFor("runtimeTimeline"),
  spineEvents: configFor("spineEvents"),
  legal: configFor("legal"),
  adminCatalog: configFor("adminCatalog"),
  adminSkuReview: configFor("adminSkuReview"),
  adminScriptVerification: configFor("adminScriptVerification"),
  adminUnicode: configFor("adminUnicode"),
  adminOrders: configFor("adminOrders"),
  adminSpine: configFor("adminSpine"),
  adminFeatures: configFor("adminFeatures"),
  adminSkuGenerate: configFor("adminSkuGenerate"),
  adminSkuSubmitReview: configFor("adminSkuSubmitReview"),
  adminSkuApprove: configFor("adminSkuApprove"),
  adminSkuPublish: configFor("adminSkuPublish"),
  adminSkuArchive: configFor("adminSkuArchive"),
  paymentsWebhook: configFor("paymentsWebhook"),
  publicApi: configFor("publicApi")
};

function defaultEnv(): FlagEnv {
  return typeof process === "undefined" ? {} : process.env;
}

export function isFeatureKilled(feature: FeatureKey, env: FlagEnv = defaultEnv()) {
  return featureGates[feature].killSwitch === true || env[`FEATURE_KILL_${feature}`] === "true";
}

export function isFeatureReleased(feature: FeatureKey, env: FlagEnv = defaultEnv()) {
  const flag = featureGates[feature].releaseFlag;
  return !flag || env[flag] === "true";
}

export function hasPermissionFlag(feature: FeatureKey, permissions: readonly string[] = []) {
  const flag = featureGates[feature].permissionFlag;
  return !flag || permissions.includes(flag);
}
