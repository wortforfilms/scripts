import { previewScheduledItems } from "../../../../../../services/playout-worker/index.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const count = Number(searchParams.get("count") ?? 30);

  try {
    const items = previewScheduledItems(count);

    return Response.json({
      ok: true,
      count: items.length,
      items
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error?.message ?? "preview_failed" },
      { status: 500 }
    );
  }
}
