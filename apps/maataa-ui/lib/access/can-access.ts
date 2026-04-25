import { getFeatureAccessDecision } from "../features/can-access";
import { hasPermissionFlag } from "./feature-gates";
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
  const decision = getFeatureAccessDecision(viewer, feature);
  if (!decision.allowed) return { allowed: false, reason: decision.reason === "disabled" ? "coming-soon" : decision.reason };
  if (!hasPermissionFlag(feature, options.permissions)) return { allowed: false, reason: "forbidden" };
  return { allowed: true, reason: viewer.isLoggedIn ? "allowed" : "public" };
}
