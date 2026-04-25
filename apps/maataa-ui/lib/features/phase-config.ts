export type ReleasePhase = "MVP" | "PHASE2" | "PHASE3";

export const CURRENT_PHASE: ReleasePhase = "MVP";

const phaseRank: Record<ReleasePhase, number> = {
  MVP: 1,
  PHASE2: 2,
  PHASE3: 3
};

export function isPhaseEnabled(featurePhase: ReleasePhase, currentPhase: ReleasePhase = CURRENT_PHASE) {
  return phaseRank[featurePhase] <= phaseRank[currentPhase];
}
