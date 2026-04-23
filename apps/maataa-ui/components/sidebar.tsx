"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  Clapperboard,
  Cpu,
  FileCheck,
  Fingerprint,
  Network,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  Wallet
} from "lucide-react";

const sections = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/runtime", label: "Runtime", icon: Cpu },
  { href: "/status", label: "Status Matrix", icon: Network },
  { href: "/timeline", label: "Timeline", icon: Activity },
  { href: "/proof", label: "Proof", icon: ShieldCheck },
  { href: "/proof-inspector", label: "Proof Inspector", icon: BadgeCheck },
  { href: "/verify", label: "HKD Verify", icon: Fingerprint },
  { href: "/merkle", label: "Merkle", icon: ShieldCheck },
  { href: "/anchor", label: "Anchor", icon: BadgeCheck },
  { href: "/badge", label: "Badge", icon: FileCheck },
  { href: "/legal/65b", label: "Section 65B", icon: Scale },
  { href: "/studio", label: "Studio", icon: Clapperboard },
  { href: "/allb", label: "ALLB", icon: Wallet },
  { href: "/saptadhatu", label: "Saptadhatu", icon: Sparkles },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/radio", label: "Radio", icon: Radio },
  { href: "/radio-live", label: "Radio Live", icon: Radio }
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-yellow-500/15 bg-black/70 backdrop-blur-xl">
      <div className="border-b border-yellow-500/15 p-6">
        <div className="text-xs uppercase tracking-[0.3em] text-yellow-400/70">Maataa</div>
        <div className="mt-2 text-2xl font-semibold text-white">Living Interface</div>
        <div className="mt-2 text-sm text-white/55">OS surface for runtime, status, proof, verification, legal evidence, studio, ALLB, embodiment, and radio.</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = pathname === section.href;
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all",
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent text-yellow-300"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{section.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="border-t border-yellow-500/15 p-4">
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="text-sm font-medium text-yellow-300">Offline Sovereign Mode</div>
          <div className="mt-1 text-xs text-white/60">Proof, status, archive, runtime, verification, legal evidence, and radio active on local stack.</div>
        </div>
      </div>
    </aside>
  );
}
