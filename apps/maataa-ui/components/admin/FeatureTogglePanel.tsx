"use client";

import { useMemo, useState } from "react";
import type { FeatureFlag } from "../../lib/features/feature-flags";
import type { ReleasePhase } from "../../lib/features/phase-config";
import type { UserPlan, UserRole } from "../../lib/access/types";

type FeatureTogglePanelProps = {
  initialFlags: FeatureFlag[];
};

const phases: ReleasePhase[] = ["MVP", "PHASE2", "PHASE3"];
const roles: UserRole[] = ["GUEST", "USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"];
const plans: UserPlan[] = ["FREE", "PREMIUM", "RESEARCHER", "ENTERPRISE"];

export function FeatureTogglePanel({ initialFlags }: FeatureTogglePanelProps) {
  const [flags, setFlags] = useState(initialFlags);
  const grouped = useMemo(() => {
    return phases.map((phase) => ({
      phase,
      flags: flags.filter((flag) => flag.phase === phase)
    }));
  }, [flags]);

  return (
    <div className="space-y-6">
      <div className="rounded border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
        This panel is wired for rollout review. Persisting flag mutations to Turso should be added before non-admin operators can use it as a source of truth.
      </div>
      {grouped.map((group) => (
        <section key={group.phase} className="rounded border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">{group.phase}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-white/50">
                <tr>
                  <th className="py-2 pr-3">Feature</th>
                  <th className="py-2 pr-3">Enabled</th>
                  <th className="py-2 pr-3">Phase</th>
                  <th className="py-2 pr-3">Roles</th>
                  <th className="py-2 pr-3">Plans</th>
                </tr>
              </thead>
              <tbody>
                {group.flags.map((flag) => (
                  <tr key={flag.key} className="border-t border-white/10">
                    <td className="py-3 pr-3 font-medium">{flag.key}</td>
                    <td className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={flag.enabled}
                        className="h-4 w-4 accent-amber-300"
                        onChange={(event) => {
                          const enabled = event.target.checked;
                          setFlags((current) => current.map((item) => (item.key === flag.key ? { ...item, enabled } : item)));
                        }}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <select
                        value={flag.phase}
                        className="rounded border border-white/10 bg-black/30 px-2 py-1 text-white"
                        onChange={(event) => {
                          const phase = event.target.value as ReleasePhase;
                          setFlags((current) => current.map((item) => (item.key === flag.key ? { ...item, phase } : item)));
                        }}
                      >
                        {phases.map((phase) => <option key={phase}>{phase}</option>)}
                      </select>
                    </td>
                    <td className="py-3 pr-3 text-white/70">{flag.roles?.join(", ") ?? roles.join(", ")}</td>
                    <td className="py-3 pr-3 text-white/70">{flag.plans?.join(", ") ?? plans.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
