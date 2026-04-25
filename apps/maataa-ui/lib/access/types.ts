export type UserRole = "GUEST" | "USER" | "REVIEWER" | "ADMIN" | "SUPER_ADMIN";

export type UserPlan = "FREE" | "PREMIUM" | "RESEARCHER" | "ENTERPRISE";

export type FeatureKey =
  | "home"
  | "signin"
  | "upgrade"
  | "dashboard"
  | "scriptCatalog"
  | "scriptDetail"
  | "scriptTree"
  | "unicodeVisualizer"
  | "glyphInspector"
  | "glyphQa"
  | "fontQa"
  | "datasetQa"
  | "ipaMesh"
  | "phoneticsLab"
  | "transliterationLab"
  | "dhwaniGranth"
  | "granthReader"
  | "audioArchive"
  | "maataaAi"
  | "ocrWorkbench"
  | "verifiedGlyphs"
  | "learningTimeline"
  | "proofVerifier"
  | "proofInspector"
  | "merkleExplorer"
  | "badgeViewer"
  | "replay"
  | "anchor"
  | "radio"
  | "radioLive"
  | "aiRjKnowledge"
  | "marketplace"
  | "checkout"
  | "productDetail"
  | "userAccess"
  | "runtimeStatus"
  | "runtimeTimeline"
  | "spineEvents"
  | "legal"
  | "adminCatalog"
  | "adminSkuReview"
  | "adminScriptVerification"
  | "adminUnicode"
  | "adminOrders"
  | "adminSpine"
  | "adminFeatures"
  | "adminSkuGenerate"
  | "adminSkuSubmitReview"
  | "adminSkuApprove"
  | "adminSkuPublish"
  | "adminSkuArchive"
  | "paymentsWebhook"
  | "publicApi";

export type AccessViewer = {
  id: string | null;
  role: UserRole;
  plan: UserPlan;
  permissions: string[];
  isLoggedIn: boolean;
};

export type NavSection = "main" | "learn" | "market" | "system" | "admin";
