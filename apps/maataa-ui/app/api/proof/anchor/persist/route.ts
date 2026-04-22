import { persistAnchorRecord } from "@/lib/anchor-store";
import type { ProofAnchorRecord } from "@/lib/anchor";

export async function POST(req: Request) {
  const record = (await req.json()) as ProofAnchorRecord;

  const stored = await persistAnchorRecord(record);

  return Response.json({
    id: stored.id,
    createdAt: stored.createdAt,
    record: stored
  });
}
