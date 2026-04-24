"use client";

import { useEffect, useRef, useState } from "react";
import { connectEvents } from "@/lib/events";

type RadioEvent = {
  id?: string;
  correlationId?: string;
  parentEventId?: string | null;
  source?: string;
  type?: string;
  time?: string;
  state?: string;
  trackId?: string;
  track?: string;
  audioUrl?: string;
  durationSec?: number;
  kind?: string;
  transition?: string;
  ttsText?: string;
  hemantSamvatGhatiMap?: {
    hemantSamvatDay?: number;
    ghati?: number;
    pala?: number;
    scheduledUnits?: number;
    unit24?: number;
  };
};

type PreviewItem = {
  index: number;
  scheduledUnit: number;
  id: string;
  title: string;
  kind: string;
  durationSec?: number;
  transition?: string;
  ttsText?: string;
  hemantSamvatGhatiMap?: Record<string, unknown>;
  previewTrack?: Record<string, unknown>;
};

function stateBadge(connected: boolean) {
  return connected
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
}

function kindBadge(kind?: string) {
  if (kind === "ad") return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  if (kind === "tts") return "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300";
  if (kind === "ai-rj") return "border-violet-500/20 bg-violet-500/10 text-violet-300";
  return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
}

function nodeLabel(kind: string) {
  if (kind === "ad") return "📢";
  if (kind === "tts") return "🕉️";
  if (kind === "ai-rj") return "🎙️";
  return "🎵";
}

