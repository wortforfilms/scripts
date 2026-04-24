import { NextResponse } from "next/server";
import { requireFeature, requireUser, routeError } from "../../../../lib/auth";
import { listUserAccess } from "../../../../lib/catalog-db";

export async function GET() {
  try {
    await requireFeature("userAccess");
    const user = await requireUser();
    return NextResponse.json({ access: await listUserAccess(user.id) });
  } catch (error) {
    return routeError(error);
  }
}
