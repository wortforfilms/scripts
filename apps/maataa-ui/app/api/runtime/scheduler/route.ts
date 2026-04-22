import { getSchedulerState } from "../../../../../../services/scheduler/index.js";

export async function GET() {
  return Response.json(getSchedulerState());
}
