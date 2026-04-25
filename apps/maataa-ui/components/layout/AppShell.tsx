import type React from "react";
import { getViewer } from "../../lib/auth/viewer";
import { AppChrome } from "./AppChrome";
import { AppProviders } from "../providers/AppProviders";

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const viewer = await getViewer();
  return (
    <AppProviders viewer={viewer}>
      <AppChrome>{children}</AppChrome>
    </AppProviders>
  );
}
