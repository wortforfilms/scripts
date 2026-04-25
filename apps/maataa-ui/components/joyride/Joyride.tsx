"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, HelpCircle, X } from "lucide-react";
import type { JoyridePreset } from "./joyride-presets";

type JoyrideProps = {
  autoStart?: boolean;
  launcherLabel?: string;
  preset: JoyridePreset;
  queryParam?: string;
  storageKey?: string;
};

function findTarget(target: string) {
  return (
    document.querySelector<HTMLElement>(`[data-joyride="${target}"]`) ??
    document.querySelector<HTMLElement>(`[data-accessibility-tour="${target}"]`) ??
    document.querySelector<HTMLElement>("main")
  );
}

export function Joyride({ autoStart = false, launcherLabel, preset, queryParam = "joyride", storageKey }: JoyrideProps) {
  const dismissedKey = storageKey ?? `maataa-joyride-${preset.id}-dismissed`;
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const step = preset.steps[index] ?? preset.steps[0];
  const progress = useMemo(() => Math.round(((index + 1) / preset.steps.length) * 100), [index, preset.steps.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has(queryParam)) {
      localStorage.removeItem(dismissedKey);
      setIndex(0);
      setActive(true);
      return;
    }
    if (autoStart && localStorage.getItem(dismissedKey) !== "true") setActive(true);
  }, [autoStart, dismissedKey, queryParam]);

  useEffect(() => {
    if (!active || !step) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false);
      if (event.key === "ArrowRight") setIndex((value) => Math.min(preset.steps.length - 1, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, preset.steps.length, step]);

  useEffect(() => {
    if (!active || !step) return;
    const target = findTarget(step.target);
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
    target?.setAttribute("data-tour-active", "true");
    return () => target?.removeAttribute("data-tour-active");
  }, [active, step]);

  const start = () => {
    localStorage.removeItem(dismissedKey);
    setIndex(0);
    setActive(true);
  };

  if (!active) {
    if (!launcherLabel) return null;
    return (
      <button
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-200"
        onClick={start}
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        {launcherLabel}
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45" aria-hidden="true" />
      <section
        aria-live="polite"
        aria-label={preset.label}
        className="fixed bottom-24 left-1/2 z-[60] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded border border-amber-300 bg-[#071018] p-5 text-white shadow-2xl"
      >
        <div className="h-1 overflow-hidden rounded bg-white/10" aria-hidden="true">
          <div className="h-full bg-amber-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
              Step {index + 1} of {preset.steps.length}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
          </div>
          <button
            type="button"
            className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label={`Close ${preset.label}`}
            onClick={() => {
              localStorage.setItem(dismissedKey, "true");
              setActive(false);
            }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/75">{step.body}</p>
        <p className="mt-3 text-xs text-white/50">Keyboard: Left/Right arrows move steps. Escape pauses.</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 disabled:opacity-40"
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
          <button type="button" className="rounded px-4 py-2 text-sm font-semibold text-white/70" onClick={() => setActive(false)}>
            Pause
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded bg-amber-300 px-4 py-2 text-sm font-semibold text-black"
            onClick={() => {
              if (index === preset.steps.length - 1) {
                localStorage.setItem(dismissedKey, "true");
                setActive(false);
                return;
              }
              setIndex((value) => Math.min(preset.steps.length - 1, value + 1));
            }}
          >
            {index === preset.steps.length - 1 ? "Finish" : "Next"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </>
  );
}
