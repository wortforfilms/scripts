import { canAccessFeature } from "../features/can-access";
import { featureFlags, isFeatureFlagEnabled } from "../features/feature-flags";
import { toolRegistry, type ToolCategory, type ToolDefinition } from "../tools/tool-registry";
import type { AccessViewer } from "../access/types";

export type SidebarSection = "Explore" | "Build" | "Learn" | "Marketplace" | "Maataa" | "Admin";

export type SidebarTool = ToolDefinition & {
  locked: boolean;
  visible: boolean;
};

export type SidebarNavigationSection = {
  section: SidebarSection;
  tools: SidebarTool[];
};

const categoryToSection: Record<ToolCategory, SidebarSection> = {
  "Script Intelligence": "Explore",
  "Glyph & Unicode": "Build",
  "Language & Phonetics": "Learn",
  "Dhwani → Granth": "Learn",
  "Maataa AI": "Maataa",
  "Spine Runtime": "Maataa",
  Marketplace: "Marketplace",
  Admin: "Admin"
};

const sectionOrder: SidebarSection[] = ["Explore", "Build", "Learn", "Marketplace", "Maataa", "Admin"];

function canEverSeeTool(viewer: AccessViewer, tool: ToolDefinition) {
  const flag = featureFlags[tool.featureKey];
  if (!flag || !isFeatureFlagEnabled(tool.featureKey)) return false;
  if (tool.category === "Admin" && !["REVIEWER", "ADMIN", "SUPER_ADMIN"].includes(viewer.role)) return false;
  return true;
}

export function buildNavigation(viewer: AccessViewer): SidebarNavigationSection[] {
  const grouped = new Map<SidebarSection, SidebarTool[]>();

  for (const tool of toolRegistry) {
    if (!canEverSeeTool(viewer, tool)) continue;
    const section = categoryToSection[tool.category];
    const allowed = canAccessFeature(viewer, tool.featureKey);
    const tools = grouped.get(section) ?? [];
    tools.push({
      ...tool,
      locked: !allowed,
      visible: true
    });
    grouped.set(section, tools);
  }

  return sectionOrder
    .map((section) => ({ section, tools: grouped.get(section) ?? [] }))
    .filter((section) => section.tools.length > 0);
}
