import { buildMockTxHash } from "@/lib/anchor";

export async function POST(req: Request) {
  const body = await req.json();
  const root = body.merkleRoot;

  const txHash = buildMockTxHash(root);

  return Response.json({
    merkleRoot: root,
    txHash,
    chainId: "mock-chain",
    note: "Mock blockchain anchor. Replace with real contract call."
  });
}
