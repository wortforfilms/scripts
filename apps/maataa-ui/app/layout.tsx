import "./globals.css";
import { AppShell } from "../components/layout/AppShell";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://scripts.vaigyaaniq.info"),
  title: "Maataa Scripts",
  description: "Verified script catalog, glyph verification, and digital marketplace controls."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        <footer className="mx-auto mt-16 flex max-w-6xl flex-wrap gap-4 px-6 py-8 text-sm text-white/60">
          <a href="/legal/terms">Terms</a>
          <a href="/legal/privacy">Privacy</a>
          <a href="/legal/refund">Refund</a>
          <a href="/legal/license">License</a>
        </footer>
      </body>
    </html>
  );
}
