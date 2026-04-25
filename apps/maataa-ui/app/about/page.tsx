export const metadata = {
  title: "About | Maataa Scripts",
  description: "About the verification-first scripts platform."
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">About</h1>
      <div className="mt-6 space-y-4 text-white/70">
        <p>
          scripts.vaigyaaniq.info is a verification-first platform for script records, glyph safety, source-backed datasets, and controlled digital marketplace releases.
        </p>
        <p>
          Records are only promoted when they include sources, verification status, and a safe glyph rendering policy. Unsourced records stay out of the public catalog.
        </p>
      </div>
    </main>
  );
}
