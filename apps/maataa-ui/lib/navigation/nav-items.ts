import { buildNavigation } from "./build-navigation";
import type { FeatureKey, NavSection } from "../access/types";
import type { AccessViewer } from "../access/types";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  featureKey: FeatureKey;
  section: NavSection;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", featureKey: "dashboard", section: "main" },
  { label: "Scripts", href: "/scripts", icon: "Languages", featureKey: "scriptCatalog", section: "main" },
  { label: "Runtime", href: "/runtime", icon: "Activity", featureKey: "runtimeStatus", section: "system" },
  { label: "Timeline", href: "/timeline", icon: "GitBranch", featureKey: "learningTimeline", section: "learn" },
  { label: "Proof", href: "/proof-inspector", icon: "ShieldCheck", featureKey: "proofInspector", section: "learn" },
  { label: "Merkle", href: "/merkle", icon: "Network", featureKey: "merkleExplorer", section: "learn" },
  { label: "Anchor", href: "/anchor", icon: "Anchor", featureKey: "anchor", section: "system" },
  { label: "Radio", href: "/radio", icon: "Radio", featureKey: "radio", section: "system" },
  { label: "Marketplace", href: "/checkout", icon: "ShoppingCart", featureKey: "checkout", section: "market" },
  { label: "Catalog", href: "/admin/catalog", icon: "FolderKanban", featureKey: "adminCatalog", section: "admin" },
  { label: "SKU Review", href: "/admin/skus/review", icon: "BadgeCheck", featureKey: "adminSkuReview", section: "admin" },
  { label: "Verification", href: "/admin/scripts/verification", icon: "ScanText", featureKey: "adminScriptVerification", section: "admin" },
  { label: "Orders", href: "/admin/orders", icon: "Receipt", featureKey: "adminOrders", section: "admin" },
  { label: "Spine", href: "/admin/spine", icon: "Cable", featureKey: "adminSpine", section: "admin" }
];

export const navSections: Record<NavSection, string> = {
  main: "Main",
  learn: "Learn",
  market: "Market",
  system: "System",
  admin: "Admin"
};

const sectionMap: Record<string, NavSection> = {
  Explore: "main",
  Build: "main",
  Learn: "learn",
  Marketplace: "market",
  Maataa: "system",
  Admin: "admin"
};

export function navItemsForViewer(viewer: AccessViewer): NavItem[] {
  return buildNavigation(viewer).flatMap((section) =>
    section.tools.map((tool) => ({
      label: tool.name,
      href: tool.route,
      icon: "LayoutDashboard",
      featureKey: tool.featureKey,
      section: sectionMap[section.section] ?? "main"
    }))
  );
}
