import { deriveBadgeStatus } from "@/lib/anchor";

export async function POST(req: Request) {
  const record = await req.json();

  const status = deriveBadgeStatus(record);

  return Response.json({
    ...record,
    badgeStatus: status
  });
}
