import { NextResponse, type NextRequest } from "next/server";
import { canAccessFeature } from "./lib/access/can-access";
import { findRoute } from "./lib/navigation/routes";
import { guestViewer, viewerFromCookieValues } from "./lib/auth/viewer";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/auth/session";

export async function middleware(request: NextRequest) {
  const route = findRoute(request.nextUrl.pathname);
  if (!route) return NextResponse.next();

  const sessionViewer = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const viewer =
    sessionViewer ??
    (process.env.NODE_ENV !== "production" && process.env.MAATAA_ALLOW_DEV_AUTH_COOKIES === "true"
      ? viewerFromCookieValues({
          userId: request.cookies.get("maataa_user_id")?.value,
          role: request.cookies.get("maataa_role")?.value,
          plan: request.cookies.get("maataa_plan")?.value
        })
      : guestViewer);
  const permissions =
    viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN"
      ? ["catalog-admin", "catalog-review", ...viewer.permissions]
      : viewer.role === "REVIEWER"
        ? ["catalog-review", ...viewer.permissions]
        : viewer.permissions;
  const decision = canAccessFeature(viewer, route.featureKey, { permissions });

  if (decision.allowed) return NextResponse.next();

  if (decision.reason === "signin") {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = "/upgrade";
  url.searchParams.set("feature", route.featureKey);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/timeline/:path*",
    "/proof-inspector/:path*",
    "/merkle/:path*",
    "/replay/:path*",
    "/anchor/:path*",
    "/radio/:path*",
    "/radio-live/:path*",
    "/ai-rj-knowledge/:path*",
    "/checkout/:path*",
    "/products/:path*",
    "/runtime/:path*",
    "/status/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/checkout/:path*",
    "/api/me/:path*",
    "/api/spine/:path*"
  ]
};
