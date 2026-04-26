"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { VerifiedGlyph } from "./VerifiedGlyph";
import type { ScriptDirection, ScriptRecord, ScriptSystemType, VerificationStatus } from "../../lib/script-data";

type ScriptCatalogBrowserProps = {
  scripts: ScriptRecord[];
  targetCount: number;
};

type SortKey = "name-asc" | "name-desc" | "status" | "ranges-desc" | "era-asc" | "era-desc";

const pageSizes = [12, 24, 48, 96] as const;

function uniqueValues<T extends string>(values: T[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function rangeLabel(script: ScriptRecord) {
  if (!script.unicodeSupported) return "Not mapped";
  return `${script.unicodeRanges.length} range${script.unicodeRanges.length === 1 ? "" : "s"}`;
}

function eraLabel(script: ScriptRecord) {
  if (script.eraStart === null && script.eraEnd === null) return "Era pending";
  const start = script.eraStart === null ? "?" : script.eraStart < 0 ? `${Math.abs(script.eraStart)} BCE` : `${script.eraStart} CE`;
  const end = script.eraEnd === null ? "present" : script.eraEnd < 0 ? `${Math.abs(script.eraEnd)} BCE` : `${script.eraEnd} CE`;
  return `${start} - ${end}`;
}

function sortScripts(scripts: ScriptRecord[], sort: SortKey) {
  return [...scripts].sort((a, b) => {
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "status") return a.verificationStatus.localeCompare(b.verificationStatus) || a.name.localeCompare(b.name);
    if (sort === "ranges-desc") return b.unicodeRanges.length - a.unicodeRanges.length || a.name.localeCompare(b.name);
    if (sort === "era-asc") return (a.eraStart ?? 999999) - (b.eraStart ?? 999999) || a.name.localeCompare(b.name);
    if (sort === "era-desc") return (b.eraStart ?? -999999) - (a.eraStart ?? -999999) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
}

export function ScriptCatalogBrowser({ scripts, targetCount }: ScriptCatalogBrowserProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VerificationStatus | "ALL">("ALL");
  const [systemType, setSystemType] = useState<ScriptSystemType | "ALL">("ALL");
  const [direction, setDirection] = useState<ScriptDirection | "ALL">("ALL");
  const [unicodeOnly, setUnicodeOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(24);
  const [page, setPage] = useState(1);

  const statuses = useMemo(() => uniqueValues(scripts.map((script) => script.verificationStatus)), [scripts]);
  const systemTypes = useMemo(() => uniqueValues(scripts.map((script) => script.systemType)), [scripts]);
  const directions = useMemo(() => uniqueValues(scripts.map((script) => script.direction)), [scripts]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = scripts.filter((script) => {
      const haystack = [
        script.name,
        script.nativeName,
        script.slug,
        script.family,
        script.region ?? "",
        script.direction,
        script.systemType,
        script.verificationStatus,
        script.sources.join(" "),
        script.unicodeRanges.map((range) => `${range.start} ${range.end}`).join(" ")
      ].join(" ").toLowerCase();
      if (normalized && !haystack.includes(normalized)) return false;
      if (status !== "ALL" && script.verificationStatus !== status) return false;
      if (systemType !== "ALL" && script.systemType !== systemType) return false;
      if (direction !== "ALL" && script.direction !== direction) return false;
      if (unicodeOnly && !script.unicodeSupported) return false;
      return true;
    });
    return sortScripts(matches, sort);
  }, [direction, query, scripts, sort, status, systemType, unicodeOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstVisibleItem = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastVisibleItem = Math.min(safePage * pageSize, filtered.length);
  const unicodeCovered = scripts.filter((script) => script.unicodeSupported).length;
  const reset = () => {
    setQuery("");
    setStatus("ALL");
    setSystemType("ALL");
    setDirection("ALL");
    setUnicodeOnly(false);
    setSort("name-asc");
    setPage(1);
  };

  const selectClass = "rounded border border-white/15 bg-black/25 px-3 py-2 text-sm text-white";

  return (
    <section id="script-catalog" data-joyride="script-catalog-browser" className="mt-8 scroll-mt-24">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/55">Catalog</p>
          <strong className="mt-1 block text-2xl">{scripts.length} / {targetCount}</strong>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/55">Filtered</p>
          <strong className="mt-1 block text-2xl">{filtered.length}</strong>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/55">Unicode mapped</p>
          <strong className="mt-1 block text-2xl">{unicodeCovered}</strong>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/55">Page</p>
          <strong className="mt-1 block text-2xl">{safePage} / {totalPages}</strong>
        </div>
      </div>

      <div className="mt-5 rounded border border-white/10 bg-white/[0.04] p-4">
        <label className="flex items-center gap-2 rounded border border-white/15 bg-black/25 px-3 py-2">
          <Search className="h-4 w-4 text-white/50" aria-hidden="true" />
          <span className="sr-only">Search scripts</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            placeholder="Search name, native name, family, region, source, Unicode range..."
          />
          {query ? (
            <button type="button" aria-label="Clear search" className="rounded p-1 text-white/60 hover:bg-white/10" onClick={() => setQuery("")}>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label className="grid gap-1 text-xs uppercase tracking-wide text-white/50">
            Status
            <select className={selectClass} value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }}>
              <option value="ALL">All</option>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-white/50">
            Type
            <select className={selectClass} value={systemType} onChange={(event) => { setSystemType(event.target.value as typeof systemType); setPage(1); }}>
              <option value="ALL">All</option>
              {systemTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-white/50">
            Direction
            <select className={selectClass} value={direction} onChange={(event) => { setDirection(event.target.value as typeof direction); setPage(1); }}>
              <option value="ALL">All</option>
              {directions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-white/50">
            Sort
            <select className={selectClass} value={sort} onChange={(event) => { setSort(event.target.value as SortKey); setPage(1); }}>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="status">Status</option>
              <option value="ranges-desc">Unicode ranges</option>
              <option value="era-asc">Oldest first</option>
              <option value="era-desc">Newest first</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-white/50">
            Page size
            <select className={selectClass} value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value) as (typeof pageSizes)[number]); setPage(1); }}>
              {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <label className="flex items-end gap-2 rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75">
            <input
              type="checkbox"
              checked={unicodeOnly}
              className="h-4 w-4 accent-amber-300"
              onChange={(event) => {
                setUnicodeOnly(event.target.checked);
                setPage(1);
              }}
            />
            Unicode mapped only
          </label>
        </div>
        <button type="button" className="mt-4 rounded border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10" onClick={reset}>
          Reset filters
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((script) => (
          <Link
            key={script.id}
            href={`/scripts/${script.slug}`}
            className="rounded border border-white/10 bg-white/5 p-5 transition hover:border-emerald-300/50 hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold">{script.name}</h2>
                <p className="mt-1 truncate text-sm text-white/55">{script.nativeName}</p>
              </div>
              <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/70">{script.verificationStatus}</span>
            </div>
            <div className="mt-5 min-h-14 text-4xl">
              <VerifiedGlyph script={script} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-white/65">{script.systemType}</span>
              <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-white/65">{script.direction}</span>
              <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-white/65">{rangeLabel(script)}</span>
            </div>
            <dl className="mt-4 grid gap-2 text-sm text-white/60">
              <div><dt className="sr-only">Family</dt><dd className="truncate">{script.family}</dd></div>
              <div><dt className="sr-only">Region</dt><dd className="truncate">{script.region ?? "Region pending"}</dd></div>
              <div><dt className="sr-only">Era</dt><dd className="truncate">{eraLabel(script)}</dd></div>
            </dl>
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded border border-white/10 bg-white/5 p-6 text-white/65">
          No scripts match these filters.
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-white/60">
          Showing {firstVisibleItem}-{lastVisibleItem} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm text-white/75 disabled:opacity-40"
            disabled={safePage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm text-white/75 disabled:opacity-40"
            disabled={safePage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
