import { buildMockIpfsCid } from "@/lib/anchor";
import { buildMerkleLeaves, buildMerkleRoot } from "@/lib/proof";

export async function POST(req: Request) {
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
}
