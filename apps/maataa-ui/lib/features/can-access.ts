import type { AccessViewer, FeatureKey, UserPlan, UserRole } from "../access/types";
import { featureFlags, isFeatureFlagEnabled } from "./feature-flags";

export type FeatureAccessReason = "allowed" | "disabled" | "signin" | "upgrade" | "forbidden";

export type FeatureAccessDecision = {
  allowed: boolean;
  reason: FeatureAccessReason;
};

const roleRank: Record<UserRole, number> = {
  GUEST: 0,
  USER: 1,
  REVIEWER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4
};

const planRank: Record<UserPlan, number> = {
  FREE: 0,
  PREMIUM: 1,
  RESEARCHER: 2,
  ENTERPRISE: 3
};

function satisfiesRole(viewerRole: UserRole, roles?: UserRole[]) {
  if (!roles || roles.length === 0) return true;
  return roles.some((role) => roleRank[viewerRole] >= roleRank[role]);
}

function satisfiesPlan(viewerPlan: UserPlan, plans?: UserPlan[]) {
  if (!plans || plans.length === 0) return true;
  return plans.some((plan) => planRank[viewerPlan] >= planRank[plan]);
}

export function getFeatureAccessDecision(user: AccessViewer, featureKey: FeatureKey): FeatureAccessDecision {
  const flag = featureFlags[featureKey];
  if (!flag || !isFeatureFlagEnabled(featureKey)) return { allowed: false, reason: "disabled" };
  if (!flag.roles?.length && !flag.plans?.length) return { allowed: true, reason: "allowed" };
  if (!user.isLoggedIn || user.role === "GUEST") return { allowed: false, reason: "signin" };
  if (!satisfiesRole(user.role, flag.roles)) return { allowed: false, reason: "forbidden" };
  if (!satisfiesPlan(user.plan, flag.plans)) return { allowed: false, reason: "upgrade" };
  return { allowed: true, reason: "allowed" };
}

export function canAccessFeature(user: AccessViewer, featureKey: FeatureKey) {
  return getFeatureAccessDecision(user, featureKey).allowed;
}
