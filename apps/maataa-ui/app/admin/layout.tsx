import type { Metadata } from "next";
import type React from "react";
import { FeatureGate } from "../../components/access/FeatureGate";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGate featureKey="adminCatalog">{children}</FeatureGate>;
}
