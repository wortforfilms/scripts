export type UserRole = "GUEST" | "USER" | "REVIEWER" | "ADMIN" | "SUPER_ADMIN";

export type UserPlan = "FREE" | "PREMIUM" | "RESEARCHER" | "ENTERPRISE";

export type FeatureKey =
  | "home"
  | "signin"
  | "upgrade"
  | "dashboard"
  | "scriptCatalog"
  | "scriptDetail"
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
  | "adminOrders"
  | "adminSpine"
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
  isLoggedIn: boolean;
};

export type NavSection = "main" | "learn" | "market" | "system" | "admin";
