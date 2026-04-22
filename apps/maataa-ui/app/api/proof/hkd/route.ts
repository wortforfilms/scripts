import { getSchedulerState } from "../../../../../../services/scheduler/index.js";
import { getProofState } from "../../../../../../services/proof-worker/index.js";
import { getRadioState } from "../../../../../../services/playout-worker/index.js";
import {
  buildMerkleLeaves,
  buildMerkleRoot,
  signRoot,
  exportPublicKey
} from "@/lib/proof";

export async function GET() {
  const scheduler = getSchedulerState().logs ?? [];
  const proof = getProofState().logs ?? [];
  const radio = getRadioState().logs ?? [];

  const timeline = [...scheduler, ...proof, ...radio]
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const leaves = buildMerkleLeaves(timeline);
  const root = buildMerkleRoot(leaves);
  const signature = signRoot(root);

  const hkd = {
    version: "0.2.0",
    type: "HKD",
    merkleRoot: root,
    signature,
    publicKey: exportPublicKey(),
    payload: timeline,
    exportedAt: new Date().toISOString()
  };

  return new Response(JSON.stringify(hkd, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=maataa-proof.hkd.json"
    }
  });
}
