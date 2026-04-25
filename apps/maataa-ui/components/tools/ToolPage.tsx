import { FeatureGate } from "../access/FeatureGate";
import type { FeatureKey } from "../../lib/access/types";

type ToolPageProps = {
  title: string;
  description: string;
  featureKey: FeatureKey;
};

export function ToolPage({ description, featureKey, title }: ToolPageProps) {
  return (
    <FeatureGate feature={featureKey}>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-300">Tool</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-4 max-w-2xl text-white/70">{description}</p>
        <div className="mt-8 rounded border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold">Production status</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            This route is linked through the tool registry, protected by the shared feature access engine, and ready for domain implementation.
          </p>
        </div>
      </main>
    </FeatureGate>
  );
}
