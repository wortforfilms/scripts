import { forcePlayTrack } from "../../../../../../services/playout-worker/index.js";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "force_play_failed";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const event = await forcePlayTrack(body.track, {
      reason: "preview-node-click"
    });

    return Response.json({ ok: true, event });
  } catch (error) {
    return Response.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
