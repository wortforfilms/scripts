import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../../services/playout-worker/index.js";
import { requireFeature, routeError } from "../../../../lib/auth";

export async function GET() {
  try {
    await requireFeature("runtimeStatus");
    await ensureRadioStateReady();
    return Response.json(getRadioState());
  } catch (error) {
    return routeError(error);
  }
}
