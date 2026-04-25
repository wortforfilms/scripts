import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import type { AccessViewer } from "../lib/access/types";
import { buildNavigation } from "../lib/navigation/build-navigation";
import { canAccessFeature } from "../lib/features/can-access";
import { featureFlags } from "../lib/features/feature-flags";
import { AppSidebar } from "../components/layout/AppSidebar";
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
const admin = viewer({ id: "admin_1", role: "ADMIN", plan: "ENTERPRISE", permissions: ["catalog-admin"], isLoggedIn: true });

describe("tool registry navigation", () => {
  it("shows MVP tools and hides Phase 2 tools by default", () => {
    const navigation = buildNavigation(freeUser);
    const names = navigation.flatMap((section) => section.tools.map((tool) => tool.name));
    expect(names).toContain("Unicode Visualizer");
    expect(names).toContain("Glyph Inspector");
    expect(names).not.toContain("IPA Mesh");
    expect(featureFlags.ipaMesh.enabled).toBe(false);
  });

  it("admin sees admin tools", () => {
    const navigation = buildNavigation(admin);
    const names = navigation.flatMap((section) => section.tools.map((tool) => tool.name));
    expect(names).toContain("Admin Catalog");
    expect(names).toContain("Feature Flags");
  });

  it("guest is blocked by the feature access engine", () => {
    expect(canAccessFeature(guest, "dashboard")).toBe(false);
    expect(canAccessFeature(guest, "scriptCatalog")).toBe(true);
  });

  it("sidebar matches access rules with locked premium tools", () => {
    const html = renderToStaticMarkup(<AppSidebar viewer={freeUser} />);
    expect(html).toContain("Unicode Visualizer");
    expect(html).toContain("Checkout");
    expect(html).toContain("Pro");
    expect(html).not.toContain("IPA Mesh");
  });
});

describe("tool route middleware", () => {
  it("redirects guest protected tool routes to signin", async () => {
    const response = await middleware(new NextRequest("https://scripts.vaigyaaniq.info/unicode"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/signin");
  });
});
