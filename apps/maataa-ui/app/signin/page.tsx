export const metadata = {
  title: "Sign in | Maataa Scripts",
  robots: { index: false, follow: false }
};

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-4 text-white/70">Authentication is cookie-backed in this build and ready for the production identity provider.</p>
    </main>
  );
}
