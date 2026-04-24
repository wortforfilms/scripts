"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Anchor,
  BadgeCheck,
  Cable,
  FolderKanban,
  GitBranch,
  Languages,
  LayoutDashboard,
  Network,
  Radio,
  Receipt,
  ScanText,
  ShieldCheck,
  ShoppingCart
} from "lucide-react";
import { canAccessFeature } from "../../lib/access/can-access";
import type { AccessViewer, NavSection } from "../../lib/access/types";
import { navItems, navSections } from "../../lib/navigation/nav-items";

const iconMap = {
  Activity,
  Anchor,
  BadgeCheck,
  Cable,
  FolderKanban,
  GitBranch,
  Languages,
  LayoutDashboard,
  Network,
  Radio,
  Receipt,
  ScanText,
  ShieldCheck,
  ShoppingCart
};

type AppSidebarProps = {
  viewer: AccessViewer;
};

export function AppSidebar({ viewer }: AppSidebarProps) {
  const pathname = usePathname();
  const permissions =
    viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN"
      ? ["catalog-admin", "catalog-review"]
      : viewer.role === "REVIEWER"
        ? ["catalog-review"]
        : [];

  return (
    <aside className="min-h-screen w-full border-r border-white/10 bg-black/25 px-4 py-5 md:w-72">
      <Link href="/" className="block px-2 text-lg font-semibold text-white">
        Maataa Scripts
      </Link>
      <nav className="mt-6 space-y-6">
        {(Object.keys(navSections) as NavSection[]).map((section) => {
          const items = navItems.filter((item) => item.section === section);
          return (
            <section key={section}>
              <h2 className="px-2 text-xs font-medium uppercase tracking-wide text-white/40">{navSections[section]}</h2>
              <div className="mt-2 space-y-1">
                {items.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
                  const decision = canAccessFeature(viewer, item.featureKey, { permissions });
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const className = [
                    "flex items-center justify-between rounded px-2 py-2 text-sm transition",
                    active ? "bg-white/15 text-white" : "text-white/70",
                    decision.allowed ? "hover:bg-white/10" : "cursor-not-allowed opacity-55"
                  ].join(" ");
                  const content = (
                    <>
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {!decision.allowed ? <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-black">Pro</span> : null}
                    </>
                  );
                  return decision.allowed ? (
                    <Link key={item.href} href={item.href} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <span key={item.href} aria-disabled="true" className={className}>
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
