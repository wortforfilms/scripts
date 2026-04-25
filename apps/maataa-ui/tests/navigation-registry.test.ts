import { describe, expect, it } from "vitest";
import { featureFlagList, isFeatureFlagEnabled } from "../lib/features/feature-flags";
import { findRoute, routeRegistry } from "../lib/navigation/routes";
import { toolRegistry } from "../lib/tools/tool-registry";

describe("navigation and feature registry coverage", () => {
  it("keeps tool ids and routes unique", () => {
    expect(new Set(toolRegistry.map((tool) => tool.id)).size).toBe(toolRegistry.length);
    expect(new Set(toolRegistry.map((tool) => tool.route)).size).toBe(toolRegistry.length);
  });

  it("maps every tool route to the tool feature key", () => {
    for (const tool of toolRegistry) {
      expect(findRoute(tool.route)).toMatchObject({ featureKey: tool.featureKey });
    }
  });

  it("prioritizes specific dynamic SKU admin action routes", () => {
    expect(findRoute("/api/admin/skus/sku_1/submit-review")).toMatchObject({ featureKey: "adminSkuSubmitReview" });
    expect(findRoute("/api/admin/skus/sku_1/approve")).toMatchObject({ featureKey: "adminSkuApprove" });
    expect(findRoute("/api/admin/skus/sku_1/publish")).toMatchObject({ featureKey: "adminSkuPublish" });
    expect(findRoute("/api/admin/skus/sku_1/archive")).toMatchObject({ featureKey: "adminSkuArchive" });
  });

  it("keeps phase-two and phase-three tools disabled in MVP rollout", () => {
    const futureTools = toolRegistry.filter((tool) => tool.phase !== "MVP");
    expect(futureTools.length).toBeGreaterThan(0);
    for (const tool of futureTools) {
      expect(isFeatureFlagEnabled(tool.featureKey)).toBe(false);
    }
  });

  it("has feature flags for every route registry feature", () => {
    const flags = new Set(featureFlagList().map((flag) => flag.key));
    for (const route of routeRegistry) {
      expect(flags.has(route.featureKey)).toBe(true);
    }
  });
});
