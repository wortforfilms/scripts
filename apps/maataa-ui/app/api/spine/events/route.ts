import { createSchedulerEmitter } from "../../../../../../services/scheduler/index.js";
import { createProofEmitter } from "../../../../../../services/proof-worker/index.js";
import { createRadioEmitter } from "../../../../../../services/playout-worker/index.js";

const encoder = new TextEncoder();
const scheduler = createSchedulerEmitter();
const proof = createProofEmitter();
const radio = createRadioEmitter();

function send(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let interval: ReturnType<typeof setInterval> | undefined;

      const close = () => {
        if (closed) return;
        closed = true;
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {}
      };

      const tick = () => {
        if (closed) return;

        try {
          const sources = [scheduler, proof, radio];
          const event = sources[Math.floor(Math.random() * sources.length)]();
          if (closed) return;
          controller.enqueue(send(event));
        } catch {
          close();
        }
      };

      tick();
      interval = setInterval(tick, 2000);

      return close;
    },
    cancel() {
      // start() cleanup handles lifecycle
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
