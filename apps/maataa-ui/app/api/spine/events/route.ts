import { subscribeScheduler } from "../../../../../../services/scheduler/index.js";
import { subscribeProof } from "../../../../../../services/proof-worker/index.js";
import { subscribeRadio } from "../../../../../../services/playout-worker/index.js";

const encoder = new TextEncoder();

function send(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const safeEnqueue = (event: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(send(event));
        } catch {
          closed = true;
        }
      };

      const unsubScheduler = subscribeScheduler(safeEnqueue);
      const unsubProof = subscribeProof(safeEnqueue);
      const unsubRadio = subscribeRadio(safeEnqueue);

      return () => {
        closed = true;
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
