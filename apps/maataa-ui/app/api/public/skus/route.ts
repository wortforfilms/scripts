import { NextResponse } from "next/server";
import { listSkus } from "../../../../lib/catalog-db";

export async function GET() {
  return NextResponse.json({ skus: await listSkus(true) });
}
