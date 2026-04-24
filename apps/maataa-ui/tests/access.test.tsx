import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const cookieState = vi.hoisted(() => ({
  values: new Map<string, string>()
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieState.values.get(name);
      return value ? { name, value } : undefined;
    }
  })
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/checkout"
}));

import { canAccessFeature } from "../lib/access/can-access";
import type { AccessViewer } from "../lib/access/types";
import { viewerFromCookieValues } from "../lib/auth/viewer";
import { requireFeature } from "../lib/auth/guards";
import { AppSidebar } from "../components/layout/AppSidebar";
import { FeatureGate } from "../components/access/FeatureGate";
import { middleware } from "../middleware";

const guest: AccessViewer = { id: null, role: "GUEST", plan: "FREE", isLoggedIn: false };
const freeUser: AccessViewer = { id: "user_1", role: "USER", plan: "FREE", isLoggedIn: true };
const premiumUser: AccessViewer = { id: "user_2", role: "USER", plan: "PREMIUM", isLoggedIn: true };
const admin: AccessViewer = { id: "admin_1", role: "ADMIN", plan: "ENTERPRISE", isLoggedIn: true };

describe("access engine", () => {
  it("guest cannot access protected routes", () => {
    expect(canAccessFeature(guest, "dashboard")).toEqual({ allowed: false, reason: "signin" });
  });

  it("free plan is blocked from premium tools", () => {
    expect(canAccessFeature(freeUser, "checkout")).toEqual({ allowed: false, reason: "upgrade" });
    expect(canAccessFeature(premiumUser, "checkout")).toEqual({ allowed: true, reason: "allowed" });
  });

  it("admin-only routes are blocked correctly", () => {
    expect(canAccessFeature(freeUser, "adminSkuApprove", { permissions: [] }).allowed).toBe(false);
    expect(canAccessFeature(admin, "adminSkuApprove", { permissions: ["catalog-admin"] }).allowed).toBe(true);
  });
});

describe("viewer cookies", () => {
  it("does not create fake permissions", () => {
    expect(viewerFromCookieValues({ userId: null, role: "ADMIN", plan: "ENTERPRISE" })).toEqual(guest);
  });
});

describe("middleware", () => {
  it("redirects guests to signin", () => {
    const response = middleware(new NextRequest("https://scripts.vaigyaaniq.info/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/signin");
  });

  it("redirects logged-in restricted users to upgrade", () => {
    const request = new NextRequest("https://scripts.vaigyaaniq.info/checkout", {
      headers: { cookie: "maataa_user_id=user_1; maataa_role=USER; maataa_plan=FREE" }
    });
    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/upgrade");
  });
});

describe("backend guards", () => {
  it("blocks bypass attempts without cookies", async () => {
    await expect(requireFeature("checkout")).rejects.toMatchObject({ status: 401 });
  });
});

describe("feature gate UI", () => {
  it("sidebar shows locked items using the same access logic", () => {
    const html = renderToStaticMarkup(<AppSidebar viewer={freeUser} />);
    expect(html).toContain("Marketplace");
    expect(html).toContain("Pro");
  });

  it("FeatureGate blocked UI does not render restricted content", async () => {
    const element = await FeatureGate({ featureKey: "checkout", children: <strong>secret checkout</strong> });
    const html = renderToStaticMarkup(element);
    expect(html).toContain("Access required");
    expect(html).not.toContain("secret checkout");
  });
});
