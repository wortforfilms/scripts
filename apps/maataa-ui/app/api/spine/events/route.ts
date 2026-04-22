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
      const tick = () => {
        const sources = [scheduler, proof, radio];
        const event = sources[Math.floor(Math.random() * sources.length)]();
        controller.enqueue(send(event));
      };

      tick();
      const interval = setInterval(tick, 2000);

      return () => clearInterval(interval);
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
