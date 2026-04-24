import { NextResponse } from "next/server";
import { canAccessFeature } from "../access/can-access";
import type { FeatureKey } from "../access/types";
import { getViewer } from "./viewer";

export async function requireUser() {
  const viewer = await getViewer();
  if (!viewer.isLoggedIn || !viewer.id) throw new Response("Authentication required", { status: 401 });
  return viewer as typeof viewer & { id: string };
}

export async function requireAdmin() {
  const viewer = await requireUser();
  const decision = canAccessFeature(viewer, "adminSkuApprove", { permissions: ["catalog-admin"] });
  if (!decision.allowed) throw new Response("Admin role required", { status: 403 });
  return viewer;
}

export async function requireReviewer() {
  const viewer = await requireUser();
  const decision = canAccessFeature(viewer, "adminSkuReview", { permissions: ["catalog-review"] });
  if (!decision.allowed) throw new Response("Reviewer role required", { status: 403 });
  return viewer;
}

export async function requireFeature(featureKey: FeatureKey) {
  const viewer = await getViewer();
  const permissions = viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN" ? ["catalog-admin", "catalog-review"] : viewer.role === "REVIEWER" ? ["catalog-review"] : [];
  const decision = canAccessFeature(viewer, featureKey, { permissions });
  if (!decision.allowed) {
    throw new Response(decision.reason === "signin" ? "Authentication required" : "Feature access denied", {
      status: decision.reason === "signin" ? 401 : 403
    });
  }
  return viewer;
}

export function routeError(error: unknown) {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status: 400 });
}
