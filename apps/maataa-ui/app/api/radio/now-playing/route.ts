export async function GET() {
  return Response.json({
    title: "Om Resonance",
    status: "live",
    streamUrl: "http://localhost:8000/stream"
  });
}
