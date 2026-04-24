import {
  featureGates,
  hasPermissionFlag,
  isFeatureKilled,
  isFeatureReleased,
  planRank,
  roleRank
} from "./feature-gates";
import type { AccessViewer, FeatureKey } from "./types";

export type AccessDecision = {
  allowed: boolean;
  reason: "public" | "allowed" | "signin" | "upgrade" | "forbidden" | "coming-soon" | "disabled";
};

export function canAccessFeature(
  viewer: AccessViewer,
  feature: FeatureKey,
  options: { permissions?: readonly string[]; env?: Record<string, string | undefined> } = {}
): AccessDecision {
  const gate = featureGates[feature];
  if (!gate) return { allowed: false, reason: "forbidden" };
  if (isFeatureKilled(feature, options.env)) return { allowed: false, reason: "disabled" };
  if (gate.comingSoon || !isFeatureReleased(feature, options.env)) return { allowed: false, reason: "coming-soon" };
  if (gate.public) return { allowed: true, reason: "public" };
  if (!viewer.isLoggedIn || viewer.role === "GUEST") return { allowed: false, reason: "signin" };
  if (gate.minimumRole && roleRank[viewer.role] < roleRank[gate.minimumRole]) return { allowed: false, reason: "forbidden" };
  if (gate.plans && !gate.plans.some((plan) => planRank[viewer.plan] >= planRank[plan])) return { allowed: false, reason: "upgrade" };
  if (!hasPermissionFlag(feature, options.permissions)) return { allowed: false, reason: "forbidden" };
  return { allowed: true, reason: "allowed" };
}
