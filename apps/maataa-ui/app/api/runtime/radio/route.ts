import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../../services/playout-worker/index.js";

export async function GET() {
  await ensureRadioStateReady();
  return Response.json(getRadioState());
}
