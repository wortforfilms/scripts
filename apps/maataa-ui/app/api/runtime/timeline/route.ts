import { getSchedulerState } from "../../../../../../services/scheduler/index.js";
import { getProofState } from "../../../../../../services/proof-worker/index.js";
import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../../services/playout-worker/index.js";
import { requireFeature, routeError } from "../../../../lib/auth";

type TimelineEvent = {
  time?: string;
  [key: string]: unknown;
};

export async function GET() {
  try {
    await requireFeature("runtimeTimeline");
    await ensureRadioStateReady();
    const scheduler = (getSchedulerState().logs ?? []) as TimelineEvent[];
    const proof = (getProofState().logs ?? []) as TimelineEvent[];
    const radio = (getRadioState().logs ?? []) as TimelineEvent[];

    const timeline: TimelineEvent[] = [...scheduler, ...proof, ...radio].sort((a, b) => {
      return new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime();
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
  } catch (error) {
    return routeError(error);
  }
}
