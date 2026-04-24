import { getSchedulerState } from "../../../../../../services/scheduler/index.js";
import { getProofState } from "../../../../../../services/proof-worker/index.js";
import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../../services/playout-worker/index.js";

export async function GET() {
  await ensureRadioStateReady();
  const scheduler = getSchedulerState().logs ?? [];
  const proof = getProofState().logs ?? [];
  const radio = getRadioState().logs ?? [];

  const timeline = [...scheduler, ...proof, ...radio].sort((a, b) => {
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  return Response.json({
    timeline,
    counts: {
      scheduler: scheduler.length,
      proof: proof.length,
      radio: radio.length,
      total: timeline.length
    }
  });
}
