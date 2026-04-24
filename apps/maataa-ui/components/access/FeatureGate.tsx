import Link from "next/link";
import React from "react";
import { canAccessFeature } from "../../lib/access/can-access";
import type { FeatureKey } from "../../lib/access/types";
import { getViewer } from "../../lib/auth/viewer";

type FeatureGateProps = {
  featureKey: FeatureKey;
  children: React.ReactNode;
};

export async function FeatureGate({ featureKey, children }: FeatureGateProps) {
  const viewer = await getViewer();
  const permissions =
    viewer.role === "ADMIN" || viewer.role === "SUPER_ADMIN"
      ? ["catalog-admin", "catalog-review"]
      : viewer.role === "REVIEWER"
        ? ["catalog-review"]
        : [];
  const decision = canAccessFeature(viewer, featureKey, { permissions });

  if (decision.allowed) return <>{children}</>;

  const href = decision.reason === "signin" ? "/signin" : `/upgrade?feature=${featureKey}`;
  const label = decision.reason === "signin" ? "Sign in" : "View upgrade options";
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Access required</h1>
        <p className="mt-3 text-white/70">This area is protected by the same feature gate used by server routes.</p>
        <Link href={href} className="mt-5 inline-flex rounded bg-emerald-400 px-4 py-2 font-medium text-black">
          {label}
        </Link>
      </div>
    </main>
  );
}
