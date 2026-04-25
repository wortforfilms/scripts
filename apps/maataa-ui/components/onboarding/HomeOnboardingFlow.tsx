"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useI18n } from "../providers/I18nProvider";

type HomeOnboardingFlowProps = {
  children: React.ReactNode;
};

type FlowStep = "splash" | "language" | "landing";

export function HomeOnboardingFlow({ children }: HomeOnboardingFlowProps) {
  const [step, setStep] = useState<FlowStep>("splash");
  const { languageOptions, resetLanguage, setLanguage, t } = useI18n();

  useEffect(() => {
    if (window.location.search.includes("onboarding=reset")) {
      resetLanguage();
    }
    const selectedLanguage = localStorage.getItem("maataa-language");
    if (selectedLanguage) {
      const timer = window.setTimeout(() => setStep("landing"), 900);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStep("language"), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (step === "splash") {
    return (
      <main className="fixed inset-0 z-40 flex min-h-screen items-center justify-center overflow-hidden bg-[#061018] px-6 text-white">
        <img src="/landing/hero-manuscript.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-[#061018]/70" />
        <section className="relative text-center">
          <img src="/landing/logo-mark.png" alt="" className="mx-auto h-24 w-24" />
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.35em] text-amber-300">scripts.vaigyaaniq.info</p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">Preserve. Decode. Share.</h1>
          <p className="mt-4 text-white/70">Preparing verified script knowledge universe</p>
        </section>
      </main>
    );
  }

  if (step === "language") {
    return (
      <main className="fixed inset-0 z-40 flex min-h-screen items-center justify-center overflow-auto bg-[#061018] px-6 py-10 text-white">
        <img src="/landing/hero-manuscript.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[#061018]/80" />
        <section className="relative w-full max-w-3xl rounded border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded bg-amber-300 text-black">
              <Languages className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-amber-300">{t("welcome")}</p>
              <h1 className="text-3xl font-semibold">{t("chooseLanguage")}</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
            This sets your interface preference for the preview. Script records still keep their verified source names and glyph policies.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {languageOptions.map((language) => (
              <button
                key={language.code}
                type="button"
                className="rounded border border-white/10 bg-[#071018]/80 p-4 text-left transition hover:border-amber-300 hover:bg-white/10"
                onClick={() => {
                  setLanguage(language.code);
                  setStep("landing");
                }}
              >
                <span className="block text-xl font-semibold">{language.nativeLabel}</span>
                <span className="mt-1 block text-sm text-white/55">{language.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-5 text-sm text-white/55 underline-offset-4 hover:text-white hover:underline"
            onClick={() => setStep("landing")}
          >
            {t("continueWithoutSaving")}
          </button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
