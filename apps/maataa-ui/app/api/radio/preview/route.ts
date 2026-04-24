import { previewScheduledItems } from "../../../../../../services/playout-worker/index.js";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "preview_failed";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const count = Number(searchParams.get("count") ?? 30);

  try {
    const items = await previewScheduledItems(count);

    return Response.json({
      ok: true,
      count: items.length,
      items
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
