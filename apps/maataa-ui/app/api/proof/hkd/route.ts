import { getSchedulerState } from "../../../../../../services/scheduler/index.js";
import { getProofState, emitProofEvent } from "../../../../../../services/proof-worker/index.js";
import {
  ensureRadioStateReady,
  getRadioState
} from "../../../../../../services/playout-worker/index.js";
import {
  buildMerkleLeaves,
  buildMerkleRoot,
  signRoot,
  exportPublicKey
} from "@/lib/proof";

function toEventRecord(event: unknown) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return {};
  }

  return event as Record<string, unknown>;
}

type ProofTimelineEvent = Record<string, unknown> & {
  time?: string;
};

export async function GET() {
  await ensureRadioStateReady();
  const scheduler: ProofTimelineEvent[] = (getSchedulerState().logs ?? []).map((event) => ({
    ...toEventRecord(event),
    proofLabel: "RUNTIME_EVENT"
  }));
  const proof: ProofTimelineEvent[] = (getProofState().logs ?? []).map((event) => ({
    ...toEventRecord(event),
    proofLabel: "PROOF_EVENT"
  }));
  const radio: ProofTimelineEvent[] = (getRadioState().logs ?? []).map((event) => ({
    ...toEventRecord(event),
    proofLabel: "BROADCAST_PROOF"
  }));

  const timeline = [...scheduler, ...proof, ...radio]
    .sort((a, b) => new Date(a.time ?? 0).getTime() - new Date(b.time ?? 0).getTime());

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
