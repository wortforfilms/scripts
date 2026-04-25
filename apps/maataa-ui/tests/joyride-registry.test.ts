import { describe, expect, it } from "vitest";
import { accessibilityPreset, getJoyridePreset, joyrideDirectory } from "../components/joyride/joyride-presets";

const routeSamples = [
  { pathname: "/", preset: "home", title: "Main navigation" },
  { pathname: "/scripts", preset: "scripts", title: "Searchable script catalog" },
  { pathname: "/scripts/latin", preset: "script-detail", title: "Verification record" },
  { pathname: "/tools", preset: "tools", title: "Feature-gated tools" },
  { pathname: "/investors", preset: "investors", title: "Investor intake" },
  { pathname: "/sponsors", preset: "sponsors", title: "Sponsor path" },
  { pathname: "/creators", preset: "creators", title: "Creator path" },
  { pathname: "/partners", preset: "partners", title: "Partner portal" },
  { pathname: "/checkout", preset: "checkout", title: "Webhook-only trust" },
  { pathname: "/admin/finance", preset: "admin-finance", title: "Finance controls" },
  { pathname: "/admin/dataset-qa", preset: "dataset-qa", title: "Public preview gate" },
  { pathname: "/admin/glyph-qa", preset: "glyph-qa", title: "Glyph safety" },
  { pathname: "/admin/features", preset: "feature-flags", title: "Rollout controls" }
];

describe("joyride registry", () => {
  it("lists every public and restricted joyride entry with launch URLs", () => {
    expect(joyrideDirectory).toHaveLength(13);
    expect(new Set(joyrideDirectory.map((item) => item.href)).size).toBe(joyrideDirectory.length);
    for (const item of joyrideDirectory) {
      expect(item.href).toContain("joyride=start");
      expect(item.title.trim()).not.toEqual("");
      expect(item.body.trim()).not.toEqual("");
    }
  });

  it.each(routeSamples)("maps $pathname to the expected preset", ({ pathname, preset, title }) => {
    const match = getJoyridePreset(pathname);
    expect(match.id).toBe(preset);
    expect(match.steps.map((step) => step.title)).toContain(title);
    expect(match.steps.at(-1)?.target).toBe("settings");
  });

  it("keeps accessibility joyride focused on Divyaang support controls", () => {
    expect(accessibilityPreset.steps).toHaveLength(5);
    expect(accessibilityPreset.steps.map((step) => step.target)).toEqual(["overview", "image", "vision", "keyboard", "settings"]);
  });

  it("falls back to a generic page joyride for unknown routes", () => {
    const fallback = getJoyridePreset("/unknown-route");
    expect(fallback.id).toBe("generic");
    expect(fallback.steps).toHaveLength(2);
  });
});
