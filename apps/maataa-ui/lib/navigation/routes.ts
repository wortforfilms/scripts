import type { FeatureKey } from "../access/types";

export type RouteAccess = {
  pattern: string;
  featureKey: FeatureKey;
  exact?: boolean;
};

export const routeRegistry: RouteAccess[] = [
  { pattern: "/", featureKey: "home", exact: true },
  { pattern: "/signin", featureKey: "signin" },
  { pattern: "/upgrade", featureKey: "upgrade" },
  { pattern: "/dashboard", featureKey: "dashboard" },
  { pattern: "/verify", featureKey: "scriptCatalog" },
  { pattern: "/scripts", featureKey: "scriptDetail" },
  { pattern: "/legal", featureKey: "legal" },
  { pattern: "/badge", featureKey: "badgeViewer" },
  { pattern: "/timeline", featureKey: "learningTimeline" },
  { pattern: "/proof-inspector", featureKey: "proofInspector" },
  { pattern: "/merkle", featureKey: "merkleExplorer" },
  { pattern: "/replay", featureKey: "replay" },
  { pattern: "/anchor", featureKey: "anchor" },
  { pattern: "/radio-live", featureKey: "radioLive" },
  { pattern: "/radio", featureKey: "radio" },
  { pattern: "/ai-rj-knowledge", featureKey: "aiRjKnowledge" },
  { pattern: "/checkout", featureKey: "checkout" },
  { pattern: "/products", featureKey: "productDetail" },
  { pattern: "/runtime", featureKey: "runtimeStatus" },
  { pattern: "/status", featureKey: "runtimeStatus" },
  { pattern: "/api/public", featureKey: "publicApi" },
  { pattern: "/api/payments/razorpay/webhook", featureKey: "paymentsWebhook" },
  { pattern: "/api/me/access", featureKey: "userAccess" },
  { pattern: "/api/checkout", featureKey: "checkout" },
  { pattern: "/api/spine/events", featureKey: "spineEvents" },
  { pattern: "/api/admin/skus/generate", featureKey: "adminSkuGenerate" },
  { pattern: "/api/admin/skus", featureKey: "adminSkuReview" },
  { pattern: "/admin/catalog", featureKey: "adminCatalog" },
  { pattern: "/admin/skus/review", featureKey: "adminSkuReview" },
  { pattern: "/admin/scripts/verification", featureKey: "adminScriptVerification" },
  { pattern: "/admin/orders", featureKey: "adminOrders" },
  { pattern: "/admin/spine", featureKey: "adminSpine" },
  { pattern: "/admin", featureKey: "adminCatalog" }
];

export function findRoute(pathname: string) {
  if (pathname.startsWith("/api/admin/skus/") && pathname.endsWith("/submit-review")) {
    return { pattern: "/api/admin/skus/[id]/submit-review", featureKey: "adminSkuSubmitReview" as const };
  }
  if (pathname.startsWith("/api/admin/skus/") && pathname.endsWith("/approve")) {
    return { pattern: "/api/admin/skus/[id]/approve", featureKey: "adminSkuApprove" as const };
  }
  if (pathname.startsWith("/api/admin/skus/") && pathname.endsWith("/publish")) {
    return { pattern: "/api/admin/skus/[id]/publish", featureKey: "adminSkuPublish" as const };
  }
  if (pathname.startsWith("/api/admin/skus/") && pathname.endsWith("/archive")) {
    return { pattern: "/api/admin/skus/[id]/archive", featureKey: "adminSkuArchive" as const };
  }
  return routeRegistry
    .filter((route) => (route.exact ? pathname === route.pattern : pathname === route.pattern || pathname.startsWith(`${route.pattern}/`)))
    .sort((a, b) => b.pattern.length - a.pattern.length)[0] ?? null;
}
