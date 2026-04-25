"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { VerifiedGlyph } from "./VerifiedGlyph";
import type { ScriptRecord } from "../../lib/script-data";

type ScriptSelectionPanelProps = {
  scripts: ScriptRecord[];
  targetCount: number;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaBaseHref?: string;
};

export function ScriptSelectionPanel({
  scripts,
  targetCount,
  heading = "Choose a script to begin",
  subheading = "Start with a verified or partially verified record. Unsourced scripts stay out of the catalog until verification is complete.",
  ctaLabel = "Select",
  ctaBaseHref = "/scripts"
}: ScriptSelectionPanelProps) {
  const [query, setQuery] = useState("");
  const filteredScripts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return scripts;
    return scripts.filter((script) => {
      return [script.name, script.nativeName, script.family, script.region, script.verificationStatus]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, scripts]);
  const pendingCount = Math.max(targetCount - scripts.length, 0);

  return (
    <section className="rounded border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-300">First step</p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-5xl">{heading}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70 md:text-base">{subheading}</p>
        </div>
        <div className="rounded border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
          <strong className="text-white">{scripts.length} / {targetCount}</strong> records selectable
        </div>
      </div>

      <label className="mt-5 flex max-w-xl items-center gap-2 rounded border border-white/15 bg-black/25 px-3 py-2">
        <Search className="h-4 w-4 text-white/50" aria-hidden="true" />
        <span className="sr-only">Search scripts</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          placeholder="Search verified scripts, families, regions..."
        />
      </label>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {filteredScripts.map((script) => (
          <Link
            key={script.id}
            href={`${ctaBaseHref}/${script.slug}`}
            className="rounded border border-white/10 bg-[#071018]/80 p-4 transition hover:border-amber-300/70 hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-white">{script.name}</h2>
                <p className="mt-1 truncate text-sm text-white/55">{script.nativeName}</p>
              </div>
              <span className="rounded bg-white/10 px-2 py-1 text-[11px] font-medium text-white/70">{script.verificationStatus}</span>
            </div>
            <div className="mt-4 text-4xl">
              <VerifiedGlyph script={script} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-white/55">{script.family}</span>
              <span className="font-medium text-amber-300">{ctaLabel}</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredScripts.length === 0 ? (
        <div className="mt-5 rounded border border-white/10 bg-black/20 p-5 text-sm text-white/65">
          No verified records match this search yet.
        </div>
      ) : null}

      <div className="mt-4 rounded border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        {pendingCount} target slots remain unavailable until each script has sources, verification status, and a safe glyph policy.
      </div>
    </section>
  );
}
