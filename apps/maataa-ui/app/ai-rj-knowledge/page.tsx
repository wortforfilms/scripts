"use client";

import { useEffect, useMemo, useState } from "react";

type RuntimeEvent = {
  id: string;
  source: string;
  type: string;
  state: string;
  time: string;
  payload?: {
    kind?: string;
    track?: string;
    ttsText?: string;
    scriptProvider?: string;
    mood?: string;
    reason?: string;
    memory?: {
      listenerMood?: string;
      recentTitles?: string[];
      sessionContext?: {
        theme?: string;
        notes?: Array<{ text: string; time: string }>;
      };
    };
    previewTrack?: {
      title?: string;
      kind?: string;
    };
    hemantSamvatGhatiMap?: Record<string, unknown>;
  };
};

function getPayload(event: RuntimeEvent) {
  return event.payload ?? {};
}

export default function AiRjKnowledgePage() {
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [selected, setSelected] = useState<RuntimeEvent | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    const res = await fetch("/api/runtime/events?source=radio&type=radio.now_playing&limit=500");
    const data = await res.json();
    const aiRjEvents = (data.events ?? []).filter((event: RuntimeEvent) => getPayload(event).kind === "ai-rj");
    setEvents(aiRjEvents);
    setSelected((current) => current ?? aiRjEvents[0] ?? null);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return events;
    return events.filter((event) => {
      const payload = getPayload(event);
      return [payload.track, payload.ttsText, payload.reason, payload.mood, payload.scriptProvider]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [events, query]);

  const selectedPayload = selected ? getPayload(selected) : null;

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.35em] text-violet-300/70">Maataa Learning Archive</div>
          <h1 className="mt-2 text-4xl font-bold">🎙️ AI RJ Knowledge</h1>
          <p className="mt-2 max-w-3xl text-white/60">
            Persisted AI RJ thoughts, scripts, moods, memory context, and broadcast reasons from runtime events.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={load} className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-5 py-3 text-sm text-violet-300">
              Refresh Knowledge
            </button>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search script, mood, reason..."
              className="min-w-72 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Knowledge Entries</div>
                <div className="text-sm text-white/45">{filtered.length} AI RJ events</div>
              </div>
            </div>

            <div className="max-h-[720px] space-y-3 overflow-auto pr-2">
              {filtered.map((event) => {
                const payload = getPayload(event);
                const active = selected?.id === event.id;
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelected(event)}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:bg-white/10 ${active ? "border-violet-400/40 bg-violet-500/10" : "border-white/10 bg-black/30"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{payload.track ?? "Maataa RJ"}</div>
                        <div className="mt-1 text-xs text-white/45">{event.time}</div>
                      </div>
                      <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                        {payload.mood ?? "mood"}
                      </div>
                    </div>
                    <div className="mt-3 line-clamp-3 text-sm text-white/65">{payload.ttsText ?? "No script text"}</div>
                    <div className="mt-3 text-xs text-white/35">reason: {payload.reason ?? "—"}</div>
                  </button>
                );
              })}
              {!filtered.length ? <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/45">No AI RJ knowledge yet. Trigger radio.next until kind ai-rj appears.</div> : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-violet-500/20 bg-violet-500/10 p-5 backdrop-blur-xl">
              <div className="text-lg font-semibold">Thought Inspector</div>
              {selectedPayload ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm text-white/45">Script</div>
                    <div className="mt-2 text-lg leading-relaxed text-white">{selectedPayload.ttsText}</div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="text-xs text-white/40">Provider</div><div className="mt-1 text-sm text-violet-200">{selectedPayload.scriptProvider ?? "—"}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="text-xs text-white/40">Mood</div><div className="mt-1 text-sm text-violet-200">{selectedPayload.mood ?? "—"}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="text-xs text-white/40">Reason</div><div className="mt-1 text-sm text-violet-200">{selectedPayload.reason ?? "—"}</div></div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm text-white/45">Memory Used</div>
                    <div className="mt-3 text-sm text-white/70">Listener mood: {selectedPayload.memory?.listenerMood ?? "—"}</div>
                    <div className="mt-2 text-sm text-white/70">Recent: {(selectedPayload.memory?.recentTitles ?? []).join(" → ") || "—"}</div>
                    <div className="mt-2 text-sm text-white/70">Theme: {selectedPayload.memory?.sessionContext?.theme ?? "—"}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm text-white/45">Raw Knowledge JSON</div>
                    <pre className="mt-3 max-h-[360px] overflow-auto text-xs text-cyan-100">{JSON.stringify(selected, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/45">Select an AI RJ knowledge entry.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
