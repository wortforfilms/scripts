"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeChoice = "system" | "dark" | "light" | "sepia";
export type DensityChoice = "comfortable" | "compact";
export type FontChoice = "inter" | "serif" | "mono" | "devanagari";
export type TextScaleChoice = "sm" | "md" | "lg" | "xl";
export type AccentChoice = "amber" | "emerald" | "sky" | "rose";
export type SurfaceChoice = "glass" | "solid" | "paper";
export type RadiusChoice = "sharp" | "soft" | "round";
export type ContrastChoice = "standard" | "high";

type ThemeContextValue = {
  theme: ThemeChoice;
  density: DensityChoice;
  font: FontChoice;
  textScale: TextScaleChoice;
  accent: AccentChoice;
  surface: SurfaceChoice;
  radius: RadiusChoice;
  reduceMotion: boolean;
  contrast: ContrastChoice;
  setTheme: (theme: ThemeChoice) => void;
  setDensity: (density: DensityChoice) => void;
  setFont: (font: FontChoice) => void;
  setTextScale: (textScale: TextScaleChoice) => void;
  setAccent: (accent: AccentChoice) => void;
  setSurface: (surface: SurfaceChoice) => void;
  setRadius: (radius: RadiusChoice) => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  setContrast: (contrast: ContrastChoice) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === "system" || value === "dark" || value === "light" || value === "sepia";
}

function isFontChoice(value: string | null): value is FontChoice {
  return value === "inter" || value === "serif" || value === "mono" || value === "devanagari";
}

function isTextScaleChoice(value: string | null): value is TextScaleChoice {
  return value === "sm" || value === "md" || value === "lg" || value === "xl";
}

function isAccentChoice(value: string | null): value is AccentChoice {
  return value === "amber" || value === "emerald" || value === "sky" || value === "rose";
}

function isSurfaceChoice(value: string | null): value is SurfaceChoice {
  return value === "glass" || value === "solid" || value === "paper";
}

function isRadiusChoice(value: string | null): value is RadiusChoice {
  return value === "sharp" || value === "soft" || value === "round";
}

function isContrastChoice(value: string | null): value is ContrastChoice {
  return value === "standard" || value === "high";
}

function applyPreference(input: {
  accent: AccentChoice;
  density: DensityChoice;
  font: FontChoice;
  radius: RadiusChoice;
  reduceMotion: boolean;
  contrast: ContrastChoice;
  surface: SurfaceChoice;
  textScale: TextScaleChoice;
  theme: ThemeChoice;
}) {
  const root = document.documentElement;
  root.dataset.theme = input.theme;
  root.dataset.density = input.density;
  root.dataset.font = input.font;
  root.dataset.textScale = input.textScale;
  root.dataset.accent = input.accent;
  root.dataset.surface = input.surface;
  root.dataset.radius = input.radius;
  root.dataset.motion = input.reduceMotion ? "reduced" : "full";
  root.dataset.contrast = input.contrast;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [density, setDensityState] = useState<DensityChoice>("comfortable");
  const [font, setFontState] = useState<FontChoice>("inter");
  const [textScale, setTextScaleState] = useState<TextScaleChoice>("md");
  const [accent, setAccentState] = useState<AccentChoice>("amber");
  const [surface, setSurfaceState] = useState<SurfaceChoice>("glass");
  const [radius, setRadiusState] = useState<RadiusChoice>("soft");
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [contrast, setContrastState] = useState<ContrastChoice>("standard");

  useEffect(() => {
    const savedTheme = localStorage.getItem("maataa-theme");
    const savedDensity = localStorage.getItem("maataa-density");
    const savedFont = localStorage.getItem("maataa-font");
    const savedTextScale = localStorage.getItem("maataa-text-scale");
    const savedAccent = localStorage.getItem("maataa-accent");
    const savedSurface = localStorage.getItem("maataa-surface");
    const savedRadius = localStorage.getItem("maataa-radius");
    const savedMotion = localStorage.getItem("maataa-reduce-motion");
    const savedContrast = localStorage.getItem("maataa-contrast");
    const nextTheme = isThemeChoice(savedTheme) ? savedTheme : "system";
    const nextDensity = savedDensity === "compact" ? "compact" : "comfortable";
    const nextFont = isFontChoice(savedFont) ? savedFont : "inter";
    const nextTextScale = isTextScaleChoice(savedTextScale) ? savedTextScale : "md";
    const nextAccent = isAccentChoice(savedAccent) ? savedAccent : "amber";
    const nextSurface = isSurfaceChoice(savedSurface) ? savedSurface : "glass";
    const nextRadius = isRadiusChoice(savedRadius) ? savedRadius : "soft";
    const nextMotion = savedMotion === "true";
    const nextContrast = isContrastChoice(savedContrast) ? savedContrast : "standard";
    setThemeState(nextTheme);
    setDensityState(nextDensity);
    setFontState(nextFont);
    setTextScaleState(nextTextScale);
    setAccentState(nextAccent);
    setSurfaceState(nextSurface);
    setRadiusState(nextRadius);
    setReduceMotionState(nextMotion);
    setContrastState(nextContrast);
    applyPreference({
      accent: nextAccent,
      contrast: nextContrast,
      density: nextDensity,
      font: nextFont,
      radius: nextRadius,
      reduceMotion: nextMotion,
      surface: nextSurface,
      textScale: nextTextScale,
      theme: nextTheme
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("maataa-theme", theme);
    localStorage.setItem("maataa-density", density);
    localStorage.setItem("maataa-font", font);
    localStorage.setItem("maataa-text-scale", textScale);
    localStorage.setItem("maataa-accent", accent);
    localStorage.setItem("maataa-surface", surface);
    localStorage.setItem("maataa-radius", radius);
    localStorage.setItem("maataa-reduce-motion", String(reduceMotion));
    localStorage.setItem("maataa-contrast", contrast);
    applyPreference({ accent, contrast, density, font, radius, reduceMotion, surface, textScale, theme });
  }, [accent, contrast, density, font, radius, reduceMotion, surface, textScale, theme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      density,
      font,
      textScale,
      accent,
      surface,
      radius,
      reduceMotion,
      contrast,
      setTheme: setThemeState,
      setDensity: setDensityState,
      setFont: setFontState,
      setTextScale: setTextScaleState,
      setAccent: setAccentState,
      setSurface: setSurfaceState,
      setRadius: setRadiusState,
      setReduceMotion: setReduceMotionState,
      setContrast: setContrastState
    };
  }, [accent, contrast, density, font, radius, reduceMotion, surface, textScale, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeSettings must be used within ThemeProvider");
  return context;
}
