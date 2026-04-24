import type React from "react";
import { AppSidebar } from "./AppSidebar";
import { getViewer } from "../../lib/auth/viewer";

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const viewer = await getViewer();
  return (
    <div className="min-h-screen md:flex">
      <AppSidebar viewer={viewer} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 px-6 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/60">{viewer.isLoggedIn ? `${viewer.role} · ${viewer.plan}` : "Guest"}</span>
            <a className="text-sm text-white/70" href={viewer.isLoggedIn ? "/dashboard" : "/signin"}>
              {viewer.isLoggedIn ? "Dashboard" : "Sign in"}
            </a>
          </div>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
