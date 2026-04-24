import { signInWithSessionToken } from "./actions";

export const metadata = {
  title: "Sign in | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-4 text-white/70">Paste a signed session token minted by the production auth provider.</p>
      <form action={signInWithSessionToken} className="mt-6 rounded border border-white/10 bg-white/5 p-5">
        <input name="next" type="hidden" value={params.next ?? "/dashboard"} />
        <label className="grid gap-2 text-sm">
          <span className="text-white/70">Signed session token</span>
          <textarea
            name="sessionToken"
            required
            rows={5}
            className="rounded border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
        </label>
        {params.error ? <p className="mt-3 text-sm text-red-300">{params.error}</p> : null}
        <button className="mt-4 rounded bg-emerald-400 px-4 py-2 font-medium text-black" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
