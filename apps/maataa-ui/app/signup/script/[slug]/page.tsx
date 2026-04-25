import Link from "next/link";
import { notFound } from "next/navigation";
import { VerifiedGlyph } from "../../../../components/scripts/VerifiedGlyph";
import { verifiedScriptsSeed } from "../../../../lib/script-data";

export const metadata = {
  title: "Signup script selection | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default async function SignupScriptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const script = verifiedScriptsSeed.find((item) => item.slug === slug);
  if (!script) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/signup" className="text-sm text-amber-300">← Change script</Link>
      <section className="mt-5 rounded border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/45">Selected script</p>
            <h1 className="mt-2 text-3xl font-semibold">{script.name}</h1>
            <p className="mt-1 text-white/60">{script.nativeName}</p>
          </div>
          <div className="text-5xl"><VerifiedGlyph script={script} /></div>
        </div>
        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div><dt className="text-white/50">Status</dt><dd>{script.verificationStatus}</dd></div>
          <div><dt className="text-white/50">Family</dt><dd>{script.family}</dd></div>
          <div><dt className="text-white/50">Region</dt><dd>{script.region}</dd></div>
          <div><dt className="text-white/50">Direction</dt><dd>{script.direction}</dd></div>
        </dl>
        <div className="mt-6 rounded border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          Production signup will continue through the configured auth provider. This preview keeps onboarding intent local and does not create fake accounts.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/signin?next=/scripts/${script.slug}`} className="rounded bg-amber-300 px-5 py-3 font-semibold text-black">
            Continue to sign in
          </Link>
          <Link href={`/scripts/${script.slug}`} className="rounded border border-white/15 px-5 py-3 font-semibold text-white">
            View script record
          </Link>
        </div>
      </section>
    </main>
  );
}
