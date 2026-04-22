import { getProofState } from "../../../../../../services/proof-worker/index.js";

export async function GET() {
  return Response.json(getProofState());
}
