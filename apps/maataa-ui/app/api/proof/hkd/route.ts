import { getSchedulerState } from "../../../../../../services/scheduler/index.js";
import { getProofState } from "../../../../../../services/proof-worker/index.js";
import { getRadioState } from "../../../../../../services/playout-worker/index.js";

export async function GET() {
  const data = {
    scheduler: getSchedulerState(),
    proof: getProofState(),
    radio: getRadioState(),
    exportedAt: new Date().toISOString()
  };

  const hkd = {
    version: "0.1.0",
    type: "HKD",
    payload: data
  };

  return new Response(JSON.stringify(hkd, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=maataa-proof.hkd.json"
    }
  });
}
