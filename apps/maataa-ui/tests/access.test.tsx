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
import { createSessionTokenForTests, SESSION_COOKIE_NAME } from "../lib/auth/session";
import { requireFeature } from "../lib/auth/guards";
import { AppSidebar } from "../components/layout/AppSidebar";
import { FeatureGate } from "../components/access/FeatureGate";
import { middleware } from "../middleware";

function viewer(input: Partial<AccessViewer> & Pick<AccessViewer, "id" | "role" | "plan" | "isLoggedIn">): AccessViewer {
  return {
    userId: input.id,
    accountId: input.id ? `acct_${input.id}` : null,
    accountType: input.id ? "INDIVIDUAL" : null,
    accountRole: input.id ? "OWNER" : null,
    permissions: [],
    ...input
  };
}

const guest = viewer({ id: null, role: "GUEST", plan: "FREE", isLoggedIn: false });
const freeUser = viewer({ id: "user_1", role: "USER", plan: "FREE", permissions: [], isLoggedIn: true });
const premiumUser = viewer({ id: "user_2", role: "USER", plan: "PREMIUM", permissions: [], isLoggedIn: true });
const admin = viewer({ id: "admin_1", role: "ADMIN", plan: "ENTERPRISE", permissions: ["catalog-admin"], isLoggedIn: true });

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
  it("redirects guests to signin", async () => {
    const response = await middleware(new NextRequest("https://scripts.vaigyaaniq.info/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/signin");
  });

  it("redirects logged-in restricted users to upgrade", async () => {
    process.env.AUTH_SESSION_SECRET = "test-secret";
    const token = await createSessionTokenForTests({ sub: "user_1", role: "USER", plan: "FREE" }, "test-secret");
    const request = new NextRequest("https://scripts.vaigyaaniq.info/checkout", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` }
    });
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/upgrade");
    delete process.env.AUTH_SESSION_SECRET;
  });

  it("accepts verified production session JWTs", async () => {
    process.env.AUTH_SESSION_SECRET = "test-secret";
    const token = await createSessionTokenForTests({ sub: "admin_1", role: "ADMIN", plan: "ENTERPRISE" }, "test-secret");
    const request = new NextRequest("https://scripts.vaigyaaniq.info/admin/orders", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` }
    });
    const response = await middleware(request);
    expect(response.status).toBe(200);
    delete process.env.AUTH_SESSION_SECRET;
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
