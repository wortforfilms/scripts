import Link from "next/link";
import { AccessibilityCommitment } from "../../components/accessibility/AccessibilityCommitment";
import { AccessibilityJoyride } from "../../components/accessibility/AccessibilityJoyride";
import { joyrideDirectory } from "../../components/joyride/joyride-presets";

export const metadata = {
  title: "Accessibility | Maataa Scripts",
  description: "Divyaang-friendly accessibility support for scripts.vaigyaaniq.info."
};

export default function AccessibilityPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-4xl font-semibold">Accessibility for Divyaang users</h1>
      <p className="mt-4 max-w-3xl text-white/70">
        The platform supports configurable display settings, keyboard-friendly navigation, semantic forms,
        high contrast mode, reduced motion, multilingual context, and labelled visual assets.
      </p>
      <AccessibilityJoyride />
      <AccessibilityCommitment />
      <section className="mt-10 rounded border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Guided tours</p>
        <h2 className="mt-2 text-3xl font-semibold">Available joyrides</h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Launch any route-specific guide. Restricted admin tours still require the correct role and plan.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {joyrideDirectory.map((item) => (
            <Link key={item.href} href={item.href} className="rounded border border-white/10 bg-black/20 p-4 hover:border-amber-300/70">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
