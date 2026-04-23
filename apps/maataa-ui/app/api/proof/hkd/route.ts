import { getSchedulerState } from "../../../../../../services/scheduler/index.js";
import { getProofState, emitProofEvent } from "../../../../../../services/proof-worker/index.js";
import { getRadioState } from "../../../../../../services/playout-worker/index.js";
import {
  buildMerkleLeaves,
  buildMerkleRoot,
  signRoot,
  exportPublicKey
} from "@/lib/proof";

export async function GET() {
  const scheduler = (getSchedulerState().logs ?? []).map((event) => ({
    ...event,
    proofLabel: "RUNTIME_EVENT"
  }));
  const proof = (getProofState().logs ?? []).map((event) => ({
    ...event,
    proofLabel: "PROOF_EVENT"
  }));
  const radio = (getRadioState().logs ?? []).map((event) => ({
    ...event,
    proofLabel: "BROADCAST_PROOF"
  }));

  const timeline = [...scheduler, ...proof, ...radio]
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const leaves = buildMerkleLeaves(timeline);
  const root = buildMerkleRoot(leaves);
  const signature = signRoot(root);

  const hkd = {
    version: "0.2.1",
    type: "HKD",
    merkleRoot: root,
    signature,
    publicKey: exportPublicKey(),
    payload: timeline,
    exportedAt: new Date().toISOString()
  };

  emitProofEvent({
    type: "proof.generated",
    state: "ok",
    merkleRoot: root,
    payloadSize: timeline.length
  });

  return new Response(JSON.stringify(hkd, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=maataa-proof.hkd.json"
    }
  });
}
