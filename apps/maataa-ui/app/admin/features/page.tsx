import { FeatureGate } from "../../../components/access/FeatureGate";
import { FeatureTogglePanel } from "../../../components/admin/FeatureTogglePanel";
import { featureFlagList } from "../../../lib/features/feature-flags";

export default function AdminFeaturesPage() {
  return (
    <FeatureGate feature="adminFeatures">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Feature Flags</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Review rollout phase, enabled state, roles, and plans for the tool registry.
        </p>
        <div className="mt-8">
          <FeatureTogglePanel initialFlags={featureFlagList()} />
        </div>
      </main>
    </FeatureGate>
  );
}
