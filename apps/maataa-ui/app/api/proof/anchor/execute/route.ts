import { prepareChainAnchor } from "@/lib/chain";
import { requireFeature, routeError } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireFeature("anchor");
    const body = await req.json();
    const root = body.merkleRoot;

    const tx = await prepareChainAnchor(root);

    return Response.json({
      ...tx,
      note: "Production chain anchor scaffold. Replace with actual contract interaction."
    });
  } catch (error) {
    return routeError(error);
  }
}
