"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AccessViewer } from "../../lib/access/types";

type AuthContextValue = {
  viewer: AccessViewer;
  isAuthenticated: boolean;
  hasRole: (roles: AccessViewer["role"] | AccessViewer["role"][]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, viewer }: { children: ReactNode; viewer: AccessViewer }) {
  const value = useMemo<AuthContextValue>(() => {
    return {
      viewer,
      isAuthenticated: viewer.isLoggedIn,
      hasRole: (roles) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(viewer.role);
      }
    };
  }, [viewer]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
