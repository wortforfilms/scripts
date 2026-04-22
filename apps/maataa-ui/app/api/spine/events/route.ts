const encoder = new TextEncoder();

function send(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const tick = () => {
        const states = ["ok", "warn", "critical"] as const;
        const types = [
          "scheduler.tick",
          "proof.generated",
          "render.queued",
          "wallet.synced",
          "dhatu.updated",
          "radio.now_playing"
        ];

        const event = {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          type: types[Math.floor(Math.random() * types.length)],
          state: states[Math.floor(Math.random() * states.length)]
        };

        controller.enqueue(send(event));
      };

      tick();
      const interval = setInterval(tick, 2500);

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
