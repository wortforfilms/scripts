import { forcePlayTrack } from "../../../../../../services/playout-worker/index.js";

export async function POST(req) {
  try {
    const body = await req.json();

    const event = forcePlayTrack(body.track, {
      reason: "preview-node-click"
    });

    return Response.json({ ok: true, event });
  } catch (e) {
    return Response.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
