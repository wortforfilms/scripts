import { findAnchorRecord } from "@/lib/anchor-store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await findAnchorRecord(id);

  if (!record) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return Response.json({
    id: record.id,
    merkleRoot: record.merkleRoot,
    ipfsCid: record.ipfsCid,
    txHash: record.txHash,
    chainId: record.chainId,
    anchorStatus: record.anchorStatus,
    createdAt: record.createdAt
  });
}
