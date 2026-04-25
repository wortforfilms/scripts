import { getSchedulerState } from "../../../../../../services/scheduler/index.js";
import { requireFeature, routeError } from "../../../../lib/auth";

export async function GET() {
  try {
    await requireFeature("runtimeStatus");
    return Response.json(getSchedulerState());
  } catch (error) {
    return routeError(error);
  }
}
