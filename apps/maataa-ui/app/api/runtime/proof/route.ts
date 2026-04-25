import { getProofState } from "../../../../../../services/proof-worker/index.js";
import { requireFeature, routeError } from "../../../../lib/auth";

export async function GET() {
  try {
    await requireFeature("runtimeStatus");
    return Response.json(getProofState());
  } catch (error) {
    return routeError(error);
  }
}
