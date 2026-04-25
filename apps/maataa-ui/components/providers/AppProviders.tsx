"use client";

import type { ReactNode } from "react";
import type { AccessViewer } from "../../lib/access/types";
import { AuthProvider } from "./AuthProvider";
import { I18nProvider } from "./I18nProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children, viewer }: { children: ReactNode; viewer: AccessViewer }) {
  return (
    <AuthProvider viewer={viewer}>
      <I18nProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
