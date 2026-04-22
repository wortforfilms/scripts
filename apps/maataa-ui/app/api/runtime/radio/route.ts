import { getRadioState } from "../../../../../../services/playout-worker/index.js";

export async function GET() {
  return Response.json(getRadioState());
}