export default function RadioPage() {
  const [nowPlaying, setNowPlaying] = useState<RadioEvent | null>(null);
  const [recentEvents, setRecentEvents] = useState<RadioEvent[]>([]);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<PreviewItem | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [timerLabel, setTimerLabel] = useState("idle");
  const [autoMode, setAutoMode] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPreview = async () => {
    const res = await fetch("/api/radio/preview?count=30");
    const data = await res.json();
    setPreviewItems(data.items || []);
    setSelectedPreview((current) => current ?? data.items?.[0] ?? null);
  };

  const triggerNext = async () => {
    await fetch("/api/radio/next", { method: "POST" }).catch(() => {});
    loadPreview().catch(() => {});
  };

  const playEvent = (event: RadioEvent) => {
    if (!event.audioUrl) return;

    setNowPlaying(event);
    setRecentEvents((current) => [event, ...current].slice(0, 8));

    if (audioRef.current) {
      audioRef.current.src = event.audioUrl;
      audioRef.current.play().catch(() => {});
    }

    if (durationTimerRef.current) clearTimeout(durationTimerRef.current);

    const durationSec = Math.max(1, Number(event.durationSec ?? 0));
    setTimerLabel(durationSec ? `${durationSec}s scheduled` : "manual");

    if (autoMode && durationSec > 0) {
      durationTimerRef.current = setTimeout(() => {
        setTimerLabel("auto-next");
        triggerNext();
      }, durationSec * 1000);
    }
  };

  useEffect(() => {
    const disconnect = connectEvents((raw) => {
      try {
        const event = typeof raw === "string" ? JSON.parse(raw) : raw;
        setSseConnected(true);

        if (event?.type === "radio.now_playing" && event.audioUrl) {
          playEvent(event);
        }
      } catch {}
    });

    loadPreview().catch(() => {});
    triggerNext();

    return () => {
      setSseConnected(false);
      if (durationTimerRef.current) clearTimeout(durationTimerRef.current);
      disconnect();
    };
  }, [autoMode]);

  const handleEnded = () => {
    if (autoMode) triggerNext();
  };

  const ghati = nowPlaying?.hemantSamvatGhatiMap;

  return (
    <div className="min-h-screen overflow-hidden bg-black p-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_36%)]" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">Vaigyaaniq Broadcast Spine</div>
            <h1 className="mt-2 text-4xl font-bold">📻 Maataa Radio</h1>
            <p className="mt-2 max-w-2xl text-white/60">
              Scheduler-driven autonomous radio with ads, AI RJ, Hemant Samvat TTS announcements, preview graph, and duration-based auto-next.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className={`rounded-full border px-4 py-2 text-xs ${stateBadge(sseConnected)}`}>
              {sseConnected ? "SSE LIVE" : "WAITING SSE"}
            </div>
            <button type="button" onClick={() => setAutoMode((current) => !current)} className={`rounded-full border px-4 py-2 text-xs ${autoMode ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-white/5 text-white/60"}`}>
              {autoMode ? "AUTO-NEXT ON" : "AUTO-NEXT OFF"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_0_80px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-white/45">Now Playing</div>
                <div className="mt-1 text-3xl font-semibold text-white">{nowPlaying?.track ?? "Starting scheduler..."}</div>
              </div>
              <div className={`rounded-full border px-3 py-1 text-xs ${kindBadge(nowPlaying?.kind)}`}>{(nowPlaying?.kind ?? "idle").toUpperCase()}</div>
            </div>

            <div className="relative mb-6 overflow-hidden rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">
              <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0_2px,transparent_2px_18px)]" />
              <div className="relative flex h-40 items-center justify-center gap-2">
                {Array.from({ length: 48 }).map((_, index) => (<div key={index} className="w-1 rounded-full bg-cyan-300/80 shadow-[0_0_12px_rgba(34,211,238,0.7)]" style={{ height: `${18 + ((index * 17) % 90)}px` }} />))}
              </div>
            </div>

            <audio ref={audioRef} controls autoPlay onEnded={handleEnded} className="w-full" />

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-white/40">Timer</div><div className="mt-1 font-medium text-cyan-300">{timerLabel}</div></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-white/40">Transition</div><div className="mt-1 font-medium text-white">{nowPlaying?.transition ?? "cut"}</div></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-white/40">Duration</div><div className="mt-1 font-medium text-white">{nowPlaying?.durationSec ?? "—"}s</div></div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={triggerNext} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/15">Trigger Next</button>
              <button type="button" onClick={loadPreview} className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-5 py-3 text-sm text-violet-300 hover:bg-violet-500/15">Refresh Preview</button>
              <button type="button" onClick={() => audioRef.current?.play().catch(() => {})} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 hover:bg-white/10">Resume Audio</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5 backdrop-blur-xl">
              <div className="text-sm text-yellow-200/70">Hemant Samvat Ghati Map</div>
              {ghati ? (<div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-black/30 p-3"><div className="text-white/40">Day</div><div className="text-xl font-semibold">{ghati.hemantSamvatDay}</div></div><div className="rounded-2xl bg-black/30 p-3"><div className="text-white/40">Ghati</div><div className="text-xl font-semibold">{ghati.ghati}</div></div><div className="rounded-2xl bg-black/30 p-3"><div className="text-white/40">Pala</div><div className="text-xl font-semibold">{ghati.pala}</div></div><div className="rounded-2xl bg-black/30 p-3"><div className="text-white/40">Unit</div><div className="text-xl font-semibold">{ghati.scheduledUnits}</div></div></div>) : (<div className="mt-3 text-sm text-white/45">TTS ghati map appears every 24 scheduled units.</div>)}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"><div className="text-lg font-semibold">Scheduler Rules</div><div className="mt-3 space-y-2 text-sm"><div className="rounded-2xl border border-white/10 bg-black/30 p-3">🎵 2 songs → 📢 1 ad</div><div className="rounded-2xl border border-white/10 bg-black/30 p-3">🎙️ AI RJ every 4 scheduled units</div><div className="rounded-2xl border border-white/10 bg-black/30 p-3">🕉️ TTS every 24 scheduled units</div><div className="rounded-2xl border border-white/10 bg-black/30 p-3">⏱️ durationSec timer triggers auto-next</div></div></div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"><div className="text-lg font-semibold">Causality</div><div className="mt-3 space-y-2 text-xs text-white/45"><div className="break-all">correlation: {nowPlaying?.correlationId ?? "—"}</div><div className="break-all">parent: {nowPlaying?.parentEventId ?? "root"}</div><div>event: {nowPlaying?.type ?? "—"}</div></div></div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between"><div><div className="text-lg font-semibold">Visual Scheduler Preview</div><div className="text-sm text-white/45">Click any node to inspect its full payload</div></div></div>
            <div className="overflow-x-auto pb-2"><div className="flex min-w-max items-start gap-3">
              {previewItems.map((item) => (<div key={`${item.index}-${item.id}`} className="flex items-center gap-3"><button type="button" onClick={() => setSelectedPreview(item)} className={`w-44 rounded-2xl border p-4 text-left transition hover:scale-[1.02] ${kindBadge(item.kind)} ${selectedPreview?.index === item.index ? "ring-2 ring-white/40" : ""}`}><div className="text-2xl">{nodeLabel(item.kind)}</div><div className="mt-2 text-xs uppercase tracking-wide opacity-75">#{item.index} • unit {item.scheduledUnit}</div><div className="mt-1 truncate text-sm font-semibold text-white">{item.title}</div><div className="mt-1 text-xs opacity-75">{item.kind} • {item.durationSec}s</div></button>{item.index < previewItems.length ? <div className="h-px w-8 bg-white/20" /> : null}</div>))}
              {!previewItems.length ? <div className="text-sm text-white/45">Preview loading...</div> : null}
            </div></div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
            <div className="text-lg font-semibold">Node Inspector</div>
            <div className="mt-1 text-sm text-white/45">Full scheduler payload</div>
            {selectedPreview ? (<div className="mt-4 space-y-4"><div className={`rounded-2xl border p-4 ${kindBadge(selectedPreview.kind)}`}><div className="text-2xl">{nodeLabel(selectedPreview.kind)}</div><div className="mt-2 text-xl font-semibold text-white">{selectedPreview.title}</div><div className="mt-1 text-xs opacity-75">#{selectedPreview.index} • unit {selectedPreview.scheduledUnit} • {selectedPreview.kind}</div></div>{selectedPreview.ttsText ? <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4"><div className="text-sm text-violet-200/70">Script</div><div className="mt-2 text-sm text-white/80">{selectedPreview.ttsText}</div></div> : null}<pre className="max-h-[360px] overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-xs text-cyan-100">{JSON.stringify(selectedPreview, null, 2)}</pre></div>) : (<div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">Select a timeline node.</div>)}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"><div className="mb-4 flex items-center justify-between"><div><div className="text-lg font-semibold">Recent Runtime Radio Events</div><div className="text-sm text-white/45">Latest now-playing decisions received from SSE</div></div></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{recentEvents.length ? recentEvents.map((event) => (<div key={event.id ?? `${event.track}-${event.time}`} className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="text-sm font-medium">{event.track}</div><div className="mt-1 text-xs text-white/45">{event.kind} • {event.durationSec}s</div></div>)) : (<div className="text-sm text-white/45">Waiting for radio.now_playing events...</div>)}</div></div>
      </div>
    </div>
  );
}
