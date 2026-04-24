import { subscribeScheduler } from "../../../../../../services/scheduler/index.js";
import { subscribeProof } from "../../../../../../services/proof-worker/index.js";
import { subscribeRadio } from "../../../../../../services/playout-worker/index.js";
import { requireFeature } from "../../../../lib/auth";
import { listSpineAuditEvents, runDueSpineJobs } from "../../../../lib/spine";

const encoder = new TextEncoder();

function send(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function GET() {
  await requireFeature("spineEvents");
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;

      const safeEnqueue = (event: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(send("runtime", event));
        } catch {
          closed = true;
        }
      };

      const unsubScheduler = subscribeScheduler(safeEnqueue);
      const unsubProof = subscribeProof(safeEnqueue);
      const unsubRadio = subscribeRadio(safeEnqueue);
      await runDueSpineJobs();
      const recent = await listSpineAuditEvents(25);
      for (const event of recent.reverse()) {
        safeEnqueue({ source: "spine", ...event, payload: event.payload ? { ...event.payload, sensitive: undefined } : null });
      }
      const heartbeat = setInterval(() => {
        safeEnqueue({ source: "spine", type: "heartbeat", time: new Date().toISOString() });
      }, 15000);

      return () => {
        closed = true;
        clearInterval(heartbeat);
        unsubScheduler();
        unsubProof();
        unsubRadio();
        try {
          controller.close();
        } catch {}
      };
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
