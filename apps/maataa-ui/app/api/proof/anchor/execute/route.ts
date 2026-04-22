import { prepareChainAnchor } from "@/lib/chain";

export async function POST(req: Request) {
  const body = await req.json();
  const root = body.merkleRoot;

  const tx = await prepareChainAnchor(root);

  return Response.json({
    ...tx,
    note: "Production chain anchor scaffold. Replace with actual contract interaction."
  });
}
