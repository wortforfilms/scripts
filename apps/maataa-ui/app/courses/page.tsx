import Link from "next/link";
import { verifiedScriptsSeed } from "../../lib/script-data";

export const metadata = {
  title: "Courses | Maataa Scripts",
  description: "Script learning paths staged from verified script records."
};

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Courses</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Course tracks are activated from the current verified seed subset. Public course publishing stays disabled until content review.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {verifiedScriptsSeed.map((script) => (
          <Link key={script.id} href={`/scripts/${script.slug}`} className="rounded border border-white/10 bg-white/5 p-5 hover:border-amber-300/60">
            <h2 className="text-xl font-semibold">{script.name}</h2>
            <p className="mt-2 text-sm text-white/60">{script.family} · {script.verificationStatus}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
