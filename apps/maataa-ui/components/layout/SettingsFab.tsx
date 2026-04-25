"use client";

import { useId, useState } from "react";
import { Eye, Monitor, Moon, Settings, Sun, Type, X, ZapOff } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import {
  type AccentChoice,
  type DensityChoice,
  type FontChoice,
  type RadiusChoice,
  type SurfaceChoice,
  type TextScaleChoice,
  type ThemeChoice,
  useThemeSettings
} from "../providers/ThemeProvider";

const themeOptions: Array<{ value: ThemeChoice; label: string; icon: typeof Monitor }> = [
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "sepia", label: "Sepia", icon: Type }
];

export function SettingsFab() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const { viewer } = useAuth();
  const {
    accent,
    contrast,
    density,
    font,
    radius,
    reduceMotion,
    setAccent,
    setContrast,
    setDensity,
    setFont,
    setRadius,
    setReduceMotion,
    setSurface,
    setTextScale,
    setTheme,
    surface,
    textScale,
    theme
  } = useThemeSettings();
  const { language, languageOptions, setLanguage, t } = useI18n();

  const selectClassName = "mt-2 w-full rounded border border-white/15 bg-[#071018] px-3 py-2 text-sm text-white";

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <section
          aria-labelledby={titleId}
          className="mb-3 w-[min(22rem,calc(100vw-2.5rem))] rounded border border-white/15 bg-[#071018]/95 p-4 text-white shadow-2xl backdrop-blur"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id={titleId} className="font-semibold">{t("displaySettings")}</h2>
            <button
              type="button"
              className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close settings"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 rounded border border-white/15 bg-white/5 px-3 py-2 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-white/50">Account</p>
            <p className="mt-1 text-white/80">{viewer.isLoggedIn ? `${viewer.role} · ${viewer.plan}` : "Guest · FREE"}</p>
          </div>

          <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/50">{t("theme")}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      "flex items-center gap-2 rounded border px-3 py-2 text-sm",
                      active ? "border-amber-300 bg-amber-300 text-black" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                    ].join(" ")}
                    onClick={() => setTheme(option.value)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/50">{t("chooseLanguage")}</p>
            <select
              className={selectClassName}
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.nativeLabel} · {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-wide text-white/50">
              Font
              <select className={selectClassName} value={font} onChange={(event) => setFont(event.target.value as FontChoice)}>
                <option value="inter">Inter UI</option>
                <option value="serif">Editorial Serif</option>
                <option value="mono">Research Mono</option>
                <option value="devanagari">Indic Sans</option>
              </select>
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-white/50">
              Type size
              <select className={selectClassName} value={textScale} onChange={(event) => setTextScale(event.target.value as TextScaleChoice)}>
                <option value="sm">Small</option>
                <option value="md">Default</option>
                <option value="lg">Large</option>
                <option value="xl">Extra large</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-wide text-white/50">
              Accent
              <select className={selectClassName} value={accent} onChange={(event) => setAccent(event.target.value as AccentChoice)}>
                <option value="amber">Amber</option>
                <option value="emerald">Emerald</option>
                <option value="sky">Sky</option>
                <option value="rose">Rose</option>
              </select>
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-white/50">
              Surface
              <select className={selectClassName} value={surface} onChange={(event) => setSurface(event.target.value as SurfaceChoice)}>
                <option value="glass">Glass</option>
                <option value="solid">Solid</option>
                <option value="paper">Paper</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/50">Corners</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["sharp", "soft", "round"] as RadiusChoice[]).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className={[
                    "rounded border px-3 py-2 text-sm capitalize",
                    radius === choice ? "border-amber-300 bg-amber-300 text-black" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                  ].join(" ")}
                  onClick={() => setRadius(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/50">{t("density")}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["comfortable", "compact"] as DensityChoice[]).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className={[
                    "rounded border px-3 py-2 text-sm capitalize",
                    density === choice ? "border-amber-300 bg-amber-300 text-black" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                  ].join(" ")}
                  onClick={() => setDensity(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-4 flex items-center justify-between gap-3 rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80">
            <span className="flex items-center gap-2"><ZapOff className="h-4 w-4" aria-hidden="true" /> {t("reduceMotion")}</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-amber-300"
              checked={reduceMotion}
              onChange={(event) => setReduceMotion(event.target.checked)}
            />
          </label>

          <label className="mt-3 flex items-center justify-between gap-3 rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80">
            <span className="flex items-center gap-2"><Eye className="h-4 w-4" aria-hidden="true" /> High contrast</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-amber-300"
              checked={contrast === "high"}
              onChange={(event) => setContrast(event.target.checked ? "high" : "standard")}
            />
          </label>
          </div>
        </section>
      ) : null}
      <button
        type="button"
        data-accessibility-tour="settings"
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 bg-amber-300 text-black shadow-2xl transition hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open display settings"
        aria-expanded={open}
      >
        <Settings className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
