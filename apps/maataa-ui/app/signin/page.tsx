import Link from "next/link";
import { signInWithCredentials, signInWithSessionToken } from "./actions";

export const metadata = {
  title: "Sign in | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next ?? "/dashboard";

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-6 py-16 lg:grid-cols-[1fr_0.8fr]">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Account</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Use your Maataa account to unlock gated tools, marketplace access, and admin workflows according to your role and plan.
        </p>
        {params.error ? <p className="mt-5 rounded border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{params.error}</p> : null}

        <form action={signInWithCredentials} className="mt-6 rounded border border-white/10 bg-white/5 p-5">
          <input name="next" type="hidden" value={nextPath} />
          <label className="grid gap-2 text-sm">
            <span className="text-white/70">Email</span>
            <input name="email" type="email" required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="you@example.com" />
          </label>
          <label className="mt-4 grid gap-2 text-sm">
            <span className="text-white/70">Password</span>
            <input name="password" type="password" required className="rounded border border-white/10 bg-black/30 px-3 py-2 text-white" placeholder="••••••••" />
          </label>
          <button className="mt-5 rounded bg-amber-300 px-5 py-3 font-semibold text-black" type="submit">
            Sign in
          </button>
        </form>
      </section>

      <aside className="space-y-5">
        <div className="rounded border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold">New here?</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Create an account by choosing the first script you want to follow.</p>
          <Link href="/signup" className="mt-4 inline-flex rounded border border-amber-300 px-4 py-2 text-sm font-semibold text-white">
            Create account
          </Link>
        </div>

        <details className="rounded border border-white/10 bg-white/5 p-5">
          <summary className="cursor-pointer font-semibold">Advanced: signed provider token</summary>
          <form action={signInWithSessionToken} className="mt-4">
            <input name="next" type="hidden" value={nextPath} />
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
            <button className="mt-4 rounded border border-white/15 px-4 py-2 text-sm font-medium text-white" type="submit">
              Sign in with token
            </button>
          </form>
        </details>
      </aside>
    </main>
  );
}
