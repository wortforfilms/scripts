import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Direct UPI mark-paid is disabled. Use verify, then approve." },
    { status: 410 }
  );
}
