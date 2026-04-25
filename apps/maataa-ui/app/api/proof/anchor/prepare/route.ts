import { buildMockTxHash } from "@/lib/anchor";
import { requireFeature, routeError } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireFeature("anchor");
    const body = await req.json();
    const root = body.merkleRoot;

    const txHash = buildMockTxHash(root);

    return Response.json({
      merkleRoot: root,
      txHash,
      chainId: "mock-chain",
      note: "Mock blockchain anchor. Replace with real contract call."
    });
  } catch (error) {
    return routeError(error);
  }
}
