import { prepareIpfsPublish } from "@/lib/ipfs";

export async function POST(req: Request) {
  const body = await req.json();
  const root = body.merkleRoot;

  const record = await prepareIpfsPublish(root);

  return Response.json({
    ...record,
    note: "Production IPFS publish scaffold. Replace with actual upload implementation."
  });
}
