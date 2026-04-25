import { persistAnchorRecord } from "@/lib/anchor-store";
import type { ProofAnchorRecord } from "@/lib/anchor";
import { requireFeature, routeError } from "@/lib/auth";
import { emitProofEvent } from "../../../../../../../services/proof-worker/index.js";

export async function POST(req: Request) {
  try {
    await requireFeature("anchor");
    const record = (await req.json()) as ProofAnchorRecord;

    const stored = await persistAnchorRecord(record);

    emitProofEvent({
      type: "proof.anchored",
      state: "ok",
      anchorId: stored.id,
      merkleRoot: stored.merkleRoot ?? null
    });

    return Response.json({
      id: stored.id,
      createdAt: stored.createdAt,
      record: stored
    });
  } catch (error) {
    return routeError(error);
  }
}
