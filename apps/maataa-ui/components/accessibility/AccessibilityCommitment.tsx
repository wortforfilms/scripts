import Link from "next/link";
import { Captions, Ear, Eye, Keyboard, Languages, Type } from "lucide-react";

const cards = [
  {
    title: "Vision support",
    body: "High contrast, scalable type, readable surfaces, and clear focus states.",
    icon: Eye
  },
  {
    title: "Hearing support",
    body: "Media workflows are designed for captions, transcripts, and non-audio status.",
    icon: Ear
  },
  {
    title: "Keyboard access",
    body: "Primary routes and forms are reachable through semantic links, buttons, labels, and focus states.",
    icon: Keyboard
  },
  {
    title: "Readable text",
    body: "Font family, type size, density, corners, and reduced motion are configurable.",
    icon: Type
  },
  {
    title: "Language access",
    body: "i18n context supports multilingual navigation and script-first onboarding.",
    icon: Languages
  },
  {
    title: "Captions and labels",
    body: "Images use alt text, decorative assets are hidden, and form controls carry visible labels.",
    icon: Captions
  }
];

export function AccessibilityCommitment() {
  return (
    <section data-accessibility-tour="overview" className="mt-10 rounded border border-white/10 bg-white/5 p-5">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Divyaang access</p>
          <h2 className="mt-2 text-3xl font-semibold">Differently enabled by design</h2>
          <p className="mt-4 text-white/70">
            Accessibility is connected to the app shell, settings, landing pages, forms, and partner journeys.
          </p>
          <Link href="/accessibility" className="mt-5 inline-flex rounded bg-amber-300 px-5 py-3 font-semibold text-black">
            View accessibility support
          </Link>
        </div>
        <img
          data-accessibility-tour="image"
          src="/accessibility/divyaang-access.svg"
          alt="Accessible script learning workspace with vision, captions, keyboard, audio, and multilingual support"
          className="w-full rounded border border-white/10 bg-black/20"
        />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              data-accessibility-tour={card.title === "Keyboard access" ? "keyboard" : card.title === "Vision support" ? "vision" : undefined}
              className="rounded border border-white/10 bg-black/20 p-4"
            >
              <Icon className="h-6 w-6 text-amber-300" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{card.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
