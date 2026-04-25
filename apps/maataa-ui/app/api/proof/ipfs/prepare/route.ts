import { buildMockIpfsCid } from "@/lib/anchor";
import { requireFeature, routeError } from "@/lib/auth";
import { buildMerkleLeaves, buildMerkleRoot } from "@/lib/proof";

export async function POST(req: Request) {
  try {
    await requireFeature("proofInspector");
    const body = await req.json();
    const payload = body.payload ?? [];

    const leaves = buildMerkleLeaves(payload);
    const root = buildMerkleRoot(leaves);

    const cid = buildMockIpfsCid(root);

    return Response.json({
      merkleRoot: root,
      ipfsCid: cid,
      note: "Mock IPFS CID generated. Replace with real IPFS publish step."
    });
  } catch (error) {
    return routeError(error);
  }
}
