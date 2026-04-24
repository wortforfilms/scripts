import { cookies } from "next/headers";
import type { AccessViewer, UserPlan, UserRole } from "../access/types";

export const guestViewer: AccessViewer = {
  id: null,
  role: "GUEST",
  plan: "FREE",
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
    isLoggedIn: Boolean(id)
  };
}

export async function getViewer(): Promise<AccessViewer> {
  const jar = await cookies();
  return viewerFromCookieValues({
    userId: jar.get("maataa_user_id")?.value,
    role: jar.get("maataa_role")?.value,
    plan: jar.get("maataa_plan")?.value
  });
}
