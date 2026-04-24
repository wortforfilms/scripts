export const metadata = {
  title: "Upgrade | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ feature?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Upgrade required</h1>
      <p className="mt-4 text-white/70">This feature needs a paid plan, reviewer role, or admin permission before content is rendered.</p>
      <form className="mt-6 rounded border border-white/10 bg-white/5 p-5">
        <label className="grid gap-2 text-sm">
          <span className="text-white/70">Requested feature</span>
          <input readOnly value={params.feature ?? "premium access"} className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" />
        </label>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["PREMIUM", "RESEARCHER", "ENTERPRISE"].map((plan) => (
            <label key={plan} className="rounded border border-white/10 bg-black/20 p-3 text-sm">
              <input name="plan" type="radio" value={plan} className="mr-2" />
              {plan}
            </label>
          ))}
        </div>
        <button disabled className="mt-4 rounded bg-white/20 px-4 py-2 font-medium text-white/50" type="button">
          Billing not enabled
        </button>
      </form>
    </main>
  );
}
