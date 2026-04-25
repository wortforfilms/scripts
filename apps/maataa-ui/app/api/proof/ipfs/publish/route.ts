import { requireFeature, routeError } from "@/lib/auth";
import { prepareIpfsPublish } from "@/lib/ipfs";

export async function POST(req: Request) {
  try {
    await requireFeature("proofInspector");
    const body = await req.json();
    const root = body.merkleRoot;

    const record = await prepareIpfsPublish(root);

    return Response.json({
      ...record,
      note: "Production IPFS publish scaffold. Replace with actual upload implementation."
    });
  } catch (error) {
    return routeError(error);
  }
}
