import { cookies } from "next/headers";
import type { AccessViewer, UserPlan, UserRole } from "../access/types";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

export const guestViewer: AccessViewer = {
  id: null,
  role: "GUEST",
  plan: "FREE",
  permissions: [],
  isLoggedIn: false
};

export function parseRole(value: string | undefined | null): UserRole {
  if (value === "USER" || value === "REVIEWER" || value === "ADMIN" || value === "SUPER_ADMIN") return value;
  return "GUEST";
}

export function parsePlan(value: string | undefined | null): UserPlan {
  if (value === "PREMIUM" || value === "RESEARCHER" || value === "ENTERPRISE") return value;
  return "FREE";
}

export function viewerFromCookieValues(input: { userId?: string | null; role?: string | null; plan?: string | null }): AccessViewer {
  const role = parseRole(input.role);
  const id = input.userId ?? null;
  return {
    id,
    role: id ? (role === "GUEST" ? "USER" : role) : "GUEST",
    plan: id ? parsePlan(input.plan) : "FREE",
    permissions: [],
    isLoggedIn: Boolean(id)
  };
}

function devCookieFallbackEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.MAATAA_ALLOW_DEV_AUTH_COOKIES === "true";
}

export async function getViewer(): Promise<AccessViewer> {
  const jar = await cookies();
  const verified = await verifySessionToken(jar.get(SESSION_COOKIE_NAME)?.value);
  if (verified) return verified;
  if (!devCookieFallbackEnabled()) return guestViewer;
  return viewerFromCookieValues({
    userId: jar.get("maataa_user_id")?.value,
    role: jar.get("maataa_role")?.value,
    plan: jar.get("maataa_plan")?.value
  });
}
