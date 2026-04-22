export async function GET() {
  return Response.json({
    queue: [
      { id: "1", title: "Om Resonance", duration: 180 },
      { id: "2", title: "Cosmic Flow", duration: 210 },
      { id: "3", title: "Chakra Pulse", duration: 240 }
    ]
  });
}
