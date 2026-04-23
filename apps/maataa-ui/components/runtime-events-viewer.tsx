"use client";

import { useEffect, useMemo, useState } from "react";

type RuntimeEventRecord = {
  id: string;
  source: string;
  type: string;
  state: string;
  time: string;
  payload?: Record<string, unknown> | null;
};

function badge(state: string) {
  if (state === "ok") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (state === "warn") return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
  return "bg-rose-500/10 text-rose-300 border-rose-500/20";
}

export function RuntimeEventsViewer() {
  const [events, setEvents] = useState<RuntimeEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"none" | "source" | "type">("source");

  useEffect(() => {
    fetch("/api/runtime/events?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (sourceFilter !== "all" && event.source !== sourceFilter) return false;
      if (stateFilter !== "all" && event.state !== stateFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${event.type} ${event.source} ${event.state} ${event.time}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, sourceFilter, stateFilter, search]);

  const grouped = useMemo(() => {
    if (groupBy === "none") {
      return [{ key: "All Events", items: filtered }];
    }

    const map = new Map<string, RuntimeEventRecord[]>();
    for (const event of filtered) {
      const key = groupBy === "source" ? event.source : event.type;
      const items = map.get(key) ?? [];
      items.push(event);
      map.set(key, items);
    }

    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [filtered, groupBy]);

  const sources = useMemo(() => Array.from(new Set(events.map((e) => e.source))).sort(), [events]);
  const states = useMemo(() => Array.from(new Set(events.map((e) => e.state))).sort(), [events]);

  if (loading) {
    return <div className="text-white/60">Loading runtime events...</div>;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-lg font-semibold text-white">Runtime Events</div>
          <div className="text-sm text-white/50">Persisted libSQL event timeline with filters, search, and grouping.</div>
        </div>
        <div className="text-xs text-white/40">{filtered.length} shown / {events.length} total</div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search type, source, state..."
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
        />

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="all">All Sources</option>
          {sources.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="all">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as "none" | "source" | "type")}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="source">Group by Source</option>
          <option value="type">Group by Type</option>
          <option value="none">No Grouping</option>
        </select>
      </div>

      <div className="max-h-[700px] overflow-y-auto space-y-6">
        {grouped.length === 0 || grouped.every((group) => group.items.length === 0) ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/55">
            No runtime events match the current filters.
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.key} className="space-y-2">
              {groupBy !== "none" ? (
                <div className="sticky top-0 z-10 rounded-2xl border border-white/10 bg-black/70 px-4 py-2 text-sm font-medium text-yellow-300 backdrop-blur-xl">
                  {group.key} • {group.items.length} event(s)
                </div>
              ) : null}

              {group.items.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{event.type}</div>
                    <div className="text-xs text-white/40">{event.source} • {event.time}</div>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs ${badge(event.state)}`}>
                    {event.state}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
