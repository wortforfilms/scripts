import Link from "next/link";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../lib/script-data";
import { VerifiedGlyph } from "../components/scripts/VerifiedGlyph";

export default function HomePage() {
  const dataset = scriptDatasetStatus();
  const featuredScripts = verifiedScriptsSeed.slice(0, 4);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-200">scripts.vaigyaaniq.info</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-white md:text-6xl">
            Preserve. Decode.
            <span className="block text-amber-200">Understand. Share.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            A verification-first catalog for scripts, glyphs, sources, and digital learning tools.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/scripts" className="rounded bg-amber-300 px-5 py-3 font-medium text-black">
              Explore Scripts
            </Link>
            <Link href="/signin" className="rounded border border-amber-300/70 px-5 py-3 font-medium text-amber-100">
              Sign In
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold">{dataset.current} / {dataset.target}</p>
              <p className="mt-1 text-sm text-white/60">script records</p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold">{verifiedScriptsSeed.filter((script) => script.verificationStatus === "VERIFIED").length}</p>
              <p className="mt-1 text-sm text-white/60">verified samples</p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold">{verifiedScriptsSeed.filter((script) => script.verificationStatus === "PARTIAL").length}</p>
              <p className="mt-1 text-sm text-white/60">partial chains</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded border border-white/10 bg-white/5 p-5">
          {featuredScripts.map((script) => (
            <Link key={script.id} href={`/scripts/${script.slug}`} className="rounded border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{script.name}</h2>
                  <p className="text-sm text-white/55">{script.verificationStatus}</p>
                </div>
                <div className="text-3xl">
                  <VerifiedGlyph script={script} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
