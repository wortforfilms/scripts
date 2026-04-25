"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Anchor,
  BadgeCheck,
  Cable,
  Brain,
  FileAudio,
  FolderKanban,
  GitBranch,
  Headphones,
  Languages,
  LayoutDashboard,
  LetterText,
  ListChecks,
  Network,
  Package,
  Radio,
  Receipt,
  ScanText,
  ShieldCheck,
  ShoppingCart,
  SpellCheck,
  Store,
  TreePine,
  WandSparkles
} from "lucide-react";
import type { AccessViewer } from "../../lib/access/types";
import { buildNavigation } from "../../lib/navigation/build-navigation";
import type { ToolCategory } from "../../lib/tools/tool-registry";

const iconMap = {
  Activity,
  Anchor,
  BadgeCheck,
  Brain,
  Cable,
  FileAudio,
  FolderKanban,
  GitBranch,
  Headphones,
  Languages,
  LayoutDashboard,
  LetterText,
  ListChecks,
  Network,
  Package,
  Radio,
  Receipt,
  ScanText,
  ShieldCheck,
  ShoppingCart,
  SpellCheck,
  Store,
  TreePine,
  WandSparkles
};

const categoryIcon: Record<ToolCategory, keyof typeof iconMap> = {
  "Script Intelligence": "Languages",
  "Glyph & Unicode": "LetterText",
  "Language & Phonetics": "SpellCheck",
  "Dhwani → Granth": "FileAudio",
  "Maataa AI": "Brain",
  "Spine Runtime": "Activity",
  Marketplace: "Store",
  Admin: "FolderKanban"
};

type AppSidebarProps = {
  viewer: AccessViewer;
};

export function AppSidebar({ viewer }: AppSidebarProps) {
  const pathname = usePathname() ?? "";
  const sections = buildNavigation(viewer);

  return (
    <aside className="min-h-screen w-full border-r border-white/10 bg-black/25 px-4 py-5 md:w-72">
      <Link href="/" className="block px-2 text-lg font-semibold text-white">
        Maataa Scripts
      </Link>
      <nav className="mt-6 space-y-6">
        {sections.map((section) => {
          return (
            <section key={section.section}>
              <h2 className="px-2 text-xs font-medium uppercase tracking-wide text-white/40">{section.section}</h2>
              <div className="mt-2 space-y-1">
                {section.tools.map((item) => {
                  const Icon = iconMap[categoryIcon[item.category]] ?? LayoutDashboard;
                  const active = pathname === item.route || pathname.startsWith(`${item.route}/`);
                  const className = [
                    "flex items-center justify-between rounded px-2 py-2 text-sm transition",
                    active ? "bg-white/15 text-white" : "text-white/70",
                    !item.locked ? "hover:bg-white/10" : "cursor-not-allowed opacity-55"
                  ].join(" ");
                  const content = (
                    <>
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.name}</span>
                      </span>
                      {item.locked ? <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-black">Pro</span> : null}
                    </>
                  );
                  return !item.locked ? (
                    <Link key={item.route} href={item.route} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <span key={item.route} aria-disabled="true" className={className}>
                      {content}
                    </span>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}
