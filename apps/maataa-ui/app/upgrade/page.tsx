export const metadata = {
  title: "Upgrade | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default function UpgradePage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Upgrade required</h1>
      <p className="mt-4 text-white/70">This feature needs a paid plan, reviewer role, or admin permission before content is rendered.</p>
    </main>
  );
}
