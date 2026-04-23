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

function getEventEpoch(time: string) {
  const parsed = Date.parse(time);
  if (!Number.isNaN(parsed)) return parsed;
  const fallback = Date.parse(`1970-01-01T${time}`);
  if (!Number.isNaN(fallback)) return fallback;
  return 0;
}

function findRelatedKey(event: RuntimeEventRecord) {
  const payload = event.payload ?? {};
  const candidate =
    (typeof payload.taskId === "string" && payload.taskId) ||
    (typeof payload.anchorId === "string" && payload.anchorId) ||
    (typeof payload.merkleRoot === "string" && payload.merkleRoot) ||
    (typeof payload.txHash === "string" && payload.txHash) ||
    (typeof payload.track === "string" && payload.track) ||
    null;

  return candidate;
}

export function RuntimeEventsViewer() {
  const [events, setEvents] = useState<RuntimeEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"none" | "source" | "type">("source");
  const [timeRange, setTimeRange] = useState<"all" | "5m" | "1h" | "24h">("all");
  const [replayActive, setReplayActive] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<RuntimeEventRecord | null>(null);

  useEffect(() => {
    fetch("/api/runtime/events?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();

    return events.filter((event) => {
      if (sourceFilter !== "all" && event.source !== sourceFilter) return false;
      if (stateFilter !== "all" && event.state !== stateFilter) return false;

      if (timeRange !== "all") {
        const eventTime = getEventEpoch(event.time);
        const diff = now - eventTime;
        if (timeRange === "5m" && diff > 5 * 60 * 1000) return false;
        if (timeRange === "1h" && diff > 60 * 60 * 1000) return false;
        if (timeRange === "24h" && diff > 24 * 60 * 60 * 1000) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${event.type} ${event.source} ${event.state} ${event.time}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, sourceFilter, stateFilter, search, timeRange]);

  useEffect(() => {
    if (!replayActive) return;
    if (filtered.length === 0) return;

    setReplayIndex(0);
    const interval = setInterval(() => {
      setReplayIndex((current) => {
        if (current >= filtered.length - 1) {
          clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [replayActive, filtered]);

  const replayItems = replayActive ? filtered.slice(0, replayIndex + 1) : filtered;

  const grouped = useMemo(() => {
    if (groupBy === "none") {
      return [{ key: "All Events", items: replayItems }];
    }

    const map = new Map<string, RuntimeEventRecord[]>();
    for (const event of replayItems) {
      const key = groupBy === "source" ? event.source : event.type;
      const items = map.get(key) ?? [];
      items.push(event);
      map.set(key, items);
    }

    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [replayItems, groupBy]);

  const sources = useMemo(() => Array.from(new Set(events.map((e) => e.source))).sort(), [events]);
  const states = useMemo(() => Array.from(new Set(events.map((e) => e.state))).sort(), [events]);

  const relatedEvents = useMemo(() => {
    if (!selectedEvent) return [];
    const relatedKey = findRelatedKey(selectedEvent);
    if (!relatedKey) return [];

    return events.filter((event) => {
      if (event.id === selectedEvent.id) return false;
      return findRelatedKey(event) === relatedKey;
    });
  }, [selectedEvent, events]);

  if (loading) {
    return <div className="text-white/60">Loading runtime events...</div>;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-lg font-semibold text-white">Runtime Events</div>
          <div className="text-sm text-white/50">Persisted libSQL event timeline with filters, search, grouping, time-range slicing, replay, and chain view.</div>
        </div>
        <div className="text-xs text-white/40">{replayItems.length} shown / {events.length} total</div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "all" | "5m" | "1h" | "24h")}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="all">All Time</option>
          <option value="5m">Last 5 Minutes</option>
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
        </select>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setReplayActive((current) => !current)}
          className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300"
        >
          {replayActive ? "Stop Replay" : "Start Replay"}
        </button>
        <button
          onClick={() => {
            setReplayActive(false);
            setReplayIndex(0);
          }}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70"
        >
          Reset Replay
        </button>
        <div className="text-xs text-white/40">
          {replayActive ? `Replay frame ${Math.min(replayIndex + 1, filtered.length)} / ${filtered.length}` : "Replay idle"}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
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
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left hover:border-cyan-500/20 hover:bg-white/10"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{event.type}</div>
                      <div className="text-xs text-white/40">{event.source} • {event.time}</div>
                    </div>
                    <div className={`rounded-full border px-3 py-1 text-xs ${badge(event.state)}`}>
                      {event.state}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="mb-4">
              <div className="text-lg font-semibold text-white">Event Detail</div>
              <div className="text-sm text-white/50">Inspect the selected event payload and metadata.</div>
            </div>

            {!selectedEvent ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/55">
                Select an event from the timeline to inspect its payload.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-medium text-white">{selectedEvent.type}</div>
                  <div className="mt-2 space-y-1 text-xs text-white/55">
                    <div><span className="text-white/35">ID:</span> {selectedEvent.id}</div>
                    <div><span className="text-white/35">Source:</span> {selectedEvent.source}</div>
                    <div><span className="text-white/35">State:</span> {selectedEvent.state}</div>
                    <div><span className="text-white/35">Time:</span> {selectedEvent.time}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="mb-2 text-sm font-medium text-white">Payload Inspector</div>
                  <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black/50 p-4 text-xs text-cyan-200">
{JSON.stringify(selectedEvent.payload ?? selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="mb-4">
              <div className="text-lg font-semibold text-white">Related Event Chain</div>
              <div className="text-sm text-white/50">Events linked by shared task, anchor, Merkle root, tx hash, or track.</div>
            </div>

            {!selectedEvent ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/55">
                Select an event to explore its related chain.
              </div>
            ) : relatedEvents.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/55">
                No linked events found for the selected event.
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-auto">
                {relatedEvents.map((event) => (
                  <button
                    type="button"
                    key={`${selectedEvent.id}-${event.id}`}
                    onClick={() => setSelectedEvent(event)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left hover:border-cyan-500/20 hover:bg-white/10"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{event.type}</div>
                      <div className="text-xs text-white/40">{event.source} • {event.time}</div>
                    </div>
                    <div className={`rounded-full border px-3 py-1 text-xs ${badge(event.state)}`}>
                      {event.state}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
